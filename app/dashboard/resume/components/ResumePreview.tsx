"use client";

import { ResumeData } from "@/app/lib/pdf-generator";
import { cn } from "@/lib/utils";

interface ResumePreviewProps {
    data: ResumeData;
    className?: string;
    id?: string;
}

export function ResumePreview({ data, className, id }: ResumePreviewProps) {
    // Helper for empty rows to maintain structure if data is missing
    const ensureRows = (data: any[], count: number) => {
        const filled = [...data];
        while (filled.length < count) filled.push({});
        return filled;
    };

    return (
        <div id={id} className={cn("bg-white text-black font-serif p-[8mm] shadow-2xl min-h-[297mm] w-[210mm]", className)}>

            {/* HEADER */}
            <div className="text-center mb-6">
                <h1 className="text-xl font-bold uppercase underline underline-offset-4 decoration-2">CURRICULUM VITAE</h1>
            </div>

            {/* PERSONAL DATA */}
            <div className="border border-black mb-1 text-[11px] leading-tight">
                <div className="p-1 font-bold border-b border-black bg-gray-100">PERSONAL DATA:</div>

                <div className="flex border-b border-black h-32">
                    <div className="flex-1 p-2 space-y-4">
                        <div className="grid grid-cols-[80px_1fr_80px_1fr_80px_1fr] gap-2">
                            <span className="font-bold">Surname:</span> <span>{data.personalInfo.surname.toUpperCase()}</span>
                            <span className="font-bold">Middle Name:</span> <span>{data.personalInfo.middleName.toUpperCase()}</span>
                            <span className="font-bold">First Name:</span> <span>{data.personalInfo.firstName.toUpperCase()}</span>
                        </div>
                        <div className="grid grid-cols-[80px_1fr_80px_1fr_80px_1fr] gap-2 mt-4">
                            <span className="font-bold">Nationality:</span> <span>{data.personalInfo.nationality.toUpperCase()}</span>
                            <span className="font-bold">DATE OF BIRTH:</span> <span>{data.personalInfo.dob}</span>
                            <span className="font-bold">PLACE:</span> <span>{data.personalInfo.placeOfBirth.toUpperCase()}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr_120px_1fr] gap-2 mt-4">
                            <span className="font-bold">Post applied for:</span> <span className="font-bold">{data.personalInfo.postApplied.toUpperCase()}</span>
                            <span className="font-bold">Date available:</span> <span>{data.personalInfo.dateAvailable.toUpperCase()}</span>
                        </div>
                    </div>
                    <div className="w-32 border-l border-black flex items-center justify-center bg-gray-50">
                        {/* Photo Placeholder */}
                        <span className="text-gray-400 text-[9px] text-center">PASSPORT SIZE<br />PHOTO</span>
                    </div>
                </div>

                {/* ADDRESSES */}
                <div className="grid grid-cols-2 border-b border-black text-[10px]">
                    <div className="p-2 border-r border-black">
                        <span className="font-bold">Permanent Address:</span> {data.contactInfo.permanentAddress.line1}, {data.contactInfo.permanentAddress.line2}, {data.contactInfo.permanentAddress.city}, {data.contactInfo.permanentAddress.state}, {data.contactInfo.permanentAddress.zip}
                    </div>
                    <div className="grid grid-cols-[50px_1fr] p-2">
                        <span className="font-bold">Mobile:</span> <span>{data.contactInfo.permanentAddress.mobile}</span>
                        <span className="font-bold">E-mail:</span> <span>{data.contactInfo.permanentAddress.email}</span>
                        <span className="font-bold">Nearest Airport:</span> <span>{data.contactInfo.permanentAddress.airport}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 border-b border-black text-[10px]">
                    <div className="p-2 border-r border-black">
                        <span className="font-bold">Present Address:</span> {data.contactInfo.presentAddress.line1}
                        {data.contactInfo.presentAddress.line1 && <br />}
                        {data.contactInfo.presentAddress.line2}, {data.contactInfo.presentAddress.city}, {data.contactInfo.presentAddress.state} - {data.contactInfo.presentAddress.zip}
                    </div>
                    <div className="p-2 flex items-center">
                        <span className="font-bold mr-2">Mobile:</span> <span>{data.contactInfo.presentAddress.mobile}</span>
                    </div>
                </div>

                {/* DOCUMENTS TABLE */}
                <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="border-r border-black p-1 w-1/4">Documents</th>
                            <th className="border-r border-black p-1">Number</th>
                            <th className="border-r border-black p-1">Date of Issue</th>
                            <th className="border-r border-black p-1">Date of Expiry</th>
                            <th className="border-r border-black p-1">Place Of Issue</th>
                            <th className="p-1">remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.documents.map((doc, i) => (
                            <tr key={i} className="border-b border-black last:border-0">
                                <td className="border-r border-black p-1 font-bold">{doc.name}</td>
                                <td className="border-r border-black p-1">{doc.number}</td>
                                <td className="border-r border-black p-1">{doc.issueDate}</td>
                                <td className="border-r border-black p-1">{doc.expiryDate}</td>
                                <td className="border-r border-black p-1">{doc.placeOfIssue}</td>
                                <td className="p-1">{doc.remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* COC TABLE */}
            <div className="border border-black mb-1 text-[10px]">
                <div className="text-center font-bold border-b border-black bg-gray-100 p-0.5">DETAILS OF LICENCES/CERTIFICATES OF COMPETENCY</div>
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="border-r border-black p-1">Grade</th>
                            <th className="border-r border-black p-1">Date of issue</th>
                            <th className="border-r border-black p-1">Date of expiry</th>
                            <th className="border-r border-black p-1">Number</th>
                            <th className="p-1">Issued by</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ensureRows(data.cocs, 3).map((coc, i) => (
                            <tr key={i} className="border-b border-black last:border-0 h-5">
                                <td className="border-r border-black p-1">{coc.grade}</td>
                                <td className="border-r border-black p-1">{coc.issueDate}</td>
                                <td className="border-r border-black p-1">{coc.expiryDate}</td>
                                <td className="border-r border-black p-1">{coc.number}</td>
                                <td className="p-1">{coc.issuedBy}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* EDUCATION / PRE-SEA */}
            <div className="border border-black mb-1 text-[10px]">
                <div className="text-center font-bold border-b border-black bg-gray-100 p-0.5">RECORD OF PRE-SEA TRAINING / COLLEGE</div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-black text-center">
                            <th className="border-r border-black p-1 w-1/3">Institute</th>
                            <th className="border-r border-black p-1">From</th>
                            <th className="border-r border-black p-1">To</th>
                            <th className="border-r border-black p-1">Name of Certificate</th>
                            <th className="border-r border-black p-1">Grade/Percentage</th>
                            <th className="p-1">Year passed</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="h-8">
                            <td className="border-r border-black p-1">{data.education.institute}</td>
                            <td className="border-r border-black p-1 text-center">{data.education.from}</td>
                            <td className="border-r border-black p-1 text-center">{data.education.to}</td>
                            <td className="border-r border-black p-1">{data.education.degree}</td>
                            <td className="border-r border-black p-1 text-center">{data.education.grade}</td>
                            <td className="p-1 text-center">{data.education.yearPassed}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* STCW COURSES */}
            <div className="border border-black mb-1 text-[10px]">
                <div className="text-center font-bold border-b border-black bg-gray-100 p-0.5">DETAILS OF STCW COURSES</div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-black text-center">
                            <th className="border-r border-black p-1 w-1/3">Course Name</th>
                            <th className="border-r border-black p-1">Place of issue</th>
                            <th className="border-r border-black p-1">Date of issue</th>
                            <th className="border-r border-black p-1">Date of expiry</th>
                            <th className="border-r border-black p-1">Issued by</th>
                            <th className="p-1">Certif No</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ensureRows(data.stcwCourses, 5).map((c, i) => (
                            <tr key={i} className="border-b border-black last:border-0 h-4">
                                <td className="border-r border-black p-0.5 pl-1">{c.course}</td>
                                <td className="border-r border-black p-0.5 pl-1">{c.place}</td>
                                <td className="border-r border-black p-0.5 text-center">{c.issueDate}</td>
                                <td className="border-r border-black p-0.5 text-center">{c.expiryDate}</td>
                                <td className="border-r border-black p-0.5 pl-1">{c.issuedBy}</td>
                                <td className="p-0.5 pl-1">{c.refNo}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* SEA SERVICE */}
            <div className="border border-black mb-1 text-[10px]">
                <div className="font-bold border-b border-black bg-gray-100 p-1 pl-2 underline">SEA-TIME EXPERIENCE:</div>
                <table className="w-full text-center border-collapse text-[9px]">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="border-r border-black p-1">Name of Vessel / Flag</th>
                            <th className="border-r border-black p-1">TYPE</th>
                            <th className="border-r border-black p-1">GRT</th>
                            <th className="border-r border-black p-1">Company</th>
                            <th className="border-r border-black p-1">Rank</th>
                            <th className="border-r border-black p-1" colSpan={2}>PERIOD OF SERVICE</th>
                            <th className="p-1">TOTAL</th>
                        </tr>
                        <tr className="border-b border-black">
                            <th className="border-r border-black p-0"></th>
                            <th className="border-r border-black p-0"></th>
                            <th className="border-r border-black p-0"></th>
                            <th className="border-r border-black p-0"></th>
                            <th className="border-r border-black p-0"></th>
                            <th className="border-r border-black p-1 text-[8px]">From</th>
                            <th className="border-r border-black p-1 text-[8px]">To</th>
                            <th className="p-0"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {ensureRows(data.seaService, 5).map((s, i) => (
                            <tr key={i} className="border-b border-black last:border-0 h-5">
                                <td className="border-r border-black p-0.5 text-left pl-1">{s.vesselName} {s.flag ? `/ ${s.flag}` : ''}</td>
                                <td className="border-r border-black p-0.5">{s.type}</td>
                                <td className="border-r border-black p-0.5">{s.grt}</td>
                                <td className="border-r border-black p-0.5">{s.company}</td>
                                <td className="border-r border-black p-0.5">{s.rank}</td>
                                <td className="border-r border-black p-0.5">{s.signOn}</td>
                                <td className="border-r border-black p-0.5">{s.signOff}</td>
                                <td className="p-0.5">{s.totalDuration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
