import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedImages } from '../utils/contentfulApi';

export function useFeaturedImages(enabled) {
  return useQuery({
    queryKey: ['featuredImages'],
    queryFn: fetchFeaturedImages,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
