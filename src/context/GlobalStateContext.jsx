import { createContext, useContext, useCallback, useState } from 'react';
import { cartApi } from '@/api/cartApi';
import { categoryApi } from '@/api/categoryApi';
import { furnitureApi } from '@/api/furnitureApi';

const GlobalStateContext = createContext(null);

export function GlobalStateProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [categories, setCategories] = useState(null);
  const [publicFurniture, setPublicFurniture] = useState(null);

  const refreshCart = useCallback(async () => {
    try {
      const data = await cartApi.getCart();
      setCart(data);
      return data;
    } catch (error) {
      console.error('Failed to refresh cart:', error);
      throw error;
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
      return data;
    } catch (error) {
      console.error('Failed to refresh categories:', error);
      throw error;
    }
  }, []);

  const refreshPublicFurniture = useCallback(async (params = {}) => {
    try {
      const data = await furnitureApi.getPublicFurniture(params);
      setPublicFurniture(data);
      return data;
    } catch (error) {
      console.error('Failed to refresh furniture:', error);
      throw error;
    }
  }, []);

  const invalidateCart = useCallback(() => {
    setCart(null);
  }, []);

  const invalidateCategories = useCallback(() => {
    setCategories(null);
  }, []);

  const invalidatePublicFurniture = useCallback(() => {
    setPublicFurniture(null);
  }, []);

  const value = {
    cart,
    categories,
    publicFurniture,
    refreshCart,
    refreshCategories,
    refreshPublicFurniture,
    invalidateCart,
    invalidateCategories,
    invalidatePublicFurniture,
  };

  return <GlobalStateContext.Provider value={value}>{children}</GlobalStateContext.Provider>;
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
}
