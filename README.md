# Package Analyzer ![CI](https://github.com/Hermanya/package-analyzer/workflows/CI/badge.svg) [![codecov](https://codecov.io/gh/Hermanya/package-analyzer/branch/master/graph/badge.svg)](https://codecov.io/gh/Hermanya/package-analyzer)

This is a 2-part project:
- `packages/cli`: `collect-package-metadata` npm package that goes over your frontend packages and collects some metadata
- `packages/api`: `serverless` backend that holds on to this metadata and lets you fetch it later


## `collect-package-metadata` NPM package

install from yarn `yarn add collect-package-metadata` and run the following script:

```javascript
const collectPackageMetadata = require('collect-package-metadata')

collectPackageMetadata({
  root, // absolute path to the directory with packages
  revision, // git sha
  projectId, // there is currently no way to create new projects
  secret,
})
// this script will go over the `root` directory 
// in search of `package.json`s and other metadata 
// and upload its findings onto server under this project's `projectId` and `revision`
// if `secret` matches what's in the database
```

## `service` backend

This is a serverless backend that stores metadata. 

1. You can use my deployment: https://4r8pobcqh9.execute-api.us-east-1.amazonaws.com/dev
2. Or you can [set up serverless locally](https://www.serverless.com/framework/docs/getting-started/) and 

```bash
cd sevice; serverless deploy
```

and then set up the `PACKAGE_ANALYZER_BACKEND` environment variable.

Get latest metadata by calling `GET https://4r8pobcqh9.execute-api.us-east-1.amazonaws.com/dev/metadata/:projectId`. 

Or if you want to see metadata at a certain revision, call `GET https://4r8pobcqh9.execute-api.us-east-1.amazonaws.com/dev/metadata/:projectId/:revision`

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](./LICENSE)
