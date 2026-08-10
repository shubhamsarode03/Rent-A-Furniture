import { useQuery } from '@tanstack/react-query';
import { furnitureApi } from '@/api/furnitureApi';
import { useAuth } from './useAuth';

export function useFurnitureDetail(id) {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ['furniture', id],
    queryFn: () => furnitureApi.getFurnitureById(id),
    enabled: !!id, // This is public data, doesn't require authentication
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Provide both naming conventions for backward compatibility
  return {
    ...query,
    loading: query.isLoading,
  };
}
