import { useState } from 'react';
import { LoginModalProps } from '../../types';
import './Modal.css';

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSignupClick, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // TODO: Implement actual login logic
      // For now, simulate a successful login
      onLoginSuccess({
        id: '1',
        name: 'Demo User',
        email: email,
        role: 'user',
      });
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Sign In</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="modal-actions">
              <button type="submit" className="button button-primary">Sign In</button>
              <button type="button" className="button" onClick={onSignupClick}>
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 