import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AboutSection = () => {
  const [activeSection, setActiveSection] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  // Sample restaurant data - replace with your actual data
  const restaurants = [
    {
      id: 1,
      name: "Cyber Spice",
      category: "Indian",
      rating: 4.5,
      deliveryTime: "30-40",
      image: "/images/alpha.jpg",
      tags: ["North Indian", "Biryani", "Trending"],
      vendorEmail: "amarsai2005@gmail.com",
      vendorPhone: "+916301805656"
    },
    {
      id: 2,
      name: "Digital Diner",
      category: "American",
      rating: 4.3,
      deliveryTime: "25-35",
      image: "/images/beta.jpg",
      tags: ["Burgers", "Fast Food", "Popular"],
      vendorEmail: "digitaldiner@example.com",
      vendorPhone: "1234567890"
    },
    {
      id: 3,
      name: "Neo Noodles",
      category: "Chinese",
      rating: 4.4,
      deliveryTime: "35-45",
      image: "/images/gamma.jpg",
      tags: ["Asian", "Noodles", "New"],
      vendorEmail: "neonoodles@example.com",
      vendorPhone: "1234567890"
    },
    // Add more restaurants as needed
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleRestaurantClick = (restaurant) => {
    navigate(`/menu/${restaurant.id}`, { state: { vendorEmail: restaurant.vendorEmail, vendorPhone: restaurant.vendorPhone } });
  };

  return (
    <div className="bg-black relative p-8 max-w-7xl mx-auto min-h-screen overflow-hidden">
      {/* Geometric background patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#111_1px,transparent_1px),linear-gradient(-45deg,#111_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#111_1px,transparent_1px),linear-gradient(90deg,#111_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
      </div>

      {/* Header */}
      <div className={`flex items-center space-x-4 mb-12 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <h2 className="text-3xl font-mono font-bold text-white">
          <span className="opacity-100">EXPLORE</span>{' '}
          <span className="relative">
            RESTAURANTS
            <span className="absolute -inset-1 bg-white/10 -skew-x-12 -z-10" />
          </span>
        </h2>
      </div>

      {/* Category Navigation */}
      <div className="flex space-x-4 mb-8 overflow-x-auto">
        {['all', 'Indian', 'Chinese', 'American'].map((category) => (
          <button 
            key={category}
            className={`px-6 py-2 rounded-none transition-all duration-300 border whitespace-nowrap ${
              activeSection === category 
                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                : 'bg-black border-white/30 text-white/70 hover:bg-white/10'
            }`}
            onClick={() => setActiveSection(category)}
          >
            <span className="font-mono">{category.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Restaurant Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {restaurants
          .filter(restaurant => activeSection === 'all' || restaurant.category === activeSection)
          .map((restaurant) => (
            <div 
              key={restaurant.id}
              className="relative group cursor-pointer border border-white/10 bg-black/90 hover:border-white/30 transition-all duration-300"
              onClick={() => handleRestaurantClick(restaurant)}
            >
              {/* Restaurant Image */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <img 
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Scanning effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute w-full h-2 bg-gradient-to-r from-transparent via-white/30 to-transparent top-0 -translate-y-full animate-scan" />
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-mono text-white">{restaurant.name}</h3>
                  <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1">
                    <span className="text-green-400">{restaurant.rating}</span>
                    <svg className="w-4 h-4 ztext-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>

                <div className="text-white/70 font-mono text-sm">
                  {restaurant.deliveryTime} mins delivery time
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {restaurant.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-white/5 text-white/50 text-xs font-mono">
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
          ))}
      </div>
    </div>
  );
};

export default AboutSection;