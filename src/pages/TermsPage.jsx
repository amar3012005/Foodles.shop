
import React, { useState } from 'react';

const TermsPage = () => {
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
    const newUnlocked = [...unlockedRestaurants, 9]; // Test restaurant ID
    setUnlockedRestaurants(newUnlocked);
    localStorage.setItem('unlockedRestaurants', JSON.stringify(newUnlocked));
    
    // Show success message
    alert('🎉 Test restaurant unlocked! You can now access TEST_RESTAURANT in the restaurant list.');
  };

  return (
    <div className="bg-black min-h-screen p-8 pb-32 relative">
      <div className="max-w-4xl mx-auto text-white">
        <h1 className="text-3xl font-mono font-bold mb-8">Terms & Policies</h1>

        <section className="text-white/70 space-y-4">
          <h2
            className="text-xl font-mono mb-2 cursor-pointer hover:text-white transition-colors duration-200 select-none"
            onClick={handleTermsClick}
            title="Click to unlock test restaurant"
          >
            Terms & Conditions
          </h2>
          <p className="text-sm">// ...your terms text goes here...</p>
          <p className="text-xs text-white/30 mt-2 italic">
            Click on the "Terms & Conditions" heading to unlock test restaurant
          </p>
        </section>

        <section className="text-white/70 space-y-4 mt-6">
          <h2 className="text-xl font-mono mb-2">Policies</h2>
          <p className="text-sm">// ...your policy text goes here...</p>
        </section>

        <section className="text-white/70 space-y-4 mt-6">
          <h2 className="text-xl font-mono mb-2">Contact Info</h2>
          <p className="text-sm">// ...contact information goes here...</p>
        </section>

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-900 rounded border border-gray-700">
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

export default TermsPage;