import "./index.css";
import { useState, useCallback, useRef, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { MobileMenu } from "./components/MobileMenu.jsx";
import { Home } from "./components/section/Home.jsx";
import { About } from "./components/section/About.jsx";
import { Project } from "./components/section/Project.jsx";
import { Contact } from "./components/section/Contact.jsx";
import { Writing } from "./components/section/Writing.jsx";
import { isPlainClick, PAGES, readRoute } from "./lib/navigation.js";
import { applyMetadata, portfolioMetadata } from "./lib/seo.js";

export default function App() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [route, setRoute] = useState(() => readRoute(window.location));
    const [theme, setTheme] = useState(
        () => document.documentElement.dataset.theme === "dark" ? "dark" : "light"
    );
    const mainRef = useRef(null);
    const menuButtonRef = useRef(null);
    const pageIndex = PAGES.findIndex((page) => page.id === route.id);
    const activePage = PAGES[pageIndex] || { id: "not-found", label: "Page not found" };

    const syncRoute = useCallback(() => {
        setRoute(readRoute(window.location));
        setMenuOpen(false);
        mainRef.current?.scrollTo(0, 0);
        mainRef.current?.focus({ preventScroll: true });
    }, []);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try { localStorage.setItem("theme", theme); } catch { /* Storage may be unavailable. */ }
    }, [theme]);

    useEffect(() => {
        window.addEventListener("hashchange", syncRoute);
        window.addEventListener("popstate", syncRoute);
        return () => {
            window.removeEventListener("hashchange", syncRoute);
            window.removeEventListener("popstate", syncRoute);
        };
    }, [syncRoute]);

    useEffect(() => {
        if (activePage.id !== "writing" && activePage.id !== "not-found") {
            applyMetadata(portfolioMetadata({ id: activePage.id, label: activePage.label }));
        }
    }, [activePage.id, activePage.label]);

    const navigate = useCallback((target) => {
        const page = typeof target === "number" ? PAGES[target] : PAGES.find((item) => item.id === target);
        if (!page) return;
        window.history.pushState({}, "", page.href);
        syncRoute();
    }, [syncRoute]);

    const onLink = useCallback((event) => {
        if (!isPlainClick(event)) return;
        const url = new URL(event.currentTarget.href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        event.preventDefault();
        window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
        syncRoute();
    }, [syncRoute]);

    return (
        <>
            <a className="skip-link" href="#main-content" onClick={(event) => {
                event.preventDefault();
                mainRef.current?.focus();
            }}>
                Skip to content
            </a>

            <main id="main-content" ref={mainRef} tabIndex={-1} className="content-viewport paper-surface" aria-label={activePage.label}>
                <div className="page-content" key={`${route.id}:${route.slug || ""}:${route.notFound || false}`}>
                    {activePage.id === "home" && <Home onNavigate={navigate} />}
                    {activePage.id === "projects" && <Project />}
                    {activePage.id === "writing" && <Writing slug={route.slug} notFound={route.notFound} onLink={onLink} />}
                    {activePage.id === "not-found" && <Writing notFound onLink={onLink} />}
                    {activePage.id === "about" && <About />}
                    {activePage.id === "contact" && <Contact />}
                </div>
            </main>

            <footer className="bottom-bar paper-surface">
                <a href="/#home" onClick={onLink} className="brand-link" aria-label="Ace ft Nemo, home">Ace ft <em>Nemo</em></a>

                <nav className="desktop-nav" aria-label="Main navigation">
                    {PAGES.map((page) => (
                        <a key={page.id} href={page.href} onClick={onLink} aria-current={activePage.id === page.id ? "page" : undefined}>
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
                    <span className="page-counter" aria-label={pageIndex < 0 ? "Page not found" : `Page ${pageIndex + 1} of ${PAGES.length}`}>
                        {String(pageIndex + 1).padStart(2, "0")} / {String(PAGES.length).padStart(2, "0")}
                    </span>
                    <div className="page-arrows">
                        <button className="icon-button" onClick={() => navigate(pageIndex - 1)} disabled={pageIndex <= 0} aria-label="Previous page">←</button>
                        <button className="icon-button" onClick={() => navigate(pageIndex + 1)} disabled={pageIndex < 0 || pageIndex === PAGES.length - 1} aria-label="Next page">→</button>
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
