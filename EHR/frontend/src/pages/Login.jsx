import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SunIcon, MoonIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { login } from '../services/api';
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

export default function Login() {
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState(searchParams.get('type') || 'doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  // Set up dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    
    // Basic validation
    if (!email.trim()) {
      setFormError('Email is required');
      setLoading(false);
      return;
    }
    
    if (!password) {
      setFormError('Password is required');
      setLoading(false);
      return;
    }
    
    try {
      const response = await login({ email, password });
      console.log('Login response:', response);
      
      if (!response || !response.token) {
        setFormError('Invalid response from server. Please try again.');
        setLoading(false);
        return;
      }
      
      // Store the token
      localStorage.setItem('token', response.token);
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.user));
      // Store welcome message for displaying after redirect
      localStorage.setItem('welcomeMessage', `Welcome back, ${response.user.fullName}! You have successfully logged in.`);
      
      // Determine user type for redirection
      const redirectUserType = response.user.type || userType;
      console.log('Redirecting to dashboard for user type:', redirectUserType);
      
      // Show success animation
      setLoginSuccess(true);
      setLoading(false);
      
      // Log stored data for debugging
      console.log('Stored token:', localStorage.getItem('token'));
      console.log('Stored user:', localStorage.getItem('user'));
      console.log('Stored welcome message:', localStorage.getItem('welcomeMessage'));
      
      // Redirect after 2 seconds with a more reliable approach
      setTimeout(() => {
        console.log('Executing redirect after timeout');
        // Force redirection through window.location for reliability
        if (redirectUserType === 'doctor') {
          // Log before redirect
          console.log('Redirecting to doctor dashboard');
          // Use window.location.replace instead of href for more reliable navigation
          window.location.replace('/doctor-dashboard');
        } else if (redirectUserType === 'patient') {
          // Log before redirect
          console.log('Redirecting to patient dashboard');
          // Use window.location.replace instead of href for more reliable navigation
          window.location.replace('/patient-dashboard');
        } else {
          console.error('Unknown user type:', redirectUserType);
          window.location.replace('/');
        }
      }, 2000);
      
    } catch (err) {
      console.error('Login error in component:', err);
      
      // Clear any sensitive data
      setPassword('');
      
      if (err && typeof err === 'object' && err.error) {
        // This is a formatted error from our API interceptor
        setFormError(err.error);
      } else if (typeof err === 'string') {
        // This is a string error
        setFormError(err);
      } else if (err && err.message) {
        // This is an Error object
        setFormError(err.message);
      } else {
        // Fallback error message
        setFormError('Login failed. Please check your credentials and try again.');
      }
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-blue-50'} transition-colors duration-300`}>
      {/* Theme toggle button - positioned at top right */}
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
      
      {/* Left side - Medical Icons Image with animated icons */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${medicalIconsImage})` }}
        >
          {/* Overlay for better text readability */}
          <div className={`absolute inset-0 ${darkMode ? 'bg-blue-900/50' : 'bg-blue-500/30'}`}></div>
        </div>
        
        {/* Text overlay on the image */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-4xl font-bold mb-6 text-center"
          >
            Arogya Mithra
          </motion.h1>
          <motion.p 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            className="text-xl max-w-md text-center"
          >
            Your trusted partner in healthcare management and wellness.
          </motion.p>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className={`w-full md:w-1/2 flex items-center justify-center p-8 ${darkMode ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className={`max-w-md w-full space-y-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}
        >
          <div>
            <h2 className="text-center text-3xl font-extrabold">
              {userType === 'doctor' ? 'Doctor Login' : 'Patient Login'}
            </h2>
            <p className={`mt-2 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Please sign in to access your account
            </p>
          </div>

          {/* Toggle between Doctor and Patient */}
          <div className="flex justify-center space-x-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserType('doctor')}
              className={`px-6 py-3 rounded-full transition-colors duration-200 font-medium ${
                userType === 'doctor'
                  ? darkMode 
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30' 
                    : 'bg-pink-500 text-white shadow-md'
                  : darkMode 
                    ? 'bg-gray-800 text-gray-300' 
                    : 'bg-gray-200 text-gray-700'
              }`}
            >
              Doctor
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserType('patient')}
              className={`px-6 py-3 rounded-full transition-colors duration-200 font-medium ${
                userType === 'patient'
                  ? darkMode 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' 
                    : 'bg-green-500 text-white shadow-md'
                  : darkMode 
                    ? 'bg-gray-800 text-gray-300' 
                    : 'bg-gray-200 text-gray-700'
              }`}
            >
              Patient
            </motion.button>
          </div>
          
          {/* Helpful info */}
          <motion.div 
            variants={floatIn}
            className={`p-4 rounded-xl ${
              darkMode 
                ? 'bg-gray-800/80 border border-gray-700' 
                : 'bg-blue-50 border border-blue-100'
            }`}
          >
            <p className="text-xs text-center">
              {userType === 'doctor' ? 
                'Use doctor1@example.com with Doctor@123' : 
                'Use patient1@example.com with Patient@123'}
            </p>
          </motion.div>

          {/* Error messages */}
          {formError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-md text-red-500 ${
                darkMode 
                  ? 'bg-red-900/20 border border-red-800' 
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {formError}
            </motion.div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium mb-1">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none relative block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-pink-500 focus:border-pink-500'
                  }`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className={`appearance-none relative block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-pink-500 focus:border-pink-500'
                    }`}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link 
                  to="/forgot-password" 
                  className={`font-medium ${
                    userType === 'doctor'
                      ? 'text-pink-600 hover:text-pink-500'
                      : 'text-green-600 hover:text-green-500'
                  }`}
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                  userType === 'doctor'
                    ? darkMode 
                      ? 'bg-pink-600 hover:bg-pink-700 focus:ring-pink-500' 
                      : 'bg-pink-500 hover:bg-pink-600 focus:ring-pink-500'
                    : darkMode 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                      : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center">
              <Link 
                to={`/register?type=${userType}`} 
                className={`font-medium ${
                  userType === 'doctor'
                    ? 'text-pink-600 hover:text-pink-500'
                    : 'text-green-600 hover:text-green-500'
                }`}
              >
                Don&apos;t have an account? Sign up
              </Link>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Success overlay */}
      {loginSuccess && (
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
                Login successful!
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