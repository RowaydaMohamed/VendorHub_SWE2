import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Ban, Trash2, Search } from 'lucide-react';
import { adminUserAPI } from '../../api/services';
import { toast } from 'react-toastify';

const STATUS_BADGE = {
  APPROVED:  'bg-green-100 text-green-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  REJECTED:  'bg-red-100 text-red-700',
  NOT_APPLICABLE: 'bg-gray-100 text-gray-500',
};

const ACCOUNT_BADGE = {
  ACTIVE:                      'bg-green-100 text-green-700',
  EMAIL_VERIFIED:              'bg-blue-100 text-blue-700',
  PENDING_EMAIL_VERIFICATION:  'bg-yellow-100 text-yellow-700',
  SUSPENDED:                   'bg-red-100 text-red-700',
};

export default function AdminVendorsPage() {
  const [vendors, setVendors]     = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    adminUserAPI.getAllVendors()
      .then(res => { setVendors(res.data); setFiltered(res.data); })
      .catch(() => toast.error('Failed to load vendors'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(vendors.filter(v =>
      v.email.toLowerCase().includes(q) ||
      v.firstName.toLowerCase().includes(q) ||
      (v.businessName || '').toLowerCase().includes(q)
    ));
  }, [search, vendors]);

  const update = (id, patch) =>
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v));

  const handleApprove = async (id) => {
    try {
      await adminUserAPI.approveVendor(id);
      update(id, { approvalStatus: 'APPROVED', status: 'ACTIVE' });
      toast.success('Vendor approved');
    } catch { toast.error('Failed'); }
  };

  const handleReject = async (id) => {
    try {
      await adminUserAPI.rejectVendor(id);
      update(id, { approvalStatus: 'REJECTED' });
      toast.success('Vendor rejected');
    } catch { toast.error('Failed'); }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Suspend this vendor?')) return;
    try {
      await adminUserAPI.suspendUser(id);
      update(id, { status: 'SUSPENDED' });
      toast.success('Vendor suspended');
    } catch { toast.error('Failed'); }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Permanently remove this vendor?')) return;
    try {
      await adminUserAPI.removeUser(id);
      setVendors(prev => prev.filter(v => v.id !== id));
      toast.success('Vendor removed');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vendors..." className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['Vendor','Business','Email','Account','Approval','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(v => (
              <tr key={v.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{v.firstName} {v.lastName}</td>
                <td className="px-4 py-3 text-gray-600">{v.businessName || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{v.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACCOUNT_BADGE[v.status]}`}>
                    {v.status?.replace(/_/g,' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[v.approvalStatus]}`}>
                    {v.approvalStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 flex-wrap">
                    {v.approvalStatus === 'PENDING' && (
                      <>
                        <button onClick={() => handleApprove(v.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs flex items-center gap-0.5">
                          <CheckCircle size={12}/> Approve
                        </button>
                        <button onClick={() => handleReject(v.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center gap-0.5">
                          <XCircle size={12}/> Reject
                        </button>
                      </>
                    )}
                    {v.status !== 'SUSPENDED' && v.approvalStatus === 'APPROVED' && (
                      <button onClick={() => handleSuspend(v.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs flex items-center gap-0.5">
                        <Ban size={12}/> Suspend
                      </button>
                    )}
                    <button onClick={() => handleRemove(v.id)}
                      className="bg-gray-200 hover:bg-red-100 text-red-600 px-2 py-1 rounded text-xs flex items-center gap-0.5">
                      <Trash2 size={12}/> Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">No vendors found.</p>
        )}
      </div>
    </div>
  );
}