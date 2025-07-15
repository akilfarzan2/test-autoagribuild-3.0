import React, { useState } from 'react';
import { Wrench, ChevronDown, ChevronRight, Car, Calendar, Fuel, Hash, MapPin, Gauge, Settings } from 'lucide-react';

// Import task list components
import ServiceATaskList from './VehicleDetailsTaskLists/ServiceATaskList';
import ServiceBTaskList from './VehicleDetailsTaskLists/ServiceBTaskList';
import ServiceCTaskList from './VehicleDetailsTaskLists/ServiceCTaskList';
import ServiceDTaskList from './VehicleDetailsTaskLists/ServiceDTaskList';
import TrailerTaskList from './VehicleDetailsTaskLists/TrailerTaskList';
import OtherTaskList from './VehicleDetailsTaskLists/OtherTaskList';

interface JobCardFormData {
  job_year: string;
  job_month: string;
  job_sequence: string;
  job_start_date: string;
  expected_completion_date: string;
  completed_date: string;
  approximate_cost: string;
  customer_name: string;
  company_name: string;
  abn: string;
  mobile: string;
  email: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_month: string;
  vehicle_year: string;
  vehicle_kms: string;
  fuel_type: string;
  vin: string;
  rego: string;
  vehicle_state: string;
  tyre_size: string;
  next_service_kms: string;
  vehicle_type: string[];
  service_selection: string;
}

interface VehicleDetailsProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: string | string[]) => void;
}

const VehicleDetails: React.FC<VehicleDetailsProps> = ({ 
  jobCardFormData, 
  onJobCardDataChange 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const months = [
    { value: '', label: 'Select Month' },
    { value: '01', label: '01 - January' },
    { value: '02', label: '02 - February' },
    { value: '03', label: '03 - March' },
    { value: '04', label: '04 - April' },
    { value: '05', label: '05 - May' },
    { value: '06', label: '06 - June' },
    { value: '07', label: '07 - July' },
    { value: '08', label: '08 - August' },
    { value: '09', label: '09 - September' },
    { value: '10', label: '10 - October' },
    { value: '11', label: '11 - November' },
    { value: '12', label: '12 - December' },
  ];

  const fuelTypes = [
    { value: '', label: 'Select Fuel Type' },
    { value: 'Petrol', label: 'Petrol' },
    { value: 'Diesel', label: 'Diesel' },
  ];

  const australianStates = [
    { value: '', label: 'Select State' },
    { value: 'NSW', label: 'New South Wales (NSW)' },
    { value: 'VIC', label: 'Victoria (VIC)' },
    { value: 'QLD', label: 'Queensland (QLD)' },
    { value: 'WA', label: 'Western Australia (WA)' },
    { value: 'SA', label: 'South Australia (SA)' },
    { value: 'TAS', label: 'Tasmania (TAS)' },
    { value: 'ACT', label: 'Australian Capital Territory (ACT)' },
    { value: 'NT', label: 'Northern Territory (NT)' },
  ];

  const vehicleTypes = [
    'HR Truck',
    'MR Truck',
    'HR Double Axle',
    'Prime Mover',
    'Trailer',
    'Other'
  ];

  const serviceOptions = [
    { value: '', label: 'Select Service Type' },
    { value: 'Service A', label: 'Service A' },
    { value: 'Service B', label: 'Service B' },
    { value: 'Service C', label: 'Service C' },
    { value: 'Service D', label: 'Service D' },
  ];

  // Vehicle types that trigger service selection display
  const serviceEligibleTypes = ['HR Truck', 'MR Truck', 'HR Double Axle', 'Prime Mover'];

  // Check if any service-eligible vehicle types are selected
  const shouldShowServiceSelection = jobCardFormData.vehicle_type.some(type => 
    serviceEligibleTypes.includes(type)
  );

  const handleVehicleTypeChange = (vehicleType: string, isChecked: boolean) => {
    const currentTypes = jobCardFormData.vehicle_type || [];
    let newTypes: string[];

    if (isChecked) {
      // Add the vehicle type if it's not already in the array
      newTypes = currentTypes.includes(vehicleType) 
        ? currentTypes 
        : [...currentTypes, vehicleType];
    } else {
      // Remove the vehicle type from the array
      newTypes = currentTypes.filter(type => type !== vehicleType);
    }

    onJobCardDataChange('vehicle_type', newTypes);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Vehicle Details</h3>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-6 bg-white animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="vehicleMake" className="block text-sm font-medium text-gray-700 mb-2">
                  <Car className="w-4 h-4 inline mr-1" />
                  Vehicle Make
                </label>
                <input
                  type="text"
                  id="vehicleMake"
                  name="vehicleMake"
                  value={jobCardFormData.vehicle_make}
                  onChange={(e) => onJobCardDataChange('vehicle_make', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter vehicle make (e.g., Toyota, Ford)"
                />
              </div>

              <div>
                <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 mb-2">
                  <Car className="w-4 h-4 inline mr-1" />
                  Vehicle Model
                </label>
                <input
                  type="text"
                  id="vehicleModel"
                  name="vehicleModel"
                  value={jobCardFormData.vehicle_model}
                  onChange={(e) => onJobCardDataChange('vehicle_model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter vehicle model (e.g., Hilux, Ranger)"
                />
              </div>

              <div>
                <label htmlFor="vehicleMonth" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Vehicle Month
                </label>
                <select
                  id="vehicleMonth"
                  name="vehicleMonth"
                  value={jobCardFormData.vehicle_month}
                  onChange={(e) => onJobCardDataChange('vehicle_month', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="vehicleYear" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Vehicle Year
                </label>
                <input
                  type="number"
                  id="vehicleYear"
                  name="vehicleYear"
                  min="1900"
                  max="2099"
                  value={jobCardFormData.vehicle_year}
                  onChange={(e) => onJobCardDataChange('vehicle_year', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter year (e.g., 2023)"
                />
              </div>

              <div>
                <label htmlFor="vehicleKms" className="block text-sm font-medium text-gray-700 mb-2">
                  <Gauge className="w-4 h-4 inline mr-1" />
                  Vehicle KMs
                </label>
                <input
                  type="number"
                  id="vehicleKms"
                  name="vehicleKms"
                  min="0"
                  value={jobCardFormData.vehicle_kms}
                  onChange={(e) => onJobCardDataChange('vehicle_kms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter current kilometers"
                />
              </div>

              <div>
                <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-2">
                  <Fuel className="w-4 h-4 inline mr-1" />
                  Fuel Type
                </label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={jobCardFormData.fuel_type}
                  onChange={(e) => onJobCardDataChange('fuel_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {fuelTypes.map(fuel => (
                    <option key={fuel.value} value={fuel.value}>
                      {fuel.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  VIN (Vehicle Identification Number)
                </label>
                <input
                  type="text"
                  id="vin"
                  name="vin"
                  value={jobCardFormData.vin}
                  onChange={(e) => onJobCardDataChange('vin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter VIN number"
                  maxLength={17}
                />
              </div>

              <div>
                <label htmlFor="rego" className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  REGO (Registration Number)
                </label>
                <input
                  type="text"
                  id="rego"
                  name="rego"
                  value={jobCardFormData.rego}
                  onChange={(e) => onJobCardDataChange('rego', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter registration number"
                />
              </div>

              <div>
                <label htmlFor="vehicleState" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Vehicle State
                </label>
                <select
                  id="vehicleState"
                  name="vehicleState"
                  value={jobCardFormData.vehicle_state}
                  onChange={(e) => onJobCardDataChange('vehicle_state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {australianStates.map(state => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tyreSize" className="block text-sm font-medium text-gray-700 mb-2">
                  <Settings className="w-4 h-4 inline mr-1" />
                  Tyre Size
                </label>
                <input
                  type="text"
                  id="tyreSize"
                  name="tyreSize"
                  value={jobCardFormData.tyre_size}
                  onChange={(e) => onJobCardDataChange('tyre_size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tyre size (e.g., 265/70R16)"
                />
              </div>

              <div>
                <label htmlFor="nextServiceKms" className="block text-sm font-medium text-gray-700 mb-2">
                  <Gauge className="w-4 h-4 inline mr-1" />
                  Next Service KMs
                </label>
                <input
                  type="number"
                  id="nextServiceKms"
                  name="nextServiceKms"
                  min="0"
                  value={jobCardFormData.next_service_kms}
                  onChange={(e) => onJobCardDataChange('next_service_kms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter next service kilometers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Wrench className="w-4 h-4 inline mr-1" />
                  Vehicle Type (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {vehicleTypes.map(vehicleType => (
                    <label key={vehicleType} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={jobCardFormData.vehicle_type.includes(vehicleType)}
                        onChange={(e) => handleVehicleTypeChange(vehicleType, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{vehicleType}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Service Selection - Only show when eligible vehicle types are selected */}
              {shouldShowServiceSelection && (
                <div>
                  <label htmlFor="serviceSelection" className="block text-sm font-medium text-gray-700 mb-2">
                    <Settings className="w-4 h-4 inline mr-1" />
                    Service Selection
                  </label>
                  <select
                    id="serviceSelection"
                    name="serviceSelection"
                    value={jobCardFormData.service_selection}
                    onChange={(e) => onJobCardDataChange('service_selection', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {serviceOptions.map(service => (
                      <option key={service.value} value={service.value}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Available for: HR Truck, MR Truck, HR Double Axle, Prime Mover
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Information Panel */}
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-orange-800 mb-2">Vehicle Information</h4>
            <p className="text-xs text-orange-600">
              Complete vehicle details help ensure accurate service records and proper parts identification. 
              Vehicle type selection allows for multiple categories if the vehicle serves different purposes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetails;