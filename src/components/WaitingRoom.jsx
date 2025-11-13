import React, { useState, useEffect } from 'react';
import { AlertCircle, CreditCard, Loader } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../config/api';

const WaitingRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dots, setDots] = useState('');
  const [timeLeft, setTimeLeft] = useState(150);
  const pulseInterval = 1500; // Define consistent pulse interval (1.5 seconds)
  const [backendStatus, setBackendStatus] = useState('checking');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [backendError, setBackendError] = useState(false);
  const [remainingPayment, setRemainingPayment] = useState(0);
  const [retryTimer, setRetryTimer] = useState(10);
  const [showVendorContact, setShowVendorContact] = useState(false);

  // Destructure order data from location state
  const { 
    userDetails, 
    orderDetails,
    amount,
    items,
    donation, 
    vendorEmail,
    vendorPhone,
    restaurantId,
    restaurantName,
    preReservationData,
    preReservationDiscount
  } = location.state || {};

  // Move calculateRemainingPayment inside useEffect or use useCallback
  const calculateRemainingPayment = React.useCallback((details) => {
    const { subtotal = 0, dogDonation = 0, convenienceFee = 0, items = [], isPreReservation = false } = details;
    
    // Pre-reservation specific calculation - only ₹20 pay now
    if (isPreReservation || preReservationData?.isPreReservation) {
      return 20; // Fixed ₹20 for pre-reservations
    }
    
    // Pizza Bite specific calculation (restaurantId === '5') - Comment 4
    if (restaurantId === '5') {
      // Subtract ₹5 from donation if there is a donation
      const adjustedDonation = dogDonation > 0 ? dogDonation - 5 : 0;
      return 20 + adjustedDonation; // Fixed ₹20 + adjusted donation amount (Comment 4: Fixed from 25 to 20)
    }

    // For other restaurants
    let vendorCharge = 0;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (subtotal >= 500) {
      vendorCharge = 50;
    } else if (subtotal >= 200) {
      // Only charge ₹20 per item if individual item price is ₹100 or more
      vendorCharge = items.reduce((charge, item) => {
        return charge + (item.price >= 100 ? 20 * item.quantity : 0);
      }, 0);
    }

    const totalCharges = vendorCharge + dogDonation + (dogDonation > 0 ? 0 : convenienceFee);

    return totalCharges;
  }, [restaurantId, preReservationData]);

  // Update useEffect with the dependency
  useEffect(() => {
    if (orderDetails) {
      const additionalCharges = calculateRemainingPayment(orderDetails);
      setRemainingPayment(additionalCharges);
    }
  }, [orderDetails, calculateRemainingPayment]);

  // Generate a persistent 3-digit order ID (only once)
  const [orderId] = useState(() => {
    // Check if we already have an order ID in session storage
    const existingOrderId = sessionStorage.getItem('currentOrderId');
    if (existingOrderId) {
      return existingOrderId;
    }
    // Generate new order ID and store it
    const newOrderId = `AS_${Math.floor(100 + Math.random() * 900)}`;
    sessionStorage.setItem('currentOrderId', newOrderId);
    return newOrderId;
  });

  // Display the order ID as `#AS_` followed by a 3-digit number
  const displayOrderId = `#${orderId}`;

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, pulseInterval / 3); // Sync with pulse animation by dividing the interval

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(dotInterval);
      clearInterval(timerInterval);
    };
  }, []);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get('/health');
        setBackendStatus('connected');
        setBackendError(false);
      } catch (error) {
        console.error('❌ Backend connection failed');
        setBackendStatus('error');
        setBackendError(true);
      }
    };
    
    testConnection();
    // Poll backend health every 5 seconds
    const healthCheck = setInterval(testConnection, 5000);
    return () => clearInterval(healthCheck);
  }, []);

  // Preload the confirmation page in the background
  useEffect(() => {
    // Dynamic import without lazy loading
    import('./FuturisticOrderConfirmation').catch(err => 
      console.error('Error preloading:', err)
    );
  }, []);

  // Add this useEffect for retry timer
  useEffect(() => {
    if (backendError && retryTimer > 0) {
      const timer = setInterval(() => {
        setRetryTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    if (retryTimer === 0) {
      setShowVendorContact(true);
    }
  }, [backendError, retryTimer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePayNow = async () => {
    if (backendStatus !== 'connected') {
      setBackendError(true);
      return; // Don't proceed if backend is down
    }

    try {
      setIsProcessingPayment(true);

      // Store order ID in session storage for Cashfree response handling (already stored in useState)
      sessionStorage.setItem('lastOrderId', orderId); // Backup storage only

      // Store comprehensive order data in localStorage for order confirmation page
      const orderData = {
        orderId,
        userDetails,
        orderDetails: {
          ...orderDetails,
          customerPhone: userDetails.phoneNumber,
          remainingPayment: remainingPayment,
          totalAmount: amount,
          preOrderPayment: amount - remainingPayment,
          items: orderDetails.items,
          deliveryTime: orderDetails.deliveryTime || '30-40',
          specialInstructions: orderDetails.specialInstructions || '',
          convenienceFee: orderDetails.convenienceFee || 0,
          dogDonation: orderDetails.dogDonation || 0
        },
        vendorEmail,
        vendorPhone,
        restaurantId,
        restaurantName,
        amount: remainingPayment,
        totalOrderValue: amount,
        paymentBreakdown: {
          total: amount,
          preOrderPayment: amount - remainingPayment,
          remainingPayment: remainingPayment,
          convenienceFee: orderDetails.convenienceFee || 0,
          dogDonation: orderDetails.dogDonation || 0
        },
        timestamp: Date.now(),
        paymentStatus: 'PENDING'
      };

      localStorage.setItem(`order_${orderId}`, JSON.stringify(orderData));
      
      // Store order ID in sessionStorage for order confirmation page fallback
      sessionStorage.setItem('lastOrderId', orderId);

      // Save order data for processing after payment (Comment 13)
      let prepareResponse;
      try {
        prepareResponse = await api.post('/payment/prepare-order', orderData);
        
        // Validate prepare-order response before proceeding (Comment 1 - WaitingRoom)
        if (!prepareResponse.data || !prepareResponse.data.success) {
          throw new Error('Order preparation failed');
        }
      } catch (prepareError) {
        console.error('❌ Failed to prepare order:', prepareError);
        setIsProcessingPayment(false);
        setBackendError(true);
        
        // Show error message with vendor contact information (Comment 1 - WaitingRoom)
        alert(`Unable to prepare your order. Please contact ${restaurantName} at ${vendorPhone}`);
        setShowVendorContact(true);
        return; // Abort payment redirect
      }

      // Create Razorpay order
      const razorpayOrderResponse = await api.post('/payment/razorpay/create-order', {
        amount: remainingPayment,
        orderId: orderId,
        userDetails: userDetails
      });

      if (!razorpayOrderResponse.data.success) {
        throw new Error('Failed to create Razorpay order');
      }

      const { razorpayOrderId, key } = razorpayOrderResponse.data;

      // Load Razorpay checkout script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // Razorpay checkout options
      const options = {
        key: key,
        amount: remainingPayment * 100, // Convert to paise
        currency: 'INR',
        name: 'Foodles',
        description: `Order #${orderId}`,
        order_id: razorpayOrderId,
        prefill: {
          name: userDetails.fullName,
          email: userDetails.email,
          contact: userDetails.phoneNumber
        },
        notes: {
          orderId: orderId,
          restaurantName: restaurantName
        },
        theme: {
          color: '#FFD700'
        },
        handler: async function (response) {
          // Payment successful
          
          try {
            setIsProcessingPayment(true);
            
            // Verify payment on backend
            const verifyResponse = await api.post('/payment/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
              orderData: orderData
            });

            if (verifyResponse.data.success && verifyResponse.data.verified) {
              // Redirect to confirmation page
              window.location.href = `/order-confirmation?order_id=${orderId}&payment_success=true`;
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('❌ Verification failed:', error);
            setIsProcessingPayment(false);
            alert('Payment verification failed. Please contact support with order ID: ' + orderId);
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
            alert('Payment cancelled. Your order is still pending.');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        console.error('❌ Payment failed:', response.error);
        setIsProcessingPayment(false);
        alert(`Payment failed: ${response.error.description}`);
      });

      paymentObject.open();
      setIsProcessingPayment(false); // Remove loading since modal will open

    } catch (error) {
      console.error('❌ Payment preparation failed:', error);
      setBackendError(true);
      setIsProcessingPayment(false);
    }
  };

  const handleTryAgain = () => {
    navigate('/personalinfo', { state: { cartItems: orderDetails.items, vendorEmail, vendorPhone } });
  };

  // Replace the existing BackendErrorMessage component
  const BackendErrorMessage = () => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-black/80 p-8 rounded-lg border border-yellow-500/20 max-w-md text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-mono text-white mb-4">Technical Issue Detected</h3>
        
        {!showVendorContact ? (
          <>
            <p className="text-white/70 text-sm mb-6">
              We're trying to restore the connection. Please wait...
            </p>
            <div className="text-yellow-500 font-mono text-lg mb-4">
              {retryTimer}s
            </div>
            <button
              onClick={() => {
                setRetryTimer(10);
                setShowVendorContact(false);
                window.location.reload();
              }}
              className="px-6 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 
                       hover:bg-yellow-500/30 transition-colors font-mono"
            >
              RETRY NOW
            </button>
          </>
        ) : (
          <>
            <p className="text-white/70 text-sm mb-6">
              Unable to connect to our servers. Please contact the restaurant directly:
            </p>
            <a 
              href={`tel:+${vendorPhone}`}
              className="inline-block text-yellow-500 font-mono text-lg mb-4 hover:text-yellow-400 transition-colors"
            >
              +{vendorPhone}
            </a>
            <p className="text-white/50 text-sm mb-4">
              Restaurant : {restaurantName}
            </p>
            <button
              onClick={() => {
                setRetryTimer(10);
                setShowVendorContact(false);
                window.location.reload();
              }}
              className="px-6 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 
                       hover:bg-yellow-500/30 transition-colors font-mono"
            >
              TRY AGAIN
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen p-1 sm:p-4 pb-32 relative">
      {/* Show backend error if present */}
      {backendError && <BackendErrorMessage />}
      
      {/* Background patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#242_1px,transparent_1px),linear-gradient(-45deg,#111_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#222_1px,transparent_1px),linear-gradient(90deg,#111_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
      </div>

      {/* Add payment processing overlay */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center" style={{ marginTop: '-150px' }}>
          <div className="text-center">
            <Loader className="w-12 h-12 text-green-400 animate-spin mb-4" />
            <div className="font-mono text-white space-y-2">
              <h3 className="text-xl">Processing Payment</h3>
              <p className="text-white/60 text-sm">Please wait while we confirm your order...</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto relative">
        {/* Header with synchronized pulse */}
        <div className="flex items-center space-x-4 mb-12">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
          <h2 className="text-3xl font-mono font-bold text-white">
            <span className="opacity-100">WAITING</span>{' '}
            <span className="relative">
              ROOM
              <span className="absolute -inset-1 bg-white/10 -skew-x-12 -z-10" />
            </span>
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-2 mb-8">
            {/* Synchronized alert circle pulse */}
            <AlertCircle className="w-6 h-6 text-green-400 animate-[pulse_1.5s_ease-in-out_infinite]" />
            <h1 className="text-1xl font-mono font-bold text-white">
              AWAITING ORDER CONFIRMATION{dots}
            </h1>
          </div>

          <div className="text-4xl font-mono text-green-400 mb-8 ">
            {formatTime(timeLeft)}
          </div>

          {/* Pre-reservation indicator */}
          {(preReservationData?.isPreReservation || orderDetails?.isPreReservation) && (
            <div className="bg-green-500/20 border border-green-400 px-4 py-2 mb-4 text-center">
              <div className="text-green-400 font-mono text-sm font-bold">
                ✓ PRE-RESERVATION ORDER
              </div>
              
            </div>
          )}

          {timeLeft > 0 ? (
            <button 
              onClick={handlePayNow}
              className="flex items-center justify-center bg-green-400 text-black px-4 py-2 hover:bg-green-800 transition-colors mb-6"
            >
              <CreditCard className="mr-2" /> Pay ₹{remainingPayment} Now
            </button>
          ) : (
            <button 
              onClick={handleTryAgain}
              className="flex items-center justify-center bg-yellow-400 text-black px-4 py-2 hover:bg-red-900 transition-colors mb-6"
            >
              Try Again
            </button>
          )}

          <div className="text-center space-y-2 mb-6 max-w-sm">
            <div className="text-sm font-mono text-gray-400">
              to confirm your order
            </div>
            <div className="text-sm font-mono text-yellow-500/80">
              & pay remaining amount
            </div>
            <div className="text-sm font-mono text-gray-400 bg-white/5 px-4 py-2 rounded">
              {(preReservationData?.isPreReservation || orderDetails?.isPreReservation) 
                ? "at the restaurant" 
                : "directly to our Delivery Agent"
              }
            </div>
          </div>

          <div className="text-lg font-mono text-green-300">
            Order ID: {displayOrderId}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
