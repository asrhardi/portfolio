const { isVercel } = require('../lib/deployment');

const allowedMediaTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

module.exports = ({ env }) => ({
  upload: {
    config: {
      sizeLimit: (isVercel() ? 4 : 10) * 1024 * 1024,
      ...(env('UPLOAD_PROVIDER', isVercel() ? 'vercel-blob' : 'local') === 'vercel-blob' ? {
        provider: 'strapi-provider-upload-vercel-blob',
        providerOptions: { prefix: env('BLOB_PATH_PREFIX', `strapi/${env('VERCEL_ENV', 'production')}`) },
      } : {}),
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
});
