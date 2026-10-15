import "./index.css";
import { useState, useCallback, useRef, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { MobileMenu } from "./components/MobileMenu.jsx";
import { Home } from "./components/section/Home.jsx";
import { About } from "./components/section/About.jsx";
import { Project } from "./components/section/Project.jsx";
import { Contact } from "./components/section/Contact.jsx";

const PAGES = [
    { id: "home", label: "Home" },
    { id: "projects", label: "The Archive" },
    { id: "about", label: "Manifesto" },
    { id: "contact", label: "Connect" },
];

function getPageIndex() {
    const index = PAGES.findIndex((page) => page.id === window.location.hash.slice(1));
    return index < 0 ? 0 : index;
}

export default function App() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [pageIndex, setPageIndex] = useState(getPageIndex);
    const [theme, setTheme] = useState(
        () => document.documentElement.dataset.theme === "dark" ? "dark" : "light"
    );
    const mainRef = useRef(null);
    const menuButtonRef = useRef(null);
    const activePage = PAGES[pageIndex];

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try { localStorage.setItem("theme", theme); } catch { /* Storage may be unavailable. */ }
    }, [theme]);

    useEffect(() => {
        const handleHashChange = () => {
            setPageIndex(getPageIndex());
            setMenuOpen(false);
            mainRef.current?.scrollTo(0, 0);
            mainRef.current?.focus({ preventScroll: true });
        };
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    useEffect(() => {
        document.title = `${activePage.label} | Ace ft Nemo`;
    }, [activePage.label]);

    const navigate = useCallback((target) => {
        const page = typeof target === "number" ? PAGES[target] : PAGES.find((item) => item.id === target);
        if (!page) return;
        setMenuOpen(false);
        window.location.hash = page.id;
    }, []);

    return (
        <>
            <a className="skip-link" href="#main-content" onClick={(event) => {
                event.preventDefault();
                mainRef.current?.focus();
            }}>
                Skip to content
            </a>

            <main id="main-content" ref={mainRef} tabIndex={-1} className="content-viewport paper-surface" aria-label={activePage.label}>
                <div className="page-content" key={activePage.id}>
                    {activePage.id === "home" && <Home onNavigate={navigate} />}
                    {activePage.id === "projects" && <Project />}
                    {activePage.id === "about" && <About />}
                    {activePage.id === "contact" && <Contact />}
                </div>
            </main>

            <footer className="bottom-bar paper-surface">
                <a href="#home" className="brand-link" aria-label="Ace ft Nemo, home">Ace ft <em>Nemo</em></a>

                <nav className="desktop-nav" aria-label="Main navigation">
                    {PAGES.map((page) => (
                        <a key={page.id} href={`#${page.id}`} aria-current={activePage.id === page.id ? "page" : undefined}>
                            {page.label}
                        </a>
                    ))}
                </nav>

                <div className="nav-controls">
                    <button
                        ref={menuButtonRef}
                        className="menu-trigger"
                        onClick={() => setMenuOpen(true)}
                        aria-haspopup="dialog"
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                    >
                        Menu
                    </button>
                    <button
                        className="icon-button"
                        onClick={() => setTheme((value) => value === "light" ? "dark" : "light")}
                        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                        title={theme === "dark" ? "Light mode" : "Dark mode"}
                    >
                        {theme === "dark" ? <FiSun size={18} aria-hidden="true" /> : <FiMoon size={18} aria-hidden="true" />}
                    </button>
                    <span className="page-counter" aria-label={`Page ${pageIndex + 1} of ${PAGES.length}`}>
                        {String(pageIndex + 1).padStart(2, "0")} / {String(PAGES.length).padStart(2, "0")}
                    </span>
                    <div className="page-arrows">
                        <button className="icon-button" onClick={() => navigate(pageIndex - 1)} disabled={pageIndex === 0} aria-label="Previous page">←</button>
                        <button className="icon-button" onClick={() => navigate(pageIndex + 1)} disabled={pageIndex === PAGES.length - 1} aria-label="Next page">→</button>
                    </div>
                </div>
            </footer>

            <MobileMenu
                pages={PAGES}
                activePage={activePage.id}
                menuOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                triggerRef={menuButtonRef}
                navigate={navigate}
            />
        </>
    );
}
