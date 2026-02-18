"use client";
import Link from "next/link";
import { ArrowLeft, Anchor } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TermsPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 font-sans relative">
            {/* Background Glow */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl relative z-10"
            >
                <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden relative">

                    {/* Top Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />

                    <div className="p-8 md:p-12">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-orange-500 transition-colors mb-8 group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>

                        <div className="text-center mb-10">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white mb-4 shadow-inner">
                                <Anchor size={24} strokeWidth={2} />
                            </div>
                            <h1 className="text-3xl font-light tracking-tighter text-zinc-900 dark:text-white mb-2">
                                Terms & <span className="font-bold">Conditions</span>
                            </h1>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-widest">
                                Valid as of {new Date().getFullYear()}
                            </p>
                        </div>

                        <div className="space-y-8 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                            <section>
                                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                                    <span className="text-orange-500">01.</span> Acceptance of Terms
                                </h2>
                                <p className="ml-6">By accessing and using this portal, you accept and agree to be bound by the terms and provision of this agreement.</p>
                            </section>

                            <section>
                                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                                    <span className="text-orange-500">02.</span> User Responsibilities
                                </h2>
                                <p className="ml-6">You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
                            </section>

                            <section>
                                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                                    <span className="text-orange-500">03.</span> Data Accuracy
                                </h2>
                                <p className="ml-6">You certify that all information provided in your profile, including sea service records and certificates, is accurate and true to the best of your knowledge.</p>
                            </section>

                            <section>
                                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                                    <span className="text-orange-500">04.</span> Privacy Policy
                                </h2>
                                <p className="ml-6">Matches to your personal data are governed by our Privacy Policy. We respect your privacy and handle your data with care.</p>
                            </section>

                            <section>
                                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                                    <span className="text-orange-500">05.</span> Termination
                                </h2>
                                <p className="ml-6">We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                            </section>
                        </div>
                    </div>

                    <div className="bg-zinc-50/80 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 p-4 text-center">
                        <p className="text-[10px] text-zinc-400 font-mono">

                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
