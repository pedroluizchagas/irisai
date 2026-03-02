// Database connection - Aurora DSQL with IAM auth
import { Pool, type ClientBase } from 'pg'
import { DsqlSigner } from '@aws-sdk/dsql-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { attachDatabasePool } from '@vercel/functions'

const signer = new DsqlSigner({
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN as string,
    clientConfig: { region: process.env.AWS_REGION as string },
  }),
  region: process.env.AWS_REGION as string,
  hostname: process.env.PGHOST as string,
  expiresIn: 900,
})

const pool = new Pool({
  host: process.env.PGHOST as string,
  user: process.env.PGUSER || 'admin',
  database: process.env.PGDATABASE || 'postgres',
  password: () => signer.getDbConnectAdminAuthToken(),
  port: 5432,
  ssl: true,
  max: 20,
})
attachDatabasePool(pool)

// Single query execution
export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params)
}

// Multi-query transaction
export async function withConnection<T>(
  fn: (client: ClientBase) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}
