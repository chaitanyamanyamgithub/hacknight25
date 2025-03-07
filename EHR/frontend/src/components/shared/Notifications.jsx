import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getUserNotifications, 
  formatDateTime,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../../utils/mockData';
import PageHeader from '../PageHeader';
import EmptyState from '../EmptyState';
import { 
  BellIcon, 
  CheckCircleIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function Notifications({ userType, userId }) {
  const navigate = useNavigate();
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Get user notifications - ensure userId is a number
  useEffect(() => {
    const userNotifications = getUserNotifications(Number(userId));
    setNotifications(userNotifications);
  }, [userId]);
  
  // Sort notifications by date (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Group notifications by read status
  const unreadNotifications = sortedNotifications.filter(notification => !notification.read);
  const readNotifications = sortedNotifications.filter(notification => notification.read);
  
  // Get notification icon by type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return CalendarIcon;
      case 'message':
        return ChatBubbleLeftRightIcon;
      case 'record':
        return DocumentTextIcon;
      default:
        return BellIcon;
    }
  };
  
  // Mark all as read
  const handleMarkAllAsRead = async () => {
    setMarkingAsRead(true);
    try {
      // Mark all notifications as read in the mock data
      markAllNotificationsAsRead(Number(userId));
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    } finally {
      setMarkingAsRead(false);
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = (notificationId) => {
    // Mark notification as read in the mock data
    markNotificationAsRead(Number(userId), notificationId);
    
    // Update local state
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    );
    setNotifications(updatedNotifications);
  };

  const handleViewMessage = () => {
    navigate(`/${userType.toLowerCase()}-dashboard/messages`);
  };

  const handleViewAppointment = () => {
    navigate(`/${userType.toLowerCase()}-dashboard/appointments`);
  };
  
  return (
    <div>
      <PageHeader 
        title="Notifications" 
        description="Stay updated with important information"
      />
      
      {/* Mark all as read button (only show if there are unread notifications) */}
      {unreadNotifications.length > 0 && (
        <div className="flex justify-end mb-6">
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAsRead}
            className="px-4 py-2 bg-medical-box-light text-white rounded-md hover:bg-opacity-80 transition-colors flex items-center"
          >
            {markingAsRead ? (
              <>
                <div className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                Marking as read...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5 mr-1" />
                Mark all as read
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Unread</h3>
          <div className="bg-medical-box-light rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-700">
              {unreadNotifications.map(notification => {
                const IconComponent = getNotificationIcon(notification.type);
                
                return (
                  <li key={notification.id} className="p-4 hover:bg-gray-700 transition-colors">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-white">{notification.content}</p>
                          <span className="ml-2 text-xs text-gray-400 whitespace-nowrap">
                            {formatDateTime(notification.date)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center">
                          <button 
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                          >
                            Mark as read
                          </button>
                          {notification.type === 'appointment' && (
                            <button 
                              onClick={handleViewAppointment}
                              className="ml-3 text-xs text-blue-500 hover:text-blue-400 transition-colors"
                            >
                              View appointment
                            </button>
                          )}
                          {notification.type === 'message' && (
                            <button 
                              onClick={handleViewMessage}
                              className="ml-3 text-xs text-blue-500 hover:text-blue-400 transition-colors"
                            >
                              View message
                            </button>
                          )}
                          {notification.type === 'record' && (
                            <button className="ml-3 text-xs text-blue-500 hover:text-blue-400 transition-colors">
                              View record
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      
      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Earlier</h3>
          <div className="bg-medical-box-light rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-700">
              {readNotifications.map(notification => {
                const IconComponent = getNotificationIcon(notification.type);
                
                return (
                  <li key={notification.id} className="p-4 hover:bg-gray-700 transition-colors opacity-75">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm text-black font-medium">{notification.content}</p>
                        <span className="ml-2 text-xs text-black font-medium whitespace-nowrap">
                          {formatDateTime(notification.date)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      
      {/* No notifications state */}
      {sortedNotifications.length === 0 && (
        <EmptyState
          icon={BellIcon}
          title="No notifications"
          description="You're all caught up! There are no notifications to display at this time."
        />
      )}
    </div>
  );
} 