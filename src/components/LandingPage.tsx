
interface LandingPageProps {
  onLogin: () => void;
  onExploreDemo: () => void;
}

export function LandingPage({
  onLogin,
  onExploreDemo,
}: LandingPageProps) {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a className="landing-brand" href="#" aria-label="Flood Ledger home">
          <span className="landing-brand-icon">≈</span>
          <span>
            <strong>FLOOD LEDGER</strong>
            <small>URBAN FLOOD RESPONSE</small>
          </span>
        </a>

        <button
          className="landing-login-link"
          onClick={onLogin}
          type="button"
        >
          Sign in <span aria-hidden="true">↗</span>
        </button>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-copy">
            <div className="landing-status">
              <span className="landing-status-dot" />
              DISASTER RESPONSE & COORDINATION
            </div>

            <h1>
              When every second matters,
              <span> every report counts.</span>
            </h1>

            <p className="landing-description">
              One coordinated platform for citizen distress reports,
              evacuation centres, relief supplies and flood response.
              Helping communities and response teams act with better
              information when it matters most.
            </p>

            <div className="landing-actions">
              <button
                className="landing-primary-button"
                onClick={onLogin}
                type="button"
              >
                Sign in / Get started <span aria-hidden="true">→</span>
              </button>

              <button
                className="landing-secondary-button"
                onClick={onExploreDemo}
                type="button"
              >
                Explore live demo <span aria-hidden="true">↗</span>
              </button>
            </div>

            <p className="landing-demo-note">
              Explore the dashboard using demonstration data.
            </p>
          </div>

          <div className="landing-visual">
            <div className="landing-visual-top">
              <span>FLOOD RESPONSE OVERVIEW</span>
              <span className="landing-live-indicator">
                <span /> DEMO
              </span>
            </div>

            <div className="landing-map-art" aria-label="Illustration of a flooded urban area">
              <div className="landing-map-grid" />
              <div className="landing-river" />
              <div className="landing-road landing-road-one" />
              <div className="landing-road landing-road-two" />
              <div className="landing-road landing-road-three" />

              <div className="landing-map-pin pin-one">
                <span>!</span>
              </div>
              <div className="landing-map-pin pin-two">
                <span>+</span>
              </div>
              <div className="landing-map-pin pin-three">
                <span>⌂</span>
              </div>

              <div className="landing-map-label">
                <span className="landing-status-dot" />
                Flood response network
              </div>
            </div>

            <div className="landing-feature-row">
              <div>
                <span className="landing-feature-symbol">◎</span>
                <span>
                  <strong>Citizen reports</strong>
                  <small>Local incident information</small>
                </span>
              </div>
              <div>
                <span className="landing-feature-symbol">⌂</span>
                <span>
                  <strong>Evacuation centres</strong>
                  <small>Capacity and status tracking</small>
                </span>
              </div>
              <div>
                <span className="landing-feature-symbol">≋</span>
                <span>
                  <strong>Offline SOS concept</strong>
                  <small>Designed for connectivity challenges</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-bottom">
          <span>BUILT FOR FLOOD-PRONE URBAN COMMUNITIES</span>
          <span>REPORT · COORDINATE · RESPOND</span>
        </section>
      </main>
    </div>
  );
}
