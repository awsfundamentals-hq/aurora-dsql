import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { readdirSync, readFileSync } from 'fs';
import { Client } from 'pg';
import { notes } from './db/schema';

let clusterIdentifier = process.env.CLUSTER_IDENTIFIER!;

let client: Client | null = null;

const parseCommandLineArgs = <T extends Record<string, string>>() => {
  const args = process.argv.slice(2);
  const parsedArgs: T = {} as T;

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (key && value) {
        parsedArgs[key as keyof T] = value as T[keyof T];
      }
    }
  }

  return parsedArgs;
};

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

const dropDatabase = async () => {
  console.info(`Dropping all tables in ${clusterIdentifier}`);
  // delete the drizzle folder
  execSync(`rm -rf ${__dirname}/../drizzle`);
  const { db, client } = await connectToDatabase();
  const tables = (
    await db.execute(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public';
  `)
  ).rows.map((row) => row.tablename) as string[];
  for await (const table of tables) {
    await db.execute(`DROP TABLE ${table} CASCADE;`);
    console.info(`Table ${table} has been dropped`);
  }
  console.info(`All tables have been dropped`);
  await client.end();
};

const runMigration = async () => {
  const { db, client } = await connectToDatabase();
  // does not work due to issue with `serial` type:
  // https://github.com/drizzle-team/drizzle-orm/issues/2183
  // await migrate(db, { migrationsFolder: `${__dirname}/../drizzle` });

  // Let's do the migration manually for now
  // 1. run the drizzle migration command
  const output = execSync(`cd ${__dirname}/.. && npx drizzle-kit generate`);
  console.info(output.toString());
  // 2. create a table where we store which migrations have been run
  await db.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      migration_name VARCHAR(255) PRIMARY KEY
    );
  `);
  // 3. let's run the migrations
  // but only the ones that haven't been run yet
  const alreadyExecuted = (
    await db.execute(`SELECT migration_name FROM migrations;`)
  ).rows.map((row) => row.migration_name) as string[];
  console.info(`${alreadyExecuted.length} already executed migrations`);
  const sqlFiles = readdirSync(`${__dirname}/../drizzle`)
    .filter((file) => file.endsWith('.sql'))
    .filter((file) => !alreadyExecuted.some((row) => row === file))
    .sort();
  for await (const file of sqlFiles) {
    console.info(`Running migration: ${file}`);
    const sql = readFileSync(`${__dirname}/../drizzle/${file}`, 'utf-8');
    await db.execute(sql);
    // 4. let's store the migration in the migrations table
    await db.execute(
      `INSERT INTO migrations (migration_name) VALUES ('${file}');`
    );
    console.info(`Migration ${file} has been run`);
  }
  console.info('All migrations have been run');
  await client.end();
  console.info(`Disconnected from ${clusterIdentifier}`);
};

// only run locally
// please run `npx drizzle-kit migrate` before to generate
// the migration files and the types for drizzle
if (!process.env.AWS_REGION) {
  const { cmd } = parseCommandLineArgs<{ cmd: string }>();
  dotenv.config({ path: `${__dirname}/../.env` });
  clusterIdentifier = process.env.CLUSTER_IDENTIFIER!;
  switch (cmd) {
    case 'drop':
      dropDatabase();
      break;
    case 'migrate':
      runMigration();
      break;
    default:
      console.error(`Unknown command: ${cmd}`);
      process.exit(1);
  }
}
