"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    Briefcase,
    MapPin,
    Edit,
    Camera,
    Save,
    X,
    BadgeCheck,
    Award,
    Calendar,
    ShieldCheck
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Types ---
interface Profile {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    job_title: string;
    bio: string;
    avatar_url?: string;
    skills: string[];
}

// --- Initial/Mock Data ---
const MOCK_PROFILE: Profile = {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@maritime.com",
    phone: "+1 (555) 0123-4567",
    job_title: "Chief Marine Engineer",
    bio: "Experienced marine engineer with over 10 years of service on commercial vessels. Specialized in propulsion systems and safety management. Dedicated to maintaining the highest standards of maritime safety and efficiency.",
    skills: ["Safety Management", "Propulsion Systems", "Team Leadership", "Naval Architecture", "First Aid"],
    avatar_url: ""
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile>(MOCK_PROFILE);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<Profile>(MOCK_PROFILE);

    // --- Fetch Profile ---
    useEffect(() => {
        async function fetchProfile() {
            try {
                // Attempt to fetch from backend
                // Note: Assuming proxy or CORS set up. using /api/profile if proxy exists, or direct if valid.
                // For now, we try to fetch from localhost:8000 via a direct call or relative path if proxied.
                // If the backend isn't running or reachable, we fall back to mock.

                const res = await fetch('http://localhost:8000/profile');
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    setFormData(data);
                    // toast.success("Profile loaded from backend");
                } else {
                    // If 404 or other error, stick to mock but maybe notify
                    console.warn("Backend profile not found or error, using mock.");
                }
            } catch (e) {
                console.warn("Failed to connect to backend, using mock data.", e);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const res = await fetch('http://localhost:8000/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const updated = res.ok ? await res.json() : formData;
            setProfile(updated);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (e) {
            // Fallback
            setProfile(formData);
            setIsEditing(false);
            toast.error("Backend unreachable, saved locally until refresh.");
        }
    };

    const handleCancel = () => {
        setFormData(profile);
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen w-full bg-transparent selection:bg-orange-500 selection:text-white p-6 md:p-10 pb-40">
            <div className="mx-auto max-w-[1200px]">

                {/* Header */}
                <header className="mb-10 flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
                    <div>
                        <h1 className="text-4xl font-light tracking-tighter text-zinc-900 dark:text-white">
                            My <span className="font-bold">Profile</span>
                        </h1>
                        <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mt-2">
                            Manage your personal information & settings
                        </p>
                    </div>
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase hover:opacity-90 transition-all shadow-md active:scale-95",
                            isEditing
                                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                : "bg-zinc-900 dark:bg-white text-white dark:text-black"
                        )}
                    >
                        {isEditing ? <Save size={14} /> : <Edit size={14} />}
                        <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 flex flex-col items-center text-center shadow-lg"
                        >
                            {/* Aurora Background Effect */}
                            <div className="absolute inset-0 bg-aurora opacity-30 z-0 pointer-events-none" />

                            <div className="relative z-10 mb-6 group">
                                <div className="w-32 h-32 rounded-full bg-zinc-100 dark:bg-zinc-900 border-4 border-white dark:border-zinc-800 shadow-xl overflow-hidden flex items-center justify-center">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={64} className="text-zinc-300 dark:text-zinc-700" />
                                    )}
                                </div>
                                {isEditing && (
                                    <button className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors">
                                        <Camera size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="relative z-10 w-full">
                                {isEditing ? (
                                    <div className="space-y-3 mb-4">
                                        <input
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            placeholder="First Name"
                                            className="w-full text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm focus:border-orange-500 outline-none"
                                        />
                                        <input
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            placeholder="Last Name"
                                            className="w-full text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm focus:border-orange-500 outline-none"
                                        />
                                        <input
                                            name="job_title"
                                            value={formData.job_title}
                                            onChange={handleInputChange}
                                            placeholder="Job Title"
                                            className="w-full text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-xs font-mono focus:border-orange-500 outline-none"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                                            {profile.first_name} {profile.last_name}
                                        </h2>
                                        <p className="text-sm font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-6">
                                            {profile.job_title}
                                        </p>
                                    </>
                                )}

                                <div className="flex flex-col gap-3 w-full text-left mt-6">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                        <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg text-zinc-500">
                                            <Mail size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] uppercase text-zinc-400 font-bold">Email</p>
                                            {isEditing ? (
                                                <input
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-transparent text-sm border-b border-zinc-300 focus:border-orange-500 outline-none p-0"
                                                />
                                            ) : (
                                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{profile.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                        <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg text-zinc-500">
                                            <Phone size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] uppercase text-zinc-400 font-bold">Phone</p>
                                            {isEditing ? (
                                                <input
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-transparent text-sm border-b border-zinc-300 focus:border-orange-500 outline-none p-0"
                                                />
                                            ) : (
                                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{profile.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Skills Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8"
                        >
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                <BadgeCheck className="text-orange-500" size={20} />
                                Skills & Certifications
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs font-bold rounded-full border border-zinc-200 dark:border-zinc-800">
                                        {skill}
                                    </span>
                                ))}
                                {isEditing && (
                                    <button className="px-3 py-1 bg-white dark:bg-zinc-950 text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-full text-xs font-bold hover:text-orange-500 hover:border-orange-500 transition-colors">
                                        + Add Skill
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Details & Stats */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Bio Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 relative overflow-hidden"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl text-orange-600 dark:text-orange-400">
                                    <User size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Professional Bio</h3>
                                    <p className="text-xs text-zinc-400 font-mono uppercase">Career Overview</p>
                                </div>
                            </div>

                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm text-zinc-700 dark:text-zinc-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none"
                                />
                            ) : (
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                                    {profile.bio}
                                </p>
                            )}
                        </motion.div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="p-6 rounded-[2rem] bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-xs font-mono opacity-60 uppercase tracking-widest mb-1">Experience</p>
                                    <h4 className="text-3xl font-light">12 <span className="text-sm font-bold opacity-60">Years</span></h4>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center">
                                    <Briefcase size={20} />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="p-6 rounded-[2rem] bg-orange-500 text-white flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-xs font-mono opacity-80 uppercase tracking-widest mb-1">Performance</p>
                                    <h4 className="text-3xl font-light">4.9 <span className="text-sm font-bold opacity-80">/ 5.0</span></h4>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                                    <Award size={20} />
                                </div>
                            </motion.div>
                        </div>

                        {/* Recent Activity / System Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-8"
                        >
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-widest">
                                System Status
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="text-emerald-500" size={20} />
                                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Account Verified</span>
                                    </div>
                                    <span className="text-xs font-mono text-zinc-400">ID: {profile.id}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-blue-500" size={20} />
                                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Last Login</span>
                                    </div>
                                    <span className="text-xs font-mono text-zinc-400">{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>

            </div>
            <Toaster position="top-right" theme="system" richColors />
        </div>
    );
}
