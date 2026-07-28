const Contact = require('../models/Contact');

const escapeRegExp = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pagination = (query) => ({
  page: Math.max(1, Number.parseInt(query.page, 10) || 1),
  limit: Math.min(100, Math.max(10, Number.parseInt(query.limit, 10) || 20))
});

const list = (Model, fields) => async (req, res) => {
  try {
    const { page, limit } = pagination(req.query);
    const search = String(req.query.search || '').trim();
    const match = search
      ? { $or: fields.map((field) => ({ [field]: { $regex: escapeRegExp(search), $options: 'i' } })) }
      : {};
    const [items, total] = await Promise.all([
      Model.find(match).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Model.countDocuments(match)
    ]);
    return res.json({
      items,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) }
    });
  } catch (error) {
    console.error('Admin submission query error:', error.message);
    return res.status(500).json({ message: 'Unable to load submissions' });
  }
};

exports.contacts = list(Contact, ['name', 'email', 'phone', 'message']);
exports.pagination = pagination;
exports.escapeRegExp = escapeRegExp;
