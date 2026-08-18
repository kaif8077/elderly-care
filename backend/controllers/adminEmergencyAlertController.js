const AuditLog = require('../models/AuditLog');
const { getAlert, listAlerts } = require('../services/adminEmergencyAlertService');
const { hashIp } = require('../services/emergencyAlertService');
const mongoose = require('mongoose');

exports.list = async (req, res) => {
  try {
    return res.json(await listAlerts(req.query));
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load emergency alerts' });
  }
};

exports.getOne = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid emergency alert ID' });
    const alert = await getAlert(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Emergency alert not found' });
    AuditLog.create({
      actorId: req.admin._id,
      actorRole: req.admin.role,
      action: 'emergency_alert_viewed',
      resourceType: 'EmergencyAlert',
      resourceId: String(alert.id),
      affectedUserId: alert.elderlyPerson?.id || null,
      description: 'Administrator viewed an emergency alert timeline',
      metadata: { ipHash: hashIp(req.ip), userAgent: String(req.get('user-agent') || '').slice(0, 200), success: true }
    }).catch(() => {});
    return res.json({ alert });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load this emergency alert' });
  }
};
