"use client";

import { useState } from "react";
import { ResumeData } from "@/app/lib/pdf-generator";
import { Plus, Trash2, ChevronDown, ChevronUp, Save, FileText, Anchor, Award, BookOpen, MapPin, User, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResumeFormProps {
    data: ResumeData;
    onUpdate: (data: ResumeData) => void;
    onGenerate: () => void;
    errors: Record<string, boolean>;
}

const SectionHeader = ({ title, sectionId, icon: Icon, activeSection, toggleSection }: any) => (
    <button
        onClick={() => toggleSection(sectionId)}
        className={cn(
            "w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl mb-2 transition-all",
            activeSection === sectionId ? 'ring-1 ring-orange-500 border-orange-500' : ''
        )}
    >
        <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", activeSection === sectionId ? 'bg-orange-50 text-orange-600' : 'bg-zinc-100 text-zinc-500')}>
                <Icon size={18} />
            </div>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{title}</span>
        </div>
        {activeSection === sectionId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
);

const InputGroup = ({ label, value, onChange, type = "text", className = "", hasError = false }: any) => (
    <div className={className}>
        <label className={cn("text-[10px] uppercase font-bold mb-1 block flex items-center gap-1", hasError ? "text-red-500" : "text-zinc-500")}>
            {label} {hasError && <AlertCircle size={10} />}
        </label>
        <input
            type={type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                "w-full p-2 rounded-lg border bg-white dark:bg-black text-xs outline-none transition-all",
                hasError ? "border-red-500 ring-1 ring-red-500/50" : "border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-orange-500"
            )}
        />
    </div>
);

export function ResumeForm({ data, onUpdate, onGenerate, errors }: ResumeFormProps) {
    const [activeSection, setActiveSection] = useState<string | null>("personal");

    const handleChange = (section: keyof ResumeData, field: string, value: any, subSection?: string) => {
        const newData = { ...data };
        if (subSection && typeof newData[section] === 'object' && !Array.isArray(newData[section])) {
            // Handle nested objects like contactInfo.permanentAddress
            (newData[section] as any)[subSection] = {
                ...(newData[section] as any)[subSection],
                [field]: value
            };
        } else {
            (newData[section] as any)[field] = value;
        }
        onUpdate(newData);
    };

    const handleArrayChange = (section: keyof ResumeData, index: number, field: string, value: any) => {
        const newData = { ...data };
        if (Array.isArray(newData[section])) {
            const newArray = [...(newData[section] as any[])];
            newArray[index] = { ...newArray[index], [field]: value };
            (newData[section] as any) = newArray;
        }
        onUpdate(newData);
    };

    const addArrayItem = (section: 'seaService' | 'stcwCourses' | 'cocs' | 'documents') => {
        let newItem: any = {};
        if (section === 'seaService') {
            newItem = { vesselName: "", flag: "", type: "", grt: "", company: "", rank: "", signOn: "", signOff: "", totalDuration: "" };
        } else if (section === 'cocs') {
            newItem = { grade: "", issueDate: "", expiryDate: "", number: "", issuedBy: "" };
        } else if (section === 'stcwCourses') {
            newItem = { course: "", place: "", issueDate: "", expiryDate: "", issuedBy: "", refNo: "" };
        } else if (section === 'documents') {
            newItem = { name: "", number: "", issueDate: "", expiryDate: "", placeOfIssue: "", remarks: "" };
        }

        const newData = { ...data, [section]: [...(data[section] as any[]), newItem] };
        onUpdate(newData);
    };

    const removeArrayItem = (section: keyof ResumeData, index: number) => {
        // @ts-ignore
        const newData = { ...data, [section]: data[section].filter((_, i) => i !== index) };
        onUpdate(newData);
    };

    // Helper to update education (single object)
    const handleEducationChange = (field: string, value: string) => {
        const newData = { ...data, education: { ...data.education, [field]: value } };
        onUpdate(newData);
    };

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? null : section);
    };

    return (
        <div className="space-y-3 pb-20">
            {/* PERSONAL INFO */}
            <div>
                <SectionHeader title="Personal Information" sectionId="personal" icon={User} activeSection={activeSection} toggleSection={toggleSection} />
                <AnimatePresence>
                    {activeSection === "personal" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4 mb-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <InputGroup label="Surname" value={data.personalInfo.surname} onChange={(v: string) => handleChange("personalInfo", "surname", v)} hasError={errors["personalInfo.surname"]} />
                                    <InputGroup label="First Name" value={data.personalInfo.firstName} onChange={(v: string) => handleChange("personalInfo", "firstName", v)} hasError={errors["personalInfo.firstName"]} />
                                    <InputGroup label="Middle Name" value={data.personalInfo.middleName} onChange={(v: string) => handleChange("personalInfo", "middleName", v)} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <InputGroup label="Nationality" value={data.personalInfo.nationality} onChange={(v: string) => handleChange("personalInfo", "nationality", v)} hasError={errors["personalInfo.nationality"]} />
                                    <InputGroup label="Date of Birth" type="date" value={data.personalInfo.dob} onChange={(v: string) => handleChange("personalInfo", "dob", v)} hasError={errors["personalInfo.dob"]} />
                                    <InputGroup label="Place of Birth" value={data.personalInfo.placeOfBirth} onChange={(v: string) => handleChange("personalInfo", "placeOfBirth", v)} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <InputGroup label="Post Applied For" value={data.personalInfo.postApplied} onChange={(v: string) => handleChange("personalInfo", "postApplied", v)} hasError={errors["personalInfo.postApplied"]} />
                                    <InputGroup label="Date Available" value={data.personalInfo.dateAvailable} onChange={(v: string) => handleChange("personalInfo", "dateAvailable", v)} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* CONTACT INFO */}
            <div>
                <SectionHeader title="Address & Contact" sectionId="contact" icon={MapPin} activeSection={activeSection} toggleSection={toggleSection} />
                <AnimatePresence>
                    {activeSection === "contact" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4 mb-4">
                                <h4 className="font-bold text-xs text-zinc-500 uppercase">Permanent Address</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <InputGroup label="Line 1" value={data.contactInfo.permanentAddress.line1} onChange={(v: string) => handleChange("contactInfo", "line1", v, "permanentAddress")} />
                                    <InputGroup label="Line 2" value={data.contactInfo.permanentAddress.line2} onChange={(v: string) => handleChange("contactInfo", "line2", v, "permanentAddress")} />
                                    <div className="grid grid-cols-3 gap-3">
                                        <InputGroup label="City" value={data.contactInfo.permanentAddress.city} onChange={(v: string) => handleChange("contactInfo", "city", v, "permanentAddress")} />
                                        <InputGroup label="State" value={data.contactInfo.permanentAddress.state} onChange={(v: string) => handleChange("contactInfo", "state", v, "permanentAddress")} />
                                        <InputGroup label="Zip / Pin" value={data.contactInfo.permanentAddress.zip} onChange={(v: string) => handleChange("contactInfo", "zip", v, "permanentAddress")} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <InputGroup label="Mobile" value={data.contactInfo.permanentAddress.mobile} onChange={(v: string) => handleChange("contactInfo", "mobile", v, "permanentAddress")} hasError={errors["contactInfo.permanentAddress.mobile"]} />
                                        <InputGroup label="Email" value={data.contactInfo.permanentAddress.email} onChange={(v: string) => handleChange("contactInfo", "email", v, "permanentAddress")} hasError={errors["contactInfo.permanentAddress.email"]} />
                                        <InputGroup label="Nearest Airport" value={data.contactInfo.permanentAddress.airport} onChange={(v: string) => handleChange("contactInfo", "airport", v, "permanentAddress")} />
                                    </div>
                                </div>
                                <div className="border-t border-zinc-200 dark:border-zinc-800 my-4" />
                                <h4 className="font-bold text-xs text-zinc-500 uppercase">Present Address</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <InputGroup label="Line 1" value={data.contactInfo.presentAddress.line1} onChange={(v: string) => handleChange("contactInfo", "line1", v, "presentAddress")} />
                                    <div className="grid grid-cols-3 gap-3">
                                        <InputGroup label="City" value={data.contactInfo.presentAddress.city} onChange={(v: string) => handleChange("contactInfo", "city", v, "presentAddress")} />
                                        <InputGroup label="State" value={data.contactInfo.presentAddress.state} onChange={(v: string) => handleChange("contactInfo", "state", v, "presentAddress")} />
                                        <InputGroup label="Mobile" value={data.contactInfo.presentAddress.mobile} onChange={(v: string) => handleChange("contactInfo", "mobile", v, "presentAddress")} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* DOCUMENTS */}
            <div>
                <SectionHeader title="Documents (Passport / CDC / Visa)" sectionId="documents" icon={FileText} activeSection={activeSection} toggleSection={toggleSection} />
                <AnimatePresence>
                    {activeSection === "documents" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4 mb-4">
                                {data.documents.map((doc, index) => (
                                    <div key={index} className="p-3 bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800">
                                        <h5 className="font-bold text-xs mb-2 text-orange-600">{doc.name || "New Document"}</h5>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            <InputGroup label="Number" value={doc.number} onChange={(v: string) => handleArrayChange("documents", index, "number", v)} />
                                            <InputGroup label="Issue Date" type="date" value={doc.issueDate} onChange={(v: string) => handleArrayChange("documents", index, "issueDate", v)} />
                                            <InputGroup label="Expiry Date" type="date" value={doc.expiryDate} onChange={(v: string) => handleArrayChange("documents", index, "expiryDate", v)} />
                                            <InputGroup label="Place of Issue" value={doc.placeOfIssue} onChange={(v: string) => handleArrayChange("documents", index, "placeOfIssue", v)} />
                                            <InputGroup label="Remarks" value={doc.remarks} onChange={(v: string) => handleArrayChange("documents", index, "remarks", v)} />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addArrayItem("documents")} className="w-full py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center gap-2"><Plus size={14} /> Add Document</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* COCS */}
            <div>
                <SectionHeader title="Certificates of Competency" sectionId="cocs" icon={Award} activeSection={activeSection} toggleSection={toggleSection} />
                <AnimatePresence>
                    {activeSection === "cocs" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4 mb-4">
                                {data.cocs.map((coc, index) => (
                                    <div key={index} className="p-3 bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 relative">
                                        <button onClick={() => removeArrayItem("cocs", index)} className="absolute top-2 right-2 text-zinc-400 hover:text-red-500"><Trash2 size={14} /></button>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                            <InputGroup label="Grade" value={coc.grade} onChange={(v: string) => handleArrayChange("cocs", index, "grade", v)} />
                                            <InputGroup label="Issue Date" type="date" value={coc.issueDate} onChange={(v: string) => handleArrayChange("cocs", index, "issueDate", v)} />
                                            <InputGroup label="Expiry Date" type="date" value={coc.expiryDate} onChange={(v: string) => handleArrayChange("cocs", index, "expiryDate", v)} />
                                            <InputGroup label="Number" value={coc.number} onChange={(v: string) => handleArrayChange("cocs", index, "number", v)} />
                                            <InputGroup label="Issued By" value={coc.issuedBy} onChange={(v: string) => handleArrayChange("cocs", index, "issuedBy", v)} />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addArrayItem("cocs")} className="w-full py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center gap-2"><Plus size={14} /> Add CoC</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* EDUCATION */}
            <div>
                <SectionHeader title="Pre-Sea Training / Education" sectionId="education" icon={BookOpen} activeSection={activeSection} toggleSection={toggleSection} />
                <AnimatePresence>
                    {activeSection === "education" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4 mb-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <InputGroup label="Institute Name" value={data.education.institute} onChange={(v: string) => handleEducationChange("institute", v)} />
                                    <InputGroup label="Certificate / Degree" value={data.education.degree} onChange={(v: string) => handleEducationChange("degree", v)} />
                                    <InputGroup label="From" type="date" value={data.education.from} onChange={(v: string) => handleEducationChange("from", v)} />
                                    <InputGroup label="To" type="date" value={data.education.to} onChange={(v: string) => handleEducationChange("to", v)} />
                                    <InputGroup label="Grade / Percentage" value={data.education.grade} onChange={(v: string) => handleEducationChange("grade", v)} />
                                    <InputGroup label="Year Passed" value={data.education.yearPassed} onChange={(v: string) => handleEducationChange("yearPassed", v)} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* STCW */}
            <div>
                <SectionHeader title="STCW Courses" sectionId="stcw" icon={Award} activeSection={activeSection} toggleSection={toggleSection} />
                <AnimatePresence>
                    {activeSection === "stcw" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4 mb-4">
                                {data.stcwCourses.map((course, index) => (
                                    <div key={index} className="p-3 bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 relative">
                                        <button onClick={() => removeArrayItem("stcwCourses", index)} className="absolute top-2 right-2 text-zinc-400 hover:text-red-500"><Trash2 size={14} /></button>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            <InputGroup className="col-span-2 md:col-span-1" label="Course Name" value={course.course} onChange={(v: string) => handleArrayChange("stcwCourses", index, "course", v)} />
                                            <InputGroup label="Place" value={course.place} onChange={(v: string) => handleArrayChange("stcwCourses", index, "place", v)} />
                                            <InputGroup label="Issued By" value={course.issuedBy} onChange={(v: string) => handleArrayChange("stcwCourses", index, "issuedBy", v)} />
                                            <InputGroup label="Issue Date" type="date" value={course.issueDate} onChange={(v: string) => handleArrayChange("stcwCourses", index, "issueDate", v)} />
                                            <InputGroup label="Expiry Date" type="date" value={course.expiryDate} onChange={(v: string) => handleArrayChange("stcwCourses", index, "expiryDate", v)} />
                                            <InputGroup label="Certif No" value={course.refNo} onChange={(v: string) => handleArrayChange("stcwCourses", index, "refNo", v)} />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addArrayItem("stcwCourses")} className="w-full py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center gap-2"><Plus size={14} /> Add STCW Course</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* SEA SERVICE */}
            <div>
                <SectionHeader title="Sea Service Record" sectionId="sea" icon={Anchor} activeSection={activeSection} toggleSection={toggleSection} />
                <AnimatePresence>
                    {activeSection === "sea" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4 mb-4">
                                {data.seaService.map((item, index) => (
                                    <div key={index} className="p-4 bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 relative">
                                        <button onClick={() => removeArrayItem("seaService", index)} className="absolute top-2 right-2 text-zinc-400 hover:text-red-500"><Trash2 size={14} /></button>
                                        <h4 className="text-xs font-bold uppercase text-zinc-500 mb-3">Vessel {index + 1}</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <InputGroup label="Vessel Name" value={item.vesselName} onChange={(v: string) => handleArrayChange("seaService", index, "vesselName", v)} />
                                            <InputGroup label="Flag" value={item.flag} onChange={(v: string) => handleArrayChange("seaService", index, "flag", v)} />
                                            <InputGroup label="Type" value={item.type} onChange={(v: string) => handleArrayChange("seaService", index, "type", v)} />
                                            <InputGroup label="GRT" value={item.grt} onChange={(v: string) => handleArrayChange("seaService", index, "grt", v)} />
                                            <InputGroup label="Company" value={item.company} onChange={(v: string) => handleArrayChange("seaService", index, "company", v)} />
                                            <InputGroup label="Rank" value={item.rank} onChange={(v: string) => handleArrayChange("seaService", index, "rank", v)} />
                                            <InputGroup label="Sign On" type="date" value={item.signOn} onChange={(v: string) => handleArrayChange("seaService", index, "signOn", v)} />
                                            <InputGroup label="Sign Off" type="date" value={item.signOff} onChange={(v: string) => handleArrayChange("seaService", index, "signOff", v)} />
                                            <InputGroup label="Total Dur." value={item.totalDuration} onChange={(v: string) => handleArrayChange("seaService", index, "totalDuration", v)} />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addArrayItem("seaService")} className="w-full py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center gap-2"><Plus size={14} /> Add Vessel</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 flex gap-3">
                <button onClick={onGenerate} className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold uppercase shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Save size={18} /> Generate PDF Resume
                </button>
            </div>
        </div>
    );
}
