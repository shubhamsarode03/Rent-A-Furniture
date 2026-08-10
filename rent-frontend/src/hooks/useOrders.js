import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/api/orderApi';
import { useAuth } from './useAuth';

// RENTER uses /orders/my, ADMIN uses /orders
export function useOrders(isAdmin = false, page = 0) {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ['orders', userId, isAdmin, page],
    queryFn: () => isAdmin ? orderApi.getAllOrders({ page, sort: 'createdOn,desc' }) : orderApi.getMyOrders({ page, sort: 'createdOn,desc' }),
    enabled: isAuthenticated && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => orderApi.updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', userId] });
    },
  });

  // Provide both naming conventions for backward compatibility
  return {
    ...query,
    loading: query.isLoading,
    updateStatus: updateStatusMutation.mutate,
  };
}

export function useOrderDetail(id) {
  const { isAuthenticated, user } = useAuth();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ['order', userId, id],
    queryFn: () => orderApi.getOrderById(id),
    enabled: !!id && isAuthenticated && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Provide both naming conventions for backward compatibility
  return {
    ...query,
    loading: query.isLoading,
  };
}
