const skills = [
    { label: "Languages", items: ["Go", "JavaScript", "TypeScript", "Python"] },
    { label: "Backend", items: ["Node.js", "Express", "PostgreSQL", "Docker"] },
    { label: "Web3", items: ["EVM", "Solana", "ethers.js"] },
    { label: "Tooling", items: ["Codex", "Claude Code", "Git", "REST API"] },
];

export const About = () => (
    <section className="page-shell about-page" aria-labelledby="about-title">
        <header className="section-header">
            <p className="label-text">Manifesto / philosophy</p>
            <h1 id="about-title" className="page-title">Architecture<br />with <em>intent.</em></h1>
        </header>
        <div className="about-layout">
            <div className="about-prose">
                <h2>The archival mindset</h2>
                <p>I build backend systems the way an archivist keeps records: deliberate, traceable, and built to last.</p>
                <p>Most of my work lives on-chain: automation agents, batch-transfer tooling, and security research where a single wrong assumption can cost real funds.</p>
                <p>I&apos;d rather ship something that still holds up when you re-read the code a year later than something that merely works today.</p>
                <a className="text-button" href="#projects">See this approach in the work</a>
            </div>
            <div className="skills-index">
                <h2 className="label-text">Tools of the trade</h2>
                <dl>
                    {skills.map((group) => (
                        <div className="skill-row" key={group.label}>
                            <dt>{group.label}</dt>
                            <dd>{group.items.join(" · ")}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    </section>
);
