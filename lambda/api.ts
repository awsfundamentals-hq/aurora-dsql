import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { connectToDatabase } from './db-utils';

const createNote = async (event: APIGatewayProxyEvent, db: any) => {
  const note = JSON.parse(event.body || '{}');
  const newNote = await db.mutation.createNote({ data: note });
  return {
    statusCode: 200,
    body: JSON.stringify(newNote),
  };
};

const getNotes = async (db: any) => {
  const notes = await db.query.notes();
  return {
    statusCode: 200,
    body: JSON.stringify(notes),
  };
};

const updateNote = async (event: APIGatewayProxyEvent, db: any) => {
  const noteId = event.path.split('/').pop();
  const note = JSON.parse(event.body || '{}');
  const updatedNote = await db.mutation.updateNote({
    where: { id: noteId },
    data: note,
  });
  return {
    statusCode: 200,
    body: JSON.stringify(updatedNote),
  };
};

const deleteNote = async (event: APIGatewayProxyEvent, db: any) => {
  const noteId = event.path.split('/').pop();
  const deletedNote = await db.mutation.deleteNote({ where: { id: noteId } });
  return {
    statusCode: 200,
    body: JSON.stringify(deletedNote),
  };
};

export const handler = async (
  event: APIGatewayProxyEvent,
  context: any
): Promise<APIGatewayProxyResult> => {
  context.callbackWaitsForEmptyEventLoop = false;

  const { db } = await connectToDatabase();

  if (event.httpMethod === 'POST' && event.path === '/api/notes') {
    return createNote(event, db);
  }

  if (event.httpMethod === 'GET' && event.path === '/api/notes') {
    return getNotes(db);
  }

  if (event.httpMethod === 'PUT' && event.path.startsWith('/api/notes/')) {
    return updateNote(event, db);
  }

  if (event.httpMethod === 'DELETE' && event.path.startsWith('/api/notes/')) {
    return deleteNote(event, db);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Not found' }),
  };
};
