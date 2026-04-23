require('dotenv').config();
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { generateFirstAidRecommendations } = require('../controllers/recommendationController');
const twilio = require('twilio');
const { translations } = require('../utils/translationService');

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.generateQR = async (data) => {
    try {
        const qrCode = await QRCode.toDataURL(data);
        return qrCode;
    } catch (err) {
        console.error('Error generating QR code:', err);
        throw err;
    }
};

exports.formatMedicalProfile = async (profile) => {
    try {

        const RENDER_BACKEND_URL = process.env.RENDER_BACKEND_URL || "https://elderly-care-zuq9.onrender.com";
        console.log('Using backend URL:', RENDER_BACKEND_URL);

        const firstAidRecommendations = await generateFirstAidRecommendations(profile);

        const formattedRecommendations = firstAidRecommendations
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/###\s*/g, '')
            .replace(/---+/g, '')
            .replace(/\n\n+/g, '\n')
            .trim()
            .split('\n')
            .filter(line => line.trim() !== '')
            .map((line) => {
                if (/<strong>.*<\/strong>/.test(line)) {
                    return `<h3 class="recommendation-heading">${line}</h3>`;
                }
                if (/^\d+\.\s/.test(line)) {
                    return `<li class="numbered-item">${line}</li>`;
                }
                if (/^[-*]\s/.test(line)) {
                    return `<li class="bullet-item">${line.replace(/^[-*]\s/, '')}</li>`;
                }
                return `<p>${line}</p>`;
            })
            .join('');

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Medical Profile - ${profile.name || 'Patient'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            max-width: 100%;
            margin: 0;
            padding: 16px;
            background-color: #f5f5f5;
            color: #333;
            line-height: 1.5;
        }
        
        /* Main Container */
        .main-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 0;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        /* Auth Container */
        .auth-container {
            background-color: #ffffff;
            padding: 24px 20px;
            margin: 0;
        }
        
        .auth-container h2 {
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: #0066ff;
        }
        
        .auth-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        .auth-form input {
            padding: 12px 16px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            width: 100%;
            -webkit-appearance: none;
            appearance: none;
        }
        
        .auth-form input:focus {
            outline: none;
            border-color: #0066ff;
        }
        
        .auth-form button {
            padding: 14px 20px;
            background-color: #0066ff;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s;
            width: 100%;
        }
        
        .auth-form button:active {
            transform: scale(0.98);
        }
        
        .auth-form button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        
        .profile-content {
            display: none;
            padding: 20px;
        }
        
        .error-message {
            color: #e74c3c;
            margin-top: 5px;
            font-size: 12px;
        }
        
        /* Sections */
        .section {
            margin-bottom: 24px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
        }
        
        .section:last-child {
            border-bottom: none;
        }
        
        .section-title {
            color: #0066ff;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            font-size: 1.25rem;
            font-weight: 600;
        }
        
        .section-title:after {
            content: '−';
            font-size: 24px;
            font-weight: normal;
        }
        
        .section-title.collapsed:after {
            content: '+';
        }
        
        .section-content {
            padding-left: 0;
        }
        
        .section-content p,
        .section-content li {
            text-align: justify;
            margin-bottom: 8px;
        }
        
        .section-content h3 {
            color: #0066ff;
            margin: 16px 0 12px 0;
            font-size: 1.1rem;
        }
        
        .section-content h3:first-child {
            margin-top: 0;
        }
        
        /* Button Group */
        .button-group {
            display: flex;
            gap: 12px;
            margin: 24px 0 16px;
            flex-direction: column;
        }
        
        button {
            padding: 14px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s;
            width: 100%;
        }
        
        button:active {
            transform: scale(0.98);
        }
        
        #emergencyBtn {
            background-color: #e74c3c;
            color: white;
        }
        
        #emergencyBtn:hover {
            background-color: #c0392b;
        }
        
        #printBtn {
            background-color: #0066ff;
            color: white;
        }       
        
        #printBtn:hover {
            background-color: #ff6b00;
        }
        
        /* Recommendations */
        .recommendations {
            background-color: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            margin-top: 12px;
        }
        
        .recommendations ul {
            list-style: none;
            padding-left: 0;
        }
        
        .recommendations p {
            margin-bottom: 10px;
        }
        
        .recommendation-heading {
            color: #0066ff;
            margin: 16px 0 10px 0;
            font-size: 1rem;
            font-weight: 600;
        }
        
        .recommendation-heading:first-child {
            margin-top: 0;
        }
        
        .numbered-item, .bullet-item {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        
        /* Language Switcher */
        .language-switcher {
            position: sticky;
            top: 0;
            right: 0;
            z-index: 1000;
            display: flex;
            justify-content: flex-end;
            background: white;
            padding: 12px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .language-btn {
            width: auto;
            padding: 8px 16px;
            margin: 0 5px;
            background: #f0f0f0;
            border: 1px solid #ddd;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .language-btn.active {
            background: #0066ff;
            color: white;
            border-color: #0066ff;
        }
        
        /* Print Styles */
        @media print {
            .no-print {
                display: none;
            }
            .main-container {
                box-shadow: none;
                padding: 0;
            }
            .profile-content {
                padding: 0;
            }
            body {
                background: white;
                padding: 0;
            }
        }
        
        /* Tablet Styles */
        @media (min-width: 768px) {
            body {
                padding: 20px;
            }
            
            .profile-content {
                padding: 24px;
            }
            
            .button-group {
                flex-direction: row;
            }
            
            button {
                width: auto;
                flex: 1;
            }
            
            .auth-container {
                padding: 32px;
            }
        }
        
        /* Desktop Styles */
        @media (min-width: 1024px) {
            body {
                padding: 30px;
            }
            
            .main-container {
                border-radius: 12px;
            }
            
            .profile-content {
                padding: 32px;
            }
        }
        
        /* Small Mobile */
        @media (max-width: 480px) {
            body {
                padding: 12px;
            }
            
            .profile-content {
                padding: 16px;
            }
            
            .auth-container {
                padding: 20px;
            }
            
            .section-title {
                font-size: 1.1rem;
            }
            
            .section-content h3 {
                font-size: 1rem;
            }
            
            .auth-form input {
                padding: 10px 14px;
                font-size: 14px;
            }
            
            .auth-form button {
                padding: 12px 16px;
                font-size: 14px;
            }
            
            button {
                padding: 12px 16px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="main-container">
        <div class="language-switcher no-print">
            <button class="language-btn active" id="enBtn">English</button>
            <button class="language-btn" id="hiBtn">हिंदी</button>
        </div>

        <div class="auth-container" id="authContainer">
            <h2 data-translate="scannerAuth">Scanner Authentication</h2>
            <form class="auth-form" id="authForm">
                <div>
                    <input type="text" id="scannerName" placeholder="Your Name" data-translate="yourName" required>
                    <div class="error-message" id="nameError" data-translate="nameRequired"></div>
                </div>
                <div>
                    <input type="tel" id="scannerPhone" placeholder="Your Phone Number (10 digits)" data-translate="yourPhone" required>
                    <div class="error-message" id="phoneError" data-translate="phoneRequired"></div>
                </div>
                <div id="otpSection" style="display: none;">
                    <input type="text" id="otp" placeholder="Enter 6-digit OTP" data-translate="enterOtp" required>
                    <div class="error-message" id="otpError"></div>
                </div>
                <button type="button" id="requestOtpBtn" data-translate="requestOtp">Request OTP</button>
                <button type="button" id="verifyOtpBtn" style="display: none;" disabled data-translate="verifyOtp">Verify OTP</button>
            </form>
        </div>

        <div class="profile-content" id="profileContent">
            <div class="section">
                <h1 class="section-title" data-translate="medicalProfile">Medical Profile</h1>
                <div class="section-content">
                    <h3 data-translate="personalInfo">Personal Information</h3>
                    <p><strong data-translate="name">Name:</strong> ${profile.name || 'N/A'}</p>
                    <p><strong data-translate="dob">Date of Birth:</strong> ${profile.dob || 'N/A'}</p>
                    <p><strong data-translate="gender">Gender:</strong> ${profile.gender || 'N/A'}</p>
                    <p><strong data-translate="bloodGroup">Blood Group:</strong> ${profile.bloodGroup || 'N/A'}</p>
                    <p><strong data-translate="dietPreference">Diet Preference:</strong> ${profile.dietPreference || 'N/A'}</p>
                    <p><strong data-translate="height">Height:</strong> ${profile.height ? `${profile.height} cm` : 'N/A'}</p>
                    <p><strong data-translate="weight">Weight:</strong> ${profile.weight ? `${profile.weight} kg` : 'N/A'}</p>
                    
                    <h3 data-translate="contactInfo">Contact Information</h3>
                    <p><strong data-translate="phone">Phone:</strong> ${profile.phone || 'N/A'}</p>
                    <p><strong data-translate="address">Address:</strong> ${profile.address || 'N/A'}</p>
                    <p><strong data-translate="emergencyContact">Emergency Contact:</strong> ${profile.emergencyContact || 'N/A'}</p>
                    <p><strong data-translate="emergencyPhone">Emergency Phone:</strong> ${profile.emergencyPhone || 'N/A'}</p>
                    
                    <h3 data-translate="medicalInfo">Medical Information</h3>
                    <p><strong data-translate="medicalHistory">Medical History/Conditions:</strong> ${profile.medicalHistory || 'N/A'}</p>
                    <p><strong data-translate="allergies">Allergies:</strong> ${profile.allergies || 'N/A'}</p>
                    <p><strong data-translate="medications">Current Medications:</strong> ${profile.medications || 'N/A'}</p>
                    <p><strong data-translate="currentSymptoms">Current Symptoms:</strong> ${profile.currentSymptoms || 'N/A'}</p>
                    
                    <h3 data-translate="insuranceInfo">Insurance Information</h3>
                    <p><strong data-translate="hasInsurance">Has Insurance:</strong> ${profile.hasInsurance ? 'Yes' : 'No'}</p>
                    ${profile.hasInsurance ? `
                        <p><strong data-translate="insuranceProvider">Insurance Provider:</strong> ${profile.insuranceProvider || 'N/A'}</p>
                        <p><strong data-translate="policyNumber">Policy Number:</strong> ${profile.policyNumber || 'N/A'}</p>
                    ` : ''}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title" data-translate="emergencyInstructions">Emergency First Aid Instructions</h2>
                <div class="section-content">
                    <div class="recommendations">
                        ${formattedRecommendations || '<p>No recommendations available at this time.</p>'}
                    </div>    
                </div>
            </div>
            
            <div class="button-group no-print">
                <button id="emergencyBtn" data-translate="sendEmergencyAlert">Send Emergency Alert</button>
                <button id="printBtn" data-translate="printPage">Print This Page</button>
            </div>
        </div>
    </div>
    
    <script>
        const serverIP = "${RENDER_BACKEND_URL}";
        let generatedOtp = null;
        
        const translations = ${JSON.stringify(translations)};
        
        const translateElement = (element, lang) => {
            if (!element.dataset.translate) return;
            const key = element.dataset.translate;
            if (translations[lang] && translations[lang][key]) {
                if (element.placeholder !== undefined) {
                    element.placeholder = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        };
        
        const translatePage = (lang) => {
            document.querySelectorAll('[data-translate]').forEach(el => {
                translateElement(el, lang);
            });
            document.getElementById('enBtn').classList.toggle('active', lang === 'en');
            document.getElementById('hiBtn').classList.toggle('active', lang === 'hi');
            localStorage.setItem('preferredLanguage', lang);
        };
        
        const initialLang = localStorage.getItem('preferredLanguage') || 'en';
        translatePage(initialLang);
        
        document.getElementById('enBtn').addEventListener('click', () => translatePage('en'));
        document.getElementById('hiBtn').addEventListener('click', () => translatePage('hi'));

        // Authentication logic
        document.getElementById('requestOtpBtn').addEventListener('click', async () => {
            const name = document.getElementById('scannerName').value.trim();
            let phone = document.getElementById('scannerPhone').value.trim();
            phone = phone.replace(/\\D/g, '');
            
            document.getElementById('nameError').textContent = '';
            document.getElementById('phoneError').textContent = '';
            
            let isValid = true;
            const lang = localStorage.getItem('preferredLanguage') || 'en';
            
            if (!name) {
                document.getElementById('nameError').textContent = translations[lang]['nameRequired'];
                isValid = false;
            }
            if (!phone) {
                document.getElementById('phoneError').textContent = translations[lang]['phoneRequired'];
                isValid = false;
            } else if (phone.length !== 10) {
                document.getElementById('phoneError').textContent = translations[lang]['phoneDigits'];
                isValid = false;
            }
            
            if (!isValid) return;
            
            try {
                const response = await fetch(serverIP + '/api/qr/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, name }),
                });
                
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
                
                generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
                alert('OTP sent successfully. Your OTP is: ' + generatedOtp);
                
                document.getElementById('otpSection').style.display = 'block';
                document.getElementById('requestOtpBtn').style.display = 'none';
                document.getElementById('verifyOtpBtn').style.display = 'block';
                document.getElementById('verifyOtpBtn').disabled = false;
            } catch (error) {
                document.getElementById('phoneError').textContent = error.message;
            }
        });
        
        document.getElementById('verifyOtpBtn').addEventListener('click', async () => {
            const enteredOtp = document.getElementById('otp').value.trim();
            const phone = document.getElementById('scannerPhone').value.replace(/\\D/g, '');
            const name = document.getElementById('scannerName').value.trim();
            
            try {
                const response = await fetch(serverIP + '/api/qr/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, otp: enteredOtp }),
                });
                
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'OTP verification failed');
                
                sessionStorage.setItem('scannerAuthenticated', 'true');
                sessionStorage.setItem('scannerName', name);
                sessionStorage.setItem('scannerPhone', phone);
                
                document.getElementById('authContainer').style.display = 'none';
                document.getElementById('profileContent').style.display = 'block';
            } catch (error) {
                document.getElementById('otpError').textContent = error.message;
            }
        });
        
        if (sessionStorage.getItem('scannerAuthenticated') === 'true') {
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('profileContent').style.display = 'block';
        }
        
        document.querySelectorAll('.section-title').forEach(title => {
            title.addEventListener('click', () => {
                const content = title.nextElementSibling;
                title.classList.toggle('collapsed');
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
            });
            if (title.nextElementSibling) {
                title.nextElementSibling.style.display = 'block';
            }
        });
        
        document.getElementById('printBtn').addEventListener('click', () => window.print());
        
        const sendEmergencyMessage = async (latitude, longitude) => {
            try {
                const emergencyContact = "${profile.emergencyPhone}";
                const profileName = "${profile.name}";
                const scannerName = sessionStorage.getItem('scannerName') || 'Unknown Scanner';
                const scannerPhone = sessionStorage.getItem('scannerPhone') || 'Unknown Phone';
                
                const message = "🚨 EMERGENCY ALERT 🚨\\n\\n" +
                    "Patient: " + profileName + " needs immediate assistance!\\n\\n" +
                    "📍 SCANNER DETAILS:\\n" +
                    "   Name: " + scannerName + "\\n" +
                    "   Phone: " + scannerPhone + "\\n\\n" +
                    "📍 LOCATION:\\n" +
                    (latitude && longitude ? "   https://www.google.com/maps?q=" + latitude + "," + longitude : "   Location not available") + "\\n\\n" +
                    "⚠️ This is an automated emergency alert. Please respond immediately.";
                
                const smsResponse = await fetch(serverIP + '/api/send-sms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: emergencyContact,
                        body: message,
                        latitude: latitude || null,
                        longitude: longitude || null
                    }),
                });
                
                const responseData = await smsResponse.json();
                if (!smsResponse.ok) throw new Error(responseData.message || 'Failed to send SMS');
                
                const lang = localStorage.getItem('preferredLanguage') || 'en';
                alert(translations[lang]['emergencyMessageSent'] || "Emergency message sent to " + emergencyContact);
            } catch (error) {
                const lang = localStorage.getItem('preferredLanguage') || 'en';
                alert(translations[lang]['emergencyMessageFailed'] || "Failed to send emergency message: " + error.message);
            }
        };
        
        const getLocationAndSendMessage = () => {
            const lang = localStorage.getItem('preferredLanguage') || 'en';
            const confirmMessage = translations[lang]['confirmEmergency'] || "Send emergency alert?";
            
            if (confirm(confirmMessage)) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            await sendEmergencyMessage(position.coords.latitude, position.coords.longitude);
                        },
                        () => sendEmergencyMessage(null, null),
                        { timeout: 10000, enableHighAccuracy: true }
                    );
                } else {
                    sendEmergencyMessage(null, null);
                }
            }
        };
        
        document.getElementById('emergencyBtn').addEventListener('click', getLocationAndSendMessage);
    </script>
</body>
</html>
        `;
    } catch (error) {
        console.error('Error formatting medical profile:', error);
        throw error;
    }
};

exports.saveProfileHTML = async (htmlContent, userId) => {
    const dir = path.join(__dirname, '../public/profiles');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, `${userId}_profile.html`);
    fs.writeFileSync(filePath, htmlContent, 'utf8');
    return filePath;
};