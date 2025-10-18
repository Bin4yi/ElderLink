// frontend/src/components/common/Loading.js
import React from 'react';
import { Heart } from 'lucide-react';

const Loading = ({ text = 'Loading...', size = 'large' }) => {
  const sizeConfig = {
    small: { logo: 24, icon: 16 },
    medium: { logo: 32, icon: 20 },
    large: { logo: 40, icon: 24 }
  };

  const currentSize = sizeConfig[size];

  // Size classes for the spinner
  const spinnerClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
        {/* Spinning border */}
        <div 
          className={`${spinnerClasses[size]}`}
          style={{ 
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #ef4444',
            borderRight: '3px solid #f97316',
            borderBottom: '3px solid #d946ef',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            boxSizing: 'border-box'
          }}
        ></div>
        
        {/* Logo in the absolute center */}
        <div 
          style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${currentSize.logo}px`, 
            height: `${currentSize.logo}px`,
            background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 10
          }}
        >
          <Heart 
            size={currentSize.icon} 
            style={{ color: 'white', fill: 'white' }}
          />
        </div>
      </div>
      <p className="text-gray-600 font-medium">{text}</p>
    </div>
  );
};

export default Loading;