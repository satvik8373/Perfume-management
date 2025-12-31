import { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load wishlist from user document in Firestore
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setWishlistItems(doc.data().wishlist || []);
        } else {
          setWishlistItems([]);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error loading wishlist:', error);
        setLoading(false);
      });
      
      return unsubscribe;
    } else {
      // Load from localStorage for guest users
      const savedWishlist = localStorage.getItem('guestWishlist');
      if (savedWishlist) {
        try {
          setWishlistItems(JSON.parse(savedWishlist));
        } catch (e) {
          setWishlistItems([]);
        }
      }
      setLoading(false);
    }
  }, [user]);

  // Save wishlist to user document or localStorage
  const saveWishlist = async (items) => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          await updateDoc(userRef, { 
            wishlist: items,
            updatedAt: new Date().toISOString()
          });
        } else {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            cart: [],
            wishlist: items,
            settings: { currency: 'INR' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error saving wishlist:', error);
      }
    } else {
      localStorage.setItem('guestWishlist', JSON.stringify(items));
    }
  };

  // Add item to wishlist
  const addToWishlist = async (product) => {
    const exists = wishlistItems.some(item => item.id === product.id);
    if (exists) return;

    const newItems = [...wishlistItems, {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      img: product.img,
      addedAt: new Date().toISOString()
    }];

    setWishlistItems(newItems);
    await saveWishlist(newItems);
  };

  // Remove item from wishlist
  const removeFromWishlist = async (id) => {
    const newItems = wishlistItems.filter(item => item.id !== id);
    setWishlistItems(newItems);
    await saveWishlist(newItems);
  };

  // Toggle wishlist item
  const toggleWishlist = async (product) => {
    const exists = wishlistItems.some(item => item.id === product.id);
    if (exists) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Clear wishlist
  const clearWishlist = async () => {
    setWishlistItems([]);
    await saveWishlist([]);
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
