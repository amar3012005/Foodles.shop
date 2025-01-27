import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';


const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      // Handle scroll event if needed
    };
    window.addEventListener('scroll', handleScroll);
    
    // Trigger entrance animations
    setTimeout(() => setIsLoaded(true), 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAboutClick = () => {
    navigate('/about');
  };

  return (
    <div className="relative h-screen overflow-hidden bg-black" style={{ marginTop: '-100px' }}>

      {/* Background GIF */}
      <div 
        className="absolute inset-0 bg-cover bg-center w-full h-full"
        style={{ backgroundImage: `url('/images/FOODLES1.gif')`, backgroundSize: '500px', backgroundRepeat: 'no-repeat' }}
      >
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
      </div>

      {/* Pop-up GIF */}
      <div 
        className={`absolute top-3/4 left-1/2 transform -translate-x-1/2 cursor-pointer transition-transform duration-1000 ease-out ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-40 opacity-0'
        }`}
        onClick={handleAboutClick}
      >
        <img 
          src="/images/ORDER.gif" 
          alt="Order Now"
          className="w-30 h-10 animate-slide-up" 
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#111_1px,transparent_1px),linear-gradient(-45deg,#111_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
      </div>
    </div>
  );
};

const FuturisticHomepage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main content 1 */}
         {/* Main content 2 */}
      <div className="pt-24"style={{ marginTop: '-100px' }}>
        <Hero />
      </div>
    </div>
  );
};

export default FuturisticHomepage;