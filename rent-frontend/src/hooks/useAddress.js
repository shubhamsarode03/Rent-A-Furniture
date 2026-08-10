import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressApi } from '@/api/addressApi';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export function useAddress() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const userId = user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['addresses', userId],
    queryFn: addressApi.getAddresses,
    enabled: isAuthenticated && !!userId,
  });

  const createAddressMutation = useMutation({
    mutationFn: addressApi.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
      toast.success('Address added successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0] || 'Could not add address';
      toast.error(message);
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }) => addressApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
      toast.success('Address updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0] || 'Could not update address';
      toast.error(message);
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: addressApi.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
      toast.success('Address deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0] || 'Could not delete address';
      toast.error(message);
    },
  });

  return {
    data: data || [],
    isLoading,
    error,
    createAddress: createAddressMutation.mutate,
    updateAddress: updateAddressMutation.mutate,
    deleteAddress: deleteAddressMutation.mutate,
  };
}
