const projects = [
    {
        title: "Polymarket Agent",
        type: "Personal Project · 2026",
        description: "Automated agent for Polymarket prediction markets — Go backend with a clean cmd/internal architecture and Docker deployment.",
        tag: "DeFi Automation",
        tech: ["Go", "Docker"],
        href: "https://github.com/asrhardi/polymarket-agent",
        accent: true,
    },
    {
        title: "CUDA Mnemonic Solver",
        type: "Security Research · 2026",
        description: "GPU-accelerated Solana mnemonic recovery — CUDA C++ kernels driven by Python for parallel key-space search (educational).",
        tag: "Web3 Security",
        tech: ["Python", "CUDA", "Solana"],
        href: "https://github.com/asrhardi/Brute-force-CUDA-Solver",
        accent: false,
    },
    {
        title: "ERC-20 Batch Transfer",
        type: "Personal Project · 2025",
        description: "Batch transfers of ERC-20 tokens on Tea Sepolia — Node.js automation for many-recipient payouts.",
        tag: "Backend Engineering",
        tech: ["Node.js"],
        href: "https://github.com/asrhardi/Tea-batch-transfer",
        accent: false,
    },
];

const features = [
    { label: "On-Chain Automation", desc: "Trading agents, batch transfers, and bots that sign and send transactions." },
    { label: "Security & Recovery", desc: "GPU key-space search, wallet mnemonic recovery, and web3 bug hunting."      },
    { label: "Backend Engineering", desc: "Go & Node.js services with clean architecture and Docker deploys."          },
];

export const Project = () => {
    return (
        <section className="my-auto w-full flex flex-col justify-center px-6 md:px-24 lg:px-40 xl:px-64 2xl:px-80 py-12 md:py-10">
            {/* Header */}
            <div className="flex items-end justify-between mb-6">
                <div>
                    <span className="label-text text-[var(--accent-2)] block mb-2">PORTFOLIO / WORK</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-[var(--heading)] tracking-tight">The Archive</h2>
                </div>
                <span className="label-text text-[var(--muted)] hidden md:block">SELECTED PROJECTS</span>
            </div>

            {/* Project cards — 3-up on desktop, aligns with the feature row below */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {projects.map((project, i) => (
                    <div key={i} className="border border-[var(--line)] hover:border-[var(--accent-border-2)] transition-colors duration-200 bg-[var(--surface)] flex flex-col">
                        {/* Image strip — dark "framed print" thumbnail in both themes */}
                        <div className={`relative h-36 overflow-hidden ${
                            project.accent
                                ? "bg-linear-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]"
                                : "bg-linear-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#2a2a2a]"
                        }`}>
                            <div className="absolute inset-0 flex items-center justify-center opacity-15">
                                <div className={`w-32 h-32 rounded-full border ${project.accent ? "border-[#4d8eff]" : "border-white"}`} />
                            </div>
                            <span className="absolute bottom-3 left-4 label-text text-white/50 border border-white/20 px-2 py-0.5">
                                {project.tag}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col gap-2 flex-1">
                            <span className="label-text text-[var(--muted)]">{project.type}</span>
                            <h3 className="text-base font-bold text-[var(--heading)] leading-snug">{project.title}</h3>
                            <p className="text-[var(--muted)] text-sm leading-relaxed flex-1">{project.description}</p>
                            <div className="flex items-center justify-between mt-1">
                                <div className="flex flex-wrap gap-1.5">
                                    {project.tech.map((t, k) => (
                                        <span key={k} className="bg-[var(--accent-soft-bg)] text-[var(--chip-text)] py-0.5 px-2 text-xs border border-[var(--accent-border)]">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <a href={project.href} target="_blank" rel="noreferrer"
                                    className="label-text text-[var(--accent-2)] hover:text-[var(--heading)] transition-colors shrink-0 ml-3">
                                    VIEW →
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Feature highlights row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {features.map((f, i) => (
                    <div key={i} className="border border-[var(--line)] p-4 bg-[var(--surface)]">
                        <h4 className="text-[var(--heading)] text-sm font-semibold mb-1">{f.label}</h4>
                        <p className="text-[var(--muted)] text-xs leading-relaxed">{f.desc}</p>
                        <span className="text-[var(--accent)] text-base mt-2 block">→</span>
                    </div>
                ))}
            </div>
        </section>
    );
};
