import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs,
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Trip Management
export const tripService = {
  // Add new trip
  async addTrip(tripData) {
    try {
      const tripRef = await addDoc(collection(db, 'trips'), {
        ...tripData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        paymentStatus: 'pending'
      });
      return tripRef.id;
    } catch (error) {
      throw new Error('Failed to add trip: ' + error.message);
    }
  },

  // Update trip details
  async updateTrip(tripId, updates) {
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to update trip: ' + error.message);
    }
  },

  // Complete trip
  async completeTrip(tripId, finalData) {
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        ...finalData,
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to complete trip: ' + error.message);
    }
  },

  // Get trips by date range
  async getTripsByDateRange(startDate, endDate, cabId = null) {
    try {
      let q = query(
        collection(db, 'trips'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'desc')
      );

      if (cabId) {
        q = query(
          collection(db, 'trips'),
          where('cabId', '==', cabId),
          where('createdAt', '>=', Timestamp.fromDate(startDate)),
          where('createdAt', '<=', Timestamp.fromDate(endDate)),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Failed to fetch trips: ' + error.message);
    }
  },

  // Get today's trips
  async getTodayTrips() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const q = query(
        collection(db, 'trips'),
        where('createdAt', '>=', Timestamp.fromDate(today)),
        where('createdAt', '<', Timestamp.fromDate(tomorrow)),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Failed to fetch today\'s trips: ' + error.message);
    }
  },

  // Get trips by cab
  async getTripsByCab(cabId) {
    try {
      const q = query(
        collection(db, 'trips'),
        where('cabId', '==', cabId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Failed to fetch cab trips: ' + error.message);
    }
  },

  // Get trip statistics
  async getTripStatistics(startDate, endDate, cabId = null) {
    try {
      const trips = await this.getTripsByDateRange(startDate, endDate, cabId);
      
      const stats = {
        totalTrips: trips.length,
        totalEarnings: 0,
        totalDistance: 0,
        averageFare: 0,
        completedTrips: 0,
        cancelledTrips: 0,
        pendingTrips: 0
      };

      trips.forEach(trip => {
        if (trip.status === 'completed') {
          stats.completedTrips++;
          stats.totalEarnings += trip.fare || 0;
          stats.totalDistance += trip.distance || 0;
        } else if (trip.status === 'cancelled') {
          stats.cancelledTrips++;
        } else {
          stats.pendingTrips++;
        }
      });

      if (stats.completedTrips > 0) {
        stats.averageFare = stats.totalEarnings / stats.completedTrips;
      }

      return stats;
    } catch (error) {
      throw new Error('Failed to calculate statistics: ' + error.message);
    }
  },

  // Real-time trip updates
  subscribeToTrips(callback) {
    const q = query(collection(db, 'trips'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const trips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(trips);
    });
  },

  // Subscribe to today's trips
  subscribeToTodayTrips(callback) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      collection(db, 'trips'),
      where('createdAt', '>=', Timestamp.fromDate(today)),
      where('createdAt', '<', Timestamp.fromDate(tomorrow)),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const trips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(trips);
    });
  }
}; 