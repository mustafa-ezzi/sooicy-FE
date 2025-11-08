import React, { useRef, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const HomePage = ({
  products,
  categories,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  addToCart,
  setSelectedProduct,
  setCurrentPage
}) => {
  const scrollRef = useRef(null);
  const categoryRefs = useRef({});

  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    let autoScrollInterval;

    if (!isUserInteracting && scrollRef.current) {
      autoScrollInterval = setInterval(() => {
        const container = scrollRef.current;
        if (container) {
          const scrollAmount = 1;
          const maxScrollLeft = container.scrollWidth - container.clientWidth;

          if (container.scrollLeft >= maxScrollLeft) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            container.scrollLeft += scrollAmount;
          }
          checkScrollPosition();
        }
      }, 50);
    }

    return () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
      }
    };
  }, [isUserInteracting]);

  const handleMouseEnter = () => {
    setIsUserInteracting(true);
  };

  const handleMouseLeave = () => {
    setIsUserInteracting(false);
  };

  const handleScroll = () => {
    setIsUserInteracting(true);
    checkScrollPosition();

    setTimeout(() => {
      setIsUserInteracting(false);
    }, 3000);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [categories]);

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'scoop-whoop': 'scoop-whoop',
      'swirls': 'swirls',
      'tera-mera': 'tera-mera',
      'scoop & sip': 'scoop & sip',
      'slay-sundae': 'slay-sundae',
      'berry-berry': 'berry-berry',
      'rizzler-shake': 'rizzler-shake',
      "swirl's-top": "swirl's-top",
      'waffles': 'waffles',
      'sassy-pancakes': 'sassy-pancakes'
    };
    return categoryMap[category?.toLowerCase()] || category;
  };

  // Get category emoji
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'scoop-whoop': '🍦',
      'swirls': '🌀',
      'tera-mera': '🍨',
      'scoop & sip': '🥤',
      'slay-sundae': '🍧',
      'berry-berry': '🍓',
      'rizzler-shake': '🥛',
      "swirl's-top": '🍰',
      'waffles': '🧇',
      'sassy-pancakes': '🥞'
    };
    return emojiMap[category?.toLowerCase()] || '🍽️';
  };

  // Normalize category for comparison
const normalizeCategory = (cat) => {
  if (!cat) return '';
  return cat.toLowerCase().trim().replace(/[\s_]+/g, '-'); // replace spaces/underscores with dashes
};


  // Filter products based on search term and selected category
const filteredProducts = products.filter(product => {
  const normalizedProductCategory = normalizeCategory(product.category);
  const normalizedSelectedCategory = normalizeCategory(selectedCategory);

  const matchesSearch =
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesCategory =
    selectedCategory === 'All' ||
    normalizedProductCategory === normalizedSelectedCategory;

  // 🧠 Debug log — see comparisons in real time
  console.log({
    productName: product.name,
    productCategory: product.category,
    normalizedProductCategory,
    normalizedSelectedCategory,
    matchesCategory
  });

  return matchesSearch && matchesCategory;
});

  // Group products by category for visual separation
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" >
      {/* Hero Section */}
      <div
        className="relative py-12 sm:py-14 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrREjyCUXPqQujM3P5GalEDAUf9ZRu9eDXbQ&s')", // 👈 replace with your image path
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(255, 255, 255, 0.6)", // soft overlay for text readability
        }}
      >
        {/* Optional subtle gradient overlay for better contrast */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(227,244,253,0.9) 0%, rgba(255,245,249,0.85) 100%)",
            zIndex: 1,
          }}
        ></div>

        {/* Hero content */}
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center z-10">


          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: "#0486D2" }}
              />
              <input
                type="text"
                placeholder="Search for food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full border-2 focus:outline-none transition-all bg-white placeholder-gray-400 shadow-md"
                style={{
                  borderColor: "#0486D2",
                  color: "#F279AB",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">

        <div
          className="w-full mb-8 sm:mb-10 relative"
          style={{
            backgroundColor: '#1890f2',
            padding: '14px 0',
            width: '100vw',
            marginLeft: 'calc(50% - 50vw)',
            borderRadius: '0',
            position: 'sticky',
            top: 120,
            zIndex: 40,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="hidden sm:flex absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white shadow-md rounded-full p-2 transition-all hover:shadow-lg items-center justify-center"
              style={{ color: '#F279AB' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F279AB';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#F279AB';
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="hidden sm:flex absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white shadow-md rounded-full p-2 transition-all hover:shadow-lg items-center justify-center"
              style={{ color: '#0366A6' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0366A6';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#0366A6';
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Scrollable Categories */}
          <div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto px-4 sm:px-12 justify-center"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onScroll={handleScroll}
            onTouchStart={handleMouseEnter}
            onTouchEnd={handleMouseLeave}
          >
            {categories.map((category, index) => {
              const isSelected =
                normalizeCategory(selectedCategory) === normalizeCategory(category);
              return (
                <button
                  key={`${category}-${index}`}
                  onClick={() => {
                      const normalizedValue = category?.toLowerCase().trim();

  setSelectedCategory(normalizedValue);
                    setIsUserInteracting(true);
                    setTimeout(() => setIsUserInteracting(false), 2000);

                    const normalized = normalizeCategory(category);
                    const section = categoryRefs.current[normalized];
                    if (section) {
                      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}

                  className={`uppercase relative tracking-wide font-bold text-sm sm:text-base transition-all transform hover:scale-110 whitespace-nowrap ${isSelected ? 'text-[#F279AB]' : 'text-white'
                    }`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 12px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.color = 'white';
                  }}
                >
                  {category}

                  {/* Underline for active category */}
                  {isSelected && (
                    <span
                      className="absolute left-1/2 bottom-0 transform -translate-x-1/2 transition-all duration-300"
                      style={{
                        width: '60%',
                        height: '3px',
                        borderRadius: '2px',
                        background: '#F279AB',
                      }}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>



        {/* Products Grid - Grouped by Category */}
        {selectedCategory === 'All' ? (
          // Show all products grouped by category
          Object.keys(groupedProducts).map((category, idx) => (
            <div key={category}
              ref={(el) => (categoryRefs.current[normalizeCategory(category)] = el)} // 👈 attach ref
              className="mb-14 sm:mb-16">
              {/* Category Header - Enhanced Banner Style */}
              <div className="mb-6 sm:mb-8">
                <div className="relative rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl"
                  style={{ background: 'linear-gradient(135deg, #138BC9 0%, #0072ed 100%)' }}>
                  <div className="py-12 sm:py-16 lg:py-20 px-6 sm:px-8 text-center relative">
                    {/* Animated decorative circles */}
                    <div className="absolute top-4 left-4 sm:left-8 w-16 h-16 sm:w-20 sm:h-20 rounded-full opacity-20 bg-[#f279ab] animate-pulse"></div>
                    <div className="absolute bottom-4 right-4 sm:right-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full opacity-10 bg-[#f279ab] animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/4 w-12 h-12 sm:w-16 sm:h-16 rounded-full opacity-15 bg-white animate-pulse" style={{ animationDelay: '0.5s' }}></div>
test
                    {/* Gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>

                    {/* Category emoji badge */}
                    <div className="inline-block mb-3 sm:mb-4 text-5xl sm:text-6xl lg:text-7xl animate-bounce" style={{ animationDuration: '3s' }}>
                      {getCategoryEmoji(category)}
                    </div>

                    {/* Main category text */}
                    <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-wider relative z-10 transform transition-all duration-300 hover:scale-105"
                      style={{
                        color: '#f279ab',
                        textShadow: '4px 4px 12px rgba(0,0,0,0.4), 0 0 40px rgba(242, 121, 171, 0.3)',
                        letterSpacing: '0.15em',
                        fontFamily: 'Arial Black, sans-serif'
                      }}>
                      {getCategoryDisplayName(category).toUpperCase()}
                    </h3>

                    {/* Decorative underline */}
                    <div className="mt-4 sm:mt-6 flex justify-center">
                      <div className="w-24 sm:w-32 h-1.5 sm:h-2 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #f279ab, transparent)' }}></div>
                    </div>
                  </div>

                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-16 h-16 sm:w-24 sm:h-24 border-t-4 border-l-4 border-[#f279ab] opacity-30 rounded-tl-2xl sm:rounded-tl-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 border-b-4 border-r-4 border-[#f279ab] opacity-30 rounded-br-2xl sm:rounded-br-3xl"></div>
                </div>
              </div>

              {/* Products in this category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
                {groupedProducts[category].map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addToCart={addToCart}
                    setSelectedProduct={setSelectedProduct}
                    setCurrentPage={setCurrentPage}
                  />
                ))}
              </div>

              {/* Decorative separator */}
              {idx < Object.keys(groupedProducts).length - 1 && (
                <div className="mt-14 sm:mt-16 flex justify-center">
                  <div className="w-28 sm:w-32 h-1 rounded-full" style={{ background: 'linear-gradient(135deg, #F279AB 0%, #0486D2 100%)' }}></div>
                </div>
              )}
            </div>
          ))
        ) : (
          // Show filtered products for selected category
          <div>
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="flex-1 h-1 rounded" style={{ background: 'linear-gradient(to right, transparent, #F279AB)' }}></div>
                <div className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg mx-3 sm:mx-4 transform hover:scale-105 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #F279AB 0%, #0486D2 100%)' }}>
                  <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                    <span className="text-2xl sm:text-3xl">{getCategoryEmoji(selectedCategory)}</span>
                    <span>{getCategoryDisplayName(selectedCategory)}</span>
                  </h3>
                </div>
                <div className="flex-1 h-1 rounded" style={{ background: 'linear-gradient(to left, transparent, #0486D2)' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                  setSelectedProduct={setSelectedProduct}
                  setCurrentPage={setCurrentPage}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Products Found */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="text-5xl sm:text-6xl mb-4">🔍</div>
            <p className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: '#F279AB' }}>
              No products found matching your criteria
            </p>
            <p className="text-xs sm:text-sm mb-4 sm:mb-5" style={{ color: '#0486D2' }}>
              Selected: {selectedCategory} | Search: "{searchTerm}"
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="mt-2 sm:mt-4 px-6 sm:px-8 py-3 sm:py-4 text-white rounded-lg transition-all transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
              style={{ background: 'linear-gradient(135deg, #0486D2 0%, #0366A6 100%)' }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;