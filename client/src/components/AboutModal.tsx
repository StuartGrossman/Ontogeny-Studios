import React from 'react';
import './AboutModal.css';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>About Us</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="about-content">
          <div className="about-section">
            <h3 className="section-title">Our Team</h3>
            <p className="section-text">
              We are a small, focused team of expert developers with over 15 years of combined experience in software development. Our compact size allows for direct communication and rapid decision-making.
            </p>
          </div>
          
          <div className="about-section">
            <h3 className="section-title">Expertise</h3>
            <p className="section-text">
              Our team specializes in modern web technologies and frameworks, including:
            </p>
            <ul className="tech-list">
              <li>React & Next.js</li>
              <li>Node.js & Express</li>
              <li>TypeScript</li>
              <li>Cloud Infrastructure</li>
              <li>DevOps & CI/CD</li>
            </ul>
          </div>

          <div className="about-section">
            <h3 className="section-title">Our Approach</h3>
            <p className="section-text">
              We believe in using the right tools for the job. Our development process is streamlined and efficient, focusing on:
            </p>
            <ul className="tech-list">
              <li>Rapid Prototyping</li>
              <li>Clean Code Architecture</li>
              <li>Automated Testing</li>
              <li>Continuous Integration</li>
              <li>Regular Client Updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal; 