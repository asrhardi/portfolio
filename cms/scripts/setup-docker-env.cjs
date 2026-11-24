'use strict';

const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const path = require('node:path');

const appDir = path.resolve(__dirname, '..');
const filename = path.join(appDir, '.env.docker');
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--public-url')) {
  throw new Error('Usage: npm run docker:setup -- --public-url https://cms.example.com');
}

const suppliedUrl = args[1] || process.env.PUBLIC_URL;
function validateUrl(value) {
  const url = new URL(value);
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && local))
    || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('The CMS public URL must be an HTTPS origin without a path, credentials, query, or fragment. Local HTTP is allowed for API checks.');
  }
  return url.origin;
}

if (suppliedUrl) validateUrl(suppliedUrl);
require('./setup-env.cjs');
mkdirSync(path.join(appDir, '.tmp'), { recursive: true });
mkdirSync(path.join(appDir, 'public', 'uploads'), { recursive: true });

const existing = existsSync(filename);
if (existing && !suppliedUrl) {
  console.info('.env.docker already exists; its settings and secrets were preserved.');
  process.exit(0);
}

let contents = readFileSync(existing ? filename : path.join(appDir, '.env'), 'utf8');
const publicUrl = validateUrl(suppliedUrl || 'http://127.0.0.1:1337');
const values = existing ? { PUBLIC_URL: publicUrl } : {
  HOST: '0.0.0.0', PORT: '1337', PUBLIC_URL: publicUrl, TRUST_PROXY: 'true',
  DATABASE_CLIENT: 'sqlite', DATABASE_FILENAME: '.tmp/data.db',
};
for (const [key, value] of Object.entries(values)) {
  const line = new RegExp(`^${key}=.*$`, 'm');
  contents = line.test(contents) ? contents.replace(line, () => `${key}=${value}`) : `${contents.trimEnd()}\n${key}=${value}\n`;
}
writeFileSync(filename, contents, { mode: 0o600, flag: existing ? 'w' : 'wx' });
console.info(`${existing ? 'Updated the public URL in' : 'Created'} .env.docker. Existing application secrets and local data are preserved.`);
console.info(`CMS public URL: ${publicUrl}. Rebuild the container after changing it.`);
