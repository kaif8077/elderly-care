// translationService.js
const translations = {
  en: {
      // Authentication
      scannerAuth: "Scanner Authentication",
      yourName: "Your Name",
      yourPhone: "Your Phone Number (10 digits)",
      enterOtp: "Enter 6-digit OTP",
      requestOtp: "Request OTP",
      verifyOtp: "Verify OTP",
      nameRequired: "Name is required",
      phoneRequired: "Phone number is required",
      phoneDigits: "Please enter exactly 10 digits",
      
      // Profile
      medicalProfile: "Medical Profile",
      personalInfo: "Personal Information",
      name: "Name",
      dob: "Date of Birth",
      gender: "Gender",
      bloodGroup: "Blood Group",
      dietPreference: "Diet Preference",
      height: "Height",
      weight: "Weight",
      contactInfo: "Contact Information",
      phone: "Phone",
      address: "Address",
      emergencyContact: "Emergency Contact",
      emergencyPhone: "Emergency Phone",
      medicalInfo: "Medical Information",
      medicalHistory: "Medical History/Conditions",
      allergies: "Allergies",
      medications: "Current Medications",
      currentSymptoms: "Current Symptoms",
      insuranceInfo: "Insurance Information",
      hasInsurance: "Has Insurance",
      insuranceProvider: "Insurance Provider",
      policyNumber: "Policy Number",
      
      // Emergency
      emergencyInstructions: "Emergency First Aid Instructions",
      sendEmergencyAlert: "Send Emergency Alert",
      printPage: "Print This Page",
      confirmEmergency: "Send emergency alert?",
      locationUnavailable: "Unable to get location. Send without location?",
      geolocationUnsupported: "Geolocation not supported. Send without location?",
      
      // Recommendations
      healthRecommendationsTitle: "Personalized Health Recommendations",
      firstAidTitle: "Emergency First Aid Instructions",
      nutritionPlan: "Nutrition Plan",
      exerciseRegimen: "Exercise Regimen",
      lifestyleOptimization: "Lifestyle Optimization",
      medicalManagement: "Medical Management",
      emergencyProtocols: "Emergency Protocols",
      comprehensiveAssessment: "Comprehensive Health Assessment",
      foodsToEmphasize: "Foods to Emphasize",
      foodsToLimit: "Foods to Limit",
      hydration: "Hydration",
      supplements: "Supplements",
      cardio: "Cardio",
      strengthTraining: "Strength Training",
      flexibility: "Flexibility",
      activityModifications: "Activity Modifications",
      sleep: "Sleep",
      stressManagement: "Stress Management",
      habits: "Habits",
      preventiveCare: "Preventive Care",
      symptomMonitoring: "Symptom Monitoring",
      medicationGuidance: "Medication Guidance",
      specialistReferrals: "Specialist Referrals",
      personalizedPriorities: "Personalized Priorities",
      followUpPlan: "Follow-up Plan",
      immediateSteps: "Immediate First Aid Steps",
      criticalSigns: "Critical Monitoring Signs",
      whenToSeekHelp: "When to Seek Emergency Help",
      specialNotes: "Special Notes"
  },
  hi: {
      // Authentication
      scannerAuth: "स्कैनर प्रमाणीकरण",
      yourName: "आपका नाम",
      yourPhone: "आपका फोन नंबर (10 अंक)",
      enterOtp: "6-अंकीय OTP दर्ज करें",
      requestOtp: "OTP अनुरोध करें",
      verifyOtp: "OTP सत्यापित करें",
      nameRequired: "नाम आवश्यक है",
      phoneRequired: "फोन नंबर आवश्यक है",
      phoneDigits: "कृपया ठीक 10 अंक दर्ज करें",
      
      // Profile
      medicalProfile: "चिकित्सा प्रोफ़ाइल",
      personalInfo: "व्यक्तिगत जानकारी",
      name: "नाम",
      dob: "जन्म तिथि",
      gender: "लिंग",
      bloodGroup: "रक्त समूह",
      dietPreference: "आहार प्राथमिकता",
      height: "ऊंचाई",
      weight: "वजन",
      contactInfo: "संपर्क जानकारी",
      phone: "फोन",
      address: "पता",
      emergencyContact: "आपातकालीन संपर्क",
      emergencyPhone: "आपातकालीन फोन",
      medicalInfo: "चिकित्सा जानकारी",
      medicalHistory: "चिकित्सा इतिहास/स्थितियाँ",
      allergies: "एलर्जी",
      medications: "वर्तमान दवाएं",
      currentSymptoms: "वर्तमान लक्षण",
      insuranceInfo: "बीमा जानकारी",
      hasInsurance: "बीमा है",
      insuranceProvider: "बीमा प्रदाता",
      policyNumber: "पॉलिसी नंबर",
      
      // Emergency
      emergencyInstructions: "आपातकालीन प्राथमिक चिकित्सा निर्देश",
      sendEmergencyAlert: "आपातकालीन अलर्ट भेजें",
      printPage: "इस पेज को प्रिंट करें",
      confirmEmergency: "आपातकालीन अलर्ट भेजें?",
      locationUnavailable: "स्थान प्राप्त नहीं किया जा सका। बिना स्थान के भेजें?",
      geolocationUnsupported: "जियोलोकेशन समर्थित नहीं है। बिना स्थान के भेजें?",
      
      // Recommendations
      healthRecommendationsTitle: "व्यक्तिगत स्वास्थ्य सिफारिशें",
      firstAidTitle: "आपातकालीन प्राथमिक चिकित्सा निर्देश",
      nutritionPlan: "पोषण योजना",
      exerciseRegimen: "व्यायाम व्यवस्था",
      lifestyleOptimization: "जीवनशैली अनुकूलन",
      medicalManagement: "चिकित्सा प्रबंधन",
      emergencyProtocols: "आपातकालीन प्रोटोकॉल",
      comprehensiveAssessment: "व्यापक स्वास्थ्य मूल्यांकन",
      foodsToEmphasize: "जिन खाद्य पदार्थों पर जोर देना है",
      foodsToLimit: "जिन खाद्य पदार्थों को सीमित करना है",
      hydration: "जलयोजन",
      supplements: "पूरक आहार",
      cardio: "कार्डियो",
      strengthTraining: "शक्ति प्रशिक्षण",
      flexibility: "लचीलापन",
      activityModifications: "गतिविधि संशोधन",
      sleep: "नींद",
      stressManagement: "तनाव प्रबंधन",
      habits: "आदतें",
      preventiveCare: "निवारक देखभाल",
      symptomMonitoring: "लक्षण निगरानी",
      medicationGuidance: "दवा मार्गदर्शन",
      specialistReferrals: "विशेषज्ञ रेफरल",
      personalizedPriorities: "व्यक्तिगत प्राथमिकताएं",
      followUpPlan: "फॉलो-अप योजना",
      immediateSteps: "तत्काल प्राथमिक चिकित्सा कदम",
      criticalSigns: "महत्वपूर्ण निगरानी संकेत",
      whenToSeekHelp: "आपातकालीन सहायता कब लेनी चाहिए",
      specialNotes: "विशेष नोट्स"
  }
};

const translateElement = (element, lang) => {
  if (!element.dataset.translate) return;
  
  const key = element.dataset.translate;
  if (translations[lang] && translations[lang][key]) {
      if (element.placeholder) {
          element.placeholder = translations[lang][key];
      } else if (element.value) {
          element.value = translations[lang][key];
      } else {
          element.textContent = translations[lang][key];
      }
  }
};

const translatePage = (lang) => {
  document.querySelectorAll('[data-translate]').forEach(el => {
      translateElement(el, lang);
  });
  
  // Update HTML lang attribute
  document.documentElement.lang = lang;
  
  // Store language preference
  localStorage.setItem('preferredLanguage', lang);
  
  // Update any dynamic content that might have been loaded
  translateDynamicContent(lang);
};

const translateDynamicContent = (lang) => {
  // Translate any dynamically loaded content like recommendations
  const dynamicElements = document.querySelectorAll('.dynamic-translate');
  dynamicElements.forEach(el => {
      el.innerHTML = translateContent(el.innerHTML, lang);
  });
};

const translateContent = (content, lang) => {
  if (!content || typeof content !== 'string') return content;
  
  // Replace known phrases
  let translated = content;
  for (const [key, value] of Object.entries(translations[lang])) {
      const englishText = translations.en[key];
      if (englishText) {
          translated = translated.replace(new RegExp(escapeRegExp(englishText), value));
      }
  }
  
  return translated;
};

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getPreferredLanguage = () => {
  return localStorage.getItem('preferredLanguage') || 'en';
};

// Initialize with preferred language on load
const initLanguage = () => {
  const lang = getPreferredLanguage();
  translatePage(lang);
};

module.exports = {
  translations,
  translatePage,
  getPreferredLanguage,
  translateContent,
  initLanguage,
  translateDynamicContent
};