import React, { useState, useEffect, useRef } from 'react';
import { Check, Mail, Phone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../config/api';

const FuturisticOrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [animationStage, setAnimationStage] = useState(0);
  const [emailStatus, setEmailStatus] = useState({ emailsSent: 0, emailErrors: [] });
  const [missedCallStatus, setMissedCallStatus] = useState(null);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // Extract order data from URL params
  const urlParams = new URLSearchParams(location.search);
  const orderIdFromUrl = urlParams.get('order_id');
  const paymentIdFromUrl = urlParams.get('payment_id');
  const statusFromUrl = urlParams.get('status');
  const paymentSuccessFlag = urlParams.get('payment_success'); // Check if user returned from payment
  
  // State for order details and processing stages
  const [orderData, setOrderData] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(true); // Start with processing screen
  
  // Use ref to store parsed order data for retries (Comments 1, 3, 10)
  const parsedOrderDataRef = useRef(null);
  const localStorageKeyRef = useRef(null);
  const safetyRetriggerFlagRef = useRef(false); // Order-scoped retrigger flag (Comment 5)
  
  // Extract order data with correct paths based on localStorage structure (Comment 1)
  const extractedOrderId = orderIdFromUrl || orderData?.orderId || sessionStorage.getItem('lastOrderId') || ''; // Comment 6: Fallback to sessionStorage
  const extractedName = orderData?.userDetails?.fullName || 'Valued Customer';
  const extractedRemainingPayment = orderData?.orderDetails?.remainingPayment || orderData?.amount || orderData?.paymentBreakdown?.remainingPayment || 0;
  const extractedDeliveryTime = orderData?.orderDetails?.deliveryTime || '30-40';
  const extractedRestaurantName = orderData?.restaurantName || '';
  const isPreReservation = orderData?.orderDetails?.isPreReservation || false;

  // Fix the initial timer value to 45
  const [timeToRedirect, setTimeToRedirect] = useState(45);

  // Reset retrigger flag when orderId changes (Comment 5)
  useEffect(() => {
    safetyRetriggerFlagRef.current = false;
    console.log(`🔄 Reset safety retrigger flag for order: ${extractedOrderId}`);
  }, [extractedOrderId]);

  useEffect(() => {
    const processPaymentAndLoadData = async () => {
      // Show processing payment screen for 2 seconds
      setTimeout(async () => {
        setIsProcessingPayment(false);
        
        const orderIdToUse = orderIdFromUrl || extractedOrderId;
        console.log(`🔍 Processing order confirmation for: ${orderIdToUse}`);
        console.log(`📍 URL Parameters:`, {
          orderIdFromUrl,
          paymentIdFromUrl,
          statusFromUrl,
          paymentSuccessFlag,
          extractedOrderId
        });
        console.log(`🌐 Current location:`, window.location.href);
        console.log(`🔗 Full URL:`, window.location.href);
        
        if (!orderIdToUse) {
          console.error('❌ No order ID found');
          // Try to get from sessionStorage as fallback
          const fallbackOrderId = sessionStorage.getItem('lastOrderId');
          if (fallbackOrderId) {
            console.log(`✅ Found order ID in sessionStorage: ${fallbackOrderId}`);
          }
        }

        try {
          // First, try to get order details from localStorage with the specific key
          let localStorageKey = orderIdToUse ? `order_${orderIdToUse}` : null;
          
          // Debug: Check all localStorage keys
          const allKeys = Object.keys(localStorage);
          const orderKeys = allKeys.filter(key => key.startsWith('order_'));
          console.log(`📦 Found ${orderKeys.length} order(s) in localStorage`);
          
          let cachedOrderData = null;
          
          if (localStorageKey) {
            cachedOrderData = localStorage.getItem(localStorageKey);
            localStorageKeyRef.current = localStorageKey;
          }
          
          if (cachedOrderData) {
            // Parse and store in ref for retries (Comment 3, 10)
            parsedOrderDataRef.current = JSON.parse(cachedOrderData);
            console.log(`✅ Order data loaded from localStorage for: ${parsedOrderDataRef.current.userDetails?.fullName}`);
            
            // Set state with the full orderData object (Comment 1)
            setOrderData(parsedOrderDataRef.current);
          } else {
            console.log(`⚠️ No order data in localStorage, trying to fetch from backend`);
            
            // Try to fetch order data from backend as fallback
            try {
              const orderResponse = await api.get(`/orders/${orderIdToUse}`);
              if (orderResponse.data && orderResponse.data.success) {
                const backendOrderData = orderResponse.data.order;
                console.log(`✅ Order data fetched from backend for: ${backendOrderData.userDetails?.fullName}`);
                
                // Store in ref for processing
                parsedOrderDataRef.current = {
                  orderId: backendOrderData.orderId,
                  userDetails: backendOrderData.userDetails,
                  orderDetails: backendOrderData.orderDetails,
                  vendorEmail: '', // Will be looked up by restaurant ID
                  vendorPhone: backendOrderData.orderDetails.vendorPhone || '',
                  restaurantId: backendOrderData.restaurantId,
                  restaurantName: backendOrderData.restaurantName,
                  amount: backendOrderData.amount,
                  totalOrderValue: backendOrderData.totalOrderValue,
                  paymentBreakdown: {
                    remainingPayment: backendOrderData.orderDetails.remainingPayment || backendOrderData.amount
                  },
                  timestamp: Date.now(),
                  paymentStatus: backendOrderData.paymentStatus
                };
                
                setOrderData(parsedOrderDataRef.current);
              } else {
                console.warn(`❌ Could not fetch order data from backend`);
              }
            } catch (backendError) {
              console.error(`❌ Backend fetch failed:`, backendError.message);
              
              // Final fallback: Use any available order key
              if (orderKeys.length > 0) {
                console.log(`🔄 Using fallback order data from localStorage`);
                const fallbackData = localStorage.getItem(orderKeys[0]);
                if (fallbackData) {
                  parsedOrderDataRef.current = JSON.parse(fallbackData);
                  localStorageKeyRef.current = orderKeys[0];
                  console.log(`✅ Fallback order data loaded`);
                  
                  setOrderData(parsedOrderDataRef.current);
                }
              }
            }
          }
          
          // DON'T clean up localStorage yet - defer until after notifications succeed (Comment 2)
          if (parsedOrderDataRef.current) {
            console.log(`💾 Order data available for notification processing`);
          }
          
          // Always trigger background processing for emails and notifications
          if (orderIdToUse && parsedOrderDataRef.current) {
            console.log(`📧 Triggering email and notification processing with cached data`);
            console.log(`💳 Payment success flag: ${paymentSuccessFlag}`);
            
            let notificationSuccess = false;
            
            // Check if order was already processed first (regardless of payment success flag)
            try {
              const statusResponse = await api.get(`/email-status/${orderIdToUse}`);
              if (statusResponse.data && statusResponse.data.emailsSent > 0) {
                console.log(`✅ Order already processed: ${statusResponse.data.emailsSent} emails sent`);
                setEmailStatus({
                  emailsSent: statusResponse.data.emailsSent,
                  emailErrors: statusResponse.data.emailErrors || []
                });
                setMissedCallStatus(statusResponse.data.missedCallStatus);
                setShowNotificationPopup(true);
                notificationSuccess = true;
              } else {
                console.log(`⚠️ Order not yet processed, will trigger notifications`);
              }
            } catch (statusError) {
              console.log(`⚠️ Could not check order status: ${statusError.message}`);
            }
            
            // If order not yet processed, OR if payment_success=true (force trigger), trigger notifications
            if (!notificationSuccess || paymentSuccessFlag === 'true') {
              console.log(`🚀 Triggering notifications for order ${orderIdToUse} (force: ${paymentSuccessFlag === 'true'})`);
                setShowNotificationPopup(true);
                console.log(`📧 Triggering email notifications for order...`);
                
                // Use the new endpoint to trigger notifications
                try {
                  const response = await api.post('/payment/trigger-notifications', {
                    orderId: orderIdToUse,
                    orderData: parsedOrderDataRef.current
                  });
                  
                  console.log(`✅ Notification processing completed`);
                  
                  if (response.data && response.data.success) {
                    console.log(`📧 Emails sent: ${response.data.emailsSent || 0}`);
                    console.log(`📞 Missed call: ${response.data.missedCallStatus || 'pending'}`);
                    
                    setEmailStatus({
                      emailsSent: response.data.emailsSent || 0,
                      emailErrors: response.data.emailErrors || []
                    });
                    setMissedCallStatus(response.data.missedCallStatus);
                    notificationSuccess = true;
                  } else {
                    console.warn('⚠️ Notification processing response incomplete');
                    // Still show popup even if response is incomplete
                    setShowNotificationPopup(true);
                  }
                } catch (apiError) {
                console.error('❌ Notification API error:', apiError.message);
                
                // Show popup anyway to indicate processing attempted
                setShowNotificationPopup(true);
                
                // RETRY MECHANISM - Try again after a delay
                setTimeout(async () => {
                  try {
                    console.log(`� Retrying notification processing...`);
                    const retryResponse = await api.post('/payment/trigger-notifications', {
                      orderId: orderIdToUse,
                      orderData: parsedOrderDataRef.current
                    });
                    
                    if (retryResponse.data && retryResponse.data.success) {
                      console.log(`✅ Retry successful: ${retryResponse.data.emailsSent} emails`);
                      setEmailStatus({
                        emailsSent: retryResponse.data.emailsSent || 0,
                        emailErrors: retryResponse.data.emailErrors || []
                      });
                      setMissedCallStatus(retryResponse.data.missedCallStatus);
                    }
                  } catch (retryError) {
                    console.error('❌ Retry also failed:', retryError.message);
                  }
                }, 3000); // Retry after 3 seconds
              }
            }
            
            // Only cleanup localStorage after notification attempts complete (Comment 2)
            if (localStorageKeyRef.current) {
              setTimeout(() => {
                localStorage.removeItem(localStorageKeyRef.current);
                console.log(`🧹 localStorage cleaned after notification processing`);
              }, 2000); // Small delay to ensure all requests complete
            }
            
            // Cleanup sessionStorage lastOrderId after successful completion (Comment 6)
            if (notificationSuccess && sessionStorage.getItem('lastOrderId')) {
              setTimeout(() => {
                sessionStorage.removeItem('lastOrderId');
                console.log(`🧹 sessionStorage lastOrderId cleaned`);
              }, 2000);
            }
          }
          
        } catch (error) {
          console.error('❌ Error processing order data:', error.message);
        }
      }, 2000); // 2 second delay
    };

    processPaymentAndLoadData();
  }, []); // Run only once - eslint-disable-line react-hooks/exhaustive-deps

  // Consolidate scroll locking into single mount/unmount effect (Comment 17)
  useEffect(() => {
    // Disable scrolling on mount
    document.body.style.overflow = 'hidden';
    
    // Cleanup function for when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []); // Only run on mount/unmount

  // Separate effect for countdown timer
  useEffect(() => {
    // Start countdown only after processing is complete
    if (!isProcessingPayment) {
      const countdownInterval = setInterval(() => {
        setTimeToRedirect((prev) => {
          // When timer reaches 0, navigate to home
          if (prev <= 1) {
            navigate('/', { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [navigate, isProcessingPayment]);

  useEffect(() => {
    const stages = setTimeout(() => {
      setAnimationStage((prev) => (prev + 1) % 3);
    }, 1000);

    return () => clearTimeout(stages);
  }, [animationStage]);

  useEffect(() => {
    const checkStatus = async () => {
      const orderIdToUse = extractedOrderId || orderIdFromUrl;
      if (!orderIdToUse || isProcessingPayment) return;
      
      try {
        const response = await api.get(`/email-status/${orderIdToUse}`);
        
        if (response.data) {
          // Update email status if we got new data
          if (response.data.emailsSent !== undefined) {
            setEmailStatus(prev => ({
              ...prev,
              emailsSent: response.data.emailsSent,
              emailErrors: response.data.emailErrors || []
            }));
          }
          
          // Update missed call status if available
          if (response.data.missedCallStatus) {
            setMissedCallStatus(response.data.missedCallStatus);
          }
          
          // SAFETY CHECK: If no emails sent after 10 seconds, trigger again using ref (Comment 5: Order-scoped flag)
          if (response.data.emailsSent === 0 && !safetyRetriggerFlagRef.current && parsedOrderDataRef.current) {
            console.log(`🔄 No emails detected after polling, retriggering notifications via Razorpay`);
            safetyRetriggerFlagRef.current = true; // Prevent multiple retriggers for this order (Comment 5)
            
            try {
              const retriggerResponse = await api.post('/payment/razorpay/verify', {
                razorpay_order_id: 'safety_retrigger_order',
                razorpay_payment_id: 'safety_retrigger_payment',
                razorpay_signature: 'safety_retrigger_signature',
                orderId: orderIdToUse,
                orderData: parsedOrderDataRef.current // Use ref instead of state (Comment 10)
              });
              
              if (retriggerResponse.data && retriggerResponse.data.success) {
                console.log(`✅ Safety retrigger successful: ${retriggerResponse.data.emailsSent} emails`);
                setEmailStatus({
                  emailsSent: retriggerResponse.data.emailsSent || 0,
                  emailErrors: retriggerResponse.data.emailErrors || []
                });
                setMissedCallStatus(retriggerResponse.data.missedCallStatus);
              }
            } catch (retriggerError) {
              console.error('❌ Safety retrigger failed:', retriggerError.message);
            }
          }
        }
      } catch (error) {
        // Silently handle polling errors to avoid spam
        if (error.response?.status !== 404) {
          console.error('Status check error:', error.message);
        }
      }
    };

    // Start polling after processing is complete
    if (!isProcessingPayment) {
      const pollInterval = setInterval(checkStatus, 2000); // Poll every 2 seconds instead of 1
      return () => clearInterval(pollInterval);
    }
  }, [extractedOrderId, orderIdFromUrl, isProcessingPayment]);

  return (
    <div className="bg-black h-screen fixed inset-0 p-4">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(255,255,255,0.05)_1px),linear-gradient(transparent_24px,rgba(255,255,255,0.05)_1px)] bg-[size:25px_25px]" />
      </div>

      {/* Show processing payment screen for 2 seconds */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-400/20 border-t-green-400 rounded-full animate-spin mb-6" />
            <div className="font-mono text-white space-y-3">
              <h3 className="text-2xl tracking-wide">PROCESSING PAYMENT</h3>
              <p className="text-green-400 text-lg">Payment Successful!</p>
              <p className="text-white/60 text-sm">Confirming your order...</p>
              <div className="flex items-center justify-center space-x-1 mt-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show loading while fetching order details (if needed) */}
      {false && !isProcessingPayment && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-400/20 border-t-green-400 rounded-full animate-spin mb-4" />
          <div className="font-mono text-white space-y-2">
            <h3 className="text-xl">Loading Order Details</h3>
            <p className="text-white/60 text-sm">Please wait...</p>
          </div>
            </div>
          </div>
        )}

        {/* Minimal Notification Popup */}
        {showNotificationPopup && (
          <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {/* Email Notification Count */}
            {emailStatus.emailsSent > 0 && (
              <div className="bg-green-500/20 backdrop-blur-md text-green-400 px-3 py-2 rounded-lg font-mono text-sm border border-green-400/50">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>emails sent ({emailStatus.emailsSent})</span>
                </div>
              </div>
            )}

            {/* Vendor Notified */}
            {missedCallStatus === 'success' && (
              <div className="bg-blue-500/20 backdrop-blur-md text-blue-400 px-3 py-2 rounded-lg font-mono text-sm border border-blue-400/50">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>[vendor notified]</span>
                </div>
              </div>
            )}
          </div>
        )}



        {/* Main content - only show after processing is complete */}
      {!isProcessingPayment && (
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen -mt-16">
          <div className="flex items-center space-x-4 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
            <h2 className="text-3xl font-mono font-bold text-white">
              <span className="opacity-100">ORDER</span>{' '}
              <span className="relative">
                CONFIRMED
                <span className="absolute -inset-1 bg-white/10 -skew-x-12 -z-10" />
              </span>
            </h2>
          </div>

          <div className="text-2xl font-mono text-green-400 mb-3">
            THANK YOU, {extractedName.toUpperCase()}!
          </div>

          <div className="border border-white/10 bg-black/90 p-4 mb-3 relative w-full max-w-lg">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-green-400/30" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-green-400/30" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-green-400/30" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-green-400/30" />

            <p className="text-xl font-mono mb-3 text-white tracking-wide">
              PLEASE PAY <span className="text-green-400">₹{(extractedRemainingPayment || 0).toLocaleString()}</span> {isPreReservation ? 'AT RESTAURANT' : 'UPON DELIVERY'}
            </p>
            <div className="space-y-1 text-white/70 text-sm">
              <p className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Delivery initiated to {extractedRestaurantName}</span>
              </p>
              <p className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>You will be notified once we reach your location in {extractedDeliveryTime} minutes</span>
              </p>
              <p className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Kindly check your Gmail right now, for order info.</span>
              </p>
              <p className="flex items-center space-x-2 text-white/50 text-xs mt-2">
                <span>* If you don't see the email in your inbox, please check your spam folder.</span>
              </p>
            </div>
          </div>

          <div className="text-sm font-mono text-green-400/80 mb-3">
            ORDER_ID: <span className="text-white/70">#{extractedOrderId || 'Processing...'}</span>
            {!isProcessingPayment && (
              <div className="text-xs text-white/50 mt-2">
                Redirecting to home in {timeToRedirect} seconds...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FuturisticOrderConfirmation;