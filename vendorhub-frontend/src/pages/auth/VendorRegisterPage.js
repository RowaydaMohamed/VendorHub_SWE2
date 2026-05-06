import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/services';
import { toast } from 'react-toastify';

export default function VendorRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', password:'', phone:'',
    businessName:'', businessDescription:'', businessAddress:'',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.registerVendor(form);
      toast.success('Vendor registration submitted! Verify your email, then await admin approval.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data?.fieldErrors) {
        Object.values(data.fieldErrors).forEach((msg) => toast.error(msg));
      } else {
        toast.error(data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Become a Vendor</h1>
        <p className="text-gray-500 text-sm mb-6">
          Register your business on VendorHub. After email verification, an admin will review your application.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[['firstName','First Name'],['lastName','Last Name']].map(([name,label]) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type="text" name={name} required value={form[name]} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
            ))}
          </div>

          {[['email','Email','email'],['phone','Phone','tel'],['password','Password (min 8 chars)','password']].map(([name,label,type]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} name={name} required value={form[name]} onChange={handleChange}
                minLength={name==='password' ? 8 : undefined}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
          ))}

          <hr className="my-2"/>
          <p className="text-sm font-semibold text-gray-700">Business Information</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input type="text" name="businessName" required value={form.businessName} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
            <textarea name="businessDescription" rows={3} value={form.businessDescription} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
            <input type="text" name="businessAddress" value={form.businessAddress} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-lg transition text-sm">
            {loading ? 'Submitting...' : 'Submit Vendor Application'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}