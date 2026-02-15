"use client";

import Link from "next/link";
import { Ship, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white p-4">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 rounded-full animate-pulse" />
                <Ship size={120} className="text-zinc-200 dark:text-zinc-800 relative z-10" />
                <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    404 Error
                </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-light tracking-tighter mb-4 text-center">
                Man <span className="font-bold text-orange-500">Overboard!</span>
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 text-center max-w-md mb-10 text-sm md:text-base leading-relaxed">
                We couldn't find the page you were looking for. It might have been moved, deleted, or never existed in the first place.
            </p>

            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                        <Home size={14} /> Bridge
                    </button>
                </Link>
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 px-6 py-3 bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                    <ArrowLeft size={14} /> Back
                </button>
            </div>

            <div className="absolute bottom-8 text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                Coordinates: 404° N / LOST° W
            </div>
        </div>
    );
}
