import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings, currencies } from '../context/SettingsContext';
import { useProducts } from '../context/ProductContext';
import Layout from '../components/Layout';
import Card from '../components/Card';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useSettings();
  const { seedProducts, seeding, products } = useProducts();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSeedProducts = async () => {
    setSeedSuccess(false);
    await seedProducts();
    setSeedSuccess(true);
    setTimeout(() => setSeedSuccess(false), 3000);
  };

  return (
    <Layout>
      <div className="py-8 lg:py-12 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Settings</h1>
          <p className="text-gray-600 text-sm">Manage your preferences</p>
        </div>

        {/* Account Section */}
        <Card className="p-4 lg:p-5 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500 text-lg">person</span>
            Account
          </h2>
          
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                    {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{user.displayName || 'User'}</p>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              Sign In
            </button>
          )}
        </Card>

        {/* Preferences - Currency Dropdown */}
        <Card className="p-4 lg:p-5 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500 text-lg">tune</span>
            Preferences
          </h2>
          
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all cursor-pointer"
            >
              {Object.entries(currencies).map(([code, config]) => (
                <option key={code} value={code}>
                  {config.symbol} {code}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Database - Admin Section */}
        <Card className="p-4 lg:p-5 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500 text-lg">database</span>
            Database
          </h2>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">{products.length} products loaded</span>
            <button
              onClick={handleSeedProducts}
              disabled={seeding}
              className="flex items-center gap-1 rounded-lg h-9 px-3 bg-purple-100 hover:bg-purple-200 disabled:bg-purple-50 text-purple-600 text-sm font-medium transition-colors"
            >
              {seeding ? (
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-sm">cloud_upload</span>
              )}
              {seeding ? 'Seeding...' : 'Seed Products'}
            </button>
          </div>
          
          {seedSuccess && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              Products seeded successfully!
            </p>
          )}
        </Card>

        {/* App Info */}
        <Card className="p-4 lg:p-5">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Mavrix Perfume v1.0.0</span>
            <span>© 2024</span>
          </div>
        </Card>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-xs p-5 text-center">
              <span className="material-symbols-outlined text-4xl text-orange-500 mb-3">logout</span>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Sign Out?</h3>
              <p className="text-gray-600 text-sm mb-4">Are you sure you want to sign out?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-lg h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-lg h-10 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
