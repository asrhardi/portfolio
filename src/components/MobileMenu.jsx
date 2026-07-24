import { useEffect } from "react";

const LINKS = [
    { id: "home",     label: "Home"       },
    { id: "projects", label: "The Archive" },
    { id: "about",    label: "Manifesto"   },
    { id: "contact",  label: "Connect"     },
];

export const MobileMenu = ({ menuOpen, setMenuOpen, navigate }) => {
    const handleNav = (id) => {
        setMenuOpen(false);
        navigate(id);
    };

    // Escape closes the overlay
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen, setMenuOpen]);

    return (
        <div
            className={`fixed inset-0 bg-[var(--overlay)] backdrop-blur-md z-40 flex flex-col items-center justify-center md:hidden
                transition-all duration-300 ease-in-out
                ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        >
            <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-6 right-6 text-[var(--heading)] text-3xl cursor-pointer"
                aria-label="Close menu"
            >
                &times;
            </button>

            <nav className="flex flex-col items-center gap-8">
                {LINKS.map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => handleNav(id)}
                        className={`text-3xl font-bold tracking-tight cursor-pointer
                            transition-all duration-300 bg-transparent border-0
                            ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
                            text-[var(--heading)] hover:text-[var(--accent)]`}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            <div className="absolute bottom-10 flex gap-8">
                <a
                    href="https://instagram.com/asr_hardi/"
                    target="_blank"
                    rel="noreferrer"
                    className="label-text text-[var(--muted)] hover:text-[var(--heading)] transition-colors"
                >
                    INSTAGRAM ↗
                </a>
                <a
                    href="https://github.com/asriqul"
                    target="_blank"
                    rel="noreferrer"
                    className="label-text text-[var(--muted)] hover:text-[var(--heading)] transition-colors"
                >
                    GITHUB ↗
                </a>
            </div>
        </div>
    );
};
