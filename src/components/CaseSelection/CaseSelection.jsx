import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cases } from "../../data/cases";
import "./CaseSelection.css";

export default function CaseSelection() {
  const navigate = useNavigate();
  const currentCase = cases[0];
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSuspect, setSelectedSuspect] = useState(null);

  return (
    <section id="start" className="case-section">
      <div className="case-section__inner">
        <div className="case-section__header">
          <span className="case-section__eyebrow">Dossier Access</span>
          <h2 className="case-section__heading">Select An Open Case</h2>
          <p className="case-section__sub">
            Review the incident brief, examine available evidence, and initialize your AI-assisted investigative workbench.
          </p>
        </div>

        <div className="case-card">
          <div className="case-card__banner">
            <div className="case-card__badge-row">
              <span className="case-badge case-badge--primary">{currentCase.fileNumber}</span>
              <span className="case-badge case-badge--status">{currentCase.status}</span>
            </div>
            <div className="case-card__meta">
              <span>Difficulty: <strong>{currentCase.difficulty}</strong></span>
              <span>•</span>
              <span>Est. Time: <strong>{currentCase.estimatedTime}</strong></span>
            </div>
          </div>

          <div className="case-card__body">
            <h3 className="case-card__title">{currentCase.title}</h3>
            <p className="case-card__subtitle">{currentCase.subtitle}</p>
            <p className="case-card__synopsis">{currentCase.synopsis}</p>

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
                Suspects ({currentCase.suspects.length})
              </button>
              <button
                className={`case-tab ${activeTab === "evidence" ? "is-active" : ""}`}
                onClick={() => setActiveTab("evidence")}
              >
                Evidence ({currentCase.evidence.length})
              </button>
            </div>

            {activeTab === "overview" && (
              <div className="case-tab-content">
                <div className="case-quote">
                  <span className="case-quote__mark">“</span>
                  <p>{currentCase.tagline}</p>
                </div>
                <div className="case-overview-grid">
                  <div className="case-stat">
                    <span className="case-stat__number">04</span>
                    <span className="case-stat__label">Interrogation Targets</span>
                  </div>
                  <div className="case-stat">
                    <span className="case-stat__number">03</span>
                    <span className="case-stat__label">Key Evidence Items</span>
                  </div>
                  <div className="case-stat">
                    <span className="case-stat__number">01</span>
                    <span className="case-stat__label">Permitted Accusation</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "suspects" && (
              <div className="case-tab-content">
                <div className="suspects-grid">
                  {currentCase.suspects.map((suspect, idx) => (
                    <div
                      key={suspect.name}
                      className={`suspect-card ${selectedSuspect === idx ? "is-selected" : ""}`}
                      onClick={() => setSelectedSuspect(selectedSuspect === idx ? null : idx)}
                    >
                      <div className="suspect-card__top">
                        <span className="suspect-card__index">Target 0{idx + 1}</span>
                        <span className="suspect-card__role">{suspect.role}</span>
                      </div>
                      <h4 className="suspect-card__name">{suspect.name}</h4>
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

            {activeTab === "evidence" && (
              <div className="case-tab-content">
                <div className="evidence-list">
                  {currentCase.evidence.map((ev) => (
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

            <div className="case-card__footer">
              <button
                className="case-start-btn"
                onClick={() => navigate(`/case/${currentCase.id}`)}
              >
                Open Case Room & Interrogate with AI Partner →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
