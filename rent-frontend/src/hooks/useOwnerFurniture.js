import { useQuery } from '@tanstack/react-query';
import { furnitureApi } from '@/api/furnitureApi';
import { useAuth } from './useAuth';

export function useOwnerFurniture(status = null, search = '', page = 0) {
  const { isAuthenticated, user } = useAuth();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ['owner-furniture', userId, status, search, page],
    queryFn: () => furnitureApi.getOwnerFurniture({ status, search, page, sort: 'createdOn,desc' }),
    enabled: isAuthenticated && !!userId,
    keepPreviousData: true,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
  });

  // Provide both naming conventions for backward compatibility
  return {
    ...query,
    loading: query.isLoading,
  };
}
