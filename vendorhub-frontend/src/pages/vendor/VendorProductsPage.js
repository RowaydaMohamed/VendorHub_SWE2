import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Upload, X, Package, AlertTriangle } from 'lucide-react';
import { vendorProductAPI, productAPI } from '../../api/services';
import { toast } from 'react-toastify';

const APPROVAL_STYLE = {
  PENDING:  'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100  text-green-700',
  REJECTED: 'bg-red-100    text-red-700',
};

const EMPTY_FORM = {
  name: '', description: '', price: '', stockQuantity: '',
  brand: '', categoryId: '',
};

export default function VendorProductsPage() {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editProduct, setEditProduct] = useState(null); // null = create mode
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    Promise.all([vendorProductAPI.getMyProducts(), productAPI.getCategories()])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data); })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name:          product.name          || '',
      description:   product.description   || '',
      price:         product.price         || '',
      stockQuantity: product.stockQuantity || '',
      brand:         product.brand         || '',
      categoryId:    product.category?.id  || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price:         parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity),
        categoryId:    form.categoryId ? parseInt(form.categoryId) : null,
      };
      if (editProduct) {
        const res = await vendorProductAPI.updateProduct(editProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === editProduct.id ? res.data : p));
        toast.success('Product updated!');
      } else {
        const res = await vendorProductAPI.createProduct(payload);
        setProducts(prev => [res.data, ...prev]);
        toast.success('Product created! It will appear in the shop once approved by admin.');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}"?`)) return;
    try {
      await vendorProductAPI.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product removed');
    } catch { toast.error('Failed to remove product'); }
  };

  const handleImageUpload = async (productId, file) => {
    if (!file) return;
    setUploadingId(productId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await vendorProductAPI.uploadImage(productId, formData);
      // Refresh products to get new imageUrl
      const res = await vendorProductAPI.getMyProducts();
      setProducts(res.data);
      toast.success('Image uploaded!');
    } catch { toast.error('Failed to upload image'); }
    finally { setUploadingId(null); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl transition text-sm">
          <Plus size={18}/> Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
          <Package size={56} className="mx-auto mb-4 text-gray-200"/>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No products yet</h2>
          <p className="text-gray-400 mb-6">Add your first product and submit it for admin review.</p>
          <button onClick={openCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition">
            Add First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id}
              className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
              {/* Image */}
              <div className="relative h-40 bg-gray-100 group">
                {product.imageUrl
                  ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
                }
                {/* Upload overlay */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  {uploadingId === product.id
                    ? <span className="text-white text-xs">Uploading...</span>
                    : <><Upload size={20} className="text-white mr-1"/><span className="text-white text-xs font-medium">Change Image</span></>
                  }
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => handleImageUpload(product.id, e.target.files[0])}
                    disabled={uploadingId === product.id}/>
                </label>
                {/* Approval badge */}
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold ${APPROVAL_STYLE[product.approvalStatus]}`}>
                  {product.approvalStatus}
                </span>
                {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                  <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <AlertTriangle size={10}/> Low
                  </span>
                )}
                {product.stockQuantity === 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm line-clamp-1">{product.name}</p>
                  <p className="text-indigo-700 font-bold text-sm mt-0.5">${product.price}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Stock: {product.stockQuantity}</p>
                  {product.category && (
                    <p className="text-xs text-gray-400">{product.category.name}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1 border border-gray-200 hover:border-indigo-400 hover:text-indigo-600 text-gray-600 text-xs font-medium py-1.5 rounded-lg transition">
                    <Pencil size={13}/> Edit
                  </button>
                  <button onClick={() => handleDelete(product.id, product.name)}
                    className="flex items-center justify-center p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={15}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-gray-900 text-lg">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X size={22}/>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                  <input type="number" required min="0.01" step="0.01" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty *</label>
                  <input type="number" required min="0" value={form.stockQuantity}
                    onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input type="text" value={form.brand}
                  onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.categoryId}
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl text-sm transition">
                  {saving ? 'Saving...' : editProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}