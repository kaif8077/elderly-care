const MedicalReport = require('../models/MedicalReport');
const { getReport, listReports } = require('../services/medicalReportService');
const { writeAuditLog } = require('../services/auditService');

exports.list = async (req, res) => {
  try {
    const match = {};
    if (req.query.userId) match.userId = req.query.userId;
    if (['unverified', 'verified', 'needs_correction'].includes(req.query.verificationStatus)) {
      match.verificationStatus = req.query.verificationStatus;
    }
    if (req.query.latest === 'true') match.isLatest = true;
    res.json(await listReports({ match, page: req.query.page, limit: req.query.limit }));
  } catch (error) {
    res.status(500).json({ message: 'Unable to load medical reports' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const report = await getReport({ reportId: req.params.reportId });
    if (!report) return res.status(404).json({ message: 'Medical report not found' });
    res.json({ report });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load medical report' });
  }
};

exports.verify = async (req, res) => {
  try {
    const status = req.body.verificationStatus;
    if (!['verified', 'needs_correction', 'unverified'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }
    const report = await MedicalReport.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Medical report not found' });
    report.verificationStatus = status;
    report.verifiedBy = status === 'unverified' ? null : req.admin._id;
    report.verifiedAt = status === 'unverified' ? null : new Date();
    await report.save();
    await writeAuditLog({
      req,
      actor: req.admin,
      action: 'ADMIN_REPORT_VERIFICATION_UPDATED',
      resourceType: 'MedicalReport',
      resourceId: report._id,
      affectedUserId: report.userId,
      description: `Admin changed report verification status to ${status}`
    });
    res.json({ message: 'Report verification updated', verificationStatus: status });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update report verification' });
  }
};
