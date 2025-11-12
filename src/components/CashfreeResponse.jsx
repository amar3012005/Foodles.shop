import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../config/api';

const CashfreeResponse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [processing, setProcessing] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Processing payment response...');

  useEffect(() => {
    const handleCashfreeResponse = async () => {
      try {
        console.log('Cashfree response received:', {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
          params
        });
        
        // Extract parameters from URL
        const urlParams = new URLSearchParams(location.search);
        
        // Get order ID from URL params or session storage
        let orderId = urlParams.get('order_id') || 
                     urlParams.get('orderId') || 
                     params.orderId ||
                     sessionStorage.getItem('currentOrderId');
        
        console.log('Extracted order ID:', orderId);

        if (!orderId) {
          console.error('No order ID found');
          setStatusMessage('Order ID not found. Redirecting...');
          setTimeout(() => {
            navigate('/', { 
              state: { 
                message: 'Payment completed but order details unclear. Please check your email.',
                type: 'warning'
              }
            });
          }, 3000);
          return;
        }

        // Poll order status until it's processed
        setStatusMessage('Verifying payment with Cashfree...');
        let attempts = 0;
        const maxAttempts = 10; // 10 seconds max
        
        const verifyPaymentDirectly = async () => {
          try {
            console.log('Verifying payment directly with Cashfree API...');
            
            // Get payment details from URL
            const urlParams = new URLSearchParams(location.search);
            const orderId = urlParams.get('order_id') || urlParams.get('orderId');
            const paymentId = urlParams.get('payment_id') || urlParams.get('cf_payment_id');
            
            if (!orderId) {
              throw new Error('No order ID in URL parameters');
            }
            
            // Call backend to verify payment with Cashfree
            const verifyResponse = await api.post('/payment/verify-cashfree', {
              orderId,
              paymentId
            });
            
            if (verifyResponse.data.success && verifyResponse.data.paymentStatus === 'SUCCESS') {
              console.log('Payment verified successfully, redirecting to confirmation');
              
              // Clear session storage
              sessionStorage.removeItem('currentOrderId');
              
              // Redirect to order confirmation
              navigate(`/order-confirmation?order_id=${orderId}&payment_success=true`, {
                state: {
                  orderId: orderId,
                  paymentSuccess: true,
                  fromCashfree: true,
                  verified: true
                },
                replace: true
              });
              return;
            } else {
              throw new Error('Payment verification failed');
            }
            
          } catch (error) {
            console.error('Direct payment verification failed:', error);
            
            // Fallback to polling order status
            console.log('Falling back to polling order status...');
            attempts++;
            
            if (attempts <= maxAttempts) {
              setStatusMessage(`Verifying payment... (${attempts}/${maxAttempts})`);
              setTimeout(verifyPaymentDirectly, 1000);
            } else {
              // Timeout - redirect anyway with a warning
              console.warn('Payment verification timed out');
              setStatusMessage('Payment verification taking longer than expected. Redirecting...');
              
              setTimeout(() => {
                navigate(`/order-confirmation?order_id=${orderId}&payment_success=true&needs_verification=true`, {
                  state: {
                    orderId: orderId,
                    paymentSuccess: true,
                    fromCashfree: true,
                    needsVerification: true,
                    message: 'Payment completed but verification is taking time. Please check your email.'
                  },
                  replace: true
                });
              }, 3000);
            }
          }
        };

        // Start verification
        verifyPaymentDirectly();

      } catch (error) {
        console.error('Error processing Cashfree response:', error);
        setStatusMessage('Error processing payment response. Redirecting...');
        
        setTimeout(() => {
          const orderId = sessionStorage.getItem('currentOrderId');
          if (orderId) {
            navigate(`/order-confirmation?order_id=${orderId}&payment_success=true&has_error=true`, {
              state: {
                orderId: orderId,
                paymentSuccess: true,
                fromCashfree: true,
                hasError: true,
                errorMessage: error.message
              },
              replace: true
            });
          } else {
            navigate('/', { 
              state: { 
                message: 'Payment processing error. Please contact support.',
                type: 'error'
              }
            });
          }
        }, 3000);
      } finally {
        setProcessing(false);
      }
    };

    handleCashfreeResponse();
  }, [navigate, location, params]);

  if (processing) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-400/20 border-t-green-400 rounded-full animate-spin mb-4 mx-auto" />
          <div className="font-mono text-white space-y-2">
            <h3 className="text-xl">Processing Payment</h3>
            <p className="text-white/60 text-sm">{statusMessage}</p>
            <p className="text-white/40 text-xs">Do not refresh this page</p>
          </div>
        </div>
      </div>
    );
  }

  return null; // Component will redirect, so no need to render anything
};

export default CashfreeResponse;
