import { useEffect, useRef } from "react";

export const MobileMenu = ({ pages, activePage, menuOpen, onClose, triggerRef, navigate }) => {
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (menuOpen && !dialog.open) dialog.showModal();
        if (!menuOpen && dialog.open) {
            dialog.close();
            triggerRef.current?.focus();
        }
    }, [menuOpen, triggerRef]);

    useEffect(() => {
        const media = window.matchMedia("(min-width: 960px)");
        const closeOnDesktop = () => {
            if (media.matches && dialogRef.current.open) dialogRef.current.close();
        };
        media.addEventListener("change", closeOnDesktop);
        return () => media.removeEventListener("change", closeOnDesktop);
    }, []);

    return (
        <dialog
            id="mobile-menu"
            ref={dialogRef}
            className="mobile-menu paper-surface"
            aria-labelledby="menu-title"
            onClose={onClose}
            onCancel={onClose}
            onKeyDown={(event) => {
                if (event.key !== "Tab") return;
                const controls = [...event.currentTarget.querySelectorAll("button, a[href]")];
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }}
        >
            <div className="menu-heading">
                <p className="label-text" id="menu-title">The index</p>
                <button className="text-button" onClick={onClose} autoFocus>Close</button>
            </div>
            <nav aria-label="Mobile navigation">
                {pages.map((page, index) => (
                    <a
                        key={page.id}
                        href={`#${page.id}`}
                        aria-current={activePage === page.id ? "page" : undefined}
                        onClick={(event) => {
                            event.preventDefault();
                            navigate(page.id);
                        }}
                    >
                        <span className="label-text" aria-hidden="true">0{index + 1}</span>
                        {page.label}
                    </a>
                ))}
            </nav>
            <p className="menu-signature">Ace ft <em>Nemo</em><span>Backend development & web3 research</span></p>
        </dialog>
    );
};
