// export const sum = (a: number, b: number) => {
//   if ('development' === process.env.NODE_ENV) {
//     console.log('boop');
//   }
//   return a + b;
// };

import fastGlob from "fast-glob";
import fs from "fs";

const uniq = (items: any[]) =>
  items.filter((item, index, all) => all.indexOf(item) === index);

const ignore = ["**/node_modules/**", "**/vendor/**"];
const root = process.env.PROJECT_ROOT;
const files: string[] = fastGlob.sync(`${root}**/*.(jsx|tsx|js|ts|styl)`, {
  onlyFiles: true,
  ignore
});

const tryCatch = (_: () => void) => {
  try {
    return _();
  } catch (e) {}
};

type Bundle = {
  packageJson: {};
  tsconfig: {} | void;
  directory: string;
  importName: string;
  sourceFileSize: number;
  sourceFileSizePerLanguage: {
    js: number;
    jsx: number;
    ts: number;
    tsx: number;
    styl: number;
  };
  testFilesSize: number;
  testFileSizePerLanguage: { js: number; jsx: number; ts: number; tsx: number };
  storyFilesSize: number;
  storyFileSizePerLanguage: {
    js: number;
    jsx: number;
    ts: number;
    tsx: number;
  };
  fixtureFilesSize: number;
  mockFilesSize: number;
  dependencies: string[];
  dependents: string[];
  tsIgnores: number;
  tsExpectErrors: number;
  tsFixMes: number;
};

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

const getFileContents = (fileNames: string[]) => {
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

const isTest = (file: string) => file.match(/__tests__/);
const isStory = (file: string) => file.match(/__stories__/);
const isFixture = (file: string) => file.match(/__fixtures__/);
const isMock = (file: string) => file.match(/__mocks__/);

const addFileSize = (file: string, fileSize: number, bundle: Bundle) => {
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
const resolveBundle = (importPath: string) => {
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

const addDependencies = (file: string, fileContent: string, bundle: Bundle) => {
  if (!isStory(file) && !isTest(file)) {
    const fr = " fr";
    const om = "om '";
    const dependencies = fileContent
      .split(fr + om)
      .slice(1)
      .map(_ => _.split("'")[0])
      .map(_ => (_.startsWith("bundles/") ? resolveBundle(_) : _))
      .filter(_ => !_.startsWith("."));
    const imp = " imp";
    const ort = "ort('";
    const dynamicDependencies = fileContent
      .split(imp + ort)
      .slice(1)
      .map(_ => _.split("')")[0])
      .map(_ => (_.startsWith("bundles/") ? resolveBundle(_) : _))
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

const addDependents = () => {
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

const addTsIgnores = (fileContent: string, bundle: Bundle) => {
  const ts = "@ts-";
  const ignore = "ignore";
  const expectError = "expect-error";
  bundle.tsIgnores += fileContent.split(ts + ignore).length - 1;
  bundle.tsExpectErrors += fileContent.split(ts + expectError).length - 1;
  const tsfix = "$TSFix";
  const me = "Me";
  bundle.tsFixMes += fileContent.split(tsfix + me).length - 1;
};

getFileContents(files).then((fileContents: string[]) => {
  files.forEach((file, index) => {
    const bundle = bundles.find(_ => file.startsWith(_.directory));
    if (!bundle) {
      return;
    }
    const fileContent = fileContents[index];
    addDependencies(file, fileContent, bundle);
    addFileSize(file, Buffer.byteLength(fileContents[index], "utf8"), bundle);
    addTsIgnores(fileContent, bundle);
  });

  addDependents();

  console.log(
    `Got metadata of ${bundles.length} packages ready to be uploaded.`
  );
});
