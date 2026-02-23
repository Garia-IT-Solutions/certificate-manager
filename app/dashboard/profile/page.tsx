"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Edit,
    Camera,
    Save,
    X,
    BadgeCheck,
    Calendar,
    ShieldCheck,
    Heart,
    Ruler,
    Plus,
    Check,
    ChevronsUpDown
} from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DatePicker } from '@/components/ui/date-picker';

interface Profile {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string;
    nationality: string;
    place_of_birth: string;
    date_available: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    job_title: string;
    bio: string;
    permanent_address: string;
    present_address: string;
    next_of_kin: string;
    physical_description: string;
    avatar_url?: string;
    skills: string[];
    department?: string;
    rank?: string;
}

interface Address {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
    mobile: string;
    email?: string;
    airport?: string;
}

interface NextOfKin {
    name: string;
    relationship: string;
    address: string;
    contactNo: string;
}

interface PhysicalDescription {
    hairColor: string;
    eyeColor: string;
    height: string;
    weight: string;
    boilerSuitSize: string;
    shoeSize: string;
}

const COUNTRY_DATA = [
    { name: "Afghanistan", code: "+93" }, { name: "Albania", code: "+355" }, { name: "Algeria", code: "+213" },
    { name: "Andorra", code: "+376" }, { name: "Angola", code: "+244" }, { name: "Antigua and Barbuda", code: "+1-268" },
    { name: "Argentina", code: "+54" }, { name: "Armenia", code: "+374" }, { name: "Australia", code: "+61" },
    { name: "Austria", code: "+43" }, { name: "Azerbaijan", code: "+994" }, { name: "Bahamas", code: "+1-242" },
    { name: "Bahrain", code: "+973" }, { name: "Bangladesh", code: "+880" }, { name: "Barbados", code: "+1-246" },
    { name: "Belarus", code: "+375" }, { name: "Belgium", code: "+32" }, { name: "Belize", code: "+501" },
    { name: "Benin", code: "+229" }, { name: "Bhutan", code: "+975" }, { name: "Bolivia", code: "+591" },
    { name: "Bosnia and Herzegovina", code: "+387" }, { name: "Botswana", code: "+267" }, { name: "Brazil", code: "+55" },
    { name: "Brunei", code: "+673" }, { name: "Bulgaria", code: "+359" }, { name: "Burkina Faso", code: "+226" },
    { name: "Burundi", code: "+257" }, { name: "Cabo Verde", code: "+238" }, { name: "Cambodia", code: "+855" },
    { name: "Cameroon", code: "+237" }, { name: "Canada", code: "+1" }, { name: "Central African Republic", code: "+236" },
    { name: "Chad", code: "+235" }, { name: "Chile", code: "+56" }, { name: "China", code: "+86" },
    { name: "Colombia", code: "+57" }, { name: "Comoros", code: "+269" }, { name: "Congo", code: "+242" },
    { name: "Costa Rica", code: "+506" }, { name: "Croatia", code: "+385" }, { name: "Cuba", code: "+53" },
    { name: "Cyprus", code: "+357" }, { name: "Czech Republic", code: "+420" }, { name: "Denmark", code: "+45" },
    { name: "Djibouti", code: "+253" }, { name: "Dominica", code: "+1-767" }, { name: "Dominican Republic", code: "+1" },
    { name: "East Timor", code: "+670" }, { name: "Ecuador", code: "+593" }, { name: "Egypt", code: "+20" },
    { name: "El Salvador", code: "+503" }, { name: "Equatorial Guinea", code: "+240" }, { name: "Eritrea", code: "+291" },
    { name: "Estonia", code: "+372" }, { name: "Eswatini", code: "+268" }, { name: "Ethiopia", code: "+251" },
    { name: "Fiji", code: "+679" }, { name: "Finland", code: "+358" }, { name: "France", code: "+33" },
    { name: "Gabon", code: "+241" }, { name: "Gambia", code: "+220" }, { name: "Georgia", code: "+995" },
    { name: "Germany", code: "+49" }, { name: "Ghana", code: "+233" }, { name: "Greece", code: "+30" },
    { name: "Grenada", code: "+1-473" }, { name: "Guatemala", code: "+502" }, { name: "Guinea", code: "+224" },
    { name: "Guinea-Bissau", code: "+245" }, { name: "Guyana", code: "+592" }, { name: "Haiti", code: "+509" },
    { name: "Honduras", code: "+504" }, { name: "Hungary", code: "+36" }, { name: "Iceland", code: "+354" },
    { name: "India", code: "+91" }, { name: "Indonesia", code: "+62" }, { name: "Iran", code: "+98" },
    { name: "Iraq", code: "+964" }, { name: "Ireland", code: "+353" }, { name: "Israel", code: "+972" },
    { name: "Italy", code: "+39" }, { name: "Ivory Coast", code: "+225" }, { name: "Jamaica", code: "+1-876" },
    { name: "Japan", code: "+81" }, { name: "Jordan", code: "+962" }, { name: "Kazakhstan", code: "+7" },
    { name: "Kenya", code: "+254" }, { name: "Kiribati", code: "+686" }, { name: "Korea, North", code: "+850" },
    { name: "Korea, South", code: "+82" }, { name: "Kosovo", code: "+383" }, { name: "Kuwait", code: "+965" },
    { name: "Kyrgyzstan", code: "+996" }, { name: "Laos", code: "+856" }, { name: "Latvia", code: "+371" },
    { name: "Lebanon", code: "+961" }, { name: "Lesotho", code: "+266" }, { name: "Liberia", code: "+231" },
    { name: "Libya", code: "+218" }, { name: "Liechtenstein", code: "+423" }, { name: "Lithuania", code: "+370" },
    { name: "Luxembourg", code: "+352" }, { name: "Madagascar", code: "+261" }, { name: "Malawi", code: "+265" },
    { name: "Malaysia", code: "+60" }, { name: "Maldives", code: "+960" }, { name: "Mali", code: "+223" },
    { name: "Malta", code: "+356" }, { name: "Marshall Islands", code: "+692" }, { name: "Mauritania", code: "+222" },
    { name: "Mauritius", code: "+230" }, { name: "Mexico", code: "+52" }, { name: "Micronesia", code: "+691" },
    { name: "Moldova", code: "+373" }, { name: "Monaco", code: "+377" }, { name: "Mongolia", code: "+976" },
    { name: "Montenegro", code: "+382" }, { name: "Morocco", code: "+212" }, { name: "Mozambique", code: "+258" },
    { name: "Myanmar", code: "+95" }, { name: "Namibia", code: "+264" }, { name: "Nauru", code: "+674" },
    { name: "Nepal", code: "+977" }, { name: "Netherlands", code: "+31" }, { name: "New Zealand", code: "+64" },
    { name: "Nicaragua", code: "+505" }, { name: "Niger", code: "+227" }, { name: "Nigeria", code: "+234" },
    { name: "North Macedonia", code: "+389" }, { name: "Norway", code: "+47" }, { name: "Oman", code: "+968" },
    { name: "Pakistan", code: "+92" }, { name: "Palau", code: "+680" }, { name: "Panama", code: "+507" },
    { name: "Papua New Guinea", code: "+675" }, { name: "Paraguay", code: "+595" }, { name: "Peru", code: "+51" },
    { name: "Philippines", code: "+63" }, { name: "Poland", code: "+48" }, { name: "Portugal", code: "+351" },
    { name: "Qatar", code: "+974" }, { name: "Romania", code: "+40" }, { name: "Russia", code: "+7" },
    { name: "Rwanda", code: "+250" }, { name: "Saint Kitts and Nevis", code: "+1-869" }, { name: "Saint Lucia", code: "+1-758" },
    { name: "Saint Vincent and the Grenadines", code: "+1-784" }, { name: "Samoa", code: "+685" }, { name: "San Marino", code: "+378" },
    { name: "Sao Tome and Principe", code: "+239" }, { name: "Saudi Arabia", code: "+966" }, { name: "Senegal", code: "+221" },
    { name: "Serbia", code: "+381" }, { name: "Seychelles", code: "+248" }, { name: "Sierra Leone", code: "+232" },
    { name: "Singapore", code: "+65" }, { name: "Slovakia", code: "+421" }, { name: "Slovenia", code: "+386" },
    { name: "Solomon Islands", code: "+677" }, { name: "Somalia", code: "+252" }, { name: "South Africa", code: "+27" },
    { name: "South Sudan", code: "+211" }, { name: "Spain", code: "+34" }, { name: "Sri Lanka", code: "+94" },
    { name: "Sudan", code: "+249" }, { name: "Suriname", code: "+597" }, { name: "Sweden", code: "+46" },
    { name: "Switzerland", code: "+41" }, { name: "Syria", code: "+963" }, { name: "Taiwan", code: "+886" },
    { name: "Tajikistan", code: "+992" }, { name: "Tanzania", code: "+255" }, { name: "Thailand", code: "+66" },
    { name: "Togo", code: "+228" }, { name: "Tonga", code: "+676" }, { name: "Trinidad and Tobago", code: "+1-868" },
    { name: "Tunisia", code: "+216" }, { name: "Turkey", code: "+90" }, { name: "Turkmenistan", code: "+993" },
    { name: "Tuvalu", code: "+688" }, { name: "Uganda", code: "+256" }, { name: "Ukraine", code: "+380" },
    { name: "United Arab Emirates", code: "+971" }, { name: "United Kingdom", code: "+44" }, { name: "United States", code: "+1" },
    { name: "Uruguay", code: "+598" }, { name: "Uzbekistan", code: "+998" }, { name: "Vanuatu", code: "+678" },
    { name: "Vatican City", code: "+379" }, { name: "Venezuela", code: "+58" }, { name: "Vietnam", code: "+84" },
    { name: "Yemen", code: "+967" }, { name: "Zambia", code: "+260" }, { name: "Zimbabwe", code: "+263" }
];

const MOCK_PROFILE: Profile = {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    middle_name: "",
    nationality: "Indian",
    place_of_birth: "Mumbai",
    date_available: "",
    email: "john.doe@maritime.com",
    phone: "+1 (555) 0123-4567",
    dob: "1990-01-01",
    gender: "Male",
    job_title: "Chief Marine Engineer",
    bio: "Experienced marine engineer with over 10 years of service on commercial vessels.",
    permanent_address: '{"line1":"","line2":"","city":"","state":"","zip":"","mobile":"","email":"","airport":""}',
    present_address: '{"line1":"","line2":"","city":"","state":"","zip":"","mobile":""}',
    next_of_kin: '{"name":"","relationship":"","address":"","contactNo":""}',
    physical_description: '{"hairColor":"","eyeColor":"","height":"","weight":"","boilerSuitSize":"","shoeSize":""}',
    skills: ["Safety Management", "Propulsion Systems"],
    avatar_url: "",
    department: "ENGINE",
    rank: "Chief Marine Engineer"
};

const InputGroup = ({ label, name, value, onChange, isEditing, type = "text", placeholder = "", className = "" }: any) => (
    <div className={cn("space-y-1.5", className)}>
        <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider pl-1">{label}</label>
        {isEditing ? (
            <input
                type={type}
                name={name}
                value={value || ""}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-medium focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-zinc-100"
            />
        ) : (
            <p className="min-h-[42px] px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/30 border border-transparent rounded-xl flex items-center break-all text-xs font-bold text-zinc-800 dark:text-zinc-200">{value || "-"}</p>
        )}
    </div>
);

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile>(MOCK_PROFILE);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<Profile>(MOCK_PROFILE);

    const [permAddr, setPermAddr] = useState<Address>({} as Address);
    const [presAddr, setPresAddr] = useState<Address>({} as Address);
    const [nok, setNok] = useState<NextOfKin>({} as NextOfKin);
    const [physical, setPhysical] = useState<PhysicalDescription>({} as PhysicalDescription);
    const [newSkill, setNewSkill] = useState("");
    const [phoneDigits, setPhoneDigits] = useState("");

    const router = useRouter();

    const parseJSON = (str: string, fallback: any) => {
        try { return JSON.parse(str) || fallback; } catch { return fallback; }
    };

    const getDialCode = (countryName: string) => {
        const country = COUNTRY_DATA.find(c => c.name === countryName);
        return country ? country.code : "+";
    };

    const loadProfileData = (data: Profile) => {
        setProfile(data);
        setFormData(data);
        if (data.phone) {
            const code = getDialCode(data.nationality);
            if (data.phone.startsWith(code)) {
                setPhoneDigits(data.phone.replace(code, "").trim());
            } else {
                setPhoneDigits(data.phone);
            }
        } else {
            setPhoneDigits("");
        }
        setPermAddr(parseJSON(data.permanent_address, { line1: "", line2: "", city: "", state: "", zip: "", mobile: "", email: "", airport: "" }));
        setPresAddr(parseJSON(data.present_address, { line1: "", line2: "", city: "", state: "", zip: "", mobile: "" }));
        setNok(parseJSON(data.next_of_kin, { name: "", relationship: "", address: "", contactNo: "" }));
        setPhysical(parseJSON(data.physical_description, { hairColor: "", eyeColor: "", height: "", weight: "", boilerSuitSize: "", shoeSize: "" }));
    };

    useEffect(() => {
        async function fetchProfile() {
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                const res = await fetch('http://localhost:8000/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    loadProfileData(data);
                } else if (res.status === 401) {
                    localStorage.removeItem("token");
                    sessionStorage.removeItem("token");
                    router.push("/login");
                } else {
                    loadProfileData(MOCK_PROFILE);
                }
            } catch (e) {
                loadProfileData(MOCK_PROFILE);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (setter: any, field: string, value: string) => {
        setter((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) {
                toast.error("You are not logged in.");
                router.push("/login");
                return;
            }

            const payload = {
                ...formData,
                permanent_address: JSON.stringify(permAddr),
                present_address: JSON.stringify(presAddr),
                next_of_kin: JSON.stringify(nok),
                physical_description: JSON.stringify(physical)
            };

            const res = await fetch('http://localhost:8000/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const updated = res.ok ? await res.json() : payload;
            loadProfileData(updated);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
            window.dispatchEvent(new Event("profile-updated"));
        } catch (e) {
            toast.error("Backend unreachable, saved locally until refresh.");
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        loadProfileData(profile);
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen w-full bg-transparent selection:bg-orange-500 selection:text-white pb-32 transition-colors duration-300">
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 md:gap-8">

                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full border-b border-zinc-200 dark:border-zinc-800 pb-6">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-3xl sm:text-4xl font-light tracking-tighter text-zinc-900 dark:text-white truncate">
                            My<span className="font-bold text-[#FF3300]">Profile</span>
                        </h1>
                        <p className="font-mono text-[10px] sm:text-xs text-zinc-400 uppercase tracking-widest mt-1 truncate">
                            Manage your personal information & settings
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                        {isEditing && (
                            <button
                                onClick={handleCancel}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-[10px] sm:text-xs font-bold uppercase hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-zinc-500"
                            >
                                <X size={14} /> Cancel
                            </button>
                        )}
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className={cn(
                                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-[10px] sm:text-xs font-bold uppercase hover:opacity-90 transition-all shadow-md active:scale-95",
                                isEditing
                                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                    : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                            )}
                        >
                            {isEditing ? <Save size={14} /> : <Edit size={14} />}
                            <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

                    <div className="lg:col-span-1 space-y-6 sm:space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-8 flex flex-col items-center text-center shadow-sm"
                        >
                            <div className="relative z-10 mb-6 group mt-4">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-zinc-100 dark:bg-zinc-900 border-4 border-white dark:border-zinc-800 shadow-xl overflow-hidden flex items-center justify-center shrink-0">
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-zinc-300 dark:text-zinc-700 sm:w-16 sm:h-16" />
                                    )}
                                </div>
                                {isEditing && (
                                    <>
                                        <input
                                            type="file"
                                            id="pfp-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 5 * 1024 * 1024) {
                                                        toast.error("Image too large. Please upload an image under 5MB.");
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const base64String = reader.result as string;
                                                        setFormData(prev => ({ ...prev, avatar_url: base64String }));
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="pfp-upload"
                                            className="absolute bottom-0 right-0 p-2.5 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors cursor-pointer"
                                        >
                                            <Camera size={16} />
                                        </label>
                                    </>
                                )}
                            </div>

                            <div className="relative z-10 w-full space-y-4">
                                {isEditing ? (
                                    <>
                                        <div className="space-y-3">
                                            <input
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                placeholder="First Name"
                                                className="w-full text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-3 text-xs font-bold focus:border-orange-500 outline-none transition-colors"
                                            />
                                            <input
                                                name="middle_name"
                                                value={formData.middle_name}
                                                onChange={handleInputChange}
                                                placeholder="Middle Name"
                                                className="w-full text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-3 text-xs font-bold focus:border-orange-500 outline-none transition-colors"
                                            />
                                            <input
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleInputChange}
                                                placeholder="Last Name"
                                                className="w-full text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-3 text-xs font-bold focus:border-orange-500 outline-none transition-colors"
                                            />
                                            <input
                                                name="job_title"
                                                value={formData.job_title}
                                                onChange={handleInputChange}
                                                placeholder="Job Title"
                                                className="w-full text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-3 text-xs font-mono font-bold focus:border-orange-500 outline-none mt-4 transition-colors"
                                            />
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <select
                                                name="department"
                                                value={formData.department || "ENGINE"}
                                                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value, rank: "" }))}
                                                className="w-full text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-3 text-xs font-bold focus:border-orange-500 outline-none transition-colors"
                                            >
                                                <option value="ENGINE">ENGINE</option>
                                                <option value="DECK">DECK</option>
                                            </select>
                                            <select
                                                name="rank"
                                                value={formData.rank || ""}
                                                onChange={handleInputChange}
                                                className="w-full text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-3 text-xs font-bold focus:border-orange-500 outline-none transition-colors"
                                            >
                                                <option value="">Select Rank</option>
                                                {(formData.department === "DECK" ? [
                                                    "Master", "Chief Officer", "2nd Officer", "3rd Officer",
                                                    "Deck Cadet", "Bosun", "AB Seaman", "OS Seaman", "Tr Seaman"
                                                ] : [
                                                    "Chief Engineer", "2nd Engineer", "3rd Engineer", "4th Engineer",
                                                    "Junior Engineer", "Engine Cadet", "Motorman", "Oiler", "Fitter", "Tr Seaman"
                                                ]).map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-1 break-words">
                                            {profile.first_name} {profile.middle_name} {profile.last_name}
                                        </h2>
                                        <div className="flex flex-col gap-1 items-center mb-6">
                                            <p className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider break-words">
                                                {profile.rank || profile.job_title}
                                            </p>
                                            {profile.department && (
                                                <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">
                                                    {profile.department} Department
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="flex flex-col gap-3 w-full text-left mt-6">
                                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80">
                                        <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl text-zinc-500 shadow-sm">
                                            <Mail size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-0.5">Email</p>
                                            {isEditing ? (
                                                <input
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-transparent text-xs font-bold text-zinc-900 dark:text-white border-b border-zinc-300 dark:border-zinc-700 focus:border-orange-500 outline-none p-0 transition-colors"
                                                />
                                            ) : (
                                                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">{profile.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80">
                                        <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl text-zinc-500 shadow-sm">
                                            <Phone size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-0.5">Phone</p>
                                            {isEditing ? (
                                                <div className="flex items-center gap-2 border-b border-zinc-300 dark:border-zinc-700 focus-within:border-orange-500 transition-colors">
                                                    <div className="min-w-[40px] px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 select-none">
                                                            {getDialCode(formData.nationality)}
                                                        </span>
                                                    </div>
                                                    <input
                                                        name="phone"
                                                        value={phoneDigits}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                            setPhoneDigits(val);
                                                            const code = getDialCode(formData.nationality);
                                                            handleInputChange({ target: { name: 'phone', value: `${code} ${val}` } } as any);
                                                        }}
                                                        placeholder="1234567890"
                                                        className="flex-1 bg-transparent text-xs font-bold text-zinc-900 dark:text-white outline-none p-1 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 tracking-wide"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                                                        {profile.phone ? profile.phone.split(' ')[0] : '--'}
                                                    </span>
                                                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate tracking-wide">
                                                        {profile.phone ? profile.phone.split(' ').slice(1).join(' ') : 'Not provided'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-8 shadow-sm"
                        >
                            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-5 flex items-center gap-2">
                                <BadgeCheck className="text-orange-500 shrink-0" size={20} />
                                Skills & Certs
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.map((skill, i) => (
                                    <span key={i} className="group relative px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center gap-2 transition-all">
                                        {skill}
                                        {isEditing && (
                                            <button
                                                onClick={() => {
                                                    const newSkills = [...formData.skills];
                                                    newSkills.splice(i, 1);
                                                    setFormData(prev => ({ ...prev, skills: newSkills }));
                                                }}
                                                className="hover:text-red-500 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {isEditing && (
                                    <div className="flex items-center gap-2 mt-1 w-full sm:w-auto">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            placeholder="New Skill"
                                            className="px-4 py-2 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 flex-1 sm:w-32 sm:focus:w-40 transition-all outline-none focus:border-orange-500"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const value = newSkill.trim();
                                                    if (value) {
                                                        setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }));
                                                        setNewSkill("");
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                const value = newSkill.trim();
                                                if (value) {
                                                    setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }));
                                                    setNewSkill("");
                                                }
                                            }}
                                            className="p-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors shrink-0"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-2 space-y-6 sm:space-y-8">

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-8 shadow-sm relative overflow-hidden w-full"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl text-orange-600 dark:text-orange-500 shrink-0">
                                    <User size={24} strokeWidth={2} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white truncate">Professional Bio</h3>
                                    <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest truncate">Career Overview</p>
                                </div>
                            </div>

                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none resize-none transition-all"
                                />
                            ) : (
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-xs sm:text-sm font-medium whitespace-pre-wrap">
                                    {profile.bio}
                                </p>
                            )}
                        </motion.div>

                        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-8 shadow-sm w-full">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                                    <User size={24} strokeWidth={2} />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white truncate">Personal Details</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider pl-1">Date of Birth</label>
                                    {isEditing ? (
                                        <DatePicker
                                            date={formData.dob ? new Date(formData.dob) : undefined}
                                            setDate={(date: Date | undefined) => {
                                                const val = date ? date.toLocaleDateString('en-CA') : ""; // YYYY-MM-DD
                                                handleInputChange({ target: { name: 'dob', value: val } } as any);
                                            }}
                                            placeholder="Pick a date"
                                        />
                                    ) : (
                                        <p className="min-h-[42px] px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/30 border border-transparent rounded-xl flex items-center break-all text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                            {formData.dob ? new Date(formData.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "-"}
                                        </p>
                                    )}
                                </div>
                                <InputGroup isEditing={isEditing} label="Place of Birth" name="place_of_birth" value={formData.place_of_birth} onChange={handleInputChange} />
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider pl-1">Nationality</label>
                                    {isEditing ? (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    role="combobox"
                                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-left flex justify-between items-center outline-none focus:border-orange-500 transition-all text-zinc-900 dark:text-zinc-100"
                                                >
                                                    {formData.nationality || "Select nationality..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[280px] p-0 h-[300px]">
                                                <Command>
                                                    <CommandInput placeholder="Search country..." />
                                                    <CommandList>
                                                        <CommandEmpty>No country found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {COUNTRY_DATA.map((country) => (
                                                                <CommandItem
                                                                    key={country.name}
                                                                    value={country.name}
                                                                    onSelect={(currentValue) => {
                                                                        // Update nationality
                                                                        setFormData(prev => ({ ...prev, nationality: country.name }));

                                                                        // Also update phone code if phone digits exist
                                                                        // We trigger a phone update to sync the new code
                                                                        const code = country.code;
                                                                        setFormData(prev => ({ ...prev, phone: `${code} ${phoneDigits}` }));
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.nationality === country.name ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {country.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    ) : (
                                        <p className="min-h-[42px] px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/30 border border-transparent rounded-xl flex items-center break-all text-xs font-bold text-zinc-800 dark:text-zinc-200">{formData.nationality || "-"}</p>
                                    )}
                                </div>
                                <InputGroup isEditing={isEditing} label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} />
                                <div className="sm:col-span-2 space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider pl-1">Date Available</label>
                                    {isEditing ? (
                                        <DatePicker
                                            date={formData.date_available ? new Date(formData.date_available) : undefined}
                                            setDate={(date: Date | undefined) => {
                                                const val = date ? date.toLocaleDateString('en-CA') : "";
                                                handleInputChange({ target: { name: 'date_available', value: val } } as any);
                                            }}
                                            placeholder="Select availability date"
                                        />
                                    ) : (
                                        <p className="min-h-[42px] px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/30 border border-transparent rounded-xl flex items-center break-all text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                            {formData.date_available ? new Date(formData.date_available).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "-"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-8 shadow-sm w-full">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <MapPin size={24} strokeWidth={2} />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white truncate">Address & Contact</h3>
                            </div>

                            <div className="space-y-10 w-full">
                                <div className="w-full">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-5 pl-1">Permanent Address</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                                        <InputGroup isEditing={isEditing} label="Line 1" value={permAddr.line1} onChange={(e: any) => handleNestedChange(setPermAddr, 'line1', e.target.value)} className="sm:col-span-2" />
                                        <InputGroup isEditing={isEditing} label="Line 2" value={permAddr.line2} onChange={(e: any) => handleNestedChange(setPermAddr, 'line2', e.target.value)} className="sm:col-span-2" />
                                        <InputGroup isEditing={isEditing} label="City" value={permAddr.city} onChange={(e: any) => handleNestedChange(setPermAddr, 'city', e.target.value)} />
                                        <InputGroup isEditing={isEditing} label="State" value={permAddr.state} onChange={(e: any) => handleNestedChange(setPermAddr, 'state', e.target.value)} />
                                        <InputGroup isEditing={isEditing} label="Zip / Pin Code" value={permAddr.zip} onChange={(e: any) => handleNestedChange(setPermAddr, 'zip', e.target.value)} />
                                        <InputGroup isEditing={isEditing} label="Nearest Airport" value={permAddr.airport} onChange={(e: any) => handleNestedChange(setPermAddr, 'airport', e.target.value)} />
                                    </div>
                                </div>

                                <div className="w-full h-px bg-zinc-100 dark:bg-zinc-800" />

                                <div className="w-full">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-5 pl-1">Present Address</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                                        <InputGroup isEditing={isEditing} label="Line 1" value={presAddr.line1} onChange={(e: any) => handleNestedChange(setPresAddr, 'line1', e.target.value)} className="sm:col-span-2" />
                                        <InputGroup isEditing={isEditing} label="City" value={presAddr.city} onChange={(e: any) => handleNestedChange(setPresAddr, 'city', e.target.value)} />
                                        <InputGroup isEditing={isEditing} label="State" value={presAddr.state} onChange={(e: any) => handleNestedChange(setPresAddr, 'state', e.target.value)} />
                                        <InputGroup isEditing={isEditing} label="Zip / Pin Code" value={presAddr.zip} onChange={(e: any) => handleNestedChange(setPresAddr, 'zip', e.target.value)} className="sm:col-span-2" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full">
                            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-8 shadow-sm w-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400 shrink-0">
                                        <Ruler size={24} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white truncate">Physical Stats</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                    <InputGroup isEditing={isEditing} label="Height (cm)" value={physical.height} onChange={(e: any) => handleNestedChange(setPhysical, 'height', e.target.value.replace(/[^0-9.]/g, ''))} />
                                    <InputGroup isEditing={isEditing} label="Weight (kg)" value={physical.weight} onChange={(e: any) => handleNestedChange(setPhysical, 'weight', e.target.value.replace(/[^0-9.]/g, ''))} />
                                    <InputGroup isEditing={isEditing} label="Hair Color" value={physical.hairColor} onChange={(e: any) => handleNestedChange(setPhysical, 'hairColor', e.target.value)} />
                                    <InputGroup isEditing={isEditing} label="Eye Color" value={physical.eyeColor} onChange={(e: any) => handleNestedChange(setPhysical, 'eyeColor', e.target.value)} />
                                    <InputGroup isEditing={isEditing} label="Shoe Size (EU/UK)" value={physical.shoeSize} onChange={(e: any) => handleNestedChange(setPhysical, 'shoeSize', e.target.value.replace(/[^0-9.]/g, ''))} />
                                    <InputGroup isEditing={isEditing} label="Boiler Suit (Size)" value={physical.boilerSuitSize} onChange={(e: any) => handleNestedChange(setPhysical, 'boilerSuitSize', e.target.value)} />
                                </div>
                            </div>

                            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-8 shadow-sm w-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400 shrink-0">
                                        <Heart size={24} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white truncate">Next of Kin</h3>
                                </div>
                                <div className="space-y-4 w-full">
                                    <InputGroup isEditing={isEditing} label="Full Name" value={nok.name} onChange={(e: any) => handleNestedChange(setNok, 'name', e.target.value)} />
                                    <InputGroup isEditing={isEditing} label="Relationship" value={nok.relationship} onChange={(e: any) => handleNestedChange(setNok, 'relationship', e.target.value)} />
                                    <InputGroup isEditing={isEditing} label="Contact Number" value={nok.contactNo} onChange={(e: any) => handleNestedChange(setNok, 'contactNo', e.target.value)} />
                                    <InputGroup isEditing={isEditing} label="Complete Address" value={nok.address} onChange={(e: any) => handleNestedChange(setNok, 'address', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 p-5 sm:p-8 w-full"
                        >
                            <h3 className="text-[10px] font-bold text-zinc-500 mb-5 uppercase tracking-widest pl-1">
                                System Status & Security
                            </h3>
                            <div className="space-y-3 w-full">
                                <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-500 shrink-0">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">Account Verified</span>
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg shrink-0">ID: {profile.id}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-500 shrink-0">
                                            <Calendar size={18} />
                                        </div>
                                        <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">Last Login</span>
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg shrink-0">{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>

            </main>
        </div>
    );
}