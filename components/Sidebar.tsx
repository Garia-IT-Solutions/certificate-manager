"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Ship,
  FileText,
  Award,
  Anchor
} from "lucide-react";

const navItems = [
  { name: "Command Deck", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sea Time", href: "/dashboard/sea-time", icon: Ship },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Certificates", href: "/dashboard/certificates", icon: Award },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();

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
            {/* Simple Avatar Placeholder */}
            <div className="h-full w-full bg-gradient-to-tr from-zinc-700 to-zinc-600" />
          </div>
          <div>
            <p className="font-mono text-xs font-bold uppercase group-hover:text-white transition-colors">Cpt. User</p>
            <p className="font-mono text-[10px] text-zinc-500 group-hover:text-zinc-400">View Profile</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
