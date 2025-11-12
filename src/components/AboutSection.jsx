import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Add categories array at the top of the component
const categories = ['all', 'Indian', 'Chinese', 'American', 'South Indian'];

const AboutSection = () => {
  const [activeSection, setActiveSection] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [restaurants, setRestaurants] = useState([
    {
      id: 2,
      name: "HIMALAYAN_CAFE",
      category: ["Chinese", "Indian"],
      rating: 4.5,
      deliveryTime: "30-40",
      image: "/images/beta.jpeg",
      tags: ["North Indian", "Biryani", "Trending"],
      vendorEmail: "yogeshthakur03839@gmail.com",
      vendorPhone: "+918278803839",
      operatingHours: {
        open: "00:00",  // 24/7
        close: "23:59"
      }
    },

    {
      id: 5,
      name: "PIZZA-BITE",
      category: ["American"],
      rating: 4.5,
      deliveryTime: "35-45",
      image: "/images/pi.jpeg",
      tags: ["Pizza", "Burgers", "New"],
      vendorEmail: "anshul3927@gmail.com",
      vendorPhone: "+919625970000",
      operatingHours: {
        open: "00:00",  // 24/7
        close: "23:59"
      }
    },

    {
      id: 3,
      name: "SONU_FOOD-POINT",
      category: ["Chinese", "Indian"], // Fix the category format
      rating: 4.4,
      deliveryTime: "35-45",
      image: "/images/gamma.jpeg",
      tags: ["North-Indian", "", ""],
      vendorEmail: "sunil62948@gmail.com",
      vendorPhone: "+919882262948",
      operatingHours: {
        open: "00:00",  // 24/7
        close: "23:59"
      }
    },

    {
      id: 1,
      name: "BABAJI_FOOD-POINT",
      category: ["Chinese", "Indian"],
      rating: 4.5,
      deliveryTime: "30-40",
      image: "/images/alpha.jpeg",
      tags: ["North Indian", "Chinese", "Trending"],
      vendorEmail: "gulabsingh93732@gmail.com",
      vendorPhone: "+919373290270",
      operatingHours: {
        open: "00:00",  // 24/7
        close: "23:59"
      }
    },

    {
      id: 4,
      name: "JEEVA_FOOD-POINT",
      category: ["Chinese", "Indian"],
      rating: 4.4,
      deliveryTime: "35-45",
      image: "/images/delta.jpeg",
      tags: ["Chinese", "Indian", "Trending"],
      vendorEmail: "panchhithakur0@gmail.com",
      vendorPhone: "+917018596320",
      operatingHours: {
        open: "00:00",  // 24/7
        close: "23:59"
      }
    },

    {
      id: 6,
      name: "NORTHERN_CAFE",
      category: ["Indian", "Chinese"],
      rating: 4.3,
      deliveryTime: "25-35",
      image: "/images/alpha.jpeg", // Using existing image, you can replace with specific image
      tags: ["North Indian", "Coffee", "Fast Food"],
      vendorEmail: "northerncafe@gmail.com",
      vendorPhone: "+919876543210",
      operatingHours: {
        open: "00:00",  // 24/7
        close: "23:59"
      }
    },

    {
      id: 7,
      name: "FRUIT_BAKERY",
      category: ["American"],
      rating: 4.6,
      deliveryTime: "20-30",
      image: "/images/beta.jpeg", // Using existing image, you can replace with specific image
      tags: ["Bakery", "Desserts", "Fresh Fruits"],
      vendorEmail: "fruitbakery@gmail.com",
      vendorPhone: "+919876543211",
      operatingHours: {
        open: "00:00",  // 24/7
        close: "23:59"
      }
    },

    {
      id: 8,
      name: "AYODHYA_RESTAURANT",
      category: ["Indian", "South Indian"],
      rating: 4.7,
      deliveryTime: "30-40",
      image: "/images/gamma.jpeg", // Using existing image, you can replace with specific image
      tags: ["South Indian", "Traditional", "Vegetarian"],
      vendorEmail: "ayodhyarestaurant@gmail.com",
      vendorPhone: "+919876543212",
      operatingHours: {
        open: "00:00",  // 24/7
        close: "23:59"
      }
    },

    {
      id: 9,
      name: "TEST_RESTAURANT",
      category: ["Test Items"],
      rating: 5.0,
      deliveryTime: "1-5",
      image: "/images/beta.jpeg", // Using existing image for test
      tags: ["Test", "Development", "Hidden"],
      vendorEmail: "amarsai2005@gmail.com",
      vendorPhone: "+916301805656",
      operatingHours: {
        open: "00:00",  // 24/7
        close: "23:59"
      },
      isHidden: true, // Mark as hidden initially
      unlockRequired: 1 // Single click to unlock
    }

  ]);
  const [lastStatusCheck, setLastStatusCheck] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [unlockedRestaurants, setUnlockedRestaurants] = useState(() => {
    // Load unlocked restaurants from localStorage
    try {
      const saved = localStorage.getItem('unlockedRestaurants');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Listen for unlock changes triggered elsewhere in the SPA or other tabs
  useEffect(() => {
    const onUnlockEvent = (e) => {
      try {
        const newUnlocked = e?.detail ?? JSON.parse(localStorage.getItem('unlockedRestaurants') || '[]');
        setUnlockedRestaurants(Array.isArray(newUnlocked) ? newUnlocked : []);
        console.log('Unlocked restaurants updated from event:', newUnlocked);
      } catch (err) {
        console.error('Error handling unlock event:', err);
      }
    };

    const onStorage = (e) => {
      if (e.key === 'unlockedRestaurants') {
        try {
          const newUnlocked = JSON.parse(e.newValue || '[]');
          setUnlockedRestaurants(Array.isArray(newUnlocked) ? newUnlocked : []);
          console.log('Unlocked restaurants updated from storage event:', newUnlocked);
        } catch (err) {
          console.error('Error parsing unlockedRestaurants from storage event:', err);
        }
      }
    };

    window.addEventListener('unlockedRestaurantsChanged', onUnlockEvent);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('unlockedRestaurantsChanged', onUnlockEvent);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  const [unlockAttempts, setUnlockAttempts] = useState(() => {
    // Load unlock attempts from localStorage
    try {
      const saved = localStorage.getItem('unlockAttempts');
      return saved ? JSON.parse(saved) : { count: 0, timestamp: null };
    } catch {
      return { count: 0, timestamp: null };
    }
  });
  const navigate = useNavigate();

  // Add reconnection attempt tracking (use refs to avoid state closure issues)
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const maxReconnectAttempts = 5;
  const wsRef = useRef(null);
  const manualCloseRef = useRef(false);

  // Add API endpoint config
  const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://foodles-backend-lpzp.onrender.com'
    : 'http://localhost:5000';

  useEffect(() => {
    setIsLoaded(true);
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Add initialization from prefetched data
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('prefetchedStatus');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        // Use cached data if less than 10 seconds old
        if (age < 10000 && data.statuses) {
          console.log('Using prefetched restaurant status');
          setRestaurants(prevRestaurants => 
            prevRestaurants.map(restaurant => ({
              ...restaurant,
              isForceClose: !data.statuses[restaurant.id]?.isOpen,
              statusMessage: data.statuses[restaurant.id]?.message || 'Status Unknown',
              lastChecked: data.metadata?.lastChecked
            }))
          );
          setLastStatusCheck(data.metadata?.lastChecked);
        }
      }
    } catch (error) {
      console.error('Error using prefetched data:', error);
    }
  }, []); // Run once on mount

  // Add initialization effect
  useEffect(() => {
    const initializeStatuses = async () => {
      try {
        setIsRefreshing(true);
        const response = await fetch('/api/restaurants/status/init');
        const data = await response.json();
        console.log('Initial restaurant statuses:', data);
        
        if (data.statuses) {
          setRestaurants(prevRestaurants => 
            prevRestaurants.map(restaurant => ({
              ...restaurant,
              isForceClose: !data.statuses[restaurant.id]?.isOpen,
              statusMessage: data.statuses[restaurant.id]?.message || 'Status Unknown',
              lastChecked: data.metadata?.lastChecked
            }))
          );
          setLastStatusCheck(data.metadata?.lastChecked);
        }
      } catch (error) {
        console.error('Failed to initialize restaurant statuses:', error);
        setStatusError('Failed to load restaurant statuses');
      } finally {
        setIsRefreshing(false);
      }
    };

    initializeStatuses();
  }, []); // Run only on mount

  // Update the status fetching logic
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsRefreshing(true);
        const response = await fetch(`${API_URL}/api/restaurants/status`);
        const data = await response.json();
        
        console.log('Restaurant status update:', {
          data,
          timestamp: new Date().toISOString()
        });

        if (data.statuses) {
          setRestaurants(prevRestaurants => 
            prevRestaurants.map(restaurant => {
              const status = data.statuses[restaurant.id];
              console.log(`Status for ${restaurant.name}:`, status);
              
              return {
                ...restaurant,
                isForceClose: !status?.isOpen,
                statusMessage: status?.message || 'Status Unknown',
                lastChecked: data.metadata?.lastChecked,
                debug: status?.debug // Store debug info
              };
            })
          );
          setLastStatusCheck(data.metadata?.lastChecked);
          setStatusError(null);
        }
      } catch (error) {
        console.error('Failed to fetch restaurant statuses:', error);
        setStatusError('Connection error');
      } finally {
        setIsRefreshing(false);
      }
    };

    // Initial fetch
    fetchStatus();
    
    // Poll every 5 seconds
    const intervalId = setInterval(fetchStatus, 5000);
    return () => clearInterval(intervalId);
  }, [API_URL]);

  // Modify WebSocket connection handling (use refs for attempts and timers)
  const connectWebSocket = useCallback(() => {
    const wsUrl = process.env.NODE_ENV === 'production'
      ? 'wss://foodles-backend-lpzp.onrender.com'
      : 'ws://localhost:5000';

    // If an existing socket exists, ensure it's cleaned up first
    if (wsRef.current) {
      try {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        wsRef.current.close();
      } catch (e) {
        // ignore close errors
      }
      wsRef.current = null;
    }

    // Avoid attempting to reconnect if component asked to stop
    if (manualCloseRef.current) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('🟢 WebSocket Connected');
      setWsConnected(true);
      reconnectAttemptsRef.current = 0;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📡 Received websocket data:', data);

        if (data.type === 'STATUS_UPDATE') {
          setRestaurants(prevRestaurants => 
            prevRestaurants.map(restaurant => {
              const change = data.changes.find(c => c.restaurantId === restaurant.id.toString());
              if (change) {
                console.log(`Updating restaurant ${restaurant.id} status:`, change);
                return {
                  ...restaurant,
                  isForceClose: change.newStatus !== '1',
                  statusMessage: change.newStatus === '1' ? 'Open' : 'Temporarily Closed',
                  lastChecked: data.timestamp
                };
              }
              return restaurant;
            })
          );
          setLastStatusCheck(data.timestamp);
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.onerror = (event) => {
      // Event objects are not always serializable; log useful fields
      console.error('WebSocket error:', {
        message: event?.message || 'WebSocket error event',
        type: event?.type
      });
      setWsConnected(false);
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed', { code: event?.code, reason: event?.reason });
      setWsConnected(false);

      if (manualCloseRef.current) return; // don't reconnect if intentionally closed

      const attempts = reconnectAttemptsRef.current || 0;
      if (attempts < maxReconnectAttempts) {
        const timeout = Math.min(1000 * Math.pow(2, attempts), 10000);
        console.log(`Reconnecting in ${timeout}ms (attempt ${attempts + 1})`);
        reconnectTimerRef.current = setTimeout(() => {
          reconnectAttemptsRef.current = (reconnectAttemptsRef.current || 0) + 1;
          connectWebSocket();
        }, timeout);
      } else {
        console.warn('Max WebSocket reconnect attempts reached');
      }
    };

    return () => {
      // cleanup when caller asks
      try {
        manualCloseRef.current = true;
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
        if (wsRef.current) {
          wsRef.current.onopen = null;
          wsRef.current.onmessage = null;
          wsRef.current.onerror = null;
          wsRef.current.onclose = null;
          wsRef.current.close();
          wsRef.current = null;
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Use the new WebSocket connection function
  useEffect(() => {
    const cleanup = connectWebSocket();
    return cleanup;
  }, [connectWebSocket]);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    
    try {
      const response = await fetch('/api/restaurants/status');
      const data = await response.json();
      
      if (data.statuses) {
        setRestaurants(prevRestaurants => 
          prevRestaurants.map(restaurant => ({
            ...restaurant,
            isForceClose: !data.statuses[restaurant.id]?.isOpen,
            statusMessage: data.statuses[restaurant.id]?.message,
            lastChecked: data.metadata?.lastChecked
          }))
        );
        setLastStatusCheck(data.metadata?.lastChecked);
        setStatusError(null);
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
      setStatusError('Refresh failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const isRestaurantOpen = (restaurant) => {
    if (restaurant.isForceClose) {
      return false;
    }
    const now = currentTime;
    const [openHour, openMinute] = restaurant.operatingHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = restaurant.operatingHours.close.split(':').map(Number);
    
    const openTime = new Date(now).setHours(openHour, openMinute, 0);
    const closeTime = new Date(now).setHours(closeHour, closeMinute, 0);
    const currentTimeMs = now.getTime();

    return currentTimeMs >= openTime && currentTimeMs <= closeTime;
  };

  // Update the restaurant click handler to respect force close
  const handleRestaurantClick = (restaurant) => {
    if (restaurant.isForceClose) {
      console.log('Restaurant is force closed:', restaurant.name);
      return;
    }

    // Handle unlock mechanism for hidden restaurants
    if (restaurant.isHidden && !unlockedRestaurants.includes(restaurant.id)) {
      const now = Date.now();
      const timeWindow = 5000; // 5 seconds window for consecutive presses
      
      // Check if we're within the time window
      if (unlockAttempts.timestamp && (now - unlockAttempts.timestamp) > timeWindow) {
        // Reset counter if too much time has passed
        setUnlockAttempts({ count: 1, timestamp: now });
      } else {
        // Increment counter
        const newCount = unlockAttempts.count + 1;
        setUnlockAttempts({ count: newCount, timestamp: now });
        
        // Check if we've reached the unlock threshold
        if (newCount >= (restaurant.unlockRequired || 5)) {
          // Unlock the restaurant
          const newUnlocked = [...unlockedRestaurants, restaurant.id];
          setUnlockedRestaurants(newUnlocked);
          localStorage.setItem('unlockedRestaurants', JSON.stringify(newUnlocked));
          localStorage.setItem('unlockAttempts', JSON.stringify({ count: 0, timestamp: null }));
          
          // Show success message
          console.log(`🎉 Test restaurant ${restaurant.name} unlocked!`);
          alert(`🎉 Test restaurant unlocked! You can now access ${restaurant.name}`);
          
          // Reset attempts
          setUnlockAttempts({ count: 0, timestamp: null });
          return;
        }
      }
      
      // Save attempts to localStorage
      localStorage.setItem('unlockAttempts', JSON.stringify(unlockAttempts));
      
      // Show progress message
      const remaining = (restaurant.unlockRequired || 5) - unlockAttempts.count - 1;
      if (remaining > 0) {
        console.log(`🔒 Press "Order Now" ${remaining} more times to unlock ${restaurant.name}`);
        // Optional: Show a subtle hint to the user
      }
      return;
    }

    if (isRestaurantOpen(restaurant)) {
      // Log restaurant selection
      fetch(`${API_URL}/api/log-restaurant-selection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          timestamp: new Date().toISOString()
        })
      }).catch(error => console.error('Logging error:', error));

      // Navigate to menu
      navigate(`/menu/${restaurant.id}`, {
        state: {
          vendorEmail: restaurant.vendorEmail,
          vendorPhone: restaurant.vendorPhone?.replace(/\D/g, ''),
          restaurantId: restaurant.id.toString(),
          restaurantName: restaurant.name
        }
      });
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatLastChecked = (timestamp) => {
    if (!timestamp) return 'Checking...';
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid time';
    }
  };

  // Update the getStatusDisplay function to properly use isForceClose
  const getStatusDisplay = (restaurant) => {
    console.log('Checking status for:', {
      name: restaurant.name,
      isForceClose: restaurant.isForceClose,
      debug: restaurant.debug
    });

    // Handle hidden restaurants
    if (restaurant.isHidden && !unlockedRestaurants.includes(restaurant.id)) {
      return {
        text: 'LOCKED',
        classes: 'bg-purple-900/60 text-purple-100'
      };
    }

    if (restaurant.isForceClose) {
      return {
        text: 'DELIVERY UNAVAILABLE',
        classes: 'bg-red-900/60 text-red-100'
      };
    }

    const isOpen = isRestaurantOpen(restaurant);
    return {
      text: isOpen ? 'OPEN' : 'CLOSED',
      classes: isOpen ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
    };
  };

  // Update the category click handler
  const handleCategoryClick = (category) => {
    setActiveSection(category);
  };

  // Add status indicator in the UI
  const ConnectionStatus = () => (
    <div className={`fixed bottom-4 left-4 flex items-center space-x-2 
      ${wsConnected ? 'text-green-400' : 'text-yellow-400'}`}>
      <div className={`w-2 h-2 rounded-full ${wsConnected ? 
        'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
      <span className="text-xs font-mono">
        {wsConnected ? 'LIVE' : 'Connecting...'}
      </span>
    </div>
  );

  // Add status debug panel (can be removed in production)
  const StatusDebugPanel = () => (
    <div className="fixed bottom-4 left-4 bg-black/80 p-4 rounded-lg border border-gray-800 text-xs font-mono">
      <div className="text-green-400">Status Monitor</div>
      <div className="text-gray-400 mt-2">
        Last Check: {formatLastChecked(lastStatusCheck)}
      </div>
      <div className="text-gray-400">
        Websocket: {wsConnected ? '🟢' : '🔴'}
      </div>
    </div>
  );

  return (
    <div className="bg-black relative p-4 sm:p-8 pb-32 max-w-7xl mx-auto min-h-screen overflow-hidden">
      {/* Add StatusDebugPanel in development */}
      {process.env.NODE_ENV === 'development' && <StatusDebugPanel />}
      
      {/* Add ConnectionStatus component */}
      <ConnectionStatus />
      
      {/* Previous background patterns and header remain the same */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#242_1px,transparent_1px),linear-gradient(-45deg,#111_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#222_1px,transparent_1px),linear-gradient(90deg,#111_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
      </div>

      {/* Header */}
      <div className={`flex items-center space-x-4 mb-8 sm:mb-12 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white">
          <span className="opacity-100">EXPLORE</span>{' '}
          <span className="relative">
            RESTAURANTS (NORTH-CAMPUS)
          
            <span className="absolute -inset-1 bg-white/10 -skew-x-12 -z-10" />
          </span>
        </h2>
      </div>

      {/* Category Navigation */}
      <div className="relative">
        <div className="flex space-x-4 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex space-x-2 md:space-x-4 min-w-full sm:min-w-0">
            {categories.map((category) => (
              <button 
                key={category}
                className={`px-4 sm:px-6 py-2 rounded-none transition-all duration-300 border whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                  activeSection === category 
                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                    : 'bg-black border-white/30 text-white/70 hover:bg-white/10'
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                <span className="font-mono">{category.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Fade indicators for scroll */}
        <div className="absolute left-0 top-0 bottom-0 w-0 bg-gradient-to-r from-black to-transparent pointer-events-none sm:hidden" />
        <div className="absolute right-0 top-0 bottom-0 w-0 bg-gradient-to-l from-black to-transparent pointer-events-none sm:hidden" />
      </div>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {restaurants
          .filter(restaurant => 
            // Filter by category
            (activeSection === 'all' || 
            (Array.isArray(restaurant.category) 
              ? restaurant.category.map(cat => cat.toLowerCase()).includes(activeSection.toLowerCase())
              : restaurant.category.toLowerCase() === activeSection.toLowerCase()))
            &&
            // Filter out hidden restaurants that aren't unlocked
            (!restaurant.isHidden || unlockedRestaurants.includes(restaurant.id))
          )
          .map((restaurant) => {
            const isOpen = isRestaurantOpen(restaurant);
            const status = getStatusDisplay(restaurant);
            return (
              <div 
                key={restaurant.id}
                className={`relative group cursor-pointer border border-white/10 bg-black/90 
                  ${isOpen && (!restaurant.isHidden || unlockedRestaurants.includes(restaurant.id)) ? 'hover:border-white/30' : 'opacity-75'} 
                  transition-all duration-300`}
                onClick={() => handleRestaurantClick(restaurant)}
              >
                {/* Restaurant Image */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                  <img 
                    src={restaurant.image}
                    alt={restaurant.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/path/to/default/image.jpg' }}
                    className={`w-full h-full object-cover transition-transform duration-300 
                      ${isOpen && (!restaurant.isHidden || unlockedRestaurants.includes(restaurant.id)) ? 'group-hover:scale-110' : 'grayscale'}`}
                  />
                  
                  {/* Updated Status Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 font-mono text-sm z-20 ${status.classes}`}>
                    {status.text}
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-mono text-white">{restaurant.name}</h3>
                    <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1">
                      <span className="text-green-400">{restaurant.rating}</span>
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>

                  <div className="text-white/70 font-mono text-sm space-y-2">
                    <div>{restaurant.deliveryTime} mins delivery time</div>
                    <div className="text-xs">
                      Hours: {formatTime(restaurant.operatingHours.open)} - {formatTime(restaurant.operatingHours.close)}
                    </div>
                  </div>

                  {/* Tags (filter out empty tags and use stable keys) */}
                  <div className="flex flex-wrap gap-2">
                    {(restaurant.tags || []).filter(Boolean).map((tag, idx) => (
                      <span key={`${restaurant.id}-tag-${idx}`} className="px-2 py-1 bg-white/5 text-white/50 text-xs font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Geometric corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/30" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/30" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/30" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/30" />
              </div>
            );
          })}
      </div>

      {/* Status error message */}
      {statusError && (
        <div className="fixed top-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded font-mono text-sm">
          {statusError}
        </div>
      )}

      {/* Fix the refresh button and last checked time */}
      <div className="fixed bottom-4 right-4 flex items-center space-x-4">
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className={`text-xs text-white/50 font-mono hover:text-white/70 transition-colors
            ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRefreshing ? 'Refreshing...' : '⟳ Refresh'}
        </button>
        <div className="text-xs text-white/50 font-mono">
          Last checked: {formatLastChecked(lastStatusCheck)}
        </div>
      </div>
    </div>
  );
};

export default AboutSection;