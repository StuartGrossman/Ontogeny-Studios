import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Users, 
  Clock, 
  Plus,
  Settings,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Edit3,
  Trash2,
  Eye,
  UserPlus,
  CalendarPlus,
  Building2,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Timer,
  User,
  Filter,
  Search,
  RefreshCw,
  Download,
  Upload,
  Bell,
  Star,
  DollarSign,
  Target,
  Zap,
  Briefcase,
  PieChart,
  LineChart
} from 'lucide-react';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, where, orderBy, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import '../styles/SchedulingDashboard.css';

interface SchedulingDashboardProps {
  view?: 'desktop' | 'mobile';
}

interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'available' | 'busy' | 'off' | 'away';
  location: string;
  skills: string[];
  rating: number;
  totalAppointments: number;
  hoursWorked: number;
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  id: string;
  title: string;
  description: string;
  client: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  staffId: string;
  startTime: string;
  endTime: string;
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  type: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  estimatedDuration: number;
  actualDuration?: number;
  createdAt: string;
  updatedAt: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  location: string;
  capacity: number;
  utilization: number;
  equipment: string[];
  bookings: any[];
  maintenanceSchedule?: string;
  createdAt: string;
  updatedAt: string;
}

const SchedulingDashboard: React.FC<SchedulingDashboardProps> = ({ view = 'desktop' }) => {
  const { currentUser } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedView, setSelectedView] = useState<'dashboard' | 'analytics'>('dashboard');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [demoMode, setDemoMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  
  // Modal states
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  // Check admin status on load
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) return;
      
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.isAdmin || false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  // Toggle admin status
  const toggleAdminStatus = async () => {
    if (!currentUser || adminLoading) return;
    
    setAdminLoading(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const newAdminStatus = !isAdmin;
      
      await setDoc(userDocRef, {
        email: currentUser.email,
        displayName: currentUser.displayName,
        isAdmin: newAdminStatus,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setIsAdmin(newAdminStatus);
      console.log(`Admin status changed to: ${newAdminStatus}`);
    } catch (error) {
      console.error('Error toggling admin status:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  // Generate comprehensive demo data
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Create rich demo data
    const demoStaff: Staff[] = [
      { id: '1', name: 'Sarah Johnson', role: 'Senior Consultant', email: 'sarah@company.com', phone: '(555) 0101', status: 'available', location: 'NYC Office', skills: ['Leadership', 'Strategy'], rating: 4.8, totalAppointments: 47, hoursWorked: 168, createdAt: '2024-01-01', updatedAt: '2024-01-15' },
      { id: '2', name: 'Michael Chen', role: 'Technical Lead', email: 'michael@company.com', phone: '(555) 0102', status: 'busy', location: 'SF Office', skills: ['Development', 'Architecture'], rating: 4.9, totalAppointments: 52, hoursWorked: 184, createdAt: '2024-01-01', updatedAt: '2024-01-15' },
      { id: '3', name: 'Emily Rodriguez', role: 'Project Manager', email: 'emily@company.com', phone: '(555) 0103', status: 'available', location: 'Remote', skills: ['Planning', 'Communication'], rating: 4.7, totalAppointments: 38, hoursWorked: 156, createdAt: '2024-01-01', updatedAt: '2024-01-15' },
      { id: '4', name: 'David Kim', role: 'Designer', email: 'david@company.com', phone: '(555) 0104', status: 'off', location: 'LA Office', skills: ['UX/UI', 'Research'], rating: 4.6, totalAppointments: 29, hoursWorked: 142, createdAt: '2024-01-01', updatedAt: '2024-01-15' },
      { id: '5', name: 'Lisa Wang', role: 'Data Analyst', email: 'lisa@company.com', phone: '(555) 0105', status: 'available', location: 'Chicago Office', skills: ['Analytics', 'Reporting'], rating: 4.8, totalAppointments: 41, hoursWorked: 172, createdAt: '2024-01-01', updatedAt: '2024-01-15' }
    ];

    const demoAppointments: Appointment[] = [
      { id: '1', title: 'Client Strategy Review', description: 'Quarterly business review', client: { name: 'John Smith', email: 'john@client.com', phone: '(555) 1001', company: 'TechCorp' }, staffId: '1', startTime: '09:00', endTime: '10:30', date: selectedDate, status: 'scheduled', type: 'meeting', location: 'Conference Room A', priority: 'high', estimatedDuration: 90, createdAt: '2024-01-01', updatedAt: '2024-01-15' },
      { id: '2', title: 'System Architecture Planning', description: 'Technical architecture discussion', client: { name: 'Alice Brown', email: 'alice@startup.com', phone: '(555) 1002', company: 'StartupXYZ' }, staffId: '2', startTime: '11:00', endTime: '12:00', date: selectedDate, status: 'in-progress', type: 'consultation', location: 'Virtual', priority: 'urgent', estimatedDuration: 60, createdAt: '2024-01-01', updatedAt: '2024-01-15' },
      { id: '3', title: 'Project Kickoff', description: 'New project initiation meeting', client: { name: 'Robert Wilson', email: 'robert@enterprise.com', phone: '(555) 1003', company: 'Enterprise Ltd' }, staffId: '3', startTime: '14:00', endTime: '15:30', date: selectedDate, status: 'completed', type: 'workshop', location: 'Conference Room B', priority: 'medium', estimatedDuration: 90, actualDuration: 85, createdAt: '2024-01-01', updatedAt: '2024-01-15' }
    ];

    const demoResources: Resource[] = [
      { id: '1', name: 'Conference Room A', type: 'meeting_room', status: 'occupied', location: 'Floor 12', capacity: 8, utilization: 85, equipment: ['Projector', 'Whiteboard', 'Video Conf'], bookings: [], createdAt: '2024-01-01', updatedAt: '2024-01-15' },
      { id: '2', name: 'Conference Room B', type: 'meeting_room', status: 'available', location: 'Floor 12', capacity: 12, utilization: 65, equipment: ['Smart Board', 'Video Conf', 'Audio System'], bookings: [], createdAt: '2024-01-01', updatedAt: '2024-01-15' },
      { id: '3', name: 'Workshop Space', type: 'workshop', status: 'available', location: 'Floor 10', capacity: 20, utilization: 45, equipment: ['Modular Furniture', 'Flip Charts', 'Collaboration Tools'], bookings: [], createdAt: '2024-01-01', updatedAt: '2024-01-15' },
      { id: '4', name: 'Executive Boardroom', type: 'boardroom', status: 'reserved', location: 'Floor 15', capacity: 16, utilization: 92, equipment: ['Premium AV', 'Executive Seating', 'Smart Glass'], bookings: [], createdAt: '2024-01-01', updatedAt: '2024-01-15' }
    ];

    setStaff(demoStaff);
    setAppointments(demoAppointments);
    setResources(demoResources);
    setLoading(false);
  }, [currentUser, selectedDate]);

  // Computed values for metrics
  const todaysAppointments = appointments.filter(apt => apt.date === selectedDate);
  const completedToday = todaysAppointments.filter(apt => apt.status === 'completed').length;
  const scheduledToday = todaysAppointments.filter(apt => apt.status === 'scheduled').length;
  const inProgressToday = todaysAppointments.filter(apt => apt.status === 'in-progress').length;
  const availableStaff = staff.filter(member => member.status === 'available').length;
  const busyStaff = staff.filter(member => member.status === 'busy').length;
  const offStaff = staff.filter(member => member.status === 'off').length;
  const availableResources = resources.filter(resource => resource.status === 'available').length;
  const avgUtilization = resources.length > 0 ? resources.reduce((sum, r) => sum + r.utilization, 0) / resources.length : 0;
  const avgRating = staff.length > 0 ? staff.reduce((sum, s) => sum + s.rating, 0) / staff.length : 0;
  const totalRevenue = 47200; // Demo revenue
  const weeklyGrowth = 12; // Demo growth percentage

  // Dashboard View Component
  const DashboardView = () => (
    <div className="dashboard-section">
      {/* Enhanced Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <Calendar className="metric-icon" size={24} style={{ color: '#8b5cf6' }} />
            <span className="metric-change positive">+{scheduledToday}</span>
          </div>
          <div className="metric-value">{todaysAppointments.length}</div>
          <div className="metric-title">Today's Appointments</div>
          <div className="metric-subtitle">{completedToday} completed • {inProgressToday} active</div>
          <div className="mini-chart">
            <div className="progress-segments">
              <div className="segment completed" style={{ width: `${(completedToday / todaysAppointments.length) * 100 || 0}%` }}></div>
              <div className="segment in-progress" style={{ width: `${(inProgressToday / todaysAppointments.length) * 100 || 0}%` }}></div>
              <div className="segment scheduled" style={{ width: `${(scheduledToday / todaysAppointments.length) * 100 || 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Users className="metric-icon" size={24} style={{ color: '#10b981' }} />
            <span className="metric-change neutral">{availableStaff}/{staff.length}</span>
          </div>
          <div className="metric-value">{staff.length}</div>
          <div className="metric-title">Team Members</div>
          <div className="metric-subtitle">{availableStaff} available • {staff.reduce((sum, s) => sum + s.hoursWorked, 0)}h total</div>
          <div className="mini-chart">
            <div className="status-bars">
              <div className="status-bar available" style={{ width: `${(availableStaff / staff.length) * 100}%` }}></div>
              <div className="status-bar busy" style={{ width: `${(busyStaff / staff.length) * 100}%` }}></div>
              <div className="status-bar off" style={{ width: `${(offStaff / staff.length) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Building2 className="metric-icon" size={24} style={{ color: '#3b82f6' }} />
            <span className="metric-change positive">{Math.round(avgUtilization)}%</span>
          </div>
          <div className="metric-value">{resources.length}</div>
          <div className="metric-title">Resources</div>
          <div className="metric-subtitle">{availableResources} available • {Math.round(avgUtilization)}% avg utilization</div>
          <div className="mini-chart">
            <div className="utilization-bars">
              {resources.slice(0, 4).map((resource, idx) => (
                <div key={idx} className="util-bar" style={{ height: `${resource.utilization}%` }}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <DollarSign className="metric-icon" size={24} style={{ color: '#f59e0b' }} />
            <span className="metric-change positive">+{weeklyGrowth}%</span>
          </div>
          <div className="metric-value">${(totalRevenue / 1000).toFixed(1)}k</div>
          <div className="metric-title">Weekly Revenue</div>
          <div className="metric-subtitle">This week • 94% efficiency</div>
          <div className="mini-chart">
            <div className="trend-line">
              {[88, 91, 89, 94, 96, 94, 97].map((val, idx) => (
                <div key={idx} className="trend-point" style={{ height: `${val}%` }}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Star className="metric-icon" size={24} style={{ color: '#8b5cf6' }} />
            <span className="metric-change positive">+0.2</span>
          </div>
          <div className="metric-value">{avgRating.toFixed(1)}</div>
          <div className="metric-title">Avg Rating</div>
          <div className="metric-subtitle">127 reviews this month</div>
          <div className="mini-chart">
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="rating-bar" style={{ width: `${rating === 5 ? 85 : rating === 4 ? 12 : 3}%` }}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Bell className="metric-icon" size={24} style={{ color: '#ef4444' }} />
            <span className="metric-change negative">-3</span>
          </div>
          <div className="metric-value">7</div>
          <div className="metric-title">Pending Items</div>
          <div className="metric-subtitle">2 urgent • 5 normal priority</div>
          <div className="mini-chart">
            <div className="priority-indicators">
              <div className="urgent-dot"></div>
              <div className="urgent-dot"></div>
              <div className="normal-dot"></div>
              <div className="normal-dot"></div>
              <div className="normal-dot"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Data Streams */}
      <div className="data-streams">
        {/* Real-time Schedule */}
        <div className="data-stream large">
          <div className="stream-header">
            <div className="stream-title">
              <Activity size={20} />
              <h3>Live Schedule Stream</h3>
              <span className="live-indicator"></span>
            </div>
            <div className="stream-controls">
              <button className="stream-btn">
                <Filter size={16} />
              </button>
              <button className="stream-btn">
                <Download size={16} />
              </button>
              <button className="action-button primary" onClick={() => {}}>
                <CalendarPlus size={16} />
                New Appointment
              </button>
            </div>
          </div>
          
          <div className="schedule-timeline">
            {todaysAppointments.map(appointment => {
              const staffMember = staff.find(s => s.id === appointment.staffId);
              return (
                <div key={appointment.id} className="timeline-item">
                  <div className="timeline-time">
                    <div className="time-slot">{appointment.startTime}</div>
                    <div className="duration">{appointment.estimatedDuration}min</div>
                  </div>
                  
                  <div className="timeline-content">
                    <div className="appointment-header">
                      <h4>{appointment.title}</h4>
                      <span className={`status-badge ${appointment.status}`}>{appointment.status}</span>
                    </div>
                    
                    <div className="appointment-details">
                      <div className="detail-row">
                        <User size={14} />
                        <span>{appointment.client.name}</span>
                        {appointment.client.company && <span className="company">• {appointment.client.company}</span>}
                      </div>
                      
                      <div className="detail-row">
                        <Users size={14} />
                        <span>{staffMember?.name}</span>
                        <span className="role">• {staffMember?.role}</span>
                      </div>
                      
                      <div className="detail-row">
                        <MapPin size={14} />
                        <span>{appointment.location}</span>
                        <span className={`priority-badge ${appointment.priority}`}>{appointment.priority}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="timeline-actions">
                    <button onClick={() => {}}>
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => {}}>
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Performance Stream */}
        <div className="data-stream medium">
          <div className="stream-header">
            <div className="stream-title">
              <Users size={20} />
              <h3>Team Performance</h3>
              <span className="update-time">Updated 2 min ago</span>
            </div>
          </div>
          
          <div className="performance-grid">
            {staff.map(member => (
              <div key={member.id} className="performance-item">
                <div className="member-info">
                  <div className="member-avatar">{member.name.split(' ').map(n => n[0]).join('')}</div>
                  <div className="member-details">
                    <span className="member-name">{member.name}</span>
                    <span className="member-role">{member.role}</span>
                  </div>
                </div>
                
                <div className="performance-metrics">
                  <div className="metric-small">
                    <span className="metric-label">Rating</span>
                    <span className="metric-value">{member.rating}</span>
                  </div>
                  <div className="metric-small">
                    <span className="metric-label">Hours</span>
                    <span className="metric-value">{member.hoursWorked}</span>
                  </div>
                  <div className="metric-small">
                    <span className="metric-label">Appointments</span>
                    <span className="metric-value">{member.totalAppointments}</span>
                  </div>
                </div>
                
                <div className={`status-indicator ${member.status}`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Utilization Stream */}
        <div className="data-stream medium">
          <div className="stream-header">
            <div className="stream-title">
              <Building2 size={20} />
              <h3>Resource Utilization</h3>
              <span className="efficiency-badge">92% Efficient</span>
            </div>
          </div>
          
          <div className="resource-chart">
            {resources.map(resource => (
              <div key={resource.id} className="resource-bar">
                <div className="resource-info">
                  <span className="resource-name">{resource.name}</span>
                  <span className="resource-type">{resource.type}</span>
                </div>
                <div className="utilization-bar">
                  <div 
                    className="utilization-fill" 
                    style={{ 
                      width: `${resource.utilization}%`,
                      backgroundColor: resource.utilization > 80 ? '#ef4444' : resource.utilization > 60 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                  <span className="utilization-text">{resource.utilization}%</span>
                </div>
                <span className={`resource-status ${resource.status}`}>{resource.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Dashboard */}
      <div className="quick-actions-panel">
        <div className="panel-header">
          <h3>Quick Actions & Data Input</h3>
          <span className="panel-subtitle">Streamlined workflow controls</span>
        </div>
        
        <div className="actions-grid">
          <button className="action-card primary">
            <CalendarPlus size={24} />
            <span>Schedule Appointment</span>
            <small>Create new booking</small>
          </button>
          
          <button className="action-card">
            <UserPlus size={24} />
            <span>Add Team Member</span>
            <small>Expand workforce</small>
          </button>
          
          <button className="action-card">
            <Building2 size={24} />
            <span>Manage Resources</span>
            <small>Room & equipment</small>
          </button>
          
          <button className="action-card">
            <BarChart3 size={24} />
            <span>Generate Report</span>
            <small>Performance analytics</small>
          </button>
          
          <button className="action-card">
            <Bell size={24} />
            <span>Send Notifications</span>
            <small>Team updates</small>
          </button>
          
          <button className="action-card">
            <Settings size={24} />
            <span>System Settings</span>
            <small>Configure platform</small>
          </button>
        </div>
      </div>
    </div>
  );

  // Analytics View Component
  const AnalyticsView = () => (
    <div className="analytics-section">
      {/* Advanced Analytics Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h2>Advanced Analytics Dashboard</h2>
          <p>Comprehensive performance metrics and business intelligence</p>
        </div>
        <div className="analytics-controls">
          <select className="time-range-select">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last quarter</option>
            <option>Year to date</option>
          </select>
          <button className="action-button">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <Target size={20} />
            <span>Conversion Rate</span>
          </div>
          <div className="kpi-value">87.3%</div>
          <div className="kpi-trend positive">+5.2% vs last month</div>
          <div className="kpi-chart">
            <div className="progress-ring">
              <div className="ring-fill" style={{ strokeDasharray: `${87.3 * 2.51} 251` }}></div>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <DollarSign size={20} />
            <span>Revenue Growth</span>
          </div>
          <div className="kpi-value">+24.7%</div>
          <div className="kpi-trend positive">$142.8k this quarter</div>
          <div className="kpi-chart">
            <div className="growth-bars">
              {[65, 72, 68, 85, 92, 88, 100].map((height, idx) => (
                <div key={idx} className="growth-bar" style={{ height: `${height}%` }}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <Zap size={20} />
            <span>Productivity Index</span>
          </div>
          <div className="kpi-value">94.2</div>
          <div className="kpi-trend positive">+8.1 points this week</div>
          <div className="kpi-chart">
            <div className="productivity-gauge">
              <div className="gauge-fill" style={{ transform: `rotate(${94.2 * 1.8}deg)` }}></div>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <Briefcase size={20} />
            <span>Client Satisfaction</span>
          </div>
          <div className="kpi-value">4.8/5.0</div>
          <div className="kpi-trend positive">247 reviews</div>
          <div className="kpi-chart">
            <div className="satisfaction-bars">
              {[95, 87, 78, 45, 23].map((width, idx) => (
                <div key={idx} className="satisfaction-bar" style={{ width: `${width}%` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Charts */}
      <div className="charts-grid">
        <div className="chart-container large">
          <div className="chart-header">
            <h3>Appointment Volume Trends</h3>
            <div className="chart-legend">
              <span className="legend-item scheduled">Scheduled</span>
              <span className="legend-item completed">Completed</span>
              <span className="legend-item cancelled">Cancelled</span>
            </div>
          </div>
          <div className="trend-chart">
            {/* Simulated chart data */}
            <div className="chart-grid">
              <div className="chart-y-axis">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>
              <div className="chart-area">
                {[45, 52, 48, 61, 67, 58, 72, 69, 75, 82, 78, 88, 92, 86].map((value, idx) => (
                  <div key={idx} className="chart-column">
                    <div className="bar scheduled" style={{ height: `${value}%` }}></div>
                    <div className="bar completed" style={{ height: `${value * 0.8}%` }}></div>
                    <div className="bar cancelled" style={{ height: `${value * 0.1}%` }}></div>
                  </div>
                ))}
              </div>
              <div className="chart-x-axis">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="chart-container medium">
          <div className="chart-header">
            <h3>Team Performance Distribution</h3>
          </div>
          <div className="performance-chart">
            <div className="donut-chart">
              <div className="donut-segment high-performers" style={{ '--percentage': '45' } as any}></div>
              <div className="donut-segment avg-performers" style={{ '--percentage': '35' } as any}></div>
              <div className="donut-segment low-performers" style={{ '--percentage': '20' } as any}></div>
              <div className="donut-center">
                <span className="center-value">5</span>
                <span className="center-label">Team Members</span>
              </div>
            </div>
            <div className="performance-legend">
              <div className="legend-item">
                <span className="color-dot high-performers"></span>
                <span>High Performers (45%)</span>
              </div>
              <div className="legend-item">
                <span className="color-dot avg-performers"></span>
                <span>Average (35%)</span>
              </div>
              <div className="legend-item">
                <span className="color-dot low-performers"></span>
                <span>Needs Improvement (20%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-container medium">
          <div className="chart-header">
            <h3>Resource Efficiency Matrix</h3>
          </div>
          <div className="efficiency-matrix">
            <div className="matrix-grid">
              {resources.map((resource, idx) => (
                <div key={resource.id} className="matrix-cell" style={{ 
                  backgroundColor: `hsl(${resource.utilization * 1.2}, 70%, 85%)`,
                  fontSize: '0.8rem'
                }}>
                  <div className="cell-name">{resource.name}</div>
                  <div className="cell-value">{resource.utilization}%</div>
                </div>
              ))}
            </div>
            <div className="matrix-scale">
              <span>Low Utilization</span>
              <div className="scale-gradient"></div>
              <span>High Utilization</span>
            </div>
          </div>
        </div>

        <div className="chart-container full-width">
          <div className="chart-header">
            <h3>Real-time Activity Feed</h3>
            <span className="live-indicator"></span>
          </div>
          <div className="activity-stream">
            <div className="activity-item">
              <div className="activity-time">2 min ago</div>
              <div className="activity-content">
                <CheckCircle size={16} className="activity-icon success" />
                <span>Appointment with TechCorp completed successfully</span>
                <span className="activity-meta">Revenue: $2,400</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-time">5 min ago</div>
              <div className="activity-content">
                <Calendar size={16} className="activity-icon info" />
                <span>New appointment scheduled for tomorrow</span>
                <span className="activity-meta">Client: StartupXYZ</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-time">12 min ago</div>
              <div className="activity-content">
                <Users size={16} className="activity-icon primary" />
                <span>Team member Michael Chen updated availability</span>
                <span className="activity-meta">Status: Available</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-time">18 min ago</div>
              <div className="activity-content">
                <Building2 size={16} className="activity-icon warning" />
                <span>Conference Room A booking updated</span>
                <span className="activity-meta">Utilization: 85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="scheduling-dashboard">
        <div className="loading-state">
          <RefreshCw className="loading-spinner" size={48} />
          <h3>Loading Enterprise Scheduling System...</h3>
          <p>Initializing data streams and analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`scheduling-dashboard ${isAdmin ? 'admin-mode' : ''}`}>
      {/* Enhanced Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="header-title">
            <Activity className="header-icon" size={28} />
            <h1>Enterprise Scheduling System</h1>
          </div>
          <div className="header-subtitle">
            Advanced workforce management and analytics platform
          </div>
        </div>
        
        <div className="header-actions">
          <div className="search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search appointments, staff, resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-select">
            <Filter size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <button className="action-button">
            <Bell size={16} />
            <span className="notification-badge">3</span>
          </button>
          

          
          <button className="action-button">
            <Settings size={16} />
          </button>
          
          <button className="action-button primary">
            <Plus size={16} />
            New Appointment
          </button>
        </div>
      </div>

      {/* Simplified Navigation */}
      <div className="dashboard-nav">
        <button 
          className={`nav-item ${selectedView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setSelectedView('dashboard')}
        >
          <Activity size={16} />
          <span>Live Dashboard</span>
          <span className="nav-badge">{todaysAppointments.length}</span>
        </button>
        
        <button 
          className={`nav-item ${selectedView === 'analytics' ? 'active' : ''}`}
          onClick={() => setSelectedView('analytics')}
        >
          <BarChart3 size={16} />
          <span>Advanced Analytics</span>
          <span className="nav-badge">94%</span>
        </button>
      </div>

      {/* Date Selector */}
      <div className="date-selector">
        <div className="date-nav">
          <button onClick={() => {
            const prevDate = new Date(selectedDate);
            prevDate.setDate(prevDate.getDate() - 1);
            setSelectedDate(prevDate.toISOString().split('T')[0]);
          }}>
            ‹
          </button>
          
          <div className="selected-date">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <span className="date-display">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          
          <button onClick={() => {
            const nextDate = new Date(selectedDate);
            nextDate.setDate(nextDate.getDate() + 1);
            setSelectedDate(nextDate.toISOString().split('T')[0]);
          }}>
            ›
          </button>
        </div>
        
        <button 
          className="today-button"
          onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
        >
          Today
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {selectedView === 'dashboard' && <DashboardView />}
        {selectedView === 'analytics' && <AnalyticsView />}
      </div>
    </div>
  );
};

export default SchedulingDashboard; 