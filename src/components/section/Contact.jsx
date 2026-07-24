import { FiArrowUpRight, FiMail } from "react-icons/fi";
import { FaGithub, FaXTwitter } from "react-icons/fa6";

const EMAIL = "hello@asrhardi.dev";
const TWITTER = "https://x.com/0xirishdara404";

const channels = [
    { label: "Email",     value: EMAIL,             href: `mailto:${EMAIL}`,             Icon: FiMail    },
    { label: "GitHub",    value: "@asrhardi",       href: "https://github.com/asrhardi", Icon: FaGithub  },
    { label: "Twitter",   value: "@0xirishdara404", href: TWITTER,                       Icon: FaXTwitter },
];

export const Contact = () => {
    return (
        <section className="my-auto w-full flex flex-col justify-center px-6 md:px-24 lg:px-40 xl:px-64 2xl:px-80 py-12 md:py-10">
            {/* Label */}
            <span className="label-text text-[var(--accent-2)] block mb-8">CONNECT / GET IN TOUCH</span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 md:items-center">
                {/* ── Left: invitation ─────────────────────────── */}
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2 className="text-3xl md:text-5xl font-bold text-[var(--heading)] leading-[1.05] tracking-tight">
                        Let&apos;s add a new
                        <span className="block text-[var(--accent)]">entry to the archive.</span>
                    </h2>

                    <p className="text-[var(--body)] text-base leading-relaxed">
                        Open for freelance work, collaborations, or just a conversation about
                        building things on the web. The fastest way to reach me is a direct email
                        or reach me on{" "}
                        <a
                            href={TWITTER}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-[var(--accent)] hover:text-[var(--accent-2)] underline underline-offset-2 transition-colors"
                        >
                            twitter
                        </a>.
                    </p>

                    {/* Availability */}
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75 animate-ping" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                        </span>
                        <span className="label-text text-[var(--muted)]">Available for new projects</span>
                    </div>

                    {/* Primary email CTA */}
                    <a
                        href={`mailto:${EMAIL}`}
                        className="group inline-flex items-center justify-between gap-4 border border-[var(--accent-border-2)] bg-[var(--accent-weak)] hover:bg-[var(--accent-soft-bg)] transition-colors px-5 py-4 mt-1"
                    >
                        <span className="text-[var(--heading)] text-base md:text-lg font-medium">{EMAIL}</span>
                        <FiArrowUpRight
                            size={20}
                            className="text-[var(--accent)] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                    </a>
                </div>

                {/* ── Right: channels ──────────────────────────── */}
                <div className="flex flex-col">
                    {channels.map((channel, i) => {
                        const { label, value, href } = channel;
                        const external = href.startsWith("http");
                        return (
                            <a
                                key={label}
                                href={href}
                                target={external ? "_blank" : undefined}
                                rel={external ? "noreferrer" : undefined}
                                className="group flex items-center justify-between gap-4 border border-[var(--line)] hover:border-[var(--accent-border-2)] bg-[var(--surface)] hover:bg-[var(--accent-weak)] transition-colors px-5 py-5 -mt-px first:mt-0"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <channel.Icon
                                        size={18}
                                        className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors shrink-0"
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="label-text text-[var(--muted)]">{`0${i + 1} / ${label}`}</span>
                                        <span className="text-[var(--heading)] text-sm truncate">{value}</span>
                                    </div>
                                </div>
                                <FiArrowUpRight
                                    size={18}
                                    className="text-[var(--dim)] group-hover:text-[var(--heading)] transition-colors shrink-0"
                                />
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
