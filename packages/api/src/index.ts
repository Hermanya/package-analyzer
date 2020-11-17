import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

export const postMetadata: APIGatewayProxyHandler = async (event, _context) => {
  const s3 = new AWS.S3();
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const { BUCKET: Bucket, DYNAMODB_TABLE: TableName } = process.env;
  if (!TableName || !Bucket) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Bucket and TableName are required env variables!"
      })
    };
  }
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Invalid body!"
      })
    };
  }
  const { projectId, secret, revision, ref, packages } = JSON.parse(event.body);
  const response = await dynamoDb
    .get({
      TableName,
      Key: {
        id: projectId
      }
    })
    .promise();
  const { Item } = response;
  if (!Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: "Invalid projectId!"
      })
    };
  }
  if (Item.secret !== secret) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: "Invalid secret!"
      })
    };
  }
  const Body = JSON.stringify({
    revision,
    ref,
    createdAt: Date.now(),
    packages
  });
  await Promise.all([
    s3
      .putObject({
        Bucket,
        Key: `${projectId}-${revision}.json`,
        Body
      })
      .promise(),
    (ref !== "refs/heads/master"
      ? Promise.resolve()
      : s3
          .putObject({
            Bucket,
            Key: `${projectId}-latest.json`,
            Body
          })
          .promise()) as Promise<void>
  ]);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Big Success!"
    })
  };
};

export const createProject: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  try {
    const { DYNAMODB_TABLE: TableName } = process.env;
    if (!TableName) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "TableName env variable is missing!"
        })
      };
    }
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    await dynamoDb
      .put({
        TableName,
        Item: {
          id: uuidv4(),
          secret: uuidv4(),
          slug: event.pathParameters?.slug,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      })
      .promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Created!" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: "error",
          error,
          input: event
        },
        null,
        2
      )
    };
  }
};

export const getLatestMetadata: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  try {
    const s3 = new AWS.S3();
    const { BUCKET: Bucket, DYNAMODB_TABLE: TableName } = process.env;
    if (!TableName || !Bucket) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "TableName and Bucket are required env variables!"
        })
      };
    }
    const { key: projectId, revision } = event.pathParameters ?? {};
    if (!projectId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Project ID is missing from the url!"
        })
      };
    }
    const data = await s3
      .getObject({
        Bucket,
        Key: `${projectId}-${revision || "latest"}.json`
      })
      .promise();

    if (!data.Body) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Not found" })
      };
    } else {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Content-Type": "application/json"
        },
        body: data.Body.toString("utf-8")
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: "error",
          error,
          input: event
        },
        null,
        2
      )
    };
  }
};
