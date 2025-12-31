import { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load cart from user document in Firestore
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setCartItems(doc.data().cart || []);
        } else {
          setCartItems([]);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error loading cart:', error);
        setLoading(false);
      });
      
      return unsubscribe;
    } else {
      // Load from localStorage for guest users
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          setCartItems([]);
        }
      }
      setLoading(false);
    }
  }, [user]);

  // Save cart to user document or localStorage
  const saveCart = async (items) => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          await updateDoc(userRef, { 
            cart: items,
            updatedAt: new Date().toISOString()
          });
        } else {
          // Create user document if it doesn't exist
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            cart: items,
            wishlist: [],
            settings: { currency: 'INR' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    } else {
      localStorage.setItem('guestCart', JSON.stringify(items));
    }
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    const existingIndex = cartItems.findIndex(item => item.id === product.id);
    let newItems;

    if (existingIndex >= 0) {
      newItems = cartItems.map((item, index) => 
        index === existingIndex 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [...cartItems, { ...product, quantity }];
    }

    setCartItems(newItems);
    await saveCart(newItems);
  };

  // Update item quantity
  const updateQuantity = async (id, delta) => {
    const newItems = cartItems.map(item =>
      item.id === id 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setCartItems(newItems);
    await saveCart(newItems);
  };

  // Remove item from cart
  const removeFromCart = async (id) => {
    const newItems = cartItems.filter(item => item.id !== id);
    setCartItems(newItems);
    await saveCart(newItems);
  };

  // Clear cart
  const clearCart = async () => {
    setCartItems([]);
    await saveCart([]);
  };

  // Merge guest cart with user cart on login
  const mergeGuestCart = async () => {
    if (user) {
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        try {
          const guestItems = JSON.parse(guestCart);
          if (guestItems.length > 0) {
            const mergedItems = [...cartItems];
            guestItems.forEach(guestItem => {
              const existingIndex = mergedItems.findIndex(item => item.id === guestItem.id);
              if (existingIndex >= 0) {
                mergedItems[existingIndex].quantity += guestItem.quantity;
              } else {
                mergedItems.push(guestItem);
              }
            });
            setCartItems(mergedItems);
            await saveCart(mergedItems);
            localStorage.removeItem('guestCart');
          }
        } catch (e) {
          console.error('Error merging guest cart:', e);
        }
      }
    }
  };

  // Get cart totals
  const getCartTotals = (currency = 'INR', exchangeRate = 1) => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 200 ? 0 : 15;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    return {
      subtotal: subtotal * exchangeRate,
      shipping: shipping * exchangeRate,
      tax: tax * exchangeRate,
      total: total * exchangeRate,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    mergeGuestCart,
    getCartTotals
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
