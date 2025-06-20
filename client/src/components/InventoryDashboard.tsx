import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Warehouse, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  FileText,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Download,
  QrCode,
  Edit3,
  Trash2,
  Eye,
  MapPin,
  DollarSign,
  ShoppingCart,
  Boxes,
  Clock,
  Users,
  Settings,
  X
} from 'lucide-react';
import '../styles/InventoryDashboard.css';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  lastUpdated: string;
  supplier?: string;
  reorderLevel?: number;
  barcode?: string;
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  type: string;
  status: 'active' | 'maintenance' | 'inactive';
  utilization: number;
  capacity: number;
  manager: string;
  temperature?: number;
  humidity?: number;
}

const InventoryDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'main' | 'analytics' | 'reports'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Sample data
  const inventoryItems: InventoryItem[] = [
    {
      id: 'INV-001',
      name: 'Steel Pipes Grade A',
      category: 'Raw Materials',
      quantity: 450,
      unit: 'units',
      price: 125.50,
      location: 'Warehouse A-1',
      status: 'in-stock',
      lastUpdated: '2024-01-15',
      supplier: 'Steel Corp Industries',
      reorderLevel: 100,
      barcode: '123456789012'
    },
    {
      id: 'INV-002',
      name: 'Electronic Components Kit',
      category: 'Electronics',
      quantity: 25,
      unit: 'boxes',
      price: 89.99,
      location: 'Warehouse B-2',
      status: 'low-stock',
      lastUpdated: '2024-01-14',
      supplier: 'TechParts Ltd',
      reorderLevel: 50,
      barcode: '234567890123'
    },
    {
      id: 'INV-003',
      name: 'Safety Equipment Set',
      category: 'Safety',
      quantity: 0,
      unit: 'sets',
      price: 245.00,
      location: 'Warehouse C-1',
      status: 'out-of-stock',
      lastUpdated: '2024-01-13',
      supplier: 'SafetyFirst Co',
      reorderLevel: 20,
      barcode: '345678901234'
    },
    {
      id: 'INV-004',
      name: 'Office Supplies Bundle',
      category: 'Supplies',
      quantity: 320,
      unit: 'packs',
      price: 15.75,
      location: 'Warehouse A-2',
      status: 'in-stock',
      lastUpdated: '2024-01-15',
      supplier: 'Office Express',
      reorderLevel: 50,
      barcode: '456789012345'
    },
    {
      id: 'INV-005',
      name: 'Manufacturing Tools',
      category: 'Tools',
      quantity: 85,
      unit: 'units',
      price: 350.00,
      location: 'Warehouse B-1',
      status: 'in-stock',
      lastUpdated: '2024-01-14',
      supplier: 'ToolTech Industries',
      reorderLevel: 25,
      barcode: '567890123456'
    }
  ];

  const warehouses: Warehouse[] = [
    {
      id: 'WH-001',
      name: 'Main Distribution Center',
      location: 'Chicago, IL',
      type: 'Distribution',
      status: 'active',
      utilization: 78,
      capacity: 10000,
      manager: 'Sarah Johnson',
      temperature: 22,
      humidity: 45
    },
    {
      id: 'WH-002',
      name: 'West Coast Facility',
      location: 'Los Angeles, CA',
      type: 'Storage',
      status: 'active',
      utilization: 65,
      capacity: 8500,
      manager: 'Mike Chen',
      temperature: 24,
      humidity: 50
    },
    {
      id: 'WH-003',
      name: 'East Coast Hub',
      location: 'New York, NY',
      type: 'Distribution',
      status: 'maintenance',
      utilization: 45,
      capacity: 12000,
      manager: 'Emily Rodriguez',
      temperature: 20,
      humidity: 48
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
      case 'active':
        return '#10b981';
      case 'low-stock':
      case 'maintenance':
        return '#f59e0b';
      case 'out-of-stock':
      case 'inactive':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getFilteredItems = () => {
    return inventoryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  const renderSecondaryNavbar = () => (
    <div className="inventory-secondary-navbar">
      <div className="inventory-secondary-nav-content">
        <button
          className="inventory-secondary-nav-btn"
          onClick={() => setCurrentView('main')}
          style={{ backgroundColor: currentView === 'main' ? 'rgba(255, 255, 255, 0.3)' : '' }}
        >
          <BarChart3 size={16} />
          <span>Main Dashboard</span>
        </button>
        <button
          className="inventory-secondary-nav-btn"
          onClick={() => setCurrentView('analytics')}
          style={{ backgroundColor: currentView === 'analytics' ? 'rgba(255, 255, 255, 0.3)' : '' }}
        >
          <TrendingUp size={16} />
          <span>Analytics</span>
        </button>
        <button
          className="inventory-secondary-nav-btn"
          onClick={() => setCurrentView('reports')}
          style={{ backgroundColor: currentView === 'reports' ? 'rgba(255, 255, 255, 0.3)' : '' }}
        >
          <FileText size={16} />
          <span>Reports</span>
        </button>
      </div>
    </div>
  );

  const renderMainDashboard = () => (
    <div className="inventory-main-section">
      <div className="inventory-main-header">
        <h2>Inventory Management Hub</h2>
        <p>
          Comprehensive inventory tracking and warehouse management system
          with real-time analytics and automated reporting capabilities.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="inventory-main-summary">
        <div className="inventory-summary-card">
          <div className="inventory-summary-header">
            <h4>Total Items</h4>
            <div className="inventory-status-badge active">Active</div>
          </div>
          <div className="inventory-summary-content">
            <div className="inventory-amount">1,247</div>
            <div className="inventory-change positive">
              +12.5% <span>vs last month</span>
            </div>
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="inventory-summary-header">
            <h4>Total Value</h4>
            <div className="inventory-status-badge active">Healthy</div>
          </div>
          <div className="inventory-summary-content">
            <div className="inventory-amount">$245,890</div>
            <div className="inventory-change positive">
              +8.3% <span>vs last month</span>
            </div>
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="inventory-summary-header">
            <h4>Low Stock Items</h4>
            <div className="inventory-status-badge warning">Alert</div>
          </div>
          <div className="inventory-summary-content">
            <div className="inventory-amount">23</div>
            <div className="inventory-change negative">
              +3 <span>this week</span>
            </div>
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="inventory-summary-header">
            <h4>Movements Today</h4>
            <div className="inventory-status-badge active">Active</div>
          </div>
          <div className="inventory-summary-content">
            <div className="inventory-amount">156</div>
            <div className="inventory-change positive">
              +15% <span>vs yesterday</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="inventory-items-section">
        <div className="inventory-items-header">
          <h3>Inventory Items</h3>
          <div className="inventory-controls">
            <div className="inventory-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="inventory-filter"
            >
              <option value="all">All Categories</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Electronics">Electronics</option>
              <option value="Safety">Safety</option>
              <option value="Supplies">Supplies</option>
              <option value="Tools">Tools</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="inventory-filter"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <button className="inventory-add-btn" onClick={() => setShowItemModal(true)}>
              <Plus size={16} />
              Add Item
            </button>
          </div>
        </div>

        <div className="inventory-items-grid">
          {getFilteredItems().map((item) => (
            <div key={item.id} className="inventory-item-card">
              <div className="inventory-item-header">
                <div className="inventory-item-icon">
                  <Package size={24} />
                </div>
                <div className="inventory-item-info">
                  <div className="inventory-item-name">{item.name}</div>
                  <div className="inventory-item-type">{item.category}</div>
                </div>
                <div
                  className="inventory-item-status"
                  style={{
                    backgroundColor: getStatusColor(item.status),
                    color: 'white'
                  }}
                >
                  {item.status.replace('-', ' ').toUpperCase()}
                </div>
              </div>
              <div className="inventory-item-metrics">
                <div className="inventory-metric">
                  <span>Quantity</span>
                  <span>{item.quantity} {item.unit}</span>
                </div>
                <div className="inventory-metric">
                  <span>Location</span>
                  <span>{item.location}</span>
                </div>
                <div className="inventory-metric">
                  <span>Unit Price</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
                <div className="inventory-metric">
                  <span>Total Value</span>
                  <span>${(item.quantity * item.price).toFixed(2)}</span>
                </div>
              </div>
              <div className="inventory-item-actions">
                <button
                  className="inventory-action-btn"
                  onClick={() => setShowQRModal(true)}
                >
                  <QrCode size={16} />
                </button>
                <button
                  className="inventory-action-btn"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowItemModal(true);
                  }}
                >
                  <Edit3 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warehouses Section */}
      <div className="inventory-warehouses-section">
        <div className="inventory-warehouses-header">
          <h3>Warehouse Management</h3>
          <button className="inventory-add-btn" onClick={() => setShowWarehouseModal(true)}>
            <Plus size={16} />
            Add Warehouse
          </button>
        </div>

        <div className="inventory-warehouses-list">
          {warehouses.map((warehouse) => (
            <div key={warehouse.id} className="inventory-warehouse-card">
              <div className="inventory-warehouse-header">
                <div className="inventory-warehouse-icon">
                  <Warehouse size={24} />
                </div>
                <div className="inventory-warehouse-info">
                  <div className="inventory-warehouse-name">{warehouse.name}</div>
                  <div className="inventory-warehouse-location">{warehouse.location}</div>
                </div>
                <div
                  className="inventory-warehouse-status"
                  style={{
                    backgroundColor: getStatusColor(warehouse.status),
                    color: 'white'
                  }}
                >
                  {warehouse.status.toUpperCase()}
                </div>
              </div>
              <div className="inventory-warehouse-details">
                <div className="inventory-warehouse-metrics">
                  <div className="inventory-metric">
                    <span>Utilization</span>
                    <span>{warehouse.utilization}%</span>
                  </div>
                  <div className="inventory-metric">
                    <span>Capacity</span>
                    <span>{warehouse.capacity.toLocaleString()} sq ft</span>
                  </div>
                  <div className="inventory-metric">
                    <span>Manager</span>
                    <span>{warehouse.manager}</span>
                  </div>
                  <div className="inventory-metric">
                    <span>Type</span>
                    <span>{warehouse.type}</span>
                  </div>
                </div>
                <div className="inventory-warehouse-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${warehouse.utilization}%`,
                        backgroundColor: warehouse.utilization > 80 ? '#ef4444' : '#10b981'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="inventory-analytics-section">
      <div className="inventory-analytics-header">
        <h2>Inventory Analytics</h2>
        <p>Comprehensive analytics and insights for your inventory operations</p>
        <button 
          className="inventory-back-btn"
          onClick={() => setCurrentView('main')}
        >
          <RefreshCw size={16} />
          Back to Dashboard
        </button>
      </div>

      <div className="inventory-analytics-content">
        <div className="inventory-analytics-grid">
          <div className="inventory-analytics-card">
            <h3>Stock Levels</h3>
            <div className="inventory-chart-placeholder">
              <BarChart3 size={48} />
              <p>Stock level analytics chart will be displayed here</p>
            </div>
          </div>
          <div className="inventory-analytics-card">
            <h3>Movement Trends</h3>
            <div className="inventory-chart-placeholder">
              <TrendingUp size={48} />
              <p>Movement trends chart will be displayed here</p>
            </div>
          </div>
          <div className="inventory-analytics-card">
            <h3>Warehouse Utilization</h3>
            <div className="inventory-chart-placeholder">
              <Warehouse size={48} />
              <p>Warehouse utilization chart will be displayed here</p>
            </div>
          </div>
          <div className="inventory-analytics-card">
            <h3>Category Distribution</h3>
            <div className="inventory-chart-placeholder">
              <Package size={48} />
              <p>Category distribution chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="inventory-reports-section">
      <div className="inventory-reports-header">
        <h2>Inventory Reports</h2>
        <p>Generate and manage comprehensive inventory reports</p>
        <button 
          className="inventory-back-btn"
          onClick={() => setCurrentView('main')}
        >
          <RefreshCw size={16} />
          Back to Dashboard
        </button>
      </div>

      <div className="inventory-reports-content">
        <div className="inventory-reports-grid">
          <div className="inventory-report-card">
            <div className="inventory-report-icon">
              <FileText size={32} />
            </div>
            <h4>Stock Report</h4>
            <p>Detailed stock levels and inventory status</p>
            <button className="inventory-report-btn">
              <Download size={16} />
              Generate Report
            </button>
          </div>
          <div className="inventory-report-card">
            <div className="inventory-report-icon">
              <TrendingUp size={32} />
            </div>
            <h4>Movement Report</h4>
            <p>Inventory movements and transaction history</p>
            <button className="inventory-report-btn">
              <Download size={16} />
              Generate Report
            </button>
          </div>
          <div className="inventory-report-card">
            <div className="inventory-report-icon">
              <AlertTriangle size={32} />
            </div>
            <h4>Low Stock Alert</h4>
            <p>Items below reorder level threshold</p>
            <button className="inventory-report-btn">
              <Download size={16} />
              Generate Report
            </button>
          </div>
          <div className="inventory-report-card">
            <div className="inventory-report-icon">
              <DollarSign size={32} />
            </div>
            <h4>Valuation Report</h4>
            <p>Inventory valuation and financial analysis</p>
            <button className="inventory-report-btn">
              <Download size={16} />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="inventory-dashboard">
      {renderSecondaryNavbar()}
      <div className="inventory-dashboard-content">
        {currentView === 'main' && renderMainDashboard()}
        {currentView === 'analytics' && renderAnalytics()}
        {currentView === 'reports' && renderReports()}
      </div>
    </div>
  );
};

export default InventoryDashboard; 