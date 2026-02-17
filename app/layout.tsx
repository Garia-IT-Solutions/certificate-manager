import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner"; // <-- 1. Added the import

// Initialize fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "MarineTracker Pro",
  description: "Advanced Maritime Operating System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${inter.variable} 
          ${jetbrains.variable} 
          font-sans 
          antialiased 
          min-h-screen 
          bg-zinc-50 
          dark:bg-black

          /* --- LIGHT MODE GRID (Gray Lines - 20% Opacity) --- */
          bg-[linear-gradient(to_right,rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)] 
          
          /* --- DARK MODE GRID (White Lines - 30% Opacity - VERY VISIBLE) --- */
          dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)]
          
          /* --- GRID SIZE --- */
          bg-[size:150px_150px]
          bg-repeat
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* <-- 2. Wrapped the entire application in the SidebarProvider */}
          <SidebarProvider>
            {children}
            <Toaster />
          </SidebarProvider>

          <div className="flex justify-center py-4 w-full">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono font-medium opacity-60">
              Powered by Garia IT Solutions™ {new Date().getFullYear()}
            </span>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}