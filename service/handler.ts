import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { S3, DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3();
const dynamoDb = new DynamoDB.DocumentClient();
const Bucket = process.env.BUCKET;

export const postMetadata: APIGatewayProxyHandler = async (event, _context) => {
  const { projectId, secret, revision, packages } = JSON.parse(event.body);

  const { Item } = await dynamoDb
    .get({
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        id: projectId
      }
    })
    .promise();

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
  const Body = JSON.stringify({ packages });
  await Promise.all([
    s3
      .putObject({
        Bucket,
        Key: `${projectId}-${revision}.json`,
        Body
      })
      .promise(),
    s3
      .putObject({
        Bucket,
        Key: `${projectId}-latest.json`,
        Body
      })
      .promise()
  ]);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Big Success!"
    })
  };
};

export const createProject: APIGatewayProxyHandler = async (
  _event,
  _context
) => {
  await dynamoDb
    .put({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        id: uuidv4(),
        secret: uuidv4(),
        slug: "coursera",
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    })
    .promise();
  return {
    statusCode: 500,
    body: JSON.stringify({ message: "Not implemented" })
  };
};

export const getLatestMetadata: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  try {
    const data = await s3
      .getObject({
        Bucket: process.env.BUCKET,
        Key: `${event.pathParameters.projectId}-${event.pathParameters
          .revision || "latest"}.json`
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
