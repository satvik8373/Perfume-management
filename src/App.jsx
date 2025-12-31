import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import { ProductProvider } from './context/ProductContext';
import { WishlistProvider } from './context/WishlistContext';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import BuyerPanel from './pages/BuyerPanel';
import AnimationDemo from './pages/AnimationDemo';
import AuthPage from './pages/AuthPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <ProductProvider>
            <CartProvider>
              <WishlistProvider>
                <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListingPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<BuyerPanel />} />
                <Route path="/demo" element={<AnimationDemo />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </WishlistProvider>
            </CartProvider>
          </ProductProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
