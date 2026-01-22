import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, AlertCircle, X } from 'lucide-react';

interface NotificationBannerProps {
  notification: {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null;
  onClose: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-md ${
      notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
      notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
      notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
      'bg-blue-50 border-blue-200 text-blue-800'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {notification.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
          {notification.type === 'error' && <XCircle className="h-5 w-5 mr-2" />}
          {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 mr-2" />}
          {notification.type === 'info' && <AlertCircle className="h-5 w-5 mr-2" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;