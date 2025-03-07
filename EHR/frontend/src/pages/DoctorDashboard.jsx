import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

// Import custom components
import Patients from '../components/doctor/Patients';
import Appointments from '../components/shared/Appointments';
import MedicalRecords from '../components/shared/MedicalRecords';
import Messages from '../components/shared/Messages';
import Notifications from '../components/shared/Notifications';
import Settings from '../components/shared/Settings';
import Analytics from '../components/shared/Analytics';
import DashboardLayout from '../components/shared/DashboardLayout';
import { getUserMessages } from '../utils/mockData';
import { 
  getDoctorStats, 
  getDoctorAppointments, 
  getDoctorPatients, 
  getDoctorMedicalRecords 
} from '../services/api';

const navigation = [
  { name: 'Dashboard', icon: HomeIcon, path: '' },
  { name: 'Patients', icon: UserGroupIcon, path: 'patients' },
  { name: 'Appointments', icon: CalendarIcon, path: 'appointments' },
  { name: 'Medical Records', icon: DocumentTextIcon, path: 'records' },
  { name: 'Notifications', icon: BellIcon, path: 'notifications' },
  { name: 'Messages', icon: ChatBubbleLeftRightIcon, path: 'messages' },
  { name: 'Analytics', icon: ChartBarIcon, path: 'analytics' },
  { name: 'Settings', icon: Cog6ToothIcon, path: 'settings' },
];

export default function DoctorDashboard() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  
  // Load user info from localStorage if not available through context
  useEffect(() => {
    if (!currentUser) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserInfo(parsedUser);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    } else {
      setUserInfo(currentUser);
    }
  }, [currentUser]);
  
  useEffect(() => {
    // Check if there's a message in the location state (from login/registration)
    if (location.state && location.state.message) {
      setWelcomeMessage(location.state.message);
      setShowWelcomeMessage(true);
      
      // Hide the message after 5 seconds
      const timer = setTimeout(() => {
        setShowWelcomeMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    // Check for welcome message in localStorage (for hard redirects)
    const welcomeMsg = localStorage.getItem('welcomeMessage');
    if (welcomeMsg) {
      setWelcomeMessage(welcomeMsg);
      setShowWelcomeMessage(true);
      
      // Remove the message from localStorage
      localStorage.removeItem('welcomeMessage');
      
      // Hide the message after 5 seconds
      const timer = setTimeout(() => {
        setShowWelcomeMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  // Check if we have any user data to display
  const effectiveUser = currentUser || userInfo;
  
  if (!effectiveUser) {
    // Redirect to login if no user data available
    window.location.href = '/login?type=doctor';
    return null;
  }

  return (
    <DashboardLayout navigation={navigation} dashboardType="Doctor">
      {showWelcomeMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-lg animate-fade-in">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
              </svg>
            </div>
            <div>
              {welcomeMessage}
            </div>
            <div className="ml-auto">
              <button 
                onClick={() => setShowWelcomeMessage(false)}
                className="text-green-700 hover:text-green-900"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/" element={<DashboardHome user={effectiveUser} />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/appointments" element={<Appointments userType="doctor" userId={effectiveUser.id} />} />
        <Route path="/records" element={<MedicalRecords />} />
        <Route path="/notifications" element={<Notifications userType="doctor" userId={effectiveUser.id} />} />
        <Route path="/messages" element={<Messages userType="doctor" userId={effectiveUser.id} />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </DashboardLayout>
  );
}

function DashboardHome({ user }) {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, appointmentsData] = await Promise.all([
        getDoctorStats(),
        getDoctorAppointments()
      ]);
      
      setStats(statsData);
      setAppointments(appointmentsData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  // Quick stats data
  const statsData = [
    { name: 'Total Patients', value: stats?.totalPatients || '0', icon: UserGroupIcon, color: 'medical-blue' },
    { name: 'Today\'s Appointments', value: stats?.todayAppointments || '0', icon: CalendarIcon, color: 'medical-teal' },
    { name: 'Pending Reports', value: stats?.pendingReports || '0', icon: DocumentTextIcon, color: 'medical-green' },
    { name: 'Messages', value: stats?.unreadMessages || '0', icon: ChatBubbleLeftRightIcon, color: 'blue' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-5 dark:text-white text-gray-800">Doctor Dashboard</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
            <div 
              key={index} 
              className="dark:bg-medical-blue-800 bg-white overflow-hidden rounded-lg shadow dark:shadow-medical-blue-800/30"
            >
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium truncate dark:text-gray-300 text-gray-500">
                    {stat.name}
                  </p>
                  <p className="mt-1 text-3xl font-semibold dark:text-white text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`flex-shrink-0 rounded-md p-3 dark:bg-${stat.color}-500/20 bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 dark:text-${stat.color}-400 text-${stat.color}-600`} />
                </div>
              </div>
              <div className={`bg-gradient-to-r dark:from-${stat.color}-500 dark:to-${stat.color}-400 from-${stat.color}-400 to-${stat.color}-300 w-full h-1`} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Appointments */}
        <div className="dark:bg-medical-blue-800 bg-white overflow-hidden rounded-lg shadow dark:shadow-medical-blue-800/30">
          <div className="p-4 flex items-center justify-between border-b dark:border-medical-blue-700 border-gray-200">
            <h3 className="text-lg font-medium dark:text-white text-gray-800">Today's Appointments</h3>
            <Link to="/doctor-dashboard/appointments" className="text-sm font-medium dark:text-medical-teal-400 text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="p-4">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-medical-blue-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium dark:text-gray-300 text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium dark:text-gray-300 text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium dark:text-gray-300 text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium dark:text-gray-300 text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-medical-blue-700">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium dark:text-white text-gray-900">{appointment.patientName}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm dark:text-gray-300 text-gray-500">{appointment.time}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm dark:text-gray-300 text-gray-500">{appointment.type}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.status === 'confirmed' 
                            ? 'dark:bg-green-900/30 bg-green-100 dark:text-green-400 text-green-800' 
                            : 'dark:bg-yellow-900/30 bg-yellow-100 dark:text-yellow-400 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dark:bg-medical-blue-800 bg-white overflow-hidden rounded-lg shadow dark:shadow-medical-blue-800/30">
          <div className="p-4 flex items-center justify-between border-b dark:border-medical-blue-700 border-gray-200">
            <h3 className="text-lg font-medium dark:text-white text-gray-800">Recent Activity</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-4">
              {stats?.recentActivity?.map((activity, index) => (
                <li key={index} className="p-3 dark:bg-medical-blue-700/40 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <div className="w-2 h-2 rounded-full dark:bg-medical-teal-400 bg-blue-600"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm dark:text-white text-gray-900">{activity.description}</p>
                      <p className="text-xs dark:text-gray-400 text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}