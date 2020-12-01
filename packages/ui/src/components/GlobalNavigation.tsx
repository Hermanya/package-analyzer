import { Header, StyledOcticon } from "@primer/components";
import {
  BugIcon,
  LightBulbIcon,
  MarkGithubIcon,
  PackageIcon,
} from "@primer/octicons-react";
import React from "react";
import { useRouteMatch } from "react-router-dom";
import { unslugify } from "./utils";

export const GlobalNavigation: React.FC<{}> = () => {
  let match = useRouteMatch("/:slug/");
  const slug = (match?.params as any)?.slug;
  return (
    <Header>
      <Header.Item>
        <Header.Link fontSize={2}>
          <StyledOcticon icon={PackageIcon} size={32} mr={2} />
          <span>{unslugify(slug)}'s packages</span>
        </Header.Link>
      </Header.Item>
      {/* <Header.Item>
        <Header.Link as={Link} to={`/${slug}/map`}>
          Map
        </Header.Link>
      </Header.Item> */}
      <Header.Item full></Header.Item>

      <Header.Item mr={4}>
        <Header.Link
          {...({
            href: "https://github.com/Hermanya/package-analyzer/",
          } as any)}
        >
          <StyledOcticon icon={MarkGithubIcon} mr={1} />
          Repo
        </Header.Link>
      </Header.Item>
      <Header.Item mr={4}>
        <Header.Link
          {...({
            href:
              "https://github.com/Hermanya/package-analyzer/issues/new?labels=enhancement",
          } as any)}
        >
          <StyledOcticon icon={LightBulbIcon} mr={1} />
          Suggestion
        </Header.Link>
      </Header.Item>
      <Header.Item mr={0}>
        <Header.Link
          {...({
            href:
              "https://github.com/Hermanya/package-analyzer/issues/new?labels=bug",
          } as any)}
        >
          <StyledOcticon icon={BugIcon} mr={1} />
          Bug
        </Header.Link>
      </Header.Item>
    </Header>
  );
};
