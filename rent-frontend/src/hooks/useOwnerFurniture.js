import { useQuery } from '@tanstack/react-query';
import { furnitureApi } from '@/api/furnitureApi';
import { useAuth } from './useAuth';

export function useOwnerFurniture(status = null, search = '', page = 0) {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ['owner-furniture', status, search, page],
    queryFn: () => furnitureApi.getOwnerFurniture({ status, search, page, sort: 'createdOn,desc' }),
    enabled: isAuthenticated,
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Provide both naming conventions for backward compatibility
  return {
    ...query,
    loading: query.isLoading,
  };
}
