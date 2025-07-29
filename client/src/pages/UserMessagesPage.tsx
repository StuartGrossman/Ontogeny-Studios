import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUser, FaCog, FaUserTie } from 'react-icons/fa';
import { Activity, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import ontogenyIcon from '../assets/otogeny-icon.png';
import { collection, query, where, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import UserChatSystem from '../components/UserChatSystem';
import '../styles/ChatSystem.css';
import '../styles/UserMessagesPage.css';

interface Notification {
  id: string;
  read: boolean;
  [key: string]: any;
}

const UserMessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customerProjects, setCustomerProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Load customer projects
  const loadCustomerProjects = async () => {
    if (!currentUser?.uid) return;

    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCustomerProjects(projects);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading customer projects:', error);
    }
  };

  // Check if user is admin (proper Firestore check)
  const checkAdminStatus = async () => {
    if (!currentUser?.uid) {
      setIsAdmin(false);
      return;
    }
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsAdmin(userData.isAdmin === true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      checkAdminStatus();
      loadCustomerProjects();
    }
  }, [currentUser]);

  // Fetch notifications
  useEffect(() => {
    if (!currentUser) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        read: false, // Default value
        ...doc.data()
      })) as Notification[];
      setNotifications(notificationsList);
      setUnreadCount(notificationsList.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Check authentication
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleProjectSelect = (project: any) => {
    setSelectedProject(project);
    console.log('Project selected:', project);
  };

  return (
    <div className="user-messages-page">
      {/* Messages Header */}
      <div className="messages-header">
        <div className="messages-header-content">
          <div className="messages-header-left">
            <button className="back-button" onClick={handleDashboardClick}>
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
            <div className="messages-title">
              <Activity size={24} />
              <h1>Messages</h1>
            </div>
          </div>
          
          <div className="messages-header-center">
            <div className="project-selector">
              {customerProjects.length > 0 ? (
                customerProjects.map((project) => (
                  <button 
                    key={project.id}
                    className={`project-selector-item ${selectedProject?.id === project.id ? 'active' : ''}`}
                    onClick={() => handleProjectSelect(project)}
                  >
                    {project.status === 'completed' ? (
                      <CheckCircle size={16} />
                    ) : (
                      <FileText size={16} />
                    )}
                    <span>{project.name || project.projectName || 'Unnamed Project'}</span>
                  </button>
                ))
              ) : (
                <div className="project-selector-empty">
                  <Activity size={16} />
                  <span>No projects available</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="messages-header-right">
            {isAdmin && (
              <button className="admin-button" onClick={() => navigate('/management')}>
                <FaUserTie size={16} />
                <span>Management</span>
              </button>
            )}
            <button className="notifications-button" title="Notifications">
              <FaBell size={16} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Messages Content */}
      <div className="messages-main-content">
        <UserChatSystem />
      </div>
    </div>
  );
};

export default UserMessagesPage; 