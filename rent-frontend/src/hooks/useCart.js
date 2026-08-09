import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/api/cartApi';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export function useCart() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
    staleTime: 0, // Always fresh cart data
  });

  const addToCartMutation = useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Product added to cart successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0] || 'Could not add to cart';
      toast.error(message);
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: cartApi.removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Removed from cart');
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0] || 'Could not remove item';
      toast.error(message);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart cleared');
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0] || 'Could not clear cart';
      toast.error(message);
    },
  });

  return {
    data: data || [],
    isLoading,
    error,
    addItem: addToCartMutation.mutate,
    removeItem: removeFromCartMutation.mutate,
    clear: clearCartMutation.mutate,
  };
}
