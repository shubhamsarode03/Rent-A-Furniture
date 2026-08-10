import { useQuery } from '@tanstack/react-query';
import { furnitureApi } from '@/api/furnitureApi';

export function useFurnitureList(filters = {}, page = 0) {
  return useQuery({
    queryKey: ['furniture', filters, page],
    queryFn: () => furnitureApi.getPublicFurniture({ ...filters, page, sort: 'createdOn,desc' }),
    keepPreviousData: true,
    staleTime: 0, // Always fetch fresh data
  });
}
