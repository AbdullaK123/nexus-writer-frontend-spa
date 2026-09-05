import type { ReactNode } from "react"

interface AuthFlowPageProps {
    badge: string
    title: string
    subtitle: string
    children: ReactNode
}

export function AuthFlowPage({ badge, title, subtitle, children }: AuthFlowPageProps) {
    return (
        <div className="auth-page">
            <aside className="auth-page__hero">
                <div className="hero-brand__row">
                    <span className="hero-brand__logo">NX</span>
                    <p className="hero-brand__name">NEXUS WRITER</p>
                </div>

                <div className="hero-content">
                    <span className="section-tag">[ACCOUNT SECURITY]</span>
                    <h1 className="hero-content__headline">
                        Protect your<br />
                        writing vault.
                    </h1>
                    <p className="hero-content__subtitle">
                        Account verification and recovery stay separate from your writing.
                        Your stories remain yours.
                    </p>
                </div>
            </aside>

            <main className="auth-page__form-pane">
                <section className="card">
                    <header className="card__header">
                        <span className="system-badge system-badge__nobg">[{badge}]</span>
                        <h2 className="card__title">{title}</h2>
                        <p className="card__subtitle">{subtitle}</p>
                    </header>
                    {children}
                </section>
            </main>
        </div>
    )
}
