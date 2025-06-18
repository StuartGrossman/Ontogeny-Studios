import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';
import Footer from '../components/Footer';
import { BarChart3, Users, DollarSign, Rocket, CheckCircle, ChevronDown, Settings, RefreshCw, Plus, User, FolderPlus, Calendar, FileText, Activity, TrendingUp, Clock, AlertCircle, Zap, Target, ArrowUp, ArrowDown, Eye, Edit3, MessageSquare } from 'lucide-react';
import ontogenyIcon from '../assets/otogeny-icon.png';
import CreateProjectModal, { ProjectFormData } from '../components/modals/CreateProjectModal';
import '../styles/Dashboard.css';
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy, addDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  
  // AI Chat Modal state
  const [aiChatOpen, setAiChatOpen] = useState(false);

  // Admin toggle state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Admin dashboard state
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Project creation modal state
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);

  // Customer projects state
  const [customerProjects, setCustomerProjects] = useState<any[]>([]);
  const [customerProjectsLoading, setCustomerProjectsLoading] = useState(false);

  // Requested projects state
  const [requestedProjects, setRequestedProjects] = useState<any[]>([]);
  const [requestedProjectsLoading, setRequestedProjectsLoading] = useState(false);

  // Feature request modal state
  const [featureRequestOpen, setFeatureRequestOpen] = useState(false);
  const [selectedProjectForFeature, setSelectedProjectForFeature] = useState<any>(null);

  // Check admin status
  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().isAdmin || false);
        } else {
          // Create user document if it doesn't exist
          await setDoc(doc(db, 'users', currentUser.uid), {
            isAdmin: false,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            createdAt: new Date(),
            updatedAt: new Date()
          }, { merge: true });
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  // Load all users when admin mode is active, or load customer projects when user mode
  useEffect(() => {
    if (isAdmin) {
      loadAllUsers();
    } else if (currentUser) {
      loadCustomerProjects();
      loadRequestedProjects();
    }
  }, [isAdmin, currentUser]);

  const loadCustomerProjects = async () => {
    if (!currentUser) return;
    
    setCustomerProjectsLoading(true);
    try {
      // Load projects assigned to the current user
      const projectsQuery = query(
        collection(db, 'admin_projects'),
        where('assignedTo', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(projectsQuery);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Loaded ${projects.length} customer projects:`, projects);
      setCustomerProjects(projects);
    } catch (error) {
      console.error('Error loading customer projects:', error);
      // Fallback: load all projects and filter client-side
      try {
        const allProjectsQuery = query(collection(db, 'admin_projects'));
        const snapshot = await getDocs(allProjectsQuery);
        const allProjects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        const userProjects = allProjects.filter((project: any) => project.assignedTo === currentUser.uid);
        console.log(`Fallback: Loaded ${userProjects.length} customer projects:`, userProjects);
        setCustomerProjects(userProjects);
      } catch (fallbackError) {
        console.error('Fallback customer projects query failed:', fallbackError);
        setCustomerProjects([]);
      }
    } finally {
      setCustomerProjectsLoading(false);
    }
  };

  const loadRequestedProjects = async () => {
    if (!currentUser) return;
    
    setRequestedProjectsLoading(true);
    try {
      // Load projects requested by the current user
      const requestsQuery = query(
        collection(db, 'user_project_requests'),
        where('requestedBy', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(requestsQuery);
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Loaded ${requests.length} requested projects:`, requests);
      setRequestedProjects(requests);
    } catch (error) {
      console.error('Error loading requested projects:', error);
      setRequestedProjects([]);
    } finally {
      setRequestedProjectsLoading(false);
    }
  };

  const loadAllUsers = async () => {
    setUsersLoading(true);
    try {
      // Try with orderBy first
      let usersQuery = query(collection(db, 'users'), orderBy('displayName'));
      let snapshot = await getDocs(usersQuery);
      let users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // If no users found or orderBy fails, try without orderBy
      if (users.length === 0) {
        console.log('No users found with orderBy, trying without orderBy...');
        usersQuery = query(collection(db, 'users'));
        snapshot = await getDocs(usersQuery);
        users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort manually on client side
        users.sort((a: any, b: any) => (a.displayName || '').localeCompare(b.displayName || ''));
      }
      
      console.log(`Loaded ${users.length} users:`, users);
      
      // Ensure current user is in the list
      if (currentUser && !users.find(u => u.id === currentUser.uid)) {
        const currentUserData = {
          id: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          isAdmin: isAdmin
        };
        users.unshift(currentUserData); // Add current user to the beginning
        console.log('Added current user to users list');
      }
      
      setAllUsers(users);
      
      // Auto-select first user if none selected
      if (users.length > 0 && !selectedUser) {
        await handleUserSelect(users[0]);
      }
    } catch (error) {
      console.error('Error loading users with orderBy, trying fallback:', error);
      // Fallback: load without orderBy
      try {
        const fallbackQuery = query(collection(db, 'users'));
        const snapshot = await getDocs(fallbackQuery);
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort manually on client side
        users.sort((a: any, b: any) => (a.displayName || '').localeCompare(b.displayName || ''));
        
        console.log(`Fallback: Loaded ${users.length} users:`, users);
        
        // Ensure current user is in the list
        if (currentUser && !users.find(u => u.id === currentUser.uid)) {
          const currentUserData = {
            id: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            isAdmin: isAdmin
          };
          users.unshift(currentUserData); // Add current user to the beginning
          console.log('Fallback: Added current user to users list');
        }
        
        setAllUsers(users);
        
        // Auto-select first user if none selected
        if (users.length > 0 && !selectedUser) {
          await handleUserSelect(users[0]);
        }
      } catch (fallbackError) {
        console.error('Fallback user loading also failed:', fallbackError);
        setAllUsers([]);
      }
    } finally {
      setUsersLoading(false);
    }
  };

    const handleUserSelect = async (user: any) => {
    setSelectedUser(user);
    
    // Load both admin-created projects and user-requested projects
    try {
      // Load admin-created projects assigned to user
      const adminProjectsQuery = query(
        collection(db, 'admin_projects'),
        where('assignedTo', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      const adminSnapshot = await getDocs(adminProjectsQuery);
      const adminProjects = adminSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'admin-created',
        ...doc.data()
      }));

      // Load user-requested projects
      const requestedProjectsQuery = query(
        collection(db, 'user_project_requests'),
        where('requestedBy', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      const requestedSnapshot = await getDocs(requestedProjectsQuery);
      const requestedProjects = requestedSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'user-requested',
        name: doc.data().projectName, // Map projectName to name for consistency
        status: doc.data().status,
        progress: 0, // Default progress for requested projects
        ...doc.data()
      }));

      // Combine and sort by creation date
      const allProjects = [...adminProjects, ...requestedProjects].sort((a: any, b: any) => {
        const aDate = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
        const bDate = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
        return bDate.getTime() - aDate.getTime();
      });
      
      console.log(`Loaded ${allProjects.length} total projects for ${user.displayName}:`, allProjects);
      setUserProjects(allProjects);
    } catch (error) {
      console.error('Error loading projects for user:', error);
      setUserProjects([]);
    }
  };

  const createProjectForUser = () => {
    if (!selectedUser) return;
    setCreateProjectModalOpen(true);
  };

  const handleCreateProject = async (projectData: ProjectFormData) => {
    if (!selectedUser || !currentUser) return;

    try {
      // Create project document in Firebase
      const projectDoc = {
        name: projectData.name,
        link: projectData.link || '',
        description: projectData.description || '',
        features: projectData.features || '',
        status: 'planning',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: currentUser.uid,
        assignedTo: selectedUser.id,
        assignedUserName: selectedUser.displayName,
        assignedUserEmail: selectedUser.email,
        tasks: [],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      // Add to admin_projects collection to separate admin-created from user-requested
      const docRef = await addDoc(collection(db, 'admin_projects'), projectDoc);
      
      console.log('Project created successfully:', docRef.id);
      
      // Reload projects for the selected user to ensure fresh data
      await handleUserSelect(selectedUser);
      
    } catch (error) {
      console.error('Error creating project:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownOpen && !target.closest('.user-dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const toggleAdminStatus = async () => {
    if (!currentUser || adminLoading) return;
    
    setAdminLoading(true);
    try {
      const newAdminStatus = !isAdmin;
      await setDoc(doc(db, 'users', currentUser.uid), {
        isAdmin: newAdminStatus,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        updatedAt: new Date()
      }, { merge: true });
      
      setIsAdmin(newAdminStatus);
      setDropdownOpen(false); // Close dropdown after toggle
      
      // If user became admin, reload the users list
      if (newAdminStatus) {
        await loadAllUsers();
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const metrics = [
    {
      title: 'Total Projects',
      value: '12',
      change: '+3',
      changeType: 'positive',
      icon: BarChart3,
      details: 'You have 12 active projects across your organization. 3 new projects were added this month.'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      details: '1,234 users have logged in this month. User engagement is up 12% compared to last month.'
    },
    {
      title: 'Revenue',
      value: '$45,678',
      change: '+8.5%',
      changeType: 'positive',
      icon: DollarSign,
      details: 'Total revenue for this quarter is $45,678, an increase of 8.5% over the previous quarter.'
    },
    {
      title: 'Completion Rate',
      value: '94%',
      change: '+2.1%',
      changeType: 'positive',
      icon: CheckCircle,
      details: '94% of all projects are completed on time. This is a 2.1% improvement.'
    }
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'E-commerce Platform',
      status: 'In Progress',
      progress: 75,
      team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      deadline: '2024-04-15',
      details: 'A scalable e-commerce platform for B2B and B2C sales, with real-time inventory and analytics.'
    },
    {
      id: 2,
      name: 'Mobile App',
      status: 'Completed',
      progress: 100,
      team: ['Sarah Wilson', 'Tom Brown'],
      deadline: '2024-03-20',
      details: 'A cross-platform mobile app for customer engagement and loyalty rewards.'
    },
    {
      id: 3,
      name: 'Analytics Dashboard',
      status: 'Planning',
      progress: 25,
      team: ['Alex Chen', 'Emily Davis'],
      deadline: '2024-05-10',
      details: 'A business intelligence dashboard for real-time reporting and data visualization.'
    }
  ];

  const activities = [
    { id: 1, action: 'Project "E-commerce Platform" updated', time: '2 hours ago', user: 'John Doe' },
    { id: 2, action: 'New team member added to "Mobile App"', time: '4 hours ago', user: 'Sarah Wilson' },
    { id: 3, action: 'Milestone completed for "Analytics Dashboard"', time: '1 day ago', user: 'Alex Chen' },
    { id: 4, action: 'Client feedback received for "E-commerce Platform"', time: '2 days ago', user: 'Jane Smith' }
  ];

  // Modal open helpers
  const openMetricModal = (metric: typeof metrics[0]) => {
    const IconComponent = metric.icon;
    setModalContent(
      <div className="modal-details">
        <div className="modal-icon"><IconComponent size={24} /></div>
        <h2>{metric.title}</h2>
        <div className="modal-value">{metric.value}</div>
        <p>{metric.details}</p>
      </div>
    );
    setModalOpen(true);
  };

  const openProjectModal = (project: typeof recentProjects[0]) => {
    setModalContent(
      <div className="modal-details">
        <h2>{project.name}</h2>
        <div className="modal-status">Status: {project.status}</div>
        <div className="modal-progress">Progress: {project.progress}%</div>
        <div className="modal-deadline">Deadline: {project.deadline}</div>
        <div className="modal-team">Team: {project.team.join(', ')}</div>
        <p>{project.details}</p>
      </div>
    );
    setModalOpen(true);
  };

  const openCustomerProjectModal = (project: any) => {
    setModalContent(
      <div className="modal-details">
        <h2>{project.name}</h2>
        <div className="modal-status">Status: {project.status.charAt(0).toUpperCase() + project.status.slice(1)}</div>
        <div className="modal-progress">Progress: {project.progress}%</div>
        <div className="modal-deadline">Deadline: {project.deadline}</div>
        {project.link && <div className="modal-link">Project Link: <a href={project.link} target="_blank" rel="noopener noreferrer">{project.link}</a></div>}
        {project.description && <div className="modal-description"><strong>Description:</strong> {project.description}</div>}
        {project.features && <div className="modal-features"><strong>Features:</strong> {project.features}</div>}
        <div className="modal-meta">Created by: {project.assignedUserName || 'Admin'}</div>
      </div>
    );
    setModalOpen(true);
  };

  const handleFeatureRequest = (project: any) => {
    setSelectedProjectForFeature(project);
    setFeatureRequestOpen(true);
  };

  const generateProjectMetrics = (project: any) => {
    // Generate realistic metrics based on project data
    const tasksCompleted = project.tasks ? project.tasks.filter((t: any) => t.completed).length : 0;
    const totalTasks = project.tasks ? project.tasks.length : 0;
    const daysActive = Math.floor(Math.random() * 30) + 1;
    const uptime = 95 + Math.random() * 5; // 95-100%
    const dailyActivity = Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));
    
    return {
      tasksCompleted,
      totalTasks,
      daysActive,
      uptime: uptime.toFixed(1),
      dailyActivity,
      lastUpdate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toLocaleDateString(),
      teamSize: Math.floor(Math.random() * 5) + 2,
      deploymentsThisWeek: Math.floor(Math.random() * 10) + 1
    };
  };

  const openAdminProjectModal = (project: any) => {
    const isUserRequested = project.type === 'user-requested';
    const createdDate = project.createdAt?.seconds 
      ? new Date(project.createdAt.seconds * 1000).toLocaleDateString()
      : new Date(project.createdAt).toLocaleDateString();

    setModalContent(
      <div className="modal-details">
        <h2>{project.name || project.projectName}</h2>
        <div className="modal-type">
          <strong>Type:</strong> {isUserRequested ? 'User Requested' : 'Admin Created'}
        </div>
        <div className="modal-status">Status: {project.status.charAt(0).toUpperCase() + project.status.slice(1)}</div>
        {!isUserRequested && <div className="modal-progress">Progress: {project.progress}%</div>}
        {!isUserRequested && project.deadline && <div className="modal-deadline">Deadline: {project.deadline}</div>}
        {!isUserRequested ? (
          <div className="modal-assigned">Assigned to: {project.assignedUserName}</div>
        ) : (
          <div className="modal-requester">Requested by: {project.requestedByName}</div>
        )}
        {project.link && <div className="modal-link">Project Link: <a href={project.link} target="_blank" rel="noopener noreferrer">{project.link}</a></div>}
        {project.description && <div className="modal-description"><strong>Description:</strong> {project.description}</div>}
        {project.features && (
          <div className="modal-features">
            <strong>Features:</strong>
            <div className="features-list">
              {project.features.split('\n').filter((f: string) => f.trim()).map((feature: string, index: number) => (
                <div key={index} className="feature-line">{feature}</div>
              ))}
            </div>
          </div>
        )}
        {isUserRequested && project.priority && (
          <div className="modal-priority"><strong>Priority:</strong> {project.priority}</div>
        )}
        <div className="modal-meta">Created: {createdDate}</div>
      </div>
    );
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  return (
    <>
    <div className="dashboard dashboard-light-bg">
      {/* Modal */}
      {modalOpen && (
        <div className="dashboard-modal-overlay" onClick={closeModal}>
          <div className="dashboard-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            {modalContent}
          </div>
        </div>
      )}
      {/* Top Navigation Bar */}
      <nav className="dashboard-navbar">
        <div className="nav-left">
          <h1 className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img 
              src={ontogenyIcon} 
              alt="Ontogeny Labs" 
              className="brand-icon"
            />
            <div className="brand-text">
              <span className="gradient-text">Ontogeny</span>
              <span className="brand-subtitle">Labs</span>
            </div>
          </h1>
        </div>
        {isAdmin && (
          <div className="nav-center">
            <button 
              className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              User Management
            </button>
          </div>
        )}
        <div className="nav-right">
          <div className="user-dropdown-container">
            <div 
              className="user-info"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={currentUser?.photoURL || '/default-avatar.png'} 
                alt="Profile" 
                className="user-avatar"
              />
              <span className="user-name">{currentUser?.displayName || 'User'}</span>
              <ChevronDown size={16} className={`dropdown-chevron ${dropdownOpen ? 'open' : ''}`} />
            </div>
            
            {dropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-item admin-toggle-item">
                  <span className="dropdown-label">Account Type:</span>
                  <button 
                    className={`admin-toggle ${isAdmin ? 'admin-active' : 'user-active'} ${adminLoading ? 'loading' : ''}`}
                    onClick={toggleAdminStatus}
                    disabled={adminLoading}
                    title={`Currently: ${isAdmin ? 'Admin' : 'User'} - Click to toggle`}
                  >
                    {adminLoading ? (
                      <RefreshCw size={14} className="spinning" />
                    ) : (
                      <Settings size={14} />
                    )}
                    <span className="admin-status">
                      {isAdmin ? 'ADMIN' : 'USER'}
                    </span>
                  </button>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {isAdmin ? (
          /* Admin Dashboard Layout */
          <div className="admin-dashboard">
            {/* User List Sidebar (1/4 screen) */}
            <div className="admin-sidebar">
              <div className="sidebar-header">
                <h3>
                  <Users size={20} />
                  All Users
                </h3>
                <span className="user-count">{allUsers.length} users</span>
              </div>
              
              {usersLoading ? (
                <div className="loading-state">
                  <RefreshCw className="spinning" size={24} />
                  <p>Loading users...</p>
                </div>
              ) : (
                <div className="users-list">
                  {allUsers.map((user) => (
                    <div 
                      key={user.id}
                      className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <img 
                        src={user.photoURL || '/default-avatar.png'} 
                        alt={user.displayName}
                        className="user-item-avatar"
                      />
                      <div className="user-item-info">
                        <h4>{user.displayName}</h4>
                        <p>{user.email}</p>
                        <span className={`user-role ${user.isAdmin ? 'admin' : 'user'}`}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main Content Area (3/4 screen) */}
            <div className="admin-main">
              {selectedUser ? (
                <>
                  {/* Selected User Header */}
                  <div className="selected-user-header">
                    <div className="user-profile">
                      <img 
                        src={selectedUser.photoURL || '/default-avatar.png'} 
                        alt={selectedUser.displayName}
                        className="selected-user-avatar"
                      />
                      <div className="user-details">
                        <h2>{selectedUser.displayName}</h2>
                        <p>{selectedUser.email}</p>
                        <span className={`user-badge ${selectedUser.isAdmin ? 'admin' : 'user'}`}>
                          {selectedUser.isAdmin ? 'Administrator' : 'User'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Admin Actions */}
                    <div className="admin-actions">
                      <button 
                        className="action-btn primary"
                        onClick={createProjectForUser}
                      >
                        <FolderPlus size={16} />
                        Create Project
                      </button>
                      <button className="action-btn secondary">
                        <Calendar size={16} />
                        Schedule Meeting
                      </button>
                      <button className="action-btn secondary">
                        <FileText size={16} />
                        View Reports
                      </button>
                    </div>
                  </div>

                  {/* User Projects & Tasks */}
                  <div className="user-projects-section">
                    <div className="section-header">
                      <h3>Projects & Tasks</h3>
                      <span className="project-count">{userProjects.length} projects</span>
                    </div>
                    
                    {userProjects.length > 0 ? (
                      <div className="projects-list">
                        {userProjects.map((project) => {
                          const isUserRequested = project.type === 'user-requested';
                          return (
                            <div 
                              key={project.id} 
                              className={`project-card-admin clickable ${isUserRequested ? 'user-requested' : 'admin-created'}`}
                              onClick={() => openAdminProjectModal(project)}
                            >
                              <div className="project-header">
                                <h4>{project.name || project.projectName}</h4>
                                <div className="project-badges">
                                  <span className={`status-badge ${project.status}`}>
                                    {project.status}
                                  </span>
                                  <span className={`type-badge ${isUserRequested ? 'requested' : 'created'}`}>
                                    {isUserRequested ? 'User Request' : 'Admin Created'}
                                  </span>
                                </div>
                              </div>
                              
                              {!isUserRequested ? (
                                <>
                                  <div className="project-progress">
                                    <div className="progress-bar">
                                      <div 
                                        className="progress-fill"
                                        style={{ width: `${project.progress}%` }}
                                      />
                                    </div>
                                    <span>{project.progress}%</span>
                                  </div>
                                  
                                  <div className="project-meta">
                                    <span>Deadline: {project.deadline}</span>
                                    <span>{project.tasks?.length || 0} tasks</span>
                                  </div>
                                  
                                  {/* Tasks List */}
                                  {project.tasks && project.tasks.length > 0 && (
                                    <div className="tasks-list">
                                      <h5>Tasks:</h5>
                                      {project.tasks.map((task: any) => (
                                        <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                                          <CheckCircle size={14} className={task.completed ? 'completed' : ''} />
                                          <span>{task.title}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="request-description">
                                    {project.description && (
                                      <p>{project.description.substring(0, 150)}...</p>
                                    )}
                                  </div>
                                  <div className="request-features">
                                    <strong>Key Features:</strong>
                                    <div className="features-preview">
                                      {project.features?.split('\n').slice(0, 3).map((feature: string, index: number) => (
                                        <div key={index} className="feature-preview-item">
                                          {feature.length > 60 ? `${feature.substring(0, 60)}...` : feature}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="project-meta">
                                    <span>Priority: {project.priority}</span>
                                    <span>Requested: {project.createdAt?.seconds 
                                      ? new Date(project.createdAt.seconds * 1000).toLocaleDateString()
                                      : new Date(project.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <FolderPlus size={48} />
                        <h4>No projects yet</h4>
                        <p>Use the "Create Project" button above to get started with {selectedUser.displayName}.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="no-user-selected">
                  <User size={64} />
                  <h3>Select a user to manage</h3>
                  <p>Choose a user from the sidebar to view their projects and tasks.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Enhanced User Dashboard */
          <div className="user-dashboard">
            {/* Request Project Section */}
            <div className="request-project-section">
              <div className="request-header">
                <div className="request-info">
                  <h2>
                    <Rocket size={24} />
                    Request New Project
                  </h2>
                  <p>Have a project idea? Let us help bring it to life. Our team will review your request and get back to you within 24 hours.</p>
                </div>
                <button 
                  className="request-project-btn"
                  onClick={() => setAiChatOpen(true)}
                >
                  <Plus size={16} />
                  Start New Request
                </button>
              </div>
            </div>

            {/* Requested Projects Section */}
            {requestedProjectsLoading ? (
              <div className="loading-state">
                <RefreshCw className="spinning" size={32} />
                <p>Loading your project requests...</p>
              </div>
            ) : requestedProjects.length > 0 ? (
              <div className="requested-projects-section">
                <div className="section-header">
                  <h3>
                    <FileText size={20} />
                    Requested Projects
                  </h3>
                  <span className="project-count">{requestedProjects.length} requests</span>
                </div>
                <div className="requested-projects-grid">
                  {requestedProjects.map((request) => (
                    <div key={request.id} className="requested-project-card">
                      <div className="requested-project-header">
                        <h4>{request.projectName}</h4>
                        <span className={`status-badge ${request.status}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="requested-project-content">
                        <p className="project-description">{request.description}</p>
                        <div className="project-features">
                          <strong>Requested Features:</strong>
                          <div className="features-text">
                            {request.features.split('\n').map((feature: string, index: number) => (
                              <div key={index} className="feature-item">
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="request-meta">
                          <span>Requested: {new Date(request.createdAt.seconds * 1000).toLocaleDateString()}</span>
                          <span>Priority: {request.priority}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Active Projects Section */}
            {customerProjectsLoading ? (
              <div className="loading-state">
                <RefreshCw className="spinning" size={32} />
                <p>Loading your projects...</p>
              </div>
            ) : customerProjects.length > 0 ? (
              <div className="active-projects-section">
                {/* Active Projects (Large Cards) */}
                <div className="active-projects-header">
                  <h2>
                    <Activity size={24} />
                    Active Projects
                  </h2>
                  <div className="project-summary">
                    <span className="summary-item">
                      <span className="summary-number">{customerProjects.filter(p => p.status === 'in-progress').length}</span>
                      <span className="summary-label">Active</span>
                    </span>
                    <span className="summary-item">
                      <span className="summary-number">{customerProjects.filter(p => p.status === 'completed').length}</span>
                      <span className="summary-label">Completed</span>
                    </span>
                  </div>
                </div>

                <div className="enhanced-projects-grid">
                  {customerProjects
                    .filter(project => project.status === 'in-progress' || project.status === 'planning')
                    .map((project) => {
                      const metrics = generateProjectMetrics(project);
                      return (
                        <div key={project.id} className="enhanced-project-card">
                          {/* Project Header */}
                          <div className="enhanced-project-header">
                            <div className="project-title-section">
                              <h3>{project.name}</h3>
                              <span className={`enhanced-status-badge ${project.status}`}>
                                <Activity size={12} />
                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                              </span>
                            </div>
                            <div className="project-actions">
                              <button 
                                className="action-btn-icon"
                                onClick={() => openCustomerProjectModal(project)}
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className="action-btn-icon feature-request"
                                onClick={() => handleFeatureRequest(project)}
                                title="Request Feature"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Project Metrics Row */}
                          <div className="project-metrics-row">
                            <div className="metric-item">
                              <div className="metric-icon">
                                <Target size={16} />
                              </div>
                              <div className="metric-content">
                                <span className="metric-value">{metrics.tasksCompleted}/{metrics.totalTasks}</span>
                                <span className="metric-label">Tasks Complete</span>
                              </div>
                            </div>
                            <div className="metric-item">
                              <div className="metric-icon uptime">
                                <Zap size={16} />
                              </div>
                              <div className="metric-content">
                                <span className="metric-value">{metrics.uptime}%</span>
                                <span className="metric-label">Uptime</span>
                              </div>
                            </div>
                            <div className="metric-item">
                              <div className="metric-icon">
                                <Clock size={16} />
                              </div>
                              <div className="metric-content">
                                <span className="metric-value">{metrics.daysActive}d</span>
                                <span className="metric-label">Active</span>
                              </div>
                            </div>
                            <div className="metric-item">
                              <div className="metric-icon">
                                <Users size={16} />
                              </div>
                              <div className="metric-content">
                                <span className="metric-value">{metrics.teamSize}</span>
                                <span className="metric-label">Team</span>
                              </div>
                            </div>
                          </div>

                          {/* Progress Section */}
                          <div className="enhanced-progress-section">
                            <div className="progress-header">
                              <span className="progress-title">Project Progress</span>
                              <span className="progress-percentage">{project.progress}%</span>
                            </div>
                            <div className="enhanced-progress-bar">
                              <div 
                                className="enhanced-progress-fill"
                                style={{ width: `${project.progress}%` }}
                              />
                              <div className="progress-markers">
                                {[25, 50, 75].map(marker => (
                                  <div 
                                    key={marker} 
                                    className={`progress-marker ${project.progress >= marker ? 'reached' : ''}`}
                                    style={{ left: `${marker}%` }}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="progress-tasks">
                              <span className="tasks-info">
                                {metrics.tasksCompleted} of {metrics.totalTasks} tasks completed
                              </span>
                              <span className="last-update">
                                Last update: {metrics.lastUpdate}
                              </span>
                            </div>
                          </div>

                          {/* Activity Graph */}
                          <div className="project-activity-section">
                            <div className="activity-header">
                              <span className="activity-title">
                                <TrendingUp size={14} />
                                Weekly Activity
                              </span>
                              <span className="deployments-count">
                                {metrics.deploymentsThisWeek} deployments this week
                              </span>
                            </div>
                            <div className="activity-chart">
                              {metrics.dailyActivity.map((activity, index) => (
                                <div key={index} className="activity-bar">
                                  <div 
                                    className="activity-fill"
                                    style={{ height: `${activity}%` }}
                                    title={`${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}: ${activity}% activity`}
                                  />
                                  <span className="activity-day">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Task Overview */}
                          {project.tasks && project.tasks.length > 0 && (
                            <div className="task-overview-section">
                              <div className="task-overview-header">
                                <span className="task-title">Recent Tasks</span>
                                <button 
                                  className="view-all-tasks"
                                  onClick={() => openCustomerProjectModal(project)}
                                >
                                  View All
                                </button>
                              </div>
                              <div className="task-preview-list">
                                {project.tasks.slice(0, 3).map((task: any, index: number) => (
                                  <div key={index} className={`task-preview-item ${task.completed ? 'completed' : ''}`}>
                                    <CheckCircle size={14} className={task.completed ? 'completed' : ''} />
                                    <span className="task-text">{task.title}</span>
                                    {task.completed && <span className="task-check">✓</span>}
                                  </div>
                                ))}
                                {project.tasks.length > 3 && (
                                  <div className="task-preview-more">
                                    +{project.tasks.length - 3} more tasks
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Quick Actions */}
                          <div className="project-quick-actions">
                            <button 
                              className="quick-action-btn primary"
                              onClick={() => openCustomerProjectModal(project)}
                            >
                              <Eye size={14} />
                              View Details
                            </button>
                            <button 
                              className="quick-action-btn secondary"
                              onClick={() => handleFeatureRequest(project)}
                            >
                              <MessageSquare size={14} />
                              Request Feature
                            </button>
                            {project.link && (
                              <button 
                                className="quick-action-btn tertiary"
                                onClick={() => window.open(project.link, '_blank')}
                              >
                                <ArrowUp size={14} />
                                Open Project
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Completed Projects (Smaller Cards) */}
                {customerProjects.filter(p => p.status === 'completed').length > 0 && (
                  <div className="completed-projects-section">
                    <h3>
                      <CheckCircle size={20} />
                      Completed Projects
                    </h3>
                    <div className="completed-projects-grid">
                      {customerProjects
                        .filter(project => project.status === 'completed')
                        .map((project) => (
                          <div 
                            key={project.id} 
                            className="completed-project-card"
                            onClick={() => openCustomerProjectModal(project)}
                          >
                            <div className="completed-project-header">
                              <h4>{project.name}</h4>
                              <CheckCircle size={16} className="completed-icon" />
                            </div>
                            <div className="completed-project-meta">
                              <span>Completed: {project.deadline}</span>
                              <span>{project.progress}% Complete</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-projects-state">
                <FolderPlus size={64} />
                <h3>No projects assigned yet</h3>
                <p>Projects assigned to you by administrators will appear here. Start by requesting your first project!</p>
                <button 
                  className="action-btn primary large"
                  onClick={() => setAiChatOpen(true)}
                >
                  <Plus size={18} />
                  Request First Project
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* AI Chat Modal */}
      <AIChatModal 
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={createProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        onSubmit={handleCreateProject}
        userDisplayName={selectedUser?.displayName || ''}
      />

      {/* Feature Request Modal (AI Chat for specific project) */}
      <AIChatModal 
        isOpen={featureRequestOpen}
        onClose={() => {
          setFeatureRequestOpen(false);
          setSelectedProjectForFeature(null);
        }}
      />

    </div>
    
    <Footer />
  </>
  );
};

export default Dashboard; 