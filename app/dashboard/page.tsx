"use client";
import { useRef, useEffect, useState, useId } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { 
  Ship, 
  Navigation, 
  AlertTriangle,
  ArrowRight,
  Download,
  FileText,
  Upload,
  Activity,
  Maximize2,
  X,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  CloudUpload,
  FileCheck,
  AlertCircle,
  Bell,
  Check,
  MessageSquare,
  Info,
  Calendar
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle"; 
import { cn } from "@/lib/utils";

// --- UTILITY COMPONENTS ---

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className="font-mono tabular-nums">{time}</span>;
}

function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());
  useEffect(() => { spring.set(value); }, [spring, value]);
  return <motion.span>{display}</motion.span>;
}


const SPRING_TRANSITION = { type: "spring", stiffness: 180, damping: 22, mass: 0.8 };
interface BentoCardProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: any;
  className?: string;
  children: React.ReactNode; 
  summary: React.ReactNode;
  alert?: boolean;
}

function BentoCard({ id, title, subtitle, icon: Icon, className, children, summary, alert = false }: BentoCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const uniqueId = useId();

  return (
    <>
      <motion.div 
        layoutId={`card-${id}-${uniqueId}`}
        onClick={() => setIsOpen(true)}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-[2rem] border transition-all duration-300 h-full",
          alert 
            ? "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-500 text-white shadow-xl shadow-orange-500/20" 
            : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:shadow-zinc-900/40",
          className
        )}
      >
        <div className={cn("h-full flex flex-col relative z-10", alert ? "p-0" : "p-6")}>
          {!alert && (
            <div className="flex justify-between items-start mb-2">
                <motion.div layoutId={`header-${id}-${uniqueId}`} className="flex items-center gap-2.5">
                {Icon && (
                    <div className={cn("p-2 rounded-xl backdrop-blur-md transition-colors", "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800")}>
                    <Icon size={16} strokeWidth={2} />
                    </div>
                )}
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">{title}</h4>
                    {subtitle && <p className="text-[9px] text-zinc-300">{subtitle}</p>}
                </div>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="text-zinc-400">
                    <Maximize2 size={14} />
                </motion.div>
            </div>
          )}
          <motion.div layoutId={`content-${id}-${uniqueId}`} className={cn("flex-1 flex flex-col justify-center", !alert && "justify-end")}>
            {summary}
          </motion.div>
        </div>
        {!alert && (
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100/50 via-transparent to-transparent dark:from-zinc-800/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-white/60 dark:bg-black/80 backdrop-blur-xl z-[60]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none p-4 md:p-8">
              <motion.div 
                layoutId={`card-${id}-${uniqueId}`}
                className={cn(
                  "w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl pointer-events-auto flex flex-col max-h-[85vh]",
                  alert && "border-orange-500 ring-4 ring-orange-500/20"
                )}
                transition={SPRING_TRANSITION}
              >
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
                  <motion.div layoutId={`header-${id}-${uniqueId}`} className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl", alert ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-500" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white")}>
                      {Icon && <Icon size={24} strokeWidth={2} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{title}</h3>
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">Detailed Breakdown</p>
                    </div>
                  </motion.div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <X size={20} className="text-zinc-500" />
                  </button>
                </div>
                <motion.div 
                  className="p-8 overflow-y-auto flex-1 custom-scrollbar"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// --- CONTENT COMPONENTS ---

function SeaTimeSummary() {
  return (
    <div className="relative h-full flex flex-col justify-end">
      <div className="absolute right-[-15px] bottom-[-15px] opacity-[0.05] dark:opacity-[0.08] pointer-events-none text-zinc-900 dark:text-white">
        <Ship size={140} />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Service Record</h3>
        <div className="flex items-baseline gap-2">
          <h2 className="text-5xl md:text-6xl font-light tracking-tighter text-zinc-900 dark:text-white">
            <AnimatedCounter value={1240} />
          </h2>
          <span className="text-lg font-medium text-zinc-400">DAYS</span>
        </div>
        
        <div className="mt-6 flex items-center gap-6">
           <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Last Vessel</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Esso Antwerp</span>
           </div>
           <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
           <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Rank</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">3rd Engineer</span>
           </div>
        </div>
      </div>
    </div>
  );
}

function SeaTimeDetail() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
         <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Total Sea Service</p>
            <p className="text-3xl font-light text-zinc-900 dark:text-white mt-1 tracking-tight">3y 4m 20d</p>
         </div>
         <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Watchkeeping</p>
            <p className="text-3xl font-light text-zinc-900 dark:text-white mt-1 tracking-tight">840 <span className="text-sm text-zinc-500 font-normal">Hrs</span></p>
         </div>
      </div>
      
      <div>
        <h4 className="text-xs font-bold uppercase text-zinc-400 mb-3 tracking-widest px-1">Recent Activity Log</h4>
        <div className="space-y-2">
          {[1,2,3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group cursor-pointer">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                     <Ship size={16} />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-zinc-900 dark:text-white">Maersk Mc-Kinney</p>
                     <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Container Ship • 156,907 DWT</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-sm font-mono font-bold text-zinc-900 dark:text-white">4 Mos 12 Days</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Ended Oct 2025</p>
               </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pt-4">
        <Link href="/dashboard/sea-time" className="block w-full">
          <button className="w-full py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg">
             Open Full Logbook
          </button>
        </Link>
      </div>
    </div>
  );
}

function DocSummary() {
  return (
    <div className="flex flex-col justify-end h-full">
       <div className="flex items-end gap-2 mb-1">
          <h2 className="text-5xl font-light tracking-tighter text-zinc-900 dark:text-white">14</h2>
          <span className="text-base font-bold text-zinc-300 mb-1.5">/ 15</span>
       </div>
       <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Secure</p>
       </div>
       
       <div className="mt-4 flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: "92%" }} 
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-blue-500 rounded-full" 
          />
       </div>
    </div>
  );
}

function DocDetail() {
  return (
    <div className="space-y-6">
       <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Portfolio Status</p>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <FileText size={20} />
             </div>
             <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">14 / 15 Valid</p>
                <p className="text-xs text-zinc-500 mt-0.5">1 Document requires attention</p>
             </div>
          </div>
       </div>

       <div>
          <h4 className="text-xs font-bold uppercase text-zinc-400 mb-3 tracking-widest px-1">Recent Updates</h4>
          <div className="space-y-2">
             {[
                { name: "Passport", status: "Valid", date: "Expires 2030", color: "text-emerald-500" },
                { name: "Seaman's Book", status: "Valid", date: "Expires 2028", color: "text-emerald-500" },
                { name: "YF Vaccination", status: "Missing", date: "Required", color: "text-orange-500" }
             ].map((doc, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                   <div className="flex items-center gap-3">
                      <FileText size={16} className="text-zinc-400" />
                      <div>
                         <p className="text-sm font-bold text-zinc-900 dark:text-white">{doc.name}</p>
                         <p className="text-[10px] text-zinc-500">{doc.date}</p>
                      </div>
                   </div>
                   <span className={cn("text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800", doc.color)}>{doc.status}</span>
                </div>
             ))}
          </div>
       </div>

       <div className="pt-2">
          <Link href="/dashboard/documents" className="block w-full">
             <button className="w-full py-4 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] font-bold uppercase hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Manage Documents</button>
          </Link>
       </div>
    </div>
  );
}

function CertificatesSummary() {
   return (
     <div className="flex flex-col justify-end h-full">
        <div className="flex items-end gap-1 mb-1">
           <h2 className="text-5xl font-light tracking-tighter text-zinc-900 dark:text-white">98</h2>
           <span className="text-xl text-zinc-300 font-light mb-1.5">%</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Compliant</p>
        </div>
        <div className="mt-4 flex gap-1.5 h-1.5 w-full rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
           <motion.div 
             initial={{ width: 0 }} 
             animate={{ width: "98%" }} 
             transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
             className="h-full bg-emerald-500 rounded-full" 
           />
        </div>
     </div>
   );
 }

function CertificatesContent() {
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 flex gap-5 items-start">
         <div className="p-2.5 bg-emerald-100 dark:bg-emerald-800/30 rounded-xl text-emerald-600 dark:text-emerald-400 h-fit">
            <ShieldCheck size={20} />
         </div>
         <div>
            <h5 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">All Systems Go</h5>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/70 mt-1 leading-relaxed">Your certifications are up to date. Next review cycle in 3 months.</p>
         </div>
      </div>

      <div>
         <h4 className="text-xs font-bold uppercase text-zinc-400 mb-3 tracking-widest px-1">Certificate Health</h4>
         <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
               <p className="text-2xl font-light text-zinc-900 dark:text-white">12</p>
               <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">Valid</p>
            </div>
            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
               <p className="text-2xl font-light text-zinc-900 dark:text-white">0</p>
               <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">Expiring</p>
            </div>
         </div>
      </div>

      <div className="pt-2">
         <Link href="/dashboard/certificates" className="block w-full">
            <button className="w-full py-4 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] font-bold uppercase hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white">View Certificates</button>
         </Link>
      </div>
    </div>
  );
}


const MOCK_NOTIFS = [
  { id: 1, type: "info", title: "System Update", msg: "Dashboard v2.4.1 is now live.", time: "10m ago" },
  { id: 2, type: "warning", title: "Weather Alert", msg: "High swell warning in Sector 4.", time: "2h ago" },
  { id: 3, type: "success", title: "Sync Complete", msg: "Cloud backup finished successfully.", time: "5h ago" },
  { id: 4, type: "info", title: "Crew Message", msg: "Shift roster updated by Chief Officer.", time: "1d ago" },
];

function NotificationSummary({ count }: { count: number }) {
  if (count === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center">
        <Bell className="text-zinc-300 mb-2" size={24} />
        <p className="text-sm font-bold text-zinc-400">All caught up</p>
        <p className="text-[10px] text-zinc-300">No new notifications</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Ping */}
      <div className="absolute top-0 right-0 p-4">
        <div className="relative">
          <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20"></div>
          <div className="relative h-2 w-2 bg-orange-500 rounded-full"></div>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
          {count}
        </div>
        <span className="text-xs font-bold text-zinc-500">
          Unread messages
        </span>
      </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
            <Info size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between items-center mb-0.5">
              <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                System Update
              </p>
              <span className="text-[9px] text-zinc-400 font-mono">
                Just now
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 truncate">
              Dashboard v2.4.1 is now live.
            </p>
          </div>
        </div>
      </div>
  );
}


function NotificationDetail({
  notifs,
  setNotifs,
}: {
  notifs: typeof MOCK_NOTIFS;
  setNotifs: React.Dispatch<React.SetStateAction<typeof MOCK_NOTIFS>>;
}) {


  const removeNotif = (id: number) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between pb-2">
          <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-widest px-1">Inbox</h4>
          <button onClick={() => setNotifs([])} className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Clear All</button>
       </div>

       <div className="space-y-0 relative">
          {/* Vertical Timeline Line */}
          {notifs.length > 0 && <div className="absolute left-[19px] top-4 bottom-4 w-px bg-zinc-200 dark:bg-zinc-800 z-0" />}
          
          <AnimatePresence>
            {notifs.length > 0 ? (
              notifs.map((n) => (
                <motion.div 
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="relative z-10 group"
                >
                  <div className="flex gap-4 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800">
                     <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-950 shrink-0",
                        n.type === 'info' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                        n.type === 'warning' ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" :
                        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                     )}>
                        {n.type === 'info' ? <Info size={16} /> : n.type === 'warning' ? <AlertCircle size={16} /> : <Check size={16} />}
                     </div>
                     <div className="flex-1 min-w-0 pt-1">
                        <div className="flex justify-between items-start">
                           <h5 className="text-sm font-bold text-zinc-900 dark:text-white">{n.title}</h5>
                           <span className="text-[10px] text-zinc-400 font-mono">{n.time}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{n.msg}</p>
                     </div>
                     <button 
                        onClick={(e) => { e.stopPropagation(); removeNotif(n.id); }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-zinc-300 hover:text-zinc-500 transition-all self-center"
                     >
                        <X size={14} />
                     </button>
                  </div>
                </motion.div>
              ))
            ) : (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                  <div className="h-12 w-12 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-300">
                     <Bell size={20} />
                  </div>
                  <p className="text-sm font-bold text-zinc-400">All caught up</p>
                  <p className="text-[10px] text-zinc-300">No new notifications</p>
               </motion.div>
            )}
          </AnimatePresence>
       </div>
    </div>
  );
}

// --- MODIFIED ALERT COMPONENTS (To fit smaller space) ---

function AlertSummary() {
  return (
    <div className="flex flex-col h-full w-full px-6 py-5 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-32 w-32 bg-white/10 blur-3xl rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm border border-white/10">
            <AlertTriangle size={16} />
          </div>
          <span className="px-2 py-1 rounded-md bg-white/20 text-[9px] font-extrabold uppercase text-white tracking-widest border border-white/10">
            Action Req.
          </span>
        </div>
      </div>

      {/* TRUE VISUAL CENTER */}
      <div className="flex-1 flex flex-col justify-center text-center">
        <h2 className="text-2xl font-bold leading-tight text-white tracking-tight">
          ENG1 Expiry
        </h2>
        <p className="text-xs text-white/80 font-medium mt-1">
          Medical Certificate expiring in 12 days.
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3 relative z-10">
        <span className="text-[10px] font-mono text-white/60 font-medium">
          Priority: High
        </span>
        <button className="flex items-center gap-1.5 text-white text-[10px] font-bold uppercase hover:gap-2 transition-all bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/5">
          Resolve <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}


function AlertDetail() {
   const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-6">
       <div className="text-center pb-6 border-b border-zinc-100 dark:border-zinc-900">
          <div className="mx-auto h-20 w-20 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-500 mb-4 shadow-inner">
             <AlertTriangle size={32} />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">ENG1 Medical Expiry</h3>
          <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
             Your certificate expires on <strong className="text-zinc-900 dark:text-white">Nov 05, 2025</strong>. 
             Maritime regulations require renewal before your next sign-on.
          </p>
       </div>
       <div 
         onClick={() => setIsUploading(true)}
         className={cn(
            "h-40 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-in-out group relative overflow-hidden",
            isUploading 
               ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10" 
               : "border-zinc-200 dark:border-zinc-800 hover:border-orange-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
         )}
       >
          {!isUploading ? (
             <>
                <div className="p-4 bg-white dark:bg-zinc-800 rounded-full shadow-md mb-3 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                   <Upload size={24} className="text-orange-500" />
                </div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Click to Upload New Certificate</p>
                <p className="text-[10px] text-zinc-400 mt-1 font-medium">Supports PDF, JPG (Max 5MB)</p>
             </>
          ) : (
             <div className="flex flex-col items-center">
                <div className="h-10 w-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3" />
                <p className="text-xs font-bold text-orange-600 uppercase tracking-widest animate-pulse">Processing Document...</p>
             </div>
          )}
       </div>

       <div className="grid grid-cols-2 gap-3">
          <button className="py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-[10px] uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity duration-300 ease-in-out">
             Mark Renewed
          </button>
          <button className="py-4 border border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-300 ease-in-out">
             Remind Later
          </button>
       </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function DashboardPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFS);

  return (

    <div className="min-h-screen w-full bg-transparent selection:bg-orange-500 selection:text-white pb-32">
      <main className="relative mx-auto max-w-[1400px] p-6 md:p-8"> 
        <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="relative flex h-1.5 w-1.5">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
               </span>
               <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">System Online</span>
            </div>
            <h1 className="text-4xl font-light tracking-tighter text-zinc-900 dark:text-white">
              Captain's<span className="font-bold"> Log</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm z-20">
             <div className="flex items-center gap-3 px-3 border-r border-zinc-200 dark:border-zinc-800">
                <MapPin size={14} className="text-orange-500" />
                <div>
                   <p className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100">Atlantic Ocean</p>
                   <p className="text-[9px] text-zinc-400 font-mono">42°N, 18°W</p>
                </div>
             </div>
             <div className="flex items-center gap-3 px-1">
                <Clock size={14} className="text-zinc-400" />
                <div>
                   <p className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100"><LiveClock /> UTC</p>
                   <p className="text-[9px] text-zinc-400 font-mono">Fri, Oct 24</p>
                </div>
             </div>
             <ThemeToggle />
          </div>
        </header>

        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
           
           {/* Row 1 & 2 Left: Sea Time (Hero) */}
           <div className="md:col-span-2 md:row-span-2 h-[336px]">
              <BentoCard 
                id="hero" 
                title="Sea Time" 
                subtitle="Verified Service" 
                icon={Ship}
                summary={<SeaTimeSummary />}
              >
                <SeaTimeDetail />
              </BentoCard>
           </div>
           
           {/* Row 1 Right: Documents */}
           <div className="md:col-span-2 h-[160px]">
              <BentoCard 
                id="docs" 
                title="Documents" 
                icon={FileText}
                summary={<DocSummary />}
              >
                <DocDetail />
              </BentoCard>
           </div>
           
           {/* Row 2 Right: Certificates */}
           <div className="md:col-span-2 h-[160px]">
              <BentoCard 
                id="certs" 
                title="Certificates" 
                icon={Activity}
                summary={<CertificatesSummary />}
              >
                <CertificatesContent /> 
              </BentoCard>
           </div>
           
           {/* Row 3 Left: Notifications (NEW - Under Sea Time) */}
           <div className="md:col-span-2 h-[160px]">
             <BentoCard 
  id="notifications" 
  title="Notifications" 
  icon={Bell}
  summary={<NotificationSummary count={notifications.length} />}
>
  <NotificationDetail
    notifs={notifications}
    setNotifs={setNotifications}
  />
</BentoCard>

           </div>

           {/* Row 3 Right: Alert (Resized to fit) */}
           <div className="md:col-span-2 h-[160px]">
              <BentoCard 
                id="alert" 
                title="" 
                alert={true} 
                summary={<AlertSummary />}
              >
                <AlertDetail />
              </BentoCard>
           </div>

        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-[300px]">
           <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-white/80 dark:bg-[#121217]/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/10 ring-1 ring-white/20">
              {[
                { icon: Ship, label: "Log", href: "/dashboard/sea-time" },
                { icon: Upload, label: "Upload", href: "/dashboard/certificates" },
                { icon: Navigation, label: "Map", href: "/dashboard/navigation" },
                { icon: Download, label: "Export", href: "/dashboard/reports" },
              ].map((action, i) => (
                 <Link key={i} href={action.href} className="group relative flex flex-col items-center gap-1 transition-all hover:-translate-y-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all shadow-sm">
                       <action.icon size={18} strokeWidth={2} className="text-zinc-600 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-black" />
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                      {action.label}
                    </span>
                 </Link>
              ))}
           </div>
        </div>
        
      </main>
    </div>
  );
}