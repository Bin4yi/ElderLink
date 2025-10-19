// frontend/src/components/common/Loading.js
import React from 'react';
import { Heart } from 'lucide-react';

const Loading = ({ text = 'Loading...', size = 'large' }) => {
  const sizeConfig = {
    small: { spinner: 48, logo: 24, icon: 16 },
    medium: { spinner: 64, logo: 32, icon: 20 },
    large: { spinner: 80, logo: 40, icon: 24 }
  };

  const currentSize = sizeConfig[size];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '32px',
      minHeight: '200px'
    }}>
      <div style={{ 
        position: 'relative', 
        display: 'inline-block', 
        marginBottom: '16px',
        width: `${currentSize.spinner}px`,
        height: `${currentSize.spinner}px`,
        flexShrink: 0
      }}>
        {/* Spinning border */}
        <div 
          style={{ 
            width: `${currentSize.spinner}px`,
            height: `${currentSize.spinner}px`,
            minWidth: `${currentSize.spinner}px`,
            minHeight: `${currentSize.spinner}px`,
            maxWidth: `${currentSize.spinner}px`,
            maxHeight: `${currentSize.spinner}px`,
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #ef4444',
            borderRight: '3px solid #f97316',
            borderBottom: '3px solid #d946ef',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            boxSizing: 'border-box',
            aspectRatio: '1 / 1'
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
            minWidth: `${currentSize.logo}px`,
            minHeight: `${currentSize.logo}px`,
            maxWidth: `${currentSize.logo}px`,
            maxHeight: `${currentSize.logo}px`,
            background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 10,
            aspectRatio: '1 / 1'
          }}
        >
          <Heart 
            size={currentSize.icon} 
            style={{ color: 'white', fill: 'white' }}
          />
        </div>
      </div>
      <p style={{ 
        color: '#4b5563', 
        fontWeight: 500,
        fontSize: '14px',
        margin: 0
      }}>{text}</p>
    </div>
  );
};

export default Loading;