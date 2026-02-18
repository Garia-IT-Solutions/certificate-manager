"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Anchor,
  Lock,
  Mail,
  Waves,
  Wind,
  Eye,
  EyeOff,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/app/services/api";

function LiveTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className="font-mono text-[10px] text-zinc-500">{time} UTC</span>;
}

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "reset" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [signupDept, setSignupDept] = useState<"ENGINE" | "DECK">("ENGINE");
  const [signupRank, setSignupRank] = useState("");

  const RANKS: Record<string, string[]> = {
    ENGINE: [
      "Chief Engineer", "Second Engineer", "Third Engineer", "Fourth Engineer",
      "Junior Engineer", "TME", "ETO", "EO", "Tr EO", "Fitter", "Motorman", "Wiper", "Tr Wiper", "Tr Seaman"
    ],
    DECK: [
      "Master", "Chief Officer", "Second Officer", "Third Officer", "Fourth Officer",
      "Cadet", "Bosun", "Chief Cook", "Pumpman", "Able Seaman", "Ordinary Seaman", "Tr Seaman", "GS"
    ]
  };

  const [resetStep, setResetStep] = useState<"email" | "otp" | "newPassword">("email");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newResetPass, setNewResetPass] = useState("");
  const [confirmResetPass, setConfirmResetPass] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.login({ email, password });

      localStorage.setItem("token", response.access_token);
      if (rememberMe) localStorage.setItem("remembered_user", email);

      setIsLoading(false);
      setIsRedirecting(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (err: any) {
      setIsLoading(false);
      const errMsg = err.response?.data?.detail || "Invalid credentials. Access Denied.";
      setError(errMsg);
      toast.error(errMsg);

      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPass !== confirmPass) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.register({
        first_name: firstName,
        last_name: lastName,
        email: signupEmail,
        password: signupPass,
        department: signupDept,
        rank: signupRank
      });
      toast.success("Crew member registered successfully");
      setMode("login");
      setEmail(signupEmail);
      setPassword("");
    } catch (err: any) {
      const errMsg = err.message || "Registration failed";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (resetStep === "email") {
        toast.info(`OTP sent to ${resetEmail}`);
        setResetStep("otp");
      }
      else if (resetStep === "otp") {
        if (otp === "123456") {
          setResetStep("newPassword");
        } else {
          toast.error("Invalid OTP. Use 123456 for demo.");
        }
      }
      else if (resetStep === "newPassword") {
        if (newResetPass === confirmResetPass && newResetPass.length >= 6) {
          toast.success("Password reset successful!");
          setMode("login");
          setResetStep("email");
          setResetEmail("");
          setOtp("");
          setNewResetPass("");
          setConfirmResetPass("");
        } else {
          toast.error("Passwords don't match or are too short");
        }
      }
    }, 1000);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 font-sans relative">

      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        layout
        animate={{
          scale: 1,
          y: 0,
          x: shake ? [-10, 10, -10, 10, 0] : 0
        }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className={cn(
          "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border rounded-[2rem] shadow-2xl overflow-hidden relative transition-colors duration-300",
          error ? "border-red-500/50" : "border-zinc-200 dark:border-zinc-800"
        )}>

          <div className={cn(
            "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent to-transparent opacity-50 transition-colors duration-500",
            isRedirecting ? "via-emerald-500" : error ? "via-red-500" : mode === 'signup' ? "via-emerald-500" : mode === 'reset' ? "via-blue-500" : "via-orange-500"
          )} />

          <div className="p-8">

            <div className="text-center mb-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white mb-5 shadow-inner">
                <Anchor size={28} strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-light tracking-tighter text-zinc-900 dark:text-white mb-1">
                Captain's<span className="font-bold">Log</span>
              </h1>

              <div className="flex items-center justify-center gap-2 text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse transition-colors",
                  isRedirecting ? "bg-emerald-500" : error ? "bg-red-500" : mode === 'signup' ? "bg-emerald-500" : mode === 'reset' ? "bg-blue-500" : "bg-orange-500"
                )} />
                {isRedirecting ? "AUTHENTICATED" : error ? "ERROR" : mode === 'signup' ? "NEW ENTRY" : mode === 'reset' ? `RECOVERY: ${resetStep}` : "SYSTEM ONLINE"}
              </div>
            </div>

            <div className="min-h-[260px]">
              <AnimatePresence mode="wait">

                {isRedirecting ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full py-10"
                  >
                    <div className="h-20 w-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mb-6" />
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Access Granted</h3>
                    <p className="text-xs text-zinc-500 font-mono mt-2 uppercase tracking-widest">Loading Dashboard...</p>
                  </motion.div>
                ) : (

                  mode === "login" && (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleLogin}
                      className="space-y-5"
                    >
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-3 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400"
                        >
                          <AlertCircle size={16} />
                          <span className="text-xs font-bold">{error}</span>
                        </motion.div>
                      )}

                      <div className="space-y-4">
                        <div className="group">
                          <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5 ml-1 tracking-wider">Captain's ID</label>
                          <div className="relative">
                            <div className={cn("absolute left-3 top-1/2 -translate-y-1/2 transition-colors", error ? "text-red-400" : "text-zinc-400 group-focus-within:text-orange-500")}>
                              <Mail size={16} />
                            </div>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => { setEmail(e.target.value); setError(""); }}
                              placeholder="id@fleet.com"
                              className={cn(
                                "w-full bg-zinc-50 dark:bg-zinc-900 border rounded-xl py-3.5 pl-10 pr-4 text-xs font-medium outline-none transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono",
                                error
                                  ? "border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                                  : "border-zinc-200 dark:border-zinc-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                              )}
                            />
                          </div>
                        </div>

                        <div className="group">
                          <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5 ml-1 tracking-wider">Passcode</label>
                          <div className="relative">
                            <div className={cn("absolute left-3 top-1/2 -translate-y-1/2 transition-colors", error ? "text-red-400" : "text-zinc-400 group-focus-within:text-orange-500")}>
                              <Lock size={16} />
                            </div>
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={password}
                              onChange={(e) => { setPassword(e.target.value); setError(""); }}
                              placeholder="••••••••"
                              className={cn(
                                "w-full bg-zinc-50 dark:bg-zinc-900 border rounded-xl py-3.5 pl-10 pr-10 text-xs font-medium outline-none transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono",
                                error
                                  ? "border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                                  : "border-zinc-200 dark:border-zinc-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            >
                              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="accent-orange-500 h-3 w-3"
                          />
                          <span className="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition-colors">Keep signed in</span>
                        </label>

                        <button type="button" onClick={() => setMode("reset")} className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 hover:text-orange-500 transition-colors">
                          Reset Passcode
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full overflow-hidden rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black py-3.5 text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-70"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Verifying...</span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">Initialize Session <ArrowRight size={14} /></span>
                        )}
                      </button>

                      <div className="text-center pt-2">
                        <button type="button" onClick={() => setMode("signup")} className="text-[10px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                          New here? <span className="underline decoration-zinc-300 underline-offset-2">Register Crew Member</span>
                        </button>
                      </div>
                    </motion.form>
                  )
                )}

                {mode === "signup" && !isRedirecting && (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSignup}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="group">
                        <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1 ml-1 tracking-wider">First Name</label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-xs font-medium outline-none focus:border-orange-500 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1 ml-1 tracking-wider">Last Name</label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-xs font-medium outline-none focus:border-orange-500 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1 ml-1 tracking-wider">Email Address</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><Mail size={16} /></div>
                        <input
                          type="email"
                          required
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="engineer@maritime.com"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs font-medium outline-none focus:border-orange-500 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1 ml-1 tracking-wider">Password</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><Lock size={16} /></div>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={signupPass}
                          onChange={(e) => setSignupPass(e.target.value)}
                          placeholder="Create password"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-10 text-xs font-medium outline-none focus:border-orange-500 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200">
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1 ml-1 tracking-wider">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><ShieldCheck size={16} /></div>
                        <input
                          type="password"
                          required
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                          placeholder="Confirm password"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs font-medium outline-none focus:border-orange-500 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5 ml-1 tracking-wider">Department</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => { setSignupDept("ENGINE"); setSignupRank(""); }}
                          className={cn(
                            "py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                            signupDept === "ENGINE"
                              ? "bg-orange-500/10 border-orange-500/50 text-orange-500"
                              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700"
                          )}
                        >
                          Engine
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSignupDept("DECK"); setSignupRank(""); }}
                          className={cn(
                            "py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                            signupDept === "DECK"
                              ? "bg-blue-500/10 border-blue-500/50 text-blue-500"
                              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700"
                          )}
                        >
                          Deck
                        </button>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5 ml-1 tracking-wider">Rank</label>
                      <select
                        required
                        value={signupRank}
                        onChange={(e) => setSignupRank(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-xs font-medium outline-none focus:border-orange-500 transition-all text-zinc-900 dark:text-white font-mono appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select your rank</option>
                        {RANKS[signupDept].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                      <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-orange-600 hover:bg-orange-500 text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-all shadow-lg disabled:opacity-70 flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : "Sign Up"}
                      </button>
                      <button type="button" onClick={() => setMode("login")} className="w-full py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}

                {mode === "reset" && !isRedirecting && (
                  <motion.form
                    key="reset"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleResetSubmit}
                    className="space-y-5"
                  >
                    {resetStep === "email" && (
                      <div className="space-y-4">
                        <div className="group">
                          <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5 ml-1 tracking-wider">Recovery Email</label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                              <RefreshCcw size={16} />
                            </div>
                            <input
                              type="email"
                              required
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              placeholder="id@fleet.com"
                              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3.5 pl-10 pr-4 text-xs font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono"
                            />
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-2 px-1">We'll send a verification code to this address.</p>
                        </div>
                      </div>
                    )}

                    {resetStep === "otp" && (
                      <div className="space-y-4">
                        <div className="group">
                          <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5 ml-1 tracking-wider">Verification Code</label>
                          <input
                            type="text"
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3.5 px-4 text-center text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono tracking-[0.5em]"
                          />
                          <p className="text-[10px] text-zinc-400 mt-2 px-1 text-center">Sent to {resetEmail}</p>
                        </div>
                      </div>
                    )}

                    {resetStep === "newPassword" && (
                      <div className="space-y-3">
                        <div className="group">
                          <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1 ml-1 tracking-wider">New Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Enter new password"
                            value={newResetPass}
                            onChange={(e) => setNewResetPass(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3.5 px-4 text-xs font-medium outline-none focus:border-blue-500 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono"
                          />
                        </div>
                        <div className="group">
                          <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1 ml-1 tracking-wider">Confirm Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Confirm new password"
                            value={confirmResetPass}
                            onChange={(e) => setConfirmResetPass(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3.5 px-4 text-xs font-medium outline-none focus:border-blue-500 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex flex-col gap-3">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-all shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> :
                          resetStep === "email" ? "Send Code" :
                            resetStep === "otp" ? "Verify Code" : "Reset Password"
                        }
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (resetStep === "otp") setResetStep("email");
                          else if (resetStep === "newPassword") setResetStep("otp");
                          else setMode("login");
                        }}
                        className="w-full py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                      >
                        {resetStep === "email" ? "Cancel Recovery" : "Go Back"}
                      </button>
                    </div>
                  </motion.form>
                )}

              </AnimatePresence>
            </div>

          </div>

          <div className="bg-zinc-50/80 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-4 text-zinc-500 font-mono">
            </div>
            <LiveTime />
          </div>

        </div>
      </motion.div>
    </div>
  );
}