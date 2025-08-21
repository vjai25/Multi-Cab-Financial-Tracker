import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  MapPin, 
  Car, 
  Navigation, 
  Phone,
  Activity,
  RefreshCw,
  User
} from 'lucide-react';
import { cabService } from '../../services/cabService';

const LocationTracker = () => {
  const [cabs, setCabs] = useState([]);
  const [selectedCab, setSelectedCab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchCabs();
    const unsubscribe = cabService.subscribeToCabs(setCabs);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchCabs();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchCabs = async () => {
    try {
      const allCabs = await cabService.getAllCabs();
      setCabs(allCabs);
    } catch (error) {
      toast.error('Failed to fetch cab locations');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCabs();
    toast.success('Locations refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success-500';
      case 'maintenance': return 'bg-warning-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'maintenance': return 'Maintenance';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
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
          <h1 className="text-2xl font-bold text-gray-900">Live Location Tracking</h1>
          <p className="text-gray-600">Real-time monitoring of your cab fleet</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Auto refresh</span>
          </label>
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="card">
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map</h3>
            <p className="text-gray-500">Map integration would be implemented here</p>
            <p className="text-sm text-gray-400 mt-2">
              Integrate with Google Maps, Mapbox, or other mapping services
            </p>
          </div>
        </div>
      </div>

      {/* Cab Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cabs.map((cab) => (
          <div
            key={cab.id}
            className={`card cursor-pointer transition-all hover:shadow-lg ${
              selectedCab?.id === cab.id ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => setSelectedCab(cab)}
          >
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
                <div className={`w-3 h-3 rounded-full ${getStatusColor(cab.status)}`} />
                <span className="text-xs font-medium text-gray-600">
                  {getStatusText(cab.status)}
                </span>
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
              {cab.currentLocation && (
                <div className="text-xs text-gray-500">
                  Last updated: {format(cab.lastLocationUpdate?.toDate() || new Date(), 'HH:mm')}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Today's Earnings:</span>
                <span className="font-medium text-success-600">
                  ${cab.todayEarnings?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Today's Trips:</span>
                <span className="font-medium">{cab.todayTrips || 0}</span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="btn-primary flex-1 flex items-center justify-center text-sm">
                <Navigation className="h-4 w-4 mr-1" />
                Track
              </button>
              <button className="btn-secondary flex-1 flex items-center justify-center text-sm">
                <Phone className="h-4 w-4 mr-1" />
                Call
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Cab Details */}
      {selectedCab && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedCab.registrationNumber} - Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Cab Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration:</span>
                  <span className="font-medium">{selectedCab.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-medium">{selectedCab.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Year:</span>
                  <span className="font-medium">{selectedCab.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Color:</span>
                  <span className="font-medium">{selectedCab.color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${getStatusColor(selectedCab.status)}`}>
                    {getStatusText(selectedCab.status)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Driver Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{selectedCab.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{selectedCab.driverPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Earnings:</span>
                  <span className="font-medium text-success-600">
                    ${selectedCab.totalEarnings?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Trips:</span>
                  <span className="font-medium">{selectedCab.totalTrips || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Activity Feed */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Activity Feed</h3>
        <div className="space-y-3">
          {cabs.filter(cab => cab.status === 'active').map((cab) => (
            <div key={cab.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="pulse-dot mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {cab.registrationNumber} is currently active
                </p>
                <p className="text-xs text-gray-500">
                  Driver: {cab.driverName} • Last updated: {format(new Date(), 'HH:mm')}
                </p>
              </div>
              <button className="btn-primary text-xs">
                View Details
              </button>
            </div>
          ))}
          {cabs.filter(cab => cab.status === 'active').length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No active cabs at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationTracker; 