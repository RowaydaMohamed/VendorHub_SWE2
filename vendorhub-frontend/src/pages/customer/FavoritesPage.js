import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { favoritesAPI } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

export default function FavoritesPage() {
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    favoritesAPI.getFavorites()
      .then(res => setFavorites(res.data))
      .catch(() => toast.error('Failed to load favorites'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId, productName) => {
    try {
      await favoritesAPI.removeFavorite(productId);
      setFavorites(prev => prev.filter(f => f.productId !== productId));
      toast.info(`${productName} removed from favorites`);
    } catch { toast.error('Failed to remove'); }
  };

  const handleAddToCart = async (fav) => {
    try {
      await addToCart({
        id:           fav.productId,
        name:         fav.productName,
        imageUrl:     fav.productImageUrl,
        price:        parseFloat(fav.productPrice) || 0,
        vendorId:     null,
        vendorEmail:  null,
      }, 1);
      toast.success(`${fav.productName} added to cart!`);
    } catch { toast.error('Failed to add to cart'); }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"/>
      ))}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Heart size={24} className="text-red-500"/> My Favorites
        {favorites.length > 0 && (
          <span className="text-sm font-normal text-gray-400">({favorites.length} items)</span>
        )}
      </h1>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
          <Heart size={56} className="mx-auto mb-4 text-gray-200"/>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h2>
          <p className="text-gray-400 mb-6">Click the heart icon on any product to save it here.</p>
          <Link to="/shop"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map(fav => (
            <div key={fav.id}
              className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
              {/* Image */}
              <Link to={`/shop/product/${fav.productId}`} className="block">
                <div className="h-44 bg-gray-100 overflow-hidden">
                  {fav.productImageUrl
                    ? <img src={fav.productImageUrl} alt={fav.productName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                    : <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
                  }
                </div>
              </Link>

              {/* Info */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <Link to={`/shop/product/${fav.productId}`}>
                    <p className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-indigo-600">
                      {fav.productName}
                    </p>
                  </Link>
                  {fav.productPrice && (
                    <p className="text-indigo-700 font-bold text-sm mt-1">${fav.productPrice}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    Saved {fav.addedAt ? new Date(fav.addedAt).toLocaleDateString() : ''}
                  </p>
                </div>

                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleAddToCart(fav)}
                    className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1.5 rounded-lg transition">
                    <ShoppingCart size={13}/> Add to Cart
                  </button>
                  <button onClick={() => handleRemove(fav.productId, fav.productName)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={15}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}