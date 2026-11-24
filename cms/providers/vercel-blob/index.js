'use strict';

function createProvider({ prefix = 'strapi/production' } = {}, client = require('@vercel/blob')) {
  if (!/^strapi\/[a-z0-9-]+$/.test(prefix)) throw new Error('Blob prefix must have the form strapi/environment.');
  const filePath = (file) => {
    if (typeof file.hash !== 'string' || !/^[a-zA-Z0-9_-]{1,200}$/.test(file.hash) || !/^\.(?:jpe?g|png|webp|gif|avif)$/i.test(file.ext)) throw new Error('Invalid media filename.');
    return `${prefix}/${file.hash}${file.ext.toLowerCase()}`;
  };
  const upload = async (file, body) => {
    if (!body) throw new Error('Missing media content.');
    const result = await client.put(filePath(file), body, {
      access: 'public', contentType: file.mime, addRandomSuffix: true,
      allowOverwrite: false, cacheControlMaxAge: 31536000,
    });
    file.url = result.url;
    file.provider_metadata = { pathname: result.pathname };
  };
  const remove = async (file) => {
    let url;
    try { url = new URL(file.url); } catch { throw new Error('Invalid Blob URL.'); }
    const pathname = file.provider_metadata?.pathname;
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash
      || !/^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/i.test(url.hostname)
      || typeof pathname !== 'string' || !pathname.startsWith(`${prefix}/`)
      || decodeURIComponent(url.pathname.slice(1)) !== pathname) throw new Error('Refusing to delete media outside this provider prefix.');
    await client.del(file.url);
  };
  return {
    upload: (file) => upload(file, file.buffer),
    uploadStream: (file) => upload(file, file.stream),
    delete: remove,
    async replace(newFile, oldFile) { await upload(newFile, newFile.buffer); await remove(oldFile); },
    async replaceStream(newFile, oldFile) { await upload(newFile, newFile.stream); await remove(oldFile); },
    isPrivate() { return false; },
  };
}

module.exports = { init: (options) => createProvider(options), createProvider };
