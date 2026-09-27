import { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <span className="header__logo-mark">⌕</span>
          <span className="header__logo-text">
            CaseMind<span className="header__logo-accent">Ai</span>
          </span>
        </Link>

        <nav className={`header__nav ${menuOpen ? "is-open" : ""}`}>
          <Link to="/" className="header__link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <a href="/#about" className="header__link" onClick={() => setMenuOpen(false)}>
            The Engine
          </a>
          <a href="/#how-we-play" className="header__link" onClick={() => setMenuOpen(false)}>
            How We Play
          </a>
          <Link to="/cases" className="header__link" onClick={() => setMenuOpen(false)}>
            Cases
          </Link>
        </nav>

        <div className="header__actions">
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