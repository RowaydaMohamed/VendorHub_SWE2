import { useState, useEffect } from 'react';
import { productApi } from '../../api/axios';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  const fetch = async (t) => {
    setLoading(true);
    try {
      const url = t === 'pending' ? '/api/products/admin/pending' : '/api/products/admin/all';
      const res = await productApi.get(url);
      setProducts(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(tab); }, [tab]);

  const approve = async (id) => {
    try {
      const res = await productApi.put(`/api/products/admin/${id}/approve`);
      setProducts(prev => prev.map(p => p.id === id ? res.data : p));
    } catch (err) { alert(err.response?.data?.error); }
  };

  const reject = async (id) => {
    try {
      const res = await productApi.put(`/api/products/admin/${id}/reject`);
      setProducts(prev => prev.map(p => p.id === id ? res.data : p));
    } catch (err) { alert(err.response?.data?.error); }
  };

  const statusColor = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };

  return (
    <div className="container py-4">
      <h4 className="mb-4">Manage Products</h4>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>Pending</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Products</button>
        </li>
      </ul>
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr><th>Name</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>${p.price?.toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td><span className={`badge bg-${statusColor[p.status]}`}>{p.status}</span></td>
                  <td className="d-flex gap-1">
                    {p.status !== 'APPROVED' && (
                      <button className="btn btn-sm btn-success" onClick={() => approve(p.id)}>Approve</button>
                    )}
                    {p.status !== 'REJECTED' && (
                      <button className="btn btn-sm btn-danger" onClick={() => reject(p.id)}>Reject</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}