import "./HowWePlay.css";

const steps = [
  {
    number: "01",
    title: "Pick a case",
    body: "Browse the case files and open one. Each case comes with its own crime, its own suspects, and its own scene.",
  },
  {
    number: "02",
    title: "Walk the scene",
    body: "See where it happened and who's involved — the suspect list, their alibis, and the layout of the crime scene itself.",
  },
  {
    number: "03",
    title: "Collect evidence",
    body: "Search the scene and each suspect for clues — objects, statements, inconsistencies. Everything you find gets added to your case file.",
  },
  {
    number: "04",
    title: "Consult the assistant",
    body: "Open the AI assistant from anywhere in the case. Ask it about a suspect, a piece of evidence, or a timeline you're unsure of — it'll help you think it through without solving it for you.",
  },
  {
    number: "05",
    title: "Make your accusation",
    body: "When you're confident, name the suspect you believe is guilty. This is your one and only guess for the case.",
  },
  {
    number: "06",
    title: "Get your verdict",
    body: "Our model — trained on the evidence patterns across every case — weighs everything you uncovered and delivers its own read on who did it, alongside whether your accusation was right.",
  },
];

export default function HowWePlay() {
  return (
    <section id="how-we-play" className="how">
      <div className="how__inner">
        <div className="how__header">
          <span className="how__eyebrow">The Process</span>
          <h2 className="how__heading">How We Play</h2>
        </div>

        <ol className="how__timeline">
          {steps.map((step) => (
            <li className="how__step" key={step.number}>
              <div className="how__marker">
                <span className="how__number">{step.number}</span>
              </div>
              <div className="how__content">
                <h3 className="how__step-title">{step.title}</h3>
                <p className="how__step-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}