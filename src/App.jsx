import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';  // Fixed case
import AboutPage from './components/AboutPage';  // Changed from About
import AboutPage2 from './components/AboutPage2';  // Add AboutPage2 import
import ContactPage from './components/ContactPage';  // Changed from Contact
import PaymentFailure from './components/PaymentFailure';
import UnderProgress from './components/UnderProgress';
import Terms from './components/Terms';
import Navbar from './components/Navbar';
import InstallPrompt from './components/InstallPrompt';
import { RestaurantStatusProvider } from './context/RestaurantStatusContext';
import { useEffect } from "react";
import ReactGA from "react-gtag";
import CampusSelection from './components/campus';

const Layout = ({ children }) => (
  <div className="min-h-screen bg-black text-white">
    <Navbar />
    <div className="pt-24">
      {children}
    </div>
  </div>
);

function App() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.pageview(location.pathname + location.search);
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  return (
    <RestaurantStatusProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/campus" element={<Layout><CampusSelection /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/about2" element={<Layout><AboutPage2 /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="/payment-failure" element={<PaymentFailure />} />
          <Route path="/underprogress" element={<UnderProgress />} />
          <Route path="/terms" element={<Layout><Terms /></Layout>} />
        </Routes>
        <InstallPrompt />
      </Router>
    </RestaurantStatusProvider>
  );
}

export default App;
