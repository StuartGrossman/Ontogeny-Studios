import React, { useState, useEffect } from 'react';
import { X, Plus, Users, UserCheck, UserX } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserAvatar } from '../../utils/avatarGenerator';
import '../../styles/ProjectTeamModal.css';

interface AdminUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: string;
}

interface ProjectAssignment {
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  assignedAt: Date;
}

interface ProjectTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onUpdate: () => void;
}

const ProjectTeamModal: React.FC<ProjectTeamModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdate
}) => {
  const [availableAdmins, setAvailableAdmins] = useState<AdminUser[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [adminTitle, setAdminTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentAssignments, setCurrentAssignments] = useState<ProjectAssignment[]>([]);

  useEffect(() => {
    if (isOpen && project) {
      fetchAvailableAdmins();
      setCurrentAssignments(project.assignments || []);
    }
  }, [isOpen, project]);

  const fetchAvailableAdmins = async () => {
    setLoading(true);
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'admin')
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      const admins = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as AdminUser));

      // Filter out already assigned admins
      const assignedUserIds = currentAssignments.map(a => a.userId);
      const available = admins.filter(admin => !assignedUserIds.includes(admin.uid));
      
      setAvailableAdmins(available);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (selectedAdmin && adminTitle.trim()) {
      const newAssignment: ProjectAssignment = {
        userId: selectedAdmin.uid,
        userName: selectedAdmin.displayName || selectedAdmin.email,
        userEmail: selectedAdmin.email,
        title: adminTitle.trim(),
        assignedAt: new Date()
      };

      const updatedAssignments = [...currentAssignments, newAssignment];
      
      try {
        await updateDoc(doc(db, 'projects', project.id), {
          assignments: updatedAssignments,
          updatedAt: new Date()
        });
        
        setCurrentAssignments(updatedAssignments);
        setSelectedAdmin(null);
        setAdminTitle('');
        onUpdate();
      } catch (error) {
        console.error('Error adding admin:', error);
      }
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    const updatedAssignments = currentAssignments.filter(a => a.userId !== userId);
    
    try {
      await updateDoc(doc(db, 'projects', project.id), {
        assignments: updatedAssignments,
        updatedAt: new Date()
      });
      
      setCurrentAssignments(updatedAssignments);
      onUpdate();
    } catch (error) {
      console.error('Error removing admin:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="project-team-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <Users size={24} />
            <div>
              <h2>Project Team Management</h2>
              <p>Manage team members for "{project?.name || project?.projectName}"</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {/* Current Team Members */}
          <div className="team-section">
            <h3>Current Team Members</h3>
            <div className="team-members-list">
              {currentAssignments.length > 0 ? (
                currentAssignments.map((assignment) => (
                  <div key={assignment.userId} className="team-member-item">
                    <div className="member-avatar">
                      <UserAvatar
                        photoURL={assignment.userEmail}
                        displayName={assignment.userName}
                        size={40}
                      />
                    </div>
                    <div className="member-info">
                      <h4>{assignment.userName}</h4>
                      <p className="member-role">{assignment.title}</p>
                      <p className="member-email">{assignment.userEmail}</p>
                    </div>
                    <div className="member-actions">
                      <button
                        onClick={() => handleRemoveAdmin(assignment.userId)}
                        className="remove-member-btn"
                        title="Remove from project"
                      >
                        <UserX size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-team-state">
                  <Users size={48} />
                  <h4>No Team Members</h4>
                  <p>No team members have been assigned to this project yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Add New Team Member */}
          <div className="add-member-section">
            <h3>Add Team Member</h3>
            {loading ? (
              <div className="loading-state">Loading available admins...</div>
            ) : availableAdmins.length === 0 ? (
              <div className="no-admins">
                <UserCheck size={48} />
                <h4>No Available Admins</h4>
                <p>All admins are already assigned to this project.</p>
              </div>
            ) : (
              <>
                <div className="admin-selection">
                  <label className="admin-label">Select Admin</label>
                  <div className="admin-list">
                    {availableAdmins.map((admin) => (
                      <div
                        key={admin.uid}
                        className={`admin-item ${selectedAdmin?.uid === admin.uid ? 'selected' : ''}`}
                        onClick={() => setSelectedAdmin(admin)}
                      >
                        <div className="admin-avatar">
                          <UserAvatar
                            photoURL={admin.photoURL}
                            displayName={admin.displayName}
                            size={32}
                          />
                        </div>
                        <div className="admin-info">
                          <div className="admin-name">{admin.displayName || 'Unnamed Admin'}</div>
                          <div className="admin-email">{admin.email}</div>
                        </div>
                        {selectedAdmin?.uid === admin.uid && (
                          <UserCheck size={16} className="admin-check" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedAdmin && (
                  <div className="role-input">
                    <label className="role-label">Role/Title</label>
                    <input
                      type="text"
                      value={adminTitle}
                      onChange={(e) => setAdminTitle(e.target.value)}
                      placeholder="e.g., Project Manager, Developer, Designer"
                      className="role-input-field"
                    />
                  </div>
                )}

                <button
                  onClick={handleAddAdmin}
                  disabled={!selectedAdmin || !adminTitle.trim()}
                  className="add-admin-btn"
                >
                  <Plus size={16} />
                  Add to Team
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTeamModal; 