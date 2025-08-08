import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export interface AppNotification {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  type:
    | 'feature_request'
    | 'api_key_added'
    | 'dns_record_added'
    | 'ui_design_request'
    | 'admin_action';
  projectId?: string;
  projectName?: string;
  // Optional client-side actions
  action?: 'openRequestsModal' | 'navigate';
  actionRoute?: string;
  createdAt?: Date | Timestamp;
  read?: boolean;
  metadata?: Record<string, any>;
}

export const createNotification = async (notification: AppNotification): Promise<string> => {
  const payload = {
    ...notification,
    createdAt: serverTimestamp(),
    read: false,
  } as const;

  const ref = await addDoc(collection(db, 'notifications'), payload as any);
  return ref.id;
};

export const getUnreadNotificationCount = (
  userId: string,
  callback: (count: number) => void
) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );

  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.size),
    () => callback(0)
  );
};

export const subscribeRecentNotifications = (
  userId: string,
  callback: (notifications: AppNotification[]) => void,
  maxItems: number = 20
) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(maxItems)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: AppNotification[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        } as AppNotification;
      });
      callback(list);
    },
    () => callback([])
  );
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
};

