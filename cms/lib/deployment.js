'use strict';

const SECRET_KEYS = ['ADMIN_JWT_SECRET', 'API_TOKEN_SALT', 'TRANSFER_TOKEN_SALT', 'ENCRYPTION_KEY'];
const isVercel = (env = process.env) => env.CMS_DEPLOYMENT_TARGET === 'vercel' || env.VERCEL === '1';

function validateDeployment(env = process.env, { runtime = true } = {}) {
  if (!isVercel(env)) return;
  const errors = [];
  const strong = (value) => typeof value === 'string' && value.length >= 32 && !/tobemodified|placeholder|replace|change.?me/i.test(value);
  const keys = (env.APP_KEYS || '').split(',').map((value) => value.trim());
  if (keys.length < 2 || !keys.every(strong) || new Set(keys).size !== keys.length) errors.push('APP_KEYS needs at least two distinct random keys, separated by commas.');
  for (const key of SECRET_KEYS) if (!strong(env[key])) errors.push(`${key} needs a random secret of at least 32 characters.`);
  try {
    const url = new URL(env.PUBLIC_URL);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error();
  } catch { errors.push('PUBLIC_URL must be the HTTPS origin of this CMS, without a path or credentials.'); }
  if ((env.DATABASE_CLIENT || 'postgres') !== 'postgres') errors.push('Vercel requires DATABASE_CLIENT=postgres; local SQLite is not persistent.');
  try {
    const url = new URL(env.DATABASE_URL);
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !url.username || !url.password || url.pathname === '/') throw new Error();
    if (['disable', 'no-verify', 'prefer'].includes(url.searchParams.get('sslmode')) || ['false', '0'].includes(url.searchParams.get('ssl'))) throw new Error();
  } catch { errors.push('DATABASE_URL must be a PostgreSQL connection string from the connected database.'); }
  if (env.DATABASE_SSL !== undefined && env.DATABASE_SSL !== 'true') errors.push('DATABASE_SSL cannot be disabled for the Vercel deployment.');
  if (env.DATABASE_SSL_REJECT_UNAUTHORIZED !== undefined && env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'true') errors.push('PostgreSQL certificate verification cannot be disabled for Vercel.');
  if ((env.UPLOAD_PROVIDER || 'vercel-blob') !== 'vercel-blob') errors.push('Vercel requires UPLOAD_PROVIDER=vercel-blob; local uploads are not persistent.');
  if (!(env.BLOB_STORE_ID && (!runtime || env.VERCEL_OIDC_TOKEN)) && !env.BLOB_READ_WRITE_TOKEN) errors.push('Connect a public Blob store (BLOB_STORE_ID with Vercel OIDC), or supply BLOB_READ_WRITE_TOKEN.');
  if (env.TRUST_PROXY !== undefined && env.TRUST_PROXY !== 'true') errors.push('TRUST_PROXY must be enabled behind Vercel HTTPS.');
  if (errors.length) throw new Error(`CMS deployment configuration is incomplete:\n- ${errors.join('\n- ')}\nSet these variables on the CMS project, then redeploy. Values are never included in this message.`);
}

function cloudDatabaseUrl(value) {
  if (!value) return value;
  const url = new URL(value);
  // node-postgres URL SSL parameters replace the complete SSL object, including CA verification settings.
  for (const key of ['sslmode', 'ssl', 'sslcert', 'sslkey', 'sslrootcert', 'uselibpqcompat']) url.searchParams.delete(key);
  return url.href;
}

module.exports = { SECRET_KEYS, isVercel, validateDeployment, cloudDatabaseUrl };
