import { FaGithub, FaInstagram } from "react-icons/fa";

export const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-[var(--line)] px-6 md:px-24 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="label-text text-[var(--muted)]">
                © {year} The Living Archive. Asriqul Hardi.
            </p>

            <div className="flex items-center gap-8">
                <a href="#projects" className="label-text text-[var(--dim)] hover:text-[var(--heading)] transition-colors">ARCHIVES</a>
                <a href="#about"    className="label-text text-[var(--dim)] hover:text-[var(--heading)] transition-colors">MANIFESTO</a>
                <a href="#contact"  className="label-text text-[var(--dim)] hover:text-[var(--heading)] transition-colors">CONNECT</a>
            </div>

            <div className="flex items-center gap-5">
                <a href="https://github.com/asriqul" target="_blank" rel="noreferrer" className="text-[var(--muted)] hover:text-[var(--heading)] transition-colors">
                    <FaGithub size={18} />
                </a>
                <a href="https://instagram.com/asr_hardi/" target="_blank" rel="noreferrer" className="text-[var(--muted)] hover:text-[var(--heading)] transition-colors">
                    <FaInstagram size={18} />
                </a>
            </div>
        </footer>
    );
};
