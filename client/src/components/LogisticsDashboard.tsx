import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import '../styles/LogisticsDashboard.css';
import * as logisticsService from '../services/logisticsService';

// Desktop Dashboard Component
const DesktopDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tracking');
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [shipments, setShipments] = useState<logisticsService.Shipment[]>([]);
  const [warehouses, setWarehouses] = useState<logisticsService.Warehouse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showRouteLines, setShowRouteLines] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['delivery', 'fuel', 'time']);

  // Mock data
  const mockShipments = [
    {
      id: 'SH001',
      status: 'in-transit',
      destination: 'San Francisco, CA',
      eta: '2024-03-15 14:30',
      location: [37.7749, -122.4194] as [number, number],
      carrier: 'FedEx',
      weight: 150,
      priority: 'High',
      lastUpdate: '2024-03-14 10:30'
    },
    {
      id: 'SH002',
      status: 'delivered',
      destination: 'Los Angeles, CA',
      eta: '2024-03-14 09:15',
      location: [34.0522, -118.2437] as [number, number],
      carrier: 'UPS',
      weight: 75,
      priority: 'Medium',
      lastUpdate: '2024-03-14 08:45'
    },
    {
      id: 'SH003',
      status: 'pending',
      destination: 'Seattle, WA',
      eta: '2024-03-16 11:00',
      location: [47.6062, -122.3321] as [number, number],
      carrier: 'DHL',
      weight: 200,
      priority: 'High',
      lastUpdate: '2024-03-14 09:00'
    }
  ];

  const mockWarehouses = [
    {
      id: 'WH001',
      name: 'Main Distribution Center',
      location: [39.8283, -98.5795] as [number, number],
      capacity: 10000,
      status: 'active'
    },
    {
      id: 'WH002',
      name: 'West Coast Hub',
      location: [34.0522, -118.2437] as [number, number],
      capacity: 7500,
      status: 'active'
    },
    {
      id: 'WH003',
      name: 'East Coast Facility',
      location: [40.7128, -74.0060] as [number, number],
      capacity: 8000,
      status: 'active'
    }
  ];

  const mockPerformanceData = [
    { date: 'Mon', onTime: 85, delayed: 15, returns: 5, deliveries: 100 },
    { date: 'Tue', onTime: 92, delayed: 8, returns: 3, deliveries: 100 },
    { date: 'Wed', onTime: 88, delayed: 12, returns: 4, deliveries: 100 },
    { date: 'Thu', onTime: 95, delayed: 5, returns: 2, deliveries: 100 },
    { date: 'Fri', onTime: 90, delayed: 10, returns: 6, deliveries: 100 }
  ];

  useEffect(() => {
    setShipments(mockShipments);
    setWarehouses(mockWarehouses);
  }, []);

  const filteredShipments = useMemo(() => {
    return shipments.filter(shipment => {
      const matchesSearch = shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           shipment.destination.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [shipments, searchQuery, filterStatus, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleShipmentClick = (shipmentId: string) => {
    setSelectedShipment(shipmentId);
  };

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const shipmentIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iIzNiODJmNiIvPgo8L3N2Zz4K',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });

  const warehouseIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgMTlWNUwxMiAyTDIxIDVWMTlIMzZNMzAgMTlIMTZWMTRIMTBWMTlIMzZaIiBmaWxsPSIjMTA5ODQ5Ii8+Cjwvc3ZnPgo=',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });

  return (
    <div className="logistics-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          {/* <h1>Logistics Dashboard</h1> */}
          {/* <p>Real-time tracking and analytics for your supply chain operations</p> */}
        </div>
        <div className="header-tabs">
          <button 
            className={`tab-button ${activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracking')}
          >
            Shipment Tracking
          </button>
          <button 
            className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance Analytics
          </button>
          <button 
            className={`tab-button ${activeTab === 'routes' ? 'active' : ''}`}
            onClick={() => setActiveTab('routes')}
          >
            Route Optimization
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'tracking' && (
          <div className="tracking-section">
            <div className="map-container">
              <MapContainer
                center={[39.8283, -98.5795]}
                zoom={4}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {warehouses.map((warehouse) => (
                  <Marker
                    key={`warehouse-${warehouse.id}`}
                    position={warehouse.location}
                    icon={warehouseIcon}
                  >
                    <Popup>
                      <div className="warehouse-popup">
                        <h3>{warehouse.name}</h3>
                        <p>Capacity: {warehouse.capacity} units</p>
                        <p>Status: {warehouse.status}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {shipments.map((shipment) => (
                  <Marker
                    key={shipment.id}
                    position={shipment.location}
                    icon={shipmentIcon}
                    eventHandlers={{
                      click: () => handleShipmentClick(shipment.id)
                    }}
                  >
                    <Popup>
                      <div className="shipment-popup">
                        <h3>Shipment #{shipment.id}</h3>
                        <p>Status: {shipment.status}</p>
                        <p>Destination: {shipment.destination}</p>
                        <p>Carrier: {shipment.carrier}</p>
                        <p>Weight: {shipment.weight} kg</p>
                        <p>Priority: {shipment.priority}</p>
                        <p>ETA: {shipment.eta}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <div className="shipment-controls">
              <div className="search-filter">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search shipments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                  className="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="shipment-list">
                <table className="shipments-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('id')}>
                        ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('status')}>
                        Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('destination')}>
                        Destination {sortBy === 'destination' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('eta')}>
                        ETA {sortBy === 'eta' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.map((shipment) => (
                      <tr 
                        key={shipment.id}
                        className={selectedShipment === shipment.id ? 'selected' : ''}
                        onClick={() => handleShipmentClick(shipment.id)}
                      >
                        <td>#{shipment.id}</td>
                        <td>
                          <span className={`status-badge ${shipment.status.toLowerCase()}`}>
                            {shipment.status}
                          </span>
                        </td>
                        <td>{shipment.destination}</td>
                        <td>{shipment.eta}</td>
                        <td>
                          <button className="action-button view">View</button>
                          <button className="action-button edit">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="performance-section">
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>On-Time Delivery Rate</h3>
                <div className="metric-value">94.5%</div>
                <div className="metric-trend positive">↑ 2.3%</div>
                <div className="metric-chart">
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={mockPerformanceData}>
                      <Line 
                        type="monotone" 
                        dataKey="onTime" 
                        stroke="#00b894" 
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="metric-card">
                <h3>Average Delivery Time</h3>
                <div className="metric-value">2.4 days</div>
                <div className="metric-trend positive">↓ 0.3 days</div>
                <div className="metric-chart">
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={mockPerformanceData}>
                      <Line 
                        type="monotone" 
                        dataKey="deliveries" 
                        stroke="#0984e3" 
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="metric-card">
                <h3>Return Rate</h3>
                <div className="metric-value">3.2%</div>
                <div className="metric-trend negative">↑ 0.5%</div>
                <div className="metric-chart">
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={mockPerformanceData}>
                      <Line 
                        type="monotone" 
                        dataKey="returns" 
                        stroke="#ff7675" 
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="performance-charts">
              <div className="chart-container">
                <h3>Delivery Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="onTime" stroke="#00b894" name="On Time" />
                    <Line type="monotone" dataKey="delayed" stroke="#ff7675" name="Delayed" />
                    <Line type="monotone" dataKey="returns" stroke="#fdcb6e" name="Returns" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="routes-section">
            <div className="route-map">
              <MapContainer
                center={[39.8283, -98.5795]}
                zoom={4}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {warehouses.map((warehouse) => (
                  <Marker
                    key={`warehouse-${warehouse.id}`}
                    position={warehouse.location}
                    icon={warehouseIcon}
                  >
                    <Popup>
                      <div className="warehouse-popup">
                        <h3>{warehouse.name}</h3>
                        <p>Capacity: {warehouse.capacity} units</p>
                        <p>Status: {warehouse.status}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <div className="route-controls">
              <div className="warehouse-selector">
                <h3>Select Warehouse</h3>
                <div className="warehouse-list">
                  {warehouses.map(warehouse => (
                    <button
                      key={warehouse.id}
                      className={`warehouse-button ${selectedWarehouse === warehouse.id ? 'active' : ''}`}
                      onClick={() => setSelectedWarehouse(warehouse.id)}
                    >
                      <span className="warehouse-name">{warehouse.name}</span>
                      <span className="warehouse-capacity">{warehouse.capacity} units</span>
                    </button>
                  ))}
                </div>
                {selectedWarehouse && (
                  <div className="optimization-options">
                    <button className="optimize-button">
                      Optimize Routes
                    </button>
                    <button className="save-button">
                      Save Routes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mobile Dashboard Component
const MobileDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tracking');
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);

  const mockShipments = [
    {
      id: 'SH001',
      status: 'in-transit',
      destination: 'San Francisco, CA',
      eta: '2024-03-15 14:30',
      carrier: 'FedEx',
      weight: 150,
      priority: 'High',
    },
    {
      id: 'SH002',
      status: 'delivered',
      destination: 'Los Angeles, CA',
      eta: '2024-03-14 09:15',
      carrier: 'UPS',
      weight: 75,
      priority: 'Medium',
    },
    {
      id: 'SH003',
      status: 'pending',
      destination: 'Seattle, WA',
      eta: '2024-03-16 11:00',
      carrier: 'DHL',
      weight: 200,
      priority: 'High',
    }
  ];

  const mockMetrics = [
    { label: 'Deliveries Today', value: '45', trend: '+12%' },
    { label: 'On-Time Rate', value: '94%', trend: '+2%' },
    { label: 'Active Routes', value: '12', trend: '+1' },
    { label: 'Fuel Efficiency', value: '87%', trend: '+5%' }
  ];

  return (
    <div className="mobile-dashboard-container">
      {/* Left iPhone */}
      <div className="iphone-frame left">
        <div className="iphone-screen">
          <div className="mobile-header">
            <h2>Logistics Dashboard</h2>
            <div className="mobile-tabs">
              <button 
                className={`mobile-tab ${activeTab === 'tracking' ? 'active' : ''}`}
                onClick={() => setActiveTab('tracking')}
              >
                Tracking
              </button>
              <button 
                className={`mobile-tab ${activeTab === 'metrics' ? 'active' : ''}`}
                onClick={() => setActiveTab('metrics')}
              >
                Metrics
              </button>
            </div>
          </div>

          <div className="mobile-content">
            {activeTab === 'tracking' ? (
              <div className="mobile-tracking">
                <div className="mobile-search">
                  <input 
                    type="text" 
                    placeholder="Search shipments..." 
                    className="mobile-search-input"
                  />
                </div>
                
                <div className="mobile-shipments">
                  {mockShipments.map((shipment) => (
                    <div 
                      key={shipment.id}
                      className={`mobile-shipment-card ${selectedShipment === shipment.id ? 'selected' : ''}`}
                      onClick={() => setSelectedShipment(shipment.id)}
                    >
                      <div className="shipment-header">
                        <span className="shipment-id">{shipment.id}</span>
                        <span className={`status-badge ${shipment.status}`}>
                          {shipment.status}
                        </span>
                      </div>
                      <div className="shipment-details">
                        <p className="destination">{shipment.destination}</p>
                        <p className="eta">ETA: {shipment.eta}</p>
                        <p className="carrier">{shipment.carrier} • {shipment.weight}kg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mobile-metrics">
                <div className="metrics-grid">
                  {mockMetrics.map((metric, index) => (
                    <div key={index} className="metric-card">
                      <h3>{metric.label}</h3>
                      <div className="metric-value">{metric.value}</div>
                      <div className="metric-trend positive">{metric.trend}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mobile-chart">
                  <h3>Delivery Performance</h3>
                  <div className="chart-placeholder">
                    <div className="chart-bar" style={{height: '60%'}}></div>
                    <div className="chart-bar" style={{height: '80%'}}></div>
                    <div className="chart-bar" style={{height: '70%'}}></div>
                    <div className="chart-bar" style={{height: '90%'}}></div>
                    <div className="chart-bar" style={{height: '85%'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right iPhone */}
      <div className="iphone-frame right">
        <div className="iphone-screen">
          <div className="mobile-header">
            <h2>Route Optimization</h2>
            <div className="mobile-tabs">
              <button className="mobile-tab active">Routes</button>
              <button className="mobile-tab">Warehouses</button>
            </div>
          </div>

          <div className="mobile-content">
            <div className="mobile-map-container">
              <div className="map-placeholder">
                <div className="map-marker" style={{top: '30%', left: '20%'}}></div>
                <div className="map-marker" style={{top: '60%', left: '70%'}}></div>
                <div className="map-marker" style={{top: '40%', left: '50%'}}></div>
                <div className="route-line"></div>
              </div>
            </div>

            <div className="mobile-route-info">
              <div className="route-card">
                <h3>Optimized Route</h3>
                <div className="route-stats">
                  <div className="route-stat">
                    <span className="stat-label">Distance</span>
                    <span className="stat-value">127 km</span>
                  </div>
                  <div className="route-stat">
                    <span className="stat-label">Time</span>
                    <span className="stat-value">2h 15m</span>
                  </div>
                  <div className="route-stat">
                    <span className="stat-label">Fuel</span>
                    <span className="stat-value">12.5L</span>
                  </div>
                </div>
              </div>

              <div className="warehouse-list">
                <h3>Warehouses</h3>
                <div className="warehouse-item">
                  <span className="warehouse-name">Main DC</span>
                  <span className="warehouse-status active">Active</span>
                </div>
                <div className="warehouse-item">
                  <span className="warehouse-name">West Hub</span>
                  <span className="warehouse-status active">Active</span>
                </div>
                <div className="warehouse-item">
                  <span className="warehouse-name">North Facility</span>
                  <span className="warehouse-status">Inactive</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main LogisticsDashboard Component
const LogisticsDashboard: React.FC<{ view?: 'desktop' | 'mobile' }> = ({ view = 'desktop' }) => {
  // If mobile view is requested, render the mobile dashboard
  if (view === 'mobile') {
    return <MobileDashboard />;
  }

  // Otherwise render the desktop dashboard
  return <DesktopDashboard />;
};

export default LogisticsDashboard; 