import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../pages/Home.css';
import banner1 from '../assests/banner1.jpg';
import aboutUsImage from '../assests/about-us.jpg';
import whyChooseUsImage from '../assests/why-choose-us.jpg';

const Home = () => {
    const [activeFaq, setActiveFaq] = useState(null);
    const [currentFeatureSlide, setCurrentFeatureSlide] = useState(0);
    const [slidesToShow, setSlidesToShow] = useState(4);

    // Banner data (only one banner now)
    const banners = [
        {
            image: banner1,
            heading: "Welcome to ElderlyCare",
            paragraph: "Empowering seniors with accessible health records anytime, anywhere.",
        }
    ];

    // Features data (12 items)
    const features = [
        {
            emoji: "📝",
            title: "Health Profile Setup",
            description: "Store medical history and emergency contacts securely for quick access during emergencies.",
            link: "/services#form-filling"
        },
        {
            emoji: "💡",
            title: "Health Recommendations",
            description: "Personalized health suggestions based on your medical conditions and treatment history.",
            link: "/services#recommendations"
        },
        {
            emoji: "📲",
            title: "Digital Health ID",
            description: "QR code containing vital medical information for emergency responders to scan.",
            link: "/services#qr-code-id-card"
        },
        {
            emoji: "🔍",
            title: "QR Code Scanning",
            description: "Scan QR codes to view medical details and emergency instructions instantly.",
            link: "/services#qr-code-scan"
        },
        {
            emoji: "🔔",
            title: "Emergency Alerts",
            description: "Instant notifications with location sent during critical health emergencies.",
            link: "/services#alert-notifications"
        },
        {
            emoji: "📄",
            title: "Document Printing",
            description: "Print complete medical profiles including prescriptions and emergency contacts.",
            link: "/services#print-page"
        },
        {
            emoji: "🌐",
            title: "Language Options",
            description: "Switch between multiple languages for easier system navigation.",
            link: "/services#language-selection"
        }
    ];

    // Why Choose Us data
    const whyChooseUs = [
        {
            title: "Simplified Healthcare Management",
            description: "ElderlyCare makes healthcare management easy with personalized recommendations."
        },
        {
            title: "Quick Access to Medical Information",
            description: "The vCard provides instant access to detailed medical information."
        },
        {
            title: "Emergency Alert System",
            description: "Send emergency alerts with location for quick response."
        },
        {
            title: "Enhanced Independence and Security",
            description: "Empowers seniors with tools for independence, comfort, and safety."
        }
    ];

    // FAQ data
    const faqs = [
        {
            question: "How does the QR code system work?",
            answer: "Each user gets a unique QR code linked to their medical history. In an emergency, scanning the code provides instant access to critical health information."
        },
        {
            question: "Is my medical data secure on ElderlyCare?",
            answer: "Yes, we use advanced security protocols to ensure that your medical records remain private and accessible only to authorized users."
        },
        {
            question: "Can caregivers access a senior's medical records?",
            answer: "Yes, caregivers with permission can securely view and update a senior's health records for better management."
        },
        {
            question: "What kind of health recommendations does ElderlyCare provide?",
            answer: "Our system analyzes medical history to offer personalized suggestions on diet, lifestyle, and preventive care."
        },
        {
            question: "Is ElderlyCare easy to use for seniors?",
            answer: "Absolutely! Our platform is designed with a simple and user-friendly interface to ensure seniors can navigate it with ease."
        }
    ];

    // Handle window resize for feature slider
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1200) {
                setSlidesToShow(4);
            } else if (window.innerWidth >= 992) {
                setSlidesToShow(3);
            } else if (window.innerWidth >= 768) {
                setSlidesToShow(2);
            } else {
                setSlidesToShow(1);
            }
            setCurrentFeatureSlide(0); // Reset to first slide on resize
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nextFeatureSlide = () => {
        setCurrentFeatureSlide(prev =>
            prev >= features.length - slidesToShow ? 0 : prev + 1
        );
    };

    const prevFeatureSlide = () => {
        setCurrentFeatureSlide(prev =>
            prev <= 0 ? features.length - slidesToShow : prev - 1
        );
    };

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const featureSliderStyle = {
        transform: `translateX(-${currentFeatureSlide * (100 / slidesToShow)}%)`
    };

    return (
        <div className="home-container">
            {/* Banner Section - Single Banner */}
            <div className="banner-single">
                <div 
                    className="banner-image"
                    style={{ backgroundImage: `url(${banners[0].image})` }}
                >
                    <div className="banner-content">
                        <h1>{banners[0].heading}</h1>
                        <p>{banners[0].paragraph}</p>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="section-container">
                <div className="about-section section-header">
                    <h2>About Us</h2>
                    <div className="about-content-wrapper">
                        <div className="about-image1">
                            <img
                                src={aboutUsImage}
                                alt="About Us"
                                className="about-image-transition"
                            />
                        </div>
                        <div className="about-content">
                            <p style={{ textAlign: 'justify' }}>ElderlyCare is a platform designed to help seniors manage their health records easily. It provides quick access to medical details via a QR code during emergencies, ensuring vital information is always available when needed.</p>
                            <p style={{ textAlign: 'justify' }}>With personalized health recommendations, ElderlyCare promotes better well-being and peace of mind for both users and caregivers. By simplifying health management, we empower seniors to take control of their medical information while offering reassurance to their loved ones.</p>

                            <Link to="/about" className="learn-more-button">
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Features Section - Now a Slider */}
            <div className="section-container">
                <div className="section features-section">
                    <div className="section-header">
                        <h2>Key Features</h2>
                        <p>Everything you need for comprehensive health management</p>
                    </div>

                    <div className="features-slider-container">
                        <div className="features-slider" style={featureSliderStyle}>
                            {features.map((feature, index) => (
                                <Link
                                    key={index}
                                    to={feature.link}
                                    className="feature-slide-link"
                                    style={{ flex: `0 0 ${100 / slidesToShow}%` }}
                                >
                                    <div className="feature-slide">
                                        <div className="feature-emoji">{feature.emoji}</div>
                                        <h3>{feature.title}</h3>
                                        <p style={{ textAlign: 'justify' }}>{feature.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <button className="slider-nav prev" onClick={prevFeatureSlide}>
                            &#10094;
                        </button>
                        <button className="slider-nav next" onClick={nextFeatureSlide}>
                            &#10095;
                        </button>
                    </div>
                </div>
            </div>

            {/* Mission & Vision Section */}
            <div className="section-container">
                <div className="mission-vision-section">
                    <div className="mission-box">
                        <h3>🌍 Our Mission</h3>
                        <p style={{ textAlign: 'justify' }}>To empower seniors with a simple and effective platform for managing their health and medical information, ensuring immediate access during emergencies and providing personalized health recommendations for enhanced well-being.</p>
                    </div>
                    <div className="vision-box">
                        <h3>👁️ Our Vision</h3>
                        <p style={{ textAlign: 'justify' }}>To create a world where elderly healthcare is seamless, secure, and instantly accessible, fostering independence and peace of mind for seniors and their caregivers.</p>
                    </div>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="section-container">
                <div className="why-choose-us-section">
                    <div className="section-header">
                        <h2>Why Choose Us?</h2>
                        <p>Discover what makes ElderlyCare the best choice for senior health management</p>
                    </div>

                    <div className="why-choose-us-content">
                        <div className="why-choose-us-image">
                            <img
                                src={whyChooseUsImage}
                                alt="Happy senior with caregiver"
                                className="floating-image"
                            />
                        </div>
                        <div className="why-choose-us-list">
                            <ul>
                                {whyChooseUs.map((item, index) => (
                                    <li key={index}>
                                        <h3>{item.title}</h3>
                                        <p>{item.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="section-container">
                <div className="faq-section">
                    <div className="section-header">
                        <h2>Frequently Asked Questions</h2>
                        <p>Find answers to common questions about ElderlyCare</p>
                    </div>
                    <div className="faq-container">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`faq-item ${activeFaq === index ? 'active' : ''}`}
                                onClick={() => toggleFaq(index)}>
                                <div className="faq-question">
                                    <h3>{faq.question}</h3>
                                    <span>{activeFaq === index ? '−' : '+'}</span>
                                </div>
                                {activeFaq === index && <div className="faq-answer"><p>{faq.answer}</p></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <footer className="footer-section">
                <p>&copy; {new Date().getFullYear()} ElderlyCare. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;