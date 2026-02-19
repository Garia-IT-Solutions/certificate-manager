"use client";

import { useState } from "react";
import { ResumeData } from "@/app/lib/pdf-generator";
import { Plus, Trash2, ChevronDown, ChevronUp, Save, FileText, Anchor, Award, BookOpen, MapPin, User, AlertCircle, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResumeFormProps {
    data: ResumeData;
    onUpdate: (data: ResumeData) => void;
    onGenerate: () => void;
    errors: Record<string, boolean>;
}

import { DatePicker } from "@/components/ui/date-picker";

const InputGroup = ({ label, value, onChange, type = "text", className = "", hasError = false }: any) => {
    if (type === "date") {
        return (
            <div className={className}>
                <label className={cn("text-[10px] uppercase font-bold mb-1 flex items-center gap-1", hasError ? "text-red-500" : "text-zinc-500")}>
                    {label} {hasError && <AlertCircle size={10} />}
                </label>
                <DatePicker
                    date={value ? new Date(value) : undefined}
                    setDate={(date) => onChange(date ? date.toLocaleDateString('en-CA') : "")}
                    placeholder="Pick a date"
                    className={cn(
                        "w-full bg-white dark:bg-black border-zinc-200 dark:border-zinc-800",
                        hasError && "border-red-500 ring-1 ring-red-500/50"
                    )}
                />
            </div>
        );
    }

    return (
        <div className={className}>
            <label className={cn("text-[10px] uppercase font-bold mb-1 flex items-center gap-1", hasError ? "text-red-500" : "text-zinc-500")}>
                {label} {hasError && <AlertCircle size={10} />}
            </label>
            <input
                type={type}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "w-full p-2.5 rounded-lg border bg-white dark:bg-black text-xs font-medium outline-none transition-all text-zinc-900 dark:text-zinc-100",
                    hasError ? "border-red-500 ring-1 ring-red-500/50" : "border-zinc-200 dark:border-zinc-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                )}
            />
        </div>
    );
};

const ImageUpload = ({ label, value, onChange, className = "" }: { label: string; value?: string; onChange: (base64: string) => void; className?: string }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={className}>
            <label className="text-[10px] uppercase font-bold mb-1 block text-zinc-500">{label}</label>
            <div className="flex items-center gap-3">
                {value ? (
                    <div className="relative">
                        <img src={value} alt={label} className="w-20 h-24 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800" />
                        <button
                            onClick={() => onChange("")}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                        >
                            <Trash2 size={10} />
                        </button>
                    </div>
                ) : (
                    <label className="w-20 h-24 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors bg-white dark:bg-black">
                        <Upload size={16} className="text-zinc-400" />
                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Upload</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                )}
            </div>
        </div>
    );
};

export function ResumeForm({ data, onUpdate, onGenerate, errors }: ResumeFormProps) {
    const [activeSection, setActiveSection] = useState<string | null>("personal");
    const [hiddenSections, setHiddenSections] = useState<string[]>([]);

    const handleChange = (section: keyof ResumeData, field: string, value: any, subSection?: string) => {
        const newData = { ...data };

        if (newData[section] === undefined) {
            (newData as any)[section] = {};
        }

        if (subSection && typeof newData[section] === 'object' && !Array.isArray(newData[section])) {
            (newData[section] as any)[subSection] = {
                ...(newData[section] as any)[subSection],
                [field]: value
            };
        } else if (typeof newData[section] === 'object' && !Array.isArray(newData[section])) {
            (newData as any)[section] = {
                ...(newData[section] as any),
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

    const addArrayItem = (section: 'seaService' | 'stcwCourses' | 'cocs' | 'documents' | 'otherCertificates') => {
        let newItem: any = {};
        if (section === 'seaService') {
            newItem = { vesselName: "", flag: "", type: "", dwt: "", bhp: "", engineType: "", company: "", rank: "", signOn: "", signOff: "", totalDuration: "" };
        } else if (section === 'cocs') {
            newItem = { name: "", grade: "", issueDate: "", expiryDate: "", number: "", issuedBy: "" };
        } else if (section === 'stcwCourses') {
            newItem = { course: "", place: "", issueDate: "", expiryDate: "", issuedBy: "", refNo: "" };
        } else if (section === 'documents') {
            newItem = { name: "", number: "", issueDate: "", expiryDate: "", placeOfIssue: "", remarks: "" };
        } else if (section === 'otherCertificates') {
            newItem = { name: "", issueDate: "", expiryDate: "", issuedBy: "" };
        }

        const newData = { ...data, [section]: [...(data[section] as any[]), newItem] };
        onUpdate(newData);
    };

    const removeArrayItem = (section: keyof ResumeData, index: number) => {
        const newData = { ...data, [section]: (data[section] as any[]).filter((_, i) => i !== index) };
        onUpdate(newData);
    };

    const handleEducationChange = (field: string, value: string) => {
        const newData = { ...data, education: { ...data.education, [field]: value } };
        onUpdate(newData);
    };

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? null : section);
    };

    const hideSection = (sectionId: string, sectionKey: keyof ResumeData) => {
        setHiddenSections([...hiddenSections, sectionId]);
        let newData = { ...data };
        if (sectionKey === 'education') {
            newData.education = { institute: "", from: "", to: "", degree: "", grade: "", yearPassed: "" };
        } else if (Array.isArray(newData[sectionKey])) {
            (newData[sectionKey] as any) = [];
        }
        onUpdate(newData);
    };

    const showSection = (sectionId: string) => {
        setHiddenSections(hiddenSections.filter(id => id !== sectionId));
        setActiveSection(sectionId);
    };

    const CustomSectionHeader = ({ title, sectionId, icon: Icon, sectionKey }: any) => (
        <div className={cn(
            "w-full flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl mb-2 transition-all group",
            activeSection === sectionId ? 'ring-1 ring-orange-500 border-orange-500' : 'hover:border-zinc-300 dark:hover:border-zinc-700'
        )}>
            <button onClick={() => toggleSection(sectionId)} className="flex-1 flex items-center gap-3 text-left">
                <div className={cn("p-2 rounded-lg transition-colors", activeSection === sectionId ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800')}>
                    <Icon size={16} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{title}</span>
            </button>
            <div className="flex items-center gap-1 sm:gap-2">
                {sectionId !== 'personal' && sectionId !== 'contact' && (
                    <button onClick={(e) => { e.stopPropagation(); hideSection(sectionId, sectionKey); }} className="p-2 text-zinc-400 hover:text-red-500 transition-colors bg-zinc-50 dark:bg-zinc-900 rounded-lg" title="Delete Section">
                        <Trash2 size={14} />
                    </button>
                )}
                <button onClick={() => toggleSection(sectionId)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                    {activeSection === sectionId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-3 pb-20">
            <div>
                <CustomSectionHeader title="Personal Information" sectionId="personal" icon={User} sectionKey="personalInfo" />
                <AnimatePresence>
                    {activeSection === "personal" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-4 mb-4">
                                <div className="flex flex-col sm:flex-row gap-5">
                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                            <InputGroup label="Surname" value={data.personalInfo.surname} onChange={(v: string) => handleChange("personalInfo", "surname", v)} hasError={errors["personalInfo.surname"]} />
                                            <InputGroup label="First Name" value={data.personalInfo.firstName} onChange={(v: string) => handleChange("personalInfo", "firstName", v)} hasError={errors["personalInfo.firstName"]} />
                                            <InputGroup label="Middle Name" value={data.personalInfo.middleName} onChange={(v: string) => handleChange("personalInfo", "middleName", v)} />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                            <InputGroup label="Nationality" value={data.personalInfo.nationality} onChange={(v: string) => handleChange("personalInfo", "nationality", v)} hasError={errors["personalInfo.nationality"]} />
                                            <InputGroup label="Date of Birth" type="date" value={data.personalInfo.dob} onChange={(v: string) => handleChange("personalInfo", "dob", v)} hasError={errors["personalInfo.dob"]} />
                                            <InputGroup label="Place of Birth" value={data.personalInfo.placeOfBirth} onChange={(v: string) => handleChange("personalInfo", "placeOfBirth", v)} />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <InputGroup label="Post Applied For" value={data.personalInfo.postApplied} onChange={(v: string) => handleChange("personalInfo", "postApplied", v)} hasError={errors["personalInfo.postApplied"]} />
                                            <InputGroup label="Date Available" type="date" value={data.personalInfo.dateAvailable} onChange={(v: string) => handleChange("personalInfo", "dateAvailable", v)} />
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-auto flex justify-center sm:justify-start border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 pt-4 sm:pt-0 sm:pl-5">
                                        <ImageUpload
                                            label="Passport Photo"
                                            value={data.personalInfo.photoUrl}
                                            onChange={(base64) => handleChange("personalInfo", "photoUrl", base64)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div>
                <CustomSectionHeader title="Address & Contact" sectionId="contact" icon={MapPin} sectionKey="contactInfo" />
                <AnimatePresence>
                    {activeSection === "contact" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-4 mb-4">
                                <h4 className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-md inline-block border border-zinc-200 dark:border-zinc-800">Permanent Address</h4>
                                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                    <InputGroup label="Line 1" value={data.contactInfo.permanentAddress.line1} onChange={(v: string) => handleChange("contactInfo", "line1", v, "permanentAddress")} />
                                    <InputGroup label="Line 2" value={data.contactInfo.permanentAddress.line2} onChange={(v: string) => handleChange("contactInfo", "line2", v, "permanentAddress")} />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                        <InputGroup label="City" value={data.contactInfo.permanentAddress.city} onChange={(v: string) => handleChange("contactInfo", "city", v, "permanentAddress")} />
                                        <InputGroup label="State" value={data.contactInfo.permanentAddress.state} onChange={(v: string) => handleChange("contactInfo", "state", v, "permanentAddress")} />
                                        <InputGroup label="Zip / Pin" value={data.contactInfo.permanentAddress.zip} onChange={(v: string) => handleChange("contactInfo", "zip", v, "permanentAddress")} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                        <InputGroup label="Mobile" value={data.contactInfo.permanentAddress.mobile} onChange={(v: string) => handleChange("contactInfo", "mobile", v, "permanentAddress")} hasError={errors["contactInfo.permanentAddress.mobile"]} />
                                        <InputGroup label="Email" value={data.contactInfo.permanentAddress.email} onChange={(v: string) => handleChange("contactInfo", "email", v, "permanentAddress")} />
                                        <InputGroup label="Nearest Airport" value={data.contactInfo.permanentAddress.airport} onChange={(v: string) => handleChange("contactInfo", "airport", v, "permanentAddress")} />
                                    </div>
                                </div>
                                <div className="border-t border-zinc-200 dark:border-zinc-800 my-6" />
                                <h4 className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-md inline-block border border-zinc-200 dark:border-zinc-800">Present Address</h4>
                                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                    <InputGroup label="Line 1" value={data.contactInfo.presentAddress.line1} onChange={(v: string) => handleChange("contactInfo", "line1", v, "presentAddress")} />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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

            {!hiddenSections.includes("documents") && (
                <div>
                    <CustomSectionHeader title="Documents" sectionId="documents" icon={FileText} sectionKey="documents" />
                    <AnimatePresence>
                        {activeSection === "documents" && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-4 mb-4">
                                    {data.documents.map((doc, index) => (
                                        <div key={index} className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 relative">
                                            <button onClick={() => removeArrayItem("documents", index)} className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"><Trash2 size={14} /></button>
                                            <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Document {index + 1}</h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                <InputGroup label="Document Name" value={doc.name} onChange={(v: string) => handleArrayChange("documents", index, "name", v)} />
                                                <InputGroup label="Number" value={doc.number} onChange={(v: string) => handleArrayChange("documents", index, "number", v)} />
                                                <InputGroup label="Issue Date" type="date" value={doc.issueDate} onChange={(v: string) => handleArrayChange("documents", index, "issueDate", v)} />
                                                <InputGroup label="Expiry Date" type="date" value={doc.expiryDate} onChange={(v: string) => handleArrayChange("documents", index, "expiryDate", v)} />
                                                <InputGroup label="Place of Issue" value={doc.placeOfIssue} onChange={(v: string) => handleArrayChange("documents", index, "placeOfIssue", v)} />
                                                <InputGroup label="Remarks" value={doc.remarks} onChange={(v: string) => handleArrayChange("documents", index, "remarks", v)} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem("documents")} className="w-full py-3 bg-zinc-200 dark:bg-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-2"><Plus size={14} /> Add Document</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {!hiddenSections.includes("cocs") && (
                <div>
                    <CustomSectionHeader title="Certificates of Competency" sectionId="cocs" icon={Award} sectionKey="cocs" />
                    <AnimatePresence>
                        {activeSection === "cocs" && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-4 mb-4">
                                    {data.cocs.map((coc, index) => (
                                        <div key={index} className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 relative">
                                            <button onClick={() => removeArrayItem("cocs", index)} className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"><Trash2 size={14} /></button>
                                            <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Certificate {index + 1}</h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                <InputGroup label="Name" value={coc.name} onChange={(v: string) => handleArrayChange("cocs", index, "name", v)} />
                                                <InputGroup label="Grade" value={coc.grade} onChange={(v: string) => handleArrayChange("cocs", index, "grade", v)} />
                                                <InputGroup label="Issue Date" type="date" value={coc.issueDate} onChange={(v: string) => handleArrayChange("cocs", index, "issueDate", v)} />
                                                <InputGroup label="Expiry Date" type="date" value={coc.expiryDate} onChange={(v: string) => handleArrayChange("cocs", index, "expiryDate", v)} />
                                                <InputGroup label="Number" value={coc.number} onChange={(v: string) => handleArrayChange("cocs", index, "number", v)} />
                                                <InputGroup label="Issued By" value={coc.issuedBy} onChange={(v: string) => handleArrayChange("cocs", index, "issuedBy", v)} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem("cocs")} className="w-full py-3 bg-zinc-200 dark:bg-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-2"><Plus size={14} /> Add CoC</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {!hiddenSections.includes("education") && (
                <div>
                    <CustomSectionHeader title="Pre-Sea Training / Education" sectionId="education" icon={BookOpen} sectionKey="education" />
                    <AnimatePresence>
                        {activeSection === "education" && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-4 mb-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                        <InputGroup className="sm:col-span-2 lg:col-span-1" label="Institute Name" value={data.education.institute} onChange={(v: string) => handleEducationChange("institute", v)} />
                                        <InputGroup className="sm:col-span-2 lg:col-span-1" label="Certificate / Degree" value={data.education.degree} onChange={(v: string) => handleEducationChange("degree", v)} />
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
            )}

            {!hiddenSections.includes("stcw") && (
                <div>
                    <CustomSectionHeader title="STCW Courses" sectionId="stcw" icon={Award} sectionKey="stcwCourses" />
                    <AnimatePresence>
                        {activeSection === "stcw" && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-4 mb-4">
                                    {data.stcwCourses.map((course, index) => (
                                        <div key={index} className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 relative">
                                            <button onClick={() => removeArrayItem("stcwCourses", index)} className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"><Trash2 size={14} /></button>
                                            <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Course {index + 1}</h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                <InputGroup className="sm:col-span-2 lg:col-span-1" label="Course Name" value={course.course} onChange={(v: string) => handleArrayChange("stcwCourses", index, "course", v)} />
                                                <InputGroup label="Place" value={course.place} onChange={(v: string) => handleArrayChange("stcwCourses", index, "place", v)} />
                                                <InputGroup label="Issued By" value={course.issuedBy} onChange={(v: string) => handleArrayChange("stcwCourses", index, "issuedBy", v)} />
                                                <InputGroup label="Issue Date" type="date" value={course.issueDate} onChange={(v: string) => handleArrayChange("stcwCourses", index, "issueDate", v)} />
                                                <InputGroup label="Expiry Date" type="date" value={course.expiryDate} onChange={(v: string) => handleArrayChange("stcwCourses", index, "expiryDate", v)} />
                                                <InputGroup label="Certif No" value={course.refNo} onChange={(v: string) => handleArrayChange("stcwCourses", index, "refNo", v)} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem("stcwCourses")} className="w-full py-3 bg-zinc-200 dark:bg-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-2"><Plus size={14} /> Add STCW Course</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {!hiddenSections.includes("otherCertificates") && data.otherCertificates && (
                <div>
                    <CustomSectionHeader title="Other Certificates" sectionId="otherCertificates" icon={Award} sectionKey="otherCertificates" />
                    <AnimatePresence>
                        {activeSection === "otherCertificates" && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-4 mb-4">
                                    {data.otherCertificates.map((cert, index) => (
                                        <div key={index} className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 relative">
                                            <button onClick={() => removeArrayItem("otherCertificates", index)} className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"><Trash2 size={14} /></button>
                                            <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Certificate {index + 1}</h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                <InputGroup className="sm:col-span-2 lg:col-span-1" label="Certificate Name" value={cert.name} onChange={(v: string) => handleArrayChange("otherCertificates", index, "name", v)} />
                                                <InputGroup label="Issued By" value={cert.issuedBy} onChange={(v: string) => handleArrayChange("otherCertificates", index, "issuedBy", v)} />
                                                <InputGroup label="Issue Date" type="date" value={cert.issueDate} onChange={(v: string) => handleArrayChange("otherCertificates", index, "issueDate", v)} />
                                                <InputGroup label="Expiry Date" type="date" value={cert.expiryDate} onChange={(v: string) => handleArrayChange("otherCertificates", index, "expiryDate", v)} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem("otherCertificates")} className="w-full py-3 bg-zinc-200 dark:bg-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-2"><Plus size={14} /> Add Other Certificate</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {!hiddenSections.includes("eduQual") && (
                <div>
                    <CustomSectionHeader title="Educational Qualification" sectionId="eduQual" icon={BookOpen} sectionKey="educationalQualification" />
                    <AnimatePresence>
                        {activeSection === "eduQual" && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-4 mb-4">
                                    <InputGroup label="Degree / Qualification" value={data.educationalQualification?.degree} onChange={(v: string) => handleChange("educationalQualification", "degree", v)} className="col-span-1 sm:col-span-2" />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                        <InputGroup label="S.S.C (10th) Marks" value={data.educationalQualification?.sscMarks} onChange={(v: string) => handleChange("educationalQualification", "sscMarks", v)} />
                                        <InputGroup label="H.S.C (12th) Marks" value={data.educationalQualification?.hscMarks} onChange={(v: string) => handleChange("educationalQualification", "hscMarks", v)} />
                                        <InputGroup label="H.S.C (PCM) Marks" value={data.educationalQualification?.hscPcmMarks} onChange={(v: string) => handleChange("educationalQualification", "hscPcmMarks", v)} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {!hiddenSections.includes("nextOfKin") && (
                <div>
                    <CustomSectionHeader title="Next of Kin" sectionId="nextOfKin" icon={User} sectionKey="nextOfKin" />
                    <AnimatePresence>
                        {activeSection === "nextOfKin" && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-4 mb-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <InputGroup label="Name" value={data.nextOfKin?.name} onChange={(v: string) => handleChange("nextOfKin", "name", v)} />
                                        <InputGroup label="Relationship" value={data.nextOfKin?.relationship} onChange={(v: string) => handleChange("nextOfKin", "relationship", v)} />
                                    </div>
                                    <InputGroup label="Address" value={data.nextOfKin?.address} onChange={(v: string) => handleChange("nextOfKin", "address", v)} />
                                    <InputGroup label="Contact No." value={data.nextOfKin?.contactNo} onChange={(v: string) => handleChange("nextOfKin", "contactNo", v)} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {!hiddenSections.includes("physical") && (
                <div>
                    <CustomSectionHeader title="Physical Description" sectionId="physical" icon={User} sectionKey="physicalDescription" />
                    <AnimatePresence>
                        {activeSection === "physical" && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-4 mb-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                        <InputGroup label="Hair Colour" value={data.physicalDescription?.hairColor} onChange={(v: string) => handleChange("physicalDescription", "hairColor", v)} />
                                        <InputGroup label="Eye Colour" value={data.physicalDescription?.eyeColor} onChange={(v: string) => handleChange("physicalDescription", "eyeColor", v)} />
                                        <InputGroup label="Height" value={data.physicalDescription?.height} onChange={(v: string) => handleChange("physicalDescription", "height", v)} />
                                        <InputGroup label="Weight" value={data.physicalDescription?.weight} onChange={(v: string) => handleChange("physicalDescription", "weight", v)} />
                                        <InputGroup label="Boiler Suit Size" value={data.physicalDescription?.boilerSuitSize} onChange={(v: string) => handleChange("physicalDescription", "boilerSuitSize", v)} />
                                        <InputGroup label="Safety Shoe Size" value={data.physicalDescription?.shoeSize} onChange={(v: string) => handleChange("physicalDescription", "shoeSize", v)} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {!hiddenSections.includes("sea") && (
                <div>
                    <CustomSectionHeader title="Sea Service Record" sectionId="sea" icon={Anchor} sectionKey="seaService" />
                    <AnimatePresence>
                        {activeSection === "sea" && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-4 mb-4">
                                    {data.seaService.map((item, index) => (
                                        <div key={index} className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 relative">
                                            <button onClick={() => removeArrayItem("seaService", index)} className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"><Trash2 size={14} /></button>
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Vessel {index + 1}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                                <InputGroup className="sm:col-span-2 lg:col-span-1" label="Vessel Name" value={item.vesselName} onChange={(v: string) => handleArrayChange("seaService", index, "vesselName", v)} />
                                                <InputGroup label="Flag" value={item.flag} onChange={(v: string) => handleArrayChange("seaService", index, "flag", v)} />
                                                <InputGroup label="Type" value={item.type} onChange={(v: string) => handleArrayChange("seaService", index, "type", v)} />
                                                <InputGroup label="DWT" value={item.dwt} onChange={(v: string) => handleArrayChange("seaService", index, "dwt", v)} />
                                                <InputGroup label="BHP" value={item.bhp} onChange={(v: string) => handleArrayChange("seaService", index, "bhp", v)} />
                                                <InputGroup label="Main Engine" value={item.engineType} onChange={(v: string) => handleArrayChange("seaService", index, "engineType", v)} />
                                                <InputGroup label="Company" value={item.company} onChange={(v: string) => handleArrayChange("seaService", index, "company", v)} />
                                                <InputGroup label="Rank" value={item.rank} onChange={(v: string) => handleArrayChange("seaService", index, "rank", v)} />
                                                <InputGroup label="Sign On" type="date" value={item.signOn} onChange={(v: string) => handleArrayChange("seaService", index, "signOn", v)} />
                                                <InputGroup label="Sign Off" type="date" value={item.signOff} onChange={(v: string) => handleArrayChange("seaService", index, "signOff", v)} />
                                                <InputGroup className="sm:col-span-2 lg:col-span-1" label="Total Dur." value={item.totalDuration} onChange={(v: string) => handleArrayChange("seaService", index, "totalDuration", v)} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem("seaService")} className="w-full py-3 bg-zinc-200 dark:bg-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-2"><Plus size={14} /> Add Vessel</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {!hiddenSections.includes("strengths") && (
                <div>
                    <CustomSectionHeader title="Strengths" sectionId="strengths" icon={Award} sectionKey="strengths" />
                    <AnimatePresence>
                        {activeSection === "strengths" && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-4 mb-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold mb-1.5 block text-zinc-500">Strengths</label>
                                        <textarea
                                            value={data.strengths || ""}
                                            onChange={(e) => onUpdate({ ...data, strengths: e.target.value })}
                                            rows={4}
                                            className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 resize-none text-zinc-900 dark:text-zinc-100"
                                            placeholder="Enter your key strengths..."
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {!hiddenSections.includes("miscRemarks") && (
                <div>
                    <CustomSectionHeader title="Miscellaneous Remarks" sectionId="miscRemarks" icon={FileText} sectionKey="miscellaneousRemarks" />
                    <AnimatePresence>
                        {activeSection === "miscRemarks" && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-4 mb-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold mb-1.5 block text-zinc-500">Miscellaneous Remarks</label>
                                        <textarea
                                            value={data.miscellaneousRemarks || ""}
                                            onChange={(e) => onUpdate({ ...data, miscellaneousRemarks: e.target.value })}
                                            rows={4}
                                            className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 resize-none text-zinc-900 dark:text-zinc-100"
                                            placeholder=""
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {hiddenSections.length > 0 && (
                <div className="bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 p-4 sm:p-5 rounded-xl">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Add Section</h5>
                    <div className="flex flex-wrap gap-2">
                        {hiddenSections.includes("documents") && (
                            <button onClick={() => showSection("documents")} className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2">
                                <FileText size={14} /> Documents
                            </button>
                        )}
                        {hiddenSections.includes("cocs") && (
                            <button onClick={() => showSection("cocs")} className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2">
                                <Award size={14} /> Certificates
                            </button>
                        )}
                        {hiddenSections.includes("education") && (
                            <button onClick={() => showSection("education")} className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2">
                                <BookOpen size={14} /> Education
                            </button>
                        )}
                        {hiddenSections.includes("stcw") && (
                            <button onClick={() => showSection("stcw")} className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2">
                                <Award size={14} /> STCW Courses
                            </button>
                        )}
                        {hiddenSections.includes("otherCertificates") && (
                            <button onClick={() => showSection("otherCertificates")} className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2">
                                <Award size={14} /> Other Certificates
                            </button>
                        )}
                        {hiddenSections.includes("sea") && (
                            <button onClick={() => showSection("sea")} className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2">
                                <Anchor size={14} /> Sea Service
                            </button>
                        )}
                        {hiddenSections.includes("eduQual") && (
                            <button onClick={() => showSection("eduQual")} className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2">
                                <BookOpen size={14} /> Educational Qualification
                            </button>
                        )}
                        {hiddenSections.includes("nextOfKin") && (
                            <button onClick={() => showSection("nextOfKin")} className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2">
                                <User size={14} /> Next of Kin
                            </button>
                        )}
                        {hiddenSections.includes("physical") && (
                            <button onClick={() => showSection("physical")} className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2">
                                <User size={14} /> Physical Description
                            </button>
                        )}
                        {hiddenSections.includes("strengths") && (
                            <button onClick={() => showSection("strengths")} className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2">
                                <Award size={14} /> Strengths
                            </button>
                        )}
                        {hiddenSections.includes("miscRemarks") && (
                            <button onClick={() => showSection("miscRemarks")} className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2">
                                <FileText size={14} /> Miscellaneous Remarks
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div>
                <div
                    className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all mb-2",
                        activeSection === "declaration"
                            ? "bg-orange-500/10 border border-orange-500/30 ring-1 ring-orange-500/50"
                            : "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-orange-500/50"
                    )}
                    onClick={() => setActiveSection(activeSection === "declaration" ? null : "declaration")}
                >
                    <div className={cn("p-1.5 rounded-lg", activeSection === "declaration" ? "bg-orange-500/20 text-orange-600" : "text-zinc-400")}>
                        <FileText size={16} strokeWidth={2.5} />
                    </div>
                    <span className={cn("font-bold text-sm", activeSection === "declaration" ? "text-orange-600 dark:text-orange-500" : "text-zinc-900 dark:text-zinc-100")}>
                        Declaration
                    </span>
                    <span className="ml-auto text-[9px] uppercase tracking-widest font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded">Required</span>
                </div>
                <AnimatePresence>
                    {activeSection === "declaration" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-4 mb-4">
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 italic leading-relaxed">
                                    "I hereby declare that the information furnished above is true to the best of my knowledge."
                                </p>
                                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
                                    <InputGroup
                                        label="Date"
                                        type="date"
                                        value={data.declarationDate || ""}
                                        onChange={(v: string) => onUpdate({ ...data, declarationDate: v })}
                                        className="w-full sm:flex-1"
                                    />
                                    <div className="w-full sm:w-auto pt-2 sm:pt-0">
                                        <ImageUpload
                                            label="Signature"
                                            value={data.signatureImage}
                                            onChange={(base64) => onUpdate({ ...data, signatureImage: base64 })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="pt-4 flex gap-3 lg:hidden">
                <button onClick={onGenerate} className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                    <Save size={16} /> Generate PDF Resume
                </button>
            </div>
        </div>
    );
}