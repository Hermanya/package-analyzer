import { Bundle } from "./types";
import { History } from "history";
import { theme } from "@primer/components";

export function formatBytes(a: number, b = 2) {
  // from https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
  if (a === 0) {
    return "0 Bytes";
  }
  const c = b < 0 ? 0 : b;
  const d = Math.floor(Math.log(a) / Math.log(1024));
  return (
    parseFloat((a / 1024 ** d).toFixed(c)) +
    " " +
    ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
  );
}

export function unslugify(slug: string) {
  if (!slug) {
    return "";
  }
  const result = slug.replace(/-/g, " ");
  return result.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export const getBundleName = (bundle?: Bundle) =>
  bundle?.packageJson.name ?? "unnamed";
export const getBundleTeam = (bundle?: Bundle) =>
  bundle?.packageJson.courseraOwners?.team || "unclaimed";
export const isBundleAnApp = (bundle?: Bundle) => bundle?.packageJson.r2?.app;

export const getReactVersion = (bundle: Bundle) => {
  const { dependencies } = bundle.packageJson;
  const version =
    dependencies?.["react"] ||
    dependencies?.["react-16"] ||
    dependencies?.["react-16-13"];
  return version;
};

export const getSelectedPackage = (
  query: URLSearchParams,
  bundles: Bundle[]
) => {
  return bundles.find((_) => getBundleName(_) === query.get("package"));
};

export const handleSelectedPackage = (
  history: History,
  query: URLSearchParams,
  value: string
) => {
  query.set("package", value);
  history.push(`${window.location.pathname}?${query}`);
};

export const getSelectedTeam = (query: URLSearchParams): string | undefined => {
  return query.get("team") ?? undefined;
};

export const handleSelectedTeam = (
  history: History,
  query: URLSearchParams,
  team?: string
) => {
  history.push(`/bundle-explorer/${team}?${query}`);
};

export const handleUnselectedTeam = (
  history: History,
  query: URLSearchParams
) => {
  history.push(`/bundle-explorer?${query}`);
};

export const getSelectedLens = (query: URLSearchParams) => {
  return query.get("lens") ?? "apps-and-libs";
};

export const handleSelectedLens = (
  history: History,
  query: URLSearchParams,
  lens: string
) => {
  query.set("lens", lens);
  history.push("?" + query.toString());
};

export const getSelectedRevision = (
  query: URLSearchParams
): string | undefined => {
  return query.get("revision") ?? undefined;
};

export const getLensFunction = (query: URLSearchParams) => {
  const lens = getSelectedLens(query);
  switch (lens) {
    case "apps-and-libs":
      return (bundle: Bundle) =>
        isBundleAnApp(bundle) ? theme.colors.blue[4] : theme.colors.gray[4];
    case "typescript":
      return (bundle: Bundle) => {
        if (!bundle.tsconfig) {
          return theme.colors.red[4];
        } else if (
          bundle.sourceFileSizePerLanguage.js > 0 ||
          bundle.sourceFileSizePerLanguage.jsx > 0
        ) {
          return theme.colors.orange[4];
        } else if (bundle.tsconfig?.compilerOptions?.noImplicitAny === false) {
          return theme.colors.yellow[4];
        } else {
          return theme.colors.green[4];
        }
      };
    case "tests":
      return (bundle: Bundle) =>
        bundle.testFilesSize ? theme.colors.green[4] : theme.colors.red[4];

    case "lodash":
      return (bundle: Bundle) => {
        const dependencies: string[] = bundle.dependencies;
        const underscore = dependencies.includes("underscore");
        const lodash = dependencies.includes("lodash");
        if (underscore && lodash) {
          return theme.colors.red[4];
        } else if (lodash) {
          return theme.colors.green[4];
        } else if (underscore) {
          return theme.colors.orange[4];
        } else {
          return theme.colors.gray[4];
        }
      };

    default:
      return () => theme.colors.blue[4];
  }
};

export const getLegend = (lens: string) => {
  switch (lens) {
    case "apps-and-libs":
      return [
        {
          name: "Application",
          value: "blue",
        },
        {
          name: "Library",
          value: "gray",
        },
      ];
    case "tests":
      return [
        {
          name: "Contains tests",
          value: "green",
        },
        {
          name: "No tests",
          value: "red",
        },
      ];
    case "typescript":
      return [
        {
          name: "No tsconfig",
          value: "red",
        },
        {
          name: "Contains JS source code",
          value: "orange",
        },
        {
          name: "Implicit any",
          value: "yellow",
        },
        {
          name: "No implicit any",
          value: "green",
        },
      ];

    case "lodash":
      return [
        {
          name: "Lodash",
          value: "green",
        },
        {
          name: "Underscore",
          value: "orange",
        },
        {
          name: "Both",
          value: "red",
        },
        {
          name: "Neither",
          value: "gray",
        },
      ];

    default:
      return [];
  }
};
