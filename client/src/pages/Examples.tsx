import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LogisticsDashboard from '../components/LogisticsDashboard';
import SchedulingDashboard from '../components/SchedulingDashboard';
import PayrollDashboard from '../components/PayrollDashboard';
import APIIntegrationHub from '../components/APIIntegrationHub';
import InventoryManagementSystem from '../components/InventoryManagementSystem';
import CustomerPortalPlatform from '../components/CustomerPortalPlatform';
import ProjectCard from '../components/ProjectCard';
import ProjectSelector from '../components/ProjectSelector';
import Footer from '../components/Footer';
import '../styles/Examples.css';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: string;
  features: string[];
  technologies: string[];
  benefits: string[];
  stats: {
    metric: string;
    value: string;
    description: string;
  }[];
  uiMockup: {
    component?: React.FC;
    image?: string;
    description: string;
    highlights: string[];
    mobileImage?: string;
  };
  caseStudy?: {
    title: string;
    description: string;
    results: string[];
    link: string;
  };
}

type Category = 'All' | 'Operations' | 'Management' | 'Finance' | 'Integration' | 'Customer Service';

const categories: Category[] = ['All', 'Operations', 'Management', 'Finance', 'Integration', 'Customer Service'];

const projects: Project[] = [
  {
    id: 1,
    title: 'Business Logistics Platform',
    description: 'A comprehensive logistics management system that revolutionizes how businesses handle their supply chain. Our platform combines real-time tracking, automated processing, and intelligent routing to optimize your entire logistics operation.',
    category: 'Operations',
    icon: '🚚',
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
    ],
    uiMockup: {
      component: LogisticsDashboard,
      description: 'Interactive logistics dashboard with real-time tracking and analytics',
      highlights: [
        'Live shipment tracking map',
        'Performance metrics dashboard',
        'Route optimization interface',
        'Inventory management system'
      ]
    }
  },
  {
    id: 2,
    title: 'Enterprise Scheduling System',
    description: 'An intelligent scheduling platform that adapts to your business needs. Our system uses AI to optimize resource allocation, manage appointments, and ensure efficient staff scheduling across multiple locations.',
    category: 'Management',
    icon: '⚡',
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
        value: '15+ hours per week',
        description: 'Saved on scheduling'
      },
      {
        metric: 'Resource Utilization',
        value: 'Improve',
        description: 'Enhanced resource utilization'
      }
    ],
    uiMockup: {
      component: SchedulingDashboard,
      description: 'Smart scheduling interface with AI-powered optimization',
      highlights: [
        'Interactive calendar view',
        'Resource allocation dashboard',
        'Staff scheduling interface',
        'Analytics and reporting'
      ]
    }
  },
  {
    id: 3,
    title: 'Payroll Automation System',
    description: 'A comprehensive payroll management platform that automates complex calculations, tax filings, and compliance requirements. Our system ensures accuracy while saving countless hours of manual processing.',
    category: 'Finance',
    icon: '💎',
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
        metric: 'Error Reduction',
        value: 'Eliminate',
        description: 'Elimination of calculation errors'
      },
      {
        metric: 'Regulatory Compliance',
        value: 'Ensure',
        description: 'Ensured regulatory compliance'
      }
    ],
    uiMockup: {
      component: PayrollDashboard,
      description: 'Comprehensive payroll management interface with automated processing',
      highlights: [
        'Payroll processing dashboard',
        'Tax management interface',
        'Employee portal preview',
        'Reporting and analytics'
      ]
    }
  },
  {
    id: 4,
    title: 'API Integration Hub',
    description: 'A powerful API integration platform that connects your business systems seamlessly. Our hub provides unified access to multiple services while ensuring security and reliability.',
    category: 'Integration',
    icon: '🔗',
    features: [
      'Unified API gateway',
      'Real-time data synchronization',
      'Custom connector development',
      'Advanced security protocols',
      'Performance monitoring',
      'Automated error handling'
    ],
    technologies: ['TypeScript', 'Node.js', 'MongoDB', 'Redis', 'AWS', 'Kubernetes'],
    benefits: [
      'Reduce integration time by 70%',
      'Improve system reliability',
      'Enhance data consistency',
      'Simplify maintenance'
    ],
    stats: [
      {
        metric: 'Time Savings',
        value: '70%',
        description: 'Reduction in integration time'
      },
      {
        metric: 'Reliability',
        value: 'Improve',
        description: 'Improved system reliability'
      },
      {
        metric: 'Data Consistency',
        value: 'Enhance',
        description: 'Enhanced data consistency'
      }
    ],
    uiMockup: {
      component: APIIntegrationHub,
      description: 'API integration dashboard with service connections and monitoring',
      highlights: [
        'Service connection dashboard',
        'API monitoring interface',
        'Integration workflow builder',
        'Performance analytics'
      ]
    }
  },
  {
    id: 5,
    title: 'Inventory Management System',
    description: 'An intelligent inventory management solution that optimizes stock levels, generates QR codes for warehouses, and provides real-time visibility across your supply chain.',
    category: 'Operations',
    icon: '📦',
    features: [
      'Real-time inventory tracking',
      'QR code generation for warehouses and items',
      'Multi-warehouse support',
      'Automated stock level monitoring',
      'Supplier management',
      'Advanced analytics and reporting'
    ],
    technologies: ['React', 'TypeScript', 'QR Code', 'CSS Grid', 'Responsive Design', 'Modern UI'],
    benefits: [
      'Generate QR codes for efficient warehouse operations',
      'Track inventory across multiple locations',
      'Reduce stockouts by 60%',
      'Optimize warehouse efficiency'
    ],
    stats: [
      {
        metric: 'QR Code Generation',
        value: 'Instant',
        description: 'Generate QR codes for warehouses and items'
      },
      {
        metric: 'Stockout Reduction',
        value: '60%',
        description: 'Reduction in stockouts'
      },
      {
        metric: 'Warehouse Efficiency',
        value: '3x',
        description: 'Improved warehouse operations'
      }
    ],
    uiMockup: {
      component: InventoryManagementSystem,
      description: 'Interactive inventory management dashboard with QR code generation',
      highlights: [
        'Generate QR codes for warehouses',
        'Real-time inventory tracking',
        'Multi-warehouse support',
        'Advanced filtering and search'
      ]
    }
  },
  {
    id: 6,
    title: 'Customer Portal Platform',
    description: 'A modern customer portal that enhances engagement and streamlines service delivery. Our platform provides a personalized experience while automating routine customer interactions.',
    category: 'Customer Service',
    icon: '🎯',
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
        metric: 'Customer Satisfaction',
        value: '40%',
        description: 'Increase in customer satisfaction'
      },
      {
        metric: 'Support Efficiency',
        value: '60%',
        description: 'Faster ticket resolution'
      },
      {
        metric: 'Self-Service Usage',
        value: '3x',
        description: 'Increased knowledge base usage'
      }
    ],
    uiMockup: {
      component: CustomerPortalPlatform,
      description: 'Interactive customer portal with support tickets, knowledge base, and live chat',
      highlights: [
        'Personalized customer dashboard',
        'Support ticket management',
        'Real-time chat support',
        'Knowledge base integration'
      ]
    }
  }
];

const Examples: React.FC = () => {
  const { currentUser, signInWithGoogle } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);
  const [selectedView, setSelectedView] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSelectedView('desktop'); // Reset to desktop view when switching projects
  };

  // Update selected project when filters change
  React.useEffect(() => {
    if (filteredProjects.length > 0 && !filteredProjects.find(p => p.id === selectedProject.id)) {
      setSelectedProject(filteredProjects[0]);
    }
  }, [filteredProjects, selectedProject.id]);

  return (
    <>
      <div className="examples-page">
        {/* Header Section */}
        <div className="examples-header">
          <div className="header-content">
            <h1>Project Examples</h1>
            <p>Explore our innovative software solutions that transform businesses across industries</p>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="search-filter-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search projects, features, or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="category-filter">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Project Selector Panel */}
        <ProjectSelector
          projects={filteredProjects}
          selectedProjectId={selectedProject.id}
          onProjectSelect={handleProjectSelect}
        />

        {/* Selected Project Display */}
        {filteredProjects.length === 0 ? (
          <div className="no-results">
            <h2>No solutions found</h2>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="selected-project-container">
            <ProjectCard
              key={selectedProject.id}
              project={selectedProject}
              isActive={true}
              selectedView={selectedView}
              setSelectedView={setSelectedView}
            />
          </div>
        )}

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
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    Go to Dashboard
                  </button>
                  <button className="contact-button secondary">Schedule a Consultation</button>
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
                  <button className="contact-button secondary">Schedule a Consultation</button>
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