import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Papa from 'papaparse'; // For parsing CSV files

const Menu = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);

  const { vendorEmail } = location.state || {};
  const { vendorPhone } = location.state || {};

  console.log("Menu component rendered");

  // Load restaurant info and menu data from CSV
  useEffect(() => {
    if (!restaurantId) {
      navigate('/'); // Redirect to homepage if restaurantId is not present
    }

    const loadRestaurantData = async () => {
      try {
        console.log('Loading restaurant data for ID:', restaurantId);
        // Load restaurant info (you can store this in a separate file or database)
        const restaurantData = {
          1: { name: "Cyber Spice", image: "/images/restaurant1.jpg" },
          2: { name: "Digital Diner", image: "/images/restaurant2.jpg" },
          // Add more restaurants
        };
        setRestaurantInfo(restaurantData[restaurantId]);

        // Load menu items from CSV
        const response = await fetch(`/data/menu_${restaurantId}.csv`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            console.log('Parsed CSV data:', results.data);
            setMenuItems(results.data.map(item => ({
              ...item,
              price: parseFloat(item.price),
              quantity: 0
            })));
            setIsLoaded(true);
          }
        });
      } catch (error) {
        console.error('Error loading menu data:', error);
        setError(error.message);
      }
    };

    loadRestaurantData();
  }, [restaurantId, navigate]);

  const handleAddToCart = (itemId) => {
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: (item.quantity || 0) + 1 }
          : item
      )
    );
    setCartItems(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      const newItem = menuItems.find(item => item.id === itemId);
      return [...prevCart, { ...newItem, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId && item.quantity > 0
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
    setCartItems(prevCart => {
      const updatedCart = prevCart.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      return updatedCart.filter(item => item.quantity > 0);
    });
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!restaurantInfo || !menuItems.length) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="bg-black min-h-screen relative p-8" style={{ marginTop: '-100px' }}>

      {/* Background patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#111_1px,transparent_1px),linear-gradient(-45deg,#111_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#111_1px,transparent_1px),linear-gradient(90deg,#111_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Restaurant Header */}

        {restaurantInfo && (
          <div className={`mb-12 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative h-48 rounded-lg overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
   
              <h1 className="absolute bottom-6 left-6 text-4xl font-mono font-bold text-white" >
                {restaurantInfo.name}
              </h1>
            </div>
          </div>
        )}

        {/* Category Navigation */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          {categories.map((category) => (
            <button 
              key={category}
              className={`px-6 py-2 rounded-none transition-all duration-300 border whitespace-nowrap ${
                activeCategory === category 
                  ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                  : 'bg-black border-white/30 text-white/70 hover:bg-white/10'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              <span className="font-mono">{category.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems
            .filter(item => activeCategory === 'all' || item.category === activeCategory)
            .map((item) => (
              <div key={item.id} className="relative border border-white/10 bg-black/90 hover:border-white/30 transition-all duration-300">
                {/* Item Info */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-mono text-white">{item.name}</h3>
                    <div className="text-green-400 font-mono">₹{item.price}</div>
                  </div>

                  <p className="text-white/70 text-sm">{item.description}</p>

                  {/* Add to Cart Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="w-8 h-8 border border-white/30 text-white flex items-center justify-center hover:bg-white/10"
                        disabled={!item.quantity}
                      >
                        -
                      </button>
                      <span className="text-white font-mono">{item.quantity || 0}</span>
                      <button
                        onClick={() => handleAddToCart(item.id)}
                        className="w-8 h-8 border border-white/30 text-white flex items-center justify-center hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>
                    {item.quantity > 0 && (
                      <div className="text-green-400 font-mono">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/30" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/30" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/30" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/30" />
              </div>
            ))}
        </div>

        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/20 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="text-white font-mono">
                Total: ₹{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
              </div>
              <button 
                className="px-8 py-3 bg-green-500 text-black font-mono hover:bg-green-400 transition-colors"
                onClick={() => navigate('/checkout', { state: { cartItems, vendorEmail } }, { state: { cartItems, vendorPhone } })}
              >
                PROCEED TO CART
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;