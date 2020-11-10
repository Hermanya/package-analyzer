import { Serverless } from "serverless/aws";

const serverlessConfiguration: Serverless = {
  service: {
    name: "package-analyzer"
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true
    },

    bucket: "package-analyzer"
  },
  // Add the serverless-webpack plugin
  plugins: ["serverless-webpack"],
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    apiGateway: {
      minimumCompressionSize: 1024
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      DYNAMODB_TABLE: "${self:service}-${opt:stage, self:provider.stage}"
    },

    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ],
        Resource:
          "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.DYNAMODB_TABLE}"
      },
      {
        Effect: "Allow",
        Action: ["s3:GetObject", "s3:PutObject", "s3:PutObjectAcl"],
        Resource: "arn:aws:s3:::${self:custom.bucket}/*"
      }
    ]
  },
  functions: {
    postMetadata: {
      handler: "handler.postMetadata",
      environment: {
        BUCKET: "${self:custom.bucket}"
      },
      events: [
        {
          http: {
            method: "post",
            path: "metadata"
          }
        }
      ]
    },
    getLatestMetadata: {
      handler: "handler.getLatestMetadata",
      environment: {
        BUCKET: "${self:custom.bucket}"
      },
      events: [
        {
          http: {
            cors: true,
            method: "get",
            path: "metadata/{projectId}"
          }
        },
        {
          http: {
            cors: true,
            method: "get",
            path: "metadata/{projectId}/{revision}"
          }
        }
      ]
    }
  },
  resources: {
    Resources: {
      projectsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.DYNAMODB_TABLE}",
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S"
            }
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH"
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
