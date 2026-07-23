const { getDashboardStatistics } = require('../services/adminDashboardService');

exports.getOverview = async (req, res) => {
  try {
    res.json(await getDashboardStatistics());
  } catch (error) {
    console.error('Admin dashboard statistics error:', error.message);
    res.status(500).json({ message: 'Unable to load dashboard statistics' });
  }
};
