import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../config/api';

const RestaurantStatusContext = createContext();

export const RestaurantStatusProvider = ({ children }) => {
  const [statuses, setStatuses] = useState({});
  const [lastCheck, setLastCheck] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatuses = useCallback(async () => {
    try {
      const response = await api.get('/api/restaurants/status');
      const data = response.data;

      if (data.statuses) {
        setStatuses(data.statuses);
        setLastCheck(data.metadata?.lastChecked);
      }
    } catch (error) {
      console.error('Status pre-fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 5000);
    return () => clearInterval(interval);
  }, [fetchStatuses]);

  return (
    <RestaurantStatusContext.Provider value={{
      statuses,
      lastCheck,
      isLoading,
      refreshStatuses: fetchStatuses
    }}>
      {children}
    </RestaurantStatusContext.Provider>
  );
};

export const useRestaurantStatus = () => {
  const context = useContext(RestaurantStatusContext);
  if (!context) {
    throw new Error('useRestaurantStatus must be used within a RestaurantStatusProvider');
  }
  return context;
};
