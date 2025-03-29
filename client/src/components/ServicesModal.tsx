import React from 'react';
import './Modal.css';

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ServicesModal: React.FC<ServicesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Our Approach</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>
            At Ontogeny Studios, we believe in understanding your business from the ground up. Our consultative approach begins with deep conversations to truly grasp your unique challenges, goals, and operational needs. We don't just implement technology – we work with you to identify opportunities where technology can transform your business processes, even in areas you might not have considered.
          </p>
          <p>
            Our expertise spans from full-stack development to complex data analytics, but what sets us apart is our commitment to system-wide optimization. We analyze your entire business ecosystem to identify inefficiencies and implement cost-saving solutions across all departments. Whether it's custom web scrapers, automated workflows, API integrations, or AI agents, we focus on creating solutions that deliver real business value and measurable ROI.
          </p>
          <p>
            Starting at just $500 for a beta version of your custom system, we provide comprehensive solutions including custom dashboards, data visualization, and specialized accounting tools that give you unprecedented insights into your operations. Our rapid development cycles mean you can start seeing results in days, not weeks, while our cost-effective approach helps you eliminate expensive legacy enterprise software and reduce operational overhead.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServicesModal; 