import React, { useState, useMemo } from 'react';
import LogisticsDashboard from '../components/LogisticsDashboard';
import '../styles/Examples.css';
import ProjectCard from '../components/ProjectCard';

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
    icon: '📦',
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
    icon: '📅',
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
      image: '/mockups/scheduling-interface.png',
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
    icon: '💰',
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
      image: '/mockups/payroll-dashboard.png',
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
    icon: '🔌',
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
      image: '/mockups/api-hub.png',
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
    description: 'An intelligent inventory management solution that optimizes stock levels, automates reordering, and provides real-time visibility across your supply chain.',
    category: 'Operations',
    icon: '📊',
    features: [
      'Real-time inventory tracking',
      'Automated reorder management',
      'Multi-location support',
      'Barcode scanning integration',
      'Supplier management',
      'Advanced forecasting'
    ],
    technologies: ['Vue.js', 'Python', 'PostgreSQL', 'Redis', 'AWS', 'Docker'],
    benefits: [
      'Reduce stockouts by 60%',
      'Optimize inventory levels',
      'Improve order fulfillment',
      'Reduce carrying costs'
    ],
    stats: [
      {
        metric: 'Stockout Reduction',
        value: '60%',
        description: 'Reduction in stockouts'
      },
      {
        metric: 'Inventory Optimization',
        value: 'Optimize',
        description: 'Optimized inventory levels'
      },
      {
        metric: 'Order Fulfillment',
        value: 'Improve',
        description: 'Improved order fulfillment'
      }
    ],
    uiMockup: {
      image: '/mockups/inventory-dashboard.png',
      description: 'Inventory management interface with real-time tracking',
      highlights: [
        'Inventory overview dashboard',
        'Stock level monitoring',
        'Order management interface',
        'Analytics and reporting'
      ]
    }
  },
  {
    id: 6,
    title: 'Customer Portal Platform',
    description: 'A modern customer portal that enhances engagement and streamlines service delivery. Our platform provides a personalized experience while automating routine customer interactions.',
    category: 'Customer Service',
    icon: '👥',
    features: [
      'Personalized customer dashboard',
      'Automated ticket management',
      'Knowledge base integration',
      'Real-time chat support',
      'Document management',
      'Customer analytics'
    ],
    technologies: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'AWS', 'Redis'],
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
        metric: 'Support Ticket Reduction',
        value: 'Reduce',
        description: 'Reduction in support ticket volume'
      },
      {
        metric: 'Response Time',
        value: 'Improve',
        description: 'Improved response times'
      }
    ],
    uiMockup: {
      image: '/mockups/customer-portal.png',
      description: 'Customer portal interface with support and self-service features',
      highlights: [
        'Customer dashboard view',
        'Support ticket interface',
        'Knowledge base access',
        'Service analytics'
      ]
    }
  }
];

const Examples: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedView, setSelectedView] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === filteredProjects.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? filteredProjects.length - 1 : prevIndex - 1
    );
  };

  return (
    <>
      <div className="examples-page">
        {/* Header Section */}
      

        {filteredProjects.length === 0 ? (
          <div className="no-results">
            <h2>No solutions found</h2>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="examples-grid">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isActive={index === currentIndex}
                  selectedView={selectedView}
                  setSelectedView={setSelectedView}
                />
              ))}
            </div>
          </>
        )}

        {/* Footer CTA */}
        <div className="examples-footer">
          <div className="footer-content">
            <h2>Ready to Transform Your Business?</h2>
            <p>Let's discuss how our custom software solutions can drive your success</p>
            <div className="footer-actions">
              <button className="contact-button primary">Start Your Project</button>
              <button className="contact-button secondary">Schedule a Consultation</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Examples; 