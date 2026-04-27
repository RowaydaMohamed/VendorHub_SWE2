import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function VendorDashboard() {
  const { user } = useAuth();

  if (!user?.approved) return (
    <div className="container py-5 text-center">
      <div className="alert alert-warning">
        <h5>Awaiting Admin Approval</h5>
        <p>Your vendor account is pending approval. You'll be able to manage products once approved.</p>
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <h4 className="mb-4">Vendor Dashboard</h4>
      <p className="text-muted">Welcome, {user.name}!</p>
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card text-center p-4 shadow-sm">
            <h5>My Products</h5>
            <p className="text-muted">View and manage your products</p>
            <Link to="/vendor/products" className="btn btn-primary">Go</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center p-4 shadow-sm">
            <h5>Add Product</h5>
            <p className="text-muted">List a new product for sale</p>
            <Link to="/vendor/add-product" className="btn btn-success">Add</Link>
          </div>
        </div>
      </div>
    </div>
  );
}