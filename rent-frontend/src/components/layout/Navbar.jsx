import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, User, LogOut, Menu, X, Sofa, LayoutDashboard, Package, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { ROLES, getLandingRouteForRole } from '@/utils/constants';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, role, isAuthenticated, logout, permissions } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const { data: cart } = useCart();

  useEffect(() => {
    setCartCount(Array.isArray(cart) ? cart.length : 0);
  }, [cart]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();
      toast.success('Signed out');
      navigate('/');
    }
  };

  const navLinkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-100 text-brand-800' : 'text-brand-600 hover:bg-brand-50 hover:text-brand-800'}`;

  const emphasizedClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-brand-600 text-white' : 'bg-brand-600 text-white hover:bg-brand-700'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to={isAuthenticated ? getLandingRouteForRole(role) : '/'} className="flex items-center gap-2 text-brand-800">
          <Sofa className="h-6 w-6 text-brand-600" />
          <span className="font-display text-xl font-bold">Rent-A-Furniture</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 overflow-x-auto lg:flex lg:overflow-visible">
          <NavLink to="/" className={navLinkClass} end>Browse</NavLink>

          {isAuthenticated && permissions.canManageFurniture && (
            <NavLink to="/lender/listings" className={emphasizedClass}>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><Package className="h-4 w-4" /> My Listings</span>
            </NavLink>
          )}

          {isAuthenticated && role === ROLES.ADMIN && (
            <>
              <NavLink to="/admin/dashboard" className={emphasizedClass}>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><LayoutDashboard className="h-4 w-4" /> Dashboard</span>
              </NavLink>
              <NavLink to="/admin/categories" className={navLinkClass}>Categories</NavLink>
              <NavLink to="/admin/verify" className={navLinkClass}>Verify</NavLink>
              <NavLink to="/admin/orders" className={navLinkClass}>All Orders</NavLink>
            </>
          )}

          {isAuthenticated && (
            <>
              {permissions.canUseCart && (
                <>
                  <NavLink to="/cart" className={navLinkClass}>
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <ShoppingCart className="h-4 w-4" /> Cart
                      {cartCount > 0 && <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-xs text-white">{cartCount}</span>}
                    </span>
                  </NavLink>
                  <NavLink to="/orders" className={navLinkClass}>Orders</NavLink>
                </>
              )}
              <NavLink to="/profile" className={navLinkClass}>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><User className="h-4 w-4" /> Profile</span>
              </NavLink>
              <button onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 hover:text-brand-800 whitespace-nowrap">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <NavLink to="/login" className={navLinkClass}>Login</NavLink>
              <NavLink to="/register" className={emphasizedClass}>Register</NavLink>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button className="rounded-md p-2 text-brand-700 lg:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t border-brand-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/" className={navLinkClass} end onClick={() => setMobileOpen(false)}>Browse</NavLink>
            {isAuthenticated && permissions.canManageFurniture && (
              <NavLink to="/lender/listings" className={navLinkClass} onClick={() => setMobileOpen(false)}>My Listings</NavLink>
            )}
            {isAuthenticated && role === ROLES.ADMIN && (
              <>
                <NavLink to="/admin/dashboard" className={navLinkClass} onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
                <NavLink to="/admin/categories" className={navLinkClass} onClick={() => setMobileOpen(false)}>Categories</NavLink>
                <NavLink to="/admin/verify" className={navLinkClass} onClick={() => setMobileOpen(false)}>Verify</NavLink>
                <NavLink to="/admin/orders" className={navLinkClass} onClick={() => setMobileOpen(false)}>All Orders</NavLink>
              </>
            )}
            {isAuthenticated && (
              <>
                {permissions.canUseCart && (
                  <>
                    <NavLink to="/cart" className={navLinkClass} onClick={() => setMobileOpen(false)}>Cart ({cartCount})</NavLink>
                    <NavLink to="/orders" className={navLinkClass} onClick={() => setMobileOpen(false)}>Orders</NavLink>
                  </>
                )}
                <NavLink to="/profile" className={navLinkClass} onClick={() => setMobileOpen(false)}>Profile</NavLink>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="rounded-md px-3 py-2 text-left text-sm font-medium text-brand-600 hover:bg-brand-50">Logout</button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <NavLink to="/login" className={navLinkClass} onClick={() => setMobileOpen(false)}>Login</NavLink>
                <NavLink to="/register" className={navLinkClass} onClick={() => setMobileOpen(false)}>Register</NavLink>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
