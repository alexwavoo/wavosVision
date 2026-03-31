import { useQuery } from '@tanstack/react-query';
import { fetchCollections } from '../utils/contentfulApi';

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: fetchCollections,
    staleTime: 5 * 60 * 1000,
  });
}
