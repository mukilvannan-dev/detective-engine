import { motion } from "framer-motion";
import "./HowWePlay.css";

const steps = [
  {
    number: "01",
    title: "Select an Active Case Dossier",
    body: "Browse cold case archives ranging from the Blackwood Manor poisoning to the CryoGen Labs sabotage. Each case comes with authentic crime scene evidence photos, coroner autopsy findings, and full suspect profiles.",
  },
  {
    number: "02",
    title: "Interrogate with AI Detective Partner",
    body: "Launch your draggable AI partner anywhere in the case room. Ask pointed questions about evidence, challenge suspicious timeline windows, and probe contradictions in suspect statements in real time.",
  },
  {
    number: "03",
    title: "Pin Leads to Your Clue Vault",
    body: "Review suspect alibis and interrogation reports. Click any highlighted red keyword or log personal deductions to pin critical leads into each suspect's dedicated Clue Vault.",
  },
  {
    number: "04",
    title: "Trained Machine Learning Analysis",
    body: "Behind the scenes, a Scikit-learn binary classification pipeline calculates multi-factor guilt probabilities using unverified alibi gaps, physical forensic trace scores, contradiction indexes, and motive severity — protected with spoiler shields.",
  },
  {
    number: "05",
    title: "Deliver the Official Indictment",
    body: "When you have deduced the truth, enter the Indictment Chamber. Select your prime suspect and enter your evidentiary proof detailing the alibi breach and forensic match to seal your deduction.",
  },
  {
    number: "06",
    title: "Benchmark Against AI Model & Viva Mode",
    body: "Review the verdict comparing your accusation against the AI champion model (99.69% accuracy) and ground truth. Unlock the Academic ML Viva Diagnostics to inspect the Confusion Matrix, ROC-AUC curve, and feature weights.",
  },
];

export default function HowWePlay() {
  return (
    <section id="how-it-works" className="how">
      <div className="how__inner">
        <motion.div
          className="how__header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span className="how__eyebrow">The Investigation Workflow</span>
          <h2 className="how__heading">How It Works</h2>
        </motion.div>

        <ol className="how__timeline">
          {steps.map((step, idx) => (
            <motion.li
              className="how__step"
              key={step.number}
              initial={{ opacity: 0, x: -35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
            >
              <motion.div
                className="how__marker"
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span className="how__number">{step.number}</span>
              </motion.div>
              <div className="how__content">
                <h3 className="how__step-title">{step.title}</h3>
                <p className="how__step-body">{step.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}