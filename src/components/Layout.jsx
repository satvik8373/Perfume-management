import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings, currencies } from '../context/SettingsContext';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const [showNav, setShowNav] = useState(!isHomePage);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  
  const { user, isAdmin, logout } = useAuth();
  const { cartItems } = useCart();
  const { currency, setCurrency } = useSettings();
  
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);
  
  useEffect(() => {
    if (isHomePage) {
      const handleScroll = () => {
        setShowNav(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setShowNav(true);
    }
  }, [isHomePage]);

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
    setShowMobileMenu(false);
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/products', label: 'Shop', icon: 'storefront' },
    { path: '/cart', label: 'Cart', icon: 'shopping_cart', badge: cartItemCount },
    { path: '/orders', label: 'Orders', icon: 'package_2' },
  ];
  
  return (
    <div className="relative min-h-screen w-full bg-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,146,60,0.1),rgba(255,255,255,0))]"></div>
      </div>

      {/* Desktop Navigation */}
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 nav-transition hidden md:block ${showNav ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
        <div className="backdrop-blur-2xl bg-gradient-to-r from-purple-900/95 via-indigo-900/95 to-purple-900/95 rounded-full shadow-2xl border border-purple-700/50 px-6 lg:px-10 py-3 lg:py-4">
          <div className="flex items-center gap-6 lg:gap-10">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 pr-4 lg:pr-6 border-r border-purple-400/30">
              <span className="font-display text-lg lg:text-xl font-black bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                MAVRIX
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-4 lg:gap-8">
              {navLinks.map(link => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`font-body text-xs lg:text-sm font-medium link-transition relative group ${
                    location.pathname === link.path ? 'text-amber-300' : 'text-purple-100 hover:text-amber-300'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {link.label}
                    {link.badge > 0 && (
                      <span className="flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold bg-orange-500 text-white rounded-full px-1">
                        {link.badge}
                      </span>
                    )}
                  </span>
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-amber-400 underline-transition ${
                    location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
              ))}

              {/* Profile Icon with Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center text-purple-100 hover:text-amber-300 link-transition"
                >
                  {user ? (
                    user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border-2 border-purple-400/50" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold border-2 border-purple-400/50">
                        {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                      </div>
                    )
                  ) : (
                    <span className="material-symbols-outlined text-xl">account_circle</span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    {user ? (
                      <>
                        <div className="p-3 bg-gray-50 border-b border-gray-100">
                          <p className="font-medium text-gray-900 text-sm truncate">{user.displayName || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        
                        <div className="p-3 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Currency</span>
                            <select
                              value={currency}
                              onChange={(e) => setCurrency(e.target.value)}
                              className="text-xs font-medium text-gray-900 bg-gray-100 border-0 rounded px-2 py-1 focus:ring-1 focus:ring-orange-500"
                            >
                              {Object.entries(currencies).map(([code, config]) => (
                                <option key={code} value={code}>{config.symbol} {code}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="py-1">
                          {isAdmin && (
                            <Link 
                              to="/admin" 
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                              Admin Dashboard
                            </Link>
                          )}
                          <Link 
                            to="/orders" 
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">package_2</span>
                            My Orders
                          </Link>
                          <Link 
                            to="/settings" 
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">settings</span>
                            Settings
                          </Link>
                        </div>

                        <div className="border-t border-gray-100">
                          <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Currency</span>
                            <select
                              value={currency}
                              onChange={(e) => setCurrency(e.target.value)}
                              className="text-xs font-medium text-gray-900 bg-gray-100 border-0 rounded px-2 py-1 focus:ring-1 focus:ring-orange-500"
                            >
                              {Object.entries(currencies).map(([code, config]) => (
                                <option key={code} value={code}>{config.symbol} {code}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="p-3">
                          <Link 
                            to="/auth" 
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center justify-center gap-2 w-full h-9 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">login</span>
                            Sign In
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 md:hidden nav-transition ${showNav || !isHomePage ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="backdrop-blur-2xl bg-gradient-to-r from-purple-900/95 via-indigo-900/95 to-purple-900/95 shadow-lg px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Menu Button */}
            <button 
              onClick={() => setShowMobileMenu(true)}
              className="text-purple-100 hover:text-amber-300 p-1"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="font-display text-lg font-black bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                MAVRIX
              </span>
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative text-purple-100 hover:text-amber-300 p-1">
              <span className="material-symbols-outlined text-xl">shopping_cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] text-[9px] font-bold bg-orange-500 text-white rounded-full px-1">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity duration-300 ${
          showMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setShowMobileMenu(false)}
      />

      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-[280px] max-w-[85vw] bg-gradient-to-b from-purple-900 via-indigo-900 to-purple-950 z-[70] md:hidden transform transition-transform duration-300 ease-out ${
        showMobileMenu ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-700/50">
            <span className="font-display text-lg font-black bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              MAVRIX
            </span>
            <button 
              onClick={() => setShowMobileMenu(false)}
              className="text-purple-200 hover:text-amber-300 p-1"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-purple-700/50">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full border-2 border-purple-400/50" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold border-2 border-purple-400/50">
                    {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{user.displayName || 'User'}</p>
                  <p className="text-xs text-purple-300 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-3">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    location.pathname === link.path 
                      ? 'bg-amber-500/20 text-amber-300' 
                      : 'text-purple-100 hover:bg-purple-800/50 hover:text-amber-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                  {link.badge > 0 && (
                    <span className="ml-auto flex items-center justify-center min-w-[20px] h-[20px] text-[10px] font-bold bg-orange-500 text-white rounded-full px-1">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}

              {/* Admin Link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    location.pathname === '/admin' 
                      ? 'bg-amber-500/20 text-amber-300' 
                      : 'text-purple-100 hover:bg-purple-800/50 hover:text-amber-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                  <span className="font-medium">Admin Dashboard</span>
                </Link>
              )}

              {/* Settings Link */}
              <Link
                to="/settings"
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === '/settings' 
                    ? 'bg-amber-500/20 text-amber-300' 
                    : 'text-purple-100 hover:bg-purple-800/50 hover:text-amber-300'
                }`}
              >
                <span className="material-symbols-outlined text-xl">settings</span>
                <span className="font-medium">Settings</span>
              </Link>
            </div>

            {/* Currency Selector */}
            <div className="mt-6 px-4">
              <p className="text-xs text-purple-400 uppercase tracking-wider mb-2 px-3">Currency</p>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-sm font-medium text-white bg-purple-800/50 border border-purple-600/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              >
                {Object.entries(currencies).map(([code, config]) => (
                  <option key={code} value={code} className="bg-purple-900">{config.symbol} {code} - {config.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-purple-700/50">
            {user ? (
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full h-12 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Sign Out
              </button>
            ) : (
              <Link 
                to="/auth"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center justify-center gap-2 w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-lg">login</span>
                Sign In / Sign Up
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 pt-16 md:pt-24 min-h-screen">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <style>{`
        .nav-transition {
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .link-transition {
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .underline-transition {
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
