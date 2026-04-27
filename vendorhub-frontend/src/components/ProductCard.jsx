import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productApi } from '../api/axios';

export default function ProductCard({ product, onFavoriteChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.productId === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
  };

  const toggleFavorite = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await productApi.post(`/api/favorites/${product.id}`);
      if (onFavoriteChange) onFavoriteChange();
    } catch {
      try {
        await productApi.delete(`/api/favorites/${product.id}`);
        if (onFavoriteChange) onFavoriteChange();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="card h-100 shadow-sm">
      {product.imageUrl && (
        <img src={product.imageUrl} className="card-img-top" alt={product.name}
          style={{ height: '200px', objectFit: 'cover' }} />
      )}
      <div className="card-body d-flex flex-column">
        <h6 className="card-title">{product.name}</h6>
        <p className="text-muted small mb-1">{product.category}</p>
        <p className="card-text small flex-grow-1">{product.description?.slice(0, 80)}...</p>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <span className="fw-bold text-success">${product.price?.toFixed(2)}</span>
          <span className="badge bg-secondary">Stock: {product.stock}</span>
        </div>
        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-primary btn-sm flex-grow-1"
            onClick={() => navigate(`/product/${product.id}`)}>View</button>
          {user?.role === 'CUSTOMER' && (
            <>
              <button className="btn btn-success btn-sm" onClick={addToCart}>Add to Cart</button>
              <button className="btn btn-outline-danger btn-sm" onClick={toggleFavorite}>♥</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}