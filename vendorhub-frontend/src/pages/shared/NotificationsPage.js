import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationAPI } from '../../api/services';
import { toast } from 'react-toastify';

const TYPE_COLOR = {
  ORDER_PLACED:       'border-l-blue-500   bg-blue-50',
  PRODUCT_APPROVED:   'border-l-green-500  bg-green-50',
  VENDOR_APPROVED:    'border-l-indigo-500 bg-indigo-50',
  LOW_STOCK:          'border-l-amber-500  bg-amber-50',
  ORDER_STATUS_UPDATED:'border-l-purple-500 bg-purple-50',
  GENERAL:            'border-l-gray-400   bg-gray-50',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI.getAll()
      .then(res => setNotifications(res.data))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkOne = async (id) => {
    try {
      await notificationAPI.markOneRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* silent */ }
  };

  const handleMarkAll = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed'); }
  };

  const unread = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell size={24}/> Notifications
          {unread > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
              {unread} new
            </span>
          )}
        </h1>
        {unread > 0 && (
          <button onClick={handleMarkAll}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
            <CheckCheck size={16}/> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bell size={48} className="mx-auto mb-3 opacity-30"/>
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id}
              onClick={() => !n.isRead && handleMarkOne(n.id)}
              className={`border-l-4 rounded-lg p-4 cursor-pointer transition hover:shadow-md
                ${TYPE_COLOR[n.type] || TYPE_COLOR.GENERAL}
                ${n.isRead ? 'opacity-60' : 'shadow-sm'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`font-semibold text-gray-900 text-sm ${!n.isRead ? 'font-bold' : ''}`}>
                    {n.title}
                  </p>
                  <p className="text-gray-700 text-sm mt-1 whitespace-pre-line">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0"/>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}