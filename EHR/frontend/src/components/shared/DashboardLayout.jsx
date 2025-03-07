import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  MoonIcon,
  SunIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { getUserNotifications } from '../../utils/mockData';

export default function DashboardLayout({ 
  children, 
  navigation, 
  dashboardType,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Update notifications when currentUser changes or location changes
  useEffect(() => {
    if (currentUser) {
      const userNotifications = getUserNotifications(currentUser.id);
      setNotifications(userNotifications);
      const unreadCount = userNotifications.filter(n => !n.read).length;
      setNotificationCount(unreadCount);
    }
  }, [currentUser, location.pathname]);

  // Toggle dark/light mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div className="relative flex w-full max-w-xs flex-1 flex-col dark:bg-gray-900 bg-white pt-5 pb-4">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>

              {/* Logo */}
              <div className="flex flex-shrink-0 items-center px-4">
                <h1 className="text-2xl font-bold dark:text-white text-gray-900">Arogya Mithra</h1>
              </div>

              {/* Navigation */}
              <div className="mt-5 h-0 flex-1 overflow-y-auto">
                <nav className="space-y-1 px-2">
                  {navigation.map((item) => {
                    const isActive = location.pathname === `/${dashboardType.toLowerCase()}-dashboard/${item.path}`;
                    return (
                      <Link
                        key={item.name}
                        to={`/${dashboardType.toLowerCase()}-dashboard/${item.path}`}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          isActive
                            ? 'dark:bg-medical-blue-800 bg-blue-100 dark:text-white text-blue-900'
                            : 'dark:text-gray-300 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <item.icon
                          className={`mr-4 h-6 w-6 flex-shrink-0 ${
                            isActive
                              ? 'dark:text-medical-teal-400 text-blue-600'
                              : 'dark:text-gray-400 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto dark:bg-gray-900 bg-white pt-5">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center px-4">
            <h1 className="text-2xl font-bold dark:text-white text-gray-900">Arogya Mithra</h1>
          </div>

          {/* Navigation */}
          <div className="mt-5 flex flex-1 flex-col">
            <nav className="flex-1 space-y-1 px-2 pb-4">
              {navigation.map((item) => {
                const isActive = location.pathname === `/${dashboardType.toLowerCase()}-dashboard/${item.path}`;
                return (
                  <Link
                    key={item.name}
                    to={`/${dashboardType.toLowerCase()}-dashboard/${item.path}`}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'dark:bg-medical-blue-800 bg-blue-100 dark:text-white text-blue-900'
                        : 'dark:text-gray-300 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 flex-shrink-0 ${
                        isActive
                          ? 'dark:text-medical-teal-400 text-blue-600'
                          : 'dark:text-gray-400 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 dark:bg-gray-900 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r dark:border-gray-800 border-gray-200 text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <h2 className="text-2xl font-semibold dark:text-white text-gray-900 self-center">
                {dashboardType} Dashboard
              </h2>
            </div>
            <div className="ml-4 flex items-center gap-4">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="rounded-full p-1 dark:text-gray-400 text-gray-500 hover:text-gray-900 dark:hover:text-white focus:outline-none"
              >
                {darkMode ? (
                  <SunIcon className="h-6 w-6" />
                ) : (
                  <MoonIcon className="h-6 w-6" />
                )}
              </button>

              {/* User menu */}
              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="dark:text-white text-gray-900">{currentUser?.name || currentUser?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="rounded-md px-3 py-2 text-sm font-medium dark:text-white text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 