export const PAGES = [
    { id: 'home', label: 'Home', href: '/#home' },
    { id: 'projects', label: 'The Archive', href: '/#projects' },
    { id: 'writing', label: 'Writing', href: '/writing' },
    { id: 'about', label: 'Manifesto', href: '/#about' },
    { id: 'contact', label: 'Connect', href: '/#contact' },
];

export function readRoute({ pathname, hash }) {
    if (/^\/writing\/?$/.test(pathname)) return { id: 'writing', slug: null };
    const article = pathname.match(/^\/writing\/([^/]+)\/?$/);
    if (article) {
        try {
            const slug = decodeURIComponent(article[1]);
            return { id: 'writing', slug, notFound: !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120 };
        } catch {
            return { id: 'writing', slug: null, notFound: true };
        }
    }
    if (pathname !== '/') return { id: 'not-found', notFound: true };
    const id = hash.slice(1);
    return { id: PAGES.some((page) => page.id === id) ? id : 'home' };
}

export function isPlainClick(event) {
    return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}
