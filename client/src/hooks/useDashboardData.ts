import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isAdmin: boolean;
  hasUncompletedItems?: boolean;
  uncompletedItems?: number;
}

interface Project {
  id: string;
  name?: string;
  projectName?: string;
  description?: string;
  status: string;
  progress?: number;
  deadline?: string;
  tasks?: any[];
  type?: string;
  features?: string;
  priority?: string;
  createdAt?: any;
  meetingScheduled?: boolean;
}

export const useDashboardData = (currentUser: any) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [customerProjects, setCustomerProjects] = useState<Project[]>([]);
  const [requestedProjects, setRequestedProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  
  // Loading states
  const [customerProjectsLoading, setCustomerProjectsLoading] = useState(true);
  const [requestedProjectsLoading, setRequestedProjectsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  
  // User management states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [sortByAlerts, setSortByAlerts] = useState(false);

  // Check admin status
  const checkAdminStatus = async () => {
    console.log('🔍 checkAdminStatus called');
    console.log('👤 Current user UID:', currentUser?.uid);
    
    if (!currentUser?.uid) {
      console.log('❌ No current user UID, returning early');
      return;
    }
    
    try {
      console.log('📡 Fetching user document from Firestore...');
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      console.log('📄 User doc exists:', userDoc.exists());
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('👤 User data:', userData);
        console.log('👑 isAdmin value:', userData.isAdmin);
        setIsAdmin(userData.isAdmin === true);
      } else {
        console.log('❌ User document does not exist');
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('❌ Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      console.log('✅ Setting loading to false');
      setLoading(false);
    }
  };

  // Load customer projects
  const loadCustomerProjects = async () => {
    console.log('🔍 loadCustomerProjects called');
    console.log('📋 Current user:', currentUser?.uid);
    
    if (!currentUser?.uid) {
      console.log('❌ No current user UID, returning early');
      return;
    }
    
    setCustomerProjectsLoading(true);
    console.log('⏳ Set customerProjectsLoading to true');
    
    try {
      console.log('🔎 Creating Firestore query for projects collection');
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      console.log('📡 Executing Firestore query...');
      const querySnapshot = await getDocs(projectsQuery);
      console.log('📊 Query completed, docs found:', querySnapshot.docs.length);
      
      const projects = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Project doc:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      }) as Project[];
      
      console.log('✅ Final projects array:', projects);
      setCustomerProjects(projects);
    } catch (error) {
      console.error('❌ Error loading customer projects:', error);
      // Set empty array if there's a permission error
      setCustomerProjects([]);
    } finally {
      setCustomerProjectsLoading(false);
      console.log('✅ Set customerProjectsLoading to false');
    }
  };

  // Load requested projects
  const loadRequestedProjects = async () => {
    if (!currentUser?.uid) return;
    
    setRequestedProjectsLoading(true);
    try {
      const requestsQuery = query(
        collection(db, 'user_project_requests'),
        where('requestedBy', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(requestsQuery);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      setRequestedProjects(requests);
    } catch (error) {
      console.error('Error loading requested projects:', error);
      // Set empty array if there's a permission error
      setRequestedProjects([]);
    } finally {
      setRequestedProjectsLoading(false);
    }
  };

  // Load all users (admin only)
  const loadAllUsers = async () => {
    setUsersLoading(true);
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('displayName'));
      const querySnapshot = await getDocs(usersQuery);
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load user projects (admin selecting a user)
  const loadUserProjects = async (userId: string) => {
    try {
      // Load both regular projects and user requests
      const [projectsSnapshot, requestsSnapshot] = await Promise.all([
        getDocs(query(
          collection(db, 'projects'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        )),
        getDocs(query(
          collection(db, 'user_project_requests'),
          where('requestedBy', '==', userId),
          orderBy('createdAt', 'desc')
        ))
      ]);

      const projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'admin-created',
        ...doc.data()
      }));

      const requests = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'user-requested',
        ...doc.data()
      }));

      // Filter out any projects without proper IDs
      const validProjects = projects.filter(p => p.id && p.id.trim());
      const validRequests = requests.filter(r => r.id && r.id.trim());
      
      console.log('Loaded projects:', {
        totalProjects: validProjects.length,
        totalRequests: validRequests.length,
        filteredOutProjects: projects.length - validProjects.length,
        filteredOutRequests: requests.length - validRequests.length
      });

      setUserProjects([...validProjects, ...validRequests] as Project[]);
    } catch (error) {
      console.error('Error loading user projects:', error);
    }
  };

  // Filter and sort users
  const filteredUsers = allUsers
    .filter(user => 
      user.displayName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortByAlerts) {
        const aAlerts = a.uncompletedItems || 0;
        const bAlerts = b.uncompletedItems || 0;
        return bAlerts - aAlerts;
      }
      return (a.displayName || '').localeCompare(b.displayName || '');
    });

  // Handle user selection
  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    await loadUserProjects(user.id);
  };

  // Toggle alert sorting
  const toggleAlertSort = () => {
    setSortByAlerts(!sortByAlerts);
  };

  // Toggle admin status (for UI switching)
  const toggleAdminStatus = () => {
    setIsAdmin(!isAdmin);
    setLoading(true);
    
    // Reset states when switching modes
    setSelectedUser(null);
    setUserProjects([]);
    setCustomerProjects([]);
    setRequestedProjects([]);
    setAllUsers([]);
    
    // Load appropriate data after a brief delay
    setTimeout(() => {
      if (!isAdmin) {
        // Switching to admin mode
        loadAllUsers();
      } else {
        // Switching to user mode
        loadCustomerProjects();
        loadRequestedProjects();
      }
      setLoading(false);
    }, 100);
  };

  // Initialize data
  useEffect(() => {
    console.log('🚀 First useEffect triggered - currentUser:', !!currentUser);
    if (currentUser) {
      console.log('👤 Current user exists, checking admin status');
      checkAdminStatus();
    }
  }, [currentUser]);

  useEffect(() => {
    console.log('🚀 Second useEffect triggered');
    console.log('👤 currentUser:', !!currentUser);
    console.log('⏳ loading:', loading);
    console.log('👑 isAdmin:', isAdmin);
    
    if (currentUser && !loading) {
      console.log('✅ Conditions met, loading data...');
      
      // ALWAYS load user's own projects for the user dashboard
      // Even admins should see their own projects when using the user dashboard
      console.log('📊 Loading user\'s own customer and requested projects');
      loadCustomerProjects();
      loadRequestedProjects();
      
      // Additionally load admin data if user is admin (for management features)
      if (isAdmin) {
        console.log('👑 User is admin, also loading all users for admin features');
        loadAllUsers();
      }
    } else {
      console.log('❌ Conditions not met for data loading');
      if (!currentUser) console.log('   - No current user');
      if (loading) console.log('   - Still loading');
    }
  }, [currentUser, isAdmin, loading]);

  return {
    // States
    isAdmin,
    loading,
    customerProjects,
    requestedProjects,
    allUsers: filteredUsers,
    userProjects,
    selectedUser,
    userSearchQuery,
    sortByAlerts,
    
    // Loading states
    customerProjectsLoading,
    requestedProjectsLoading,
    usersLoading,
    
    // Actions
    setUserSearchQuery,
    handleUserSelect,
    toggleAlertSort,
    toggleAdminStatus,
    loadCustomerProjects,
    loadRequestedProjects,
    loadAllUsers
  };
}; 