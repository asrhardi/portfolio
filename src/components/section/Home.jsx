import { securityContributions } from "../../data/projects.js";

export const Home = ({ onNavigate }) => {
    const featuredContribution = securityContributions[0];

    return (
        <section className="page-shell home-page" aria-labelledby="home-title">
            <div className="page-masthead">
                <p className="label-text">The living archive</p>
                <p className="edition-text">Go / Node.js / Web3</p>
            </div>

            <div className="home-intro">
                <div className="home-copy">
                    <p className="role-text">Backend-focused web developer</p>
                    <h1 id="home-title" className="home-title">ACE ft <span>NEMO</span></h1>
                    <p className="home-description">
                        I build backend services and on-chain automation tools.
                        My current focus is DeFi automation, wallet recovery,
                        and web3 security research.
                    </p>
                    <div className="home-actions">
                        <a href="#projects" className="primary-button">View selected work</a>
                        <a href="#contact" className="text-button">Get in touch</a>
                    </div>
                </div>

                <figure className="profile-figure">
                    <img
                        src="/profile.jpg"
                        alt="Ace ft Nemo's black cat avatar wearing sunglasses"
                        width="320"
                        height="320"
                        className="profile-image"
                        fetchPriority="high"
                    />
                    <figcaption><span className="label-text">Behind the AI</span><span>Me :)</span></figcaption>
                </figure>
            </div>

            <div className="home-bottom">
                <a className="featured-work" href={featuredContribution.href} target="_blank" rel="noreferrer" aria-label={`Read ${featuredContribution.title} ${featuredContribution.version} release notes and security credit (opens in a new tab)`}>
                    <span className="label-text">Security contribution / {featuredContribution.version}</span>
                    <span className="featured-title">{featuredContribution.title}<span aria-hidden="true">↗</span></span>
                    <span className="featured-summary">{featuredContribution.summary}</span>
                </a>
                <div className="current-focus">
                    <p className="label-text">Currently working on</p>
                    <p>DeFi automation<br /><span>& security research.</span></p>
                    <p className="current-focus-note">Self-directed my experimental projects, not tied to a single client or employer.</p>
                    <button className="text-button" onClick={() => onNavigate("about")}>Read the manifesto</button>
                </div>
            </div>
        </section>
    );
};
