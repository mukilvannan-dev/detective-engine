import "./hero.css";
import heroImage from "../../assets/Death note.jpg"; // swap to your actual file

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
        <a href="#start" className="hero__cta">
          Start a Case
        </a>
      </div>
    </section>
  );
}