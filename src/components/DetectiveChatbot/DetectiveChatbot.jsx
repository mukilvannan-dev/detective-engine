import { useState, useEffect, useRef } from "react";
import "./DetectiveChatbot.css";

// Smart Dynamic Detective Engine (Pure client-side, 0 RAM overhead, 100% case-aware)
let lastFallbackIdx = -1;

function generateDetectiveResponse(query, caseData) {
  const q = query.toLowerCase().trim();
  const suspects = caseData.suspects || [];
  const evidence = caseData.evidence || [];
  const victim = caseData.victim || {};
  const timeline = caseData.timeline || [];

  // 1. Direct inquiry about who the killer is / answer spoilers
  if (
    q.includes("who did it") ||
    q.includes("who is the killer") ||
    q.includes("who killed") ||
    q.includes("who's the killer") ||
    q.includes("tell me the answer") ||
    q.includes("who is guilty") ||
    q.includes("solve it")
  ) {
    const killer = suspects.find((s) => s.id === caseData.killerId);
    return {
      text: `Hold your horses, Detective. I'm here to challenge your deductions, not do your paperwork. One of our ${suspects.length} targets has an alibi that completely crumbles against our forensic logs. Check who had physical access, who had the means, and who left their trace behind. Connect the dots.`,
      mood: "objection",
    };
  }

  // 2. Greetings & banter
  if (
    q === "hi" ||
    q === "hello" ||
    q === "hey" ||
    q.startsWith("hello ") ||
    q.startsWith("hey ") ||
    q.includes("who are you") ||
    q.includes("help me") ||
    q.includes("what should i do") ||
    q.includes("where do i start")
  ) {
    return {
      text: `Inspector Vance at your service. We're investigating "${caseData.title}". Our victim is ${victim.name || "the victim"}. I recommend pulling the autopsy findings, checking each suspect's alibi against the timeline, and examining the forensic items on file. Name any suspect or clue and I'll give you my raw assessment.`,
      mood: "speaking",
    };
  }

  // 3. Victim / Crime scene / Autopsy inquiry
  if (
    q.includes("victim") ||
    q.includes("autopsy") ||
    q.includes("cause of death") ||
    q.includes("how did") && q.includes("die") ||
    q.includes("body") ||
    (victim.name && q.includes(victim.name.toLowerCase().split(" ")[0]))
  ) {
    return {
      text: `Here's what the coroner signed off on for ${victim.name}: Cause of death is ${victim.causeOfDeath}. Estimated time of death: ${victim.timeOfDeath}. The body was located at ${victim.foundAt}. Whoever did this acted with cold precision.`,
      mood: "speaking",
    };
  }

  // 4. Timeline inquiry
  if (
    q.includes("timeline") ||
    q.includes("time") ||
    q.includes("clock") ||
    q.includes("midnight") ||
    q.includes("sequence") ||
    q.includes("when")
  ) {
    const keyEvents = timeline.slice(0, 4).map((t) => `• ${t.time}: ${t.event}`).join("\n");
    return {
      text: `Chronology is the backbone of any airtight case. Here are key milestones from the incident log:\n${keyEvents}\nNotice the tight window right around the time of death. That's where somebody's story falls apart.`,
      mood: "thinking",
    };
  }

  // 5. Suspect Inquiries (Check for each suspect dynamically!)
  for (const s of suspects) {
    const fullName = s.name.toLowerCase();
    const firstName = fullName.split(" ")[0];
    const lastName = fullName.split(" ").slice(-1)[0];
    const roleWords = s.role.toLowerCase().split(" ").filter((w) => w.length > 3);

    const matchesName = q.includes(fullName) || q.includes(firstName) || q.includes(lastName);
    const matchesRole = roleWords.some((w) => q.includes(w));

    if (matchesName || matchesRole) {
      // Check if user is accusing them
      const isAccusation =
        q.includes("killer") ||
        q.includes("guilty") ||
        q.includes("did it") ||
        q.includes("think") ||
        q.includes("suspect");

      if (isAccusation) {
        if (s.id === caseData.killerId) {
          return {
            text: `You're smelling blood on ${s.name}, Detective. And you've got good instincts. Their stated alibi ("${s.alibi}") doesn't square with the timeline: ${s.contradictionHint}. If you have the evidence to back this up, file the accusation!`,
            mood: "objection",
          };
        } else {
          return {
            text: `${s.name} certainly looks suspicious—motive: ${s.motive}. But tread carefully: while they were evasive, does the forensic evidence place them in the room at the fatal moment? Review their contradiction: ${s.contradictionHint}.`,
            mood: "thinking",
          };
        }
      }

      // Check if asking about alibi or motive or statement
      if (q.includes("alibi") || q.includes("where") || q.includes("when")) {
        return {
          text: `${s.name}'s Alibi: "${s.alibi}". But here's the crack in their story from our field notes: ${s.contradictionHint}`,
          mood: "speaking",
        };
      }

      if (q.includes("motive") || q.includes("why") || q.includes("reason")) {
        return {
          text: `Motive for ${s.name} (${s.role}): ${s.motive}. In their interrogation statement they swore: "${s.statement}". Ask yourself if that holds up against physical forensics.`,
          mood: "speaking",
        };
      }

      // General suspect profile
      return {
        text: `Regarding ${s.name} (${s.role}): Motive is "${s.motive}". They claim: "${s.statement}". However, our surveillance and field notes note: ${s.contradictionHint}`,
        mood: "speaking",
      };
    }
  }

  // 6. Evidence Inquiries (Check for each evidence item dynamically!)
  for (const ev of evidence) {
    const labelLower = ev.label.toLowerCase();
    const labelWords = labelLower.split(" ").filter((w) => w.length > 3 && !w.startsWith("#"));
    const catLower = ev.category.toLowerCase();

    const matchesLabel = labelWords.some((w) => q.includes(w)) || q.includes(labelLower);
    const matchesCat = q.includes(catLower);

    if (matchesLabel || matchesCat) {
      return {
        text: `Forensic Item [${ev.label}] (${ev.category}): "${ev.detail}". Detective's Note: ${ev.notes}`,
        mood: "objection",
      };
    }
  }

  // General Forensic & Clue Keywords
  if (q.includes("poison") || q.includes("toxin") || q.includes("chemical") || q.includes("tea") || q.includes("patch")) {
    const poisonEv = evidence.find(
      (e) =>
        e.category.toLowerCase().includes("forensic") ||
        e.category.toLowerCase().includes("toxi") ||
        e.detail.toLowerCase().includes("poison") ||
        e.detail.toLowerCase().includes("toxin")
    );
    if (poisonEv) {
      return {
        text: `On the weapon/substance: [${poisonEv.label}] confirms ${poisonEv.detail}. Note: ${poisonEv.notes}`,
        mood: "speaking",
      };
    }
  }

  // 7. Rotating Contextual Fallbacks (Ensures it never gives the exact same canned reply!)
  const fallbackReplies = [
    {
      text: `Good angle, Detective. Take a closer look at ${victim.name}'s time of death (${victim.timeOfDeath}). Who among our ${suspects.length} targets has an unaccounted gap in that exact window?`,
      mood: "thinking",
    },
    {
      text: `Let's cross-examine that thought. Have you inspected ${evidence[0]?.label || "the first forensic log"}? The contradiction in the logs points directly to someone's deceit.`,
      mood: "speaking",
    },
    {
      text: `I'm tracking your train of thought. Review the suspects' motives: ${suspects.slice(0, 2).map((s) => s.name).join(" and ")} both had strong reasons to strike, but physical evidence doesn't lie.`,
      mood: "speaking",
    },
    {
      text: `Every detail matters in ${caseData.title}. Look closely at the crime scene (${victim.foundAt}). How could the killer enter and exit without alerting security or leaving forced signs of entry?`,
      mood: "thinking",
    },
    {
      text: `Keep digging. One of the suspects gave a statement that looks airtight on paper, but directly clashes with our physical timeline. Check the contradiction notes in their profiles!`,
      mood: "speaking",
    },
  ];

  lastFallbackIdx = (lastFallbackIdx + 1) % fallbackReplies.length;
  return fallbackReplies[lastFallbackIdx];
}

export default function DetectiveChatbot({ caseData }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const initialGreeting = `Inspector Vance here. I've pulled the classified dossier for "${caseData.title}". The victim is ${caseData.victim?.name || "unidentified"}. Interrogate any suspect, cross-examine physical forensics, or probe the timeline. What's our first lead?`;

  const [messages, setMessages] = useState([
    {
      id: "intro-msg",
      sender: "detective",
      text: initialGreeting,
      mood: "idle",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [detectiveMood, setDetectiveMood] = useState("idle");
  const [displayedText, setDisplayedText] = useState(initialGreeting);
  const [isTyping, setIsTyping] = useState(false);
  const counterRef = useRef(0);

  // Position state for dragging
  const [position, setPosition] = useState({ x: 40, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const relPos = useRef({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);

  // Re-initialize greeting when case changes
  useEffect(() => {
    const greeting = `Inspector Vance on duty. Dossier loaded for "${caseData.title}". Victim: ${caseData.victim?.name}. We have ${caseData.suspects?.length || 0} suspects and ${caseData.evidence?.length || 0} forensic files. Fire away, Detective.`;
    setMessages([
      {
        id: "intro-" + caseData.id,
        sender: "detective",
        text: greeting,
        mood: "idle",
      },
    ]);
    setDisplayedText(greeting);
  }, [caseData.id]);

  // Dynamic quick inquiry chips generated from active caseData!
  const inquiryChips = [
    caseData.suspects?.[0] ? `Analyze ${caseData.suspects[0].name.split(" ")[0]}` : "Analyze suspect",
    caseData.suspects?.[1] ? `Check ${caseData.suspects[1].name.split(" ")[0]}'s alibi` : "Check alibi",
    caseData.evidence?.[0] ? `Examine ${caseData.evidence[0].label}` : "Examine evidence",
    "Review cause of death",
    "Inspect the timeline",
  ];

  // Speech function using Web Speech API
  const speakText = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.94;
    utterance.pitch = 0.85;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const deepVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Male") || v.name.includes("David") || v.name.includes("George") || v.name.includes("Natural"))
    );
    if (deepVoice) utterance.voice = deepVoice;

    utterance.onstart = () => {
      setDetectiveMood("speaking");
    };
    utterance.onend = () => {
      setDetectiveMood("idle");
    };
    utterance.onerror = () => {
      setDetectiveMood("idle");
    };

    window.speechSynthesis.speak(utterance);
  };

  // Typewriter effect for the latest detective response
  const triggerTypewriter = (fullText, mood) => {
    setIsTyping(true);
    setDisplayedText("");
    setDetectiveMood(mood || "thinking");

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < fullText.length) {
        setDisplayedText((prev) => prev + fullText.charAt(idx));
        idx++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setDetectiveMood("idle");
      }
    }, 18);

    speakText(fullText);
  };

  // Auto-scroll chat history
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedText]);

  // Dragging handlers
  const handleMouseDown = (e) => {
    // Only drag via header
    if (e.target.closest("button") || e.target.closest(".detective-chat__controls")) return;
    setIsDragging(true);
    relPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 380, e.clientX - relPos.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 200, e.clientY - relPos.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleSendMessage = (textToSend) => {
    const q = (textToSend || inputText).trim();
    if (!q || isTyping) return;

    counterRef.current += 1;
    const userMsg = {
      id: "usr-" + counterRef.current,
      sender: "user",
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setDetectiveMood("thinking");

    // Detective response
    setTimeout(() => {
      const response = generateDetectiveResponse(q, caseData);
      counterRef.current += 1;
      const detMsg = {
        id: "det-" + counterRef.current,
        sender: "detective",
        text: response.text,
        mood: response.mood,
      };

      setMessages((prev) => [...prev, detMsg]);
      triggerTypewriter(response.text, response.mood);
    }, 450);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        className="detective-launcher-btn"
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        title="Consult AI Detective Partner"
      >
        <span className="detective-launcher-badge">🕵️</span>
        <span className="detective-launcher-label">Consult Detective</span>
      </button>
    );
  }

  return (
    <aside
      ref={dragRef}
      className={`detective-chat ${isMinimized ? "is-minimized" : ""} ${isDragging ? "is-dragging" : ""}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      aria-label="AI Detective Chatbot"
    >
      {/* Draggable Header */}
      <div className="detective-chat__header" onMouseDown={handleMouseDown}>
        <div className="detective-chat__title-area">
          <span className="detective-drag-handle" title="Drag window">⠿</span>
          <div className="detective-status-dot" data-mood={detectiveMood} />
          <div>
            <h3 className="detective-name">Inspector Vance</h3>
            <span className="detective-sub">AI Detective Partner</span>
          </div>
        </div>

        <div className="detective-chat__controls">
          <button
            className={`detective-ctrl-btn ${voiceEnabled ? "is-active" : ""}`}
            onClick={() => {
              if (voiceEnabled) window.speechSynthesis?.cancel();
              setVoiceEnabled((v) => !v);
            }}
            title={voiceEnabled ? "Mute Voice" : "Enable Speech Synthesis"}
          >
            {voiceEnabled ? "🔊" : "🔇"}
          </button>
          <button
            className="detective-ctrl-btn"
            onClick={() => setIsMinimized((v) => !v)}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? "◻" : "—"}
          </button>
          <button
            className="detective-ctrl-btn"
            onClick={() => {
              window.speechSynthesis?.cancel();
              setIsOpen(false);
            }}
            title="Close Assistant"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Animated Detective Avatar & Dialogue Bubble */}
          <div className="detective-avatar-stage">
            <div className={`detective-portrait mood--${detectiveMood}`}>
              <svg
                viewBox="0 0 100 100"
                className="detective-svg"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Silhouette Backdrop */}
                <circle cx="50" cy="50" r="46" fill="#14141d" stroke="#c99a46" strokeWidth="1.5" />
                {/* Trenchcoat collar */}
                <path d="M 22 92 L 36 68 L 50 82 L 64 68 L 78 92 Z" fill="#20202d" />
                <path d="M 36 68 L 50 78 L 64 68" stroke="#c6293f" strokeWidth="2" fill="none" />
                {/* Neck & Chin */}
                <path d="M 42 66 L 58 66 L 50 78 Z" fill="#d9b69b" />
                {/* Fedora Shadow & Face */}
                <ellipse cx="50" cy="52" rx="18" ry="17" fill="#c49e85" />
                {/* Eyes with glint depending on mood */}
                <ellipse cx="44" cy="52" rx="2.5" ry="1.5" fill="#111" />
                <ellipse cx="56" cy="52" rx="2.5" ry="1.5" fill="#111" />
                {detectiveMood === "objection" && (
                  <circle cx="45" cy="51" r="1" fill="#fff" />
                )}
                {/* Trenchcoat Lapels */}
                <path d="M 28 92 L 40 68 L 48 92 Z" fill="#1c1b26" />
                <path d="M 72 92 L 60 68 L 52 92 Z" fill="#1c1b26" />
                {/* Fedora Hat */}
                <path d="M 20 42 Q 50 32 80 42 Q 50 38 20 42 Z" fill="#2c2a38" />
                <ellipse cx="50" cy="40" rx="30" ry="5" fill="#323040" />
                <path d="M 32 40 C 32 20 68 20 68 40 Z" fill="#201f2b" />
                {/* Hat Ribbon */}
                <path d="M 32 38 Q 50 36 68 38 L 68 41 Q 50 39 32 41 Z" fill="#c6293f" />
                {/* Pipe & Glowing Ember */}
                <path d="M 54 62 Q 66 64 70 56" stroke="#5a3d28" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <circle cx="70" cy="55" r="3" fill="#382416" />
                <circle cx="70" cy="55" r="1.5" className="pipe-glow" fill="#ff5a2b" />
                {/* Smoke particle */}
                <circle cx="72" cy="48" r="2" className="smoke-puff" fill="rgba(241, 238, 230, 0.4)" />
              </svg>
            </div>

            <div className="detective-speech-bubble">
              <div className="detective-mood-tag">
                {detectiveMood === "thinking" && "Cross-referencing files..."}
                {detectiveMood === "speaking" && "Inspector speaking..."}
                {detectiveMood === "objection" && "Contradiction detected!"}
                {detectiveMood === "idle" && "Observing case facts"}
              </div>
              <p className="detective-speech-text">
                {isTyping ? displayedText : messages[messages.length - 1]?.text}
                {isTyping && <span className="typewriter-cursor">|</span>}
              </p>
            </div>
          </div>

          {/* Quick Inquiry Chips */}
          <div className="detective-chips">
            {inquiryChips.map((chip) => (
              <button
                key={chip}
                className="detective-chip"
                onClick={() => handleSendMessage(chip)}
                disabled={isTyping}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat History */}
          <div className="detective-chat__body">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chat-msg ${m.sender === "user" ? "chat-msg--user" : "chat-msg--detective"}`}
              >
                <div className="chat-msg__sender">
                  {m.sender === "user" ? "Lead Detective (You)" : "Inspector Vance"}
                </div>
                <div className="chat-msg__text">{m.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="detective-chat__footer">
            <input
              type="text"
              className="detective-input"
              placeholder="Ask about a suspect, alibi, or clue..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              className="detective-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
            >
              Interrogate
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
