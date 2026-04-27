import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div className="container py-4">
      <h4 className="mb-4">Admin Dashboard</h4>
      <p className="text-muted">Welcome, {user?.name}</p>
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card text-center p-4 shadow-sm border-primary">
            <h5>Manage Users</h5>
            <p className="text-muted small">Approve vendors, toggle accounts</p>
            <Link to="/admin/users" className="btn btn-primary">Open</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center p-4 shadow-sm border-success">
            <h5>Manage Products</h5>
            <p className="text-muted small">Approve or reject vendor products</p>
            <Link to="/admin/products" className="btn btn-success">Open</Link>
          </div>
        </div>
      </div>
    </div>
  );
}