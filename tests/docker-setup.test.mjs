import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

test('Docker setup keeps existing secrets and changes only the requested public URL', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'portfolio-docker-setup-'));
    try {
        const scripts = path.join(directory, 'scripts');
        await mkdir(scripts);
        for (const filename of ['setup-env.cjs', 'setup-docker-env.cjs']) {
            await cp(new URL(`../cms/scripts/${filename}`, import.meta.url), path.join(scripts, filename));
        }
        const original = 'HOST=127.0.0.1\nAPP_KEYS="existing-test-key-a,existing-test-key-b"\nADMIN_JWT_SECRET=existing-test-secret\nDATABASE_CLIENT=sqlite\nDATABASE_FILENAME=.tmp/data.db\n';
        await writeFile(path.join(directory, '.env'), original, { mode: 0o600 });
        const script = path.join(scripts, 'setup-docker-env.cjs');
        const options = { env: { ...process.env, PUBLIC_URL: '' }, stdio: 'pipe' };
        execFileSync(process.execPath, [script, '--public-url', 'https://cms.example.com'], options);
        const filename = path.join(directory, '.env.docker');
        const first = await readFile(filename, 'utf8');
        assert(first.includes('APP_KEYS="existing-test-key-a,existing-test-key-b"'));
        assert(first.includes('ADMIN_JWT_SECRET=existing-test-secret'));
        assert(first.includes('TRUST_PROXY=true'));
        assert(first.includes('DATABASE_FILENAME=.tmp/data.db'));
        assert.equal((await stat(filename)).mode & 0o777, 0o600);
        assert.equal(await readFile(path.join(directory, '.env'), 'utf8'), original);
        execFileSync(process.execPath, [script], options);
        assert.equal(await readFile(filename, 'utf8'), first);
        execFileSync(process.execPath, [script, '--public-url', 'https://cms-new.example.com'], options);
        const changed = first.replace('PUBLIC_URL=https://cms.example.com', 'PUBLIC_URL=https://cms-new.example.com');
        assert.equal(await readFile(filename, 'utf8'), changed);
        for (const invalid of ['http://cms.example.com', 'https://user:pass@cms.example.com', 'https://cms.example.com/admin', 'https://cms.example.com?token=test']) {
            const result = spawnSync(process.execPath, [script, '--public-url', invalid], options);
            assert.notEqual(result.status, 0);
            assert.equal(await readFile(filename, 'utf8'), changed);
        }
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});
