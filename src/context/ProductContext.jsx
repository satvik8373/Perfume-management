import { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const ProductContext = createContext();

export function useProducts() {
  return useContext(ProductContext);
}

// Default products data - will be seeded to Firestore
const defaultProducts = [
  { 
    id: '1', 
    name: 'Bleu de Chanel', 
    brand: 'Chanel', 
    price: 125, 
    size: '100ml', 
    category: 'Woody', 
    rating: 4.8, 
    reviews: 1247, 
    img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', 
    description: 'A woody aromatic fragrance for men. Fresh and clean with notes of citrus, mint, and cedar. The perfect everyday scent that transitions seamlessly from day to night.',
    notes: ['Citrus', 'Mint', 'Cedar', 'Sandalwood'],
    inStock: true
  },
  { 
    id: '2', 
    name: 'Sauvage', 
    brand: 'Dior', 
    price: 104, 
    size: '100ml', 
    category: 'Fresh', 
    rating: 4.7, 
    reviews: 2341, 
    img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400', 
    description: 'A radically fresh composition with raw masculinity. Bergamot and pepper create an unforgettable trail that commands attention.',
    notes: ['Bergamot', 'Pepper', 'Ambroxan', 'Vanilla'],
    inStock: true
  },
  { 
    id: '3', 
    name: 'Oud Wood', 
    brand: 'Tom Ford', 
    price: 250, 
    size: '50ml', 
    category: 'Oud', 
    rating: 4.9, 
    reviews: 892, 
    img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400', 
    description: 'Rare oud wood is blended with rosewood, cardamom, and Chinese pepper for a smoky, exotic scent that defines luxury.',
    notes: ['Oud', 'Rosewood', 'Cardamom', 'Sandalwood'],
    inStock: true
  },
  { 
    id: '4', 
    name: 'Aventus', 
    brand: 'Creed', 
    price: 335, 
    size: '100ml', 
    category: 'Fruity', 
    rating: 4.9, 
    reviews: 3456, 
    img: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400', 
    description: 'A sophisticated blend of pineapple, birch, and musk. The scent of success and power, worn by leaders worldwide.',
    notes: ['Pineapple', 'Birch', 'Musk', 'Oak Moss'],
    inStock: true
  },
  { 
    id: '5', 
    name: 'Acqua di Giò', 
    brand: 'Giorgio Armani', 
    price: 98, 
    size: '100ml', 
    category: 'Aquatic', 
    rating: 4.6, 
    reviews: 4521, 
    img: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400', 
    description: 'A fresh aquatic fragrance inspired by the Mediterranean sea. Clean, crisp, and refreshing - perfect for summer.',
    notes: ['Sea Notes', 'Bergamot', 'Jasmine', 'Cedar'],
    inStock: true
  },
  { 
    id: '6', 
    name: 'Eros', 
    brand: 'Versace', 
    price: 92, 
    size: '100ml', 
    category: 'Sweet', 
    rating: 4.5, 
    reviews: 2876, 
    img: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400', 
    description: 'A bold fragrance with mint, green apple, and vanilla. Passionate and seductive, named after the Greek god of love.',
    notes: ['Mint', 'Green Apple', 'Vanilla', 'Tonka Bean'],
    inStock: true
  },
  { 
    id: '7', 
    name: 'Cyber Flora', 
    brand: 'Mavrix Collection', 
    price: 185, 
    size: '100ml', 
    category: 'Floral', 
    rating: 4.8, 
    reviews: 1247, 
    img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', 
    description: 'An ethereal fusion of future and nature. Captures the essence of a digital garden at dusk with luminous bergamot and bio-luminescent jasmine.',
    notes: ['Bergamot', 'Jasmine', 'Synthetic Sandalwood', 'Amber'],
    inStock: true
  },
  { 
    id: '8', 
    name: 'Nebula Oud', 
    brand: 'Mavrix Collection', 
    price: 210, 
    size: '50ml', 
    category: 'Oud', 
    rating: 4.7, 
    reviews: 654, 
    img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400', 
    description: 'A cosmic journey through rare oud and celestial spices. Mysterious and captivating, for those who dare to explore.',
    notes: ['Oud', 'Saffron', 'Rose', 'Leather'],
    inStock: true
  },
  { 
    id: '9', 
    name: 'Solar Vetiver', 
    brand: 'Mavrix Collection', 
    price: 175, 
    size: '100ml', 
    category: 'Woody', 
    rating: 4.6, 
    reviews: 432, 
    img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400', 
    description: 'Sun-drenched vetiver meets warm amber in this radiant composition. A modern classic for the confident individual.',
    notes: ['Vetiver', 'Amber', 'Grapefruit', 'Cedar'],
    inStock: true
  },
  { 
    id: '10', 
    name: 'Midnight Rose', 
    brand: 'Mavrix Collection', 
    price: 165, 
    size: '75ml', 
    category: 'Floral', 
    rating: 4.8, 
    reviews: 789, 
    img: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400', 
    description: 'A dark and mysterious take on the classic rose. Black pepper and oud add depth to Bulgarian rose absolute.',
    notes: ['Bulgarian Rose', 'Black Pepper', 'Oud', 'Patchouli'],
    inStock: true
  },
  { 
    id: '11', 
    name: 'Arctic Breeze', 
    brand: 'Mavrix Collection', 
    price: 145, 
    size: '100ml', 
    category: 'Fresh', 
    rating: 4.5, 
    reviews: 567, 
    img: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400', 
    description: 'Crisp and invigorating like a breath of arctic air. Cool mint and eucalyptus over a warm musk base.',
    notes: ['Mint', 'Eucalyptus', 'White Musk', 'Iris'],
    inStock: true
  },
  { 
    id: '12', 
    name: 'Golden Amber', 
    brand: 'Mavrix Collection', 
    price: 195, 
    size: '50ml', 
    category: 'Oriental', 
    rating: 4.9, 
    reviews: 923, 
    img: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400', 
    description: 'Liquid gold in a bottle. Rich amber, warm vanilla, and precious resins create an opulent, long-lasting scent.',
    notes: ['Amber', 'Vanilla', 'Benzoin', 'Labdanum'],
    inStock: true
  }
];

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Seed products to Firestore
  const seedProducts = async () => {
    setSeeding(true);
    console.log('Seeding products to Firestore...');
    
    try {
      const batch = [];
      for (const product of defaultProducts) {
        const productData = {
          ...product,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        try {
          await setDoc(doc(db, 'products', product.id), productData);
          console.log(`✓ Seeded: ${product.name}`);
          batch.push(product.name);
        } catch (err) {
          console.error(`✗ Failed to seed ${product.name}:`, err.message);
        }
      }
      
      if (batch.length > 0) {
        console.log(`Successfully seeded ${batch.length} products!`);
        // Force refresh products
        const snapshot = await getDocs(collection(db, 'products'));
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error seeding products:', error);
      alert(`Error seeding products: ${error.message}\n\nMake sure Firestore is enabled in Firebase Console and rules allow writes.`);
    }
    
    setSeeding(false);
  };

  // Initialize products from Firestore
  useEffect(() => {
    const initializeProducts = async () => {
      try {
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        
        if (snapshot.empty) {
          console.log('No products in Firestore, seeding default products...');
          // Seed default products if collection is empty
          await seedProducts();
        }
      } catch (error) {
        console.error('Error checking products:', error);
        // If Firestore fails, use default products
        setProducts(defaultProducts);
        setLoading(false);
        return;
      }

      // Listen for real-time updates
      const unsubscribe = onSnapshot(
        collection(db, 'products'), 
        (snapshot) => {
          if (!snapshot.empty) {
            const productsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setProducts(productsData);
            console.log(`Loaded ${productsData.length} products from Firestore`);
          } else {
            // Fallback to default products
            setProducts(defaultProducts);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error listening to products:', error);
          setProducts(defaultProducts);
          setLoading(false);
        }
      );

      return unsubscribe;
    };

    initializeProducts();
  }, []);

  // Get single product by ID
  const getProduct = async (id) => {
    // First check local cache
    const cached = products.find(p => p.id === id);
    if (cached) return cached;

    // Then try Firestore
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
    } catch (error) {
      console.error('Error getting product:', error);
    }
    
    // Fallback to default products
    return defaultProducts.find(p => p.id === id) || null;
  };

  // Filter products
  const filterProducts = (filters) => {
    return products.filter(product => {
      if (filters.brands?.length && !filters.brands.includes(product.brand)) {
        return false;
      }
      if (filters.categories?.length && !filters.categories.includes(product.category)) {
        return false;
      }
      if (filters.minPrice && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && product.price > filters.maxPrice) {
        return false;
      }
      return true;
    });
  };

  // Get unique brands
  const getBrands = () => {
    return [...new Set(products.map(p => p.brand))];
  };

  // Get unique categories
  const getCategories = () => {
    return [...new Set(products.map(p => p.category))];
  };

  const value = {
    products,
    loading,
    seeding,
    getProduct,
    filterProducts,
    getBrands,
    getCategories,
    seedProducts, // Expose for manual seeding if needed
    defaultProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}
