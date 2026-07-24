const PDFDocument = require('pdfkit');
const MedicalProfile = require('../models/MedicalProfile');
const HealthRecommendation = require('../models/HealthRecommendation');
const recommendationEngine = require('./recommendationController');

exports.generate = async (req, res) => {
  try {
    const profile = await MedicalProfile.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!profile) return res.status(404).json({ message: 'Complete your medical profile first' });
    const content = await recommendationEngine.generateHealthRecommendations(profile);
    const recommendation = await HealthRecommendation.create({
      userId: req.user.id, medicalProfileId: profile._id, content, generatedAt: new Date()
    });
    return res.status(201).json({ recommendation });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to generate recommendations' });
  }
};

exports.list = async (req, res) => {
  const items = await HealthRecommendation.find({ userId: req.user.id, status: 'active' })
    .sort({ generatedAt: -1 }).limit(20).select('-__v').lean();
  res.json({ recommendations: items });
};

exports.download = async (req, res) => {
  const item = await HealthRecommendation.findOne({ _id: req.params.id, userId: req.user.id }).lean();
  if (!item) return res.status(404).json({ message: 'Recommendation not found' });
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="health-recommendation-${item._id}.pdf"`
  });
  const doc = new PDFDocument({ size: 'A4', margin: 54 });
  doc.pipe(res);
  doc.fillColor('#123f35').fontSize(22).text('ElderlyCare Health Recommendations');
  doc.moveDown().fillColor('#526b64').fontSize(10).text(`Generated: ${new Date(item.generatedAt).toLocaleString()}`);
  doc.moveDown().fillColor('#222').fontSize(10).text(item.content, { lineGap: 3 });
  doc.moveDown().fontSize(8).fillColor('#666').text('General wellness guidance only. Consult a qualified healthcare professional before changing treatment, medicines, diet, or exercise.');
  doc.end();
};
