import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot,
  Timestamp,
  setDoc,
  DocumentData
} from 'firebase/firestore';

// Types
export interface Shipment {
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

export interface Warehouse {
  id: string;
  name: string;
  location: [number, number];
  capacity: number;
  status: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: string;
  lastRestock: string;
  location: string;
}

export interface OptimizedRoute {
  route: [number, number][];
  distance: number;
  time: number;
  fuelCost: number;
  emissions: number;
}

// Helper type for Firestore data
type FirestoreData = {
  [key: string]: any;
};

// Collection references
const getExampleCollection = (appId: string) => collection(db, 'examples', appId);

// Shipments
export const getShipments = async (appId: string): Promise<Shipment[]> => {
  const shipmentsRef = collection(db, 'examples', appId, 'shipments');
  const snapshot = await getDocs(shipmentsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment));
};

export const subscribeToShipments = (appId: string, callback: (shipments: Shipment[]) => void) => {
  const shipmentsRef = collection(db, 'examples', appId, 'shipments');
  return onSnapshot(shipmentsRef, (snapshot) => {
    const shipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment));
    callback(shipments);
  });
};

export const addShipment = async (appId: string, shipment: Omit<Shipment, 'id'>): Promise<string> => {
  const shipmentsRef = collection(db, 'examples', appId, 'shipments');
  const docRef = await addDoc(shipmentsRef, shipment);
  return docRef.id;
};

export const updateShipment = async (appId: string, shipmentId: string, data: Partial<Shipment>): Promise<void> => {
  const shipmentRef = doc(db, 'examples', appId, 'shipments', shipmentId);
  await updateDoc(shipmentRef, data);
};

export const deleteShipment = async (appId: string, shipmentId: string): Promise<void> => {
  const shipmentRef = doc(db, 'examples', appId, 'shipments', shipmentId);
  await deleteDoc(shipmentRef);
};

// Warehouses
export const getWarehouses = async (appId: string): Promise<Warehouse[]> => {
  const warehousesRef = collection(db, 'examples', appId, 'warehouses');
  const snapshot = await getDocs(warehousesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warehouse));
};

export const subscribeToWarehouses = (appId: string, callback: (warehouses: Warehouse[]) => void) => {
  const warehousesRef = collection(db, 'examples', appId, 'warehouses');
  return onSnapshot(warehousesRef, (snapshot) => {
    const warehouses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warehouse));
    callback(warehouses);
  });
};

export const addWarehouse = async (appId: string, warehouse: Omit<Warehouse, 'id'>): Promise<string> => {
  const warehousesRef = collection(db, 'examples', appId, 'warehouses');
  const docRef = await addDoc(warehousesRef, warehouse);
  return docRef.id;
};

export const updateWarehouse = async (appId: string, warehouseId: string, data: Partial<Warehouse>): Promise<void> => {
  const warehouseRef = doc(db, 'examples', appId, 'warehouses', warehouseId);
  await updateDoc(warehouseRef, data);
};

export const deleteWarehouse = async (appId: string, warehouseId: string): Promise<void> => {
  const warehouseRef = doc(db, 'examples', appId, 'warehouses', warehouseId);
  await deleteDoc(warehouseRef);
};

// Inventory
export const getInventory = async (appId: string): Promise<InventoryItem[]> => {
  const inventoryRef = collection(db, 'examples', appId, 'inventory');
  const snapshot = await getDocs(inventoryRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
};

export const subscribeToInventory = (appId: string, callback: (inventory: InventoryItem[]) => void) => {
  const inventoryRef = collection(db, 'examples', appId, 'inventory');
  return onSnapshot(inventoryRef, (snapshot) => {
    const inventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
    callback(inventory);
  });
};

export const addInventoryItem = async (appId: string, item: Omit<InventoryItem, 'id'>): Promise<string> => {
  const inventoryRef = collection(db, 'examples', appId, 'inventory');
  const docRef = await addDoc(inventoryRef, item);
  return docRef.id;
};

export const updateInventoryItem = async (appId: string, itemId: string, data: Partial<InventoryItem>): Promise<void> => {
  const itemRef = doc(db, 'examples', appId, 'inventory', itemId);
  await updateDoc(itemRef, data);
};

export const deleteInventoryItem = async (appId: string, itemId: string): Promise<void> => {
  const itemRef = doc(db, 'examples', appId, 'inventory', itemId);
  await deleteDoc(itemRef);
};

// Routes
export const optimizeRoutes = async (appId: string, warehouseId: string): Promise<OptimizedRoute> => {
  const warehouseRef = doc(db, 'examples', appId, 'warehouses', warehouseId);
  const warehouseDoc = await getDoc(warehouseRef);
  
  if (!warehouseDoc.exists()) {
    throw new Error('Warehouse not found');
  }

  const warehouse = warehouseDoc.data() as Warehouse;
  
  // Mock route optimization
  const mockRoute: OptimizedRoute = {
    route: [
      warehouse.location,
      [warehouse.location[0] + 0.1, warehouse.location[1] + 0.1] as [number, number],
      [warehouse.location[0] + 0.2, warehouse.location[1] - 0.1] as [number, number]
    ],
    distance: Math.random() * 100,
    time: Math.random() * 60,
    fuelCost: Math.random() * 50,
    emissions: Math.random() * 20
  };

  // Store the optimized route
  const routeData: DocumentData = {
    route: mockRoute.route,
    distance: mockRoute.distance,
    time: mockRoute.time,
    fuelCost: mockRoute.fuelCost,
    emissions: mockRoute.emissions
  };
  
  await setDoc(doc(db, 'examples', appId, 'routes', warehouseId), routeData);

  return mockRoute;
};

export const getOptimizedRoutes = async (appId: string): Promise<Record<string, OptimizedRoute>> => {
  const routesRef = collection(db, 'examples', appId, 'routes');
  const routesSnapshot = await getDocs(routesRef);
  
  const routes: Record<string, OptimizedRoute> = {};
  routesSnapshot.forEach((doc) => {
    const data = doc.data();
    routes[doc.id] = {
      route: data.route as [number, number][],
      distance: data.distance as number,
      time: data.time as number,
      fuelCost: data.fuelCost as number,
      emissions: data.emissions as number
    };
  });
  
  return routes;
};

export const subscribeToRoutes = (appId: string, warehouseId: string, callback: (route: OptimizedRoute | null) => void) => {
  const routeRef = doc(db, 'examples', appId, 'routes', warehouseId);
  return onSnapshot(routeRef, (doc) => {
    callback(doc.exists() ? (doc.data() as OptimizedRoute) : null);
  });
};

export const updateOptimizedRoute = async (appId: string, warehouseId: string, route: OptimizedRoute): Promise<void> => {
  const routeRef = doc(db, 'examples', appId, 'routes', warehouseId);
  await updateDoc(routeRef, route);
};

// Initialize example data
export const initializeExampleData = async (appId: string) => {
  const exampleData = {
    shipments: [
      {
        status: 'in-transit',
        destination: 'San Francisco, CA',
        eta: '2024-03-15 14:30',
        location: [37.7749, -122.4194] as [number, number],
        carrier: 'FedEx',
        weight: 150,
        priority: 'High',
        lastUpdate: new Date().toISOString()
      },
      {
        status: 'delivered',
        destination: 'Los Angeles, CA',
        eta: '2024-03-14 09:15',
        location: [34.0522, -118.2437] as [number, number],
        carrier: 'UPS',
        weight: 75,
        priority: 'Medium',
        lastUpdate: new Date().toISOString()
      }
    ],
    warehouses: [
      {
        name: 'Main Distribution Center',
        location: [37.7749, -122.4194] as [number, number],
        capacity: 1000,
        status: 'active'
      },
      {
        name: 'West Coast Hub',
        location: [34.0522, -118.2437] as [number, number],
        capacity: 800,
        status: 'active'
      }
    ],
    inventory: [
      {
        name: 'Laptop Pro X1',
        category: 'Electronics',
        quantity: 100,
        status: 'in-stock',
        lastRestock: new Date().toISOString(),
        location: 'WH001'
      },
      {
        name: 'Office Chair Deluxe',
        category: 'Furniture',
        quantity: 50,
        status: 'low-stock',
        lastRestock: new Date().toISOString(),
        location: 'WH002'
      }
    ]
  };

  // Add shipments
  for (const shipment of exampleData.shipments) {
    await addShipment(appId, shipment);
  }

  // Add warehouses
  for (const warehouse of exampleData.warehouses) {
    await addWarehouse(appId, warehouse);
  }

  // Add inventory items
  for (const item of exampleData.inventory) {
    await addInventoryItem(appId, item);
  }
}; 