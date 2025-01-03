import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { notes } from './db/schema';

let clusterIdentifier = process.env.CLUSTER_IDENTIFIER!;

let client: Client | null = null;

export const connectToDatabase = async () => {
  if (!client) {
    const signer = new DsqlSigner({
      hostname: `${clusterIdentifier}.dsql.us-east-1.on.aws`,
      region: 'us-east-1',
    });
    const token = await signer.getDbConnectAdminAuthToken();
    client = new Client({
      host: `${clusterIdentifier}.dsql.us-east-1.on.aws`,
      user: 'admin',
      password: token,
      database: 'postgres',
      port: 5432,
      ssl: true,
    });
    await client.connect();
    console.info(`Connected to ${clusterIdentifier}`);
  }
  const db = drizzle(client, {
    schema: { notes },
  });
  return { db, client };
};
