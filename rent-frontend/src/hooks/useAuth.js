import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { canBrowse, canUseCart, canCheckout, canViewOrders, canManageFurniture, canManageCategories, canVerifyFurniture, canManageUsers } from '@/utils/constants';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  
  const userId = context.user?.id;
  
  return {
    ...context,
    userId,
    permissions: {
      canBrowse: canBrowse(context.role),
      canUseCart: canUseCart(context.role),
      canCheckout: canCheckout(context.role),
      canViewOrders: canViewOrders(context.role),
      canManageFurniture: canManageFurniture(context.role),
      canManageCategories: canManageCategories(context.role),
      canVerifyFurniture: canVerifyFurniture(context.role),
      canManageUsers: canManageUsers(context.role),
    }
  };
}
