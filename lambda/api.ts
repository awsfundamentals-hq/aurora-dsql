import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { users } from './db/schema';

const clusterIdentifier = process.env.CLUSTER_IDENTIFIER!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const signer = new DsqlSigner({
    hostname: `${clusterIdentifier}.dsql.us-east-1.on.aws`,
    region: 'us-east-1',
  });
  const token = await signer.getDbConnectAdminAuthToken();
  const client = new Client({
    host: `${clusterIdentifier}.dsql.us-east-1.on.aws`,
    user: 'admin',
    password: token,
    database: 'postgres',
    port: 5432,
    ssl: true,
  });

  console.log('Connecting to database');

  await client.connect();

  const db = drizzle(client, { schema: { users } });

  console.log('Database connected');

  return {
    statusCode: 200,
    body: 'OK',
  };
};
