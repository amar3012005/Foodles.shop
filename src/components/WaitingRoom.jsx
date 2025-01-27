import React, { useState, useEffect } from 'react';
import { AlertCircle, CreditCard } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const WaitingRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dots, setDots] = useState('');
  const [timeLeft, setTimeLeft] = useState(150);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Destructure order data from location state
  const { 
    items, 
    userDetails, 
    orderDetails, 
    onPayNow,
    vendorEmail // Destructure vendorEmail from location state
  } = location.state || {};

  // Calculate remaining payment
  const remainingPayment = orderDetails.grandTotal - orderDetails.subtotal;

  // Generate a 3-digit order ID
  const orderId = `AS_${Math.floor(100 + Math.random() * 900)}`; // Generate a formatted order ID

  // Display the order ID as `#AS_` followed by a 3-digit number
  const displayOrderId = `#${orderId}`;

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          setRazorpayLoaded(false);
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(dotInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const fetchRazorpayKey = async () => {
    try {
      const response = await axios.get('http://localhost:5000/razorpay-key');
      return response.data.key;
    } catch (error) {
      console.error('Failed to fetch Razorpay key:', error);
      throw new Error('Failed to fetch Razorpay key');
    }
  };

  const handlePayNow = async () => {
    console.log('handlePayNow called'); // Debug log
    try {
      // Check if Razorpay script is loaded
      if (!razorpayLoaded) {
        alert('Razorpay payment gateway is still loading. Please try again.');
        return;
      }

      // Create Razorpay order
      const orderResponse = await axios.post('http://localhost:5000/payment/create-order', { amount: remainingPayment });
      console.log('Order created:', orderResponse.data); // Debug log

      const razorpayKey = await fetchRazorpayKey();
      console.log('Fetched Razorpay key:', razorpayKey); // Debug log

      const options = {
        key: razorpayKey,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: "Foodles",
        description: "Order Payment",
        order_id: orderResponse.data.id,
        handler: async (response) => {
          console.log('Payment handler called:', response); // Debug log
          const verifyResponse = await axios.post('http://localhost:5000/payment/verify-payment', {
            ...response,
            name: userDetails.fullName,
            email: userDetails.email,
            orderDetails: JSON.stringify(orderDetails),
            orderId, // Pass orderId to the backend
            vendorEmail // Pass vendorEmail to the backend
          });
          if (verifyResponse.data.verified) {
            alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
            // Call the onPayNow callback passed from parent component
            if (onPayNow) {
              onPayNow({
                orderId,
                subtotal: orderDetails.subtotal,
                grandTotal: orderDetails.grandTotal,
                remainingPayment,
                items,
                userDetails
              });
            }
            navigate('/order-confirmation', {
              state: {
                orderId,
                total: orderDetails.grandTotal,
                name: userDetails.fullName,
                remainingPayment // Pass remainingPayment to the next page
              }
            });
          } else {
            alert('Payment verification failed');
            navigate('/payment-failure', {
              state: {
                errorMessage: 'Payment verification failed',
                paymentId: response.razorpay_payment_id,
              }
            });
          }
        },
        prefill: {
          name: userDetails.fullName,
          email: userDetails.email,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function (response) {
        navigate('/payment-failure', {
          state: { 
            errorMessage: response.error.description,
            errorCode: response.error.code
          }
        });
      });
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert('Failed to initialize payment. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 min-h-screen relative p-8">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#222_1px,transparent_1px),linear-gradient(-45deg,#222_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      <div className="max-w-4xl mx-auto relative flex flex-col items-center justify-center min-h-screen" style={{ marginTop: '-100px' }}>
        <div className="flex items-center space-x-2 mb-8">
          <AlertCircle className="w-6 h-6 text-green-400 animate-pulse" />
          <h1 className="text-2xl font-mono font-bold text-white">
            AWAITING ORDER CONFIRMATION{dots}
          </h1>
        </div>

        <div className="text-4xl font-mono text-green-400 mb-8">
          {formatTime(timeLeft)}
        </div>

        <button 
          onClick={handlePayNow}
          className="flex items-center justify-center bg-green-600 text-black px-4 py-2  hover:bg-green-900 transition-colors mb-2"
        >
          <CreditCard className="mr-2" /> Pay ₹{remainingPayment} Now
        </button>

        <div className="text-sm font-mono text-gray-400 mb-6">
          to confirm your order
        </div>

        <div className="text-1xl font-mono text-green-300 mb-6">
          Order ID: {displayOrderId}
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;