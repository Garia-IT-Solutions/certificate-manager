"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { api } from "@/app/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
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
  File
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SYSTEM_CONFIG } from "@/lib/config";

interface Certificate {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: "VALID" | "EXPIRING" | "EXPIRED";
  fileUrl?: string;
  fileName?: string;
}



const INITIAL_DATA: Certificate[] = [];

function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDateDisplay(dateString: string) {
  const date = new Date(dateString);
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
          <p className="text-sm font-mono font-bold text-zinc-900 dark:text-white mb-8">{certificateName}</p>
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
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

    setIsUploading(true);
    setTimeout(() => {
      onUpload(file);
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
        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Upload Certificate</h3>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="disabled:opacity-50"
          >
            <X size={20} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white" />
          </button>
        </div>
        <div className="p-10">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer transition-all group",
              isDragOver
                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                : "border-zinc-200 dark:border-zinc-800 hover:border-orange-400 hover:bg-zinc-50 dark:hover:bg-zinc-900",
              isUploading && "cursor-not-allowed"
            )}
          >
            {!isUploading ? (
              <>
                <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} className="text-zinc-400 group-hover:text-orange-500" />
                </div>
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Click to upload or drag files</p>
                <p className="text-xs text-zinc-400 mt-1">PDF, JPG, PNG (Max {SYSTEM_CONFIG.upload.maxFileSizeMB}MB)</p>
              </>
            ) : (
              <>
                <div className="h-10 w-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3" />
                <p className="text-xs font-bold text-orange-600 uppercase tracking-widest animate-pulse">Uploading...</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />
        </div>
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-bold uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CertificateViewerModal({
  isOpen,
  fileUrl,
  fileName,
  onClose,
}: {
  isOpen: boolean;
  fileUrl?: string;
  fileName: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const isPDF = fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-[102] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full h-full max-w-5xl max-h-[90vh] bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Certificate Preview</h3>
            <p className="text-[10px] font-mono text-zinc-400 uppercase mt-0.5">{fileName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
          {fileUrl ? (
            isPDF ? (
              <iframe src={fileUrl} className="w-full h-full border-none bg-white" title="PDF Preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8">
                <img src={fileUrl} alt={fileName} className="max-w-full max-h-full object-contain shadow-lg" />
              </div>
            )
          ) : (
            <div className="text-center p-10 opacity-50">
              <File size={48} className="mx-auto mb-4 text-zinc-400" />
              <p className="text-zinc-500 font-bold">Preview not available</p>
              <p className="text-xs text-zinc-400 mt-2">This is a mock entry. Upload a real file to view it here.</p>
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
    expiry: initialData.expiryDate.split('T')[0],
    status: initialData.status
  });
  const [isSaving, setIsSaving] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let updateData: any = { ...formData };

      // Handle file upload if a new file is selected
      if (newFile) {
        const reader = new FileReader();
        reader.onload = async () => {
          const result = reader.result as string;
          const base64Content = result.includes(',') ? result.split(',')[1] : "";
          updateData.cert = base64Content;
          // If replacing file, might want to auto-update name/type if not manually changed?
          // For now, just send the content

          await onSave(initialData.id, updateData);
          onClose();
        };
        reader.readAsDataURL(newFile);
        return;
      }

      await onSave(initialData.id, updateData);
      onClose();

    } catch (error) {
      console.error("Save failed", error);
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
        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Edit Certificate</h3>
          <button onClick={onClose} disabled={isSaving}>
            <X size={20} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">Certificate Name</label>
            <input
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-medium focus:border-orange-500 outline-none"
              value={formData.certName}
              onChange={(e) => setFormData({ ...formData, certName: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">Issued By</label>
            <input
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-medium focus:border-orange-500 outline-none"
              value={formData.issuedBy}
              onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">Issue Date</label>
              <input
                type="date"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-medium focus:border-orange-500 outline-none text-zinc-700 dark:text-zinc-300"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">Expiry Date</label>
              <input
                type="date"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-medium focus:border-orange-500 outline-none text-zinc-700 dark:text-zinc-300"
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">Replace File (Optional)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            {newFile && <p className="text-[10px] text-zinc-400 mt-1">Selected: {newFile.name}</p>}
          </div>
        </div>

        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-bold uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold uppercase shadow-lg shadow-orange-500/20 disabled:opacity-50"
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
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  // --- HELPER: Detect MIME type from Base64 signature ---
  const getMimeType = (b64: string) => {
    // PDF signature (JVBERi0...)
    if (b64.startsWith('JVBERi0')) return 'application/pdf';
    // PNG signature (iVBORw0KGgo...)
    if (b64.startsWith('iVBORw0KGgo')) return 'image/png';
    // JPEG signature (/9j/...)
    if (b64.startsWith('/9j/')) return 'image/jpeg';
    // Default fallback
    return 'application/pdf';
  };

  // --- HELPER: Convert Base64 to Blob ---
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

  const loadCertificates = async () => {
    try {
      const data = await api.getCertificates();

      const mapped = data.map((c: any) => {
        let fileUrl = "";
        let finalMimeType = "application/pdf"; // Default

        if (c.cert) {
          // 1. Auto-detect correct MIME type from data
          finalMimeType = getMimeType(c.cert);

          // 2. Create Blob with correct type
          const blob = b64toBlob(c.cert, finalMimeType);
          if (blob) {
            fileUrl = URL.createObjectURL(blob);
          }
        }

        // Ensure filename has an extension for the UI
        let displayExt = ".pdf";
        if (finalMimeType === 'image/jpeg') displayExt = ".jpg";
        if (finalMimeType === 'image/png') displayExt = ".png";

        const hasExt = c.certName?.toLowerCase().endsWith(displayExt);
        const finalName = (c.certName || "Untitled Certificate") + (hasExt ? "" : displayExt);

        return {
          id: c.id,
          name: c.certName || "Untitled Certificate",
          issuer: c.issuedBy || "Unknown Issuer",
          issueDate: c.issueDate || new Date().toISOString(),
          expiryDate: c.expiry || new Date().toISOString(),
          status: (["VALID", "EXPIRING", "EXPIRED"].includes(c.status) ? c.status : "VALID"),
          fileName: finalName,
          fileUrl: fileUrl
        };
      });
      setCertificates(mapped);
    } catch (error) {
      console.error("Failed to load certificates:", error);
      toast.error("Failed to load certificates");
    }
  };


  const filteredCerts = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesSearch =
        cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === "all" || cert.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filter, certificates]);


  const stats = {
    total: certificates.length,
    VALID: certificates.filter((c) => c.status === "VALID").length,
    EXPIRING: certificates.filter((c) => c.status === "EXPIRING").length,
    EXPIRED: certificates.filter((c) => c.status === "EXPIRED").length,
  };

  const handleUpload = async (file: File) => {
    try {
      // Convert file to base64 or blob if needed by backend, 
      // EXCEPT the current backend `CertificateCreate` expects `cert: bytes`.
      // Python `bytes` in Pydantic usually expects a base64 encoded string or similar if JSON.
      // However, `certificate_controller.py` uses `cert.cert` (bytes).
      // Let's assume we send JSON with base64 encoded string for `cert`.

      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        const base64Content = result.includes(',') ? result.split(',')[1] : "";

        // Calculate status/expiry logic if not done by backend
        // Backend expects: cert, certType, issuedBy, status, expiry, certName, issueDate, uploadDate, hidden

        const newCertData = {
          cert: base64Content, // sending base64
          certType: "Type", // You might want to ask user for this
          issuedBy: "Self Upload",
          status: "VALID",
          expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          certName: file.name.replace(/\.[^/.]+$/, ""),
          issueDate: new Date().toISOString(),
          uploadDate: new Date().toISOString(),
          hidden: false
        };

        await api.createCertificate(newCertData);
        toast.success(`${file.name} uploaded successfully!`);
        loadCertificates();
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error("Upload failed", error);
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
      console.error("Update failed", error);
      toast.error("Failed to update certificate");
    }
  };

  const handleDownload = (cert: Certificate) => {
    if (cert.fileUrl) {
      const link = document.createElement("a");
      link.href = cert.fileUrl;
      link.download = cert.fileName || "certificate.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading ${cert.name}...`);
    } else {
      toast.warning(`${cert.name} is a mock file (no real download).`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent selection:bg-orange-500 selection:text-white p-6 md:p-10 pb-40">
      <div className="mx-auto max-w-[1400px]">

        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-light tracking-tighter text-zinc-900 dark:text-white">
              Certificate<span className="font-bold">Vault</span>
            </h1>
            <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mt-2">
              Secure Certificate Storage & Compliance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase hover:opacity-90 transition-all shadow-md active:scale-95"
            >
              <Plus size={14} />
              <span>New Certificate</span>
            </button>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 flex flex-col h-[200px] group hover:shadow-lg transition-all">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-zinc-100/50 to-transparent dark:from-zinc-800/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-zinc-500">
                  <FileText size={20} strokeWidth={1.5} />
                </div>
                <span className="font-mono text-[11px] uppercase text-zinc-500 font-bold tracking-widest">Total</span>
              </div>
              <div className="mb-6">
                <h2 className="text-7xl font-light tracking-tighter text-zinc-900 dark:text-white">{stats.total}</h2>
              </div>
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Certificates on file</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200/50 dark:border-emerald-900/30 bg-white dark:bg-zinc-950 p-8 flex flex-col h-[200px] group hover:shadow-lg transition-all">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-emerald-100/30 to-transparent dark:from-emerald-800/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={20} strokeWidth={2} />
                </div>
                <span className="font-mono text-[11px] uppercase text-emerald-600 dark:text-emerald-400 font-bold tracking-widest">Valid</span>
              </div>
              <div className="mb-6">
                <h2 className="text-7xl font-light tracking-tighter text-emerald-600 dark:text-emerald-400">{stats.VALID}</h2>
              </div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Compliant & Current</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-orange-200/50 dark:border-orange-900/30 bg-white dark:bg-zinc-950 p-8 flex flex-col h-[200px] group hover:shadow-lg transition-all">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-orange-100/30 to-transparent dark:from-orange-800/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                  <Clock size={20} strokeWidth={2} />
                </div>
                <span className="font-mono text-[11px] uppercase text-orange-600 dark:text-orange-400 font-bold tracking-widest">Expiring</span>
              </div>
              <div className="mb-6">
                <h2 className="text-7xl font-light tracking-tighter text-orange-600 dark:text-orange-400">{stats.EXPIRING}</h2>
              </div>
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Within 90 days</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-red-200/50 dark:border-red-900/30 bg-white dark:bg-zinc-950 p-8 flex flex-col h-[200px] group hover:shadow-lg transition-all">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-red-100/30 to-transparent dark:from-red-800/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
                  <AlertTriangle size={20} strokeWidth={2} />
                </div>
                <span className="font-mono text-[11px] uppercase text-red-600 dark:text-red-400 font-bold tracking-widest">Expired</span>
              </div>
              <div className="mb-6">
                <h2 className="text-7xl font-light tracking-tighter text-red-600 dark:text-red-400">{stats.EXPIRED}</h2>
              </div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">Renewal required</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-colors placeholder:text-zinc-400"
            />
          </div>

          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {["all", "VALID", "EXPIRING", "EXPIRED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                  filter === f
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
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
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl transition-all"
                >

                  <div className={cn(
                    "absolute top-0 left-0 w-1 h-full transition-colors duration-300",
                    cert.status === 'EXPIRED' ? "bg-red-500" :
                      cert.status === 'EXPIRING' ? "bg-amber-500" : "bg-emerald-500"
                  )} />

                  <div className="relative flex flex-col md:grid md:grid-cols-[1fr_auto_auto] gap-6 p-6 items-start md:items-center pl-8">
                    <div className="flex items-center gap-4 w-full">
                      <div className={cn(
                        "h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-xl border transition-all shadow-sm",
                        cert.status === "EXPIRED"
                          ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400"
                          : cert.status === "EXPIRING"
                            ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400"
                            : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400"
                      )}>
                        <Award size={24} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-zinc-900 dark:text-white text-base truncate">
                            {cert.name}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-2 truncate">
                          <span>{cert.issuer}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                          <span>ID: {1000 + cert.id}</span>
                        </p>
                      </div>
                    </div>


                    <div className="flex items-center gap-6 min-w-[240px] justify-end">
                      <div className="flex flex-col items-end">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wide mb-1",
                          cert.status === 'EXPIRED' ? "text-red-500" :
                            cert.status === 'EXPIRING' ? "text-amber-500" :
                              "text-zinc-400"
                        )}>
                          {cert.status === 'EXPIRED' ? `Expired ${Math.abs(daysLeft)} days ago` :
                            cert.status === 'EXPIRING' ? `Expires in ${daysLeft} days` :
                              "Valid Certificate"
                          }
                        </span>

                        <div className={cn("flex items-baseline gap-1.5",
                          cert.status === 'EXPIRED' ? "opacity-60 grayscale" : ""
                        )}>
                          <span className="text-3xl font-bold font-mono tracking-tighter text-zinc-900 dark:text-white">{dateParts.day}</span>
                          <span className="text-sm font-bold uppercase text-zinc-500">{dateParts.month}</span>
                          <span className="text-sm font-light text-zinc-400">{dateParts.year}</span>
                        </div>
                      </div>

                      <div className="hidden md:block">
                        <StatusBadge status={cert.status} />
                      </div>
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="flex items-center justify-end gap-1 md:border-l md:border-zinc-200 md:dark:border-zinc-800 md:pl-6">
                      {/* Mobile Badge only */}
                      <div className="md:hidden mr-auto">
                        <StatusBadge status={cert.status} />
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedCert(cert);
                            setShowViewer(true);
                          }}
                          className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(cert)}
                          className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCert(cert);
                            setShowEditor(true);
                          }}
                          className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cert.id)}
                          className="p-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filteredCerts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <Search size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p>No certificates found matching your criteria.</p>
            </div>
          )}
        </div>
        <div
          onClick={() => setIsUploadOpen(true)}
          className="mt-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group"
        >
          <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud size={24} className="text-zinc-400 group-hover:text-orange-500" />
          </div>
          <h3 className="text-zinc-900 dark:text-white font-bold">Drop certificates to upload</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
            Support for PDF, JPG, and PNG. Drag and drop or click to browse.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {isUploadOpen && (
          <UploadModal
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            onUpload={handleUpload}
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
      <Toaster position="top-right" theme="system" richColors />
    </div>
  );
}