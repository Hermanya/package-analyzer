import React from "react";

import {
  formatBytes,
  getReactVersion,
  getBundleTeam,
  isBundleAnApp,
  getBundleName,
  unslugify,
} from "./utils";
import { Package } from "../types";
import { Flex as Box, Heading, Text, Link, Avatar } from "@primer/components";
import { LabelText, Spacer, InteractiveText, SecondaryText } from "./ui";
import { theme } from "@primer/components";

const getBackground = (lang: string) => {
  switch (lang) {
    case "js":
      return "#f1d63b";
    case "jsx":
      return `repeating-linear-gradient(-45deg,#f1d63b,#f1d63b 6px,#61dafb 6px,#61dafb 9px)`;
    case "ts":
      return "#3075c1";
    case "tsx":
      return `repeating-linear-gradient(-45deg,#3075c1,#3075c1 6px,#61dafb 6px,#61dafb 9px)`;
    case "style":
      return "red";
    default:
      return "hotpink";
  }
};

const Languages: React.FC<{ proportions: [string, number][] }> = ({
  proportions,
}) => {
  const total = proportions.map((_) => _[1]).reduce((sum, a) => sum + a);
  return (
    <Box>
      {proportions.map(([lang, size]) => (
        <div
          key={lang}
          title={lang}
          style={{
            height: "12px",
            width: (size / total) * 100 + "%",
            outline: "2px solid white",
            transition: "1s",
            borderRadius: "2px",
            background: getBackground(lang),
          }}
        />
      ))}
    </Box>
  );
};

const TypescriptSection: React.FC<{ bundle: Package }> = ({ bundle }) => {
  let label;
  if (!bundle.tsconfig) {
    label = (
      <LabelText style={{ color: theme.colors.red[4] }}>No tsconfig!</LabelText>
    );
  } else if (
    (bundle.tsconfig.compilerOptions as any)?.noImplicitAny === false
  ) {
    label = (
      <LabelText style={{ color: theme.colors.red[4] }}>
        Implicit Any!
      </LabelText>
    );
  } else {
    label = <LabelText style={{ color: "green" }}>No Implicit Any</LabelText>;
  }
  const ts = "@ts-";
  const ignore = "ignore";
  const expectError = "expect-error";
  const tsFix = "$TSFix";
  const me = "Me";
  return (
    <div>
      <Box justifyContent="space-between">
        <LabelText style={{ color: "#3075c1" }}>Typescript</LabelText>
        {label}
      </Box>
      <Spacer size={12} />
      <Box justifyContent="space-between">
        <div>
          <Text as="strong">{bundle.tsIgnores}</Text>
          <SecondaryText>{ts + ignore}</SecondaryText>
        </div>
        <div>
          <Text as="strong">{bundle.tsExpectErrors}</Text>
          <SecondaryText>{ts + expectError}</SecondaryText>
        </div>
        <div>
          <Text as="strong">{bundle.tsFixMes}</Text>
          <SecondaryText>{tsFix + me}</SecondaryText>
        </div>
      </Box>
    </div>
  );
};

const OwnedBySection: React.FC<{
  bundle: Package;
}> = ({ bundle }) => {
  const { packageJson } = bundle;
  const team = getBundleTeam(bundle);
  return (
    <div>
      <Box justifyContent="space-between" alignItems="center">
        <LabelText>Owned by</LabelText>
        <SecondaryText>{unslugify(team)}</SecondaryText>
      </Box>
      <Spacer size={6} />
      {((packageJson as any).contributors as string[])?.map((contributor) => {
        let username: string | undefined = contributor
          .split("<")[1]
          ?.slice(1, -1);
        if (username?.includes("/")) {
          username = undefined;
        }
        return (
          <Box key={contributor} alignItems="center" mb={2}>
            {username && (
              <Avatar
                square
                mr={2}
                size={32}
                src={`https://avatars.githubusercontent.com/${username}`}
              />
            )}
            <Text>{contributor.split("<")[0]}</Text>
          </Box>
        );
      })}
    </div>
  );
};

export const BundleDetails: React.FC<{
  bundle: Package;
  bundles: Package[];
}> = ({ bundle, bundles }) => {
  const { packageJson } = bundle;
  const bundleName = getBundleName(bundle);
  const githubLink = `https://github.com/webedx-spark/web/tree/master/static/bundles/${
    bundle.directory.split("/static/bundles/")[1]
  }`;
  const reactVersion = getReactVersion(bundle);
  const team = getBundleTeam(bundle);
  return (
    <div data-e2e={`bundle-details-${bundleName}`}>
      <Heading>{unslugify(bundleName)}</Heading>
      <Spacer size={6} />
      <SecondaryText>
        <strong>{isBundleAnApp(bundle) ? "App" : "Library"}</strong> bundle
        details
      </SecondaryText>
      <Spacer size={24} />
      {(packageJson as any).description !== bundleName ? (
        <div>
          <LabelText>Description</LabelText>
          <Spacer size={6} />
          <Text>{(packageJson as any).description}</Text>
        </div>
      ) : (
        <LabelText style={{ color: theme.colors.orange[4] }}>
          Package description matches name!
        </LabelText>
      )}
      {/* @ts-ignore TS7016 */}
      {packageJson.coursera?.entryPointUrls && (
        <div>
          <Spacer size={24} />
          <details>
            <summary>
              <LabelText as="span">Entry points</LabelText>
            </summary>
            <ol>
              {/* @ts-ignore TS7016  */}
              {packageJson.coursera?.entryPointUrls.map(({ url, name }) => (
                <li key={url}>
                  <a href={url}>
                    <InteractiveText>{name}</InteractiveText>
                  </a>
                  <Spacer size={6} />
                </li>
              ))}
            </ol>
          </details>
        </div>
      )}
      <Spacer size={24} />
      <OwnedBySection bundle={bundle} />
      <Spacer size={24} />
      <Box justifyContent="space-between" alignItems="center">
        <LabelText>Source Code Languages</LabelText>
        <SecondaryText>{formatBytes(bundle.sourceFileSize)}</SecondaryText>
      </Box>
      <Spacer size={6} />
      <Languages
        proportions={Object.entries(bundle.sourceFileSizePerLanguage)}
      />
      <Spacer size={24} />
      {bundle.testFilesSize ? (
        <section>
          <Box justifyContent="space-between" alignItems="center">
            <LabelText>Testing Languages</LabelText>
            <SecondaryText>{formatBytes(bundle.testFilesSize)}</SecondaryText>
          </Box>
          <Spacer size={6} />
          <Languages
            proportions={Object.entries(bundle.testFileSizePerLanguage)}
          />
        </section>
      ) : (
        <LabelText
          style={{
            color: theme.colors.red[4],
          }}
        >
          No Tests!
        </LabelText>
      )}
      <Spacer size={24} />
      {bundle.storyFilesSize ? (
        <section>
          <Box justifyContent="space-between" alignItems="center">
            <LabelText>Storybook Languages</LabelText>
            <SecondaryText>{formatBytes(bundle.storyFilesSize)}</SecondaryText>
          </Box>
          <Spacer size={6} />
          <Languages
            proportions={Object.entries(bundle.storyFileSizePerLanguage)}
          />
        </section>
      ) : (
        <LabelText
          style={{
            color: theme.colors.orange[4],
          }}
        >
          No Storybook!
        </LabelText>
      )}
      <Spacer size={24} />
      <TypescriptSection bundle={bundle} />
      {isBundleAnApp(bundle) && reactVersion && (
        <div>
          <Spacer size={24} />
          <LabelText style={{ color: "#61dafb" }}>
            React {reactVersion}
          </LabelText>
        </div>
      )}
      <Spacer size={24} />
      <Box>
        <Link href={githubLink} target="_blank" rel="noopener noreferrer">
          GitHub
        </Link>
        {isBundleAnApp(bundle) && (
          <Box>
            <Spacer size={12} />
            <Link
              href={`https://tools.coursera.org/r2/apps/${bundleName}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              R2
            </Link>
            <Spacer size={12} />
            <Link
              href={`https://sentry.io/coursera/${bundleName}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Sentry
            </Link>
            <Spacer size={12} />
            <Link
              href={`https://app.datadoghq.com/account/login/id/MO50jT?next=%2Fdashboard%2Fajg-vhv-3qj%2Frender-application-dash?tpl_var_app=${bundleName}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Datadog
            </Link>
          </Box>
        )}
      </Box>
      <Spacer size={24} />
      {bundle.dependents.length > 0 && (
        <>
          <details>
            <summary>
              <LabelText as="span">Dependent bundles</LabelText>
            </summary>
            <ol>
              {(bundle.dependents as string[]).sort().map((dependent) => {
                const otherBundle = bundles.find(
                  (_) => _.importName === dependent
                );
                const otherTeam = getBundleTeam(otherBundle);
                return (
                  <li key={dependent}>
                    <Text>{dependent.slice("bundles/".length)}</Text>
                    {otherBundle && otherTeam !== team && (
                      <SecondaryText as="small">
                        {isBundleAnApp(otherBundle) ? "app" : "lib"} from{" "}
                        {otherTeam}
                      </SecondaryText>
                    )}
                  </li>
                );
              })}
            </ol>
          </details>
          <Spacer size={24} />
        </>
      )}
      {bundle.dependencies.length > 0 && (
        <>
          <details>
            <summary>
              <LabelText as="span">Bundle dependencies</LabelText>
            </summary>
            <ol>
              {(bundle.dependencies as string[])
                .sort()
                .filter((_) => _.startsWith("bundles/"))
                .map((dependency) => {
                  const otherBundle = bundles.find(
                    (_) => _.importName === dependency
                  );
                  const otherTeam = getBundleTeam(otherBundle);
                  return (
                    <li key={dependency}>
                      <Text>{dependency.slice("bundles/".length)}</Text>
                      {otherBundle && otherTeam !== team && (
                        <SecondaryText as="small">
                          {isBundleAnApp(otherBundle) ? "app" : "lib"} from{" "}
                          {otherTeam}
                        </SecondaryText>
                      )}
                    </li>
                  );
                })}
            </ol>
          </details>
          <Spacer size={24} />
        </>
      )}
      {bundle.dependencies.length > 0 && (
        <>
          <details>
            <summary>
              <LabelText as="span">Other dependencies</LabelText>
            </summary>
            <ol>
              {(bundle.dependencies as string[])
                .filter((_) => !_.startsWith("bundles/"))
                .sort()
                .map((_) => (
                  <li key={_}>
                    <Text>{_}</Text>
                  </li>
                ))}
            </ol>
          </details>
          <Spacer size={24} />
        </>
      )}
    </div>
  );
};
