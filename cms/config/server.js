const { isVercel } = require('../lib/deployment');

module.exports = ({ env }) => ({
  host: env('HOST', '127.0.0.1'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'http://127.0.0.1:1337'),
  proxy: { koa: env.bool('TRUST_PROXY', isVercel()) },
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
