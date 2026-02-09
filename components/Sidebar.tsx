"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
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
  const { theme } = useTheme();
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
      } catch (e) {
        console.error("Failed to fetch sidebar profile", e);
      }
    }
    fetchProfile();
  }, []);

  return (
    <div className={cn(
      "flex h-screen w-64 flex-col border-r transition-colors",
      theme === "dark"
        ? "border-zinc-700 bg-zinc-900 text-zinc-50"
        : "border-zinc-700 bg-zinc-900 text-zinc-50"
    )}>
      {/* Brand Header */}
      <div className="flex items-center gap-3 p-8">
        <div className="flex h-8 w-8 items-center justify-center bg-[#FF3300] text-white rounded-md shadow-sm">
          <Anchor size={18} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-sm font-bold uppercase tracking-wider">Marine</span>
          <span className={cn(
            "font-mono text-[10px] uppercase tracking-widest",
            "text-zinc-400"
          )}>OS v2.4</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-lg",
                isActive
                  ? "bg-zinc-800 shadow-sm ring-1 ring-zinc-700"
                  : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-50"
              )}
            >
              <item.icon
                size={16}
                className={cn(
                  "transition-colors",
                  isActive
                    ? "text-[#FF3300]"
                    : "text-zinc-500 group-hover:text-zinc-50"
                )}
              />
              <span className={cn(
                "font-mono text-xs uppercase tracking-wide",
                isActive ? "font-bold" : "font-medium"
              )}>
                {item.name}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#FF3300]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <Link href="/dashboard/profile" className={cn(
        "block p-6 border-t border-zinc-700 hover:bg-zinc-800/50 transition-colors group"
      )}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full border bg-zinc-800 border-zinc-700 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User size={16} className="text-zinc-400" />
            )}
          </div>
          <div>
            <p className="font-mono text-xs font-bold uppercase text-zinc-300 group-hover:text-white transition-colors max-w-[120px] truncate">{userName}</p>
            <p className="font-mono text-[10px] text-zinc-500 group-hover:text-zinc-400">View Profile</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
