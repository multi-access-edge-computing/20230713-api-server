import { Elysia } from "elysia";
import {
  CreateTableCommand,
  DynamoDBClient,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { TopicsEntity } from "./topics.entity";
import { sleep } from "bun";

const databaseClient = new DynamoDBClient({
  region: process.env.AWS_DYNAMODB_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const tableName = process.env.AWS_DYNAMODB_TABLE_NAME;
const tableRCU = +process.env.AWS_DYNAMODB_RCU;
const tableWCU = +process.env.AWS_DYNAMODB_WCU;

async function createTable() {
  const createTableCommand = new CreateTableCommand({
    TableName: tableName,
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "N" }],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    ProvisionedThroughput: {
      ReadCapacityUnits: tableRCU,
      WriteCapacityUnits: tableWCU,
    },
  });
  await databaseClient.send(createTableCommand);
}

async function seeding() {
  const documentClient = DynamoDBDocumentClient.from(databaseClient);
  const itemCount = +process.env.ITEM_COUNT;
  let topics = [];
  for (let id = 1; id <= itemCount; id++) {
    topics.push(new TopicsEntity(id).load());
    if (id % tableWCU == 0) {
      await sleep(1100);
      const batchWriteItemCommand = new BatchWriteCommand({
        RequestItems: {
          [tableName]: topics.map(({ id, ...item }) => ({
            PutRequest: {
              Item: {
                id,
                item,
              },
            },
          })),
        },
      });
      const response = await documentClient.send(batchWriteItemCommand);
      console.log(response);
      topics = [];
    }
  }
}

(async function initialize() {
  const scanCommand = new ScanCommand({
    TableName: tableName,
  });
  try {
    await databaseClient.send(scanCommand);
  } catch (_) {
    console.log("Create new table...");
    await createTable();
  }
  // await seeding();
})();

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
