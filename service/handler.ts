import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { S3, DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3();
const dynamoDb = new DynamoDB.DocumentClient();

export const postMetadata: APIGatewayProxyHandler = async (event, _context) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message:
          "Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!",
        input: event
      },
      null,
      2
    )
  };
};

export const getLatestMetadata: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  try {
    if (!process.env.DYNAMODB_TABLE) {
      console.log("No DYNAMODB_TABLE!");
    }
    if (!process.env.BUCKET) {
      console.log("No BUCKET!");
    }
    await dynamoDb
      .put({
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
          id: uuidv4(),
          slug: "coursera",
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      })
      .promise();

    await s3
      .putObject({
        Bucket: process.env.BUCKET,
        Key: "test-object.json",
        Body: '{"message": "hello"}'
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message:
            "Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!",
          input: event
        },
        null,
        2
      )
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
