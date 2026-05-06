import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ArrowLeft, Package } from 'lucide-react';
import { productAPI, favoritesAPI } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

export default function ProductDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { addToCart } = useCart();

  const [product,    setProduct]    = useState(null);
  const [reviews,    setReviews]    = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity,   setQuantity]   = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [addingCart, setAddingCart] = useState(false);

  // Review form
  const [reviewForm,     setReviewForm]     = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    Promise.all([
      productAPI.getProduct(id),
      productAPI.getReviews(id),
      favoritesAPI.getFavorites(),
    ]).then(([p, r, f]) => {
      setProduct(p.data);
      setReviews(r.data);
      setIsFavorite(f.data.some(fav => fav.productId === Number(id)));
    }).catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingCart(true);
    try {
      await addToCart(product, quantity);
      toast.success(`${product.name} added to cart!`);
    } catch { toast.error('Failed to add to cart'); }
    finally { setAddingCart(false); }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoritesAPI.removeFavorite(product.id);
        setIsFavorite(false);
        toast.info('Removed from favorites');
      } else {
        await favoritesAPI.addFavorite({
          productId: product.id,
          productName: product.name,
          productImageUrl: product.imageUrl,
          productPrice: String(product.price),
        });
        setIsFavorite(true);
        toast.success('Added to favorites!');
      }
    } catch { toast.error('Failed to update favorites'); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await productAPI.addReview(id, reviewForm);
      setReviews(prev => [res.data, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!');
      // Refresh product to get updated rating
      const p = await productAPI.getProduct(id);
      setProduct(p.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-32 mb-6"/>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-96 bg-gray-200 rounded-2xl"/>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"/>
          <div className="h-6 bg-gray-200 rounded w-1/4"/>
          <div className="h-24 bg-gray-200 rounded"/>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-center text-gray-500">
      Product not found.
      <button onClick={() => navigate('/shop')} className="mt-4 block mx-auto text-indigo-600 hover:underline">
        Back to Shop
      </button>
    </div>
  );

  const inStock = product.stockQuantity > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back */}
      <button onClick={() => navigate('/shop')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft size={16}/> Back to Shop
      </button>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl border shadow-sm p-6">
        {/* Image */}
        <div className="rounded-xl overflow-hidden bg-gray-100 h-80 flex items-center justify-center">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"/>
            : <Package size={64} className="text-gray-300"/>
          }
        </div>

        {/* Details */}
        <div className="flex flex-col justify-between">
          <div>
            {product.category && (
              <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{product.name}</h1>

            {/* Rating */}
            {product.totalReviews > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16}
                      className={s <= Math.round(product.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}/>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.averageRating?.toFixed(1)} ({product.totalReviews} reviews)
                </span>
              </div>
            )}

            <p className="text-3xl font-bold text-indigo-700 mt-4">${product.price}</p>

            {product.brand && (
              <p className="text-sm text-gray-500 mt-1">Brand: <span className="font-medium text-gray-700">{product.brand}</span></p>
            )}

              <p className={`text-sm font-medium mt-2 ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                {inStock ? '✓ In Stock' : '✗ Out of Stock'}
              </p>

            {product.description && (
              <p className="text-gray-600 text-sm mt-4 leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            {/* Quantity */}
            {inStock && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold">−</button>
                  <span className="px-4 py-1.5 text-sm font-semibold border-x">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold">+</button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={!inStock || addingCart}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                <ShoppingCart size={18}/>
                {addingCart ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button onClick={handleToggleFavorite}
                className={`p-2.5 rounded-xl border-2 transition ${
                  isFavorite ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'
                }`}>
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Submit Review */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Write a Review</h2>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                    <Star size={24}
                      className={s <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}/>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <textarea rows={4} value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Share your experience..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <button type="submit" disabled={submittingReview}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 rounded-lg text-sm transition">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2 space-y-3">
          <h2 className="font-bold text-gray-900">
            Customer Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border p-8 text-center text-gray-400">
              <Star size={32} className="mx-auto mb-2 opacity-30"/>
              <p>No reviews yet. Be the first!</p>
            </div>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="bg-white rounded-xl border shadow-sm p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                      {r.customerName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="font-medium text-sm text-gray-800">{r.customerName}</span>
                  </div>
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={13}
                        className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}/>
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
                <p className="text-xs text-gray-400 mt-2">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}