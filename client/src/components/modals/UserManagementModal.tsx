import { useState, useEffect } from 'react';
import { UserManagementModalProps, User } from '../../types';
import './Modal.css';

const UserManagementModal: React.FC<UserManagementModalProps> = ({ onClose, onUpdateSuccess }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement actual user fetching logic
    // For now, use sample data
    setUsers([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'admin',
      },
    ]);
    setLoading(false);
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      // TODO: Implement actual role update logic
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
      onUpdateSuccess();
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-content">
            <div className="loading">Loading users...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>User Management</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}
          <div className="user-list">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                        className="role-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-actions">
            <button className="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal; 