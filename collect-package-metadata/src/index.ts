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

const collectPackageMetadata = async ({ root }: { root: string }) => {
  const ignore = ["**/node_modules/**", "**/vendor/**"];
  if (!root) {
    console.log("Please set COLLECT_PACKAGE_METADATA_FROM");
  }

  const files: string[] = fastGlob.sync(`${root}**/*.(jsx|tsx|js|ts|styl)`, {
    onlyFiles: true,
    ignore
  });

  const bundles: Bundle[] = fastGlob
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
      const bundle = bundles.find(_ => file.startsWith(_.directory));
      if (!bundle) {
        return;
      }
      const fileContent = fileContents[index];
      addDependencies(file, fileContent, bundle, bundles);
      addFileSize(file, Buffer.byteLength(fileContents[index], "utf8"), bundle);
      addTsIgnores(fileContent, bundle);
    });

    addDependents(bundles);

    console.log(
      `Got metadata of ${bundles.length} packages ready to be uploaded.`
    );

    // projectId, authKey, gitSha, packages
  });
};

export default collectPackageMetadata;
