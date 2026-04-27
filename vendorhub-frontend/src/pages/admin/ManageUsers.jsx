import { useState, useEffect } from 'react';
import { authApi } from '../../api/axios';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.get('/api/admin/users').then(res => setUsers(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    try {
      const res = await authApi.put(`/api/admin/vendors/${id}/approve`);
      setUsers(prev => prev.map(u => u.id === id ? res.data : u));
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const toggle = async (id) => {
    try {
      const res = await authApi.put(`/api/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u.id === id ? res.data : u));
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      <h4 className="mb-4">Manage Users</h4>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Approved</th><th>Active</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge bg-secondary">{u.role}</span></td>
                <td>{u.approved ? '✅' : '❌'}</td>
                <td>{u.active ? '✅' : '❌'}</td>
                <td className="d-flex gap-1">
                  {u.role === 'VENDOR' && !u.approved && (
                    <button className="btn btn-sm btn-success" onClick={() => approve(u.id)}>Approve</button>
                  )}
                  <button className={`btn btn-sm ${u.active ? 'btn-warning' : 'btn-outline-success'}`}
                    onClick={() => toggle(u.id)}>
                    {u.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}