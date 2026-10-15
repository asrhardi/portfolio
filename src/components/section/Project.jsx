import { projects, securityContributions } from "../../data/projects.js";

const ArchiveEntry = ({ entry, index }) => (
    <li className="project-entry">
        <span className="project-number" aria-hidden="true">0{index + 1}</span>
        <article>
            <div className="project-meta"><span>{entry.tag}</span><span>{entry.type} / {entry.year}</span></div>
            <h3><a href={entry.href} target="_blank" rel="noreferrer">{entry.title}<span className="sr-only"> (opens in a new tab)</span><span aria-hidden="true">↗</span></a></h3>
            <p>{entry.description}</p>
            {entry.credit && (
                <dl className="contribution-details">
                    {/* <div><dt>Verdict</dt><dd>{entry.status}</dd></div> */}
                    <div><dt>Credited as</dt><dd>{entry.credit}</dd></div>
                    <div><dt>Release</dt><dd>{entry.version}</dd></div>
                </dl>
            )}
            {entry.tech && (
                <ul className="tech-list" aria-label={`${entry.title} technologies`}>
                    {entry.tech.map((technology) => <li key={technology}>{technology}</li>)}
                </ul>
            )}
        </article>
    </li>
);

export const Project = () => (
    <section className="page-shell archive-page" aria-labelledby="archive-title">
        <header className="section-header">
            <p className="label-text">Selected work / 2025–2026</p>
            <h1 id="archive-title" className="page-title">The <em>Archive.</em></h1>
            <p className="section-description">Publicly credited security research, automation tools, and backend experiments, with links to the original work.</p>
        </header>

        <section className="archive-group" aria-labelledby="security-contributions-title">
            <h2 className="archive-group-title" id="security-contributions-title">Security contributions</h2>
            <ol className="project-list">
                {securityContributions.map((entry, index) => <ArchiveEntry key={entry.href} entry={entry} index={index} />)}
            </ol>
        </section>

        <section className="archive-group" aria-labelledby="projects-title">
            <h2 className="archive-group-title" id="projects-title">Projects & experiments</h2>
            <ol className="project-list">
                {projects.map((entry, index) => <ArchiveEntry key={entry.href} entry={entry} index={index} />)}
            </ol>
        </section>
        <p className="archive-footnote">Contribution links point to public release credits; project links point to source repositories.</p>
    </section>
);
