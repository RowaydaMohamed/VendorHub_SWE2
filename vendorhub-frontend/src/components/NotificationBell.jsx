import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/axios';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.get('/api/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    connectWebSocket(user.userId, (n) => {
      setNotifications(prev => [n, ...prev]);
    });
    return () => disconnectWebSocket();
  }, [user]);

  const unread = notifications.filter(n => !n.read).length;

  const markRead = async (id) => {
    try {
      await notificationApi.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="position-relative">
      <button className="btn btn-outline-light btn-sm position-relative" onClick={() => setShow(!show)}>
        🔔
        {unread > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unread}
          </span>
        )}
      </button>
      {show && (
        <div className="position-absolute end-0 mt-2 bg-white border rounded shadow"
          style={{ width: '300px', maxHeight: '400px', overflowY: 'auto', zIndex: 1000 }}>
          <div className="p-2 border-bottom d-flex justify-content-between">
            <strong>Notifications</strong>
            <button className="btn btn-link btn-sm p-0" onClick={() => setShow(false)}>✕</button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-center text-muted p-3 mb-0">No notifications</p>
          ) : (
            notifications.map(n => (
              <div key={n.id}
                className={`p-2 border-bottom ${!n.read ? 'bg-light' : ''}`}
                onClick={() => markRead(n.id)}
                style={{ cursor: 'pointer' }}>
                <p className="mb-0 small">{n.message}</p>
                <span className="text-muted" style={{ fontSize: '11px' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}