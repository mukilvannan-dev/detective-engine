/**
 * CaseMind AI - Assistant & Game Service API Client
 *
 * Handles communication with the Detective Engine backend/ML models:
 * - Suspect interrogation queries
 * - Clue and evidence cross-examination
 * - Final verdict scoring and validation
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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
