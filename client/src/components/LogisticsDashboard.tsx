import React, { useState, useEffect } from 'react';
import '../styles/LogisticsDashboard.css';

// Interface definitions
interface Vehicle {
  id: string;
  licensePlate: string;
  type: string;
  status: 'active' | 'maintenance' | 'idle';
  driver?: string;
  location: string;
  fuelLevel: number;
  mileage: number;
  color: string;
  capacity: string;
  lastService: string;
}

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'available' | 'driving' | 'off-duty';
  licenseClass: string;
  experience: number;
  rating: number;
  currentVehicle?: string;
  color: string;
  totalDeliveries: number;
  hoursWorked: number;
  hourlyRate: number;
}

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed';
  driver?: string;
  vehicle?: string;
  cargo: string;
  weight: number;
  priority: 'low' | 'medium' | 'high';
  estimatedDelivery: string;
  actualDelivery?: string;
  cost: number;
  distance: number;
  createdDate: string;
}

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: number;
  fuelCost: number;
  tollCost: number;
  driver?: string;
  vehicle?: string;
  status: 'planned' | 'active' | 'completed';
}

const LogisticsDashboard: React.FC = () => {
  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  
  // Modal states
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [showGraphsModal, setShowGraphsModal] = useState(false);
  const [showVehicleDetailModal, setShowVehicleDetailModal] = useState(false);
  const [showDriverDetailModal, setShowDriverDetailModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  // Form states
  const [vehicleForm, setVehicleForm] = useState({
    licensePlate: '',
    type: 'truck',
    location: '',
    capacity: '',
    color: '#3b82f6'
  });
  
  const [driverForm, setDriverForm] = useState({
    name: '',
    email: '',
    phone: '',
    licenseClass: 'CDL-A',
    experience: 0,
    hourlyRate: 25,
    color: '#3b82f6'
  });
  
  const [shipmentForm, setShipmentForm] = useState({
    origin: '',
    destination: '',
    cargo: '',
    weight: 0,
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimatedDelivery: '',
    driver: '',
    vehicle: '',
    cost: 0,
    distance: 0
  });
  
  const [routeForm, setRouteForm] = useState({
    name: '',
    origin: '',
    destination: '',
    distance: 0,
    estimatedTime: 0,
    fuelCost: 0,
    tollCost: 0,
    driver: '',
    vehicle: ''
  });

  // Firebase simulation with data persistence
  const generateSampleData = () => {
    console.log('🚛 Sample data loaded for Business Logistics Demo');
    
    // Simulate Firebase data loading with realistic delay
    setTimeout(() => {
      console.log('📊 Firebase simulation: Data refreshed from cloud database');
    }, 500);
    
    const sampleVehicles: Vehicle[] = [
      {
        id: 'VEH001',
        licensePlate: 'TRK-4501',
        type: 'Semi-Truck',
        status: 'active',
        driver: 'DRV001',
        location: 'Los Angeles, CA',
        fuelLevel: 75,
        mileage: 125000,
        color: '#3b82f6',
        capacity: '40 tons',
        lastService: '2024-05-15'
      },
      {
        id: 'VEH002',
        licensePlate: 'VAN-2301',
        type: 'Delivery Van',
        status: 'active',
        driver: 'DRV002',
        location: 'Phoenix, AZ',
        fuelLevel: 60,
        mileage: 87000,
        color: '#10b981',
        capacity: '3 tons',
        lastService: '2024-06-01'
      },
      {
        id: 'VEH003',
        licensePlate: 'TRK-7892',
        type: 'Box Truck',
        status: 'maintenance',
        location: 'Denver, CO',
        fuelLevel: 25,
        mileage: 156000,
        color: '#f59e0b',
        capacity: '12 tons',
        lastService: '2024-04-20'
      },
      {
        id: 'VEH004',
        licensePlate: 'VAN-5647',
        type: 'Cargo Van',
        status: 'idle',
        location: 'Dallas, TX',
        fuelLevel: 90,
        mileage: 45000,
        color: '#8b5cf6',
        capacity: '2 tons',
        lastService: '2024-06-10'
      },
      {
        id: 'VEH005',
        licensePlate: 'TRK-9034',
        type: 'Flatbed Truck',
        status: 'active',
        driver: 'DRV005',
        location: 'Miami, FL',
        fuelLevel: 80,
        mileage: 98000,
        color: '#ef4444',
        capacity: '25 tons',
        lastService: '2024-05-28'
      },
      {
        id: 'VEH006',
        licensePlate: 'TRK-1127',
        type: 'Refrigerated Truck',
        status: 'active',
        driver: 'DRV003',
        location: 'Seattle, WA',
        fuelLevel: 85,
        mileage: 67000,
        color: '#06b6d4',
        capacity: '18 tons',
        lastService: '2024-06-05'
      }
    ];

    const sampleDrivers: Driver[] = [
      {
        id: 'DRV001',
        name: 'Marcus Johnson',
        email: 'marcus.johnson@logistics.com',
        phone: '(555) 123-4567',
        status: 'driving',
        licenseClass: 'CDL-A',
        experience: 12,
        rating: 4.8,
        currentVehicle: 'VEH001',
        color: '#3b82f6',
        totalDeliveries: 1247,
        hoursWorked: 2080,
        hourlyRate: 28
      },
      {
        id: 'DRV002',
        name: 'Sarah Chen',
        email: 'sarah.chen@logistics.com',
        phone: '(555) 234-5678',
        status: 'driving',
        licenseClass: 'CDL-B',
        experience: 8,
        rating: 4.9,
        currentVehicle: 'VEH002',
        color: '#10b981',
        totalDeliveries: 892,
        hoursWorked: 1664,
        hourlyRate: 26
      },
      {
        id: 'DRV003',
        name: 'Robert Davis',
        email: 'robert.davis@logistics.com',
        phone: '(555) 345-6789',
        status: 'driving',
        licenseClass: 'CDL-A',
        experience: 15,
        rating: 4.7,
        currentVehicle: 'VEH006',
        color: '#06b6d4',
        totalDeliveries: 1563,
        hoursWorked: 3120,
        hourlyRate: 32
      },
      {
        id: 'DRV004',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@logistics.com',
        phone: '(555) 456-7890',
        status: 'available',
        licenseClass: 'CDL-B',
        experience: 6,
        rating: 4.6,
        color: '#8b5cf6',
        totalDeliveries: 634,
        hoursWorked: 1248,
        hourlyRate: 24
      },
      {
        id: 'DRV005',
        name: 'David Wilson',
        email: 'david.wilson@logistics.com',
        phone: '(555) 567-8901',
        status: 'driving',
        licenseClass: 'CDL-A',
        experience: 10,
        rating: 4.8,
        currentVehicle: 'VEH005',
        color: '#ef4444',
        totalDeliveries: 1089,
        hoursWorked: 2080,
        hourlyRate: 29
      },
      {
        id: 'DRV006',
        name: 'Lisa Thompson',
        email: 'lisa.thompson@logistics.com',
        phone: '(555) 678-9012',
        status: 'off-duty',
        licenseClass: 'CDL-B',
        experience: 4,
        rating: 4.5,
        color: '#f59e0b',
        totalDeliveries: 387,
        hoursWorked: 832,
        hourlyRate: 22
      }
    ];

    const sampleShipments: Shipment[] = [
      {
        id: 'SHP001',
        origin: 'Los Angeles, CA',
        destination: 'Las Vegas, NV',
        status: 'in-transit',
        driver: 'DRV001',
        vehicle: 'VEH001',
        cargo: 'Electronics',
        weight: 15000,
        priority: 'high',
        estimatedDelivery: '2024-06-20',
        cost: 2500,
        distance: 270,
        createdDate: '2024-06-18'
      },
      {
        id: 'SHP002',
        origin: 'Phoenix, AZ',
        destination: 'Albuquerque, NM',
        status: 'in-transit',
        driver: 'DRV002',
        vehicle: 'VEH002',
        cargo: 'Medical Supplies',
        weight: 800,
        priority: 'high',
        estimatedDelivery: '2024-06-21',
        cost: 1200,
        distance: 220,
        createdDate: '2024-06-19'
      },
      {
        id: 'SHP003',
        origin: 'Dallas, TX',
        destination: 'Houston, TX',
        status: 'pending',
        cargo: 'Automotive Parts',
        weight: 5000,
        priority: 'medium',
        estimatedDelivery: '2024-06-22',
        cost: 800,
        distance: 240,
        createdDate: '2024-06-19'
      },
      {
        id: 'SHP004',
        origin: 'Miami, FL',
        destination: 'Tampa, FL',
        status: 'in-transit',
        driver: 'DRV005',
        vehicle: 'VEH005',
        cargo: 'Construction Materials',
        weight: 22000,
        priority: 'medium',
        estimatedDelivery: '2024-06-20',
        cost: 1500,
        distance: 280,
        createdDate: '2024-06-18'
      },
      {
        id: 'SHP005',
        origin: 'Denver, CO',
        destination: 'Salt Lake City, UT',
        status: 'delayed',
        cargo: 'Food Products',
        weight: 3500,
        priority: 'high',
        estimatedDelivery: '2024-06-21',
        cost: 1100,
        distance: 350,
        createdDate: '2024-06-17'
      }
    ];

    const sampleRoutes: Route[] = [
      {
        id: 'RTE001',
        name: 'West Coast Express',
        origin: 'Los Angeles, CA',
        destination: 'Las Vegas, NV',
        distance: 270,
        estimatedTime: 4,
        fuelCost: 120,
        tollCost: 25,
        driver: 'DRV001',
        vehicle: 'VEH001',
        status: 'active'
      },
      {
        id: 'RTE002',
        name: 'Southwest Corridor',
        origin: 'Phoenix, AZ',
        destination: 'Albuquerque, NM',
        distance: 220,
        estimatedTime: 3.5,
        fuelCost: 95,
        tollCost: 15,
        driver: 'DRV002',
        vehicle: 'VEH002',
        status: 'active'
      },
      {
        id: 'RTE003',
        name: 'Texas Triangle',
        origin: 'Dallas, TX',
        destination: 'Houston, TX',
        distance: 240,
        estimatedTime: 3.5,
        fuelCost: 85,
        tollCost: 20,
        status: 'planned'
      },
      {
        id: 'RTE004',
        name: 'Florida Connection',
        origin: 'Miami, FL',
        destination: 'Tampa, FL',
        distance: 280,
        estimatedTime: 4.5,
        fuelCost: 110,
        tollCost: 30,
        driver: 'DRV005',
        vehicle: 'VEH005',
        status: 'active'
      }
    ];

    setVehicles(sampleVehicles);
    setDrivers(sampleDrivers);
    setShipments(sampleShipments);
    setRoutes(sampleRoutes);
  };

  // Load sample data on component mount
  useEffect(() => {
    generateSampleData();
  }, []);

  // Handler functions
  const addVehicle = () => {
    const newVehicle: Vehicle = {
      id: `VEH${String(vehicles.length + 1).padStart(3, '0')}`,
      licensePlate: vehicleForm.licensePlate,
      type: vehicleForm.type,
      status: 'idle',
      location: vehicleForm.location,
      fuelLevel: 100,
      mileage: 0,
      color: vehicleForm.color,
      capacity: vehicleForm.capacity,
      lastService: new Date().toISOString().split('T')[0]
    };
    
    setVehicles([...vehicles, newVehicle]);
    setVehicleForm({
      licensePlate: '',
      type: 'truck',
      location: '',
      capacity: '',
      color: '#3b82f6'
    });
    setShowVehicleModal(false);
  };

  const addDriver = () => {
    const newDriver: Driver = {
      id: `DRV${String(drivers.length + 1).padStart(3, '0')}`,
      name: driverForm.name,
      email: driverForm.email,
      phone: driverForm.phone,
      status: 'available',
      licenseClass: driverForm.licenseClass,
      experience: driverForm.experience,
      rating: 4.5,
      color: driverForm.color,
      totalDeliveries: 0,
      hoursWorked: 0,
      hourlyRate: driverForm.hourlyRate
    };
    
    setDrivers([...drivers, newDriver]);
    setDriverForm({
      name: '',
      email: '',
      phone: '',
      licenseClass: 'CDL-A',
      experience: 0,
      hourlyRate: 25,
      color: '#3b82f6'
    });
    setShowDriverModal(false);
  };

  const addShipment = () => {
    const newShipment: Shipment = {
      id: `SHP${String(shipments.length + 1).padStart(3, '0')}`,
      origin: shipmentForm.origin,
      destination: shipmentForm.destination,
      status: 'pending',
      driver: shipmentForm.driver || undefined,
      vehicle: shipmentForm.vehicle || undefined,
      cargo: shipmentForm.cargo,
      weight: shipmentForm.weight,
      priority: shipmentForm.priority,
      estimatedDelivery: shipmentForm.estimatedDelivery,
      cost: shipmentForm.cost,
      distance: shipmentForm.distance,
      createdDate: new Date().toISOString().split('T')[0]
    };
    
    setShipments([...shipments, newShipment]);
    setShipmentForm({
      origin: '',
      destination: '',
      cargo: '',
      weight: 0,
      priority: 'medium',
      estimatedDelivery: '',
      driver: '',
      vehicle: '',
      cost: 0,
      distance: 0
    });
    setShowShipmentModal(false);
  };

  const addRoute = () => {
    const newRoute: Route = {
      id: `RTE${String(routes.length + 1).padStart(3, '0')}`,
      name: routeForm.name,
      origin: routeForm.origin,
      destination: routeForm.destination,
      distance: routeForm.distance,
      estimatedTime: routeForm.estimatedTime,
      fuelCost: routeForm.fuelCost,
      tollCost: routeForm.tollCost,
      driver: routeForm.driver || undefined,
      vehicle: routeForm.vehicle || undefined,
      status: 'planned'
    };
    
    setRoutes([...routes, newRoute]);
    setRouteForm({
      name: '',
      origin: '',
      destination: '',
      distance: 0,
      estimatedTime: 0,
      fuelCost: 0,
      tollCost: 0,
      driver: '',
      vehicle: ''
    });
    setShowRouteModal(false);
  };

  return (
    <div className="logistics-dashboard">
      <div className="secondary-nav">
        <button 
          className="nav-action-button"
          onClick={() => setShowVehicleModal(true)}
        >
          Add Vehicle
        </button>
        <button 
          className="nav-action-button"
          onClick={() => setShowDriverModal(true)}
        >
          Add Driver
        </button>
        <button 
          className="nav-action-button"
          onClick={() => setShowShipmentModal(true)}
        >
          Add Shipment
        </button>
        <button 
          className="nav-action-button"
          onClick={() => setShowRouteModal(true)}
        >
          Add Route
        </button>
        <button 
          className="nav-action-button"
          onClick={() => setShowStatisticsModal(true)}
        >
          Statistics
        </button>
        <button 
          className="nav-action-button"
          onClick={() => setShowGraphsModal(true)}
        >
          Graphs
        </button>
      </div>

      <div className="main-content">
        <div className="content-grid">
          <div className="fleet-section">
            <h3>Fleet Management</h3>
            <div className="fleet-grid">
              <div className="vehicles-panel">
                <h4>Vehicles ({vehicles.length})</h4>
                <div className="vehicles-list">
                  {vehicles.map(vehicle => (
                    <div 
                      key={vehicle.id} 
                      className="vehicle-card"
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setShowVehicleDetailModal(true);
                      }}
                    >
                      <div className="vehicle-header">
                        <div 
                          className="vehicle-avatar"
                          style={{ backgroundColor: vehicle.color }}
                        >
                          🚛
                        </div>
                        <div className="vehicle-info">
                          <h5>{vehicle.licensePlate}</h5>
                          <p>{vehicle.type}</p>
                        </div>
                      </div>
                      <div className="vehicle-status">
                        <span className={`status-badge ${vehicle.status}`}>
                          {vehicle.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="drivers-panel">
                <h4>Drivers ({drivers.length})</h4>
                <div className="drivers-list">
                  {drivers.map(driver => (
                    <div 
                      key={driver.id} 
                      className="driver-card"
                      onClick={() => {
                        setSelectedDriver(driver);
                        setShowDriverDetailModal(true);
                      }}
                    >
                      <div className="driver-header">
                        <div 
                          className="driver-avatar"
                          style={{ backgroundColor: driver.color }}
                        >
                          {driver.name.charAt(0)}
                        </div>
                        <div className="driver-info">
                          <h5>{driver.name}</h5>
                          <p>{driver.licenseClass}</p>
                        </div>
                      </div>
                      <div className="driver-status">
                        <span className={`status-badge ${driver.status}`}>
                          {driver.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="operations-section">
            <h3>Operations</h3>
            <div className="operations-grid">
              <div className="shipments-panel">
                <h4>Active Shipments ({shipments.filter(s => s.status !== 'delivered').length})</h4>
                <div className="shipments-list">
                  {shipments.filter(s => s.status !== 'delivered').map(shipment => (
                    <div key={shipment.id} className="shipment-card">
                      <div className="shipment-header">
                        <span className="shipment-id">{shipment.id}</span>
                        <span className={`priority-badge ${shipment.priority}`}>
                          {shipment.priority}
                        </span>
                      </div>
                      <div className="shipment-route">
                        <span className="origin">{shipment.origin}</span>
                        <span className="arrow">→</span>
                        <span className="destination">{shipment.destination}</span>
                      </div>
                      <div className="shipment-details">
                        <p><strong>Cargo:</strong> {shipment.cargo}</p>
                        <p><strong>Weight:</strong> {shipment.weight} kg</p>
                        <p><strong>ETA:</strong> {shipment.estimatedDelivery}</p>
                      </div>
                      <div className="shipment-status">
                        <span className={`status-badge ${shipment.status}`}>
                          {shipment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="routes-panel">
                <h4>Active Routes ({routes.filter(r => r.status === 'active').length})</h4>
                <div className="routes-list">
                  {routes.filter(r => r.status === 'active').map(route => (
                    <div key={route.id} className="route-card">
                      <div className="route-header">
                        <h5>{route.name}</h5>
                        <span className={`status-badge ${route.status}`}>
                          {route.status}
                        </span>
                      </div>
                      <div className="route-details">
                        <p><strong>Route:</strong> {route.origin} → {route.destination}</p>
                        <p><strong>Distance:</strong> {route.distance} km</p>
                        <p><strong>Est. Time:</strong> {route.estimatedTime} hrs</p>
                        <p><strong>Cost:</strong> ${route.fuelCost + route.tollCost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      
      {/* Add Vehicle Modal */}
      {showVehicleModal && (
        <div className="log-modal-backdrop" onClick={() => setShowVehicleModal(false)}>
          <div className="log-modal-container large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="log-modal-head">
              <h3 className="log-modal-title">Add New Vehicle</h3>
              <button 
                className="log-close-button"
                onClick={() => setShowVehicleModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="log-modal-body">
              <div className="log-form-field">
                <label className="log-field-label">License Plate</label>
                <input
                  type="text"
                  className="log-field-input"
                  value={vehicleForm.licensePlate}
                  onChange={(e) => setVehicleForm({...vehicleForm, licensePlate: e.target.value})}
                  placeholder="Enter license plate"
                />
              </div>
              <div className="log-form-field">
                <label className="log-field-label">Vehicle Type</label>
                <select
                  className="log-field-select"
                  value={vehicleForm.type}
                  onChange={(e) => setVehicleForm({...vehicleForm, type: e.target.value})}
                >
                  <option value="Semi-Truck">Semi-Truck</option>
                  <option value="Box Truck">Box Truck</option>
                  <option value="Delivery Van">Delivery Van</option>
                  <option value="Cargo Van">Cargo Van</option>
                  <option value="Flatbed Truck">Flatbed Truck</option>
                </select>
              </div>
              <div className="log-form-field">
                <label className="log-field-label">Location</label>
                <input
                  type="text"
                  className="log-field-input"
                  value={vehicleForm.location}
                  onChange={(e) => setVehicleForm({...vehicleForm, location: e.target.value})}
                  placeholder="Enter current location"
                />
              </div>
              <div className="log-form-field">
                <label className="log-field-label">Capacity</label>
                <input
                  type="text"
                  className="log-field-input"
                  value={vehicleForm.capacity}
                  onChange={(e) => setVehicleForm({...vehicleForm, capacity: e.target.value})}
                  placeholder="e.g., 40 tons, 3 tons"
                />
              </div>
              <div className="log-form-field">
                <label className="log-field-label">Color</label>
                <input
                  type="color"
                  className="log-field-input color-input"
                  value={vehicleForm.color}
                  onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                />
              </div>
            </div>
            <div className="log-modal-footer">
              <button 
                className="log-cancel-button"
                onClick={() => setShowVehicleModal(false)}
              >
                Cancel
              </button>
              <button 
                className="log-submit-button"
                onClick={addVehicle}
              >
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {showDriverModal && (
        <div className="log-modal-backdrop" onClick={() => setShowDriverModal(false)}>
          <div className="log-modal-container large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="log-modal-head">
              <h3 className="log-modal-title">Add New Driver</h3>
              <button 
                className="log-close-button"
                onClick={() => setShowDriverModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="log-modal-body">
              <div className="log-form-field">
                <label className="log-field-label">Name</label>
                <input
                  type="text"
                  className="log-field-input"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({...driverForm, name: e.target.value})}
                  placeholder="Enter driver name"
                />
              </div>
              <div className="log-form-field">
                <label className="log-field-label">Email</label>
                <input
                  type="email"
                  className="log-field-input"
                  value={driverForm.email}
                  onChange={(e) => setDriverForm({...driverForm, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="log-form-field">
                <label className="log-field-label">Phone</label>
                <input
                  type="tel"
                  className="log-field-input"
                  value={driverForm.phone}
                  onChange={(e) => setDriverForm({...driverForm, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="log-form-field">
                <label className="log-field-label">License Class</label>
                <select
                  className="log-field-select"
                  value={driverForm.licenseClass}
                  onChange={(e) => setDriverForm({...driverForm, licenseClass: e.target.value})}
                >
                  <option value="CDL-A">CDL-A</option>
                  <option value="CDL-B">CDL-B</option>
                  <option value="CDL-C">CDL-C</option>
                </select>
              </div>
              <div className="log-form-field">
                <label className="log-field-label">Experience (years)</label>
                <input
                  type="number"
                  className="log-field-input"
                  value={driverForm.experience}
                  onChange={(e) => setDriverForm({...driverForm, experience: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>
              <div className="log-form-field">
                <label className="log-field-label">Hourly Rate ($)</label>
                <input
                  type="number"
                  className="log-field-input"
                  value={driverForm.hourlyRate}
                  onChange={(e) => setDriverForm({...driverForm, hourlyRate: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>
              <div className="log-form-field">
                <label className="log-field-label">Color</label>
                <input
                  type="color"
                  className="log-field-input color-input"
                  value={driverForm.color}
                  onChange={(e) => setDriverForm({...driverForm, color: e.target.value})}
                />
              </div>
            </div>
            <div className="log-modal-footer">
              <button 
                className="log-cancel-button"
                onClick={() => setShowDriverModal(false)}
              >
                Cancel
              </button>
              <button 
                className="log-submit-button"
                onClick={addDriver}
              >
                Add Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Shipment Modal */}
      {showShipmentModal && (
        <div className="log-modal-backdrop" onClick={() => setShowShipmentModal(false)}>
          <div className="log-modal-container extra-large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="log-modal-head">
              <h3 className="log-modal-title">Add New Shipment</h3>
              <button 
                className="log-close-button"
                onClick={() => setShowShipmentModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="log-modal-body">
              <div className="log-form-row">
                <div className="log-form-field">
                  <label className="log-field-label">Origin</label>
                  <input
                    type="text"
                    className="log-field-input"
                    value={shipmentForm.origin}
                    onChange={(e) => setShipmentForm({...shipmentForm, origin: e.target.value})}
                    placeholder="Enter origin location"
                  />
                </div>
                <div className="log-form-field">
                  <label className="log-field-label">Destination</label>
                  <input
                    type="text"
                    className="log-field-input"
                    value={shipmentForm.destination}
                    onChange={(e) => setShipmentForm({...shipmentForm, destination: e.target.value})}
                    placeholder="Enter destination"
                  />
                </div>
              </div>
              <div className="log-form-field">
                <label className="log-field-label">Cargo Description</label>
                <input
                  type="text"
                  className="log-field-input"
                  value={shipmentForm.cargo}
                  onChange={(e) => setShipmentForm({...shipmentForm, cargo: e.target.value})}
                  placeholder="Describe the cargo"
                />
              </div>
              <div className="log-form-row">
                <div className="log-form-field">
                  <label className="log-field-label">Weight (kg)</label>
                  <input
                    type="number"
                    className="log-field-input"
                    value={shipmentForm.weight}
                    onChange={(e) => setShipmentForm({...shipmentForm, weight: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <div className="log-form-field">
                  <label className="log-field-label">Priority</label>
                  <select
                    className="log-field-select"
                    value={shipmentForm.priority}
                    onChange={(e) => setShipmentForm({...shipmentForm, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="log-form-row">
                <div className="log-form-field">
                  <label className="log-field-label">Estimated Delivery</label>
                  <input
                    type="date"
                    className="log-field-input"
                    value={shipmentForm.estimatedDelivery}
                    onChange={(e) => setShipmentForm({...shipmentForm, estimatedDelivery: e.target.value})}
                  />
                </div>
                <div className="log-form-field">
                  <label className="log-field-label">Distance (km)</label>
                  <input
                    type="number"
                    className="log-field-input"
                    value={shipmentForm.distance}
                    onChange={(e) => setShipmentForm({...shipmentForm, distance: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
              </div>
              <div className="log-form-row">
                <div className="log-form-field">
                  <label className="log-field-label">Cost ($)</label>
                  <input
                    type="number"
                    className="log-field-input"
                    value={shipmentForm.cost}
                    onChange={(e) => setShipmentForm({...shipmentForm, cost: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <div className="log-form-field">
                  <label className="log-field-label">Assign Driver (Optional)</label>
                  <select
                    className="log-field-select"
                    value={shipmentForm.driver}
                    onChange={(e) => setShipmentForm({...shipmentForm, driver: e.target.value})}
                  >
                    <option value="">Select Driver</option>
                    {drivers.filter(d => d.status === 'available').map(driver => (
                      <option key={driver.id} value={driver.id}>{driver.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="log-form-field">
                <label className="log-field-label">Assign Vehicle (Optional)</label>
                <select
                  className="log-field-select"
                  value={shipmentForm.vehicle}
                  onChange={(e) => setShipmentForm({...shipmentForm, vehicle: e.target.value})}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.filter(v => v.status === 'idle' || v.status === 'active').map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.licensePlate} - {vehicle.type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="log-modal-footer">
              <button 
                className="log-cancel-button"
                onClick={() => setShowShipmentModal(false)}
              >
                Cancel
              </button>
              <button 
                className="log-submit-button"
                onClick={addShipment}
              >
                Add Shipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showRouteModal && (
        <div className="log-modal-backdrop" onClick={() => setShowRouteModal(false)}>
          <div className="log-modal-container large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="log-modal-head">
              <h3 className="log-modal-title">Add New Route</h3>
              <button 
                className="log-close-button"
                onClick={() => setShowRouteModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="log-modal-body">
              <div className="log-form-field">
                <label className="log-field-label">Route Name</label>
                <input
                  type="text"
                  className="log-field-input"
                  value={routeForm.name}
                  onChange={(e) => setRouteForm({...routeForm, name: e.target.value})}
                  placeholder="Enter route name"
                />
              </div>
              <div className="log-form-row">
                <div className="log-form-field">
                  <label className="log-field-label">Origin</label>
                  <input
                    type="text"
                    className="log-field-input"
                    value={routeForm.origin}
                    onChange={(e) => setRouteForm({...routeForm, origin: e.target.value})}
                    placeholder="Enter origin"
                  />
                </div>
                <div className="log-form-field">
                  <label className="log-field-label">Destination</label>
                  <input
                    type="text"
                    className="log-field-input"
                    value={routeForm.destination}
                    onChange={(e) => setRouteForm({...routeForm, destination: e.target.value})}
                    placeholder="Enter destination"
                  />
                </div>
              </div>
              <div className="log-form-row">
                <div className="log-form-field">
                  <label className="log-field-label">Distance (km)</label>
                  <input
                    type="number"
                    className="log-field-input"
                    value={routeForm.distance}
                    onChange={(e) => setRouteForm({...routeForm, distance: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <div className="log-form-field">
                  <label className="log-field-label">Estimated Time (hrs)</label>
                  <input
                    type="number"
                    className="log-field-input"
                    value={routeForm.estimatedTime}
                    onChange={(e) => setRouteForm({...routeForm, estimatedTime: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
              <div className="log-form-row">
                <div className="log-form-field">
                  <label className="log-field-label">Fuel Cost ($)</label>
                  <input
                    type="number"
                    className="log-field-input"
                    value={routeForm.fuelCost}
                    onChange={(e) => setRouteForm({...routeForm, fuelCost: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <div className="log-form-field">
                  <label className="log-field-label">Toll Cost ($)</label>
                  <input
                    type="number"
                    className="log-field-input"
                    value={routeForm.tollCost}
                    onChange={(e) => setRouteForm({...routeForm, tollCost: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
              </div>
              <div className="log-form-row">
                <div className="log-form-field">
                  <label className="log-field-label">Assign Driver (Optional)</label>
                  <select
                    className="log-field-select"
                    value={routeForm.driver}
                    onChange={(e) => setRouteForm({...routeForm, driver: e.target.value})}
                  >
                    <option value="">Select Driver</option>
                    {drivers.filter(d => d.status === 'available').map(driver => (
                      <option key={driver.id} value={driver.id}>{driver.name}</option>
                    ))}
                  </select>
                </div>
                <div className="log-form-field">
                  <label className="log-field-label">Assign Vehicle (Optional)</label>
                  <select
                    className="log-field-select"
                    value={routeForm.vehicle}
                    onChange={(e) => setRouteForm({...routeForm, vehicle: e.target.value})}
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.filter(v => v.status === 'idle' || v.status === 'active').map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>{vehicle.licensePlate} - {vehicle.type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="log-modal-footer">
              <button 
                className="log-cancel-button"
                onClick={() => setShowRouteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="log-submit-button"
                onClick={addRoute}
              >
                Add Route
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatisticsModal && (
        <div className="log-modal-backdrop" onClick={() => setShowStatisticsModal(false)}>
          <div className="log-modal-container extra-large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="log-modal-head">
              <h3 className="log-modal-title">📊 Logistics Statistics & Analytics</h3>
              <button 
                className="log-close-button"
                onClick={() => setShowStatisticsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="log-modal-body">
              <div className="stats-grid">
                {/* Fleet Overview */}
                <div className="stats-section">
                  <h4>🚛 Fleet Overview</h4>
                  <div className="stats-cards">
                    <div className="stat-card">
                      <div className="stat-value">{vehicles.length}</div>
                      <div className="stat-label">Total Vehicles</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{vehicles.filter(v => v.status === 'active').length}</div>
                      <div className="stat-label">Active Vehicles</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{Math.round(vehicles.reduce((sum, v) => sum + v.fuelLevel, 0) / vehicles.length)}%</div>
                      <div className="stat-label">Avg Fuel Level</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{Math.round(vehicles.reduce((sum, v) => sum + v.mileage, 0) / vehicles.length).toLocaleString()}</div>
                      <div className="stat-label">Avg Mileage</div>
                    </div>
                  </div>
                </div>

                {/* Driver Statistics */}
                <div className="stats-section">
                  <h4>👥 Driver Statistics</h4>
                  <div className="stats-cards">
                    <div className="stat-card">
                      <div className="stat-value">{drivers.length}</div>
                      <div className="stat-label">Total Drivers</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{drivers.filter(d => d.status === 'driving').length}</div>
                      <div className="stat-label">Currently Driving</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)}</div>
                      <div className="stat-label">Avg Rating</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">${Math.round(drivers.reduce((sum, d) => sum + d.hourlyRate, 0) / drivers.length)}</div>
                      <div className="stat-label">Avg Hourly Rate</div>
                    </div>
                  </div>
                </div>

                {/* Operations Statistics */}
                <div className="stats-section">
                  <h4>📦 Operations</h4>
                  <div className="stats-cards">
                    <div className="stat-card">
                      <div className="stat-value">{shipments.length}</div>
                      <div className="stat-label">Total Shipments</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{shipments.filter(s => s.status === 'in-transit').length}</div>
                      <div className="stat-label">In Transit</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{shipments.filter(s => s.status === 'delivered').length}</div>
                      <div className="stat-label">Delivered</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">${shipments.reduce((sum, s) => sum + s.cost, 0).toLocaleString()}</div>
                      <div className="stat-label">Total Revenue</div>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="stats-section">
                  <h4>💰 Financial Summary</h4>
                  <div className="stats-cards">
                    <div className="stat-card">
                      <div className="stat-value">${routes.reduce((sum, r) => sum + r.fuelCost + r.tollCost, 0).toLocaleString()}</div>
                      <div className="stat-label">Operating Costs</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">${(drivers.reduce((sum, d) => sum + (d.hourlyRate * d.hoursWorked), 0) / 52).toLocaleString()}</div>
                      <div className="stat-label">Weekly Payroll</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">${Math.round((shipments.reduce((sum, s) => sum + s.cost, 0) - routes.reduce((sum, r) => sum + r.fuelCost + r.tollCost, 0)) / shipments.length)}</div>
                      <div className="stat-label">Avg Profit/Shipment</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{Math.round((shipments.filter(s => s.status === 'delivered').length / shipments.length) * 100)}%</div>
                      <div className="stat-label">Delivery Success</div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="stats-section full-width">
                  <h4>📈 Performance Metrics</h4>
                  <div className="performance-grid">
                    <div className="performance-card">
                      <h5>Top Performing Drivers</h5>
                      <div className="driver-rankings">
                        {drivers
                          .sort((a, b) => b.rating - a.rating)
                          .slice(0, 3)
                          .map((driver, index) => (
                            <div key={driver.id} className="ranking-item">
                              <span className="rank">#{index + 1}</span>
                              <span className="name">{driver.name}</span>
                              <span className="metric">{driver.rating} ⭐</span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="performance-card">
                      <h5>Most Active Vehicles</h5>
                      <div className="vehicle-rankings">
                        {vehicles
                          .sort((a, b) => b.mileage - a.mileage)
                          .slice(0, 3)
                          .map((vehicle, index) => (
                            <div key={vehicle.id} className="ranking-item">
                              <span className="rank">#{index + 1}</span>
                              <span className="name">{vehicle.licensePlate}</span>
                              <span className="metric">{vehicle.mileage.toLocaleString()} mi</span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="performance-card">
                      <h5>High Priority Shipments</h5>
                      <div className="shipment-priorities">
                        {shipments
                          .filter(s => s.priority === 'high')
                          .slice(0, 3)
                          .map((shipment) => (
                            <div key={shipment.id} className="ranking-item">
                              <span className="rank">{shipment.id}</span>
                              <span className="name">{shipment.origin} → {shipment.destination}</span>
                              <span className="metric">${shipment.cost}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graphs Modal */}
      {showGraphsModal && (
        <div className="log-modal-backdrop" onClick={() => setShowGraphsModal(false)}>
          <div className="log-modal-container extra-large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="log-modal-head">
              <h3 className="log-modal-title">📈 Analytics Dashboard & Graphs</h3>
              <button 
                className="log-close-button"
                onClick={() => setShowGraphsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="log-modal-body">
              <div className="graphs-container">
                {/* Fleet Status Distribution */}
                <div className="graph-section">
                  <h4>🚛 Fleet Status Distribution</h4>
                  <div className="chart-container">
                    <div className="pie-chart">
                      <div className="pie-segment active" style={{
                        backgroundColor: '#10b981',
                        width: `${(vehicles.filter(v => v.status === 'active').length / vehicles.length) * 100}%`
                      } as React.CSSProperties}>
                        <span className="pie-label">Active: {vehicles.filter(v => v.status === 'active').length}</span>
                      </div>
                      <div className="pie-segment maintenance" style={{
                        backgroundColor: '#f59e0b',
                        width: `${(vehicles.filter(v => v.status === 'maintenance').length / vehicles.length) * 100}%`
                      } as React.CSSProperties}>
                        <span className="pie-label">Maintenance: {vehicles.filter(v => v.status === 'maintenance').length}</span>
                      </div>
                      <div className="pie-segment idle" style={{
                        backgroundColor: '#6b7280',
                        width: `${(vehicles.filter(v => v.status === 'idle').length / vehicles.length) * 100}%`
                      } as React.CSSProperties}>
                        <span className="pie-label">Idle: {vehicles.filter(v => v.status === 'idle').length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Performance Chart */}
                <div className="graph-section">
                  <h4>👥 Driver Performance Ratings</h4>
                  <div className="bar-chart">
                    {drivers.map(driver => (
                      <div key={driver.id} className="bar-item">
                        <div className="bar-label">{driver.name.split(' ')[0]}</div>
                        <div className="bar-container">
                          <div 
                            className="bar-fill" 
                            style={{ 
                              width: `${(driver.rating / 5) * 100}%`,
                              backgroundColor: driver.color 
                            }}
                          ></div>
                          <span className="bar-value">{driver.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipment Status Timeline */}
                <div className="graph-section full-width">
                  <h4>📦 Shipment Status Overview</h4>
                  <div className="timeline-chart">
                    <div className="timeline-bar">
                      <div 
                        className="timeline-segment pending"
                        style={{ width: `${(shipments.filter(s => s.status === 'pending').length / shipments.length) * 100}%` }}
                      >
                        <span>Pending ({shipments.filter(s => s.status === 'pending').length})</span>
                      </div>
                      <div 
                        className="timeline-segment in-transit"
                        style={{ width: `${(shipments.filter(s => s.status === 'in-transit').length / shipments.length) * 100}%` }}
                      >
                        <span>In Transit ({shipments.filter(s => s.status === 'in-transit').length})</span>
                      </div>
                      <div 
                        className="timeline-segment delivered"
                        style={{ width: `${(shipments.filter(s => s.status === 'delivered').length / shipments.length) * 100}%` }}
                      >
                        <span>Delivered ({shipments.filter(s => s.status === 'delivered').length})</span>
                      </div>
                      <div 
                        className="timeline-segment delayed"
                        style={{ width: `${(shipments.filter(s => s.status === 'delayed').length / shipments.length) * 100}%` }}
                      >
                        <span>Delayed ({shipments.filter(s => s.status === 'delayed').length})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue vs Costs Analysis */}
                <div className="graph-section">
                  <h4>💰 Revenue vs Operating Costs</h4>
                  <div className="comparison-chart">
                    <div className="comparison-item">
                      <div className="comparison-label">Total Revenue</div>
                      <div className="comparison-bar revenue">
                        <div className="comparison-fill" style={{ width: '100%' }}>
                          ${shipments.reduce((sum, s) => sum + s.cost, 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="comparison-item">
                      <div className="comparison-label">Operating Costs</div>
                      <div className="comparison-bar costs">
                        <div 
                          className="comparison-fill" 
                          style={{ 
                            width: `${(routes.reduce((sum, r) => sum + r.fuelCost + r.tollCost, 0) / shipments.reduce((sum, s) => sum + s.cost, 0)) * 100}%` 
                          }}
                        >
                          ${routes.reduce((sum, r) => sum + r.fuelCost + r.tollCost, 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="comparison-item">
                      <div className="comparison-label">Net Profit</div>
                      <div className="comparison-bar profit">
                        <div 
                          className="comparison-fill" 
                          style={{ 
                            width: `${((shipments.reduce((sum, s) => sum + s.cost, 0) - routes.reduce((sum, r) => sum + r.fuelCost + r.tollCost, 0)) / shipments.reduce((sum, s) => sum + s.cost, 0)) * 100}%` 
                          }}
                        >
                          ${(shipments.reduce((sum, s) => sum + s.cost, 0) - routes.reduce((sum, r) => sum + r.fuelCost + r.tollCost, 0)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Route Efficiency Metrics */}
                <div className="graph-section">
                  <h4>🛣️ Route Efficiency</h4>
                  <div className="efficiency-grid">
                    {routes.slice(0, 4).map(route => (
                      <div key={route.id} className="efficiency-card">
                        <h5>{route.name}</h5>
                        <div className="efficiency-metric">
                          <span className="metric-label">Distance</span>
                          <span className="metric-value">{route.distance} km</span>
                        </div>
                        <div className="efficiency-metric">
                          <span className="metric-label">Time</span>
                          <span className="metric-value">{route.estimatedTime} hrs</span>
                        </div>
                        <div className="efficiency-metric">
                          <span className="metric-label">Cost</span>
                          <span className="metric-value">${route.fuelCost + route.tollCost}</span>
                        </div>
                        <div className="efficiency-score">
                          <span>Efficiency: {Math.round((route.distance / (route.fuelCost + route.tollCost)) * 10)}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Detail Modal */}
      {showVehicleDetailModal && selectedVehicle && (
        <div className="log-modal-backdrop" onClick={() => setShowVehicleDetailModal(false)}>
          <div className="log-modal-container large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="log-modal-head">
              <h3 className="log-modal-title">🚛 Vehicle Details - {selectedVehicle.licensePlate}</h3>
              <button 
                className="log-close-button"
                onClick={() => setShowVehicleDetailModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="log-modal-body">
              <div className="detail-grid">
                <div className="detail-section">
                  <div className="detail-header">
                    <div 
                      className="detail-avatar large"
                      style={{ backgroundColor: selectedVehicle.color }}
                    >
                      🚛
                    </div>
                    <div className="detail-info">
                      <h4>{selectedVehicle.licensePlate}</h4>
                      <p>{selectedVehicle.type}</p>
                      <span className={`status-badge ${selectedVehicle.status}`}>
                        {selectedVehicle.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h5>📍 Location & Status</h5>
                  <div className="detail-stats">
                    <div className="stat-item">
                      <span className="stat-label">Current Location</span>
                      <span className="stat-value">{selectedVehicle.location}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Fuel Level</span>
                      <span className="stat-value">{selectedVehicle.fuelLevel}%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Mileage</span>
                      <span className="stat-value">{selectedVehicle.mileage.toLocaleString()} miles</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Capacity</span>
                      <span className="stat-value">{selectedVehicle.capacity}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Last Service</span>
                      <span className="stat-value">{selectedVehicle.lastService}</span>
                    </div>
                    {selectedVehicle.driver && (
                      <div className="stat-item">
                        <span className="stat-label">Assigned Driver</span>
                        <span className="stat-value">
                          {drivers.find(d => d.id === selectedVehicle.driver)?.name || 'Unknown'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h5>📊 Performance Metrics</h5>
                  <div className="performance-metrics">
                    <div className="metric-card">
                      <div className="metric-value">{Math.round(selectedVehicle.mileage / 12)}</div>
                      <div className="metric-label">Miles/Month</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{selectedVehicle.fuelLevel > 50 ? 'Good' : 'Low'}</div>
                      <div className="metric-label">Fuel Status</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{selectedVehicle.status === 'maintenance' ? 'Due' : 'Current'}</div>
                      <div className="metric-label">Maintenance</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver Detail Modal */}
      {showDriverDetailModal && selectedDriver && (
        <div className="log-modal-backdrop" onClick={() => setShowDriverDetailModal(false)}>
          <div className="log-modal-container large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="log-modal-head">
              <h3 className="log-modal-title">👤 Driver Profile - {selectedDriver.name}</h3>
              <button 
                className="log-close-button"
                onClick={() => setShowDriverDetailModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="log-modal-body">
              <div className="detail-grid">
                <div className="detail-section">
                  <div className="detail-header">
                    <div 
                      className="detail-avatar large"
                      style={{ backgroundColor: selectedDriver.color }}
                    >
                      {selectedDriver.name.charAt(0)}
                    </div>
                    <div className="detail-info">
                      <h4>{selectedDriver.name}</h4>
                      <p>{selectedDriver.licenseClass} License</p>
                      <span className={`status-badge ${selectedDriver.status}`}>
                        {selectedDriver.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h5>📞 Contact Information</h5>
                  <div className="detail-stats">
                    <div className="stat-item">
                      <span className="stat-label">Email</span>
                      <span className="stat-value">{selectedDriver.email}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Phone</span>
                      <span className="stat-value">{selectedDriver.phone}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Experience</span>
                      <span className="stat-value">{selectedDriver.experience} years</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Rating</span>
                      <span className="stat-value">{selectedDriver.rating} ⭐</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Hourly Rate</span>
                      <span className="stat-value">${selectedDriver.hourlyRate}/hr</span>
                    </div>
                    {selectedDriver.currentVehicle && (
                      <div className="stat-item">
                        <span className="stat-label">Current Vehicle</span>
                        <span className="stat-value">
                          {vehicles.find(v => v.id === selectedDriver.currentVehicle)?.licensePlate || 'Unknown'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h5>📈 Performance Statistics</h5>
                  <div className="performance-metrics">
                    <div className="metric-card">
                      <div className="metric-value">{selectedDriver.totalDeliveries}</div>
                      <div className="metric-label">Total Deliveries</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{selectedDriver.hoursWorked.toLocaleString()}</div>
                      <div className="metric-label">Hours Worked</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">${(selectedDriver.hourlyRate * selectedDriver.hoursWorked).toLocaleString()}</div>
                      <div className="metric-label">Total Earnings</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{Math.round(selectedDriver.totalDeliveries / (selectedDriver.hoursWorked / 40))}</div>
                      <div className="metric-label">Deliveries/Week</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsDashboard; 