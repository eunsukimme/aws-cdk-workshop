import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { DynamoDB, Lambda } from "aws-sdk";

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  // update dynamo entry for "path" with hits++
  await dynamo
    .updateItem({
      TableName: process.env.HITS_TABLE_NAME as string,
      Key: { path: { S: event.path } },
      UpdateExpression: "ADD hits :incr",
      ExpressionAttributeValues: { ":incr": { N: "1" } },
    })
    .promise();

  // call downstream function and capture response
  const response = await lambda
    .invoke({
      FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME as string,
      Payload: JSON.stringify(event),
    })
    .promise();

  console.log("downstream response:", JSON.stringify(response, undefined, 2));

  // return response back to upstream caller
  return JSON.parse(response.Payload as string);
};
