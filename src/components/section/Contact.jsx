const EMAIL = "hello@asrhardi.xyz";
const channels = [
    { label: "GitHub", value: "@asrhardi", href: "https://github.com/asrhardi" },
    { label: "Twitter / X", value: "@0xirishdara404", href: "https://x.com/0xirishdara404" },
];

export const Contact = () => (
    <section className="page-shell contact-page" aria-labelledby="contact-title">
        <header className="section-header">
            <p className="label-text">Connect / get in touch</p>
            <h1 id="contact-title" className="page-title">Good work starts<br />with a <em>conversation.</em></h1>
        </header>
        <div className="contact-layout">
            <div className="contact-invitation">
                <p>Open for freelance work, collaborations, or a conversation about building things on the web.</p>
                <a className="email-link" href={`mailto:${EMAIL}`}>{EMAIL}</a>
                <p className="contact-note">Email is the most direct way to reach me.</p>
            </div>
            <div className="contact-elsewhere">
                <h2 className="label-text">Elsewhere on the web</h2>
                <ul className="channel-list">
                    {channels.map((channel) => (
                        <li key={channel.label}>
                            <a href={channel.href} target="_blank" rel="noreferrer">
                                <span><span className="channel-label">{channel.label}</span><span>{channel.value}</span></span>
                                <span aria-hidden="true">↗</span>
                                <span className="sr-only"> (opens in a new tab)</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </section>
);
