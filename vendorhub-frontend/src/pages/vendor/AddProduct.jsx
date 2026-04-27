import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../api/axios';

export default function AddProduct() {
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', imageUrl: '', category: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await productApi.post('/api/products', {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      });
      alert('Product submitted for approval!');
      navigate('/vendor/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '600px' }}>
      <h4 className="mb-4">Add New Product</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        {[
          { label: 'Product name', key: 'name', type: 'text' },
          { label: 'Price ($)', key: 'price', type: 'number' },
          { label: 'Stock quantity', key: 'stock', type: 'number' },
          { label: 'Category', key: 'category', type: 'text' },
          { label: 'Image URL', key: 'imageUrl', type: 'text' },
        ].map(({ label, key, type }) => (
          <div key={key} className="mb-3">
            <label className="form-label">{label}</label>
            <input type={type} className="form-control" value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              required={key !== 'imageUrl'} min={type === 'number' ? 0 : undefined} step={key === 'price' ? '0.01' : undefined} />
          </div>
        ))}
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={4} value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}