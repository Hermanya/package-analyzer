import { Box, Flex } from "@primer/components";
import React from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { ProjectData } from "../types";
import AllBundles from "../components/AllBundles";
import { BundleDetails } from "../components/BundleDetails";
import { BundleSearch } from "../components/BundleSearch";
import { Spacer } from "../components/ui";
import { getSelectedPackage, handleSelectedPackage } from "../components/utils";
import { useQuery } from "../hooks";
import { fetchMetadata, fetchProject } from "../api";
export const PackageMap: React.FC<{}> = () => {
  let query = useQuery();
  let history = useHistory();
  let match = useRouteMatch("/:slug/");

  const { slug } = match?.params as any;

  const [project, setProject] = React.useState<any | undefined>(undefined);
  const [metadata, setMetadata] = React.useState<ProjectData | undefined>(
    undefined
  );

  React.useEffect(() => {
    fetchProject(slug).then((response) => setProject(response));
  }, [slug]);

  React.useEffect(() => {
    if (!project) {
      return;
    }
    fetchMetadata(project.id).then((response) => setMetadata(response));
  }, [project]);

  if (!metadata) {
    return <div>Loading...</div>;
  }

  const packages = metadata?.packages ?? [];
  const selectedBundle = getSelectedPackage(query, packages);

  return (
    <Flex maxHeight="calc(100vh - 64px - 18px)">
      <Spacer size={32} />
      <Flex flexDirection="column" overflowY="auto" flexGrow={1}>
        <Spacer size={18} />
        <AllBundles bundles={packages} />
      </Flex>
      <Spacer size={32} />
      <Box width={400} overflowY="auto">
        <Spacer size={18} />

        <BundleSearch
          bundles={packages}
          onBundleSelected={(name: string) => {
            handleSelectedPackage(history, query, name);
          }}
        />
        <Spacer size={32} />
        {selectedBundle && (
          <BundleDetails bundle={selectedBundle} bundles={packages} />
        )}
      </Box>
      <Spacer size={32} />
    </Flex>
  );
};
