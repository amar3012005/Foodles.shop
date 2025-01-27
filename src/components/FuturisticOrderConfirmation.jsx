import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const FuturisticOrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId = '', total = 0, name = 'Customer', remainingPayment = 0 } = location.state || {};
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    console.log('Order Confirmation State:', location.state); // Debug log

    const stages = setTimeout(() => {
      setAnimationStage((prev) => (prev + 1) % 3);
    }, 1000);

    return () => clearTimeout(stages);
  }, [animationStage, location.state]);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 min-h-screen relative p-8 font-futuristic">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#222_1px,transparent_1px),linear-gradient(-45deg,#222_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      <div className="max-w-4xl mx-auto relative flex flex-col items-center justify-center min-h-screen" style={{ marginTop: '-100px' }}>
        <div className="flex items-center space-x-2 mb-8">
          <Check className="w-6 h-6 text-green-400 animate-pulse" />
          <h1 className="text-3xl font-mono font-bold text-white">
            ORDER CONFIRMED
          </h1>
        </div>

        <div className="text-3xl font-mono text-green-400 mb-8">
          Thank you, {name}!
        </div>

        <div className="bg-white bg-opacity-10 rounded-2xl p-8 mb-6 border border-white border-opacity-20 shadow-lg text-center backdrop-blur-lg">
          <p className="text-2xl font-mono mb-4 text-white tracking-wide">
            PLEASE PAY ₹{(total - remainingPayment).toLocaleString()} UPON DELIVERY
          </p>
          <div className="mb-8 text-gray-300 text-center">
            <p className="text-lg text-white/80">Your order is on its way!</p>
            <p className="text-base text-white/60">We'll notify you as we approach your location.</p>
          </div>
        </div>

        <div className="text-1xl font-mono text-green-300 mb-6">
          Order ID: #{orderId}
        </div>

        <button 
          onClick={handleBackToHome}
          className="py-2 px-4 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-900 hover:to-gray-700 border border-gray-600 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default FuturisticOrderConfirmation;

