import {
  formatBytes,
  getLensFunction,
  handleSelectedPackage,
  getSelectedPackage,
  getBundleTeam,
  getBundleName,
  unslugify,
} from "./utils";

import { groupBy } from "lodash";
import React from "react";
import { Package as Bundle } from "../types";
import { Flex as Box, Flex, Text, theme } from "@primer/components";
import { Clickable, Spacer, SecondaryText } from "./ui";
import { useHistory } from "react-router-dom";
import { useQuery } from "../hooks";

type PropsFromCaller = { bundles: Bundle[] };
type Props = PropsFromCaller;

const AllBundles: React.FC<Props> = ({ bundles }) => {
  let query = useQuery();
  let history = useHistory();

  const selectedBundle = getSelectedPackage(query, bundles);

  const lensFunction = getLensFunction(query);

  const totalHeight = 400;
  const totalSize = bundles.reduce(
    (sum, bundle) => sum + bundle.sourceFileSize,
    0
  );
  return (
    <Flex flexDirection="column" flexGrow={1}>
      {Object.entries(groupBy(bundles, (_) => getBundleTeam(_)))
        .sort((a, b) => (a[0] > b[0] ? 1 : -1))
        .map(([team, teamBundles]) => {
          const teamBundleSize = teamBundles.reduce(
            (sum, bundle) => sum + bundle.sourceFileSize,
            0
          );
          const height = Math.max(
            Math.ceil((totalHeight / totalSize) * teamBundleSize),
            2
          );

          return (
            <div key={team}>
              <Box alignItems="center">
                <Text>{unslugify(team)}</Text>
                <Spacer size={12} />
                <SecondaryText>
                  {teamBundles.length} packages = {formatBytes(teamBundleSize)}
                </SecondaryText>
              </Box>
              <Box>
                {teamBundles.map((bundle) => {
                  const width = Math.max(
                    Math.round((bundle.sourceFileSize / teamBundleSize) * 100),
                    1
                  );

                  return (
                    <Clickable
                      key={getBundleName(bundle)}
                      style={{
                        width: width + "%",
                        outlineOffset: 0,
                      }}
                      onClick={() =>
                        handleSelectedPackage(
                          history,
                          query,
                          getBundleName(bundle)
                        )
                      }
                      title={`${getBundleName(bundle)} = ${formatBytes(
                        bundle.sourceFileSize
                      )}`}
                    >
                      <Spacer size={6} />
                      <div
                        style={{
                          height,
                          background: lensFunction(bundle),
                          transition: "background 1s",
                          boxShadow: `0px 0px 0px 2px ${
                            bundle === selectedBundle
                              ? theme.colors.orange[4]
                              : "white"
                          }`,
                          borderRadius: "2px",
                        }}
                      />
                      <Spacer size={6} />
                    </Clickable>
                  );
                })}
              </Box>
              <Spacer size={12} />
            </div>
          );
        })}
    </Flex>
  );
};

export default AllBundles;
