import { useMemo } from 'react';

function matchImages(featuredImages, projectsData) {
  const matched = [];
  featuredImages.forEach((img) => {
    for (const [collectionId, projects] of Object.entries(projectsData)) {
      for (const project of projects) {
        const match = project.imagesCollection.items.find(
          (pi) => pi.id === img.sys.id
        );
        if (match) {
          matched.push({
            imageId: img.sys.id,
            imageUrl: img.fields.file.url,
            imageWidth: img.fields.width,
            imageHeight: img.fields.height,
            projectId: project.id,
            projectTitle: project.title,
            collectionId,
          });
          break;
        }
      }
    }
  });
  return matched;
}

export function useMatchedImages(clientImages, signatureImages, projectsData, allLoaded) {
  const finalClientImages = useMemo(() => {
    if (!allLoaded || !clientImages?.length) return [];
    return matchImages(clientImages, projectsData);
  }, [clientImages, projectsData, allLoaded]);

  const finalSignatureImages = useMemo(() => {
    if (!allLoaded || !signatureImages?.length) return [];
    return matchImages(signatureImages, projectsData);
  }, [signatureImages, projectsData, allLoaded]);

  const dataFetched = allLoaded && (finalClientImages.length > 0 || finalSignatureImages.length > 0);

  return { finalClientImages, finalSignatureImages, dataFetched };
}
