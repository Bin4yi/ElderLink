// frontend/src/components/common/Modal.js
import React from 'react';

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl">&times;</button>
      {children}
    </div>
  </div>
);

export default Modal;
