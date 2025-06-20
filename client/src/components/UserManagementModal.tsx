import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserAvatar } from '../utils/avatarGenerator';
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
  onClose: () => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="card-header">
          <h2>User Management</h2>
          <button onClick={onClose} className="button button-icon">×</button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center">Loading users...</div>
          ) : (
            <div className="user-list">
              {users.map(user => (
                <div key={user.id} className="user-card">
                  <div className="user-info">
                    <UserAvatar
                      photoURL={user.photoURL}
                      displayName={user.displayName}
                      size={40}
                      className="user-avatar"
                    />
                    <div>
                      <h3 className="user-name">{user.displayName}</h3>
                      <p className="user-email">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                    className={`button ${user.isAdmin ? 'button-secondary' : 'button-primary'}`}
                  >
                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                  </button>
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