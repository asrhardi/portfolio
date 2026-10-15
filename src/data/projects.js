export const securityContributions = [
    {
        title: "ATB Wallet for DigiByte",
        type: "Security contribution",
        year: "2026",
        version: "v4.1.0",
        // status: "Accepted",
        credit: "AsrHardi",
        description: "Reported a recovery-address validation issue so recovered funds can only be sent to addresses derived from the recovered phrase. The report was accepted and publicly credited in the v4.1.0 security release.",
        summary: "Security report on recovery-address validation. Publicly credited as AsrHardi.",
        tag: "Wallet security",
        href: "https://github.com/JohnnyLawDGB/aroundtheblock-wallet-releases/releases/tag/v4.1.0",
    },
];

export const projects = [
    {
        title: "Polymarket Agent",
        type: "Personal project",
        year: "2026",
        description: "An automated agent for Polymarket prediction markets, built with a Go backend, a cmd/internal architecture, and Docker deployment.",
        tag: "DeFi automation",
        tech: ["Go", "Docker"],
        href: "https://github.com/asrhardi/polymarket-agent",
    },
    {
        title: "CUDA Mnemonic Solver",
        type: "Security research",
        year: "2026",
        description: "Educational research into Solana mnemonic recovery, using CUDA C++ kernels and Python to search the key space in parallel.",
        tag: "Web3 security",
        tech: ["Python", "CUDA", "Solana"],
        href: "https://github.com/asrhardi/Brute-force-CUDA-Solver",
    },
    {
        title: "ERC-20 Batch Transfer",
        type: "Personal project",
        year: "2025",
        description: "Node.js tooling for sending ERC-20 tokens to multiple recipients on the Tea Sepolia test network.",
        tag: "Backend engineering",
        tech: ["Node.js"],
        href: "https://github.com/asrhardi/Tea-batch-transfer",
    },
];
