// Project Service for server-side project management operations
const API_BASE_URL = 'http://localhost:3002/api';

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