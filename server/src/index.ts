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
const s3 = new AWS.S3();
const Bucket = "package-analyzer";

let tableName = "PackageAnalyzer";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + "-" + process.env.ENV;
}
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

/********************************
 * HTTP Get method for list objects *
 ********************************/

// app.get("/metadata", function(_req, res) {
//   s3.getObject({
//     Bucket,
//     Key: ""
//   });

//   dynamodb.query(
//     {
//       TableName: tableName
//     },
//     (err, data) => {
//       if (err) {
//         res.statusCode = 500;
//         res.json({
//           error: "Could not load items: " + err
//         });
//       } else {
//         res.json(data.Items);
//       }
//     }
//   );
// });

// app.get("/api", function(req, res) {
//   dynamodb.put(
//     {
//       TableName: tableName,
//       Item:
//     },
//     (err, data) => {
//       if (err) {
//         res.statusCode = 500;
//         res.json({ error: err, url: req.url, body: req.body });
//       } else {
//         res.json({ success: "call succeed! ok", url: req.url, data: data });
//       }
//     }
//   );
// });

app.post("/api", function(req, res) {
  console.log("body: " + JSON.stringify(req.body));
  const { projectId, authKey, gitSha, packages } = req.body;
  dynamodb.get(
    {
      TableName: tableName,
      Key: { id: projectId }
    },
    (err, data) => {
      console.log("in the callback", err, data);
      if (err) {
        res.statusCode = 500;
        res.json({ error: err, url: req.url, body: req.body });
      } else if (!data.Item) {
        res.statusCode = 404;
        res.json({ error: err, url: req.url, body: req.body });
      } else if (data.Item.authKey !== authKey) {
        res.statusCode = 401;
        res.json({ error: err, url: req.url, body: req.body });
      } else {
        const params = {
          Bucket,
          Key: `${projectId}-${gitSha}.json`,
          Body: JSON.stringify(packages),
          ACL: "public-read"
        };
        console.log(params);

        s3.upload(
          params,
          (error: Error, data: AWS.S3.ManagedUpload.SendData) => {
            console.log("in the second callback", err, data);
            if (error) {
              res.statusCode = 500;
              res.json({ error: error, url: req.url, body: req.body });
            } else {
              res.statusCode = 200;
              res.json({ data });
            }
          }
        );
      }
    }
  );
});

app.listen(3000, function() {
  console.log("App started");
});

export default app;
