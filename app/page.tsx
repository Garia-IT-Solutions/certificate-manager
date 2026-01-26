"use client";

import Link from "next/link";
import { 
  Anchor, 
  ArrowRight, 
  Lock, 
  Mail, 
  Waves, 
  Wind, 
  User,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// --- LIVE CLOCK UTILITY ---
function LiveTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className="font-mono text-xs text-zinc-500">{time} UTC</span>;
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    // Background is transparent to let the root layout's grid/gradient show through
    <div className="flex min-h-screen items-center justify-center p-4">
      
      {/* Optional: Spotlight Effect behind the card for depth */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* --- MAIN CARD --- */}
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden relative">
          
          {/* Decorative Top Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />

          <div className="p-8 md:p-10">
            
            {/* LOGO & HEADER */}
            <div className="text-center mb-10">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black mb-6 shadow-xl shadow-orange-500/10"
              >
                <Anchor size={32} strokeWidth={2} />
              </motion.div>
              <h1 className="text-3xl font-light tracking-tighter text-zinc-900 dark:text-white mb-2">
                MarineTracker<span className="font-bold">Pro</span>
              </h1>
              <div className="flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isLogin ? "System Secure • v2.4.0" : "New User Registration"}
              </div>
            </div>

            {/* FORM */}
            <form action="/dashboard" className="space-y-5">
              
              <div className="space-y-4">
                
                {/* Full Name Input (Only for Signup) */}
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="overflow-hidden"
                    >
                      <div className="group mb-4">
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1.5 ml-1">Full Name</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors">
                            <User size={18} />
                          </div>
                          <input
                            type="text"
                            placeholder="Cpt. John Doe"
                            className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Input */}
                <div className="group">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1.5 ml-1">Captain's ID / Email</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="captain@fleet.com"
                      className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="group">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1.5 ml-1">{isLogin ? "Passcode" : "Create Passcode"}</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              </div>

              {/* Utility Links (Only for Login) */}
              <AnimatePresence>
                {isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="h-4 w-4 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all" />
                        <svg className="absolute inset-0 hidden peer-checked:block text-white pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-xs text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors">Keep me signed in</span>
                    </label>
                    
                    <a href="#" className="text-xs font-medium text-orange-600 hover:text-orange-500 transition-colors">
                      Reset Passcode
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                className="group relative w-full overflow-hidden rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black py-4 text-sm font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <span className="flex items-center justify-center gap-2">
                  {isLogin ? "Initialize Session" : "Grant Access"} <ArrowRight size={16} />
                </span>
              </button>

            </form>
          </div>

          {/* SYSTEM STATUS FOOTER */}
          <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-white/5 p-4 flex items-center justify-between text-[10px]">
             <div className="flex items-center gap-4 text-zinc-500 font-mono">
                <span className="flex items-center gap-1.5"><Waves size={12} /> Calm</span>
                <span className="flex items-center gap-1.5"><Wind size={12} /> 12kn NW</span>
             </div>
             <LiveTime />
          </div>

        </div>

        {/* Toggle Links */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500">
            {isLogin ? "Don't have credentials? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-zinc-900 dark:text-white font-bold hover:underline transition-colors ml-1"
            >
              {isLogin ? "Apply for Access" : "Sign In"}
            </button>
          </p>
        </div>

        <div className="relative z-20 mt-8 text-center">
          <p className="text-[10px] text-slate-300 font-medium font-mono uppercase tracking-wider">
            Powered by <span className="font-bold text">© Garia IT Solutions</span>
            <span className="mx-2">•</span>
            TM  2026
          </p>
        </div>

      </motion.div>
    </div>
  );
}