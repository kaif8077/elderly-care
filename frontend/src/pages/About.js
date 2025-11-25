import React from 'react';
import { Link } from 'react-router-dom';
import '../pages/About.css';
import aboutHero from '../assests/about-hero.jpg';
import aboutUsImage from '../assests/about_us.png';





const About = () => {
  return (
    <div className="about-page">
      {/* Hero Banner */}
      <div className="about-hero" style={{ backgroundImage: `url(${aboutHero})` }}>
        <div className="hero-overlay">
          <h1>About ElderlyCare</h1>
          <p>Compassionate technology for senior healthcare</p>
        </div>
      </div>

      {/* About Us Section - Modified Layout */}
      <section className="section-about">
        <div className="container">
          <div className="about-content">
            <h2>Who We Are</h2>
            <p style={{ textAlign: 'justify' }}>
            ElderlyCare is a platform designed to simplify healthcare management for seniors. Developed in 2025, it allows users to fill out medical forms, which generate personalized recommendations based on their health profile. Additionally, the platform creates a unique QR code-based ID card, also known as a vCard. By scanning this QR code, caregivers and medical professionals can access detailed medical information about the senior, improving care coordination and response time.</p>
            <p style={{ textAlign: 'justify' }}>In case of emergencies, ElderlyCare provides an emergency alert system that enables users to send immediate alerts with their location, ensuring a swift response when needed. The platform’s user-friendly features aim to enhance the independence, well-being, and security of aging individuals, helping them live with dignity and access the support they need at any time.</p>
          </div>
          <div className="about-image">
            <img 
              src={aboutUsImage} 
              alt="ElderlyCare team helping seniors" 
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Additional Content Below */}
      <section className="section-details">
        <div className="container">
          <div className="details-content">
            
            
            <h3>Our Approach</h3>
            <p style={{ textAlign: 'justify' }}>
              We take a holistic approach to senior care, focusing on three key pillars: accessibility, security, 
              and personalization. Our platform is designed specifically with seniors in mind, featuring large text, 
              intuitive navigation, and voice assistance.
            </p>
            
            <h3>Technology with Compassion</h3>
            <p style={{ textAlign: 'justify' }}>
              While we leverage cutting-edge technology like AI health recommendations and emergency QR codes, 
              we never forget the human element. Every feature is tested with real seniors to ensure it meets 
              their needs and capabilities.
            </p>
            
            <h3>Commitment to Privacy</h3>
            <p style={{ textAlign: 'justify' }}>
              We implement military-grade encryption and strict access controls to protect our users' sensitive 
              health information. Your data belongs to you, and we're committed to keeping it secure.
            </p>
          </div>
        </div>
      </section>


      

       

      {/* Team Section - Compact Layout */}
<section className="section-team">
  <div className="container">
    <h2>Our Team</h2>
    <p className="team-description">Dedicated professionals creating compassionate healthcare solutions together.</p>
    <div className="team-grid-compact">
      {[
        {
          name: "Vibhor Kumar Vishnoi",
          role: "Project Mentor",
          description: "Guides technical implementation with academic expertise",
          initials: "VK",
          color: "#6c5ce7"
        },
        {
          name: "Mohammad Kaif",
          role: "Frontend Developer",
          description: "Builds intuitive interfaces with React technology",
          initials: "MK",
          color: "#FF6B6B"
        },
        {
          name: "Madhur Panghal",
          role: "Backend Developer",
          description: "Develops robust server-side systems efficiently",
          initials: "MP",
          color: "#4ECDC4"
        },
        {
          name: "Mohammad Affan",
          role: "UI/UX Designer",
          description: "Creates accessible designs for elderly users",
          initials: "MA",
          color: "#FFD166"
        },
        {
          name: "Ibrahim Saud",
          role: "Quality Assurance",
          description: "Ensures flawless functionality and usability",
          initials: "IS",
          color: "#06D6A0"
        }
      ].map((member, index) => (
        <div className="team-card-compact" key={index}>
          <div className="member-avatar" style={{ backgroundColor: member.color }}>
            {member.initials}
          </div>
          <div className="member-info">
            <h4>{member.name}</h4>
            <p className="role">{member.role}</p>
            <p className="member-description">{member.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Footer Section */}
      <footer className="footer-section">
        <p>&copy; 2025 ElderlyCare. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default About;