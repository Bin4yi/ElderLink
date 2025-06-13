// frontend/src/components/common/Loading.js
import React from 'react';

const Loading = ({ text = 'Loading...', size = 'large' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`loading-spinner ${sizeClasses[size]} mb-4`}></div>
      <p className="text-gray-600 font-medium">{text}</p>
    </div>
  );
};

export default Loading;