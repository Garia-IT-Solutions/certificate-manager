import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define interfaces for Resume Data in Master Format
export interface ResumeData {
    personalInfo: {
        surname: string;
        middleName: string;
        firstName: string;
        nationality: string;
        dob: string;
        placeOfBirth: string;
        postApplied: string;
        dateAvailable: string;
        photoUrl?: string;
    };
    contactInfo: {
        permanentAddress: {
            line1: string;
            line2: string;
            city: string;
            state: string;
            zip: string;
            mobile: string;
            email: string;
            airport: string;
        };
        presentAddress: {
            line1: string;
            line2: string;
            city: string;
            state: string;
            zip: string;
            mobile: string;
        };
    };
    documents: Array<{
        name: string;
        number: string;
        issueDate: string;
        expiryDate: string;
        placeOfIssue: string;
        remarks?: string;
    }>;
    cocs: Array<{
        grade: string;
        issueDate: string;
        expiryDate: string;
        number: string;
        issuedBy: string;
    }>;
    education: {
        institute: string;
        from: string;
        to: string;
        degree: string;
        grade: string;
        yearPassed: string;
    };
    stcwCourses: Array<{
        course: string;
        place: string;
        issueDate: string;
        expiryDate?: string;
        issuedBy: string;
        refNo: string;
    }>;
    seaService: Array<{
        vesselName: string;
        flag: string;
        type: string;
        grt: string;
        company: string;
        rank: string;
        signOn: string;
        signOff: string;
        totalDuration: string;
    }>;
}

export const generateResumePDF = (data: ResumeData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;

    // --- HEADER ---
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("CURRICULUM VITAE", pageWidth / 2, 15, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 25, 16, pageWidth / 2 + 25, 16); // Underline

    let currentY = 25;

    // --- PERSONAL DATA ---
    doc.setFontSize(10);
    doc.setFillColor(230, 230, 230); // Light gray
    doc.rect(margin, currentY, pageWidth - 2 * margin, 6, 'F');
    doc.rect(margin, currentY, pageWidth - 2 * margin, 6, 'S'); // Border
    doc.text("PERSONAL DATA:", margin + 2, currentY + 4);
    currentY += 6;

    // Use autoTable for the layout of Personal Data to handle borders easily
    autoTable(doc, {
        startY: currentY,
        body: [
            [
                { content: `Surname:  ${data.personalInfo.surname.toUpperCase()}`, styles: { fontStyle: 'bold' } },
                { content: `Middle Name:  ${data.personalInfo.middleName.toUpperCase()}`, styles: { fontStyle: 'bold' } },
                { content: `First Name:  ${data.personalInfo.firstName.toUpperCase()}`, styles: { fontStyle: 'bold' } },
                { content: 'PASSPORT SIZE\nPHOTO', rowSpan: 3, styles: { halign: 'center', valign: 'middle', minCellWidth: 30 } }
            ],
            [
                { content: `Nationality:  ${data.personalInfo.nationality.toUpperCase()}`, styles: { fontStyle: 'bold' } },
                { content: `DATE OF BIRTH:  ${data.personalInfo.dob}`, styles: { fontStyle: 'bold' } },
                { content: `PLACE:  ${data.personalInfo.placeOfBirth.toUpperCase()}`, styles: { fontStyle: 'bold' } },
            ],
            [
                { content: `Post applied for:  ${data.personalInfo.postApplied.toUpperCase()}`, colSpan: 2, styles: { fontStyle: 'bold' } },
                { content: `Date available:  ${data.personalInfo.dateAvailable.toUpperCase()}`, styles: { fontStyle: 'bold' } },
            ]
        ],
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: 2,
            lineColor: 0,
            lineWidth: 0.1,
            valign: 'middle',
            font: 'times'
        },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 50 },
            2: { cellWidth: 50 },
            3: { cellWidth: 40 }
        },
        margin: { left: margin, right: margin }
    });

    // Helper to get safe finalY
    const getFinalY = () => {
        let finalY = (doc as any).lastAutoTable?.finalY;
        if (typeof finalY !== 'number' || isNaN(finalY)) {
            console.warn("Invalid finalY detected, using fallback:", currentY + 20);
            return currentY + 20;
        }
        return finalY;
    };

    // --- ADDRESS ---
    currentY = getFinalY();
    console.log("Starting Address Table at Y:", currentY);

    // Explicitly define columns for Address table to avoid autoTable calculation errors with colSpan
    autoTable(doc, {
        startY: currentY,
        // Define head to set up columns (hidden)
        head: [['', '', '']],
        body: [
            [
                {
                    content: `Permanent Address: ${data.contactInfo.permanentAddress.line1} ${data.contactInfo.permanentAddress.line2}, ${data.contactInfo.permanentAddress.city}, ${data.contactInfo.permanentAddress.state} - ${data.contactInfo.permanentAddress.zip}`,
                    colSpan: 2
                },
                {
                    content: `Mobile: ${data.contactInfo.permanentAddress.mobile}\nE-mail: ${data.contactInfo.permanentAddress.email}\nNearest Airport: ${data.contactInfo.permanentAddress.airport}`
                }
            ],
            [
                {
                    content: `Present Address: ${data.contactInfo.presentAddress.line1} ${data.contactInfo.presentAddress.line2}, ${data.contactInfo.presentAddress.city}, ${data.contactInfo.presentAddress.state} - ${data.contactInfo.presentAddress.zip}`,
                    colSpan: 2
                },
                {
                    content: `Mobile: ${data.contactInfo.presentAddress.mobile}`
                }
            ]
        ],
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 2,
            lineColor: 0,
            lineWidth: 0.1,
            font: 'times'
        },
        headStyles: {
            fontSize: 0, // Hide header
            cellPadding: 0,
            lineHeight: 0,
            minCellHeight: 0
        },
        columnStyles: {
            0: { cellWidth: 30, fontStyle: 'bold' },
            1: { cellWidth: 0 }, // Placeholder for span
            2: { cellWidth: 70 }
        },
        margin: { left: margin, right: margin }
    });

    currentY = getFinalY() + 5;

    // --- DOCUMENTS ---
    const documentRows = data.documents.map(d => [d.name, d.number, d.issueDate, d.expiryDate, d.placeOfIssue, d.remarks || ""]);

    console.log("Starting Documents Table at Y:", currentY);
    autoTable(doc, {
        startY: currentY,
        head: [['Documents', 'Number', 'Date of Issue', 'Date of Expiry', 'Place of Issue', 'remarks']],
        body: documentRows,
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 9, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0 },
        styles: { fontSize: 9, cellPadding: 1, lineColor: 0, lineWidth: 0.1, font: 'times' },
        margin: { left: margin, right: margin }
    });

    currentY = getFinalY() + 5;

    // --- COC ---
    doc.setFontSize(10);
    doc.setFont("times", "bold");
    if (isNaN(currentY)) currentY = 100; // Extra safety
    doc.text("DETAILS OF LICENCES/CERTIFICATES OF COMPETENCY", pageWidth / 2, currentY, { align: "center" });
    doc.line(margin, currentY + 1, pageWidth - margin, currentY + 1); // Line below title
    currentY += 2;

    const cocRows = data.cocs.map(c => [c.grade, c.issueDate, c.expiryDate, c.number, c.issuedBy]);

    console.log("Starting COC Table at Y:", currentY);
    autoTable(doc, {
        startY: currentY,
        head: [['Grade', 'Date of issue', 'Date of expiry', 'Number', 'Issued by']],
        body: cocRows,
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 9, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0, halign: 'center' },
        styles: { fontSize: 9, cellPadding: 1, lineColor: 0, lineWidth: 0.1, font: 'times', halign: 'center' },
        margin: { left: margin, right: margin }
    });

    currentY = getFinalY() + 5;

    // --- EDUCATION ---
    doc.setFontSize(10);
    doc.setFont("times", "bold");
    if (isNaN(currentY)) currentY = 150;
    doc.text("RECORD OF PRE-SEA TRAINING / COLLEGE", pageWidth / 2, currentY, { align: "center" });
    doc.line(margin, currentY + 1, pageWidth - margin, currentY + 1);
    currentY += 2;

    console.log("Starting Education Table at Y:", currentY);
    autoTable(doc, {
        startY: currentY,
        head: [['Institute', 'Date', 'Name of Certificate', 'Grade/Percentage', 'Year passed']],
        body: [
            [
                data.education.institute,
                `${data.education.from} To ${data.education.to}`,
                data.education.degree,
                data.education.grade,
                data.education.yearPassed
            ]
        ],
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 9, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0, halign: 'center' },
        styles: { fontSize: 9, cellPadding: 1, lineColor: 0, lineWidth: 0.1, font: 'times', halign: 'center' },
        margin: { left: margin, right: margin }
    });

    currentY = getFinalY() + 5;

    // --- STCW ---
    doc.setFontSize(10);
    doc.setFont("times", "bold");
    if (isNaN(currentY)) currentY = 200;
    doc.text("DETAILS OF STCW COURSES", pageWidth / 2, currentY, { align: "center" });
    doc.line(margin, currentY + 1, pageWidth - margin, currentY + 1);
    currentY += 2;

    const stcwRows = data.stcwCourses.map(c => [c.course, c.place, c.issueDate, c.expiryDate || "-", c.issuedBy, c.refNo]);

    console.log("Starting STCW Table at Y:", currentY);
    autoTable(doc, {
        startY: currentY,
        head: [['', 'Place of', 'Date of', 'Date of', 'Issued by', 'Certif No'], ['Course Name', 'issue', 'issue', 'expiry', '', '']],
        body: stcwRows,
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 9, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0, halign: 'center' },
        styles: { fontSize: 9, cellPadding: 1, lineColor: 0, lineWidth: 0.1, font: 'times', halign: 'center' },
        columnStyles: { 0: { halign: 'left' } },
        margin: { left: margin, right: margin }
    });

    currentY = getFinalY() + 10;

    // --- SEA SERVICE ---
    if (isNaN(currentY) || currentY > 250) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFontSize(10);
    doc.setFont("times", "bold");
    doc.text("SEA-TIME EXPERIENCE:", margin, currentY);
    doc.line(margin, currentY + 1, margin + 40, currentY + 1); // Underline title
    currentY += 3;

    const seaRows = data.seaService.map(s => [
        `${s.vesselName} ${s.flag ? '/ ' + s.flag : ''}`, s.type, s.grt, s.company, s.rank, s.signOn, s.signOff, s.totalDuration
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [['Name of Vessel / Flag', 'TYPE', 'GRT', 'Name of Company', 'Rank', 'PERIOD OF SERVICE', 'TOTAL SERVICE'], ['', '', '', '', '', 'From     To', '']],
        body: seaRows,
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0, halign: 'center' },
        styles: { fontSize: 8, cellPadding: 1, lineColor: 0, lineWidth: 0.1, font: 'times', halign: 'center' },
        columnStyles: { 0: { halign: 'left' } },
        margin: { left: margin, right: margin }
    });

    // Save the PDF
    doc.save(`${data.personalInfo.surname || 'Resume'}_${data.personalInfo.firstName || 'CV'}.pdf`);
};
