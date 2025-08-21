import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Expense Management
export const expenseService = {
  // Add new expense
  async addExpense(expenseData) {
    try {
      const expenseRef = await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return expenseRef.id;
    } catch (error) {
      throw new Error('Failed to add expense: ' + error.message);
    }
  },

  // Update expense
  async updateExpense(expenseId, updates) {
    try {
      const expenseRef = doc(db, 'expenses', expenseId);
      await updateDoc(expenseRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to update expense: ' + error.message);
    }
  },

  // Delete expense
  async deleteExpense(expenseId) {
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
    } catch (error) {
      throw new Error('Failed to delete expense: ' + error.message);
    }
  },

  // Get expenses by date range
  async getExpensesByDateRange(startDate, endDate, cabId = null) {
    try {
      let q = query(
        collection(db, 'expenses'),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );

      if (cabId) {
        q = query(
          collection(db, 'expenses'),
          where('cabId', '==', cabId),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate)),
          orderBy('date', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Failed to fetch expenses: ' + error.message);
    }
  },

  // Get expenses by category
  async getExpensesByCategory(category, startDate, endDate, cabId = null) {
    try {
      let q = query(
        collection(db, 'expenses'),
        where('category', '==', category),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );

      if (cabId) {
        q = query(
          collection(db, 'expenses'),
          where('cabId', '==', cabId),
          where('category', '==', category),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate)),
          orderBy('date', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Failed to fetch expenses by category: ' + error.message);
    }
  },

  // Get expense statistics
  async getExpenseStatistics(startDate, endDate, cabId = null) {
    try {
      const expenses = await this.getExpensesByDateRange(startDate, endDate, cabId);
      
      const stats = {
        totalExpenses: 0,
        totalFuel: 0,
        totalMaintenance: 0,
        totalInsurance: 0,
        totalOther: 0,
        averageExpense: 0,
        expenseCount: expenses.length
      };

      const categoryTotals = {};

      expenses.forEach(expense => {
        const amount = expense.amount || 0;
        const category = expense.category || 'other';
        
        stats.totalExpenses += amount;
        
        if (category === 'fuel') {
          stats.totalFuel += amount;
        } else if (category === 'maintenance') {
          stats.totalMaintenance += amount;
        } else if (category === 'insurance') {
          stats.totalInsurance += amount;
        } else {
          stats.totalOther += amount;
        }

        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      });

      if (stats.expenseCount > 0) {
        stats.averageExpense = stats.totalExpenses / stats.expenseCount;
      }

      stats.categoryBreakdown = categoryTotals;

      return stats;
    } catch (error) {
      throw new Error('Failed to calculate expense statistics: ' + error.message);
    }
  },

  // Get fuel expenses
  async getFuelExpenses(startDate, endDate, cabId = null) {
    return this.getExpensesByCategory('fuel', startDate, endDate, cabId);
  },

  // Get maintenance expenses
  async getMaintenanceExpenses(startDate, endDate, cabId = null) {
    return this.getExpensesByCategory('maintenance', startDate, endDate, cabId);
  },

  // Real-time expense updates
  subscribeToExpenses(callback) {
    const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(expenses);
    });
  },

  // Subscribe to expenses by date range
  subscribeToExpensesByDateRange(startDate, endDate, callback) {
    const q = query(
      collection(db, 'expenses'),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(expenses);
    });
  }
}; 