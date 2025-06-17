import React, { useState, useEffect } from 'react';
import '../styles/SchedulingDashboard.css';

interface SchedulingDashboardProps {
  view?: 'desktop' | 'mobile';
}

interface Staff {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'busy' | 'off';
  location: string;
  avatar: string;
}

interface Appointment {
  id: string;
  title: string;
  client: string;
  staffId: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: string;
  location: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance';
  location: string;
  utilization: number;
}

const SchedulingDashboard: React.FC<SchedulingDashboardProps> = ({ view = 'desktop' }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedView, setSelectedView] = useState<'calendar' | 'staff' | 'resources' | 'analytics'>('calendar');
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

  // Mock data
  const staff: Staff[] = [
    { id: '1', name: 'Sarah Johnson', role: 'Senior Consultant', status: 'available', location: 'NYC Office', avatar: '👩‍💼' },
    { id: '2', name: 'Mike Chen', role: 'Project Manager', status: 'busy', location: 'LA Office', avatar: '👨‍💻' },
    { id: '3', name: 'Emily Davis', role: 'Specialist', status: 'available', location: 'Remote', avatar: '👩‍🔬' },
    { id: '4', name: 'David Wilson', role: 'Team Lead', status: 'off', location: 'Chicago Office', avatar: '👨‍💼' },
    { id: '5', name: 'Lisa Brown', role: 'Consultant', status: 'available', location: 'NYC Office', avatar: '👩‍💻' },
  ];

  const appointments: Appointment[] = [
    { id: '1', title: 'Client Strategy Meeting', client: 'TechCorp Inc', staffId: '1', startTime: '09:00', endTime: '10:30', status: 'scheduled', type: 'Meeting', location: 'Conference Room A' },
    { id: '2', title: 'Project Review', client: 'Global Solutions', staffId: '2', startTime: '11:00', endTime: '12:00', status: 'in-progress', type: 'Review', location: 'Virtual' },
    { id: '3', title: 'Training Session', client: 'StartupXYZ', staffId: '3', startTime: '14:00', endTime: '16:00', status: 'scheduled', type: 'Training', location: 'Training Room B' },
    { id: '4', title: 'Consultation', client: 'Enterprise Co', staffId: '1', startTime: '16:30', endTime: '17:30', status: 'scheduled', type: 'Consultation', location: 'Office 205' },
  ];

  const resources: Resource[] = [
    { id: '1', name: 'Conference Room A', type: 'Meeting Room', status: 'occupied', location: 'Floor 3', utilization: 85 },
    { id: '2', name: 'Training Room B', type: 'Training Room', status: 'available', location: 'Floor 2', utilization: 60 },
    { id: '3', name: 'Video Studio', type: 'Recording Studio', status: 'maintenance', location: 'Floor 1', utilization: 0 },
    { id: '4', name: 'Workstation Bank', type: 'Workstations', status: 'available', location: 'Floor 4', utilization: 45 },
  ];

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'busy': case 'occupied': return '#f59e0b';
      case 'off': case 'maintenance': return '#ef4444';
      case 'in-progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const CalendarView = () => (
    <div className="calendar-section">
      <div className="calendar-header">
        <div className="date-navigation">
          <button className="nav-btn">‹</button>
          <h3>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
          <button className="nav-btn">›</button>
        </div>
        <div className="view-controls">
          <button className="view-btn active">Day</button>
          <button className="view-btn">Week</button>
          <button className="view-btn">Month</button>
        </div>
      </div>
      
      <div className="calendar-grid">
        <div className="time-column">
          {timeSlots.map(time => (
            <div key={time} className="time-slot">{time}</div>
          ))}
        </div>
        
        <div className="appointments-column">
          {timeSlots.map(time => {
            const appointment = appointments.find(apt => apt.startTime === time);
            return (
              <div key={time} className="appointment-slot">
                {appointment && (
                  <div className={`appointment ${appointment.status}`}>
                    <div className="appointment-title">{appointment.title}</div>
                    <div className="appointment-client">{appointment.client}</div>
                    <div className="appointment-time">{appointment.startTime} - {appointment.endTime}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const StaffView = () => (
    <div className="staff-section">
      <div className="staff-header">
        <h3>Staff Management</h3>
        <button className="add-btn">+ Add Staff</button>
      </div>
      
      <div className="staff-grid">
        {staff.map(member => (
          <div key={member.id} className={`staff-card ${selectedStaff === member.id ? 'selected' : ''}`}
               onClick={() => setSelectedStaff(member.id)}>
            <div className="staff-avatar">{member.avatar}</div>
            <div className="staff-info">
              <h4>{member.name}</h4>
              <p className="staff-role">{member.role}</p>
              <p className="staff-location">{member.location}</p>
              <div className="staff-status">
                <span className="status-indicator" style={{ backgroundColor: getStatusColor(member.status) }}></span>
                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
              </div>
            </div>
            <div className="staff-actions">
              <button className="action-btn">📅</button>
              <button className="action-btn">✏️</button>
            </div>
          </div>
        ))}
      </div>
      
      {selectedStaff && (
        <div className="staff-schedule">
          <h4>Today's Schedule - {staff.find(s => s.id === selectedStaff)?.name}</h4>
          <div className="schedule-list">
            {appointments.filter(apt => apt.staffId === selectedStaff).map(apt => (
              <div key={apt.id} className="schedule-item">
                <div className="schedule-time">{apt.startTime} - {apt.endTime}</div>
                <div className="schedule-details">
                  <div className="schedule-title">{apt.title}</div>
                  <div className="schedule-client">{apt.client}</div>
                </div>
                <div className={`schedule-status ${apt.status}`}>{apt.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const ResourcesView = () => (
    <div className="resources-section">
      <div className="resources-header">
        <h3>Resource Management</h3>
        <button className="add-btn">+ Add Resource</button>
      </div>
      
      <div className="resources-grid">
        {resources.map(resource => (
          <div key={resource.id} className="resource-card">
            <div className="resource-header">
              <h4>{resource.name}</h4>
              <div className={`resource-status ${resource.status}`}>
                <span className="status-indicator" style={{ backgroundColor: getStatusColor(resource.status) }}></span>
                {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
              </div>
            </div>
            <div className="resource-details">
              <p><strong>Type:</strong> {resource.type}</p>
              <p><strong>Location:</strong> {resource.location}</p>
              <div className="utilization">
                <label>Utilization: {resource.utilization}%</label>
                <div className="utilization-bar">
                  <div className="utilization-fill" style={{ width: `${resource.utilization}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AnalyticsView = () => (
    <div className="analytics-section">
      <div className="analytics-header">
        <h3>Analytics & Insights</h3>
        <select className="period-select">
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h4>Utilization Rate</h4>
            <div className="metric-value">87%</div>
            <div className="metric-change positive">+5% from yesterday</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h4>Active Staff</h4>
            <div className="metric-value">12/15</div>
            <div className="metric-change neutral">3 on leave</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">⏰</div>
          <div className="metric-content">
            <h4>Avg. Appointment Duration</h4>
            <div className="metric-value">1.2h</div>
            <div className="metric-change negative">-0.2h from last week</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <h4>On-Time Rate</h4>
            <div className="metric-value">94%</div>
            <div className="metric-change positive">+2% from last week</div>
          </div>
        </div>
      </div>
      
      <div className="charts-section">
        <div className="chart-card">
          <h4>Weekly Schedule Overview</h4>
          <div className="chart-placeholder">
            <div className="chart-bars">
              <div className="bar" style={{ height: '60%' }}>Mon</div>
              <div className="bar" style={{ height: '80%' }}>Tue</div>
              <div className="bar" style={{ height: '70%' }}>Wed</div>
              <div className="bar" style={{ height: '90%' }}>Thu</div>
              <div className="bar" style={{ height: '85%' }}>Fri</div>
              <div className="bar" style={{ height: '40%' }}>Sat</div>
              <div className="bar" style={{ height: '20%' }}>Sun</div>
            </div>
          </div>
        </div>
        
        <div className="chart-card">
          <h4>Resource Utilization</h4>
          <div className="chart-placeholder">
            <div className="pie-chart">
              <div className="pie-segment" style={{ background: 'conic-gradient(#10b981 0deg 200deg, #f59e0b 200deg 280deg, #ef4444 280deg 360deg)' }}></div>
              <div className="pie-center">75%</div>
            </div>
            <div className="pie-legend">
              <div className="legend-item"><span style={{ backgroundColor: '#10b981' }}></span> Available</div>
              <div className="legend-item"><span style={{ backgroundColor: '#f59e0b' }}></span> Occupied</div>
              <div className="legend-item"><span style={{ backgroundColor: '#ef4444' }}></span> Maintenance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`scheduling-dashboard ${view}`}>
      <div className="dashboard-header">
        <h2>Enterprise Scheduling System</h2>
        <div className="header-actions">
          <button className="action-button">🔄 Sync Calendar</button>
          <button className="action-button primary">+ New Appointment</button>
        </div>
      </div>
      
      <div className="dashboard-nav">
        <button 
          className={`nav-item ${selectedView === 'calendar' ? 'active' : ''}`}
          onClick={() => setSelectedView('calendar')}
        >
          📅 Calendar
        </button>
        <button 
          className={`nav-item ${selectedView === 'staff' ? 'active' : ''}`}
          onClick={() => setSelectedView('staff')}
        >
          👥 Staff
        </button>
        <button 
          className={`nav-item ${selectedView === 'resources' ? 'active' : ''}`}
          onClick={() => setSelectedView('resources')}
        >
          🏢 Resources
        </button>
        <button 
          className={`nav-item ${selectedView === 'analytics' ? 'active' : ''}`}
          onClick={() => setSelectedView('analytics')}
        >
          📊 Analytics
        </button>
      </div>
      
      <div className="dashboard-content">
        {selectedView === 'calendar' && <CalendarView />}
        {selectedView === 'staff' && <StaffView />}
        {selectedView === 'resources' && <ResourcesView />}
        {selectedView === 'analytics' && <AnalyticsView />}
      </div>
    </div>
  );
};

export default SchedulingDashboard; 