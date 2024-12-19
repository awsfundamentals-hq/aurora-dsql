import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { connectToDatabase } from './db-utils';
import { notes } from './db/schema';

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: any
): Promise<APIGatewayProxyResult> => {
  context.callbackWaitsForEmptyEventLoop = false;

  const { db } = await connectToDatabase();

  console.info(JSON.stringify(event, null, 2));

  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  switch (method) {
    case 'POST':
      if (path === '/api/notes') {
        const note = JSON.parse(event.body || '{}');
        const newNote = await db.insert(notes).values(note).execute();
        return {
          statusCode: 200,
          body: JSON.stringify(newNote),
        };
      }
      break;
    case 'GET':
      if (path === '/api/notes') {
        const notes = await db.query.notes.findMany();
        return {
          statusCode: 200,
          body: JSON.stringify(notes),
        };
      }
      break;
    case 'PUT':
      if (path.startsWith('/api/notes/')) {
        const noteId = path.split('/').pop()!;
        const note = JSON.parse(event.body || '{}');
        const updatedNote = await db
          .update(notes)
          .set(note)
          .where({ id: noteId })
          .execute();
        return {
          statusCode: 200,
          body: JSON.stringify(updatedNote),
        };
      }
      break;
    case 'DELETE':
      if (path.startsWith('/api/notes/')) {
        const noteId = path.split('/').pop()!;
        return {
          statusCode: 200,
          body: JSON.stringify({ message: `Deleted note with id: ${noteId}` }),
        };
      }
      break;
  }

  console.info(`Invalid request: ${event.httpMethod} ${event.path}`);

  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Not found' }),
  };
};
