import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Car, 
  MapPin, 
  Phone, 
  User,
  Search,
  MoreVertical
} from 'lucide-react';
import { cabService } from '../../services/cabService';

const CabManagement = () => {
  const [cabs, setCabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCab, setSelectedCab] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    fetchCabs();
    const unsubscribe = cabService.subscribeToCabs(setCabs);
    return () => unsubscribe();
  }, []);

  const fetchCabs = async () => {
    try {
      const allCabs = await cabService.getAllCabs();
      setCabs(allCabs);
    } catch (error) {
      toast.error('Failed to fetch cabs');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (selectedCab) {
        await cabService.updateCab(selectedCab.id, data);
        toast.success('Cab updated successfully');
        setShowEditModal(false);
      } else {
        await cabService.addCab(data);
        toast.success('Cab added successfully');
        setShowAddModal(false);
      }
      reset();
      setSelectedCab(null);
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (cabId) => {
    if (window.confirm('Are you sure you want to delete this cab?')) {
      try {
        await cabService.deleteCab(cabId);
        toast.success('Cab deleted successfully');
      } catch (error) {
        toast.error('Failed to delete cab');
      }
    }
  };

  const handleEdit = (cab) => {
    setSelectedCab(cab);
    reset(cab);
    setShowEditModal(true);
  };

  const filteredCabs = cabs.filter(cab => {
    const matchesSearch = cab.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cab.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cab.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cab.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success-100 text-success-800';
      case 'maintenance': return 'bg-warning-100 text-warning-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Cab Management</h1>
          <p className="text-gray-600">Manage your fleet of cabs</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Cab
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
                placeholder="Search cabs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cabs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCabs.map((cab) => (
          <div key={cab.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {cab.registrationNumber}
                  </h3>
                  <p className="text-sm text-gray-500">{cab.model}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cab.status)}`}>
                  {cab.status}
                </span>
                <div className="relative">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Driver:</span>
                <span className="ml-1 font-medium">{cab.driverName}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Phone:</span>
                <span className="ml-1 font-medium">{cab.driverPhone}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Location:</span>
                <span className="ml-1 font-medium">
                  {cab.currentLocation ? 'Live tracking' : 'No location'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Earnings:</span>
                <span className="font-medium text-success-600">
                  ${cab.totalEarnings?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Total Trips:</span>
                <span className="font-medium">{cab.totalTrips || 0}</span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleEdit(cab)}
                className="btn-secondary flex-1 flex items-center justify-center text-sm"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(cab.id)}
                className="btn-danger flex-1 flex items-center justify-center text-sm"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCabs.length === 0 && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cabs found</h3>
          <p className="text-gray-500">Get started by adding your first cab to the fleet.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedCab ? 'Edit Cab' : 'Add New Cab'}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    {...register('registrationNumber', { required: 'Registration number is required' })}
                    className="input-field"
                    placeholder="Enter registration number"
                  />
                  {errors.registrationNumber && (
                    <p className="mt-1 text-sm text-danger-600">{errors.registrationNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    {...register('model', { required: 'Model is required' })}
                    className="input-field"
                    placeholder="Enter car model"
                  />
                  {errors.model && (
                    <p className="mt-1 text-sm text-danger-600">{errors.model.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    {...register('driverName', { required: 'Driver name is required' })}
                    className="input-field"
                    placeholder="Enter driver name"
                  />
                  {errors.driverName && (
                    <p className="mt-1 text-sm text-danger-600">{errors.driverName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Phone
                  </label>
                  <input
                    type="tel"
                    {...register('driverPhone', { required: 'Driver phone is required' })}
                    className="input-field"
                    placeholder="Enter driver phone"
                  />
                  {errors.driverPhone && (
                    <p className="mt-1 text-sm text-danger-600">{errors.driverPhone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    {...register('year', { required: 'Year is required' })}
                    className="input-field"
                    placeholder="Enter year"
                  />
                  {errors.year && (
                    <p className="mt-1 text-sm text-danger-600">{errors.year.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    {...register('color')}
                    className="input-field"
                    placeholder="Enter color"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {selectedCab ? 'Update' : 'Add'} Cab
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedCab(null);
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

export default CabManagement; 