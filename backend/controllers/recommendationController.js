require('dotenv').config();
const RecommendationCache = require('../models/RecommendationCache');

// Free AI APIs - Multiple options
const HF_API_KEY = process.env.HF_API_KEY || 'your_hugging_face_token';

const generateHealthRecommendations = async (profile) => {
    try {
        // Check cache first
        const cacheKey = `health_${JSON.stringify(profile)}`;
        const cached = await RecommendationCache.findOne({ cacheKey: cacheKey });
        if (cached && (Date.now() - cached.createdAt.getTime()) < 24 * 60 * 60 * 1000) {
            return cached.value;
        }

        const prompt = `As a senior medical expert, provide personalized health recommendations for:
Name: ${profile.name}, Age: ${profile.dob || 'Not specified'}, Gender: ${profile.gender || 'Not specified'},
Medical History: ${profile.medicalHistory || 'None'}, Allergies: ${profile.allergies || 'None'},
Medications: ${profile.medications || 'None'}, Symptoms: ${profile.currentSymptoms || 'None'}

Provide detailed recommendations in this format:

HEALTH ASSESSMENT
[Overall assessment]

NUTRITION PLAN
- Breakfast: [suggestion]
- Lunch: [suggestion] 
- Dinner: [suggestion]
- Foods to emphasize
- Foods to limit

EXERCISE REGIMEN
- Cardio exercises
- Strength training
- Flexibility exercises

LIFESTYLE RECOMMENDATIONS
- Sleep advice
- Stress management
- Daily habits

MEDICAL MANAGEMENT
- Symptom monitoring
- Medication guidance
- When to see doctor`;

        // Try multiple free AI APIs with fallback
        let aiRecommendations = null;
        
        // Try Hugging Face with different models
        aiRecommendations = await tryHuggingFaceAPI(prompt);
        
        // If Hugging Face fails, use fallback immediately
        let recommendations = aiRecommendations || getFallbackHealthRecommendations(profile);

        // Cache the result
        const cacheEntry = new RecommendationCache({
            cacheKey: cacheKey,
            value: recommendations,
            type: 'health',
            createdAt: new Date()
        });
        await cacheEntry.save();

        return recommendations;

    } catch (error) {
        console.error('Error generating health recommendations:', error);
        return getFallbackHealthRecommendations(profile);
    }
};

const generateFirstAidRecommendations = async (profile) => {
    try {
        const cacheKey = `firstaid_${JSON.stringify(profile)}`;
        const cached = await RecommendationCache.findOne({ cacheKey: cacheKey });
        if (cached && (Date.now() - cached.createdAt.getTime()) < 24 * 60 * 60 * 1000) {
            return cached.value;
        }

        const prompt = `Provide first aid instructions for elderly person:
Name: ${profile.name}, Medical Conditions: ${profile.medicalHistory || 'None'},
Allergies: ${profile.allergies || 'None'}, Medications: ${profile.medications || 'None'}

Format:
Immediate First Aid Steps
- [Action 1]
- [Action 2]

Critical Monitoring Signs  
- [Sign 1]
- [Sign 2]

When to Seek Emergency Help
- [Trigger 1]
- [Trigger 2]

Special Notes
- [Note 1]
- [Note 2]`;

        // Try AI API with fallback
        let aiRecommendations = await tryHuggingFaceAPI(prompt);
        let recommendations = aiRecommendations || getFallbackFirstAidRecommendations(profile);

        // Cache result
        const cacheEntry = new RecommendationCache({
            cacheKey: cacheKey,
            value: recommendations,
            type: 'firstaid',
            createdAt: new Date()
        });
        await cacheEntry.save();

        return recommendations;

    } catch (error) {
        console.error('Error generating first aid recommendations:', error);
        return getFallbackFirstAidRecommendations(profile);
    }
};

// Helper function to try different Hugging Face models
const tryHuggingFaceAPI = async (prompt) => {
    const models = [
        'microsoft/DialoGPT-medium',  // Smaller, more available model
        'microsoft/DialoGPT-small',   // Even smaller
        'gpt2',                       // Basic GPT-2
        'distilgpt2'                  // Lightweight model
    ];

    for (let model of models) {
        try {
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${model}`,
                {
                    headers: { Authorization: `Bearer ${HF_API_KEY}` },
                    method: "POST",
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: { 
                            max_length: 1000, 
                            temperature: 0.7,
                            do_sample: true 
                        }
                    }),
                }
            );

            if (response.ok) {
                const result = await response.json();
                if (result && result.generated_text) {
                    console.log(`Success with model: ${model}`);
                    return result.generated_text;
                }
            } else if (response.status === 503) {
                // Model is loading, try next one
                console.log(`Model ${model} is loading, trying next...`);
                continue;
            }
        } catch (error) {
            console.log(`Model ${model} failed:`, error.message);
            continue;
        }
    }
    
    return null; // All models failed
};

// Updated Helper functions
const calculateAge = (dob) => {
    if (!dob) return 65;
    try {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch (error) {
        return 65;
    }
};

const hasCondition = (conditions, keywords) => {
    if (!conditions || conditions.length === 0) return false;
    const conditionStr = Array.isArray(conditions) ? conditions.join(' ') : String(conditions);
    return keywords.some(keyword => conditionStr.toLowerCase().includes(keyword.toLowerCase()));
};

// Fallback Health Recommendations (same as before)
const getFallbackHealthRecommendations = (profile) => {
    const name = profile.name || 'Patient';
    const age = calculateAge(profile.dob);
    const conditions = profile.medicalHistory ? 
        (Array.isArray(profile.medicalHistory) ? profile.medicalHistory : [profile.medicalHistory]) : [];
    const allergies = profile.allergies ? 
        (Array.isArray(profile.allergies) ? profile.allergies : [profile.allergies]) : [];
    const medications = profile.medications ? 
        (Array.isArray(profile.medications) ? profile.medications : [profile.medications]) : [];
    const symptoms = profile.currentSymptoms ? 
        (Array.isArray(profile.currentSymptoms) ? profile.currentSymptoms : [profile.currentSymptoms]) : [];

    let recommendations = [];

    // PERSONALIZED HEALTH ASSESSMENT
    recommendations.push(`COMPREHENSIVE HEALTH ASSESSMENT FOR ${name.toUpperCase()}`);
    recommendations.push(`Based on your health profile (Age: ${age} years), here is your personalized health plan:`);
    recommendations.push("");

    // NUTRITION PLAN BASED ON CONDITIONS
    recommendations.push("PERSONALIZED NUTRITION PLAN");
    
    if (hasCondition(conditions, ['diabetes', 'sugar', 'diabetic'])) {
        recommendations.push("- Breakfast: Besan chilla with vegetables + 1 bowl sprouts");
        recommendations.push("- Lunch: 2 whole wheat chapati + dal + seasonal vegetables + salad");
        recommendations.push("- Dinner: 1 multigrain chapati + vegetable curry + curd");
        recommendations.push("- Foods to Emphasize: Bitter gourd, fenugreek, whole grains, green leafy vegetables");
        recommendations.push("- Foods to Limit: Sugar, white bread, processed foods, sweet fruits");
        recommendations.push("- Meal Timing: Small frequent meals every 2-3 hours");
    } 
    else if (hasCondition(conditions, ['heart', 'cardiac', 'hypertension', 'blood pressure'])) {
        recommendations.push("- Breakfast: Oats porridge with nuts + 1 fruit");
        recommendations.push("- Lunch: Brown rice + dal + steamed vegetables + salad");
        recommendations.push("- Dinner: Grilled fish/chicken with vegetables or paneer curry");
        recommendations.push("- Foods to Emphasize: Garlic, omega-3 rich foods, fruits, vegetables");
        recommendations.push("- Foods to Limit: Salt, fried foods, red meat, processed foods");
        recommendations.push("- Salt Intake: Less than 5g per day");
    }
    else if (hasCondition(conditions, ['arthritis', 'joint', 'pain', 'knee'])) {
        recommendations.push("- Breakfast: Turmeric milk + whole grain toast with peanut butter");
        recommendations.push("- Lunch: Rice + fish curry + green vegetables");
        recommendations.push("- Dinner: Moong dal khichdi with ghee");
        recommendations.push("- Foods to Emphasize: Omega-3 foods, turmeric, ginger, vitamin C rich fruits");
        recommendations.push("- Foods to Limit: Nightshade vegetables, processed foods");
    }
    else {
        recommendations.push("- Breakfast: Poha/upma with vegetables + 1 fruit");
        recommendations.push("- Lunch: 2 chapati + dal + vegetable + curd + salad");
        recommendations.push("- Dinner: 1 chapati + vegetable curry + dal");
        recommendations.push("- Foods to Emphasize: Seasonal fruits, vegetables, whole grains");
        recommendations.push("- Foods to Limit: Fried foods, processed snacks, sugary drinks");
    }

    recommendations.push(`- Hydration: ${age > 70 ? '8-10' : '10-12'} glasses of water daily`);
    recommendations.push("");

    // EXERCISE REGIMEN
    recommendations.push("PERSONALIZED EXERCISE REGIMEN");
    
    if (hasCondition(conditions, ['heart', 'blood pressure'])) {
        recommendations.push("- Cardio: 20-30 min brisk walking, 5 days/week");
        recommendations.push("- Strength: Light resistance training, 2 days/week");
        recommendations.push("- Flexibility: Gentle stretching daily");
    }
    else if (hasCondition(conditions, ['arthritis', 'joint'])) {
        recommendations.push("- Cardio: Swimming/cycling 20 min, 3 days/week");
        recommendations.push("- Strength: Chair exercises, light weights");
        recommendations.push("- Flexibility: Yoga, gentle stretching");
    }
    else if (age > 75) {
        recommendations.push("- Cardio: 15-20 min slow walk, daily");
        recommendations.push("- Strength: Chair squats, light dumbbells");
        recommendations.push("- Balance: Heel-to-toe walk, standing on one leg");
    }
    else {
        recommendations.push("- Cardio: 30 min brisk walking, 5 days/week");
        recommendations.push("- Strength: Light weights 3 days/week");
        recommendations.push("- Flexibility: Stretching 10 min daily");
    }
    recommendations.push("");

    // MEDICAL MANAGEMENT
    recommendations.push("MEDICAL MANAGEMENT PLAN");
    
    if (medications.length > 0) {
        recommendations.push(`- Current Medications: Take ${medications.join(', ')} as prescribed`);
        recommendations.push("- Medication Timing: Same time every day");
    }
    
    if (allergies.length > 0) {
        recommendations.push(`- Allergy Alert: Avoid ${allergies.join(', ')}`);
    }

    if (symptoms.length > 0) {
        recommendations.push(`- Symptom Monitoring: Watch for ${symptoms.join(', ')}`);
    }

    recommendations.push("- Health Checkups: Quarterly doctor visits");
    recommendations.push("");

    return recommendations.join('\n');
};

// Fallback First Aid Recommendations (same as before)
const getFallbackFirstAidRecommendations = (profile) => {
    const name = profile.name || 'Patient';
    const age = calculateAge(profile.dob);
    const conditions = profile.medicalHistory ? 
        (Array.isArray(profile.medicalHistory) ? profile.medicalHistory : [profile.medicalHistory]) : [];
    const allergies = profile.allergies ? 
        (Array.isArray(profile.allergies) ? profile.allergies : [profile.allergies]) : [];
    const medications = profile.medications ? 
        (Array.isArray(profile.medications) ? profile.medications : [profile.medications]) : [];
    const bloodGroup = profile.bloodGroup || 'Not specified';

    let recommendations = [];

    recommendations.push(`🚨 EMERGENCY FIRST AID GUIDE FOR ${name.toUpperCase()}`);
    recommendations.push(`Age: ${age} years | Blood Group: ${bloodGroup}`);
    recommendations.push("");

    recommendations.push("IMMEDIATE FIRST AID STEPS");
    
    if (hasCondition(conditions, ['diabetes', 'sugar'])) {
        recommendations.push("- Check blood sugar level if possible");
        recommendations.push("- If conscious: Provide fruit juice or sugar");
        recommendations.push("- If unconscious: Do not put anything in mouth");
    }
    
    if (hasCondition(conditions, ['heart', 'cardiac'])) {
        recommendations.push("- Help sit in comfortable position");
        recommendations.push("- Loosen tight clothing");
        recommendations.push("- Check if carrying angina medication");
    }

    recommendations.push("- Call emergency services: 102/108/112");
    recommendations.push("- Check responsiveness and breathing");
    recommendations.push("- Do not move if fall or injury suspected");
    recommendations.push("");

    recommendations.push("CRITICAL MONITORING SIGNS");
    recommendations.push("- Breathing difficulties or chest pain");
    recommendations.push("- Sudden weakness or confusion");
    recommendations.push("- Severe headache or vision changes");
    recommendations.push("- Uncontrolled bleeding");
    recommendations.push("- Loss of consciousness");
    recommendations.push("");

    recommendations.push("WHEN TO SEEK EMERGENCY HELP");
    recommendations.push("- Any chest pain or pressure");
    recommendations.push("- Difficulty speaking or understanding");
    recommendations.push("- Sudden severe pain anywhere");
    recommendations.push("- High fever with confusion");
    recommendations.push("");

    recommendations.push("SPECIAL NOTES");
    
    if (allergies.length > 0) {
        recommendations.push(`- ALLERGIES: ${allergies.join(', ')}`);
    }
    
    if (medications.length > 0) {
        recommendations.push(`- CURRENT MEDICATIONS: ${medications.join(', ')}`);
    }

    return recommendations.join('\n');
};

module.exports = {
    generateHealthRecommendations,
    generateFirstAidRecommendations
};