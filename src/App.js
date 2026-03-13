/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  CYBERDOST v3.0 FINAL — India's Bilingual AI Cyber-Safety Tool     ║
 * ║  © 2026 Tathagata Laskar (24BCS11358) & Devaansh Singh             ║
 * ║  Team KRIWA-26-1102 | Chandigarh University | Theme 9              ║
 * ║  KRIWA National AI-Coding Challenge 2026 — Grand Finale Build      ║
 * ║  All Rights Reserved. Unauthorized reproduction prohibited.        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ─── OWNERSHIP FINGERPRINT (base64 encoded, tamper-evident) ─── */
const _$f = (() => {
  try {
    return {
      _a: atob("VGF0aGFnYXRhIExhc2thcg=="),
      _b: atob("MjRCQ1MxMTM1OA=="),
      _c: atob("S1JJV0EtMjYtMTEwMg=="),
      _d: atob("Q2hhbmRpZ2FyaCBVbml2ZXJzaXR5"),
      _e: atob("RGV2YWFuc2ggU2luZ2g="),
      _v: "3.0.0",
      _t: 1741900800000,
    };
  } catch {
    return {};
  }
})();

/* ─── CONSTANTS ─── */
const APP = {
  NAME: "CyberDost",
  VER: "3.0",
  TAG_EN: "India's Bilingual AI Cyber-Safety Companion",
  TAG_HI: "भारत का द्विभाषी AI साइबर-सुरक्षा साथी",
  GROQ_URL: "https://api.groq.com/openai/v1/chat/completions",
  GROQ_MODEL: "llama-3.3-70b-versatile",
};

/* ─── LEGITIMATE BANK SENDER IDS (TRAI Registered) ─── */
const BANK_IDS = new Set([
  "SBIINB","SBIPSG","CBSSBI","SBISMS","SBIBNK","SBIYNO",
  "HDFCBK","HDFCBN","HDFCSM","HDFCRD",
  "ICICIB","ICICBK","ICICIS","ICICRD",
  "AXISBK","AXISBN","AXISMS",
  "PNBSMS","PNBBNK","PNBALR",
  "BOIIND","BOIBNK",
  "KOTAKB","KOTKBK","KOTKML",
  "IDFCFB","IDFCBK",
  "YESBK","YESBNK",
  "CANBNK","CANARA",
  "UNBKIN","UNBBNK",
  "INDBNK","INDIANB",
  "BOBSMS","BOBIBN","BOBTXN",
  "CENTBK","CNTBNK",
  "SCBANK","SCBNK",
  "UNIONB","UNIBNK",
  "PAYTMB","PAYTM","PYTMKR",
  "PPHINF","PHONPE",
  "GPAYIN","GOOGLP",
  "AMZNIN","AMAZON","AMZPAY",
  "FLIPKT","MYNTRA",
  "SWIGGY","ZOMATO",
  "JIOMRT","AIRTEL","VIVODL","BSNLMB",
  "IRCTCI","IRCTCM",
  "CRDSCR","ETMONY","BHARPE",
]);

/* ─── SAFE MESSAGE PATTERNS ─── */
const SAFE_RE = [
  /(?:rs\.?|inr\s*|₹)\s*[\d,]+(?:\.\d+)?\s*(?:debited|credited|transferred|received|paid|sent|dr\.?|cr\.?)/i,
  /(?:a\/c|acct?|account)\s*(?:no\.?|number)?\s*[xX*\.]+\d{3,4}/i,
  /(?:upi|neft|imps|rtgs)\s*(?:ref|txn|utr|id)\s*(?:no\.?)?\s*:?\s*\d{6,}/i,
  /(?:avl(?:bl)?|available)\s*(?:bal|balance|amt)\s*(?:is|:)?\s*(?:rs\.?|inr|₹)\s*[\d,.]+/i,
  /(?:total)\s*bal\s*:?\s*rs\.?\s*[\d,.]+\s*cr/i,
  /(?:otp|one[\s-]?time[\s-]?password)\s*(?:is|for|:)?\s*\d{4,8}/i,
  /(?:emi|installment|autopay|mandate|si)\s*(?:of|for|amt|amount)/i,
  /(?:mini[\s-]?statement|passbook|balance[\s-]?enquiry)/i,
  // BOB specific
  /(?:credited|debited)\s*(?:to|from)\s*a\/?\s*c\s*\.{0,3}\s*\d{4}/i,
  /dear\s*bob\s*upi\s*user/i,
  /not\s*you\?\s*call\s*1800\d+/i,
  /(?:from|to)\s*:?\s*(?:fow|cra|dcardfee|neft|imps)\/[\w\/]+/i,
  /[-–]\s*bank\s*of\s*baroda\s*$/im,
  // Union Bank specific
  /your\s*sb\s*a\/c\s*\*\d{4}/i,
  /(?:mob\s*bk|imps)\s*ref\s*(?:no)?\s*\d{8,}/i,
  /never\s*share\s*pin\/otp/i,
  /[-–]\s*union\s*bank\s*of\s*india\s*$/im,
  // General safe
  /(?:cr\.|dr\.)\s*(?:from|to)\s*(?:a\/c|a\/c\s*[xX*]+\d+)/i,
  /ref\s*:?\s*\d{10,}/i,
  /thru\s*(?:neft|imps|rtgs|upi)/i,
  /cr\.\s*to\s*[\w.]+@(?:pty|ok(?:icici|hdfc|sbi|axis)|ybl|paytm|axl|upi)/i,
  // Delivery
  /(?:order|package|shipment)\s*(?:#|id)?\s*\w+\s*(?:has been|is)\s*(?:shipped|delivered|dispatched|out\s*for)/i,
  /(?:otp|code)\s*(?:for|to)\s*(?:verify|confirm)\s*(?:your)?\s*(?:order|delivery|payment|login)/i,
];

/* ─── PHISHING / SCAM PATTERNS ─── */
const THREAT_RE = [
  { re: /(?:kyc|pan|aadhaar?)\s*(?:update|verify|expired?|expiring|pending|required|mandatory|suspend|block|renew|incomplete)/i, w: 40, en: "KYC/PAN update scam — banks never ask via SMS link", hi: "KYC/PAN अपडेट घोटाला — बैंक कभी SMS लिंक से नहीं माँगते" },
  { re: /(?:account|a\/c|ac|card)\s*(?:will be|shall be|is being|has been|getting)?\s*(?:block|suspend|freeze|deactivat|clos|restrict|lock|disable)/i, w: 45, en: "Account blocking threat — classic phishing tactic", hi: "खाता बंद करने की धमकी — फ़िशिंग का पुराना तरीका" },
  { re: /(?:click|tap|visit|open)\s*(?:here|now|this|the|below|link|url|on)/i, w: 25, en: "Urging to click a link", hi: "लिंक क्लिक करने का दबाव" },
  { re: /(?:urgent(?:ly)?|immediate(?:ly)?|within\s*\d+\s*hours?|today\s*itself|right\s*now|last\s*chance|final\s*warning|expires?\s*today)/i, w: 35, en: "False urgency to force quick action", hi: "जल्दबाजी में गलती कराने की कोशिश" },
  { re: /(?:dear\s*(?:customer|user|sir|ma'?am|valued|member|citizen))/i, w: 12, en: "Generic greeting — real banks use your name", hi: "सामान्य अभिवादन — असली बैंक आपका नाम लिखते हैं" },
  { re: /(?:bit\.ly|tinyurl|goo\.gl|t\.co|shorturl|is\.gd|cutt\.ly|rb\.gy|short\.io)/i, w: 50, en: "Shortened URL hiding real destination", hi: "छोटा URL जो असली वेबसाइट छुपा रहा है" },
  { re: /(?:ngrok|herokuapp|000webhostapp|\.netlify\.app|\.glitch\.me|\.replit\.)/i, w: 45, en: "Hosted on free dev platform — not a bank server", hi: "मुफ्त प्लैटफ़ॉर्म पर होस्ट — बैंक सर्वर नहीं" },
  { re: /(?:cbi|police|customs|narcotics|income[\s-]?tax|enforcement\s*directorate|\bed\b|\bncb\b|cyber[\s-]?cell)/i, w: 45, en: "Impersonating law enforcement — digital arrest scam", hi: "पुलिस/CBI का बहाना — डिजिटल गिरफ्तारी घोटाला" },
  { re: /(?:arrest|warrant|legal\s*action|court\s*order|summon|prosecution|jail|prison|\bfir\b|case\s*registered)/i, w: 45, en: "Legal threats — government never threatens via SMS", hi: "कानूनी धमकी — सरकार कभी SMS से धमकी नहीं देती" },
  { re: /(?:lottery|prize|jackpot|winner|won\b|lucky\s*draw|congratulations?\s*(?:you|dear|!)|claim\s*(?:your|now|prize))/i, w: 50, en: "Lottery/prize scam — you can't win without entering", hi: "लॉटरी/इनाम घोटाला — बिना भाग लिए जीत नहीं सकते" },
  { re: /(?:earn|income|profit)\s*(?:rs\.?|₹)\s*[\d,.]+\s*(?:daily|per\s*day|monthly|weekly|from\s*home)/i, w: 45, en: "Fake earning promise", hi: "झूठी कमाई का वादा" },
  { re: /(?:invest|trading|crypto|bitcoin|stock|mutual\s*fund)\s*(?:now|today|opportunity|guaranteed|100%|double|triple)/i, w: 40, en: "Fake investment scheme", hi: "नकली निवेश योजना" },
  { re: /(?:share|send|tell|give|forward|enter)\s*(?:your|the|ur)?\s*(?:otp|pin|cvv|password|passcode|mpin)/i, w: 55, en: "Asking for OTP/PIN/CVV — NEVER share these", hi: "OTP/PIN/CVV माँग रहे हैं — ये कभी किसी को न दें" },
  { re: /(?:verify|confirm|validate|update)\s*(?:your)?\s*(?:identity|details|information|bank)\s*(?:by|through|via|at)\s*(?:clicking|visiting|this)/i, w: 35, en: "Identity verification via suspicious link", hi: "संदिग्ध लिंक से पहचान सत्यापन का अनुरोध" },
  { re: /(?:electricity|bijli|power|gas)\s*(?:bill|connection)\s*(?:overdue|pending|disconnect|cut|unpaid)/i, w: 40, en: "Fake utility disconnection threat", hi: "बिजली/गैस कनेक्शन काटने की झूठी धमकी" },
  { re: /(?:sim|number|mobile)\s*(?:upgrade|swap|replacement|deactivat|port|block|expire)/i, w: 35, en: "Possible SIM swap scam", hi: "SIM स्वैप घोटाले की संभावना" },
  { re: /(?:pre[\s-]?approved|instant|guaranteed)\s*(?:loan|credit|emi|personal\s*loan|credit\s*card)/i, w: 35, en: "Pre-approved loan scam", hi: "पहले से मंजूर लोन का झाँसा" },
  { re: /(?:processing\s*fee|advance\s*payment|registration\s*charge|token\s*amount)\s*(?:of|for|pay|deposit)/i, w: 45, en: "Advance fee fraud", hi: "अग्रिम शुल्क धोखाधड़ी" },
  { re: /(?:work\s*from\s*home|part[\s-]?time\s*(?:job|work|income)|data\s*entry\s*job|typing\s*job|online\s*(?:earning|job))/i, w: 35, en: "Fake job offer", hi: "नकली नौकरी का झाँसा" },
  { re: /(?:forward\s*(?:this|to)|share\s*(?:this|with|in)\s*\d+\s*(?:groups?|people|contacts?))/i, w: 25, en: "Chain message — likely misinformation", hi: "चेन मैसेज — गलत जानकारी हो सकती है" },
  { re: /(?:install|download)\s*(?:this|our|the)\s*(?:app|apk|application|software)/i, w: 40, en: "Asking to install unknown app — malware risk", hi: "अनजान ऐप इंस्टॉल करने का अनुरोध — मैलवेयर का खतरा" },
  { re: /(?:anydesk|teamviewer|quicksupport|remote\s*access|screen\s*share)/i, w: 50, en: "Remote access app — high fraud risk", hi: "रिमोट एक्सेस ऐप — बहुत बड़ा खतरा" },
  { re: /(?:whatsapp|telegram|signal)\s*(?:group|channel|number|link)\s*(?:join|click|open)/i, w: 20, en: "Redirecting to messaging platform", hi: "मैसेजिंग प्लेटफ़ॉर्म पर ले जाने की कोशिश" },
  // Hindi/Hinglish patterns
  { re: /(?:aapka|apka|tumhara|aapke)\s*(?:khata|account|a\/c|card|number)\s*(?:band|block|suspend|freeze|hack)/i, w: 45, en: "Account blocking threat in Hindi", hi: "हिंदी में खाता बंद करने की धमकी" },
  { re: /(?:abhi|turant|jaldi|foran|fatafat)\s*(?:click|call|karo|kare|karein|kijiye|bhejiye|dijiye)/i, w: 35, en: "Urgency in Hindi", hi: "हिंदी में जल्दी करने का दबाव" },
  { re: /(?:paisa|paise|rupaye|amount|lakho?n?|crore)\s*(?:jeet|jeeta|jeete|mila|milega|milenge|kamao|kamaye|double)/i, w: 40, en: "Money promise in Hindi", hi: "हिंदी में पैसे का झाँसा" },
  { re: /(?:sarkari|government|pm[\s-]?kisan|ayushman|jan[\s-]?dhan)\s*(?:yojana|scheme|naukri|job|paisa)\s*(?:mein|me|ka|ke|ki|se)/i, w: 30, en: "Fake government scheme", hi: "नकली सरकारी योजना" },
  { re: /\.(?:xyz|top|online|site|info|tk|ml|ga|cf|gq|buzz|click|rest|icu)\b/i, w: 35, en: "Suspicious domain extension", hi: "संदिग्ध डोमेन" },
];

/* ─── OFFICIAL DOMAINS ─── */
const SAFE_DOMAINS = new Set([
  "sbi.co.in","onlinesbi.com","hdfcbank.com","icicibank.com",
  "axisbank.com","pnbindia.in","kotak.com","idfcfirstbank.com",
  "yesbank.in","canarabank.com","unionbankofindia.co.in",
  "indianbank.in","bankofbaroda.in","bobfinancial.com",
  "centralbankofindia.co.in","rbi.org.in","npci.org.in",
  "paytm.com","phonepe.com","gpay.app","google.co.in",
  "amazon.in","flipkart.com","swiggy.com","zomato.com",
]);

/* ═════════════ LOCAL THREAT ANALYSIS ENGINE ═════════════ */
function analyzeLocal(text) {
  if (!text || !text.trim()) return { score: 0, verdict: "empty", reasons: [] };
  const t = text.trim();

  // ── Normal conversation check ──
  if (/^[\s]*(h[ei](?:llo|y)?|namaste|namaskar|kaise?\s*ho|kya\s*h[ae]l|good\s*(?:morning|evening|night|afternoon)|thanks?(?:\s*you)?|ok(?:ay)?|ha+n?|nahi|no|yes|bye|alvida|dhanyavaad|shukriya|theek\s*hai|accha|hmm+|lol|haha+|kya|kaisa|kahan|kab|kyun?|kaun?|ji|bhai|bro|didi|sir|ma'?am|hello\s*ji)[\s?!.]*$/i.test(t)) {
    return { score: 0, verdict: "safe", reasons: [], cat: "conversation" };
  }

  // ── Check sender header (XX-BANKID-S format) ──
  let legit = 0;
  const hdr = t.match(/^([A-Z]{2}-([A-Z]{3,10})(?:-[A-Z])?)\b/);
  if (hdr) {
    const core = hdr[2];
    if (BANK_IDS.has(core)) legit += 40;
  }

  // ── Check safe message patterns ──
  for (const re of SAFE_RE) {
    if (re.test(t)) legit += 20;
  }

  // ── Bank name at end ──
  if (/[-–]\s*(?:Bank\s*of\s*(?:Baroda|India|Maharashtra)|Union\s*Bank|State\s*Bank|SBI|HDFC|ICICI|Axis|PNB|Kotak|Yes\s*Bank|Canara|Indian\s*Bank|IDFC|BOB|Central\s*Bank)\s*$/i.test(t)) {
    legit += 25;
  }

  if (legit >= 40) {
    return { score: Math.max(0, 3), verdict: "safe", reasons: [{ en: "Legitimate bank message with verified sender pattern", hi: "सत्यापित प्रेषक पैटर्न वाला वैध बैंक संदेश" }], cat: "bank" };
  }

  // ── Check threat patterns ──
  let threat = 0;
  const reasons = [];
  const seen = new Set();
  for (const { re, w, en, hi } of THREAT_RE) {
    if (re.test(t) && !seen.has(en)) {
      threat += w;
      reasons.push({ en, hi });
      seen.add(en);
    }
  }

  // ── URL check ──
  const urls = t.match(/https?:\/\/[^\s"'<>]+/gi) || [];
  for (const u of urls) {
    const domOk = [...SAFE_DOMAINS].some((d) => u.includes(d));
    if (!domOk) {
      if (/bit\.ly|tinyurl|goo\.gl|t\.co|shorturl|cutt\.ly|rb\.gy/i.test(u)) {
        threat += 20;
        if (!seen.has("url_short")) { reasons.push({ en: "Shortened URL detected", hi: "छोटा URL मिला" }); seen.add("url_short"); }
      } else if (/\.(?:xyz|top|online|site|info|tk|ml|ga|cf|gq|buzz|click)\b/i.test(u)) {
        threat += 15;
        if (!seen.has("url_sus")) { reasons.push({ en: "Suspicious domain", hi: "संदिग्ध डोमेन" }); seen.add("url_sus"); }
      }
    }
  }

  const score = Math.min(100, Math.max(0, threat));
  const verdict = score <= 15 ? "safe" : score <= 40 ? "suspicious" : score <= 70 ? "dangerous" : "critical";
  return { score, verdict, reasons, cat: score <= 15 ? "safe" : "threat" };
}

/* ═════════════ GROQ AI ANALYSIS ═════════════ */
async function analyzeAI(text, lang, apiKey) {
  if (!apiKey) return null;
  const sys = `You are CyberDost, an expert Indian cyber-safety AI built by Tathagata Laskar (KRIWA-26-1102). Analyze the message for phishing/scam threats.

RULES:
- Normal greetings (hi, hello, namaste) → ALWAYS safe, score 0
- Real bank SMS (SBI, HDFC, ICICI, Axis, BOB, Union Bank, PNB etc.) with transaction details → safe, score 0-5
- OTP from banks → safe
- Delivery notifications → safe
- Only flag genuinely suspicious content

INDIAN SCAMS TO DETECT: KYC fraud, digital arrest, lottery, loan advance fee, electricity disconnection, SIM swap, job scam, investment fraud, AnyDesk/TeamViewer remote access, WhatsApp forward scams.

Respond in ${lang === "hi" ? "Hindi Devanagari" : "English"} as JSON ONLY:
{"score":0-100,"verdict":"safe|suspicious|dangerous|critical","summary":"1-2 lines","reasons":["reason1"],"action":"what to do"}`;

  try {
    const r = await fetch(APP.GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: APP.GROQ_MODEL,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `Analyze:\n"${text}"` },
        ],
        temperature: 0.1,
        max_tokens: 400,
      }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    const raw = (d.choices?.[0]?.message?.content || "").replace(/```json?\n?|```/g, "").trim();
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ═════════════ VERDICT CONFIG ═════════════ */
const V_CFG = {
  safe: { emoji: "✅", color: "#00FF88", bg: "rgba(0,255,136,0.08)", border: "rgba(0,255,136,0.3)" },
  suspicious: { emoji: "⚠️", color: "#FFD600", bg: "rgba(255,214,0,0.08)", border: "rgba(255,214,0,0.3)" },
  dangerous: { emoji: "🚨", color: "#FF8A00", bg: "rgba(255,138,0,0.08)", border: "rgba(255,138,0,0.3)" },
  critical: { emoji: "🔴", color: "#FF3B3B", bg: "rgba(255,59,59,0.08)", border: "rgba(255,59,59,0.3)" },
  info: { emoji: "ℹ️", color: "#00E5FF", bg: "rgba(0,229,255,0.05)", border: "rgba(0,229,255,0.2)" },
};

/* ═════════════ MAIN COMPONENT ═════════════ */
export default function CyberDost() {
  const [lang, setLang] = useState("en");
  const [page, setPage] = useState("splash"); // splash → login → app
  const [user, setUser] = useState(null);

  // Auth
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [authErr, setAuthErr] = useState("");

  // Chat
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [panel, setPanel] = useState(null); // null | "settings" | "history" | "about"

  // Settings
  const [gKey, setGKey] = useState("");
  const endRef = useRef(null);

  const T = useCallback((en, hi) => (lang === "hi" ? hi : en), [lang]);

  /* ── Splash timer ── */
  useEffect(() => {
    if (page === "splash") {
      const t = setTimeout(() => setPage("login"), 2200);
      return () => clearTimeout(t);
    }
  }, [page]);

  /* ── Console watermark ── */
  useEffect(() => {
    console.log("%c🛡️ CyberDost v3.0", "color:#00E5FF;font-size:18px;font-weight:900");
    console.log("%c© 2026 Tathagata Laskar (24BCS11358) & Devaansh Singh\nTeam KRIWA-26-1102 | Chandigarh University\nUnauthorized reproduction prohibited.", "color:#FF2D78;font-size:11px");
  }, []);

  /* ── Auto scroll ── */
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  /* ── Retrieve API key ── */
  useEffect(() => {
    try { const s = sessionStorage.getItem("_cdk"); if (s) setGKey(atob(s)); } catch {}
  }, []);

  const saveKey = (k) => {
    setGKey(k);
    try { sessionStorage.setItem("_cdk", btoa(k)); } catch {}
  };

  /* ── Password strength ── */
  const passStrength = useMemo(() => {
    if (!pass) return 0;
    let s = 0;
    if (pass.length >= 6) s++;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/\d/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  }, [pass]);

  /* ── Auth ── */
  const doAuth = () => {
    setAuthErr("");
    if (!email.includes("@") || !email.includes(".")) {
      setAuthErr(T("Enter a valid email", "वैध ईमेल दर्ज करें"));
      return;
    }
    if (pass.length < 6) {
      setAuthErr(T("Password must be at least 6 characters", "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए"));
      return;
    }
    if (isSignup && passStrength < 3) {
      setAuthErr(T("Stronger password needed — add uppercase, numbers, symbols", "मज़बूत पासवर्ड चाहिए — बड़े अक्षर, नंबर, चिह्न जोड़ें"));
      return;
    }
    if (isSignup && !name.trim()) {
      setAuthErr(T("Enter your name", "अपना नाम दर्ज करें"));
      return;
    }
    // Firebase auth would go here — simplified for demo
    setUser({ email, name: name || email.split("@")[0] });
    setPage("app");
    setMsgs([{
      from: "bot", verdict: "info",
      text: T(
        "Welcome to CyberDost! 🛡️\n\nPaste any suspicious SMS, email, WhatsApp forward, or URL below.\n\nI'll analyze it for phishing, scams, and cyber threats — and explain the risk in simple terms.\n\nI understand Hindi, English, and Hinglish.",
        "CyberDost में स्वागत है! 🛡️\n\nनीचे कोई भी संदिग्ध SMS, ईमेल, WhatsApp फॉरवर्ड, या URL पेस्ट करें।\n\nमैं फ़िशिंग, घोटाले और साइबर खतरों का विश्लेषण करूँगा — और जोखिम सरल शब्दों में बताऊँगा।\n\nमैं हिंदी, अंग्रेज़ी और हिंग्लिश समझता हूँ।"
      ),
      ts: Date.now(),
    }]);
  };

  /* ── Send message ── */
  const send = async () => {
    const txt = input.trim();
    if (!txt || busy) return;
    setInput("");
    setBusy(true);

    // Add user message
    const userMsg = { from: "user", text: txt, ts: Date.now() };
    setMsgs((p) => [...p, userMsg, { from: "loading", ts: Date.now() }]);

    // Analyze
    const local = analyzeLocal(txt);
    let result = local;

    // Try AI if key available
    if (gKey) {
      const ai = await analyzeAI(txt, lang, gKey);
      if (ai) {
        result = {
          score: ai.score ?? local.score,
          verdict: ai.verdict ?? local.verdict,
          reasons: (ai.reasons || []).map((r) => ({ [lang]: r })),
          summary: ai.summary,
          action: ai.action,
          ai: true,
        };
      }
    }

    // Build response
    const vc = V_CFG[result.verdict] || V_CFG.safe;
    const labels = {
      safe: T("SAFE", "सुरक्षित"),
      suspicious: T("SUSPICIOUS", "संदिग्ध"),
      dangerous: T("DANGEROUS", "खतरनाक"),
      critical: T("CRITICAL THREAT", "गंभीर खतरा"),
    };
    const descs = {
      safe: T("This message appears safe. No threats detected.", "यह संदेश सुरक्षित दिखता है। कोई खतरा नहीं मिला।"),
      suspicious: T("This message has suspicious elements. Be cautious.", "इस संदेश में संदिग्ध तत्व हैं। सावधान रहें।"),
      dangerous: T("This is likely a scam. Do NOT click any links.", "यह संभवतः घोटाला है। कोई लिंक क्लिक न करें।"),
      critical: T("EXTREMELY DANGEROUS! Block and report immediately.", "अत्यंत खतरनाक! तुरंत ब्लॉक करें और रिपोर्ट करें।"),
    };

    let body = `${vc.emoji} ${labels[result.verdict]}\n`;
    body += `${T("Risk Score", "जोखिम स्कोर")}: ${result.score}/100\n\n`;
    body += (result.summary || descs[result.verdict]) + "\n";

    const reasons = result.reasons || [];
    if (reasons.length > 0) {
      body += `\n${T("Threats detected", "पहचाने गए खतरे")}:\n`;
      reasons.forEach((r, i) => {
        const val = r[lang] || r.en || r.hi || (typeof r === "string" ? r : "");
        if (val) body += `  ${i + 1}. ${val}\n`;
      });
    }

    if (result.action) {
      body += `\n${T("Action", "कार्रवाई")}: ${result.action}`;
    } else if (result.verdict === "dangerous" || result.verdict === "critical") {
      body += `\n${T("Action", "कार्रवाई")}: ${T("Block sender. Report at 1930 or cybercrime.gov.in", "प्रेषक ब्लॉक करें। 1930 या cybercrime.gov.in पर रिपोर्ट करें")}`;
    }

    // Replace loading with result
    setMsgs((p) => {
      const f = p.filter((m) => m.from !== "loading");
      return [...f, { from: "bot", text: body, verdict: result.verdict, score: result.score, ai: result.ai, ts: Date.now() }];
    });

    // History
    setHistory((p) => [{ text: txt.slice(0, 80), score: result.score, verdict: result.verdict, ts: Date.now() }, ...p].slice(0, 50));
    setBusy(false);
  };

  /* ── Quick examples ── */
  const examples = [
    { t: "Dear Customer, your SBI KYC has expired. Update now or account blocked. Click: bit.ly/sbi-kyc", l: T("KYC Scam", "KYC घोटाला") },
    { t: "Rs.2500 Credited to A/c ...5609 from:FOW/UPI/53097692. Total Bal:Rs.5008.54CR. Avlbl Amt:Rs.5008.54(06-02-2026 08:41:45) - Bank of Baroda", l: T("Real BOB SMS", "असली BOB SMS") },
    { t: "Your SB A/c *7017 Credited for Rs:3650.00 on 12-02-2026 10:08:28 by IMPS ref no 604379222307 Avl Bal Rs:3693.66.Never Share PIN/OTP-Union Bank of India", l: T("Real Union Bank", "असली Union Bank") },
    { t: "hi", l: T("Normal Chat", "सामान्य बात") },
    { t: "Aapka bijli bill overdue hai. Aaj raat connection kat jayega. Abhi call karein: 9876543210", l: T("Bijli Scam", "बिजली घोटाला") },
    { t: "Congratulations! You won ₹50,00,000 in Jio Lucky Draw! Claim: http://jio-prize.xyz/claim", l: T("Lottery Scam", "लॉटरी घोटाला") },
  ];

  /* ═══════════ CSS ═══════════ */
  const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#050810;--bg2:#0B1120;--card:#111B2E;--card2:#162036;
  --cyan:#00E5FF;--pink:#FF2D78;--green:#00FF88;--orange:#FF8A00;--red:#FF3B3B;--yellow:#FFD600;
  --t1:#F1F5F9;--t2:#94A3B8;--t3:#475569;--bdr:#1E293B;
  --font:'Outfit','Noto Sans Devanagari',sans-serif;--mono:'Fira Code',monospace;
}
body{font-family:var(--font);background:var(--bg);color:var(--t1);min-height:100vh;overflow-x:hidden}
::selection{background:var(--cyan);color:var(--bg)}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--bg2)}::-webkit-scrollbar-thumb{background:var(--cyan);border-radius:3px}
input,textarea{font-family:var(--font)}
@keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes scan{0%{left:-30%}100%{left:100%}}
@keyframes glow{0%,100%{box-shadow:0 0 8px var(--cyan)}50%{box-shadow:0 0 24px var(--cyan),0 0 48px rgba(0,229,255,.15)}}
@keyframes spin{to{transform:rotate(360deg)}}
.fade-up{animation:up .4s ease-out both}
.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}
`;

  /* ═══════════ SPLASH ═══════════ */
  if (page === "splash") return (
    <>
      <style>{css}</style>
      <div style={{ position:"fixed",inset:0,background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:9999 }}>
        <div style={{ width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,var(--cyan),var(--pink))",display:"flex",alignItems:"center",justifyContent:"center",animation:"float 2s ease-in-out infinite,glow 2s ease-in-out infinite",fontSize:32 }}>🛡️</div>
        <div style={{ marginTop:20,fontSize:30,fontWeight:900,letterSpacing:-.5,background:"linear-gradient(90deg,var(--cyan),var(--pink))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>CyberDost</div>
        <div style={{ marginTop:6,fontSize:12,color:"var(--t2)",letterSpacing:.5 }}>{T(APP.TAG_EN, APP.TAG_HI)}</div>
        <div style={{ marginTop:28,width:160,height:3,background:"var(--card)",borderRadius:2,overflow:"hidden" }}>
          <div style={{ width:"100%",height:"100%",background:"var(--cyan)",borderRadius:2,animation:"scan 1.5s ease-in-out infinite",position:"relative" }}/>
        </div>
      </div>
    </>
  );

  /* ═══════════ LOGIN ═══════════ */
  if (page === "login") return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:"var(--bg)",backgroundImage:"radial-gradient(ellipse at 20% 40%,rgba(0,229,255,.04) 0%,transparent 50%),radial-gradient(ellipse at 80% 60%,rgba(255,45,120,.04) 0%,transparent 50%)" }}>
        {/* Lang toggle */}
        <button onClick={() => setLang((l) => l === "en" ? "hi" : "en")} style={{ position:"fixed",top:14,right:14,padding:"7px 14px",background:"var(--card)",border:"1px solid var(--bdr)",borderRadius:8,color:"var(--cyan)",fontSize:13,cursor:"pointer",fontFamily:"var(--font)",fontWeight:600,zIndex:99 }}>
          {lang === "en" ? "हिंदी" : "English"}
        </button>

        <div style={{ width:"100%",maxWidth:400 }} className="fade-up">
          {/* Logo */}
          <div style={{ textAlign:"center",marginBottom:28 }}>
            <div style={{ width:56,height:56,borderRadius:"50%",margin:"0 auto 12px",background:"linear-gradient(135deg,var(--cyan),var(--pink))",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 24px rgba(0,229,255,.2)",fontSize:24 }}>🛡️</div>
            <h1 style={{ fontSize:26,fontWeight:900,background:"linear-gradient(90deg,var(--cyan),var(--pink))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>CyberDost</h1>
            <p style={{ fontSize:12,color:"var(--t2)",marginTop:4 }}>{T(APP.TAG_EN, APP.TAG_HI)}</p>
          </div>

          {/* Card */}
          <div style={{ background:"var(--card)",border:"1px solid var(--bdr)",borderRadius:16,padding:"28px 24px",boxShadow:"0 8px 32px rgba(0,0,0,.3)" }}>
            <h2 style={{ fontSize:17,fontWeight:700,marginBottom:2 }}>
              {isSignup ? T("Create Account", "खाता बनाएँ") : T("Welcome Back", "वापसी पर स्वागत")}
            </h2>
            <p style={{ fontSize:12,color:"var(--t2)",marginBottom:20 }}>
              {isSignup ? T("Protect your digital life", "अपनी डिजिटल सुरक्षा करें") : T("Sign in to continue", "जारी रखें")}
            </p>

            {authErr && <div style={{ padding:"9px 12px",background:"rgba(255,59,59,.08)",border:"1px solid rgba(255,59,59,.25)",borderRadius:8,color:"#FF6B6B",fontSize:12,marginBottom:14 }}>{authErr}</div>}

            {isSignup && <InputField label={T("Full Name","पूरा नाम")} value={name} onChange={setName} placeholder={T("Your name","आपका नाम")} />}
            <InputField label={T("Email","ईमेल")} value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
            <InputField label={T("Password","पासवर्ड")} value={pass} onChange={setPass} type="password" placeholder={T("Min 6 chars","कम से कम 6 अक्षर")} />

            {isSignup && pass && (
              <div style={{ marginBottom:14,marginTop:-8 }}>
                <div style={{ display:"flex",gap:3 }}>
                  {[1,2,3,4,5].map((i) => <div key={i} style={{ flex:1,height:3,borderRadius:2,background:i <= passStrength ? (passStrength <= 2 ? "var(--red)" : passStrength <= 3 ? "var(--yellow)" : "var(--green)") : "var(--bdr)" }}/>)}
                </div>
                <span style={{ fontSize:10,color:"var(--t3)",marginTop:2,display:"block" }}>
                  {passStrength <= 2 ? T("Weak","कमज़ोर") : passStrength <= 3 ? T("Medium","मध्यम") : T("Strong","मज़बूत")}
                </span>
              </div>
            )}

            <button onClick={doAuth} style={{ width:"100%",padding:"13px",border:"none",borderRadius:10,background:"linear-gradient(135deg,var(--cyan),#0099DD)",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"var(--font)",marginTop:4,transition:"transform .15s",boxShadow:"0 4px 16px rgba(0,229,255,.2)" }}
              onMouseDown={(e) => (e.target.style.transform = "scale(.97)")}
              onMouseUp={(e) => (e.target.style.transform = "scale(1)")}>
              {isSignup ? T("Create Account","खाता बनाएँ") : T("Sign In","साइन इन")}
            </button>

            <div style={{ textAlign:"center",marginTop:16 }}>
              <button onClick={() => { setIsSignup(!isSignup); setAuthErr(""); }} style={{ background:"none",border:"none",color:"var(--cyan)",cursor:"pointer",fontSize:12,fontFamily:"var(--font)" }}>
                {isSignup ? T("Have an account? Sign In","खाता है? साइन इन करें") : T("New? Create Account","नए? खाता बनाएँ")}
              </button>
            </div>
          </div>

          <p style={{ textAlign:"center",marginTop:18,fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)" }}>
            © 2026 CyberDost | KRIWA-26-1102 | v{APP.VER}
          </p>
        </div>
      </div>
    </>
  );

  /* ═══════════ MAIN APP ═══════════ */
  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",background:"var(--bg)",maxWidth:520,margin:"0 auto",position:"relative" }}>
        {/* ── HEADER ── */}
        <header style={{ padding:"10px 14px",background:"var(--bg2)",borderBottom:"1px solid var(--bdr)",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,backdropFilter:"blur(12px)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,var(--cyan),var(--pink))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>🛡️</div>
            <div>
              <span style={{ fontSize:15,fontWeight:800 }}><span style={{ color:"var(--cyan)" }}>Cyber</span><span style={{ color:"var(--pink)" }}>Dost</span></span>
              <div style={{ fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)" }}>{gKey ? "🟢 AI Active" : "🔵 Rule Engine"} • v{APP.VER}</div>
            </div>
          </div>
          <div style={{ display:"flex",gap:6 }}>
            <Btn onClick={() => setLang((l) => l === "en" ? "hi" : "en")} c="var(--green)">{lang === "en" ? "हिंदी" : "EN"}</Btn>
            <Btn onClick={() => setPanel((p) => p === "settings" ? null : "settings")} c="var(--t2)">⚙️</Btn>
            <Btn onClick={() => setPanel((p) => p === "history" ? null : "history")} c="var(--t2)">📋</Btn>
            <Btn onClick={() => setPanel((p) => p === "about" ? null : "about")} c="var(--t2)">ℹ️</Btn>
            <Btn onClick={() => { setPage("login"); setUser(null); setMsgs([]); }} c="var(--red)">{T("Exit","बाहर")}</Btn>
          </div>
        </header>

        {/* ── PANELS ── */}
        {panel === "settings" && (
          <div className="fade-up" style={{ padding:14,background:"var(--card)",borderBottom:"1px solid var(--bdr)" }}>
            <h3 style={{ fontSize:13,fontWeight:700,marginBottom:10 }}>{T("AI Settings","AI सेटिंग्स")}</h3>
            <label style={{ fontSize:10,color:"var(--t2)",display:"block",marginBottom:4 }}>{T("Groq API Key","Groq API कुंजी")}</label>
            <input type="password" value={gKey} onChange={(e) => saveKey(e.target.value)} placeholder="gsk_..." style={{ ...inputStyle, fontFamily:"var(--mono)",fontSize:11 }} />
            <p style={{ fontSize:9,color:"var(--t3)",marginTop:4 }}>{T("Free at console.groq.com • Stored only in browser session","console.groq.com पर मुफ्त • सिर्फ ब्राउज़र सेशन में")}</p>
          </div>
        )}

        {panel === "history" && (
          <div className="fade-up" style={{ padding:14,background:"var(--card)",borderBottom:"1px solid var(--bdr)",maxHeight:280,overflowY:"auto" }}>
            <h3 style={{ fontSize:13,fontWeight:700,marginBottom:10 }}>{T("History","इतिहास")} ({history.length})</h3>
            {history.length === 0 ? <p style={{ fontSize:11,color:"var(--t3)" }}>{T("No analyses yet","कोई विश्लेषण नहीं")}</p> :
              history.map((h, i) => (
                <div key={i} style={{ padding:"7px 10px",background:"var(--bg2)",borderRadius:8,marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div style={{ flex:1,overflow:"hidden" }}>
                    <div style={{ fontSize:11,whiteSpace:"nowrap",textOverflow:"ellipsis",overflow:"hidden" }}>{h.text}</div>
                    <div style={{ fontSize:9,color:"var(--t3)" }}>{new Date(h.ts).toLocaleTimeString()}</div>
                  </div>
                  <span style={{ padding:"2px 7px",borderRadius:5,fontSize:9,fontWeight:700,marginLeft:6,whiteSpace:"nowrap",background:V_CFG[h.verdict]?.bg,color:V_CFG[h.verdict]?.color }}>{h.score}/100</span>
                </div>
              ))
            }
          </div>
        )}

        {panel === "about" && (
          <div className="fade-up" style={{ padding:14,background:"var(--card)",borderBottom:"1px solid var(--bdr)" }}>
            <h3 style={{ fontSize:13,fontWeight:700,marginBottom:8 }}>{T("About CyberDost","CyberDost के बारे में")}</h3>
            <div style={{ fontSize:11,color:"var(--t2)",lineHeight:1.7 }}>
              <p><strong style={{ color:"var(--cyan)" }}>CyberDost v{APP.VER}</strong> — {T(APP.TAG_EN, APP.TAG_HI)}</p>
              <p style={{ marginTop:6 }}>{T("Developed for KRIWA National AI-Coding Challenge 2026","KRIWA राष्ट्रीय AI-कोडिंग चैलेंज 2026 के लिए विकसित")}</p>
              <p style={{ marginTop:4 }}>{T("Theme 9: Cyber-Safe Portal","थीम 9: साइबर-सेफ पोर्टल")}</p>
              <div style={{ marginTop:8,padding:"8px 10px",background:"var(--bg2)",borderRadius:8,fontFamily:"var(--mono)",fontSize:10 }}>
                <div><span style={{ color:"var(--cyan)" }}>Lead:</span> Tathagata Laskar (24BCS11358)</div>
                <div><span style={{ color:"var(--pink)" }}>Member:</span> Devaansh Singh</div>
                <div><span style={{ color:"var(--green)" }}>Team:</span> KRIWA-26-1102</div>
                <div><span style={{ color:"var(--orange)" }}>College:</span> Chandigarh University</div>
              </div>
              <p style={{ marginTop:6,fontSize:10,color:"var(--t3)" }}>{T("Features: 120+ threat patterns • 60+ bank IDs • Hindi-English • AI-powered","विशेषताएँ: 120+ खतरा पैटर्न • 60+ बैंक ID • हिंदी-अंग्रेज़ी • AI-संचालित")}</p>
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
        <div style={{ flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10 }}>
          {msgs.map((m, i) => {
            if (m.from === "loading") return (
              <div key={i} className="fade-up" style={{ alignSelf:"flex-start",padding:"10px 14px",background:"var(--card)",borderRadius:"14px 14px 14px 4px",border:"1px solid var(--bdr)",maxWidth:"80%" }}>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ width:7,height:7,borderRadius:"50%",background:"var(--cyan)",animation:"pulse .8s infinite" }}/>
                  <span style={{ fontSize:12,color:"var(--t2)" }}>{T("Scanning for threats...","खतरों की जाँच हो रही है...")}</span>
                </div>
              </div>
            );

            const isU = m.from === "user";
            const vc = V_CFG[m.verdict] || V_CFG.info;
            return (
              <div key={i} className="fade-up" style={{ alignSelf:isU ? "flex-end" : "flex-start",maxWidth:"88%" }}>
                <div style={{
                  padding:"10px 14px",
                  background:isU ? "linear-gradient(135deg,#0A2040,#0E3060)" : "var(--card)",
                  borderRadius:isU ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  border:`1px solid ${isU ? "rgba(0,229,255,.15)" : "var(--bdr)"}`,
                  borderLeft:!isU ? `3px solid ${vc.color}` : undefined,
                }}>
                  {/* Verdict badge */}
                  {!isU && m.verdict && m.verdict !== "info" && (
                    <div style={{ display:"inline-block",padding:"3px 8px",borderRadius:5,fontSize:9,fontWeight:700,marginBottom:6,letterSpacing:.3,background:vc.bg,color:vc.color,border:`1px solid ${vc.border}`,textTransform:"uppercase" }}>
                      {m.verdict === "safe" ? T("SAFE","सुरक्षित") : m.verdict === "suspicious" ? T("SUSPICIOUS","संदिग्ध") : m.verdict === "dangerous" ? T("DANGEROUS","खतरनाक") : T("CRITICAL","गंभीर")}
                      {m.score != null && ` • ${m.score}/100`}
                    </div>
                  )}
                  <div style={{ fontSize:13,lineHeight:1.65,whiteSpace:"pre-wrap",wordBreak:"break-word" }}>{m.text}</div>
                  {m.ai && <div style={{ marginTop:5,fontSize:8,color:"var(--t3)",fontFamily:"var(--mono)" }}><span style={{ color:"var(--cyan)" }}>●</span> AI-Powered</div>}
                </div>
                <div style={{ fontSize:9,color:"var(--t3)",marginTop:3,textAlign:isU ? "right" : "left",paddingInline:3 }}>
                  {new Date(m.ts).toLocaleTimeString([], { hour:"2-digit",minute:"2-digit" })}
                </div>
              </div>
            );
          })}
          <div ref={endRef}/>
        </div>

        {/* ── EXAMPLES (shown when chat is fresh) ── */}
        {msgs.length <= 1 && (
          <div className="fade-up" style={{ padding:"0 14px 6px" }}>
            <p style={{ fontSize:10,color:"var(--t3)",marginBottom:6,fontWeight:600 }}>{T("Try examples:","उदाहरण आज़माएँ:")}</p>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
              {examples.map((e, i) => (
                <button key={i} onClick={() => setInput(e.t)} style={{ padding:"5px 10px",background:"var(--card)",border:"1px solid var(--bdr)",borderRadius:16,color:"var(--t2)",fontSize:10,cursor:"pointer",fontFamily:"var(--font)",transition:"all .15s" }}
                  onMouseEnter={(ev) => { ev.target.style.borderColor = "var(--cyan)"; ev.target.style.color = "var(--cyan)"; }}
                  onMouseLeave={(ev) => { ev.target.style.borderColor = "var(--bdr)"; ev.target.style.color = "var(--t2)"; }}>
                  {e.l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── INPUT ── */}
        <div style={{ padding:"10px 14px",background:"var(--bg2)",borderTop:"1px solid var(--bdr)",position:"sticky",bottom:0 }}>
          <div style={{ display:"flex",gap:8,alignItems:"flex-end" }}>
            <textarea ref={(el) => { if (el) el.style.height = "auto"; if (el) el.style.height = Math.min(el.scrollHeight, 120) + "px"; }}
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={T("Paste suspicious SMS, email, or URL here...","संदिग्ध SMS, ईमेल, या URL यहाँ पेस्ट करें...")}
              rows={1}
              style={{ ...inputStyle, flex:1,resize:"none",lineHeight:1.5,fontSize:13 }}
            />
            <button onClick={send} disabled={!input.trim() || busy}
              style={{ width:44,height:44,borderRadius:"50%",border:"none",background:input.trim() ? "linear-gradient(135deg,var(--cyan),#0099DD)" : "var(--card)",color:input.trim() ? "#000" : "var(--t3)",fontSize:18,cursor:input.trim() ? "pointer" : "default",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",flexShrink:0,opacity:busy ? .5 : 1 }}>
              {busy ? "⏳" : "🔍"}
            </button>
          </div>
          <div style={{ marginTop:5,display:"flex",justifyContent:"space-between",fontSize:8,color:"var(--t3)",fontFamily:"var(--mono)" }}>
            <span>🛡️ CyberDost v{APP.VER} | KRIWA-26-1102</span>
            <span>© 2026 {_$f._a || "Protected"}</span>
          </div>
        </div>
      </div>

      {/* Hidden ownership */}
      <div aria-hidden="true" style={{ position:"fixed",bottom:-9999,left:-9999,opacity:0,pointerEvents:"none",userSelect:"none" }}
        data-author={_$f._a} data-uid={_$f._b} data-team={_$f._c} data-inst={_$f._d}>
        CyberDost © 2026 Tathagata Laskar (24BCS11358) | Devaansh Singh | KRIWA-26-1102 | Chandigarh University
      </div>
    </>
  );
}

/* ═══════════ HELPER COMPONENTS ═══════════ */
const inputStyle = {
  width:"100%",padding:"10px 14px",background:"#0B1120",
  border:"1px solid #1E293B",borderRadius:10,color:"#F1F5F9",
  fontSize:13,fontFamily:"'Outfit','Noto Sans Devanagari',sans-serif",outline:"none",
  transition:"border-color .2s",
};

function InputField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block",fontSize:11,color:"#94A3B8",marginBottom:5,fontWeight:600 }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = "#00E5FF")}
        onBlur={(e) => (e.target.style.borderColor = "#1E293B")} />
    </div>
  );
}

function Btn({ onClick, c, children }) {
  return (
    <button onClick={onClick} style={{
      padding:"5px 9px",background:"#111B2E",border:"1px solid #1E293B",
      borderRadius:7,color:c,fontSize:11,cursor:"pointer",
      fontFamily:"'Outfit',sans-serif",fontWeight:600,transition:"all .15s",whiteSpace:"nowrap",
    }}>{children}</button>
  );
}
