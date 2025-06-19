import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';
import Footer from '../components/Footer';
import { BarChart3, Users, DollarSign, Rocket, CheckCircle, ChevronDown, Settings, RefreshCw, Plus, User, FolderPlus, Calendar, FileText, Activity, TrendingUp, Clock, AlertCircle, Zap, Target, ArrowUp, ArrowDown, Eye, Edit3, MessageSquare, Video, ChevronRight, Check, X, Play, HelpCircle } from 'lucide-react';
import ontogenyIcon from '../assets/otogeny-icon.png';
import CreateProjectModal, { ProjectFormData } from '../components/modals/CreateProjectModal';
import { ProjectDetailsModal, MeetingSchedulerModal, FeatureRequestModal, FeatureAssignmentModal } from '../components/modals';
import '../styles/Dashboard.css';
import '../styles/ProjectDetailsModal.css';
import '../styles/MeetingSchedulerModal.css';
import '../styles/FeatureRequestModal.css';
import '../styles/FeatureAssignmentModal.css';
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy, addDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { UserAvatar } from '../utils/avatarGenerator';
import EditProjectModal from '../components/modals/EditProjectModal';
import '../styles/EditProjectModal.css';
import UserRequestedProjectModal from '../components/modals/UserRequestedProjectModal';
import '../styles/UserRequestedProjectModal.css';
import Sidebar from '../components/Sidebar';
import '../styles/Sidebar.css';

// RequestedProjectFeatures component for collapsible feature display
interface RequestedProjectFeaturesProps {
  features: string;
  requestId: string;
}

const RequestedProjectFeatures: React.FC<RequestedProjectFeaturesProps> = ({ features, requestId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const parseFeatures = (featuresText: string) => {
    const featureLines = featuresText.split('\n').filter((f: string) => f.trim());
    
    // Enhanced categorization with more intelligent grouping
    const categorized: { [key: string]: Array<{ text: string; priority: string; complexity: 'simple' | 'moderate' | 'complex' }> } = {
      '🔐 Authentication & Security': [],
      '💻 Core Functionality': [],
      '🎨 User Interface & Design': [],
      '🔗 Integrations & APIs': [],
      '📊 Data & Analytics': [],
      '🚀 Performance & Optimization': [],
      '📱 Mobile & Responsive': [],
      '🛠️ Admin & Management': [],
      '🔔 Notifications & Communication': [],
      '💳 Payment & Billing': [],
      '📈 Reporting & Insights': [],
      '🌐 Other Features': []
    };

    featureLines.forEach((feature: string) => {
      const trimmedFeature = feature.trim();
      const priorityMatch = trimmedFeature.match(/\((high|medium|low) priority\)$/i);
      const featureText = priorityMatch 
        ? trimmedFeature.replace(/\s*\((high|medium|low) priority\)$/i, '')
        : trimmedFeature;
      const priority = priorityMatch ? priorityMatch[1].toLowerCase() : 'medium';

      // Determine complexity based on feature description
      const complexity = determineComplexity(featureText);

      // Enhanced categorization with more specific keywords
      const lowerText = featureText.toLowerCase();
      
      if (lowerText.includes('login') || lowerText.includes('auth') || lowerText.includes('security') || 
          lowerText.includes('password') || lowerText.includes('permission') || lowerText.includes('role') ||
          lowerText.includes('encrypt') || lowerText.includes('2fa') || lowerText.includes('oauth')) {
        categorized['🔐 Authentication & Security'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('payment') || lowerText.includes('billing') || lowerText.includes('subscription') ||
                 lowerText.includes('invoice') || lowerText.includes('stripe') || lowerText.includes('paypal')) {
        categorized['💳 Payment & Billing'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('notification') || lowerText.includes('email') || lowerText.includes('sms') ||
                 lowerText.includes('push') || lowerText.includes('alert') || lowerText.includes('message')) {
        categorized['🔔 Notifications & Communication'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('api') || lowerText.includes('integration') || lowerText.includes('connect') || 
                 lowerText.includes('sync') || lowerText.includes('webhook') || lowerText.includes('third-party')) {
        categorized['🔗 Integrations & APIs'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('ui') || lowerText.includes('interface') || lowerText.includes('design') || 
                 lowerText.includes('theme') || lowerText.includes('layout') || lowerText.includes('style')) {
        categorized['🎨 User Interface & Design'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('mobile') || lowerText.includes('responsive') || lowerText.includes('tablet') ||
                 lowerText.includes('ios') || lowerText.includes('android') || lowerText.includes('app')) {
        categorized['📱 Mobile & Responsive'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('admin') || lowerText.includes('management') || lowerText.includes('control') ||
                 lowerText.includes('setting') || lowerText.includes('config') || lowerText.includes('moderate')) {
        categorized['🛠️ Admin & Management'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('report') || lowerText.includes('analytics') || lowerText.includes('insight') ||
                 lowerText.includes('metric') || lowerText.includes('chart') || lowerText.includes('graph')) {
        categorized['📊 Data & Analytics'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('performance') || lowerText.includes('optimization') || lowerText.includes('cache') ||
                 lowerText.includes('speed') || lowerText.includes('load') || lowerText.includes('compress')) {
        categorized['🚀 Performance & Optimization'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('dashboard') || lowerText.includes('overview') || lowerText.includes('summary') ||
                 lowerText.includes('status') || lowerText.includes('monitor')) {
        categorized['📈 Reporting & Insights'].push({ text: featureText, priority, complexity });
      } else if (lowerText.includes('core') || lowerText.includes('main') || lowerText.includes('primary') || 
                 lowerText.includes('essential') || lowerText.includes('basic') || lowerText.includes('fundamental')) {
        categorized['💻 Core Functionality'].push({ text: featureText, priority, complexity });
      } else {
        categorized['🌐 Other Features'].push({ text: featureText, priority, complexity });
      }
    });

    // Remove empty categories and sort by priority within each category
    return Object.entries(categorized)
      .filter(([_, features]) => features.length > 0)
      .map(([category, features]) => [
        category, 
        features.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        })
      ]);
  };

  const determineComplexity = (featureText: string): 'simple' | 'moderate' | 'complex' => {
    const lowerText = featureText.toLowerCase();
    
    // Complex features
    if (lowerText.includes('ai') || lowerText.includes('machine learning') || lowerText.includes('blockchain') ||
        lowerText.includes('real-time') || lowerText.includes('video') || lowerText.includes('streaming') ||
        lowerText.includes('complex algorithm') || lowerText.includes('advanced')) {
      return 'complex';
    }
    
    // Simple features
    if (lowerText.includes('button') || lowerText.includes('text') || lowerText.includes('color') ||
        lowerText.includes('simple') || lowerText.includes('basic') || lowerText.includes('static')) {
      return 'simple';
    }
    
    // Default to moderate
    return 'moderate';
  };

  const categorizedFeatures = parseFeatures(features);
  const totalFeatures = categorizedFeatures.reduce((sum, [_, features]) => sum + features.length, 0);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="project-features">
      <div 
        className="features-header clickable"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="features-title">
          <Settings size={16} />
          <strong>Requested Features</strong>
          <span className="feature-count">({totalFeatures})</span>
        </div>
        <ChevronRight 
          size={16} 
          className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
        />
      </div>
      
      {isExpanded && (
        <div className="features-content">
          {categorizedFeatures.map(([category, categoryFeatures]) => {
            const categoryName = category as string;
            const features = categoryFeatures as Array<{ text: string; priority: string; complexity: 'simple' | 'moderate' | 'complex' }>;
            
            return (
              <div key={categoryName} className="feature-category">
                <div 
                  className="category-header"
                  onClick={() => toggleCategory(categoryName)}
                >
                  <div className="category-title">
                    <span className="category-name">{categoryName}</span>
                    <span className="category-count">({features.length})</span>
                  </div>
                  <ChevronRight 
                    size={14} 
                    className={`category-expand-icon ${expandedCategories.has(categoryName) ? 'expanded' : ''}`}
                  />
                </div>
                
                {expandedCategories.has(categoryName) && (
                  <div className="category-features">
                    {features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <span className={`feature-priority priority-${feature.priority}`}>
                          {feature.priority === 'high' ? '🔴' : feature.priority === 'medium' ? '🟡' : '🟢'}
                        </span>
                        <span className="feature-text">{feature.text}</span>
                        <span className={`feature-complexity complexity-${feature.complexity}`} title={`${feature.complexity} complexity`}>
                          {feature.complexity === 'complex' ? '⚡' : feature.complexity === 'moderate' ? '⚙️' : '✨'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

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

  const [selectedProjectForFeature, setSelectedProjectForFeature] = useState<any>(null);

  // Edit project modal state
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<any>(null);

  // Three-modal workflow state
  const [projectDetailsModalOpen, setProjectDetailsModalOpen] = useState(false);
  const [meetingSchedulerModalOpen, setMeetingSchedulerModalOpen] = useState(false);
  const [conversationData, setConversationData] = useState<any>(null);
  const [projectDetails, setProjectDetails] = useState<any>(null);

  // Feature request workflow state
  const [featureRequestModalOpen, setFeatureRequestModalOpen] = useState(false);
  const [featureAssignmentModalOpen, setFeatureAssignmentModalOpen] = useState(false);
  const [featureConversationData, setFeatureConversationData] = useState<any>(null);
  const [featureRequestData, setFeatureRequestData] = useState<any>(null);

  // User requested project modal
  const [showUserRequestedModal, setShowUserRequestedModal] = useState(false);
  const [selectedUserProject, setSelectedUserProject] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // User filtering and sorting
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [sortByAlerts, setSortByAlerts] = useState(false);

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

  // Reload users when search query or sort changes
  useEffect(() => {
    if (isAdmin) {
      loadAllUsers();
    }
  }, [userSearchQuery, sortByAlerts]);



  const loadCustomerProjects = async () => {
    if (!currentUser) return;
    
    setCustomerProjectsLoading(true);
    try {
      // Load projects assigned to the current user
      const projectsQuery = query(
        collection(db, 'admin_projects'),
        where('assignedTo', '==', currentUser.uid)
        // orderBy('createdAt', 'desc') // Temporarily removed - requires index
      );
      const snapshot = await getDocs(projectsQuery);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt on client side (since we removed orderBy for index issues)
      projects.sort((a: any, b: any) => {
        const aDate = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
        const bDate = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
        return bDate.getTime() - aDate.getTime();
      });
      
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
        where('requestedBy', '==', currentUser.uid)
        // orderBy('createdAt', 'desc') // Temporarily removed - requires index
      );
      const snapshot = await getDocs(requestsQuery);
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt on client side (since we removed orderBy for index issues)
      requests.sort((a: any, b: any) => {
        const aDate = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
        const bDate = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
        return bDate.getTime() - aDate.getTime();
      });
      
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

      // Check for uncompleted items for each user
      const usersWithStatus = await Promise.all(
        users.map(async (user) => {
          try {
            // Check for pending project requests
            const projectRequestsRef = collection(db, 'user_project_requests');
            const projectRequestsQuery = query(
              projectRequestsRef,
              where('requestedBy', '==', user.id),
              where('status', 'in', ['pending', 'under-review'])
            );
            const projectRequestsSnapshot = await getDocs(projectRequestsQuery);
            
            // Check for pending feature requests
            const featureRequestsRef = collection(db, 'feature_requests');
            const featureRequestsQuery = query(
              featureRequestsRef,
              where('requestedBy', '==', user.id),
              where('status', 'in', ['pending', 'under-review'])
            );
            const featureRequestsSnapshot = await getDocs(featureRequestsQuery);

            // Check for in-progress projects
            const adminProjectsRef = collection(db, 'admin_projects');
            const adminProjectsQuery = query(
              adminProjectsRef,
              where('assignedTo', '==', user.id),
              where('status', 'in', ['planning', 'in-progress'])
            );
            const adminProjectsSnapshot = await getDocs(adminProjectsQuery);

            const pendingProjectRequests = projectRequestsSnapshot.size;
            const pendingFeatureRequests = featureRequestsSnapshot.size;
            const activeProjects = adminProjectsSnapshot.size;
            const totalUncompletedItems = pendingProjectRequests + pendingFeatureRequests + activeProjects;

            return {
              ...user,
              uncompletedItems: totalUncompletedItems,
              hasUncompletedItems: totalUncompletedItems > 0,
              pendingProjectRequests,
              pendingFeatureRequests,
              activeProjects
            };
          } catch (error) {
            console.error(`Error checking uncompleted items for user ${user.id}:`, error);
            return {
              ...user,
              uncompletedItems: 0,
              hasUncompletedItems: false,
              pendingProjectRequests: 0,
              pendingFeatureRequests: 0,
              activeProjects: 0
            };
          }
        })
      );

      // Filter users based on search query
      let filteredUsers = usersWithStatus.filter((user: any) => {
        const searchTerm = userSearchQuery.toLowerCase();
        return user.displayName?.toLowerCase().includes(searchTerm) ||
               user.email?.toLowerCase().includes(searchTerm);
      });

      // Sort users based on sortByAlerts
      if (sortByAlerts) {
        filteredUsers.sort((a: any, b: any) => b.uncompletedItems - a.uncompletedItems);
      } else {
        filteredUsers.sort((a: any, b: any) => (a.displayName || '').localeCompare(b.displayName || ''));
      }

      setAllUsers(filteredUsers);
      
      // Auto-select first user if none selected
      if (filteredUsers.length > 0 && !selectedUser) {
        await handleUserSelect(filteredUsers[0]);
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
        where('assignedTo', 'array-contains', user.id)
        // orderBy('createdAt', 'desc') // Temporarily removed - requires index
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
        where('requestedBy', '==', user.id)
        // orderBy('createdAt', 'desc') // Temporarily removed - requires index
      );
      const requestedSnapshot = await getDocs(requestedProjectsQuery);
      const requestedProjects = requestedSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Calculate progress from features if available
        let progress = 0;
        if (data.features && typeof data.features === 'string') {
          const lines = data.features.split('\n').filter((line: string) => line.trim());
          if (lines.length > 0) {
            const completedLines = lines.filter((line: string) => /^(\[x\]|\✓)/.test(line.trim()));
            progress = Math.round((completedLines.length / lines.length) * 100);
          }
        }
        
        return {
          id: doc.id,
          type: 'user-requested',
          name: data.projectName, // Map projectName to name for consistency
          status: data.status,
          progress: progress, // Calculate actual progress from features
          ...data
        };
      });

      // Combine and sort by creation date
      const allProjects = [...adminProjects, ...requestedProjects].sort((a: any, b: any) => {
        const aDate = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
        const bDate = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
        return bDate.getTime() - aDate.getTime();
      });
      
      console.log(`Loaded ${allProjects.length} total projects for ${user.displayName}:`, allProjects);
      setUserProjects(allProjects);
      
      // Force a re-render by updating the state
      console.log('Setting userProjects state with:', allProjects);
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
        assignedTo: [selectedUser.id], // Store as array for consistency
        assignedToNames: [selectedUser.displayName],
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

  // Debug userProjects state changes
  React.useEffect(() => {
    console.log('userProjects state changed:', userProjects);
    console.log('userProjects length:', userProjects?.length);
    console.log('selectedUser:', selectedUser?.displayName);
  }, [userProjects, selectedUser]);

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
    // Check if this is the current user's own project and if they are admin
    const isOwnProject = project.assignedTo === currentUser?.uid;
    const canEdit = isAdmin && isOwnProject;

    if (canEdit) {
      // Open edit modal for admin users editing their own projects
      setSelectedProjectForEdit(project);
      setEditProjectModalOpen(true);
    } else {
      // Show details modal for regular view
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
          {canEdit && (
            <div className="modal-actions">
              <button 
                className="btn-primary"
                onClick={() => {
                  closeModal();
                  setSelectedProjectForEdit(project);
                  setEditProjectModalOpen(true);
                }}
              >
                <Edit3 size={16} />
                Edit Project
              </button>
            </div>
          )}
        </div>
      );
      setModalOpen(true);
    }
  };

  const handleFeatureRequest = (project: any) => {
    setSelectedProjectForFeature(project);
    setAiChatOpen(true); // Start with AI consultation for feature request
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
    
    if (isUserRequested) {
      // For user-requested projects, open the enhanced interactive modal
      setSelectedUserProject(project);
      setShowUserRequestedModal(true);
    } else {
      // For admin-created projects, open edit modal
      setSelectedProjectForEdit(project);
      setEditProjectModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  const handleProjectUpdate = async () => {
    // Refresh the projects for the selected user (admin view)
    if (selectedUser) {
      await handleUserSelect(selectedUser);
    }
    
    // Also refresh customer projects if this is the current user's project
    if (!isAdmin || (selectedUser && selectedUser.id === currentUser?.uid)) {
      await loadCustomerProjects();
    }
  };

  const closeEditProjectModal = () => {
    setEditProjectModalOpen(false);
    setSelectedProjectForEdit(null);
  };

  const handleOpenAdminProject = async (adminProjectId: string) => {
    try {
      // Load the admin project data
      const adminProjectDoc = await getDoc(doc(db, 'admin_projects', adminProjectId));
      if (adminProjectDoc.exists()) {
        const adminProject = {
          id: adminProjectDoc.id,
          type: 'admin-created',
          ...adminProjectDoc.data()
        };
        
        // Close the user requested modal and open the edit project modal
        setShowUserRequestedModal(false);
        setSelectedUserProject(null);
        setSelectedProjectForEdit(adminProject);
        setEditProjectModalOpen(true);
      } else {
        console.error('Admin project not found:', adminProjectId);
        alert('Admin project not found. It may have been deleted.');
      }
    } catch (error) {
      console.error('Error loading admin project:', error);
      alert('Error loading admin project. Please try again.');
    }
  };

  // Three-modal workflow handlers
  const handleAIConsultationNextStep = (conversationData: any) => {
    console.log('Moving to project details modal with conversation data:', conversationData);
    setConversationData(conversationData);
    setAiChatOpen(false);
    setProjectDetailsModalOpen(true);
  };

  const handleProjectDetailsNextStep = (projectDetails: any) => {
    console.log('Moving to meeting scheduler modal with project details:', projectDetails);
    setProjectDetails(projectDetails);
    setProjectDetailsModalOpen(false);
    setMeetingSchedulerModalOpen(true);
  };

  const handleMeetingSchedulerComplete = async (meetingData: any) => {
    console.log('Completing workflow with meeting data:', meetingData);
    
    try {
      if (meetingData.type === 'meeting') {
        // Save meeting data to Firebase
        await addDoc(collection(db, 'scheduled_meetings'), {
          ...meetingData,
          userId: currentUser?.uid,
          userEmail: currentUser?.email,
          userName: currentUser?.displayName,
          createdAt: new Date()
        });
        
        console.log('Meeting scheduled successfully');
        alert('Meeting scheduled successfully! You will receive a confirmation email shortly.');
      } else {
        // Submit project request directly
        await addDoc(collection(db, 'user_project_requests'), {
          projectName: meetingData.projectDetails.name,
          description: meetingData.projectDetails.description,
          features: meetingData.projectDetails.features,
          priority: meetingData.projectDetails.priority,
          timeline: meetingData.projectDetails.timeline,
          budget: meetingData.projectDetails.budget,
          requestedBy: currentUser?.uid,
          requestedByName: currentUser?.displayName || currentUser?.email,
          requestedByEmail: currentUser?.email,
          status: 'requested',
          conversationData: meetingData.projectDetails.conversationData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log('Project request submitted successfully');
        alert('Project request submitted successfully! We will review your requirements and get back to you within 24 hours.');
        
        // Refresh requested projects
        await loadRequestedProjects();
      }
    } catch (error) {
      console.error('Error completing workflow:', error);
      alert('There was an error processing your request. Please try again.');
    }
    
    // Close all modals and reset state
    setMeetingSchedulerModalOpen(false);
    setProjectDetails(null);
    setConversationData(null);
  };

  const handleCloseProjectWorkflow = () => {
    // Close all modals and reset state
    setAiChatOpen(false);
    setProjectDetailsModalOpen(false);
    setMeetingSchedulerModalOpen(false);
    setProjectDetails(null);
    setConversationData(null);
  };

  // Feature request workflow handlers
  const handleFeatureConsultationNextStep = (conversationData: any) => {
    setFeatureConversationData(conversationData);
    setAiChatOpen(false);
    setFeatureRequestModalOpen(true);
  };

  const handleFeatureDetailsNextStep = (featureData: any) => {
    setFeatureRequestData(featureData);
    setFeatureRequestModalOpen(false);
    setFeatureAssignmentModalOpen(true);
  };

  const handleFeatureAssignmentComplete = async (assignmentData: any) => {
    try {
      // Save feature request to Firebase
      const featureRequest = {
        ...assignmentData,
        requestedBy: currentUser?.uid,
        requestedByName: currentUser?.displayName || currentUser?.email,
        projectId: selectedProjectForFeature?.id,
        projectName: selectedProjectForFeature?.name,
        status: 'pending',
        createdAt: new Date(),
        type: 'feature-request'
      };

      await addDoc(collection(db, 'feature_requests'), featureRequest);
      
      alert('Feature request submitted successfully! You will receive updates on its progress.');
      handleCloseFeatureWorkflow();
      
    } catch (error) {
      console.error('Error submitting feature request:', error);
      alert('Error submitting feature request. Please try again.');
    }
  };

  const handleCloseFeatureWorkflow = () => {
    setAiChatOpen(false);
    setFeatureRequestModalOpen(false);
    setFeatureAssignmentModalOpen(false);
    setFeatureConversationData(null);
    setFeatureRequestData(null);
    setSelectedProjectForFeature(null);
  };



  // Toggle sorting users by alerts
  const toggleAlertSort = () => {
    setSortByAlerts(!sortByAlerts);
    // Reload users with new sorting
    loadAllUsers();
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Handle section-specific logic here
    console.log('Navigating to section:', section);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
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
                  <div className="request-summary">
                    <span className="summary-item">
                      <span className="summary-number">{requestedProjects.filter(r => r.status === 'pending').length}</span>
                      <span className="summary-label">Pending</span>
                    </span>
                    <span className="summary-item">
                      <span className="summary-number">{requestedProjects.filter(r => r.status === 'under-review').length}</span>
                      <span className="summary-label">Under Review</span>
                    </span>
                    <span className="summary-item">
                      <span className="summary-number">{requestedProjects.filter(r => r.status === 'approved').length}</span>
                      <span className="summary-label">Approved</span>
                    </span>
                  </div>
                </div>
                
                {/* Group by priority */}
                {['high', 'medium', 'low'].map(priority => {
                  const projectsInPriority = requestedProjects.filter(r => r.priority === priority);
                  if (projectsInPriority.length === 0) return null;
                  
                  return (
                    <div key={priority} className="priority-group">
                      <div className="priority-header">
                        <div className="priority-indicator">
                          <span className={`priority-dot ${priority}`}>
                            {priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'}
                          </span>
                          <h4>{priority.charAt(0).toUpperCase() + priority.slice(1)} Priority</h4>
                        </div>
                        <span className="priority-count">{projectsInPriority.length} {projectsInPriority.length === 1 ? 'request' : 'requests'}</span>
                      </div>
                      
                      <div className="requested-projects-grid">
                        {projectsInPriority.map((request) => {
                          // Calculate progress from features
                          let progress = 0;
                          if (request.features && typeof request.features === 'string') {
                            const lines = request.features.split('\n').filter((line: string) => line.trim());
                            if (lines.length > 0) {
                              const completedLines = lines.filter((line: string) => /^(\[x\]|\✓)/.test(line.trim()));
                              progress = Math.round((completedLines.length / lines.length) * 100);
                            }
                          }
                          
                          return (
                            <div key={request.id} className={`requested-project-card priority-${priority}`}>
                              <div className="requested-project-header">
                                <div className="project-title-group">
                                  <h4>{request.projectName}</h4>
                                  <span className={`status-badge ${request.status} ${request.status === 'accepted' ? 'accepted-badge' : ''}`}>
                                    {request.status === 'pending' && <Clock size={12} />}
                                    {request.status === 'under-review' && <Eye size={12} />}
                                    {request.status === 'approved' && <CheckCircle size={12} />}
                                    {request.status === 'accepted' && <CheckCircle size={12} />}
                                    {request.status === 'accepted' ? '✅ ACCEPTED' : request.status.replace('-', ' ')}
                                  </span>
                                </div>
                                <div className="request-timeline">
                                  <Calendar size={14} />
                                  <span>{new Date(request.createdAt.seconds * 1000).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              {/* Progress Bar for Accepted Projects */}
                              {request.status === 'accepted' && (
                                <div className="request-progress-section">
                                  <div className="progress-header">
                                    <span className="progress-label">Development Progress</span>
                                    <span className="progress-percentage">{progress}%</span>
                                  </div>
                                  <div className="request-progress-bar">
                                    <div 
                                      className="request-progress-fill"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                  <div className="progress-details">
                                    <span>{request.features ? request.features.split('\n').filter((line: string) => /^(\[x\]|\✓)/.test(line.trim())).length : 0} features completed</span>
                                    {progress === 100 && (
                                      <span className="ready-badge">🚀 Ready for Deployment!</span>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              <div className="requested-project-content">
                                <div className="project-description">
                                  <p>{request.description}</p>
                                </div>
                                
                                <RequestedProjectFeatures 
                                  features={request.features}
                                  requestId={request.id}
                                />
                                
                                <div className="request-meta">
                                  <div className="meta-item">
                                    <User size={14} />
                                    <span>Requested by You</span>
                                  </div>
                                  {request.meetingScheduled && (
                                    <div className="meta-item">
                                      <Video size={14} />
                                      <span>Meeting Scheduled</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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
                                title={isAdmin && project.assignedTo === currentUser?.uid ? "Edit Project" : "View Details"}
                              >
                                {isAdmin && project.assignedTo === currentUser?.uid ? <Edit3 size={16} /> : <Eye size={16} />}
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

                          {/* Enhanced Progress Section */}
                          <div className="enhanced-progress-section">
                            <div className="progress-header">
                              <span className="progress-title">Progress</span>
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
                              <span className="tasks-info">{metrics.tasksCompleted} of {metrics.totalTasks} tasks completed</span>
                              <span className="last-update">Updated {metrics.lastUpdate}</span>
                            </div>
                          </div>

                          {/* Project Activity */}
                          <div className="project-activity-section">
                            <div className="activity-header">
                              <span className="activity-title">Activity</span>
                                                             <span className="deployments-count">{metrics.deploymentsThisWeek} deployments</span>
                            </div>
                            <div className="activity-chart">
                              {Array.from({ length: 7 }, (_, i) => (
                                <div key={i} className="activity-bar">
                                  <div 
                                    className="activity-fill"
                                    style={{ height: `${Math.random() * 100}%` }}
                                    title={`Day ${i + 1}: ${Math.floor(Math.random() * 10)} commits`}
                                  />
                                  <span className="activity-day">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
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
          </>
        );
      
      case 'requested-projects':
        return (
          <div className="section-content">
            <div className="section-header">
              <h1>
                <Plus size={24} />
                Requested Projects
              </h1>
              <p>Manage and track your project requests</p>
            </div>
            {/* Requested projects content - you can move the requested projects section here */}
            <div className="placeholder-content">
              <p>Your requested projects will be displayed here...</p>
            </div>
          </div>
        );
      
      case 'active-projects':
        return (
          <div className="section-content">
            <div className="section-header">
              <h1>
                <Activity size={24} />
                Active Projects
              </h1>
              <p>Track your ongoing projects and their progress</p>
            </div>
            {/* Active projects content */}
            <div className="placeholder-content">
              <p>Your active projects will be displayed here...</p>
            </div>
          </div>
        );
      
      case 'completed-projects':
        return (
          <div className="section-content">
            <div className="section-header">
              <h1>
                <CheckCircle size={24} />
                Completed Projects
              </h1>
              <p>Review your finished projects and achievements</p>
            </div>
            <div className="placeholder-content">
              <p>Your completed projects will be displayed here...</p>
            </div>
          </div>
        );
      
      case 'statistics':
      case 'project-analytics':
      case 'time-tracking':
      case 'achievements':
        return (
          <div className="section-content">
            <div className="section-header">
              <h1>
                <BarChart3 size={24} />
                Statistics & Analytics
              </h1>
              <p>View your performance metrics and project analytics</p>
            </div>
            <div className="placeholder-content">
              <p>Analytics dashboard coming soon...</p>
            </div>
          </div>
        );
      
      case 'calendar':
        return (
          <div className="section-content">
            <div className="section-header">
              <h1>
                <Calendar size={24} />
                Calendar
              </h1>
              <p>Manage deadlines, meetings, and important dates</p>
            </div>
            <div className="placeholder-content">
              <p>Calendar view coming soon...</p>
            </div>
          </div>
        );
      
      case 'messages':
        return (
          <div className="section-content">
            <div className="section-header">
              <h1>
                <MessageSquare size={24} />
                Messages
              </h1>
              <p>Communications and project updates</p>
            </div>
            <div className="placeholder-content">
              <p>Message center coming soon...</p>
            </div>
          </div>
        );
      
      case 'profile':
      case 'payment':
      case 'security':
      case 'notifications':
      case 'settings':
        return (
          <div className="section-content">
            <div className="section-header">
              <h1>
                <Settings size={24} />
                Settings
              </h1>
              <p>Manage your account preferences and security</p>
            </div>
            <div className="placeholder-content">
              <p>Settings panel coming soon...</p>
            </div>
          </div>
        );
      
      case 'help':
      case 'documentation':
      case 'support-tickets':
      case 'feature-requests':
        return (
          <div className="section-content">
            <div className="section-header">
              <h1>
                <HelpCircle size={24} />
                Help & Support
              </h1>
              <p>Get assistance and access documentation</p>
            </div>
            <div className="placeholder-content">
              <p>Help center coming soon...</p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="section-content">
            <div className="section-header">
              <h1>Dashboard</h1>
              <p>Welcome to your project management dashboard</p>
            </div>
          </div>
        );
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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
      <nav className={`dashboard-navbar ${!isAdmin ? (sidebarCollapsed ? 'with-sidebar-collapsed' : 'with-sidebar') : ''}`}>
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
              <UserAvatar
                photoURL={currentUser?.photoURL}
                displayName={currentUser?.displayName}
                size={40}
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
                <div className="sidebar-controls">
                  <span className="user-count">{allUsers.length} users</span>
                  <div className="user-controls">
                    <div className="search-container">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="user-search-input"
                      />
                    </div>
                    <button 
                      className={`sort-btn ${sortByAlerts ? 'active' : ''}`}
                      onClick={toggleAlertSort}
                      title={sortByAlerts ? 'Sort alphabetically' : 'Sort by most alerts'}
                    >
                      {sortByAlerts ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    </button>
                  </div>
                </div>
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
                      <UserAvatar
                        photoURL={user.photoURL}
                        displayName={user.displayName}
                        size={40}
                        className="user-item-avatar"
                      />
                      <div className="user-item-info">
                        <h4>{user.displayName}</h4>
                        <p>{user.email}</p>
                        <span className={`user-role ${user.isAdmin ? 'admin' : 'user'}`}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </div>
                      {user.hasUncompletedItems && (
                        <div className="user-alert-badge" title={`${user.uncompletedItems} uncompleted items`}>
                          {user.uncompletedItems}
                        </div>
                      )}
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
                      <UserAvatar
                        photoURL={selectedUser.photoURL}
                        displayName={selectedUser.displayName}
                        size={80}
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
                      <span className="project-count">{userProjects?.length || 0} projects</span>
                    </div>
                    
                    {userProjects && userProjects.length > 0 ? (
                      <div className="projects-list">
                        {userProjects.map((project) => {
                          const isUserRequested = project.type === 'user-requested';
                          return (
                            <div 
                              key={project.id} 
                              className={`project-card-admin clickable ${isUserRequested ? 'user-requested' : 'admin-created'}`}
                              onClick={() => openAdminProjectModal(project)}
                              title={isUserRequested ? 'Click to view details' : 'Click to edit project'}
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
                                  {!isUserRequested && (
                                    <span className="edit-indicator">
                                      <Edit3 size={12} />
                                      Editable
                                    </span>
                                  )}
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
                                  {/* Progress Bar for Accepted User Requests */}
                                  {project.status === 'accepted' && (
                                    <div className="admin-progress-section">
                                      <div className="progress-header">
                                        <span className="progress-label">Development Progress</span>
                                        <span className="progress-percentage">{project.progress || 0}%</span>
                                      </div>
                                      <div className="admin-progress-bar">
                                        <div 
                                          className="admin-progress-fill"
                                          style={{ width: `${project.progress || 0}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
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
                                    <span>Status: {project.status === 'accepted' ? '✅ ACCEPTED' : project.status}</span>
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
          /* Enhanced User Dashboard with Sidebar */
          <div className="user-dashboard-container">
            {/* Left Sidebar */}
            <Sidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={toggleSidebar}
            />
            
            {/* Main Content */}
            <div className={`user-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
              {renderSectionContent()}
            </div>
          </div>
        )}
      </div>
      
      {/* AI Chat Modal */}
      <AIChatModal
        isOpen={aiChatOpen}
        onClose={selectedProjectForFeature ? handleCloseFeatureWorkflow : handleCloseProjectWorkflow}
        onNextStep={selectedProjectForFeature ? handleFeatureConsultationNextStep : handleAIConsultationNextStep}
        mode={selectedProjectForFeature ? 'feature-request' : 'project-request'}
        project={selectedProjectForFeature}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={createProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        onSubmit={handleCreateProject}
        userDisplayName={selectedUser?.displayName || ''}
      />

      {/* Feature Request Workflow Modals */}
      <FeatureRequestModal
        isOpen={featureRequestModalOpen}
        onClose={handleCloseFeatureWorkflow}
        onNext={handleFeatureDetailsNextStep}
        onBack={() => {
          setFeatureRequestModalOpen(false);
          setAiChatOpen(true);
        }}
        conversationData={featureConversationData}
        project={selectedProjectForFeature}
      />

      <FeatureAssignmentModal
        isOpen={featureAssignmentModalOpen}
        onClose={handleCloseFeatureWorkflow}
        onSubmit={handleFeatureAssignmentComplete}
        onBack={() => {
          setFeatureAssignmentModalOpen(false);
          setFeatureRequestModalOpen(true);
        }}
        featureData={featureRequestData}
      />

      {/* Edit Project Modal */}
      {editProjectModalOpen && selectedProjectForEdit && (
        <EditProjectModal
          project={selectedProjectForEdit}
          onClose={closeEditProjectModal}
          onUpdate={handleProjectUpdate}
        />
      )}

      {/* User Requested Project Modal */}
      <UserRequestedProjectModal
        isOpen={showUserRequestedModal}
        onClose={() => {
          setShowUserRequestedModal(false);
          setSelectedUserProject(null);
        }}
        project={selectedUserProject}
        onUpdate={() => {
          if (selectedUser) {
            handleUserSelect(selectedUser);
          }
        }}
        currentUser={currentUser}
        onOpenAdminProject={handleOpenAdminProject}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={projectDetailsModalOpen}
        onClose={handleCloseProjectWorkflow}
        onNextStep={handleProjectDetailsNextStep}
        conversationData={conversationData}
      />

      {/* Meeting Scheduler Modal */}
      <MeetingSchedulerModal
        isOpen={meetingSchedulerModalOpen}
        onClose={handleCloseProjectWorkflow}
        onComplete={handleMeetingSchedulerComplete}
        projectDetails={projectDetails}
      />

    </div>
    
    <Footer />
  </>
  );
};

export default Dashboard; 