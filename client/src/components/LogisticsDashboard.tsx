import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import '../styles/LogisticsDashboard.css';

// Custom marker icons
const shipmentIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const warehouseIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Enhanced mock data
const mockShipments: Shipment[] = [
  {
    id: 'SH001',
    status: 'in-transit',
    destination: 'San Francisco, CA',
    eta: '2024-03-15 14:30',
    location: [37.7749, -122.4194],
    carrier: 'FedEx',
    weight: 150,
    priority: 'High',
    lastUpdate: '2024-03-14 10:00'
  },
  {
    id: 'SH002',
    status: 'delivered',
    destination: 'Los Angeles, CA',
    eta: '2024-03-14 09:15',
    location: [34.0522, -118.2437],
    carrier: 'UPS',
    weight: 75,
    priority: 'Medium',
    lastUpdate: '2024-03-14 09:15'
  },
  {
    id: 'SH003',
    status: 'pending',
    destination: 'Seattle, WA',
    eta: '2024-03-16 11:00',
    location: [47.6062, -122.3321],
    carrier: 'DHL',
    weight: 200,
    priority: 'High',
    lastUpdate: '2024-03-14 08:30'
  }
];

const mockWarehouses: Warehouse[] = [
  {
    id: 'WH001',
    name: 'Main Distribution Center',
    location: [37.7749, -122.4194],
    capacity: 1000,
    status: 'active'
  },
  {
    id: 'WH002',
    name: 'West Coast Hub',
    location: [34.0522, -118.2437],
    capacity: 800,
    status: 'active'
  },
  {
    id: 'WH003',
    name: 'Northwest Facility',
    location: [47.6062, -122.3321],
    capacity: 600,
    status: 'active'
  }
];

const mockPerformanceData = [
  { date: '2024-03-14', deliveries: 45, onTime: 42, delayed: 3, returns: 1 },
  { date: '2024-03-15', deliveries: 52, onTime: 48, delayed: 4, returns: 2 },
  { date: '2024-03-16', deliveries: 48, onTime: 45, delayed: 3, returns: 1 },
  { date: '2024-03-17', deliveries: 55, onTime: 52, delayed: 3, returns: 0 },
  { date: '2024-03-18', deliveries: 50, onTime: 47, delayed: 3, returns: 2 },
];

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: string;
  lastRestock: string;
  location: string;
}

interface Shipment {
  id: string;
  status: string;
  destination: string;
  eta: string;
  location: [number, number];
  carrier: string;
  weight: number;
  priority: string;
  lastUpdate: string;
}

interface Warehouse {
  id: string;
  name: string;
  location: [number, number];
  capacity: number;
  status: string;
}

interface OptimizedRoute {
  route: [number, number][];
  distance: number;
  time: number;
  emissions: number;
}

interface OptimizedRoutes {
  [key: string]: OptimizedRoute;
}

const mockInventory: InventoryItem[] = [
  {
    id: 'INV001',
    name: 'Laptop Pro X1',
    category: 'Electronics',
    quantity: 100,
    status: 'in-stock',
    lastRestock: '2024-03-01',
    location: 'WH001'
  },
  {
    id: 'INV002',
    name: 'Office Chair Deluxe',
    category: 'Furniture',
    quantity: 50,
    status: 'low-stock',
    lastRestock: '2024-02-15',
    location: 'WH002'
  },
  {
    id: 'INV003',
    name: 'Wireless Mouse',
    category: 'Electronics',
    quantity: 200,
    status: 'in-stock',
    lastRestock: '2024-03-10',
    location: 'WH001'
  }
];

const LogisticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tracking');
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoutes>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showRouteLines, setShowRouteLines] = useState(true);

  // Initialize all modal states to false/null
  const [showShipmentDetails, setShowShipmentDetails] = useState<string | null>(null);
  const [showWarehouseDetails, setShowWarehouseDetails] = useState<string | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [optimizationInProgress, setOptimizationInProgress] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['delivery', 'fuel', 'time']);

  // Filter and sort shipments
  const filteredShipments = useCallback(() => {
    return mockShipments
      .filter(shipment => {
        const matchesSearch = 
          shipment.id.toString().includes(searchQuery) ||
          shipment.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shipment.carrier.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || shipment.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aValue = a[sortBy as keyof typeof a];
        const bValue = b[sortBy as keyof typeof b];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
  }, [searchQuery, filterStatus, sortBy, sortOrder]);

  // Simulate route optimization
  useEffect(() => {
    if (selectedWarehouse) {
      const warehouse = mockWarehouses.find(w => w.id === selectedWarehouse);
      if (warehouse) {
        setOptimizedRoutes(prev => ({
          ...prev,
          [selectedWarehouse]: {
            route: [
              warehouse.location as [number, number],
              ...mockShipments
                .filter(s => s.status === 'in-transit')
                .map(s => s.location as [number, number])
            ],
            distance: 0,
            time: 0,
            emissions: 0
          }
        }));
      }
    }
  }, [selectedWarehouse]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Handlers for shipment actions
  const handleShipmentClick = useCallback((shipmentId: string) => {
    setSelectedShipment(shipmentId);
    setShowShipmentDetails(shipmentId);
  }, []);

  const handleViewShipment = useCallback((shipmentId: string) => {
    setSelectedShipment(shipmentId);
  }, []);

  const handleEditShipment = useCallback((shipmentId: string) => {
    // Implement shipment editing logic
    console.log('Edit shipment:', shipmentId);
  }, []);

  const handleDeleteShipment = useCallback((shipmentId: string) => {
    setShowDeleteConfirm(shipmentId);
  }, []);

  const confirmDeleteShipment = useCallback((shipmentId: string) => {
    // Implement shipment deletion logic
    console.log('Delete shipment:', shipmentId);
    setShowDeleteConfirm(null);
  }, []);

  // Handlers for warehouse actions
  const handleWarehouseSelect = useCallback((warehouseId: string) => {
    setSelectedWarehouse(warehouseId);
    const warehouse = mockWarehouses.find(w => w.id === warehouseId);
    if (warehouse) {
      setOptimizedRoutes(prev => ({
        ...prev,
        [warehouseId]: {
          route: [
            warehouse.location,
            ...mockShipments
              .filter(s => s.status === 'in-transit')
              .map(s => s.location)
          ],
          distance: 150, // Initial values
          time: 120,
          emissions: 45
        }
      }));
    }
  }, []);

  const handleOptimizeRoutes = useCallback(() => {
    if (!selectedWarehouse) return;
    
    setOptimizationInProgress(true);
    setShowOptimizationModal(true);
    
    // Simulate optimization process
    setTimeout(() => {
      setOptimizationInProgress(false);
      setShowOptimizationModal(false);
      
      // Update routes with optimized data
      setOptimizedRoutes(prev => ({
        ...prev,
        [selectedWarehouse]: {
          ...prev[selectedWarehouse],
          distance: prev[selectedWarehouse].distance * 0.9,
          time: prev[selectedWarehouse].time * 0.85,
          emissions: prev[selectedWarehouse].emissions * 0.95,
        }
      }));
    }, 2000);
  }, [selectedWarehouse]);

  // Handlers for inventory actions
  const handleAddItem = useCallback(() => {
    setShowAddItemModal(true);
  }, []);

  const handleEditItem = useCallback((itemId: string) => {
    setShowEditItemModal(itemId);
  }, []);

  const handleRestockItem = useCallback((itemId: string) => {
    // Implement restock logic
    console.log('Restock item:', itemId);
  }, []);

  // Handlers for metrics
  const toggleMetric = useCallback((metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  }, []);

  // Helper function to safely access optimized routes
  const getOptimizedRoute = useCallback((warehouseId: string | null) => {
    if (!warehouseId) return null;
    return optimizedRoutes[warehouseId] || null;
  }, [optimizedRoutes]);

  // Update route display logic
  const renderRouteLine = useCallback(() => {
    const route = getOptimizedRoute(selectedWarehouse);
    if (!route || !route.route.length) return null;
    
    return (
      <Polyline
        positions={route.route}
        color="#2563eb"
        weight={3}
      />
    );
  }, [selectedWarehouse, getOptimizedRoute]);

  // Update metrics display
  const renderRouteMetrics = useCallback(() => {
    const route = getOptimizedRoute(selectedWarehouse);
    if (!route) return null;

    return (
      <div className="route-metrics">
        <div className="route-metric">
          <span>Total Distance:</span>
          <span>{route.distance.toFixed(2)} miles</span>
        </div>
        <div className="route-metric">
          <span>Estimated Time:</span>
          <span>{route.time.toFixed(2)} hours</span>
        </div>
        <div className="route-metric">
          <span>Fuel Cost:</span>
          <span>${(route.emissions * 0.0002).toFixed(2)}</span>
        </div>
        <div className="route-metric">
          <span>CO₂ Emissions:</span>
          <span>{route.emissions.toFixed(2)} kg</span>
        </div>
      </div>
    );
  }, [selectedWarehouse, getOptimizedRoute]);

  return (
    <div className="logistics-dashboard">
      <div className="dashboard-header">
        <h2>Logistics Dashboard</h2>
        <div className="dashboard-tabs">
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
            Performance Metrics
          </button>
          <button 
            className={`tab-button ${activeTab === 'routes' ? 'active' : ''}`}
            onClick={() => setActiveTab('routes')}
          >
            Route Optimization
          </button>
          <button 
            className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory Management
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
                {mockWarehouses.map((warehouse) => (
                  <Marker
                    key={`warehouse-${warehouse.id}`}
                    position={warehouse.location as [number, number]}
                    icon={warehouseIcon}
                    eventHandlers={{
                      click: () => handleWarehouseSelect(warehouse.id)
                    }}
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
                {mockShipments.map((shipment) => (
                  <Marker
                    key={shipment.id}
                    position={shipment.location as [number, number]}
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
                        <p>Last Update: {shipment.lastUpdate}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {showRouteLines && renderRouteLine()}
              </MapContainer>
            </div>
            <div className="shipment-controls">
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="Search shipments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="status-filter"
                >
                  <option value="all">All Status</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="pending">Pending</option>
                </select>
                <label className="route-toggle">
                  <input
                    type="checkbox"
                    checked={showRouteLines}
                    onChange={(e) => setShowRouteLines(e.target.checked)}
                  />
                  Show Routes
                </label>
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
                    {filteredShipments().map((shipment) => (
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
                          <button className="action-button view" onClick={(e) => {
                            e.stopPropagation();
                            handleViewShipment(shipment.id);
                          }}>View</button>
                          <button className="action-button edit" onClick={(e) => {
                            e.stopPropagation();
                            handleEditShipment(shipment.id);
                          }}>Edit</button>
                          <button className="action-button delete" onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShipment(shipment.id);
                          }}>Delete</button>
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
              <div className="chart-container">
                <h3>Delivery Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="onTime" fill="#00b894" name="On Time" />
                    <Bar dataKey="delayed" fill="#ff7675" name="Delayed" />
                  </BarChart>
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
                {mockWarehouses.map((warehouse) => (
                  <Marker
                    key={`warehouse-${warehouse.id}`}
                    position={warehouse.location as [number, number]}
                    icon={warehouseIcon}
                    eventHandlers={{
                      click: () => handleWarehouseSelect(warehouse.id)
                    }}
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
                {renderRouteLine()}
              </MapContainer>
            </div>
            <div className="route-controls">
              <div className="warehouse-selector">
                <h3>Select Starting Warehouse</h3>
                <div className="warehouse-list">
                  {mockWarehouses.map((warehouse) => (
                    <button
                      key={warehouse.id}
                      className={`warehouse-button ${selectedWarehouse === warehouse.id ? 'active' : ''}`}
                      onClick={() => handleWarehouseSelect(warehouse.id)}
                    >
                      <span className="warehouse-name">{warehouse.name}</span>
                      <span className="warehouse-capacity">{warehouse.capacity} units</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="optimization-options">
                <button className="optimize-button" onClick={handleOptimizeRoutes}>Optimize Routes</button>
                <button className="save-button">Save Route</button>
              </div>
              {renderRouteMetrics()}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="inventory-section">
            <div className="inventory-header">
              <h3>Inventory Management</h3>
              <div className="inventory-actions">
                <input
                  type="text"
                  placeholder="Search inventory..."
                  className="inventory-search"
                />
                <select className="category-filter">
                  <option value="all">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                </select>
                <button className="add-item-button" onClick={handleAddItem}>Add Item</button>
              </div>
            </div>
            <div className="inventory-stats">
              <div className="inventory-stat-card">
                <h4>Total Items</h4>
                <div className="stat-value">475</div>
                <div className="stat-trend positive">↑ 12%</div>
              </div>
              <div className="inventory-stat-card">
                <h4>Low Stock Items</h4>
                <div className="stat-value">8</div>
                <div className="stat-trend negative">↑ 2</div>
              </div>
              <div className="inventory-stat-card">
                <h4>Out of Stock</h4>
                <div className="stat-value">3</div>
                <div className="stat-trend neutral">→</div>
              </div>
            </div>
            <div className="inventory-table">
              <table>
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Last Restock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockInventory.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity}</td>
                      <td>{item.location}</td>
                      <td>
                        <span className={`status-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.lastRestock}</td>
                      <td>
                        <button className="action-button edit" onClick={() => handleEditItem(item.id)}>Edit</button>
                        <button className="action-button delete">Delete</button>
                        <button className="action-button restock">Restock</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals - Only render when explicitly triggered */}
      {showShipmentDetails && (
        <div className="modal" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowShipmentDetails(null);
          }
        }}>
          <div className="modal-content">
            <h3>Shipment Details</h3>
            {/* Add shipment details content */}
            <div className="modal-actions">
              <button onClick={() => setShowShipmentDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showWarehouseDetails && (
        <div className="modal" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowWarehouseDetails(null);
          }
        }}>
          <div className="modal-content">
            <h3>Warehouse Details</h3>
            {/* Add warehouse details content */}
            <div className="modal-actions">
              <button onClick={() => setShowWarehouseDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowDeleteConfirm(null);
          }
        }}>
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this item?</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button onClick={() => {
                confirmDeleteShipment(showDeleteConfirm);
                setShowDeleteConfirm(null);
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showOptimizationModal && (
        <div className="modal" onClick={(e) => {
          if (e.target === e.currentTarget && !optimizationInProgress) {
            setShowOptimizationModal(false);
          }
        }}>
          <div className="modal-content">
            <h3>Route Optimization</h3>
            {optimizationInProgress ? (
              <div className="optimization-progress">
                <p>Optimizing routes...</p>
                <div className="progress-bar"></div>
              </div>
            ) : (
              <div className="modal-actions">
                <button onClick={() => setShowOptimizationModal(false)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsDashboard; 