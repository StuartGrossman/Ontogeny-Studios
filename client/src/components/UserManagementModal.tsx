import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import './UserManagementModal.css';

interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  isAdmin: boolean;
  createdAt: string;
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserManagementModal = ({ isOpen, onClose }: UserManagementModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;
      
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as User));
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isAdmin: !currentStatus });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: !currentStatus } : user
      ));
    } catch (error) {
      console.error('Error updating admin status:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content user-management-modal">
        <div className="modal-header">
          <h2>User Management</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="users-list">
              {users.map(user => (
                <div key={user.id} className="user-card">
                  <div className="user-info">
                    {user.photoURL && (
                      <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
                    )}
                    <div className="user-details">
                      <h3>{user.displayName}</h3>
                      <p>{user.email}</p>
                      <p className="user-date">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="user-actions">
                    <button
                      className={`admin-toggle ${user.isAdmin ? 'is-admin' : ''}`}
                      onClick={() => toggleAdmin(user.id, user.isAdmin)}
                    >
                      {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal; 