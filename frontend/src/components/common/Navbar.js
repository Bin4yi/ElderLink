// frontend/src/components/common/Navbar.js
import React, { useState } from 'react';
import { Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onSignIn, onSignUp }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-primary-500" />
            <span className="text-2xl font-bold gradient-text">ElderLink</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-700 hover:text-primary-600">
              Features
            </a>
            <a href="#packages" className="text-gray-700 hover:text-primary-600">
              Packages
            </a>
            <a href="#contact" className="text-gray-700 hover:text-primary-600">
              Contact
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user.firstName}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onSignIn}
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignUp}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary-500"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              <a
                href="#features"
                className="block px-3 py-2 text-gray-700 hover:text-primary-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#packages"
                className="block px-3 py-2 text-gray-700 hover:text-primary-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Packages
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 text-gray-700 hover:text-primary-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              
              {user ? (
                <div className="pt-4 border-t">
                  <div className="px-3 py-2 text-gray-700">
                    Hi, {user.firstName}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t space-y-2">
                  <button className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-500">
                    Sign In
                  </button>
                  <button className="block w-full btn-primary mx-3">
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;