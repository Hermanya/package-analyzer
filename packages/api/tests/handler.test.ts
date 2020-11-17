import { getLatestMetadata, postMetadata } from "../src";
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import { GetItemInput } from "aws-sdk/clients/dynamodb";
import { APIGatewayProxyEvent, Context } from "aws-lambda";

describe("handler", () => {
  it("postMetadata", async () => {
    process.env.BUCKET = "Bucket";
    process.env.DYNAMODB_TABLE = "TableName";

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock(
      "DynamoDB.DocumentClient",
      "get",
      (_params: GetItemInput, callback: Function) => {
        callback(null, { Item: { secret: "secret" } });
      }
    );
    AWSMock.mock(
      "S3",
      "putObject",
      (_params: AWS.S3.PutObjectRequest, callback: Function) => {
        callback(null, {});
      }
    );

    const response = await postMetadata(
      {
        body: JSON.stringify({
          projectId: "projectId",
          secret: "secret",
          revision: "revision",
          packages: "packages"
        })
      } as APIGatewayProxyEvent,
      {} as Context,
      () => {}
    );

    expect(response).toEqual({
      body: '{"message":"Big Success!"}',
      statusCode: 200
    });

    AWSMock.restore("DynamoDB.DocumentClient");
    AWSMock.restore("S3");
  });
  test("getLatestMetadata", async () => {
    process.env.BUCKET = "Bucket";
    process.env.DYNAMODB_TABLE = "TableName";

    AWSMock.setSDKInstance(AWS);

    AWSMock.mock(
      "S3",
      "getObject",
      (_params: AWS.S3.GetObjectRequest, callback: Function) => {
        callback(null, { Body: Buffer.from('{"test": "metadata"}') });
      }
    );

    const response = await getLatestMetadata(
      ({
        pathParameters: {
          key: "key",
          revision: "revision"
        }
      } as unknown) as APIGatewayProxyEvent,
      {} as Context,
      () => {}
    );

    expect(response).toEqual({
      body: '{"test": "metadata"}',
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      statusCode: 200
    });

    AWSMock.restore("S3");
  });
});
