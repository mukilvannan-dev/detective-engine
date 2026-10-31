import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./Hero.css";
import heroImage from "../../assets/death-note.jpg";

export default function Hero() {
  return (
    <section id="home" className="hero">
      <motion.div
        className="hero__bg"
        style={{ backgroundImage: `url(${heroImage})` }}
        initial={{ scale: 1.08, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      />
      <div className="hero__overlay" />

      <div className="hero__content">
        <motion.span
          className="hero__eyebrow"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Central Archives // Classified Files
        </motion.span>

        <motion.h1
          className="hero__heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          The Cold Case <span className="hero__accent">Murder Mystery</span>
        </motion.h1>

        <motion.p
          className="hero__sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          Open the file. Cross-examine every suspect against forensic logs.
          One official accusation — guided by trained machine learning.
        </motion.p>

        <motion.div
          style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link to="/cases" className="hero__cta">
              Start Case Investigation →
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}