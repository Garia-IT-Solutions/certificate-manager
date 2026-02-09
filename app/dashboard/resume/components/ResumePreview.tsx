"use client";

import { ResumeData } from "@/app/lib/pdf-generator";
import { cn } from "@/lib/utils";

interface ResumePreviewProps {
    data: ResumeData;
    className?: string;
    id?: string;
}

export function ResumePreview({ data, className, id }: ResumePreviewProps) {


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
                    <div className="w-32 border-l border-black flex items-center justify-center bg-gray-50 overflow-hidden">
                        {data.personalInfo.photoUrl ? (
                            <img src={data.personalInfo.photoUrl} alt="Passport Photo" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-400 text-[9px] text-center">PASSPORT SIZE<br />PHOTO</span>
                        )}
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
                {data.documents && data.documents.length > 0 && (
                    <table className="w-full text-left text-[10px] border-collapse">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="border-r border-black p-1 w-1/4">Documents</th>
                                <th className="border-r border-black p-1">Number</th>
                                <th className="border-r border-black p-1">Date of Issue</th>
                                <th className="border-r border-black p-1">Date of Expiry</th>
                                <th className="border-r border-black p-1">Place Of Issue</th>
                                <th className="p-1">Remarks</th>
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
                )}
            </div>

            {/* COC TABLE */}
            {data.cocs && data.cocs.length > 0 && (
                <div className="border border-black mb-1 text-[10px]">
                    <div className="text-center font-bold border-b border-black bg-gray-100 p-0.5">DETAILS OF LICENCES/CERTIFICATES OF COMPETENCY</div>
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="border-r border-black p-1">Name</th>
                                <th className="border-r border-black p-1">Grade</th>
                                <th className="border-r border-black p-1">Date of issue</th>
                                <th className="border-r border-black p-1">Date of expiry</th>
                                <th className="border-r border-black p-1">Number</th>
                                <th className="p-1">Issued by</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.cocs.map((coc, i) => (
                                <tr key={i} className="border-b border-black last:border-0 h-5">
                                    <td className="border-r border-black p-1">{coc.name}</td>
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
            )}

            {/* EDUCATION / PRE-SEA */}
            {data.education && (data.education.institute || data.education.degree) && (
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
            )}

            {/* STCW COURSES */}
            {data.stcwCourses && data.stcwCourses.length > 0 && (
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
                            {data.stcwCourses.map((c, i) => (
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
            )}

            {/* EDUCATIONAL QUALIFICATION */}
            {data.educationalQualification && (data.educationalQualification.degree || data.educationalQualification.sscMarks) && (
                <div className="border border-black mb-1 text-[10px]">
                    <table className="w-full text-left border-collapse">
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="p-1 font-bold" colSpan={3}>Educational Qualification: {data.educationalQualification.degree}</td>
                            </tr>
                            <tr>
                                <td className="border-r border-black p-1 w-1/3">S.S.C (10th) Marks : {data.educationalQualification.sscMarks}</td>
                                <td className="border-r border-black p-1 w-1/3">H.S.C (12th) Marks : {data.educationalQualification.hscMarks}</td>
                                <td className="p-1 w-1/3">H.S.C. (PCM) {data.educationalQualification.hscPcmMarks}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* NEXT OF KIN */}
            {data.nextOfKin && (data.nextOfKin.name || data.nextOfKin.address) && (
                <div className="border border-black mb-1 text-[10px] p-2">
                    <div className="flex justify-between mb-1">
                        <span><span className="font-bold">Next of Kin Name:</span> {data.nextOfKin.name?.toUpperCase()}</span>
                        <span><span className="font-bold">Relationship:</span> {data.nextOfKin.relationship?.toUpperCase()}</span>
                    </div>
                    <div className="mb-1"><span className="font-bold">Address:</span> {data.nextOfKin.address}</div>
                    <div><span className="font-bold">Contact no.</span> {data.nextOfKin.contactNo}</div>
                </div>
            )}

            {/* PHYSICAL DESCRIPTION */}
            {data.physicalDescription && (data.physicalDescription.height || data.physicalDescription.hairColor) && (
                <div className="border border-black mb-1 text-[10px]">
                    <table className="w-full text-left border-collapse">
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="border-r border-black p-1">Colour of Hair / Eyes: {data.physicalDescription.hairColor?.toUpperCase()}{data.physicalDescription.eyeColor ? ' / ' + data.physicalDescription.eyeColor?.toUpperCase() : ''}</td>
                                <td className="border-r border-black p-1">Height: {data.physicalDescription.height}</td>
                                <td className="p-1">Weight: {data.physicalDescription.weight}</td>
                            </tr>
                            <tr>
                                <td className="border-r border-black p-1">Boiler Suit Size: {data.physicalDescription.boilerSuitSize?.toUpperCase()}</td>
                                <td className="border-r border-black p-1">Safety Shoe Size: {data.physicalDescription.shoeSize}</td>
                                <td className="p-1"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* SEA SERVICE */}
            {data.seaService && data.seaService.length > 0 && (
                <div className="border border-black mb-1 text-[10px]">
                    <div className="font-bold border-b border-black bg-gray-100 p-1 pl-2 underline">SEA-TIME EXPERIENCE:</div>
                    <table className="w-full text-center border-collapse text-[9px]">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="border-r border-black p-1" rowSpan={2}>Name of Vessel / Flag</th>
                                <th className="border-r border-black p-1" rowSpan={2}>TYPE</th>
                                <th className="border-r border-black p-1" rowSpan={2}>GRT</th>
                                <th className="border-r border-black p-1" rowSpan={2}>Company</th>
                                <th className="border-r border-black p-1" rowSpan={2}>Rank</th>
                                <th className="border-r border-black p-1" colSpan={2}>PERIOD OF SERVICE</th>
                                <th className="p-1" rowSpan={2}>TOTAL</th>
                            </tr>
                            <tr className="border-b border-black">
                                <th className="border-r border-black p-1 text-[8px]">From</th>
                                <th className="border-r border-black p-1 text-[8px]">To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.seaService.map((s, i) => (
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
            )}

            {/* STRENGTHS */}
            {data.strengths && (
                <div className="border border-black mb-1 text-[10px] p-2">
                    <div className="font-bold mb-1">STRENGTHS:</div>
                    <div className="whitespace-pre-wrap">{data.strengths}</div>
                </div>
            )}

            {/* MISCELLANEOUS REMARKS */}
            {data.miscellaneousRemarks && (
                <div className="border border-black mb-1 text-[10px] p-2">
                    <div className="font-bold mb-1">MISCELLANEOUS REMARKS:</div>
                    <div className="whitespace-pre-wrap">{data.miscellaneousRemarks}</div>
                </div>
            )}

            {/* DECLARATION */}
            <div className="text-[10px] mt-4">
                <div className="font-bold italic underline mb-2">DECLARATION:</div>
                <p className="mb-4">I hereby declare that the information furnished above is true to the best of my knowledge.</p>
                <div className="flex justify-between items-end mt-6">
                    <div>Date: {data.declarationDate || '___________'}</div>
                    <div className="text-right">
                        {data.signatureImage ? (
                            <div>
                                <div className="mb-1">Signature:</div>
                                <img src={data.signatureImage} alt="Signature" className="h-12 object-contain" />
                            </div>
                        ) : (
                            <div>Signature: ___________________</div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
