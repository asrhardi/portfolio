'use strict';

const path = require('node:path');
const { validateDeployment } = require('../lib/deployment');
const result = require('dotenv').config({ path: path.resolve(__dirname, '../.env.vercel'), quiet: true });
if (result.error) {
  console.error('Create cms/.env.vercel with cms:vercel:setup first.');
  process.exitCode = 1;
} else {
  try {
    validateDeployment({ ...result.parsed, CMS_DEPLOYMENT_TARGET: 'vercel' }, { runtime: false });
    console.info('Configuration shape is valid. This check does not connect to Neon or Blob. Vercel supplies OIDC at runtime.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
