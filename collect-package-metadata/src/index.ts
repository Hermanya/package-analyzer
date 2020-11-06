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
  key
}: {
  root: string;
  revision: string;
  key: string;
}) => {
  const ignore = ["**/node_modules/**", "**/vendor/**"];
  if (!root) {
    console.log("Please set COLLECT_PACKAGE_METADATA_FROM");
  }

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
        importName: directory.split("/static/")[1].slice(0, -1),
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

  getFileContents(files).then((fileContents: string[]) => {
    files.forEach((file, index) => {
      const bundle = packages.find(_ => file.startsWith(_.directory));
      if (!bundle) {
        return;
      }
      const fileContent = fileContents[index];
      addDependencies(file, fileContent, bundle, packages);
      addFileSize(file, Buffer.byteLength(fileContents[index], "utf8"), bundle);
      addTsIgnores(fileContent, bundle);
    });

    addDependents(packages);

    console.log(
      `Got metadata of ${packages.length} packages ready to be uploaded.`
    );

    // projectId, authKey, gitSha, packages

    fetch(
      "https://4r8pobcqh9.execute-api.us-east-1.amazonaws.com/dev/metadata",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          key,
          revision,
          packages
        })
      }
    )
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
