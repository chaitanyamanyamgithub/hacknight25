import React, { useState, useEffect } from 'react';
import { 
  BeakerIcon, 
  DocumentTextIcon, 
  CalendarIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { getPatientPrescriptions } from '../../services/api';
import PageHeader from '../PageHeader';
import EmptyState from '../EmptyState';

export default function Prescriptions({ userId }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [medicationHistory, setMedicationHistory] = useState([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const response = await getPatientPrescriptions(userId);
        setPrescriptions(response.data);
        generateMedicationHistory(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching prescriptions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [userId]);
  
  // Generate medication history for current prescriptions
  const generateMedicationHistory = (prescriptionsList) => {
    const history = [];
    const today = new Date();
    
    // Generate data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayData = {
        date: date,
        medications: []
      };
      
      // Only process active prescriptions
      const activePrescriptions = prescriptionsList.filter(p => 
        p.status === 'active' || p.status === 'refill-needed'
      );
      
      // For each active prescription
      activePrescriptions.forEach(prescription => {
        const randomStatus = Math.random() > 0.2 ? 'taken' : 'missed';
        
        // Create a medication entry for this day
        prescription.medications.forEach(med => {
          dayData.medications.push({
            id: `${prescription.id}-${med.name}-${i}`,
            name: med.name,
            dosage: med.dosage,
            time: med.frequency,
            status: randomStatus,
            prescriptionId: prescription.id
          });
        });
      });
      
      history.push(dayData);
    }
    
    setMedicationHistory(history);
  };

  // Filter prescriptions based on active tab
  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (activeTab === 'current') {
      return prescription.status === 'active' || prescription.status === 'refill-needed';
    } else if (activeTab === 'past') {
      return prescription.status === 'completed' || prescription.status === 'cancelled';
    }
    return true;
  });

  // Get status badge based on prescription status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" /> Active
          </span>
        );
      case 'refill-needed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ExclamationCircleIcon className="h-3 w-3 mr-1" /> Refill Needed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ExclamationCircleIcon className="h-3 w-3 mr-1" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <InformationCircleIcon className="h-3 w-3 mr-1" /> {status}
          </span>
        );
    }
  };

  // Get medication adherence percentage
  const getMedicationAdherence = () => {
    let taken = 0;
    let total = 0;
    
    medicationHistory.forEach(day => {
      day.medications.forEach(med => {
        total++;
        if (med.status === 'taken') taken++;
      });
    });
    
    return total > 0 ? Math.round((taken / total) * 100) : 0;
  };
  
  // Get adherence color based on percentage
  const getAdherenceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div>
      <PageHeader 
        title="Prescriptions & Medications" 
        description="View and manage your medications"
      />
      
      {/* Medication Adherence Summary */}
      <div className="mb-6 bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-medium text-white mb-4">Medication Adherence</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4 flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
              <BeakerIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Medications</p>
              <p className="text-2xl font-semibold text-white">
                {prescriptions.filter(p => p.status === 'active').reduce((total, p) => total + p.medications.length, 0)}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Adherence Rate</p>
              <p className={`text-2xl font-semibold ${getAdherenceColor(getMedicationAdherence())}`}>
                {getMedicationAdherence()}%
              </p>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center mr-4">
              <ArrowPathIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Need Refill</p>
              <p className="text-2xl font-semibold text-white">
                {prescriptions.filter(p => p.status === 'refill-needed').length}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
              <CalendarIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Prescriptions</p>
              <p className="text-2xl font-semibold text-white">{prescriptions.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Medication History */}
      <div className="mb-6 bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-medium text-white mb-4">7-Day Medication History</h2>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white">
                      Day
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                      Medications
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {medicationHistory.map((day, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="font-medium text-white">
                            {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        <div className="flex flex-col gap-2">
                          {day.medications.map((med, medIndex) => (
                            <div key={medIndex} className="flex items-center">
                              <BeakerIcon className="h-4 w-4 text-blue-500 mr-1" />
                              <span>{med.name} - {med.dosage}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex flex-col gap-2">
                          {day.medications.map((med, medIndex) => (
                            <div key={medIndex}>
                              {med.status === 'taken' ? (
                                <span className="inline-flex items-center text-green-500">
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  Taken
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-red-500">
                                  <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                                  Missed
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Prescriptions List and Details */}
      <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
        <div className="border-b border-gray-700">
          <div className="flex">
            <button 
              className={`px-4 py-3 font-medium text-sm ${
                activeTab === 'current' 
                  ? 'text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('current')}
            >
              Current Prescriptions
            </button>
            <button 
              className={`px-4 py-3 font-medium text-sm ${
                activeTab === 'past' 
                  ? 'text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('past')}
            >
              Past Prescriptions
            </button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          {/* Prescriptions List */}
          <div className="w-full lg:w-1/3 border-r border-gray-700">
            {filteredPrescriptions.length > 0 ? (
              <ul className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                {filteredPrescriptions.map(prescription => (
                  <li 
                    key={prescription.id}
                    className={`p-4 hover:bg-gray-700 transition-colors cursor-pointer ${
                      selectedPrescription && selectedPrescription.id === prescription.id ? 'bg-gray-700' : ''
                    }`}
                    onClick={() => setSelectedPrescription(prescription)}
                  >
                    <div>
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-white">{prescription.doctor.name}</p>
                        {getStatusBadge(prescription.status)}
                      </div>
                      <p className="text-xs text-gray-400">{prescription.doctor.specialty}</p>
                      <div className="mt-2">
                        {prescription.medications.slice(0, 2).map((med, index) => (
                          <p key={index} className="text-sm text-gray-300 flex items-center">
                            <BeakerIcon className="h-3 w-3 text-blue-500 mr-1" />
                            {med.name}
                          </p>
                        ))}
                        {prescription.medications.length > 2 && (
                          <p className="text-xs text-gray-400 mt-1">
                            +{prescription.medications.length - 2} more medications
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-400">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {prescription.date}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-400">
                  {activeTab === 'current' ? 'No active prescriptions' : 'No past prescriptions'}
                </p>
              </div>
            )}
          </div>
          
          {/* Prescription Details */}
          <div className="w-full lg:w-2/3 p-6">
            {selectedPrescription ? (
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Prescription Details</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Prescribed on {prescription.date}
                    </p>
                  </div>
                  {getStatusBadge(selectedPrescription.status)}
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Doctor</h3>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                      <span className="text-white font-medium">{selectedPrescription.doctor.name.charAt(0)}</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{selectedPrescription.doctor.name}</p>
                      <p className="text-xs text-gray-400">{selectedPrescription.doctor.specialty}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Medications</h3>
                  <div className="space-y-4">
                    {selectedPrescription.medications.map((medication, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <BeakerIcon className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-white">{medication.name}</p>
                              <p className="text-xs text-gray-400 mt-1">Dosage: {medication.dosage}</p>
                            </div>
                          </div>
                          {selectedPrescription.status === 'active' && (
                            <div className="flex items-center text-xs text-gray-400">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {medication.frequency}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm text-gray-300">{medication.instructions}</p>
                        </div>
                        
                        {medication.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <p className="text-xs text-gray-400">Notes:</p>
                            <p className="text-sm text-gray-300 mt-1">{medication.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedPrescription.notes && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Additional Notes</h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-300">{selectedPrescription.notes}</p>
                    </div>
                  </div>
                )}
                
                {selectedPrescription.status === 'refill-needed' && (
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                      Request Refill
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={DocumentTextIcon}
                title="No prescription selected"
                description="Select a prescription from the list to view its details."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 