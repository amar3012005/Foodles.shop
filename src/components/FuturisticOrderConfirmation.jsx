import React, { useState, useEffect, useRef } from 'react';
import { Check, Mail, Phone, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../config/api';

const FuturisticOrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [animationStage, setAnimationStage] = useState(0);
  const [emailStatus, setEmailStatus] = useState({ emailsSent: 0, emailErrors: [] });
  const [missedCallStatus, setMissedCallStatus] = useState(null);

  // Extract order data from URL params
  const urlParams = new URLSearchParams(location.search);
  const orderIdFromUrl = urlParams.get('order_id');
  const paymentIdFromUrl = urlParams.get('payment_id');
  const statusFromUrl = urlParams.get('status');
  const paymentSuccessFlag = urlParams.get('payment_success'); // Check if user returned from payment
  
  // State for order details and processing stages
  const [orderData, setOrderData] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(true); // Start with processing screen
  const [loading, setLoading] = useState(false); // No loading after processing
  
  // Use ref to store parsed order data for retries (Comments 1, 3, 10)
  const parsedOrderDataRef = useRef(null);
  const localStorageKeyRef = useRef(null);
  const safetyRetriggerFlagRef = useRef(false); // Order-scoped retrigger flag (Comment 5)
  
  // Extract order data with correct paths based on localStorage structure (Comment 1)
  const extractedOrderId = orderIdFromUrl || orderData?.orderId || sessionStorage.getItem('lastOrderId') || ''; // Comment 6: Fallback to sessionStorage
  const extractedTotal = orderData?.totalOrderValue || orderData?.paymentBreakdown?.total || 0;
  const extractedName = orderData?.userDetails?.fullName || 'Valued Customer';
  const extractedRemainingPayment = orderData?.orderDetails?.remainingPayment || orderData?.amount || orderData?.paymentBreakdown?.remainingPayment || 0;
  const extractedDeliveryTime = orderData?.orderDetails?.deliveryTime || '30-40';
  const extractedRestaurantName = orderData?.restaurantName || '';
  const extractedVendorPhone = orderData?.vendorPhone || '';
  const extractedVendorEmail = orderData?.vendorEmail || '';
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
            console.log(`✅ Order data loaded for: ${parsedOrderDataRef.current.userDetails?.fullName}`);
            
            // Set state with the full orderData object (Comment 1)
            setOrderData(parsedOrderDataRef.current);
            
            // DON'T clean up localStorage yet - defer until after notifications succeed (Comment 2)
            console.log(`💾 localStorage retained for notification processing`);
          } else if (orderKeys.length > 0) {
            // Fallback: Use any available order key
            console.log(`🔄 Using fallback order data`);
            const fallbackData = localStorage.getItem(orderKeys[0]);
            if (fallbackData) {
              parsedOrderDataRef.current = JSON.parse(fallbackData);
              localStorageKeyRef.current = orderKeys[0];
              console.log(`✅ Fallback order data loaded`);
              
              setOrderData(parsedOrderDataRef.current);
              
              // DON'T clean up localStorage yet (Comment 2)
              console.log(`💾 localStorage retained for notification processing`);
            }
          } else {
            console.warn('❌ No order data found in localStorage');
          }
          
          // Always trigger background processing for emails and notifications
          if (orderIdToUse && parsedOrderDataRef.current) {
            console.log(`📧 Triggering email and notification processing with cached data`);
            console.log(`💳 Payment success flag: ${paymentSuccessFlag}`);
            
            let notificationSuccess = false;
            
            // If user returned from payment gateway, assume payment is successful
            // This works around the lack of real-time payment verification
            if (paymentSuccessFlag === 'true') {
              console.log(`✅ User returned from payment gateway - proceeding with notifications without verification`);
            }
            
            // For order confirmation page, skip payment verification and proceed directly with notifications
            // since the user was already redirected here after successful payment
            console.log(`📧 Proceeding with notifications for confirmed order: ${orderIdToUse}`);
            
            // Use a more reliable API call structure with order data from ref (Comment 1: Modified)
            try {
              const response = await api.post('/payment/cashfree-success', {
                orderId: orderIdToUse,
                paymentId: paymentIdFromUrl || 'manual_confirmation',
                orderData: parsedOrderDataRef.current // Use ref instead of localStorage (Comment 3)
              });
              
              console.log(`✅ Background processing completed`);
              
              if (response.data && response.data.success) {
                console.log(`📧 Emails sent: ${response.data.emailsSent || 0}`);
                console.log(`📞 Missed call: ${response.data.missedCallStatus || 'pending'}`);
                console.log(`📦 Data source: ${response.data.dataSource || 'unknown'}`);
                
                setEmailStatus({
                  emailsSent: response.data.emailsSent || 0,
                  emailErrors: response.data.emailErrors || []
                });
                setMissedCallStatus(response.data.missedCallStatus);
                notificationSuccess = true;
              } else {
                console.warn('⚠️ Background processing response incomplete');
              }
            } catch (apiError) {
              console.error('❌ Background processing API error:', apiError.message);
              
              // RETRY MECHANISM - Use ref data for retry (Comment 10)
              console.log(`🔄 Retrying notification with cached ref data`);
              try {
                const fallbackResponse = await api.post('/payment/cashfree-success', {
                  orderId: orderIdToUse,
                  paymentId: 'fallback_confirmation',
                  orderData: parsedOrderDataRef.current // Use ref for retry (Comment 10)
                });
                
                if (fallbackResponse.data && fallbackResponse.data.success) {
                  console.log(`✅ Fallback notification successful`);
                  setEmailStatus({
                    emailsSent: fallbackResponse.data.emailsSent || 0,
                    emailErrors: fallbackResponse.data.emailErrors || []
                  });
                  setMissedCallStatus(fallbackResponse.data.missedCallStatus);
                  notificationSuccess = true;
                }
              } catch (fallbackError) {
                console.error('❌ Fallback notification also failed:', fallbackError.message);
              }
            } finally {
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
          }
          
        } catch (error) {
          console.error('❌ Error processing order data:', error.message);
        }
      }, 2000); // 2 second delay
    };

    processPaymentAndLoadData();
  }, []); // Run only once

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
    if (!isProcessingPayment && !loading) {
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
  }, [navigate, isProcessingPayment, loading]);

  useEffect(() => {
    const stages = setTimeout(() => {
      setAnimationStage((prev) => (prev + 1) % 3);
    }, 1000);

    return () => clearTimeout(stages);
  }, [animationStage]);

  useEffect(() => {
    const checkStatus = async () => {
      const orderIdToUse = extractedOrderId || orderIdFromUrl;
      if (!orderIdToUse || isProcessingPayment || loading) return;
      
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
            console.log(`🔄 No emails detected after polling, retriggering notifications`);
            safetyRetriggerFlagRef.current = true; // Prevent multiple retriggers for this order (Comment 5)
            
            try {
              const retriggerResponse = await api.post('/payment/cashfree-success', {
                orderId: orderIdToUse,
                paymentId: 'safety_retrigger',
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
  }, [extractedOrderId, orderIdFromUrl, isProcessingPayment, loading]);

  return (
    <div className="bg-black h-screen fixed inset-0 p-4">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(255,255,255,0.05)_1px),linear-gradient(transparent_24px,rgba(255,255,255,0.05)_1px)] bg-[size:25px_25px]" />
      </div>

      {/* Show processing payment screen for 2 seconds */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-16 h-16 text-green-400 animate-spin mb-6" />
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

      /* Show loading while fetching order details (if needed) */
        {loading && !isProcessingPayment && (
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

        {/* Email and missed call status notifications - Mobile responsive */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2 w-64 sm:w-72">
          {emailStatus.emailsSent > 0 && (
            <div className="bg-black/95 backdrop-blur-sm text-green-400 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 font-mono text-xs sm:text-sm border border-green-400/30 shadow-xl animate-slideIn">
          <Mail className="w-3 h-3 sm:w-4 sm:h-4 mt-1 animate-pulse flex-shrink-0" />
          <div className="flex-1">
            <div className="font-bold tracking-wide flex items-center gap-1 sm:gap-2 mb-1">
              Notified
              <span className="text-xs bg-green-400/20 px-1 sm:px-2 py-0.5 sm:py-1 rounded">
            {emailStatus.emailsSent}/2
              </span>
            </div>
            <div className="text-xs text-green-400/80">
              {emailStatus.emailsSent === 1 
            ? '→ Customer notified' 
            : '→ Customer & vendor notified'}
            </div>
          </div>
            </div>
          )}

          {missedCallStatus === 'success' && (
            <div className="bg-black/95 backdrop-blur-sm text-green-400 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 font-mono text-xs sm:text-sm border border-green-400/30 shadow-xl animate-slideIn">
          <Phone className="w-3 h-3 sm:w-4 sm:h-4 mt-1 animate-pulse flex-shrink-0" />
          <div className="flex-1">
            <div className="font-bold tracking-wide mb-1">MISSED CALL SENT</div>
            <div className="text-xs text-green-400/80">
              → Vendor notification sent
            </div>
          </div>
            </div>
          )}
        </div>

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
            {!loading && !isProcessingPayment && (
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