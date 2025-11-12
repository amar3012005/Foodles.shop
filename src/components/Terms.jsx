import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();
  const [unlockedRestaurants, setUnlockedRestaurants] = useState(() => {
    // Load unlocked restaurants from localStorage
    try {
      const saved = localStorage.getItem('unlockedRestaurants');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleTermsClick = () => {
    // Single click to unlock test restaurant
  const newUnlocked = Array.from(new Set([...unlockedRestaurants, 9])); // Test restaurant ID (avoid duplicates)
    setUnlockedRestaurants(newUnlocked);
    localStorage.setItem('unlockedRestaurants', JSON.stringify(newUnlocked));
    
    // Show success message
    alert('🎉 Test restaurant unlocked! You can now access TEST_RESTAURANT in the restaurant list.');
    // Notify other components in the same window (SPA) about the change
    try {
      window.dispatchEvent(new CustomEvent('unlockedRestaurantsChanged', { detail: newUnlocked }));
    } catch (e) {
      console.warn('Could not dispatch unlock event', e);
    }
  };

  useEffect(() => {
    console.log('Terms component mounted');
    document.title = 'Terms & Conditions';

    // Verify component mounted correctly
    const timer = setTimeout(() => {
      if (!document.querySelector('.terms-content')) {
        console.log('Terms component failed to mount properly');
        navigate('/', { replace: true });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="terms-content">
      {/* Grid Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(255,255,255,0.05)_1px),linear-gradient(transparent_24px,rgba(255,255,255,0.05)_1px)] bg-[size:25px_25px]" />
      </div>

      <div className="max-w-4xl mx-auto pt-32 p-8 relative z-10">
        <div className="space-y-8 text-white">
          <h1 className="text-3xl font-mono font-bold">
            <span className="opacity-100">TERMS</span>{' '}
            <span className="relative">
              & CONDITIONS
              <span className="absolute -inset-1 bg-white/10 -skew-x-12 -z-10" />
            </span>
          </h1>

          <section className="border border-white/10 bg-black/90 p-6">
            <h2 
              className="text-xl font-mono text-green-400 mb-4 cursor-pointer hover:text-white transition-colors duration-200 select-none"
              onClick={handleTermsClick}
              title="Click to unlock test restaurant"
            >
              Terms of Service
            </h2>
            <div className="space-y-4 text-white/70">
              <p>By using Foodles, you agree to the following terms:</p>
              <ul className="list-disc pl-4 space-y-2">
                <li>Orders can only be placed during restaurant operating hours</li>
                <li>Minimum order value may apply for delivery service</li>
                <li>Delivery times are approximate and may vary based on restaurant workload and location</li>
                <li>Order Confirmation Payment must be completed before order processing begins</li>
                <li>Cancellations are subject to restaurant approval and order status</li>
                <li>Restaurant status (open/closed) is subject to change without notice</li>
              </ul>
            </div>
            <p className="text-xs text-white/30 mt-4 italic">
              Click on the "Terms of Service" heading to unlock test restaurant
            </p>
          </section>

          <section className="border border-white/10 bg-black/90 p-6">
            <h2 className="text-xl font-mono text-green-400 mb-4">Delivery Policy</h2>
            <div className="space-y-4 text-white/70">
              <p>Our delivery service operates under these guidelines:</p>
              <ul className="list-disc pl-4 space-y-2">


        
                <li>Accurate delivery address must be provided</li>

                <li>Cash on delivery and online payment options available</li>
                <li>If you face any issue in order item specifications or delivery time , you can directly
                  contact the vendor.(vendor contact details are sent via order confirmation email.)
                </li>
              </ul>
            </div>
          </section>

          <section className="border border-white/10 bg-black/90 p-6">
            <h2 className="text-xl font-mono text-green-400 mb-4">Privacy & Data</h2>
            <div className="space-y-4 text-white/70">
              <p>We protect your information:</p>
              <ul className="list-disc pl-4 space-y-2">
                <li>Contact details are used only for order fulfillment</li>
                <li>Payment information is processed securely via Razorpay</li>
                <li>Email id & Phone number are used only for order delivery purpose.</li>
                <li>No personal data is shared with third parties</li>
              </ul>
            </div>
          </section>

          <section className="border border-white/10 bg-black/90 p-6">
            <h2 className="text-xl font-mono text-green-400 mb-4">Contact Information</h2>
            <div className="space-y-4 text-white/70">
              <p>For support and inquiries:</p>
              <ul className="list-none space-y-2">
                <li>Email: suppfoodles@gmail.com</li>
    
       
                <li>Location: KAMAND, HIMACHAL PRADESH</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-900 rounded border border-gray-700 max-w-4xl mx-auto">
            <h3 className="text-sm font-mono text-gray-400 mb-2">Debug Info (Development Only)</h3>
            <p className="text-xs text-gray-500">
              Unlocked Restaurants: {unlockedRestaurants.join(', ') || 'None'}<br/>
              Test Restaurant Unlocked: {unlockedRestaurants.includes(9) ? 'Yes' : 'No'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terms;