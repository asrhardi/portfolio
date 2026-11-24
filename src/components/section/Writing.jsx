import { useEffect, useState } from 'react';
import { fetchWritingArticle, fetchWritingIndex } from '../../lib/writing.js';
import { applyMetadata, writingMetadata } from '../../lib/seo.js';
import { WritingArticle, WritingIndex, WritingNotFound } from '../writing/WritingContent.jsx';

function embeddedWriting(slug) {
    if (import.meta.env.DEV) return null;
    try {
        const payload = JSON.parse(document.getElementById('writing-data')?.textContent || 'null');
        if (!slug && payload?.kind === 'index' && Array.isArray(payload.data)) return payload.data;
        if (slug && payload?.kind === 'article' && payload.data?.slug === slug) return payload.data;
    } catch { /* A stale build payload falls back to the public JSON endpoint. */ }
    return null;
}

export function Writing({ slug = null, notFound = false, onLink }) {
    const [state, setState] = useState(() => {
        if (notFound) return { status: 'not-found' };
        const data = embeddedWriting(slug);
        return data !== null ? { status: 'ready', data } : { status: 'loading' };
    });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (notFound || (attempt === 0 && embeddedWriting(slug) !== null)) return;
        const controller = new AbortController();
        const request = slug ? fetchWritingArticle(slug, { signal: controller.signal }) : fetchWritingIndex({ signal: controller.signal });
        request.then((data) => {
            if (!controller.signal.aborted) setState({ status: 'ready', data });
        }).catch((error) => {
            if (!controller.signal.aborted) setState({ status: error.kind === 'not-found' && slug ? 'not-found' : 'error' });
        });
        return () => controller.abort();
    }, [slug, notFound, attempt]);

    useEffect(() => {
        applyMetadata(writingMetadata(state.status === 'ready' && slug ? state.data : null, { notFound: state.status === 'not-found' }));
    }, [slug, state]);

    if (state.status === 'not-found') return <WritingNotFound onLink={onLink} />;
    if (state.status === 'ready') return slug
        ? <WritingArticle article={state.data} onLink={onLink} />
        : <WritingIndex posts={state.data} onLink={onLink} />;
    return (
        <section className="page-shell writing-page" aria-labelledby="writing-title" aria-busy={state.status === 'loading'}>
            <header className="section-header writing-header">
                <p className="label-text">Notes / personal writing</p>
                <h1 id="writing-title" className="page-title"><em>Writing.</em></h1>
            </header>
            {state.status === 'loading'
                ? <p className="writing-state" role="status">Loading {slug ? 'article' : 'writing'}…</p>
                : <div className="writing-state" role="alert">
                    <h2>Writing is temporarily unavailable.</h2>
                    <p>The published writing could not be loaded. Please try again.</p>
                    <button className="text-button" onClick={() => { setState({ status: 'loading' }); setAttempt((value) => value + 1); }}>Try loading again</button>
                </div>}
        </section>
    );
}
