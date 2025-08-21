import React, { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  Car, 
  MapPin, 
  DollarSign, 
  Activity,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cabService } from '../../services/cabService';
import { tripService } from '../../services/tripService';
import { expenseService } from '../../services/expenseService';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const [todayTrips, setTodayTrips] = useState([]);
  const [todayExpenses, setTodayExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalCabs: 0,
    activeCabs: 0,
    todayTrips: 0,
    todayEarnings: 0,
    todayExpenses: 0,
    netProfit: 0
  });
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);

        // Fetch cabs
        const allCabs = await cabService.getAllCabs();
        const activeCabs = allCabs.filter(cab => cab.status === 'active');

        // Fetch today's trips
        const trips = await tripService.getTripsByDateRange(startOfToday, endOfToday);
        const completedTrips = trips.filter(trip => trip.status === 'completed');
        const todayEarnings = completedTrips.reduce((sum, trip) => sum + (trip.fare || 0), 0);

        // Fetch today's expenses
        const expenses = await expenseService.getExpensesByDateRange(startOfToday, endOfToday);
        const todayExpensesTotal = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

        setTodayTrips(trips);
        setTodayExpenses(expenses);
        setStats({
          totalCabs: allCabs.length,
          activeCabs: activeCabs.length,
          todayTrips: trips.length,
          todayEarnings,
          todayExpenses: todayExpensesTotal,
          netProfit: todayEarnings - todayExpensesTotal
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time subscriptions
    const unsubscribeTrips = tripService.subscribeToTodayTrips(setTodayTrips);

    return () => {
      unsubscribeTrips();
    };
  }, []);

  // Chart data
  const earningsData = [
    { name: 'Mon', earnings: 1200 },
    { name: 'Tue', earnings: 1800 },
    { name: 'Wed', earnings: 1500 },
    { name: 'Thu', earnings: 2200 },
    { name: 'Fri', earnings: 1900 },
    { name: 'Sat', earnings: 2500 },
    { name: 'Sun', earnings: 2100 },
  ];

  const expenseCategories = [
    { name: 'Fuel', value: 45, color: '#ef4444' },
    { name: 'Maintenance', value: 25, color: '#f59e0b' },
    { name: 'Insurance', value: 20, color: '#3b82f6' },
    { name: 'Other', value: 10, color: '#10b981' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {userProfile?.displayName || 'User'}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your cab fleet today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium text-gray-900">
            {format(new Date(), 'MMM dd, yyyy HH:mm')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Cabs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCabs}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-success-600" />
              <span className="text-sm text-success-600 ml-1">
                {stats.activeCabs} active
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-success-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-success-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Trips</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayTrips}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-success-600" />
              <span className="text-sm text-success-600 ml-1">
                {todayTrips.filter(trip => trip.status === 'active').length} active
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-warning-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.todayEarnings.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-success-600" />
              <span className="text-sm text-success-600 ml-1">
                +12% from yesterday
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-danger-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-danger-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Net Profit</p>
              <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                ${stats.netProfit.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              {stats.netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger-600" />
              )}
              <span className={`text-sm ml-1 ${stats.netProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {stats.netProfit >= 0 ? 'Profitable' : 'Loss'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Earnings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="earnings" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseCategories}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {expenseCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trips */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Trips</h3>
            <a href="/trips" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {todayTrips.slice(0, 5).map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    trip.status === 'completed' ? 'bg-success-500' :
                    trip.status === 'active' ? 'bg-primary-500' : 'bg-danger-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Trip #{trip.id.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {trip.pickupLocation} → {trip.destination}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${trip.fare?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {trip.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
            <a href="/expenses" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {todayExpenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-danger-500 rounded-full mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {expense.description}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {expense.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    -${expense.amount?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(expense.date?.toDate() || new Date(), 'MMM dd')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Car className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Add New Cab</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <MapPin className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Start Trip</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <DollarSign className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Add Expense</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <BarChart3 className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 