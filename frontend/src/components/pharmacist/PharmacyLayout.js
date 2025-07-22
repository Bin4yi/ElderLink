import React from 'react';
import Sidebar from '../common/Sidebar';

const PharmacyLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PharmacyLayout;
