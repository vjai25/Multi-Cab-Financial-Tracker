import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Clock,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { tripService } from '../../services/tripService';
import { cabService } from '../../services/cabService';

const TripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [cabs, setCabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    fetchData();
    const unsubscribeTrips = tripService.subscribeToTrips(setTrips);
    const unsubscribeCabs = cabService.subscribeToCabs(setCabs);
    return () => {
      unsubscribeTrips();
      unsubscribeCabs();
    };
  }, []);

  const fetchData = async () => {
    try {
      const [allTrips, allCabs] = await Promise.all([
        tripService.getAllTrips(),
        cabService.getAllCabs()
      ]);
      setTrips(allTrips);
      setCabs(allCabs);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (selectedTrip) {
        await tripService.updateTrip(selectedTrip.id, data);
        toast.success('Trip updated successfully');
        setShowEditModal(false);
      } else {
        await tripService.addTrip(data);
        toast.success('Trip added successfully');
        setShowAddModal(false);
      }
      reset();
      setSelectedTrip(null);
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleCompleteTrip = async (tripId, finalData) => {
    try {
      await tripService.completeTrip(tripId, finalData);
      toast.success('Trip completed successfully');
    } catch (error) {
      toast.error('Failed to complete trip');
    }
  };

  const handleDelete = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await tripService.deleteTrip(tripId);
        toast.success('Trip deleted successfully');
      } catch (error) {
        toast.error('Failed to delete trip');
      }
    }
  };

  const handleEdit = (trip) => {
    setSelectedTrip(trip);
    reset(trip);
    setShowEditModal(true);
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.cabId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-success-100 text-success-800';
      case 'active': return 'bg-primary-100 text-primary-800';
      case 'cancelled': return 'bg-danger-100 text-danger-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'active': return <PlayCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
          <h1 className="text-2xl font-bold text-gray-900">Trip Management</h1>
          <p className="text-gray-600">Track and manage all cab trips</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Start New Trip
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
                placeholder="Search trips..."
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
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {filteredTrips.map((trip) => (
          <div key={trip.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Trip #{trip.id.slice(-6)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(trip.createdAt?.toDate() || new Date(), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(trip.status)}`}>
                      {getStatusIcon(trip.status)}
                      <span className="ml-1 capitalize">{trip.status}</span>
                    </span>
                    <div className="relative">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">From:</span>
                      <span className="ml-1 font-medium">{trip.pickupLocation}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">To:</span>
                      <span className="ml-1 font-medium">{trip.destination}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Fare:</span>
                      <span className="ml-1 font-medium text-success-600">
                        ${trip.fare?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Cab:</span>
                      <span className="ml-1 font-medium">
                        {cabs.find(cab => cab.id === trip.cabId)?.registrationNumber || trip.cabId}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Distance:</span>
                      <span className="ml-1 font-medium">
                        {trip.distance ? `${trip.distance} km` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-1 font-medium">
                        {trip.duration ? `${trip.duration} min` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {trip.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{trip.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              {trip.status === 'active' && (
                <button
                  onClick={() => handleCompleteTrip(trip.id, { fare: trip.fare })}
                  className="btn-success flex-1 flex items-center justify-center text-sm"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete Trip
                </button>
              )}
              <button
                onClick={() => handleEdit(trip)}
                className="btn-secondary flex-1 flex items-center justify-center text-sm"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(trip.id)}
                className="btn-danger flex-1 flex items-center justify-center text-sm"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTrips.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-500">Get started by creating your first trip.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedTrip ? 'Edit Trip' : 'Start New Trip'}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cab
                  </label>
                  <select
                    {...register('cabId', { required: 'Cab is required' })}
                    className="input-field"
                  >
                    <option value="">Select a cab</option>
                    {cabs.filter(cab => cab.status === 'active').map(cab => (
                      <option key={cab.id} value={cab.id}>
                        {cab.registrationNumber} - {cab.driverName}
                      </option>
                    ))}
                  </select>
                  {errors.cabId && (
                    <p className="mt-1 text-sm text-danger-600">{errors.cabId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    {...register('pickupLocation', { required: 'Pickup location is required' })}
                    className="input-field"
                    placeholder="Enter pickup location"
                  />
                  {errors.pickupLocation && (
                    <p className="mt-1 text-sm text-danger-600">{errors.pickupLocation.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    {...register('destination', { required: 'Destination is required' })}
                    className="input-field"
                    placeholder="Enter destination"
                  />
                  {errors.destination && (
                    <p className="mt-1 text-sm text-danger-600">{errors.destination.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fare
                  </label>
                  <input
                    type="number"
                    {...register('fare', { required: 'Fare is required' })}
                    className="input-field"
                    placeholder="Enter fare amount"
                  />
                  {errors.fare && (
                    <p className="mt-1 text-sm text-danger-600">{errors.fare.message}</p>
                  )}
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
                    {selectedTrip ? 'Update' : 'Start'} Trip
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedTrip(null);
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

export default TripManagement; 