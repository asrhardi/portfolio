'use strict';

const { existsSync, readFileSync, writeFileSync } = require('node:fs');
const { randomBytes } = require('node:crypto');
const path = require('node:path');
const { SECRET_KEYS } = require('../lib/deployment');
const appDir = path.resolve(__dirname, '..');
const filename = path.join(appDir, '.env.vercel');
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--public-url') throw new Error('Usage: npm run cms:vercel:setup -- --public-url https://your-cms.vercel.app');
const url = new URL(args[1]);
if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Use an HTTPS CMS origin without a path, credentials, query, or fragment.');
if (existsSync(filename)) {
  console.info('.env.vercel already exists; its secrets were preserved. Edit PUBLIC_URL manually if the address changed.');
  process.exit(0);
}
let contents = readFileSync(path.join(appDir, '.env.vercel.example'), 'utf8');
const secret = () => randomBytes(32).toString('base64');
const values = { PUBLIC_URL: url.origin, APP_KEYS: `${secret()},${secret()}` };
for (const key of SECRET_KEYS) values[key] = secret();
for (const [key, value] of Object.entries(values)) contents = contents.replace(new RegExp(`^${key}=.*$`, 'm'), () => `${key}=${value}`);
writeFileSync(filename, contents, { flag: 'wx', mode: 0o600 });
console.info('Created private cms/.env.vercel with separate deployment secrets. It is gitignored.');
console.info('Connect Neon and a public Blob store before importing the configuration into the CMS project.');
