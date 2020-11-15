#!/usr/bin/env node
// 👆 Used to tell Node.js that this is a CLI tool

const collectPackageMetadata = require("../dist");

const {
  PACKAGE_ANALYZER_ROOT: root,
  PACKAGE_ANALYZER_REVISION: revision,
  PACKAGE_ANALYZER_REF: ref,
  PACKAGE_ANALYZER_PROJECT_ID: projectId,
  PACKAGE_ANALYZER_SECRET: secret
} = process.env;

if (!root) {
  console.error(
    "PACKAGE_ANALYZER_ROOT is required! This is the directory where this script will collect package metadata from."
  );
} else if (!revision) {
  console.error(
    "PACKAGE_ANALYZER_REVISION is required! This is the git sha this metadata will be associated with."
  );
} else if (!ref) {
  console.error(
    "PACKAGE_ANALYZER_REF is required! This is the current git branch used to track the master branch."
  );
} else if (!projectId) {
  console.error("PACKAGE_ANALYZER_PROJECT_ID is required!");
} else if (!secret) {
  console.error("PACKAGE_ANALYZER_SECRET is required!");
} else {
  collectPackageMetadata({
    root, // absolute path to the directory with packages
    revision, // git sha
    ref, // branch name
    projectId, // there is currently no way to create new projects
    secret
  });

  // this script will go over the `root` directory
  // in search of `package.json`s and other metadata
  // and upload its findings onto server under this project's `projectId` and `revision`
  // if `secret` matches what's in the database
}
