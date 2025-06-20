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
  HelpCircle, 
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
  onToggleCollapse 
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['projects']));
  const [notifications, setNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

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

      // Load active projects assigned to user
      const activeQuery = query(
        collection(db, 'admin_projects'),
        where('assignedTo', 'array-contains', currentUser.uid)
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
    }
  };

  const loadNotifications = async () => {
    // Simulate notification count - you can implement actual notification logic
    setNotifications(3);
  };

  const loadUnreadMessages = () => {
    if (!currentUser?.uid) return;

    const unsubscribe = getUnreadMessageCount(currentUser.uid, (count) => {
      setUnreadMessages(count);
    });

    return unsubscribe;
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
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview and quick stats',
      badge: null
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FileText,
      description: 'Manage your projects',
      badge: null,
      isExpandable: true,
      subItems: [
        {
          id: 'requested-projects',
          label: 'Requested Projects',
          icon: Plus,
          description: 'Projects you\'ve requested',
          badge: projectStats.pending > 0 ? projectStats.pending : null,
          badgeColor: 'orange'
        },
        {
          id: 'active-projects',
          label: 'Active Projects',
          icon: Activity,
          description: 'Currently assigned projects',
          badge: projectStats.inProgress > 0 ? projectStats.inProgress : null,
          badgeColor: 'blue'
        },
        {
          id: 'completed-projects',
          label: 'Completed Projects',
          icon: CheckCircle,
          description: 'Finished projects',
          badge: projectStats.completed > 0 ? projectStats.completed : null,
          badgeColor: 'green'
        }
      ]
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      description: 'Direct messages and conversations',
      badge: unreadMessages > 0 ? unreadMessages : null,
      badgeColor: 'red'
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: BarChart3,
      description: 'Performance analytics',
      badge: null,
      isExpandable: true,
      subItems: [
        {
          id: 'project-analytics',
          label: 'Project Analytics',
          icon: TrendingUp,
          description: 'Project performance metrics'
        },
        {
          id: 'time-tracking',
          label: 'Time Tracking',
          icon: Clock,
          description: 'Time spent on projects'
        },
        {
          id: 'achievements',
          label: 'Achievements',
          icon: Award,
          description: 'Your accomplishments'
        }
      ]
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      description: 'Deadlines and meetings',
      badge: projectStats.overdue > 0 ? projectStats.overdue : null,
      badgeColor: 'red'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      description: 'Communications',
      badge: notifications > 0 ? notifications : null,
      badgeColor: 'purple'
    },
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
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      description: 'Get assistance',
      badge: null,
      isExpandable: true,
      subItems: [
        {
          id: 'documentation',
          label: 'Documentation',
          icon: FileText,
          description: 'User guides and tutorials'
        },
        {
          id: 'support-tickets',
          label: 'Support Tickets',
          icon: MessageSquare,
          description: 'Get help from our team'
        },
        {
          id: 'feature-requests',
          label: 'Feature Requests',
          icon: Star,
          description: 'Suggest new features'
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
          className={`sidebar-link ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
          onClick={() => {
            if (item.isExpandable && !isCollapsed) {
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
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sub-items */}
        {item.subItems && isExpanded && !isCollapsed && (
          <div className="sidebar-sub-items">
            {item.subItems.map((subItem: any) => renderMenuItem(subItem, true))}
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