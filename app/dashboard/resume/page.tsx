"use client";

import { useState, useEffect } from "react";
import { ResumeForm } from "./components/ResumeForm";
import { ResumePreview } from "./components/ResumePreview";
import { ResumeData, generateResumePDF } from "@/app/lib/pdf-generator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FileText, Download, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { api } from "@/app/services/api";

const INITIAL_DATA: ResumeData = {
    personalInfo: {
        surname: "", middleName: "", firstName: "", nationality: "", dob: "", placeOfBirth: "", postApplied: "", dateAvailable: "", photoUrl: ""
    },
    contactInfo: {
        permanentAddress: { line1: "", line2: "", city: "", state: "", zip: "", mobile: "", email: "", airport: "" },
        presentAddress: { line1: "", line2: "", city: "", state: "", zip: "", mobile: "" }
    },
    documents: [],
    cocs: [],
    education: { institute: "", from: "", to: "", degree: "", grade: "", yearPassed: "" },
    stcwCourses: [],
    seaService: [],
    educationalQualification: { degree: "", sscMarks: "", hscMarks: "", hscPcmMarks: "" },
    nextOfKin: { name: "", relationship: "", address: "", contactNo: "" },
    physicalDescription: { hairColor: "", eyeColor: "", height: "", weight: "", boilerSuitSize: "", shoeSize: "" },
    strengths: "",
    miscellaneousRemarks: "",
    declarationDate: new Date().toISOString().split('T')[0],
    signatureImage: ""
};

function calculateDuration(signOn: string, signOff: string): string {
    if (!signOn || !signOff) return "";
    const start = new Date(signOn);
    const end = new Date(signOff);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    if (months > 0) {
        return `${months}m ${days}d`;
    }
    return `${days}d`;
}

function transformSeaTimeLogs(logs: any[]): ResumeData['seaService'] {
    return logs.map(log => ({
        vesselName: log.vesselName || "",
        flag: log.flag || "",
        type: log.type || "",
        grt: log.dwt?.toString() || "",
        company: log.company || "",
        rank: log.rank || "",
        signOn: log.signOn?.split('T')[0] || "",
        signOff: log.signOff?.split('T')[0] || "",
        totalDuration: calculateDuration(log.signOn, log.signOff)
    }));
}

function transformCertificatesToCocs(certs: any[]): ResumeData['cocs'] {
    const cocTypes = ['coc', 'competency', 'license', 'licence'];
    const cocCerts = certs.filter(c =>
        cocTypes.some(t => c.certType?.toLowerCase().includes(t)) ||
        c.certName?.toLowerCase().includes('competency') ||
        c.certName?.toLowerCase().includes('coc')
    );

    return cocCerts.map(cert => ({
        name: cert.certName || "",
        grade: cert.certType || "",
        issueDate: cert.issueDate?.split('T')[0] || "",
        expiryDate: cert.expiry?.split('T')[0] || "",
        number: cert.id?.toString() || "",
        issuedBy: cert.issuedBy || ""
    }));
}

function transformCertificatesToStcw(certs: any[]): ResumeData['stcwCourses'] {
    const stcwTypes = ['stcw', 'safety', 'fire', 'survival', 'medical', 'first aid', 'pssr', 'efa', 'pst', 'aff', 'fpff'];
    const stcwCerts = certs.filter(c =>
        stcwTypes.some(t => c.certType?.toLowerCase().includes(t)) ||
        stcwTypes.some(t => c.certName?.toLowerCase().includes(t))
    );

    return stcwCerts.map(cert => ({
        course: cert.certName || "",
        place: "",
        issueDate: cert.issueDate?.split('T')[0] || "",
        expiryDate: cert.expiry?.split('T')[0] || "",
        issuedBy: cert.issuedBy || "",
        refNo: cert.id?.toString() || ""
    }));
}

function transformDocuments(docs: any[]): ResumeData['documents'] {
    return docs.map(doc => ({
        name: doc.docName || "",
        number: doc.docID || "",
        issueDate: doc.issueDate?.split('T')[0] || "",
        expiryDate: doc.expiry?.split('T')[0] || "",
        placeOfIssue: "",
        remarks: doc.category || ""
    }));
}

export default function ResumePage() {
    const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_DATA);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);

                const token = localStorage.getItem("token");
                const [documents, certificates, seaTimeLogs, profile] = await Promise.all([
                    api.getDocuments().catch(() => []),
                    api.getCertificates().catch(() => []),
                    api.getSeaTimeLogs().catch(() => []),
                    fetch('http://localhost:8000/profile', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).then(res => res.ok ? res.json() : null).catch(() => null)
                ]);

                const parseJSON = (str: any, fallback: any) => {
                    try { return JSON.parse(str) || fallback; } catch { return fallback; }
                };

                setResumeData(prev => {
                    const data = { ...prev };

                    if (profile) {
                        data.personalInfo = {
                            surname: profile.last_name || "",
                            firstName: profile.first_name || "",
                            middleName: profile.middle_name || "",
                            nationality: profile.nationality || "",
                            dob: profile.dob ? profile.dob.split('T')[0] : "",
                            placeOfBirth: profile.place_of_birth || "",
                            postApplied: profile.job_title || "",
                            dateAvailable: profile.date_available ? profile.date_available.split('T')[0] : "",
                            photoUrl: profile.avatar_url || ""
                        };

                        const permAddr = parseJSON(profile.permanent_address, {});
                        const presAddr = parseJSON(profile.present_address, {});

                        data.contactInfo.permanentAddress = {
                            line1: permAddr.line1 || "",
                            line2: permAddr.line2 || "",
                            city: permAddr.city || "",
                            state: permAddr.state || "",
                            zip: permAddr.zip || "",
                            mobile: permAddr.mobile || profile.phone || "",
                            email: permAddr.email || profile.email || "",
                            airport: permAddr.airport || ""
                        };

                        data.contactInfo.presentAddress = {
                            line1: presAddr.line1 || "",
                            line2: presAddr.line2 || "",
                            city: presAddr.city || "",
                            state: presAddr.state || "",
                            zip: presAddr.zip || "",
                            mobile: presAddr.mobile || ""
                        };

                        const nok = parseJSON(profile.next_of_kin, {});
                        data.nextOfKin = {
                            name: nok.name || "",
                            relationship: nok.relationship || "",
                            address: nok.address || "",
                            contactNo: nok.contactNo || ""
                        };

                        const phys = parseJSON(profile.physical_description, {});
                        data.physicalDescription = {
                            hairColor: phys.hairColor || "",
                            eyeColor: phys.eyeColor || "",
                            height: phys.height || "",
                            weight: phys.weight || "",
                            boilerSuitSize: phys.boilerSuitSize || "",
                            shoeSize: phys.shoeSize || ""
                        };
                    }

                    return {
                        ...data,
                        documents: transformDocuments(documents),
                        cocs: transformCertificatesToCocs(certificates),
                        stcwCourses: transformCertificatesToStcw(certificates),
                        seaService: transformSeaTimeLogs(seaTimeLogs)
                    };
                });

                toast.success("Resume data loaded!");
            } catch (error) {
                console.error(error);
                toast.error("Could not load data.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    const validateForm = () => {
        const newErrors: Record<string, boolean> = {};
        let isValid = true;

        if (!resumeData.personalInfo.surname) newErrors["personalInfo.surname"] = true;
        if (!resumeData.personalInfo.firstName) newErrors["personalInfo.firstName"] = true;
        if (!resumeData.personalInfo.nationality) newErrors["personalInfo.nationality"] = true;
        if (!resumeData.contactInfo.permanentAddress.mobile) newErrors["contactInfo.permanentAddress.mobile"] = true;

        if (Object.keys(newErrors).length > 0) {
            isValid = false;
            setErrors(newErrors);
            toast.error("Please fill in all mandatory fields correctly.");
        } else {
            setErrors({});
        }
        return isValid;
    };

    const handleGenerate = () => {
        if (!validateForm()) return;

        try {
            generateResumePDF(resumeData);
            toast.success("Resume PDF generated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF. Check console for details.");
        }
    };

    return (
        <div className="min-h-screen bg-transparent pb-32 transition-colors duration-300">


            <main className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 md:gap-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-3xl sm:text-4xl font-light tracking-tighter text-zinc-900 dark:text-white truncate">
                            Resume<span className="font-bold text-orange-600">Generator</span>
                        </h1>
                        <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mt-1 truncate">
                            Professional Marine CV Builder
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="flex flex-1 sm:flex-none justify-center items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl font-mono text-[10px] sm:text-xs font-bold uppercase hover:opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            <Download size={14} /> <span>Download PDF</span>
                        </button>
                        <ThemeToggle />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-xl">
                                        <FileText size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Edit Details</h2>
                                </div>
                                {isLoading && (
                                    <div className="flex items-center gap-2 sm:ml-auto text-zinc-400">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Loading Data...</span>
                                    </div>
                                )}
                            </div>

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 size={40} className="animate-spin text-orange-500" />
                                    <p className="text-zinc-500 text-xs text-center font-bold uppercase tracking-widest">Compiling Records</p>
                                </div>
                            ) : (
                                <ResumeForm
                                    data={resumeData}
                                    onUpdate={setResumeData}
                                    onGenerate={handleGenerate}
                                    errors={errors}
                                />
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="sticky top-24">
                            <div className="bg-zinc-900 dark:bg-[#09090b] border border-zinc-800 rounded-2xl p-4 shadow-2xl overflow-hidden flex flex-col items-center">
                                <h3 className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-4">Live Preview</h3>

                                <div className="bg-zinc-800/50 dark:bg-zinc-900/50 w-full h-[60vh] sm:h-[70vh] rounded-xl overflow-y-auto overflow-x-hidden relative flex flex-col items-center py-8 custom-scrollbar">
                                    <div className="scale-[0.45] sm:scale-[0.55] xl:scale-[0.6] origin-top">
                                        <ResumePreview data={resumeData} />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}