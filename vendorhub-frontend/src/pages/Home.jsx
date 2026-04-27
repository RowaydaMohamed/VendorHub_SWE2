import { useState, useEffect } from 'react';
import { productApi } from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let res;
      if (search) res = await productApi.get(`/api/products/search?keyword=${search}`);
      else if (category) res = await productApi.get(`/api/products/category?category=${category}`);
      else res = await productApi.get('/api/products/approved');
      setProducts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <input className="form-control" placeholder="Search products..."
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchProducts()} />
            <button className="btn btn-primary" onClick={fetchProducts}>Search</button>
          </div>
        </div>
        <div className="col-md-4">
          <select className="form-select" value={category}
            onChange={e => { setCategory(e.target.value); setTimeout(fetchProducts, 100); }}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : products.length === 0 ? (
        <div className="text-center py-5 text-muted">No products found</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
          {products.map(p => (
            <div key={p.id} className="col">
              <ProductCard product={p} onFavoriteChange={fetchProducts} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}