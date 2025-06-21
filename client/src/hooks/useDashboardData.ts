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
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  
  // Loading states
  const [customerProjectsLoading, setCustomerProjectsLoading] = useState(true);
  const [requestedProjectsLoading, setRequestedProjectsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userProjectsLoading, setUserProjectsLoading] = useState(false);
  const [allProjectsLoading, setAllProjectsLoading] = useState(false);
  
  // User management states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [sortByAlerts, setSortByAlerts] = useState(false);

  // Check admin status
  const checkAdminStatus = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsAdmin(userData.isAdmin === true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load customer projects
  const loadCustomerProjects = async () => {
    if (!currentUser?.uid) return;
    
    setCustomerProjectsLoading(true);
    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(projectsQuery);
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      setCustomerProjects(projects);
    } catch (error) {
      console.error('Error loading customer projects:', error);
    } finally {
      setCustomerProjectsLoading(false);
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

  // Load all projects from all users (admin only)
  const loadAllProjects = async () => {
    setAllProjectsLoading(true);
    try {
      // Load both regular projects and user requests from all users
      const [projectsSnapshot, requestsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'user_project_requests'), orderBy('createdAt', 'desc')))
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

      // Combine and filter out any projects without proper IDs
      const allProjectsCombined = [...projects, ...requests].filter(p => p.id && p.id.trim());
      
      setAllProjects(allProjectsCombined as Project[]);
    } catch (error) {
      console.error('Error loading all projects:', error);
    } finally {
      setAllProjectsLoading(false);
    }
  };

  // Load user projects (admin selecting a user)
  const loadUserProjects = async (userId: string) => {
    setUserProjectsLoading(true);
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
    } finally {
      setUserProjectsLoading(false);
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
    setAllProjects([]);
    
    // Load appropriate data after a brief delay
    setTimeout(() => {
      if (!isAdmin) {
        // Switching to admin mode
        loadAllUsers();
        loadAllProjects();
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
    if (currentUser) {
      checkAdminStatus();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && !loading) {
      if (isAdmin) {
        loadAllUsers();
        loadAllProjects();
      } else {
        loadCustomerProjects();
        loadRequestedProjects();
      }
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
    allProjects,
    selectedUser,
    userSearchQuery,
    sortByAlerts,
    
    // Loading states
    customerProjectsLoading,
    requestedProjectsLoading,
    usersLoading,
    userProjectsLoading,
    allProjectsLoading,
    
    // Actions
    setUserSearchQuery,
    handleUserSelect,
    toggleAlertSort,
    toggleAdminStatus,
    loadCustomerProjects,
    loadRequestedProjects,
    loadAllUsers,
    loadAllProjects
  };
}; 