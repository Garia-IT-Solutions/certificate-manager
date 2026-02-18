"use client";

import { useState, useMemo, useEffect, useRef, useId } from "react";
import { api } from "@/app/services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
   Ship, Search, Plus, Filter, Download, Trash2, Edit,
   Calendar, Activity, Zap, X, Save, Gauge, Weight, Anchor,
   ChevronDown, Building2, User, AlertTriangle, Clock, Check, ChevronUp, Flag
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TiltCard } from "@/components/TiltCard";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

// User profile is fetched dynamically from the API

const VESSEL_TYPES = [
   "Oil Tanker", "Gas Tanker", "Product Tanker", "Oil/Chem Tanker", "Chemical Tanker", "Bitumen Tanker",
   "VLCC", "ULCC",
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

const FLAGS = [
   "Panama", "Liberia", "Marshall Islands", "Singapore", "Malta", "Bahamas", "China", "Greece", "Japan",
   "United States", "Cyprus", "Norway", "United Kingdom", "Indonesia", "Germany", "South Korea",
   "Denmark", "Italy", "India", "Philippines", "Vietnam", "Saudi Arabia", "Turkey", "Russia", "Netherlands",
   "Malaysia", "France", "Spain", "Belgium", "Sweden", "Brazil", "Canada", "Australia", "Thailand"
].sort();

interface SeaTimeEntry {
   id: number;
   imo: string;
   offNo: string;
   flag: string;
   vesselName: string;
   type: string;
   company: string;
   dept: "ENGINE" | "DECK";
   rank: string;
   mainEngine: string;
   bhp: number;
   kw: number;
   dwt: number;
   signOn: string;
   signOff: string;
   uploadDate: string;
   duration: { years: number; months: number; days: number };
}

const calculateDuration = (start: string, end: string) => {
   if (!start || !end) return { years: 0, months: 0, days: 0 };
   const startDate = new Date(start);
   const endDate = new Date(end);
   if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return { years: 0, months: 0, days: 0 };
   const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
   const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
   const years = Math.floor(totalDays / 365);
   const remainingDaysAfterYears = totalDays % 365;
   const months = Math.floor(remainingDaysAfterYears / 30);
   const days = remainingDaysAfterYears % 30;
   return { years, months, days };
};

const formatDuration = (duration: { years: number; months: number; days: number }) => {
   const parts: string[] = [];
   if (duration.years > 0) parts.push(`${duration.years}yr${duration.years > 1 ? 's' : ''}`);
   if (duration.months > 0) parts.push(`${duration.months}m`);
   if (duration.days > 0 || parts.length === 0) parts.push(`${duration.days}d`);
   return parts.join(' ');
};

function SearchableDropdown({
   options,
   value,
   onChange,
   placeholder,
   className,
   allowCustom = false
}: {
   options: string[],
   value: string,
   onChange: (val: string) => void,
   placeholder?: string,
   className?: string,
   allowCustom?: boolean
}) {
   const [isOpen, setIsOpen] = useState(false);
   const [searchTerm, setSearchTerm] = useState("");
   const wrapperRef = useRef<HTMLDivElement>(null);

   const filteredOptions = useMemo(() => {
      return options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
   }, [options, searchTerm]);

   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsOpen(false);
            if (!allowCustom && !options.includes(searchTerm) && searchTerm !== "") {
               setSearchTerm(value);
            }
         }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, [wrapperRef, allowCustom, options, searchTerm, value]);

   useEffect(() => {
      setSearchTerm(value);
   }, [value]);

   const handleSelect = (option: string) => {
      onChange(option);
      setSearchTerm(option);
      setIsOpen(false);
   };

   return (
      <div ref={wrapperRef} className={cn("relative", className)}>
         <div
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
               "flex items-center justify-between w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium cursor-text transition-all",
               isOpen ? "border-[#FF3300] ring-1 ring-[#FF3300]/20" : "hover:border-zinc-300 dark:hover:border-zinc-700"
            )}
         >
            <input
               type="text"
               className="bg-transparent outline-none w-full text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
               placeholder={placeholder}
               value={searchTerm}
               onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (!isOpen) setIsOpen(true);
                  if (allowCustom) onChange(e.target.value);
               }}
            />
            <ChevronDown size={14} className={cn("text-zinc-400 transition-transform", isOpen && "rotate-180 text-[#FF3300]")} />
         </div>

         <AnimatePresence>
            {isOpen && (
               <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute z-50 w-full mt-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
               >
                  {filteredOptions.length > 0 ? (
                     filteredOptions.map((opt) => (
                        <button
                           key={opt}
                           onClick={() => handleSelect(opt)}
                           className={cn(
                              "w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between group",
                              value === opt
                                 ? "bg-[#FF3300]/10 text-[#FF3300]"
                                 : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                           )}
                        >
                           <span>{opt}</span>
                           {value === opt && <Check size={12} className="text-[#FF3300]" />}
                        </button>
                     ))
                  ) : (
                     <div className="px-3 py-3 text-[10px] text-zinc-400 text-center italic">
                        {allowCustom ? "Custom value active" : "No matches found"}
                     </div>
                  )}
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}

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

function RecordModal({ isOpen, onClose, onSubmit, initialData, userDepartment }: any) {
   const [formData, setFormData] = useState({
      imo: "", offNo: "", flag: "", vesselName: "", type: "", company: "",
      dept: userDepartment || "ENGINE",
      rank: "", mainEngine: "", bhp: "", kw: "", dwt: "", signOn: "", signOff: ""
   });

   const liveDuration = useMemo(() => calculateDuration(formData.signOn, formData.signOff), [formData.signOn, formData.signOff]);
   const themeColor = formData.dept === 'ENGINE' ? "text-[#FF3300]" : "text-blue-500";
   const themeBg = formData.dept === 'ENGINE' ? "bg-[#FF3300]/5 border-[#FF3300]/20" : "bg-blue-500/5 border-blue-500/20";
   const themeRing = formData.dept === 'ENGINE' ? "stroke-[#FF3300]" : "stroke-blue-500";

   useEffect(() => {
      if (initialData) {
         setFormData({
            imo: initialData.imo, offNo: initialData.offNo, flag: initialData.flag,
            vesselName: initialData.vesselName, type: initialData.type, company: initialData.company,
            dept: initialData.dept, rank: initialData.rank,
            mainEngine: initialData.mainEngine, bhp: initialData.bhp.toString(),
            kw: initialData.kw?.toString() || "", dwt: initialData.dwt?.toString() || "",
            signOn: initialData.signOn, signOff: initialData.signOff
         });
      } else {
         setFormData({ imo: "", offNo: "", flag: "", vesselName: "", type: "", company: "", dept: userDepartment || "ENGINE", rank: "", mainEngine: "", bhp: "", kw: "", dwt: "", signOn: "", signOff: "" });
      }
   }, [initialData, isOpen]);

   // Auto-convert BHP to kW
   useEffect(() => {
      if (formData.bhp && !initialData) { // Only auto-convert if not editing or explicitly changed? Actually user said "On entering the bhp it should automatically convert"
         const bhpVal = parseFloat(formData.bhp);
         if (!isNaN(bhpVal)) {
            const kwVal = Math.round(bhpVal * 0.7457);
            setFormData(prev => ({ ...prev, kw: kwVal.toString() }));
         }
      }
   }, [formData.bhp]);

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

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <div className="space-y-3">
                        <div>
                           <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Vessel Name</label>
                           <input className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#FF3300] outline-none" value={formData.vesselName} onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })} placeholder="e.g. ESSO ANTWERP" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Type</label>
                              <SearchableDropdown
                                 options={VESSEL_TYPES}
                                 value={formData.type}
                                 onChange={(val) => setFormData({ ...formData, type: val })}
                                 placeholder="Select Type"
                              />
                           </div>
                           <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Company</label>
                              <input className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#FF3300]" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                           </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                           <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">IMO</label>
                              <input type="text" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-2 text-xs font-medium outline-none focus:border-[#FF3300]" value={formData.imo} onChange={(e) => setFormData({ ...formData, imo: e.target.value })} />
                           </div>
                           <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Official No.</label>
                              <input type="text" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-2 text-xs font-medium outline-none focus:border-[#FF3300]" value={formData.offNo} onChange={(e) => setFormData({ ...formData, offNo: e.target.value })} />
                           </div>
                           <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Flag</label>
                              <SearchableDropdown
                                 options={FLAGS}
                                 value={formData.flag}
                                 onChange={(val) => setFormData({ ...formData, flag: val })}
                                 placeholder="Search Flag"
                                 allowCustom={true}
                              />
                           </div>
                        </div>
                     </div>
                     {formData.dept === "ENGINE" && (
                        <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                           <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Main Engine</label>
                              <input className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#FF3300]" value={formData.mainEngine} onChange={(e) => setFormData({ ...formData, mainEngine: e.target.value })} />
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                              <div><label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Propulsion (kBHP)</label><input type="number" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-2 text-xs font-medium outline-none focus:border-[#FF3300]" value={formData.bhp ? parseFloat(formData.bhp) / 1000 : ""} onChange={(e) => setFormData({ ...formData, bhp: (parseFloat(e.target.value) * 1000).toString() })} /></div>
                              <div><label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Power (W)</label><input type="number" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-2 text-xs font-medium outline-none focus:border-[#FF3300]" value={formData.kw} onChange={(e) => setFormData({ ...formData, kw: e.target.value })} /></div>
                           </div>
                        </div>
                     )}
                     <div className={formData.dept === "ENGINE" ? "" : "pt-3 border-t border-zinc-200 dark:border-zinc-800"}>
                        <div><label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">DWT</label><input type="number" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-2 text-xs font-medium outline-none focus:border-[#FF3300]" value={formData.dwt} onChange={(e) => setFormData({ ...formData, dwt: e.target.value })} /></div>
                     </div>
                  </div>

                  <div className="h-full flex flex-col justify-center">
                     <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-6">
                        <div>
                           <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Rank</label>
                           <SearchableDropdown
                              options={(RANKS as Record<string, string[]>)[formData.dept] || RANKS.ENGINE}
                              value={formData.rank}
                              onChange={(val) => setFormData({ ...formData, rank: val })}
                              placeholder="Select Rank"
                              className="bg-white dark:bg-black"
                           />
                        </div>

                        <div className="flex flex-col justify-center">
                           <div className={cn("relative rounded-xl p-4 border flex items-center justify-between overflow-hidden", themeBg)}>
                              <div className="relative z-10 flex items-center w-full justify-between">
                                 <div>
                                    <span className="text-[8px] font-bold uppercase text-zinc-500 tracking-widest block mb-0.5">Time Onboard</span>
                                    <div className="flex items-baseline gap-4">
                                       {liveDuration.years > 0 && (<><div className="flex flex-col"><span className={cn("text-2xl font-bold tabular-nums tracking-tighter leading-none", themeColor)}>{liveDuration.years}</span><span className="text-[8px] font-bold text-zinc-500 uppercase">Yrs</span></div><div className="w-px h-6 bg-zinc-500/20 self-center" /></>)}
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
                           <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Sign On</label>
                              <DatePicker
                                 date={formData.signOn ? new Date(formData.signOn) : undefined}
                                 setDate={(date) => setFormData({ ...formData, signOn: date ? date.toLocaleDateString('en-CA') : "" })}
                                 placeholder="Sign On Date"
                                 className="bg-white dark:bg-black w-full"
                              />
                           </div>
                           <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1 block">Sign Off</label>
                              <DatePicker
                                 date={formData.signOff ? new Date(formData.signOff) : undefined}
                                 setDate={(date) => setFormData({ ...formData, signOff: date ? date.toLocaleDateString('en-CA') : "" })}
                                 placeholder="Sign Off Date"
                                 className="bg-white dark:bg-black w-full"
                              />
                           </div>
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

export default function SeaTimePage() {
   const [entries, setEntries] = useState<SeaTimeEntry[]>([]);
   const [userDepartment, setUserDepartment] = useState<"ENGINE" | "DECK">("ENGINE");

   useEffect(() => {
      loadEntries();
      loadUserProfile();
   }, []);

   const loadUserProfile = async () => {
      try {
         const profile = await api.getProfile();
         if (profile.department) {
            setUserDepartment(profile.department as "ENGINE" | "DECK");
         }
      } catch (error) {
         console.error("Failed to load profile for department", error);
      }
   };

   const loadEntries = async () => {
      try {
         const data = await api.getSeaTimeLogs();
         const mapped = data.map((d: any) => ({
            id: d.id,
            imo: d.imo,
            offNo: d.offNo,
            flag: d.flag,
            vesselName: d.vesselName,
            type: d.type,
            company: d.company,
            dept: d.dept || userDepartment,
            mainEngine: d.mainEngine,
            bhp: d.bhp,
            kw: d.kw || (d.bhp ? Math.round(d.bhp * 0.7457) : 0), // Fallback if kw missing
            dwt: d.dwt,
            rank: d.rank,
            signOn: d.signOn ? d.signOn.split("T")[0] : "",
            signOff: d.signOff ? d.signOff.split("T")[0] : "",
            uploadDate: d.uploadDate ? d.uploadDate.split("T")[0] : new Date().toISOString().split("T")[0],
            duration: calculateDuration(d.signOn ? d.signOn.split("T")[0] : "", d.signOff ? d.signOff.split("T")[0] : "")
         }));
         setEntries(mapped);
      } catch (error) {
         toast.error("Failed to load sea time logs", { id: "load-sea-time-error" });
      }
   };

   const [searchTerm, setSearchTerm] = useState("");
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingId, setEditingId] = useState<number | null>(null);
   const [filters, setFilters] = useState({ rank: '', type: '', company: '' });
   const [isFilterOpen, setIsFilterOpen] = useState(false);
   const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

   const stats = useMemo(() => {
      let totalDays = 0, maxBhp = 0, maxKw = 0;
      entries.forEach(r => {
         totalDays += (r.duration.years * 365) + (r.duration.months * 30) + r.duration.days;
         if (r.bhp > maxBhp) maxBhp = r.bhp;
         if (r.kw > maxKw) maxKw = r.kw;
      });
      const totalYears = Math.floor(totalDays / 365);
      const remainingDays = totalDays % 365;
      const totalMonths = Math.floor(remainingDays / 30);
      return {
         totalTime: `${totalYears}y ${totalMonths}m`,
         vesselCount: entries.length,
         maxPower: (maxBhp / 1000).toFixed(0) + "k",
         maxKw: (maxKw / 1000).toFixed(1) + "k"
      };
   }, [entries]);

   const filteredRecords = useMemo(() => {
      let filtered = entries.filter(r => {
         const matchSearch = r.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) || r.company.toLowerCase().includes(searchTerm.toLowerCase());
         const matchRank = filters.rank ? r.rank === filters.rank : true;
         const matchType = filters.type ? r.type === filters.type : true;
         const matchCompany = filters.company ? r.company === filters.company : true;
         return matchSearch && matchRank && matchType && matchCompany;
      });

      return filtered.sort((a, b) => {
         const dateA = new Date(a.signOn).getTime();
         const dateB = new Date(b.signOn).getTime();
         return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
   }, [entries, searchTerm, filters, sortOrder]);

   const handleSave = async (data: any) => {
      try {
         const entryToSave = {
            imo: data.imo,
            offNo: data.offNo,
            flag: data.flag,
            vesselName: data.vesselName,
            type: data.type,
            company: data.company,
            dept: data.dept,
            rank: data.rank,
            mainEngine: data.mainEngine,
            bhp: Number(data.bhp),
            kw: Number(data.kw),
            dwt: Number(data.dwt),
            signOn: data.signOn,
            signOff: data.signOff,
            uploadDate: new Date().toISOString().split("T")[0]
         };


         if (editingId) {
            await api.updateSeaTimeLog(editingId, entryToSave);
            toast.success("Sea service record updated");
         } else {
            await api.createSeaTimeLog(entryToSave);
            toast.success("New sea service record added");
         }
         loadEntries();
      } catch (error) {
         toast.error("Failed to save sea time log");
      } finally {
         setIsModalOpen(false);
         setEditingId(null);
      }
   };

   const confirmDelete = async () => {
      if (deleteConfirmId) {
         try {
            await api.deleteSeaTimeLog(deleteConfirmId);
            toast.error("Record deleted permanently");
            loadEntries();
         } catch (error) {
            toast.error("Failed to delete sea time log");
         } finally {
            setDeleteConfirmId(null);
         }
      }
   };

   const handleExport = () => {
      const headers = ["Vessel", "Type", "Company", "Dept", "Rank", "Engine", "BHP", "KW", "DWT", "Start", "End"];
      const rows = entries.map(r => [r.vesselName, r.type, r.company, r.dept, r.rank, r.mainEngine, r.bhp, r.kw, r.dwt, r.signOn, r.signOff]);
      const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csvContent); link.download = "sea_time.csv"; link.click();
      toast.success("Export started");
   };

   const uniqueRanks = Array.from(new Set(entries.map(r => r.rank)));
   const uniqueTypes = Array.from(new Set(entries.map(r => r.type)));
   const uniqueCompanies = Array.from(new Set(entries.map(r => r.company)));

   return (
      <div className="min-h-screen w-full bg-transparent pb-32 transition-colors duration-500">

         <main className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 md:gap-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
               <div className="min-w-0 flex-1">
                  <h1 className="text-3xl sm:text-4xl font-light tracking-tighter text-zinc-900 dark:text-white pb-1">Service<span className="font-bold text-[#FF3300]">Log</span></h1>
                  <p className="font-mono text-[10px] text-zinc-400 uppercase mt-1 truncate">Official Sea Service Record</p>
               </div>
               <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-2 rounded-lg font-mono text-[10px] font-bold uppercase hover:opacity-90 shadow-lg"><Plus size={12} /><span>Add Record</span></button>
                  <ThemeToggle />
               </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
               <TiltCard className="h-[110px] relative overflow-hidden group border-none bg-white dark:bg-[#09090b]">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FF3300] shadow-[0_0_15px_#FF3300] z-20" />
                  <div className="p-4 h-full flex flex-col justify-between relative z-10">
                     <div><p className="font-mono text-[8px] uppercase text-[#FF3300] mb-0.5 font-bold tracking-widest">Total Sea Service</p><div className="text-3xl font-light text-zinc-900 dark:text-white tracking-tighter leading-none">{stats.totalTime}</div></div>
                     <p className="text-[9px] text-zinc-500 font-medium">Verified & Logged</p>
                  </div>
               </TiltCard>
               <TiltCard className="h-[110px] relative overflow-hidden border-none bg-white dark:bg-[#09090b]">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 shadow-[0_0_15px_#3b82f6] z-20" />
                  <div className="p-4 h-full flex flex-col justify-between relative z-10">
                     <div><p className="font-mono text-[8px] uppercase text-blue-500 mb-0.5 font-bold tracking-widest">Fleet Experience</p><div className="text-3xl font-light text-zinc-900 dark:text-white tracking-tighter leading-none">{stats.vesselCount}</div></div>
                     <p className="text-[9px] text-zinc-500 font-medium">Unique Vessels</p>
                  </div>
               </TiltCard>
               <TiltCard className="h-[110px] relative overflow-hidden border-none bg-white dark:bg-[#09090b]">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 shadow-[0_0_15px_#ef4444] z-20" />
                  <div className="p-4 h-full flex flex-col justify-between relative z-10">
                     <div><p className="font-mono text-[8px] uppercase text-red-500 mb-0.5 font-bold tracking-widest flex items-center gap-1">Max Propulsion <Zap size={8} fill="currentColor" /></p><div className="text-3xl font-light text-zinc-900 dark:text-white tracking-tighter leading-none">{stats.maxPower}<span className="text-lg text-zinc-400 ml-1 font-thin">kBHP</span></div></div>
                     <p className="text-[9px] text-zinc-500 font-medium">Highest Capacity Engine</p>
                  </div>
               </TiltCard>
               <TiltCard className="h-[110px] relative overflow-hidden border-none bg-white dark:bg-[#09090b]">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 shadow-[0_0_15px_#10b981] z-20" />
                  <div className="p-4 h-full flex flex-col justify-between relative z-10">
                     <div><p className="font-mono text-[8px] uppercase text-emerald-500 mb-0.5 font-bold tracking-widest flex items-center gap-1">AVG Power</p><div className="text-3xl font-light text-zinc-900 dark:text-white tracking-tighter leading-none">{stats.maxKw}<span className="text-lg text-zinc-400 ml-1 font-thin">kW</span></div></div>
                     <p className="text-[9px] text-zinc-500 font-medium">Max Kilowatts</p>
                  </div>
               </TiltCard>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
               <div className="relative flex-1 group min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={12} />
                  <input type="text" placeholder="Search by vessel or company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#FF3300]" />
               </div>
               <div className="relative shrink-0 flex gap-2 sm:gap-3">
                  <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-2 transition-colors">
                     {sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                     <span className="text-[10px] font-bold uppercase">Date</span>
                  </button>
                  <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-2 transition-colors">
                     <Filter size={12} /> <span className="text-[10px] font-bold uppercase">Filter</span> {(filters.rank || filters.type || filters.company) && <span className="w-1.5 h-1.5 rounded-full bg-[#FF3300]" />}
                  </button>
                  <AnimatePresence>
                     {isFilterOpen && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 p-4 space-y-4">
                           <div><label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">By Rank</label><select className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none" value={filters.rank} onChange={(e) => setFilters({ ...filters, rank: e.target.value })}><option value="">All Ranks</option>{uniqueRanks.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                           <div><label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">By Type</label><select className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}><option value="">All Types</option>{uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                           <div><label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">By Company</label><select className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none" value={filters.company} onChange={(e) => setFilters({ ...filters, company: e.target.value })}><option value="">All Companies</option>{uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                           <button onClick={() => { setFilters({ rank: '', type: '', company: '' }); setIsFilterOpen(false); }} className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Clear Filters</button>
                        </motion.div>
                     )}
                  </AnimatePresence>
                  <button onClick={handleExport} className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-2 transition-colors">
                     <Download size={12} /><span className="text-[10px] font-bold uppercase">Export</span>
                  </button>
               </div>
            </div>

            <div className="space-y-3 w-full">
               <AnimatePresence>
                  {filteredRecords.map((record) => (
                     <motion.div key={record.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col md:flex-row md:items-stretch bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all group overflow-hidden w-full">
                        <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800 relative w-full">
                           <div className={cn("absolute left-0 top-0 bottom-0 w-1", record.dept === "ENGINE" ? "bg-orange-500" : "bg-blue-500")} />

                           <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 group-hover:text-[#FF3300] shrink-0 transition-colors">
                                 <Ship size={20} />
                              </div>
                              <div className="min-w-0 flex-1">
                                 <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 leading-tight truncate">{record.vesselName}</h3>
                                 <div className="flex items-center gap-2 mt-1 truncate">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1 shrink-0"><Building2 size={10} /> {record.company}</span>
                                 </div>
                                 <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="px-2 py-1 rounded-md text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase">{record.type}</span>
                                    <span className="px-2 py-1 rounded-md text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center gap-1"><Weight size={10} /> {record.dwt?.toLocaleString()} DWT</span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col justify-center min-w-[140px] shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/50">
                              <div className="mb-2">
                                 <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase border mb-1 inline-block", record.dept === "ENGINE" ? "text-orange-500 border-orange-500/30" : "text-blue-500 border-blue-500/30")}>
                                    {record.dept} DEPT
                                 </span>
                                 <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate">{record.rank}</h4>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 shrink-0">
                                 <Clock size={10} className="shrink-0" />
                                 <span className={cn("font-bold", record.dept === "ENGINE" ? "text-orange-500" : "text-blue-500")}>{formatDuration(record.duration)}</span>
                              </div>
                           </div>
                        </div>

                        {record.dept === "ENGINE" && (
                           <div className="w-full md:w-48 p-4 flex flex-col justify-center bg-zinc-50/30 dark:bg-zinc-900/10 shrink-0">
                              <p className="text-[9px] uppercase text-zinc-400 font-bold mb-1">Main Engine</p>
                              <p className="text-xs font-bold text-zinc-900 dark:text-white truncate mb-2" title={record.mainEngine}>{record.mainEngine}</p>
                              <div className="grid grid-cols-2 gap-2">
                                 <div><span className="text-[9px] text-zinc-500 block uppercase">Propulsion</span><span className="text-xs font-mono font-bold text-[#FF3300]">{(record.bhp / 1000).toFixed(0)}k BHP</span></div>
                                 <div><span className="text-[9px] text-zinc-500 block uppercase">Power</span><span className="text-xs font-mono font-bold text-emerald-500">{(record.kw / 1000).toFixed(1)}k kW</span></div>
                              </div>
                           </div>
                        )}

                        <div className="flex flex-row md:flex-col items-center justify-end sm:justify-center gap-2 p-3 bg-zinc-50/50 dark:bg-zinc-900/30 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 shrink-0">
                           <button onClick={() => { setEditingId(record.id); setIsModalOpen(true); }} className="p-2 md:p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-2 md:gap-0" title="Edit">
                              <Edit size={14} /> <span className="text-[10px] font-bold uppercase md:hidden text-zinc-500">Edit</span>
                           </button>
                           <button onClick={() => setDeleteConfirmId(record.id)} className="p-2 md:p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 md:gap-0" title="Delete">
                              <Trash2 size={14} /> <span className="text-[10px] font-bold uppercase md:hidden text-zinc-500 hover:text-red-500">Delete</span>
                           </button>
                        </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>

            <AnimatePresence>{isModalOpen && <RecordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSave} initialData={editingId ? entries.find(r => r.id === editingId) : null} userDepartment={userDepartment} />}</AnimatePresence>
            <AnimatePresence>{deleteConfirmId && <DeleteConfirmModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={confirmDelete} />}</AnimatePresence>
         </main>
      </div>
   );
}