import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || "AiGuesserLeaderboard";
const MAX_ENTRIES = 10;

// CORS headers needed for every response
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  // HTTP API v2 uses requestContext.http.method, v1/test console uses httpMethod
  const method = event.httpMethod || event.requestContext?.http?.method;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return response(200, {});
  }

  try {
    switch (method) {
      case "GET":
        return await getScores(event);
      case "POST":
        return await postScore(event);
      default:
        return response(405, { error: "Method not allowed" });
    }
  } catch (err) {
    console.error("Handler error:", err);
    return response(500, { error: "Internal server error" });
  }
};

async function getScores(event) {
  const limit = Math.min(
    parseInt(event.queryStringParameters?.limit) || MAX_ENTRIES,
    MAX_ENTRIES,
  );

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "ScoreIndex",
      KeyConditionExpression: "gameVersion = :gv",
      ExpressionAttributeValues: { ":gv": "1.0" },
      ScanIndexForward: false, // descending by score
      Limit: limit,
    }),
  );

  return response(200, { scores: result.Items });
}

async function postScore(event) {
  const body = JSON.parse(event.body || "{}");

  if (
    !body.playerName ||
    body.score === undefined ||
    body.accuracy === undefined ||
    body.totalRounds === undefined
  ) {
    return response(400, { error: "Missing required fields" });
  }

  if (
    typeof body.score !== "number" || body.score < 0 || body.score > 10 ||
    typeof body.accuracy !== "number" || body.accuracy < 0 || body.accuracy > 100
  ) {
    return response(400, { error: "Score must be 0-10, accuracy must be 0-100" });
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    playerName: body.playerName.trim().substring(0, 20),
    score: body.score,
    accuracy: parseFloat(body.accuracy.toFixed(2)),
    totalRounds: body.totalRounds,
    timestamp: Date.now(),
    gameVersion: "1.0",
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: entry,
    }),
  );

  return response(201, { entry });
}
