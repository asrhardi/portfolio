const skills = [
    { label: "Languages", items: ["Go", "JavaScript", "TypeScript", "Python"] },
    { label: "Backend",   items: ["Node.js", "Express", "PostgreSQL", "Docker"] },
    { label: "Web3",      items: ["EVM", "Solana", "ethers.js"] },
    { label: "Tooling",   items: ["Codex","Claude Code","Git", "REST API"] },
];

export const About = () => {
    return (
        <section className="my-auto w-full flex flex-col justify-center px-6 md:px-24 lg:px-40 xl:px-64 2xl:px-80 py-12 md:py-10">
            {/* Label */}
            <span className="label-text text-[var(--accent-2)] block mb-5">MANIFESTO / PHILOSOPHY</span>

            {/* Large quote */}
            <blockquote className="text-2xl md:text-4xl font-bold text-[var(--heading)] leading-tight tracking-tight mb-8 max-w-3xl">
                "Building isn't just about code—it's about the{" "}
                <span className="text-[var(--accent)]">architecture of intent.</span>"
            </blockquote>

            {/* 2-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills 2×2 */}
                <div className="grid grid-cols-2 gap-3">
                    {skills.map((group, i) => (
                        <div key={i} className="border border-[var(--line)] p-4 bg-[var(--surface)]">
                            <span className="label-text text-[var(--muted)] block mb-2">{`0${i + 1}.`}</span>
                            <h3 className="text-[var(--heading)] text-sm font-semibold mb-3">{group.label}</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {group.items.map((item, k) => (
                                    <span key={k} className="bg-[var(--accent-soft-bg)] text-[var(--chip-text)] py-0.5 px-2 text-xs border border-[var(--accent-border)]">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bio — vertically centered against the skills grid */}
                <div className="flex flex-col justify-center">
                    <h2 className="text-xl font-bold text-[var(--heading)] mb-2">The Archival Mindset</h2>
                    <p className="text-[var(--body)] text-sm leading-relaxed">
                        I build backend systems the way an archivist keeps records — deliberate,
                        traceable, and built to last. Most of my work lives on-chain: automation
                        agents, batch-transfer tooling, and security research where a single wrong
                        assumption can cost real funds. I'd rather ship something that still holds up
                        when you re-read the code a year later than something that merely works today.
                    </p>
                </div>
            </div>
        </section>
    );
};
