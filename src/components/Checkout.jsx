import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [dogDonation, setDogDonation] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');

  // Constants for additional charges
  const DELIVERY_FEE = 15;
  const CONVENIENCE_FEE = 5;

  useEffect(() => {
    // Get cart items from location state
    if (location.state?.cartItems) {
      setCartItems(location.state.cartItems);
    }
    if (location.state?.vendorEmail) {
      setVendorEmail(location.state.vendorEmail);
    }
    if (location.state?.vendorPhone) {
      setVendorPhone(location.state.vendorPhone);
    }
    setIsLoaded(true);
  }, [location]);

  // Calculate subtotal from cart items
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate grand total including all charges and donation
  const grandTotal = subtotal + DELIVERY_FEE + (dogDonation > 0 ? 0 : CONVENIENCE_FEE) + dogDonation;

  const handleDonationChange = (amount) => {
    setDogDonation(amount);
  };

  const handleCheckout = () => {
    const orderDetails = {
      items: cartItems,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      convenienceFee: dogDonation > 0 ? 0 : CONVENIENCE_FEE,
      dogDonation,
      grandTotal,
      vendorEmail,
      vendorPhone
    };

    navigate('/personal-info', { 
      state: { 
        amount: grandTotal,
        items: cartItems,
        donation: dogDonation,
        orderDetails,
        vendorEmail,
        vendorPhone
      }
    });
  };

  return (
    <div className="bg-black min-h-screen relative p-8">
      {/* Background patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#111_1px,transparent_1px),linear-gradient(-45deg,#111_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#111_1px,transparent_1px),linear-gradient(90deg,#111_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div className={`mb-12 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <h1 className="text-3xl font-mono font-bold text-white">CHECKOUT</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="border border-white/10 bg-black/90 p-6">
              <h2 className="text-xl font-mono text-white mb-4">ORDER SUMMARY</h2>
              
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-white/70 mb-2">
                  <span>{item.quantity}x {item.name}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Delivery Fee</span>
                  <span>₹{DELIVERY_FEE.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Convenience Fee</span>
                  <span className={dogDonation > 0 ? 'line-through' : ''}>₹{CONVENIENCE_FEE.toFixed(2)}</span>
                </div>
                {dogDonation > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Dog Donation</span>
                    <span>₹{dogDonation.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 mt-4 pt-4">
                <div className="flex justify-between text-white font-bold">
                  <span>GRAND TOTAL</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Dog Donation Section */}
            <div className="border border-white/10 bg-black/90 p-6">
              <h2 className="text-xl font-mono text-white mb-4">HELP A STRAY DOG</h2>
              <div className="grid grid-cols-3 gap-4">
                {[10, 20, 30].map((amount) => (
                  <button
                    key={amount}
                    className={`p-4 border ${
                      dogDonation === amount 
                        ? 'border-green-400 text-green-400' 
                        : 'border-white/30 text-white/70 hover:border-white/50'
                    } transition-colors`}
                    onClick={() => handleDonationChange(amount)}
                  >
                    +₹{amount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          
        </div>
      </div>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/20 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-white font-mono">
              Total: ₹{grandTotal.toFixed(2)}
            </div>
            <button 
              className="px-8 py-3 bg-green-500 text-black font-mono hover:bg-green-400 transition-colors"
              onClick={handleCheckout}
            >
              NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;