"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Ship, Search, Plus, Filter, Download, Trash2, Edit, 
  Calendar, Activity, Zap, X, Save, Gauge, Weight, Anchor,
  ChevronDown, Building2, User, AlertTriangle, Clock
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TiltCard } from "@/components/TiltCard";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner"; 

// --- MOCK USER PROFILE ---
const USER_PROFILE = {
  name: "Aditya R.",
  department: "ENGINE" as "ENGINE" | "DECK", 
  id: "IND-8842"
};

// --- DATA LISTS ---
const VESSEL_TYPES = [
  "Oil Tanker", "Gas Tanker", "Product Tanker", "Oil/Chem Tanker", "Chemical Tanker", "Bitumen Tanker",
  "Container Ship", "Bulk Carrier", "General Cargo", "Cruise Ship",
  "Ro-Ro", "FSO", "FPSO", "PSV", "Bunker barge"
];

const RANKS = {
  ENGINE: [
    "Chief Engineer", "Second Engineer", "Third Engineer", "Fourth Engineer", 
    "Junior Engineer", "TME", "ETO", "EO", "Tr EO", "Fitter", "Motorman", "Wiper", "Tr Wiper", "Tr Seaman"
  ],
  DECK: [
    "Master", "Chief Officer", "Second Officer", "Third Officer", "Fourth Officer", 
    "Cadet", "Bosun", "Chief Cook", "Pumpman", "Able Seaman", "Ordinary Seaman", "Tr Seaman", "GS"
  ]
};

// --- TYPES ---
interface SeaTimeRecord {
  id: number;
  vessel: string;
  type: string;
  company: string;
  dept: "ENGINE" | "DECK";
  rank: string;
  engine: string;
  bhp: number;
  torque: number;
  dwt: number;
  startDate: string;
  endDate: string;
  duration: { months: number; days: number };
}

const INITIAL_DATA: SeaTimeRecord[] = [
  { 
    id: 1, vessel: "Emma Maersk", type: "Container Ship", company: "Maersk Line", 
    dept: "ENGINE", rank: "Third Engineer", engine: "MAN B&W 14K98", bhp: 109000, torque: 7600, dwt: 156907,
    startDate: "2023-01-15", endDate: "2023-07-20", duration: { months: 6, days: 5 } 
  },
  { 
    id: 2, vessel: "Frontline Spirit", type: "Oil Tanker", company: "Frontline Ltd", 
    dept: "ENGINE", rank: "Fourth Engineer", engine: "WinGD X92", bhp: 82000, torque: 6800, dwt: 300000,
    startDate: "2022-02-10", endDate: "2022-08-10", duration: { months: 6, days: 0 } 
  },
];

// --- HELPER ---
const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return { months: 0, days: 0 };
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return { months: 0, days: 0 };
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return { months: Math.floor(diffDays / 30), days: diffDays % 30 };
};

// --- COMPONENT: DELETE CONFIRMATION ---
function DeleteConfirmModal({ isOpen, onClose, onConfirm }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3 text-red-500">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">Delete Record?</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">This action cannot be undone.</p>
          <div className="flex gap-2 w-full">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-[10px] uppercase hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">CANCEL</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold text-[10px] uppercase hover:bg-red-700 transition-colors">DELETE</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- COMPONENT: RECORD MODAL (unchanged logic, just compact styles) ---
function RecordModal({ isOpen, onClose, onSubmit, initialData }: any) {
  const [formData, setFormData] = useState({
    vessel: "", type: "", company: "", 
    dept: USER_PROFILE.department, 
    rank: "", engine: "", bhp: "", torque: "", dwt: "", startDate: "", endDate: ""
  });

  const liveDuration = useMemo(() => calculateDuration(formData.startDate, formData.endDate), [formData.startDate, formData.endDate]);
  const themeColor = formData.dept === 'ENGINE' ? "text-[#FF3300]" : "text-blue-500";
  const themeBg = formData.dept === 'ENGINE' ? "bg-[#FF3300]/5 border-[#FF3300]/20" : "bg-blue-500/5 border-blue-500/20";
  const themeRing = formData.dept === 'ENGINE' ? "stroke-[#FF3300]" : "stroke-blue-500";

  useEffect(() => {
    if (initialData) {
      setFormData({
        vessel: initialData.vessel, type: initialData.type, company: initialData.company,
        dept: initialData.dept, rank: initialData.rank, 
        engine: initialData.engine, bhp: initialData.bhp.toString(), 
        torque: initialData.torque?.toString() || "", dwt: initialData.dwt?.toString() || "",
        startDate: initialData.startDate, endDate: initialData.endDate
      });
    } else {
      setFormData({ vessel: "", type: "", company: "", dept: USER_PROFILE.department, rank: "", engine: "", bhp: "", torque: "", dwt: "", startDate: "", endDate: "" });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-3xl bg-white dark:bg-[#09090b] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
           <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Ship className="text-[#FF3300]" size={18} /> {initialData ? "Edit Entry" : "New Entry"}
              </h3>
           </div>
           <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={16} className="text-zinc-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <div className="space-y-3">
                    <div>
                       <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Vessel Name</label>
                       <input className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#FF3300] outline-none" value={formData.vessel} onChange={(e) => setFormData({...formData, vessel: e.target.value})} placeholder="e.g. ESSO ANTWERP" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div>
                          <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Type</label>
                          <div className="relative">
                             <select className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#FF3300]" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                <option value="" disabled>Select Type</option>
                                {VESSEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                          </div>
                       </div>
                       <div>
                          <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Company</label>
                          <input className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#FF3300]" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <div>
                       <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Main Engine</label>
                       <input className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#FF3300]" value={formData.engine} onChange={(e) => setFormData({...formData, engine: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       <div><label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">BHP</label><input type="number" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-2 text-xs font-medium outline-none focus:border-[#FF3300]" value={formData.bhp} onChange={(e) => setFormData({...formData, bhp: e.target.value})} /></div>
                       <div><label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Torque</label><input type="number" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-2 text-xs font-medium outline-none focus:border-[#FF3300]" value={formData.torque} onChange={(e) => setFormData({...formData, torque: e.target.value})} /></div>
                       <div><label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">DWT</label><input type="number" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-2 text-xs font-medium outline-none focus:border-[#FF3300]" value={formData.dwt} onChange={(e) => setFormData({...formData, dwt: e.target.value})} /></div>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 h-full flex flex-col">
                    <div>
                       <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Rank</label>
                       <select className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm font-bold outline-none focus:border-[#FF3300]" value={formData.rank} onChange={(e) => setFormData({...formData, rank: e.target.value})}>
                          <option value="" disabled>Select Rank</option>
                          {RANKS[formData.dept].map(r => <option key={r} value={r}>{r}</option>)}
                       </select>
                    </div>

                    <div className="flex-1 my-4 flex flex-col justify-center">
                        <div className={cn("relative rounded-xl p-4 border flex items-center justify-between overflow-hidden", themeBg)}>
                            <div className="relative z-10 flex items-center w-full justify-between">
                                <div>
                                    <span className="text-[8px] font-bold uppercase text-zinc-500 tracking-widest block mb-0.5">Time Onboard</span>
                                    <div className="flex items-baseline gap-4">
                                        <div className="flex flex-col"><span className={cn("text-2xl font-bold tabular-nums tracking-tighter leading-none", themeColor)}>{liveDuration.months}</span><span className="text-[8px] font-bold text-zinc-500 uppercase">Mos</span></div>
                                        <div className="w-px h-6 bg-zinc-500/20 self-center" />
                                        <div className="flex flex-col"><span className={cn("text-2xl font-bold tabular-nums tracking-tighter leading-none", themeColor)}>{liveDuration.days}</span><span className="text-[8px] font-bold text-zinc-500 uppercase">Days</span></div>
                                    </div>
                                </div>
                                <div className="h-8 w-8 relative flex items-center justify-center">
                                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-500/10" /><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="280" strokeDashoffset="200" strokeLinecap="round" className={themeRing} /></svg>
                                    <Clock size={14} className={themeColor} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div><label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Sign On</label><input type="date" className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#FF3300] text-zinc-600 dark:text-zinc-300" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} /></div>
                       <div><label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Sign Off</label><input type="date" className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#FF3300] text-zinc-600 dark:text-zinc-300" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} /></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
           <button onClick={onClose} className="px-4 py-2 text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Cancel</button>
           <button onClick={() => onSubmit(formData)} className="px-6 py-2 bg-[#FF3300] hover:bg-[#FF3300]/90 text-white rounded-lg text-[10px] font-bold uppercase shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"><Save size={14} /> Save</button>
        </div>
      </motion.div>
    </div>
  );
}

// --- MAIN PAGE ---
export default function SeaTimePage() {
  const [records, setRecords] = useState(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({ rank: '', type: '', company: '' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const stats = useMemo(() => {
    let totalMonths = 0, totalDays = 0, maxBhp = 0, maxTorque = 0;
    records.forEach(r => {
      totalMonths += r.duration.months; totalDays += r.duration.days;
      if (r.bhp > maxBhp) maxBhp = r.bhp;
      if (r.torque > maxTorque) maxTorque = r.torque;
    });
    totalMonths += Math.floor(totalDays / 30);
    return {
      totalTime: `${Math.floor(totalMonths / 12)}y ${totalMonths % 12}m`,
      vesselCount: records.length,
      maxPower: (maxBhp / 1000).toFixed(0) + "k",
      maxTorque: (maxTorque / 1000).toFixed(1) + "k"
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = r.vessel.toLowerCase().includes(searchTerm.toLowerCase()) || r.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRank = filters.rank ? r.rank === filters.rank : true;
      const matchType = filters.type ? r.type === filters.type : true;
      const matchCompany = filters.company ? r.company === filters.company : true;
      return matchSearch && matchRank && matchType && matchCompany;
    });
  }, [records, searchTerm, filters]);

  const handleSave = (data: any) => {
    const duration = calculateDuration(data.startDate, data.endDate);
    const newRecord = { 
      ...data, duration, 
      bhp: Number(data.bhp), torque: Number(data.torque), dwt: Number(data.dwt),
      id: editingId || Date.now() 
    };
    if (editingId) {
      setRecords(records.map(r => r.id === editingId ? newRecord : r));
      toast.success("Log entry updated successfully");
    } else {
      setRecords([...records, newRecord]);
      toast.success("New sea service record added");
    }
    setIsModalOpen(false); setEditingId(null);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setRecords(records.filter(r => r.id !== deleteConfirmId));
      toast.error("Record deleted permanently");
      setDeleteConfirmId(null);
    }
  };

  const handleExport = () => {
    const headers = ["Vessel", "Type", "Company", "Dept", "Rank", "Engine", "BHP", "Torque", "DWT", "Start", "End"];
    const rows = records.map(r => [r.vessel, r.type, r.company, r.dept, r.rank, r.engine, r.bhp, r.torque, r.dwt, r.startDate, r.endDate]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent); link.download = "sea_time.csv"; link.click();
    toast.success("Export started");
  };

  const uniqueRanks = Array.from(new Set(records.map(r => r.rank)));
  const uniqueTypes = Array.from(new Set(records.map(r => r.type)));
  const uniqueCompanies = Array.from(new Set(records.map(r => r.company)));

  return (
    // ✅ SCALED: Transparent bg, tight layout
    <div className="w-full p-6 md:p-8 pb-40 bg-transparent transition-colors duration-500">
      <Toaster position="top-center" theme="dark" richColors />
      <div className="mx-auto max-w-[1400px]">
        {/* HEADER (COMPACT) */}
        <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h1 className="text-3xl font-light tracking-tighter text-zinc-900 dark:text-white">Service<span className="font-bold text-[#FF3300]">Log</span></h1>
            <p className="font-mono text-[10px] text-zinc-400 uppercase mt-1">Official Sea Service Record</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-2 rounded-lg font-mono text-[10px] font-bold uppercase hover:opacity-90 shadow-lg"><Plus size={12} /><span>Add Record</span></button>
             <ThemeToggle />
          </div>
        </header>

        {/* --- STATS GRID (COMPACT: 110px Height) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
           
           {/* CARD 1 */}
           <TiltCard className="h-[110px] relative overflow-hidden group border-none bg-white dark:bg-[#09090b]">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FF3300] shadow-[0_0_15px_#FF3300] z-20" />
              <div className="p-4 h-full flex flex-col justify-between relative z-10">
                 <div><p className="font-mono text-[8px] uppercase text-[#FF3300] mb-0.5 font-bold tracking-widest">Total Sea Service</p><div className="text-3xl font-light text-zinc-900 dark:text-white tracking-tighter leading-none">{stats.totalTime}</div></div>
                 <p className="text-[9px] text-zinc-500 font-medium">Verified & Logged</p>
              </div>
              <div className="absolute right-[-10px] bottom-[-10px] opacity-10 dark:opacity-20 pointer-events-none transform rotate-[-10deg]">
                 <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#FF3300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3" /><line x1="12" y1="22" x2="12" y2="8" /><path d="M5 12H2a10 10 0 0 0 20 0h-3" /></svg>
              </div>
           </TiltCard>
           
           {/* CARD 2 */}
           <TiltCard className="h-[110px] relative overflow-hidden border-none bg-white dark:bg-[#09090b]">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 shadow-[0_0_15px_#3b82f6] z-20" />
              <div className="p-4 h-full flex flex-col justify-between relative z-10">
                 <div><p className="font-mono text-[8px] uppercase text-blue-500 mb-0.5 font-bold tracking-widest">Fleet Experience</p><div className="text-3xl font-light text-zinc-900 dark:text-white tracking-tighter leading-none">{stats.vesselCount}</div></div>
                 <p className="text-[9px] text-zinc-500 font-medium">Unique Vessels</p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 dark:opacity-30 pointer-events-none">
                 <Ship size={50} strokeWidth={1} className="text-blue-500 fill-blue-500/10" />
              </div>
           </TiltCard>
           
           {/* CARD 3 */}
           <TiltCard className="h-[110px] relative overflow-hidden border-none bg-white dark:bg-[#09090b]">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 shadow-[0_0_15px_#ef4444] z-20" />
              <div className="p-4 h-full flex flex-col justify-between relative z-10">
                 <div><p className="font-mono text-[8px] uppercase text-red-500 mb-0.5 font-bold tracking-widest flex items-center gap-1">Max Propulsion <Zap size={8} fill="currentColor" /></p><div className="text-3xl font-light text-zinc-900 dark:text-white tracking-tighter leading-none">{stats.maxPower}<span className="text-lg text-zinc-400 ml-1 font-thin">BHP</span></div></div>
                 <p className="text-[9px] text-zinc-500 font-medium">Highest Capacity Engine</p>
              </div>
              <div className="absolute right-[-15px] bottom-[-5px] opacity-15 dark:opacity-25 pointer-events-none">
               <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                  <path d="M3 6h18v12H3z" className="opacity-50" />
                  <path d="M5 4h2v2H5zm4 0h2v2H9zm4 0h2v2h-2zm4 0h2v2h-2z" />
                  <rect x="2" y="8" width="20" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
                  <line x1="6" y1="8" x2="6" y2="16" stroke="currentColor" strokeWidth="1" />
                  <line x1="10" y1="8" x2="10" y2="16" stroke="currentColor" strokeWidth="1" />
                  <line x1="14" y1="8" x2="14" y2="16" stroke="currentColor" strokeWidth="1" />
                  <line x1="18" y1="8" x2="18" y2="16" stroke="currentColor" strokeWidth="1" />
               </svg>

              </div>
           </TiltCard>
           
           {/* CARD 4 */}
           <TiltCard className="h-[110px] relative overflow-hidden border-none bg-white dark:bg-[#09090b]">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 shadow-[0_0_15px_#10b981] z-20" />
              <div className="p-4 h-full flex flex-col justify-between relative z-10">
                 <div><p className="font-mono text-[8px] uppercase text-emerald-500 mb-0.5 font-bold tracking-widest flex items-center gap-1">Peak Torque</p><div className="text-3xl font-light text-zinc-900 dark:text-white tracking-tighter leading-none">{stats.maxTorque}<span className="text-lg text-zinc-400 ml-1 font-thin">kNm</span></div></div>
                 <p className="text-[9px] text-zinc-500 font-medium">Max Shaft Output</p>
              </div>
              <div className="absolute right-3 bottom-3"><Gauge size={45} strokeWidth={1.5} className="text-emerald-500 opacity-40 dark:opacity-60" /></div>
           </TiltCard>
        </div>

        {/* CONTROLS (COMPACT) */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
           <div className="relative flex-1 group"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={12} /><input type="text" placeholder="Search by vessel or company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 pl-9 pr-3 text-[10px] outline-none focus:border-[#FF3300]" /></div>
           <div className="relative">
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 transition-colors"><Filter size={12} /> <span className="text-[9px] font-bold uppercase">Filter</span> {(filters.rank || filters.type || filters.company) && <span className="w-1.5 h-1.5 rounded-full bg-[#FF3300]" />}</button>
              <AnimatePresence>{isFilterOpen && (<motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 p-3 space-y-3">
                 <div><label className="text-[9px] font-bold text-zinc-400 uppercase mb-1.5 block">By Rank</label><select className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-[10px] outline-none" value={filters.rank} onChange={(e) => setFilters({...filters, rank: e.target.value})}><option value="">All Ranks</option>{uniqueRanks.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                 <div><label className="text-[9px] font-bold text-zinc-400 uppercase mb-1.5 block">By Type</label><select className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-[10px] outline-none" value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}><option value="">All Types</option>{uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                 <div><label className="text-[9px] font-bold text-zinc-400 uppercase mb-1.5 block">By Company</label><select className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-[10px] outline-none" value={filters.company} onChange={(e) => setFilters({...filters, company: e.target.value})}><option value="">All Companies</option>{uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                 <button onClick={() => { setFilters({ rank: '', type: '', company: '' }); setIsFilterOpen(false); }} className="w-full py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">Clear Filters</button>
              </motion.div>)}</AnimatePresence>
           </div>
           <button onClick={handleExport} className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2"><Download size={12} /><span className="text-[9px] font-bold uppercase">Export</span></button>
        </div>

        {/* REDESIGNED RECORD LIST (COMPACT: Tighter Padding & Fonts) */}
        <div className="space-y-2">
           <AnimatePresence>
             {filteredRecords.map((record) => (
               <motion.div key={record.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-12 gap-0 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all group overflow-hidden">
                  
                  {/* LEFT: VESSEL CONTEXT (Cols 1-5) */}
                  <div className="md:col-span-5 p-3 flex items-center gap-3 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800 relative">
                     <div className={cn("absolute left-0 top-0 bottom-0 w-1", record.dept === "ENGINE" ? "bg-orange-500" : "bg-blue-500")} />
                     <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-400 group-hover:text-[#FF3300]"><Ship size={16} /></div>
                     <div>
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-tight">{record.vessel}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1"><Building2 size={8} /> {record.company}</span>
                        </div>
                        <div className="mt-1 flex gap-1.5">
                           <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase">{record.type}</span>
                           <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center gap-1"><Weight size={8} /> {record.dwt?.toLocaleString()} DWT</span>
                        </div>
                     </div>
                  </div>

                  {/* MIDDLE: RANK & SERVICE (Cols 6-9) */}
                  <div className="md:col-span-4 p-3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800">
                     <div className="mb-1">
                        <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border mb-0.5 inline-block", record.dept === "ENGINE" ? "text-orange-500 border-orange-500/30" : "text-blue-500 border-blue-500/30")}>
                           {record.dept} DEPT
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{record.rank}</h4>
                     </div>
                     <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500">
                        <Calendar size={9} />
                        <span>{record.startDate}</span>
                        <span className="text-zinc-300">→</span>
                        <span>{record.endDate}</span>
                     </div>
                  </div>

                  {/* RIGHT: TECH SPECS (Cols 10-11) */}
                  <div className="md:col-span-2 p-3 flex flex-col justify-center">
                     <p className="text-[8px] uppercase text-zinc-400 font-bold mb-0.5">Main Engine</p>
                     <p className="text-[9px] font-bold text-zinc-900 dark:text-white truncate mb-1" title={record.engine}>{record.engine}</p>
                     <div className="grid grid-cols-2 gap-1">
                        <div><span className="text-[8px] text-zinc-500 block uppercase">Power</span><span className="text-[9px] font-mono font-bold text-[#FF3300]">{(record.bhp / 1000).toFixed(0)}k</span></div>
                        <div><span className="text-[8px] text-zinc-500 block uppercase">Torque</span><span className="text-[9px] font-mono font-bold text-emerald-500">{(record.torque / 1000).toFixed(1)}k</span></div>
                     </div>
                  </div>

                  {/* FAR RIGHT: ACTIONS (Col 12) */}
                  <div className="md:col-span-1 p-2 flex md:flex-col items-center justify-center gap-1 bg-zinc-50/50 dark:bg-zinc-900/30 border-l border-zinc-100 dark:border-zinc-800">
                     <button onClick={() => { setEditingId(record.id); setIsModalOpen(true); }} className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors" title="Edit"><Edit size={12} /></button>
                     <button onClick={() => setDeleteConfirmId(record.id)} className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 size={12} /></button>
                  </div>

               </motion.div>
             ))}
           </AnimatePresence>
        </div>
        
        <AnimatePresence>{isModalOpen && <RecordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSave} initialData={editingId ? records.find(r => r.id === editingId) : null} />}</AnimatePresence>
        <AnimatePresence>{deleteConfirmId && <DeleteConfirmModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={confirmDelete} />}</AnimatePresence>
      </div>
    </div>
  );
}