import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './components/Homepage';
import Menu from './components/Menu';
import AboutPage from './components/AboutPage';
import TeamPage from './components/TeamPage';
import Navbar from './components/Navbar';
import Checkout from './components/Checkout';
import WaitingRoom from './components/WaitingRoom';
import PersonalInfo from './components/PersonalInfo';
import FuturisticOrderConfirmation from './components/FuturisticOrderConfirmation';

const Layout = ({ children }) => (
  <div className="min-h-screen bg-black text-white">
    <Navbar />
    <div className="pt-24">
      {children}
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Homepage /></Layout>} />
        <Route path="/menu/:restaurantId" element={<Layout><Menu /></Layout>} />
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        <Route path="/team" element={<Layout><TeamPage /></Layout>} />
        <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
        <Route path="/personal-info" element={<Layout><PersonalInfo /></Layout>} />
        <Route path="/waiting-room" element={<Layout><WaitingRoom /></Layout>} />
        <Route path="/order-confirmation" element={<Layout><FuturisticOrderConfirmation /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;