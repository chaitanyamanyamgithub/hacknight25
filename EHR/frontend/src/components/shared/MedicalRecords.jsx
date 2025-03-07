import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  getPatientMedicalRecords, 
  getDoctorById, 
  formatDate 
} from '../../utils/mockData';
import PageHeader from '../PageHeader';
import EmptyState from '../EmptyState';
import { 
  DocumentTextIcon, 
  DocumentPlusIcon, 
  DocumentMagnifyingGlassIcon, 
  DocumentArrowDownIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { getMedicalRecords, createMedicalRecord, updateMedicalRecord } from '../../services/api';

export default function MedicalRecords() {
  const { currentUser } = useAuth();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    type: 'consultation',
    diagnosis: '',
    prescription: '',
    notes: '',
    attachments: []
  });
  
  // Get patient ID from URL query parameters or use the current user's ID
  const patientId = searchParams.get('patientId') ? parseInt(searchParams.get('patientId')) : currentUser.id;
  
  // Get patient's medical records
  const allRecords = getPatientMedicalRecords(patientId);
  
  // Sort records by date (newest first)
  const sortedRecords = [...allRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Filter records by search term
  const filteredRecords = sortedRecords.filter(record => 
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Record type icons
  const recordTypeIcons = {
    'Examination': ClipboardDocumentListIcon,
    'Lab Results': ClipboardDocumentCheckIcon,
    'Diagnosis': DocumentMagnifyingGlassIcon,
    'Procedure': DocumentTextIcon,
  };
  
  useEffect(() => {
    fetchRecords();
  }, [currentUser.id]);

  const fetchRecords = async () => {
    try {
      const response = await getMedicalRecords(currentUser.id);
      setRecords(response.data.records);
    } catch (err) {
      setError('Failed to load medical records');
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createMedicalRecord({
        ...formData,
        patientId: currentUser.id
      });
      fetchRecords();
      setShowForm(false);
      setFormData({
        date: '',
        type: 'consultation',
        diagnosis: '',
        prescription: '',
        notes: '',
        attachments: []
      });
    } catch (err) {
      setError('Failed to create medical record');
      console.error('Error creating record:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Medical Records" 
        description="View and manage medical records"
      />
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <input
            type="text"
            className="w-full px-3 py-2 pl-10 bg-medical-box-light border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DocumentMagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {currentUser.type === 'doctor' && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-medical-box-light text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Record
          </button>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Records List */}
        <div className="w-full lg:w-1/3">
          {filteredRecords.length > 0 ? (
            <div className="bg-medical-box-light rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-700">
                {filteredRecords.map(record => {
                  const IconComponent = recordTypeIcons[record.type] || DocumentTextIcon;
                  
                  return (
                    <li 
                      key={record.id}
                      className={`p-4 hover:bg-opacity-80 transition-colors cursor-pointer ${
                        selectedRecord && selectedRecord.id === record.id ? 'bg-gray-700' : ''
                      }`}
                      onClick={() => setSelectedRecord(record)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-medical-box-light flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-white">{record.title}</p>
                          <p className="text-xs text-gray-400">{record.type}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(record.date)}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="bg-medical-box-light rounded-lg p-6 text-center">
              <p className="text-black font-medium">
                {searchTerm
                  ? `No records found for "${searchTerm}"`
                  : 'No medical records available'}
              </p>
            </div>
          )}
        </div>
        
        {/* Record Details */}
        <div className="w-full lg:w-2/3">
          {selectedRecord ? (
            <div className="bg-medical-box-light rounded-lg p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedRecord.title}</h2>
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                      {selectedRecord.type}
                    </span>
                    <span className="text-sm text-gray-400">{formatDate(selectedRecord.date)}</span>
                  </div>
                </div>
                {currentUser.type === 'doctor' && (
                  <button className="text-blue-500 hover:text-blue-400 transition-colors">
                    Edit Record
                  </button>
                )}
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-white mb-2">Description</h3>
                <p className="text-white">{selectedRecord.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-white mb-3">Attachments</h3>
                {selectedRecord.attachments.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedRecord.attachments.map((attachment, index) => (
                      <li key={index} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-white">{attachment.name}</span>
                        </div>
                        <button className="text-blue-500 hover:text-blue-400 transition-colors flex items-center">
                          <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                          Download
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-black font-medium">No attachments</p>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="font-medium text-white">
                      {getDoctorById(selectedRecord.doctorId).name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      {getDoctorById(selectedRecord.doctorId).name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getDoctorById(selectedRecord.doctorId).specialty}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={DocumentTextIcon}
              title="No record selected"
              description="Select a record from the list to view its details."
            />
          )}
        </div>
      </div>
      
      {/* Add Record Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4 dark:text-white text-gray-900">Add Medical Record</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-gray-700 border-gray-300 rounded-lg dark:bg-gray-700 bg-white dark:text-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-gray-700 border-gray-300 rounded-lg dark:bg-gray-700 bg-white dark:text-white text-gray-900"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="test-results">Test Results</option>
                    <option value="procedure">Procedure</option>
                    <option value="surgery">Surgery</option>
                    <option value="vaccination">Vaccination</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Diagnosis
                </label>
                <textarea
                  required
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-700 border-gray-300 rounded-lg dark:bg-gray-700 bg-white dark:text-white text-gray-900"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Prescription
                </label>
                <textarea
                  value={formData.prescription}
                  onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-700 border-gray-300 rounded-lg dark:bg-gray-700 bg-white dark:text-white text-gray-900"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-700 border-gray-300 rounded-lg dark:bg-gray-700 bg-white dark:text-white text-gray-900"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Attachments
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border dark:border-gray-700 border-gray-300 rounded-lg dark:bg-gray-700 bg-white dark:text-white text-gray-900"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border dark:border-gray-700 border-gray-300 rounded-lg dark:text-gray-300 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-medical-blue-500 text-white rounded-lg hover:bg-medical-blue-600 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="p-6 dark:bg-gray-800 bg-white rounded-lg shadow-sm border dark:border-gray-700 border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full dark:bg-gray-700 bg-gray-100">
                    <DocumentTextIcon className="h-5 w-5 dark:text-medical-blue-400 text-medical-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-white text-gray-900">{record.type}</h3>
                    <p className="text-sm dark:text-gray-400 text-gray-500">
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-sm dark:text-gray-400 text-gray-500">
                  Dr. {record.doctorName}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Diagnosis</h4>
                  <p className="text-sm dark:text-gray-400 text-gray-600">{record.diagnosis}</p>
                </div>
                {record.prescription && (
                  <div>
                    <h4 className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Prescription</h4>
                    <p className="text-sm dark:text-gray-400 text-gray-600">{record.prescription}</p>
                  </div>
                )}
                {record.notes && (
                  <div>
                    <h4 className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Notes</h4>
                    <p className="text-sm dark:text-gray-400 text-gray-600">{record.notes}</p>
                  </div>
                )}
                {record.attachments?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {record.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-xs dark:bg-gray-700 bg-gray-100 dark:text-gray-300 text-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          {attachment.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {records.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg dark:text-gray-400 text-gray-500">No medical records found</p>
            {currentUser.type === 'doctor' && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-medical-blue-500 text-white rounded-lg hover:bg-medical-blue-600 transition-colors"
              >
                Add First Record
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 