import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

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

class ProjectService {
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

  // Admin: Update project status
  async updateProjectStatus(projectId: string, status: ProjectData['status'], adminNotes?: string): Promise<void> {
    try {
      const projectRef = doc(db, 'project_requests', projectId);
      await updateDoc(projectRef, {
        status,
        adminNotes,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating project status:', error);
      throw new Error('Failed to update project status');
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
}

export const projectService = new ProjectService();
export default projectService; 