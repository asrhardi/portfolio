import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('article rendering escapes text and refuses executable links or images', async () => {
    const server = await createServer({ optimizeDeps: { entries: [], noDiscovery: true }, server: { middlewareMode: true }, appType: 'custom' });
    try {
        const { WritingArticle } = await server.ssrLoadModule('/src/components/writing/WritingContent.jsx');
        const html = renderToStaticMarkup(createElement(WritingArticle, { article: {
            title: '<script>alert(1)</script>', slug: 'test', excerpt: 'Renderer integration fixture.',
            publishedAt: '2026-11-24T00:00:00.000Z',
            body: [
                { type: 'paragraph', children: [{ type: 'link', url: 'javascript:alert(1)', children: [{ type: 'text', text: 'unsafe' }] }] },
                { type: 'code', children: [{ type: 'text', text: '<img src=x onerror=alert(1)>' }] },
                { type: 'image', image: { url: 'data:image/svg+xml,<svg onload=alert(1) />' } },
            ],
        } }));
        assert(!html.includes('<script>'));
        assert(!html.includes('href="javascript:'));
        assert(!html.includes('src="data:'));
        assert(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
        assert(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
    } finally {
        await server.close();
    }
});
