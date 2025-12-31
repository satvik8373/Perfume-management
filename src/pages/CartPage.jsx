import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import Layout from '../components/Layout';
import Card from '../components/Card';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotals, loading } = useCart();
  const { formatPrice, getExchangeRate } = useSettings();

  const { subtotal, shipping, tax, total, itemCount } = getCartTotals('USD', getExchangeRate());

  if (loading) {
    return (
      <Layout>
        <div className="py-16 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-orange-500 animate-spin">progress_activity</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 lg:py-12">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Your Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        {cartItems.length === 0 ? (
          <Card className="p-8 lg:p-12 text-center">
            <div className="flex flex-col items-center gap-4 lg:gap-6">
              <div className="size-16 lg:size-20 text-gray-400">
                <span className="material-symbols-outlined text-6xl lg:text-8xl">shopping_cart</span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Your cart is empty</h2>
              <p className="text-gray-600 mb-4 lg:mb-6">Discover our amazing collection of premium fragrances</p>
              <Link to="/products">
                <button className="flex items-center justify-center rounded-xl h-12 lg:h-14 px-6 lg:px-8 bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                  Start Shopping
                </button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="flex-grow lg:w-2/3">
              <Card className="overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                    Items in your cart ({itemCount})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <div key={item.id} className="p-4 lg:p-6 flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <img className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl object-cover" src={item.img} alt={item.name} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="text-base lg:text-lg font-bold text-gray-900 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.size || '100ml'}</p>
                        <p className="text-lg font-bold text-orange-500">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 lg:gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="w-8 text-center text-gray-900 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                      <div className="text-right min-w-[80px] hidden sm:block">
                        <p className="text-lg font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="flex-shrink-0 lg:w-1/3">
              <div className="lg:sticky lg:top-32">
                <Card className="p-4 lg:p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({itemCount} items)</span>
                      <span className="text-gray-900 font-medium">{formatPrice(subtotal / getExchangeRate())}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-gray-900 font-medium">
                        {shipping === 0 ? 'Free' : formatPrice(shipping / getExchangeRate())}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (8%)</span>
                      <span className="text-gray-900 font-medium">{formatPrice(tax / getExchangeRate())}</span>
                    </div>
                    {shipping === 0 && (
                      <div className="text-xs text-green-600 bg-green-50 p-3 rounded-lg">
                        🎉 Free shipping on orders over $200!
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-orange-500">{formatPrice(total / getExchangeRate())}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex gap-2">
                      <input
                        className="flex-grow rounded-xl border border-gray-200 bg-white/60 text-gray-900 placeholder:text-gray-500 px-4 h-12 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all backdrop-blur-md"
                        placeholder="Enter promo code"
                      />
                      <button className="rounded-xl bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors text-sm font-medium px-4 h-12">
                        Apply
                      </button>
                    </div>
                  </div>

                  <Link to="/checkout">
                    <button className="flex w-full items-center justify-center rounded-xl h-12 lg:h-14 px-6 text-base font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                      Proceed to Checkout
                      <span className="material-symbols-outlined ml-2">arrow_forward</span>
                    </button>
                  </Link>

                  <div className="mt-4 text-center">
                    <Link to="/products" className="text-sm text-orange-500 hover:text-orange-600 transition-colors">
                      Continue Shopping
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
