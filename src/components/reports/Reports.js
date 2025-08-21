import React, { useState, useEffect, useCallback } from 'react';
import { subDays } from 'date-fns';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { tripService } from '../../services/tripService';
import { expenseService } from '../../services/expenseService';

const Reports = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [earningsData, setEarningsData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = getStartDate(dateRange);
      
      const [tripStats, expenseStats] = await Promise.all([
        tripService.getTripStatistics(startDate, endDate),
        expenseService.getExpenseStatistics(startDate, endDate)
      ]);

      setStats({
        ...tripStats,
        ...expenseStats,
        netProfit: tripStats.totalEarnings - expenseStats.totalExpenses
      });

      // Generate chart data
      generateChartData(startDate, endDate);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const getStartDate = (range) => {
    const today = new Date();
    switch (range) {
      case '7d': return subDays(today, 7);
      case '30d': return subDays(today, 30);
      case '90d': return subDays(today, 90);
      default: return subDays(today, 7);
    }
  };

  const generateChartData = async (startDate, endDate) => {
    // This would typically fetch data from your backend
    // For now, using mock data
    const mockEarningsData = [
      { date: 'Mon', earnings: 1200, expenses: 800 },
      { date: 'Tue', earnings: 1800, expenses: 900 },
      { date: 'Wed', earnings: 1500, expenses: 750 },
      { date: 'Thu', earnings: 2200, expenses: 1100 },
      { date: 'Fri', earnings: 1900, expenses: 950 },
      { date: 'Sat', earnings: 2500, expenses: 1200 },
      { date: 'Sun', earnings: 2100, expenses: 1050 },
    ];

    const mockExpenseData = [
      { category: 'Fuel', amount: 45 },
      { category: 'Maintenance', amount: 25 },
      { category: 'Insurance', amount: 20 },
      { category: 'Other', amount: 10 },
    ];

    setEarningsData(mockEarningsData);
    setExpenseData(mockExpenseData);
  };

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

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
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive financial insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-success-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalEarnings?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-danger-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-danger-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalExpenses?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Net Profit</p>
              <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                ${stats.netProfit?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-warning-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Trips</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTrips || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings vs Expenses Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} name="Earnings" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trip Statistics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Trips</span>
              <span className="font-medium text-success-600">{stats.completedTrips || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Trips</span>
              <span className="font-medium text-primary-600">{stats.pendingTrips || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cancelled Trips</span>
              <span className="font-medium text-danger-600">{stats.cancelledTrips || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Fare</span>
              <span className="font-medium">${stats.averageFare?.toFixed(2) || '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Distance</span>
              <span className="font-medium">{stats.totalDistance?.toFixed(1) || '0'} km</span>
            </div>
          </div>
        </div>

        {/* Expense Statistics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fuel Expenses</span>
              <span className="font-medium text-danger-600">${stats.totalFuel?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Maintenance</span>
              <span className="font-medium text-warning-600">${stats.totalMaintenance?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Insurance</span>
              <span className="font-medium text-primary-600">${stats.totalInsurance?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Other Expenses</span>
              <span className="font-medium text-gray-600">${stats.totalOther?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Expense</span>
              <span className="font-medium">${stats.averageExpense?.toFixed(2) || '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600">
              {stats.totalTrips > 0 ? ((stats.completedTrips / stats.totalTrips) * 100).toFixed(1) : '0'}%
            </div>
            <div className="text-sm text-gray-600">Trip Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">
              {stats.totalEarnings > 0 ? ((stats.netProfit / stats.totalEarnings) * 100).toFixed(1) : '0'}%
            </div>
            <div className="text-sm text-gray-600">Profit Margin</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600">
              {stats.totalTrips > 0 ? (stats.totalEarnings / stats.totalTrips).toFixed(2) : '0'}
            </div>
            <div className="text-sm text-gray-600">Average Revenue per Trip</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 