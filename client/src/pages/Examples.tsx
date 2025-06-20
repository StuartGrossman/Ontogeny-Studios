import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import { 
  Truck, 
  Zap, 
  DollarSign, 
  Link, 
  Package, 
  Target,
  LucideIcon 
} from 'lucide-react';
import '../styles/Examples.css';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: LucideIcon;
  features: string[];
  technologies: string[];
  benefits: string[];
  route: string;
  preview: string;
  stats: {
    metric: string;
    value: string;
    description: string;
  }[];
}

const projects: Project[] = [
  {
    id: 1,
    title: 'Business Logistics Platform',
    description: 'A comprehensive logistics management system that revolutionizes how businesses handle their supply chain. Our platform combines real-time tracking, automated processing, and intelligent routing to optimize your entire logistics operation.',
    category: 'Operations',
    icon: Truck,
    route: '/logistics',
    preview: 'Interactive logistics dashboard with real-time tracking, route optimization, and warehouse management.',
    features: [
      'Real-time shipment tracking and monitoring',
      'AI-powered route optimization',
      'Automated order processing and fulfillment',
      'Multi-carrier integration and management',
      'Advanced analytics and reporting dashboard',
      'Warehouse management integration'
    ],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
    benefits: [
      'Reduce delivery times by up to 30%',
      'Cut operational costs by 25%',
      'Improve customer satisfaction',
      'Streamline warehouse operations'
    ],
    stats: [
      {
        metric: 'Delivery Time',
        value: '-30%',
        description: 'Average reduction in delivery times'
      },
      {
        metric: 'Cost Savings',
        value: '25%',
        description: 'Reduction in operational costs'
      },
      {
        metric: 'Efficiency',
        value: '3x',
        description: 'Increase in processing capacity'
      }
    ]
  },
  {
    id: 2,
    title: 'Enterprise Scheduling System',
    description: 'An intelligent scheduling platform that adapts to your business needs. Our system uses AI to optimize resource allocation, manage appointments, and ensure efficient staff scheduling across multiple locations.',
    category: 'Management',
    icon: Zap,
    route: '/scheduling',
    preview: 'Smart scheduling interface with AI-powered optimization and resource management.',
    features: [
      'AI-powered scheduling optimization',
      'Multi-location resource management',
      'Automated conflict resolution',
      'Calendar integration (Google, Outlook)',
      'Custom notification system',
      'Staff availability management'
    ],
    technologies: ['Vue.js', 'Python', 'MongoDB', 'AWS', 'GraphQL', 'TensorFlow'],
    benefits: [
      'Reduce scheduling conflicts by 90%',
      'Save 15+ hours per week on scheduling',
      'Improve resource utilization',
      'Enhance staff satisfaction'
    ],
    stats: [
      {
        metric: 'Conflict Reduction',
        value: '90%',
        description: 'Reduction in scheduling conflicts'
      },
      {
        metric: 'Time Savings',
        value: '15+ hours',
        description: 'Saved per week on scheduling'
      },
      {
        metric: 'Efficiency',
        value: '85%',
        description: 'Improved resource utilization'
      }
    ]
  },
  {
    id: 3,
    title: 'Payroll Automation System',
    description: 'A comprehensive payroll management platform that automates complex calculations, tax filings, and compliance requirements. Our system ensures accuracy while saving countless hours of manual processing.',
    category: 'Finance',
    icon: DollarSign,
    route: '/payroll',
    preview: 'Comprehensive payroll management with automated processing and compliance.',
    features: [
      'Automated tax calculations and filings',
      'Multi-state compliance management',
      'Direct deposit integration',
      'Employee self-service portal',
      'Custom reporting and analytics',
      'Integration with major accounting software'
    ],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Redis'],
    benefits: [
      'Reduce payroll processing time by 80%',
      'Eliminate calculation errors',
      'Ensure regulatory compliance',
      'Improve employee satisfaction'
    ],
    stats: [
      {
        metric: 'Time Savings',
        value: '80%',
        description: 'Reduction in payroll processing time'
      },
      {
        metric: 'Accuracy',
        value: '99.9%',
        description: 'Error-free calculations'
      },
      {
        metric: 'Compliance',
        value: '100%',
        description: 'Regulatory compliance rate'
      }
    ]
  },
  {
    id: 4,
    title: 'API Integration Hub',
    description: 'A powerful API integration platform that connects your business systems seamlessly. Our hub provides unified access to multiple services while ensuring security and reliability.',
    category: 'Integration',
    icon: Link,
    route: '/api-integration',
    preview: 'Unified API management with security, monitoring, and integration tools.',
    features: [
      'Unified API management dashboard',
      'Real-time monitoring and analytics',
      'Advanced security and authentication',
      'Custom webhook management',
      'Rate limiting and throttling',
      'Multi-protocol support (REST, GraphQL, SOAP)'
    ],
    technologies: ['Next.js', 'TypeScript', 'Docker', 'Kong', 'Redis', 'Elasticsearch'],
    benefits: [
      'Reduce integration time by 70%',
      'Improve system reliability',
      'Enhance security posture',
      'Streamline data flows'
    ],
    stats: [
      {
        metric: 'Integration Speed',
        value: '70%',
        description: 'Faster integration deployment'
      },
      {
        metric: 'Uptime',
        value: '99.9%',
        description: 'System reliability'
      },
      {
        metric: 'Security',
        value: '100%',
        description: 'Threat detection rate'
      }
    ]
  },
  {
    id: 5,
    title: 'Inventory Management System',
    description: 'An advanced inventory management solution that provides real-time tracking, automated reordering, and comprehensive analytics. Perfect for businesses of all sizes looking to optimize their inventory operations.',
    category: 'Operations',
    icon: Package,
    route: '/inventory',
    preview: 'Real-time inventory tracking with QR codes, analytics, and automated management.',
    features: [
      'Real-time inventory tracking',
      'QR code scanning and management',
      'Automated reorder point calculations',
      'Multi-warehouse support',
      'Comprehensive reporting and analytics',
      'Integration with major e-commerce platforms'
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    benefits: [
      'Reduce inventory costs by 20%',
      'Improve stock accuracy to 99%',
      'Eliminate stockouts and overstock',
      'Streamline warehouse operations'
    ],
    stats: [
      {
        metric: 'Cost Reduction',
        value: '20%',
        description: 'Inventory cost savings'
      },
      {
        metric: 'Accuracy',
        value: '99%',
        description: 'Stock level accuracy'
      },
      {
        metric: 'Efficiency',
        value: '40%',
        description: 'Faster inventory processing'
      }
    ]
  },
  {
    id: 6,
    title: 'Customer Portal Platform',
    description: 'A modern customer portal that enhances engagement and streamlines service delivery. Our platform provides a personalized experience while automating routine customer interactions.',
    category: 'Customer Service',
    icon: Target,
    route: '/customer-portal',
    preview: 'Personalized customer dashboard with support tickets and real-time chat.',
    features: [
      'Personalized customer dashboard',
      'Automated ticket management',
      'Knowledge base integration',
      'Real-time chat support',
      'Document management',
      'Customer analytics'
    ],
    technologies: ['React', 'TypeScript', 'Real-time Chat', 'Dashboard Design', 'Customer Experience', 'Support Systems'],
    benefits: [
      'Increase customer satisfaction by 40%',
      'Reduce support ticket volume',
      'Improve response times',
      'Enhance customer self-service'
    ],
    stats: [
      {
        metric: 'Satisfaction',
        value: '40%',
        description: 'Increase in customer satisfaction'
      },
      {
        metric: 'Resolution Speed',
        value: '60%',
        description: 'Faster ticket resolution'
      },
      {
        metric: 'Self-Service',
        value: '3x',
        description: 'Increased knowledge base usage'
      }
    ]
  }
];

const Examples: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleProjectClick = (project: Project) => {
    navigate(project.route);
  };

  const filteredProjects = projects.filter(project => project.id !== 5 && project.id !== 6);
  console.log('Filtered projects count:', filteredProjects.length);
  console.log('Filtered projects:', filteredProjects.map(p => ({ id: p.id, title: p.title })));

  return (
    <>
      <div className="examples-page">
        {/* Header Section */}
        <div className="examples-header">
          <div className="header-content">
            <h1>Project Examples</h1>
            <p>Explore our innovative software solutions that transform businesses across industries</p>
            <div className="header-subtitle">
              <span className="preview-badge">✨ Live Demos</span>
              <span>Click any project to experience the full interactive dashboard</span>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="project-preview-card"
              onClick={() => handleProjectClick(project)}
            >
              <div className="project-card-header">
                <div className="project-icon">
                  <project.icon size={32} />
                </div>
                <div className="project-title">
                  <h3>{project.title}</h3>
                  <span className="project-category">{project.category}</span>
                </div>
                <div className="launch-indicator">
                  <span className="launch-text">Launch →</span>
                </div>
              </div>

              <div className="project-preview-content">
                <p className="project-description">{project.description}</p>
                <div className="project-preview-text">
                  <span className="preview-label">Preview:</span>
                  <p>{project.preview}</p>
                </div>
              </div>

              <div className="project-features">
                <div className="features-list">
                  {project.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-bullet">•</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                  {project.features.length > 3 && (
                    <div className="more-features">
                      +{project.features.length - 3} more features
                    </div>
                  )}
                </div>
              </div>

              <div className="project-stats">
                {project.stats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.metric}</div>
                  </div>
                ))}
              </div>

              <div className="project-technologies">
                {project.technologies.slice(0, 4).map((tech, index) => (
                  <span key={index} className="tech-tag">{tech}</span>
                ))}
                {project.technologies.length > 4 && (
                  <span className="tech-more">+{project.technologies.length - 4}</span>
                )}
              </div>

              <div className="project-hover-overlay">
                <div className="hover-content">
                  <h4>Experience the Full Dashboard</h4>
                  <p>Click to explore the complete interactive interface</p>
                  <div className="hover-button">
                    <span>Launch Demo</span>
                    <span className="hover-arrow">→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="examples-cta-banner">
          <div className="cta-content">
            <h2>Ready to Transform Your Business?</h2>
            <p>Let's discuss how our custom software solutions can drive your success</p>
            <div className="cta-actions">
              {currentUser ? (
                <>
                  <button 
                    className="contact-button primary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </button>
                  <button className="contact-button secondary">Login to Request a Project</button>
                </>
              ) : (
                <>
                  <button 
                    className="contact-button primary"
                    onClick={handleGoogleLogin}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </button>
                  <button className="contact-button secondary">Login to Request a Project</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Examples; 