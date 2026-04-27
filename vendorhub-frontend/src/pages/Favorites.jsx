import { useState, useEffect } from 'react';
import { productApi } from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
        const res = await productApi.get('/api/favorites');      setFavorites(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFavorites(); }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      <h4 className="mb-4">My Favorites</h4>
      {favorites.length === 0 ? (
        <p className="text-muted">No favorites yet.</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
          {favorites.map(p => (
            <div key={p.id} className="col">
              <ProductCard product={p} onFavoriteChange={fetchFavorites} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}