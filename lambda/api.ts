import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { connectToDatabase } from './db-utils';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: any
): Promise<APIGatewayProxyResult> => {
  context.callbackWaitsForEmptyEventLoop = false;

  const { db } = await connectToDatabase();
  const notes = await db.query.notes.findMany();

  return {
    statusCode: 200,
    body: JSON.stringify(notes),
  };
};
