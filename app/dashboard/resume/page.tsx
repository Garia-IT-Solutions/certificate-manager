"use client";

import { useState } from "react";
import { ResumeForm } from "./components/ResumeForm";
import { ResumePreview } from "./components/ResumePreview";
import { ResumeData, generateResumePDF } from "@/app/lib/pdf-generator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FileText, Download } from "lucide-react";
import { toast, Toaster } from "sonner";

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

export default function ResumePage() {
    const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_DATA);
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const validateForm = () => {
        const newErrors: Record<string, boolean> = {};
        let isValid = true;

        if (!resumeData.personalInfo.surname) newErrors["personalInfo.surname"] = true;
        if (!resumeData.personalInfo.firstName) newErrors["personalInfo.firstName"] = true;
        if (!resumeData.personalInfo.nationality) newErrors["personalInfo.nationality"] = true;

        if (!resumeData.contactInfo.permanentAddress.mobile) newErrors["contactInfo.permanentAddress.mobile"] = true;
        if (!resumeData.contactInfo.permanentAddress.email) newErrors["contactInfo.permanentAddress.email"] = true;

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
            console.error("PDF Generation Error:", error);
            toast.error("Failed to generate PDF. Check console for details.");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            <Toaster position="top-center" richColors />

            {/* HEADER */}
            <header className="px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <h1 className="text-3xl font-light tracking-tighter">Resume<span className="font-bold text-orange-600">Generator</span></h1>
                    <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Professional Marine CV Builder</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleGenerate}
                        className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase hover:opacity-90 transition-all shadow-md active:scale-95"
                    >
                        <Download size={14} /> <span>Download PDF</span>
                    </button>
                    <ThemeToggle />
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* FORM SECTION */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                                <FileText size={20} />
                            </div>
                            <h2 className="text-xl font-bold">Edit Details</h2>
                        </div>

                        <ResumeForm
                            data={resumeData}
                            onUpdate={setResumeData}
                            onGenerate={handleGenerate}
                            errors={errors}
                        />
                    </div>
                </div>

                {/* PREVIEW SECTION */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                    <div className="sticky top-8">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl overflow-hidden flex flex-col items-center">
                            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">Live Preview</h3>

                            {/* Scrollable Container */}
                            <div className="bg-zinc-800/50 w-full h-[70vh] rounded-xl overflow-y-auto overflow-x-hidden relative flex flex-col items-center py-8 custom-scrollbar">
                                <div className="scale-[0.5] sm:scale-[0.6] origin-top">
                                    <ResumePreview data={resumeData} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                            <p><strong>Note:</strong> The PDF generation runs entirely in your browser. No data is sent to any server.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
