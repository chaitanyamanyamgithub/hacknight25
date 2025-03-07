import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import { useState, useEffect } from 'react';

// Protected Route Component
const ProtectedRoute = ({ children, userType }) => {
  const { currentUser } = useAuth();
  const [effectiveUser, setEffectiveUser] = useState(currentUser);
  
  // If no user in context, try to get from localStorage
  useEffect(() => {
    if (!currentUser) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setEffectiveUser(parsedUser);
          console.log('ProtectedRoute: Loaded user from localStorage', parsedUser);
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
          setEffectiveUser(null);
        }
      } else {
        setEffectiveUser(null);
      }
    } else {
      setEffectiveUser(currentUser);
    }
  }, [currentUser]);

  // Check if token exists
  const hasToken = localStorage.getItem('token');
  
  if (!effectiveUser && !hasToken) {
    console.log('ProtectedRoute: No user or token, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (userType && effectiveUser && effectiveUser.type !== userType) {
    console.log(`ProtectedRoute: User type mismatch. Expected ${userType}, got ${effectiveUser.type}`);
    return <Navigate to={`/${effectiveUser.type.toLowerCase()}-dashboard`} />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/doctor-dashboard/*"
            element={
              <ProtectedRoute userType="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-dashboard/*"
            element={
              <ProtectedRoute userType="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;