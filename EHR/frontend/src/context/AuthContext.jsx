import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
export const AuthContext = createContext();

// Mock user data
const mockUsers = {
  doctors: [
    { id: 1, email: 'doctor@example.com', password: 'password123', name: 'Dr. John Smith', type: 'doctor' },
    { id: 2, email: 'doctor2@example.com', password: 'password123', name: 'Dr. Sarah Johnson', type: 'doctor' }
  ],
  patients: [
    { id: 1, email: 'patient@example.com', password: 'password123', name: 'Alex Thompson', type: 'patient' },
    { id: 2, email: 'patient2@example.com', password: 'password123', name: 'Emily Wilson', type: 'patient' }
  ]
};

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage if available
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
        return null;
      }
    }
    return null;
  });
  
  const [userType, setUserType] = useState(() => {
    if (currentUser) {
      return currentUser.type || '';
    }
    return '';
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load token on mount if available
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !currentUser) {
      // If we have a token but no current user, try to get user from localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setCurrentUser(parsedUser);
          setUserType(parsedUser.type || '');
          console.log('Loaded user from localStorage:', parsedUser);
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
        }
      }
    }
  }, [currentUser]);

  // Login function
  const login = async (email, password, type) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const users = type === 'doctor' ? mockUsers.doctors : mockUsers.patients;
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Create a sanitized user object (no password)
        const safeUser = { ...user };
        delete safeUser.password;
        
        setCurrentUser(safeUser);
        setUserType(type);
        return true;
      } else {
        setError('Invalid email or password');
        return false;
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setUserType('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('welcomeMessage');
  };

  // Reset password function
  const resetPassword = async (email, newPassword) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in both doctors and patients arrays
      const doctor = mockUsers.doctors.find(u => u.email === email);
      const patient = mockUsers.patients.find(u => u.email === email);
      
      if (doctor) {
        doctor.password = newPassword;
        return true;
      } else if (patient) {
        patient.password = newPassword;
        return true;
      } else {
        setError('User not found');
        return false;
      }
    } catch (err) {
      setError('An error occurred while resetting password. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    currentUser,
    userType,
    loading,
    error,
    login,
    logout,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  return useContext(AuthContext);
}; 