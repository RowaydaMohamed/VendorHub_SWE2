import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    productApi.get('/api/products/vendor/my').then(res => setProducts(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productApi.delete(`/api/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const statusBadge = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>My Products</h4>
        <button className="btn btn-success" onClick={() => navigate('/vendor/add-product')}>+ Add Product</button>
      </div>
      {products.length === 0 ? (
        <p className="text-muted">No products yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr><th>Name</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>${p.price?.toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td><span className={`badge bg-${statusBadge[p.status]}`}>{p.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteProduct(p.id)}>Delete</button>
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