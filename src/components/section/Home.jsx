import { FiArrowRight } from "react-icons/fi";

export const Home = ({ onNavigate }) => {
    return (
        <section className="my-auto w-full flex flex-col justify-center px-6 md:px-24 lg:px-40 xl:px-64 2xl:px-80 py-12 md:py-4 relative overflow-hidden">
            {/* Left-edge vertical accent */}
            <div className="absolute left-0 top-1/4 w-0.5 h-40 bg-linear-to-b from-transparent via-[var(--line-2)] to-transparent hidden md:block" />

            {/* Hero intro — mirrors the 8/4 grid used by the cards below */}
            <div className="grid grid-cols-12 gap-4 items-center mb-8 md:mb-4">
                <div className="col-span-12 md:col-span-8 flex flex-col">
                    {/* Label + availability */}
                    <div className="flex items-center gap-3 mb-4 md:mb-2">
                        <span className="label-text text-[var(--accent-2)] tracking-[4px]">WEB DEVELOPER</span>
                        <span className="h-px w-8 bg-[var(--line-2)] hidden sm:block" />
                        <span className="label-text text-[var(--muted)] hidden sm:flex items-center gap-2">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75 animate-ping" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                            </span>
                            Available
                        </span>
                    </div>

                    {/* Hero heading */}
                    <div className="mb-6 md:mb-3">
                        <h1 className="font-bold leading-none tracking-[-3px] text-[clamp(44px,8vw,80px)] text-[var(--heading)]">
                            ACE ft
                        </h1>
                        <h1 className="font-bold leading-none tracking-[-3px] text-[clamp(44px,8vw,80px)] text-[var(--accent)]">
                            NEMO
                        </h1>
                    </div>

                    <p className="text-[var(--body)] text-lg leading-relaxed">
                        Backend-focused web developer with 2+ years of experience building scalable apps and clean architecture. Lately, I’ve been diving deep into DeFi automation, web3 security research, and hunting bugs. Always ensuring robust server-side performance while delivering a smooth user experience!
                    </p>

                    {/* Right edge matches the wide art panel below */}
                    <button
                        onClick={() => onNavigate("contact")}
                        className="group inline-flex items-center gap-2 self-start md:self-end mt-6 md:mt-3 shrink-0 bg-[var(--accent)] text-[var(--on-accent)] font-semibold px-6 py-3 hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        Hire Me
                        <FiArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </button>
                </div>

                {/* Profile — centered directly above the focus-card column */}
                <div className="col-span-12 md:col-span-4 flex items-center justify-center py-2 md:py-0">
                    <img
                        src="/profile.jpg"
                        alt="Profile avatar of a black cat wearing sunglasses"
                        className="w-48 h-48 md:w-[120%] md:h-auto md:aspect-square max-w-80 rounded-full object-cover border-2 border-[var(--accent)]"
                    />
                </div>
            </div>

            {/* Bento preview grid */}
            <div className="grid grid-cols-12 gap-4 md:h-56">
                {/* Large visual — self-contained CSS art. Stays a dark framed print in both themes. */}
                <div className="group col-span-12 md:col-span-8 h-44 md:h-auto relative overflow-hidden bg-linear-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
                    {/* Fine grid overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.15]"
                        style={{
                            backgroundImage:
                                "linear-gradient(#4d8eff 1px, transparent 1px), linear-gradient(90deg, #4d8eff 1px, transparent 1px)",
                            backgroundSize: "32px 32px",
                        }}
                    />
                    {/* Concentric circle motif (echoes the Archive cards) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-25">
                        <div className="w-44 h-44 rounded-full border border-[#4d8eff] transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute w-28 h-28 rounded-full border border-white/40 transition-transform duration-700 group-hover:scale-90" />
                    </div>
                    {/* Captions */}
                    <span className="absolute top-3 right-4 label-text text-white/40">∞</span>
                    <span className="absolute bottom-3 left-4 label-text text-white/50 border border-white/20 px-2 py-0.5">
                        NOW · WEB3 SECURITY
                    </span>
                </div>

                {/* Stack cards — side-by-side on mobile, stacked on desktop */}
                <div className="col-span-12 md:col-span-4 grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-4">
                    <div className="bg-[var(--accent)] flex flex-col justify-between p-5 md:p-6 h-28 md:h-auto transition-transform duration-300 hover:-translate-y-1">
                        <span className="label-text text-[var(--on-accent)]">FOCUS.01</span>
                        <h3 className="text-[var(--on-accent)] text-xl md:text-2xl font-normal leading-tight">DeFi Automation</h3>
                    </div>
                    <div className="bg-[#2a2a2a] flex flex-col justify-between p-5 md:p-6 h-28 md:h-auto transition-transform duration-300 hover:-translate-y-1">
                        <span className="label-text text-[#adc6ff]">FOCUS.02</span>
                        <h3 className="text-white text-xl md:text-2xl font-normal leading-tight">Security Research</h3>
                    </div>
                </div>
            </div>
        </section>
    );
};
