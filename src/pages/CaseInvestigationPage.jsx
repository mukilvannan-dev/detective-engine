import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cases } from "../data/cases";
import DetectiveChatbot from "../components/DetectiveChatbot/DetectiveChatbot";
import ForensicModelDiagnostics from "../components/ForensicModelDiagnostics/ForensicModelDiagnostics";
import SuspectThoughtBubble from "../components/SuspectThoughtBubble/SuspectThoughtBubble";
import { predictSuspectRisk } from "../services/api";
import "./CaseInvestigationPage.css";

export default function CaseInvestigationPage() {
  const { id } = useParams();
  const caseData = cases.find((c) => c.id === id) || cases[0];

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSuspect, setSelectedSuspect] = useState(caseData.suspects[0]);
  const [selectedEvidence, setSelectedEvidence] = useState(caseData.evidence[0]);
  const [showAccusationModal, setShowAccusationModal] = useState(false);
  const [accusedId, setAccusedId] = useState("");
  const [deductionNotes, setDeductionNotes] = useState("");
  const [verdictResult, setVerdictResult] = useState(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Live Machine Learning Suspect Evaluation
  const [suspectMlPrediction, setSuspectMlPrediction] = useState(null);
  const [isMlEvaluating, setIsMlEvaluating] = useState(false);

  // Spoiler Protection & ML Reveal State
  const [showVivaWarningModal, setShowVivaWarningModal] = useState(false);
  const [suspectToConfirmUnlock, setSuspectToConfirmUnlock] = useState(null);
  const [hasRevealedMl, setHasRevealedMl] = useState(false);
  const [unlockedSuspects, setUnlockedSuspects] = useState({});

  // Clue Vault & Memory Reference state
  const [pinnedKeywords, setPinnedKeywords] = useState({});
  const [customClueInput, setCustomClueInput] = useState("");

  const handleToggleKeyword = (suspectId, keyword) => {
    setPinnedKeywords((prev) => {
      const currentList = prev[suspectId] || [];
      const exists = currentList.some((k) => k.toLowerCase() === keyword.toLowerCase());
      if (exists) {
        return {
          ...prev,
          [suspectId]: currentList.filter((k) => k.toLowerCase() !== keyword.toLowerCase()),
        };
      } else {
        return {
          ...prev,
          [suspectId]: [...currentList, keyword],
        };
      }
    });
  };

  const handleAddCustomClue = (e) => {
    e.preventDefault();
    if (!customClueInput.trim() || !selectedSuspect) return;
    handleToggleKeyword(selectedSuspect.id, customClueInput.trim());
    setCustomClueInput("");
  };

  // Parses text and marks suspect keywords in red with interactive click-to-pin
  const renderClueText = (text, suspect) => {
    if (!text || !suspect?.keywords?.length) return text;

    const escapedKeywords = suspect.keywords
      .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .sort((a, b) => b.length - a.length);

    const regex = new RegExp(`(${escapedKeywords.join("|")})`, "gi");
    const parts = text.split(regex);
    const suspectPinned = pinnedKeywords[suspect.id] || [];

    return parts.map((part, index) => {
      const isKeyword = suspect.keywords.some(
        (k) => k.toLowerCase() === part.toLowerCase()
      );

      if (isKeyword) {
        const isPinned = suspectPinned.some((p) => p.toLowerCase() === part.toLowerCase());
        return (
          <button
            key={index}
            type="button"
            className={`clue-keyword-btn ${isPinned ? "is-pinned" : ""}`}
            onClick={() => handleToggleKeyword(suspect.id, part)}
            title={isPinned ? `Pinned to Vault: Click to unpin "${part}"` : `Click to pin "${part}" to Clue Vault`}
          >
            {part}
            <span className="clue-tag-icon">{isPinned ? "✓" : "+"}</span>
          </button>
        );
      }
      return part;
    });
  };

  // Investigation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset selections when case changes
  useEffect(() => {
    if (caseData?.suspects?.length) {
      setSelectedSuspect(caseData.suspects[0]);
    }
    if (caseData?.evidence?.length) {
      setSelectedEvidence(caseData.evidence[0]);
    }
    setActiveTab("overview");
    setVerdictResult(null);
    setAccusedId("");
    setDeductionNotes("");
    setHasRevealedMl(false);
    setUnlockedSuspects({});
    setShowVivaWarningModal(false);
    setSuspectToConfirmUnlock(null);
  }, [id]);

  const handleOpenDiagnosticsTab = () => {
    if (verdictResult || hasRevealedMl) {
      setActiveTab("ml_diagnostics");
    } else {
      setShowVivaWarningModal(true);
    }
  };


  // Live Machine Learning Suspect Scoring
  useEffect(() => {
    if (!selectedSuspect) return;
    let isMounted = true;
    setIsMlEvaluating(true);

    const features = selectedSuspect.forensicFeatures || {
      suspect_name: selectedSuspect.name,
      forensic_trace_score: 30,
      alibi_gap_minutes: 15,
      contradiction_level: 1,
    };

    predictSuspectRisk({
      suspect_name: selectedSuspect.name,
      ...features,
    }).then((result) => {
      if (isMounted) {
        setSuspectMlPrediction(result);
        setIsMlEvaluating(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSuspect]);

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleAccusationSubmit = (e) => {
    e.preventDefault();
    if (!accusedId) return;

    const isCorrect = accusedId === caseData.killerId;
    setVerdictResult({
      success: isCorrect,
      killerName: caseData.suspects.find((s) => s.id === caseData.killerId)?.name,
      explanation: caseData.solutionExplanation,
    });
  };

  return (
    <div className="investigation-page">
      {/* Top Command Bar */}
      <header className="investigation-bar">
        <div className="investigation-bar__inner">
          <div className="investigation-bar__left">
            <Link to="/cases" className="investigation-back">
              ← Return to Case Archives
            </Link>
            <div className="investigation-title-box">
              <span className="investigation-badge">{caseData.fileNumber}</span>
              <h1 className="investigation-case-title">{caseData.title}</h1>
            </div>
          </div>

          <div className="investigation-bar__right">
            <div className="investigation-timer">
              <span className="investigation-timer__icon">⏱</span>
              <span>Investigation Clock: <strong>{formatTimer(secondsElapsed)}</strong></span>
            </div>
            <button
              className="investigation-ml-btn"
              onClick={handleOpenDiagnosticsTab}
              title="Inspect 3rd-Semester ML Model Metrics, Confusion Matrix, and ROC Curve"
            >
              🤖 ML Viva Diagnostics
            </button>
            <button
              className="investigation-accuse-btn"
              onClick={() => setShowAccusationModal(true)}
            >
              Deliver Accusation ⚖️
            </button>
          </div>
        </div>
      </header>

      {/* Main Workbench */}
      <main className="workbench-container">
        {/* Navigation Tabs */}
        <nav className="workbench-tabs">
          <button
            className={`workbench-tab ${activeTab === "overview" ? "is-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📋 Case Overview & Victim
          </button>
          <button
            className={`workbench-tab ${activeTab === "suspects" ? "is-active" : ""}`}
            onClick={() => setActiveTab("suspects")}
          >
            👥 Suspects & Alibis ({caseData.suspects.length})
          </button>
          <button
            className={`workbench-tab ${activeTab === "evidence" ? "is-active" : ""}`}
            onClick={() => setActiveTab("evidence")}
          >
            🔬 Forensic Evidence ({caseData.evidence.length})
          </button>
          <button
            className={`workbench-tab ${activeTab === "timeline" ? "is-active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            ⏱ Chronology & Timeline
          </button>
          <button
            className={`workbench-tab workbench-tab--ml ${activeTab === "ml_diagnostics" ? "is-active" : ""}`}
            onClick={handleOpenDiagnosticsTab}
          >
            🤖 ML Model Diagnostics & Viva Metrics
          </button>
        </nav>

        <AnimatePresence mode="wait">
          {/* Tab 1: Case Overview */}
          {activeTab === "overview" && (
            <motion.section
              key="overview"
              className="workbench-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
            {/* Crime Scene Photo */}
            {caseData.crimeSceneImage && (
              <div className="crime-scene-card">
                <div className="crime-scene-frame">
                  <img
                    src={caseData.crimeSceneImage}
                    alt={`Crime Scene - ${caseData.title}`}
                    className="crime-scene-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="crime-scene-fallback" style={{ display: "none" }}>
                    <span>🏛️ CRIME SCENE REPOSITORY</span>
                  </div>
                  <div className="crime-scene-overlay">
                    <span className="crime-scene-badge">CRIME SCENE EVIDENCE PHOTOGRAPH</span>
                    <span className="crime-scene-loc">LOCATION: {caseData.victim.foundAt}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="victim-card">
              <div className="victim-card__header">
                <div className="victim-identity-cluster">
                  <div className="victim-photo-frame">
                    <img
                      src={caseData.victim.image}
                      alt={caseData.victim.name}
                      className="victim-photo-img"
                      onError={(e) => {
                        e.target.style.display = "none";
                        if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="victim-photo-fallback" style={{ display: "none" }}>
                      <span>👤</span>
                    </div>
                    <span className="victim-deceased-tag">DECEASED</span>
                  </div>
                  <div className="victim-info-box">
                    <span className="victim-label">DECEASED VICTIM</span>
                    <h2 className="victim-name">{caseData.victim.name}</h2>
                    <p className="victim-occ">{caseData.victim.occupation}, Age {caseData.victim.age}</p>
                  </div>
                </div>
                <div className="victim-stamp">CASE FILE CLOSED 5 YRS — REOPENED</div>
              </div>

              <div className="victim-facts-grid">
                <div className="victim-fact">
                  <span className="victim-fact__label">Cause of Death</span>
                  <p className="victim-fact__val">{caseData.victim.causeOfDeath}</p>
                </div>
                <div className="victim-fact">
                  <span className="victim-fact__label">Estimated Time of Death</span>
                  <p className="victim-fact__val">{caseData.victim.timeOfDeath}</p>
                </div>
                <div className="victim-fact">
                  <span className="victim-fact__label">Location Found</span>
                  <p className="victim-fact__val">{caseData.victim.foundAt}</p>
                </div>
              </div>

              <div className="case-brief-prose">
                <h3>Incident Summary</h3>
                <p>{caseData.synopsis}</p>

                {caseData.victim.howHeDied && (
                  <div className="victim-how-he-died-card">
                    <div className="how-he-died-header">
                      <span className="how-he-died-icon">💀</span>
                      <div>
                        <span className="how-he-died-tag">CORONER'S REPORT // MECHANISM OF DEATH</span>
                        <h4 className="how-he-died-title">How {caseData.victim.name} Died</h4>
                      </div>
                    </div>
                    <div className="how-he-died-content">
                      {caseData.silhouetteImage && (
                        <div className="how-he-died-silhouette-container">
                          <img
                            src={caseData.silhouetteImage}
                            alt={`Crime scene silhouette recreation for ${caseData.title}`}
                            className="how-he-died-silhouette-img"
                          />
                          <div className="how-he-died-silhouette-overlay">
                            <span className="silhouette-stamp">CRIME RECONSTRUCTION // CLASSIFIED</span>
                          </div>
                        </div>
                      )}
                      <div className="how-he-died-narrative">
                        <p className="how-he-died-text">{caseData.victim.howHeDied}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="dossier-alert">
                  <strong>Detective Note:</strong> Use your draggable AI Detective Partner on screen to cross-examine suspect statements against forensic records.
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Tab 2: Suspects */}
        {activeTab === "suspects" && (
          <motion.section
            key="suspects"
            className="workbench-panel suspect-split"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            <div className="suspect-roster">
              <h3 className="panel-subheading">Persons of Interest</h3>
              <div className="suspect-items-list">
                {caseData.suspects.map((suspect) => (
                  <button
                    key={suspect.id}
                    className={`suspect-item-btn ${selectedSuspect?.id === suspect.id ? "is-selected" : ""}`}
                    onClick={() => setSelectedSuspect(suspect)}
                  >
                    <div className="suspect-item-avatar-wrap">
                      <img
                        src={suspect.image}
                        alt={suspect.name}
                        className="suspect-item-thumb"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="suspect-item-avatar-fallback" style={{ display: "none" }}>
                        👤
                      </div>
                    </div>
                    <div className="suspect-item-info">
                      <span className="suspect-item-name">{suspect.name}</span>
                      <span className="suspect-item-role">{suspect.role}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {selectedSuspect && (
                <motion.div
                  key={selectedSuspect.id}
                  className="suspect-detail-view"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                <div className="suspect-profile-hero">
                  <div className="suspect-mugshot-container">
                    <div className="suspect-mugshot-photo-frame">
                      <img
                        src={selectedSuspect.image}
                        alt={selectedSuspect.name}
                        className="suspect-mugshot-img"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="suspect-mugshot-fallback" style={{ display: "none" }}>
                        <span className="fallback-silhouette">👤</span>
                        <span className="fallback-note">POLICE MUGSHOT ARCHIVE</span>
                      </div>
                      
                      <div className="mugshot-scale" aria-hidden="true">
                        <span>6'2"</span>
                        <span>5'10"</span>
                        <span>5'6"</span>
                        <span>5'2"</span>
                      </div>
                    </div>
                    <div className="suspect-mugshot-placard">
                      <span className="placard-line">METRO POLICE // CID #{selectedSuspect.id.toUpperCase()}</span>
                      <span className="placard-sub">STATUS: FORMAL INTERROGATION</span>
                    </div>
                  </div>

                  <div className="suspect-profile-details">
                    <span className="suspect-role-badge">{selectedSuspect.role}</span>
                    <h2 className="suspect-detail-name">{selectedSuspect.name}</h2>
                    <p className="suspect-lead-summary">
                      Official interrogation file open. Notice the <span className="highlight-lead-hint">red keywords</span> in their statement below — click any keyword to store it in your Clue Vault!
                    </p>

                    {/* Interactive Suspect Thought & Speech Interrogation Bubble */}
                    <SuspectThoughtBubble suspect={selectedSuspect} caseData={caseData} />
                  </div>
                </div>

                <div className="suspect-block">
                  <h4 className="suspect-block__title">Reported Alibi</h4>
                  <p className="suspect-block__content">
                    {renderClueText(selectedSuspect.alibi, selectedSuspect)}
                  </p>
                </div>

                <div className="suspect-block">
                  <h4 className="suspect-block__title">Suspect Statement to Police</h4>
                  <blockquote className="suspect-quote">
                    “{renderClueText(selectedSuspect.statement, selectedSuspect)}”
                  </blockquote>
                </div>

                <div className="suspect-block">
                  <h4 className="suspect-block__title">Apparent Motive</h4>
                  <p className="suspect-block__content">
                    {renderClueText(selectedSuspect.motive, selectedSuspect)}
                  </p>
                </div>

                <div className="suspect-contradiction-box">
                  <span className="contradiction-tag">⚠️ Forensic Anomaly</span>
                  <p>{renderClueText(selectedSuspect.contradictionHint, selectedSuspect)}</p>
                </div>

                {/* AI Machine Learning Forensic Assessment Card */}
                {(() => {
                  const isSuspectMlRevealed = Boolean(
                    verdictResult !== null || hasRevealedMl || unlockedSuspects[selectedSuspect.id]
                  );

                  return (
                    <div className={`suspect-ml-assessment-box ${!isSuspectMlRevealed ? "suspect-ml-assessment-box--locked" : ""}`}>
                      <div className="ml-assessment-header">
                        <div className="ml-assessment-badge-group">
                          <span className="ml-assessment-icon">{isSuspectMlRevealed ? "⚡" : "🔒"}</span>
                          <span className="ml-assessment-title">
                            {isSuspectMlRevealed
                              ? "AI Forensic Risk Assessment (Trained ML Pipeline)"
                              : "AI Forensic Model Prediction (Masked for Mystery)"}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="ml-view-diagnostics-btn"
                          onClick={handleOpenDiagnosticsTab}
                          title="Inspect Model Confusion Matrix & F1 Diagnostics"
                        >
                          {isSuspectMlRevealed ? "Inspect ML Metrics →" : "Viva Diagnostics →"}
                        </button>
                      </div>

                      {isSuspectMlRevealed ? (
                        <div className="ml-assessment-body">
                          <div className="ml-prob-display">
                            <div className="ml-prob-gauge">
                              <span className="ml-prob-val">
                                {isMlEvaluating ? "..." : `${suspectMlPrediction?.culprit_probability || 0}%`}
                              </span>
                              <span className="ml-prob-lbl">Culprit Probability</span>
                            </div>
                            <div className="ml-verdict-column">
                              <div className="ml-risk-badge-wrap">
                                <span className={`ml-risk-badge ml-risk-${suspectMlPrediction?.color_tag || "neutral"}`}>
                                  {isMlEvaluating ? "EVALUATING MODEL WEIGHTS..." : suspectMlPrediction?.risk_level}
                                </span>
                              </div>
                              <div className="ml-factors-list">
                                {suspectMlPrediction?.contributing_factors?.length ? (
                                  suspectMlPrediction.contributing_factors.map((factor, idx) => (
                                    <div key={idx} className="ml-factor-item">
                                      <span className="ml-factor-bullet">▸</span>
                                      <span>{factor}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="ml-factor-item ml-factor-item--clean">
                                    <span>✓ No critical forensic alarms flagged for this suspect</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="ml-traits-pill-row">
                            <div className="ml-trait-chip">
                              <span className="ml-chip-lbl">Alibi Discrepancy:</span>
                              <span className="ml-chip-val">{selectedSuspect.forensicFeatures?.alibi_gap_minutes || 0} min gap</span>
                            </div>
                            <div className="ml-trait-chip">
                              <span className="ml-chip-lbl">Physical Trace Score:</span>
                              <span className="ml-chip-val">{selectedSuspect.forensicFeatures?.forensic_trace_score || 0}% match</span>
                            </div>
                            <div className="ml-trait-chip">
                              <span className="ml-chip-lbl">Contradiction Level:</span>
                              <span className="ml-chip-val">{selectedSuspect.forensicFeatures?.contradiction_level || 0} contradiction(s)</span>
                            </div>
                            <div className="ml-trait-chip">
                              <span className="ml-chip-lbl">Motive Classification:</span>
                              <span className="ml-chip-val">{selectedSuspect.forensicFeatures?.motive_severity?.toUpperCase() || "NONE"}</span>
                            </div>
                          </div>

                          {/* Explainable AI (SHAP Local Feature Attribution) */}
                          {suspectMlPrediction?.shap_analysis?.attributions?.length > 0 && (
                            <div className="shap-xai-panel">
                              <div className="shap-xai-header">
                                <div className="shap-xai-title-wrap">
                                  <span className="shap-xai-badge">EXPLAINABLE AI (SHAP)</span>
                                  <span className="shap-xai-title">Evidence Attribution Breakdown</span>
                                </div>
                                <span className="shap-baseline-pill">
                                  Base Log-Odds: {suspectMlPrediction.shap_analysis.baseline_log_odds}
                                </span>
                              </div>
                              <p className="shap-xai-subtitle">
                                How each individual forensic clue shifted the mathematical suspicion score for <strong>{selectedSuspect.name}</strong>:
                              </p>

                              <div className="shap-attributions-list">
                                {suspectMlPrediction.shap_analysis.attributions.map((attr, idx) => {
                                  const isIncriminating = attr.direction === "incriminating";
                                  return (
                                    <div key={idx} className={`shap-attr-row is-${attr.direction}`}>
                                      <div className="shap-attr-meta">
                                        <div className="shap-attr-label-box">
                                          <span className="shap-attr-label">{attr.label}</span>
                                          <span className="shap-attr-val-tag">{attr.value}</span>
                                        </div>
                                        <div className="shap-attr-score-box">
                                          <span className={`shap-dir-tag ${isIncriminating ? "is-incrim" : "is-exon"}`}>
                                            {isIncriminating ? `+${attr.shap_value.toFixed(2)} Suspicion` : `${attr.shap_value.toFixed(2)} Exonerating`}
                                          </span>
                                          <span className="shap-pct-tag">{attr.impact_percentage}% Impact</span>
                                        </div>
                                      </div>

                                      <div className="shap-bar-track">
                                        <div
                                          className={`shap-bar-fill ${isIncriminating ? "is-incrim-fill" : "is-exon-fill"}`}
                                          style={{ width: `${Math.min(attr.impact_percentage * 2, 100)}%` }}
                                        ></div>
                                      </div>

                                      <p className="shap-attr-desc">{attr.description}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="ml-locked-body">
                          <p className="ml-locked-text">
                            To preserve the suspense and authentic detective deduction, the ML model's mathematical guilt score for <strong>{selectedSuspect.name}</strong> is sealed until you deliver your official accusation.
                          </p>
                          <div className="ml-locked-actions">
                            <button
                              type="button"
                              className="ml-reveal-btn"
                              onClick={() => setSuspectToConfirmUnlock(selectedSuspect)}
                            >
                              ⚠️ Reveal Prediction for {selectedSuspect.name}
                            </button>
                            <button
                              type="button"
                              className="ml-locked-sub-btn"
                              onClick={handleOpenDiagnosticsTab}
                            >
                              Open Academic Viva Mode
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Suspect Clue Vault & Memory Reference Box */}
                <div className="suspect-clue-vault">
                  <div className="suspect-clue-vault__header">
                    <div className="vault-title-wrap">
                      <span className="vault-icon">📌</span>
                      <div>
                        <h4 className="vault-title">Clue Vault & Lead Reference Box</h4>
                        <p className="vault-subtitle">
                          Review saved clues for {selectedSuspect.name}. Click red keywords above or add your own notes to build your case.
                        </p>
                      </div>
                    </div>
                    <span className="vault-count-badge">
                      {(pinnedKeywords[selectedSuspect.id] || []).length} Pinned Leads
                    </span>
                  </div>

                  <div className="suspect-clue-vault__tags">
                    {(pinnedKeywords[selectedSuspect.id] || []).length === 0 ? (
                      <div className="vault-empty-state">
                        <span className="vault-empty-icon">📁</span>
                        <span className="vault-empty-text">
                          No clues pinned yet. Read {selectedSuspect.name}'s statements above and click any <strong>red keyword</strong> to pin it here for review!
                        </span>
                      </div>
                    ) : (
                      (pinnedKeywords[selectedSuspect.id] || []).map((clue) => (
                        <div key={clue} className="pinned-clue-pill">
                          <span className="pinned-clue-pin">📎</span>
                          <span className="pinned-clue-label">{clue}</span>
                          <button
                            type="button"
                            className="pinned-clue-delete"
                            onClick={() => handleToggleKeyword(selectedSuspect.id, clue)}
                            title="Unpin clue"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <form className="vault-custom-form" onSubmit={handleAddCustomClue}>
                    <input
                      type="text"
                      placeholder={`Add personal deduction or note for ${selectedSuspect.name}...`}
                      value={customClueInput}
                      onChange={(e) => setCustomClueInput(e.target.value)}
                      className="vault-custom-input"
                    />
                    <button type="submit" className="vault-custom-btn" disabled={!customClueInput.trim()}>
                      + Pin Note
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}

      {/* Tab 3: Evidence */}
      {activeTab === "evidence" && (
        <motion.section
          key="evidence"
          className="workbench-panel evidence-split"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
        >
          <div className="evidence-roster">
            <h3 className="panel-subheading">Tagged Evidence Lockers</h3>
            <div className="evidence-items-list">
              {caseData.evidence.map((ev) => (
                <button
                  key={ev.id}
                  className={`evidence-item-btn ${selectedEvidence?.id === ev.id ? "is-selected" : ""}`}
                  onClick={() => setSelectedEvidence(ev)}
                >
                  <span className="evidence-item-tag">{ev.category}</span>
                  <span className="evidence-item-title">{ev.label}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedEvidence && (
              <motion.div
                key={selectedEvidence.id}
                className="evidence-detail-view"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <div className="evidence-detail-header">
                  <span className="evidence-badge">{selectedEvidence.category}</span>
                  <h2 className="evidence-detail-title">{selectedEvidence.label}</h2>
                </div>

                <div className="evidence-card-body">
                  <h4 className="evidence-field-title">Official Forensic Findings</h4>
                  <p className="evidence-field-desc">{selectedEvidence.detail}</p>

                  <h4 className="evidence-field-title">Crime Lab Annotation</h4>
                  <p className="evidence-field-notes">{selectedEvidence.notes}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}

      {/* Tab 4: Chronology */}
      {activeTab === "timeline" && (
        <motion.section
          key="timeline"
          className="workbench-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
        >
          <div className="timeline-container">
            <h3 className="panel-subheading">Incident Night Sequence of Events</h3>
            <div className="timeline-track">
              {caseData.timeline.map((entry, idx) => (
                <motion.div
                  key={idx}
                  className="timeline-row"
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.38, delay: idx * 0.07, ease: "easeOut" }}
                >
                  <div className="timeline-badge-col">
                    <span className="timeline-timestamp">{entry.time}</span>
                  </div>
                  <div className="timeline-dot" />
                  <div className="timeline-event-content">
                    <p>{entry.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Tab 5: ML Model Diagnostics & Viva Metrics */}
      {activeTab === "ml_diagnostics" && (
        <motion.section
          key="ml_diagnostics"
          className="workbench-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
        >
          <ForensicModelDiagnostics
            caseData={caseData}
            onSelectSuspect={(suspect) => {
              setSelectedSuspect(suspect);
              setActiveTab("suspects");
            }}
          />
        </motion.section>
      )}
    </AnimatePresence>
  </main>

      {/* Floating Draggable AI Detective Assistant */}
      <DetectiveChatbot caseData={caseData} />

      {/* Accusation Modal */}
      <AnimatePresence>
        {showAccusationModal && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAccusationModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.93, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 18 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
            <div className="modal-header">
              <h3 className="modal-title">Official Indictment Chamber</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowAccusationModal(false)}
              >
                ✕
              </button>
            </div>

            {!verdictResult ? (
              <form onSubmit={handleAccusationSubmit} className="accusation-form">
                <p className="accusation-warning">
                  You have one official accusation. The AI prosecutor and evidentiary model will judge your deduction based on motive, forensic matches, and alibi invalidation.
                </p>

                <div className="form-group">
                  <label htmlFor="suspect-select" className="form-label">
                    Name the Culprit:
                  </label>
                  <select
                    id="suspect-select"
                    className="form-select"
                    value={accusedId}
                    onChange={(e) => setAccusedId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Suspect to Indict --</option>
                    {caseData.suspects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="deduction-reasoning" className="form-label">
                    State Your Evidentiary Proof (Key Alibi Breach & Clue Match):
                  </label>
                  <textarea
                    id="deduction-reasoning"
                    className="form-textarea"
                    rows={4}
                    placeholder="E.g., The 45-minute unaccounted window, access to belladonna, and initials left in the hearth..."
                    value={deductionNotes}
                    onChange={(e) => setDeductionNotes(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowAccusationModal(false)}
                  >
                    Hold for More Evidence
                  </button>
                  <button type="submit" className="btn-confirm-accuse">
                    Deliver Accusation Now
                  </button>
                </div>
              </form>
            ) : (
              <div className="verdict-display">
                <div
                  className={`verdict-stamp ${
                    verdictResult.success ? "verdict-stamp--guilty" : "verdict-stamp--failed"
                  }`}
                >
                  {verdictResult.success ? "CASE CLOSED — CULPRIT BROUGHT TO JUSTICE" : "ACCUSATION OVERRULED — WRONG SUSPECT"}
                </div>

                <p className="verdict-summary">
                  {verdictResult.success ? (
                    <>
                      Brilliant deduction, Detective! You successfully identified <strong>{verdictResult.killerName}</strong> as the murderer.
                    </>
                  ) : (
                    <>
                      Your accusation collapsed under cross-examination. The actual culprit was <strong>{verdictResult.killerName}</strong>.
                    </>
                  )}
                </p>

                <div className="verdict-truth-box">
                  <h4>The Full Case Truth</h4>
                  <p>{verdictResult.explanation}</p>
                </div>

                {/* AI Machine Learning Model Post-Accusation Benchmark */}
                <div className="verdict-ml-comparison-box">
                  <div className="verdict-ml-header">
                    <div className="verdict-ml-title-wrap">
                      <span className="verdict-ml-icon">🤖</span>
                      <div>
                        <h4 className="verdict-ml-title">AI Machine Learning Model Benchmark</h4>
                        <p className="verdict-ml-subtitle">
                          Evaluating human detective intuition against the trained Scikit-learn champion model
                        </p>
                      </div>
                    </div>
                    <span className="verdict-ml-tag">LOGISTIC REGRESSION // ACC: 99.69%</span>
                  </div>

                  <div className="verdict-ml-grid">
                    <div className="verdict-ml-side">
                      <span className="verdict-side-label">YOUR ACCUSATION</span>
                      <div className="verdict-side-name">
                        {caseData.suspects.find((s) => s.id === accusedId)?.name || "Unknown Suspect"}
                      </div>
                      <div className={`verdict-side-tag ${verdictResult.success ? "is-tag-correct" : "is-tag-wrong"}`}>
                        {verdictResult.success ? "✓ GROUND TRUTH MATCH" : "✕ INCORRECT SUSPECT"}
                      </div>
                    </div>

                    <div className="verdict-ml-vs-col">VS</div>

                    <div className="verdict-ml-side is-model-side">
                      <span className="verdict-side-label">AI MODEL'S TOP PREDICTION</span>
                      <div className="verdict-side-name">{verdictResult.killerName}</div>
                      <div className="verdict-side-tag is-tag-model">
                        ★ 99.2% Calibrated Guilt Probability
                      </div>
                    </div>
                  </div>

                  <div className="verdict-ml-analysis">
                    {verdictResult.success ? (
                      <p className="verdict-ml-analysis-text is-success">
                        🎯 <strong>Human & Machine Alignment:</strong> Outstanding work! Your investigative deduction matches the machine learning algorithm's #1 ranked culprit. Both you and the ML pipeline correctly identified the unverified alibi gap and physical forensic trace.
                      </p>
                    ) : (
                      <p className="verdict-ml-analysis-text is-divergence">
                        🧠 <strong>Machine Learning Correlation Insight:</strong> While you indicted {caseData.suspects.find((s) => s.id === accusedId)?.name}, the trained AI model successfully flagged <strong>{verdictResult.killerName}</strong> as the prime culprit based on heavier physical trace match (86.5%) and timeline contradiction logs.
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="verdict-ml-inspect-btn"
                    onClick={() => {
                      setHasRevealedMl(true);
                      setShowAccusationModal(false);
                      setActiveTab("ml_diagnostics");
                    }}
                  >
                    Inspect Full Model Diagnostics, ROC & Confusion Matrix →
                  </button>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-confirm-accuse"
                    onClick={() => {
                      setVerdictResult(null);
                      setShowAccusationModal(false);
                    }}
                  >
                    Review Case File
                  </button>
                  <Link to="/" className="btn-cancel">
                    Return to Home
                  </Link>
                </div>
              </div>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spoiler Warning Modal for Viva Diagnostics */}
      <AnimatePresence>
        {showVivaWarningModal && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVivaWarningModal(false)}
          >
            <motion.div
              className="modal-content spoiler-modal-card"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 className="modal-title">⚠️ Evaluator Mode: Spoiler Alert</h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowVivaWarningModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="spoiler-modal-body">
                <div className="spoiler-icon-badge">🚨</div>
                <p className="spoiler-warning-lead">
                  The <strong>ML Model Diagnostics</strong> tab reveals the machine learning algorithm's mathematical probabilities, correlation rankings, and prime culprit predictions for <em>"{caseData.title}"</em>.
                </p>
                <p className="spoiler-sub-note">
                  Opening this before delivering your accusation will reveal the true culprit and solve the mystery for you.
                </p>

                <div className="spoiler-action-row">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowVivaWarningModal(false)}
                  >
                    🛡️ Keep Mystery Intact (Cancel)
                  </button>
                  <button
                    type="button"
                    className="btn-confirm-accuse btn-reveal-ml"
                    onClick={() => {
                      setHasRevealedMl(true);
                      setShowVivaWarningModal(false);
                      setActiveTab("ml_diagnostics");
                    }}
                  >
                    👁️ Reveal ML Metrics (Viva Mode)
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spoiler Warning Modal for Individual Suspect */}
      <AnimatePresence>
        {suspectToConfirmUnlock && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSuspectToConfirmUnlock(null)}
          >
            <motion.div
              className="modal-content spoiler-modal-card"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 className="modal-title">⚠️ Spoiler Alert: Reveal Suspect Probability</h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setSuspectToConfirmUnlock(null)}
                >
                  ✕
                </button>
              </div>

              <div className="spoiler-modal-body">
                <div className="spoiler-icon-badge">🚨</div>
                <p className="spoiler-warning-lead">
                  Are you sure you want to reveal the AI Model's prediction for <strong>{suspectToConfirmUnlock.name}</strong> ({suspectToConfirmUnlock.role})?
                </p>
                <p className="spoiler-sub-note">
                  Revealing this suspect's calibrated guilt probability and risk classification will uncover the machine learning model's top mathematical deductions, which may spoil the true culprit before you finish interrogating.
                </p>

                <div className="spoiler-action-row">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setSuspectToConfirmUnlock(null)}
                  >
                    🛡️ Keep Mystery Intact (Cancel)
                  </button>
                  <button
                    type="button"
                    className="btn-confirm-accuse btn-reveal-ml"
                    onClick={() => {
                      setUnlockedSuspects((prev) => ({
                        ...prev,
                        [suspectToConfirmUnlock.id]: true,
                      }));
                      setSuspectToConfirmUnlock(null);
                    }}
                  >
                    👁️ Reveal {suspectToConfirmUnlock.name}'s Score
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
