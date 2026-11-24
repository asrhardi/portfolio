'use strict';

const { randomBytes } = require('node:crypto');
const { writeFileSync } = require('node:fs');
const path = require('node:path');

const production = process.argv.includes('--production');
const filename = path.join(__dirname, '..', production ? '.env.production' : '.env');
const secret = () => randomBytes(32).toString('base64');
const contents = [
  `HOST=${production ? '0.0.0.0' : '127.0.0.1'}`,
  'PORT=1337',
  'PUBLIC_URL=http://127.0.0.1:1337',
  `TRUST_PROXY=${production}`,
  `APP_KEYS=${secret()},${secret()}`,
  `ADMIN_JWT_SECRET=${secret()}`,
  `API_TOKEN_SALT=${secret()}`,
  `TRANSFER_TOKEN_SALT=${secret()}`,
  `ENCRYPTION_KEY=${secret()}`,
  `DATABASE_CLIENT=${production ? 'postgres' : 'sqlite'}`,
  'DATABASE_FILENAME=.tmp/data.db',
  `DATABASE_HOST=${production ? 'database' : '127.0.0.1'}`,
  'DATABASE_PORT=5432',
  'DATABASE_NAME=portfolio',
  'DATABASE_USERNAME=portfolio',
  `DATABASE_PASSWORD=${secret()}`,
  'STRAPI_TELEMETRY_DISABLED=true',
  '',
].join('\n');

try {
  writeFileSync(filename, contents, { flag: 'wx', mode: 0o600 });
  console.info(`Created ${path.basename(filename)} with generated secrets. Keep this file private and backed up.`);
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.info(`${path.basename(filename)} already exists; it was left unchanged.`);
}
