export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function articlePath(slug) {
    return `/writing/${encodeURIComponent(slug)}`;
}

export function safeUrl(value, { image = false } = {}) {
    if (typeof value !== 'string' || !value.trim() || value.includes('\\') || [...value].some((character) => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127)) return null;
    if (value.startsWith('/') && !value.startsWith('//')) return value;
    if (!image && value.startsWith('#')) return value;
    try {
        const url = new URL(value);
        return ['http:', 'https:', ...(!image ? ['mailto:'] : [])].includes(url.protocol) ? value : null;
    } catch {
        return null;
    }
}

export function formatDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(date);
}

async function fetchJson(url, signal) {
    const timeout = AbortSignal.timeout(15000);
    const response = await fetch(url, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
    if (!response.ok) {
        const error = new Error(`Writing request failed (${response.status}).`);
        error.kind = response.status === 404 ? 'not-found' : 'unavailable';
        throw error;
    }
    if (!response.headers.get('content-type')?.includes('application/json')) {
        const error = new Error('Writing data was not found.');
        error.kind = 'not-found';
        throw error;
    }
    return response.json();
}

function devMedia(article) {
    const normalize = (value) => {
        if (typeof value !== 'string') return value;
        if (value.startsWith('/uploads/')) return `/cms${value}`;
        try {
            const url = new URL(value);
            if (['127.0.0.1', 'localhost'].includes(url.hostname) && url.pathname.startsWith('/uploads/')) {
                return `/cms${url.pathname}`;
            }
        } catch { /* Relative links use the normal renderer. */ }
        return value;
    };
    return {
        ...article,
        cover: article.cover ? { ...article.cover, url: normalize(article.cover.url) } : null,
        body: article.body?.map((block) => block.type === 'image'
            ? { ...block, image: { ...block.image, url: normalize(block.image.url) } }
            : block),
    };
}

export async function fetchWritingIndex({ apiUrl, signal } = {}) {
    const endpoint = apiUrl ?? (import.meta.env?.DEV ? '/cms/api/writing' : null);
    if (!endpoint) {
        const result = await fetchJson('/writing/index.json', signal);
        if (!Array.isArray(result.data)) throw new Error('Invalid writing index.');
        return result.data;
    }
    const posts = [];
    let page = 1;
    let pageCount;
    do {
        const result = await fetchJson(`${endpoint}?page=${page}`, signal);
        if (!Array.isArray(result.data)) throw new Error('Invalid writing index.');
        pageCount = result.meta?.pagination?.pageCount;
        if (!Number.isInteger(pageCount) || pageCount < 0 || pageCount > 500) throw new Error('Invalid writing pagination.');
        posts.push(...result.data);
        page += 1;
    } while (page <= pageCount);
    return posts;
}

export async function fetchWritingArticle(slug, { apiUrl, signal } = {}) {
    if (!SLUG_PATTERN.test(slug) || slug.length > 120) {
        const error = new Error('Article not found.');
        error.kind = 'not-found';
        throw error;
    }
    const endpoint = apiUrl ?? (import.meta.env?.DEV ? '/cms/api/writing' : null);
    const result = await fetchJson(endpoint
        ? `${endpoint}/${encodeURIComponent(slug)}`
        : `/writing/data/${encodeURIComponent(slug)}.json`, signal);
    if (!result.data || result.data.slug !== slug || !Array.isArray(result.data.body)) {
        throw new Error('Invalid article.');
    }
    return import.meta.env?.DEV ? devMedia(result.data) : result.data;
}
