
import { useState, useEffect } from 'react';

import '../pages/Services.css';
import aboutHero from '../assests/about-hero.jpg';
import formFillingImg from '../assests/form.png';
import recommendationsImg from '../assests/recommendation.png';
import qrCodeImg from '../assests/qr_id_card.png';
import secureAccessImg from '../assests/secure.png';
import emergencyAlertsImg from '../assests/emergency.png';
import printProfileImg from '../assests/print.png';
import languageImg from '../assests/language.png';


const Services = () => {
    const [activeService, setActiveService] = useState(0);

    const features = [
        {
            id: "form-filling",
            title: "Medical Form Filling",
            image: formFillingImg,
            content: {
                subHeading1: "Comprehensive Personal & Medical Profile Creation",
                text1: "Our medical form allows you to systematically document all critical personal and health information in one secure platform. You can input your full name, date of birth, blood group, height, weight, and contact details for identification purposes. The system also captures complete address information along with multiple emergency contact numbers to ensure you're reachable during crises. This foundational data creates your unique health identity within our ElderlyCare ecosystem.",

                subHeading2: "Detailed Medical History & Current Health Status",
                text2: "Go beyond basic information by recording your complete medical journey. The form includes sections for chronic conditions (like diabetes or hypertension), past surgical procedures, hospitalization history, and current medication schedules with dosages. You can document known allergies (drugs, food, or environmental), vaccination records, and family medical history. Special fields are available for mobility challenges, cognitive conditions, and assistive device requirements - particularly valuable for elderly users. Regular updates ensure your profile reflects your latest health status.",

                subHeading3: "Insurance Integration & Emergency Preparedness",
                text3: "The platform seamlessly integrates insurance information for complete health readiness. You can upload policy documents, insurer details, and claim procedures. Critical financial information like mediclaim numbers and pre-authorization requirements are stored securely. In emergency situations, hospitals can quickly access this data through your QR code, significantly speeding up admission processes. The system also allows you to specify healthcare proxies and power of attorney details for comprehensive emergency planning."
            }
        },
        {
            id: "recommendations",
            title: "Personalized Health Recommendations",
            image: recommendationsImg,
            content: {
                subHeading1: "AI-Driven Health Analysis & Risk Assessment",
                text1: "Our advanced algorithm processes your medical profile to identify potential health risks and care requirements. By analyzing your conditions, medications, and vital statistics, the system detects possible drug interactions, nutritional deficiencies, and preventive care needs. For elderly users, it specifically evaluates fall risks, cognitive decline patterns, and mobility limitations. The analysis considers seasonal factors and local health advisories to provide contextual recommendations tailored to your environment and lifestyle.",

                subHeading2: "Customized Care Plans & Daily Guidance",
                text2: "Receive actionable health suggestions categorized by priority - from critical medication reminders to general wellness tips. The system generates personalized diet charts considering your conditions (like renal-friendly or diabetic diets), along with recommended portion sizes and meal timings. Exercise suggestions accommodate mobility levels, suggesting chair yoga for arthritis patients or balance exercises for fall prevention. Daily care routines include hydration reminders, wound care instructions for diabetics, and cognitive exercises for memory maintenance.",

                subHeading3: "Elderly-Specific Support & Caregiver Resources",
                text3: "Specialized modules address unique senior care needs. The system provides home safety checklists, adaptive equipment suggestions, and bedridden care protocols. Caregivers receive tailored guidance on assisting with daily activities, managing sundowning symptoms, and preventing pressure ulcers. Community resources like senior-friendly transport services or meal delivery options are recommended based on location. The platform also suggests when to consult specialists and prepares printable reports for doctor visits."
            }
        },
        {
            id: "qr-code-id-card",
            title: "QR Code Health ID",
            image: qrCodeImg,
            content: {
                subHeading1: "Smart Digital Identity for Emergency Situations",
                text1: "Your ElderlyCare QR code serves as a comprehensive digital health ID that emergency responders can instantly access. When scanned, it reveals critical information like your name, blood group, primary conditions, and emergency contacts without needing internet. The code is designed for high visibility - printable as wallet cards, stickable as fridge magnets, or wearable as silicone bracelets. Special UV-resistant and waterproof versions ensure durability. The system automatically updates the linked information whenever you modify your profile, guaranteeing data accuracy.",

                subHeading2: "Multi-Layered Security & Access Control",
                text2: "While providing instant emergency access, the system employs robust privacy protections. First responders see only life-saving information initially (allergies, conditions, blood type). Detailed records require OTP verification sent to your emergency contacts. Each scan attempt is logged with timestamp and location data, which you can review. You can temporarily disable the QR code if lost and generate a new one without changing existing medical data. The system supports temporary access codes for hospital stays or caregiver assignments.",

                subHeading3: "Integration with Healthcare Systems",
                text3: "The QR code is designed for seamless integration with hospital EHR systems. Medical staff can quickly import your data into their records, reducing admission time. For elderly with complex conditions, the code links to advanced directives or DNR orders where applicable. Pharmacies can scan to verify medication history before dispensing. The system also works with emergency services' existing QR readers, making adoption barrier-free. Regular security audits ensure compliance with health data protection standards."
            }
        },
        {
            id: "qr-code-scan",
            title: "QR Code Scanning",
            image: secureAccessImg,
            content: {
                subHeading1: "Secure Authentication & Access Logging",
                text1: "Every QR code scan initiates a secure authentication protocol that records the scanner's identity. Medical professionals must register their name, contact number, and institutional affiliation before accessing full records. The system generates real-time alerts to the patient and emergency contacts when accessed, including the scanner's details and location. For elderly living alone, this provides an additional security layer against unauthorized access. All access attempts are stored in an encrypted audit log that users can review through their portal.",

                subHeading2: "Comprehensive Medical Profile Display",
                text2: "Upon successful authentication, responders see an organized emergency view prioritizing critical information - blood type, active conditions, current medications, and allergies. The interface allows quick navigation to detailed sections like surgical history or immunization records. For elderly patients, special sections highlight mobility aids required, cognitive status, and preferred communication methods. The system displays emergency contacts with their relationship to the patient and preferred contact sequence during crises.",

                subHeading3: "Context-Aware First Aid Guidance",
                text3: "The scanner receives situation-specific first aid instructions based on the patient's profile. For diabetic emergencies, it shows hypoglycemia management steps. For fall incidents, it demonstrates safe movement techniques for elderly. The system incorporates visual guides and multilingual audio instructions for various emergency scenarios. Responders can quickly access nearby hospital directions and emergency service contacts through integrated maps. The interface also displays the patient's preferred hospitals and doctors when available."
            }
        },
        {
            id: "alert-notifications",
            title: "Emergency Alerts",
            image: emergencyAlertsImg,
            content: {
                subHeading1: "Instant Emergency Trigger System",
                text1: "The panic button feature allows one-touch emergency signaling even for technology-challenged elderly users. When activated, the system simultaneously alerts all designated contacts through SMS, app notifications, and automated calls. The alert includes a pre-recorded emergency message with the patient's name and critical medical information. For fall detection-enabled devices, automatic alerts trigger after impact if no movement is detected. The system supports voice-activated alerts for hands-free emergency signaling in critical situations.",

                subHeading2: "Real-Time Location Tracking & Sharing",
                text2: "Emergency alerts automatically attach the patient's precise GPS coordinates with a Google Maps link. For indoor locations, the system utilizes Wi-Fi positioning to determine floor-level accuracy in buildings. The location updates continuously until the alert is resolved, showing movement patterns if the patient is transported. Caregivers can see the alert origin point and any subsequent location changes through a secure tracking interface. The system also identifies and shares nearby landmarks to help responders locate the patient quickly.",

                subHeading3: "Escalation Protocols & Response Coordination",
                text3: "The alert system follows customizable escalation chains if primary contacts don't respond within set timeframes. It can automatically notify secondary contacts or local emergency services based on alert severity. A shared response interface allows multiple caregivers to coordinate - marking who's handling transport, who's contacting hospitals, etc. Post-emergency, the system generates a detailed timeline of alert responses for review and protocol improvements. Integration with hospital systems allows pre-alerting emergency departments when critical patients are en route."
            }
        },
        {
            id: "print-page",
            title: "Medical Profile Printing",
            image: printProfileImg,
            content: {
                subHeading1: "Comprehensive Document Generation",
                text1: "The system generates printable PDFs containing the complete medical profile organized into logical sections. The document includes personal identification details, medical history summary, current treatment plans, and emergency protocols. For elderly patients, it specifically highlights mobility considerations, cognitive status, and special care instructions. The printable version maintains all critical information while omitting sensitive contact details that should remain digital-only. Users can select between full records or customized summaries based on specific needs like travel or specialist consultations.",

                subHeading2: "Travel-Ready Health Kits",
                text2: "The platform creates specialized travel documents including medication schedules in multiple time zones, doctor contact information, and hospital preferences for destinations. For elderly travelers, it generates translated medical summaries in common languages with pictogram-based instructions. The system can produce wallet-sized emergency cards with condensed health information and QR codes. Travel packs include medication lists with generic names for international pharmacies and insurance claim forms pre-filled with essential details.",

                subHeading3: "Caregiver Resources & Hospitalization Packs",
                text3: "Printable caregiver guides provide daily care checklists, medication administration records, and symptom tracking sheets. Hospitalization packs include admission checklists, current treatment summaries, and questions for medical teams. The system generates formatted medication reconciliation sheets that help prevent prescription errors during care transitions. For memory-impaired elderly, it creates visual medication charts and daily routine guides. All documents maintain consistent formatting with the digital profile for easy cross-reference."
            }
        },
        {
            id: "language-selection",
            title: "Multilingual Support",
            image: languageImg,
            content: {
                subHeading1: "Bilingual Interface for Inclusive Healthcare Access",
                text1: "The platform offers complete functionality in both English and Hindi, breaking language barriers in healthcare management. All navigation menus, form fields, and instructions are professionally translated while maintaining medical accuracy. The interface allows instant switching between languages without losing entered data. Critical medical terms display with explanatory tooltips in both languages to ensure understanding. Voice-assisted guidance is available for visually impaired users in both languages, making the system accessible to diverse user groups across urban and rural India.",

                subHeading2: "Culturally Adapted Health Communication",
                text2: "Beyond literal translation, health recommendations are culturally contextualized. Dietary suggestions consider regional food habits and local ingredient availability. Exercise demonstrations feature clothing and settings familiar to Indian seniors. Medical advice respects cultural beliefs while promoting evidence-based care. The system uses appropriate honorifics and communication styles expected by elderly users in different linguistic contexts. Community health resources are filtered by language preference to ensure relevance.",

                subHeading3: "Family Caregiver Support in Preferred Language",
                text3: "Recognizing that caregivers may have different language preferences than patients, the system allows separate language settings for different user roles. Printable care instructions and medication schedules generate in the caregiver's chosen language. Video tutorials demonstrating care techniques (like transferring patients or wound dressing) are available in multiple languages. The platform provides multilingual templates for common doctor's visit questions and prescription explanations, empowering families to advocate for their elders' health needs effectively."
            }
        }
    ];

    // Scroll to the correct section when page loads with hash
    useEffect(() => {
        const hash = window.location.hash;

        if (!hash) return;

        const index = features.findIndex(
            (f) => `#${f.id}` === hash
        );

        if (index === -1) return;

        setActiveService(index);

        document
            .getElementById(features[index].id)
            ?.scrollIntoView();

    }, []);


    return (
        <div className="services-page">
            <div className="services-hero" style={{ backgroundImage: `url(${aboutHero})` }}>
                <div className="hero-overlay">
                    <h1>Our Essential Health Services</h1>
                    <p>Your complete digital health companion for emergencies and daily care</p>
                </div>
            </div>

            <section className="services-main-content">
                <div className="container">
                    <div className="services-layout">
                        <div className="services-left">
                            <div className="services-list-container">
                                <div className="services-list">
                                    {features.map((feature, index) => (
                                        <div
                                            key={index}
                                            id={feature.id}
                                            className={`service-item ${activeService === index ? 'active' : ''}`}
                                            onClick={() => setActiveService(index)}
                                        >
                                            <div className="service-info">
                                                <h3>{feature.title}</h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="services-right">
                            <div className="service-image-container">
                                <img
                                    src={features[activeService].image}
                                    alt={features[activeService].title}
                                    className="service-image"
                                />
                            </div>
                            <div className="service-content">
                                <h2>{features[activeService].title}</h2>

                                <div className="content-section">
                                    <h3>{features[activeService].content.subHeading1}</h3>
                                    <p style={{ textAlign: 'justify' }}>{features[activeService].content.text1}</p>
                                </div>

                                <div className="content-section">
                                    <h3>{features[activeService].content.subHeading2}</h3>
                                    <p style={{ textAlign: 'justify' }}>{features[activeService].content.text2}</p>
                                </div>

                                <div className="content-section">
                                    <h3>{features[activeService].content.subHeading3}</h3>
                                    <p style={{ textAlign: 'justify' }}>{features[activeService].content.text3}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="footer-section">
                <p>&copy; {new Date().getFullYear()} ElderlyCare. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Services;