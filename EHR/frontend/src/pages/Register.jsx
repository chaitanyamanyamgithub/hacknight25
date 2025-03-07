import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { SunIcon, MoonIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { register } from '../services/api';
import medicalIconsImage from '../assets/medical-icons.jpg';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const floatIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    specialization: '',
    type: searchParams.get('type') || 'patient',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Update user type when URL parameter changes
    setFormData(prev => ({
      ...prev,
      type: searchParams.get('type') || 'patient'
    }));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      setError('Password must contain at least one number');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      setError('Password must contain at least one special character');
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate phone number
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    // Validate specialization for doctors
    if (formData.type === 'doctor' && !formData.specialization) {
      setError('Specialization is required for doctors');
      return;
    }

    setLoading(true);
    try {
      const response = await register(formData);
      // Store the token
      localStorage.setItem('token', response.token);
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.user));
      // Store welcome message for displaying after redirect
      localStorage.setItem('welcomeMessage', `Registration successful! Welcome to Arogya Mithra, ${formData.fullName}!`);
      
      // Show success animation
      setRegisterSuccess(true);
      setLoading(false);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        // Force redirection through window.location for reliability
        const userType = formData.type;
        console.log('Redirecting to dashboard for user type:', userType);
        
        if (userType === 'doctor') {
          // Use absolute path and force refresh
          window.location.replace('/doctor-dashboard');
        } else if (userType === 'patient') {
          // Use absolute path and force refresh
          window.location.replace('/patient-dashboard');
        } else {
          console.error('Unknown user type:', userType);
          window.location.replace('/');
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to register. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-blue-50'} transition-colors duration-300`}>
      {/* Theme toggle button */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 p-2 rounded-full bg-opacity-20 backdrop-blur-sm z-50 transition-colors duration-200 hover:bg-opacity-30"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <SunIcon className="h-6 w-6 text-yellow-300" />
        ) : (
          <MoonIcon className="h-6 w-6 text-blue-800" />
        )}
      </button>

      {/* Left side - Medical Icons Image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${medicalIconsImage})` }}
        >
          <div className={`absolute inset-0 ${darkMode ? 'bg-blue-900/50' : 'bg-blue-500/30'}`}></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-4xl font-bold mb-6 text-center"
          >
            Join Arogya Mithra
          </motion.h1>
          <motion.p 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            className="text-xl max-w-md text-center"
          >
            Create your account and start managing healthcare records efficiently.
          </motion.p>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className={`w-full md:w-1/2 flex items-center justify-center p-8 ${darkMode ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className={`max-w-md w-full space-y-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}
        >
          <div>
            <h2 className="text-center text-3xl font-extrabold">
              {formData.type === 'doctor' ? 'Doctor Registration' : 'Patient Registration'}
            </h2>
            <p className={`mt-2 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create your account to get started
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-md text-red-500 ${
                darkMode 
                  ? 'bg-red-900/20 border border-red-800' 
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {error}
            </motion.div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  className={`appearance-none relative block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-pink-500 focus:border-pink-500'
                  }`}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={`appearance-none relative block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-pink-500 focus:border-pink-500'
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {formData.type === 'doctor' && (
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium mb-1">
                    Specialization
                  </label>
                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    required
                    autoComplete="organization-title"
                    className={`appearance-none relative block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-pink-500 focus:border-pink-500'
                    }`}
                    placeholder="Enter your specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    className={`appearance-none relative block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-pink-500 focus:border-pink-500'
                    }`}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    className={`appearance-none relative block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-pink-500 focus:border-pink-500'
                    }`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  className={`appearance-none relative block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-pink-500 focus:border-pink-500'
                  }`}
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                  formData.type === 'doctor'
                    ? darkMode 
                      ? 'bg-pink-600 hover:bg-pink-700 focus:ring-pink-500' 
                      : 'bg-pink-500 hover:bg-pink-600 focus:ring-pink-500'
                    : darkMode 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                      : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            <div className="text-center">
              <Link 
                to={`/login?type=${formData.type === 'doctor' ? 'patient' : 'doctor'}`} 
                className={`font-medium ${
                  formData.type === 'doctor'
                    ? 'text-pink-600 hover:text-pink-500'
                    : 'text-green-600 hover:text-green-500'
                }`}
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Success overlay */}
      {registerSuccess && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={`p-8 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`mt-4 text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Registration successful!
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
              >
                Redirecting to your dashboard...
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 