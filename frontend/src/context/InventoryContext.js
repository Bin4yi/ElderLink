import React, { createContext, useState, useEffect } from 'react';

import { v4 as uuidv4 } from 'uuid';

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = async (item) => {
    const quantity = parseInt(item.quantity);
  
    const newItem = {
      ...item,
      quantity,
      reorderTriggered: quantity < 10,
      status: quantity === 0 ? 'Out of Stock' : 'Available',
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  
    try {
      // 🔥 Save to backend
      const res = await fetch('http://localhost:5002/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
  
      if (res.ok) {
        const savedItem = await res.json();
        // ✅ Update local state with saved DB item
        setItems((prev) => [...prev, savedItem]);
      } else {
        console.error('❌ Failed to save item');
      }
    } catch (error) {
      console.error('❌ Error adding item:', error);
    }
  };
  

  const fetchItems = async () => {
    const res = await fetch('http://localhost:5002/api/inventory');
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchItems();  // Fetch items once when context provider mounts
  }, []);


  return (
    <InventoryContext.Provider value={{ items, setItems, addItem, fetchItems }}>
      {children}
    </InventoryContext.Provider>
  );
};
