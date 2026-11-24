import assert from 'node:assert/strict';
import test from 'node:test';
import { readRoute } from '../src/lib/navigation.js';
import { safeUrl, formatDate, fetchWritingArticle } from '../src/lib/writing.js';

test('existing hash bookmarks and article paths remain distinct', () => {
    assert.deepEqual(readRoute({ pathname: '/', hash: '#projects' }), { id: 'projects' });
    assert.deepEqual(readRoute({ pathname: '/', hash: '#contact' }), { id: 'contact' });
    assert.deepEqual(readRoute({ pathname: '/writing', hash: '' }), { id: 'writing', slug: null });
    assert.deepEqual(readRoute({ pathname: '/writing/a-personal-note', hash: '' }), { id: 'writing', slug: 'a-personal-note', notFound: false });
    assert.equal(readRoute({ pathname: '/writing/%2e%2e', hash: '' }).notFound, true);
    assert.equal(readRoute({ pathname: '/writing/%', hash: '' }).notFound, true);
    assert.equal(readRoute({ pathname: '/missing', hash: '' }).notFound, true);
});

test('rich text links reject executable and protocol-relative URLs', () => {
    for (const value of ['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', '//evil.example/', 'java\nscript:alert(1)', '/\\evil.example/', '\tjavascript:alert(1)']) {
        assert.equal(safeUrl(value), null, value);
    }
    assert.equal(safeUrl('https://example.com/a?q=1'), 'https://example.com/a?q=1');
    assert.equal(safeUrl('/writing/a-note'), '/writing/a-note');
    assert.equal(safeUrl('mailto:hello@asrhardi.xyz'), 'mailto:hello@asrhardi.xyz');
    assert.equal(safeUrl('mailto:hello@asrhardi.xyz', { image: true }), null);
});

test('dates render consistently across build and browser time zones', () => {
    assert.equal(formatDate('2026-11-24'), '24 November 2026');
    assert.equal(formatDate('not-a-date'), null);
});

test('a static host HTML fallback is treated as a missing article', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => new Response('<!doctype html><html></html>', {
        headers: { 'Content-Type': 'text/html' },
    }));
    await assert.rejects(fetchWritingArticle('missing-article'), { kind: 'not-found' });
});
