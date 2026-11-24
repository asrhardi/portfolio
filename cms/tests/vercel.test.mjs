import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { Readable } from 'node:stream';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { validateDeployment } = require('../lib/deployment');
const { createProvider } = require('../providers/vercel-blob');
const cloudConfig = () => ({
    CMS_DEPLOYMENT_TARGET: 'vercel', PUBLIC_URL: 'https://cms.example.com',
    APP_KEYS: `${'a'.repeat(40)},${'b'.repeat(40)}`,
    ADMIN_JWT_SECRET: 'c'.repeat(40), API_TOKEN_SALT: 'd'.repeat(40),
    TRANSFER_TOKEN_SALT: 'e'.repeat(40), ENCRYPTION_KEY: 'f'.repeat(40),
    DATABASE_URL: 'postgres://test-user:test-password@database.example.com/cms?sslmode=require',
    BLOB_STORE_ID: 'test-store', VERCEL_OIDC_TOKEN: 'test-oidc-credential',
});

test('Vercel startup refuses missing secrets, SQLite, local uploads, and insecure database settings', () => {
    assert.doesNotThrow(() => validateDeployment({}));
    assert.doesNotThrow(() => validateDeployment(cloudConfig()));
    const cases = [
        { APP_KEYS: '' }, { APP_KEYS: `${'a'.repeat(40)},${'a'.repeat(40)}` },
        { ADMIN_JWT_SECRET: '' }, { DATABASE_CLIENT: 'sqlite' }, { UPLOAD_PROVIDER: 'local' },
        { PUBLIC_URL: 'http://cms.example.com' }, { DATABASE_SSL: 'false' },
        { DATABASE_SSL_REJECT_UNAUTHORIZED: 'false' },
        { DATABASE_URL: 'postgres://user:do-not-print-this-value@db.example.com/cms?sslmode=no-verify' },
        { BLOB_STORE_ID: '' },
    ];
    for (const overrides of cases) {
        assert.throws(() => validateDeployment({ ...cloudConfig(), ...overrides }), (error) => {
            assert(!error.message.includes('do-not-print-this-value'));
            assert(!error.message.includes('test-oidc-credential'));
            return error.message.includes('configuration is incomplete');
        });
    }
    const offline = { ...cloudConfig(), VERCEL_OIDC_TOKEN: '' };
    assert.doesNotThrow(() => validateDeployment(offline, { runtime: false }));
    assert.throws(() => validateDeployment(offline));
    assert.doesNotThrow(() => validateDeployment({ ...offline, BLOB_READ_WRITE_TOKEN: 'test-static-token' }));
});

test('Vercel uses a small idle-free database pool, persistent uploads, and a bounded request size', () => {
    const previous = process.env.CMS_DEPLOYMENT_TARGET;
    process.env.CMS_DEPLOYMENT_TARGET = 'vercel';
    try {
        const values = { ...cloudConfig(), DATABASE_SSL_CA: 'test-certificate-authority' };
        const env = (key, fallback) => values[key] ?? fallback;
        env.int = (key, fallback) => Number(values[key] ?? fallback);
        env.bool = (key, fallback) => values[key] === undefined ? fallback : values[key] === 'true';
        const database = require('../config/database')({ env }).connection;
        const upload = require('../config/plugins')({ env }).upload.config;
        const middlewares = require('../config/middlewares');
        const body = middlewares.find((item) => item.name === 'strapi::body');
        assert.equal(database.client, 'postgres');
        assert.equal(database.pool.min, 0);
        assert.equal(database.pool.max, 5);
        assert.equal(database.connection.ssl.rejectUnauthorized, true);
        const { Client } = require('pg');
        const connection = new Client(database.connection).connectionParameters;
        assert.equal(connection.ssl.ca, 'test-certificate-authority');
        assert.equal(connection.ssl.rejectUnauthorized, true);
        assert.equal(upload.provider, 'strapi-provider-upload-vercel-blob');
        assert.equal(upload.sizeLimit, 4 * 1024 * 1024);
        assert.equal(body.config.formidable.maxTotalFileSize, upload.sizeLimit);
    } finally {
        if (previous === undefined) delete process.env.CMS_DEPLOYMENT_TARGET;
        else process.env.CMS_DEPLOYMENT_TARGET = previous;
    }
});

test('Blob uploads keep credentials out of file metadata and protect existing media on failed replacement', async () => {
    const calls = [];
    let fail = false;
    const client = {
        async put(pathname, body, options) {
            if (fail) throw new Error('Upload test failure');
            const chunks = [];
            for await (const chunk of Buffer.isBuffer(body) ? [body] : body) chunks.push(Buffer.from(chunk));
            calls.push({ action: 'put', bytes: Buffer.concat(chunks), options });
            const target = pathname.replace('.jpg', '-random.jpg');
            return { url: `https://test-store.public.blob.vercel-storage.com/${target}`, pathname: target };
        },
        async del(url) { calls.push({ action: 'delete', url }); },
    };
    const provider = createProvider({ prefix: 'strapi/production' }, client);
    const original = { hash: 'example_123', ext: '.jpg', mime: 'image/jpeg', stream: Readable.from([Buffer.from('test-image')]) };
    await provider.uploadStream(original);
    assert(calls[0].bytes.equals(Buffer.from('test-image')));
    assert.equal(calls[0].options.access, 'public');
    assert.equal(calls[0].options.allowOverwrite, false);
    assert.equal(calls[0].options.token, undefined);
    assert.equal(calls[0].options.oidcToken, undefined);
    assert.deepEqual(Object.keys(original.provider_metadata), ['pathname']);
    fail = true;
    await assert.rejects(provider.replace({ hash: 'replacement', ext: '.jpg', mime: 'image/jpeg', buffer: Buffer.from('new') }, original));
    assert.equal(calls.filter((call) => call.action === 'delete').length, 0);
    await assert.rejects(provider.delete({ ...original, url: 'https://other.example.com/file.jpg' }));
    await assert.rejects(provider.delete({ ...original, provider_metadata: { pathname: 'strapi/preview/other.jpg' } }));
    assert.equal(calls.length, 1);
    await provider.delete(original);
    assert.equal(calls.at(-1).action, 'delete');
    await assert.rejects(provider.upload({ hash: '../outside', ext: '.jpg', buffer: Buffer.from('x') }));
});

test('deployment secrets are generated privately and preserved on repeated setup', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'portfolio-vercel-setup-'));
    try {
        await mkdir(path.join(directory, 'scripts'));
        await mkdir(path.join(directory, 'lib'));
        for (const filename of ['scripts/setup-vercel-env.cjs', 'lib/deployment.js', '.env.vercel.example']) {
            await cp(new URL(`../${filename}`, import.meta.url), path.join(directory, filename));
        }
        const script = path.join(directory, 'scripts/setup-vercel-env.cjs');
        const args = [script, '--public-url', 'https://cms.example.com'];
        execFileSync(process.execPath, args, { stdio: 'pipe' });
        const filename = path.join(directory, '.env.vercel');
        const first = await readFile(filename, 'utf8');
        assert(!first.includes('REPLACE_WITH'));
        assert(first.includes('PUBLIC_URL=https://cms.example.com'));
        assert(first.includes('DATABASE_URL=\n'));
        assert.equal((await stat(filename)).mode & 0o777, 0o600);
        execFileSync(process.execPath, args, { stdio: 'pipe' });
        assert.equal(await readFile(filename, 'utf8'), first);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});
