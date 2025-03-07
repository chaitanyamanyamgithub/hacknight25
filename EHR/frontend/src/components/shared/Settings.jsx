import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../PageHeader';
import { 
  UserCircleIcon, 
  BellIcon, 
  LockClosedIcon, 
  ShieldCheckIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

export default function Settings({ userType, userId }) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: LockClosedIcon },
    { id: 'privacy', name: 'Privacy', icon: ShieldCheckIcon },
    { id: 'devices', name: 'Devices', icon: DevicePhoneMobileIcon },
  ];
  
  return (
    <div>
      <PageHeader 
        title="Settings" 
        description="Manage your account settings and preferences"
      />
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs */}
        <div className="w-full md:w-1/4">
          <div className="bg-medical-box-light rounded-lg overflow-hidden">
            <nav className="space-y-1 p-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <tab.icon
                    className={`mr-3 h-5 w-5 ${
                      activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'
                    }`}
                  />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Content */}
        <div className="w-full md:w-3/4">
          <div className="mt-8 bg-medical-box-light rounded-lg p-6">
            {activeTab === 'profile' && (
              <ProfileSettings currentUser={currentUser} userType={userType} />
            )}
            
            {activeTab === 'notifications' && (
              <NotificationSettings />
            )}
            
            {activeTab === 'security' && (
              <SecuritySettings />
            )}
            
            {activeTab === 'privacy' && (
              <PrivacySettings userType={userType} />
            )}
            
            {activeTab === 'devices' && (
              <DevicesSettings />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ currentUser, userType }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    specialty: currentUser?.specialty || '',
    licenseNumber: currentUser?.licenseNumber || '',
    dateOfBirth: currentUser?.dateOfBirth || '',
    phoneNumber: currentUser?.phoneNumber || '',
    emergencyContact: currentUser?.emergencyContact || '',
    emergencyContactPhone: currentUser?.emergencyContactPhone || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      // Here you would typically make an API call to update the user's profile
      console.log('Saving profile changes:', formData);
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Error saving profile:', error);
      // Show error message
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      specialty: currentUser?.specialty || '',
      licenseNumber: currentUser?.licenseNumber || '',
      dateOfBirth: currentUser?.dateOfBirth || '',
      phoneNumber: currentUser?.phoneNumber || '',
      emergencyContact: currentUser?.emergencyContact || '',
      emergencyContactPhone: currentUser?.emergencyContactPhone || '',
    });
    setIsEditing(false);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Here you would typically upload the photo to your server
        console.log('Uploading photo:', file);
        setShowPhotoUpload(false);
        // Show success message
      } catch (error) {
        console.error('Error uploading photo:', error);
        // Show error message
      }
    }
  };

  const handleRemovePhoto = async () => {
    try {
      // Here you would typically remove the photo from your server
      console.log('Removing photo');
      // Show success message
    } catch (error) {
      console.error('Error removing photo:', error);
      // Show error message
    }
  };

  return (
    <div>
      <h2 className="text-xl font-medium text-white mb-6">Profile Settings</h2>
      
      <div className="flex flex-col items-center mb-6 sm:flex-row sm:items-start">
        <div className="flex-shrink-0 h-24 w-24 rounded-full bg-gray-600 flex items-center justify-center mb-4 sm:mb-0 sm:mr-6">
          <span className="text-3xl font-medium text-white">{currentUser?.name?.charAt(0) || 'U'}</span>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-white">{currentUser?.name || 'User'}</h3>
          <p className="text-black font-medium">{currentUser?.email || 'user@example.com'}</p>
          <div className="mt-2 flex space-x-2">
            <button 
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              onClick={() => setShowPhotoUpload(true)}
            >
              Change Photo
            </button>
            <button 
              className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
              onClick={handleRemovePhoto}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      
      {showPhotoUpload && (
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-500 file:text-white
              hover:file:bg-blue-600"
          />
        </div>
      )}
      
      <form className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Full Name
            </label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Email Address
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
          </div>
          
          {userType === 'doctor' && (
            <>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Specialty
                </label>
                <input 
                  type="text" 
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  License Number
                </label>
                <input 
                  type="text" 
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </>
          )}
          
          {userType === 'patient' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Date of Birth
                </label>
                <input 
                  type="date" 
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Emergency Contact
                </label>
                <input 
                  type="text" 
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Emergency Contact Phone
                </label>
                <input 
                  type="tel" 
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </>
          )}
        </div>
        
        <div className="pt-5 flex justify-end">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="mr-3 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

function NotificationSettings() {
  const [emailPreferences, setEmailPreferences] = useState({
    'email-appointments': true,
    'email-messages': true,
    'email-records': true,
    'email-news': false
  });

  const [pushPreferences, setPushPreferences] = useState({
    'push-appointments': true,
    'push-messages': true,
    'push-records': true
  });

  const handleEmailPreferenceChange = (id) => {
    setEmailPreferences(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handlePushPreferenceChange = (id) => {
    setPushPreferences(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSavePreferences = async () => {
    try {
      // Here you would typically make an API call to save notification preferences
      console.log('Saving notification preferences:', {
        email: emailPreferences,
        push: pushPreferences
      });
      // Show success message
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      // Show error message
    }
  };

  return (
    <div>
      <h2 className="text-xl font-medium text-white mb-6">Notification Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Email Notifications</h3>
          <div className="space-y-3">
            {[
              { id: 'email-appointments', label: 'Appointment reminders' },
              { id: 'email-messages', label: 'New messages' },
              { id: 'email-records', label: 'Medical record updates' },
              { id: 'email-news', label: 'Healthcare news and tips' }
            ].map(option => (
              <div key={option.id} className="flex items-center">
                <input
                  id={option.id}
                  type="checkbox"
                  checked={emailPreferences[option.id]}
                  onChange={() => handleEmailPreferenceChange(option.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={option.id} className="ml-2 block text-sm text-white">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Push Notifications</h3>
          <div className="space-y-3">
            {[
              { id: 'push-appointments', label: 'Appointment reminders' },
              { id: 'push-messages', label: 'New messages' },
              { id: 'push-records', label: 'Medical record updates' }
            ].map(option => (
              <div key={option.id} className="flex items-center">
                <input
                  id={option.id}
                  type="checkbox"
                  checked={pushPreferences[option.id]}
                  onChange={() => handlePushPreferenceChange(option.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={option.id} className="ml-2 block text-sm text-white">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-5 flex justify-end">
          <button
            type="button"
            onClick={handleSavePreferences}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      // Here you would typically make an API call to update the password
      console.log('Updating password:', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password. Please try again.');
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      // Here you would typically make an API call to toggle 2FA
      console.log('Toggling 2FA:', !twoFactorEnabled);
      setTwoFactorEnabled(!twoFactorEnabled);
      setSuccess(`Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      setError('Failed to update two-factor authentication. Please try again.');
    }
  };

  const handleSignOut = async (deviceId) => {
    try {
      // Here you would typically make an API call to sign out the device
      console.log('Signing out device:', deviceId);
      setSuccess('Device signed out successfully');
    } catch (error) {
      console.error('Error signing out device:', error);
      setError('Failed to sign out device. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-medium text-white mb-6">Security Settings</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-500">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-md text-green-500">
          {success}
        </div>
      )}
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Change Password</h3>
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Change Password
            </button>
          ) : (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Current Password
                </label>
                <input 
                  type="password" 
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your current password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  New Password
                </label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Confirm New Password
                </label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
              
              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePasswordUpdate}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Two-Factor Authentication</h3>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Protect your account with two-factor authentication</p>
                <p className="text-sm text-gray-400 mt-1">Add an extra layer of security to your account</p>
              </div>
              <button
                type="button"
                onClick={handleTwoFactorToggle}
                className={`px-4 py-2 rounded-md transition-colors ${
                  twoFactorEnabled
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {twoFactorEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Login History</h3>
          <div className="bg-gray-700 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-600">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white text-sm">Chrome on Windows</p>
                  <p className="text-xs text-gray-400">Current session</p>
                </div>
                <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs">
                  Active Now
                </span>
              </div>
            </div>
            <div className="px-4 py-3 border-b border-gray-600">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white text-sm">Safari on iPhone</p>
                  <p className="text-xs text-gray-400">May 10, 2023 at 3:42 PM</p>
                </div>
                <button 
                  onClick={() => handleSignOut('safari-iphone')}
                  className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white text-sm">Firefox on MacOS</p>
                  <p className="text-xs text-gray-400">May 8, 2023 at 11:15 AM</p>
                </div>
                <button 
                  onClick={() => handleSignOut('firefox-macos')}
                  className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivacySettings({ userType }) {
  const [privacyPreferences, setPrivacyPreferences] = useState({
    'share-doctors': true,
    'share-insurance': true,
    'share-research': false,
    'share-emergency': true,
    'share-profile': true,
    'share-specialty': true,
    'share-availability': true
  });

  const [doctorAccess, setDoctorAccess] = useState({
    1: true,
    2: true,
    3: false
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePrivacyPreferenceChange = (id) => {
    setPrivacyPreferences(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    setError('');
    setSuccess('');
  };

  const handleDoctorAccessChange = (doctorId) => {
    setDoctorAccess(prev => ({
      ...prev,
      [doctorId]: !prev[doctorId]
    }));
    setError('');
    setSuccess('');
  };

  const handleSavePrivacySettings = async () => {
    try {
      // Here you would typically make an API call to save privacy settings
      console.log('Saving privacy settings:', {
        preferences: privacyPreferences,
        doctorAccess
      });
      setSuccess('Privacy settings updated successfully');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      setError('Failed to update privacy settings. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-medium text-white mb-6">Privacy Settings</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-500">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-md text-green-500">
          {success}
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Data Sharing</h3>
          <div className="space-y-3">
            {userType === 'patient' ? (
              // Patient privacy options
              [
                { id: 'share-doctors', label: 'Share my data with my healthcare providers' },
                { id: 'share-insurance', label: 'Share my data with my insurance provider' },
                { id: 'share-research', label: 'Allow my anonymized data to be used for research' },
                { id: 'share-emergency', label: 'Share my data in case of emergency' }
              ].map(option => (
                <div key={option.id} className="flex items-center">
                  <input
                    id={option.id}
                    type="checkbox"
                    checked={privacyPreferences[option.id]}
                    onChange={() => handlePrivacyPreferenceChange(option.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={option.id} className="ml-2 block text-sm text-white">
                    {option.label}
                  </label>
                </div>
              ))
            ) : (
              // Doctor privacy options
              [
                { id: 'share-profile', label: 'Share my profile with patients' },
                { id: 'share-specialty', label: 'Make my specialty public' },
                { id: 'share-availability', label: 'Show my availability to patients' }
              ].map(option => (
                <div key={option.id} className="flex items-center">
                  <input
                    id={option.id}
                    type="checkbox"
                    checked={privacyPreferences[option.id]}
                    onChange={() => handlePrivacyPreferenceChange(option.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={option.id} className="ml-2 block text-sm text-white">
                    {option.label}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
        
        {userType === 'patient' && (
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Access Control</h3>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-white mb-3">Manage which healthcare providers can access your medical records</p>
              
              <div className="space-y-3">
                {[
                  { id: 1, name: 'Dr. John Smith', specialty: 'Cardiology', access: true },
                  { id: 2, name: 'Dr. Sarah Johnson', specialty: 'Neurology', access: true },
                  { id: 3, name: 'Dr. Michael Brown', specialty: 'Pediatrics', access: false }
                ].map(doctor => (
                  <div key={doctor.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm">{doctor.name}</p>
                      <p className="text-xs text-gray-400">{doctor.specialty}</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        id={`doctor-access-${doctor.id}`}
                        type="checkbox"
                        checked={doctorAccess[doctor.id]}
                        onChange={() => handleDoctorAccessChange(doctor.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`doctor-access-${doctor.id}`} className="ml-2 block text-sm text-white">
                        Allow Access
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="pt-5 flex justify-end">
          <button
            type="button"
            onClick={handleSavePrivacySettings}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Save Privacy Settings
          </button>
        </div>
      </div>
    </div>
  );
}

function DevicesSettings() {
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: 'iPhone 13',
      type: 'mobile',
      connectedDate: '2023-05-01',
      isActive: true
    },
    {
      id: 2,
      name: 'Apple Watch Series 7',
      type: 'wearable',
      connectedDate: '2023-04-15',
      isActive: true
    }
  ]);
  const [editingDevice, setEditingDevice] = useState(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRenameDevice = (deviceId) => {
    setEditingDevice(deviceId);
    const device = devices.find(d => d.id === deviceId);
    setNewDeviceName(device.name);
  };

  const handleSaveRename = async (deviceId) => {
    if (!newDeviceName.trim()) {
      setError('Device name cannot be empty');
      return;
    }

    try {
      // Here you would typically make an API call to rename the device
      console.log('Renaming device:', { deviceId, newName: newDeviceName });
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { ...device, name: newDeviceName }
          : device
      ));
      setEditingDevice(null);
      setSuccess('Device renamed successfully');
    } catch (error) {
      console.error('Error renaming device:', error);
      setError('Failed to rename device. Please try again.');
    }
  };

  const handleDisconnectDevice = async (deviceId) => {
    try {
      // Here you would typically make an API call to disconnect the device
      console.log('Disconnecting device:', deviceId);
      setDevices(prev => prev.filter(device => device.id !== deviceId));
      setSuccess('Device disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting device:', error);
      setError('Failed to disconnect device. Please try again.');
    }
  };

  const handleConnectNewDevice = async () => {
    try {
      // Here you would typically initiate the device connection process
      console.log('Connecting new device');
      setSuccess('Device connection initiated. Please follow the on-screen instructions.');
    } catch (error) {
      console.error('Error connecting device:', error);
      setError('Failed to connect device. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-medium text-white mb-6">Connected Devices</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-500">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-md text-green-500">
          {success}
        </div>
      )}
      
      <div className="mt-8 bg-medical-box-light rounded-lg overflow-hidden">
        {devices.map(device => (
          <div key={device.id} className="px-4 py-3 border-b border-gray-600 last:border-b-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                  {device.type === 'mobile' ? (
                    <DevicePhoneMobileIcon className="h-6 w-6 text-gray-300" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  {editingDevice === device.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newDeviceName}
                        onChange={(e) => setNewDeviceName(e.target.value)}
                        className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(device.id)}
                        className="text-xs text-blue-500 hover:text-blue-400"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingDevice(null)}
                        className="text-xs text-gray-400 hover:text-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-white text-sm">{device.name}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Connected on {new Date(device.connectedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleRenameDevice(device.id)}
                  className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Rename
                </button>
                <button 
                  onClick={() => handleDisconnectDevice(device.id)}
                  className="text-xs text-red-500 hover:text-red-400 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={handleConnectNewDevice}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Connect New Device
        </button>
      </div>
    </div>
  );
} 