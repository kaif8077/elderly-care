const MedicalReport = require('../models/MedicalReport');
const { createReport, getReport } = require('../services/medicalReportService');
const { generateMedicalReportPdf } = require('../services/medicalReportPdfService');
const { writeAuditLog } = require('../services/auditService');

const sendPdf = async (res, report, includeInsurance, filename) => {
  const pdf = await generateMedicalReportPdf(report, { includeInsurance });
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'private, no-store, max-age=0',
    'Content-Length': pdf.length
  });
  res.send(pdf);
};

exports.userDownload = async (req, res) => {
  try {
    const report = await getReport({ reportId: req.params.reportId, userId: req.user.id });
    if (!report || report.isArchived) return res.status(404).json({ message: 'Medical report not found' });
    const safeName = String(report.snapshotData.personal.name || 'elder')
      .replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 60);
    await sendPdf(
      res,
      report,
      req.query.includeInsurance === 'true',
      `${safeName}-emergency-summary-v${report.reportVersion}.pdf`
    );
  } catch (error) {
    console.error('Medical report PDF error:', error.message);
    res.status(500).json({ message: 'Unable to generate report PDF' });
  }
};

exports.adminDownload = async (req, res) => {
  try {
    const report = await getReport({ reportId: req.params.reportId });
    if (!report || report.isArchived) return res.status(404).json({ message: 'Medical report not found' });
    const pdf = await generateMedicalReportPdf(report, { includeInsurance: req.query.includeInsurance === 'true' });
    await writeAuditLog({
      req,
      actor: req.admin,
      action: 'ADMIN_REPORT_DOWNLOADED',
      resourceType: 'MedicalReport',
      resourceId: report._id,
      affectedUserId: report.userId,
      description: 'Admin downloaded an authenticated medical report PDF'
    });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="elderlycare-report-v${report.reportVersion}.pdf"`,
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Length': pdf.length
    });
    res.send(pdf);
  } catch (error) {
    console.error('Admin report PDF error:', error.message);
    res.status(500).json({ message: 'Unable to generate report PDF' });
  }
};

exports.adminArchive = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Medical report not found' });
    report.isArchived = true;
    report.isLatest = false;
    report.reportStatus = 'archived';
    await report.save();
    await writeAuditLog({
      req,
      actor: req.admin,
      action: 'ADMIN_REPORT_ARCHIVED',
      resourceType: 'MedicalReport',
      resourceId: report._id,
      affectedUserId: report.userId,
      description: 'Admin archived a medical report version',
      reason: String(req.body.reason || '').slice(0, 500) || null
    });
    res.json({ message: 'Medical report archived' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to archive medical report' });
  }
};

exports.adminRegenerate = async (req, res) => {
  try {
    const source = await getReport({ reportId: req.params.reportId });
    if (!source) return res.status(404).json({ message: 'Medical report not found' });
    const report = await createReport({ userId: source.userId, generatedBy: req.admin._id });
    await writeAuditLog({
      req,
      actor: req.admin,
      action: 'ADMIN_REPORT_REGENERATED',
      resourceType: 'MedicalReport',
      resourceId: report._id,
      affectedUserId: source.userId,
      description: 'Admin generated a new report snapshot from the latest medical profile'
    });
    res.status(201).json({ message: 'New report version generated', reportId: report._id, reportVersion: report.reportVersion });
  } catch (error) {
    if (error.code === 'PROFILE_REQUIRED') return res.status(409).json({ message: error.message, code: error.code });
    if (error.code === 11000) return res.status(409).json({ message: 'A report is already being generated. Please retry.' });
    res.status(500).json({ message: 'Unable to regenerate medical report' });
  }
};