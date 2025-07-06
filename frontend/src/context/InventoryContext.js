import React, { createContext, useState } from 'react';

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = (item) => {
    setItems((prevItems) => [...prevItems, item]);
  };

  return (
    <InventoryContext.Provider value={{ items, addItem, setItems }}>
      {children}
    </InventoryContext.Provider>
  );
};
