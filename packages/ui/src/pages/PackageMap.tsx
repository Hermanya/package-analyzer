import {
  Box,
  Flex,
  LabelGroup,
  Label,
  SideNav,
  Flash,
  Truncate,
} from "@primer/components";
import React from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { fetchMetadata, fetchProject } from "../api";
import AllBundles from "../components/AllBundles";
import { BundleDetails } from "../components/BundleDetails";
import { BundleSearch } from "../components/BundleSearch";
import {
  Clickable,
  LabelText,
  Spacer,
  Text,
  InteractiveText,
} from "../components/ui";
import {
  getLegend,
  getSelectedLens,
  getSelectedPackage,
  getSelectedRevision,
  handleSelectedPackage,
  unslugify,
} from "../components/utils";
import { useQuery } from "../hooks";
import { ProjectData } from "../types";
export const PackageMap: React.FC<{}> = () => {
  let query = useQuery();
  let history = useHistory();
  let match = useRouteMatch("/:slug/");

  const { slug } = match?.params as any;
  const revision = getSelectedRevision(query);

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
    fetchMetadata(project.id, revision).then((response) =>
      setMetadata(response)
    );
  }, [project, revision]);

  if (!metadata) {
    return <div>Loading...</div>;
  }

  const packages = metadata?.packages ?? [];
  const selectedBundle = getSelectedPackage(query, packages);

  return (
    <Flex maxHeight="calc(100vh - 64px - 18px)">
      <Spacer size={32} />

      <Box width={256} overflowY="auto">
        <Spacer size={32} />

        <BundleSearch
          bundles={packages}
          onBundleSelected={(name: string) => {
            handleSelectedPackage(history, query, name);
          }}
        />
        {revision && (
          <div>
            <Spacer size={32} />
            <Flash variant="warning">
              <Truncate as="code" title={revision} maxWidth={200}>
                {revision}
              </Truncate>
              revision selected!{" "}
              <Clickable
                onClick={() => {
                  query.delete("revision");

                  history.push(`${window.location.pathname}?${query}`);
                }}
              >
                <InteractiveText>See master</InteractiveText>
              </Clickable>
            </Flash>
          </div>
        )}
        <Spacer size={32} />
        <LabelText>Color lens</LabelText>
        <Spacer size={6} />
        <SideNav>
          {["apps-and-libs", "typescript", "tests", "lodash"].map((lens) => {
            return (
              <SideNav.Link
                key={lens}
                // as={Clickable}
                onClick={() => {
                  query.set("lens", lens);

                  history.push(`${window.location.pathname}?${query}`);
                }}
                selected={getSelectedLens(query) === lens}
              >
                <Text>{unslugify(lens)}</Text>
              </SideNav.Link>
            );
          })}
        </SideNav>
        <Spacer size={32} />
        <LabelText>Legend</LabelText>
        <Spacer size={6} />
        <LabelGroup>
          {getLegend(getSelectedLens(query)).map(({ name, value: color }) => (
            <Label key={name} bg={`${color}.4`}>
              {name}
            </Label>
          ))}
        </LabelGroup>
      </Box>
      <Spacer size={32} />
      <Flex flexDirection="column" overflowY="auto" flexGrow={1}>
        <Spacer size={32} />
        <AllBundles bundles={packages} />
      </Flex>
      <Spacer size={32} />
      <Box width={400} overflowY="auto">
        <Spacer size={32} />
        {selectedBundle && (
          <BundleDetails bundle={selectedBundle} bundles={packages} />
        )}
      </Box>
      <Spacer size={32} />
    </Flex>
  );
};
