// Database connection - Aurora DSQL with IAM auth
import { Pool, type ClientBase } from 'pg'
import { DsqlSigner } from '@aws-sdk/dsql-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { attachDatabasePool } from '@vercel/functions'

const host = process.env.PGHOST || 'localhost'
const isLocal = host.includes('localhost') || host.startsWith('127.')
const isVercel = !!process.env.VERCEL
const hasOidc = !!process.env.AWS_ROLE_ARN && !!process.env.AWS_REGION && isVercel
const hasEnvAws = !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY && !!process.env.AWS_REGION
const useIam = !isLocal && (hasOidc || hasEnvAws) && !process.env.PGPASSWORD

let pool: Pool
if (useIam) {
  const credentials =
    hasOidc
      ? awsCredentialsProvider({
          roleArn: process.env.AWS_ROLE_ARN as string,
          clientConfig: { region: process.env.AWS_REGION as string },
        })
      : async () => ({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
          sessionToken: process.env.AWS_SESSION_TOKEN,
        })
  const signer = new DsqlSigner({
    credentials,
    region: process.env.AWS_REGION as string,
    hostname: host as string,
    expiresIn: 900,
  })
  pool = new Pool({
    host: host as string,
    user: process.env.PGUSER || 'admin',
    database: process.env.PGDATABASE || 'postgres',
    password: () => signer.getDbConnectAdminAuthToken(),
    port: 5432,
    ssl: true,
    max: 20,
  })
} else {
  pool = new Pool({
    host: host as string,
    user: process.env.PGUSER || 'admin',
    database: process.env.PGDATABASE || 'postgres',
    password: process.env.PGPASSWORD,
    port: 5432,
    ssl: process.env.PGSSL === 'false' ? false : isLocal ? false : true,
    max: 20,
  })
}
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
