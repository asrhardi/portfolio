import { articlePath } from './writing.js';

export const SITE_URL = 'https://www.asrhardi.xyz';
export const HOME_TITLE = 'AsrHardi | Backend Developer & Web3 Security Research';
export const HOME_DESCRIPTION = 'AsrHardi, also known as Ace ft Nemo, builds backend services and on-chain automation tools, with independent research in wallet recovery and web3 security.';
const WRITING_DESCRIPTION = 'Writing by AsrHardi, also known as Ace ft Nemo. A place for longer thoughts.';
const PERSON = {
    '@type': 'Person', '@id': `${SITE_URL}/#person`, name: 'AsrHardi',
    alternateName: 'Ace ft Nemo', url: `${SITE_URL}/`,
    sameAs: ['https://github.com/asrhardi', 'https://x.com/0xirishdara404'],
};

export function portfolioMetadata(page) {
    return {
        title: page.id === 'home' ? HOME_TITLE : `${page.label} | AsrHardi (Ace ft Nemo)`,
        description: HOME_DESCRIPTION,
        canonical: `${SITE_URL}/`,
        image: `${SITE_URL}/profile.jpg`,
        schema: { '@context': 'https://schema.org', '@type': 'ProfilePage', url: `${SITE_URL}/`, mainEntity: PERSON },
    };
}

export function writingMetadata(article = null, { notFound = false } = {}) {
    const canonical = `${SITE_URL}${article ? articlePath(article.slug) : '/writing'}`;
    if (notFound) return { title: 'Page not found | AsrHardi', description: 'The requested page could not be found.', canonical, noindex: true };
    if (!article) return {
        title: 'Writing | AsrHardi', description: WRITING_DESCRIPTION, canonical,
        schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Writing by AsrHardi', url: canonical, author: PERSON },
    };
    const image = article.cover?.url ? new URL(article.cover.url, `${SITE_URL}/`).href : undefined;
    return {
        title: `${article.seoTitle || article.title} | AsrHardi`,
        description: article.seoDescription || article.excerpt,
        canonical, image, type: 'article',
        schema: {
            '@context': 'https://schema.org', '@type': 'BlogPosting',
            headline: article.title, description: article.excerpt,
            url: canonical, mainEntityOfPage: canonical, author: PERSON,
            datePublished: article.date || article.publishedAt,
            dateModified: article.updatedAt,
            ...(image ? { image } : {}),
        },
    };
}

export function applyMetadata(metadata) {
    document.title = metadata.title;
    const setMeta = (attribute, name, content) => {
        let tag = document.head.querySelector(`meta[${attribute}="${name}"]`);
        if (!content) { tag?.remove(); return; }
        if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attribute, name); document.head.append(tag); }
        tag.content = content;
    };
    setMeta('name', 'description', metadata.description);
    setMeta('name', 'robots', metadata.noindex ? 'noindex, follow' : null);
    for (const [name, value] of Object.entries({
        title: metadata.title, description: metadata.description, url: metadata.canonical,
        type: metadata.type || 'website', image: metadata.image,
        'image:alt': metadata.image ? 'Article cover or AsrHardi profile image' : null,
    })) setMeta('property', `og:${name}`, value);
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = metadata.canonical;
    let schema = document.head.querySelector('script[type="application/ld+json"]');
    if (metadata.schema) {
        if (!schema) { schema = document.createElement('script'); schema.type = 'application/ld+json'; document.head.append(schema); }
        schema.textContent = JSON.stringify(metadata.schema);
    } else schema?.remove();
}
