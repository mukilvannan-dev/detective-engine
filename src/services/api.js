/**
 * CaseMind AI - Assistant, Game Service & ML Model API Client
 *
 * Handles communication with the Detective Engine backend/ML models:
 * - Real-time ML suspect guilt probability prediction
 * - Forensic model diagnostic metrics (F1, Accuracy, Confusion Matrix)
 * - Interrogation and case verdict validation
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Check if the Python FastAPI ML backend is running.
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) return { online: false };
    const data = await response.json();
    return { online: true, ...data };
  } catch {
    return { online: false };
  }
}

/**
 * Query the champion ML model for suspect guilt probability and risk factors.
 * @param {Object} suspectFeatures
 */
export async function predictSuspectRisk(suspectFeatures) {
  try {
    const response = await fetch(`${API_BASE_URL}/predict/suspect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(suspectFeatures),
    });

    if (!response.ok) {
      throw new Error(`Inference failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("ML Model offline, calculating client-side heuristic prediction:", error);
    // Graceful offline fallback calculating calibrated estimate
    const trace = suspectFeatures.forensic_trace_score || 30;
    const gap = suspectFeatures.alibi_gap_minutes || 15;
    const contradictions = suspectFeatures.contradiction_level || 0;
    
    let prob = (trace * 0.45) + (Math.min(gap, 120) * 0.25) + (contradictions * 8);
    prob = Math.min(Math.max(prob, 5), 96);

    return {
      success: true,
      simulated: true,
      suspect_name: suspectFeatures.suspect_name || "Suspect",
      culprit_probability: Math.round(prob * 10) / 10,
      raw_probability: Math.round((prob / 100) * 1000) / 1000,
      is_predicted_culprit: prob >= 50,
      risk_level: prob >= 70 ? "CRITICAL / PRIME SUSPECT" : prob >= 40 ? "MODERATE SUSPICION" : "LOW RISK / UNLIKELY",
      color_tag: prob >= 70 ? "danger" : prob >= 40 ? "warning" : "success",
      contributing_factors: [
        trace >= 60 ? `Physical trace score detected at ${trace}%` : null,
        gap >= 30 ? `Timeline discrepancy of ${gap} minutes` : null,
        contradictions >= 2 ? `${contradictions} contradictory statements logged` : null
      ].filter(Boolean),
      shap_analysis: {
        method: "SHAP (SHapley Additive exPlanations)",
        baseline_log_odds: -4.194,
        attributions: [
          {
            feature: "forensic_trace_score",
            label: "Physical Trace Match",
            value: `${trace}%`,
            shap_value: trace >= 60 ? 5.8 : -1.2,
            direction: trace >= 60 ? "incriminating" : "exonerating",
            impact_percentage: 42.0,
            description: trace >= 60 ? "Strong physical trace match shifts model toward Culprit" : "Low physical trace acts as exonerating evidence"
          },
          {
            feature: "alibi_gap_minutes",
            label: "Alibi Timeline Gap",
            value: `${gap} min`,
            shap_value: gap >= 35 ? 2.1 : -0.8,
            direction: gap >= 35 ? "incriminating" : "exonerating",
            impact_percentage: 24.5,
            description: gap >= 35 ? "Unaccounted time window increases model suspicion" : "Tight alibi window exonerates suspect"
          },
          {
            feature: "contradiction_level",
            label: "Statement Inconsistencies",
            value: `${contradictions} items`,
            shap_value: contradictions >= 2 ? 1.8 : 0.0,
            direction: contradictions >= 2 ? "incriminating" : "exonerating",
            impact_percentage: 18.0,
            description: contradictions >= 2 ? "Flagged contradictions in interrogation statement" : "Consistent testimony across logs"
          }
        ]
      }
    };
  }
}

/**
 * Fetch ML benchmark metrics, confusion matrix, and feature importances for college viva/demo.
 */
export async function fetchModelMetrics() {
  try {
    const response = await fetch(`${API_BASE_URL}/model/metrics`);
    if (!response.ok) throw new Error("Could not fetch metrics");
    return await response.json();
  } catch (error) {
    console.warn("Could not fetch remote model metrics:", error);
    return null;
  }
}

/**
 * Fetch global SHAP summary explanations and baseline log-odds.
 */
export async function fetchShapSummary() {
  try {
    const response = await fetch(`${API_BASE_URL}/model/shap_summary`);
    if (!response.ok) throw new Error("Could not fetch SHAP summary");
    return await response.json();
  } catch (error) {
    console.warn("Could not fetch remote SHAP summary:", error);
    return null;
  }
}

/**
 * Ask the AI Detective partner for insights, timeline checks, or contradictions.
 * @param {string} caseId
 * @param {string} question
 * @param {Array<string>} discoveredClues
 */
export async function consultAssistant(caseId, question, discoveredClues = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}/assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, clues: discoveredClues }),
    });

    if (!response.ok) {
      throw new Error(`Assistant query failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("AI Assistant fallback to local simulated response:", error);
    return {
      success: true,
      simulated: true,
      response: `Reviewing notes for ${caseId}... Cross-referencing statements against physical evidence logs.`,
    };
  }
}

/**
 * Submit final accusation to the verdict model.
 * @param {string} caseId
 * @param {string} suspectName
 * @param {string} reasoning
 */
export async function submitAccusation(caseId, suspectName, reasoning) {
  try {
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}/verdict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ suspectName, reasoning }),
    });

    if (!response.ok) {
      throw new Error(`Verdict check failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Verdict check fallback:", error);
    return {
      success: true,
      simulated: true,
      verdictMatched: false,
      message: "Case submission received. Awaiting judge & jury evaluation.",
    };
  }
}

