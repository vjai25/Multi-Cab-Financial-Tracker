import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Search,
  Fuel,
  Wrench,
  Shield,
  Package
} from 'lucide-react';
import { expenseService } from '../../services/expenseService';
import { cabService } from '../../services/cabService';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [cabs, setCabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    fetchData();
    const unsubscribeExpenses = expenseService.subscribeToExpenses(setExpenses);
    const unsubscribeCabs = cabService.subscribeToCabs(setCabs);
    return () => {
      unsubscribeExpenses();
      unsubscribeCabs();
    };
  }, []);

  const fetchData = async () => {
    try {
      const [allExpenses, allCabs] = await Promise.all([
        expenseService.getAllExpenses(),
        cabService.getAllCabs()
      ]);
      setExpenses(allExpenses);
      setCabs(allCabs);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (selectedExpense) {
        await expenseService.updateExpense(selectedExpense.id, data);
        toast.success('Expense updated successfully');
        setShowEditModal(false);
      } else {
        await expenseService.addExpense(data);
        toast.success('Expense added successfully');
        setShowAddModal(false);
      }
      reset();
      setSelectedExpense(null);
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(expenseId);
        toast.success('Expense deleted successfully');
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    reset(expense);
    setShowEditModal(true);
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'fuel': return <Fuel className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'insurance': return <Shield className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'fuel': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'insurance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600">Track and manage all cab expenses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              <option value="fuel">Fuel</option>
              <option value="maintenance">Maintenance</option>
              <option value="insurance">Insurance</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.map((expense) => (
          <div key={expense.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-danger-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-danger-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {expense.description}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(expense.date?.toDate() || new Date(), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getCategoryColor(expense.category)}`}>
                      {getCategoryIcon(expense.category)}
                      <span className="ml-1 capitalize">{expense.category}</span>
                    </span>
                    <span className="text-lg font-bold text-danger-600">
                      -${expense.amount?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Cab:</span>
                      <span className="ml-1 font-medium">
                        {cabs.find(cab => cab.id === expense.cabId)?.registrationNumber || expense.cabId || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="ml-1 font-medium text-danger-600">
                        ${expense.amount?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-1 font-medium">
                        {format(expense.date?.toDate() || new Date(), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Receipt:</span>
                      <span className="ml-1 font-medium">
                        {expense.receiptNumber || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {expense.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{expense.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleEdit(expense)}
                className="btn-secondary flex-1 flex items-center justify-center text-sm"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(expense.id)}
                className="btn-danger flex-1 flex items-center justify-center text-sm"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
          <p className="text-gray-500">Get started by adding your first expense.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    {...register('description', { required: 'Description is required' })}
                    className="input-field"
                    placeholder="Enter expense description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="input-field"
                  >
                    <option value="">Select category</option>
                    <option value="fuel">Fuel</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="insurance">Insurance</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-danger-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('amount', { required: 'Amount is required' })}
                    className="input-field"
                    placeholder="Enter amount"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-danger-600">{errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    className="input-field"
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-danger-600">{errors.date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cab (Optional)
                  </label>
                  <select
                    {...register('cabId')}
                    className="input-field"
                  >
                    <option value="">Select a cab</option>
                    {cabs.map(cab => (
                      <option key={cab.id} value={cab.id}>
                        {cab.registrationNumber} - {cab.driverName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receipt Number (Optional)
                  </label>
                  <input
                    type="text"
                    {...register('receiptNumber')}
                    className="input-field"
                    placeholder="Enter receipt number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    {...register('notes')}
                    className="input-field"
                    rows="3"
                    placeholder="Enter any additional notes"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {selectedExpense ? 'Update' : 'Add'} Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedExpense(null);
                      reset();
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement; 