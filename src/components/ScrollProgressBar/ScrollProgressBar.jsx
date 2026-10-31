import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #c99a46, #ef4444, #e5b358)",
        transformOrigin: "0%",
        scaleX,
        zIndex: 99999,
        boxShadow: "0 0 10px rgba(201, 154, 70, 0.7)",
        pointerEvents: "none",
      }}
    />
  );
}
