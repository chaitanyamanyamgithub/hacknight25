import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
export const login = async (credentials) => {
  try {
    console.log('Login attempt with:', credentials);
    const response = await api.post('/api/auth/login', credentials);
    console.log('Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    // Let the interceptor handle the error
    throw error;
  }
};

export const register = async (userData) => {
  try {
    // Log the request data for debugging
    console.log('Registration request data:', userData);
    
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    // Log the error details for debugging
    console.error('Registration error:', error.response?.data || error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.error || 'Registration failed');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please try again.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('Error setting up the request. Please try again.');
    }
  }
};

export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  return response.data;
};

export const verifyToken = async () => {
  const response = await api.get('/api/auth/verify');
  return response.data;
};

// Doctor Dashboard APIs
export const getDoctorStats = async () => {
  try {
    console.log('Fetching doctor stats...');
    const response = await api.get('/api/doctor/stats');
    console.log('Doctor stats fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    // Return mock data if API fails
    return {
      totalPatients: 42,
      todayAppointments: 5,
      pendingReports: 3,
      unreadMessages: 7,
      recentActivity: [
        { description: 'Updated patient record for Jane Doe', time: '2 hours ago' },
        { description: 'Completed appointment with John Smith', time: '4 hours ago' },
        { description: 'Added new prescription for Mary Johnson', time: 'Yesterday' },
      ]
    };
  }
};

export const getDoctorAppointments = async () => {
  try {
    console.log('Fetching doctor appointments...');
    const response = await api.get('/api/doctor/appointments');
    console.log('Doctor appointments fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    // Return mock data if API fails
    return [
      { id: 1, patientName: 'Jane Doe', time: '9:00 AM', type: 'Check-up', status: 'confirmed' },
      { id: 2, patientName: 'John Smith', time: '11:30 AM', type: 'Follow-up', status: 'confirmed' },
      { id: 3, patientName: 'Emily Clark', time: '2:00 PM', type: 'Consultation', status: 'pending' },
    ];
  }
};

export const getDoctorPatients = async () => {
  const response = await api.get('/api/doctor/patients');
  return response.data;
};

export const getDoctorMedicalRecords = async () => {
  const response = await api.get('/api/doctor/medical-records');
  return response.data;
};

// Patient Dashboard APIs
export const getPatientStats = async () => {
  try {
    console.log('Fetching patient stats...');
    const response = await api.get('/api/patient/stats');
    console.log('Patient stats fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient stats:', error);
    // Return mock data if API fails
    return {
      upcomingAppointments: 2,
      activePrescriptions: 3,
      unreadMessages: 1,
      recentActivity: [
        { description: 'Doctor Smith updated your treatment plan', time: 'Yesterday' },
        { description: 'New lab results available', time: '2 days ago' },
        { description: 'Prescription refill available', time: '3 days ago' },
      ]
    };
  }
};

export const getPatientAppointments = async () => {
  try {
    console.log('Fetching patient appointments...');
    const response = await api.get('/api/patient/appointments');
    console.log('Patient appointments fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    // Return mock data if API fails
    return [
      { id: 1, doctorName: 'Dr. Smith', time: 'Tomorrow, 9:00 AM', type: 'Check-up', status: 'confirmed' },
      { id: 2, doctorName: 'Dr. Johnson', time: 'Next Week, 2:00 PM', type: 'Follow-up', status: 'pending' },
    ];
  }
};

export const getPatientMedicalRecords = async () => {
  const response = await api.get('/api/patient/medical-records');
  return response.data;
};

export const getPatientPrescriptions = async () => {
  const response = await api.get('/api/patient/prescriptions');
  return response.data;
};

export const getPatientHealthMetrics = async () => {
  const response = await api.get('/api/patient/health-metrics');
  return response.data;
};

// Shared APIs
export const getAppointments = async (userType, userId) => {
  const response = await api.get(`/api/${userType}/${userId}/appointments`);
  return response.data;
};

export const createAppointment = async (appointmentData) => {
  const response = await api.post('/api/appointments', appointmentData);
  return response.data;
};

export const updateAppointment = async (appointmentId, appointmentData) => {
  const response = await api.put(`/api/appointments/${appointmentId}`, appointmentData);
  return response.data;
};

export const deleteAppointment = async (appointmentId) => {
  const response = await api.delete(`/api/appointments/${appointmentId}`);
  return response.data;
};

export const getMedicalRecords = async (userId) => {
  const response = await api.get(`/api/medical-records/${userId}`);
  return response.data;
};

export const createMedicalRecord = async (recordData) => {
  const response = await api.post('/api/medical-records', recordData);
  return response.data;
};

export const updateMedicalRecord = async (recordId, recordData) => {
  const response = await api.put(`/api/medical-records/${recordId}`, recordData);
  return response.data;
};

export const deleteMedicalRecord = async (recordId) => {
  const response = await api.delete(`/api/medical-records/${recordId}`);
  return response.data;
};

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
      return Promise.reject({ error: 'Network error occurred. Please check if the server is running.' });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject({ error: error.message });
    }
  }
);

export default api; 