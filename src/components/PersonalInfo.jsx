import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

const PersonalInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { amount, items, donation, orderDetails, vendorEmail } = location.state || {};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleNext = async (e) => {
    e.preventDefault();

    const { fullName, email, phoneNumber, address } = userDetails;

    if (!fullName || !email || !phoneNumber || !address) {
      alert('Please fill in all the details.');
      return;
    }

    setIsLoading(true);

    // Navigate to the next page
    navigate('/waiting-room', {
      state: {
        amount,
        items,
        donation,
        paymentMethod,
        customerPhone: userDetails.phoneNumber,
        userDetails, // Pass userDetails to the next page
        orderDetails: {
          ...orderDetails,
          deliveryAddress: address,
        },
        vendorEmail, // Pass vendorEmail to the next page
      },
    });

    setIsLoading(false);
  };

  return (
    <div className="bg-black min-h-screen p-8">
      <div className="max-w-4xl mx-auto text-white">
        <h1 className="text-3xl font-mono font-bold mb-8">Personal Information</h1>

        <form className="space-y-6">
          {Object.entries(userDetails).map(([key, value]) => (
            <div key={key}>
              <label className="block text-white/70 mb-2">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</label>
              <input
                type={key === 'email' ? 'email' : 'text'}
                name={key}
                value={value}
                onChange={handleInputChange}
                className="w-full p-4 bg-black border border-white/20 text-white rounded"
                placeholder={`Enter your ${key}`}
                required
              />
            </div>
          ))}
        </form>

        <div className="border border-white/10 bg-black/90 p-6 mt-8">
          <h2 className="text-xl font-mono text-white mb-4">PAYMENT METHOD</h2>
          <div className="space-y-4">
            {['upi', 'card', 'cod'].map((method) => (
              <button
                key={method}
                className={`w-full p-4 border ${
                  paymentMethod === method
                    ? 'border-green-400 text-green-400'
                    : 'border-white/30 text-white/70 hover:border-white/50'
                } transition-colors uppercase font-mono flex items-center justify-between`}
                onClick={(e) => {
                  e.preventDefault();
                  setPaymentMethod(method);
                }}
              >
                <span>{method.toUpperCase()}</span>
                {paymentMethod === method && (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {items && items.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/20 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="text-white font-mono">Total: ₹{amount.toFixed(2)}</div>
              <button
                className="px-8 py-3 bg-green-500 text-black font-mono hover:bg-green-400 transition-colors flex items-center gap-2"
                onClick={handleNext}
                disabled={isLoading}
              >
                <MessageSquare className="w-4 h-4" />
                {isLoading ? 'Processing...' : 'NEXT'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfo;
