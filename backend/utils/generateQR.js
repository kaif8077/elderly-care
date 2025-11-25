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
        const serverIP = process.env.NGROK_URL;
        console.log(serverIP);
        
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medical Profile - ${profile.name || 'Patient'}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .auth-container {
            background-color: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .auth-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .auth-form input {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        .auth-form button {
            padding: 12px;
            background-color: #0066ff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        .auth-form button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        .profile-content {
            display: none;
        }
        .error-message {
            color: #e74c3c;
            margin-top: 5px;
            font-size: 14px;
        }
        .section {
            margin-bottom: 30px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
        }
        .section-title {
            color: #0066ff;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        }
        .section-content p,
        .section-content li,
        .recommendations p,
        .recommendations li {
            text-align: justify;
            text-justify: inter-word;
        }
        .section-title:after {
            content: '−';
            font-size: 20px;
        }
        .section-title.collapsed:after {
            content: '+';
        }
        .button-group {
            display: flex;
            gap: 10px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
        }
        #emergencyBtn {
            background-color: #e74c3c;
            color: white;
            flex: 1;
            min-width: 200px;
        }
        #emergencyBtn:hover {
            background-color: #c0392b;
        }
        #printBtn {
            background-color: #0066ff;
            color: white;
            flex: 1;
            min-width: 200px;
        }       
        #printBtn:hover {
            background-color: #ff6b00;
        }
        .recommendations {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
        }
        .recommendation-heading {
            color: #0066ff;
            margin: 20px 0 10px 0;
            font-size: 1.2em;
        }
        .recommendation-heading strong {
            color: inherit;
        }
        .recommendation-list {
            list-style-type: none;
            padding-left: 20px;
            margin: 10px 0;
        }
        .numbered-item {
            counter-increment: item;
            margin-bottom: 8px;
            position: relative;
            padding-left: 25px;
        }
        .bullet-item {
            margin-bottom: 8px;
            position: relative;
            padding-left: 20px;
        }
        .language-switcher {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }
        .language-btn {
            padding: 8px 12px;
            background: #f0f0f0;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
        }
        .language-btn.active {
            background: #0066ff;
            color: white;
        }
        @media print {
            .no-print {
                display: none;
            }
            body {
                padding: 0;
                font-size: 12pt;
            }
            .section {
                border-bottom: none;
                page-break-inside: avoid;
            }
        }
        h3 {
            margin-top: 20px;
            color: #0066ff;
        }
    </style>
</head>
<body>
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
                    <ul>${formattedRecommendations}</ul>
                </div>    
            </div>
        </div>
        
        <div class="button-group no-print">
            <button id="emergencyBtn" data-translate="sendEmergencyAlert">Send Emergency Alert</button>
            <button id="printBtn" data-translate="printPage">Print This Page</button>
        </div>
    </div>
    
    <script>
        const serverIP = "${serverIP}";
        let generatedOtp = null;
        
        // Language switching functionality
        const translations = ${JSON.stringify(translations)};
        
        const translateElement = (element, lang) => {
            if (!element.dataset.translate) return;
            
            const key = element.dataset.translate;
            if (translations[lang] && translations[lang][key]) {
                if (element.placeholder) {
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
            
            // Update button states
            document.getElementById('enBtn').classList.toggle('active', lang === 'en');
            document.getElementById('hiBtn').classList.toggle('active', lang === 'hi');
            
            // Store language preference
            localStorage.setItem('preferredLanguage', lang);
        };
        
        // Set initial language
        const initialLang = localStorage.getItem('preferredLanguage') || 'en';
        translatePage(initialLang);
        
        // Language button event listeners
        document.getElementById('enBtn').addEventListener('click', () => {
            translatePage('en');
        });
        
        document.getElementById('hiBtn').addEventListener('click', () => {
            translatePage('hi');
        });

        // Authentication logic
        document.getElementById('requestOtpBtn').addEventListener('click', async () => {
            const name = document.getElementById('scannerName').value.trim();
            let phone = document.getElementById('scannerPhone').value.trim();
            
            // Remove all non-digit characters
            phone = phone.replace(/\D/g, '');
            
            // Clear previous errors
            document.getElementById('nameError').textContent = '';
            document.getElementById('phoneError').textContent = '';
            
            // Validate inputs
            let isValid = true;
            
            if (!name) {
                document.getElementById('nameError').textContent = translations[localStorage.getItem('preferredLanguage') || 'en']['nameRequired'];
                isValid = false;
            }
            
            if (!phone) {
                document.getElementById('phoneError').textContent = translations[localStorage.getItem('preferredLanguage') || 'en']['phoneRequired'];
                isValid = false;
            } else if (phone.length !== 10) {
                document.getElementById('phoneError').textContent = translations[localStorage.getItem('preferredLanguage') || 'en']['phoneDigits'];
                isValid = false;
            }
            
            if (!isValid) return;
            
            try {
                // Send to server to generate and send OTP
                const response = await fetch(serverIP + '/api/qr/send-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        phone: phone,
                        name: name
                    }),
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to send OTP');
                }
                
                // For demo purposes, we'll generate OTP client-side
                generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
                alert('OTP sent successfully. For demo purposes, your OTP is: ' + generatedOtp);
                
                // Show OTP section and verify button
                document.getElementById('otpSection').style.display = 'block';
                document.getElementById('requestOtpBtn').style.display = 'none';
                document.getElementById('verifyOtpBtn').style.display = 'block';
                document.getElementById('verifyOtpBtn').disabled = false;
                
            } catch (error) {
                console.error('Error requesting OTP:', error);
                document.getElementById('phoneError').textContent = error.message;
            }
        });
        
        document.getElementById('verifyOtpBtn').addEventListener('click', async () => {
            const enteredOtp = document.getElementById('otp').value.trim();
            const phone = document.getElementById('scannerPhone').value.replace(/\D/g, '');
            
            console.log('Attempting verification with:', {phone, enteredOtp});

            try {
                const response = await fetch(serverIP + '/api/qr/verify-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        phone: phone,
                        otp: enteredOtp
                    }),
                });
                
                const data = await response.json();
                console.log('Verification response:', data);
                
                if (!response.ok) {
                    throw new Error(data.message || 'OTP verification failed');
                }

                // Successful verification
                document.getElementById('authContainer').style.display = 'none';
                document.getElementById('profileContent').style.display = 'block';
                
            } catch (error) {
                console.error('Verification failed:', error);
                document.getElementById('otpError').textContent = error.message;
                
                // Show more detailed error if available
                if (error.response && error.response.data) {
                    console.error('Server response:', error.response.data);
                }
            }
        });

        // Check if already authenticated (for page refreshes)
        if (sessionStorage.getItem('scannerAuthenticated') === 'true') {
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('profileContent').style.display = 'block';
        }

        // Profile section toggle functionality
        document.querySelectorAll('.section-title').forEach(title => {
            title.addEventListener('click', () => {
                const content = title.nextElementSibling;
                title.classList.toggle('collapsed');
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
            });
            title.nextElementSibling.style.display = 'block';
        });

        document.getElementById('printBtn').addEventListener('click', () => {
            window.print();
        });

        const sendEmergencyMessage = async (latitude, longitude) => {
            try {
                const emergencyContact = "${profile.emergencyPhone}";
                const profileName = "${profile.name}"
                const scannerName = sessionStorage.getItem('scannerName') || 'Unknown Scanner';
                const scannerPhone = sessionStorage.getItem('scannerPhone') || 'Unknown Phone';
                
                const message = \`Emergency Alert: \${profileName} needs assistance! 
Scanner: \${scannerName} (\${scannerPhone})
\${latitude && longitude ? \`Location: https://www.google.com/maps?q=\${latitude},\${longitude}\` : 'Location unavailable'}\`;

                const smsResponse = await fetch(serverIP + '/api/send-sms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: emergencyContact,
                        body: message,
                        latitude: latitude || null, 
                        longitude: longitude || null
                    }),
                });

                const responseData = await smsResponse.json();

                if (!smsResponse.ok) {
                    throw new Error(responseData.message || 'Failed to send SMS');
                }

                alert(translations[localStorage.getItem('preferredLanguage') || 'en']['emergencyMessageSent'] || "Emergency message sent to " + emergencyContact);
            } catch (error) {
                console.error("Error sending message:", error);
                alert(translations[localStorage.getItem('preferredLanguage') || 'en']['emergencyMessageFailed'] || "Failed to send emergency message: " + error.message);
            }
        };

        const getLocationAndSendMessage = () => {
            const lang = localStorage.getItem('preferredLanguage') || 'en';
            const confirmMessage = translations[lang]['confirmEmergency'] || "Send emergency alert?";
            const locationMessage = translations[lang]['locationUnavailable'] || "Unable to get location. Send without location?";
            const geolocationMessage = translations[lang]['geolocationUnsupported'] || "Geolocation not supported. Send without location?";

            if (confirm(confirmMessage)) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            await sendEmergencyMessage(
                                position.coords.latitude, 
                                position.coords.longitude
                            );
                        },
                        (error) => {
                            console.error("Location error:", error);
                            if (confirm(locationMessage)) {
                                sendEmergencyMessage(null, null);
                            }
                        },
                        { timeout: 10000, enableHighAccuracy: true }
                    );
                } else {
                    if (confirm(geolocationMessage)) {
                        sendEmergencyMessage(null, null);
                    }
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