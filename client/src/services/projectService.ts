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

      let projects: ProjectData[] = [];

      try {
        // Try the optimized query with composite index first
        console.log('Attempting optimized query with composite index...');
        const q = query(
          collection(db, 'projects'),
          where('userId', '==', userId),
          where('status', 'in', ['in-progress', 'planning', 'approved']),
          orderBy('createdAt', 'desc')
        );

        console.log('Executing Firestore query for active projects from "projects" collection...');
        const querySnapshot = await getDocs(q);
        console.log('Query completed, found', querySnapshot.size, 'documents');
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Processing project:', { id: doc.id, name: data.name, status: data.status });
          projects.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
            features: data.features?.map((f: any) => ({
              ...f,
              createdAt: f.createdAt?.toDate ? f.createdAt.toDate() : f.createdAt,
              updatedAt: f.updatedAt?.toDate ? f.updatedAt.toDate() : f.createdAt
            })) || []
          } as ProjectData);
        });

        console.log('Successfully processed', projects.length, 'active projects with optimized query');
        console.log('Project names:', projects.map(p => p.name));
        return projects;

      } catch (indexError: any) {
        // If the composite index isn't ready yet, fall back to a simpler query
        if (indexError.code === 'failed-precondition' && indexError.message.includes('index')) {
          console.log('Composite index not ready, falling back to simple query...');
          
          // Fallback: Get all projects for the user and filter in memory
          const fallbackQuery = query(
            collection(db, 'projects'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
          );

          const fallbackSnapshot = await getDocs(fallbackQuery);
          console.log('Fallback query completed, found', fallbackSnapshot.size, 'documents');

          fallbackSnapshot.forEach((doc) => {
            const data = doc.data();
            // Filter for active statuses in memory
            if (['in-progress', 'planning', 'approved'].includes(data.status)) {
              console.log('Processing project (fallback):', { id: doc.id, name: data.name, status: data.status });
              projects.push({
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

          console.log('Successfully processed', projects.length, 'active projects with fallback query');
          console.log('Project names:', projects.map(p => p.name));
          return projects;
        } else {
          // Re-throw if it's not an index error
          throw indexError;
        }
      }

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