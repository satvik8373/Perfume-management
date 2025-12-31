import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useSettings } from '../context/SettingsContext';
import { useWishlist } from '../context/WishlistContext';
import Layout from '../components/Layout';

function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { getProduct, products } = useProducts();
  const { formatPrice } = useSettings();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const productData = await getProduct(id);
      setProduct(productData);
      setLoading(false);
    };
    loadProduct();
  }, [id, getProduct]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    await addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      size: product.size,
      img: product.img
    }, quantity);
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Get related products (excluding current product)
  const relatedProducts = products
    .filter(p => p.id !== id)
    .slice(0, 4);

  if (loading) {
    return (
      <Layout>
        <div className="py-16 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-orange-500 animate-spin">progress_activity</span>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/products" className="text-orange-500 hover:text-orange-600">
            Back to Shop
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 lg:py-12">
        {/* Product Details */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Product Image */}
          <div className="flex justify-center items-center">
            <div className="w-full max-w-md aspect-square bg-center bg-no-repeat bg-cover rounded-2xl shadow-lg" 
                 style={{ backgroundImage: `url(${product.img})` }}>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-5">
            <p className="font-display text-sm font-bold uppercase tracking-widest text-gray-600">
              {product.brand}
            </p>
            <h1 className="font-display text-4xl lg:text-5xl font-black leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {product.name}
            </h1>
            
            {/* Tags */}
            <div className="flex gap-3 flex-wrap">
              {[product.category, 'Premium', 'Unisex'].map(tag => (
                <div key={tag} className="flex h-8 items-center justify-center rounded-full bg-orange-100 px-4">
                  <p className="font-body text-gray-900 text-sm font-medium">{tag}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <p className="font-body text-base leading-relaxed max-w-prose text-gray-700">
              {product.description}
            </p>

            {/* Price */}
            <div className="flex items-center gap-4">
              <p className="font-display text-4xl font-bold text-gray-900">{formatPrice(product.price)}</p>
              <p className="font-body text-lg font-medium text-gray-600">/ {product.size}</p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Quantity:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors"
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="w-10 text-center text-gray-900 font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex gap-3">
              <button 
                onClick={handleAddToCart}
                className={`flex flex-1 sm:flex-none max-w-sm items-center justify-center rounded-xl h-14 gap-2 text-lg font-medium px-8 transition-all duration-300 shadow-lg hover:shadow-xl ${
                  addedToCart 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-orange-500 hover:bg-orange-600'
                } text-white`}
              >
                <span className="material-symbols-outlined">
                  {addedToCart ? 'check' : 'add_shopping_cart'}
                </span>
                <span>{addedToCart ? 'Added to Cart!' : 'Add to Cart'}</span>
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`flex items-center justify-center rounded-xl h-14 w-14 transition-all duration-300 shadow-lg hover:shadow-xl ${
                  isInWishlist(product.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-orange-100 text-orange-500 hover:bg-orange-200'
                }`}
              >
                <span className="material-symbols-outlined">
                  {isInWishlist(product.id) ? 'favorite' : 'favorite_border'}
                </span>
              </button>
            </div>

            {/* Quick Links */}
            <div className="flex gap-4 mt-2">
              <Link to="/cart" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">shopping_cart</span>
                View Cart
              </Link>
              <Link to="/checkout" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">payments</span>
                Checkout
              </Link>
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="mt-12">
          <div className="bg-white/60 backdrop-blur-md border border-orange-200/30 rounded-xl p-6 lg:p-8 shadow-lg">
            <h2 className="font-display text-2xl font-bold mb-4 text-gray-900">Description</h2>
            <p className="font-body text-base leading-relaxed text-gray-700">
              {product.description} Inspired by the paradox of a world where technology and nature intertwine, 
              this fragrance is a testament to innovation in perfumery. The journey begins with a vibrant burst 
              of citrus notes, digitally enhanced to sparkle with an unprecedented crispness.
            </p>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mt-8">
          <div className="bg-white/60 backdrop-blur-md border border-orange-200/30 rounded-xl p-6 lg:p-8 shadow-lg">
            <h2 className="font-display text-2xl font-bold mb-6 text-gray-900">Reviews & Ratings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center justify-center gap-2 border-r-0 md:border-r border-gray-200 pr-0 md:pr-8">
                <p className="font-display text-6xl font-bold text-gray-900">{product.rating}</p>
                <div className="flex text-orange-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined">
                      {i < Math.floor(product.rating) ? 'star' : 'star_border'}
                    </span>
                  ))}
                </div>
                <p className="font-body text-sm text-gray-600">Based on {product.reviews?.toLocaleString()} reviews</p>
              </div>
              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                {[
                  { stars: 5, percent: 85 },
                  { stars: 4, percent: 10 },
                  { stars: 3, percent: 3 },
                  { stars: 2, percent: 1 },
                  { stars: 1, percent: 1 }
                ].map(({ stars, percent }) => (
                  <div key={stars} className="flex items-center gap-4">
                    <p className="font-body text-sm font-medium w-12 text-gray-700">{stars} star</p>
                    <div className="w-full bg-orange-100 rounded-full h-2.5">
                      <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                    <p className="font-body text-sm text-gray-600 w-10 text-right">{percent}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold mb-6 text-gray-900">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <Link key={relProduct.id} to={`/product/${relProduct.id}`}>
                  <div className="bg-white/60 backdrop-blur-md border border-orange-200/30 rounded-xl p-4 flex flex-col items-center text-center group transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="w-40 h-40 bg-center bg-no-repeat bg-cover mb-4 rounded-lg" 
                         style={{ backgroundImage: `url(${relProduct.img})` }}>
                    </div>
                    <h3 className="font-display text-gray-900 font-bold text-lg">{relProduct.name}</h3>
                    <p className="font-body text-sm text-gray-600">{relProduct.brand}</p>
                    <p className="font-display text-gray-900 font-semibold mt-2">{formatPrice(relProduct.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

export default ProductDetailPage;
