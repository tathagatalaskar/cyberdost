import React, { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0A0E1A",
  cardBg: "#111827",
  headerBg: "#1E293B",
  cyan: "#00E5FF",
  pink: "#FF2D78",
  green: "#00FF88",
  orange: "#FF8A00",
  danger: "#FF4444",
  dangerBg: "#7F1D1D",
  textWhite: "#FFFFFF",
  textLight: "#E2E8F0",
  textGray: "#94A3B8",
  textMuted: "#475569",
  inputBg: "#1E3A5F",
  border: "#1E293B",
};

const SAMPLE_THREATS = [
  {
    input: "SBI Alert: Aapka account block ho jayega 24 ghante mein. Abhi verify karein: http://sbi-verify.tk/login",
    lang: "Hinglish",
    score: 96,
    level: "KHATARNAK",
    levelEn: "DANGEROUS",
    explanation: "Ye ek phishing SMS hai. SBI kabhi bhi aisa SMS nahi bhejta. '.tk' domain fake hai — asli SBI ka domain 'sbi.co.in' hota hai.",
    explanationEn: "This is a phishing SMS. SBI never sends such messages. The '.tk' domain is fake — real SBI uses 'sbi.co.in'.",
    reasons: [
      "Urgency + fear pattern (social engineering)",
      "Fake domain detected: sbi-verify.tk ≠ sbi.co.in",
      "Shortened/suspicious URL hiding real destination",
      "No official SBI sender ID (SBI uses 'SBIBNK')",
    ],
    action: "Is number ko block karein aur 1930 helpline par report karein.",
    actionEn: "Block this number and report on 1930 cyber helpline.",
  },
  {
    input: "Congratulations! You won ₹50,000 in Amazon Lucky Draw. Click here to claim: bit.ly/amzn-prize-claim",
    lang: "English",
    score: 91,
    level: "KHATARNAK",
    levelEn: "DANGEROUS",
    explanation: "This is a classic prize scam. Amazon does not run lucky draws via SMS or random links. The bit.ly link hides a malicious website.",
    explanationEn: "This is a classic prize scam. Amazon does not run lucky draws via SMS or random links. The bit.ly link hides a malicious website.",
    reasons: [
      "Prize/reward bait — classic social engineering",
      "Shortened bit.ly URL hiding true destination",
      "No official Amazon domain or sender verification",
      "Unsolicited message with financial lure",
    ],
    action: "Click mat karo. Turant delete karo aur sender ko block karo.",
    actionEn: "Do not click. Delete immediately and block sender.",
  },
  {
    input: "Hey, check out my new photos from the trip! photos-share.cc/album/2026",
    lang: "English",
    score: 67,
    level: "SHANKASPOD",
    levelEn: "SUSPICIOUS",
    explanation: "Ye link ek unknown domain se hai aur phishing attempt ho sakta hai jo personal message ki tarah dikha raha hai. '.cc' domain scams mein bahut use hota hai.",
    explanationEn: "This link comes from an unknown domain and could be a phishing attempt disguised as a personal message. The '.cc' domain is commonly used in scams.",
    reasons: [
      "Unknown sender with personal-sounding message",
      "Suspicious .cc domain (common in phishing)",
      "No context or prior conversation referenced",
    ],
    action: "Click karne se pehle sender ko kisi aur channel se verify karo.",
    actionEn: "Verify with the sender through another channel before clicking.",
  },
  {
    input: "Dear Customer, your KYC has expired. Update now or your account will be frozen: kyc-update-india.com/verify",
    lang: "English",
    score: 94,
    level: "KHATARNAK",
    levelEn: "DANGEROUS",
    explanation: "Ye ek KYC scam hai. Koi bhi bank ya company aapko random link bhejkar KYC update nahi karwati. Official app ya branch mein jaake hi KYC hota hai.",
    explanationEn: "This is a KYC scam. No bank or company asks you to update KYC via random links. KYC is always done through official apps or bank branches.",
    reasons: [
      "KYC fraud — most common scam in India (I4C data)",
      "Fake domain: kyc-update-india.com is not any bank's domain",
      "Urgency/threat pattern: 'account will be frozen'",
      "No personalization — generic 'Dear Customer'",
    ],
    action: "Ignore karo. Apne bank ki official app ya branch se KYC status check karo.",
    actionEn: "Ignore this. Check KYC status only through your bank's official app or branch.",
  },
  {
    input: "Aapke number pe ₹15,000 ka loan approve ho gaya hai. Abhi claim karein: loan-fast.in/claim",
    lang: "Hinglish",
    score: 89,
    level: "KHATARNAK",
    levelEn: "DANGEROUS",
    explanation: "Ye loan fraud hai. Bina apply kiye koi loan approve nahi hota. Ye link aapki personal aur banking information chura sakta hai.",
    explanationEn: "This is a loan fraud. No loan gets approved without application. This link can steal your personal and banking information.",
    reasons: [
      "Unsolicited loan offer — classic financial fraud",
      "Suspicious domain: loan-fast.in (not any bank/NBFC)",
      "No application was made by user",
      "Financial lure to extract personal data",
    ],
    action: "Link par click mat karo. 1930 par report karo aur number block karo.",
    actionEn: "Do not click. Report on 1930 helpline and block this number.",
  },
];

const ShieldIcon = ({ size = 24, color = COLORS.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18l7 3.82v4c0 4.52-3.13 8.75-7 9.93-3.87-1.18-7-5.41-7-9.93V8l7-3.82z" fill={color}/>
    <path d="M10 15.5l-3.5-3.5 1.41-1.41L10 12.67l5.59-5.59L17 8.5l-7 7z" fill={color}/>
  </svg>
);

const WarningIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill={COLORS.orange}/>
  </svg>
);

const SendIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill={COLORS.bg}/>
  </svg>
);

const TypingDots = () => {
  return (
    <div style={{ display: "flex", gap: 4, padding: "8px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: COLORS.cyan,
          animation: `cyberdost-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
        }}/>
      ))}
    </div>
  );
};

function RiskBadge({ score, level, levelEn }) {
  const bgColor = score >= 80 ? COLORS.dangerBg : score >= 50 ? "#78350F" : "#064E3B";
  const badgeColor = score >= 80 ? COLORS.danger : score >= 50 ? COLORS.orange : COLORS.green;
  return (
    <div style={{
      background: bgColor, borderRadius: "12px 12px 0 0", padding: "10px 14px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <WarningIcon />
        <span style={{ color: COLORS.orange, fontWeight: 800, fontSize: 13, fontFamily: "monospace" }}>
          {level}
        </span>
        <span style={{ color: COLORS.textGray, fontSize: 11 }}>({levelEn})</span>
      </div>
      <div style={{
        background: badgeColor, borderRadius: 20, padding: "3px 12px",
        fontWeight: 800, fontSize: 14, color: "#000", fontFamily: "monospace",
      }}>
        {score}/100
      </div>
    </div>
  );
}

function ThreatCard({ threat, lang }) {
  const isHindi = lang === "hi";
  const borderColor = threat.score >= 80 ? COLORS.orange : threat.score >= 50 ? "#D97706" : COLORS.green;
  return (
    <div style={{
      background: COLORS.cardBg, borderRadius: 12,
      border: `1px solid ${borderColor}`,
      overflow: "hidden", animation: "cyberdost-slideUp 0.4s ease-out",
    }}>
      <RiskBadge score={threat.score} level={threat.level} levelEn={threat.levelEn} />
      
      <div style={{ padding: "12px 14px" }}>
        <p style={{ color: COLORS.textLight, fontSize: 13, lineHeight: 1.6, margin: "0 0 12px 0" }}>
          {isHindi ? threat.explanation : threat.explanationEn}
        </p>

        <div style={{ marginBottom: 12 }}>
          <div style={{ color: COLORS.cyan, fontWeight: 700, fontSize: 12, marginBottom: 6, letterSpacing: 0.5 }}>
            {isHindi ? "कारण:" : "REASONS DETECTED:"}
          </div>
          {threat.reasons.map((r, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 6,
              marginBottom: 4, fontSize: 12, color: COLORS.textGray, lineHeight: 1.4,
            }}>
              <span style={{ color: COLORS.orange, fontWeight: 700, flexShrink: 0 }}>•</span>
              <span>{r}</span>
            </div>
          ))}
        </div>

        <div style={{
          background: "#0F172A", borderRadius: 8, padding: "10px 12px",
          borderLeft: `3px solid ${COLORS.green}`,
        }}>
          <span style={{ color: COLORS.green, fontWeight: 700, fontSize: 12 }}>
            {isHindi ? "क्या करें: " : "ACTION: "}
          </span>
          <span style={{ color: COLORS.textLight, fontSize: 12 }}>
            {isHindi ? threat.action : threat.actionEn}
          </span>
        </div>
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
      <div style={{
        background: COLORS.inputBg, borderRadius: "16px 16px 4px 16px",
        padding: "10px 14px", maxWidth: "85%",
        color: COLORS.textLight, fontSize: 13, lineHeight: 1.5,
        wordBreak: "break-word",
      }}>
        {text}
      </div>
    </div>
  );
}

function AiBubble({ children }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
      <div style={{ maxWidth: "95%", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <ShieldIcon size={16} />
          <span style={{ color: COLORS.cyan, fontWeight: 700, fontSize: 11 }}>CyberDost AI</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lang, setLang] = useState("hi");
  const [showWelcome, setShowWelcome] = useState(true);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const analyzeMessage = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("sbi") || lower.includes("block") || lower.includes("verify") || lower.includes("account block")) {
      return SAMPLE_THREATS[0];
    } else if (lower.includes("won") || lower.includes("prize") || lower.includes("congratulations") || lower.includes("lucky") || lower.includes("claim")) {
      return SAMPLE_THREATS[1];
    } else if (lower.includes("photo") || lower.includes(".cc") || lower.includes("trip")) {
      return SAMPLE_THREATS[2];
    } else if (lower.includes("kyc") || lower.includes("frozen") || lower.includes("expired") || lower.includes("update")) {
      return SAMPLE_THREATS[3];
    } else if (lower.includes("loan") || lower.includes("approve") || lower.includes("₹")) {
      return SAMPLE_THREATS[4];
    }
    // Default: analyze as generic phishing
    return { ...SAMPLE_THREATS[0], input: text };
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const userText = input.trim();
    setInput("");
    setShowWelcome(false);
    setMessages(prev => [...prev, { type: "user", text: userText }]);
    setIsTyping(true);

    setTimeout(() => {
      const threat = analyzeMessage(userText);
      setMessages(prev => [...prev, { type: "ai", threat: { ...threat, input: userText } }]);
      setIsTyping(false);
    }, 2000);
  };

  const handleExample = (text) => {
    setInput("");
    setShowWelcome(false);
    setMessages(prev => [...prev, { type: "user", text }]);
    setIsTyping(true);
    setTimeout(() => {
      const threat = analyzeMessage(text);
      setMessages(prev => [...prev, { type: "ai", threat: { ...threat, input: text } }]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div style={{
      width: "100%", maxWidth: 420, margin: "0 auto", height: "100vh",
      display: "flex", flexDirection: "column",
      background: COLORS.bg, fontFamily: "'Segoe UI', -apple-system, sans-serif",
      overflow: "hidden", position: "relative",
    }}>
      <style>{`
        @keyframes cyberdost-pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes cyberdost-slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cyberdost-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        input::placeholder { color: ${COLORS.textMuted}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{
        background: COLORS.headerBg, padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldIcon size={28} />
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ color: COLORS.cyan, fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>CYBER</span>
              <span style={{ color: COLORS.pink, fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>DOST</span>
            </div>
            <div style={{ color: COLORS.textGray, fontSize: 10, marginTop: -2 }}>AI Cyber-Safety Companion</div>
          </div>
        </div>
        <div style={{
          display: "flex", gap: 0, borderRadius: 20, overflow: "hidden",
          border: `1px solid ${COLORS.border}`,
        }}>
          {[["hi", "हिंदी"], ["en", "EN"]].map(([code, label]) => (
            <button key={code} onClick={() => setLang(code)} style={{
              background: lang === code ? COLORS.cyan + "22" : "transparent",
              color: lang === code ? COLORS.cyan : COLORS.textGray,
              border: "none", padding: "5px 14px", fontSize: 12, fontWeight: 700,
              cursor: "pointer", transition: "all 0.2s",
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div ref={chatRef} style={{
        flex: 1, overflowY: "auto", padding: "16px 12px",
        display: "flex", flexDirection: "column",
      }}>
        {showWelcome && (
          <div style={{ animation: "cyberdost-fadeIn 0.5s ease-out" }}>
            <div style={{ textAlign: "center", marginBottom: 24, marginTop: 20 }}>
              <ShieldIcon size={52} />
              <h2 style={{ color: COLORS.textWhite, fontSize: 20, margin: "12px 0 6px", fontWeight: 700 }}>
                {lang === "hi" ? "नमस्ते! मैं CyberDost हूं" : "Hello! I'm CyberDost"}
              </h2>
              <p style={{ color: COLORS.textGray, fontSize: 13, margin: 0, lineHeight: 1.6, padding: "0 16px" }}>
                {lang === "hi" 
                  ? "Koi bhi suspicious SMS, email, ya link paste karein — main bataunga ki wo safe hai ya nahi, aapki bhasha mein."
                  : "Paste any suspicious SMS, email, or link — I'll analyze it and tell you if it's safe or dangerous, in your language."
                }
              </p>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ color: COLORS.textGray, fontSize: 11, fontWeight: 600, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                {lang === "hi" ? "↓ Ye try karein:" : "↓ Try these examples:"}
              </div>
              {[
                "SBI Alert: Aapka account block ho jayega. Verify karein: http://sbi-verify.tk/login",
                "Congratulations! You won ₹50,000 in Amazon Lucky Draw. Claim: bit.ly/amzn-prize",
                "Dear Customer, your KYC has expired. Update now: kyc-update-india.com/verify",
                "Aapke number pe ₹15,000 ka loan approve ho gaya hai. Claim: loan-fast.in/claim",
              ].map((ex, i) => (
                <button key={i} onClick={() => handleExample(ex)} style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
                  borderRadius: 10, padding: "10px 14px", marginBottom: 8,
                  color: COLORS.textLight, fontSize: 12, cursor: "pointer",
                  lineHeight: 1.5, transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.cyan; e.currentTarget.style.background = COLORS.headerBg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = COLORS.cardBg; }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          msg.type === "user" 
            ? <UserBubble key={i} text={msg.text} />
            : <AiBubble key={i}><ThreatCard threat={msg.threat} lang={lang} /></AiBubble>
        ))}

        {isTyping && (
          <AiBubble>
            <div style={{ background: COLORS.cardBg, borderRadius: 12, padding: "10px 14px", display: "inline-block" }}>
              <div style={{ color: COLORS.textGray, fontSize: 11, marginBottom: 2 }}>
                {lang === "hi" ? "Threat analyze ho raha hai..." : "Analyzing threat..."}
              </div>
              <TypingDots />
            </div>
          </AiBubble>
        )}
      </div>

      {/* Input Bar */}
      <div style={{
        padding: "10px 12px 8px", background: COLORS.headerBg,
        borderTop: `1px solid ${COLORS.border}`, flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: COLORS.bg, borderRadius: 24,
          border: `1px solid ${COLORS.border}`, padding: "4px 4px 4px 16px",
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder={lang === "hi" ? "SMS, email, ya link paste karein..." : "Paste any SMS, email, or link..."}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: COLORS.textLight, fontSize: 13,
              fontFamily: "'Segoe UI', sans-serif",
            }}
          />
          <button onClick={handleSend} style={{
            background: isTyping ? COLORS.textGray : COLORS.cyan,
            border: "none", borderRadius: "50%", width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: isTyping ? "not-allowed" : "pointer",
            transition: "all 0.2s", flexShrink: 0,
          }}>
            <SendIcon />
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 6, paddingBottom: 2 }}>
          <span style={{ color: COLORS.textMuted, fontSize: 9 }}>
            CyberDost • KRIWA National AI Challenge 2026 • Team KRIWA-26-1102
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
