import {
  Header,
  Hero,
  SimulatorIntro,
  HowWePlay,
  Footer,
} from "../components";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Header />
      <main>
        <Hero />
        <SimulatorIntro />
        <HowWePlay />
      </main>
      <Footer />
    </div>
  );
}
