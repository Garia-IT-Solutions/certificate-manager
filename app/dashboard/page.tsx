"use client";

import { useRef, useEffect, useState, useId } from "react";
import { useRouter } from "next/navigation";
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
  Clock,
  ShieldCheck,
  AlertCircle,
  Bell,
  Check,
  MessageSquare,
  Info,
  Calendar,
  CheckCircle
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { api } from "@/app/services/api";

interface DashboardData {
  seaTime: {
    totalDays: number;
    lastVessel: string | null;
    lastRank: string | null;
    recentVoyages: Array<{
      vesselName: string;
      type: string;
      dwt: number;
      days: number;
      signOff: string;
      rank: string;
    }>;
  };
  certificates: {
    total: number;
    valid: number;
    expiring: number;
    expired: number;
    compliancePercent: number;
  };
  documents: {
    total: number;
    valid: number;
    expiring: number;
    expired: number;
    recent: Array<{ name: string; status: string; expiryDate: string; uploadDate: string }>;
  };
  alerts: Array<{
    type: string;
    name: string;
    expiryDate: string;
    daysRemaining: number;
  }>;
  nriStatus: {
    days: number;
    startDate: string;
    endDate: string;
    isRetained: boolean;
    daysRemaining: number;
  };
}

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

function LiveDate() {
  const [dateStr, setDateStr] = useState("");
  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
  }, []);
  return <span>{dateStr}</span>;
}

function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());
  useEffect(() => { spring.set(value); }, [spring, value]);
  return <motion.span>{display}</motion.span>;
}

const SPRING_TRANSITION = { type: "spring", stiffness: 200, damping: 25, mass: 1 } as const;

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
          "relative group cursor-pointer overflow-hidden rounded-[2rem] border transition-all duration-300 h-full w-full will-change-transform z-0",
          alert
            ? "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-500 text-white shadow-xl shadow-orange-500/20"
            : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:shadow-zinc-900/40",
          className
        )}
        style={{ borderRadius: 32 }}
      >
        <div className={cn("h-full flex flex-col relative z-10", alert ? "p-0" : "p-6")}>
          {!alert && (title || Icon) && (
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2.5">
                {Icon && (
                  <div className={cn("p-2 rounded-xl backdrop-blur-none transition-colors", "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800")}>
                    <Icon size={16} strokeWidth={2} />
                  </div>
                )}
                {title && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">{title}</h4>
                    {subtitle && <p className="text-[9px] text-zinc-300">{subtitle}</p>}
                  </div>
                )}
              </div>
              <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="text-zinc-400">
                <Maximize2 size={14} />
              </motion.div>
            </div>
          )}
          <div className={cn("flex-1 flex flex-col justify-center w-full", !alert && "justify-end")}>
            {summary}
          </div>
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
              className="fixed inset-0 bg-zinc-950/60 z-[60] will-change-[opacity]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none p-4 md:p-8">
              <motion.div
                layoutId={`card-${id}-${uniqueId}`}
                className={cn(
                  "w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl pointer-events-auto flex flex-col max-h-[85vh] will-change-transform z-50",
                  alert && "border-orange-500 ring-4 ring-orange-500/20"
                )}
                style={{ borderRadius: 32 }}
                transition={SPRING_TRANSITION}
              >
                <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-4"
                  >
                    {Icon && (
                      <div className={cn("p-3 rounded-2xl", alert ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-500" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white")}>
                        <Icon size={24} strokeWidth={2} />
                      </div>
                    )}
                    <div>
                      {title && <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{title}</h3>}
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">Detailed Breakdown</p>
                    </div>
                  </motion.div>
                  <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <X size={20} className="text-zinc-500" />
                  </motion.button>
                </div>
                <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar w-full">
                  {children}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SeaTimeSummary({ data }: { data?: DashboardData['seaTime'] }) {
  const totalDays = data?.totalDays ?? 0;
  const lastVessel = data?.lastVessel ?? 'No voyages yet';
  const lastRank = data?.lastRank ?? '-';

  return (
    <div className="relative h-full flex flex-col justify-end w-full">
      <div className="absolute right-[-15px] bottom-[-15px] opacity-[0.05] dark:opacity-[0.08] pointer-events-none text-zinc-900 dark:text-white">
        <Ship size={140} />
      </div>

      <div className="relative z-10 w-full">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Service Record</h3>
        <div className="flex items-baseline gap-2">
          <h2 className="text-5xl md:text-6xl font-light tracking-tighter text-zinc-900 dark:text-white flex-shrink-0">
            <AnimatedCounter value={totalDays} />
          </h2>
          <span className="text-lg font-medium text-zinc-400">DAYS</span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 w-full">
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Last Vessel</span>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{lastVessel}</span>
          </div>
          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Rank</span>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{lastRank}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeaTimeDetail({ data }: { data?: DashboardData['seaTime'] }) {
  const totalDays = data?.totalDays ?? 0;
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = totalDays % 30;
  const formattedTime = `${years}y ${months}m ${days}d`;

  const recentVoyages = data?.recentVoyages ?? [];

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 w-full">
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Total Sea Service</p>
          <p className="text-3xl font-light text-zinc-900 dark:text-white mt-1 tracking-tight">{formattedTime}</p>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 w-full">
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Voyages</p>
          <p className="text-3xl font-light text-zinc-900 dark:text-white mt-1 tracking-tight">{recentVoyages.length} <span className="text-sm text-zinc-500 font-normal">Logged</span></p>
        </div>
      </div>

      <div className="w-full">
        <h4 className="text-xs font-bold uppercase text-zinc-400 mb-3 tracking-widest px-1">Recent Activity Log</h4>
        <div className="space-y-2 w-full">
          {recentVoyages.length > 0 ? recentVoyages.map((voyage, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group cursor-pointer w-full gap-3 sm:gap-0">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Ship size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{voyage.vesselName}</p>
                  <p className="text-[10px] text-zinc-500 font-medium mt-0.5 truncate">{voyage.type} • {voyage.dwt?.toLocaleString()} DWT</p>
                </div>
              </div>
              <div className="text-left sm:text-right pl-14 sm:pl-0">
                <p className="text-sm font-mono font-bold text-zinc-900 dark:text-white">{voyage.days} Days</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 truncate">as {voyage.rank}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-zinc-400 w-full">
              <Ship size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No voyages logged yet</p>
            </div>
          )}
        </div>
      </div>
      <div className="pt-4 w-full">
        <Link href="/dashboard/sea-time" className="block w-full">
          <button className="w-full py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg">
            Open Full Logbook
          </button>
        </Link>
      </div>
    </div>
  );
}

function DocSummary({ data }: { data?: DashboardData['documents'] }) {
  const valid = data?.valid ?? 0;
  const total = data?.total ?? 0;
  const percent = total > 0 ? Math.round((valid / total) * 100) : 100;
  const status = total === 0 ? 'No Documents' : (valid === total ? 'All Valid' : 'Needs Attention');
  const statusColor = valid === total ? 'bg-blue-500' : 'bg-orange-500';

  return (
    <div className="flex flex-col justify-end h-full w-full">
      <div className="flex items-end gap-2 mb-1 w-full">
        <h2 className="text-5xl font-light tracking-tighter text-zinc-900 dark:text-white">{valid}</h2>
        <span className="text-base font-bold text-zinc-300 mb-1.5">/ {total}</span>
      </div>
      <div className="flex items-center gap-2 w-full">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full animate-pulse", statusColor)} />
        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide truncate">{status}</p>
      </div>

      <div className="mt-4 flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", statusColor)}
        />
      </div>
    </div>
  );
}

function DocDetail({ data }: { data?: DashboardData['documents'] }) {
  const recentDocs = data?.recent ?? [];
  const validCount = data?.valid ?? 0;
  const totalCount = data?.total ?? 0;

  return (
    <div className="space-y-6 w-full">
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 w-full">
        <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Portfolio Status</p>
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{validCount} / {totalCount} Valid</p>
            <p className="text-xs text-zinc-500 mt-0.5 truncate">{totalCount - validCount} Document{totalCount - validCount !== 1 && 's'} require{totalCount - validCount === 1 && 's'} attention</p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h4 className="text-xs font-bold uppercase text-zinc-400 mb-3 tracking-widest px-1">Recent Updates</h4>
        <div className="space-y-2 w-full">
          {recentDocs.length > 0 ? recentDocs.map((doc, i) => (
            <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors w-full gap-2 sm:gap-4">
              <div className="flex items-center gap-3 min-w-0 w-full">
                <FileText size={16} className="text-zinc-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{doc.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{doc.expiryDate || 'No Expiry'}</p>
                </div>
              </div>
              <span className={cn("text-[10px] font-bold uppercase px-2.5 py-1 rounded-md shrink-0 bg-zinc-100 dark:bg-zinc-800 self-start sm:self-auto", doc.status === 'VALID' ? 'text-emerald-500' : 'text-orange-500')}>{doc.status}</span>
            </div>
          )) : (
            <div className="text-center py-4 text-zinc-400 text-xs w-full">No documents found</div>
          )}
        </div>
      </div>

      <div className="pt-2 w-full">
        <Link href="/dashboard/documents" className="block w-full">
          <button className="w-full py-4 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] font-bold uppercase hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Manage Documents</button>
        </Link>
      </div>
    </div>
  );
}

function CertificatesSummary({ data }: { data?: DashboardData['certificates'] }) {
  const percent = data?.compliancePercent ?? 100;
  const hasExpiring = (data?.expiring ?? 0) > 0;
  const hasExpired = (data?.expired ?? 0) > 0;
  const status = hasExpired ? 'Expired' : (hasExpiring ? 'Review Needed' : (data?.total === 0 ? 'No Certs' : 'Compliant'));
  const statusColor = hasExpired ? 'bg-red-500' : (hasExpiring ? 'bg-orange-500' : 'bg-emerald-500');

  return (
    <div className="flex flex-col justify-end h-full w-full">
      <div className="flex items-end gap-1 mb-1 w-full">
        <h2 className="text-5xl font-light tracking-tighter text-zinc-900 dark:text-white">{percent}</h2>
        <span className="text-xl text-zinc-300 font-light mb-1.5">%</span>
      </div>
      <div className="flex items-center gap-2 w-full">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full animate-pulse", statusColor)} />
        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide truncate">{status}</p>
      </div>
      <div className="mt-4 flex gap-1.5 h-1.5 w-full rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className={cn("h-full rounded-full", statusColor)}
        />
      </div>
    </div>
  );
}

function CertificatesContent({ data }: { data?: DashboardData['certificates'] }) {
  const valid = data?.valid ?? 0;
  const expiring = data?.expiring ?? 0;
  const expired = data?.expired ?? 0;
  const hasIssues = expiring > 0 || expired > 0;

  return (
    <div className="space-y-6 w-full">
      <div className={cn(
        "p-5 rounded-2xl border flex flex-col sm:flex-row gap-4 sm:gap-5 items-start w-full",
        hasIssues
          ? "bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30"
          : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30"
      )}>
        <div className={cn(
          "p-2.5 rounded-xl shrink-0",
          hasIssues
            ? "bg-orange-100 dark:bg-orange-800/30 text-orange-600 dark:text-orange-400"
            : "bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 dark:text-emerald-400"
        )}>
          {hasIssues ? <AlertCircle size={20} /> : <ShieldCheck size={20} />}
        </div>
        <div className="min-w-0">
          <h5 className={cn(
            "font-bold text-sm truncate",
            hasIssues ? "text-orange-900 dark:text-orange-100" : "text-emerald-900 dark:text-emerald-100"
          )}>
            {hasIssues ? 'Attention Required' : 'All Systems Go'}
          </h5>
          <p className={cn(
            "text-xs mt-1 leading-relaxed",
            hasIssues ? "text-orange-700/80 dark:text-orange-300/70" : "text-emerald-700/80 dark:text-emerald-300/70"
          )}>
            {hasIssues
              ? `${expiring} expiring soon, ${expired} expired. Please review.`
              : 'Your certifications are up to date.'}
          </p>
        </div>
      </div>

      <div className="w-full">
        <h4 className="text-xs font-bold uppercase text-zinc-400 mb-3 tracking-widest px-1">Certificate Health</h4>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
          <div className="p-3 sm:p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 w-full flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="text-2xl font-light text-emerald-600 dark:text-emerald-400">{valid}</p>
            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase mt-1 truncate w-full">Valid</p>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 w-full flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="text-2xl font-light text-orange-600 dark:text-orange-400">{expiring}</p>
            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase mt-1 truncate w-full">Expiring</p>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 w-full flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="text-2xl font-light text-red-600 dark:text-red-400">{expired}</p>
            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase mt-1 truncate w-full">Expired</p>
          </div>
        </div>
      </div>

      <div className="pt-2 w-full">
        <Link href="/dashboard/certificates" className="block w-full">
          <button className="w-full py-4 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] font-bold uppercase hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white">View Certificates</button>
        </Link>
      </div>
    </div>
  );
}

const MOCK_NOTIFS = [
  { id: 1, type: "info", title: "System Update", msg: "Dashboard v2.4.1 is now live.", time: "10m ago", category: "", href: "" },
  { id: 2, type: "warning", title: "Weather Alert", msg: "High swell warning in Sector 4.", time: "2h ago", category: "", href: "" },
  { id: 3, type: "success", title: "Sync Complete", msg: "Cloud backup finished successfully.", time: "5h ago", category: "", href: "" },
  { id: 4, type: "info", title: "Crew Message", msg: "Shift roster updated by Chief Officer.", time: "1d ago", category: "", href: "" },
];

function getCategoryHref(category: string): string {
  switch (category?.toLowerCase()) {
    case 'certificate': return '/dashboard/certificates';
    case 'document': return '/dashboard/documents';
    default: return '';
  }
}

function NotificationSummary({ notifs }: { notifs: typeof MOCK_NOTIFS }) {
  const count = notifs.length;
  const latest = notifs.length > 0 ? notifs[0] : null;

  if (count === 0 || !latest) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center w-full">
        <Bell className="text-zinc-300 mb-2 shrink-0" size={24} />
        <p className="text-sm font-bold text-zinc-400">All caught up</p>
        <p className="text-[10px] text-zinc-300">No new notifications</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden w-full">
      <div className="absolute top-0 right-0 p-4">
        <div className="relative">
          <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20"></div>
          <div className="relative h-2 w-2 bg-orange-500 rounded-full"></div>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-3 w-full">
        <div className="h-8 w-8 shrink-0 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
          {count}
        </div>
        <span className="text-xs font-bold text-zinc-500 truncate">
          Unread messages
        </span>
      </div>

      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center gap-3 shadow-sm w-full min-w-0">
        <div className={cn(
          "p-1.5 rounded-lg shrink-0",
          latest.type === 'info' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
            latest.type === 'warning' ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" :
              "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
        )}>
          {latest.type === 'info' ? <Info size={14} /> : latest.type === 'warning' ? <AlertCircle size={14} /> : <Check size={14} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-center mb-0.5 gap-2">
            <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
              {latest.title}
            </p>
            <span className="text-[9px] text-zinc-400 font-mono shrink-0">
              {latest.time}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 truncate">
            {latest.msg}
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
  const router = useRouter();

  const removeNotif = (id: number) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const handleNotifClick = (href: string) => {
    if (href) router.push(href);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between pb-2 w-full">
        <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-widest px-1">Inbox</h4>
        <button onClick={() => setNotifs([])} className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0">Clear All</button>
      </div>

      <div className="space-y-0 relative w-full">
        {notifs.length > 0 && <div className="absolute left-[32px] top-[28px] bottom-[28px] w-px bg-zinc-200 dark:bg-zinc-800 z-0 hidden sm:block" />}

        <AnimatePresence>
          {notifs.length > 0 ? (
            notifs.map((n) => {
              const isNavigable = !!n.href;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="relative z-10 group w-full"
                >
                  <div
                    onClick={() => handleNotifClick(n.href)}
                    className={cn(
                      "flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 rounded-2xl transition-all border border-transparent w-full",
                      isNavigable
                        ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-zinc-100 dark:hover:border-zinc-800 hover:shadow-sm"
                        : "cursor-default hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-950 shrink-0 transition-transform",
                      isNavigable && "group-hover:scale-105",
                      n.type === 'info' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                        n.type === 'warning' ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" :
                          "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    )}>
                      {n.type === 'info' ? <Info size={16} /> : n.type === 'warning' ? <AlertCircle size={16} /> : <Check size={16} />}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
                        <h5 className="text-sm font-bold text-zinc-900 dark:text-white truncate pr-2">{n.title}</h5>
                        <span className="text-[10px] text-zinc-400 font-mono shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed pr-6">{n.msg}</p>
                      {isNavigable && (
                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-300 group-hover:text-orange-400 transition-colors mt-1 flex items-center gap-1">
                          View details <ArrowRight size={9} />
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeNotif(n.id); }}
                      className="sm:opacity-0 sm:group-hover:opacity-100 p-2 text-zinc-300 hover:text-zinc-500 transition-all absolute top-2 right-2 sm:static sm:self-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center w-full">
              <div className="h-12 w-12 shrink-0 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-300">
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

function NRIStatusSummary({ data }: { data?: DashboardData['nriStatus'] }) {
  const days = data?.days ?? 0;
  const isRetained = data?.isRetained ?? false;

  return (
    <div className="flex flex-col h-full w-full px-6 py-5 relative overflow-hidden">
      <div className="absolute -right-5 -top-5 h-24 w-24 bg-white/10 blur-2xl rounded-full pointer-events-none shrink-0" />

      <div className="flex items-start justify-between relative z-10 w-full">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm border border-white/10">
            <span className="font-bold text-xs">NRI</span>
          </div>
          <span className={cn(
            "px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-widest border border-white/10 shrink-0",
            isRetained ? "bg-emerald-500/20 text-emerald-100" : "bg-orange-500/20 text-orange-100"
          )}>
            {isRetained ? "Valid" : "Pending"}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center text-center w-full py-4">
        <h2 className="text-4xl font-light text-white tracking-tighter truncate">
          {days}
        </h2>
        <p className="text-[10px] text-white/60 font-medium mt-1 uppercase tracking-wider truncate">
          Days Completed
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-3 relative z-10 w-full gap-2">
        <span className="text-[9px] text-white/60 font-medium truncate">
          Target: 182 Days
        </span>
        <button className="flex items-center gap-1.5 text-white text-[10px] font-bold uppercase hover:gap-2 transition-all bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/5 shrink-0">
          Details <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

function NRIStatusDetail({ data }: { data?: DashboardData['nriStatus'] }) {
  const days = data?.days ?? 0;
  const startDate = data?.startDate ?? '-';
  const endDate = data?.endDate ?? '-';
  const isRetained = data?.isRetained ?? false;
  const daysRemaining = data?.daysRemaining ?? 0;

  const percentage = Math.min(100, Math.round((days / 182) * 100));

  return (
    <div className="space-y-6 w-full">
      <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-center relative overflow-hidden w-full">
        <div className="relative z-10 w-full">
          <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-widest mb-1">NRI Status Validity</h3>
          <p className={cn("text-2xl sm:text-3xl font-light tracking-tight truncate", isRetained ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400")}>
            {isRetained ? "Status Retained" : "Action Required"}
          </p>
        </div>
        <div className={cn("absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
          isRetained ? "from-emerald-500 to-teal-400" : "from-orange-500 to-red-400"
        )} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 w-full">
          <div className="relative h-20 w-20 shrink-0 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-zinc-100 dark:text-zinc-800"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <motion.path
                className={isRetained ? "text-emerald-500" : "text-orange-500"}
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${percentage}, 100` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold text-zinc-900 dark:text-white">{percentage}%</span>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-wide">Progress</p>
        </div>

        <div className="flex flex-col sm:space-y-3 gap-3 sm:gap-0 w-full">
          <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 w-full flex-1 flex flex-col justify-center">
            <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Completed</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">{days} <span className="text-xs font-medium text-zinc-400">Days</span></p>
          </div>
          <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 w-full flex-1 flex flex-col justify-center">
            <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Remaining</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">{isRetained ? 0 : daysRemaining} <span className="text-xs font-medium text-zinc-400">Days</span></p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 flex items-start gap-3 w-full">
        <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-0.5 truncate">Calculation Period</p>
          <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 leading-relaxed break-words">
            For Financial Year ending <strong className="text-blue-800 dark:text-blue-300">31 Mar {endDate !== '-' ? endDate.split(' ')[2] : ''}</strong>.
            Calculation is based on sea time between {startDate} and {endDate}.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [notifications, setNotifications] = useState<typeof MOCK_NOTIFS>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getDashboardSummary();
        setDashboardData(data);

        const calculateActualDays = (dateStr: string) => {
          const target = new Date(dateStr);
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const expiry = new Date(target.getFullYear(), target.getMonth(), target.getDate());
          const diffTime = expiry.getTime() - today.getTime();
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        };

        const newNotifs = (data.alerts || []).map((alert: any, i: number) => {
          const actualDays = alert.expiryDate ? calculateActualDays(alert.expiryDate) : alert.daysRemaining;

          let msg = `Expiring in ${actualDays} days.`;
          let type = actualDays <= 30 ? 'warning' : 'info';

          if (actualDays < 0) {
            msg = `Expired ${Math.abs(actualDays)} days ago.`;
            type = 'warning';
          } else if (actualDays === 0) {
            msg = `Expires today.`;
            type = 'warning';
          }

          const category = alert.type ?? '';
          const href = getCategoryHref(category);

          return {
            id: i,
            type,
            title: `${alert.name} Expiry`,
            msg,
            time: 'Now',
            category,
            href,
          };
        });
        setNotifications(newNotifs);

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen w-full bg-transparent selection:bg-orange-500 selection:text-white pb-32">
      <main className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 md:gap-8">

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 truncate">System Online</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light tracking-tighter text-zinc-900 dark:text-white pb-1">
              Mariner's<span className="font-bold text-[#FF3300]">Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-4 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm z-20 shrink-0">
            <div className="flex items-center gap-3 px-3 min-w-0">
              <Clock size={14} className="text-zinc-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 truncate"><LiveClock /> UTC</p>
                <p className="text-[9px] text-zinc-400 font-mono truncate"><LiveDate /></p>
              </div>
            </div>
            <div className="shrink-0 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
          <div className="lg:row-span-2 min-h-[336px] h-full w-full">
            <BentoCard
              id="hero"
              title="Sea Time"
              subtitle="Verified Service"
              icon={Ship}
              summary={<SeaTimeSummary data={dashboardData?.seaTime} />}
            >
              <SeaTimeDetail data={dashboardData?.seaTime} />
            </BentoCard>
          </div>

          <div className="min-h-[160px] h-full w-full">
            <BentoCard
              id="docs"
              title="Documents"
              icon={FileText}
              summary={<DocSummary data={dashboardData?.documents} />}
            >
              <DocDetail data={dashboardData?.documents} />
            </BentoCard>
          </div>

          <div className="min-h-[160px] h-full w-full">
            <BentoCard
              id="certs"
              title="Certificates"
              icon={Activity}
              summary={<CertificatesSummary data={dashboardData?.certificates} />}
            >
              <CertificatesContent data={dashboardData?.certificates} />
            </BentoCard>
          </div>

          <div className="min-h-[160px] h-full w-full">
            <BentoCard
              id="notifications"
              title="Notifications"
              icon={Bell}
              summary={<NotificationSummary notifs={notifications} />}
            >
              <NotificationDetail
                notifs={notifications}
                setNotifs={setNotifications}
              />
            </BentoCard>
          </div>

          <div className="min-h-[160px] h-full w-full">
            <BentoCard
              id="nri-status"
              title=""
              alert={!(dashboardData?.nriStatus?.isRetained)}
              summary={<NRIStatusSummary data={dashboardData?.nriStatus} />}
            >
              <NRIStatusDetail data={dashboardData?.nriStatus} />
            </BentoCard>
          </div>
        </div>



      </main>
    </div>
  );
}