import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import '../styles/InventoryDashboard.css';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  location: string;
  warehouse: string;
  price: number;
  sku: string;
  lastUpdated: string;
  qrCode?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentOccupancy: number;
  qrCode?: string;
  manager: string;
  status: 'active' | 'inactive';
}

const InventoryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddWarehouseModalOpen, setIsAddWarehouseModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedQRData, setSelectedQRData] = useState<{ type: 'item' | 'warehouse', data: any }>({ type: 'item', data: null });
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const { currentUser } = useAuth();

  // Mock data for demo
  const mockInventoryItems: InventoryItem[] = [
    {
      id: 'INV001',
      name: 'Gaming Laptop',
      category: 'Electronics',
      quantity: 25,
      minQuantity: 10,
      location: 'A-1-3',
      warehouse: 'WH001',
      price: 1299.99,
      sku: 'GL-001',
      lastUpdated: '2024-03-15',
      status: 'in-stock'
    },
    {
      id: 'INV002',
      name: 'Office Chair',
      category: 'Furniture',
      quantity: 5,
      minQuantity: 15,
      location: 'B-2-1',
      warehouse: 'WH002',
      price: 299.99,
      sku: 'OC-002',
      lastUpdated: '2024-03-14',
      status: 'low-stock'
    },
    {
      id: 'INV003',
      name: 'Medical Supplies Kit',
      category: 'Medical',
      quantity: 0,
      minQuantity: 5,
      location: 'C-1-2',
      warehouse: 'WH001',
      price: 89.99,
      sku: 'MS-003',
      lastUpdated: '2024-03-13',
      status: 'out-of-stock'
    },
    {
      id: 'INV004',
      name: 'Industrial Tools Set',
      category: 'Tools',
      quantity: 50,
      minQuantity: 20,
      location: 'D-3-1',
      warehouse: 'WH003',
      price: 599.99,
      sku: 'IT-004',
      lastUpdated: '2024-03-15',
      status: 'in-stock'
    }
  ];

  const mockWarehouses: Warehouse[] = [
    {
      id: 'WH001',
      name: 'Central Electronics Warehouse',
      location: 'New York, NY',
      capacity: 10000,
      currentOccupancy: 7500,
      manager: 'John Smith',
      status: 'active'
    },
    {
      id: 'WH002',
      name: 'West Coast Distribution',
      location: 'Los Angeles, CA',
      capacity: 15000,
      currentOccupancy: 12000,
      manager: 'Sarah Johnson',
      status: 'active'
    },
    {
      id: 'WH003',
      name: 'Midwest Industrial Hub',
      location: 'Chicago, IL',
      capacity: 8000,
      currentOccupancy: 6200,
      manager: 'Mike Brown',
      status: 'active'
    }
  ];

  useEffect(() => {
    setInventoryItems(mockInventoryItems);
    setWarehouses(mockWarehouses);
  }, []);

  const generateQRCode = async (data: string) => {
    try {
      const qrDataURL = await QRCode.toDataURL(data, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  const handleGenerateWarehouseQR = async (warehouse: Warehouse) => {
    const qrData = JSON.stringify({
      type: 'warehouse',
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.location,
      timestamp: new Date().toISOString()
    });
    
    const qrCode = await generateQRCode(qrData);
    if (qrCode) {
      setSelectedQRData({ type: 'warehouse', data: { ...warehouse, qrCode } });
      setIsQRModalOpen(true);
      
      // Update warehouse with QR code
      const updatedWarehouses = warehouses.map(wh => 
        wh.id === warehouse.id ? { ...wh, qrCode } : wh
      );
      setWarehouses(updatedWarehouses);
    }
  };

  const handleGenerateItemQR = async (item: InventoryItem) => {
    const qrData = JSON.stringify({
      type: 'item',
      id: item.id,
      name: item.name,
      sku: item.sku,
      location: item.location,
      warehouse: item.warehouse,
      timestamp: new Date().toISOString()
    });
    
    const qrCode = await generateQRCode(qrData);
    if (qrCode) {
      setSelectedQRData({ type: 'item', data: { ...item, qrCode } });
      setIsQRModalOpen(true);
      
      // Update item with QR code
      const updatedItems = inventoryItems.map(itm => 
        itm.id === item.id ? { ...itm, qrCode } : itm
      );
      setInventoryItems(updatedItems);
    }
  };

  const handleApplyQRToWarehouse = (warehouseId: string) => {
    const warehouse = warehouses.find(wh => wh.id === warehouseId);
    if (warehouse && selectedQRData.type === 'warehouse' && selectedQRData.data.qrCode) {
      // In a real application, this would send the QR code to the warehouse system
      alert(`QR Code applied to ${warehouse.name}! The QR code is now active for warehouse operations.`);
      setIsQRModalOpen(false);
    }
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesWarehouse = selectedWarehouse === 'all' || item.warehouse === selectedWarehouse;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesWarehouse && matchesSearch && matchesCategory;
  });

  const getInventoryStats = () => {
    const total = inventoryItems.length;
    const inStock = inventoryItems.filter(item => item.status === 'in-stock').length;
    const lowStock = inventoryItems.filter(item => item.status === 'low-stock').length;
    const outOfStock = inventoryItems.filter(item => item.status === 'out-of-stock').length;
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    return { total, inStock, lowStock, outOfStock, totalValue };
  };

  const stats = getInventoryStats();

  const renderOverviewTab = () => (
    <div className="overview-section">
      <div className="inventory-stats">
        <div className="stat-card">
          <h4>Total Items</h4>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h4>In Stock</h4>
          <div className="stat-value text-success">{stats.inStock}</div>
        </div>
        <div className="stat-card">
          <h4>Low Stock</h4>
          <div className="stat-value text-warning">{stats.lowStock}</div>
        </div>
        <div className="stat-card">
          <h4>Out of Stock</h4>
          <div className="stat-value text-danger">{stats.outOfStock}</div>
        </div>
        <div className="stat-card">
          <h4>Total Value</h4>
          <div className="stat-value">${stats.totalValue.toLocaleString()}</div>
        </div>
      </div>

      <div className="warehouses-overview">
        <h3>Warehouses</h3>
        <div className="warehouses-grid">
          {warehouses.map(warehouse => (
            <div key={warehouse.id} className="warehouse-card">
              <div className="warehouse-header">
                <h4>{warehouse.name}</h4>
                <span className={`status-badge ${warehouse.status}`}>
                  {warehouse.status}
                </span>
              </div>
              <p><strong>Location:</strong> {warehouse.location}</p>
              <p><strong>Manager:</strong> {warehouse.manager}</p>
              <div className="capacity-info">
                <p><strong>Capacity:</strong> {warehouse.currentOccupancy.toLocaleString()} / {warehouse.capacity.toLocaleString()}</p>
                <div className="capacity-bar">
                  <div 
                    className="capacity-fill" 
                    style={{ width: `${(warehouse.currentOccupancy / warehouse.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="warehouse-actions">
                <button 
                  className="qr-button"
                  onClick={() => handleGenerateWarehouseQR(warehouse)}
                >
                  Generate QR Code
                </button>
                {warehouse.qrCode && (
                  <button 
                    className="apply-qr-button"
                    onClick={() => handleApplyQRToWarehouse(warehouse.id)}
                  >
                    Apply QR to Warehouse
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInventoryTab = () => (
    <div className="inventory-section">
      <div className="inventory-header">
        <h3>Inventory Management</h3>
        <div className="inventory-actions">
          <div className="search-filters">
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="warehouse-filter"
            >
              <option value="all">All Warehouses</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="category-filter"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Medical">Medical</option>
              <option value="Tools">Tools</option>
            </select>
          </div>
          <button 
            className="add-item-button"
            onClick={() => setIsAddItemModalOpen(true)}
          >
            Add Item
          </button>
        </div>
      </div>

      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Warehouse</th>
              <th>Status</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td>{item.sku}</td>
                <td>{item.name}</td>
                <td>
                  <span className="category-badge">{item.category}</span>
                </td>
                <td>
                  <span className={item.quantity <= item.minQuantity ? 'quantity-warning' : ''}>
                    {item.quantity}
                  </span>
                </td>
                <td>{item.location}</td>
                <td>{warehouses.find(wh => wh.id === item.warehouse)?.name}</td>
                <td>
                  <span className={`status-badge ${item.status}`}>
                    {item.status.replace('-', ' ')}
                  </span>
                </td>
                <td>${item.price}</td>
                <td>
                  <div className="item-actions">
                    <button 
                      className="action-button qr"
                      onClick={() => handleGenerateItemQR(item)}
                      title="Generate QR Code"
                    >
                      QR
                    </button>
                    <button className="action-button edit" title="Edit">
                      ✏️
                    </button>
                    <button className="action-button restock" title="Restock">
                      📦
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderQRModal = () => {
    if (!isQRModalOpen || !selectedQRData.data) return null;

    const { type, data } = selectedQRData;

    return (
      <div className="modal-overlay" onClick={() => setIsQRModalOpen(false)}>
        <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>QR Code - {type === 'warehouse' ? 'Warehouse' : 'Item'}</h3>
            <button className="modal-close" onClick={() => setIsQRModalOpen(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="qr-display">
              {data.qrCode && (
                <img src={data.qrCode} alt="QR Code" className="qr-code-image" />
              )}
              <div className="qr-info">
                <h4>{data.name}</h4>
                {type === 'warehouse' ? (
                  <>
                    <p><strong>Location:</strong> {data.location}</p>
                    <p><strong>Manager:</strong> {data.manager}</p>
                    <p><strong>Capacity:</strong> {data.currentOccupancy.toLocaleString()} / {data.capacity.toLocaleString()}</p>
                  </>
                ) : (
                  <>
                    <p><strong>SKU:</strong> {data.sku}</p>
                    <p><strong>Category:</strong> {data.category}</p>
                    <p><strong>Location:</strong> {data.location}</p>
                    <p><strong>Quantity:</strong> {data.quantity}</p>
                  </>
                )}
              </div>
            </div>
            <div className="qr-actions">
              {type === 'warehouse' && (
                <button 
                  className="apply-qr-button primary"
                  onClick={() => handleApplyQRToWarehouse(data.id)}
                >
                  Apply QR to Warehouse
                </button>
              )}
              <button 
                className="download-qr-button"
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `qr-${type}-${data.id}.png`;
                  link.href = data.qrCode;
                  link.click();
                }}
              >
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h2>Inventory Management System</h2>
          <p className="dashboard-description">
            Manage your inventory, track stock levels, and generate QR codes for efficient warehouse operations.
          </p>
        </div>
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button
            className={`tab-button ${activeTab === 'warehouses' ? 'active' : ''}`}
            onClick={() => setActiveTab('warehouses')}
          >
            Warehouses
          </button>
          <button
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'inventory' && renderInventoryTab()}
        {activeTab === 'warehouses' && renderOverviewTab()}
        {activeTab === 'analytics' && renderOverviewTab()}
      </div>

      {renderQRModal()}
    </div>
  );
};

export default InventoryDashboard; 