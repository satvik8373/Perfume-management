import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useSettings } from '../context/SettingsContext';
import { useWishlist } from '../context/WishlistContext';
import Layout from '../components/Layout';
import Card from '../components/Card';

export default function ProductListingPage() {
  const { products, loading, getBrands, getCategories } = useProducts();
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedProductId, setAddedProductId] = useState(null);

  const brands = getBrands();
  const categories = getCategories();

  const handleQuickAdd = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    await addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      size: product.size || '100ml',
      img: product.img
    }, 1);
    
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const handleWishlistToggle = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

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
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-1/4 xl:w-1/5">
            <div className="lg:sticky lg:top-32">
              <Card className="p-4 lg:p-6 min-h-[500px] lg:min-h-[600px] flex flex-col justify-between">
                <div className="flex flex-col gap-6 lg:gap-8">
                  <div>
                    <h1 className="text-gray-900 text-lg font-bold">Filters</h1>
                    <p className="text-gray-600 text-sm mt-1">Refine your search</p>
                  </div>
                  
                  <div className="flex flex-col gap-4 lg:gap-6">
                    {/* Brand Filter */}
                    <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 lg:pb-6">
                      <details open>
                        <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium text-gray-900 hover:text-orange-500 transition-colors">
                          Brand
                          <span className="material-symbols-outlined text-orange-400">expand_more</span>
                        </summary>
                        <div className="pt-3 lg:pt-4 space-y-2 lg:space-y-3">
                          {brands.map(brand => (
                            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                              <input 
                                type="checkbox" 
                                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 focus:ring-offset-0" 
                              />
                              <p className="text-gray-600 text-sm group-hover:text-gray-900 transition-colors">{brand}</p>
                            </label>
                          ))}
                        </div>
                      </details>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 lg:pb-6">
                      <details open>
                        <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium text-gray-900 hover:text-orange-500 transition-colors">
                          Category
                          <span className="material-symbols-outlined text-orange-400">expand_more</span>
                        </summary>
                        <div className="pt-3 lg:pt-4 space-y-2 lg:space-y-3">
                          {categories.map(category => (
                            <label key={category} className="flex items-center gap-3 cursor-pointer group">
                              <input 
                                type="checkbox" 
                                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 focus:ring-offset-0" 
                              />
                              <p className="text-gray-600 text-sm group-hover:text-gray-900 transition-colors">{category}</p>
                            </label>
                          ))}
                        </div>
                      </details>
                    </div>

                    {/* Price Range */}
                    <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 lg:pb-6">
                      <details open>
                        <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium text-gray-900 hover:text-orange-500 transition-colors">
                          Price Range
                          <span className="material-symbols-outlined text-orange-400">expand_more</span>
                        </summary>
                        <div className="pt-3 lg:pt-4">
                          <div className="flex justify-between text-sm text-gray-900 mb-2">
                            <span>$50</span>
                            <span>$350</span>
                          </div>
                          <div className="h-2 bg-orange-100 rounded-full">
                            <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full w-3/4"></div>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
                <button className="flex w-full items-center justify-center rounded-xl h-12 px-4 bg-orange-500 hover:bg-orange-600 text-white text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                  Apply Filters
                </button>
              </Card>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="w-full lg:w-3/4 xl:w-4/5">
            <div className="flex flex-col gap-6 lg:gap-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Explore Our Collection</h1>
                  <p className="text-gray-600">Discover premium fragrances crafted for the modern connoisseur</p>
                </div>
                <select className="text-sm font-medium text-gray-600 bg-white/60 border border-gray-200 rounded-xl px-4 py-2 lg:py-3 backdrop-blur-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
                  <option>Sort by: Popularity</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {products.map(product => (
                  <Link key={product.id} to={`/product/${product.id}`} className="group">
                    <Card hover className="p-4 lg:p-6 h-full flex flex-col">
                      <div className="relative mb-4 overflow-hidden rounded-xl">
                        <img 
                          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          src={product.img} 
                          alt={product.name} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {/* Wishlist Button */}
                        <button 
                          onClick={(e) => handleWishlistToggle(e, product)}
                          className={`absolute top-3 lg:top-4 right-3 lg:right-4 flex items-center justify-center size-10 rounded-full transition-all duration-300 shadow-lg ${
                            isInWishlist(product.id) 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {isInWishlist(product.id) ? 'favorite' : 'favorite_border'}
                          </span>
                        </button>
                        {/* Add to Cart Button */}
                        <button 
                          onClick={(e) => handleQuickAdd(e, product)}
                          className={`absolute bottom-3 lg:bottom-4 right-3 lg:right-4 flex items-center justify-center size-10 lg:size-12 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg ${
                            addedProductId === product.id 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-orange-500 hover:bg-orange-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg lg:text-xl">
                            {addedProductId === product.id ? 'check' : 'add_shopping_cart'}
                          </span>
                        </button>
                      </div>
                      <div className="flex-grow flex flex-col">
                        <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{product.brand}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <p className="text-lg lg:text-xl font-bold text-orange-500">{formatPrice(product.price)}</p>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <span className="material-symbols-outlined text-sm">star</span>
                            <span className="text-sm text-gray-600">{product.rating}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center pt-6 lg:pt-8">
                <nav className="flex items-center gap-2">
                  <button className="flex items-center justify-center size-10 rounded-xl text-gray-600 hover:bg-white/60 hover:text-gray-900 transition-all duration-200 border border-gray-200">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button className="flex items-center justify-center size-10 rounded-xl text-white bg-orange-500 shadow-lg">1</button>
                  <button className="flex items-center justify-center size-10 rounded-xl text-gray-600 hover:bg-white/60 hover:text-gray-900 transition-all duration-200 border border-gray-200">2</button>
                  <button className="flex items-center justify-center size-10 rounded-xl text-gray-600 hover:bg-white/60 hover:text-gray-900 transition-all duration-200 border border-gray-200">3</button>
                  <button className="flex items-center justify-center size-10 rounded-xl text-gray-600 hover:bg-white/60 hover:text-gray-900 transition-all duration-200 border border-gray-200">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
