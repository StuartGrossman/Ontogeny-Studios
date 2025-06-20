import React, { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { sendMessage } from '../../services/messagingService';
import { MessageFormData } from '../../types/messaging';
import { UserAvatar } from '../../utils/avatarGenerator';
import './Modal.css';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
  };
  currentUser: {
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
  };
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  recipient,
  currentUser
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    setError('');

    try {
      const messageData: MessageFormData = {
        content: message.trim(),
        receiverId: recipient.id,
        receiverName: recipient.displayName
      };

      await sendMessage(
        messageData,
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Admin',
        currentUser.photoURL
      );

      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content send-message-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <MessageCircle size={24} className="modal-icon" />
            <div>
              <h2>Send Message</h2>
              <p>Send a direct message to {recipient.displayName}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Recipient Info */}
          <div className="recipient-info">
            <UserAvatar
              photoURL={recipient.photoURL}
              displayName={recipient.displayName}
              size={50}
              className="recipient-avatar"
            />
            <div className="recipient-details">
              <h3>{recipient.displayName}</h3>
              <p>{recipient.email}</p>
            </div>
          </div>

          {/* Message Form */}
          <form onSubmit={handleSubmit} className="message-form">
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                rows={4}
                disabled={sending}
                required
              />
              <div className="character-count">
                {message.length}/1000
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={sending || !message.trim() || message.length > 1000}
              >
                {sending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendMessageModal; 