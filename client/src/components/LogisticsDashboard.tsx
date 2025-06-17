import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { collection, addDoc, getDocs, updateDoc, doc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import '../styles/LogisticsDashboard.css';
import * as logisticsService from '../services/logisticsService';
import L from 'leaflet';

// Modal Components
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Enhanced Desktop Dashboard Component
const DesktopDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [shipments, setShipments] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [realTimeData, setRealTimeData] = useState<any>({});
  
  // Modal states
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [routeOptimizationModalOpen, setRouteOptimizationModalOpen] = useState(false);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  
  // Filter states
  const [trackingFilter, setTrackingFilter] = useState('all');
  
  const { currentUser } = useAuth();

  // Enhanced mock data with more features
  const mockShipments = [
  {
    id: 'SH001',
      origin: 'New York',
      destination: 'Los Angeles',
    status: 'in-transit',
      progress: 65,
      estimatedDelivery: '2024-03-16',
      driver: 'John Smith',
      vehicle: 'VEH001',
      cargo: 'Electronics',
      priority: 'high',
      coordinates: { lat: 39.8283, lng: -98.5795 },
      temperature: 22,
      humidity: 45
  },
  {
    id: 'SH002',
      origin: 'Chicago',
      destination: 'Miami',
      status: 'pending',
      progress: 0,
      estimatedDelivery: '2024-03-18',
      driver: 'Sarah Johnson',
      vehicle: 'VEH002',
      cargo: 'Medical Supplies',
      priority: 'high',
      coordinates: { lat: 41.8781, lng: -87.6298 },
      temperature: 4,
      humidity: 35
  },
  {
    id: 'SH003',
      origin: 'San Francisco',
      destination: 'Seattle',
      status: 'in-transit',
      progress: 80,
      estimatedDelivery: '2024-03-15',
      driver: 'Mike Brown',
      vehicle: 'VEH003',
      cargo: 'Automotive Parts',
      priority: 'medium',
      coordinates: { lat: 45.5152, lng: -122.6784 },
      temperature: 18,
      humidity: 55
    },
    {
      id: 'SH004',
      origin: 'Houston',
      destination: 'Denver',
      status: 'delivered',
      progress: 100,
      estimatedDelivery: '2024-03-14',
      driver: 'Lisa Wilson',
      vehicle: 'VEH004',
      cargo: 'Textile Materials',
      priority: 'low',
      coordinates: { lat: 39.7392, lng: -104.9903 },
      temperature: 20,
      humidity: 40
    },
    {
      id: 'SH005',
      origin: 'Boston',
      destination: 'Atlanta',
      status: 'in-transit',
      progress: 45,
      estimatedDelivery: '2024-03-17',
      driver: 'David Lee',
      vehicle: 'VEH005',
      cargo: 'Food Products',
      priority: 'high',
      coordinates: { lat: 33.7490, lng: -84.3880 },
      temperature: 2,
      humidity: 65
    },
    {
      id: 'SH006',
      origin: 'Phoenix',
      destination: 'Las Vegas',
    status: 'pending',
      progress: 0,
      estimatedDelivery: '2024-03-19',
      driver: 'Emma Davis',
      vehicle: 'VEH006',
      cargo: 'Construction Materials',
      priority: 'medium',
      coordinates: { lat: 36.1699, lng: -115.1398 },
      temperature: 25,
      humidity: 30
    },
    {
      id: 'SH007',
      origin: 'Portland',
      destination: 'Sacramento',
      status: 'in-transit',
      progress: 70,
      estimatedDelivery: '2024-03-16',
      driver: 'James Wilson',
      vehicle: 'VEH007',
      cargo: 'Technology Equipment',
      priority: 'high',
      coordinates: { lat: 38.5816, lng: -121.4944 },
      temperature: 21,
      humidity: 50
    },
    {
      id: 'SH008',
      origin: 'Detroit',
      destination: 'Nashville',
      status: 'delivered',
      progress: 100,
      estimatedDelivery: '2024-03-13',
      driver: 'Amy Johnson',
      vehicle: 'VEH008',
      cargo: 'Musical Instruments',
      priority: 'medium',
      coordinates: { lat: 36.1627, lng: -86.7816 },
      temperature: 22,
      humidity: 45
    }
  ];

  const mockDrivers = [
    {
      id: 'DRV001',
      name: 'John Smith',
      status: 'active',
      currentLocation: [37.7749, -122.4194],
      experience: '5 years',
      rating: 4.8,
      totalDeliveries: 1250,
      vehicleType: 'Truck',
      phone: '+1-555-0123',
      currentShipment: 'SH001'
    },
    {
      id: 'DRV002',
      name: 'Sarah Johnson',
      status: 'available',
      currentLocation: [34.0522, -118.2437],
      experience: '3 years',
      rating: 4.9,
      totalDeliveries: 890,
      vehicleType: 'Van',
      phone: '+1-555-0124',
      currentShipment: null
    }
  ];

  const mockAlerts = [
    {
      id: 'ALT001',
      type: 'delay',
      severity: 'high',
      message: 'Shipment SH001 delayed due to weather conditions - Expected 2 hour delay',
      timestamp: '2024-03-14 11:30',
      resolved: false,
      affectedShipments: ['SH001'],
      estimatedImpact: 'High'
    },
    {
      id: 'ALT002',
      type: 'inventory',
      severity: 'medium',
      message: 'Medical Supplies below minimum stock level - Only 85 units remaining',
      timestamp: '2024-03-14 09:15',
      resolved: false,
      affectedShipments: [],
      estimatedImpact: 'Medium'
    },
    {
      id: 'ALT003',
      type: 'vehicle',
      severity: 'high',
      message: 'Vehicle VEH001 requires immediate maintenance - Engine temperature warning',
      timestamp: '2024-03-14 08:45',
      resolved: false,
      affectedShipments: ['SH001'],
      estimatedImpact: 'High'
    },
    {
      id: 'ALT004',
      type: 'route',
      severity: 'medium',
      message: 'Traffic congestion on Route I-95 causing delays for 3 shipments',
      timestamp: '2024-03-14 07:30',
      resolved: false,
      affectedShipments: ['SH001', 'SH002', 'SH003'],
      estimatedImpact: 'Medium'
    },
    {
      id: 'ALT005',
      type: 'driver',
      severity: 'low',
      message: 'Driver license renewal required for John Smith in 30 days',
      timestamp: '2024-03-14 06:00',
      resolved: false,
      affectedShipments: [],
      estimatedImpact: 'Low'
    },
    {
      id: 'ALT006',
      type: 'security',
      severity: 'high',
      message: 'Unauthorized access attempt detected at West Coast Hub',
      timestamp: '2024-03-14 05:15',
      resolved: true,
      affectedShipments: [],
      estimatedImpact: 'High'
    }
  ];

  const mockInventory = [
  {
    id: 'INV001',
      name: 'Electronic Components',
    category: 'Electronics',
      quantity: 1250,
      minStock: 200,
      maxStock: 2000,
      location: 'WH001',
      value: 125000,
      supplier: 'TechCorp Inc',
      lastRestocked: '2024-03-10',
      expiryDate: '2025-03-10',
      temperature: 'Room Temperature',
      weight: 450,
      dimensions: '120x80x40 cm'
  },
  {
    id: 'INV002',
      name: 'Medical Supplies',
      category: 'Healthcare',
      quantity: 85,
      minStock: 100,
      maxStock: 500,
      location: 'WH002',
      value: 45000,
      supplier: 'MedSupply Ltd',
      lastRestocked: '2024-03-12',
      expiryDate: '2024-12-31',
      temperature: 'Cold Storage',
      weight: 120,
      dimensions: '60x40x30 cm'
  },
  {
    id: 'INV003',
      name: 'Automotive Parts',
      category: 'Automotive',
      quantity: 750,
      minStock: 150,
      maxStock: 1000,
      location: 'WH001',
      value: 89000,
      supplier: 'AutoParts Pro',
      lastRestocked: '2024-03-08',
      expiryDate: 'N/A',
      temperature: 'Room Temperature',
      weight: 680,
      dimensions: '100x60x50 cm'
    },
    {
      id: 'INV004',
      name: 'Textile Materials',
      category: 'Textiles',
      quantity: 320,
      minStock: 80,
      maxStock: 600,
      location: 'WH003',
      value: 28000,
      supplier: 'Fabric World',
      lastRestocked: '2024-03-13',
      expiryDate: 'N/A',
      temperature: 'Dry Storage',
      weight: 200,
      dimensions: '80x60x40 cm'
    }
  ];

  // Enhanced performance data for analytics
  const enhancedPerformanceData = [
    { 
      date: 'Mon', 
      onTime: 85, 
      delayed: 15, 
      returns: 5, 
      deliveries: 145,
      revenue: 28500,
      fuelCost: 2400,
      customerSatisfaction: 4.2
    },
    { 
      date: 'Tue', 
      onTime: 92, 
      delayed: 8, 
      returns: 3, 
      deliveries: 158,
      revenue: 31200,
      fuelCost: 2100,
      customerSatisfaction: 4.6
    },
    { 
      date: 'Wed', 
      onTime: 88, 
      delayed: 12, 
      returns: 4, 
      deliveries: 142,
      revenue: 29800,
      fuelCost: 2300,
      customerSatisfaction: 4.4
    },
    { 
      date: 'Thu', 
      onTime: 95, 
      delayed: 5, 
      returns: 2, 
      deliveries: 167,
      revenue: 35400,
      fuelCost: 1950,
      customerSatisfaction: 4.8
    },
    { 
      date: 'Fri', 
      onTime: 90, 
      delayed: 10, 
      returns: 6, 
      deliveries: 152,
      revenue: 32100,
      fuelCost: 2200,
      customerSatisfaction: 4.5
    },
    { 
      date: 'Sat', 
      onTime: 78, 
      delayed: 22, 
      returns: 8, 
      deliveries: 98,
      revenue: 19600,
      fuelCost: 1800,
      customerSatisfaction: 3.9
    },
    { 
      date: 'Sun', 
      onTime: 82, 
      delayed: 18, 
      returns: 7, 
      deliveries: 87,
      revenue: 17400,
      fuelCost: 1650,
      customerSatisfaction: 4.1
    }
  ];

  // Filtering logic
  const filteredShipments = mockShipments.filter(shipment => {
    if (trackingFilter === 'all') return true;
    return shipment.status === trackingFilter;
  });

  // Firebase integration functions
  const saveToFirebase = async (collection_name: string, data: any) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, collection_name), {
        ...data,
        userId: currentUser.uid,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving to Firebase:', error);
    }
  };

  const loadFromFirebase = async (collection_name: string) => {
    if (!currentUser) return [];
    try {
      const q = query(
        collection(db, collection_name),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error loading from Firebase:', error);
      return [];
    }
  };

  useEffect(() => {
    setShipments(mockShipments);
    setWarehouses([
      {
        id: 'WH001',
        name: 'Main Distribution Center',
        location: [39.8283, -98.5795] as [number, number],
        capacity: 10000,
        currentStock: 8500,
        status: 'active',
        manager: 'Mike Wilson',
        operatingHours: '24/7',
        securityLevel: 'High'
      },
      {
        id: 'WH002',
        name: 'West Coast Hub',
        location: [34.0522, -118.2437] as [number, number],
        capacity: 7500,
        currentStock: 6200,
        status: 'active',
        manager: 'Lisa Chen',
        operatingHours: '6AM-10PM',
        securityLevel: 'Medium'
      }
    ]);
    setDrivers(mockDrivers);
    setInventory(mockInventory);
    setAlerts(mockAlerts);

    // Set up real-time data simulation
    const interval = setInterval(() => {
      setRealTimeData({
        totalShipments: Math.floor(Math.random() * 100) + 500,
        activeDrivers: Math.floor(Math.random() * 20) + 80,
        deliveryRate: (Math.random() * 5 + 92).toFixed(1),
        avgDeliveryTime: (Math.random() * 0.5 + 2.2).toFixed(1),
        fuelEfficiency: (Math.random() * 2 + 8.5).toFixed(1)
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Enhanced action handlers
  const handleCreateShipment = async (shipmentData: any) => {
    await saveToFirebase('shipments', shipmentData);
    setShipmentModalOpen(false);
  };

  const handleAssignDriver = async (shipmentId: string, driverId: string) => {
    await saveToFirebase('assignments', { shipmentId, driverId });
    setDriverModalOpen(false);
  };

  const handleInventoryUpdate = async (inventoryData: any) => {
    await saveToFirebase('inventory', inventoryData);
    setInventoryModalOpen(false);
  };

  const handleOptimizeRoute = async (warehouseId: string) => {
    await saveToFirebase('route_optimizations', { warehouseId, optimizedAt: new Date() });
    setRouteOptimizationModalOpen(false);
  };
    
    return (
    <div className="logistics-dashboard enhanced">
      <div className="dashboard-header">
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Active Shipments</span>
            <span className="stat-value">{realTimeData.totalShipments || 567}</span>
        </div>
          <div className="stat-item">
            <span className="stat-label">Drivers Online</span>
            <span className="stat-value">{realTimeData.activeDrivers || 89}</span>
        </div>
          <div className="stat-item">
            <span className="stat-label">On-Time Rate</span>
            <span className="stat-value">{realTimeData.deliveryRate || '94.2'}%</span>
        </div>
        </div>
        <div className="header-tabs">
          {['overview', 'tracking', 'inventory', 'analytics', 'alerts'].map(tab => (
          <button 
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
          >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
          ))}
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="metrics-grid">
              <div className="metric-card clickable" onClick={() => setShipmentModalOpen(true)}>
                <h3>Total Shipments</h3>
                <div className="metric-value">{realTimeData.totalShipments || 567}</div>
                <div className="metric-trend positive">↑ 12%</div>
                <button className="quick-action">Create New</button>
              </div>
              <div className="metric-card clickable" onClick={() => setDriverModalOpen(true)}>
                <h3>Active Drivers</h3>
                <div className="metric-value">{realTimeData.activeDrivers || 89}</div>
                <div className="metric-trend positive">↑ 5%</div>
                <button className="quick-action">Manage</button>
              </div>
              <div className="metric-card clickable" onClick={() => setInventoryModalOpen(true)}>
                <h3>Inventory Items</h3>
                <div className="metric-value">1,234</div>
                <div className="metric-trend negative">↓ 3%</div>
                <button className="quick-action">Restock</button>
              </div>
              <div className="metric-card clickable" onClick={() => setAlertModalOpen(true)}>
                <h3>Active Alerts</h3>
                <div className="metric-value">{alerts.filter(a => !a.resolved).length}</div>
                <div className="metric-trend neutral">—</div>
                <button className="quick-action">View All</button>
              </div>
            </div>
            
            <div className="overview-charts">
              <div className="chart-container">
                <h3>Real-Time Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { time: '00:00', deliveries: 45, delays: 5 },
                    { time: '04:00', deliveries: 65, delays: 8 },
                    { time: '08:00', deliveries: 120, delays: 12 },
                    { time: '12:00', deliveries: 150, delays: 15 },
                    { time: '16:00', deliveries: 135, delays: 10 },
                    { time: '20:00', deliveries: 95, delays: 7 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="deliveries" stroke="#00b894" name="Deliveries" />
                    <Line type="monotone" dataKey="delays" stroke="#ff7675" name="Delays" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="map-overview">
                <h3>Live Tracking Overview</h3>
              <MapContainer
                center={[39.8283, -98.5795]}
                zoom={4}
                  style={{ height: '300px', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {shipments.map((shipment) => (
                    <Marker key={shipment.id} position={shipment.coordinates}>
                    <Popup>
                        <div className="enhanced-popup">
                          <h4>Shipment #{shipment.id}</h4>
                        <p>Status: {shipment.status}</p>
                          <p>Driver: {shipment.driver}</p>
                          <p>Temperature: {shipment.temperature}°C</p>
                          <button onClick={() => setShipmentModalOpen(true)}>View Details</button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="tracking-section">
            <div className="tracking-header">
              <h3>Real-Time Shipment Tracking</h3>
              <div className="tracking-controls">
                <select
                  className="tracking-status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Shipments</option>
                  <option value="in-transit">In Transit</option>
                  <option value="pending">Pending Delivery</option>
                  <option value="delivered">Delivered</option>
                </select>
                <button className="refresh-tracking">🔄 Refresh</button>
                <button className="export-tracking">📊 Export</button>
              </div>
            </div>

            <div className="tracking-stats">
              <div className="tracking-stat-card in-transit">
                <h4>In Transit</h4>
                <div className="stat-number">{shipments.filter(s => s.status === 'in-transit').length}</div>
                <div className="stat-detail">Active shipments</div>
              </div>
              <div className="tracking-stat-card pending">
                <h4>Pending</h4>
                <div className="stat-number">{shipments.filter(s => s.status === 'pending').length}</div>
                <div className="stat-detail">Awaiting dispatch</div>
              </div>
              <div className="tracking-stat-card delivered">
                <h4>Delivered</h4>
                <div className="stat-number">{shipments.filter(s => s.status === 'delivered').length}</div>
                <div className="stat-detail">Today completed</div>
              </div>
              <div className="tracking-stat-card total">
                <h4>Total Active</h4>
                <div className="stat-number">{shipments.filter(s => s.status !== 'delivered').length}</div>
                <div className="stat-detail">All active shipments</div>
              </div>
            </div>

            <div className="map-table-container">
              <div className="tracking-map">
                <h4>Live Tracking Map</h4>
                <MapContainer center={[39.8283, -98.5795]} zoom={4} className="shipment-map">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {shipments.map((shipment) => (
                    <Marker key={shipment.id} position={[shipment.coordinates.lat, shipment.coordinates.lng]}>
                      <Popup>
                        <div className="shipment-popup-enhanced">
                          <div className="popup-header">
                            <strong>{shipment.id}</strong>
                            <span className={`status-badge ${shipment.status}`}>
                              {shipment.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="popup-content">
                            <div className="route-info">
                              <p><strong>Route:</strong> {shipment.origin} → {shipment.destination}</p>
                              <p><strong>Driver:</strong> {shipment.driver}</p>
                              <p><strong>Cargo:</strong> {shipment.cargo}</p>
                              <p><strong>Progress:</strong> {shipment.progress}%</p>
                              <p><strong>ETA:</strong> {shipment.estimatedDelivery}</p>
                            </div>
                            <div className="environmental-data">
                              <p><strong>Temp:</strong> {shipment.temperature}°C</p>
                              <p><strong>Humidity:</strong> {shipment.humidity}%</p>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              <div className="shipments-table-container">
                <div className="table-controls">
                  <input
                    type="text" 
                    placeholder="Search shipments..."
                    className="shipment-search"
                  />
                  <select className="priority-filter">
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
              </div>
                
                <div className="shipments-table">
                  <table>
                  <thead>
                    <tr>
                        <th>Shipment ID</th>
                        <th>Route</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Driver</th>
                        <th>ETA</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                      {shipments.map((shipment) => (
                        <tr key={shipment.id}>
                          <td>
                            <div className="shipment-id">
                              <strong>{shipment.id}</strong>
                              <span className={`priority-indicator ${shipment.priority}`}>
                                {shipment.priority}
                          </span>
                            </div>
                        </td>
                          <td>
                            <div className="route-cell">
                              <span className="origin">{shipment.origin}</span>
                              <span className="arrow">→</span>
                              <span className="destination">{shipment.destination}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${shipment.status}`}>
                              {shipment.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div className="progress-cell">
                              <div className="progress-bar-container">
                                <div 
                                  className="progress-bar" 
                                  style={{ width: `${shipment.progress}%` }}
                                ></div>
                              </div>
                              <span className="progress-text">{shipment.progress}%</span>
                            </div>
                          </td>
                          <td>
                            <div className="driver-cell">
                              <strong>{shipment.driver}</strong>
                              <br />
                              <small>{shipment.vehicle}</small>
                            </div>
                          </td>
                          <td>
                            <div className="eta-cell">
                              <strong>{shipment.estimatedDelivery}</strong>
                              <br />
                              <small>{shipment.cargo}</small>
                            </div>
                          </td>
                          <td>
                            <div className="shipment-actions">
                              <button className="action-btn track">Track</button>
                              <button className="action-btn details">Details</button>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="inventory-section">
            <div className="inventory-header">
              <h3>Inventory Management</h3>
              <div className="inventory-header-actions">
                <button className="export-button">Export Data</button>
                <button className="add-item-button" onClick={() => setInventoryModalOpen(true)}>
                  Add New Item
                </button>
                  </div>
                </div>
            
            <div className="inventory-stats">
              <div className="inventory-stat-card">
                <h4>Total Items</h4>
                <div className="stat-value">{inventory.reduce((acc, item) => acc + item.quantity, 0)}</div>
                <div className="stat-trend positive">↑ 5%</div>
                </div>
              <div className="inventory-stat-card">
                <h4>Low Stock Items</h4>
                <div className="stat-value">{inventory.filter(i => i.quantity < i.minStock).length}</div>
                <div className="stat-trend negative">↑ 2</div>
              </div>
              <div className="inventory-stat-card">
                <h4>Total Value</h4>
                <div className="stat-value">${inventory.reduce((acc, item) => acc + item.value, 0).toLocaleString()}</div>
                <div className="stat-trend positive">↑ 8%</div>
                </div>
              <div className="inventory-stat-card">
                <h4>Categories</h4>
                <div className="stat-value">{new Set(inventory.map(i => i.category)).size}</div>
                <div className="stat-trend neutral">—</div>
              </div>
                </div>

            <div className="inventory-overview">
              <div className="inventory-charts">
              <div className="chart-container">
                  <h4>Inventory by Category</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Electronics', value: 35, fill: '#3b82f6' },
                          { name: 'Healthcare', value: 25, fill: '#10b981' },
                          { name: 'Automotive', value: 28, fill: '#f59e0b' },
                          { name: 'Textiles', value: 12, fill: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {[
                          { name: 'Electronics', value: 35, fill: '#3b82f6' },
                          { name: 'Healthcare', value: 25, fill: '#10b981' },
                          { name: 'Automotive', value: 28, fill: '#f59e0b' },
                          { name: 'Textiles', value: 12, fill: '#ef4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    <Tooltip />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
              </div>
                
              <div className="chart-container">
                  <h4>Stock Levels vs Targets</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={inventory.map(item => ({
                      name: item.name.split(' ')[0],
                      current: item.quantity,
                      minimum: item.minStock,
                      maximum: item.maxStock
                    }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                      <Bar dataKey="current" fill="#3b82f6" name="Current Stock" />
                      <Bar dataKey="minimum" fill="#ef4444" name="Min Stock" />
                      <Bar dataKey="maximum" fill="#10b981" name="Max Stock" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

            <div className="inventory-table">
              <div className="table-header">
                <h4>Detailed Inventory</h4>
                <div className="table-filters">
                  <select className="category-filter">
                  <option value="all">All Categories</option>
                    <option value="electronics">Electronics</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="automotive">Automotive</option>
                    <option value="textiles">Textiles</option>
                </select>
                  <input type="text" placeholder="Search items..." className="search-input" />
              </div>
            </div>
              <table>
                <thead>
                  <tr>
                    <th>Item Details</th>
                    <th>Category</th>
                    <th>Stock Status</th>
                    <th>Location & Storage</th>
                    <th>Financial</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="item-details">
                          <strong>{item.name}</strong>
                          <br />
                          <small>Supplier: {item.supplier}</small>
                          <br />
                          <small>Weight: {item.weight}kg | {item.dimensions}</small>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{item.category}</span>
                        <br />
                        <small>Storage: {item.temperature}</small>
                      </td>
                      <td>
                        <div className="stock-info">
                          <strong>{item.quantity} units</strong>
                          <br />
                          <span className={`status-badge ${item.quantity < item.minStock ? 'low-stock' : 'in-stock'}`}>
                            {item.quantity < item.minStock ? 'Low Stock' : 'In Stock'}
                        </span>
                          <br />
                          <small>Min: {item.minStock} | Max: {item.maxStock}</small>
                        </div>
                      </td>
                      <td>
                        <strong>{item.location}</strong>
                        <br />
                        <small>Last Restocked: {item.lastRestocked}</small>
                        {item.expiryDate !== 'N/A' && (
                          <>
                            <br />
                            <small>Expires: {item.expiryDate}</small>
                          </>
                        )}
                      </td>
                      <td>
                        <strong>${item.value.toLocaleString()}</strong>
                        <br />
                        <small>${(item.value / item.quantity).toFixed(2)} per unit</small>
                      </td>
                      <td>
                        <div className="item-actions">
                          <button className="action-button restock" onClick={() => setInventoryModalOpen(true)}>
                          Restock
                        </button>
                          <button className="action-button edit">Edit</button>
                          <button className="action-button move">Move</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="drivers-section">
            <div className="drivers-header">
              <h3>Driver Management</h3>
              <button className="add-driver-button" onClick={() => setDriverModalOpen(true)}>
                Add New Driver
              </button>
      </div>

            <div className="drivers-stats">
              <div className="driver-stat-card">
                <h4>Total Drivers</h4>
                <div className="stat-value">{drivers.length}</div>
            </div>
              <div className="driver-stat-card">
                <h4>Active Now</h4>
                <div className="stat-value">{drivers.filter(d => d.status === 'active').length}</div>
          </div>
              <div className="driver-stat-card">
                <h4>Available</h4>
                <div className="stat-value">{drivers.filter(d => d.status === 'available').length}</div>
        </div>
              <div className="driver-stat-card">
                <h4>Avg Rating</h4>
                <div className="stat-value">{(drivers.reduce((acc, d) => acc + d.rating, 0) / drivers.length).toFixed(1)}</div>
              </div>
            </div>

            <div className="drivers-grid">
              {drivers.map(driver => (
                <div key={driver.id} className="driver-card-expanded">
                  <div className="driver-header">
                    <h4>{driver.name}</h4>
                    <span className={`status ${driver.status}`}>{driver.status}</span>
            </div>
                  <div className="driver-details">
                    <p><strong>Experience:</strong> {driver.experience}</p>
                    <p><strong>Rating:</strong> {driver.rating}/5</p>
                    <p><strong>Deliveries:</strong> {driver.totalDeliveries}</p>
                    <p><strong>Vehicle:</strong> {driver.vehicleType}</p>
                    <p><strong>Phone:</strong> {driver.phone}</p>
                    {driver.currentShipment && (
                      <p><strong>Current Shipment:</strong> #{driver.currentShipment}</p>
                    )}
                  </div>
                  <div className="driver-actions">
                    <button onClick={() => setDriverModalOpen(true)}>Assign Route</button>
                    <button>Contact</button>
                    <button>View Performance</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <div className="analytics-header">
              <h3>Performance Analytics & Business Intelligence</h3>
              <div className="analytics-controls">
                <select className="time-range-selector">
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
                <button className="export-analytics">Export Report</button>
              </div>
            </div>
            
            <div className="analytics-overview">
              <div className="analytics-metrics">
                <h4>Key Performance Indicators</h4>
                <div className="kpi-grid-expanded">
                  <div className="kpi-card">
                    <h5>On-Time Delivery Rate</h5>
                    <div className="kpi-value">87.3%</div>
                    <div className="kpi-trend positive">↑ 2.1%</div>
                    <div className="kpi-target">Target: 90%</div>
                  </div>
                  <div className="kpi-card">
                    <h5>Average Delivery Time</h5>
                    <div className="kpi-value">2.4 days</div>
                    <div className="kpi-trend positive">↓ 0.3 days</div>
                    <div className="kpi-target">Target: 2.0 days</div>
                  </div>
                  <div className="kpi-card">
                    <h5>Customer Satisfaction</h5>
                    <div className="kpi-value">4.5/5</div>
                    <div className="kpi-trend positive">↑ 0.2</div>
                    <div className="kpi-target">Target: 4.8/5</div>
                  </div>
                  <div className="kpi-card">
                    <h5>Fuel Efficiency</h5>
                    <div className="kpi-value">8.2 L/100km</div>
                    <div className="kpi-trend positive">↓ 0.3</div>
                    <div className="kpi-target">Target: 7.5 L/100km</div>
                  </div>
                  <div className="kpi-card">
                    <h5>Weekly Revenue</h5>
                    <div className="kpi-value">$194K</div>
                    <div className="kpi-trend positive">↑ 12%</div>
                    <div className="kpi-target">Target: $200K</div>
                  </div>
                  <div className="kpi-card">
                    <h5>Cost per Delivery</h5>
                    <div className="kpi-value">$28.50</div>
                    <div className="kpi-trend negative">↑ $1.20</div>
                    <div className="kpi-target">Target: $25.00</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="analytics-grid-expanded">
              <div className="chart-container">
                <h4>Weekly Performance Trends</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={enhancedPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="onTime" stroke="#00b894" name="On Time %" />
                    <Line type="monotone" dataKey="delayed" stroke="#ff7675" name="Delayed %" />
                    <Line type="monotone" dataKey="returns" stroke="#fdcb6e" name="Returns %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h4>Revenue vs Costs Analysis</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={enhancedPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`$${value}`, name]} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="fuelCost" fill="#ef4444" name="Fuel Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h4>Customer Satisfaction Trends</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={enhancedPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[3.5, 5]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="customerSatisfaction" stroke="#8b5cf6" name="Rating" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h4>Delivery Volume Distribution</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={enhancedPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="deliveries" fill="#10b981" name="Daily Deliveries" />
                  </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

        {activeTab === 'alerts' && (
          <div className="alerts-section">
            <div className="alerts-header">
              <h3>System Alerts & Critical Notifications</h3>
              <div className="alerts-controls">
                <select className="alert-filter">
                  <option value="all">All Alerts</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                  <option value="unresolved">Unresolved Only</option>
                </select>
                <button className="clear-all-button">Clear Resolved</button>
                <button className="export-alerts">Export Alerts</button>
            </div>
          </div>

            <div className="alerts-summary">
              <div className="alert-summary-card high">
                <div className="summary-icon">🚨</div>
                <h4>Critical Alerts</h4>
                <div className="count">{alerts.filter(a => a.severity === 'high' && !a.resolved).length}</div>
                <div className="summary-detail">Requires immediate attention</div>
        </div>
              <div className="alert-summary-card medium">
                <div className="summary-icon">⚠️</div>
                <h4>Warning Alerts</h4>
                <div className="count">{alerts.filter(a => a.severity === 'medium' && !a.resolved).length}</div>
                <div className="summary-detail">Monitor closely</div>
              </div>
              <div className="alert-summary-card low">
                <div className="summary-icon">ℹ️</div>
                <h4>Info Alerts</h4>
                <div className="count">{alerts.filter(a => a.severity === 'low' && !a.resolved).length}</div>
                <div className="summary-detail">For your information</div>
              </div>
            </div>

            <div className="alerts-analytics">
              <div className="alert-trends">
                <h4>Alert Trends (Last 7 Days)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={[
                    { day: 'Mon', high: 2, medium: 4, low: 1 },
                    { day: 'Tue', high: 1, medium: 3, low: 2 },
                    { day: 'Wed', high: 3, medium: 2, low: 1 },
                    { day: 'Thu', high: 1, medium: 5, low: 3 },
                    { day: 'Fri', high: 2, medium: 3, low: 2 },
                    { day: 'Sat', high: 0, medium: 2, low: 1 },
                    { day: 'Sun', high: 1, medium: 1, low: 0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="high" stroke="#dc2626" name="Critical" />
                    <Line type="monotone" dataKey="medium" stroke="#f59e0b" name="Warning" />
                    <Line type="monotone" dataKey="low" stroke="#3b82f6" name="Info" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-item-expanded ${alert.severity} ${alert.resolved ? 'resolved' : ''}`}>
                  <div className="alert-icon">
                    {alert.severity === 'high' && '🚨'}
                    {alert.severity === 'medium' && '⚠️'}
                    {alert.severity === 'low' && 'ℹ️'}
                  </div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <h4>{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert</h4>
                      <span className={`severity-badge ${alert.severity}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p>{alert.message}</p>
                    <div className="alert-metadata">
                      <small>Time: {alert.timestamp}</small>
                      <small>Impact: {alert.estimatedImpact}</small>
                      {alert.affectedShipments.length > 0 && (
                        <small>Affected Shipments: {alert.affectedShipments.join(', ')}</small>
                      )}
                    </div>
                  </div>
                  <div className="alert-actions">
                    {!alert.resolved && (
                      <>
                        <button className="resolve-btn">Resolve</button>
                        <button className="snooze-btn">Snooze 1h</button>
                        <button className="escalate-btn">Escalate</button>
                      </>
                    )}
                    <button className="dismiss-btn">Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Modals */}
      <Modal isOpen={shipmentModalOpen} onClose={() => setShipmentModalOpen(false)} title="Shipment Management">
        <div className="shipment-form">
          <h4>Create New Shipment</h4>
          <div className="form-grid">
            <input placeholder="Destination" />
            <select><option>Select Carrier</option></select>
            <input placeholder="Weight (kg)" type="number" />
            <select><option>Priority Level</option></select>
            <input placeholder="Insurance Value" type="number" />
            <select><option>Select Driver</option></select>
          </div>
            <div className="modal-actions">
            <button onClick={() => handleCreateShipment({})}>Create Shipment</button>
            <button onClick={() => setShipmentModalOpen(false)}>Cancel</button>
            </div>
          </div>
      </Modal>

      <Modal isOpen={driverModalOpen} onClose={() => setDriverModalOpen(false)} title="Driver Management">
        <div className="driver-management">
          <div className="driver-list">
            {drivers.map(driver => (
              <div key={driver.id} className="driver-card">
                <div className="driver-info">
                  <h4>{driver.name}</h4>
                  <p>Status: <span className={`status ${driver.status}`}>{driver.status}</span></p>
                  <p>Rating: {driver.rating}/5</p>
                  <p>Deliveries: {driver.totalDeliveries}</p>
        </div>
                <div className="driver-actions">
                  <button onClick={() => handleAssignDriver('', driver.id)}>Assign Route</button>
                  <button>Contact</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal isOpen={inventoryModalOpen} onClose={() => setInventoryModalOpen(false)} title="Inventory Management">
        <div className="inventory-management">
          <div className="inventory-stats">
            <div className="stat">Total Items: 1,234</div>
            <div className="stat">Low Stock: {inventory.filter(i => i.quantity < i.minStock).length}</div>
            <div className="stat">Total Value: $170,000</div>
          </div>
          <div className="inventory-list">
            {inventory.map(item => (
              <div key={item.id} className="inventory-item">
                <h4>{item.name}</h4>
                <p>Quantity: {item.quantity}</p>
                <p>Location: {item.location}</p>
                <p className={item.quantity < item.minStock ? 'low-stock' : ''}>
                  {item.quantity < item.minStock ? 'LOW STOCK' : 'In Stock'}
                </p>
                <button onClick={() => handleInventoryUpdate(item)}>Restock</button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal isOpen={alertModalOpen} onClose={() => setAlertModalOpen(false)} title="System Alerts">
        <div className="alerts-management">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-item ${alert.severity}`}>
              <div className="alert-content">
                <h4>{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert</h4>
                <p>{alert.message}</p>
                <small>{alert.timestamp}</small>
              </div>
              <div className="alert-actions">
                <button>Resolve</button>
                <button>Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

// Keep the existing MobileDashboard component structure but enhance it similarly...
const MobileDashboard: React.FC = () => {
  return (
    <div className="mobile-dashboard-container">
      {/* Enhanced mobile interface would go here */}
      <div className="iphone-frame">
        <div className="iphone-screen">
          <div className="mobile-header">
            <h2>Logistics Hub</h2>
          </div>
          <div className="mobile-content">
            <p>Enhanced mobile dashboard with real-time features...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const LogisticsDashboard: React.FC<{ view?: 'desktop' | 'mobile' }> = ({ view = 'desktop' }) => {
  return view === 'desktop' ? <DesktopDashboard /> : <MobileDashboard />;
};

export default LogisticsDashboard; 