import React, { createContext, useState, useEffect } from 'react';

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

  // Fetch all items from backend
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/inventory`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status}`);
      }
      
      const data = await response.json();
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new item to backend
  const addItem = async (newItem) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        throw new Error(`Failed to add item: ${response.status}`);
      }

      const savedItem = await response.json();
      setItems(prevItems => [...prevItems, savedItem]);
      return savedItem;
    } catch (err) {
      console.error('Error adding item:', err);
      throw err;
    }
  };

  // Update item in backend
  const updateItem = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update item: ${response.status}`);
      }

      const updatedItem = await response.json();
      setItems(prevItems => 
        prevItems.map(item => item.id === id ? updatedItem : item)
      );
      return updatedItem;
    } catch (err) {
      console.error('Error updating item:', err);
      throw err;
    }
  };

  // Delete item from backend
  const deleteItem = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.status}`);
      }

      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      throw err;
    }
  };

  // Fetch items when component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  const value = {
    items,
    setItems,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshItems: fetchItems,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};