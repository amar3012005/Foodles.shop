import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, Package, ChevronDown, ChevronUp, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../config/api';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  console.log('🚀 OrderHistory component mounted - triggering automatic order fetch');

  const fetchOrderHistory = async (showRefreshing = false) => {
    console.log('🔄 Starting order history fetch process...');
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Get phone number from localStorage, sessionStorage, or cached data
      let storedPhone = localStorage.getItem('userPhoneNumber');
      
      // Fallback to sessionStorage
      if (!storedPhone) {
        storedPhone = sessionStorage.getItem('userPhoneNumber');
      }
      
      // Fallback to cached user data
      if (!storedPhone) {
        const cachedData = localStorage.getItem('userOrderData');
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData);
            storedPhone = parsed.phoneNumber;
            console.log('📱 Found phone number in cached user data:', storedPhone);
          } catch (e) {
            console.log('❌ Error parsing cached user data');
          }
        }
      }
      
      console.log('📱 Phone number from storage:', storedPhone);

      if (!storedPhone) {
        console.log('❌ No phone number found in localStorage');
        setError('No phone number found. Please place an order first to view your order history.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setPhoneNumber(storedPhone);

      console.log('🔍 Fetching orders for phone:', storedPhone);

      // Fetch orders from backend - triggering backend API call
      console.log('🌐 Making backend API call to /orders/history/' + storedPhone);
      const response = await api.get(`/orders/history/${storedPhone}`);
      console.log('📦 Backend API Response received:', response.data);

      if (response.data && response.data.orders) {
        console.log('✅ Found orders:', response.data.orders.length);
        setOrders(response.data.orders);
        setLastRefresh(new Date().toLocaleString());
      } else {
        console.log('⚠️ No orders in response');
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Error fetching order history:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError('Failed to load order history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleRefresh = () => {
    fetchOrderHistory(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-400/20 border-t-green-400 rounded-full animate-spin mb-6" />
          <div className="font-mono text-white space-y-3">
            <h3 className="text-2xl tracking-wide">LOADING ORDER HISTORY</h3>
            <p className="text-green-400 text-lg">Fetching your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(255,255,255,0.05)_1px),linear-gradient(transparent_24px,rgba(255,255,255,0.05)_1px)] bg-[size:25px_25px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-mono text-sm">BACK TO HOME</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="font-mono text-sm">{refreshing ? 'REFRESHING...' : 'REFRESH'}</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-mono font-bold text-white mb-2">
            <span className="relative">
              ORDER HISTORY
              <span className="absolute -inset-1 bg-white/10 -skew-x-12 -z-10" />
            </span>
          </h1>
          <p className="text-green-400 font-mono text-lg">
            YOUR PAST ORDERS
          </p>
          {orders.length > 0 && (
            <p className="text-white/60 font-mono text-sm mt-2">
              {orders.length} order{orders.length !== 1 ? 's' : ''} found
            </p>
          )}
          {phoneNumber && (
            <p className="text-white/60 font-mono text-sm mt-2">
              Phone: {phoneNumber}
            </p>
          )}
          {lastRefresh && (
            <p className="text-white/40 font-mono text-xs mt-1">
              Last updated: {lastRefresh}
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="relative z-10 px-6 mb-6">
          <div className="max-w-4xl mx-auto">
            <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-mono text-red-500 mb-1">Unable to Load Orders</h3>
                  <p className="text-white/70 text-sm">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="mt-3 px-4 py-2 bg-red-500/20 text-red-400 font-mono hover:bg-red-500/30 transition-colors"
                  >
                    TRY AGAIN
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="relative z-10 px-6 pb-6">
        {orders.length === 0 && !error ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-mono text-white/60 mb-2">NO ORDERS FOUND</h3>
            <p className="text-white/40 font-mono text-sm mb-4">
              You haven't placed any orders yet, or your orders are still being processed.
            </p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-2 bg-green-500 text-black font-mono hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {refreshing ? 'CHECKING...' : 'CHECK AGAIN'}
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border border-white/10 bg-black/90 backdrop-blur-sm relative"
              >
                {/* Corner borders */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-green-400/30" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-green-400/30" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-green-400/30" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-green-400/30" />

                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => toggleOrderExpansion(order._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-green-400 font-mono font-bold text-lg">
                        #{order.orderId}
                      </div>
                      <div className="flex items-center space-x-2 text-white/70">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono text-sm">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      {order.orderDetails?.remainingPayment > 0 && (
                        <div className="flex items-center space-x-2 bg-yellow-500/20 border border-yellow-500/50 px-2 py-1 rounded">
                          <span className="text-yellow-400 font-mono text-xs font-bold">
                            PAY ₹{order.orderDetails.remainingPayment} ON DELIVERY
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-green-400">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-mono font-bold">
                          ₹{order.totalOrderValue?.toLocaleString() || order.amount?.toLocaleString() || '0'}
                        </span>
                        {order.orderDetails?.remainingPayment > 0 && (
                          <span className="text-yellow-400 font-mono text-sm">
                            (Paid: ₹{(order.totalOrderValue - order.orderDetails.remainingPayment)?.toLocaleString() || '0'})
                          </span>
                        )}
                      </div>
                      {expandedOrder === order._id ? (
                        <ChevronUp className="w-5 h-5 text-green-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order._id && (
                  <div className="border-t border-white/10 p-4">
                    <div className="space-y-4">
                      {/* Customer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-green-400 font-mono text-sm mb-2">CUSTOMER DETAILS</h4>
                          <div className="space-y-1 text-white/70 font-mono text-sm">
                            <p>Name: {order.userDetails?.fullName || 'N/A'}</p>
                            <p>Phone: {order.userDetails?.phone || phoneNumber}</p>
                            <p>Email: {order.userDetails?.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-green-400 font-mono text-sm mb-2">PAYMENT DETAILS</h4>
                          <div className="space-y-1 text-white/70 font-mono text-sm">
                            <p>Order Total: <span className="text-white">₹{order.totalOrderValue?.toLocaleString() || order.amount?.toLocaleString() || '0'}</span></p>
                            <p>Paid Online: <span className="text-green-400">₹{(order.totalOrderValue - (order.orderDetails?.remainingPayment || 0))?.toLocaleString() || '0'}</span></p>
                            <div className="border-t border-white/20 pt-2 mt-2">
                              <p className="text-yellow-400 font-bold">
                                PLEASE PAY ₹{order.orderDetails?.remainingPayment?.toLocaleString() || '0'} UPON DELIVERY
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      {order.orderDetails?.items && order.orderDetails.items.length > 0 && (
                        <div>
                          <h4 className="text-green-400 font-mono text-sm mb-2">ORDER ITEMS</h4>
                          <div className="space-y-2">
                            {order.orderDetails.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded">
                                <div className="flex items-center space-x-3">
                                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                                  <span className="font-mono text-white">{item.name}</span>
                                  <span className="text-white/60 font-mono text-sm">
                                    ×{item.quantity}
                                  </span>
                                </div>
                                <span className="font-mono text-green-400">
                                  ₹{item.price?.toLocaleString() || '0'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Special Instructions */}
                      {order.orderDetails?.specialInstructions && (
                        <div>
                          <h4 className="text-green-400 font-mono text-sm mb-2">SPECIAL INSTRUCTIONS</h4>
                          <p className="text-white/70 font-mono text-sm bg-white/5 p-3 rounded">
                            {order.orderDetails.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;