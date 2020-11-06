import AWS from "aws-sdk";
import awsServerlessExpressMiddleware from "aws-serverless-express/middleware";
import bodyParser from "body-parser";
import express from "express";
// import { v4 as uuidv4 } from "uuid";

// const createClient = () => ({
//         id: uuidv4(),
//         authKey: uuidv4()
//       })

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function(_req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/api", async (req, res) => {
  try {
    if (req.query.gitSha) {
      const data = await dynamodb.get({
        TableName: "PackageAnalyzerRuns-prod",

        Key: { id: req.query.gitSha }
      });
      res.statusCode = 200;
      res.json({ data });
    } else {
      const data = await dynamodb.scan({
        TableName: "PackageAnalyzerRuns-prod",
        Limit: 1
      });
      res.statusCode = 200;
      res.json({ data });
    }
  } catch (error) {
    res.statusCode = 500;
    res.json({ error: error, url: req.url, body: req.body });
  }
});

app.post("/api", async (req, res) => {
  console.log("body: " + JSON.stringify(req.body));
  const { projectId, authKey, gitSha, packages } = req.body;

  try {
    const data = await dynamodb
      .get({
        TableName: "PackageAnalyzer-prod",
        Key: { id: projectId }
      })
      .promise();
    if (!data.Item) {
      res.statusCode = 404;
      res.json({ error: "Not found", url: req.url, body: req.body });
    } else if (data.Item.authKey !== authKey) {
      res.statusCode = 401;
      res.json({ error: "Not authorized", url: req.url, body: req.body });
    } else {
      await dynamodb
        .put({
          TableName: "PackageAnalyzerRuns-prod",
          Item: {
            id: gitSha,
            projectId,
            createdAt: Date.now(),
            packages
          }
        })
        .promise();
      res.statusCode = 200;
      res.json({ message: "success!" });
    }
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: err, url: req.url, body: req.body });
  }
});

app.listen(3000, function() {
  console.log("App started");
});

export default app;
