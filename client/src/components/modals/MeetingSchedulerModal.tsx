import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle,
  Mail,
  Phone,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

interface MeetingSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (meetingData: any) => void;
  projectDetails: any;
}

const MeetingSchedulerModal: React.FC<MeetingSchedulerModalProps> = ({ 
  isOpen, 
  onClose, 
  onComplete, 
  projectDetails 
}) => {
  const [selectedOption, setSelectedOption] = useState<'meeting' | 'skip' | null>(null);
  const [meetingData, setMeetingData] = useState({
    date: '',
    time: '',
    timezone: 'EST',
    preferredContact: 'email',
    notes: ''
  });

  // Generate available time slots for the next 14 days (excluding weekends)
  const generateAvailableSlots = () => {
    const slots = [];
    const today = new Date();
    const timeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', 
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
    ];

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        slots.push({
          date: dateStr,
          displayDate: `${dayName}, ${monthDay}`,
          times: timeSlots
        });
      }
    }
    
    return slots.slice(0, 10); // Show first 10 available days
  };

  const availableSlots = generateAvailableSlots();

  const handleInputChange = (field: string, value: string) => {
    setMeetingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScheduleMeeting = () => {
    const completeMeetingData = {
      type: 'meeting',
      ...meetingData,
      projectDetails: projectDetails,
      scheduledAt: new Date(),
      status: 'scheduled'
    };
    onComplete(completeMeetingData);
  };

  const handleSkipMeeting = () => {
    const skipData = {
      type: 'skip',
      projectDetails: projectDetails,
      submittedAt: new Date(),
      status: 'submitted'
    };
    onComplete(skipData);
  };

  const canSchedule = () => {
    return meetingData.date && meetingData.time;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="meeting-scheduler-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Calendar size={24} />
            <h2>Schedule Your Consultation</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-subtitle">
          <span>Choose how you'd like to proceed with your project</span>
        </div>

        <div className="scheduler-content">
          {!selectedOption ? (
            /* Option Selection */
            <div className="option-selection">
              <h3>How would you like to proceed?</h3>
              
              <div className="options-grid">
                <div 
                  className="option-card meeting-option"
                  onClick={() => setSelectedOption('meeting')}
                >
                  <div className="option-icon">
                    <Users size={32} />
                  </div>
                  <h4>Schedule a Meeting</h4>
                  <p>
                    Meet with our sales team to discuss your project in detail, 
                    get personalized recommendations, and receive a custom quote.
                  </p>
                  <div className="option-benefits">
                    <div className="benefit-item">
                      <CheckCircle size={16} />
                      <span>Personalized consultation</span>
                    </div>
                    <div className="benefit-item">
                      <CheckCircle size={16} />
                      <span>Custom pricing</span>
                    </div>
                    <div className="benefit-item">
                      <CheckCircle size={16} />
                      <span>Technical guidance</span>
                    </div>
                  </div>
                  <button className="option-button primary">
                    Schedule Meeting
                  </button>
                </div>

                <div 
                  className="option-card skip-option"
                  onClick={() => setSelectedOption('skip')}
                >
                  <div className="option-icon">
                    <ArrowRight size={32} />
                  </div>
                  <h4>Submit Project Request</h4>
                  <p>
                    Submit your project request directly. We'll review your 
                    requirements and get back to you with next steps.
                  </p>
                  <div className="option-benefits">
                    <div className="benefit-item">
                      <CheckCircle size={16} />
                      <span>Quick submission</span>
                    </div>
                    <div className="benefit-item">
                      <CheckCircle size={16} />
                      <span>Email follow-up</span>
                    </div>
                    <div className="benefit-item">
                      <CheckCircle size={16} />
                      <span>Flexible timeline</span>
                    </div>
                  </div>
                  <button className="option-button secondary">
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          ) : selectedOption === 'meeting' ? (
            /* Meeting Scheduler */
            <div className="meeting-scheduler">
              <div className="scheduler-header">
                <button 
                  className="back-button"
                  onClick={() => setSelectedOption(null)}
                >
                  ← Back to Options
                </button>
                <h3>Schedule Your Meeting</h3>
              </div>

              <div className="scheduler-form">
                {/* Date Selection */}
                <div className="form-section">
                  <label className="form-label">
                    <Calendar size={18} />
                    Select Date
                  </label>
                  <div className="date-grid">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.date}
                        className={`date-option ${meetingData.date === slot.date ? 'selected' : ''}`}
                        onClick={() => handleInputChange('date', slot.date)}
                      >
                        {slot.displayDate}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                {meetingData.date && (
                  <div className="form-section">
                    <label className="form-label">
                      <Clock size={18} />
                      Select Time
                    </label>
                    <div className="time-grid">
                      {availableSlots
                        .find(slot => slot.date === meetingData.date)
                        ?.times.map((time) => (
                          <button
                            key={time}
                            className={`time-option ${meetingData.time === time ? 'selected' : ''}`}
                            onClick={() => handleInputChange('time', time)}
                          >
                            {time}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Contact Preferences */}
                <div className="form-section">
                  <label className="form-label">
                    <MessageSquare size={18} />
                    Preferred Contact Method
                  </label>
                  <div className="contact-options">
                    <label className="contact-option">
                      <input
                        type="radio"
                        name="contact"
                        value="email"
                        checked={meetingData.preferredContact === 'email'}
                        onChange={(e) => handleInputChange('preferredContact', e.target.value)}
                      />
                      <Mail size={16} />
                      <span>Email</span>
                    </label>
                    <label className="contact-option">
                      <input
                        type="radio"
                        name="contact"
                        value="phone"
                        checked={meetingData.preferredContact === 'phone'}
                        onChange={(e) => handleInputChange('preferredContact', e.target.value)}
                      />
                      <Phone size={16} />
                      <span>Phone</span>
                    </label>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="form-section">
                  <label className="form-label">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={meetingData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="form-textarea"
                    placeholder="Any specific topics you'd like to discuss or questions you have..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Skip Confirmation */
            <div className="skip-confirmation">
              <div className="scheduler-header">
                <button 
                  className="back-button"
                  onClick={() => setSelectedOption(null)}
                >
                  ← Back to Options
                </button>
                <h3>Submit Project Request</h3>
              </div>

              <div className="confirmation-content">
                <div className="confirmation-icon">
                  <CheckCircle size={48} />
                </div>
                <h4>Ready to Submit Your Project?</h4>
                <p>
                  We'll review your project details and get back to you within 24 hours 
                  with next steps and timeline information.
                </p>
                
                <div className="project-summary">
                  <h5>Project Summary:</h5>
                  <div className="summary-item">
                    <strong>Project:</strong> {projectDetails?.name}
                  </div>
                  <div className="summary-item">
                    <strong>Priority:</strong> {projectDetails?.priority}
                  </div>
                  <div className="summary-item">
                    <strong>Timeline:</strong> {projectDetails?.timeline}
                  </div>
                </div>

                <div className="next-steps">
                  <h5>What happens next:</h5>
                  <div className="step-item">
                    <span className="step-number">1</span>
                    <span>We'll review your project requirements</span>
                  </div>
                  <div className="step-item">
                    <span className="step-number">2</span>
                    <span>Our team will prepare a project proposal</span>
                  </div>
                  <div className="step-item">
                    <span className="step-number">3</span>
                    <span>You'll receive an email with next steps</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modal-actions">
          {selectedOption === 'meeting' ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedOption(null)}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleScheduleMeeting}
                className="btn-primary"
                disabled={!canSchedule()}
              >
                <span>Schedule Meeting</span>
                <Calendar size={16} />
              </button>
            </>
          ) : selectedOption === 'skip' ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedOption(null)}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSkipMeeting}
                className="btn-primary"
              >
                <span>Submit Project</span>
                <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingSchedulerModal; 