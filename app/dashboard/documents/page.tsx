"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import { 
  FileText, 
  Search, 
  Plus, 
  Eye, 
  X, 
  UploadCloud, 
  File as FileIcon,
  AlertTriangle,
  Download, 
  Trash2,
  MoreHorizontal,
  AlertCircle,
  Stethoscope,
  Anchor,
  Plane,
  Wrench,
  FilterX,
  Edit2,
  Check,
  ChevronDown,
  Sparkles,
  Calendar as CalendarIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

// --- TYPES ---
interface Document {
  id: number;
  type: string;
  number: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  status: "VALID" | "EXPIRING" | "EXPIRED";
  fileName: string;
  fileSizeMB: number;
  fileUrl?: string;
}

// --- MOCK DATA ---
const INITIAL_DATA: Document[] = [
  { id: 1, type: "Medical Certificate", number: "MED/2023/001234", issuedBy: "Port Medical Center", issueDate: "2023-06-15", expiryDate: "2024-06-15", status: "EXPIRING", fileName: "Medical_Cert.pdf", fileSizeMB: 2.4 },
  { id: 2, type: "Passport", number: "P12345678", issuedBy: "Passport Office", issueDate: "2020-03-10", expiryDate: "2030-03-10", status: "VALID", fileName: "Passport_Scan.jpg", fileSizeMB: 1.8 },
  { id: 3, type: "Seaman's Book", number: "SB/2022/987654", issuedBy: "Maritime Authority", issueDate: "2022-08-20", expiryDate: "2027-02-20", status: "VALID", fileName: "Seamans_Book.pdf", fileSizeMB: 3.2 },
  { id: 4, type: "STCW Basic Safety", number: "STCW/99/101", issuedBy: "Maritime Training Inst", issueDate: "2021-01-15", expiryDate: "2026-01-15", status: "VALID", fileName: "STCW_Cert.pdf", fileSizeMB: 4.1 },
  { id: 5, type: "Yellow Fever", number: "YF/882/19", issuedBy: "Health Dept", issueDate: "2019-05-20", expiryDate: "Life", status: "VALID", fileName: "Yellow_Fever.pdf", fileSizeMB: 1.1 },
];

// --- CATEGORY HELPERS (FIXED LOGIC) ---
// Added 'travel', 'certificate', etc. to ensure dropdown values are caught
const CAT_PATTERNS = {
  med: /medical|health|fever/i,
  trv: /passport|visa|book|seaman|travel/i, 
  saf: /safety|stcw|fire|security/i
};

// Helper to get extension
const getExtension = (filename: string) => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toUpperCase();
};

// --- COMPONENTS ---

// 1. DELETE DIALOG
function DeleteConfirmationDialog({ isOpen, fileName, onConfirm, onCancel }: { isOpen: boolean; fileName: string; onConfirm: () => void; onCancel: () => void; }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="h-16 w-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-5"><AlertCircle size={32} className="text-orange-600 dark:text-orange-500" /></div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Delete Document?</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Are you sure you want to delete</p>
          <p className="text-sm font-mono font-bold text-zinc-900 dark:text-white mb-8">{fileName}</p>
          <div className="flex gap-3">
             <button onClick={onCancel} className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold uppercase hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">Cancel</button>
             <button onClick={onConfirm} className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold uppercase shadow-lg">Delete</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// 2. UPLOAD MODAL
function UploadModal({ isOpen, onClose, onUpload }: { isOpen: boolean; onClose: () => void; onUpload: (file: File, customName: string, docType: string, expiryDate: string) => void; }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState("");
  const [docType, setDocType] = useState("Technical"); 
  const [expiryDate, setExpiryDate] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { if (isOpen) { setFile(null); setCustomName(""); setDocType("Technical"); setExpiryDate(""); setIsUploading(false); setPreviewUrl(null); } }, [isOpen]);
  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  const handleFileSelect = (f: File) => {
    if (f.size > 10 * 1024 * 1024) return toast.error('File too large (Max 10MB)');
    setFile(f);
    if (f.type.startsWith('image/')) setPreviewUrl(URL.createObjectURL(f)); else setPreviewUrl(null);
    setCustomName(f.name.replace(/\.[^/.]+$/, ""));
  };

  const handleMagicFormat = () => {
    const clean = customName.replace(/[-_]/g, " ").replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3").replace(/\s+/g, " ").trim();
    const formatted = clean.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
    setCustomName(formatted);
    toast.success("Name auto-formatted!");
  };

  const handleSubmit = () => {
    if (!file || !customName) return;
    setIsUploading(true);
    const finalExpiry = expiryDate ? expiryDate : "Life";
    setTimeout(() => { onUpload(file, customName, docType, finalExpiry); onClose(); }, 1500);
  };

  const CATEGORIES = [
    { id: "Medical Certificate", label: "Medical", icon: Stethoscope, activeClass: "bg-emerald-500 border-emerald-400" },
    { id: "STCW Certificate", label: "Safety", icon: Anchor, activeClass: "bg-orange-500 border-orange-400" },
    { id: "Travel Document", label: "Travel", icon: Plane, activeClass: "bg-blue-500 border-blue-400" },
    { id: "Technical", label: "Tech", icon: Wrench, activeClass: "bg-purple-500 border-purple-400" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-zinc-950 rounded-[2rem] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 pb-2 flex justify-between items-center z-10 shrink-0">
           <div><h3 className="text-xl font-bold text-white tracking-tight">Digital Intake</h3><p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Secure Upload Protocol</p></div>
           <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 pt-4 space-y-6 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {!file ? (
               <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => fileInputRef.current?.click()} className="group relative h-40 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 overflow-hidden">
                  <div className="p-4 bg-zinc-900 rounded-full group-hover:scale-110 transition-transform shadow-inner"><UploadCloud size={28} className="text-zinc-500 group-hover:text-orange-500 transition-colors" /></div>
                  <div className="text-center z-10"><p className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">Click to Scan Document</p><p className="text-[10px] text-zinc-500 mt-1">PDF, JPG, PNG (Max 10MB)</p></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 pointer-events-none" />
               </motion.div>
            ) : (
               <motion.div key="filecard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative h-40 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center p-6 gap-5 group">
                  <div className="h-20 w-20 rounded-xl bg-black border border-zinc-800 flex items-center justify-center shrink-0 relative overflow-hidden">
                    {previewUrl ? <img src={previewUrl} alt="preview" className="h-full w-full object-cover opacity-80" /> : <FileIcon size={32} className="text-zinc-600" />}
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1"><span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Ready to Upload</span><button onClick={() => setFile(null)} className="text-zinc-500 hover:text-red-500 transition-colors"><X size={14} /></button></div>
                    <p className="text-sm font-bold text-white truncate mb-1">{file.name}</p>
                    <p className="text-[10px] font-mono text-zinc-400">{(file.size / (1024*1024)).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}</p>
                  </div>
                  <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-white/5 blur-3xl rounded-full pointer-events-none" />
               </motion.div>
            )}
          </AnimatePresence>
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
          <div className={cn("space-y-5 transition-all duration-500", !file ? "opacity-30 pointer-events-none blur-[2px]" : "opacity-100 blur-0")}>
             <div>
                <label className="text-[10px] font-bold uppercase text-zinc-500 mb-3 block px-1">Classify Document</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat.id} onClick={() => setDocType(cat.id)} className={cn("relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 overflow-hidden group", docType === cat.id ? cn(cat.activeClass, "text-white shadow-lg scale-[1.02]") : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-500")}>
                      <cat.icon size={18} className="relative z-10 transition-transform group-hover:scale-110" />
                      <span className="text-[9px] font-bold uppercase tracking-wide relative z-10">{cat.label}</span>
                      {docType === cat.id && <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-white/80 z-10 shadow-sm" />}
                    </button>
                  ))}
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2 sm:col-span-1">
                  <div className="flex justify-between items-center mb-1.5 px-1"><label className="text-[10px] font-bold uppercase text-zinc-500">Document Name</label><button onClick={handleMagicFormat} className="flex items-center gap-1 text-[9px] font-bold uppercase text-orange-500 hover:text-orange-400 transition-colors" title="Auto-format name"><Sparkles size={10} /> Auto-Format</button></div>
                  <div className="relative group"><input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g., Medical Cert" className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-zinc-700" /><div className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-zinc-800 rounded-md"><span className="text-[10px] font-bold text-zinc-500 uppercase">TXT</span></div></div>
               </div>
               <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1.5 block px-1">Expiry Date <span className="text-zinc-600"></span></label>
                  <div className="relative group"><input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-zinc-700 dark:[color-scheme:dark]" />{!expiryDate && <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600"><CalendarIcon size={14} /></div>}</div>
               </div>
             </div>
          </div>
        </div>
        <div className="p-6 pt-2 bg-zinc-900/30 flex gap-3 z-10 shrink-0">
           <button onClick={onClose} disabled={isUploading} className="flex-1 py-3.5 rounded-xl text-xs font-bold uppercase text-zinc-500 hover:bg-zinc-900 hover:text-white transition-colors">Cancel</button>
           <button onClick={handleSubmit} disabled={!file || !customName || isUploading} className="flex-[2] py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">{isUploading ? (<><div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Encrypting...</>) : (<><Check size={16} /> Confirm Upload</>)}</button>
        </div>
      </motion.div>
    </div>
  );
}

// 3. PDF VIEWER
function PDFViewerModal({ isOpen, fileUrl, fileName, onClose }: { isOpen: boolean; fileUrl?: string; fileName: string; onClose: () => void }) {
  if (!isOpen) return null;
  const isPDF = fileName.toLowerCase().endsWith('.pdf');
  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full h-full max-w-6xl max-h-[90vh] bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/40">
          <div><h3 className="text-sm font-bold text-white">Preview</h3><p className="text-[10px] font-mono text-zinc-400 uppercase mt-0.5">{fileName}</p></div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-auto bg-zinc-950 flex items-center justify-center relative">
           {!fileUrl ? <div className="text-zinc-500 flex flex-col items-center"><FileIcon size={48} className="mb-4 opacity-20" /><p>No preview available for mock data</p></div> : isPDF ? <embed src={fileUrl} type="application/pdf" className="w-full h-full" /> : <img src={fileUrl} alt="Preview" className="max-w-full max-h-full object-contain" />}
        </div>
      </motion.div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"med" | "saf" | "trv" | "tec" | null>(null);
  
  // Rename States
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameExt, setRenameExt] = useState("");

  const highlightedCategory = useMemo(() => {
    if (activeCategory) return activeCategory; 
    if (selectedDoc) {
      const t = selectedDoc.type.toLowerCase();
      if (CAT_PATTERNS.med.test(t)) return 'med';
      if (CAT_PATTERNS.saf.test(t)) return 'saf';
      if (CAT_PATTERNS.trv.test(t)) return 'trv';
      return 'tec';
    }
    return null;
  }, [activeCategory, selectedDoc]);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || doc.type.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (activeCategory === "med") return CAT_PATTERNS.med.test(doc.type.toLowerCase());
      if (activeCategory === "saf") return CAT_PATTERNS.saf.test(doc.type.toLowerCase());
      if (activeCategory === "trv") return CAT_PATTERNS.trv.test(doc.type.toLowerCase());
      if (activeCategory === "tec") return !CAT_PATTERNS.med.test(doc.type.toLowerCase()) && !CAT_PATTERNS.saf.test(doc.type.toLowerCase()) && !CAT_PATTERNS.trv.test(doc.type.toLowerCase());
      return true;
    });
  }, [searchTerm, documents, activeCategory]);

  const stats = useMemo(() => {
    const getCount = (p: RegExp) => documents.filter(doc => p.test(doc.type.toLowerCase())).length;
    const med = getCount(CAT_PATTERNS.med);
    const saf = getCount(CAT_PATTERNS.saf);
    const trv = getCount(CAT_PATTERNS.trv);
    const tec = documents.length - (med + saf + trv);
    return { total: documents.length, EXPIRING: documents.filter(d => d.status === 'EXPIRING').length, categories: { med, saf, trv, tec: Math.max(0, tec) } };
  }, [documents]);

  const handleUpload = (file: File, customName: string, docType: string, expiryDate: string) => {
    const ext = file.name.split('.').pop();
    const finalName = customName.includes('.') ? customName : `${customName}.${ext}`;
    const newDoc: Document = {
      id: Math.max(...documents.map(d => d.id), 0) + 1,
      type: docType,
      number: `DOC-${Date.now().toString().slice(-6)}`,
      issuedBy: "Self Upload",
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: expiryDate,
      status: "VALID",
      fileName: finalName,
      fileSizeMB: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
      fileUrl: URL.createObjectURL(file), 
    };
    setDocuments(prev => [newDoc, ...prev]);
    toast.success("Document uploaded successfully");
  };

  const startRename = () => {
    if (selectedDoc) {
      const lastDotIndex = selectedDoc.fileName.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        setRenameValue(selectedDoc.fileName.substring(0, lastDotIndex));
        setRenameExt(selectedDoc.fileName.substring(lastDotIndex));
      } else {
        setRenameValue(selectedDoc.fileName);
        setRenameExt("");
      }
      setIsRenaming(true);
    }
  };

  const saveRename = () => {
    if (selectedDoc && renameValue.trim()) {
      const newFullName = renameValue.trim() + renameExt;
      setDocuments(prev => prev.map(d => d.id === selectedDoc.id ? { ...d, fileName: newFullName } : d));
      setSelectedDoc(prev => prev ? { ...prev, fileName: newFullName } : null);
      setIsRenaming(false);
      toast.success("Document renamed");
    }
  };

  const cancelRename = () => {
    setIsRenaming(false);
    setRenameValue("");
    setRenameExt("");
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveRename();
    if (e.key === 'Escape') cancelRename();
  };

  return (
    <div className="h-screen w-full bg-transparent selection:bg-orange-500 selection:text-white flex flex-col">
      <header className="px-8 pt-8 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div><h1 className="text-3xl font-light tracking-tighter text-zinc-900 dark:text-white">Document<span className="font-bold">Vault</span></h1><p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Official Digital Archive</p></div>
        <div className="flex items-center gap-4"><button onClick={() => setIsUploadOpen(true)} className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase hover:opacity-90 transition-all shadow-md active:scale-95"><Plus size={14} /><span>Upload</span></button><ThemeToggle /></div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row p-4 md:p-8 gap-6 pt-0">
        <div className={cn("flex-1 flex flex-col h-full transition-all duration-300", selectedDoc ? "md:w-3/5" : "w-full")}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
             <div className="h-[140px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 relative flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start"><div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-500"><FileText size={20} /></div><MoreHorizontal size={16} className="text-zinc-300" /></div>
                <div><h3 className="text-4xl font-light text-zinc-900 dark:text-white tracking-tighter">{stats.total}</h3><p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">Total Archived</p></div>
             </div>

             <div className="h-[140px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 flex flex-col relative overflow-hidden shadow-sm">
               <button onClick={() => activeCategory && setActiveCategory(null)} className={cn("absolute top-5 left-5 flex items-center gap-2 transition-all", activeCategory ? "cursor-pointer hover:opacity-70" : "pointer-events-none")}>
                  <div className="p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-md text-zinc-500">{activeCategory ? <FilterX size={14} className="text-orange-500" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>}</div>
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", activeCategory ? "text-orange-500" : "text-zinc-400")}>{activeCategory ? "Clear Filter" : "Distribution"}</span>
               </button>
               <div className="flex-1 flex items-center justify-between gap-1 pt-6">
                  {[{ key: 'med', label: 'Medical', icon: Stethoscope, count: stats.categories.med }, { key: 'saf', label: 'Safety', icon: Anchor, count: stats.categories.saf }, { key: 'trv', label: 'Travel', icon: Plane, count: stats.categories.trv }, { key: 'tec', label: 'Tech', icon: Wrench, count: stats.categories.tec }].map((cat) => {
                    const isSelected = highlightedCategory === cat.key;
                    const bgClass = isSelected ? (cat.key==='med'?"bg-emerald-500 text-white":(cat.key==='saf'?"bg-orange-500 text-white":(cat.key==='trv'?"bg-blue-500 text-white":"bg-purple-500 text-white"))) : "bg-zinc-50 text-zinc-300 dark:bg-zinc-900 dark:text-zinc-700 hover:scale-105"; 
                    const textClass = isSelected ? (cat.key==='med'?"text-emerald-500":(cat.key==='saf'?"text-orange-500":(cat.key==='trv'?"text-blue-500":"text-purple-500"))) : "text-zinc-900 dark:text-white";
                    return (
                      <button key={cat.key} onClick={() => setActiveCategory(prev => prev === cat.key ? null : cat.key as any)} className="flex flex-col items-center gap-1.5 group/item w-full outline-none">
                         <div className={cn("p-2 rounded-2xl transition-all duration-300 shadow-sm", bgClass, isSelected && "scale-110 shadow-lg")}><cat.icon size={18} strokeWidth={2.5} /></div>
                         <div className="text-center"><span className={cn("block text-lg font-bold leading-none mb-0.5", textClass)}>{cat.count}</span><span className={cn("block text-[8px] font-bold uppercase tracking-wider transition-colors", isSelected ? textClass : "text-zinc-400")}>{cat.label}</span></div>
                      </button>
                    );
                  })}
               </div>
             </div>

             <div className="h-[140px] bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-orange-500/20 flex flex-col justify-between">
                <div className="flex items-center gap-2 bg-white/20 px-2 py-1 rounded-full w-fit backdrop-blur-sm"><AlertTriangle size={12} /><span className="text-[9px] font-bold uppercase tracking-wider">Expiring</span></div>
                <div><h3 className="text-4xl font-bold tracking-tighter">{stats.EXPIRING}</h3><p className="text-[10px] font-medium opacity-80 mt-1">Items Expiring Soon</p></div>
                <div className="absolute right-0 bottom-0 opacity-10 scale-150 translate-y-4 translate-x-4"><AlertTriangle size={100} /></div>
             </div>
          </div>

          <div className="mb-4 relative shrink-0">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
             <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-12 pl-12 pr-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-orange-500 transition-all" />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
             <AnimatePresence mode="popLayout">
               {filteredDocs.map((doc) => (
                 <motion.div key={doc.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={() => setSelectedDoc(doc)} className={cn("group flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border rounded-xl cursor-pointer transition-all hover:shadow-md", selectedDoc?.id === doc.id ? "border-orange-500 ring-1 ring-orange-500 bg-orange-50/10 dark:bg-orange-900/10" : "border-zinc-200 dark:border-zinc-800")}>
                    <div className="flex items-center gap-4">
                       <div className={cn("h-10 w-10 flex items-center justify-center rounded-lg transition-colors", doc.fileName.endsWith(".pdf") ? "bg-red-50 text-red-500 dark:bg-red-900/20" : "bg-blue-50 text-blue-500 dark:bg-blue-900/20")}><FileText size={18} /></div>
                       <div>
                          <div className="flex items-center gap-2"><h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{doc.fileName}</h4><span className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[9px] font-mono font-bold text-zinc-500 uppercase">{getExtension(doc.fileName)}</span></div>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{doc.type}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8">
                       <div className="hidden md:block text-right"><p className="text-[10px] text-zinc-400 font-bold uppercase">Size</p><p className="text-xs text-zinc-600 dark:text-zinc-300 font-mono">{doc.fileSizeMB} MB</p></div>
                       <div className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide", doc.status === 'VALID' ? "bg-emerald-100 text-emerald-700" : doc.status === 'EXPIRING' ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700")}>{doc.status}</div>
                    </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {selectedDoc && (
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="w-full md:w-[400px] h-full flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden shrink-0">
               <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                  <div><h3 className="text-sm font-bold text-zinc-900 dark:text-white">Preview</h3><p className="text-[10px] font-mono text-zinc-400 uppercase mt-0.5 truncate">{selectedDoc.fileName}</p></div>
                  <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><X size={16} /></button>
               </div>
               
               <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center p-8 text-center relative">
                  <div className="w-32 h-40 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center mb-6"><FileIcon size={48} className="text-zinc-700" /></div>
                  <button onClick={() => setShowPDFViewer(true)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black px-6 py-3 rounded-xl text-xs font-bold uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"><Eye size={16} /> Preview Document</button>
               </div>

               {/* --- RENAME SECTION MOVED HERE --- */}
               <div className="px-6 pt-6 pb-2 bg-zinc-50 dark:bg-black/20">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase mb-2">File Name</p>
                  {isRenaming ? (
                     <div className="flex items-center gap-2">
                        <input 
                           autoFocus 
                           value={renameValue} 
                           onChange={(e) => setRenameValue(e.target.value)} 
                           onKeyDown={handleRenameKeyDown}
                           className="flex-1 bg-white dark:bg-zinc-900 border border-orange-500 rounded-lg px-3 py-2 text-sm font-bold text-zinc-900 dark:text-white outline-none shadow-sm" 
                        />
                        <span className="text-xs text-zinc-500 font-mono select-none px-2">{renameExt}</span>
                        <button onClick={saveRename} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors"><Check size={16}/></button>
                        <button onClick={cancelRename} className="p-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500 rounded-lg transition-colors"><X size={16}/></button>
                     </div>
                  ) : (
                     <div className="group/edit flex items-center justify-between cursor-pointer p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 rounded-xl transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800" onClick={startRename}>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white truncate pr-4">{selectedDoc.fileName}</p>
                        <Edit2 size={16} className="text-zinc-400 group-hover/edit:text-orange-500 transition-colors" />
                     </div>
                  )}
               </div>

               <div className="p-6 pt-0 bg-zinc-50 dark:bg-black/20 flex flex-col gap-5">
                  <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800 mb-2"></div>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                     <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Document Type</p><p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{selectedDoc.type}</p></div>
                     <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Document ID</p><p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight font-mono">{selectedDoc.number}</p></div>
                     <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Issued By</p><p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{selectedDoc.issuedBy}</p></div>
                     <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Issue Date</p><p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{selectedDoc.issueDate}</p></div>
                     <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Expiry Date</p><p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{selectedDoc.expiryDate}</p></div>
                     <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Status</p><p className={cn("text-sm font-bold uppercase", selectedDoc.status === 'VALID' ? "text-emerald-500" : selectedDoc.status === 'EXPIRING' ? "text-orange-500" : "text-red-500")}>{selectedDoc.status}</p></div>
                     <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Extension</p><span className="inline-block px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300 uppercase">{getExtension(selectedDoc.fileName)}</span></div>
                     <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">File Size</p><p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{selectedDoc.fileSizeMB} MB</p></div>
                  </div>
                  <div className="flex gap-3 pt-2">
                     <button className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase shadow-lg flex items-center justify-center gap-2"><Download size={16} /> Download</button>
                     <button onClick={() => { setDocToDelete(selectedDoc.id); setShowDeleteConfirm(true); }} className="flex-1 py-3 bg-red-900/20 border border-red-900/50 text-red-500 hover:bg-red-900/40 rounded-xl text-xs font-bold uppercase shadow-sm flex items-center justify-center gap-2 transition-colors"><Trash2 size={16} /> Delete</button>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>{isUploadOpen && <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUpload={handleUpload} />}</AnimatePresence>
      <AnimatePresence>{showDeleteConfirm && docToDelete !== null && <DeleteConfirmationDialog isOpen={showDeleteConfirm} fileName={documents.find(d => d.id === docToDelete)?.fileName || ""} onConfirm={() => { setDocuments(prev => prev.filter(d => d.id !== docToDelete)); setSelectedDoc(null); setShowDeleteConfirm(false); toast.error("Document deleted"); }} onCancel={() => setShowDeleteConfirm(false)} />}</AnimatePresence>
      <AnimatePresence>{showPDFViewer && selectedDoc && <PDFViewerModal isOpen={showPDFViewer} fileUrl={selectedDoc.fileUrl} fileName={selectedDoc.fileName} onClose={() => setShowPDFViewer(false)} />}</AnimatePresence>
      <Toaster position="top-right" theme="system" richColors />
    </div>
  );
}