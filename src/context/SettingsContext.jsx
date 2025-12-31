import { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

// Currency configurations
export const currencies = {
  INR: { symbol: '₹', name: 'Indian Rupee', rate: 83.12 },
  USD: { symbol: '$', name: 'US Dollar', rate: 1 },
  EUR: { symbol: '€', name: 'Euro', rate: 0.92 },
  GBP: { symbol: '£', name: 'British Pound', rate: 0.79 },
  JPY: { symbol: '¥', name: 'Japanese Yen', rate: 149.50 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', rate: 1.53 },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', rate: 1.36 }
};

export function SettingsProvider({ children }) {
  const [currency, setCurrencyState] = useState('INR');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load settings from user document in Firestore
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists() && doc.data().settings?.currency) {
          setCurrencyState(doc.data().settings.currency);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error loading settings:', error);
        setLoading(false);
      });
      
      return unsubscribe;
    } else {
      const savedCurrency = localStorage.getItem('currency');
      if (savedCurrency && currencies[savedCurrency]) {
        setCurrencyState(savedCurrency);
      } else {
        localStorage.setItem('currency', 'INR');
      }
      setLoading(false);
    }
  }, [user]);

  // Update currency in user document
  const setCurrency = async (newCurrency) => {
    if (!currencies[newCurrency]) return;
    
    setCurrencyState(newCurrency);
    
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          await updateDoc(userRef, {
            'settings.currency': newCurrency,
            updatedAt: new Date().toISOString()
          });
        } else {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            cart: [],
            wishlist: [],
            settings: { currency: newCurrency },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error saving currency:', error);
      }
    } else {
      localStorage.setItem('currency', newCurrency);
    }
  };

  // Format price with current currency
  const formatPrice = (priceInUSD) => {
    const currencyConfig = currencies[currency];
    const convertedPrice = priceInUSD * currencyConfig.rate;
    return `${currencyConfig.symbol}${convertedPrice.toFixed(2)}`;
  };

  // Get exchange rate
  const getExchangeRate = () => currencies[currency].rate;

  // Get currency symbol
  const getCurrencySymbol = () => currencies[currency].symbol;

  const value = {
    currency,
    setCurrency,
    formatPrice,
    getExchangeRate,
    getCurrencySymbol,
    currencies,
    loading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
