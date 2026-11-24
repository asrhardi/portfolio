const { isVercel } = require('../lib/deployment');

module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'img-src': ["'self'", 'data:', 'blob:', 'https://market-assets.strapi.io', 'https://*.public.blob.vercel-storage.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'https://*.public.blob.vercel-storage.com'],
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://127.0.0.1:5174', 'http://localhost:5174'],
      credentials: false,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  ...(isVercel() ? [{
    name: 'strapi::body',
    config: { formidable: { maxFileSize: 4 * 1024 * 1024, maxTotalFileSize: 4 * 1024 * 1024 } },
  }] : ['strapi::body']),
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
