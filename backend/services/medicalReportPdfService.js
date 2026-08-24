const PDFDocument = require('pdfkit');

const COLORS = {
  ink: '#18352E',
  muted: '#5F746E',
  green: '#176B57',
  paleGreen: '#EAF4F1',
  red: '#9D2F2F',
  paleRed: '#FFF1F1',
  line: '#D9E5E1',
  white: '#FFFFFF'
};

const textList = (items, other) => {
  const values = [...(items || []), other].filter((item) => item && item !== 'None');
  return values.length ? values.join(', ') : 'None reported';
};

const formatDate = (value) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const calculateAge = (dob) => {
  if (!dob) return 'Unknown';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age >= 0 ? String(age) : 'Unknown';
};

const ensureRoom = (doc, height = 100) => {
  if (doc.y + height > doc.page.height - 72) doc.addPage();
};

const sectionTitle = (doc, title) => {
  ensureRoom(doc, 55);
  doc.moveDown(0.7).fillColor(COLORS.green).font('Helvetica-Bold').fontSize(13).text(title);
  doc
    .moveDown(0.25)
    .strokeColor(COLORS.line)
    .lineWidth(1)
    .moveTo(48, doc.y)
    .lineTo(doc.page.width - 48, doc.y)
    .stroke();
  doc.moveDown(0.55);
};

const labelValue = (doc, label, value) => {
  ensureRoom(doc, 34);
  const y = doc.y;
  doc
    .fillColor(COLORS.muted)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(label.toUpperCase(), 48, y, { width: 145 });
  doc
    .fillColor(COLORS.ink)
    .font('Helvetica')
    .fontSize(10)
    .text(String(value || 'Not provided'), 200, y, { width: 347 });
  doc.y = Math.max(doc.y, y + 24);
};

const generateMedicalReportPdf = (report, { includeInsurance = false } = {}) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 48, right: 48, bottom: 62, left: 48 },
      bufferPages: true,
      info: {
        Title: `Emergency Medical Summary - ${report.snapshotData.personal.name}`,
        Author: 'ElderlyCare',
        Subject: 'Emergency information summary'
      }
    });
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    const snapshot = report.snapshotData;
    const personal = snapshot.personal || {};
    const medical = snapshot.medical || {};
    const emergency = snapshot.emergencyContacts?.[0] || {};

    doc.roundedRect(48, 42, doc.page.width - 96, 70, 8).fill(COLORS.green);
    doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(18).text('ELDERLYCARE', 66, 61);
    doc.fontSize(10).font('Helvetica').text('Emergency Medical Summary', 66, 84);
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(`VERSION ${report.reportVersion}`, 410, 63, { width: 118, align: 'right' });
    doc
      .font('Helvetica')
      .fontSize(8)
      .text(report.verificationStatus.replace('_', ' ').toUpperCase(), 410, 84, {
        width: 118,
        align: 'right'
      });
    doc.y = 132;

    doc
      .fillColor(COLORS.ink)
      .font('Helvetica-Bold')
      .fontSize(20)
      .text(personal.name || 'Unknown person');
    doc
      .moveDown(0.2)
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .fontSize(9)
      .text(
        `Generated ${formatDate(report.generatedAt)}  |  Source updated ${formatDate(snapshot.sourceUpdatedAt)}`
      );

    doc.moveDown(0.8);
    const criticalTop = doc.y;
    doc.roundedRect(48, criticalTop, doc.page.width - 96, 112, 8).fill(COLORS.paleRed);
    doc
      .fillColor(COLORS.red)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('CRITICAL EMERGENCY INFORMATION', 64, criticalTop + 15);
    doc.fontSize(11).text(`Blood group: ${personal.bloodGroup || 'Unknown'}`, 64, criticalTop + 42);
    doc
      .fillColor(COLORS.ink)
      .font('Helvetica')
      .fontSize(9)
      .text(
        `Allergies: ${textList(medical.allergies, medical.allergiesOther)}`,
        64,
        criticalTop + 64,
        { width: 450 }
      )
      .text(
        `Critical medications: ${textList(medical.medications, medical.medicationsOther)}`,
        64,
        criticalTop + 84,
        { width: 450 }
      );
    doc.y = criticalTop + 126;

    sectionTitle(doc, 'Personal details');
    labelValue(
      doc,
      'Date of birth',
      `${formatDate(personal.dob)} (Age ${calculateAge(personal.dob)})`
    );
    labelValue(doc, 'Gender', personal.gender);
    labelValue(doc, 'Blood group', personal.bloodGroup || 'Unknown');
    labelValue(
      doc,
      'Height / Weight',
      `${personal.height || '-'} cm / ${personal.weight || '-'} kg`
    );
    labelValue(doc, 'Diet preference', personal.dietPreference);
    labelValue(doc, 'Address', snapshot.contact?.address);

    sectionTitle(doc, 'Medical summary');
    labelValue(doc, 'Conditions', textList(medical.medicalHistory, medical.medicalHistoryOther));
    labelValue(doc, 'Allergies', textList(medical.allergies, medical.allergiesOther));
    labelValue(doc, 'Medications', textList(medical.medications, medical.medicationsOther));
    labelValue(
      doc,
      'Current symptoms',
      textList(medical.currentSymptoms, medical.currentSymptomsOther)
    );

    sectionTitle(doc, 'Emergency contact');
    labelValue(doc, 'Name', emergency.name);
    labelValue(doc, 'Phone', emergency.phone);
    labelValue(doc, 'Priority', emergency.priority || 1);

    if (includeInsurance && snapshot.insurance?.hasInsurance) {
      sectionTitle(doc, 'Private insurance summary');
      labelValue(doc, 'Provider', snapshot.insurance.provider || snapshot.insurance.providerOther);
      labelValue(doc, 'Policy number', snapshot.insurance.policyNumber);
    }

    ensureRoom(doc, 90);
    doc
      .moveDown(1)
      .roundedRect(48, doc.y, doc.page.width - 96, 58, 6)
      .fill(COLORS.paleGreen);
    doc
      .fillColor(COLORS.ink)
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('Emergency disclaimer', 62, doc.y + 14);
    doc
      .font('Helvetica')
      .fontSize(8)
      .text(
        'This is an emergency-information summary and is not a replacement for professional medical advice, diagnosis, or treatment.',
        62,
        doc.y + 29,
        { width: 470 }
      );

    const range = doc.bufferedPageRange();
    for (let index = range.start; index < range.start + range.count; index += 1) {
      doc.switchToPage(index);
      doc.page.margins.bottom = 0;
      const footerY = doc.page.height - 42;
      doc
        .strokeColor(COLORS.line)
        .moveTo(48, footerY - 8)
        .lineTo(doc.page.width - 48, footerY - 8)
        .stroke();
      doc
        .fillColor(COLORS.muted)
        .font('Helvetica')
        .fontSize(7)
        .text('PRIVATE MEDICAL INFORMATION - Share only with authorized persons.', 48, footerY, {
          width: 390,
          lineBreak: false
        })
        .text(`Page ${index + 1} of ${range.count}`, 445, footerY, {
          width: 102,
          align: 'right',
          lineBreak: false
        });
    }

    doc.end();
  });

module.exports = { calculateAge, generateMedicalReportPdf, textList };
