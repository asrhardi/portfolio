import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer, loadEnv } from 'vite';
import { articlePath, fetchWritingArticle, fetchWritingIndex, SLUG_PATTERN, safeUrl } from '../src/lib/writing.js';
import { SITE_URL, writingMetadata } from '../src/lib/seo.js';

const root = process.cwd();
const output = path.join(root, 'dist');
const env = { ...loadEnv(process.env.NODE_ENV || 'production', root, ''), ...process.env };
const cmsUrl = env.CMS_URL?.trim().replace(/\/$/, '');
const publicCmsUrl = env.CMS_PUBLIC_URL?.trim() || cmsUrl;
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

if (cmsUrl && !['http:', 'https:'].includes(new URL(cmsUrl).protocol)) throw new Error('CMS_URL must use HTTP or HTTPS.');

const posts = cmsUrl ? await fetchWritingIndex({ apiUrl: `${cmsUrl}/api/writing` }) : [];
if (!cmsUrl) console.info('CMS_URL is not configured. Building an empty Writing index.');
const slugs = new Set();
for (const post of posts) {
    if (typeof post.slug !== 'string' || !SLUG_PATTERN.test(post.slug) || post.slug.length > 120 || slugs.has(post.slug)) {
        throw new Error('The CMS returned an invalid or duplicate article slug.');
    }
    slugs.add(post.slug);
}

const template = await readFile(path.join(output, 'index.html'), 'utf8');
const mediaCache = new Map();
const mimeExtensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };

async function copyMedia(value) {
    if (!value) return null;
    const absolute = new URL(value, publicCmsUrl);
    const trustedOrigins = new Set([new URL(cmsUrl).origin, new URL(publicCmsUrl).origin]);
    if (!trustedOrigins.has(absolute.origin) || !absolute.pathname.startsWith('/uploads/')) return safeUrl(absolute.href, { image: true });
    if (mediaCache.has(absolute.pathname)) return mediaCache.get(absolute.pathname);
    const source = new URL(absolute.pathname, cmsUrl);
    const response = await fetch(source, { signal: AbortSignal.timeout(30000), redirect: 'error' });
    if (!response.ok) throw new Error(`Could not copy a published image (${response.status}).`);
    const mime = response.headers.get('content-type')?.split(';')[0];
    const extension = mimeExtensions[mime];
    if (!extension) throw new Error('Published images must be JPG, PNG, WebP, GIF, or AVIF.');
    if (Number(response.headers.get('content-length')) > 10 * 1024 * 1024) throw new Error('Published image exceeds 10 MB.');
    const chunks = [];
    let size = 0;
    for await (const chunk of response.body) {
        size += chunk.length;
        if (size > 10 * 1024 * 1024) throw new Error('Published image exceeds 10 MB.');
        chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks);
    const filename = `${createHash('sha256').update(bytes).digest('hex').slice(0, 24)}.${extension}`;
    await mkdir(path.join(output, 'writing', 'media'), { recursive: true });
    await writeFile(path.join(output, 'writing', 'media', filename), bytes);
    const target = `/writing/media/${filename}`;
    mediaCache.set(absolute.pathname, target);
    return target;
}

async function copyArticleMedia(article) {
    const result = structuredClone(article);
    if (result.cover) result.cover.url = await copyMedia(result.cover.url);
    for (const block of result.body) {
        if (block.type === 'image' && block.image) block.image.url = await copyMedia(block.image.url);
    }
    return result;
}

function pageHtml(content, metadata, payload) {
    let html = template
        .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeHtml(metadata.title)}</title>`)
        .replace(/<meta name="description"[^>]*>/, '')
        .replace(/<link rel="canonical"[^>]*>/, '')
        .replace(/<meta property="og:[^"]*"[^>]*>/g, '')
        .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
    const tags = [
        `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
        `<link rel="canonical" href="${escapeHtml(metadata.canonical)}" />`,
        ...Object.entries({ title: metadata.title, description: metadata.description, url: metadata.canonical, type: metadata.type || 'website', image: metadata.image })
            .filter(([, value]) => value).map(([name, value]) => `<meta property="og:${name}" content="${escapeHtml(value)}" />`),
        ...(metadata.noindex ? ['<meta name="robots" content="noindex, follow" />'] : []),
        ...(metadata.schema ? [`<script type="application/ld+json">${json(metadata.schema)}</script>`] : []),
        ...(payload ? [`<script id="writing-data" type="application/json">${json(payload)}</script>`] : []),
    ].join('\n');
    const footer = '<footer class="bottom-bar paper-surface"><a class="brand-link" href="/#home">Ace ft Nemo</a><nav class="desktop-nav" aria-label="Main navigation"><a href="/#home">Home</a><a href="/writing">Writing</a></nav></footer>';
    html = html.replace('</head>', () => `${tags}\n</head>`);
    return html.replace('<div id="root"></div>', () => `<div id="root"><main id="main-content" class="content-viewport paper-surface" aria-label="Writing"><div class="page-content">${content}</div></main>${footer}</div>`);
}

const renderer = await createServer({ configFile: path.join(root, 'vite.config.js'), optimizeDeps: { entries: [], noDiscovery: true }, server: { middlewareMode: true }, appType: 'custom' });
try {
    const { WritingIndex, WritingArticle, WritingNotFound } = await renderer.ssrLoadModule('/src/components/writing/WritingContent.jsx');
    const writePage = async (directory, element, metadata, payload) => {
        await mkdir(path.join(output, directory), { recursive: true });
        await writeFile(path.join(output, directory, 'index.html'), pageHtml(renderToStaticMarkup(createElement(element.component, element.props)), metadata, payload));
    };
    await writePage('writing', { component: WritingIndex, props: { posts } }, writingMetadata(), { kind: 'index', data: posts });
    await writeFile(path.join(output, 'writing', 'index.json'), json({ data: posts }));
    const articleDirectory = path.join(output, 'writing', 'data');
    await mkdir(articleDirectory, { recursive: true });
    for (const post of posts) {
        const article = await copyArticleMedia(await fetchWritingArticle(post.slug, { apiUrl: `${cmsUrl}/api/writing` }));
        await writePage(`writing/${post.slug}`, { component: WritingArticle, props: { article } }, writingMetadata(article), { kind: 'article', data: article });
        await writeFile(path.join(articleDirectory, `${post.slug}.json`), json({ data: article }));
    }
    await writeFile(path.join(output, '404.html'), pageHtml(renderToStaticMarkup(createElement(WritingNotFound)), writingMetadata(null, { notFound: true })));
    const urls = [`${SITE_URL}/`, `${SITE_URL}/writing`, ...posts.map((post) => `${SITE_URL}${articlePath(post.slug)}`)];
    await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
    console.info(`Writing build complete: ${posts.length} published article(s), ${mediaCache.size} local image(s).`);
} finally {
    await renderer.close();
}
