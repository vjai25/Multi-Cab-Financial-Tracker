import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Cab Management
export const cabService = {
  // Add new cab
  async addCab(cabData) {
    try {
      const cabRef = await addDoc(collection(db, 'cabs'), {
        ...cabData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        totalEarnings: 0,
        totalTrips: 0,
        currentLocation: null,
        lastLocationUpdate: null
      });
      return cabRef.id;
    } catch (error) {
      throw new Error('Failed to add cab: ' + error.message);
    }
  },

  // Update cab details
  async updateCab(cabId, updates) {
    try {
      const cabRef = doc(db, 'cabs', cabId);
      await updateDoc(cabRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to update cab: ' + error.message);
    }
  },

  // Delete cab
  async deleteCab(cabId) {
    try {
      await deleteDoc(doc(db, 'cabs', cabId));
    } catch (error) {
      throw new Error('Failed to delete cab: ' + error.message);
    }
  },

  // Get all cabs
  async getAllCabs() {
    try {
      const querySnapshot = await getDocs(collection(db, 'cabs'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Failed to fetch cabs: ' + error.message);
    }
  },

  // Get cab by ID
  async getCabById(cabId) {
    try {
      const cabDoc = await getDoc(doc(db, 'cabs', cabId));
      if (cabDoc.exists()) {
        return { id: cabDoc.id, ...cabDoc.data() };
      }
      return null;
    } catch (error) {
      throw new Error('Failed to fetch cab: ' + error.message);
    }
  },

  // Update cab location
  async updateCabLocation(cabId, location) {
    try {
      const cabRef = doc(db, 'cabs', cabId);
      await updateDoc(cabRef, {
        currentLocation: location,
        lastLocationUpdate: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to update location: ' + error.message);
    }
  },

  // Get active cabs
  async getActiveCabs() {
    try {
      const q = query(
        collection(db, 'cabs'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Failed to fetch active cabs: ' + error.message);
    }
  },

  // Real-time cab updates
  subscribeToCabs(callback) {
    const q = query(collection(db, 'cabs'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const cabs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(cabs);
    });
  },

  // Subscribe to specific cab location updates
  subscribeToCabLocation(cabId, callback) {
    const cabRef = doc(db, 'cabs', cabId);
    return onSnapshot(cabRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        });
      }
    });
  }
}; 