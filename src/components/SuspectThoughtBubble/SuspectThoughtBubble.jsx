import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./SuspectThoughtBubble.css";

export default function SuspectThoughtBubble({ suspect, caseData }) {
  // Balanced, mysterious in-character thoughts that preserve 100% of the mystery
  const getInitialDialogue = () => {
    return {
      speech: suspect.statement || "I have already cooperated with the investigating officers.",
      thought: `In a murder investigation, even an innocent word can be twisted into an accusation. I must choose my words with extreme caution...`,
      mood: "thoughtful",
    };
  };

  const [dialogue, setDialogue] = useState(getInitialDialogue);
  const [isThinking, setIsThinking] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [activeTab, setActiveTab] = useState("speech"); // "speech" or "thought"

  // Reset when selected suspect changes
  useEffect(() => {
    setDialogue(getInitialDialogue());
    setCustomQuestion("");
    setActiveTab("speech");
  }, [suspect.id, caseData?.id]);

  const handleAskQuestion = (type, customText = "") => {
    setIsThinking(true);

    setTimeout(() => {
      let newDialogue;

      if (type === "timeline") {
        newDialogue = {
          speech: `Regarding my whereabouts: ${suspect.alibi || "I was in my quarters as stated in the formal report."}`,
          thought: `Every second of that night is being scrutinized under a microscope. An unaccounted minute shouldn't turn someone into a suspect, but police always assume the worst.`,
          mood: "defensive",
        };
      } else if (type === "motive") {
        newDialogue = {
          speech: `Everyone in this estate had complicated dealings with the victim: ${suspect.motive || "we had our disagreements"}. But having friction is a world away from murder.`,
          thought: `I won't pretend I agreed with everything they did. But having a motive doesn't make someone a killer—half the people in this building had reasons to resent them.`,
          mood: "thoughtful",
        };
      } else if (type === "contradiction") {
        newDialogue = {
          speech: `Witness recollections in the dark are notoriously unreliable. Whatever minor anomaly you're pointing to is either a clerical error or a misunderstanding.`,
          thought: `They are trying to rattle me with conflicting testimonies. When memory and camera clocks clash, investigators always look for a scapegoat.`,
          mood: "nervous",
        };
      } else if (type === "custom") {
        const q = customText.toLowerCase();
        if (q.includes("time") || q.includes("when") || q.includes("where") || q.includes("alibi") || q.includes("hour")) {
          newDialogue = {
            speech: `I've given my exact timeline to CID: ${suspect.alibi}. You can cross-reference it with the building logs.`,
            thought: `They keep circling the timeline. If only the timestamp logs were completely unambiguous, I wouldn't have to defend myself like this.`,
            mood: "defensive",
          };
        } else if (q.includes("why") || q.includes("money") || q.includes("motive") || q.includes("will") || q.includes("debt")) {
          newDialogue = {
            speech: `My personal affairs are on record. Yes, ${suspect.motive || "there were tensions"}, but I am cooperating with this inquiry in good faith.`,
            thought: `My private financial and personal affairs have nothing to do with homicide. They are grasping at motives because they don't have hard proof.`,
            mood: "thoughtful",
          };
        } else if (q.includes("lie") || q.includes("evidence") || q.includes("contradict") || q.includes("kill") || q.includes("poison") || q.includes("weapon")) {
          newDialogue = {
            speech: `I swear on my honor, I had nothing to do with their death. Check the physical forensics—you won't find anything tying me to a crime.`,
            thought: `The detective is applying pressure to see who cracks first. I need to remain completely calm and let the evidence speak for itself.`,
            mood: "nervous",
          };
        } else {
          newDialogue = {
            speech: `Regarding "${customText}"—I've answered every official inquiry transparently. You should examine the physical crime scene evidence.`,
            thought: `Every question feels like a calculated test. I will only answer what is directly relevant to my sworn statement.`,
            mood: "thoughtful",
          };
        }
      }

      setDialogue(newDialogue);
      setIsThinking(false);
    }, 450);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customQuestion.trim() || isThinking) return;
    handleAskQuestion("custom", customQuestion.trim());
    setCustomQuestion("");
  };

  return (
    <div className="suspect-interrogation-bubble-container">
      {/* Speech / Thought Bubble Frame */}
      <div className="interrogation-bubble-wrapper">
        <div className="bubble-pointer-tail" aria-hidden="true" />
        
        <div className={`bubble-card is-mood-${dialogue.mood}`}>
          {/* Bubble Header / Mode Selector */}
          <div className="bubble-header">
            <div className="bubble-mode-tabs">
              <button
                type="button"
                className={`bubble-mode-btn ${activeTab === "speech" ? "is-active" : ""}`}
                onClick={() => setActiveTab("speech")}
              >
                💬 Spoken Statement
              </button>
              <button
                type="button"
                className={`bubble-mode-btn bubble-mode-btn--thought ${activeTab === "thought" ? "is-active" : ""}`}
                onClick={() => setActiveTab("thought")}
              >
                💭 Subconscious Thought
              </button>
            </div>

            <span className={`suspect-mood-badge is-mood-${dialogue.mood}`}>
              {dialogue.mood.toUpperCase()}
            </span>
          </div>

          {/* Bubble Content Body */}
          <div className="bubble-body">
            <AnimatePresence mode="wait">
              {isThinking ? (
                <motion.div
                  key="thinking"
                  className="bubble-thinking-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="thinking-dot"></span>
                  <span className="thinking-dot"></span>
                  <span className="thinking-dot"></span>
                  <span className="thinking-text">{suspect.name} is hesitating...</span>
                </motion.div>
              ) : activeTab === "speech" ? (
                <motion.div
                  key="speech"
                  className="bubble-text-box"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="bubble-speech-quote">
                    “{dialogue.speech}”
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="thought"
                  className="bubble-text-box bubble-text-box--thought"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="thought-tag">INTERNAL MONOLOGUE (PRIVATE):</span>
                  <p className="bubble-thought-text">
                    <em>“{dialogue.thought}”</em>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Interrogation Prompts */}
          <div className="bubble-prompt-section">
            <span className="prompt-section-lbl">INTERROGATE SUSPECT ON:</span>
            <div className="bubble-quick-prompts">
              <button
                type="button"
                className="prompt-chip"
                onClick={() => handleAskQuestion("timeline")}
                disabled={isThinking}
              >
                ⏱️ Verified Timeline
              </button>
              <button
                type="button"
                className="prompt-chip"
                onClick={() => handleAskQuestion("motive")}
                disabled={isThinking}
              >
                🩸 Dispute & Motive
              </button>
              <button
                type="button"
                className="prompt-chip"
                onClick={() => handleAskQuestion("contradiction")}
                disabled={isThinking}
              >
                ⚠️ Inconsistencies
              </button>
            </div>

            {/* Custom Question Form */}
            <form onSubmit={handleCustomSubmit} className="bubble-custom-query-form">
              <input
                type="text"
                className="bubble-query-input"
                placeholder={`Ask ${suspect.name} a question...`}
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                disabled={isThinking}
                maxLength={90}
              />
              <button
                type="submit"
                className="bubble-query-submit-btn"
                disabled={isThinking || !customQuestion.trim()}
              >
                Inquire ➔
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
