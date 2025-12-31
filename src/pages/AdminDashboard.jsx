import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy, addDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useProducts } from '../context/ProductContext';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { formatPrice } = useSettings();
  const { seedProducts } = useProducts();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', brand: '', category: '', price: '', description: '',
    img: '', size: '100ml', rating: '4.5', reviews: '100', inStock: true
  });

  // Redirect if not admin
  useEffect(() => {
    if (!user) navigate('/auth');
    else if (!isAdmin) navigate('/');
  }, [user, isAdmin, navigate]);

  // Fetch all data
  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribers = [];

    unsubscribers.push(onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    unsubscribers.push(onSnapshot(query(collection(db, 'users')), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }));

    unsubscribers.push(onSnapshot(query(collection(db, 'products')), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    return () => unsubscribers.forEach(unsub => unsub());
  }, [isAdmin]);

  // Product handlers
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '', brand: '', category: 'Floral', price: '', description: '',
      img: '', size: '100ml', rating: '4.5', reviews: '100', inStock: true
    });
    setShowProductModal(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || 'Floral',
      price: product.price?.toString() || '',
      description: product.description || '',
      img: product.img || '',
      size: product.size || '100ml',
      rating: product.rating?.toString() || '4.5',
      reviews: product.reviews?.toString() || '100',
      inStock: product.inStock !== false
    });
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      ...productForm,
      price: parseFloat(productForm.price),
      rating: parseFloat(productForm.rating),
      reviews: parseInt(productForm.reviews),
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        productData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'products'), productData);
      }
      setShowProductModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  // Order handlers
  const updateOrderStatus = async (orderId, newStatus, order) => {
    try {
      const trackingUpdate = {
        status: newStatus === 'processing' ? 'Order is being processed' :
                newStatus === 'shipped' ? 'Package has been shipped' :
                newStatus === 'out-for-delivery' ? 'Package is out for delivery' :
                newStatus === 'delivered' ? 'Package delivered successfully' :
                'Order status updated',
        location: order?.shipping?.city ? `${order.shipping.city}, ${order.shipping.state}` : 'Warehouse',
        date: new Date().toISOString()
      };

      // Update orders collection
      await updateDoc(doc(db, 'orders', orderId), { 
        status: newStatus,
        updatedAt: new Date().toISOString(),
        trackingHistory: [...(order?.trackingHistory || []), trackingUpdate]
      });
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const addOrderNote = async (orderId, note) => {
    const order = orders.find(o => o.id === orderId);
    const notes = order?.notes || [];
    notes.push({ text: note, date: new Date().toISOString(), by: user.email });
    try {
      await updateDoc(doc(db, 'orders', orderId), { notes });
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { 
        role: newRole,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Stats
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totals?.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'orders', label: 'Orders', icon: 'package_2' },
    { id: 'products', label: 'Products', icon: 'inventory_2' },
    { id: 'users', label: 'Users', icon: 'group' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const categories = ['Floral', 'Woody', 'Oriental', 'Fresh', 'Citrus', 'Oud', 'Unisex'];

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-500">block</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Access Denied</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-purple-900 via-indigo-900 to-purple-950 transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-purple-700/50 flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-black bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">MAVRIX</h1>
              <p className="text-purple-300 text-xs">Admin Dashboard</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-purple-200">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-4 border-b border-purple-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.displayName || 'Admin'}</p>
                <p className="text-purple-300 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-amber-500/20 text-amber-300' : 'text-purple-100 hover:bg-purple-800/50'}`}>
                <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                {tab.id === 'orders' && pendingOrders > 0 && (
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingOrders}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-purple-700/50 space-y-2">
            <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-purple-100 hover:bg-purple-800/50 transition-all">
              <span className="material-symbols-outlined text-xl">storefront</span>
              <span className="font-medium">View Store</span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 transition-all">
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white shadow-sm px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <h2 className="text-xl font-bold text-gray-900 capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <span className="material-symbols-outlined text-4xl text-orange-500 animate-spin">progress_activity</span>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Revenue" value={formatPrice(totalRevenue)} icon="payments" color="green" />
                    <StatCard title="Total Orders" value={orders.length} icon="package_2" color="blue" />
                    <StatCard title="Pending Orders" value={pendingOrders} icon="pending" color="orange" />
                    <StatCard title="Total Users" value={totalUsers} icon="group" color="purple" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Recent Orders</h3>
                        <button onClick={() => setActiveTab('orders')} className="text-orange-500 text-sm hover:underline">View All</button>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {orders.slice(0, 5).map(order => (
                          <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div>
                              <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                              <p className="text-sm text-gray-500">{order.shipping?.fullName}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">{formatPrice(order.totals?.total || 0)}</p>
                              <StatusBadge status={order.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm">
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Order Status Overview</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        <StatusBar label="Processing" count={pendingOrders} total={orders.length} color="orange" />
                        <StatusBar label="Shipped" count={shippedOrders} total={orders.length} color="blue" />
                        <StatusBar label="Delivered" count={deliveredOrders} total={orders.length} color="green" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                      <button key={status} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        <span className="ml-2 text-xs">({status === 'all' ? orders.length : orders.filter(o => o.status === status).length})</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {orders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <button onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }} className="font-medium text-orange-500 hover:underline">
                                  #{order.orderNumber}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-sm text-gray-900">{order.shipping?.fullName}</p>
                                <p className="text-xs text-gray-500">{order.userEmail}</p>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{order.items?.length || 0} items</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(order.totals?.total || 0)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                              <td className="px-4 py-3">
                                <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value, order)}
                                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-orange-500">
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="out-for-delivery">Out for Delivery</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {orders.length === 0 && <div className="p-8 text-center text-gray-500">No orders yet</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900">Products ({products.length})</h3>
                      <p className="text-sm text-gray-500">Manage your product catalog</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={seedProducts} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
                        <span className="material-symbols-outlined text-lg">database</span>
                        Seed Sample
                      </button>
                      <button onClick={openAddProduct} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors">
                        <span className="material-symbols-outlined text-lg">add</span>
                        Add Product
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map(product => (
                      <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                        <div className="aspect-square bg-gray-100 relative">
                          <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => openEditProduct(product)} className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100">
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button onClick={() => deleteProduct(product.id)} className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50">
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                          {!product.inStock && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Out of Stock</span>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-gray-500 uppercase">{product.brand}</p>
                          <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-orange-500 font-bold">{formatPrice(product.price)}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                              {product.rating}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {products.length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center">
                      <span className="material-symbols-outlined text-6xl text-gray-300">inventory_2</span>
                      <p className="text-gray-500 mt-4">No products yet. Add your first product or seed sample data.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard title="Total Users" value={totalUsers} icon="group" color="blue" small />
                    <StatCard title="Admin Users" value={adminUsers} icon="admin_panel_settings" color="purple" small />
                    <StatCard title="Regular Users" value={totalUsers - adminUsers} icon="person" color="gray" small />
                  </div>

                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cart Items</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {u.photoURL ? (
                                    <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                                      {u.displayName?.[0] || u.email?.[0]?.toUpperCase()}
                                    </div>
                                  )}
                                  <span className="text-sm font-medium text-gray-900">{u.displayName || 'User'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                  {u.role || 'user'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{u.orders?.length || 0}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{u.cart?.length || 0}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                              <td className="px-4 py-3">
                                <select value={u.role || 'user'} onChange={(e) => updateUserRole(u.id, e.target.value)}
                                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-orange-500"
                                  disabled={u.id === user?.uid}>
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Avg Order Value" value={formatPrice(orders.length ? totalRevenue / orders.length : 0)} icon="trending_up" color="green" />
                    <StatCard title="Products" value={products.length} icon="inventory_2" color="blue" />
                    <StatCard title="Conversion Rate" value="3.2%" icon="percent" color="purple" />
                    <StatCard title="Active Carts" value={users.filter(u => u.cart?.length > 0).length} icon="shopping_cart" color="orange" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="font-bold text-gray-900 mb-4">Top Selling Products</h3>
                      <div className="space-y-4">
                        {products.slice(0, 5).map((product, idx) => (
                          <div key={product.id} className="flex items-center gap-4">
                            <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                            <img src={product.img} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.brand}</p>
                            </div>
                            <p className="font-bold text-gray-900">{formatPrice(product.price)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="font-bold text-gray-900 mb-4">Revenue by Status</h3>
                      <div className="space-y-4">
                        {['processing', 'shipped', 'delivered'].map(status => {
                          const statusOrders = orders.filter(o => o.status === status);
                          const statusRevenue = statusOrders.reduce((sum, o) => sum + (o.totals?.total || 0), 0);
                          return (
                            <div key={status} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <StatusBadge status={status} />
                                <span className="text-gray-600">{statusOrders.length} orders</span>
                              </div>
                              <span className="font-bold text-gray-900">{formatPrice(statusRevenue)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Store Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                        <input type="text" defaultValue="Mavrix Perfume" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                        <input type="email" defaultValue="contact@mavrix.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Database Actions</h3>
                    <div className="flex flex-wrap gap-4">
                      <button onClick={seedProducts} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors">
                        <span className="material-symbols-outlined text-lg">database</span>
                        Seed Products
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input type="text" required value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-orange-500" placeholder="e.g., Noir Fusion" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                  <input type="text" required value={productForm.brand} onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-orange-500" placeholder="e.g., Mavrix" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select required value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-orange-500">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD) *</label>
                  <input type="number" required min="0" step="0.01" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-orange-500" placeholder="99.99" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <select value={productForm.size} onChange={(e) => setProductForm({...productForm, size: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-orange-500">
                    <option value="30ml">30ml</option>
                    <option value="50ml">50ml</option>
                    <option value="100ml">100ml</option>
                    <option value="150ml">150ml</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <input type="number" min="0" max="5" step="0.1" value={productForm.rating} onChange={(e) => setProductForm({...productForm, rating: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                <input type="url" required value={productForm.img} onChange={(e) => setProductForm({...productForm, img: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-orange-500" placeholder="https://..." />
                {productForm.img && <img src={productForm.img} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-lg" />}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows="3" value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-orange-500" placeholder="Product description..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="inStock" checked={productForm.inStock} onChange={(e) => setProductForm({...productForm, inStock: e.target.checked})}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                <label htmlFor="inStock" className="text-sm text-gray-700">In Stock</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium">{editingProduct ? 'Update Product' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order #{selectedOrder.orderNumber}</h3>
                <p className="text-sm text-gray-500">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-500">Current Status</p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <select value={selectedOrder.status} onChange={(e) => { updateOrderStatus(selectedOrder.id, e.target.value, selectedOrder); setSelectedOrder({...selectedOrder, status: e.target.value}); }}
                  className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500">
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="out-for-delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {selectedOrder.shipping?.fullName}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedOrder.shipping?.email || selectedOrder.userEmail}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedOrder.shipping?.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Shipping Address</h4>
                  <div className="text-sm text-gray-600">
                    <p>{selectedOrder.shipping?.address1}</p>
                    {selectedOrder.shipping?.address2 && <p>{selectedOrder.shipping?.address2}</p>}
                    <p>{selectedOrder.shipping?.city}, {selectedOrder.shipping?.state} {selectedOrder.shipping?.zip}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Order Items</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Size</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={item.img} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.size}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Totals */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(selectedOrder.totals?.subtotal || 0)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{formatPrice(selectedOrder.totals?.shipping || 0)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatPrice(selectedOrder.totals?.tax || 0)}</span></div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-lg">
                    <span>Total</span><span className="text-orange-500">{formatPrice(selectedOrder.totals?.total || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Order Notes</h4>
                <div className="space-y-2 mb-3">
                  {selectedOrder.notes?.map((note, idx) => (
                    <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                      <p className="text-gray-700">{note.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{note.by} - {new Date(note.date).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" id="orderNote" placeholder="Add a note..." className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
                  <button onClick={() => { const input = document.getElementById('orderNote'); if(input.value) { addOrderNote(selectedOrder.id, input.value); input.value = ''; }}}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm">Add Note</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon, color, small }) {
  const colors = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600'
  };
  
  return (
    <div className={`bg-white rounded-xl ${small ? 'p-4' : 'p-6'} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className={`${small ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>{value}</p>
        </div>
        <div className={`${small ? 'w-10 h-10' : 'w-12 h-12'} ${colors[color]} rounded-xl flex items-center justify-center`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    processing: 'bg-orange-100 text-orange-600',
    shipped: 'bg-blue-100 text-blue-600',
    'out-for-delivery': 'bg-purple-100 text-purple-600',
    delivered: 'bg-green-100 text-green-600',
    cancelled: 'bg-red-100 text-red-600'
  };
  
  const labels = {
    processing: 'Processing',
    shipped: 'Shipped',
    'out-for-delivery': 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
}

function StatusBar({ label, count, total, color }) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  const colors = {
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500'
  };
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{count}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} rounded-full transition-all`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default AdminDashboard;
