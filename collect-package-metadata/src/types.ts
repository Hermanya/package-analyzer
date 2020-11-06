export type Bundle = {
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
