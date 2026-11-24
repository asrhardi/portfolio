import { articlePath, formatDate, safeUrl } from '../../lib/writing.js';

function ArticleImage({ image }) {
    const src = safeUrl(image?.url, { image: true });
    if (!src) return null;
    return (
        <figure className="article-image">
            <img src={src} alt={image.alternativeText || ''} width={image.width || undefined} height={image.height || undefined} loading="lazy" />
            {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
    );
}

function plainText(node) {
    if (typeof node?.text === 'string') return node.text;
    return Array.isArray(node?.children) ? node.children.map(plainText).join('') : '';
}

function RichBlock({ node }) {
    if (!node || typeof node !== 'object') return null;
    if (node.type === 'text') {
        let text = typeof node.text === 'string' ? node.text : '';
        if (node.bold) text = <strong>{text}</strong>;
        if (node.italic) text = <em>{text}</em>;
        if (node.underline) text = <u>{text}</u>;
        if (node.strikethrough) text = <s>{text}</s>;
        if (node.code) text = <code>{text}</code>;
        return text;
    }
    const children = Array.isArray(node.children)
        ? node.children.map((child, index) => <RichBlock key={index} node={child} />)
        : null;
    switch (node.type) {
        case 'paragraph': return <p>{children}</p>;
        case 'heading': {
            const level = Number.isInteger(node.level) ? Math.min(6, Math.max(2, node.level)) : 2;
            const Heading = `h${level}`;
            return <Heading>{children}</Heading>;
        }
        case 'link': {
            const href = safeUrl(node.url);
            return href ? <a href={href}>{children}</a> : <span>{children}</span>;
        }
        case 'list': return node.format === 'ordered' ? <ol>{children}</ol> : <ul>{children}</ul>;
        case 'list-item': return <li>{children}</li>;
        case 'quote': return <blockquote>{children}</blockquote>;
        case 'code': return <pre><code>{plainText(node)}</code></pre>;
        case 'image': return <ArticleImage image={node.image} />;
        default: return null;
    }
}

export function WritingIndex({ posts, onLink }) {
    return (
        <section className="page-shell writing-page" aria-labelledby="writing-title">
            <header className="section-header writing-header">
                <p className="label-text">Notes / personal writing</p>
                <h1 id="writing-title" className="page-title"><em>Writing.</em></h1>
                <p className="section-description">A place for longer thoughts.</p>
            </header>
            {posts.length ? (
                <ol className="writing-list">
                    {posts.map((post) => {
                        const date = post.date || post.publishedAt;
                        return (
                            <li key={post.slug}>
                                <article className="writing-entry">
                                    <time className="label-text" dateTime={date}>{formatDate(date)}</time>
                                    <div>
                                        <h2><a href={articlePath(post.slug)} onClick={onLink}>{post.title}</a></h2>
                                        <p>{post.excerpt}</p>
                                    </div>
                                </article>
                            </li>
                        );
                    })}
                </ol>
            ) : (
                <div className="writing-state" role="status">
                    <h2>No writing published yet.</h2>
                    <p>New posts will appear here once they are published.</p>
                    <a className="text-button" href="/#home" onClick={onLink}>Back to home</a>
                </div>
            )}
        </section>
    );
}

export function WritingArticle({ article, onLink }) {
    const date = article.date || article.publishedAt;
    return (
        <article className="page-shell writing-article" aria-labelledby="article-title">
            <a className="text-button article-back" href="/writing" onClick={onLink}>All writing</a>
            <header className="article-header">
                <p className="label-text">AsrHardi / <time dateTime={date}>{formatDate(date)}</time></p>
                <h1 id="article-title">{article.title}</h1>
                <p className="article-excerpt">{article.excerpt}</p>
            </header>
            {article.cover && <ArticleImage image={article.cover} />}
            <div className="article-body">{article.body.map((node, index) => <RichBlock node={node} key={index} />)}</div>
            <footer className="article-footer">
                <span className="label-text">Written by AsrHardi</span>
                <a className="text-button" href="/writing" onClick={onLink}>Back to all writing</a>
            </footer>
        </article>
    );
}

export function WritingNotFound({ onLink }) {
    return (
        <section className="page-shell writing-page" aria-labelledby="missing-title">
            <p className="label-text">404 / page not found</p>
            <h1 id="missing-title" className="page-title">This page<br />isn't here.</h1>
            <p className="section-description">The link may have changed, or this writing is no longer published.</p>
            <a className="text-button" href="/writing" onClick={onLink}>Browse published writing</a>
        </section>
    );
}
