import {
  createProject,
  getLatestMetadata,
  getProject,
  postMetadata
} from "../src";
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import {
  GetItemInput,
  PutItemInput,
  ScanInput
} from "aws-sdk/clients/dynamodb";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from "aws-lambda";

describe("handler", () => {
  beforeEach(() => {
    process.env.BUCKET = "Bucket";
    process.env.DYNAMODB_TABLE = "TableName";
    AWSMock.setSDKInstance(AWS);
  });
  describe("postMetadata", () => {
    const body = JSON.stringify({
      projectId: "projectId",
      secret: "secret",
      ref: "ref",
      revision: "revision",
      packages: "packages"
    });

    it("happy path", async () => {
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
          body
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
    test("refs/heads/master", async () => {
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
            ...JSON.parse(body),

            ref: "refs/heads/master"
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
    test("no env variables", async () => {
      process.env.BUCKET = "";
      process.env.DYNAMODB_TABLE = "";
      const response = (await postMetadata(
        {} as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      )) as APIGatewayProxyResult;
      expect(response.statusCode).toBe(500);
    });
    test("no request body", async () => {
      const response = (await postMetadata(
        {
          body: ""
        } as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      )) as APIGatewayProxyResult;
      expect(response.statusCode).toBe(400);
    });
    test("invalid project id", async () => {
      AWSMock.mock(
        "DynamoDB.DocumentClient",
        "get",
        (_params: GetItemInput, callback: Function) => {
          callback(null, { Item: null });
        }
      );
      const response = (await postMetadata(
        {
          body
        } as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      )) as APIGatewayProxyResult;
      expect(response.statusCode).toBe(404);
      AWSMock.restore("DynamoDB.DocumentClient");
    });
    test("invalid secret", async () => {
      AWSMock.mock(
        "DynamoDB.DocumentClient",
        "get",
        (_params: GetItemInput, callback: Function) => {
          callback(null, { Item: { secret: "real secret" } });
        }
      );
      const response = (await postMetadata(
        {
          body
        } as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      )) as APIGatewayProxyResult;
      expect(response.statusCode).toBe(403);
      AWSMock.restore("DynamoDB.DocumentClient");
    });
  });
  describe("getLatestMetadata", () => {
    const pathParameters = {
      key: "key"
    };
    test("happy path", async () => {
      AWSMock.mock(
        "S3",
        "getObject",
        (_params: AWS.S3.GetObjectRequest, callback: Function) => {
          callback(null, { Body: Buffer.from('{"test": "metadata"}') });
        }
      );
      const response = await getLatestMetadata(
        ({
          pathParameters
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
    test("specific revision", async () => {
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
            ...pathParameters,
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
    test("no env variables", async () => {
      process.env.BUCKET = "";
      process.env.DYNAMODB_TABLE = "";
      const response = (await getLatestMetadata(
        ({
          pathParameters
        } as unknown) as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      )) as APIGatewayProxyResult;
      expect(response.statusCode).toBe(500);
    });
    test("no project id", async () => {
      const response = (await getLatestMetadata(
        ({
          pathParameters: undefined
        } as unknown) as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      )) as APIGatewayProxyResult;
      expect(response.statusCode).toBe(400);
    });
    test("not found", async () => {
      AWSMock.mock(
        "S3",
        "getObject",
        (_params: AWS.S3.GetObjectRequest, callback: Function) => {
          callback(null, { Body: null });
        }
      );
      const response = (await getLatestMetadata(
        ({
          pathParameters
        } as unknown) as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      )) as APIGatewayProxyResult;
      expect(response.statusCode).toBe(404);
      AWSMock.restore("S3");
    });
    test("internal error", async () => {
      AWSMock.mock("S3", "getObject", () => {
        throw Error("test");
      });
      const response = (await getLatestMetadata(
        ({
          pathParameters
        } as unknown) as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      )) as APIGatewayProxyResult;
      expect(response.statusCode).toBe(500);
      AWSMock.restore("S3");
    });
  });
  describe("createProject", () => {
    test("happy path", async () => {
      AWSMock.mock(
        "DynamoDB.DocumentClient",
        "put",
        (_params: PutItemInput, callback: Function) => {
          callback(null, {});
        }
      );

      const response = await createProject(
        ({
          pathParameters: { slug: "new-project" }
        } as unknown) as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      );
      expect(response).toEqual({
        body: '{"message":"Created!"}',
        statusCode: 200
      });
      AWSMock.restore("DynamoDB.DocumentClient");
    });

    test("internal error", async () => {
      AWSMock.mock("DynamoDB.DocumentClient", "put", () => {
        throw Error("test");
      });
      const response = (await createProject(
        {} as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      )) as APIGatewayProxyResult;
      expect(response.statusCode).toBe(500);
      AWSMock.restore("DynamoDB.DocumentClient");
    });

    test("no env variables", async () => {
      process.env.DYNAMODB_TABLE = "";
      const response = (await createProject(
        {} as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      )) as APIGatewayProxyResult;
      expect(response.statusCode).toBe(500);
    });
  });
  describe("getProject", () => {
    test("happy path", async () => {
      AWSMock.mock(
        "DynamoDB.DocumentClient",
        "scan",
        (_params: ScanInput, callback: Function) => {
          callback(null, { Items: [{ id: "test" }] });
        }
      );

      const response = await getProject(
        ({
          pathParameters: { slug: "new-project" }
        } as unknown) as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      );
      expect(response).toEqual({
        body: '{"id":"test"}',
        headers: {
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        statusCode: 200
      });
      AWSMock.restore("DynamoDB.DocumentClient");
    });
    test("no env variables", async () => {
      process.env.DYNAMODB_TABLE = "";
      const response = (await getProject(
        {} as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      )) as APIGatewayProxyResult;
      expect(response.statusCode).toBe(500);
    });
    test("no slug", async () => {
      const response = await getProject(
        ({} as unknown) as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      );
      expect(response).toEqual({
        body: '{"error":"Slug is missing from the url!"}',

        statusCode: 400
      });
    });
    test("not found", async () => {
      AWSMock.mock(
        "DynamoDB.DocumentClient",
        "scan",
        (_params: ScanInput, callback: Function) => {
          callback(null, { Items: [] });
        }
      );

      const response = await getProject(
        ({
          pathParameters: { slug: "new-project" }
        } as unknown) as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      );
      expect(response).toEqual({
        body: '{"message":"Not found"}',

        statusCode: 404
      });
      AWSMock.restore("DynamoDB.DocumentClient");
    });
    test("internal error", async () => {
      AWSMock.mock("DynamoDB.DocumentClient", "scan", () => {
        throw Error("test");
      });

      const response = await getProject(
        ({
          pathParameters: { slug: "new-project" }
        } as unknown) as APIGatewayProxyEvent,
        {} as Context,
        () => {}
      );
      expect((response as APIGatewayProxyResult).statusCode).toBe(500);
      AWSMock.restore("DynamoDB.DocumentClient");
    });
  });
});
