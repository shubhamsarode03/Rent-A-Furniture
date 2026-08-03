import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/api/categoryApi';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes - categories rarely change
  });
}
