'use strict';

const path = require('node:path');
const { validateDeployment } = require('../lib/deployment');
const appDir = path.resolve(__dirname, '..');
process.env.NODE_ENV ||= 'production';
require('dotenv').config({ path: process.env.ENV_PATH || path.join(appDir, '.env'), quiet: true });

async function start() {
  validateDeployment();
  const { createStrapi } = require('@strapi/strapi');
  const app = createStrapi({ appDir, distDir: appDir });
  let stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    await app.destroy();
  };
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => { stop().catch(() => { process.exitCode = 1; }); });
  await app.start();
}

start().catch((error) => { console.error(error.message); process.exitCode = 1; });
