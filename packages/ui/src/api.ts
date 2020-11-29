export const fetchMetadata = (projectId: string, selectedRevision?: string) => {
  const url = `https://4r8pobcqh9.execute-api.us-east-1.amazonaws.com/dev/metadata/${projectId}`;
  return fetch(
    selectedRevision ? `${url}/${selectedRevision}` : url
  ).then((_) => _.json());
};

export const fetchProject = (slug?: string) => {
  const url = `https://4r8pobcqh9.execute-api.us-east-1.amazonaws.com/dev/project/${slug}`;
  return fetch(url).then((_) => _.json());
};
