const { createReport, getReport, listReports } = require('../services/medicalReportService');

exports.create = async (req, res) => {
  try {
    const report = await createReport({ userId: req.user.id, generatedBy: req.user.id });
    res.status(201).json({ message: 'Medical report generated', report });
  } catch (error) {
    if (error.code === 'PROFILE_REQUIRED')
      return res.status(409).json({ message: error.message, code: error.code });
    if (error.code === 11000)
      return res
        .status(409)
        .json({ message: 'A report is already being generated. Please retry.' });
    console.error('Medical report creation error:', error.message);
    res.status(500).json({ message: 'Unable to generate medical report' });
  }
};

exports.list = async (req, res) => {
  try {
    res.json(
      await listReports({
        match: { userId: req.user.id },
        page: req.query.page,
        limit: req.query.limit
      })
    );
  } catch (error) {
    res.status(500).json({ message: 'Unable to load medical reports' });
  }
};

exports.latest = async (req, res) => {
  try {
    const result = await listReports({
      match: { userId: req.user.id, isLatest: true, isArchived: false },
      page: 1,
      limit: 5
    });
    if (!result.reports[0]) return res.status(404).json({ message: 'No medical report found' });
    res.json({ report: result.reports[0] });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load latest medical report' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const report = await getReport({ reportId: req.params.reportId, userId: req.user.id });
    if (!report) return res.status(404).json({ message: 'Medical report not found' });
    res.json({ report });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load medical report' });
  }
};
