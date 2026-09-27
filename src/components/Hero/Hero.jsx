import { Link } from "react-router-dom";
import "./Hero.css";
import heroImage from "../../assets/death-note.jpg";

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div
        className="hero__bg"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="hero__overlay" />

      <div className="hero__content">
        <span className="hero__eyebrow">Case File №1</span>
        <h1 className="hero__heading">
          The Cold Case <span className="hero__accent">Murder Mystery</span>
        </h1>
        <p className="hero__sub">
          Open the file. Question every suspect. One accusation — no
          second chances.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/cases" className="hero__cta">
            Start Case →
          </Link>
        </div>
      </div>
    </section>
  );
}