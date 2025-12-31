import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import Layout from '../components/Layout';
import Card from '../components/Card';

function BuyerPanel() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { formatPrice } = useSettings();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch orders from orders collection (real-time updates from admin)
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const tabs = [
    { id: 'orders', label: 'Orders', icon: 'package_2', count: orders.length },
    { id: 'tracking', label: 'Track Order', icon: 'local_shipping' },
    { id: 'wishlist', label: 'Wishlist', icon: 'favorite', count: wishlistItems.length },
    { id: 'profile', label: 'Profile', icon: 'person' }
  ];

  const getStatusInfo = (status) => {
    const statuses = {
      processing: { color: 'orange', icon: 'pending', label: 'Processing', step: 1 },
      shipped: { color: 'blue', icon: 'local_shipping', label: 'Shipped', step: 2 },
      'out-for-delivery': { color: 'purple', icon: 'delivery_truck_speed', label: 'Out for Delivery', step: 3 },
      delivered: { color: 'green', icon: 'check_circle', label: 'Delivered', step: 4 },
      cancelled: { color: 'red', icon: 'cancel', label: 'Cancelled', step: 0 }
    };
    return statuses[status] || statuses.processing;
  };

  const getStatusColor = (status) => {
    const colors = {
      processing: 'bg-orange-100 text-orange-600',
      shipped: 'bg-blue-100 text-blue-600',
      'out-for-delivery': 'bg-purple-100 text-purple-600',
      delivered: 'bg-green-100 text-green-600',
      cancelled: 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getEstimatedDelivery = (order) => {
    const created = new Date(order.createdAt);
    const delivery = new Date(created);
    delivery.setDate(delivery.getDate() + 5); // 5 days delivery estimate
    return delivery;
  };

  if (!user) {
    return (
      <Layout>
        <div className="py-16 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">account_circle</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view your orders</h1>
          <p className="text-gray-600 mb-6">Track your orders and manage your account</p>
          <button onClick={() => navigate('/auth')} className="rounded-xl h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all">
            Sign In / Sign Up
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 lg:py-12">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your orders, track shipments, and more</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-1/4">
            <Card className="p-4 lg:p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full" />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{user.displayName || 'User'}</h3>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedOrder(null); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-orange-50'
                    }`}>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    {tab.count > 0 && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{tab.count}</span>
                    )}
                  </button>
                ))}
                <button onClick={() => navigate('/settings')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-orange-50 transition-all">
                  <span className="material-symbols-outlined text-xl">settings</span>
                  <span className="font-medium">Settings</span>
                </button>
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {loading ? (
              <div className="py-16 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-orange-500 animate-spin">progress_activity</span>
              </div>
            ) : (
              <>

                {/* Orders Tab */}
                {activeTab === 'orders' && !selectedOrder && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Your Orders ({orders.length})</h2>
                    </div>

                    {orders.length === 0 ? (
                      <Card className="p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300">package_2</span>
                        <h3 className="text-xl font-bold text-gray-900 mt-4">No Orders Yet</h3>
                        <p className="text-gray-600 mt-2 mb-6">Start shopping to see your orders here</p>
                        <Link to="/products">
                          <button className="rounded-xl h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-medium">Browse Products</button>
                        </Link>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {orders.map(order => {
                          const statusInfo = getStatusInfo(order.status);
                          const estimatedDelivery = getEstimatedDelivery(order);
                          
                          return (
                            <Card key={order.id} hover className="overflow-hidden">
                              {/* Order Header */}
                              <div className="bg-gray-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                                <div className="flex flex-wrap gap-4 lg:gap-8">
                                  <div>
                                    <p className="text-gray-500 text-xs uppercase">Order Placed</p>
                                    <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-xs uppercase">Total</p>
                                    <p className="font-medium text-gray-900">{formatPrice(order.totals?.total || 0)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-xs uppercase">Ship To</p>
                                    <p className="font-medium text-gray-900">{order.shipping?.fullName}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-gray-500 text-xs uppercase">Order #{order.orderNumber}</p>
                                  <button onClick={() => setSelectedOrder(order)} className="text-orange-500 hover:underline text-sm">View Details</button>
                                </div>
                              </div>

                              {/* Order Content */}
                              <div className="p-4">
                                {/* Status Banner */}
                                <div className={`rounded-xl p-4 mb-4 ${
                                  order.status === 'delivered' ? 'bg-green-50' : 
                                  order.status === 'cancelled' ? 'bg-red-50' : 'bg-blue-50'
                                }`}>
                                  <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined text-2xl ${
                                      order.status === 'delivered' ? 'text-green-500' : 
                                      order.status === 'cancelled' ? 'text-red-500' : 'text-blue-500'
                                    }`}>{statusInfo.icon}</span>
                                    <div>
                                      <p className={`font-bold ${
                                        order.status === 'delivered' ? 'text-green-700' : 
                                        order.status === 'cancelled' ? 'text-red-700' : 'text-blue-700'
                                      }`}>
                                        {order.status === 'delivered' ? 'Delivered' : 
                                         order.status === 'cancelled' ? 'Cancelled' :
                                         `Arriving by ${estimatedDelivery.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
                                      </p>
                                      <p className="text-sm text-gray-600">{statusInfo.label}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Items */}
                                <div className="flex flex-wrap gap-4">
                                  {order.items?.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="flex gap-3">
                                      <img src={item.img} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                      <div>
                                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                      </div>
                                    </div>
                                  ))}
                                  {order.items?.length > 3 && (
                                    <p className="text-sm text-gray-500 self-center">+{order.items.length - 3} more</p>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                                  <button onClick={() => { setSelectedOrder(order); setActiveTab('tracking'); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">
                                    <span className="material-symbols-outlined text-lg">local_shipping</span>
                                    Track Package
                                  </button>
                                  <button onClick={() => setSelectedOrder(order)}
                                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                                    View Order Details
                                  </button>
                                  <button className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                                    Buy Again
                                  </button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Order Detail View */}
                {activeTab === 'orders' && selectedOrder && (
                  <div className="space-y-4">
                    <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-orange-500 hover:underline">
                      <span className="material-symbols-outlined">arrow_back</span>
                      Back to Orders
                    </button>

                    <Card className="overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">Order #{selectedOrder.orderNumber}</h2>
                            <p className="text-sm text-gray-500">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                          <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {getStatusInfo(selectedOrder.status).label}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Delivery Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-orange-500">location_on</span>
                              Shipping Address
                            </h3>
                            <div className="bg-gray-50 rounded-xl p-4 text-sm">
                              <p className="font-medium text-gray-900">{selectedOrder.shipping?.fullName}</p>
                              <p className="text-gray-600">{selectedOrder.shipping?.address1}</p>
                              {selectedOrder.shipping?.address2 && <p className="text-gray-600">{selectedOrder.shipping?.address2}</p>}
                              <p className="text-gray-600">{selectedOrder.shipping?.city}, {selectedOrder.shipping?.state} {selectedOrder.shipping?.zip}</p>
                              <p className="text-gray-600 mt-2">Phone: {selectedOrder.shipping?.phone}</p>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-orange-500">receipt</span>
                              Payment Summary
                            </h3>
                            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatPrice(selectedOrder.totals?.subtotal || 0)}</span></div>
                              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{formatPrice(selectedOrder.totals?.shipping || 0)}</span></div>
                              <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>{formatPrice(selectedOrder.totals?.tax || 0)}</span></div>
                              <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-lg">
                                <span>Total</span><span className="text-orange-500">{formatPrice(selectedOrder.totals?.total || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3">Items in this Order</h3>
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                            {selectedOrder.items?.map((item, idx) => (
                              <div key={idx} className={`flex gap-4 p-4 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                                <img src={item.img} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                                <div className="flex-1">
                                  <Link to={`/product/${item.id}`} className="font-medium text-gray-900 hover:text-orange-500">{item.name}</Link>
                                  <p className="text-sm text-gray-500">{item.brand} • {item.size}</p>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                  <button onClick={() => addToCart(item)} className="text-sm text-orange-500 hover:underline mt-2">Buy Again</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Tracking Tab */}
                {activeTab === 'tracking' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Track Your Order</h2>

                    {!selectedOrder ? (
                      <Card className="p-6">
                        <p className="text-gray-600 mb-4">Select an order to track:</p>
                        <div className="space-y-2">
                          {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').map(order => (
                            <button key={order.id} onClick={() => setSelectedOrder(order)}
                              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all">
                              <div className="flex items-center gap-4">
                                <span className={`material-symbols-outlined text-2xl ${
                                  order.status === 'shipped' ? 'text-blue-500' : 'text-orange-500'
                                }`}>{getStatusInfo(order.status).icon}</span>
                                <div className="text-left">
                                  <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                                  <p className="text-sm text-gray-500">{order.items?.length} items • {formatPrice(order.totals?.total || 0)}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusInfo(order.status).label}
                              </span>
                            </button>
                          ))}
                          {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length === 0 && (
                            <p className="text-center text-gray-500 py-8">No orders to track</p>
                          )}
                        </div>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-orange-500 hover:underline">
                          <span className="material-symbols-outlined">arrow_back</span>
                          Select Different Order
                        </button>

                        <Card className="overflow-hidden">
                          {/* Order Header */}
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-orange-100 text-sm">Order #{selectedOrder.orderNumber}</p>
                                <h3 className="text-2xl font-bold mt-1">
                                  {selectedOrder.status === 'delivered' ? 'Delivered!' :
                                   selectedOrder.status === 'cancelled' ? 'Cancelled' :
                                   `Arriving ${getEstimatedDelivery(selectedOrder).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
                                </h3>
                              </div>
                              <span className="material-symbols-outlined text-5xl opacity-50">{getStatusInfo(selectedOrder.status).icon}</span>
                            </div>
                          </div>

                          <div className="p-6">
                            {/* Progress Timeline */}
                            <div className="mb-8">
                              <div className="flex items-center justify-between relative">
                                {['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                                  const currentStep = getStatusInfo(selectedOrder.status).step;
                                  const isCompleted = idx < currentStep;
                                  const isCurrent = idx === currentStep - 1;
                                  
                                  return (
                                    <div key={step} className="flex flex-col items-center relative z-10">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        isCompleted || isCurrent ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                                      }`}>
                                        {isCompleted ? (
                                          <span className="material-symbols-outlined">check</span>
                                        ) : (
                                          <span className="text-sm font-bold">{idx + 1}</span>
                                        )}
                                      </div>
                                      <p className={`text-xs mt-2 text-center max-w-[80px] ${isCurrent ? 'font-bold text-green-600' : 'text-gray-500'}`}>{step}</p>
                                    </div>
                                  );
                                })}
                                {/* Progress Line */}
                                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
                                  <div className="h-full bg-green-500 transition-all" style={{ width: `${(getStatusInfo(selectedOrder.status).step - 1) * 25}%` }} />
                                </div>
                              </div>
                            </div>

                            {/* Tracking Updates */}
                            <div className="mb-6">
                              <h4 className="font-bold text-gray-900 mb-4">Tracking Updates</h4>
                              <div className="space-y-4">
                                {selectedOrder.trackingHistory?.map((update, idx) => (
                                  <div key={idx} className="flex gap-4">
                                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                                    <div>
                                      <p className="font-medium text-gray-900">{update.status}</p>
                                      <p className="text-sm text-gray-500">{update.location}</p>
                                      <p className="text-xs text-gray-400">{new Date(update.date).toLocaleString()}</p>
                                    </div>
                                  </div>
                                )) || (
                                  <>
                                    <div className="flex gap-4">
                                      <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                                      <div>
                                        <p className="font-medium text-gray-900">Order Confirmed</p>
                                        <p className="text-sm text-gray-500">Your order has been placed successfully</p>
                                        <p className="text-xs text-gray-400">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                      </div>
                                    </div>
                                    {selectedOrder.status !== 'processing' && (
                                      <div className="flex gap-4">
                                        <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                                        <div>
                                          <p className="font-medium text-gray-900">Package {selectedOrder.status}</p>
                                          <p className="text-sm text-gray-500">{selectedOrder.shipping?.city}, {selectedOrder.shipping?.state}</p>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="bg-gray-50 rounded-xl p-4">
                              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-500">location_on</span>
                                Delivery Address
                              </h4>
                              <p className="text-gray-600">{selectedOrder.shipping?.fullName}</p>
                              <p className="text-gray-600">{selectedOrder.shipping?.address1}, {selectedOrder.shipping?.city}, {selectedOrder.shipping?.state} {selectedOrder.shipping?.zip}</p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                  </div>
                )}

                {/* Wishlist Tab */}
                {activeTab === 'wishlist' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">My Wishlist ({wishlistItems.length})</h2>
                    
                    {wishlistItems.length === 0 ? (
                      <Card className="p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300">favorite</span>
                        <h3 className="text-xl font-bold text-gray-900 mt-4">Your Wishlist is Empty</h3>
                        <p className="text-gray-600 mt-2 mb-6">Save your favorite fragrances for later</p>
                        <Link to="/products">
                          <button className="rounded-xl h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-medium">Browse Products</button>
                        </Link>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wishlistItems.map((item) => (
                          <Card key={item.id} hover className="overflow-hidden">
                            <div className="relative">
                              <img src={item.img} alt={item.name} className="w-full aspect-square object-cover" />
                              <button onClick={() => removeFromWishlist(item.id)}
                                className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 shadow-md">
                                <span className="material-symbols-outlined text-lg">close</span>
                              </button>
                            </div>
                            <div className="p-4">
                              <Link to={`/product/${item.id}`}>
                                <h3 className="font-bold text-gray-900 hover:text-orange-500">{item.name}</h3>
                              </Link>
                              <p className="text-sm text-gray-500">{item.brand}</p>
                              <p className="text-lg font-bold text-orange-500 mt-2">{formatPrice(item.price)}</p>
                              <button onClick={() => { addToCart({ ...item, size: '100ml' }); removeFromWishlist(item.id); }}
                                className="w-full mt-3 flex items-center justify-center gap-2 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium">
                                <span className="material-symbols-outlined text-lg">shopping_cart</span>
                                Add to Cart
                              </button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                    
                    <Card className="p-6">
                      <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-20 h-20 rounded-full" />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{user.displayName || 'User'}</h3>
                          <p className="text-gray-500">{user.email}</p>
                          <p className="text-sm text-gray-400 mt-1">Member since {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-orange-50 rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-orange-500">{orders.length}</p>
                          <p className="text-sm text-gray-600">Total Orders</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-green-500">{orders.filter(o => o.status === 'delivered').length}</p>
                          <p className="text-sm text-gray-600">Delivered</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-purple-500">{wishlistItems.length}</p>
                          <p className="text-sm text-gray-600">Wishlist Items</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                          <input type="text" defaultValue={user.displayName || ''} readOnly
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 h-12 text-gray-600" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input type="email" defaultValue={user.email} readOnly
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 h-12 text-gray-600" />
                        </div>
                      </div>

                      <div className="flex justify-end mt-6">
                        <button onClick={() => navigate('/settings')}
                          className="flex items-center gap-2 px-6 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium">
                          <span className="material-symbols-outlined">settings</span>
                          Go to Settings
                        </button>
                      </div>
                    </Card>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}

export default BuyerPanel;
