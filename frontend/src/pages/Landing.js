// frontend/src/pages/Landing.js
import React, { useState } from 'react';
import { 
  Play, 
  Heart, 
  Shield, 
  Users, 
  Smartphone, 
  Calendar,
  Pill,
  Phone,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import PackageSelection from '../components/subscription/PackageSelection';
import { useAuth } from '../context/AuthContext';
import { PACKAGE_PLANS } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';

const Landing = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [showPackages, setShowPackages] = useState(false);
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      setShowPackages(true);
    } else {
      setAuthMode('register');
      setShowAuthModal(true);
    }
  };

  // Add these handler functions for the Navbar
  const handleSignIn = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleSelectPackage = () => {
    setShowPackages(false);
    // Redirect to dashboard after successful subscription
    window.location.href = '/dashboard';
  };

  if (showPackages) {
    return <PackageSelection onSubscribe={handleSelectPackage} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Pass the auth handlers to Navbar */}
      <Navbar 
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
      />
      
      {/* Hero Section with Video */}
<section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Full screen video background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
          {/* Overlay - removed dark overlay, keeping minimal gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-secondary-600/20"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Caring for Your{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Loved Ones
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-white/90 leading-relaxed max-w-3xl mx-auto">
              Bridge the distance with technology. ElderLink connects families with their elderly parents through comprehensive health monitoring and care services.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Get Started Today</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Complete Elder Care Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to ensure your loved ones receive the best care, no matter where you are
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: 'Health Monitoring',
                description: 'Real-time tracking of vital signs, medication adherence, and health metrics'
              },
              {
                icon: Shield,
                title: 'Emergency Response',
                description: '24/7 emergency alerts and rapid response coordination with local services'
              },
              {
                icon: Pill,
                title: 'Medicine Delivery',
                description: 'Automated prescription management and timely delivery to their doorstep'
              },
              {
                icon: Users,
                title: 'Family Connection',
                description: 'Stay connected with video calls, health reports, and daily updates'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg card-hover text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">How ElderLink Works</h2>
            <p className="text-xl text-gray-600">Simple steps to get started</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Choose Your Plan',
                  description: 'Select the care package that best fits your loved one\'s needs',
                  icon: Calendar
                },
                {
                  step: '2',
                  title: 'Complete Setup',
                  description: 'Add elder details and complete the subscription process',
                  icon: Smartphone
                },
                {
                  step: '3',
                  title: 'Start Caring',
                  description: 'Monitor health, schedule appointments, and stay connected',
                  icon: Heart
                }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">Choose Your Care Package</h2>
            <p className="text-xl text-gray-600">Flexible plans designed for every need and budget</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.entries(PACKAGE_PLANS).map(([planKey, plan]) => (
              <div
                key={planKey}
                className={`package-card ${planKey === 'premium' ? 'popular' : ''}`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {formatCurrency(plan.prices['1_month'])}
                  </div>
                  <p className="text-gray-500">per month</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleGetStarted}
                  className="w-full btn-primary"
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">What Families Say</h2>
            <p className="text-xl text-gray-600">Real stories from families using ElderLink</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Daughter',
                content: 'ElderLink has given me peace of mind knowing my mother is safe and well-cared for while I live overseas.',
                rating: 5
              },
              {
                name: 'Michael Chen',
                role: 'Son',
                content: 'The health monitoring features are incredible. We caught my father\'s condition early thanks to the alerts.',
                rating: 5
              },
              {
                name: 'Emily Rodriguez',
                role: 'Daughter',
                content: 'The video calls and daily updates help me feel connected to my parents despite the distance.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg card-hover">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Caring?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of families who trust ElderLink to keep their loved ones safe and connected
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-primary-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-8 h-8 text-primary-500" />
                <span className="text-2xl font-bold">ElderLink</span>
              </div>
              <p className="text-gray-400">
                Connecting families through comprehensive elder care solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Health Monitoring</li>
                <li>Emergency Response</li>
                <li>Medicine Delivery</li>
                <li>Family Connection</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>1-800-ELDERLINK</span>
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  <span>support@elderlink.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ElderLink. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </h2>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {authMode === 'login' ? (
              <Login
                onClose={() => setShowAuthModal(false)}
                onSwitchToRegister={() => setAuthMode('register')}
              />
            ) : (
              <Register
                onClose={() => setShowAuthModal(false)}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;