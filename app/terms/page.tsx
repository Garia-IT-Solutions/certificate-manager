"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 flex items-center justify-center">
            <div className="max-w-3xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors">
                    <ArrowLeft size={16} /> Back
                </Link>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Terms and Conditions</h1>

                    <div className="space-y-6 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                        <section>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
                            <p>By accessing and using this portal, you accept and agree to be bound by the terms and provision of this agreement.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">2. User Responsibilities</h2>
                            <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">3. Data Accuracy</h2>
                            <p>You certify that all information provided in your profile, including sea service records and certificates, is accurate and true to the best of your knowledge.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">4. Privacy Policy</h2>
                            <p>Matches to your personal data are governed by our Privacy Policy. We respect your privacy and handle your data with care.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">5. Termination</h2>
                            <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
