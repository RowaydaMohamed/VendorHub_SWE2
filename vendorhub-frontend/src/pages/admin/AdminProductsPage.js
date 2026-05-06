import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { adminProductAPI } from '../../api/services';
import { toast } from 'react-toastify';

const TABS = ['ALL','PENDING','APPROVED','REJECTED'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [tab,      setTab]      = useState('PENDING');
  const [page,     setPage]     = useState(0);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const SIZE = 15;

  const load = useCallback(() => {
    setLoading(true);
    adminProductAPI.getAllProducts({ status: tab === 'ALL' ? undefined : tab, page, size: SIZE })
      .then(res => {
        setProducts(res.data.content);
        setTotal(res.data.totalPages);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, [tab, page]);

  useEffect(() => { setPage(0); }, [tab]);
  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    try {
      await adminProductAPI.approveProduct(id);
      setProducts(prev => prev.map(p => p.id === id ? {...p, approvalStatus:'APPROVED'} : p));
      toast.success('Product approved — vendor notified');
    } catch { toast.error('Failed'); }
  };

  const handleReject = async (id) => {
    try {
      await adminProductAPI.rejectProduct(id);
      setProducts(prev => prev.map(p => p.id === id ? {...p, approvalStatus:'REJECTED'} : p));
      toast.success('Product rejected');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this product?')) return;
    try {
      await adminProductAPI.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product removed');
    } catch { toast.error('Failed'); }
  };

  const STATUS_COLOR = {
    PENDING:  'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Management</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              tab === t ? 'bg-white shadow text-indigo-700' : 'text-gray-600 hover:text-gray-900'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                {['Image','Product','Price','Stock','Status','Vendor','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover"/>
                      : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">N/A</div>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{p.description}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">${p.price}</td>
                  <td className="px-4 py-3">{p.stockQuantity}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[p.approvalStatus]}`}>
                      {p.approvalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.vendorEmail}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {p.approvalStatus !== 'APPROVED' && (
                        <button onClick={() => handleApprove(p.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs flex items-center gap-0.5">
                          <CheckCircle size={12}/> Approve
                        </button>
                      )}
                      {p.approvalStatus !== 'REJECTED' && (
                        <button onClick={() => handleReject(p.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center gap-0.5">
                          <XCircle size={12}/> Reject
                        </button>
                      )}
                      <button onClick={() => handleDelete(p.id)}
                        className="bg-gray-200 hover:bg-red-100 text-red-600 px-2 py-1 rounded text-xs flex items-center gap-0.5">
                        <Trash2 size={12}/> Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="text-center text-gray-400 py-8">No products in this category.</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {total > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}
            className="px-3 py-1 border rounded disabled:opacity-40 text-sm">← Prev</button>
          <span className="px-3 py-1 text-sm text-gray-600">Page {page+1} of {total}</span>
          <button onClick={() => setPage(p => Math.min(total-1,p+1))} disabled={page===total-1}
            className="px-3 py-1 border rounded disabled:opacity-40 text-sm">Next →</button>
        </div>
      )}
    </div>
  );
}