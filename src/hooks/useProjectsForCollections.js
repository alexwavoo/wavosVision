import { useQueries } from '@tanstack/react-query';
import { fetchProjectsForCollection } from '../utils/contentfulApi';

export function useProjectsForCollections(collections) {
  const queries = useQueries({
    queries: (collections || []).map((col) => ({
      queryKey: ['projects', col.sys.id],
      queryFn: () => fetchProjectsForCollection(col.sys.id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const projectsData = {};
  let allLoaded = true;
  let hasError = false;

  (collections || []).forEach((col, i) => {
    const q = queries[i];
    if (q.data) {
      projectsData[col.sys.id] = q.data;
    } else {
      allLoaded = false;
    }
    if (q.error) hasError = true;
  });

  return {
    projectsData,
    allLoaded: allLoaded && (collections || []).length > 0,
    isLoading: queries.some((q) => q.isLoading),
    hasError,
    queries,
  };
}
