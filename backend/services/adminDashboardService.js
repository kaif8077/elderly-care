const User = require('../models/User');
const MedicalProfile = require('../models/MedicalProfile');
const QRCode = require('../models/QRCode');
const EmergencyAlert = require('../models/EmergencyAlert');

const regularUsers = {
  role: { $nin: ['admin', 'super_admin'] },
  isDeleted: { $ne: true }
};

const startOfDay = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfMonth = () => {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getProfileStatistics = async () => {
  const latestProfiles = await MedicalProfile.aggregate([
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$userId', profile: { $first: '$$ROOT' } } },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $set: { user: { $first: '$user' } } },
    { $match: { 'user.role': { $nin: ['admin', 'super_admin'] }, 'user.isDeleted': { $ne: true } } },
    {
      $project: {
        complete: {
          $and: [
            { $ne: ['$profile.name', null] },
            { $ne: ['$profile.dob', null] },
            { $ne: ['$profile.gender', null] },
            { $ne: ['$profile.phone', null] },
            { $ne: ['$profile.address', null] },
            { $ne: ['$profile.emergencyContact', null] },
            { $ne: ['$profile.emergencyPhone', null] }
          ]
        }
      }
    },
    { $group: {
      _id: null,
      withProfile: { $sum: 1 },
      complete: { $sum: { $cond: ['$complete', 1, 0] } }
    } }
  ]);

  return latestProfiles[0] || { withProfile: 0, complete: 0 };
};

const getQrStatistics = async () => {
  const rows = await QRCode.aggregate([
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$userId', qr: { $first: '$$ROOT' } } },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $set: { user: { $first: '$user' } } },
    { $match: { 'user.role': { $nin: ['admin', 'super_admin'] }, 'user.isDeleted': { $ne: true } } },
    {
      $group: {
        _id: null,
        generated: { $sum: 1 },
        active: { $sum: { $cond: [{ $and: [{ $eq: ['$qr.status', 'active'] }, { $ne: ['$qr.token', null] }] }, 1, 0] } },
        revoked: { $sum: { $cond: [{ $eq: ['$qr.status', 'revoked'] }, 1, 0] } },
        legacy: { $sum: { $cond: [{ $eq: [{ $ifNull: ['$qr.token', null] }, null] }, 1, 0] } }
      }
    }
  ]);
  return rows[0] || { generated: 0, active: 0, revoked: 0, legacy: 0 };
};

const getMonthlyRegistrations = async () => {
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);
  since.setHours(0, 0, 0, 0);

  const rows = await User.aggregate([
    { $match: { ...regularUsers, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const counts = new Map(rows.map((row) => [`${row._id.year}-${row._id.month}`, row.count]));
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: date.toLocaleString('en', { month: 'short', year: 'numeric' }),
      count: counts.get(`${date.getFullYear()}-${date.getMonth() + 1}`) || 0
    };
  });
};

const getDashboardStatistics = async () => {
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    archivedUsers,
    registeredToday,
    registeredThisMonth,
    profileStats,
    qrStats,
    registrationsByMonth,
    alertsToday,
    unresolvedAlerts
  ] = await Promise.all([
    User.countDocuments(regularUsers),
    User.countDocuments({ ...regularUsers, accountStatus: 'active' }),
    User.countDocuments({ ...regularUsers, accountStatus: { $in: ['inactive', 'suspended'] } }),
    User.countDocuments({ role: { $nin: ['admin', 'super_admin'] }, accountStatus: 'archived' }),
    User.countDocuments({ ...regularUsers, createdAt: { $gte: startOfDay() } }),
    User.countDocuments({ ...regularUsers, createdAt: { $gte: startOfMonth() } }),
    getProfileStatistics(),
    getQrStatistics(),
    getMonthlyRegistrations(),
    EmergencyAlert.countDocuments({ createdAt: { $gte: startOfDay() } }),
    EmergencyAlert.countDocuments({ status: { $nin: ['resolved', 'false_alarm'] } })
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      archived: archivedUsers,
      registeredToday,
      registeredThisMonth
    },
    profiles: {
      complete: profileStats.complete,
      incomplete: Math.max(totalUsers - profileStats.complete, 0),
      created: profileStats.withProfile
    },
    qrCodes: {
      generated: qrStats.generated,
      active: qrStats.active,
      revoked: qrStats.revoked,
      legacy: qrStats.legacy,
      capability: 'revocable_tokens'
    },
    reports: { total: null, capability: 'not_implemented' },
    emergencyAlerts: { today: alertsToday, unresolved: unresolvedAlerts, capability: 'email_activation' },
    idCards: { total: null, capability: 'not_implemented' },
    registrationsByMonth,
    refreshedAt: new Date().toISOString()
  };
};

module.exports = { getDashboardStatistics };
