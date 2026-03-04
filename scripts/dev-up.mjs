import { readFileSync, readdirSync } from 'fs'
import path from 'path'
import { DsqlSigner } from '@aws-sdk/dsql-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { Pool } from 'pg'

async function getPool() {
  const host = process.env.PGHOST || 'localhost'
  const isLocal = host.includes('localhost') || host.startsWith('127.')
  const hasOidc = !!process.env.AWS_ROLE_ARN && !!process.env.AWS_REGION
  const hasCreds = !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY && !!process.env.AWS_REGION
  const useIam = !isLocal && (hasOidc || hasCreds) && !process.env.PGPASSWORD
  if (useIam) {
    const credentials = hasOidc
      ? awsCredentialsProvider({
          roleArn: process.env.AWS_ROLE_ARN,
          clientConfig: { region: process.env.AWS_REGION },
        })
      : async () => ({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          sessionToken: process.env.AWS_SESSION_TOKEN,
        })
    const signer = new DsqlSigner({
      credentials,
      region: process.env.AWS_REGION,
      hostname: host,
      expiresIn: 900,
    })
    const token = await signer.getDbConnectAdminAuthToken()
    return new Pool({
      host,
      user: process.env.PGUSER || 'admin',
      database: process.env.PGDATABASE || 'postgres',
      password: token,
      port: 5432,
      ssl: true,
      max: 5,
    })
  }
  return new Pool({
    host,
    user: process.env.PGUSER || 'admin',
    database: process.env.PGDATABASE || 'postgres',
    password: process.env.PGPASSWORD,
    port: 5432,
    ssl: process.env.PGSSL === 'false' ? false : isLocal ? false : true,
    max: 5,
  })
}

function getSqlFiles(dir) {
  const files = readdirSync(dir)
    .filter((f) => /^\d{3}-.*\.sql$/.test(f))
    .sort((a, b) => parseInt(a.slice(0, 3)) - parseInt(b.slice(0, 3)))
  return files.map((f) => path.join(dir, f))
}

async function run() {
  const args = process.argv.slice(2)
  const withSeed = args.includes('--seed')
  const scriptsDir = path.join(process.cwd(), 'scripts')
  const pool = await getPool()
  try {
    const files = getSqlFiles(scriptsDir)
    for (const file of files) {
      const sql = readFileSync(file, 'utf8')
      await pool.query(sql)
      console.log(JSON.stringify({ ok: true, file }))
    }
    if (withSeed) {
      const seedFile = path.join(scriptsDir, '008-seed.sql')
      const seedSql = readFileSync(seedFile, 'utf8')
      await pool.query(seedSql)
      console.log(JSON.stringify({ ok: true, file: '008-seed.sql' }))
    }
  } finally {
    await pool.end()
  }
}

run().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err) }))
  process.exit(1)
})
