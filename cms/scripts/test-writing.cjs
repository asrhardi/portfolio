'use strict';

const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { mkdtemp, readFile, rm } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

async function main() {
  const appDir = path.resolve(__dirname, '..');
  const root = path.resolve(appDir, '..');
  const directory = await mkdtemp(path.join(os.tmpdir(), 'portfolio-cms-test-'));
  const secret = () => randomBytes(32).toString('hex');
  Object.assign(process.env, {
    NODE_ENV: 'test', HOST: '127.0.0.1', PORT: '0', SERVE_ADMIN: 'false',
    DATABASE_CLIENT: 'sqlite', DATABASE_FILENAME: path.relative(appDir, path.join(directory, 'data.db')),
    APP_KEYS: `${secret()},${secret()}`, ADMIN_JWT_SECRET: secret(), API_TOKEN_SALT: secret(),
    TRANSFER_TOKEN_SALT: secret(), ENCRYPTION_KEY: secret(), STRAPI_TELEMETRY_DISABLED: 'true',
  });
  const blobFiles = new Map();
  const useBlob = process.env.CMS_TEST_BLOB === '1';
  if (process.env.CMS_TEST_DATABASE_URL) Object.assign(process.env, {
    DATABASE_CLIENT: 'postgres', DATABASE_URL: process.env.CMS_TEST_DATABASE_URL,
    DATABASE_SSL: 'false', DATABASE_POOL_MIN: '0', DATABASE_POOL_MAX: '5',
  });
  if (useBlob) {
    Object.assign(process.env, { UPLOAD_PROVIDER: 'vercel-blob', BLOB_PATH_PREFIX: 'strapi/test' });
    const provider = require('../providers/vercel-blob');
    provider.init = (options) => provider.createProvider(options, {
      async put(pathname, body) {
        const chunks = [];
        for await (const chunk of body) chunks.push(Buffer.from(chunk));
        const target = pathname.replace(/\.(\w+)$/, '-test.$1');
        const url = `https://test-store.public.blob.vercel-storage.com/${target}`;
        blobFiles.set(url, Buffer.concat(chunks));
        return { url, pathname: target };
      },
      async del(url) { blobFiles.delete(url); },
    });
  }
  const { createStrapi } = require('@strapi/strapi');
  let app = createStrapi({ appDir });
  const fixtureFiles = [];
  try {
    await app.load();
    app.log.level = 'error';
    await app.start();
    const origin = `http://127.0.0.1:${app.server.httpServer.address().port}`;
    const documents = app.documents('api::article.article');
    const registration = await fetch(`${origin}/admin/register-admin`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'cms-integration@example.invalid', firstname: 'Integration', lastname: 'Test', password: `Aa1!${secret()}` }),
    });
    assert.equal(registration.status, 200, 'Test administrator registration failed.');
    const admin = (await registration.json()).data;
    const adminHeaders = { Authorization: `Bearer ${admin.token}` };
    const configuration = await fetch(`${origin}/content-manager/content-types/api::article.article/configuration`, { headers: adminHeaders });
    assert.equal(configuration.status, 200, 'The Article editor is not accessible to the administrator.');
    const draft = await documents.create({ data: {
      title: 'Integration test draft', slug: 'integration-test-draft', excerpt: 'A draft that must stay private.',
      body: [{ type: 'paragraph', children: [{ type: 'text', text: 'PRIVATE_DRAFT_SENTINEL' }] }],
    } });
    const get = (pathname) => fetch(`${origin}${pathname}`);
    let response = await get('/api/writing');
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).data, []);
    assert.equal((await get(`/api/writing/${draft.slug}?status=draft`)).status, 404);
    assert.equal((await get('/api/writing?page=-1')).status, 400);
    assert.equal((await get('/api/writing?page[$gt]=1')).status, 400);

    const image = await readFile(path.join(root, 'public', 'profile.jpg'));
    const form = new FormData();
    form.append('files', new Blob([image], { type: 'image/jpeg' }), 'integration-test.jpg');
    const uploadResponse = await fetch(`${origin}/upload`, { method: 'POST', headers: adminHeaders, body: form });
    assert.equal(uploadResponse.status, 201, 'Administrator image upload failed.');
    const [uploaded] = await uploadResponse.json();
    for (const media of [uploaded, ...Object.values(uploaded.formats || {})]) {
      if (useBlob) {
        assert(blobFiles.has(media.url), 'Media was not sent through the Blob provider.');
      } else {
        assert(media.url.startsWith('/uploads/'));
        fixtureFiles.push(path.join(appDir, 'public', media.url));
      }
    }
    console.info('PASS: administrator registration, Article editor configuration, and authenticated image upload verified.');
    const article = await documents.create({ data: {
      title: 'Integration test article', slug: 'integration-test-article',
      excerpt: 'A temporary article used only to verify the CMS integration.', date: '2026-11-24',
      body: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Published test content with <script>alert(1)</script> as literal text.' }] },
        { type: 'paragraph', children: [{ type: 'link', url: 'https://www.asrhardi.xyz/', children: [{ type: 'text', text: 'A test link to the portfolio.' }] }] },
        { type: 'code', children: [{ type: 'text', text: 'const example = "long-test-value";' }] },
        { type: 'image', image: { ...uploaded, alternativeText: 'Existing avatar reused for an integration test.' }, children: [{ type: 'text', text: '' }] },
      ],
      cover: uploaded.id,
    } });
    await documents.publish({ documentId: article.documentId });
    await documents.update({ documentId: article.documentId, data: { title: 'PRIVATE_UNPUBLISHED_REVISION' } });
    response = await get('/api/writing?status=draft&populate=*');
    const index = await response.json();
    assert.equal(index.data.length, 1);
    assert.equal(index.data[0].title, 'Integration test article');
    assert.equal(index.data[0].body, undefined);
    response = await get('/api/writing/integration-test-article?status=draft');
    assert.equal((await response.json()).data.title, 'Integration test article');
    assert.equal((await get('/api/articles')).status, 404);
    for (const pathname of ['/api/writing', '/api/upload', '/api/auth/local/register']) {
      const mutation = await fetch(`${origin}${pathname}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      assert(mutation.status >= 400, `${pathname} allowed anonymous writes`);
    }
    console.info('PASS: public API exposes published content only; drafts, revisions, and anonymous writes stay inaccessible.');

    const build = spawn('npm', ['run', 'build'], { cwd: root, env: { ...process.env, NODE_ENV: 'production', CMS_URL: origin }, stdio: ['ignore', 'pipe', 'pipe'] });
    let buildOutput = '';
    build.stdout.on('data', (chunk) => { buildOutput += chunk; });
    build.stderr.on('data', (chunk) => { buildOutput += chunk; });
    const exitCode = await new Promise((resolve, reject) => { build.once('error', reject); build.once('exit', resolve); });
    assert.equal(exitCode, 0, buildOutput);
    console.info('Website build finished; checking generated article files.');
    const html = await readFile(path.join(root, 'dist', 'writing', article.slug, 'index.html'), 'utf8');
    const sitemap = await readFile(path.join(root, 'dist', 'sitemap.xml'), 'utf8');
    const data = await readFile(path.join(root, 'dist', 'writing', 'data', `${article.slug}.json`), 'utf8');
    assert(html.includes('<title>Integration test article | AsrHardi</title>'));
    assert(html.includes(`rel="canonical" href="https://www.asrhardi.xyz/writing/${article.slug}"`));
    assert(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    assert(!html.includes('href="javascript:'));
    assert(!html.includes('PRIVATE_'));
    assert(!data.includes('PRIVATE_'));
    assert(!sitemap.includes(draft.slug));
    assert(sitemap.includes(`/writing/${article.slug}`));
    const copiedImage = JSON.parse(data).data.body.find((block) => block.type === 'image').image.url;
    if (useBlob) {
      assert.equal(copiedImage, uploaded.url);
      assert(blobFiles.get(copiedImage)?.length > 0, 'The persistent media URL has no content.');
    } else {
      assert(copiedImage.startsWith('/writing/media/'));
      const uploadedBytes = Buffer.from(await (await get(uploaded.url)).arrayBuffer());
      const copiedBytes = await readFile(path.join(root, 'dist', copiedImage.slice(1)));
      assert(copiedBytes.equals(uploadedBytes), 'The static copy differs from the CMS-served image.');
    }
    console.info('PASS: static article HTML, canonical, sitemap, safe rich text, and copied media verified.');

    await documents.unpublish({ documentId: article.documentId });
    assert.deepEqual((await (await get('/api/writing')).json()).data, []);
    assert.equal((await get(`/api/writing/${article.slug}`)).status, 404);
    console.info('PASS: unpublishing removes the article from both public endpoints.');
    await app.destroy();
    app = createStrapi({ appDir });
    await app.load();
    app.log.level = 'error';
    await app.start();
    const restarted = `http://127.0.0.1:${app.server.httpServer.address().port}`;
    assert.equal((await (await fetch(`${restarted}/admin/init`)).json()).data.hasAdmin, true);
    assert.equal(await app.documents('api::article.article').count({ status: 'draft' }), 2);
    const persistedMedia = await app.db.query('plugin::upload.file').findOne({ where: { id: uploaded.id } });
    assert.equal(persistedMedia.url, uploaded.url);
    if (useBlob) assert(blobFiles.has(persistedMedia.url));
    console.info('PASS: administrator, articles, and media references survive a CMS restart.');
  } finally {
    await app.destroy();
    for (const filename of fixtureFiles) await rm(filename, { force: true });
    await rm(directory, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); if (error.details) console.error(JSON.stringify(error.details, null, 2)); process.exitCode = 1; });
