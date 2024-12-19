import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { eq } from 'drizzle-orm';
import { connectToDatabase } from './db-utils';
import { notes } from './db/schema';

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: any
): Promise<APIGatewayProxyResult> => {
  context.callbackWaitsForEmptyEventLoop = false;

  const { db } = await connectToDatabase();

  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  switch (method) {
    case 'POST':
      if (path === '/api/notes') {
        const note = JSON.parse(event.body || '{}');
        // add a random UUID as the ID of the note
        note.id = Math.random().toString(36).slice(2, 11);
        // add the current UTC timestamp to the `created_at` field
        note.created_at = new Date();
        console.info(`Adding new note:\n ${JSON.stringify(note, null, 2)}`);
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
          .where(eq(notes.id, noteId))
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
        await db.delete(notes).where(eq(notes.id, noteId)).execute();
        return {
          statusCode: 200,
          body: JSON.stringify({ message: `Deleted note with id: ${noteId}` }),
        };
      }
      break;
  }

  console.info(`Invalid request: ${method} ${path}`);

  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Not found' }),
  };
};
