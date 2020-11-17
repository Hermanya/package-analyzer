import fs from "fs";
import { Bundle } from "./types";

const uniq = (_: any[]) =>
  _.filter((item, index, all) => all.indexOf(item) === index);

export const tryCatch = (_: () => void) => {
  try {
    return _();
  } catch (e) {}
};

export const getFileContents = (fileNames: string[]) => {
  return Promise.all(
    fileNames.map(
      _ =>
        new Promise<string>(resolve => {
          fs.readFile(_, "utf8", function(
            error: NodeJS.ErrnoException | null,
            data: string
          ) {
            if (error) {
              return console.error(error);
            }
            resolve(data);
          });
        })
    )
  );
};

const isTest = (file: string) =>
  file.match(/__tests__/) || file.match(/\/tests\//);
const isStory = (file: string) =>
  file.match(/__stories__/) || file.match(/\/stories\//);
const isFixture = (file: string) =>
  file.match(/__fixtures__/) || file.match(/\/fixtures\//);
const isMock = (file: string) =>
  file.match(/__mocks__/) || file.match(/\/mocks\//);

export const addFileSize = (file: string, fileSize: number, bundle: Bundle) => {
  const extension = file.split(".").pop() as "js" | "ts";
  if (isTest(file)) {
    bundle.testFilesSize += fileSize;
    if (bundle.testFileSizePerLanguage[extension] === undefined) {
      throw Error(
        `Extension not accounted for: ${extension} in testFileSizePerLanguage`
      );
    }
    bundle.testFileSizePerLanguage[extension] += fileSize;
  } else if (isStory(file)) {
    bundle.storyFilesSize += fileSize;
    if (bundle.storyFileSizePerLanguage[extension] === undefined) {
      throw Error(
        `Extension not accounted for: ${extension} in storyFileSizePerLanguage`
      );
    }
    bundle.storyFileSizePerLanguage[extension] += fileSize;
  } else if (isFixture(file)) {
    bundle.fixtureFilesSize += fileSize;
  } else if (isMock(file)) {
    bundle.mockFilesSize += fileSize;
  } else {
    bundle.sourceFileSize += fileSize;
    if (bundle.sourceFileSizePerLanguage[extension] === undefined) {
      throw Error(
        `Extension not accounted for: ${extension} in sourceFileSizePerLanguage`
      );
    }
    bundle.sourceFileSizePerLanguage[extension] += fileSize;
  }
};

const exceptions = [
  "bundles/vendor",
  "bundles/enterprise-admin-constants",
  "bundles/userModal",
  "bundles/final-form",
  "bundles/author-workspace",
  "bundles/design-system",
  "bundles/translation"
];
const resolveBundle = (bundles: Bundle[], importPath: string) => {
  const exception = exceptions.find(
    _ => _ === importPath || importPath.startsWith(_ + "/")
  );
  if (exception) {
    return exception;
  }
  const bundle = bundles.find(
    _ =>
      _.importName === importPath || importPath.startsWith(_.importName + "/")
  );
  if (!bundle) {
    throw Error(`Bundle not resolved: ${importPath}`);
  }
  return bundle.importName;
};

export const addDependencies = (
  file: string,
  fileContent: string,
  bundle: Bundle,
  bundles: Bundle[]
) => {
  if (!isStory(file) && !isTest(file)) {
    const fr = " fr";
    const om = "om '";
    const dependencies = fileContent
      .split(fr + om)
      .slice(1)
      .map(_ => _.split("'")[0])
      .map(_ => (_.startsWith("bundles/") ? resolveBundle(bundles, _) : _))
      .filter(_ => !_.startsWith("."));
    const imp = " imp";
    const ort = "ort('";
    const dynamicDependencies = fileContent
      .split(imp + ort)
      .slice(1)
      .map(_ => _.split("')")[0])
      .map(_ => (_.startsWith("bundles/") ? resolveBundle(bundles, _) : _))
      .filter(_ => !_.startsWith("."));
    [...dependencies, ...dynamicDependencies].forEach(dependency => {
      if (dependency.length > 100) {
        throw Error(`Dependency too long: ${dependency}`);
      }
    });
    bundle.dependencies = uniq([
      ...dependencies,
      ...dynamicDependencies,
      ...bundle.dependencies
    ]).filter(_ => _ !== bundle.importName);
  }
};

export const addDependents = (bundles: Bundle[]) => {
  bundles.forEach(bundle => {
    const dependents = bundles.reduce((all, anotherBundle) => {
      if (
        bundle !== anotherBundle &&
        anotherBundle.dependencies.includes(bundle.importName)
      ) {
        all.push(anotherBundle.importName);
      }
      return all;
    }, [] as string[]);
    bundle.dependents = uniq([...dependents, ...bundle.dependents]);
  });
};

export const addTsIgnores = (fileContent: string, bundle: Bundle) => {
  const ts = "@ts-";
  const ignore = "ignore";
  const expectError = "expect-error";
  bundle.tsIgnores += fileContent.split(ts + ignore).length - 1;
  bundle.tsExpectErrors += fileContent.split(ts + expectError).length - 1;
  const tsfix = "$TSFix";
  const me = "Me";
  bundle.tsFixMes += fileContent.split(tsfix + me).length - 1;
};
