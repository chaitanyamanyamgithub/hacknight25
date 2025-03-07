import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  getPatientAppointments, 
  getDoctorAppointments, 
  getPatientById, 
  getDoctorById,
  formatDateTime,
  patients,
  doctors
} from '../../utils/mockData';
import PageHeader from '../PageHeader';
import EmptyState from '../EmptyState';
import { CalendarIcon, ClockIcon, UserIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../../services/api';

export default function Appointments({ userType, userId }) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: 'check-up',
    notes: '',
    doctorId: '',
    patientId: ''
  });
  
  // Get patient ID from URL query parameters if available
  const patientId = searchParams.get('patientId') ? parseInt(searchParams.get('patientId')) : null;
  
  // Get appointments based on user type and patient ID
  const allAppointments = userType === 'doctor' 
    ? patientId 
      ? getDoctorAppointments(userId).filter(appt => appt.patientId === patientId)
      : getDoctorAppointments(userId)
    : getPatientAppointments(userId);
  
  // Filter appointments based on active tab
  const currentDate = new Date();
  const upcomingAppointments = allAppointments.filter(appt => new Date(appt.date) >= currentDate);
  const pastAppointments = allAppointments.filter(appt => new Date(appt.date) < currentDate);
  
  const displayAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  // Get the list of patients/doctors for the dropdown
  const getOptions = () => {
    if (userType === 'doctor') {
      return patients.map(patient => ({
        value: patient.id,
        label: patient.name
      }));
    } else {
      return doctors.map(doctor => ({
        value: doctor.id,
        label: doctor.name
      }));
    }
  };
  
  useEffect(() => {
    fetchAppointments();
  }, [userId]);

  const fetchAppointments = async () => {
    try {
      const response = await getAppointments(userType, userId);
      setAppointments(response.data.appointments);
    } catch (err) {
      setError('Failed to load appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAppointment({
        ...formData,
        [userType === 'doctor' ? 'doctorId' : 'patientId']: userId
      });
      fetchAppointments();
      setShowForm(false);
      setFormData({
        date: '',
        time: '',
        type: 'check-up',
        notes: '',
        doctorId: '',
        patientId: ''
      });
    } catch (err) {
      setError('Failed to create appointment');
      console.error('Error creating appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await updateAppointment(appointmentId, { status });
      fetchAppointments();
    } catch (err) {
      setError('Failed to update appointment status');
      console.error('Error updating appointment:', err);
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await deleteAppointment(appointmentId);
        fetchAppointments();
      } catch (err) {
        setError('Failed to cancel appointment');
        console.error('Error canceling appointment:', err);
      }
    }
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
        title="Appointments" 
        description={patientId ? `Appointments for ${getPatientById(patientId).name}` : "Manage your upcoming and past appointments"}
      />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-1 bg-medical-box-light p-1 rounded-lg">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'upcoming' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'past' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('past')}
          >
            Past
          </button>
        </div>
        
        {!patientId && (
          <button
            onClick={() => setShowNewAppointment(true)}
            className="px-4 py-2 bg-medical-box-light text-white rounded-md hover:bg-opacity-80 transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            New Appointment
          </button>
        )}
      </div>
      
      {displayAppointments.length > 0 ? (
        <div className="bg-medical-box-light rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-700">
            {displayAppointments.map(appointment => {
              // Get the other party's info (doctor or patient)
              const otherParty = userType === 'doctor' 
                ? getPatientById(appointment.patientId)
                : getDoctorById(appointment.doctorId);
              
              const appointmentDate = new Date(appointment.date);
              const formattedDate = formatDateTime(appointmentDate);
              
              return (
                <li key={appointment.id} className="p-4 hover:bg-gray-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <span className="text-lg font-medium text-white">{otherParty.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-white">{otherParty.name}</h3>
                        <p className="text-sm text-gray-400">{appointment.type}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 sm:mt-0 sm:ml-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formattedDate}
                      </div>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="mt-2 pl-14">
                      <p className="text-sm text-gray-400">{appointment.notes}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <EmptyState
          title={
            activeTab === 'upcoming'
              ? 'No upcoming appointments'
              : 'No past appointments'
          }
          description={
            activeTab === 'upcoming'
              ? 'You don\'t have any scheduled appointments upcoming. Book a new appointment with your doctor.'
              : 'You don\'t have any past appointment records.'
          }
          icon={CalendarIcon}
          actionLabel={activeTab === 'upcoming' && !patientId ? 'Book Appointment' : null}
          onAction={activeTab === 'upcoming' && !patientId ? () => setShowNewAppointment(true) : null}
        />
      )}
      
      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-medical-box-light rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Schedule New Appointment</h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {userType === 'doctor' ? 'Patient' : 'Doctor'}
                </label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select {userType === 'doctor' ? 'a patient' : 'a doctor'}</option>
                  {getOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Date
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Time
                </label>
                <input 
                  type="time" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Type
                </label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select type</option>
                  <option value="Check-up">Check-up</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="New Patient">New Patient</option>
                  <option value="Specialist Referral">Specialist Referral</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Notes
                </label>
                <textarea 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAppointment(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    // In a real app, this would save the appointment
                    setShowNewAppointment(false);
                  }}
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white text-gray-800">Appointments</h2>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-medical-blue-500 text-white rounded-lg hover:bg-medical-blue-600 transition-colors"
          >
            Schedule Appointment
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 dark:text-white text-gray-900">Schedule New Appointment</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
                    <option value="check-up">Check-up</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="consultation">Consultation</option>
                    <option value="emergency">Emergency</option>
                  </select>
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
                    {loading ? 'Scheduling...' : 'Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="p-6 dark:bg-gray-800 bg-white rounded-lg shadow-sm border dark:border-gray-700 border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full dark:bg-gray-700 bg-gray-100">
                    <CalendarIcon className="h-5 w-5 dark:text-medical-blue-400 text-medical-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-white text-gray-900">{appointment.type}</h3>
                    <p className="text-sm dark:text-gray-400 text-gray-500">
                      {new Date(appointment.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'confirmed'
                    ? 'dark:bg-green-900/30 bg-green-100 dark:text-green-400 text-green-800'
                    : appointment.status === 'pending'
                    ? 'dark:bg-yellow-900/30 bg-yellow-100 dark:text-yellow-400 text-yellow-800'
                    : 'dark:bg-red-900/30 bg-red-100 dark:text-red-400 text-red-800'
                }`}>
                  {appointment.status}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 dark:text-gray-400 text-gray-500" />
                  <span className="text-sm dark:text-gray-300 text-gray-700">{appointment.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 dark:text-gray-400 text-gray-500" />
                  <span className="text-sm dark:text-gray-300 text-gray-700">
                    {userType === 'doctor' ? appointment.patientName : appointment.doctorName}
                  </span>
                </div>
                {appointment.notes && (
                  <p className="text-sm dark:text-gray-400 text-gray-500 mt-2">{appointment.notes}</p>
                )}
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                {userType === 'doctor' && appointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusChange(appointment.id, 'rejected')}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
                {appointment.status !== 'cancelled' && (
                  <button
                    onClick={() => handleDelete(appointment.id)}
                    className="px-3 py-1 dark:bg-gray-700 bg-gray-100 dark:text-gray-300 text-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {appointments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg dark:text-gray-400 text-gray-500">No appointments found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-medical-blue-500 text-white rounded-lg hover:bg-medical-blue-600 transition-colors"
            >
              Schedule your first appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 