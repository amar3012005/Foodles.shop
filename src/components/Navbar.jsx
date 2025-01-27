import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Trigger entrance animations
    setTimeout(() => setIsLoaded(true), 300);
  }, []);

  const handleHomeClick = () => {
  };

  return (
    <nav
      className={`bg-black text-white p-6 shadow-lg backdrop-blur-md fixed w-full z-10 transition-all duration-1000 transform ${
        isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center relative">
        {/* Logo and Brand Name */}
        <div className="flex items-center space-x-4">
          <img
            src="/images/logo.jpeg"
            alt="Logo"
            className="h-12 w-12 rounded-full border-2 border-gray-500"
          />
          <span className="nav-link text-3xl font-extrabold">
            &gt;&gt;  FOODLES
          </span>
        </div>

        {/* Links for larger screens */}
        <div className="hidden md:flex space-x-6">
          <Link
            to="/"
            className="nav-link transition-all duration-300 hover:text-gray-300"
            onClick={handleHomeClick}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="nav-link transition-all duration-300 hover:text-gray-300"
          >
            Food points
          </Link>
          <Link
            to="/your-orders"
            className="nav-link transition-all duration-300 hover:text-gray-300"
          >
            Your Orders
          </Link>
        </div>

        {/* Hamburger Menu for smaller screens */}
        <div
          className="md:hidden flex items-center cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="space-y-1">
            <span className="block w-6 h-1 bg-white transition-all transform" />
            <span className="block w-6 h-1 bg-white transition-all transform" />
            <span className="block w-6 h-1 bg-white transition-all transform" />
          </div>
        </div>
      </div>

      {/* Dropdown menu for smaller screens */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-black bg-opacity-90 p-6 md:hidden z-20">
          <Link
            to="/"
            className="block text-white py-2 transition-all duration-300 hover:text-gray-300"
            onClick={() => {
              setIsMenuOpen(false);
              handleHomeClick();
            }}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="block text-white py-2 transition-all duration-300 hover:text-gray-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Food points
          </Link>
          <Link
            to="/your-orders"
            className="block text-white py-2 transition-all duration-300 hover:text-gray-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Your Orders
          </Link>
          
        </div>
      )}

      {/* Grid overlay for decorative effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#111_1px,transparent_1px),linear-gradient(-45deg,#111_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
      </div>
    </nav>
  );
};

export default Navbar;