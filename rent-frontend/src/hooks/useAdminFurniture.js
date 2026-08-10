import { useQuery } from '@tanstack/react-query';
import { furnitureApi } from '@/api/furnitureApi';
import { useAuth } from './useAuth';

export function useAdminFurniture(status = null, search = '', page = 0) {
  const { isAuthenticated, user } = useAuth();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ['admin-furniture', userId, status, search, page],
    queryFn: () => furnitureApi.getAdminFurniture({ status, search, page, sort: 'createdOn,desc' }),
    enabled: isAuthenticated && !!userId,
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Provide both naming conventions for backward compatibility
  return {
    ...query,
    loading: query.isLoading,
  };
}
