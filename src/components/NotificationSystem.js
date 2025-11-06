import React from 'react';
import { CheckCircle, AlertCircle, Bell } from 'lucide-react';

const NotificationSystem = ({ notifications }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2">
      {notifications.slice(-3).map(notification => (
        <div
          key={notification.id}
          className={`px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform animate-slideIn ${notification.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' :
              notification.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' :
                'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
            }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {notification.type === 'info' && <Bell className="w-4 h-4" />}
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;