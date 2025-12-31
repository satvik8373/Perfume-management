import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, setDoc, arrayUnion, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import Layout from '../components/Layout';
import Card from '../components/Card';
import AnimatedOrderButton from '../components/AnimatedOrderButton';
import OrderSuccess from '../components/OrderSuccess';

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, getCartTotals, clearCart } = useCart();
  const { formatPrice, getExchangeRate } = useSettings();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { subtotal, shipping, tax, total } = getCartTotals('USD', getExchangeRate());

  const handleOrderComplete = async () => {
    // Generate order number
    const newOrderNumber = `MX-${Date.now().toString(36).toUpperCase()}`;
    setOrderNumber(newOrderNumber);

    // Save order to Firestore if user is logged in
    if (user) {
      try {
        const orderData = {
          orderNumber: newOrderNumber,
          userId: user.uid,
          userEmail: user.email,
          items: cartItems,
          shipping: {
            fullName: formData.fullName,
            email: formData.email,
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            phone: formData.phone
          },
          totals: { subtotal, shipping, tax, total },
          status: 'processing',
          createdAt: new Date().toISOString()
        };
        
        // 1. Save to separate 'orders' collection for easy management
        await setDoc(doc(collection(db, 'orders'), newOrderNumber), orderData);
        
        // 2. Also save to user document for quick user access
        const userRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userRef);
        
        if (userDocSnap.exists()) {
          await updateDoc(userRef, {
            orders: arrayUnion(orderData),
            updatedAt: new Date().toISOString()
          });
        } else {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            cart: [],
            wishlist: [],
            orders: [orderData],
            settings: { currency: 'INR' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error saving order:', error);
      }
    }

    // Show success modal after animation
    setTimeout(() => {
      setShowOrderSuccess(true);
      clearCart();
    }, 7500);
  };

  const handleCloseSuccess = () => {
    setShowOrderSuccess(false);
    navigate('/orders');
  };

  const steps = [
    { number: 1, title: 'Shipping', icon: 'local_shipping' },
    { number: 2, title: 'Payment', icon: 'payment' },
    { number: 3, title: 'Review', icon: 'check_circle' }
  ];

  // Check if form is valid for current step
  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.fullName && formData.email && formData.address1 && formData.city && formData.state && formData.zip && formData.phone;
    }
    if (currentStep === 2) {
      return formData.cardNumber && formData.expiryDate && formData.cvv && formData.cardName;
    }
    return true;
  };

  // Redirect if cart is empty
  if (cartItems.length === 0 && !showOrderSuccess) {
    return (
      <Layout>
        <div className="py-16 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">shopping_cart</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some products before checking out</p>
          <Link to="/products">
            <button className="rounded-xl h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all">
              Browse Products
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 lg:py-12">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase in just a few steps</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 rounded-xl transition-all ${
                  currentStep >= step.number 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className="material-symbols-outlined text-sm lg:text-base">{step.icon}</span>
                  <span className="font-medium text-sm lg:text-base">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-6 lg:w-8 h-0.5 mx-2 ${
                    currentStep > step.number ? 'bg-orange-400' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-4 lg:p-6 xl:p-8">
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Shipping Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Full Name *
                      </label>
                      <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white/60 text-gray-900 placeholder:text-gray-500 px-4 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all backdrop-blur-md"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Email Address *
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white/60 text-gray-900 placeholder:text-gray-500 px-4 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all backdrop-blur-md"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Address Line 1 *
                      </label>
                      <input
                        name="address1"
                        value={formData.address1}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white/60 text-gray-900 placeholder:text-gray-500 px-4 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all backdrop-blur-md"
                        placeholder="123 Main Street"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Address Line 2
                      </label>
                      <input
                        name="address2"
                        value={formData.address2}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white/60 text-gray-900 placeholder:text-gray-500 px-4 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all backdrop-blur-md"
                        placeholder="Apartment, suite, etc. (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        City *
                      </label>
                      <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white/60 text-gray-900 placeholder:text-gray-500 px-4 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all backdrop-blur-md"
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        State / Province *
                      </label>
                      <input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white/60 text-gray-900 placeholder:text-gray-500 px-4 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all backdrop-blur-md"
                        placeholder="NY"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        ZIP / Postal Code *
                      </label>
                      <input
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white/60 text-gray-900 placeholder:text-gray-500 px-4 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all backdrop-blur-md"
                        placeholder="10001"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Phone Number *
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white/60 text-gray-900 placeholder:text-gray-500 px-4 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all backdrop-blur-md"
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Payment Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Card Number *
                      </label>
                      <input
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white/60 text-gray-900 placeholder:text-gray-500 px-4 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all backdrop-blur-md"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white/60 text-gray-900 placeholder:text-gray-500 px-4 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all backdrop-blur-md"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        CVV *
                      </label>
                      <input
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white/60 text-gray-900 placeholder:text-gray-500 px-4 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all backdrop-blur-md"
                        placeholder="123"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white/60 text-gray-900 placeholder:text-gray-500 px-4 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all backdrop-blur-md"
                        placeholder="Name as it appears on card"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Review Your Order</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Shipping Address</h3>
                      <div className="bg-orange-50 rounded-xl p-4">
                        <p className="text-gray-900">{formData.fullName}</p>
                        <p className="text-gray-600">{formData.address1}</p>
                        {formData.address2 && <p className="text-gray-600">{formData.address2}</p>}
                        <p className="text-gray-600">{formData.city}, {formData.state} {formData.zip}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Payment Method</h3>
                      <div className="bg-orange-50 rounded-xl p-4">
                        <p className="text-gray-900">**** **** **** {formData.cardNumber.slice(-4)}</p>
                        <p className="text-gray-600">{formData.cardName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6 lg:mt-8 pt-6 border-t border-gray-200">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center justify-center rounded-xl h-12 px-6 bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all duration-200"
                  >
                    <span className="material-symbols-outlined mr-2">arrow_back</span>
                    Previous
                  </button>
                )}
                {currentStep < 3 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!isStepValid()}
                    className="flex items-center justify-center rounded-xl h-12 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl ml-auto"
                  >
                    Continue
                    <span className="material-symbols-outlined ml-2">arrow_forward</span>
                  </button>
                ) : (
                  <div className="ml-auto">
                    <AnimatedOrderButton 
                      onOrderComplete={handleOrderComplete}
                      disabled={!isStepValid()}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-32">
              <Card className="p-4 lg:p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <img className="w-16 h-16 rounded-xl object-cover" src={item.img} alt={item.name} />
                        <span className="absolute -top-2 -right-2 flex items-center justify-center size-6 bg-orange-500 text-white text-xs font-bold rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-gray-900 font-medium truncate">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.size}</p>
                      </div>
                      <p className="text-gray-900 font-medium">{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 py-4 border-t border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="text-gray-900">{formatPrice(subtotal / getExchangeRate())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-gray-900">{formatPrice(shipping / getExchangeRate())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="text-gray-900">{formatPrice(tax / getExchangeRate())}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-orange-500">{formatPrice(total / getExchangeRate())}</span>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="material-symbols-outlined text-sm">security</span>
                    <span className="text-sm font-medium">Secure SSL Encryption</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Your payment information is protected</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Order Success Modal */}
      {showOrderSuccess && (
        <OrderSuccess 
          orderNumber={orderNumber}
          orderTotal={total / getExchangeRate()}
          onClose={handleCloseSuccess}
        />
      )}
    </Layout>
  );
}

export default CheckoutPage;