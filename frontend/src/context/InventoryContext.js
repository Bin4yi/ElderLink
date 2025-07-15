import React, { createContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = (item) => {
    const quantity = parseInt(item.quantity);
    const newItem = {
      ...item,
      id: uuidv4(),
      quantity,
      reorderTriggered: quantity < 10,
      status: quantity === 0 ? 'Out of Stock' : 'Available',
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setItems((prev) => [...prev, newItem]);
  };

  return (
    <InventoryContext.Provider value={{ items, setItems, addItem }}>
      {children}
    </InventoryContext.Provider>
  );
};
