"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { api, Category } from "@/app/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Award,
  Search,
  Plus,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Trash2,
  Edit,
  Eye,
  UploadCloud,
  X,
  AlertCircle,
  File as FileIcon,
  LayoutGrid,
  FilterX,
  MoreHorizontal,
  Anchor,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DatePicker } from '@/components/ui/date-picker';
import { ThemeToggle } from "@/components/ThemeToggle";
import { Switch } from "@/components/ui/switch";
import { SYSTEM_CONFIG } from "@/lib/config";
import { CategoryManager } from "@/app/components/CategoryManager";

interface Certificate {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  status: "VALID" | "EXPIRING" | "EXPIRED";
  certType: string;
  fileUrl?: string;
  fileBlob?: string; // Cache base64 data
  fileName?: string;
  mimeType?: string;
}

const ICONS_MAP: Record<string, any> = {
  "Award": Award,
  "Anchor": Anchor,
  "Stethoscope": Stethoscope,
  "FileText": FileText,
  "File": FileIcon,
  "Plane": FileIcon, // Fallback or add imports if needed
  "Wrench": FileIcon, // Fallback
};

const CERTIFICATE_TYPES = [
  { value: "CoC", label: "Certificate of Competency (CoC)", description: "Professional competency certificates" },
  { value: "STCW", label: "STCW Course", description: "Safety training & STCW courses" },
  { value: "Medical", label: "Medical Certificate", description: "Health & medical certifications" },
  { value: "License", label: "License", description: "Professional licenses & endorsements" },
  { value: "Other", label: "Other Certificate", description: "Other maritime certificates" },
];

function CertificateTypeModal({ isOpen, onClose, onSelect, activeCategory, counts, categories }: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  activeCategory: string | null;
  counts: Record<string, number>;
  categories: Category[];
}) {
  const [search, setSearch] = useState("");

  const filteredTypes = useMemo(() => {
    const allCategories = categories.map(cat => ({
      id: cat.label, // Use label as UID for filtering
      label: CERTIFICATE_TYPES.find(t => t.value === cat.label)?.label || cat.label,
      icon: ICONS_MAP[cat.icon] || FileIcon, // Use ICONS_MAP for dynamic icons
      color: cat.color || 'zinc' // Fallback color
    }));

    return allCategories.filter(cat =>
      cat.label.toLowerCase().includes(search.toLowerCase()) || cat.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, categories]);

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
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Certificate Types</h3>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">Filter by Type</p>
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
              placeholder="Search types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-zinc-100 dark:bg-zinc-900/50 border border-transparent focus:bg-white dark:focus:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-orange-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredTypes.map((cat) => {
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
                      "font-bold text-sm truncate",
                      isActive ? "text-zinc-900 dark:text-white" : "text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white"
                    )}>{cat.label}</h4>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">Certificates</p>
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

const INITIAL_DATA: Certificate[] = [];

function getDaysUntilExpiry(expiryDate: string | null): number {
  if (!expiryDate || expiryDate === "Unlimited") return Infinity;

  // Create dates and reset time to midnight to compare just dates locally
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiry = new Date(expiryDate);
  const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  if (isNaN(expiry.getTime())) return Infinity;
  const diff = expiryDay.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDateDisplay(dateString: string | null) {
  if (!dateString || dateString === "Unlimited") return { day: "", month: "", year: "Unlimited" };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { day: "", month: "", year: "Invalid Date" };
  return {
    day: date.getDate(),
    month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
    year: date.getFullYear(),
  };
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    VALID: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    EXPIRING: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    EXPIRED: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
  };

  const icons = {
    VALID: CheckCircle2,
    EXPIRING: Clock,
    EXPIRED: AlertTriangle,
  };

  const Icon = icons[status as keyof typeof icons];

  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider w-fit shadow-sm", styles[status as keyof typeof styles])}>
      <Icon size={12} strokeWidth={2.5} />
      <span>{status}</span>
    </div>
  );
}

function DeleteConfirmationDialog({
  isOpen,
  certificateName,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  certificateName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="h-16 w-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={32} className="text-orange-600 dark:text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Delete Certificate?</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Are you sure you want to delete</p>
          <p className="text-sm font-mono font-bold text-zinc-900 dark:text-white mb-8 truncate px-2">{certificateName}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-8">This action cannot be undone.</p>
        </div>

        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold uppercase hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-700 dark:text-zinc-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 rounded-xl text-sm font-bold uppercase text-white transition-colors shadow-lg"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function UploadModal({
  isOpen,
  onClose,
  onUpload,
  categories
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, certType: string, certName: string, issuedBy: string, issueDate: string, expiryDate: string | null) => void;
  categories: Category[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState<"upload" | "classify">("upload");

  const [certType, setCertType] = useState(CERTIFICATE_TYPES[0].value);
  const [certName, setCertName] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [isUnlimited, setIsUnlimited] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setStep("upload");
      setCertType(CERTIFICATE_TYPES[0].value);
      setCertName("");
      setIssuedBy("");
      setIssueDate(new Date().toISOString().split('T')[0]);
      setExpiryDate("");
      setIsUnlimited(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const MAX_SIZE = SYSTEM_CONFIG.upload.maxFileSizeMB * 1024 * 1024;
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Please upload PDF, JPG, or PNG files.");
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error(`File is too large. Maximum size is ${SYSTEM_CONFIG.upload.maxFileSizeMB}MB.`);
      return;
    }

    setSelectedFile(file);
    setCertName(file.name.replace(/\.[^/.]+$/, ""));
    setStep("classify");
  };

  const handleSubmit = () => {
    if (!selectedFile) return;

    if (!certName.trim()) {
      toast.error("Please enter a certificate name");
      return;
    }
    if (!issuedBy.trim()) {
      toast.error("Please enter the issuing authority");
      return;
    }
    if (!isUnlimited && !expiryDate) {
      toast.error("Please enter an expiry date or select Unlimited");
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      onUpload(selectedFile, certType, certName, issuedBy, issueDate, isUnlimited ? null : expiryDate);
      setIsUploading(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {step === "upload" ? "Upload Certificate" : "Classify Certificate"}
            </h3>
            {step === "classify" && (
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Step 2 of 2: Details</p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="disabled:opacity-50 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={18} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {step === "upload" ? (
            <div className="p-8 sm:p-10">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer transition-all group",
                  isDragOver
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-orange-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                )}
              >
                <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} className="text-zinc-400 group-hover:text-orange-500" />
                </div>
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Click to upload or drag files</p>
                <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">PDF, JPG, PNG (Max {SYSTEM_CONFIG.upload.maxFileSizeMB}MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
            </div>
          ) : (
            <div className="p-6 space-y-5">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <FileText size={16} className="text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{selectedFile?.name}</p>
                  <p className="text-[10px] font-mono text-zinc-400">{((selectedFile?.size || 0) / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={() => setStep("upload")}
                  className="text-[10px] font-bold uppercase text-zinc-500 hover:text-orange-600 transition-colors shrink-0"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 mb-2 block">Certificate Type *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const typeInfo = CERTIFICATE_TYPES.find(t => t.value === cat.label);
                    const desc = typeInfo?.description || "Certificate Category";
                    const displayLabel = typeInfo?.label || cat.label;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCertType(cat.label)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all",
                          certType === cat.label
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500 shadow-sm"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
                        )}
                      >
                        <p className={cn(
                          "text-xs font-bold",
                          certType === cat.label ? "text-orange-600 dark:text-orange-400" : "text-zinc-700 dark:text-zinc-300"
                        )}>
                          {displayLabel}
                        </p>
                        <p className="text-[9px] text-zinc-400 mt-0.5 leading-tight">{desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5 block">Certificate Name *</label>
                <input
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium focus:border-orange-500 outline-none transition-colors text-zinc-900 dark:text-zinc-100"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="e.g., STCW Basic Safety Training"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5 block">Issued By *</label>
                <input
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium focus:border-orange-500 outline-none transition-colors text-zinc-900 dark:text-zinc-100"
                  value={issuedBy}
                  onChange={(e) => setIssuedBy(e.target.value)}
                  placeholder="e.g., Maritime Authority"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5 block">Issue Date *</label>
                  <DatePicker
                    date={issueDate ? new Date(issueDate) : undefined}
                    setDate={(date: Date | undefined) => setIssueDate(date ? date.toLocaleDateString('en-CA') : "")}
                    placeholder="Pick a date"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={cn("text-[10px] uppercase font-bold transition-colors", isUnlimited ? "text-zinc-300" : "text-zinc-400")}>Expiry Date *</label>
                    <div className="flex items-center gap-2">
                      <label htmlFor="unlimited" className={cn("text-[10px] font-bold cursor-pointer select-none transition-colors", isUnlimited ? "text-orange-600 dark:text-orange-500" : "text-zinc-400")}>Unlimited</label>
                      <Switch
                        id="unlimited"
                        checked={isUnlimited}
                        onCheckedChange={(checked) => {
                          setIsUnlimited(checked);
                          if (checked) setExpiryDate("");
                        }}
                        className="scale-75 data-[state=checked]:bg-orange-600 dark:data-[state=checked]:bg-orange-600"
                      />
                    </div>
                  </div>
                  <DatePicker
                    date={expiryDate ? new Date(expiryDate) : undefined}
                    setDate={(date: Date | undefined) => setExpiryDate(date ? date.toLocaleDateString('en-CA') : "")}
                    placeholder="Pick a date"
                    disabled={isUnlimited}
                    className={cn(isUnlimited && "opacity-50 cursor-not-allowed")}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end gap-3 shrink-0 border-t border-zinc-100 dark:border-zinc-800/50">
          {step === "classify" && (
            <button
              onClick={() => setStep("upload")}
              disabled={isUploading}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-50 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={step === "upload" ? onClose : handleSubmit}
            disabled={isUploading}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg disabled:opacity-50 transition-all",
              step === "upload"
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                : "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20 active:scale-95"
            )}
          >
            {isUploading ? "Uploading..." : step === "upload" ? "Close" : "Upload Certificate"}
          </button>
        </div>
      </motion.div >
    </div >
  );
}

function CertificateViewerModal({
  isOpen,
  fileUrl,
  fileName,
  onClose,
  mimeType,
}: {
  isOpen: boolean;
  fileUrl?: string;
  fileName: string;
  onClose: () => void;
  mimeType?: string;
}) {
  if (!isOpen) return null;

  const isPDF = mimeType === 'application/pdf' || fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-[102] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full h-full max-w-5xl max-h-[90vh] bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <div className="min-w-0 pr-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">Certificate Preview</h3>
            <p className="text-[10px] font-mono text-zinc-400 uppercase mt-0.5 truncate">{fileName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center relative">
          {fileUrl ? (
            isPDF ? (
              <iframe src={fileUrl} className="w-full h-full border-none bg-white" title="PDF Preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
                <img src={fileUrl} alt={fileName} className="max-w-full max-h-full object-contain shadow-lg rounded-md" />
              </div>
            )
          ) : (
            <div className="text-center p-10 opacity-50">
              <FileIcon size={48} className="mx-auto mb-4 text-zinc-400" />
              <p className="text-zinc-500 font-bold">Preview not available</p>
              <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-widest font-bold">Upload a real file to view</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function EditCertificateModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: any) => Promise<void>;
  initialData: Certificate;
}) {
  const [formData, setFormData] = useState({
    certName: initialData.name,
    issuedBy: initialData.issuer,
    issueDate: initialData.issueDate.split('T')[0],
    expiry: initialData.expiryDate ? initialData.expiryDate.split('T')[0] : "",
    status: initialData.status
  });
  const [isUnlimited, setIsUnlimited] = useState(!initialData.expiryDate);
  const [isSaving, setIsSaving] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let updateData: any = { ...formData };

      // Handle unlimited expiry
      if (isUnlimited) {
        updateData.expiry = null;
      } else if (!formData.expiry) {
        toast.error("Please enter an expiry date or select Unlimited");
        setIsSaving(false);
        return;
      }

      if (newFile) {
        const reader = new FileReader();
        reader.onload = async () => {
          const result = reader.result as string;
          const base64Content = result.includes(',') ? result.split(',')[1] : "";
          updateData.cert = base64Content;
          await onSave(initialData.id, updateData);
          onClose();
        };
        reader.readAsDataURL(newFile);
        return;
      }

      await onSave(initialData.id, updateData);
      onClose();

    } catch (error) {
      toast.error("Failed to update certificate");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Edit Certificate</h3>
          <button onClick={onClose} disabled={isSaving} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={18} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5 block">Certificate Name</label>
            <input
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium focus:border-orange-500 outline-none transition-colors text-zinc-900 dark:text-zinc-100"
              value={formData.certName}
              onChange={(e) => setFormData({ ...formData, certName: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5 block">Issued By</label>
            <input
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium focus:border-orange-500 outline-none transition-colors text-zinc-900 dark:text-zinc-100"
              value={formData.issuedBy}
              onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5 block">Issue Date</label>
              <DatePicker
                date={formData.issueDate ? new Date(formData.issueDate) : undefined}
                setDate={(date: Date | undefined) => setFormData({ ...formData, issueDate: date ? date.toLocaleDateString('en-CA') : "" })}
                placeholder="Pick a date"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={cn("text-[10px] uppercase font-bold transition-colors", isUnlimited ? "text-zinc-300" : "text-zinc-400")}>Expiry Date</label>
                <div className="flex items-center gap-2">
                  <label htmlFor="unlimited-edit" className={cn("text-[10px] font-bold cursor-pointer select-none transition-colors", isUnlimited ? "text-orange-600 dark:text-orange-500" : "text-zinc-400")}>Unlimited</label>
                  <Switch
                    id="unlimited-edit"
                    checked={isUnlimited}
                    onCheckedChange={(checked) => {
                      setIsUnlimited(checked);
                      if (checked) setFormData({ ...formData, expiry: "" });
                    }}
                    className="scale-75 data-[state=checked]:bg-orange-600 dark:data-[state=checked]:bg-orange-600"
                  />
                </div>
              </div>
              <DatePicker
                date={formData.expiry ? new Date(formData.expiry) : undefined}
                setDate={(date: Date | undefined) => setFormData({ ...formData, expiry: date ? date.toLocaleDateString('en-CA') : "" })}
                placeholder="Pick a date"
                disabled={isUnlimited}
                className={cn(isUnlimited && "opacity-50 cursor-not-allowed")}
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="text-[10px] uppercase font-bold text-zinc-400 mb-2 block">Replace File (Optional)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-zinc-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-zinc-100 file:text-zinc-600 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-300 dark:hover:file:bg-zinc-700 transition-colors cursor-pointer"
            />
            {newFile && <p className="text-[10px] font-bold text-zinc-400 mt-2 px-1 truncate">Selected: {newFile.name}</p>}
          </div>
        </div>

        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end gap-3 shrink-0 border-t border-zinc-100 dark:border-zinc-800/50">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all active:scale-95"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div >
    </div >
  );
}

export default function CertificatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [certificates, setCertificates] = useState(INITIAL_DATA);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [certToDelete, setCertToDelete] = useState<number | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories("certificate");
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load certificate categories.");
      }
    };
    fetchCategories();
  }, [isCategoryManagerOpen]);

  // Helper to map categories to config format for UI
  const categoryConfig = useMemo(() => {
    return categories.map(cat => ({
      id: cat.label, // Use label as ID for compatibility
      label: cat.label,
      icon: ICONS_MAP[cat.icon] || FileIcon,
      color: cat.color || 'zinc'
    }));
  }, [categories]);

  useEffect(() => {
    loadCertificates();
  }, []);

  const getMimeType = (b64: string, fileName?: string) => {
    if (b64.startsWith('JVBERi0')) return 'application/pdf';
    if (b64.startsWith('iVBORw0KGgo')) return 'image/png';
    if (b64.startsWith('/9j/')) return 'image/jpeg';
    if (fileName) {
      const lower = fileName.toLowerCase();
      if (lower.endsWith('.png')) return 'image/png';
      if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
      if (lower.endsWith('.pdf')) return 'application/pdf';
    }
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
      return null;
    }
  };

  const loadCertificates = async () => {
    try {
      const data = await api.getCertificates();

      const mapped = data.map((c: any) => {
        const hasExt = c.certName?.toLowerCase().match(/\.(pdf|jpg|jpeg|png)$/i);
        const finalName = c.certName || "Untitled Certificate";

        return {
          id: c.id,
          name: c.certName || "Untitled Certificate",
          issuer: c.issuedBy || "Unknown Issuer",
          certType: c.certType || "Other",
          issueDate: c.issueDate || new Date().toISOString(),
          expiryDate: c.expiry || null,
          status: (["VALID", "EXPIRING", "EXPIRED"].includes(c.status) ? c.status : "VALID"),
          fileName: finalName,
          fileUrl: undefined, // Loaded on demand
          fileBlob: undefined // Loaded on demand
        };
      });
      setCertificates(mapped);
    } catch (error) {
      console.error("Load certs error:", error);
    }
  };

  const filteredCerts = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesSearch =
        cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === "all" || cert.status === filter;
      const matchesCategory = !activeCategory || cert.certType === activeCategory;

      return matchesSearch && matchesFilter && matchesCategory;
    });
  }, [searchTerm, filter, certificates, activeCategory]);

  const stats = useMemo(() => {
    const counts = {
      total: certificates.length,
      VALID: 0,
      EXPIRING: 0,
      EXPIRED: 0
    };
    const categorized: Record<string, number> = {};

    certificates.forEach(cert => {
      // Status counts
      if (['VALID', 'EXPIRING', 'EXPIRED'].includes(cert.status)) {
        counts[cert.status as keyof typeof counts]++;
      } else {
        counts['VALID']++;
      }

      // Categorized counts
      const type = cert.certType || "Other";
      categorized[type] = (categorized[type] || 0) + 1;
    });

    return { ...counts, categorized };
  }, [certificates]);

  const handleUpload = async (file: File, certType: string, certName: string, issuedBy: string, issueDate: string, expiryDate: string | null) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        const base64Content = result.includes(',') ? result.split(',')[1] : "";

        const today = new Date();
        let status = "VALID";
        let daysUntilExpiry = Infinity;

        if (expiryDate) {
          const expiry = new Date(expiryDate);
          daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilExpiry < 0) {
            status = "EXPIRED";
          } else if (daysUntilExpiry <= 90) {
            status = "EXPIRING";
          }
        }

        const newCertData = {
          cert: base64Content,
          certType: certType,
          issuedBy: issuedBy,
          status: status,
          expiry_date: expiryDate ? new Date(expiryDate).toISOString().split('T')[0] : null,
          certName: certName,
          issueDate: new Date(issueDate).toISOString(),
          uploadDate: new Date().toISOString(),
          hidden: false
        };

        await api.createCertificate(newCertData);
        toast.success(`${certName} uploaded successfully!`);
        loadCertificates();
      };
      reader.readAsDataURL(file);

    } catch (error) {
      toast.error("Upload failed");
    }
  };

  const handleDeleteClick = (id: number) => {
    const cert = certificates.find((c) => c.id === id);
    if (cert) {
      setCertToDelete(id);
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (certToDelete !== null) {
      try {
        await api.deleteCertificate(certToDelete);
        const deletedCert = certificates.find((c) => c.id === certToDelete);

        setCertificates((prev) => prev.filter((c) => c.id !== certToDelete));
        setSelectedCert(null);
        setShowDeleteConfirm(false);
        setCertToDelete(null);
        toast.error(`${deletedCert?.name} has been deleted.`);
      } catch (error) {
        toast.error("Failed to delete certificate");
      }
    }
  };

  const handleUpdate = async (id: number, data: any) => {
    try {
      await api.updateCertificate(id, data);
      toast.success("Certificate updated successfully");
      loadCertificates();
    } catch (error) {
      toast.error("Failed to update certificate");
    }
  };

  const fetchCertificateContent = async (cert: Certificate) => {
    if (cert.fileUrl) return cert; // Already loaded

    try {
      const fullCert = await api.getCertificate(cert.id);
      if (fullCert.cert) {
        const mimeType = getMimeType(fullCert.cert, cert.fileName);
        const blob = b64toBlob(fullCert.cert, mimeType);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const updatedCert = { ...cert, fileUrl: url, fileBlob: fullCert.cert, mimeType };
          setCertificates(prev => prev.map(c => c.id === cert.id ? updatedCert : c));
          return updatedCert;
        }
      }
    } catch (e) {
      toast.error("Failed to load certificate file");
      console.error(e);
    }
    return cert;
  };

  const handleDownload = async (cert: Certificate) => {
    let targetCert = cert;
    if (!targetCert.fileUrl) {
      toast.loading("Downloading file...");
      targetCert = await fetchCertificateContent(cert);
      toast.dismiss();
    }

    if (targetCert.fileUrl) {
      const link = document.createElement("a");
      link.href = targetCert.fileUrl;
      link.download = targetCert.fileName || "certificate";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading ${targetCert.name}...`);
    } else {
      toast.error("File not available");
    }
  };

  const openViewer = async (cert: Certificate) => {
    setSelectedCert(cert);
    if (!cert.fileUrl) {
      toast.loading("Loading preview...");
      const loaded = await fetchCertificateContent(cert);
      setSelectedCert(loaded);
      toast.dismiss();
    }
    setShowViewer(true);
  };

  const openEditor = async (cert: Certificate) => {
    setSelectedCert(cert);
    if (!cert.fileUrl) {
      toast.loading("Loading editor...");
      const loaded = await fetchCertificateContent(cert);
      setSelectedCert(loaded);
      toast.dismiss();
    }
    setShowEditor(true);
  };

  return (
    <div className="min-h-screen w-full bg-transparent selection:bg-orange-500 selection:text-white pb-32 transition-colors duration-300">


      <main className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 md:gap-8">

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl sm:text-4xl font-light tracking-tighter text-zinc-900 dark:text-white truncate">
              Certificate<span className="font-bold text-[#FF3300]">Vault</span>
            </h1>
            <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mt-1 truncate">
              Secure Certificate Storage & Compliance
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase hover:opacity-90 transition-all shadow-md active:scale-95"
            >
              <Plus size={14} />
              <span>New Certificate</span>
            </button>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-4 sm:p-5 flex flex-col relative overflow-hidden shadow-sm h-[220px]">
            <div className="flex justify-between items-center absolute top-4 sm:top-5 left-4 sm:left-5 right-4 z-10">
              <button onClick={() => activeCategory && setActiveCategory(null)} className={cn("flex items-center gap-2 transition-all", activeCategory ? "cursor-pointer hover:opacity-70" : "pointer-events-none")}>
                <div className="p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-md text-zinc-500">
                  {activeCategory ? <FilterX size={14} className="text-orange-500" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>}
                </div>
                <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", activeCategory ? "text-orange-500" : "text-zinc-400")}>
                  {activeCategory ? "Clear Filter" : "Distribution"}
                </span>
              </button>
            </div>

            {categories.length > 4 && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsTypeModalOpen(true); }}
                className="absolute top-5 sm:top-4 right-2 sm:right-4 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-all z-30"
              >
                <span className="text-[7px] font-bold uppercase tracking-wide">View All</span>
              </button>
            )}

            <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-4 pt-10 pb-1">
              {categoryConfig.slice(0, 4).map((cat) => {
                const isSelected = activeCategory === cat.id;
                const count = stats.categorized[cat.id] || 0;

                const activeBg = cat.color === 'emerald' ? "bg-emerald-500 text-white" :
                  cat.color === 'orange' ? "bg-orange-500 text-white" :
                    cat.color === 'blue' ? "bg-blue-500 text-white" :
                      cat.color === 'purple' ? "bg-purple-500 text-white" :
                        "bg-zinc-500 text-white";

                const activeText = cat.color === 'emerald' ? "text-emerald-500" :
                  cat.color === 'orange' ? "text-orange-500" :
                    cat.color === 'blue' ? "text-blue-500" :
                      cat.color === 'purple' ? "text-purple-500" :
                        "text-zinc-500";

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
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200/50 dark:border-emerald-900/30 bg-white dark:bg-zinc-950 p-6 flex flex-col group hover:shadow-md transition-all h-[220px]">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br from-emerald-100/30 to-transparent dark:from-emerald-800/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={24} strokeWidth={2} />
                </div>
                <span className="font-mono text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-bold tracking-widest">Valid</span>
              </div>
              <div>
                <h2 className="text-6xl font-light tracking-tighter text-emerald-600 dark:text-emerald-400 leading-none">{stats.VALID}</h2>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/60 dark:text-emerald-300/60 mt-2">Compliant & Current</p>
              </div>
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
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700/60 dark:text-orange-300/60 mt-2">Within 90 days</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-red-200/50 dark:border-red-900/30 bg-white dark:bg-zinc-950 p-6 flex flex-col group hover:shadow-md transition-all h-[220px]">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br from-red-100/30 to-transparent dark:from-red-800/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                  <AlertTriangle size={24} strokeWidth={2} />
                </div>
                <span className="font-mono text-[10px] uppercase text-red-600 dark:text-red-400 font-bold tracking-widest">Expired</span>
              </div>
              <div>
                <h2 className="text-6xl font-light tracking-tighter text-red-600 dark:text-red-400 leading-none">{stats.EXPIRED}</h2>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-700/60 dark:text-red-300/60 mt-2">Renewal required</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-1 min-w-0 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-colors placeholder:text-zinc-400"
            />
          </div>

          <div className="flex p-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto custom-scrollbar shrink-0">
            {["all", "VALID", "EXPIRING", "EXPIRED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                  filter === f
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 w-full">
          <AnimatePresence>
            {filteredCerts.map((cert) => {
              const dateParts = formatDateDisplay(cert.expiryDate);
              const daysLeft = getDaysUntilExpiry(cert.expiryDate);

              return (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all w-full"
                >
                  <div className={cn(
                    "absolute top-0 left-0 w-1 h-full transition-colors duration-300",
                    cert.status === 'EXPIRED' ? "bg-red-500" :
                      cert.status === 'EXPIRING' ? "bg-amber-500" : "bg-emerald-500"
                  )} />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 sm:gap-6 w-full pl-6 sm:pl-8">

                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={cn(
                        "h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl border transition-all shadow-sm",
                        cert.status === "EXPIRED"
                          ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400"
                          : cert.status === "EXPIRING"
                            ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400"
                            : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400"
                      )}>
                        <Award size={20} strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-zinc-900 dark:text-white text-sm truncate mb-0.5">
                          {cert.name}
                        </h3>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1.5 truncate">
                          <span className="font-bold text-orange-600 dark:text-orange-400 truncate">
                            {CERTIFICATE_TYPES.find(t => t.value === cert.certType)?.label || cert.certType}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
                          <span className="truncate">{cert.issuer}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
                          <span className="shrink-0">ID: {1000 + cert.id}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/50 pt-4 sm:pt-0 shrink-0">

                      <div className="flex flex-col sm:items-end min-w-[110px]">
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wide mb-0.5",
                          cert.status === 'EXPIRED' ? "text-red-500" :
                            cert.status === 'EXPIRING' ? "text-amber-500" :
                              "text-zinc-400"
                        )}>
                          {cert.status === 'EXPIRED' ? `Expired ${Math.abs(daysLeft)} days ago` :
                            cert.status === 'EXPIRING' ? `Expires in ${daysLeft} days` :
                              (daysLeft !== Infinity && daysLeft > 0) ? `Expires in ${daysLeft} days` :
                                daysLeft === 0 ? "Expires Today" :
                                  "Valid Certificate"
                          }
                        </span>

                        <div className={cn("flex items-baseline gap-1.5",
                          cert.status === 'EXPIRED' ? "opacity-60 grayscale" : ""
                        )}>
                          <span className="text-xl font-bold font-mono tracking-tighter text-zinc-900 dark:text-white">{dateParts.day}</span>
                          <span className="text-[10px] font-bold uppercase text-zinc-500">{dateParts.month}</span>
                          <span className="text-[10px] font-medium text-zinc-400">{dateParts.year}</span>
                        </div>
                      </div>

                      <div className="sm:hidden block">
                        <StatusBadge status={cert.status} />
                      </div>

                      <div className="flex items-center gap-1 sm:border-l sm:border-zinc-200 sm:dark:border-zinc-800 sm:pl-6 w-full sm:w-auto justify-end sm:justify-center mt-2 sm:mt-0">
                        <div className="hidden sm:block mr-4">
                          <StatusBadge status={cert.status} />
                        </div>
                        <button
                          onClick={() => openViewer(cert)}
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDownload(cert)}
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => openEditor(cert)}
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cert.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filteredCerts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl w-full">
              <Search size={40} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">No certificates found matching your criteria.</p>
            </div>
          )}
        </div>

        <div
          onClick={() => setIsUploadOpen(true)}
          className="mt-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group w-full"
        >
          <div className="h-14 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud size={20} className="text-zinc-400 group-hover:text-orange-500" />
          </div>
          <h3 className="text-zinc-900 dark:text-white font-bold text-sm">Drop certificates to upload</h3>
          <p className="text-[10px] font-bold text-zinc-500 mt-1 max-w-xs mx-auto uppercase tracking-wider">
            PDF, JPG, PNG Supported
          </p>
        </div>
      </main >

      <AnimatePresence>
        {isUploadOpen && (
          <UploadModal
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            onUpload={handleUpload}
            categories={categories}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && certToDelete !== null && (
          <DeleteConfirmationDialog
            isOpen={showDeleteConfirm}
            certificateName={certificates.find((c) => c.id === certToDelete)?.name || ""}
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showViewer && selectedCert && (
          <CertificateViewerModal
            isOpen={showViewer}
            fileUrl={selectedCert.fileUrl}
            fileName={selectedCert.fileName || "certificate"}
            mimeType={selectedCert.mimeType}
            onClose={() => setShowViewer(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditor && selectedCert && (
          <EditCertificateModal
            isOpen={showEditor}
            onClose={() => setShowEditor(false)}
            onSave={handleUpdate}
            initialData={selectedCert}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTypeModalOpen && (
          <CertificateTypeModal
            isOpen={isTypeModalOpen}
            onClose={() => setIsTypeModalOpen(false)}
            onSelect={(id) => { setActiveCategory(id); setIsTypeModalOpen(false); }}
            activeCategory={activeCategory}
            counts={stats.categorized}
            categories={categories}
          />
        )}
      </AnimatePresence>

      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        onCategoriesChange={() => { }} // useEffect handles refresh
        scope="certificate"
        counts={stats.categorized}
      />

      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsCategoryManagerOpen(true)}
          className="group h-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full flex items-center shadow-2xl transition-all duration-300 w-12 hover:w-[190px] overflow-hidden relative"
          title="Manage Categories"
        >
          <div className="absolute left-0 w-12 h-12 flex items-center justify-center shrink-0">
            <Edit size={20} />
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out whitespace-nowrap text-sm font-bold uppercase tracking-wide pl-12 pr-6">
            Edit Categories
          </span>
        </button>
      </div>
    </div >
  );
}