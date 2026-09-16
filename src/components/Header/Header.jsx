import { useState } from "react";
import "./Header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header__inner">
        <a href="/" className="header__logo">
          <span className="header__logo-mark">⌕</span>
          <span className="header__logo-text">
            CaseMind<span className="header__logo-accent">Ai</span>
          </span>
        </a>

        <nav className={`header__nav ${menuOpen ? "is-open" : ""}`}>
          <a href="#home" className="header__link" onClick={() => setMenuOpen(false)}>
            Home
          </a>
          <a href="#how-we-play" className="header__link" onClick={() => setMenuOpen(false)}>
            How We Play
          </a>
        </nav>

        <div className="header__actions">
          <a href="#start" className="header__cta">
            Start a Case
          </a>
          <button
            className={`header__toggle ${menuOpen ? "is-open" : ""}`}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}