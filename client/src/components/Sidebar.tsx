import React, { useState, useEffect } from 'react';
import { 
  Home, 
  FileText, 
  Activity, 
  Settings, 
  User, 
  BarChart3, 
  CreditCard, 
  Shield, 
  Bell, 
  MessageSquare, 
  Calendar, 
  Download, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Plus,
  Eye,
  Target,
  TrendingUp,
  Zap,
  Award,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { getUnreadMessageCount } from '../services/messagingService';
import '../styles/Sidebar.css';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onProjectSelect?: (project: any) => void;
  projects?: any[];
}

interface ProjectStats {
  totalRequested: number;
  pending: number;
  accepted: number;
  completed: number;
  totalActive: number;
  inProgress: number;
  overdue: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  isCollapsed = false,
  onToggleCollapse,
  onProjectSelect,
  projects = []
}) => {
  const { currentUser } = useAuth();
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    totalRequested: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    totalActive: 0,
    inProgress: 0,
    overdue: 0
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['active-projects']));
  const [notifications, setNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);


  // Ensure parent sections are expanded when child sections are active
  useEffect(() => {
    const newExpanded = new Set(expandedSections);
    
    // If active-projects, requested-projects, or completed-projects is active, expand projects
    if (['active-projects', 'requested-projects', 'completed-projects'].includes(activeSection)) {
      newExpanded.add('projects');
    }
    
    // If any settings sub-item is active, expand settings
    if (['profile', 'payment', 'security', 'notifications'].includes(activeSection)) {
      newExpanded.add('settings');
    }
    

    
    setExpandedSections(newExpanded);
  }, [activeSection]);

  // Auto-expand active projects when sidebar is opened and there are active projects
  useEffect(() => {
    const activeProjects = projects.filter((p: any) => p.status === 'in-progress' || p.status === 'planning');
    const completedProjects = projects.filter((p: any) => p.status === 'completed');
    
    console.log('🔄 Sidebar projects update:', {
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      isCollapsed,
      activeProjectsList: activeProjects.map(p => ({ id: p.id, name: p.name || p.projectName, status: p.status }))
    });
    
    if (!isCollapsed) {
      const newExpanded = new Set(expandedSections);
      
      // Always auto-expand active projects section when sidebar is opened
      newExpanded.add('active-projects');
      console.log('✅ Auto-expanding active projects section');
      
      // Auto-expand completed projects if there are any
      if (completedProjects.length > 0) {
        newExpanded.add('completed-projects');
        console.log('✅ Auto-expanding completed projects section');
      }
      
      setExpandedSections(newExpanded);
    }
  }, [isCollapsed, projects]);

  useEffect(() => {
    if (currentUser) {
      loadProjectStats();
      loadNotifications();
      loadUnreadMessages();
    }
  }, [currentUser]);

  const loadProjectStats = async () => {
    if (!currentUser) return;

    try {
      // Load user-requested projects
      const requestedQuery = query(
        collection(db, 'user_project_requests'),
        where('requestedBy', '==', currentUser.uid)
      );
      const requestedSnapshot = await getDocs(requestedQuery);
      const requestedProjects = requestedSnapshot.docs.map(doc => doc.data());

      // Load regular projects assigned to user (use 'projects' collection instead of 'admin_projects')
      const activeQuery = query(
        collection(db, 'projects'),
        where('userId', '==', currentUser.uid)
      );
      const activeSnapshot = await getDocs(activeQuery);
      const activeProjects = activeSnapshot.docs.map(doc => doc.data());

      // Calculate stats
      const pending = requestedProjects.filter(p => p.status === 'pending').length;
      const accepted = requestedProjects.filter(p => p.status === 'accepted').length;
      const requestedCompleted = requestedProjects.filter(p => p.status === 'completed').length;
      
      const inProgress = activeProjects.filter(p => p.status === 'in-progress').length;
      const activeCompleted = activeProjects.filter(p => p.status === 'completed').length;
      
      // Calculate overdue projects (deadline passed and not completed)
      const now = new Date();
      const overdue = activeProjects.filter(p => {
        if (p.status === 'completed') return false;
        const deadline = p.deadline ? new Date(p.deadline) : null;
        return deadline && deadline < now;
      }).length;

      setProjectStats({
        totalRequested: requestedProjects.length,
        pending,
        accepted,
        completed: requestedCompleted,
        totalActive: activeProjects.length,
        inProgress,
        overdue
      });
    } catch (error) {
      console.error('Error loading project stats:', error);
      // Set default stats if there's an error
      setProjectStats({
        totalRequested: 0,
        pending: 0,
        accepted: 0,
        completed: 0,
        totalActive: 0,
        inProgress: 0,
        overdue: 0
      });
    }
  };

  const loadNotifications = async () => {
    // Simulate notification count - you can implement actual notification logic
    setNotifications(3);
  };

  const loadUnreadMessages = () => {
    if (!currentUser?.uid) return;

    try {
      const unsubscribe = getUnreadMessageCount(currentUser.uid, (count) => {
        setUnreadMessages(count);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading unread messages:', error);
      // Set default value if there's an error
      setUnreadMessages(0);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };



  const menuItems = [
    // Enhanced project section with better organization
    {
      id: 'active-projects',
      label: 'Active Projects',
      icon: Activity,
      description: 'Projects in development',
      badge: projects.filter((p: any) => p.status === 'in-progress' || p.status === 'planning').length,
      badgeColor: 'green',
      isExpandable: true,
      subItems: projects
        .filter((project: any) => project.status === 'in-progress' || project.status === 'planning')
        .map((project: any) => {
          console.log('📋 Creating active project item:', {
            id: project.id,
            name: project.name || project.projectName,
            status: project.status,
            progress: project.progress
          });
          return {
            id: `project-${project.id}`,
            label: project.name || project.projectName || 'Unnamed Project',
            icon: Activity,
            description: `${project.status === 'in-progress' ? 'In Development' : 'Planning'} • ${project.progress || 0}% complete`,
            isProject: true,
            project: project,
            progress: project.progress || 0,
            status: project.status
          };
        })
    },
    // Only show completed projects section if there are completed projects
    ...(projects.filter((p: any) => p.status === 'completed').length > 0 ? [{
      id: 'completed-projects',
      label: 'Completed Projects',
      icon: CheckCircle,
      description: 'Finished projects',
      badge: projects.filter((p: any) => p.status === 'completed').length,
      badgeColor: 'blue',
      isExpandable: true,
      subItems: projects
        .filter((project: any) => project.status === 'completed')
        .map((project: any) => ({
          id: `project-${project.id}`,
          label: project.name || project.projectName || 'Unnamed Project',
          icon: CheckCircle,
          description: `Completed • ${project.progress || 100}%`,
          isProject: true,
          project: project,
          progress: project.progress || 100,
          status: project.status
        }))
    }] : []),
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      badge: unreadMessages > 0 ? unreadMessages : null,
      badgeColor: 'red'
    },
    // Statistics and Calendar sections hidden for now
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Account preferences',
      badge: null,
      isExpandable: true,
      subItems: [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          description: 'Personal information'
        },
        {
          id: 'payment',
          label: 'Payment & Billing',
          icon: CreditCard,
          description: 'Payment methods and invoices'
        },
        {
          id: 'security',
          label: 'Security',
          icon: Shield,
          description: 'Two-factor auth and passwords'
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          description: 'Email and push preferences'
        }
      ]
    }
  ];

  const renderMenuItem = (item: any, isSubItem = false) => {
    const isActive = activeSection === item.id;
    const isExpanded = expandedSections.has(item.id);
    const Icon = item.icon;

    return (
      <div key={item.id} className={`sidebar-item ${isSubItem ? 'sub-item' : ''}`}>
        <div
          className={`sidebar-link ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''} ${item.isAction ? 'action-item' : ''} ${item.isProject ? 'project-item' : ''}`}
          onClick={() => {
            if (item.isAction) {
              // Handle action items (like opening modals)
              if (item.id === 'request-new-project') {
                // This will be handled by the parent component
                onSectionChange('open-project-modal');
              }
            } else if (item.isProject && onProjectSelect) {
              // Handle project selection
              onProjectSelect(item.project);
            } else if (item.isExpandable && !isCollapsed) {
              toggleSection(item.id);
            } else {
              onSectionChange(item.id);
            }
          }}
        >
          <div className="sidebar-link-content">
            <div className="sidebar-icon">
              <Icon size={isSubItem ? 16 : 20} />
            </div>
            {!isCollapsed && (
              <>
                <div className="sidebar-text">
                  <span className="sidebar-label">{item.label}</span>
                  {item.description && (
                    <span className="sidebar-description">{item.description}</span>
                  )}
                  {/* Project Progress Bar */}
                  {item.isProject && item.progress !== undefined && (
                    <div className="project-progress-mini">
                      <div className="progress-bar-mini">
                        <div 
                          className="progress-fill-mini"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text-mini">{item.progress}%</span>
                    </div>
                  )}
                </div>
                <div className="sidebar-indicators">
                  {item.badge && (
                    <span className={`sidebar-badge ${item.badgeColor || 'default'}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.isExpandable && (
                    <div className="expand-indicator">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  )}
                  {/* Project Status Indicator */}
                  {item.isProject && item.status && (
                    <div className={`project-status-indicator ${item.status}`}>
                      <span className="status-dot-mini"></span>
                    </div>
                  )}
                  {/* Payment Button for Projects with Subscriptions */}
                  {item.isProject && item.project?.subscriptionAmount && item.project?.subscriptionAmount > 0 && (
                    <button
                      className="project-payment-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to payments section
                        onSectionChange('payments');
                      }}
                      title={`Pay $${item.project.subscriptionAmount}/month`}
                    >
                      <CreditCard size={14} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sub-items */}
        {item.subItems && isExpanded && !isCollapsed && (
          <div className="sidebar-sub-items">
            {item.subItems.length > 0 ? (
              item.subItems.map((subItem: any) => renderMenuItem(subItem, true))
            ) : (
              <div className="sidebar-empty-state">
                <span className="sidebar-empty-text">No {item.label.toLowerCase()} yet</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-user">
            <div className="user-avatar-sidebar">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {currentUser?.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="user-info-sidebar">
              <div className="user-name">{currentUser?.displayName || 'User'}</div>
              <div className="user-status">Online</div>
            </div>
          </div>
        )}
        
        {/* Quick Stats */}
        {!isCollapsed && (
          <div className="sidebar-quick-stats">
            <div className="quick-stat">
              <Target size={14} />
              <span>{projectStats.totalActive} Active</span>
            </div>
            <div className="quick-stat">
              <Zap size={14} />
              <span>{projectStats.pending} Pending</span>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="sidebar-footer-content">
            <div className="sidebar-version">
              <span>Ontogeny v2.0</span>
            </div>
            <div className="sidebar-actions">
              <button className="sidebar-action-btn" title="Download App">
                <Download size={16} />
              </button>
              <button className="sidebar-action-btn" title="Rate Us">
                <Star size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      {onToggleCollapse && (
        <button 
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <ChevronRight className={`toggle-icon ${isCollapsed ? '' : 'rotated'}`} size={16} />
        </button>
      )}


    </div>
  );
};

export default Sidebar; 