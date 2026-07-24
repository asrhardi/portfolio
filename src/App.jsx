import "./index.css"
import { useState, useCallback, useRef, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { LoadingScreen } from "./components/LoadingScreen.jsx";
import { MobileMenu }    from "./components/MobileMenu.jsx";
import { Home }          from "./components/section/Home.jsx";
import { About }         from "./components/section/About.jsx";
import { Project }       from "./components/section/Project.jsx";
import { Contact }       from "./components/section/Contact.jsx";

const PAGES = [
    { id: "home",     label: "Home"       },
    { id: "projects", label: "The Archive" },
    { id: "about",    label: "Manifesto"   },
    { id: "contact",  label: "Connect"     },
];

const CURTAIN_MS = 420;

export default function App() {
    const [isLoaded,   setIsLoaded]   = useState(false);
    const [menuOpen,   setMenuOpen]   = useState(false);
    const [pageIndex,  setPageIndex]  = useState(0);
    const [curtain,    setCurtain]    = useState(null);
    const [pageKey,    setPageKey]    = useState(0);
    const [theme,      setTheme]      = useState(
        () => (typeof document !== "undefined" && document.documentElement.dataset.theme) || "light"
    );
    const lockedRef = useRef(false);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try { localStorage.setItem("theme", theme); } catch { /* ignore */ }
    }, [theme]);

    const toggleTheme = useCallback(
        () => setTheme((t) => (t === "light" ? "dark" : "light")),
        []
    );

    const navigate = useCallback((target) => {
        const nextIdx = typeof target === "number"
            ? target
            : PAGES.findIndex((p) => p.id === target);

        if (nextIdx === pageIndex || nextIdx < 0 || lockedRef.current) return;
        lockedRef.current = true;
        setMenuOpen(false);

        setCurtain("in");
        setTimeout(() => {
            setPageIndex(nextIdx);
            setPageKey((k) => k + 1);
            setCurtain("out");
        }, CURTAIN_MS);
        setTimeout(() => {
            setCurtain(null);
            lockedRef.current = false;
        }, CURTAIN_MS * 2);
    }, [pageIndex]);

    const activePage = PAGES[pageIndex].id;
    const hasPrev    = pageIndex > 0;
    const hasNext    = pageIndex < PAGES.length - 1;

    return (
        <>
            {!isLoaded && <LoadingScreen onComplete={() => setIsLoaded(true)} />}

            <div className={`transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
                {/* ── Mobile menu + hamburger ──────────────── */}
                <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigate={navigate} />
                <button
                    className="fixed top-5 right-5 z-50 md:hidden inline-flex items-center justify-center h-10 w-10 text-[var(--heading)] text-xl bg-[var(--btn-surface)] rounded-lg border border-[var(--line-2)] transition-colors"
                    onClick={() => setMenuOpen((p) => !p)}
                    aria-label="Open menu"
                >
                    &#9776;
                </button>

                {/* ── Main content viewport ───────────────── */}
                {/* Full width, above bottom nav bar */}
                <div className="fixed top-0 left-0 right-0 bottom-14 overflow-y-auto no-scrollbar bg-[var(--bg)] transition-colors">
                    <div key={pageKey} className="page-content min-h-full flex flex-col">
                        {activePage === "home"     && <Home     onNavigate={navigate} />}
                        {activePage === "projects" && <Project  />}
                        {activePage === "about"    && <About    />}
                        {activePage === "contact"  && <Contact  />}
                    </div>
                </div>

                {/* ── Bottom nav bar ──────────────────────── */}
                {/* Full-width primary navigation */}
                <div className="fixed bottom-0 left-0 right-0 h-14 z-30
                    flex items-center justify-between px-6 md:px-10
                    bg-[var(--bg)] border-t border-[var(--line)] transition-colors">

                    {/* Brand → home */}
                    <button
                        onClick={() => navigate("home")}
                        className="text-[var(--heading)] text-sm font-bold tracking-[-0.4px] hover:text-[var(--accent-2)] transition-colors cursor-pointer shrink-0"
                        aria-label="Back to index"
                    >
                        Ace ft 
                        <span className="font-bold leading-none tracking-[0px] text-[clamp(90px)] text-[var(--accent)] "> Nemo </span>
                    </button>

                    {/* Direct page links (desktop) */}
                    <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                        {PAGES.map((p, i) => {
                            const isActive = i === pageIndex;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => navigate(i)}
                                    className={`px-4 py-2 text-sm tracking-[-0.3px] transition-colors cursor-pointer
                                        ${isActive ? "text-[var(--accent-3)]" : "text-[var(--muted)] hover:text-[var(--heading)]"}`}
                                >
                                    {p.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Theme toggle + page counter + prev/next */}
                    <div className="flex items-center gap-4 md:gap-5 shrink-0">
                        <button
                            onClick={toggleTheme}
                            className="text-[var(--muted)] hover:text-[var(--heading)] transition-colors cursor-pointer inline-flex items-center justify-center h-10 w-10 -mr-1"
                            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                            title={theme === "dark" ? "Light mode" : "Dark mode"}
                        >
                            {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
                        </button>
                        <span className="label-text text-[var(--dim)] hidden sm:inline">
                            {String(pageIndex + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(PAGES.length).padStart(2, "0")}
                        </span>
                        <button
                            className="nav-arrow"
                            onClick={() => hasPrev && navigate(pageIndex - 1)}
                            disabled={!hasPrev}
                            aria-label="Previous page"
                        >
                            <span className="text-lg">←</span>
                        </button>
                        <button
                            className="nav-arrow"
                            onClick={() => hasNext && navigate(pageIndex + 1)}
                            disabled={!hasNext}
                            aria-label="Next page"
                        >
                            <span className="text-lg">→</span>
                        </button>
                    </div>
                </div>

                {/* ── Curtain overlay ──────────────────────── */}
                {curtain && (
                    <div
                        className={`fixed inset-0 z-50 ${curtain === "in" ? "curtain-in" : "curtain-out"}`}
                        style={{ background: "linear-gradient(105deg,#060610 0%,#0d0d1a 40%,#131320 100%)" }}
                    />
                )}
            </div>
        </>
    );
}
