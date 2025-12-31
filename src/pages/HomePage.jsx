import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings, currencies } from '../context/SettingsContext';
import heroImg1 from '../assets/img/1629.jpg';
import heroImg2 from '../assets/img/2052.jpg';

function HomePage() {
  const [showNav, setShowNav] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useSettings();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const slides = [heroImg1, heroImg2];

  useEffect(() => {
    const handleScroll = () => {
      setShowNav(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

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

  const handleLogout = async () => {
    await logout();
    setShowMobileMenu(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/products', label: 'Shop', icon: 'storefront' },
    { path: '/cart', label: 'Cart', icon: 'shopping_cart', badge: cartItemCount },
    { path: '/orders', label: 'Orders', icon: 'package_2' },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Desktop Navigation */}
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 hidden md:block ${showNav ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
        <div className="backdrop-blur-xl bg-black/70 rounded-full shadow-2xl border border-white/10 px-8 py-3">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 pr-6 border-r border-white/20">
              <span className="font-display text-xl font-black bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                MAVRIX
              </span>
            </Link>
            <div className="flex items-center gap-6">
              {navLinks.map(link => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`text-sm font-medium transition-colors relative ${
                    link.path === '/' ? 'text-amber-400' : 'text-white/80 hover:text-amber-400'
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
                </Link>
              ))}
              {user ? (
                <Link to="/orders" className="text-white/80 hover:text-amber-400">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border-2 border-white/30" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
              ) : (
                <Link to="/auth" className="text-white/80 hover:text-amber-400">
                  <span className="material-symbols-outlined text-xl">account_circle</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-300 ${showNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="backdrop-blur-xl bg-black/80 px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => setShowMobileMenu(true)} className="text-white p-1">
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <span className="font-display text-lg font-black bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              MAVRIX
            </span>
            <Link to="/cart" className="relative text-white p-1">
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
        className={`fixed inset-0 bg-black/60 z-[60] md:hidden transition-opacity duration-300 ${showMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowMobileMenu(false)}
      />

      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-[280px] max-w-[85vw] bg-black z-[70] md:hidden transform transition-transform duration-300 ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <span className="font-display text-lg font-black bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              MAVRIX
            </span>
            <button onClick={() => setShowMobileMenu(false)} className="text-white/70 p-1">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {user && (
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                    {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{user.displayName || 'User'}</p>
                  <p className="text-xs text-white/50 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-3">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    link.path === '/' ? 'bg-amber-500/20 text-amber-400' : 'text-white/70 hover:bg-white/5 hover:text-white'
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
              <Link
                to="/settings"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">settings</span>
                <span className="font-medium">Settings</span>
              </Link>
            </div>

            <div className="mt-6 px-4">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2 px-3">Currency</p>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-sm text-white bg-white/10 border border-white/10 rounded-xl px-4 py-3"
              >
                {Object.entries(currencies).map(([code, config]) => (
                  <option key={code} value={code} className="bg-black">{config.symbol} {code}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 border-t border-white/10">
            {user ? (
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full h-12 bg-red-500/20 text-red-400 font-medium rounded-xl"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Sign Out
              </button>
            ) : (
              <Link 
                to="/auth"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center justify-center gap-2 w-full h-12 bg-orange-500 text-white font-medium rounded-xl"
              >
                <span className="material-symbols-outlined text-lg">login</span>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Hero Slider - Full Screen */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide}
              alt={`Mavrix Perfume ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          </div>
        ))}

        {/* Content Overlay */}
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center px-6 text-center">
          
         
          <Link to="/products" className="mt-6">
            <button className="px-6 py-2.5 bg-white/90 text-black text-sm font-medium rounded-full hover:bg-amber-400 transition-colors backdrop-blur-sm">
              Shop Now
            </button>
          </Link>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 right-8 hidden sm:flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest rotate-90 origin-center translate-y-6 text-white/70 animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">SCROLL</span>
          <div className="w-px h-12 mt-8 bg-gradient-to-b from-white/80 via-amber-400/60 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse" />
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          
          {/* Featured Collection */}
          <section className="mb-16 sm:mb-20">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center mb-8">Featured Collection</h2>
            <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
              {[
                { name: 'Noir Fusion', notes: 'Oud & Amber', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400' },
                { name: 'Cybernetic Bloom', notes: 'Jasmine & Tech', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400' },
                { name: 'Data Driven Dew', notes: 'Citrus & Fresh', img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400' },
                { name: 'Quantum Essence', notes: 'Spiced Woods', img: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400' }
              ].map((product, idx) => (
                <div key={idx} className="min-w-[220px] sm:min-w-[260px] flex-1 rounded-2xl bg-gray-50 overflow-hidden snap-start hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] bg-cover bg-center" style={{ backgroundImage: `url(${product.img})` }} />
                  <div className="p-4">
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.notes}</p>
                    <Link to="/products">
                      <button className="mt-3 w-full py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
                        Discover
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Categories */}
          <section className="mb-16 sm:mb-20">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center mb-8">Explore by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Floral', img: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400' },
                { name: 'Oud', img: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=400' },
                { name: 'Citrus', img: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400' },
                { name: 'Unisex', img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=400' }
              ].map((category, idx) => (
                <Link key={idx} to="/products">
                  <div className="relative aspect-square rounded-2xl overflow-hidden group">
                    <img src={category.img} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <p className="absolute bottom-4 left-4 text-white font-semibold text-lg">{category.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* AI Section */}
          <section className="mb-16 sm:mb-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Personal AI Sommelier</h3>
                <p className="mt-4 text-gray-600">Our AI analyzes thousands of scent profiles to curate a fragrance that is exclusively yours.</p>
                <button className="mt-6 px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors">
                  Find Your Scent
                </button>
              </div>
              <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400" alt="AI" className="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-full" />
            </div>
          </section>

          {/* Newsletter */}
          <section className="p-8 sm:p-10 rounded-3xl bg-black text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h4 className="text-xl sm:text-2xl font-bold">Join The Elite</h4>
                <p className="text-white/60 mt-1">Unlock exclusive scents and early access.</p>
              </div>
              <form className="flex flex-col sm:flex-row w-full max-w-md gap-3">
                <input className="flex-grow h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40" placeholder="Enter your email" type="email" />
                <button className="h-12 px-6 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-xl transition-colors" type="submit">Sign Up</button>
              </form>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Mavrix Perfume</h3>
                <p className="text-sm text-gray-500 mt-2">The future of fragrance.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Links</h4>
                <ul className="mt-4 space-y-2 text-sm text-gray-500">
                  <li><Link className="hover:text-gray-900" to="/">About Us</Link></li>
                  <li><Link className="hover:text-gray-900" to="/products">Collections</Link></li>
                  <li><a className="hover:text-gray-900" href="#">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Legal</h4>
                <ul className="mt-4 space-y-2 text-sm text-gray-500">
                  <li><a className="hover:text-gray-900" href="#">Privacy Policy</a></li>
                  <li><a className="hover:text-gray-900" href="#">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
              <p>© 2024 Mavrix Perfume. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default HomePage;
