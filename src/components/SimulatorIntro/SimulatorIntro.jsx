import "./SimulatorIntro.css";

const capabilities = [
  {
    tag: "Exhibit A",
    title: "Your case files, fully explorable",
    body: "Every mystery is hand-written — the crime scene, the suspects, the motive. The AI reads it all and lets you interrogate it: ask about a detail, and it answers in character, from the file.",
  },
  {
    tag: "Exhibit B",
    title: "An assistant that cross-references",
    body: "Mention a name, a time, an alibi, and it checks that against everything else in the case — flagging contradictions you might have skimmed past.",
  },
  {
    tag: "Exhibit C",
    title: "Helps you think, not solve it for you",
    body: "It won't name the killer. It nudges — a question worth asking, a clue worth revisiting — so the deduction still has to be yours.",
  },
];

export default function SimulatorIntro() {
  return (
    <section id="about" className="intro">
      <div className="intro__inner">
        <div className="intro__copy">
          <span className="intro__eyebrow">The Engine</span>
          <h2 className="intro__heading">
            Hand-written mysteries, with an AI detective's assistant on the case.
          </h2>
          <p className="intro__lede">
            Every case in Forgotten Mystery is written start to finish — no
            generated suspects, no random alibis. What's AI-powered is the
            partner working the case with you: it knows the file cold, answers
            your questions about the evidence, and helps you keep every thread
            straight as the case gets more tangled.
          </p>
        </div>

        <div className="intro__board">
          {capabilities.map((item) => (
            <article className="intro__card" key={item.tag}>
              <span className="intro__tag">{item.tag}</span>
              <h3 className="intro__card-title">{item.title}</h3>
              <p className="intro__card-body">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}