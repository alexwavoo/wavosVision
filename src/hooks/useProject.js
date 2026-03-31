import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProject } from '../utils/contentfulApi';

export function useProject(projectId) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => {
      const allProjectQueries = queryClient.getQueriesData({ queryKey: ['projects'] });
      for (const [, projects] of allProjectQueries) {
        if (Array.isArray(projects)) {
          const found = projects.find((p) => p.id === projectId);
          if (found) return found;
        }
      }
      return fetchProject(projectId);
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId,
  });
}
