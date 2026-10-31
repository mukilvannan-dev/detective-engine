import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <span className="footer__logo-mark">⌕</span>
            <span className="footer__logo-text">CaseMind<span className="footer__logo-accent">Ai</span></span>
          </Link>
          <p className="footer__desc">
            An AI-augmented criminal investigation sandbox. Hand-crafted mystery narratives backed by intelligent evidentiary reasoning.
          </p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <span className="footer__col-title">Navigation</span>
            <Link to="/">Home</Link>
            <a href="/#about">The Engine</a>
            <a href="/#how-it-works">How It Works</a>
            <Link to="/cases">Case Dossiers</Link>
          </div>
          <div className="footer__col">
            <span className="footer__col-title">System</span>
            <span>React 19 + Vite</span>
            <span>ML Detective Assistant</span>
            <span>Evidence Engine v1.0</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} CaseMind AI. All rights reserved.</p>
        <p className="footer__confidential">CONFIDENTIAL INVESTIGATION DOSSIER — AUTHORIZED ACCESS ONLY</p>
      </div>
    </footer>
  );
}
