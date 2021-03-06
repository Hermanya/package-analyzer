import fastGlob from "fast-glob";
import { Bundle } from "./types";
import {
  tryCatch,
  getFileContents,
  addDependencies,
  addDependents,
  addTsIgnores,
  addFileSize
} from "./utils";
import fetch from "node-fetch";

const collectPackageMetadata = async ({
  root,
  revision,
  ref,
  projectId,
  secret
}: {
  root: string;
  revision: string;
  ref: string;
  projectId: string;
  secret: string;
}) => {
  const ignore = ["**/node_modules/**", "**/vendor/**"];

  const files: string[] = fastGlob.sync(`${root}**/*.(jsx|tsx|js|ts|styl)`, {
    onlyFiles: true,
    ignore
  });

  const packages: Bundle[] = fastGlob
    .sync(`${root}**/package.json`, {
      onlyFiles: true,
      ignore
    })
    .map((packageLocation: string) => {
      const directory =
        packageLocation
          .split("/")
          .slice(0, -1)
          .join("/") + "/";
      return {
        packageJson: require(packageLocation),
        tsconfig: tryCatch(() =>
          require(packageLocation.replace("package.json", "tsconfig.json"))
        ),
        directory,
        importName: (directory.split("/static/")[1] || "").slice(0, -1),
        sourceFileSize: 0,
        sourceFileSizePerLanguage: { js: 0, jsx: 0, ts: 0, tsx: 0, styl: 0 },
        testFilesSize: 0,
        testFileSizePerLanguage: { js: 0, jsx: 0, ts: 0, tsx: 0 },
        storyFilesSize: 0,
        storyFileSizePerLanguage: { js: 0, jsx: 0, ts: 0, tsx: 0 },
        fixtureFilesSize: 0,
        mockFilesSize: 0,
        dependencies: [],
        dependents: [],
        tsIgnores: 0,
        tsExpectErrors: 0,
        tsFixMes: 0
      };
    });
  return getFileContents(files).then((fileContents: string[]) => {
    files.forEach((file, index) => {
      const bundle = packages.find(_ => file.startsWith(_.directory));
      if (bundle) {
        const fileContent = fileContents[index];
        addDependencies(file, fileContent, bundle, packages);
        addFileSize(
          file,
          Buffer.byteLength(fileContents[index], "utf8"),
          bundle
        );
        addTsIgnores(fileContent, bundle);
      }
    });

    addDependents(packages);

    console.log(
      `Got metadata of ${packages.length} packages ready to be uploaded.`
    );

    const backend =
      process.env.PACKAGE_ANALYZER_BACKEND ||
      "https://4r8pobcqh9.execute-api.us-east-1.amazonaws.com/dev";

    return fetch(`${backend}/metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        projectId,
        secret,
        revision,
        ref,
        packages
      })
    })
      .then(_ => _.json())
      .then(() => {
        console.log("Metadata uploaded!");
      })
      .catch(error => {
        console.error(`Failed to upload metadata: ${error}`);
      });
  });
};

export default collectPackageMetadata;
