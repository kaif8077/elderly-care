const test = require('node:test');
const assert = require('node:assert/strict');
const { generateMedicalReportPdf, calculateAge, textList } = require('../services/medicalReportPdfService');

const sampleReport = {
  reportVersion: 2,
  verificationStatus: 'verified',
  generatedAt: new Date('2026-07-24T10:00:00Z'),
  snapshotData: {
    sourceUpdatedAt: new Date('2026-07-23T10:00:00Z'),
    personal: {
      name: 'Test Elder',
      dob: new Date('1950-01-01'),
      gender: 'other',
      bloodGroup: 'O+',
      height: 170,
      weight: 70,
      dietPreference: 'Vegetarian'
    },
    contact: { address: 'Test address' },
    emergencyContacts: [{ name: 'Guardian', phone: '+910000000000', priority: 1 }],
    medical: {
      medicalHistory: ['Hypertension'],
      allergies: ['Penicillin'],
      medications: ['Example medicine'],
      currentSymptoms: []
    },
    insurance: { hasInsurance: true, provider: 'Test Provider', policyNumber: 'PRIVATE' }
  }
};

test('PDF helpers handle age and empty medical lists safely', () => {
  assert.match(calculateAge('1950-01-01'), /^\d+$/);
  assert.equal(textList([], null), 'None reported');
});

test('Emergency Medical Summary PDF generation returns a valid PDF buffer', async () => {
  const pdf = await generateMedicalReportPdf(sampleReport, { includeInsurance: false });
  assert.equal(Buffer.isBuffer(pdf), true);
  assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
  assert.ok(pdf.length > 3000);
});

test('private insurance inclusion is opt-in for PDF generation', async () => {
  const withoutInsurance = await generateMedicalReportPdf(sampleReport, { includeInsurance: false });
  const withInsurance = await generateMedicalReportPdf(sampleReport, { includeInsurance: true });
  assert.ok(withInsurance.length > withoutInsurance.length);
});
