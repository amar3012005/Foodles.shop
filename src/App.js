import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './components/Homepage';
import Menu from './components/Menu';
import AboutPage from './components/AboutPage';
import AboutPage2 from './components/AboutPage2';  // Add AboutPage2 import
import UnderProgress from './components/UnderProgress';
import PreReserve from './components/PreReserve';
import OffersPage from './components/OffersPage';

import Navbar from './components/Navbar';
import Checkout from './components/Checkout';
import WaitingRoom from './components/WaitingRoom';
import PersonalInfo from './components/PersonalInfo';
import FuturisticOrderConfirmation from './components/FuturisticOrderConfirmation';
import CashfreeResponse from './components/CashfreeResponse';
import Terms from './components/Terms';
import CampusSelection from './components/campus';
import OrderHistory from './components/OrderHistory';
import api from './config/api';


const Layout = ({ children }) => (
  <div className="min-h-screen bg-black text-white">
    <Navbar />
    <div className="pt-24">
      {children}
    </div>
  </div>
);

function App() {
  // Fetch phone number from localStorage when app loads
  useEffect(() => {
    const fetchStoredPhoneNumber = async () => {
      try {
        console.log('🔄 FRONTEND TRIGGER: App initialization - fetching stored phone number');

        // Get phone number from localStorage
        let storedPhone = localStorage.getItem('userPhoneNumber');
        let userName = '';
        let userEmail = '';

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
              userName = parsed.userName || '';
              userEmail = parsed.userEmail || '';
              console.log('📱 FRONTEND: Found phone number in cached user data:', storedPhone);
            } catch (e) {
              console.log('❌ FRONTEND: Error parsing cached user data');
            }
          }
        }

        if (storedPhone) {
          console.log('📱 FRONTEND: Phone number loaded from storage:', storedPhone);

          // Store in sessionStorage as well for consistency
          sessionStorage.setItem('userPhoneNumber', storedPhone);

          // BACKEND TRIGGER: Sync phone number with backend
          console.log('🔄 FRONTEND TRIGGER: Initiating backend phone sync');
          try {
            const syncResponse = await api.post('/api/sync-phone-number', {
              phoneNumber: storedPhone,
              userName: userName,
              userEmail: userEmail,
              source: 'app_initialization'
            });

            if (syncResponse.data.success) {
              console.log('✅ FRONTEND: Phone number synced with backend successfully');
              console.log('🔄 BACKEND TRIGGER: Phone sync response:', syncResponse.data.backendTrigger);
            } else {
              console.log('⚠️ FRONTEND: Phone sync failed:', syncResponse.data.error);
            }
          } catch (syncError) {
            console.log('❌ FRONTEND: Backend phone sync error:', syncError.message);
            console.log('� FRONTEND: Continuing with local storage only');
          }
        } else {
          console.log('�📱 FRONTEND: No phone number found in storage on app initialization');
        }

        console.log('✅ FRONTEND TRIGGER: App initialization phone handling completed');
      } catch (error) {
        console.error('❌ FRONTEND ERROR: Phone number fetch failed:', error);
      }
    };

    fetchStoredPhoneNumber();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Homepage /></Layout>} />
        <Route path="/offers" element={<Layout><OffersPage /></Layout>} />
        <Route path="/pre-reserve" element={<PreReserve />} />
        <Route path="/menu/:restaurantId" element={<Layout><Menu /></Layout>} />
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        <Route path="/about2" element={<Layout><AboutPage2 /></Layout>} />

        <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
        <Route path="/personal-info" element={<Layout><PersonalInfo /></Layout>} />
        <Route path="/waiting-room" element={<Layout><WaitingRoom /></Layout>} />
        <Route path="/order-confirmation" element={<Layout><FuturisticOrderConfirmation /></Layout>} />
        
        {/* Cashfree response handlers - multiple patterns to catch different response formats */}
        <Route path="/forms/response/:responseToken" element={<CashfreeResponse />} />
        <Route path="/forms/response/*" element={<CashfreeResponse />} />
        <Route path="/cashfree-response" element={<CashfreeResponse />} />
        <Route path="/payment-success" element={<CashfreeResponse />} />
        
        <Route path="/underprogress" element={<UnderProgress />} />
        <Route path="/campus" element={<Layout><CampusSelection /></Layout>} />

        <Route path="/terms" element={<Layout><Terms /></Layout>} />
        <Route path="/order-history" element={<Layout><OrderHistory /></Layout>} />
      </Routes>
    
    </Router>
  );
}

export default App;