import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const checkAndCreateUserAdmin = async (user: any): Promise<boolean> => {
  if (!user?.uid) {
    console.log('No user UID provided');
    return false;
  }

  try {
    console.log('Checking user document for:', user.uid);
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User document exists:', userData);
      console.log('isAdmin field:', userData?.isAdmin);
      return userData?.isAdmin === true;
    } else {
      console.log('User document does not exist, creating one...');
      
      // Create user document with admin status
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAdmin: true, // Set to true for testing
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(userDocRef, userData);
      console.log('Created user document with admin status');
      return true;
    }
  } catch (error) {
    console.error('Error checking/creating user admin status:', error);
    return false;
  }
}; 