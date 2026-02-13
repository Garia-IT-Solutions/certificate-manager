"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Ship,
  FileText,
  Award,
  Anchor,
  User
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "SeaTime Log", href: "/dashboard/sea-time", icon: Ship },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Certificates", href: "/dashboard/certificates", icon: Award },
  { name: "Resume Generator", href: "/dashboard/resume", icon: FileText },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { openMobile, setOpenMobile } = useSidebar();
  const [userName, setUserName] = useState("Cpt. User");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch('http://localhost:8000/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          const fullName = `${data.first_name} ${data.last_name}`;
          setUserName(fullName.trim() || "Cpt. User");
          setAvatarUrl(data.avatar_url || "");
        }
      } catch (e) {}
    }
    fetchProfile();
  }, []);

  return (
    <>
      {openMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setOpenMobile && setOpenMobile(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 shrink-0",
        openMobile ? "translate-x-0" : "-translate-x-full",
        "bg-[#09090b] border-zinc-800 text-zinc-50" 
      )}>
        <div className="flex items-center gap-3 p-8">
          <div className="flex h-8 w-8 items-center justify-center bg-[#FF3300] text-white rounded-md shadow-sm">
            <Anchor size={18} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">Marine</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">OS v2.4</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (setOpenMobile) setOpenMobile(false);
                }}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-lg",
                  isActive
                    ? "bg-[#FF3300] text-white shadow-lg shadow-[#FF3300]/20"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                )}
              >
                <item.icon
                  size={16}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                />
                <span className={cn(
                  "font-mono text-xs uppercase tracking-wide",
                  isActive ? "font-bold text-white" : "font-medium"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <Link 
          href="/dashboard/profile" 
          onClick={() => {
            if (setOpenMobile) setOpenMobile(false);
          }}
          className="block p-6 border-t border-zinc-800 hover:bg-zinc-900 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full border bg-zinc-800 border-zinc-700 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User size={16} className="text-zinc-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xs font-bold uppercase text-zinc-300 group-hover:text-white transition-colors truncate">{userName}</p>
              <p className="font-mono text-[10px] text-zinc-500">View Profile</p>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}