import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Heart, ShoppingCart, Star } from 'lucide-react';
import { productAPI, favoritesAPI, cartAPI } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

export default function ShopPage() {
  const { addToCart } = useCart();

  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [favorites,   setFavorites]   = useState(new Set());
  const [loading,     setLoading]     = useState(true);

  // Filters
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryId,  setCategoryId]  = useState('');
  const [sort,        setSort]        = useState('newest');
  const [minPrice,    setMinPrice]    = useState('');
  const [maxPrice,    setMaxPrice]    = useState('');
  const [page,        setPage]        = useState(0);
  const [totalPages,  setTotalPages]  = useState(0);

  const SIZE = 12;

  // Load categories and favorites once
  useEffect(() => {
    productAPI.getCategories().then(r => setCategories(r.data)).catch(() => {});
    favoritesAPI.getFavorites().then(r => {
      setFavorites(new Set(r.data.map(f => f.productId)));
    }).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    let req;
    if (search) {
      req = productAPI.searchProducts({ q: search, page, size: SIZE });
    } else if (minPrice && maxPrice) {
      req = productAPI.getByPriceRange({ min: minPrice, max: maxPrice, page, size: SIZE });
    } else if (categoryId) {
      req = productAPI.getByCategory(categoryId, { page, size: SIZE });
    } else {
      req = productAPI.getProducts({ page, size: SIZE, sort });
    }
    req.then(r => {
      setProducts(r.data.content);
      setTotalPages(r.data.totalPages);
    }).catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, [search, categoryId, sort, minPrice, maxPrice, page]);

  useEffect(() => { setPage(0); }, [search, categoryId, sort, minPrice, maxPrice]);
  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    try {
      await addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } catch { toast.error('Failed to add to cart'); }
  };

  const handleToggleFavorite = async (e, product) => {
    e.preventDefault();
    try {
      if (favorites.has(product.id)) {
        await favoritesAPI.removeFavorite(product.id);
        setFavorites(prev => { const s = new Set(prev); s.delete(product.id); return s; });
      } else {
        await favoritesAPI.addFavorite({
          productId: product.id,
          productName: product.name,
          productImageUrl: product.imageUrl,
          productPrice: String(product.price),
        });
        setFavorites(prev => new Set(prev).add(product.id));
      }
    } catch { toast.error('Failed to update favorites'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Shop</h1>
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Search
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }}
              className="text-sm text-gray-500 hover:text-gray-800 px-2">Clear</button>
          )}
        </form>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border shadow-sm p-4 space-y-5 sticky top-4">
            <div>
              <p className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-1">
                <SlidersHorizontal size={14}/> Sort By
              </p>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            <div>
              <p className="font-semibold text-gray-700 text-sm mb-2">Category</p>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="font-semibold text-gray-700 text-sm mb-2">Price Range</p>
              <div className="flex gap-2 items-center">
                <input type="number" placeholder="Min" value={minPrice}
                  onChange={e => setMinPrice(e.target.value)} min="0"
                  className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                <span className="text-gray-400 text-xs">–</span>
                <input type="number" placeholder="Max" value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)} min="0"
                  className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              {(minPrice || maxPrice) && (
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                  className="mt-1 text-xs text-indigo-600 hover:underline">Clear price filter</button>
              )}
            </div>

            <button onClick={() => { setSearch(''); setSearchInput(''); setCategoryId(''); setSort('newest'); setMinPrice(''); setMaxPrice(''); }}
              className="w-full text-sm text-gray-500 hover:text-red-600 border rounded-lg py-1.5 transition">
              Reset All Filters
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border animate-pulse h-64"/>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Search size={48} className="mx-auto mb-3 opacity-30"/>
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{products.length} products shown</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => (
                  <Link key={product.id} to={`/shop/product/${product.id}`}
                    className="group bg-white rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">

                    {/* Image */}
                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
                      )}
                      {/* Favorite button */}
                      <button
                        onClick={e => handleToggleFavorite(e, product)}
                        className={`absolute top-2 right-2 p-1.5 rounded-full shadow transition ${
                          favorites.has(product.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-400 hover:text-red-500'
                        }`}>
                        <Heart size={14} fill={favorites.has(product.id) ? 'currentColor' : 'none'}/>
                      </button>
                      {product.stockQuantity === 0 && (
                        <span className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">{product.name}</p>
                        {product.category && (
                          <p className="text-xs text-indigo-600 mt-0.5">{product.category.name}</p>
                        )}
                        {product.averageRating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={12} className="text-amber-400 fill-amber-400"/>
                            <span className="text-xs text-gray-500">{product.averageRating?.toFixed(1)}</span>
                            <span className="text-xs text-gray-400">({product.totalReviews})</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-gray-900">${product.price}</span>
                        <button
                          onClick={e => handleAddToCart(e, product)}
                          disabled={product.stockQuantity === 0}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white p-1.5 rounded-lg transition">
                          <ShoppingCart size={15}/>
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i)}
                      className={`px-3 py-2 border rounded-lg text-sm transition ${
                        page === i ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'
                      }`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                    className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}