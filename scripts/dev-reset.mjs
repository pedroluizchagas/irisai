import { Pool } from 'pg'
import { DsqlSigner } from '@aws-sdk/dsql-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'

async function getPool() {
  const signer = new DsqlSigner({
    credentials: awsCredentialsProvider({
      roleArn: process.env.AWS_ROLE_ARN,
      clientConfig: { region: process.env.AWS_REGION }
    }),
    region: process.env.AWS_REGION,
    hostname: process.env.PGHOST,
    expiresIn: 900
  })
  const token = await signer.getDbConnectAdminAuthToken()
  const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER || 'admin',
    database: process.env.PGDATABASE || 'postgres',
    password: token,
    port: 5432,
    ssl: true,
    max: 5
  })
  return pool
}

async function run() {
  const args = process.argv.slice(2)
  if (!args.includes('--confirm')) {
    console.error(JSON.stringify({ ok: false, error: 'Use --confirm para executar' }))
    process.exit(1)
  }
  const pool = await getPool()
  try {
    const sqls = [
      "DELETE FROM habit_logs WHERE tenant_id = 'seed-tenant' OR id LIKE 'seed-%'",
      "DELETE FROM habits WHERE tenant_id = 'seed-tenant' OR id LIKE 'seed-%'",
      "DELETE FROM goals WHERE tenant_id = 'seed-tenant' OR id LIKE 'seed-%'",
      "DELETE FROM transactions WHERE tenant_id = 'seed-tenant' OR id LIKE 'seed-%'",
      "DELETE FROM notes WHERE tenant_id = 'seed-tenant' OR id LIKE 'seed-%'",
      "DELETE FROM events WHERE tenant_id = 'seed-tenant' OR id LIKE 'seed-%'",
      "DELETE FROM tasks WHERE tenant_id = 'seed-tenant' OR id LIKE 'seed-%'",
      "DELETE FROM users WHERE id = 'seed-user' OR tenant_id = 'seed-tenant'",
      "DELETE FROM tenants WHERE id = 'seed-tenant'"
    ]
    for (const sql of sqls) {
      await pool.query(sql)
      console.log(JSON.stringify({ ok: true, action: 'delete', sql }))
    }
  } finally {
    await pool.end()
  }
}

run().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err) }))
  process.exit(1)
})
