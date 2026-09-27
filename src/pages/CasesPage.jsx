import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header, Footer } from "../components";
import { cases } from "../data/cases";
import "./CasesPage.css";

export default function CasesPage() {
  const navigate = useNavigate();
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0].id);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSuspect, setSelectedSuspect] = useState(null);

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const handleSelectCase = (id) => {
    setSelectedCaseId(id);
    setActiveTab("overview");
    setSelectedSuspect(null);
  };

  return (
    <div className="cases-page">
      <Header />

      <main className="cases-main">
        {/* Archive Banner Header */}
        <section className="cases-header">
          <div className="cases-header__inner">
            <span className="cases-header__eyebrow">Central Archives // Classified Files</span>
            <h1 className="cases-header__heading">Active Investigation Dossiers</h1>
            <p className="cases-header__sub">
              Select an open case file below. Review crime scene reports, examine forensic logs,
              and step into the interactive investigation room with your AI partner.
            </p>
          </div>
        </section>

        {/* Cases Grid / Selector */}
        <section className="cases-content">
          <div className="cases-content__inner">
            {/* Case Selection Cards Bar */}
            <div className="cases-list">
              {cases.map((c) => {
                const isCurrent = c.id === activeCase.id;
                return (
                  <div
                    key={c.id}
                    className={`case-summary-card ${isCurrent ? "is-selected" : ""}`}
                    onClick={() => handleSelectCase(c.id)}
                  >
                    <div className="case-summary-card__top">
                      <span className="case-summary-card__number">{c.fileNumber}</span>
                      <span className="case-summary-card__diff">{c.difficulty}</span>
                    </div>
                    <h2 className="case-summary-card__title">{c.title}</h2>
                    <p className="case-summary-card__subtitle">{c.subtitle}</p>
                    <div className="case-summary-card__meta">
                      <span>⏱ {c.estimatedTime}</span>
                      <span>👥 {c.suspects.length} Suspects</span>
                      <span>📁 {c.evidence.length} Evidence</span>
                    </div>
                    <div className="case-summary-card__actions">
                      <button
                        type="button"
                        className="case-summary-card__select-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCase(c.id);
                        }}
                      >
                        {isCurrent ? "Currently Inspecting" : "Inspect Dossier"}
                      </button>
                      <button
                        type="button"
                        className="case-summary-card__launch-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/case/${c.id}`);
                        }}
                      >
                        Enter Case Room →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Case Dossier Viewer */}
            <div className="case-dossier-viewer">
              <div className="case-card">
                <div className="case-card__banner">
                  <div className="case-card__badge-row">
                    <span className="case-badge case-badge--primary">{activeCase.fileNumber}</span>
                    <span className="case-badge case-badge--status">{activeCase.status}</span>
                  </div>
                  <div className="case-card__meta">
                    <span>Difficulty: <strong>{activeCase.difficulty}</strong></span>
                    <span>•</span>
                    <span>Est. Time: <strong>{activeCase.estimatedTime}</strong></span>
                  </div>
                </div>

                <div className="case-card__body">
                  <h3 className="case-card__title">{activeCase.title}</h3>
                  <p className="case-card__subtitle">{activeCase.subtitle}</p>
                  <p className="case-card__synopsis">{activeCase.synopsis}</p>

                  {/* Victim Brief Box */}
                  <div className="case-victim-box">
                    <div className="case-victim-thumb-frame">
                      <img
                        src={activeCase.victim.image}
                        alt={activeCase.victim.name}
                        className="case-victim-thumb-img"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="case-victim-thumb-fallback" style={{ display: "none" }}>
                        👤
                      </div>
                    </div>
                    <div className="case-victim-box__content">
                      <div className="case-victim-box__row">
                        <span className="case-victim-box__label">Victim File</span>
                        <span className="case-victim-box__name">{activeCase.victim.name} ({activeCase.victim.age})</span>
                      </div>
                      <span className="case-victim-box__desc">
                        {activeCase.victim.occupation} • <em>Found at: {activeCase.victim.foundAt}</em>
                      </span>
                    </div>
                  </div>

                  {/* Dossier Tabs */}
                  <div className="case-tabs" role="tablist">
                    <button
                      className={`case-tab ${activeTab === "overview" ? "is-active" : ""}`}
                      onClick={() => setActiveTab("overview")}
                    >
                      Case Brief
                    </button>
                    <button
                      className={`case-tab ${activeTab === "suspects" ? "is-active" : ""}`}
                      onClick={() => setActiveTab("suspects")}
                    >
                      Suspects ({activeCase.suspects.length})
                    </button>
                    <button
                      className={`case-tab ${activeTab === "evidence" ? "is-active" : ""}`}
                      onClick={() => setActiveTab("evidence")}
                    >
                      Evidence ({activeCase.evidence.length})
                    </button>
                  </div>

                  {/* Tab: Overview */}
                  {activeTab === "overview" && (
                    <div className="case-tab-content">
                      <div className="case-quote">
                        <span className="case-quote__mark">“</span>
                        <p>{activeCase.tagline}</p>
                      </div>
                      <div className="case-overview-grid">
                        <div className="case-stat">
                          <span className="case-stat__number">{String(activeCase.suspects.length).padStart(2, "0")}</span>
                          <span className="case-stat__label">Interrogation Targets</span>
                        </div>
                        <div className="case-stat">
                          <span className="case-stat__number">{String(activeCase.evidence.length).padStart(2, "0")}</span>
                          <span className="case-stat__label">Key Evidence Items</span>
                        </div>
                        <div className="case-stat">
                          <span className="case-stat__number">01</span>
                          <span className="case-stat__label">Permitted Accusation</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Suspects */}
                  {activeTab === "suspects" && (
                    <div className="case-tab-content">
                      <div className="suspects-grid">
                        {activeCase.suspects.map((suspect, idx) => (
                          <div
                            key={suspect.name}
                            className={`suspect-card ${selectedSuspect === idx ? "is-selected" : ""}`}
                            onClick={() => setSelectedSuspect(selectedSuspect === idx ? null : idx)}
                          >
                            <div className="suspect-card__top">
                              <span className="suspect-card__index">Target 0{idx + 1}</span>
                              <span className="suspect-card__role">{suspect.role}</span>
                            </div>
                            <div className="suspect-card__person-row">
                              <div className="suspect-card__thumb-frame">
                                <img
                                  src={suspect.image}
                                  alt={suspect.name}
                                  className="suspect-card__thumb-img"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                                <div className="suspect-card__thumb-fallback" style={{ display: "none" }}>
                                  👤
                                </div>
                              </div>
                              <h4 className="suspect-card__name">{suspect.name}</h4>
                            </div>
                            <p className="suspect-card__motive">
                              <strong>Motive:</strong> {suspect.motive}
                            </p>
                            <p className="suspect-card__alibi">
                              <strong>Alibi:</strong> {suspect.alibi}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab: Evidence */}
                  {activeTab === "evidence" && (
                    <div className="case-tab-content">
                      <div className="evidence-list">
                        {activeCase.evidence.map((ev) => (
                          <div key={ev.id} className="evidence-item">
                            <span className="evidence-item__icon">📁</span>
                            <div className="evidence-item__info">
                              <h4 className="evidence-item__title">{ev.label}</h4>
                              <p className="evidence-item__detail">{ev.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dossier Footer Action */}
                  <div className="case-card__footer">
                    <button
                      className="case-start-btn"
                      onClick={() => navigate(`/case/${activeCase.id}`)}
                    >
                      Open Case Room & Interrogate with AI Partner ({activeCase.fileNumber}) →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
