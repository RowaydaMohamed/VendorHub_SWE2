import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand fw-bold" to="/">VendorHub</Link>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navContent">
        <ul className="navbar-nav me-auto">
          <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
          {user?.role === 'CUSTOMER' && (
            <>
              <li className="nav-item"><Link className="nav-link" to="/favorites">Favorites</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/orders">My Orders</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/cart">Cart</Link></li>
            </>
          )}
          {user?.role === 'VENDOR' && (
            <>
              <li className="nav-item"><Link className="nav-link" to="/vendor/dashboard">Dashboard</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/vendor/products">My Products</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/vendor/add-product">Add Product</Link></li>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <>
              <li className="nav-item"><Link className="nav-link" to="/admin/dashboard">Dashboard</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/admin/users">Users</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/admin/products">Products</Link></li>
            </>
          )}
        </ul>
        <div className="d-flex align-items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <span className="text-light">Hi, {user.name}</span>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-light btn-sm" to="/login">Login</Link>
              <Link className="btn btn-primary btn-sm" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}