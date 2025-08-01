import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Project Service for server-side project management operations
const API_BASE_URL = 'http://localhost:3002/api';

export interface Feature {
  id: string;
  title: string;
  description: string;
  category: 'Core Functionality' | 'User Interface' | 'Integration' | 'Security' | 'Performance' | 'Analytics' | 'Communication';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  complexity: 'Simple' | 'Moderate' | 'Complex';
  timeEstimate: number; // in hours
  status: 'pending' | 'approved' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt?: Date;
  adminNotes?: string;
  estimatedCost?: number;
}

export interface ProjectData {
  id?: string;
  name: string;
  description: string;
  features: Feature[];
  totalTimeEstimate: number;
  estimatedCost: number;
  timeline: string;
  status: 'pending' | 'under-review' | 'approved' | 'in-progress' | 'completed' | 'rejected';
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
  userEmail: string;
  adminAssigned?: string;
  adminNotes?: string;
  meetingScheduled?: boolean;
  priority: 'high' | 'medium' | 'low';
  createdBy?: string;
  type?: string;
  // Subscription fields
  subscriptionAmount?: number;
  subscriptionCurrency?: string;
  subscriptionStatus?: string;
  subscriptionSetupAt?: Date;
}

interface ProjectStatusUpdateRequest {
  projectId: string;
  newStatus: string;
  currentUser: {
    uid: string;
    displayName?: string;
    email?: string;
  };
}

interface BulkStatusUpdateRequest {
  projectIds: string[];
  newStatus: string;
  currentUser: {
    uid: string;
    displayName?: string;
    email?: string;
  };
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  adminProjectId?: string;
  results?: any[];
}

class ProjectService {
  // ===== CLIENT-SIDE FIRESTORE METHODS =====
  
  // Submit a new project request
  async submitProjectRequest(projectData: Omit<ProjectData, 'id' | 'createdAt' | 'status' | 'userId' | 'userEmail'>, userId: string, userEmail: string): Promise<string> {
    try {
      const newProject: Omit<ProjectData, 'id'> = {
        ...projectData,
        status: 'pending',
        createdAt: new Date(),
        userId,
        userEmail,
        priority: this.calculateProjectPriority(projectData.features)
      };

      // Convert dates to Firestore timestamps
      const firestoreProject = {
        ...newProject,
        createdAt: Timestamp.fromDate(newProject.createdAt),
        features: newProject.features.map(feature => ({
          ...feature,
          createdAt: Timestamp.fromDate(feature.createdAt),
          estimatedCost: feature.timeEstimate * 75 // $75/hour
        }))
      };

      const docRef = await addDoc(collection(db, 'project_requests'), firestoreProject);
      
      // Also store features separately for admin management
      await this.storeProjectFeatures(docRef.id, newProject.features);
      
      return docRef.id;
    } catch (error) {
      console.error('Error submitting project request:', error);
      throw new Error('Failed to submit project request');
    }
  }

  // Store features separately for admin management
  private async storeProjectFeatures(projectId: string, features: Feature[]): Promise<void> {
    try {
      const batch = features.map(feature => {
        const featureData = {
          ...feature,
          projectId,
          createdAt: Timestamp.fromDate(feature.createdAt),
          estimatedCost: feature.timeEstimate * 75
        };
        return addDoc(collection(db, 'project_features'), featureData);
      });

      await Promise.all(batch);
    } catch (error) {
      console.error('Error storing project features:', error);
      throw error;
    }
  }

  // Calculate project priority based on features
  private calculateProjectPriority(features: Feature[]): 'high' | 'medium' | 'low' {
    const criticalCount = features.filter(f => f.priority === 'Critical').length;
    const highCount = features.filter(f => f.priority === 'High').length;
    const totalHours = features.reduce((sum, f) => sum + f.timeEstimate, 0);

    if (criticalCount >= 3 || totalHours > 200) return 'high';
    if (criticalCount >= 1 || highCount >= 3 || totalHours > 80) return 'medium';
    return 'low';
  }

  // Get user's project requests
  async getUserProjectRequests(userId: string): Promise<ProjectData[]> {
    try {
      const q = query(
        collection(db, 'project_requests'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const projects: ProjectData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          features: data.features.map((f: any) => ({
            ...f,
            createdAt: f.createdAt.toDate(),
            updatedAt: f.updatedAt?.toDate()
          }))
        } as ProjectData);
      });

      return projects;
    } catch (error) {
      console.error('Error fetching user project requests:', error);
      throw new Error('Failed to fetch project requests');
    }
  }

  // Get active projects (in-progress and approved)
  async getActiveProjects(userId: string): Promise<ProjectData[]> {
    try {
      console.log('getActiveProjects called with userId:', userId);
      
      if (!userId) {
        console.error('getActiveProjects: userId is required');
        throw new Error('User ID is required');
      }

      let allProjects: ProjectData[] = [];

      // 1. Fetch from 'projects' collection (active/approved projects)
      // - Projects where user is the owner (userId matches)
      // - Projects where user is the admin who created them (createdBy matches)
      try {
        console.log('Fetching from projects collection...');
        
        // First, get projects where user is the owner
        const userProjectsQuery = query(
          collection(db, 'projects'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const userProjectsSnapshot = await getDocs(userProjectsQuery);
        console.log('User-owned projects: found', userProjectsSnapshot.size, 'documents');
        
        userProjectsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Processing user-owned project:', { id: doc.id, name: data.name, status: data.status });
          allProjects.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
            features: data.features?.map((f: any) => ({
              ...f,
              createdAt: f.createdAt?.toDate ? f.createdAt.toDate() : f.createdAt,
              updatedAt: f.updatedAt?.toDate ? f.updatedAt.toDate() : f.updatedAt
            })) || []
          } as ProjectData);
        });

        // Then, get projects where user is the admin who created them
        const adminProjectsQuery = query(
          collection(db, 'projects'),
          where('createdBy', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const adminProjectsSnapshot = await getDocs(adminProjectsQuery);
        console.log('Admin-created projects: found', adminProjectsSnapshot.size, 'documents');
        
        adminProjectsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Processing admin-created project:', { id: doc.id, name: data.name, status: data.status, userId: data.userId, userEmail: data.userEmail });
          allProjects.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
            features: data.features?.map((f: any) => ({
              ...f,
              createdAt: f.createdAt?.toDate ? f.createdAt.toDate() : f.createdAt,
              updatedAt: f.updatedAt?.toDate ? f.updatedAt.toDate() : f.updatedAt
            })) || []
          } as ProjectData);
        });

        // Also check if there are any projects for user "adfa" that the current user should see
        // This is a temporary debug measure to see if the projects exist
        try {
          const adfaProjectsQuery = query(
            collection(db, 'projects'),
            where('userId', '==', 'adfa'),
            orderBy('createdAt', 'desc')
          );
          
          const adfaProjectsSnapshot = await getDocs(adfaProjectsQuery);
          console.log('Projects for user "adfa": found', adfaProjectsSnapshot.size, 'documents');
          
          adfaProjectsSnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Found project for user "adfa":', { id: doc.id, name: data.name, status: data.status, createdBy: data.createdBy });
            
            // If the current user is an admin, include these projects in the dropdown
            // This is a temporary solution to show the projects you mentioned
            if (data.createdBy === userId || data.type === 'admin-created') {
              console.log('Adding adfa project to dropdown for admin user');
              allProjects.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
                features: data.features?.map((f: any) => ({
                  ...f,
                  createdAt: f.createdAt?.toDate ? f.createdAt.toDate() : f.createdAt,
                  updatedAt: f.updatedAt?.toDate ? f.updatedAt.toDate() : f.updatedAt
                })) || []
              } as ProjectData);
            }
          });
        } catch (error) {
          console.log('Error checking adfa projects:', error);
        }
      } catch (error) {
        console.error('Error fetching from projects collection:', error);
      }

      // 2. Fetch from 'project_requests' collection (pending requests)
      try {
        console.log('Fetching from project_requests collection...');
        const requestsQuery = query(
          collection(db, 'project_requests'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const requestsSnapshot = await getDocs(requestsQuery);
        console.log('Project_requests collection: found', requestsSnapshot.size, 'documents');
        
        requestsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Processing project from project_requests collection:', { id: doc.id, name: data.name, status: data.status });
          allProjects.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
            features: data.features?.map((f: any) => ({
              ...f,
              createdAt: f.createdAt?.toDate ? f.createdAt.toDate() : f.createdAt,
              updatedAt: f.updatedAt?.toDate ? f.updatedAt.toDate() : f.updatedAt
            })) || []
          } as ProjectData);
        });
      } catch (error) {
        console.error('Error fetching from project_requests collection:', error);
      }

      // 3. Fetch from 'user_project_requests' collection (user requests)
      try {
        console.log('Fetching from user_project_requests collection...');
        const userRequestsQuery = query(
          collection(db, 'user_project_requests'),
          where('requestedBy', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const userRequestsSnapshot = await getDocs(userRequestsQuery);
        console.log('User_project_requests collection: found', userRequestsSnapshot.size, 'documents');
        
        userRequestsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Processing project from user_project_requests collection:', { id: doc.id, name: data.name || data.projectName, status: data.status });
          allProjects.push({
            id: doc.id,
            name: data.name || data.projectName,
            description: data.description || '',
            features: data.features || [],
            totalTimeEstimate: data.totalTimeEstimate || 0,
            estimatedCost: data.estimatedCost || 0,
            timeline: data.timeline || '',
            status: data.status || 'pending',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
            userId: data.requestedBy || userId,
            userEmail: data.userEmail || '',
            priority: data.priority || 'medium'
          } as ProjectData);
        });
      } catch (error) {
        console.error('Error fetching from user_project_requests collection:', error);
      }

      // Sort all projects by creation date (newest first)
      allProjects.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      console.log('✅ Successfully processed', allProjects.length, 'total projects from all collections');
      console.log('Project names:', allProjects.map(p => p.name));
      console.log('Project statuses:', allProjects.map(p => p.status));
      
      // If no projects found and user might be admin, try to get all projects
      if (allProjects.length === 0) {
        console.log('No projects found, checking if user is admin and should see all projects...');
        try {
          const allProjectsQuery = query(
            collection(db, 'projects'),
            orderBy('createdAt', 'desc')
          );
          
          const allProjectsSnapshot = await getDocs(allProjectsQuery);
          console.log('All projects in database:', allProjectsSnapshot.size, 'documents');
          
          allProjectsSnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Available project:', { id: doc.id, name: data.name, status: data.status, userId: data.userId, createdBy: data.createdBy });
          });
        } catch (error) {
          console.log('Error fetching all projects:', error);
        }
      }
      
      return allProjects;

    } catch (error: any) {
      console.error('Error fetching active projects:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw new Error('Failed to fetch active projects');
    }
  }

  // Get project features for admin review
  async getProjectFeatures(projectId: string): Promise<Feature[]> {
    try {
      const q = query(
        collection(db, 'project_features'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const features: Feature[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        features.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Feature);
      });

      return features;
    } catch (error) {
      console.error('Error fetching project features:', error);
      throw new Error('Failed to fetch project features');
    }
  }

  // Admin: Update feature status
  async updateFeatureStatus(featureId: string, status: Feature['status'], adminNotes?: string): Promise<void> {
    try {
      const featureRef = doc(db, 'project_features', featureId);
      await updateDoc(featureRef, {
        status,
        adminNotes,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating feature status:', error);
      throw new Error('Failed to update feature status');
    }
  }

  // Admin: Get all pending project requests
  async getPendingProjectRequests(): Promise<ProjectData[]> {
    try {
      const q = query(
        collection(db, 'project_requests'),
        where('status', 'in', ['pending', 'under-review']),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const projects: ProjectData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          features: data.features.map((f: any) => ({
            ...f,
            createdAt: f.createdAt.toDate(),
            updatedAt: f.updatedAt?.toDate()
          }))
        } as ProjectData);
      });

      return projects;
    } catch (error) {
      console.error('Error fetching pending project requests:', error);
      throw new Error('Failed to fetch pending project requests');
    }
  }

  // Get project analytics
  async getProjectAnalytics(projectId: string): Promise<{
    totalFeatures: number;
    completedFeatures: number;
    inProgressFeatures: number;
    pendingFeatures: number;
    totalEstimatedHours: number;
    totalEstimatedCost: number;
    averageComplexity: string;
  }> {
    try {
      const features = await this.getProjectFeatures(projectId);
      
      const totalFeatures = features.length;
      const completedFeatures = features.filter(f => f.status === 'completed').length;
      const inProgressFeatures = features.filter(f => f.status === 'in-progress').length;
      const pendingFeatures = features.filter(f => f.status === 'pending').length;
      const totalEstimatedHours = features.reduce((sum, f) => sum + f.timeEstimate, 0);
      const totalEstimatedCost = features.reduce((sum, f) => sum + (f.estimatedCost || 0), 0);
      
      // Calculate average complexity
      const complexityScores = features.map(f => {
        switch (f.complexity) {
          case 'Simple': return 1;
          case 'Moderate': return 2;
          case 'Complex': return 3;
          default: return 2;
        }
      });
      const avgComplexityScore = complexityScores.reduce((sum, score) => sum + score, 0) / complexityScores.length;
      const averageComplexity = avgComplexityScore <= 1.5 ? 'Simple' : avgComplexityScore <= 2.5 ? 'Moderate' : 'Complex';

      return {
        totalFeatures,
        completedFeatures,
        inProgressFeatures,
        pendingFeatures,
        totalEstimatedHours,
        totalEstimatedCost,
        averageComplexity
      };
    } catch (error) {
      console.error('Error fetching project analytics:', error);
      throw new Error('Failed to fetch project analytics');
    }
  }

  // ===== SERVER-SIDE API METHODS =====

  /**
   * Update a single project request status
   */
  async updateProjectStatus(request: ProjectStatusUpdateRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/update-request-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update project status');
      }

      return data;
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  }

  /**
   * Update multiple project request statuses
   */
  async bulkUpdateProjectStatus(request: BulkStatusUpdateRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/bulk-update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to bulk update project statuses');
      }

      return data;
    } catch (error) {
      console.error('Error bulk updating project statuses:', error);
      throw error;
    }
  }

  /**
   * Get admin project by original request ID
   */
  async getAdminProjectByRequestId(requestId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/admin-project/${requestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get admin project');
      }

      return data;
    } catch (error) {
      console.error('Error getting admin project:', error);
      throw error;
    }
  }

  /**
   * Helper method to accept a project (sets status to 'accepted')
   */
  async acceptProject(projectId: string, currentUser: any): Promise<ApiResponse> {
    return this.updateProjectStatus({
      projectId,
      newStatus: 'accepted',
      currentUser: {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
      },
    });
  }

  /**
   * Helper method to start a project (sets status to 'in-progress')
   */
  async startProject(projectId: string, currentUser: any): Promise<ApiResponse> {
    return this.updateProjectStatus({
      projectId,
      newStatus: 'in-progress',
      currentUser: {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
      },
    });
  }

  /**
   * Helper method to reject a project (sets status to 'rejected')
   */
  async rejectProject(projectId: string, currentUser: any): Promise<ApiResponse> {
    return this.updateProjectStatus({
      projectId,
      newStatus: 'rejected',
      currentUser: {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
      },
    });
  }

  /**
   * Helper method to complete a project (sets status to 'completed')
   */
  async completeProject(projectId: string, currentUser: any): Promise<ApiResponse> {
    return this.updateProjectStatus({
      projectId,
      newStatus: 'completed',
      currentUser: {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
      },
    });
  }

  /**
   * Helper method to put a project under review (sets status to 'under-review')
   */
  async putProjectUnderReview(projectId: string, currentUser: any): Promise<ApiResponse> {
    return this.updateProjectStatus({
      projectId,
      newStatus: 'under-review',
      currentUser: {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
      },
    });
  }

  /**
   * Bulk accept multiple projects
   */
  async bulkAcceptProjects(projectIds: string[], currentUser: any): Promise<ApiResponse> {
    return this.bulkUpdateProjectStatus({
      projectIds,
      newStatus: 'accepted',
      currentUser: {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
      },
    });
  }

  /**
   * Bulk start multiple projects
   */
  async bulkStartProjects(projectIds: string[], currentUser: any): Promise<ApiResponse> {
    return this.bulkUpdateProjectStatus({
      projectIds,
      newStatus: 'in-progress',
      currentUser: {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
      },
    });
  }
}

// Export singleton instance
export const projectService = new ProjectService();
export default projectService;

// Export individual functions for direct use
export const getActiveProjects = (userId: string) => projectService.getActiveProjects(userId); 