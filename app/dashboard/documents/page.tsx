"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { api } from "@/app/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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
  Calendar as CalendarIcon,
  LayoutGrid,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Switch } from "@/components/ui/switch";

interface Document {
  id: number;
  type: string;
  number: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string | null;
  status: "VALID" | "EXPIRING" | "EXPIRED";
  fileName: string;
  fileSizeMB: number;
  fileUrl?: string; // Blob URL
  fileBlob?: string; // Base64 data if needed
  docSize?: number; // Size in bytes from backend
  archived: boolean;
}

const CATEGORY_CONFIG = [
  { id: 'med', label: 'Medical', icon: Stethoscope, color: 'emerald', pattern: /medical|health|fever/i },
  { id: 'saf', label: 'Safety', icon: Anchor, color: 'orange', pattern: /safety|stcw|fire|security/i },
  { id: 'trv', label: 'Travel', icon: Plane, color: 'blue', pattern: /passport|visa|book|seaman|travel/i },
  { id: 'tec', label: 'Tech', icon: Wrench, color: 'purple', pattern: /technical|engineering|mechanical|repair/i } // Default tech
];

function CategoryModal({ isOpen, onClose, onSelect, activeCategory, counts }: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  activeCategory: string | null;
  counts: Record<string, number>;
}) {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    // 1. Get predefined configs that match search
    const configs = CATEGORY_CONFIG.filter(cat =>
      cat.label.toLowerCase().includes(search.toLowerCase())
    );

    // 2. Identify dynamic categories from counts (keys that aren't in configs)
    const dynamicKeys = Object.keys(counts).filter(k => !CATEGORY_CONFIG.find(c => c.id === k));

    // 3. Filter dynamic categories by search
    const dynamicMatches = dynamicKeys.filter(k => k.toLowerCase().includes(search.toLowerCase())).map(k => ({
      id: k,
      label: k,
      icon: FileText, // Default icon
      color: 'zinc', // Default color
      pattern: null
    }));

    return [...configs, ...dynamicMatches];
  }, [search, counts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[102] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-6 pb-4 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">All Categories</h3>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">Select filter</p>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-zinc-100 dark:bg-zinc-900/50 border border-transparent focus:bg-white dark:focus:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-orange-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = counts[cat.id] || 0;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelect(cat.id)}
                  className={cn(
                    "p-4 rounded-xl border flex flex-col gap-3 transition-all cursor-pointer text-left group hover:border-orange-500",
                    isActive
                      ? "bg-zinc-50 dark:bg-zinc-900 border-orange-500 ring-1 ring-orange-500"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className={cn(
                      "p-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500"
                        : (cat as any).color === 'zinc'
                          ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 group-hover:text-zinc-700"
                          : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 group-hover:text-orange-500"
                    )}>
                      <cat.icon size={20} />
                    </div>
                    <span className={cn(
                      "text-xs font-bold font-mono py-0.5 px-2 rounded-md",
                      isActive ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500"
                    )}>
                      {count}
                    </span>
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-bold text-sm",
                      isActive ? "text-zinc-900 dark:text-white" : "text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white"
                    )}>{cat.label}</h4>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">Documents</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const getExtension = (filename: string) => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toUpperCase();
};

function DeleteConfirmationDialog({ isOpen, fileName, onConfirm, onCancel }: { isOpen: boolean; fileName: string; onConfirm: () => void; onCancel: () => void; }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="h-16 w-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={32} className="text-orange-600 dark:text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Delete Document?</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Are you sure you want to delete</p>
          <p className="text-sm font-mono font-bold text-zinc-900 dark:text-white mb-8 truncate px-2">{fileName}</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold uppercase hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold uppercase shadow-lg">Delete</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function UploadModal({ isOpen, onClose, onUpload }: { isOpen: boolean; onClose: () => void; onUpload: (file: File, customName: string, docType: string, expiryDate: string | null, issuer: string) => void; }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState("");
  const [docType, setDocType] = useState("Technical");
  const [customDocType, setCustomDocType] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [issuer, setIssuer] = useState("Self Upload");

  useEffect(() => { if (isOpen) { setFile(null); setCustomName(""); setDocType("Technical"); setCustomDocType(""); setExpiryDate(""); setIsUnlimited(false); setIsUploading(false); setPreviewUrl(null); setIssuer("Self Upload"); } }, [isOpen]);
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
    const finalDocType = docType === 'Custom' ? customDocType : docType;
    if (!finalDocType) return toast.error("Please specify category");

    setIsUploading(true);
    const finalExpiry = isUnlimited ? null : expiryDate;
    setTimeout(() => { onUpload(file, customName, finalDocType, finalExpiry, issuer); onClose(); }, 1500);
  };

  const CATEGORIES = [
    { id: "Medical Certificate", label: "Medical", icon: Stethoscope, activeClass: "bg-emerald-500 border-emerald-400" },
    { id: "STCW Certificate", label: "Safety", icon: Anchor, activeClass: "bg-orange-500 border-orange-400" },
    { id: "Travel Document", label: "Travel", icon: Plane, activeClass: "bg-blue-500 border-blue-400" },
    { id: "Technical", label: "Tech", icon: Wrench, activeClass: "bg-purple-500 border-purple-400" },
    { id: "Custom", label: "Custom", icon: Plus, activeClass: "bg-zinc-500 border-zinc-400" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-zinc-950 rounded-[2rem] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 pb-2 flex justify-between items-center z-10 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Digital Intake</h3>
            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Secure Upload Protocol</p>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <X size={18} />
          </button>
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
              <motion.div key="filecard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative h-40 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center p-4 sm:p-6 gap-4 sm:gap-5 group">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-black border border-zinc-800 flex items-center justify-center shrink-0 relative overflow-hidden">
                  {previewUrl ? <img src={previewUrl} alt="preview" className="h-full w-full object-cover opacity-80" /> : <FileIcon size={32} className="text-zinc-600" />}
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1"><span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Ready to Upload</span><button onClick={() => setFile(null)} className="text-zinc-500 hover:text-red-500 transition-colors"><X size={14} /></button></div>
                  <p className="text-sm font-bold text-white truncate mb-1">{file.name}</p>
                  <p className="text-[10px] font-mono text-zinc-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}</p>
                </div>
                <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-white/5 blur-3xl rounded-full pointer-events-none" />
              </motion.div>
            )}
          </AnimatePresence>
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
          <div className={cn("space-y-5 transition-all duration-500", !file ? "opacity-30 pointer-events-none blur-[2px]" : "opacity-100 blur-0")}>
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-500 mb-3 block px-1">Classify Document</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => setDocType(cat.id)} className={cn("relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 overflow-hidden group", docType === cat.id ? cn(cat.activeClass, "text-white shadow-lg scale-[1.02]") : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-500")}>
                    <cat.icon size={18} className="relative z-10 transition-transform group-hover:scale-110" />
                    <span className="text-[9px] font-bold uppercase tracking-wide relative z-10">{cat.label}</span>
                    {docType === cat.id && <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-white/80 z-10 shadow-sm" />}
                  </button>
                ))}
              </div>
            </div>
            {docType === 'Custom' && (
              <div className="relative group">
                <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1.5 block px-1">Custom Category Name</label>
                <input type="text" value={customDocType} onChange={(e) => setCustomDocType(e.target.value)} placeholder="Enter new category name..." className="w-full p-3 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-zinc-700" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Document Name</label>
                  <button onClick={handleMagicFormat} className="flex items-center gap-1 text-[9px] font-bold uppercase text-orange-500 hover:text-orange-400 transition-colors" title="Auto-format name"><Sparkles size={10} /> Auto-Format</button>
                </div>
                <div className="relative group">
                  <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g., Medical Cert" className="w-full p-3 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-zinc-700" />
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 bg-zinc-800 rounded-md">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{file ? file.name.split('.').pop()?.toUpperCase() : "TXT"}</span>
                  </div>
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Issued By</label>
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    placeholder="e.g. Authority"
                    className="w-full p-3 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-zinc-700"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <label className={cn("text-[10px] font-bold uppercase transition-colors", isUnlimited ? "text-zinc-600" : "text-zinc-500")}>Expiry Date</label>
                  <div className="flex items-center gap-2">
                    <label htmlFor="doc-unlimited" className={cn("text-[9px] font-bold uppercase cursor-pointer select-none transition-colors", isUnlimited ? "text-orange-500" : "text-zinc-600")}>Unlimited</label>
                    <Switch
                      id="doc-unlimited"
                      checked={isUnlimited}
                      onCheckedChange={(checked) => {
                        setIsUnlimited(checked);
                        if (checked) setExpiryDate("");
                      }}
                      className="scale-75 data-[state=checked]:bg-orange-500"
                    />
                  </div>
                </div>
                <div className="relative group">
                  <input
                    type="date"
                    value={expiryDate}
                    disabled={isUnlimited}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className={cn(
                      "w-full p-3 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium outline-none transition-colors",
                      isUnlimited ? "text-zinc-600 cursor-not-allowed bg-zinc-900/50" : "text-white focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50",
                      "dark:[color-scheme:dark]"
                    )}
                  />
                  {!expiryDate && !isUnlimited && <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600"><CalendarIcon size={14} /></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 pt-2 bg-zinc-900/30 flex gap-3 z-10 shrink-0 border-t border-zinc-800/50 mt-4">
          <button onClick={onClose} disabled={isUploading} className="flex-1 py-3.5 rounded-xl text-xs font-bold uppercase text-zinc-500 hover:bg-zinc-900 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={!file || !customName || isUploading || (!isUnlimited && !expiryDate)} className="flex-[2] py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
            {isUploading ? (<><div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Encrypting...</>) : (<><Check size={16} /> Confirm Upload</>)}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function PDFViewerModal({ isOpen, fileUrl, fileName, onClose }: { isOpen: boolean; fileUrl?: string; fileName: string; onClose: () => void }) {
  if (!isOpen) return null;
  const isPDF = fileName.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full h-full max-w-6xl max-h-[90vh] bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/40">
          <div className="min-w-0 pr-4">
            <h3 className="text-sm font-bold text-white truncate">Preview</h3>
            <p className="text-[10px] font-mono text-zinc-400 uppercase mt-0.5 truncate">{fileName}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {fileUrl && (
              <a href={fileUrl} download={fileName} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-orange-500 transition-colors" title="Download Original">
                <Download size={20} />
              </a>
            )}
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-zinc-950 flex items-center justify-center relative">
          {!fileUrl ? (
            <div className="text-zinc-500 flex flex-col items-center"><FileIcon size={48} className="mb-4 opacity-20" /><p>No preview data available</p></div>
          ) : isPDF ? (
            <iframe src={fileUrl} className="w-full h-full border-none bg-white" title="PDF Preview" />
          ) : (
            <img src={fileUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);

  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [showArchived]);

  const getMimeType = (b64: string) => {
    if (b64.startsWith('JVBERi0')) return 'application/pdf';
    if (b64.startsWith('iVBORw0KGgo')) return 'image/png';
    if (b64.startsWith('/9j/')) return 'image/jpeg';
    return 'application/pdf';
  };

  const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
    try {
      const byteCharacters = atob(b64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      return new Blob(byteArrays, { type: contentType });
    } catch (e) {
      console.error("Blob creation failed:", e);
      return null;
    }
  };

  const loadDocuments = async () => {
    try {
      const data = await api.getDocuments(showArchived);

      const mapped = data.map((d: any) => {
        // Backend returns docSize (bytes) in DocumentSummary
        const sizeInBytes = d.docSize || 0;
        const sizeInMB = sizeInBytes / (1024 * 1024);

        const displayExt = ".pdf";
        const hasExt = d.docName?.toLowerCase().match(/\.(pdf|jpg|jpeg|png)$/i);
        const finalName = (d.docName || "Untitled") + (hasExt ? "" : displayExt);

        return {
          id: d.id,
          type: d.docType || "Technical",
          number: d.docID || "DOC-000",
          issuedBy: d.issuedBy || "Self Upload",
          issueDate: d.issueDate || new Date().toISOString(),
          expiryDate: d.expiry,
          status: d.status || "VALID",
          fileName: finalName,
          fileSizeMB: parseFloat(sizeInMB.toFixed(2)),
          fileUrl: undefined, // Lazy load
          docSize: sizeInBytes,
          archived: d.archived
        };
      });

      setDocuments(mapped);
    } catch (error) {
      console.error("Failed to load documents", error);
      toast.error("Failed to load documents", { id: "load-docs-error" });
    }
  };

  const fetchDocumentContent = async (doc: Document) => {
    if (doc.fileUrl) return doc;

    try {
      const fullDoc = await api.getDocument(doc.id);
      if (fullDoc.doc) {
        const mimeType = getMimeType(fullDoc.doc);
        const blob = b64toBlob(fullDoc.doc, mimeType);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const updatedDoc = { ...doc, fileUrl: url, fileBlob: fullDoc.doc };
          setDocuments(prev => prev.map(d => d.id === doc.id ? updatedDoc : d));
          if (selectedDoc?.id === doc.id) {
            setSelectedDoc(updatedDoc);
          }
          return updatedDoc;
        }
      }
    } catch (e) {
      toast.error("Failed to load document content");
      console.error(e);
    }
    return doc;
  };

  const openPreview = async () => {
    if (!selectedDoc) return;
    if (!selectedDoc.fileUrl) {
      toast.loading("Loading preview...");
      const loaded = await fetchDocumentContent(selectedDoc);
      // setSelectedDoc is handled in fetchDocumentContent if id matches
      toast.dismiss();
    }
    setShowPDFViewer(true);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    let targetDoc = selectedDoc;
    if (!targetDoc.fileUrl) {
      toast.loading("Downloading...");
      targetDoc = await fetchDocumentContent(selectedDoc);
      toast.dismiss();
    }

    if (targetDoc.fileUrl) {
      const link = document.createElement("a");
      link.href = targetDoc.fileUrl;
      link.download = targetDoc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading ${targetDoc.fileName}`);
    } else {
      toast.error("File content not available");
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameExt, setRenameExt] = useState("");

  const [editValues, setEditValues] = useState({
    type: "",
    issuedBy: "",
    issueDate: "",
    expiryDate: null as string | null
  });

  const highlightedCategory = useMemo(() => {
    if (activeCategory) return activeCategory;
    if (selectedDoc) {
      const type = selectedDoc.type.toLowerCase();
      // Try to match specific patterns first
      for (const cat of CATEGORY_CONFIG) {
        if (cat.pattern && cat.pattern.test(type)) return cat.id;
      }
      // If no pattern matches, the type itself is the category ID (dynamic)
      return selectedDoc.type;
    }
    return null;
  }, [activeCategory, selectedDoc]);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || doc.type.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (activeCategory) {
        const config = CATEGORY_CONFIG.find(c => c.id === activeCategory);
        if (config) {
          if (config.pattern) {
            return config.pattern.test(doc.type.toLowerCase());
          }
        }
        // If active category is not in config, it's a dynamic category (exact match on docType)
        // OR if it's 'tec' but falling back... wait.
        // If config exists but pattern is null? We removed that.

        // If it's a dynamic category, we expect doc.type to match activeCategory
        // BUT activeCategory is the ID. For dynamic, ID = docType.
        if (!config && doc.type !== activeCategory) return false;

        // If config AND pattern check didn't return, check if it DOESN'T match others?
        // No, we are being strict now.
      }
      return true;
    });
  }, [searchTerm, documents, activeCategory]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    const matchedDocIds = new Set<number>();

    // 1. Count specific patterns from config
    CATEGORY_CONFIG.forEach(cat => {
      if (!cat.pattern) return;
      const matches = documents.filter(doc => cat.pattern!.test(doc.type.toLowerCase()));
      counts[cat.id] = matches.length;
      matches.forEach(d => matchedDocIds.add(d.id));
    });

    // 2. Find documents that didn't match any config -> Dynamic Categories
    documents.forEach(doc => {
      if (!matchedDocIds.has(doc.id)) {
        // This doc belongs to a dynamic category
        // Use doc.type as the key
        const key = doc.type; // e.g. "Insurance"
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    return {
      total: documents.length,
      EXPIRING: documents.filter(d => d.status === 'EXPIRING').length,
      categorized: counts
    };
  }, [documents]);

  const handleUpload = async (file: File, customName: string, docType: string, expiryDate: string | null, issuer: string) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        const base64Content = result.includes(',') ? result.split(',')[1] : "";

        const newDocData = {
          docID: `DOC-${Date.now()}`,
          doc: base64Content,
          docType: docType,
          category: "Category",
          status: "VALID",
          expiry: expiryDate ? new Date(expiryDate).toISOString().split('T')[0] : null,
          docName: customName,
          issueDate: new Date().toISOString(),
          uploadDate: new Date().toISOString(),
          hidden: false,
          issuedBy: issuer,
        };

        await api.createDocument(newDocData);
        toast.success("Document uploaded successfully");
        loadDocuments();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Upload failed");
    }
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
      setEditValues({
        type: selectedDoc.type,
        issuedBy: selectedDoc.issuedBy,
        issueDate: selectedDoc.issueDate.split('T')[0],
        expiryDate: selectedDoc.expiryDate ? selectedDoc.expiryDate.split('T')[0] : null
      });
      setIsRenaming(true);
    }
  };

  const saveRename = async () => {
    if (selectedDoc && renameValue.trim()) {
      const newFullName = renameValue.trim() + renameExt;

      try {
        const updates = {
          docName: newFullName,
          docType: editValues.type,
          issuedBy: editValues.issuedBy,
          issueDate: editValues.issueDate,
          expiry: editValues.expiryDate
        };

        await api.updateDocument(selectedDoc.id, updates);

        // Optimistic update + reload
        setDocuments(prev => prev.map(d => d.id === selectedDoc.id ? {
          ...d,
          fileName: newFullName,
          type: updates.docType,
          issuedBy: updates.issuedBy,
          issueDate: updates.issueDate,
          expiryDate: updates.expiry
        } : d));

        setSelectedDoc(prev => prev ? {
          ...prev,
          fileName: newFullName,
          type: updates.docType,
          issuedBy: updates.issuedBy,
          issueDate: updates.issueDate,
          expiryDate: updates.expiry
        } : null);

        // Also reload to get fresh status if dates changed
        loadDocuments();

        setIsRenaming(false);
        toast.success("Document updated");
      } catch (e) {
        toast.error("Failed to update document");
      }
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
    <div className="min-h-screen w-full bg-transparent selection:bg-orange-500 selection:text-white pb-32 transition-colors duration-300">


      <main className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 md:gap-8">

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl sm:text-4xl font-light tracking-tighter text-zinc-900 dark:text-white truncate">
              Document<span className="font-bold text-[#FF3300]">Vault</span>
            </h1>
            <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mt-1 truncate">
              Official Digital Archive
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <button onClick={() => setIsUploadOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase hover:opacity-90 transition-all shadow-md active:scale-95">
              <Plus size={14} /><span>Upload</span>
            </button>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full">

          <div className="flex-1 w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full">
              <div onClick={() => setShowArchived(!showArchived)} className={cn("bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 relative flex flex-col justify-between shadow-sm h-[220px] cursor-pointer transition-all hover:border-orange-500 group/toggle", showArchived ? "ring-2 ring-orange-500" : "")}>
                <div className="flex justify-between items-start">
                  <div className={cn("p-2 rounded-lg text-zinc-500 transition-colors", showArchived ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-500" : "bg-zinc-100 dark:bg-zinc-900")}>{showArchived ? <LayoutGrid size={24} /> : <FileText size={24} />}</div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 group-hover/toggle:text-zinc-900 dark:group-hover/toggle:text-zinc-300 transition-colors">
                      {showArchived ? "View Active" : "View Archive"}
                    </span>
                    <Switch checked={showArchived} className="scale-75 pointer-events-none data-[state=checked]:bg-orange-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-6xl font-light text-zinc-900 dark:text-white tracking-tighter">{stats.total}</h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-2">{showArchived ? "Archived Documents" : "Active Documents"}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-4 sm:p-5 flex flex-col relative overflow-hidden shadow-sm h-[220px]">
                <button onClick={() => activeCategory && setActiveCategory(null)} className={cn("absolute top-4 sm:top-5 left-4 sm:left-5 flex items-center gap-2 transition-all z-10", activeCategory ? "cursor-pointer hover:opacity-70" : "pointer-events-none")}>
                  <div className="p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-md text-zinc-500">
                    {activeCategory ? <FilterX size={14} className="text-orange-500" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>}
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", activeCategory ? "text-orange-500" : "text-zinc-400")}>
                    {activeCategory ? "Clear Filter" : "Distribution"}
                  </span>
                </button>
                <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-4 pt-10 pb-1">
                  {CATEGORY_CONFIG.slice(0, 3).map((cat) => {
                    const isSelected = highlightedCategory === cat.id;
                    const count = stats.categorized[cat.id] || 0;

                    // Dynamic colors based on config
                    const activeBg = cat.color === 'emerald' ? "bg-emerald-500 text-white" :
                      cat.color === 'orange' ? "bg-orange-500 text-white" :
                        cat.color === 'blue' ? "bg-blue-500 text-white" :
                          "bg-purple-500 text-white";

                    const activeText = cat.color === 'emerald' ? "text-emerald-500" :
                      cat.color === 'orange' ? "text-orange-500" :
                        cat.color === 'blue' ? "text-blue-500" :
                          "text-purple-500";

                    return (
                      <button key={cat.id} onClick={() => setActiveCategory(prev => prev === cat.id ? null : cat.id)} className="flex flex-col items-center gap-1 group/item w-full outline-none">
                        <div className={cn("p-1.5 rounded-xl transition-all duration-300 shadow-sm", isSelected ? cn(activeBg, "scale-110 shadow-lg") : "bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-600 hover:scale-105")}>
                          <cat.icon size={16} strokeWidth={2.5} className="sm:w-[20px] sm:h-[20px]" />
                        </div>
                        <div className="text-center">
                          <span className={cn("block text-sm font-bold leading-none", isSelected ? activeText : "text-zinc-900 dark:text-white")}>{count}</span>
                          <span className={cn("block text-[8px] font-bold uppercase tracking-wider transition-colors truncate max-w-[64px]", isSelected ? activeText : "text-zinc-400")}>{cat.label}</span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Dynamic 4th Slot: Either the 4th category or View All */}
                  {CATEGORY_CONFIG.length > 3 ? (
                    <button onClick={() => setIsCategoryModalOpen(true)} className="flex flex-col items-center gap-1 group/item w-full outline-none">
                      <div className="p-2 rounded-2xl transition-all duration-300 shadow-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:scale-105 hover:border-orange-500 hover:text-orange-500">
                        <LayoutGrid size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px]" />
                      </div>
                      <div className="text-center">
                        <span className="block text-[8px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-orange-500 transition-colors">View All</span>
                      </div>
                    </button>
                  ) : (
                    // If exactly or less than 3, we don't need this, but assuming logic maps 4th if exists
                    CATEGORY_CONFIG[3] && (
                      <button onClick={() => setActiveCategory(prev => prev === CATEGORY_CONFIG[3].id ? null : CATEGORY_CONFIG[3].id)} className="flex flex-col items-center gap-1.5 group/item w-full outline-none">
                        {/* Rendering similar to map above... simplified for brevity since we know we have 4 currently */}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-orange-200/50 dark:border-orange-900/30 bg-white dark:bg-zinc-950 p-6 flex flex-col group hover:shadow-md transition-all h-[220px]">
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br from-orange-100/30 to-transparent dark:from-orange-800/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex-1 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                      <Clock size={24} strokeWidth={2} />
                    </div>
                    <span className="font-mono text-[10px] uppercase text-orange-600 dark:text-orange-400 font-bold tracking-widest">Expiring</span>
                  </div>
                  <div>
                    <h2 className="text-6xl font-light tracking-tighter text-orange-600 dark:text-orange-400 leading-none">{stats.EXPIRING}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700/60 dark:text-orange-300/60 mt-2">Items Expiring Soon</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input type="text" placeholder="Search documents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-12 pl-12 pr-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-orange-500 transition-all shadow-sm" />
            </div>

            <div className="space-y-3 w-full">
              <AnimatePresence mode="popLayout">
                {filteredDocs.map((doc) => (
                  <motion.div key={doc.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={() => setSelectedDoc(doc)} className={cn("group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-zinc-950 border rounded-xl cursor-pointer transition-all hover:shadow-md gap-4 sm:gap-0", selectedDoc?.id === doc.id ? "border-orange-500 ring-1 ring-orange-500 bg-orange-50/10 dark:bg-orange-900/10" : "border-zinc-200 dark:border-zinc-800")}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cn("h-10 w-10 flex items-center justify-center rounded-lg transition-colors shrink-0", doc.fileName.endsWith(".pdf") ? "bg-red-50 text-red-500 dark:bg-red-900/20" : "bg-blue-50 text-blue-500 dark:bg-blue-900/20")}><FileText size={18} /></div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{doc.fileName}</h4>
                          <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[9px] font-mono font-bold text-zinc-500 uppercase shrink-0">{getExtension(doc.fileName)}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">{doc.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-8 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/50 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase sm:hidden inline-block mr-2">Size</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 font-mono inline-block sm:block">{doc.fileSizeMB} MB</p>
                      </div>
                      <div className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shrink-0", doc.status === 'VALID' ? "bg-emerald-100 text-emerald-700" : doc.status === 'EXPIRING' ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700")}>{doc.status}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredDocs.length === 0 && (
                <div className="py-12 text-center">
                  <FileIcon size={32} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                  <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">No documents found</p>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {selectedDoc && (
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-0 z-50 lg:static lg:z-auto lg:w-[400px] xl:w-[450px] flex flex-col bg-white dark:bg-zinc-950 lg:border border-zinc-200 dark:border-zinc-800 lg:rounded-3xl shadow-2xl overflow-hidden shrink-0 lg:sticky lg:top-8 lg:h-[calc(100vh-8rem)]"
              >
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
                  <div className="min-w-0 pr-4">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">Preview</h3>
                    <p className="text-[10px] font-mono text-zinc-400 uppercase mt-0.5 truncate">{selectedDoc.fileName}</p>
                  </div>
                  <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors shrink-0">
                    <X size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                  <div className="bg-zinc-950 flex flex-col items-center justify-center p-8 text-center relative shrink-0 min-h-[200px]">
                    <div className="w-24 h-32 sm:w-32 sm:h-40 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center mb-6 shadow-inner">
                      <FileIcon size={40} className="text-zinc-700 sm:w-[48px] sm:h-[48px]" />
                    </div>
                    <button onClick={openPreview} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs font-bold uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap">
                      <Eye size={16} /> Preview Document
                    </button>
                  </div>

                  <div className="px-5 sm:px-6 pt-6 pb-2 bg-zinc-50 dark:bg-black/20 shrink-0 border-t border-zinc-200 dark:border-zinc-800/50">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mb-2">File Name</p>
                    {isRenaming ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={handleRenameKeyDown}
                          className="flex-1 w-full bg-white dark:bg-zinc-900 border border-orange-500 rounded-lg px-3 py-2 text-sm font-bold text-zinc-900 dark:text-white outline-none shadow-sm min-w-0"
                        />
                        <span className="text-xs text-zinc-500 font-mono select-none px-1 sm:px-2 shrink-0">{renameExt}</span>
                        <button onClick={saveRename} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors shrink-0"><Check size={16} /></button>
                        <button onClick={cancelRename} className="p-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500 rounded-lg transition-colors shrink-0"><X size={16} /></button>
                      </div>
                    ) : (
                      <div className="group/edit flex items-center justify-between cursor-pointer p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 rounded-xl transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800" onClick={startRename}>
                        <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white truncate pr-4">{selectedDoc.fileName}</p>
                        <Edit2 size={16} className="text-zinc-400 group-hover/edit:text-orange-500 transition-colors shrink-0" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-6 pt-0 bg-zinc-50 dark:bg-black/20 flex flex-col gap-5 flex-1 overflow-y-auto">
                    <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800 mb-2 shrink-0"></div>
                    {isRenaming ? (
                      <div className="grid grid-cols-1 gap-4">
                        <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Document Type</p>
                          <input value={editValues.type} onChange={e => setEditValues({ ...editValues, type: e.target.value })} className="w-full bg-white dark:bg-zinc-900 border border-orange-500 rounded px-2 py-1 text-xs font-bold" />
                        </div>
                        <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Issued By</p>
                          <input value={editValues.issuedBy} onChange={e => setEditValues({ ...editValues, issuedBy: e.target.value })} className="w-full bg-white dark:bg-zinc-900 border border-orange-500 rounded px-2 py-1 text-xs font-bold" />
                        </div>
                        <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Issue Date</p>
                          <input type="date" value={editValues.issueDate} onChange={e => setEditValues({ ...editValues, issueDate: e.target.value })} className="w-full bg-white dark:bg-zinc-900 border border-orange-500 rounded px-2 py-1 text-xs font-bold" />
                        </div>
                        <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Expiry Date</p>
                          <div className="flex gap-2 items-center">
                            <input type="date" disabled={editValues.expiryDate === null} value={editValues.expiryDate || ""} onChange={e => setEditValues({ ...editValues, expiryDate: e.target.value })} className="w-full bg-white dark:bg-zinc-900 border border-orange-500 rounded px-2 py-1 text-xs font-bold" />
                            <button onClick={() => setEditValues({ ...editValues, expiryDate: editValues.expiryDate ? null : new Date().toISOString().split('T')[0] })} className="text-[10px] uppercase font-bold text-orange-500 whitespace-nowrap">{editValues.expiryDate === null ? "Set Date" : "Unlimited"}</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                        <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Document Type</p><p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-tight break-words">{selectedDoc.type}</p></div>
                        <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Document ID</p><p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-tight font-mono break-all">{selectedDoc.number}</p></div>
                        <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Issued By</p><p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-tight break-words">{selectedDoc.issuedBy}</p></div>
                        <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Issue Date</p><p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-tight">{selectedDoc.issueDate.split('T')[0]}</p></div>
                        <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Expiry Date</p><p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-tight">{selectedDoc.expiryDate ? selectedDoc.expiryDate.split('T')[0] : "Unlimited"}</p></div>
                        <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Status</p><p className={cn("text-xs sm:text-sm font-bold uppercase", selectedDoc.status === 'VALID' ? "text-emerald-500" : selectedDoc.status === 'EXPIRING' ? "text-orange-500" : "text-red-500")}>{selectedDoc.status}</p></div>
                        <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Extension</p><span className="inline-block px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300 uppercase">{getExtension(selectedDoc.fileName)}</span></div>
                        <div><p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">File Size</p><p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-tight">{selectedDoc.fileSizeMB} MB</p></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shrink-0 flex gap-3 z-10">
                  <button
                    onClick={handleDownload}
                    className={cn(
                      "flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
                      // !selectedDoc.fileUrl && "opacity-50 pointer-events-none cursor-not-allowed" // Don't disable, let it fetch!
                    )}
                  >
                    <Download size={16} /> Download
                  </button>
                  <button
                    onClick={async () => {
                      if (!selectedDoc) return;
                      try {
                        await api.archiveDocument(selectedDoc.id, !selectedDoc.archived);
                        toast.success(`Document ${selectedDoc.archived ? "unarchived" : "archived"}`);
                        // Refresh list
                        loadDocuments();
                        setSelectedDoc(null);
                      } catch (e) {
                        toast.error("Failed to update status");
                      }
                    }}
                    className="flex-1 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-bold uppercase shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {selectedDoc.archived ? <UploadCloud size={16} /> : <Trash2 size={16} />}
                    {selectedDoc.archived ? "Unarchive" : "Archive"}
                  </button>
                  <button onClick={() => { setDocToDelete(selectedDoc.id); setShowDeleteConfirm(true); }} className="flex-1 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl text-xs font-bold uppercase shadow-sm flex items-center justify-center gap-2 transition-colors"><X size={16} /> Delete</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>{isUploadOpen && <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUpload={handleUpload} />}</AnimatePresence>
      <AnimatePresence>{showDeleteConfirm && docToDelete !== null && <DeleteConfirmationDialog isOpen={showDeleteConfirm} fileName={documents.find(d => d.id === docToDelete)?.fileName || ""} onConfirm={async () => {
        try {
          if (docToDelete) {
            await api.deleteDocument(docToDelete);
            setDocuments(prev => prev.filter(d => d.id !== docToDelete));
            setSelectedDoc(null);
            setShowDeleteConfirm(false);
            toast.error("Document deleted");
          }
        } catch (e) {
          toast.error("Failed to delete document");
        }
      }} onCancel={() => setShowDeleteConfirm(false)} />}</AnimatePresence>
      <AnimatePresence>{showPDFViewer && selectedDoc && <PDFViewerModal isOpen={showPDFViewer} fileUrl={selectedDoc.fileUrl} fileName={selectedDoc.fileName} onClose={() => setShowPDFViewer(false)} />}</AnimatePresence>
      <AnimatePresence>
        {isCategoryModalOpen && (
          <CategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            onSelect={(id) => { setActiveCategory(id); setIsCategoryModalOpen(false); }}
            activeCategory={activeCategory}
            counts={stats.categorized}
          />
        )}
      </AnimatePresence>
    </div>
  );
}