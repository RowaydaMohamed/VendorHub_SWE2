import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productApi } from '../api/axios';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
        productApi.get(`/api/products/${id}`),
        productApi.get(`/api/reviews/product/${id}`),
        ]);
        setProduct(pRes.data);
        setReviews(rRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.productId === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ productId: product.id, productName: product.name, quantity: 1, unitPrice: product.price });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const res = await productApi.post(`/api/reviews/product/${id}`, review);
      setReviews(prev => [res.data, ...prev]);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Could not submit review');
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (!product) return <div className="text-center py-5">Product not found</div>;

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 'N/A';

  return (
    <div className="container py-4">
      <button className="btn btn-link p-0 mb-3" onClick={() => navigate(-1)}>← Back</button>
      <div className="row">
        <div className="col-md-5">
          {product.imageUrl
            ? <img src={product.imageUrl} className="img-fluid rounded" alt={product.name} />
            : <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                <span className="text-muted">No image</span>
              </div>
          }
        </div>
        <div className="col-md-7">
          <h3>{product.name}</h3>
          <span className="badge bg-secondary mb-2">{product.category}</span>
          <p className="text-muted">{product.description}</p>
          <h4 className="text-success">${product.price?.toFixed(2)}</h4>
          <p>Stock: <strong>{product.stock}</strong></p>
          <p>Rating: <strong>⭐ {avgRating}</strong> ({reviews.length} reviews)</p>
          {user?.role === 'CUSTOMER' && product.stock > 0 && (
            <button className="btn btn-primary" onClick={addToCart}>Add to Cart</button>
          )}
        </div>
      </div>

      <hr className="my-4" />
      <h5>Reviews</h5>

      {user?.role === 'CUSTOMER' && (
        <form onSubmit={submitReview} className="card p-3 mb-4">
          <h6>Write a review</h6>
          <div className="mb-2">
            <label className="form-label">Rating</label>
            <select className="form-select form-select-sm w-auto"
              value={review.rating} onChange={e => setReview({ ...review, rating: Number(e.target.value) })}>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ⭐</option>)}
            </select>
          </div>
          <div className="mb-2">
            <textarea className="form-control" rows={3} placeholder="Your comment..."
              value={review.comment} onChange={e => setReview({ ...review, comment: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-sm btn-primary">Submit</button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-muted">No reviews yet.</p>
      ) : (
        reviews.map(r => (
          <div key={r.id} className="card mb-2 p-3">
            <div className="d-flex justify-content-between">
              <strong>{r.userName}</strong>
              <span>{'⭐'.repeat(r.rating)}</span>
            </div>
            <p className="mb-0 mt-1 text-muted">{r.comment}</p>
          </div>
        ))
      )}
    </div>
  );
}