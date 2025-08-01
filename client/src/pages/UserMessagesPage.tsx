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