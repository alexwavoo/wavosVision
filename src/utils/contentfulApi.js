const SPACE_ID = import.meta.env.REACT_APP_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = import.meta.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN;
const REST_BASE = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/master`;
const GRAPHQL_BASE = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}/environments/master`;

export async function fetchCollections() {
  const res = await fetch(
    `${REST_BASE}/entries?access_token=${ACCESS_TOKEN}&content_type=collection&include=2`
  );
  if (!res.ok) throw new Error('Failed to fetch collections');
  const data = await res.json();
  return data.items.map((item) => ({
    sys: { id: item.sys.id },
    title: item.fields.title,
    thumbnail: {
      url: data.includes.Asset.find(
        (asset) => asset.sys.id === item.fields.thumbnail.sys.id
      )?.fields.file.url,
    },
  }));
}

export async function fetchFeaturedImages() {
  const res = await fetch(GRAPHQL_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query {
          featuredImagesCollection(limit: 3) {
            items {
              name
              imagesCollection(limit: 150) {
                items {
                  sys { id }
                  title
                  url
                  width
                  height
                }
              }
            }
          }
        }
      `,
    }),
  });
  if (!res.ok) throw new Error('Failed to fetch featured images');
  const json = await res.json();
  const cols = json.data.featuredImagesCollection?.items || [];

  const mapImages = (collection) =>
    (collection?.imagesCollection?.items || []).map((item) => ({
      sys: { id: item.sys.id },
      fields: {
        title: item.title,
        file: { url: item.url },
        width: item.width,
        height: item.height,
      },
    }));

  return {
    clientImages: mapImages(cols.find((c) => c.name === 'Client Facing')),
    signatureImages: mapImages(cols.find((c) => c.name === 'Signature Direction')),
  };
}

export async function fetchProjectsForCollection(collectionId) {
  const res = await fetch(GRAPHQL_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query {
          collection(id: "${collectionId}") {
            sys { id }
            projectsCollection {
              items {
                sys { id }
                ... on Project {
                  title
                  description { json }
                  thumbnail { url }
                  imagesCollection {
                    items {
                      sys { id }
                      url
                    }
                    total
                  }
                }
              }
            }
          }
        }
      `,
    }),
  });
  if (!res.ok) throw new Error(`Failed to fetch projects for collection ${collectionId}`);
  const { data, errors } = await res.json();
  if (errors) throw new Error(errors[0]?.message || 'GraphQL error');

  return (
    data.collection?.projectsCollection?.items.map((project) => ({
      id: project.sys.id,
      title: project.title,
      description: project.description,
      thumbnail: project.thumbnail?.url,
      imagesCollection: {
        items: project.imagesCollection?.items.map((img) => ({
          id: img.sys.id,
          url: img.url,
        })),
        total: project.imagesCollection?.total,
      },
    })) || []
  );
}

export async function fetchProject(projectId) {
  const res = await fetch(GRAPHQL_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query {
          project(id: "${projectId}") {
            sys { id }
            title
            description { json }
            thumbnail { url }
            imagesCollection {
              items {
                sys { id }
                url
              }
              total
            }
          }
        }
      `,
    }),
  });
  if (!res.ok) throw new Error('Failed to fetch project');
  const { data, errors } = await res.json();
  if (errors) throw new Error(errors[0]?.message || 'GraphQL error');
  const project = data?.project;
  if (!project) return null;
  return {
    id: project.sys.id,
    title: project.title,
    description: project.description,
    thumbnail: project.thumbnail?.url,
    imagesCollection: {
      items: project.imagesCollection?.items.map((img) => ({
        id: img.sys.id,
        url: img.url,
      })),
      total: project.imagesCollection?.total,
    },
  };
}
