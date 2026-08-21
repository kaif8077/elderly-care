const EmergencyAlert = require('../models/EmergencyAlert');
const MedicalProfile = require('../models/MedicalProfile');

const ALLOWED_STATUSES = [
  'created',
  'sending',
  'sent',
  'partially_sent',
  'failed',
  'acknowledged',
  'resolved',
  'false_alarm'
];
const ALLOWED_TYPES = [
  'person_found',
  'medical_emergency',
  'fall',
  'lost_confused',
  'accident',
  'other'
];

const serialize = (alert, profileByUser = new Map()) => {
  const user = alert.userId && typeof alert.userId === 'object' ? alert.userId : null;
  const profile = profileByUser.get(String(user?._id || alert.userId));
  return {
    id: alert._id,
    elderlyPerson: user ? { id: user._id, name: user.name, email: user.email } : null,
    elderlyCareId: profile?.elderlyCareId || null,
    emergencyType: alert.emergencyType,
    responderName: alert.responderName,
    responderPhone: alert.responderPhone,
    responderMessage: alert.responderMessage,
    location: alert.location,
    notificationChannels: alert.notificationChannels,
    deliveryStatuses: alert.deliveryStatuses,
    status: alert.status,
    acknowledgementAction: alert.acknowledgementAction,
    acknowledgedBy: alert.acknowledgedBy,
    acknowledgedAt: alert.acknowledgedAt,
    acknowledgementHistory: alert.acknowledgementHistory || [],
    resolvedAt: alert.resolvedAt,
    createdAt: alert.createdAt,
    updatedAt: alert.updatedAt
  };
};

const listAlerts = async (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 5), 100);
  const match = {};
  if (query.status === 'open') match.status = { $nin: ['resolved', 'false_alarm'] };
  else if (ALLOWED_STATUSES.includes(query.status)) match.status = query.status;
  if (ALLOWED_TYPES.includes(query.emergencyType)) match.emergencyType = query.emergencyType;
  const [alerts, total] = await Promise.all([
    EmergencyAlert.find(match)
      .populate('userId', 'name email')
      .populate('acknowledgedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    EmergencyAlert.countDocuments(match)
  ]);
  const userIds = alerts.map((alert) => alert.userId?._id).filter(Boolean);
  const profiles = await MedicalProfile.find({ userId: { $in: userIds } })
    .select('userId elderlyCareId')
    .sort({ createdAt: -1 })
    .lean();
  const profileByUser = new Map();
  profiles.forEach((profile) => {
    if (!profileByUser.has(String(profile.userId)))
      profileByUser.set(String(profile.userId), profile);
  });
  return {
    alerts: alerts.map((alert) => serialize(alert, profileByUser)),
    pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) }
  };
};

const getAlert = async (id) => {
  const alert = await EmergencyAlert.findById(id)
    .populate('userId', 'name email')
    .populate('acknowledgedBy', 'name email')
    .populate('acknowledgementHistory.actorId', 'name email')
    .lean();
  if (!alert) return null;
  const profile = await MedicalProfile.findOne({ userId: alert.userId?._id })
    .select('userId elderlyCareId')
    .sort({ createdAt: -1 })
    .lean();
  return serialize(alert, new Map(profile ? [[String(profile.userId), profile]] : []));
};

module.exports = { ALLOWED_STATUSES, ALLOWED_TYPES, getAlert, listAlerts };
