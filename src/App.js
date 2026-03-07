import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Home, Users, DollarSign, Calendar, Wrench, TrendingUp, BarChart3, Building2, ClipboardList, Star, AlertTriangle, Check, X, ChevronRight, ArrowLeft, ArrowRight, Settings, MessageSquare, MoreHorizontal, HelpCircle, Hammer, Camera, Plus, Edit3, Trash2, Upload } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// IMPORTANT: Replace anon key below with your real Supabase anon key (starts with eyJ...)
// Find it at: Supabase Dashboard → Settings → API → Project API keys → anon / public
const SUPABASE_URL = "https://fwbdcrjfydejzxcldnrf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YmRjcmpmeWRlanp4Y2xkbnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NTYxODksImV4cCI6MjA4ODMzMjE4OX0.TTSp27ZvM1Nmp1IraFI7_zyqO9b_WEJSSCCvvw8aWiE";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.__supabase = supabase; // expose for console debugging

// Debug helper — logs every Supabase result so we can see failures
const dbLog = (label, { data, error }) => {
  if (error) console.error(`[DB ${label}] ERROR:`, error.message, error);
  else console.log(`[DB ${label}] OK:`, data);
  return { data, error };
};

const C = {
  white: "#ffffff",
  bg: "#F8FAFC",
  card: "#ffffff",
  green: "#22C55E",
  greenLight: "#dcfce7",
  greenBright: "#22C55E",
  greenDark: "#16a34a",
  border: "#E2E8F0",
  text: "#111827",
  muted: "#6B7280",
  mutedLight: "#9CA3AF",
  nav: "#111827",
  yellow: "#d97706",
  yellowLight: "#fffbeb",
  yellowBorder: "#fcd34d",
  yellowDark: "#92400e",
  red: "#ef4444",
  redLight: "#fee2e2",
  inputBg: "#F8FAFC",
};

const fmt = (n) => isNaN(n) || !isFinite(n) ? "—" : n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtD = (n) => isNaN(n) || !isFinite(n) ? "—" : "$" + fmt(n);
const fmtP = (n) => isNaN(n) || !isFinite(n) ? "—" : n.toFixed(2) + "%";
const num = (v) => parseFloat(v) || 0;

const DEFAULT_STANDARDS = {
  hold: { greenCashFlow: 200, greenCapRate: 6, yellowCashFlow: 0, yellowCapRate: 4 },
  flip: { greenProfit: 25000, greenROI: 15, yellowProfit: 10000, yellowROI: 8 },
};

// Startup diagnostic
console.log("[DoorBase] Supabase URL:", SUPABASE_URL);
console.log("[DoorBase] Anon key starts with:", SUPABASE_ANON_KEY.substring(0, 10) + "...");
console.log("[DoorBase] Key looks like JWT:", SUPABASE_ANON_KEY.startsWith("eyJ"));
if (!SUPABASE_ANON_KEY.startsWith("eyJ")) {
  console.error("[DoorBase] WARNING: Supabase anon key does NOT look like a valid JWT. All DB calls will fail. Go to Supabase Dashboard → Settings → API → copy the 'anon public' key.");
}

// ─── AUTH HOOK ───────────────────────────────────────────────────────────────
function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      console.log("[DoorBase] Auth session:", s ? `Logged in as ${s.user.email}` : "No session");
      setSession(s);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  return { session, loading, signOut };
}

// ─── MOBILE DETECTION HOOK ───────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < breakpoint);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    check();
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, [breakpoint]);
  return isMobile;
}



// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────
function AuthScreen({ onBack }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    if (isSignUp) {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) setError(err.message);
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
    }
    setLoading(false);
  };

  const inp = {
    width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.08)",
    border: `1.5px solid ${error ? C.red : "rgba(255,255,255,0.15)"}`,
    borderRadius: 10, fontSize: 15, color: C.white,
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.nav,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 40 }}>
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <path d="M8 34 L8 8 L28 8 L28 34" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M8 8 L8 34 L20 31 L20 11 Z" fill="#22C55E" opacity="0.9"/>
            <circle cx="18" cy="21" r="1.5" fill="white" opacity="0.9"/>
            <line x1="4" y1="34" x2="32" y2="34" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: C.white, letterSpacing: "-0.02em" }}>Door</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: C.green, letterSpacing: "-0.02em" }}>Base</span>
          </div>
        </div>

        <div style={{ fontSize: 28, fontWeight: 800, color: C.white, marginBottom: 10 }}>
          {isSignUp ? "Get Early Access" : "Welcome Back"}
        </div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", marginBottom: 32, lineHeight: 1.6 }}>
          {isSignUp ? "Create your free account to unlock the full dashboard." : "Sign in to your DoorBase account."}
        </div>

        <input
          value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="Email"
          type="email"
          style={{ ...inp, marginBottom: 12 }}
        />
        <input
          value={password}
          onChange={e => { setPassword(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="Password"
          type="password"
          style={{ ...inp, marginBottom: error ? 8 : 16 }}
        />

        {error && (
          <div style={{ fontSize: 13, color: C.red, marginBottom: 16, lineHeight: 1.5, textAlign: "left" }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "14px", background: C.green, border: "none",
          borderRadius: 10, color: C.white, fontSize: 15, fontWeight: 700,
          cursor: loading ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 2px 12px rgba(22,163,74,0.4)", marginBottom: 20,
          opacity: loading ? 0.7 : 1,
        }}>{loading ? "..." : isSignUp ? "Get Early Access \u2014 Free" : "Sign In"}</button>

        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={() => { setIsSignUp(!isSignUp); setError(""); }} style={{ color: C.green, cursor: "pointer", fontWeight: 600 }}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </span>
        </div>

        <div style={{ marginTop: 24 }}>
          <span onClick={onBack} style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
            <ArrowLeft size={12} style={{ marginRight: 4 }} /> Back to site
          </span>
        </div>
      </div>
    </div>
  );
}


// ─── EMAIL CAPTURE MODAL ──────────────────────────────────────────────────────
function EmailCaptureModal({ onClose, results, mode, source = 'analyzer' }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    try {
      // Post to Beehiiv via their public subscribe endpoint
      await fetch("https://www.news-thelegacybridge.com/api/v1/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          utm_source: "doorbase",
          utm_medium: "deal_analyzer",
          utm_campaign: "beta_access",
        }),
      });
      // Beehiiv redirects on success - either way we treat as success
      setStatus("success");
    } catch (e) {
      // Still show success - email captured, Beehiiv may have CORS restrictions
      setStatus("success");
    }
  };

  const verdictLabel = mode === "hold" ? "Monthly Cash Flow" : "Net Profit";
  const verdictValue = results ? (mode === "hold" ? 
    ("$" + Math.round(results.cashFlow).toLocaleString() + "/mo") : 
    ("$" + Math.round(results.netProfit).toLocaleString())) : "";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.white, borderRadius: 16, width: "100%", maxWidth: 440, padding: "32px 28px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)", margin: "0 16px" }}>
        {status === "success" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8 }}>You're in.</div>
            <div style={{ fontSize: 15, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
              Your results are on the way. You've also been added to the DoorBase early access list — we'll reach out when Pro is ready.
            </div>
            <button onClick={onClose} style={{ background: C.green, border: "none", borderRadius: 10, padding: "12px 32px", color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ paddingRight: 12 }}>
                {source === 'pro' ? (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                      Beta Access
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.2, marginBottom: 8 }}>
                      Get in free<br />while we build.
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>
                      Pro is coming. Drop your email and we'll reach out before anyone else.
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 4 }}>Email your results</div>
                    <div style={{ fontSize: 13, color: C.muted }}>We'll send your full deal breakdown to your inbox.</div>
                  </>
                )}
              </div>
              <button onClick={onClose} style={{ background: C.bg, border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 15, color: C.muted, flexShrink: 0 }}>✕</button>
            </div>

            {results && source === 'analyzer' && (
              <div style={{ background: C.greenLight, border: "1px solid #86efac", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.greenDark, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{verdictLabel}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.greenDark }}>{verdictValue}</div>
              </div>
            )}

            {source === 'analyzer' && (
              <div style={{ background: C.yellowLight, border: `1px solid ${C.yellowBorder}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.yellowDark, lineHeight: 1.5 }}>
                  <strong>Beta Access:</strong> Pro is free while we build.
                </div>
              </div>
            )}

            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%", padding: "13px 14px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 15, color: C.text, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", marginBottom: 10, background: C.inputBg }}
            />
            <button onClick={handleSubmit} disabled={status === "loading"} style={{ width: "100%", padding: "14px", background: C.green, border: "none", borderRadius: 8, color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", opacity: status === "loading" ? 0.75 : 1 }}>
              {status === "loading" ? "Sending..." : source === 'pro' ? "Claim My Spot" : "Send My Results + Claim Early Access"}
            </button>
            <div style={{ fontSize: 11, color: C.mutedLight, textAlign: "center", marginTop: 8 }}>
              No spam. Deal updates and DoorBase news only.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── EMAIL RESULTS MODAL (sends branded HTML email via Edge Function) ────────
function EmailResultsModal({ onClose, result, mode }) {
  const [dealName, setDealName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const buildStats = () => {
    if (mode === "hold") {
      return [
        { label: "Down Payment", value: fmtD(result.down) },
        { label: "Loan Amount", value: fmtD(result.loanAmt) },
        { label: "Monthly Mortgage", value: fmtD(result.mortgage) },
        { label: "Gross Rental Income", value: fmtD(result.grossRent) + "/mo" },
        { label: "Vacancy Loss", value: fmtD(result.vacancyLoss) + "/mo" },
        { label: "Effective Income", value: fmtD(result.effectiveIncome) + "/mo" },
        { label: "Operating Expenses", value: fmtD(result.opEx) + "/mo" },
        { label: "Net Operating Income", value: fmtD(result.noi) + "/mo" },
        { label: "Monthly Cash Flow", value: fmtD(result.cashFlow), highlight: true },
        { label: "Annual Cash Flow", value: fmtD(result.annualCashFlow), highlight: true },
        { label: "Cap Rate", value: fmtP(result.capRate), highlight: true },
        { label: "Cash-on-Cash Return", value: fmtP(result.cashOnCash), highlight: true },
        { label: "Gross Rent Multiplier", value: isNaN(result.grm) ? "\u2014" : result.grm.toFixed(2) + "x" },
        { label: "Expense Ratio", value: fmtP(result.expenseRatio) },
      ];
    }
    return [
      { label: "Buy Closing Costs", value: fmtD(result.buyClose) },
      { label: "Rehab Cost", value: fmtD(result.totalIn - result.buyClose - result.holdCost - result.interestCost - (result.pointsCost || 0)) },
      { label: "Holding Costs", value: fmtD(result.holdCost) },
      { label: "Interest / Finance Cost", value: fmtD(result.interestCost) },
      { label: "Points (Origination Fee)", value: fmtD(result.pointsCost || 0) },
      { label: "Total Money In", value: fmtD(result.totalIn) },
      { label: "ARV (Sale Price)", value: fmtD(result.arv) },
      { label: "Sell Closing Costs", value: fmtD(result.sellClose) },
      { label: "Net Profit", value: fmtD(result.netProfit), highlight: true },
      { label: "ROI", value: fmtP(result.roi), highlight: true },
      { label: "ARV Spread", value: fmtP(result.arvSpread) },
      { label: "Max Allowable Offer (70% Rule)", value: fmtD(result.maxAllowable) },
    ];
  };

  const handleSend = async () => {
    if (!senderEmail || !senderEmail.includes("@")) return setErrorMsg("Enter a valid sender email.");
    if (!recipientEmail || !recipientEmail.includes("@")) return setErrorMsg("Enter a valid recipient email.");
    setErrorMsg("");
    setStatus("loading");
    try {
      const res = await supabase.functions.invoke("send-deal-email", {
        body: {
          senderEmail,
          recipientEmail,
          dealName: dealName || (mode === "hold" ? "Buy & Hold Deal" : "Fix & Flip Deal"),
          mode,
          verdict: result.verdict,
          stats: buildStats(),
        },
      });
      if (res.error) {
        setStatus("error");
        const detail = res.error?.message || res.error?.context?.message || "";
        setErrorMsg(detail ? `Failed to send: ${detail}` : "Failed to send. Please try again.");
      } else {
        setStatus("success");
      }
    } catch (e) {
      setStatus("error");
      setErrorMsg(e?.message ? `Failed to send: ${e.message}` : "Failed to send. Please try again.");
    }
  };

  const inp = { width: "100%", padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.text, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", background: C.inputBg };

  const verdictCfg = {
    green: { bg: C.greenLight, border: "#86efac", color: C.green, label: "DEAL WORKS" },
    yellow: { bg: C.yellowLight, border: "#fcd34d", color: C.yellow, label: "MARGINAL" },
    red: { bg: C.redLight, border: "#fca5a5", color: C.red, label: "PASS ON THIS ONE" },
  }[result.verdict] || { bg: C.redLight, border: "#fca5a5", color: C.red, label: "PASS" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.white, borderRadius: 16, width: "100%", maxWidth: 460, padding: "28px 24px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)", margin: "0 16px", maxHeight: "90vh", overflowY: "auto" }}>
        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.greenLight, border: `2px solid #86efac`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 20, color: C.green, fontWeight: 800 }}><Check size={24} /></div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Email sent!</div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
              Your branded deal analysis has been sent to <strong>{recipientEmail}</strong>.
            </div>
            <button onClick={onClose} style={{ background: C.green, border: "none", borderRadius: 10, padding: "12px 32px", color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 4 }}>Email Deal Results</div>
                <div style={{ fontSize: 13, color: C.muted }}>Send a branded report with your full deal breakdown.</div>
              </div>
              <button onClick={onClose} style={{ background: C.bg, border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 15, color: C.muted, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
            </div>

            <div style={{ background: verdictCfg.bg, border: `1px solid ${verdictCfg.border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: verdictCfg.color, letterSpacing: "0.04em" }}>{verdictCfg.label}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: verdictCfg.color }}>
                {mode === "hold" ? fmtD(result.cashFlow) + "/mo" : fmtD(result.netProfit)}
              </span>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Deal Name (optional)</label>
              <input value={dealName} onChange={e => setDealName(e.target.value)} placeholder="e.g. 123 Main St" style={inp} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Your Email</label>
              <input type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="you@email.com" style={inp} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Recipient Email</label>
              <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="partner@email.com" onKeyDown={e => e.key === "Enter" && handleSend()} style={inp} />
            </div>

            {errorMsg && <div style={{ fontSize: 13, color: C.red, marginBottom: 12 }}>{errorMsg}</div>}

            <button onClick={handleSend} disabled={status === "loading"} style={{
              width: "100%", padding: "14px", background: C.green, border: "none", borderRadius: 10,
              color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 12px rgba(22,163,74,0.4)",
              opacity: status === "loading" ? 0.75 : 1,
            }}>{status === "loading" ? "Sending..." : "Send Deal Report"}</button>
            <div style={{ fontSize: 11, color: C.mutedLight, textAlign: "center", marginTop: 8 }}>
              Sends a branded HTML email with your full analysis.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const HERO_IMG = "/hero.png";

// ─── PRO TRIGGER ──────────────────────────────────────────────────────────────
function ProTrigger({ text, onScrollToPro, isPro }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseDown={e => e.preventDefault()}
      onClick={onScrollToPro}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: hovered ? "#dcfce7" : "#f0fdf4",
        border: "1px solid #86efac", borderRadius: 8,
        padding: "6px 10px", marginTop: 6, cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {isPro
        ? <ChevronRight size={12} color={C.green} />
        : <span style={{ fontSize: 12 }}>⭐</span>}
      <span style={{ fontSize: 12, color: C.greenDark, fontWeight: 600, lineHeight: 1.4 }}>{text}</span>
      {!isPro && <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>Pro →</span>}
    </div>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, prefix = "$", suffix = "", proTip, onScrollToPro, isPro }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && (
          <span style={{
            position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
            color: focused ? C.green : C.mutedLight, fontSize: 15, fontWeight: 500, transition: "color 0.15s",
          }}>{prefix}</span>
        )}
        <input
          type="number" value={value} placeholder="0"
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: prefix ? "11px 12px 11px 28px" : "11px 14px",
            paddingRight: suffix ? 36 : 12,
            background: focused ? C.white : C.inputBg,
            border: `1.5px solid ${focused ? C.green : C.border}`,
            borderRadius: 10, fontSize: 14, color: C.text,
            fontFamily: "'DM Sans', sans-serif", outline: "none",
            boxSizing: "border-box", transition: "all 0.15s", WebkitAppearance: "none",
          }}
        />
        {suffix && (
          <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: C.mutedLight, fontSize: 13 }}>{suffix}</span>
        )}
      </div>
      {proTip && (
        <div style={{ overflow: "hidden", maxHeight: focused ? 40 : 0, opacity: focused ? 1 : 0, transition: "all 0.2s ease" }}>
          <ProTrigger text={proTip} onScrollToPro={onScrollToPro} isPro={isPro} />
        </div>
      )}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)", padding: "16px", marginBottom: 10, ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase",
      letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}`,
    }}>{children}</div>
  );
}

function TwoCol({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>;
}

function VerdictCard({ verdict, value, label }) {
  const cfg = {
    green: { bg: C.greenLight, border: "#86efac", color: C.green, icon: "✓", text: "DEAL WORKS" },
    yellow: { bg: C.yellowLight, border: "#fcd34d", color: C.yellow, icon: "~", text: "MARGINAL" },
    red: { bg: C.redLight, border: "#fca5a5", color: C.red, icon: "✕", text: "PASS ON THIS ONE" },
  }[verdict] || { bg: C.redLight, border: "#fca5a5", color: C.red, icon: "✕", text: "PASS ON THIS ONE" };
  return (
    <div style={{
      background: cfg.bg, border: `2px solid ${cfg.border}`,
      borderRadius: 14, padding: "20px 16px", textAlign: "center", marginBottom: 10,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%", background: C.white,
        border: `2px solid ${cfg.border}`, display: "flex", alignItems: "center",
        justifyContent: "center", margin: "0 auto 8px", fontSize: 20, color: cfg.color, fontWeight: 800,
      }}>{cfg.icon}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color, letterSpacing: "0.04em", marginBottom: 4 }}>{cfg.text}</div>
      <div style={{ fontSize: 14, color: C.muted }}>
        {label}: <span style={{ color: cfg.color, fontWeight: 700 }}>{value}</span>
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight = false, last = false }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 0", borderBottom: last ? "none" : `1px solid ${C.border}`,
    }}>
      <span style={{ fontSize: 13, color: C.muted }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: highlight ? 700 : 500, color: highlight ? C.green : C.text }}>{value}</span>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsPanel({ standards, onSave, onClose }) {
  const [s, setS] = useState(JSON.parse(JSON.stringify(standards)));
  const sh = (section, key) => (v) => setS(prev => ({ ...prev, [section]: { ...prev[section], [key]: parseFloat(v) || 0 } }));
  const SF = ({ label, value, onChange, prefix }) => (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.mutedLight, fontSize: 13 }}>{prefix}</span>
        <input type="number" value={value} onChange={e => onChange(e.target.value)}
          style={{ width: "100%", padding: "9px 9px 9px 22px", background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.text, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }} />
      </div>
    </div>
  );
  const Dot = ({ color }) => <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", marginRight: 6 }} />;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.white, borderRadius: 16, width: "100%", maxWidth: 480, padding: "24px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Your Deal Standards</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Set your own thresholds for green / yellow verdicts</div>
          </div>
          <button onClick={onClose} style={{ background: C.bg, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: C.muted }}>✕</button>
        </div>
        <div style={{ height: 1, background: C.border, marginBottom: 16 }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Buy & Hold</div>
        <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, display: "flex", alignItems: "center" }}><Dot color={C.green} />Green — Deal Works</div>
          <TwoCol>
            <SF label="Min Cash Flow / Mo" value={s.hold.greenCashFlow} onChange={sh("hold", "greenCashFlow")} prefix="$" />
            <SF label="Min Cap Rate" value={s.hold.greenCapRate} onChange={sh("hold", "greenCapRate")} prefix="%" />
          </TwoCol>
        </div>
        <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, display: "flex", alignItems: "center" }}><Dot color={C.yellow} />Yellow — Marginal</div>
          <TwoCol>
            <SF label="Min Cash Flow / Mo" value={s.hold.yellowCashFlow} onChange={sh("hold", "yellowCashFlow")} prefix="$" />
            <SF label="Min Cap Rate" value={s.hold.yellowCapRate} onChange={sh("hold", "yellowCapRate")} prefix="%" />
          </TwoCol>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Fix & Flip</div>
        <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, display: "flex", alignItems: "center" }}><Dot color={C.green} />Green — Deal Works</div>
          <TwoCol>
            <SF label="Min Net Profit" value={s.flip.greenProfit} onChange={sh("flip", "greenProfit")} prefix="$" />
            <SF label="Min ROI" value={s.flip.greenROI} onChange={sh("flip", "greenROI")} prefix="%" />
          </TwoCol>
        </div>
        <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, display: "flex", alignItems: "center" }}><Dot color={C.yellow} />Yellow — Marginal</div>
          <TwoCol>
            <SF label="Min Net Profit" value={s.flip.yellowProfit} onChange={sh("flip", "yellowProfit")} prefix="$" />
            <SF label="Min ROI" value={s.flip.yellowROI} onChange={sh("flip", "yellowROI")} prefix="%" />
          </TwoCol>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setS(JSON.parse(JSON.stringify(DEFAULT_STANDARDS)))} style={{ flex: 1, padding: "12px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: C.muted, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Reset</button>
          <button onClick={() => { onSave(s); onClose(); }} style={{ flex: 2, padding: "12px", background: C.green, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, color: C.white, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Save Standards</button>
        </div>
      </div>
    </div>
  );
}

// ─── UNDERWRITING WORKSHEET ──────────────────────────────────────────────────
function UnderwritingWorksheet({ onClose, onUsePrice }) {
  const emptyComp = () => ({ address: "", salePrice: "", sqft: "", beds: "", baths: "", adjCondition: "0", adjLocation: "0", adjSize: "0" });
  const [comps, setComps] = useState([emptyComp(), emptyComp(), emptyComp()]);
  const [subject, setSubject] = useState({ address: "", sqft: "", beds: "", baths: "" });
  const [offerPercent, setOfferPercent] = useState("95");

  const updateComp = (i, key) => (val) => {
    setComps(prev => prev.map((c, j) => j === i ? { ...c, [key]: val } : c));
  };

  const validComps = comps.filter(c => num(c.salePrice) > 0);

  // Adjusted price per comp = sale price + all adjustments
  const adjustedComps = validComps.map(c => {
    const adj = num(c.adjCondition) + num(c.adjLocation) + num(c.adjSize);
    return { ...c, adjustedPrice: num(c.salePrice) + adj };
  });

  // Price per sqft for each comp (if sqft provided)
  const compsWithPsf = adjustedComps.map(c => ({
    ...c,
    pricePerSqft: num(c.sqft) > 0 ? c.adjustedPrice / num(c.sqft) : null,
  }));

  // Estimated value: average of adjusted prices, or if subject sqft is known, use avg $/sqft
  const subjectSqft = num(subject.sqft);
  const psfComps = compsWithPsf.filter(c => c.pricePerSqft !== null);

  let estimatedValue = 0;
  let method = "";
  if (psfComps.length > 0 && subjectSqft > 0) {
    const avgPsf = psfComps.reduce((s, c) => s + c.pricePerSqft, 0) / psfComps.length;
    estimatedValue = avgPsf * subjectSqft;
    method = "$/sqft";
  } else if (adjustedComps.length > 0) {
    estimatedValue = adjustedComps.reduce((s, c) => s + c.adjustedPrice, 0) / adjustedComps.length;
    method = "avg adjusted";
  }

  const suggestedOffer = estimatedValue * (num(offerPercent) / 100);
  const hasResult = estimatedValue > 0;

  const inputStyle = (small) => ({
    width: "100%", padding: small ? "8px 10px" : "10px 12px",
    background: C.inputBg, border: `1.5px solid ${C.border}`,
    borderRadius: 8, fontSize: 13, color: C.text,
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box",
  });

  const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{
        background: C.white, borderRadius: 16, width: "100%", maxWidth: 680,
        padding: "28px", maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>Deal Underwriting Worksheet</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>Build confidence in your purchase price using comparable sales.</div>
          </div>
          <button onClick={onClose} style={{ background: C.bg, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: C.muted, flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ height: 1, background: C.border, marginBottom: 20 }} />

        {/* Subject property */}
        <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Subject Property</div>
        <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 20 }}>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Address (optional)</label>
            <input value={subject.address} onChange={e => setSubject(p => ({ ...p, address: e.target.value }))} placeholder="123 Main St" style={inputStyle()} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div>
              <label style={labelStyle}>Sqft</label>
              <input type="number" value={subject.sqft} onChange={e => setSubject(p => ({ ...p, sqft: e.target.value }))} placeholder="0" style={inputStyle(true)} />
            </div>
            <div>
              <label style={labelStyle}>Beds</label>
              <input type="number" value={subject.beds} onChange={e => setSubject(p => ({ ...p, beds: e.target.value }))} placeholder="0" style={inputStyle(true)} />
            </div>
            <div>
              <label style={labelStyle}>Baths</label>
              <input type="number" value={subject.baths} onChange={e => setSubject(p => ({ ...p, baths: e.target.value }))} placeholder="0" style={inputStyle(true)} />
            </div>
          </div>
        </div>

        {/* Comps */}
        <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Comparable Sales</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>
          Enter 2–3 recent sales of similar properties nearby. Adjustments add or subtract from the comp's sale price to account for differences vs. your subject.
        </div>

        {comps.map((comp, i) => (
          <div key={i} style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Comp {i + 1}</div>
              {comps.length > 2 && (
                <button onClick={() => setComps(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", fontSize: 12, color: C.muted, cursor: "pointer" }}>Remove</button>
              )}
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>Address</label>
              <input value={comp.address} onChange={e => updateComp(i, "address")(e.target.value)} placeholder="456 Oak Ave" style={inputStyle(true)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div>
                <label style={labelStyle}>Sale Price</label>
                <input type="number" value={comp.salePrice} onChange={e => updateComp(i, "salePrice")(e.target.value)} placeholder="0" style={inputStyle(true)} />
              </div>
              <div>
                <label style={labelStyle}>Sqft</label>
                <input type="number" value={comp.sqft} onChange={e => updateComp(i, "sqft")(e.target.value)} placeholder="0" style={inputStyle(true)} />
              </div>
              <div>
                <label style={labelStyle}>Beds</label>
                <input type="number" value={comp.beds} onChange={e => updateComp(i, "beds")(e.target.value)} placeholder="0" style={inputStyle(true)} />
              </div>
              <div>
                <label style={labelStyle}>Baths</label>
                <input type="number" value={comp.baths} onChange={e => updateComp(i, "baths")(e.target.value)} placeholder="0" style={inputStyle(true)} />
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6 }}>Adjustments vs. Subject (+ if comp is inferior, − if superior)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <div>
                <label style={labelStyle}>Condition $</label>
                <input type="number" value={comp.adjCondition} onChange={e => updateComp(i, "adjCondition")(e.target.value)} style={inputStyle(true)} />
              </div>
              <div>
                <label style={labelStyle}>Location $</label>
                <input type="number" value={comp.adjLocation} onChange={e => updateComp(i, "adjLocation")(e.target.value)} style={inputStyle(true)} />
              </div>
              <div>
                <label style={labelStyle}>Size $</label>
                <input type="number" value={comp.adjSize} onChange={e => updateComp(i, "adjSize")(e.target.value)} style={inputStyle(true)} />
              </div>
            </div>
            {num(comp.salePrice) > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: C.greenDark, fontWeight: 600 }}>
                Adjusted: {fmtD(num(comp.salePrice) + num(comp.adjCondition) + num(comp.adjLocation) + num(comp.adjSize))}
                {num(comp.sqft) > 0 && <span style={{ color: C.muted, fontWeight: 400 }}> · {fmtD((num(comp.salePrice) + num(comp.adjCondition) + num(comp.adjLocation) + num(comp.adjSize)) / num(comp.sqft))}/sqft</span>}
              </div>
            )}
          </div>
        ))}

        {comps.length < 5 && (
          <button onClick={() => setComps(prev => [...prev, emptyComp()])} style={{
            width: "100%", padding: "10px", border: `1.5px dashed ${C.border}`, borderRadius: 10,
            background: "transparent", color: C.muted, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginBottom: 20,
          }}>+ Add Another Comp</button>
        )}

        {/* Results */}
        {hasResult && (
          <>
            <div style={{ height: 1, background: C.border, marginBottom: 20 }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Valuation Summary</div>

            <div style={{ background: C.greenLight, border: "1px solid #86efac", borderRadius: 12, padding: "18px 16px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.greenDark, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Estimated Value ({method})</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.greenDark }}>{fmtD(estimatedValue)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.greenDark, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Based On</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.greenDark }}>{validComps.length} comp{validComps.length !== 1 ? "s" : ""}</div>
                </div>
              </div>
              {psfComps.length > 0 && subjectSqft > 0 && (
                <div style={{ fontSize: 12, color: C.greenDark, lineHeight: 1.5 }}>
                  Avg adjusted $/sqft: <strong>{fmtD(psfComps.reduce((s, c) => s + c.pricePerSqft, 0) / psfComps.length)}</strong> x {fmt(subjectSqft)} sqft
                </div>
              )}
            </div>

            {/* Comp breakdown table */}
            <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 16 }}>
              {adjustedComps.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < adjustedComps.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize: 13, color: C.muted }}>{c.address || `Comp ${i + 1}`}</span>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: C.muted }}>{fmtD(num(c.salePrice))}</span>
                    <span style={{ fontSize: 12, color: C.green }}>→</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{fmtD(c.adjustedPrice)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Offer strategy */}
            <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Offer Strategy</div>
            <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "end" }}>
                <div>
                  <label style={labelStyle}>Offer % of Estimated Value</label>
                  <input type="number" value={offerPercent} onChange={e => setOfferPercent(e.target.value)} style={inputStyle(true)} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Suggested Offer</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{fmtD(suggestedOffer)}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>
                At {offerPercent}%, you're {num(offerPercent) < 100 ? fmtD(estimatedValue - suggestedOffer) + " below" : num(offerPercent) > 100 ? fmtD(suggestedOffer - estimatedValue) + " above" : "at"} estimated value. {num(offerPercent) <= 95 ? "Room for negotiation built in." : num(offerPercent) <= 100 ? "Tight margin — make sure your other numbers are solid." : "Careful — you're above estimated value."}
              </div>
            </div>

            <button onClick={() => { onUsePrice(Math.round(suggestedOffer).toString()); onClose(); }} style={{
              width: "100%", padding: "14px", background: C.green, border: "none", borderRadius: 10,
              color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
            }}>Use {fmtD(suggestedOffer)} as Purchase Price</button>
          </>
        )}

        {!hasResult && (
          <div style={{ background: C.bg, borderRadius: 10, padding: "20px", textAlign: "center", color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
            Enter at least one comp with a sale price to see your valuation summary.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BUY & HOLD ───────────────────────────────────────────────────────────────
function BuyHoldAnalyzer({ standards, onScrollToPro, onEmailResults, isPro, onUpgrade, session, onDealSaved }) {
  const [f, setF] = useState({
    purchasePrice: "", downPercent: "20", interestRate: "7.5", loanTermYears: "30",
    monthlyRent: "", otherIncome: "0", propertyTax: "", insurance: "",
    hoa: "0", maintenance: "", vacancy: "8", mgmt: "0", utilities: "0",
  });
  const [result, setResult] = useState(null);
  const [showWorksheet, setShowWorksheet] = useState(false);
  const [showRentAnalysis, setShowRentAnalysis] = useState(false);
  const set = (k) => (v) => setF(prev => ({ ...prev, [k]: v }));

  const calculate = () => {
    const price = num(f.purchasePrice);
    const down = price * (num(f.downPercent) / 100);
    const loanAmt = price - down;
    const monthlyRate = num(f.interestRate) / 100 / 12;
    const n = num(f.loanTermYears) * 12;
    const mortgage = loanAmt > 0 && monthlyRate > 0
      ? loanAmt * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1) : 0;
    const grossRent = num(f.monthlyRent) + num(f.otherIncome);
    const vacancyLoss = grossRent * (num(f.vacancy) / 100);
    const effectiveIncome = grossRent - vacancyLoss;
    const opEx = num(f.propertyTax) / 12 + num(f.insurance) / 12 + num(f.hoa) +
      num(f.maintenance) + (effectiveIncome * num(f.mgmt) / 100) + num(f.utilities);
    const noi = effectiveIncome - opEx;
    const cashFlow = noi - mortgage;
    const annualCashFlow = cashFlow * 12;
    const capRate = price > 0 ? (noi * 12 / price) * 100 : 0;
    const cashOnCash = down > 0 ? (annualCashFlow / down) * 100 : 0;
    const grm = grossRent > 0 ? price / (grossRent * 12) : 0;
    const expenseRatio = effectiveIncome > 0 ? (opEx / effectiveIncome) * 100 : 0;
    const s = standards.hold;
    let verdict = "red";
    if (cashFlow >= s.greenCashFlow && capRate >= s.greenCapRate) verdict = "green";
    else if (cashFlow >= s.yellowCashFlow && capRate >= s.yellowCapRate) verdict = "yellow";
    setResult({ mortgage, grossRent, vacancyLoss, effectiveIncome, opEx, noi, cashFlow, annualCashFlow, capRate, cashOnCash, grm, expenseRatio, verdict, down, loanAmt });
    if (session) {
      supabase.from("deals").insert({
        user_id: session.user.id,
        address: f.purchasePrice ? `Deal — ${fmtD(price)}` : "Untitled Deal",
        deal_type: "hold",
        verdict,
        cash_flow: Math.round(cashFlow),
        cap_rate: Math.round(capRate * 100) / 100,
        purchase_price: Math.round(price),
        inputs: f,
      }).select().single().then(res => { dbLog("deals.insert(hold)", res); if (onDealSaved) onDealSaved(); });
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: 16 }}>
      {showWorksheet && (
        <UnderwritingWorksheet
          onClose={() => setShowWorksheet(false)}
          onUsePrice={(price) => setF(prev => ({ ...prev, purchasePrice: price }))}
        />
      )}
      {showRentAnalysis && (
        <RentAnalysisWorksheet
          onClose={() => setShowRentAnalysis(false)}
          onUseRent={(rent) => setF(prev => ({ ...prev, monthlyRent: rent }))}
        />
      )}
      <div>
        <Card>
          <SectionTitle>Purchase & Financing</SectionTitle>
          <Field label="Purchase Price" value={f.purchasePrice} onChange={set("purchasePrice")} isPro={isPro}
            proTip="Not sure what to offer? Use the Underwriting Worksheet."
            onScrollToPro={isPro ? () => setShowWorksheet(true) : onUpgrade} />
          <div style={{ height: 8 }} />
          <TwoCol>
            <Field label="Down Payment" value={f.downPercent} onChange={set("downPercent")} prefix="%" suffix="" />
            <Field label="Interest Rate" value={f.interestRate} onChange={set("interestRate")} prefix="%" />
          </TwoCol>
          <div style={{ height: 8 }} />
          <Field label="Loan Term" value={f.loanTermYears} onChange={set("loanTermYears")} prefix="" suffix="yrs" />
        </Card>
        <Card>
          <SectionTitle>Income</SectionTitle>
          <Field label="Monthly Rent" value={f.monthlyRent} onChange={set("monthlyRent")} isPro={isPro}
            proTip="Not sure what this rents for? Use the Rent Analysis Worksheet."
            onScrollToPro={isPro ? () => setShowRentAnalysis(true) : onUpgrade} />
          <div style={{ height: 8 }} />
          <TwoCol>
            <Field label="Other Income / Mo" value={f.otherIncome} onChange={set("otherIncome")} />
            <Field label="Vacancy Rate" value={f.vacancy} onChange={set("vacancy")} prefix="%" suffix="" isPro={isPro}
              proTip={isPro ? "Track actual vacancy history in your Properties." : "Pro tracks actual vacancy history across all your doors."}
              onScrollToPro={onScrollToPro} />
          </TwoCol>
        </Card>
        <Card>
          <SectionTitle>Expenses</SectionTitle>
          <TwoCol>
            <Field label="Property Tax / Yr" value={f.propertyTax} onChange={set("propertyTax")} />
            <Field label="Insurance / Yr" value={f.insurance} onChange={set("insurance")} isPro={isPro}
              proTip={isPro ? "Compare insurance quotes in the Underwriting Worksheet." : "Pro includes an Insurance Comparison Sheet."}
              onScrollToPro={onScrollToPro} />
          </TwoCol>
          <div style={{ height: 8 }} />
          <TwoCol>
            <Field label="HOA / Mo" value={f.hoa} onChange={set("hoa")} />
            <Field label="Maintenance / Mo" value={f.maintenance} onChange={set("maintenance")} isPro={isPro}
              proTip={isPro ? "Track maintenance requests in the Maintenance Tracker." : "Pro tracks every maintenance request with full paper trail."}
              onScrollToPro={onScrollToPro} />
          </TwoCol>
          <div style={{ height: 8 }} />
          <TwoCol>
            <Field label="Mgmt Fee" value={f.mgmt} onChange={set("mgmt")} prefix="%" suffix="" isPro={isPro}
              proTip={isPro ? "Compare property managers in the Underwriting Worksheet." : "Compare property managers side-by-side with Pro."}
              onScrollToPro={onScrollToPro} />
            <Field label="Utilities / Mo" value={f.utilities} onChange={set("utilities")} />
          </TwoCol>
        </Card>
        <button onClick={calculate} style={{
          width: "100%", padding: "14px", background: C.green, border: "none", borderRadius: 10,
          color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
        }}>Analyze This Deal</button>
      </div>

      {result && (
        <div>
          <VerdictCard verdict={result.verdict} value={fmtD(result.cashFlow) + "/mo"} label="Monthly Cash Flow" />
          <Card>
            <SectionTitle>Full Breakdown</SectionTitle>
            <StatRow label="Down Payment" value={fmtD(result.down)} />
            <StatRow label="Loan Amount" value={fmtD(result.loanAmt)} />
            <StatRow label="Monthly Mortgage" value={fmtD(result.mortgage)} />
            <StatRow label="Gross Rental Income" value={fmtD(result.grossRent) + "/mo"} />
            <StatRow label="Vacancy Loss" value={fmtD(result.vacancyLoss) + "/mo"} />
            <StatRow label="Effective Income" value={fmtD(result.effectiveIncome) + "/mo"} />
            <StatRow label="Operating Expenses" value={fmtD(result.opEx) + "/mo"} />
            <StatRow label="Net Operating Income" value={fmtD(result.noi) + "/mo"} />
            <StatRow label="Monthly Cash Flow" value={fmtD(result.cashFlow)} highlight />
            <StatRow label="Annual Cash Flow" value={fmtD(result.annualCashFlow)} highlight />
            <StatRow label="Cap Rate" value={fmtP(result.capRate)} highlight />
            <StatRow label="Cash-on-Cash Return" value={fmtP(result.cashOnCash)} highlight />
            <StatRow label="Gross Rent Multiplier" value={isNaN(result.grm) ? "—" : result.grm.toFixed(2) + "x"} />
            <StatRow label="Expense Ratio" value={fmtP(result.expenseRatio)} last />
          </Card>
          <div style={{ background: C.greenLight, border: `1px solid #86efac`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: C.greenDark, marginBottom: 10 }}>
            ⚙ Your standards — Green: ${standards.hold.greenCashFlow}/mo + {standards.hold.greenCapRate}% cap rate
          </div>
          <button onClick={() => onEmailResults(result)} style={{
            width: "100%", padding: "13px", background: C.white,
            border: `1.5px solid ${C.green}`, borderRadius: 10,
            color: C.green, fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", marginBottom: 10,
          }}><MessageSquare size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />Email My Results</button>
          {!isPro && (
            <div onClick={onScrollToPro} style={{
              background: "linear-gradient(135deg, #15803d, #16a34a)", borderRadius: 12,
              padding: "16px", cursor: "pointer", textAlign: "center",
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 4 }}>
                {result.verdict === "green" ? "Ready to manage this one?" : "Keep building your pipeline."}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 10 }}>
                {result.verdict === "green" ? "Pro gives you the full operating system after you close." : "Pro saves every deal. Compare side by side."}
              </div>
              <div style={{ background: C.white, borderRadius: 8, padding: "8px 20px", display: "inline-block", fontSize: 13, fontWeight: 700, color: C.green }}>
                See what Pro includes →
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── REHAB ESTIMATOR ─────────────────────────────────────────────────────────
const REHAB_ROOMS = [
  { id: "kitchen", label: "Kitchen", items: [
    { name: "Cabinets", low: 3000, high: 15000 },
    { name: "Countertops", low: 1500, high: 6000 },
    { name: "Appliances", low: 2000, high: 8000 },
    { name: "Flooring", low: 800, high: 4000 },
    { name: "Backsplash", low: 400, high: 2000 },
    { name: "Sink / Faucet", low: 200, high: 800 },
    { name: "Lighting", low: 150, high: 1000 },
    { name: "Paint", low: 150, high: 500 },
  ]},
  { id: "bathroom", label: "Bathroom", items: [
    { name: "Vanity / Sink", low: 300, high: 2500 },
    { name: "Tub / Shower", low: 500, high: 5000 },
    { name: "Tile Work", low: 800, high: 4000 },
    { name: "Toilet", low: 150, high: 600 },
    { name: "Flooring", low: 400, high: 2000 },
    { name: "Fixtures / Hardware", low: 100, high: 800 },
    { name: "Paint", low: 100, high: 300 },
  ]},
  { id: "bedroom", label: "Bedroom", items: [
    { name: "Flooring", low: 600, high: 3000 },
    { name: "Paint", low: 150, high: 500 },
    { name: "Closet / Doors", low: 200, high: 1500 },
    { name: "Lighting", low: 75, high: 500 },
    { name: "Windows", low: 300, high: 2000 },
  ]},
  { id: "living", label: "Living Areas", items: [
    { name: "Flooring", low: 1000, high: 5000 },
    { name: "Paint", low: 300, high: 1000 },
    { name: "Lighting", low: 150, high: 800 },
    { name: "Windows", low: 500, high: 3000 },
    { name: "Trim / Baseboards", low: 200, high: 1200 },
  ]},
  { id: "exterior", label: "Exterior", items: [
    { name: "Roof", low: 4000, high: 15000 },
    { name: "Siding / Paint", low: 2000, high: 10000 },
    { name: "Landscaping", low: 500, high: 5000 },
    { name: "Driveway / Walkway", low: 500, high: 4000 },
    { name: "Gutters", low: 300, high: 1500 },
    { name: "Deck / Patio", low: 500, high: 5000 },
    { name: "Fence", low: 500, high: 4000 },
  ]},
  { id: "systems", label: "Major Systems", items: [
    { name: "HVAC", low: 3000, high: 12000 },
    { name: "Electrical Panel", low: 1000, high: 4000 },
    { name: "Plumbing", low: 1000, high: 8000 },
    { name: "Water Heater", low: 800, high: 2500 },
    { name: "Foundation", low: 2000, high: 15000 },
  ]},
  { id: "general", label: "General / Permits", items: [
    { name: "Dumpster / Cleanup", low: 300, high: 1500 },
    { name: "Permits", low: 200, high: 2000 },
    { name: "Contingency (10–15%)", low: 0, high: 0 },
  ]},
];

function RehabEstimator({ onClose, onUseCost }) {
  const [costs, setCosts] = useState(() => {
    const init = {};
    REHAB_ROOMS.forEach(room => {
      init[room.id] = {};
      room.items.forEach(item => { init[room.id][item.name] = ""; });
    });
    return init;
  });
  const [expandedRoom, setExpandedRoom] = useState("kitchen");
  const [contingencyPct, setContingencyPct] = useState("10");

  const setCost = (roomId, itemName, val) => {
    setCosts(prev => ({ ...prev, [roomId]: { ...prev[roomId], [itemName]: val } }));
  };

  const roomTotal = (roomId) => {
    const room = costs[roomId];
    return Object.values(room).reduce((sum, v) => sum + num(v), 0);
  };

  const subtotal = REHAB_ROOMS.reduce((sum, room) => sum + roomTotal(room.id), 0);
  const contingency = subtotal * (num(contingencyPct) / 100);
  const grandTotal = subtotal + contingency;

  const roomsWithCosts = REHAB_ROOMS.filter(r => roomTotal(r.id) > 0);

  const inputStyle = {
    width: "100%", padding: "8px 10px",
    background: C.inputBg, border: `1.5px solid ${C.border}`,
    borderRadius: 8, fontSize: 13, color: C.text,
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{
        background: C.white, borderRadius: 16, width: "100%", maxWidth: 720,
        padding: "28px", maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>Rehab Estimator</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>Build your rehab budget room by room. Enter only what applies — skip the rest.</div>
          </div>
          <button onClick={onClose} style={{ background: C.bg, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: C.muted, flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ height: 1, background: C.border, marginBottom: 20 }} />

        {/* Running total bar */}
        <div style={{
          background: grandTotal > 0 ? C.greenLight : C.bg,
          border: `1px solid ${grandTotal > 0 ? "#86efac" : C.border}`,
          borderRadius: 10, padding: "12px 16px", marginBottom: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, zIndex: 1,
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: grandTotal > 0 ? C.greenDark : C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Rehab Estimate</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: grandTotal > 0 ? C.greenDark : C.muted }}>{fmtD(grandTotal)}</div>
          </div>
          {grandTotal > 0 && (
            <div style={{ textAlign: "right", fontSize: 12, color: C.greenDark }}>
              <div>Subtotal: {fmtD(subtotal)}</div>
              <div>Contingency ({contingencyPct}%): {fmtD(contingency)}</div>
            </div>
          )}
        </div>

        {/* Room accordion */}
        {REHAB_ROOMS.map(room => {
          const isOpen = expandedRoom === room.id;
          const total = roomTotal(room.id);
          return (
            <div key={room.id} style={{ marginBottom: 6 }}>
              <div
                onClick={() => setExpandedRoom(isOpen ? null : room.id)}
                style={{
                  background: isOpen ? C.bg : C.white,
                  border: `1px solid ${total > 0 ? "#86efac" : C.border}`,
                  borderRadius: isOpen ? "10px 10px 0 0" : 10,
                  padding: "12px 16px", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", display: "inline-block" }}>▸</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{room.label}</span>
                </div>
                {total > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.greenDark }}>{fmtD(total)}</span>
                )}
              </div>
              {isOpen && (
                <div style={{
                  background: C.bg, border: `1px solid ${C.border}`, borderTop: "none",
                  borderRadius: "0 0 10px 10px", padding: "12px 16px",
                }}>
                  {room.items.map(item => (
                    <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>
                          {item.name}
                          {item.low > 0 && <span style={{ fontWeight: 400, color: C.mutedLight }}> · {fmtD(item.low)}–{fmtD(item.high)}</span>}
                        </label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.mutedLight, fontSize: 12 }}>$</span>
                          <input
                            type="number"
                            value={costs[room.id][item.name]}
                            onChange={e => setCost(room.id, item.name, e.target.value)}
                            placeholder="0"
                            style={{ ...inputStyle, paddingLeft: 22 }}
                          />
                        </div>
                      </div>
                      {item.low > 0 && (
                        <div style={{ display: "flex", gap: 4, paddingTop: 18 }}>
                          <button onClick={() => setCost(room.id, item.name, String(item.low))} style={{
                            background: C.white, border: `1px solid ${C.border}`, borderRadius: 6,
                            padding: "4px 8px", fontSize: 10, fontWeight: 600, color: C.muted,
                            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                          }}>Low</button>
                          <button onClick={() => setCost(room.id, item.name, String(Math.round((item.low + item.high) / 2)))} style={{
                            background: C.white, border: `1px solid ${C.border}`, borderRadius: 6,
                            padding: "4px 8px", fontSize: 10, fontWeight: 600, color: C.muted,
                            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                          }}>Mid</button>
                          <button onClick={() => setCost(room.id, item.name, String(item.high))} style={{
                            background: C.white, border: `1px solid ${C.border}`, borderRadius: 6,
                            padding: "4px 8px", fontSize: 10, fontWeight: 600, color: C.muted,
                            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                          }}>High</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Contingency */}
        <div style={{ marginTop: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Contingency</div>
          <div style={{ background: C.bg, borderRadius: 10, padding: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "end" }}>
              <div>
                <label style={labelStyle}>Contingency %</label>
                <input type="number" value={contingencyPct} onChange={e => setContingencyPct(e.target.value)} placeholder="10" style={inputStyle} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Contingency Amount</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{fmtD(contingency)}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>
              Most flippers budget 10–15%. Covers surprises behind walls, permit overruns, and scope creep.
            </div>
          </div>
        </div>

        {/* Summary breakdown */}
        {roomsWithCosts.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Cost Breakdown</div>
            <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 20 }}>
              {roomsWithCosts.map((room, i) => (
                <div key={room.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 0", borderBottom: i < roomsWithCosts.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <span style={{ fontSize: 13, color: C.muted }}>{room.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{fmtD(roomTotal(room.id))}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderTop: `1px solid ${C.border}`, marginTop: 4 }}>
                <span style={{ fontSize: 13, color: C.muted }}>Contingency ({contingencyPct}%)</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{fmtD(contingency)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 2px", borderTop: `2px solid ${C.green}`, marginTop: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.greenDark }}>Grand Total</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.greenDark }}>{fmtD(grandTotal)}</span>
              </div>
            </div>
          </>
        )}

        {/* Use button */}
        <button
          onClick={() => { onUseCost(Math.round(grandTotal).toString()); onClose(); }}
          disabled={grandTotal <= 0}
          style={{
            width: "100%", padding: "14px", background: grandTotal > 0 ? C.green : C.border,
            border: "none", borderRadius: 10, color: C.white, fontSize: 15, fontWeight: 700,
            cursor: grandTotal > 0 ? "pointer" : "default",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: grandTotal > 0 ? "0 2px 8px rgba(22,163,74,0.3)" : "none",
          }}
        >
          {grandTotal > 0 ? `Use ${fmtD(grandTotal)} as Rehab Cost` : "Enter costs above to continue"}
        </button>
      </div>
    </div>
  );
}

// ─── FIX & FLIP ───────────────────────────────────────────────────────────────
function FixFlipAnalyzer({ standards, onScrollToPro, onEmailResults, isPro, onUpgrade, session, onDealSaved }) {
  const [f, setF] = useState({
    purchasePrice: "", closingCostsBuy: "3", rehabCost: "",
    holdingMonths: "6", monthlyHolding: "", arvEstimate: "",
    closingCostsSell: "8", financeAmt: "", interestRate: "10",
    points: "2",
  });
  const [result, setResult] = useState(null);
  const [showRehab, setShowRehab] = useState(false);
  const [showCompTracker, setShowCompTracker] = useState(false);
  const set = (k) => (v) => setF(prev => ({ ...prev, [k]: v }));

  const calculate = () => {
    const purchase = num(f.purchasePrice);
    const buyClose = purchase * (num(f.closingCostsBuy) / 100);
    const rehab = num(f.rehabCost);
    const holdMo = num(f.holdingMonths);
    const holdCost = num(f.monthlyHolding) * holdMo;
    const arv = num(f.arvEstimate);
    const sellClose = arv * (num(f.closingCostsSell) / 100);
    const interestCost = num(f.financeAmt) * (num(f.interestRate) / 100) * (holdMo / 12);
    const pointsCost = num(f.financeAmt) * (num(f.points) / 100);
    const totalIn = purchase + buyClose + rehab + holdCost + interestCost + pointsCost;
    const netProfit = arv - sellClose - totalIn;
    const roi = totalIn > 0 ? (netProfit / totalIn) * 100 : 0;
    const arvSpread = arv > 0 ? ((arv - purchase) / arv) * 100 : 0;
    const maxAllowable = arv * 0.7 - rehab;
    const s = standards.flip;
    let verdict = "red";
    if (netProfit >= s.greenProfit && roi >= s.greenROI) verdict = "green";
    else if (netProfit >= s.yellowProfit && roi >= s.yellowROI) verdict = "yellow";
    setResult({ buyClose, holdCost, interestCost, pointsCost, totalIn, sellClose, netProfit, roi, arvSpread, maxAllowable, arv, verdict });
    if (session) {
      supabase.from("deals").insert({
        user_id: session.user.id,
        address: f.purchasePrice ? `Flip — ${fmtD(purchase)}` : "Untitled Flip",
        deal_type: "flip",
        verdict,
        net_profit: Math.round(netProfit),
        roi: Math.round(roi * 100) / 100,
        purchase_price: Math.round(purchase),
        inputs: f,
      }).select().single().then(res => { dbLog("deals.insert(flip)", res); if (onDealSaved) onDealSaved(); });
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: 16 }}>
      {showRehab && (
        <RehabEstimator
          onClose={() => setShowRehab(false)}
          onUseCost={(cost) => setF(prev => ({ ...prev, rehabCost: cost }))}
        />
      )}
      {showCompTracker && (
        <CompTrackerSheet
          onClose={() => setShowCompTracker(false)}
          onUseARV={(arv) => setF(prev => ({ ...prev, arvEstimate: arv }))}
        />
      )}
      <div>
        <Card>
          <SectionTitle>Acquisition</SectionTitle>
          <Field label="Purchase Price" value={f.purchasePrice} onChange={set("purchasePrice")} />
          <div style={{ height: 8 }} />
          <TwoCol>
            <Field label="Buy Closing Costs" value={f.closingCostsBuy} onChange={set("closingCostsBuy")} prefix="%" suffix="" />
            <Field label="Rehab / Repair Cost" value={f.rehabCost} onChange={set("rehabCost")} isPro={isPro}
              proTip="Don't guess rehab. Use the Rehab Estimator."
              onScrollToPro={isPro ? () => setShowRehab(true) : onUpgrade} />
          </TwoCol>
        </Card>
        <Card>
          <SectionTitle>Holding Costs</SectionTitle>
          <TwoCol>
            <Field label="Hold Period" value={f.holdingMonths} onChange={set("holdingMonths")} prefix="" suffix="mo" isPro={isPro}
              proTip={isPro ? "Use the Holding Cost Calculator to plan your timeline." : "Pro includes a Project Timeline Tracker for your flip."}
              onScrollToPro={onScrollToPro} />
            <Field label="Monthly Hold Cost" value={f.monthlyHolding} onChange={set("monthlyHolding")} />
          </TwoCol>
          <div style={{ height: 8 }} />
          <Field label="Finance Amount" value={f.financeAmt} onChange={set("financeAmt")} />
          <div style={{ height: 8 }} />
          <TwoCol>
            <Field label="Interest Rate" value={f.interestRate} onChange={set("interestRate")} prefix="%" suffix="" isPro={isPro}
              proTip={isPro ? "Compare hard money lenders in the Underwriting Worksheet." : "Compare hard money lenders side by side with Pro."}
              onScrollToPro={onScrollToPro} />
            <Field label="Points (Origination Fee)" value={f.points} onChange={set("points")} prefix="%" suffix="" />
          </TwoCol>
        </Card>
        <Card>
          <SectionTitle>Exit</SectionTitle>
          <Field label="After Repair Value (ARV)" value={f.arvEstimate} onChange={set("arvEstimate")} isPro={isPro}
            proTip="Build a confident ARV with the Comp Tracker."
            onScrollToPro={isPro ? () => setShowCompTracker(true) : onUpgrade} />
          <div style={{ height: 8 }} />
          <div style={{ position: "relative" }}>
            <Field label="Sell Closing Costs" value={f.closingCostsSell} onChange={set("closingCostsSell")} prefix="%" suffix="" />
            <div style={{ fontSize: 11, color: C.mutedLight, marginTop: -6, marginBottom: 4, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 4 }}>
              <HelpCircle size={12} color={C.mutedLight} style={{ flexShrink: 0, marginTop: 1 }} />
              Agent commissions, title insurance, transfer taxes, escrow — typically 6–8% total.
            </div>
          </div>
        </Card>
        <button onClick={calculate} style={{
          width: "100%", padding: "14px", background: C.green, border: "none", borderRadius: 10,
          color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
        }}>Analyze This Flip</button>
      </div>

      {result && (
        <div>
          <VerdictCard verdict={result.verdict} value={fmtD(result.netProfit)} label="Net Profit" />
          <Card>
            <SectionTitle>Full Breakdown</SectionTitle>
            <StatRow label="Purchase Price" value={fmtD(num(f.purchasePrice))} />
            <StatRow label="Buy Closing Costs" value={fmtD(result.buyClose)} />
            <StatRow label="Rehab Cost" value={fmtD(num(f.rehabCost))} />
            <StatRow label="Holding Costs" value={fmtD(result.holdCost)} />
            <StatRow label="Interest / Finance Cost" value={fmtD(result.interestCost)} />
            <StatRow label="Points (Origination Fee)" value={fmtD(result.pointsCost)} />
            <StatRow label="Total Money In" value={fmtD(result.totalIn)} />
            <StatRow label="ARV (Sale Price)" value={fmtD(result.arv)} />
            <StatRow label="Sell Closing Costs" value={fmtD(result.sellClose)} />
            <StatRow label="Net Profit" value={fmtD(result.netProfit)} highlight />
            <StatRow label="ROI" value={fmtP(result.roi)} highlight />
            <StatRow label="ARV Spread" value={fmtP(result.arvSpread)} />
            <StatRow label="Max Allowable Offer (70% Rule)" value={fmtD(result.maxAllowable)} last />
          </Card>
          <Card style={{ background: C.greenLight, border: `1px solid #86efac` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>70% Rule</div>
            <div style={{ fontSize: 13, color: C.greenDark, lineHeight: 1.6 }}>
              Never pay more than 70% of ARV minus rehab. Your max allowable offer is <strong>{fmtD(result.maxAllowable)}</strong>.
            </div>
          </Card>
          <button onClick={() => onEmailResults(result)} style={{
            width: "100%", padding: "13px", background: C.white,
            border: `1.5px solid ${C.green}`, borderRadius: 10,
            color: C.green, fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", marginBottom: 10,
          }}><MessageSquare size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />Email My Results</button>
          {!isPro && (
            <div onClick={onScrollToPro} style={{
              background: "linear-gradient(135deg, #15803d, #16a34a)", borderRadius: 12,
              padding: "16px", cursor: "pointer", textAlign: "center",
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 4 }}>
                {result.verdict === "green" ? "This flip pencils out. Go deeper with Pro." : "Keep running numbers."}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 10 }}>
                Rehab Estimator, Comp Tracker, Deal Pipeline — all in Pro.
              </div>
              <div style={{ background: C.white, borderRadius: 8, padding: "8px 20px", display: "inline-block", fontSize: 13, fontWeight: 700, color: C.green }}>
                See what Pro includes →
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RENT ANALYSIS WORKSHEET ────────────────────────────────────────────────
function RentAnalysisWorksheet({ onClose, onUseRent }) {
  const [subject, setSubject] = useState({ beds: "", baths: "", sqft: "", condition: "Average" });
  const [comps, setComps] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const blank = { address: "", beds: "", baths: "", sqft: "", rent: "", condition: "Average", distance: "" };
  const [draft, setDraft] = useState(blank);
  const d = (k) => (e) => setDraft(prev => ({ ...prev, [k]: e.target.value }));
  const conditions = ["Excellent", "Good", "Average", "Fair", "Poor"];

  const saveComp = () => {
    if (!draft.rent) return;
    if (editIdx !== null) {
      setComps(prev => prev.map((c, i) => i === editIdx ? draft : c));
      setEditIdx(null);
    } else {
      setComps(prev => [...prev, draft]);
    }
    setDraft(blank);
    setShowAdd(false);
  };

  const rents = comps.map(c => num(c.rent)).filter(r => r > 0);
  const avgRent = rents.length > 0 ? rents.reduce((a, b) => a + b, 0) / rents.length : 0;
  const lowRent = rents.length > 0 ? Math.min(...rents) : 0;
  const highRent = rents.length > 0 ? Math.max(...rents) : 0;
  const midRent = rents.length > 0 ? Math.round((lowRent + highRent) / 2) : 0;
  const recommended = Math.round(avgRent);

  const ol = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 };
  const bx = { background: C.white, borderRadius: 16, width: "100%", maxWidth: 600, padding: "28px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" };
  const inp = { width: "100%", padding: "10px 12px", background: C.inputBg, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 };
  const row2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };

  return (
    <div style={ol}>
      <div style={bx} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Rent Analysis Worksheet</div>
          <button onClick={onClose} style={{ background: C.bg, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: C.muted, flexShrink: 0 }}><X size={16} /></button>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject Property</div>
        <div style={{ ...row2, marginBottom: 6 }}>
          <div><label style={lbl}>Beds</label><input style={inp} value={subject.beds} onChange={e => setSubject(p => ({ ...p, beds: e.target.value }))} placeholder="3" /></div>
          <div><label style={lbl}>Baths</label><input style={inp} value={subject.baths} onChange={e => setSubject(p => ({ ...p, baths: e.target.value }))} placeholder="2" /></div>
        </div>
        <div style={{ ...row2, marginBottom: 16 }}>
          <div><label style={lbl}>Sq Ft</label><input style={inp} value={subject.sqft} onChange={e => setSubject(p => ({ ...p, sqft: e.target.value }))} placeholder="1,200" /></div>
          <div><label style={lbl}>Condition</label>
            <select style={inp} value={subject.condition} onChange={e => setSubject(p => ({ ...p, condition: e.target.value }))}>
              {conditions.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ height: 1, background: C.border, margin: "16px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Comparable Rentals ({comps.length}/4)</div>
          {comps.length < 4 && <button onClick={() => { setDraft(blank); setEditIdx(null); setShowAdd(true); }} style={{ background: C.green, border: "none", borderRadius: 6, padding: "6px 14px", color: C.white, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+ Add Comp</button>}
        </div>

        {comps.length === 0 && <div style={{ background: C.bg, border: `1.5px dashed ${C.border}`, borderRadius: 10, padding: "28px 16px", textAlign: "center", fontSize: 13, color: C.muted, marginBottom: 16 }}>Add comparable rentals to analyze market rent.</div>}

        {comps.map((c, i) => (
          <div key={i} style={{ background: C.bg, borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{c.address || `Comp ${i + 1}`}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{c.beds}bd / {c.baths}ba / {num(c.sqft).toLocaleString()} sqft — {fmtD(num(c.rent))}/mo</div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => { setDraft(c); setEditIdx(i); setShowAdd(true); }} style={{ background: "none", border: "none", fontSize: 11, fontWeight: 600, color: C.mutedLight, cursor: "pointer" }}>Edit</button>
              <button onClick={() => setComps(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", fontSize: 11, fontWeight: 600, color: C.red, cursor: "pointer" }}>Remove</button>
            </div>
          </div>
        ))}

        {showAdd && (
          <div style={{ background: C.bg, borderRadius: 12, padding: 16, marginBottom: 12, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>{editIdx !== null ? "Edit" : "Add"} Comparable Rental</div>
            <div style={{ marginBottom: 6 }}><label style={lbl}>Address</label><input style={inp} value={draft.address} onChange={d("address")} placeholder="123 Main St" /></div>
            <div style={{ ...row2, marginBottom: 6 }}>
              <div><label style={lbl}>Beds</label><input style={inp} value={draft.beds} onChange={d("beds")} placeholder="3" /></div>
              <div><label style={lbl}>Baths</label><input style={inp} value={draft.baths} onChange={d("baths")} placeholder="2" /></div>
            </div>
            <div style={{ ...row2, marginBottom: 6 }}>
              <div><label style={lbl}>Sq Ft</label><input style={inp} value={draft.sqft} onChange={d("sqft")} placeholder="1,200" /></div>
              <div><label style={lbl}>Monthly Rent ($)</label><input style={inp} value={draft.rent} onChange={d("rent")} placeholder="1,500" /></div>
            </div>
            <div style={{ ...row2, marginBottom: 10 }}>
              <div><label style={lbl}>Condition</label>
                <select style={inp} value={draft.condition} onChange={d("condition")}>
                  {conditions.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Distance (mi)</label><input style={inp} value={draft.distance} onChange={d("distance")} placeholder="0.5" /></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveComp} style={{ background: C.green, border: "none", borderRadius: 8, padding: "10px 20px", color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{editIdx !== null ? "Update" : "Add"}</button>
              <button onClick={() => { setShowAdd(false); setEditIdx(null); }} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, color: C.muted, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
            </div>
          </div>
        )}

        {rents.length > 0 && (
          <>
            <div style={{ height: 1, background: C.border, margin: "16px 0" }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Market Rent Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[["Low", lowRent], ["Mid", midRent], ["High", highRent]].map(([l, v]) => (
                <div key={l} style={{ background: C.bg, borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{fmtD(v)}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.greenLight, borderRadius: 10, padding: "16px", textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.greenDark, marginBottom: 4 }}>Average Market Rent</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.greenDark }}>{fmtD(recommended)}<span style={{ fontSize: 14, fontWeight: 600 }}>/mo</span></div>
            </div>
            {onUseRent && (
              <button onClick={() => onUseRent(String(recommended))} style={{ width: "100%", padding: "14px", background: C.green, border: "none", borderRadius: 10, color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.3)" }}>
                Use {fmtD(recommended)} as Monthly Rent
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── COMP TRACKER / ARV SHEET ───────────────────────────────────────────────
function CompTrackerSheet({ onClose, onUseARV }) {
  const [subject, setSubject] = useState({ address: "", sqft: "", beds: "", baths: "", condition: "Average" });
  const [comps, setComps] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const blank = { address: "", salePrice: "", sqft: "", beds: "", baths: "", condition: "Average", saleDate: "", distance: "" };
  const [draft, setDraft] = useState(blank);
  const d = (k) => (e) => setDraft(prev => ({ ...prev, [k]: e.target.value }));
  const conditions = ["Excellent", "Good", "Average", "Fair", "Poor"];
  const condAdj = { Excellent: 1.1, Good: 1.05, Average: 1, Fair: 0.95, Poor: 0.9 };

  const saveComp = () => {
    if (!draft.salePrice) return;
    if (editIdx !== null) {
      setComps(prev => prev.map((c, i) => i === editIdx ? draft : c));
      setEditIdx(null);
    } else {
      setComps(prev => [...prev, draft]);
    }
    setDraft(blank);
    setShowAdd(false);
  };

  const adjustedComps = comps.map(c => {
    const ppsf = num(c.sqft) > 0 ? num(c.salePrice) / num(c.sqft) : 0;
    const subjectCond = condAdj[subject.condition] || 1;
    const compCond = condAdj[c.condition] || 1;
    const adjFactor = subjectCond / compCond;
    const adjPpsf = ppsf * adjFactor;
    return { ...c, ppsf, adjPpsf };
  });

  const validComps = adjustedComps.filter(c => c.adjPpsf > 0);
  const avgAdjPpsf = validComps.length > 0 ? validComps.reduce((s, c) => s + c.adjPpsf, 0) / validComps.length : 0;
  const subSqft = num(subject.sqft);
  const estimatedARV = subSqft > 0 && avgAdjPpsf > 0 ? Math.round(avgAdjPpsf * subSqft) : 0;
  const lowARV = validComps.length > 0 ? Math.round(Math.min(...validComps.map(c => c.adjPpsf)) * subSqft) : 0;
  const highARV = validComps.length > 0 ? Math.round(Math.max(...validComps.map(c => c.adjPpsf)) * subSqft) : 0;

  const ol = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 };
  const bx = { background: C.white, borderRadius: 16, width: "100%", maxWidth: 640, padding: "28px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" };
  const inp = { width: "100%", padding: "10px 12px", background: C.inputBg, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 };
  const row2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };

  return (
    <div style={ol}>
      <div style={bx} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Comp Tracker / ARV Sheet</div>
          <button onClick={onClose} style={{ background: C.bg, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: C.muted, flexShrink: 0 }}><X size={16} /></button>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject Property</div>
        <div style={{ marginBottom: 6 }}><label style={lbl}>Address</label><input style={inp} value={subject.address} onChange={e => setSubject(p => ({ ...p, address: e.target.value }))} placeholder="456 Elm St" /></div>
        <div style={{ ...row2, marginBottom: 6 }}>
          <div><label style={lbl}>Sq Ft</label><input style={inp} value={subject.sqft} onChange={e => setSubject(p => ({ ...p, sqft: e.target.value }))} placeholder="1,400" /></div>
          <div><label style={lbl}>Condition</label>
            <select style={inp} value={subject.condition} onChange={e => setSubject(p => ({ ...p, condition: e.target.value }))}>
              {conditions.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ ...row2, marginBottom: 16 }}>
          <div><label style={lbl}>Beds</label><input style={inp} value={subject.beds} onChange={e => setSubject(p => ({ ...p, beds: e.target.value }))} placeholder="3" /></div>
          <div><label style={lbl}>Baths</label><input style={inp} value={subject.baths} onChange={e => setSubject(p => ({ ...p, baths: e.target.value }))} placeholder="2" /></div>
        </div>

        <div style={{ height: 1, background: C.border, margin: "16px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Comparable Sales ({comps.length}/5)</div>
          {comps.length < 5 && <button onClick={() => { setDraft(blank); setEditIdx(null); setShowAdd(true); }} style={{ background: C.green, border: "none", borderRadius: 6, padding: "6px 14px", color: C.white, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+ Add Comp</button>}
        </div>

        {comps.length === 0 && <div style={{ background: C.bg, border: `1.5px dashed ${C.border}`, borderRadius: 10, padding: "28px 16px", textAlign: "center", fontSize: 13, color: C.muted, marginBottom: 16 }}>Add comparable sales to estimate ARV.</div>}

        {adjustedComps.map((c, i) => (
          <div key={i} style={{ background: C.bg, borderRadius: 10, padding: "12px 16px", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{c.address || `Comp ${i + 1}`}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{c.beds}bd / {c.baths}ba / {num(c.sqft).toLocaleString()} sqft — {fmtD(num(c.salePrice))}</div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => { setDraft(comps[i]); setEditIdx(i); setShowAdd(true); }} style={{ background: "none", border: "none", fontSize: 11, fontWeight: 600, color: C.mutedLight, cursor: "pointer" }}>Edit</button>
                <button onClick={() => setComps(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", fontSize: 11, fontWeight: 600, color: C.red, cursor: "pointer" }}>Remove</button>
              </div>
            </div>
            {c.adjPpsf > 0 && (
              <div style={{ fontSize: 11, fontWeight: 600, color: C.greenDark, marginTop: 4 }}>
                ${c.ppsf.toFixed(2)}/sqft → Adj: ${c.adjPpsf.toFixed(2)}/sqft
              </div>
            )}
          </div>
        ))}

        {showAdd && (
          <div style={{ background: C.bg, borderRadius: 12, padding: 16, marginBottom: 12, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>{editIdx !== null ? "Edit" : "Add"} Comparable Sale</div>
            <div style={{ marginBottom: 6 }}><label style={lbl}>Address</label><input style={inp} value={draft.address} onChange={d("address")} placeholder="789 Oak Ave" /></div>
            <div style={{ ...row2, marginBottom: 6 }}>
              <div><label style={lbl}>Sale Price ($)</label><input style={inp} value={draft.salePrice} onChange={d("salePrice")} placeholder="285,000" /></div>
              <div><label style={lbl}>Sq Ft</label><input style={inp} value={draft.sqft} onChange={d("sqft")} placeholder="1,350" /></div>
            </div>
            <div style={{ ...row2, marginBottom: 6 }}>
              <div><label style={lbl}>Beds</label><input style={inp} value={draft.beds} onChange={d("beds")} placeholder="3" /></div>
              <div><label style={lbl}>Baths</label><input style={inp} value={draft.baths} onChange={d("baths")} placeholder="2" /></div>
            </div>
            <div style={{ ...row2, marginBottom: 6 }}>
              <div><label style={lbl}>Condition</label>
                <select style={inp} value={draft.condition} onChange={d("condition")}>
                  {conditions.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Sale Date</label><input style={inp} type="date" value={draft.saleDate} onChange={d("saleDate")} /></div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={lbl}>Distance (mi)</label><input style={{ ...inp, maxWidth: "50%" }} value={draft.distance} onChange={d("distance")} placeholder="0.3" />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveComp} style={{ background: C.green, border: "none", borderRadius: 8, padding: "10px 20px", color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{editIdx !== null ? "Update" : "Add"}</button>
              <button onClick={() => { setShowAdd(false); setEditIdx(null); }} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, color: C.muted, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
            </div>
          </div>
        )}

        {estimatedARV > 0 && (
          <>
            <div style={{ height: 1, background: C.border, margin: "16px 0" }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>ARV Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[["Low", lowARV], ["Estimated", estimatedARV], ["High", highARV]].map(([l, v]) => (
                <div key={l} style={{ background: l === "Estimated" ? C.greenLight : C.bg, borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: l === "Estimated" ? C.greenDark : C.muted, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: l === "Estimated" ? C.greenDark : C.text }}>{fmtD(v)}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.bg, borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 12, color: C.muted }}>
              Avg Adjusted $/sqft: <strong>${avgAdjPpsf.toFixed(2)}</strong> &middot; Confidence Range: {fmtD(lowARV)} &ndash; {fmtD(highARV)}
            </div>
            {onUseARV && (
              <button onClick={() => onUseARV(String(estimatedARV))} style={{ width: "100%", padding: "14px", background: C.green, border: "none", borderRadius: 10, color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.3)" }}>
                Use {fmtD(estimatedARV)} as ARV
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── PROPERTY TOOLS ──────────────────────────────────────────────────────────

const _modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto", WebkitOverflowScrolling: "touch" };
const _modalBox = { background: C.white, borderRadius: 16, width: "100%", maxWidth: 520, padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", margin: "auto 0", flexShrink: 0 };
const _modalHeader = (title, onClose) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
    <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{title}</div>
    <button onClick={onClose} style={{ background: C.bg, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: C.muted, flexShrink: 0 }}><X size={16} /></button>
  </div>
);
const _modalInput = { width: "100%", padding: "10px 12px", background: C.inputBg, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" };
const _modalLabel = { display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 };
const _modalSubmit = (label) => ({ width: "100%", padding: "14px", background: C.green, border: "none", borderRadius: 10, color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.3)", marginTop: 16 });
const _addBtn = { background: C.green, border: "none", borderRadius: 8, padding: "10px 20px", color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.3)" };
const _editBtn = { background: "none", border: "none", fontSize: 11, fontWeight: 600, color: C.mutedLight, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: "2px 6px" };
const _emptyState = (msg, btnLabel, onClick) => (
  <div style={{ background: C.white, border: `1.5px dashed ${C.border}`, borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
    <div style={{ marginBottom: 12, opacity: 0.3, display: "flex", justifyContent: "center" }}><ClipboardList size={36} color={C.green} /></div>
    <div style={{ fontSize: 15, fontWeight: 600, color: C.muted, marginBottom: 16, lineHeight: 1.5 }}>{msg}</div>
    <button onClick={onClick} style={_addBtn}>{btnLabel}</button>
  </div>
);

function CashFlowTracker({ session }) {
  const [records, setRecords] = useState([]);
  const [maintenanceCosts, setMaintenanceCosts] = useState([]); // closed maintenance items with costs
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // null | { editing?: index }
  const [form, setForm] = useState({ month: "", property: "", projected: "", actual: "" });
  const [selectedProperty, setSelectedProperty] = useState("all");

  useEffect(() => {
    if (!session) return;
    Promise.all([
      supabase.from("cash_flow_entries").select("*").order("created_at", { ascending: false }),
      supabase.from("maintenance_items").select("*").eq("status", "closed"),
    ]).then(([cfRes, maintRes]) => {
      dbLog("cash_flow_entries.select", cfRes);
      dbLog("maintenance_items.closed(for cashflow)", maintRes);
      setRecords((cfRes.data || []).map(r => ({ ...r, month: r.month, property: r.property_id || "", projected: r.projected_cash_flow || 0, actual: (r.actual_rent || 0) - (r.actual_expenses || 0) })));
      setMaintenanceCosts((maintRes.data || []).filter(m => m.cost > 0));
      setLoading(false);
    });
  }, [session]);

  const openAdd = () => { setForm({ month: "", property: "", projected: "", actual: "" }); setModal({}); };
  const openEdit = (i) => { const r = records[i]; setForm({ month: r.month, property: r.property, projected: String(r.projected), actual: String(r.actual) }); setModal({ editing: i }); };
  const save = async () => {
    const entry = { month: form.month, property: form.property, projected: num(form.projected), actual: num(form.actual) };
    if (!entry.month || !entry.property) return;
    setSaving(true);
    if (modal.editing !== undefined) {
      const rec = records[modal.editing];
      if (rec.id) {
        const res = await supabase.from("cash_flow_entries").update({ month: entry.month, property_id: entry.property, projected_cash_flow: entry.projected, actual_rent: entry.actual, actual_expenses: 0 }).eq("id", rec.id).select().single();
        dbLog("cash_flow_entries.update", res);
      }
      setRecords(prev => prev.map((r, i) => i === modal.editing ? { ...r, ...entry } : r));
    } else {
      const res = await supabase.from("cash_flow_entries").insert({ user_id: session.user.id, month: entry.month, property_id: entry.property, projected_cash_flow: entry.projected, actual_rent: entry.actual, actual_expenses: 0 }).select().single();
      dbLog("cash_flow_entries.insert", res);
      setRecords(prev => [{ ...entry, id: res.data?.id }, ...prev]);
    }
    setSaving(false);
    setModal(null);
  };

  const properties = ["all", ...[...new Set(records.map(r => r.property))]];
  const filtered = selectedProperty === "all" ? records : records.filter(r => r.property === selectedProperty);
  const months = [...new Set(records.map(r => r.month))];
  // Group closed maintenance costs by property and month (using closed_date month name)
  const getMaintenanceCostForMonth = (month, property) => {
    return maintenanceCosts.filter(m => {
      if (property !== "all" && m.property_id !== property) return false;
      if (!m.closed_date) return false;
      // Match by month name from closed_date (e.g. "Jan", "Feb")
      const closedMonth = new Date(m.closed_date).toLocaleDateString("en-US", { month: "short" });
      return closedMonth.toLowerCase().startsWith(month.toLowerCase().slice(0, 3)) || month.toLowerCase().startsWith(closedMonth.toLowerCase().slice(0, 3));
    }).reduce((s, m) => s + (m.cost || 0), 0);
  };
  const monthlyTotals = months.map(m => {
    const rows = filtered.filter(r => r.month === m);
    const maintCost = getMaintenanceCostForMonth(m, selectedProperty);
    return { month: m, projected: rows.reduce((s, r) => s + r.projected, 0), actual: rows.reduce((s, r) => s + r.actual, 0) - maintCost, maintenanceCost: maintCost };
  });
  const totalProjected = monthlyTotals.reduce((s, m) => s + m.projected, 0);
  const totalActual = monthlyTotals.reduce((s, m) => s + m.actual, 0);

  const rowStyle = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 60px", padding: "12px 16px", alignItems: "center" };
  const headerStyle = { fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" };

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 14 }}>Loading cash flow data...</div>;
  if (records.length === 0 && !modal) return _emptyState("No cash flow records yet. Add your first month to start tracking.", "+ Add Month", openAdd);

  return (
    <div>
      {modal && (
        <div style={_modalOverlay}><div style={_modalBox}>
          {_modalHeader(modal.editing !== undefined ? "Edit Record" : "Add Cash Flow Record", () => setModal(null))}
          <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Month</label><input value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} placeholder="e.g. Jan" style={_modalInput} /></div>
          <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Property</label><input value={form.property} onChange={e => setForm(p => ({ ...p, property: e.target.value }))} placeholder="e.g. 123 Oak St" style={_modalInput} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Projected</label><input type="number" value={form.projected} onChange={e => setForm(p => ({ ...p, projected: e.target.value }))} placeholder="0" style={_modalInput} /></div>
            <div><label style={_modalLabel}>Actual</label><input type="number" value={form.actual} onChange={e => setForm(p => ({ ...p, actual: e.target.value }))} placeholder="0" style={_modalInput} /></div>
          </div>
          <button onClick={save} disabled={saving} style={{ ..._modalSubmit(), opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : modal.editing !== undefined ? "Save Changes" : "Add Record"}</button>
        </div></div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <select value={selectedProperty} onChange={e => setSelectedProperty(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600, color: C.text, background: C.white, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
          {properties.map(p => <option key={p} value={p}>{p === "all" ? "All Properties" : p}</option>)}
        </select>
        <button onClick={openAdd} style={_addBtn}>+ Add Month</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <DashStatCard label="Total Projected" value={fmtD(totalProjected)} />
        <DashStatCard label="Total Actual" value={fmtD(totalActual)} />
        {monthlyTotals.length > 0 && <DashStatCard label="Best Month" value={monthlyTotals.reduce((b, m) => m.actual > b.actual ? m : b).month} sub={` (${fmtD(monthlyTotals.reduce((b, m) => m.actual > b.actual ? m : b).actual)})`} />}
        {monthlyTotals.length > 0 && <DashStatCard label="Worst Month" value={monthlyTotals.reduce((w, m) => m.actual < w.actual ? m : w).month} sub={` (${fmtD(monthlyTotals.reduce((w, m) => m.actual < w.actual ? m : w).actual)})`} />}
      </div>

      {monthlyTotals.length > 1 && (
        <div style={{ background: "#111827", borderRadius: 14, padding: "24px 20px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={18} color="#22C55E" />
              <span style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC", fontFamily: "'DM Sans', sans-serif" }}>Cash Flow Trend</span>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 3, borderRadius: 2, background: "#22C55E" }} /><span style={{ fontSize: 11, color: "#9CA3AF" }}>Actual</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 3, borderRadius: 2, background: "#374151" }} /><span style={{ fontSize: 11, color: "#9CA3AF" }}>Projected</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={[...monthlyTotals].reverse()} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="cfGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => "$" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)} />
              <Tooltip
                contentStyle={{ background: "#1F2937", border: "1px solid #374151", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}
                labelStyle={{ color: "#9CA3AF", fontWeight: 600 }}
                itemStyle={{ color: "#F8FAFC" }}
                formatter={(value) => ["$" + fmt(value)]}
              />
              <Area type="monotone" dataKey="projected" stroke="#374151" strokeWidth={2} fill="none" dot={false} />
              <Area type="monotone" dataKey="actual" stroke="#22C55E" strokeWidth={2.5} fill="url(#cfGreen)" dot={{ fill: "#22C55E", r: 3, strokeWidth: 0 }} style={{ filter: "drop-shadow(0 0 6px rgba(34,197,94,0.5))" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ ...rowStyle, borderBottom: `1px solid ${C.border}`, background: C.bg }}>
          <span style={headerStyle}>Month</span><span style={headerStyle}>Projected</span><span style={headerStyle}>Actual</span><span style={{ ...headerStyle, textAlign: "right" }}>Variance</span><span />
        </div>
        {monthlyTotals.map((m, i) => {
          const variance = m.actual - m.projected;
          const idx = records.findIndex(r => r.month === m.month && (selectedProperty === "all" || r.property === selectedProperty));
          return (
            <div key={m.month} style={{ ...rowStyle, borderBottom: i < monthlyTotals.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{m.month}</span>
              <span style={{ fontSize: 13, color: C.muted }}>{fmtD(m.projected)}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                {fmtD(m.actual)}
                {m.maintenanceCost > 0 && <span style={{ fontSize: 10, color: C.yellow, fontWeight: 600, marginLeft: 4 }}>(-{fmtD(m.maintenanceCost)} maint.)</span>}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: variance >= 0 ? C.green : C.red, textAlign: "right" }}>{variance >= 0 ? "+" : ""}{fmtD(variance)}</span>
              <span style={{ textAlign: "right" }}>{idx >= 0 && <button onClick={() => openEdit(idx)} style={_editBtn}>Edit</button>}</span>
            </div>
          );
        })}
        {monthlyTotals.length > 0 && (
          <div style={{ ...rowStyle, borderTop: `2px solid ${C.border}`, background: C.bg }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Total</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>{fmtD(totalProjected)}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{fmtD(totalActual)}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: totalActual - totalProjected >= 0 ? C.green : C.red, textAlign: "right" }}>{totalActual - totalProjected >= 0 ? "+" : ""}{fmtD(totalActual - totalProjected)}</span>
            <span />
          </div>
        )}
      </div>
    </div>
  );
}

function TenantTracker({ session }) {
  const STATUSES = ["current", "notice_given", "vacating", "past_tenant"];
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [inspectionModal, setInspectionModal] = useState(null); // { tenantId, tenantName, property, unit }
  const [inspectionForm, setInspectionForm] = useState({ moveOutDate: "", inspectionDate: "", condition: "good", damagesNote: "", depositRefund: "" });
  const [inspectionSaving, setInspectionSaving] = useState(false);
  const [form, setForm] = useState({ name: "", property: "", unit: "", rent: "", status: "current", leaseEnd: "", phone: "" });
  const [payForm, setPayForm] = useState({ amount: "", dueDate: "", paidDate: "", month: "", notes: "" });

  useEffect(() => {
    if (!session) return;
    Promise.all([
      supabase.from("tenants").select("*").order("created_at", { ascending: false }),
      supabase.from("payment_history").select("*").order("due_date", { ascending: false }),
    ]).then(([tRes, pRes]) => {
      dbLog("tenants.select", tRes);
      dbLog("payment_history.select", pRes);
      setTenants((tRes.data || []).map(t => ({ id: t.id, name: t.name, property: t.property_id || "", unit: t.unit_number || "", rent: t.monthly_rent || 0, status: t.status || "current", leaseEnd: t.lease_end || "", phone: t.phone || "", leaseId: t.lease_id || null })));
      setPayments(pRes.data || []);
      setLoading(false);
    });
  }, [session]);

  const openAdd = () => { setForm({ name: "", property: "", unit: "", rent: "", status: "current", leaseEnd: "", phone: "" }); setModal({}); };
  const openEdit = (id) => { const t = tenants.find(x => x.id === id); setForm({ name: t.name, property: t.property, unit: t.unit, rent: String(t.rent), status: t.status, leaseEnd: t.leaseEnd, phone: t.phone }); setModal({ editing: id }); };
  const save = async () => {
    if (!form.name || !form.property) return;
    setSaving(true);
    const entry = { name: form.name, property: form.property, unit: form.unit, rent: num(form.rent), status: form.status, leaseEnd: form.leaseEnd, phone: form.phone };
    const previousStatus = modal.editing !== undefined ? (tenants.find(t => t.id === modal.editing) || {}).status : null;
    if (modal.editing !== undefined) {
      const res = await supabase.from("tenants").update({ name: entry.name, property_id: entry.property, unit_number: entry.unit, monthly_rent: entry.rent, status: entry.status, lease_end: entry.leaseEnd || null, phone: entry.phone }).eq("id", modal.editing).select().single();
      dbLog("tenants.update", res);
      setTenants(prev => prev.map(t => t.id === modal.editing ? { ...t, ...entry } : t));
    } else {
      const payload = { user_id: session.user.id, name: entry.name, property_id: entry.property, unit_number: entry.unit, monthly_rent: entry.rent, status: entry.status, lease_end: entry.leaseEnd || null, phone: entry.phone };
      const res = await supabase.from("tenants").insert(payload).select().single();
      dbLog("tenants.insert", res);
      setTenants(prev => [{ ...entry, id: res.data?.id || Date.now() }, ...prev]);
    }
    setSaving(false);
    const savedId = modal.editing || tenants[tenants.length - 1]?.id;
    setModal(null);
    // Trigger move-out inspection flow when status changes to "vacating"
    if (entry.status === "vacating" && previousStatus !== "vacating") {
      setInspectionForm({ moveOutDate: entry.leaseEnd || "", inspectionDate: "", condition: "good", damagesNote: "", depositRefund: String(entry.rent) });
      setInspectionModal({ tenantId: savedId, tenantName: entry.name, property: entry.property, unit: entry.unit });
    }
  };

  const openPayment = (tenantId) => { setPayForm({ amount: "", dueDate: "", paidDate: "", month: "", notes: "" }); setPayModal({ tenantId }); };
  const savePayment = async () => {
    if (!payForm.dueDate || !payForm.amount) return;
    setSaving(true);
    const t = tenants.find(x => x.id === payModal.tenantId);
    const propertyId = t?.property || "";
    const paymentAmount = num(payForm.amount);
    const res = await supabase.from("payment_history").insert({ user_id: session.user.id, tenant_id: payModal.tenantId, property_id: propertyId, amount: paymentAmount, due_date: payForm.dueDate, paid_date: payForm.paidDate || null, month: payForm.month, notes: payForm.notes }).select().single();
    dbLog("payment_history.insert", res);
    if (res.data) setPayments(prev => [res.data, ...prev]);

    // Auto-update tenant payment status
    const isOverdue = !payForm.paidDate && new Date(payForm.dueDate) < new Date();
    const newStatus = isOverdue ? "late" : (t?.status === "late" && payForm.paidDate ? "current" : undefined);
    if (newStatus && t) {
      const upd = await supabase.from("tenants").update({ status: newStatus }).eq("id", payModal.tenantId).select().single();
      dbLog("tenants.status_update", upd);
      if (upd.data) setTenants(prev => prev.map(x => x.id === payModal.tenantId ? { ...x, status: newStatus } : x));
    }

    // Feed payment into Cash Flow Tracker as actual rent received
    if (payForm.paidDate && payForm.month && propertyId) {
      const existing = await supabase.from("cash_flow_entries").select("*").eq("month", payForm.month).eq("property_id", propertyId).eq("user_id", session.user.id).maybeSingle();
      dbLog("cash_flow_entries.lookup", existing);
      if (existing.data) {
        const cfUpd = await supabase.from("cash_flow_entries").update({ actual_rent: (existing.data.actual_rent || 0) + paymentAmount }).eq("id", existing.data.id).select().single();
        dbLog("cash_flow_entries.update_rent", cfUpd);
      } else {
        const cfIns = await supabase.from("cash_flow_entries").insert({ user_id: session.user.id, month: payForm.month, property_id: propertyId, projected_cash_flow: 0, actual_rent: paymentAmount, actual_expenses: 0 }).select().single();
        dbLog("cash_flow_entries.insert_from_payment", cfIns);
      }
    }

    setSaving(false);
    setPayModal(null);
  };

  const saveInspection = async () => {
    if (!inspectionModal) return;
    setInspectionSaving(true);
    // Log the inspection as a maintenance item for record-keeping
    const res = await supabase.from("maintenance_items").insert({
      user_id: session.user.id,
      property_id: inspectionModal.property,
      unit_number: inspectionModal.unit,
      title: `Move-Out Inspection — ${inspectionModal.tenantName}`,
      description: `Condition: ${inspectionForm.condition}${inspectionForm.damagesNote ? `. Damages: ${inspectionForm.damagesNote}` : ""}. Move-out: ${inspectionForm.moveOutDate}. Deposit refund: $${inspectionForm.depositRefund}`,
      priority: inspectionForm.condition === "poor" ? "urgent" : "normal",
      status: "open",
      reported_date: inspectionForm.inspectionDate || new Date().toISOString().split("T")[0],
    }).select().single();
    dbLog("maintenance_items.inspection", res);
    setInspectionSaving(false);
    setInspectionModal(null);
  };

  const getPaymentStatus = (p) => {
    if (!p.paid_date) return { label: "UNPAID", bg: C.redLight, color: C.red };
    const due = new Date(p.due_date);
    const paid = new Date(p.paid_date);
    if (paid <= due) return { label: "ON TIME", bg: C.greenLight, color: C.greenDark };
    const daysLate = Math.round((paid - due) / (24 * 60 * 60 * 1000));
    return { label: `${daysLate}d LATE`, bg: C.yellowLight, color: C.yellowDark };
  };

  const activeFilter = filter === "active" ? tenants.filter(t => t.status !== "past_tenant") : filter === "all" ? tenants : tenants.filter(t => t.status === filter);
  const filtered = activeFilter;
  const currentCount = tenants.filter(t => t.status === "current").length;
  const latePaymentCount = payments.filter(p => !p.paid_date && new Date(p.due_date) < new Date()).length;

  const statusBadge = (status) => {
    const cfg = {
      current: { bg: C.greenLight, color: C.greenDark, label: "CURRENT" },
      notice_given: { bg: C.yellowLight, color: C.yellowDark, label: "NOTICE GIVEN" },
      vacating: { bg: "#FEF3C7", color: "#92400E", label: "VACATING" },
      past_tenant: { bg: C.bg, color: C.mutedLight, label: "PAST TENANT" },
    }[status] || { bg: C.bg, color: C.muted, label: status.toUpperCase() };
    return <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, letterSpacing: "0.04em" }}>{cfg.label}</span>;
  };

  const statusLabel = (s) => ({ current: "Current", notice_given: "Notice Given", vacating: "Vacating", past_tenant: "Past Tenant" }[s] || s);

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 14 }}>Loading tenants...</div>;
  if (tenants.length === 0 && !modal) return _emptyState("No tenants added yet. Add your first tenant to get started.", "+ Add Tenant", openAdd);

  return (
    <div>
      {modal && (
        <div style={_modalOverlay}><div style={_modalBox}>
          {_modalHeader(modal.editing !== undefined ? "Edit Tenant" : "Add Tenant", () => setModal(null))}
          <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" style={_modalInput} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Property</label><input value={form.property} onChange={e => setForm(p => ({ ...p, property: e.target.value }))} placeholder="123 Oak St" style={_modalInput} /></div>
            <div><label style={_modalLabel}>Unit</label><input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="A" style={_modalInput} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Rent / Mo</label><input type="number" value={form.rent} onChange={e => setForm(p => ({ ...p, rent: e.target.value }))} placeholder="0" style={_modalInput} /></div>
            <div><label style={_modalLabel}>Status</label><select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={{ ..._modalInput, cursor: "pointer" }}>{STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Lease End</label><input type="date" value={form.leaseEnd} onChange={e => setForm(p => ({ ...p, leaseEnd: e.target.value }))} style={_modalInput} /></div>
            <div><label style={_modalLabel}>Phone</label><input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="555-0101" style={_modalInput} /></div>
          </div>
          <button onClick={save} disabled={saving} style={{ ..._modalSubmit(), opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : modal.editing !== undefined ? "Save Changes" : "Add Tenant"}</button>
        </div></div>
      )}

      {payModal && (
        <div style={_modalOverlay}><div style={_modalBox}>
          {_modalHeader("Record Payment", () => setPayModal(null))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Amount</label><input type="number" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" style={_modalInput} /></div>
            <div><label style={_modalLabel}>Month</label><input value={payForm.month} onChange={e => setPayForm(p => ({ ...p, month: e.target.value }))} placeholder="e.g. Mar 2026" style={_modalInput} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Due Date</label><input type="date" value={payForm.dueDate} onChange={e => setPayForm(p => ({ ...p, dueDate: e.target.value }))} style={_modalInput} /></div>
            <div><label style={_modalLabel}>Paid Date</label><input type="date" value={payForm.paidDate} onChange={e => setPayForm(p => ({ ...p, paidDate: e.target.value }))} style={_modalInput} /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Notes</label><input value={payForm.notes} onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional" style={_modalInput} /></div>
          <button onClick={savePayment} disabled={saving} style={{ ..._modalSubmit(), opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : "Record Payment"}</button>
        </div></div>
      )}

      {inspectionModal && (
        <div style={_modalOverlay}><div style={_modalBox}>
          {_modalHeader("Move-Out Inspection", () => setInspectionModal(null))}
          <div style={{ background: C.yellowLight, border: `1px solid ${C.yellowBorder}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.yellowDark }}>
              <AlertTriangle size={14} color={C.yellowDark} style={{ verticalAlign: "middle", marginRight: 6 }} />
              {inspectionModal.tenantName} is vacating {inspectionModal.property}{inspectionModal.unit ? ` Unit ${inspectionModal.unit}` : ""}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Move-Out Date</label><input type="date" value={inspectionForm.moveOutDate} onChange={e => setInspectionForm(p => ({ ...p, moveOutDate: e.target.value }))} style={_modalInput} /></div>
            <div><label style={_modalLabel}>Inspection Date</label><input type="date" value={inspectionForm.inspectionDate} onChange={e => setInspectionForm(p => ({ ...p, inspectionDate: e.target.value }))} style={_modalInput} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Unit Condition</label>
              <select value={inspectionForm.condition} onChange={e => setInspectionForm(p => ({ ...p, condition: e.target.value }))} style={{ ..._modalInput, cursor: "pointer" }}>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair — Minor Repairs</option>
                <option value="poor">Poor — Major Repairs</option>
              </select>
            </div>
            <div><label style={_modalLabel}>Deposit Refund</label><input type="number" value={inspectionForm.depositRefund} onChange={e => setInspectionForm(p => ({ ...p, depositRefund: e.target.value }))} placeholder="0" style={_modalInput} /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Damages / Notes</label><input value={inspectionForm.damagesNote} onChange={e => setInspectionForm(p => ({ ...p, damagesNote: e.target.value }))} placeholder="e.g. Carpet stains, wall damage" style={_modalInput} /></div>
          <button onClick={saveInspection} disabled={inspectionSaving} style={{ ..._modalSubmit(), opacity: inspectionSaving ? 0.7 : 1 }}>{inspectionSaving ? "Saving..." : "Save Inspection"}</button>
          <button onClick={() => setInspectionModal(null)} style={{ width: "100%", padding: "10px", background: "none", border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>Skip for Now</button>
        </div></div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "active", ...STATUSES].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${filter === f ? C.green : C.border}`, background: filter === f ? C.greenLight : C.white, color: filter === f ? C.greenDark : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{f === "all" ? "All" : f === "active" ? "Active" : statusLabel(f)}</button>
          ))}
        </div>
        <button onClick={openAdd} style={_addBtn}>+ Add Tenant</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <DashStatCard label="Total Tenants" value={tenants.length} />
        <DashStatCard label="Current" value={currentCount} />
        <DashStatCard label="Unpaid Payments" value={latePaymentCount} />
        <DashStatCard label="Monthly Rent Roll" value={fmtD(tenants.filter(t => t.status === "current").reduce((s, t) => s + t.rent, 0))} />
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(t => {
          const tenantPayments = payments.filter(p => p.tenant_id === t.id).slice(0, 4);
          const hasOverduePayment = payments.some(p => p.tenant_id === t.id && !p.paid_date && new Date(p.due_date) < new Date());
          const leaseEndDays = t.leaseEnd ? Math.round((new Date(t.leaseEnd) - new Date()) / (24 * 60 * 60 * 1000)) : null;
          return (
          <div key={t.id} style={{ background: C.white, border: `1px solid ${hasOverduePayment ? C.red + "44" : C.border}`, borderRadius: 12, padding: "16px 18px", opacity: t.status === "past_tenant" ? 0.6 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{t.name}</span>
                  {hasOverduePayment && <span style={{ background: C.redLight, color: C.red, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.04em" }}>LATE</span>}
                  {leaseEndDays !== null && leaseEndDays > 0 && leaseEndDays <= 90 && <span style={{ background: leaseEndDays <= 30 ? C.redLight : C.yellowLight, color: leaseEndDays <= 30 ? C.red : C.yellowDark, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.04em" }}>LEASE {leaseEndDays}d</span>}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>{t.property} — Unit {t.unit}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => openPayment(t.id)} style={{ ..._editBtn, color: C.green }}>+ Payment</button>
                <button onClick={() => openEdit(t.id)} style={_editBtn}>Edit</button>
                {statusBadge(t.status)}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rent</div><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{fmtD(t.rent)}/mo</div></div>
              <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Lease End</div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{t.leaseEnd}</div></div>
              <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Phone</div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{t.phone}</div></div>
            </div>
            {tenantPayments.length > 0 && (
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Recent Payments</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {tenantPayments.map((p, i) => {
                    const ps = getPaymentStatus(p);
                    return (
                    <div key={i} style={{ background: ps.bg, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: ps.color }}>
                      {p.month || p.due_date}: {p.amount > 0 ? fmtD(p.amount) : "—"} ({ps.label})
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

function FinancingTracker({ session }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ property: "", lender: "", balance: "", rate: "", payment: "", type: "30yr Fixed", maturity: "" });

  useEffect(() => {
    if (!session) return;
    supabase.from("loans").select("*").order("created_at", { ascending: false })
      .then(res => { dbLog("loans.select", res); setLoans((res.data || []).map(l => ({ id: l.id, property: l.property_id || "", lender: l.lender || "", balance: l.current_balance || 0, rate: l.interest_rate || 0, payment: l.monthly_payment || 0, type: l.loan_type || "30yr Fixed", maturity: l.maturity_date || "" }))); setLoading(false); });
  }, [session]);

  const openAdd = () => { setForm({ property: "", lender: "", balance: "", rate: "", payment: "", type: "30yr Fixed", maturity: "" }); setModal({}); };
  const openEdit = (id) => { const l = loans.find(x => x.id === id); setForm({ property: l.property, lender: l.lender, balance: String(l.balance), rate: String(l.rate), payment: String(l.payment), type: l.type, maturity: l.maturity }); setModal({ editing: id }); };
  const save = async () => {
    if (!form.property || !form.lender) return;
    setSaving(true);
    const entry = { property: form.property, lender: form.lender, balance: num(form.balance), rate: num(form.rate), payment: num(form.payment), type: form.type, maturity: form.maturity };
    if (modal.editing !== undefined) {
      const res = await supabase.from("loans").update({ property_id: entry.property, lender: entry.lender, current_balance: entry.balance, interest_rate: entry.rate, monthly_payment: entry.payment, loan_type: entry.type, maturity_date: entry.maturity || null }).eq("id", modal.editing).select().single();
      dbLog("loans.update", res);
      setLoans(prev => prev.map(l => l.id === modal.editing ? { ...l, ...entry } : l));
    } else {
      const res = await supabase.from("loans").insert({ user_id: session.user.id, property_id: entry.property, lender: entry.lender, current_balance: entry.balance, interest_rate: entry.rate, monthly_payment: entry.payment, loan_type: entry.type, maturity_date: entry.maturity || null }).select().single();
      dbLog("loans.insert", res);
      setLoans(prev => [{ ...entry, id: res.data?.id || Date.now() }, ...prev]);
    }
    setSaving(false);
    setModal(null);
  };

  const totalBalance = loans.reduce((s, l) => s + l.balance, 0);
  const totalPayment = loans.reduce((s, l) => s + l.payment, 0);
  const avgRate = loans.length > 0 ? loans.reduce((s, l) => s + l.rate, 0) / loans.length : 0;
  const balloonLoans = loans.filter(l => l.type.includes("Balloon"));
  const nearBalloon = balloonLoans.filter(l => { const diff = new Date(l.maturity) - new Date(); return diff > 0 && diff < 365 * 24 * 60 * 60 * 1000; });
  const criticalBalloon = balloonLoans.filter(l => { const diff = new Date(l.maturity) - new Date(); return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000; });

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 14 }}>Loading loans...</div>;
  if (loans.length === 0 && !modal) return _emptyState("No loans added yet. Add your first loan to start tracking.", "+ Add Loan", openAdd);

  return (
    <div>
      {modal && (
        <div style={_modalOverlay}><div style={_modalBox}>
          {_modalHeader(modal.editing !== undefined ? "Edit Loan" : "Add Loan", () => setModal(null))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Property</label><input value={form.property} onChange={e => setForm(p => ({ ...p, property: e.target.value }))} placeholder="123 Oak St" style={_modalInput} /></div>
            <div><label style={_modalLabel}>Lender</label><input value={form.lender} onChange={e => setForm(p => ({ ...p, lender: e.target.value }))} placeholder="Chase Bank" style={_modalInput} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Balance</label><input type="number" value={form.balance} onChange={e => setForm(p => ({ ...p, balance: e.target.value }))} placeholder="0" style={_modalInput} /></div>
            <div><label style={_modalLabel}>Rate (%)</label><input type="number" value={form.rate} onChange={e => setForm(p => ({ ...p, rate: e.target.value }))} placeholder="0" style={_modalInput} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Monthly Payment</label><input type="number" value={form.payment} onChange={e => setForm(p => ({ ...p, payment: e.target.value }))} placeholder="0" style={_modalInput} /></div>
            <div><label style={_modalLabel}>Loan Type</label><select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={{ ..._modalInput, cursor: "pointer" }}><option value="30yr Fixed">30yr Fixed</option><option value="15yr Fixed">15yr Fixed</option><option value="5yr Balloon">5yr Balloon</option><option value="10yr Balloon">10yr Balloon</option><option value="ARM">ARM</option></select></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Maturity Date</label><input type="date" value={form.maturity} onChange={e => setForm(p => ({ ...p, maturity: e.target.value }))} style={_modalInput} /></div>
          <button onClick={save} disabled={saving} style={{ ..._modalSubmit(), opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : modal.editing !== undefined ? "Save Changes" : "Add Loan"}</button>
        </div></div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={openAdd} style={_addBtn}>+ Add Loan</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <DashStatCard label="Total Debt" value={fmtD(totalBalance)} />
        <DashStatCard label="Monthly Payments" value={fmtD(totalPayment)} />
        <DashStatCard label="Avg Rate" value={fmtP(avgRate)} />
        <DashStatCard label="Active Loans" value={loans.length} />
      </div>

      {criticalBalloon.length > 0 && (
        <div style={{ background: C.redLight, border: `1px solid ${C.red}44`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <AlertTriangle size={18} color="currentColor" />
          <div style={{ fontSize: 13, color: C.red, lineHeight: 1.5, fontWeight: 600 }}>{criticalBalloon.length} balloon loan{criticalBalloon.length > 1 ? "s" : ""} maturing within 90 days: {criticalBalloon.map(l => l.property).join(", ")}</div>
        </div>
      )}
      {nearBalloon.length > 0 && criticalBalloon.length < nearBalloon.length && (
        <div style={{ background: C.yellowLight, border: `1px solid ${C.yellow}44`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <AlertTriangle size={18} color="currentColor" />
          <div style={{ fontSize: 13, color: C.yellowDark, lineHeight: 1.5, fontWeight: 600 }}>{nearBalloon.length - criticalBalloon.length} balloon loan{nearBalloon.length - criticalBalloon.length > 1 ? "s" : ""} maturing within 12 months: {nearBalloon.filter(l => !criticalBalloon.includes(l)).map(l => l.property).join(", ")}</div>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {loans.map(l => {
          const isBalloon = l.type.includes("Balloon");
          const monthsLeft = l.maturity ? Math.max(0, Math.round((new Date(l.maturity) - new Date()) / (30 * 24 * 60 * 60 * 1000))) : 0;
          return (
            <div key={l.id} style={{ background: C.white, border: `1px solid ${isBalloon && monthsLeft <= 3 ? C.red + "55" : isBalloon && monthsLeft <= 12 ? C.yellow + "55" : C.border}`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{l.property}</span>
                    {isBalloon && monthsLeft <= 3 && <span style={{ background: C.redLight, color: C.red, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>CRITICAL</span>}
                    {isBalloon && monthsLeft > 3 && monthsLeft <= 12 && <span style={{ background: C.yellowLight, color: C.yellowDark, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>DUE SOON</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>{l.lender}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => openEdit(l.id)} style={_editBtn}>Edit</button>
                  <span style={{ background: isBalloon ? (monthsLeft <= 3 ? C.redLight : monthsLeft <= 12 ? C.yellowLight : C.yellowLight) : C.greenLight, color: isBalloon ? (monthsLeft <= 3 ? C.red : C.yellowDark) : C.greenDark, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, letterSpacing: "0.04em" }}>{l.type.toUpperCase()}</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Balance</div><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{fmtD(l.balance)}</div></div>
                <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rate</div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{l.rate}%</div></div>
                <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Payment</div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{fmtD(l.payment)}/mo</div></div>
                <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Maturity</div><div style={{ fontSize: 14, fontWeight: 600, color: isBalloon && monthsLeft <= 3 ? C.red : isBalloon && monthsLeft <= 12 ? C.yellowDark : C.text }}>{l.maturity}{isBalloon && monthsLeft <= 12 ? ` (${monthsLeft}mo)` : ""}</div></div>
              </div>
            </div>
          );
        })}
      </div>

      {loans.length > 0 && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", marginTop: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Balance</div><div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{fmtD(totalBalance)}</div></div>
            <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Payment</div><div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{fmtD(totalPayment)}/mo</div></div>
            <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Avg Rate</div><div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{fmtP(avgRate)}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaseRenewalTracker({ session }) {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ property: "", unit: "", tenant: "", start: "", end: "", rent: "" });

  useEffect(() => {
    if (!session) return;
    // Load leases and tenants, auto-populate lease renewals for tenants with lease_end within 90 days
    Promise.all([
      supabase.from("leases").select("*").order("created_at", { ascending: false }),
      supabase.from("tenants").select("*"),
    ]).then(async ([leaseRes, tenantRes]) => {
      dbLog("leases.select", leaseRes);
      dbLog("tenants.select(for leases)", tenantRes);
      const existingLeases = leaseRes.data || [];
      const allTenants = tenantRes.data || [];
      const now = new Date();
      const in90 = 90 * 24 * 60 * 60 * 1000;
      // Find tenants with lease_end within 90 days that don't already have a matching lease entry
      const needsRenewal = allTenants.filter(t => {
        if (!t.lease_end || t.status === "past_tenant") return false;
        const daysUntil = new Date(t.lease_end) - now;
        if (daysUntil <= 0 || daysUntil > in90) return false;
        // Check if a lease already exists for this tenant + property + end date
        return !existingLeases.some(l => l.tenant_name === t.name && l.property_id === t.property_id && l.lease_end === t.lease_end);
      });
      // Auto-create lease renewal entries for these tenants
      if (needsRenewal.length > 0) {
        const inserts = needsRenewal.map(t => ({ user_id: session.user.id, property_id: t.property_id, tenant_name: t.name, lease_end: t.lease_end, proposed_rent: t.monthly_rent || 0, notes: t.unit_number ? `Unit ${t.unit_number}` : null }));
        const res = await supabase.from("leases").insert(inserts).select();
        dbLog("leases.auto-insert", res);
        if (res.data) existingLeases.push(...res.data);
      }
      setLeases(existingLeases.map(l => ({ id: l.id, property: l.property_id || "", unit: (l.notes || "").replace("Unit ", ""), tenant: l.tenant_name || "", start: l.lease_start || "", end: l.lease_end || "", rent: l.proposed_rent || 0 })));
      setLoading(false);
    });
  }, [session]);

  const openAdd = () => { setForm({ property: "", unit: "", tenant: "", start: "", end: "", rent: "" }); setModal({}); };
  const openEdit = (id) => { const l = leases.find(x => x.id === id); setForm({ property: l.property, unit: l.unit, tenant: l.tenant, start: l.start, end: l.end, rent: String(l.rent) }); setModal({ editing: id }); };
  const save = async () => {
    if (!form.tenant || !form.property || !form.end) return;
    setSaving(true);
    const entry = { property: form.property, unit: form.unit, tenant: form.tenant, start: form.start, end: form.end, rent: num(form.rent) };
    if (modal.editing !== undefined) {
      const res = await supabase.from("leases").update({ property_id: entry.property, tenant_name: entry.tenant, lease_start: entry.start || null, lease_end: entry.end, proposed_rent: entry.rent, notes: entry.unit ? `Unit ${entry.unit}` : null }).eq("id", modal.editing).select().single();
      dbLog("leases.update", res);
      setLeases(prev => prev.map(l => l.id === modal.editing ? { ...l, ...entry } : l));
    } else {
      const res = await supabase.from("leases").insert({ user_id: session.user.id, property_id: entry.property, tenant_name: entry.tenant, lease_start: entry.start || null, lease_end: entry.end, proposed_rent: entry.rent, notes: entry.unit ? `Unit ${entry.unit}` : null }).select().single();
      dbLog("leases.insert", res);
      setLeases(prev => [{ ...entry, id: res.data?.id || Date.now() }, ...prev]);
    }
    setSaving(false);
    setModal(null);
  };

  const getUrgency = (lease) => {
    const daysLeft = Math.round((new Date(lease.end) - new Date()) / (24 * 60 * 60 * 1000));
    if (daysLeft <= 30) return { color: C.red, bg: C.redLight, label: "URGENT", days: daysLeft };
    if (daysLeft <= 90) return { color: C.yellow, bg: C.yellowLight, label: "SOON", days: daysLeft };
    return { color: C.greenDark, bg: C.greenLight, label: "OK", days: daysLeft };
  };

  const sorted = [...leases].sort((a, b) => new Date(a.end) - new Date(b.end));
  const q1 = sorted.filter(l => { const d = new Date(l.end); return d.getMonth() < 3; });
  const q2 = sorted.filter(l => { const d = new Date(l.end); return d.getMonth() >= 3 && d.getMonth() < 6; });
  const q3 = sorted.filter(l => { const d = new Date(l.end); return d.getMonth() >= 6 && d.getMonth() < 9; });
  const q4 = sorted.filter(l => { const d = new Date(l.end); return d.getMonth() >= 9; });
  const expiring30 = sorted.filter(l => { const u = getUrgency(l); return u.days <= 30 && u.days > 0; }).length;
  const expiring90 = sorted.filter(l => { const u = getUrgency(l); return u.days <= 90 && u.days > 0; }).length;

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 14 }}>Loading leases...</div>;
  if (leases.length === 0 && !modal) return _emptyState("No leases added yet. Add your first lease to start tracking renewals.", "+ Add Lease", openAdd);

  return (
    <div>
      {modal && (
        <div style={_modalOverlay}><div style={_modalBox}>
          {_modalHeader(modal.editing !== undefined ? "Edit Lease" : "Add Lease", () => setModal(null))}
          <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Tenant Name</label><input value={form.tenant} onChange={e => setForm(p => ({ ...p, tenant: e.target.value }))} placeholder="Full name" style={_modalInput} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Property</label><input value={form.property} onChange={e => setForm(p => ({ ...p, property: e.target.value }))} placeholder="123 Oak St" style={_modalInput} /></div>
            <div><label style={_modalLabel}>Unit</label><input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="A" style={_modalInput} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Lease Start</label><input type="date" value={form.start} onChange={e => setForm(p => ({ ...p, start: e.target.value }))} style={_modalInput} /></div>
            <div><label style={_modalLabel}>Lease End</label><input type="date" value={form.end} onChange={e => setForm(p => ({ ...p, end: e.target.value }))} style={_modalInput} /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Monthly Rent</label><input type="number" value={form.rent} onChange={e => setForm(p => ({ ...p, rent: e.target.value }))} placeholder="0" style={_modalInput} /></div>
          <button onClick={save} disabled={saving} style={{ ..._modalSubmit(), opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : modal.editing !== undefined ? "Save Changes" : "Add Lease"}</button>
        </div></div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={openAdd} style={_addBtn}>+ Add Lease</button>
      </div>

      {expiring30 > 0 && (
        <div style={{ background: C.redLight, border: `1px solid ${C.red}44`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <AlertTriangle size={18} color={C.red} />
          <div style={{ fontSize: 13, color: C.red, lineHeight: 1.5, fontWeight: 600 }}>{expiring30} lease{expiring30 > 1 ? "s" : ""} expiring within 30 days — renewal action needed</div>
        </div>
      )}
      {expiring90 > expiring30 && (
        <div style={{ background: C.yellowLight, border: `1px solid ${C.yellow}44`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <AlertTriangle size={18} color={C.yellowDark} />
          <div style={{ fontSize: 13, color: C.yellowDark, lineHeight: 1.5, fontWeight: 600 }}>{expiring90 - expiring30} additional lease{expiring90 - expiring30 > 1 ? "s" : ""} expiring within 90 days</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <DashStatCard label="Total Leases" value={leases.length} />
        <DashStatCard label="Expiring &lt;30d" value={expiring30} />
        <DashStatCard label="Expiring &lt;90d" value={expiring90} />
        <DashStatCard label="Monthly Rent" value={fmtD(leases.reduce((s, l) => s + l.rent, 0))} />
      </div>

      {leases.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[{ label: "Q1", data: q1 }, { label: "Q2", data: q2 }, { label: "Q3", data: q3 }, { label: "Q4", data: q4 }].map(q => (
            <div key={q.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{q.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{q.data.length}</div>
              <div style={{ fontSize: 11, color: C.muted }}>renewal{q.data.length !== 1 ? "s" : ""}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {sorted.map(l => {
          const u = getUrgency(l);
          return (
            <div key={l.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{l.tenant}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{l.property} — Unit {l.unit}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => openEdit(l.id)} style={_editBtn}>Edit</button>
                  <span style={{ background: u.bg, color: u.color, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, letterSpacing: "0.04em" }}>{u.label} — {u.days}d</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Lease End</div><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{l.end}</div></div>
                <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rent</div><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{fmtD(l.rent)}/mo</div></div>
                <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Start</div><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{l.start}</div></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAINTENANCE LOG ─────────────────────────────────────────────────────────
function MaintenanceLog({ session }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("open");
  const [form, setForm] = useState({ property: "", unit: "", title: "", description: "", vendor: "", cost: "", priority: "normal" });

  useEffect(() => {
    if (!session) return;
    supabase.from("maintenance_items").select("*").order("created_at", { ascending: false })
      .then(res => { dbLog("maintenance_items.select", res); setItems(res.data || []); setLoading(false); });
  }, [session]);

  const openAdd = () => { setForm({ property: "", unit: "", title: "", description: "", vendor: "", cost: "", priority: "normal" }); setModal({}); };
  const openEdit = (id) => { const m = items.find(x => x.id === id); setForm({ property: m.property_id || "", unit: m.unit_number || "", title: m.title, description: m.description || "", vendor: m.vendor || "", cost: String(m.cost || 0), priority: m.priority || "normal" }); setModal({ editing: id }); };
  const save = async () => {
    if (!form.title || !form.property) return;
    setSaving(true);
    if (modal.editing !== undefined) {
      const res = await supabase.from("maintenance_items").update({ property_id: form.property, unit_number: form.unit, title: form.title, description: form.description, vendor: form.vendor, cost: num(form.cost), priority: form.priority }).eq("id", modal.editing).select().single();
      dbLog("maintenance_items.update", res);
      setItems(prev => prev.map(m => m.id === modal.editing ? { ...m, property_id: form.property, unit_number: form.unit, title: form.title, description: form.description, vendor: form.vendor, cost: num(form.cost), priority: form.priority } : m));
    } else {
      const res = await supabase.from("maintenance_items").insert({ user_id: session.user.id, property_id: form.property, unit_number: form.unit, title: form.title, description: form.description, vendor: form.vendor, cost: num(form.cost), priority: form.priority, status: "open" }).select().single();
      dbLog("maintenance_items.insert", res);
      if (res.data) setItems(prev => [res.data, ...prev]);
    }
    setSaving(false);
    setModal(null);
  };
  const closeItem = async (id) => {
    const today = new Date().toISOString().split("T")[0];
    const res = await supabase.from("maintenance_items").update({ status: "closed", closed_date: today }).eq("id", id).select().single();
    dbLog("maintenance_items.close", res);
    setItems(prev => prev.map(m => m.id === id ? { ...m, status: "closed", closed_date: today } : m));
  };
  const reopenItem = async (id) => {
    const res = await supabase.from("maintenance_items").update({ status: "open", closed_date: null }).eq("id", id).select().single();
    dbLog("maintenance_items.reopen", res);
    setItems(prev => prev.map(m => m.id === id ? { ...m, status: "open", closed_date: null } : m));
  };

  const filtered = filter === "all" ? items : items.filter(m => m.status === filter);
  const openCount = items.filter(m => m.status === "open").length;
  const closedCount = items.filter(m => m.status === "closed").length;
  const totalCost = items.filter(m => m.status === "closed").reduce((s, m) => s + (m.cost || 0), 0);

  const priorityBadge = (p) => {
    const cfg = { urgent: { bg: C.redLight, color: C.red }, normal: { bg: C.bg, color: C.muted }, low: { bg: C.greenLight, color: C.greenDark } }[p] || { bg: C.bg, color: C.muted };
    return <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>{p}</span>;
  };

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 14 }}>Loading maintenance items...</div>;
  if (items.length === 0 && !modal) return _emptyState("No maintenance items yet. Log your first issue to get started.", "+ Log Issue", openAdd);

  return (
    <div>
      {modal && (
        <div style={_modalOverlay}><div style={_modalBox}>
          {_modalHeader(modal.editing !== undefined ? "Edit Item" : "Log Maintenance Issue", () => setModal(null))}
          <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Leaking faucet" style={_modalInput} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Property</label><input value={form.property} onChange={e => setForm(p => ({ ...p, property: e.target.value }))} placeholder="123 Oak St" style={_modalInput} /></div>
            <div><label style={_modalLabel}>Unit</label><input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="A" style={_modalInput} /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Description</label><input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Details..." style={_modalInput} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={_modalLabel}>Vendor</label><input value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} placeholder="Plumber" style={_modalInput} /></div>
            <div><label style={_modalLabel}>Cost</label><input type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} placeholder="0" style={_modalInput} /></div>
            <div><label style={_modalLabel}>Priority</label><select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={{ ..._modalInput, cursor: "pointer" }}><option value="low">Low</option><option value="normal">Normal</option><option value="urgent">Urgent</option></select></div>
          </div>
          <button onClick={save} disabled={saving} style={{ ..._modalSubmit(), opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : modal.editing !== undefined ? "Save Changes" : "Log Issue"}</button>
        </div></div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["open", "closed", "all"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${filter === f ? C.green : C.border}`, background: filter === f ? C.greenLight : C.white, color: filter === f ? C.greenDark : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize" }}>{f}</button>
          ))}
        </div>
        <button onClick={openAdd} style={_addBtn}>+ Log Issue</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <DashStatCard label="Open Issues" value={openCount} />
        <DashStatCard label="Closed" value={closedCount} />
        <DashStatCard label="Closed Costs" value={fmtD(totalCost)} />
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(m => (
          <div key={m.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", opacity: m.status === "closed" ? 0.7 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{m.title}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{m.property_id}{m.unit_number ? ` — Unit ${m.unit_number}` : ""}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {m.status === "open" ? (
                  <button onClick={() => closeItem(m.id)} style={{ ..._editBtn, color: C.green }}>Close</button>
                ) : (
                  <button onClick={() => reopenItem(m.id)} style={{ ..._editBtn, color: C.muted }}>Reopen</button>
                )}
                <button onClick={() => openEdit(m.id)} style={_editBtn}>Edit</button>
                {priorityBadge(m.priority)}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
              <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Vendor</div><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.vendor || "—"}</div></div>
              <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Cost</div><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.cost ? fmtD(m.cost) : "—"}</div></div>
              <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Reported</div><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.reported_date || "—"}</div></div>
              <div><div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</div><div style={{ fontSize: 13, fontWeight: 700, color: m.status === "open" ? C.yellow : C.greenDark }}>{m.status === "open" ? "OPEN" : "CLOSED"}{m.closed_date ? ` (${m.closed_date})` : ""}</div></div>
            </div>
            {m.description && <div style={{ fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>{m.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DASHBOARD SETTINGS PANEL ────────────────────────────────────────────────
function DashSettingsPanel({ standards, onSaveStandards, defaultMode, onSetDefaultMode, onSignOut }) {
  const [name, setName] = useState(() => { try { return localStorage.getItem("doorbase_profile_name") || ""; } catch { return ""; } });
  const [email, setEmail] = useState(() => { try { return localStorage.getItem("doorbase_profile_email") || ""; } catch { return ""; } });
  const [photo, setPhoto] = useState(() => { try { return localStorage.getItem("doorbase_profile_photo") || ""; } catch { return ""; } });
  const [s, setS] = useState(JSON.parse(JSON.stringify(standards)));
  const [saved, setSaved] = useState(false);
  const photoInputRef = useRef(null);

  const sh = (section, key) => (v) => setS(prev => ({ ...prev, [section]: { ...prev[section], [key]: parseFloat(v) || 0 } }));

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPhoto(dataUrl);
      try { localStorage.setItem("doorbase_profile_photo", dataUrl); } catch {}
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto("");
    try { localStorage.removeItem("doorbase_profile_photo"); } catch {}
  };

  const handleSave = () => {
    try { localStorage.setItem("doorbase_profile_name", name); } catch {}
    try { localStorage.setItem("doorbase_profile_email", email); } catch {}
    onSaveStandards(s);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", background: C.inputBg, border: `1.5px solid ${C.border}`,
    borderRadius: 8, fontSize: 14, color: C.text, fontFamily: "'DM Sans', sans-serif",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 };
  const sectionHeader = (text) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, marginTop: 24 }}>{text}</div>
  );
  const Dot = ({ color }) => <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", marginRight: 6 }} />;

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Settings</div>
      <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>Manage your profile, deal standards, and preferences.</div>

      {sectionHeader("Profile")}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", background: photo ? "none" : C.green,
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              border: `2px solid ${C.border}`, cursor: "pointer", flexShrink: 0,
            }} onClick={() => photoInputRef.current?.click()}>
              {photo ? (
                <img src={photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              )}
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>Profile Photo</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => photoInputRef.current?.click()} style={{
                background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
                padding: "6px 12px", fontSize: 12, fontWeight: 600, color: C.muted,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>Upload</button>
              {photo && <button onClick={removePhoto} style={{
                background: "none", border: `1px solid ${C.border}`, borderRadius: 6,
                padding: "6px 12px", fontSize: 12, fontWeight: 600, color: C.red,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>Remove</button>}
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inputStyle} />
        </div>
      </div>

      <button onClick={onSignOut} style={{
        width: "100%", padding: "10px", background: "none", border: `1.5px solid ${C.border}`,
        borderRadius: 10, color: C.red, fontSize: 13, fontWeight: 600,
        cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 8, marginBottom: 8,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign Out
      </button>

      {sectionHeader("Deal Standards")}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Set your own thresholds for green / yellow verdicts</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Buy & Hold</div>
        <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, display: "flex", alignItems: "center" }}><Dot color={C.green} />Green — Deal Works</div>
          <TwoCol>
            <div><label style={labelStyle}>Min Cash Flow / Mo</label><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.mutedLight, fontSize: 13 }}>$</span><input type="number" value={s.hold.greenCashFlow} onChange={e => sh("hold", "greenCashFlow")(e.target.value)} style={{ ...inputStyle, paddingLeft: 22 }} /></div></div>
            <div><label style={labelStyle}>Min Cap Rate</label><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.mutedLight, fontSize: 13 }}>%</span><input type="number" value={s.hold.greenCapRate} onChange={e => sh("hold", "greenCapRate")(e.target.value)} style={{ ...inputStyle, paddingLeft: 22 }} /></div></div>
          </TwoCol>
        </div>
        <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, display: "flex", alignItems: "center" }}><Dot color={C.yellow} />Yellow — Marginal</div>
          <TwoCol>
            <div><label style={labelStyle}>Min Cash Flow / Mo</label><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.mutedLight, fontSize: 13 }}>$</span><input type="number" value={s.hold.yellowCashFlow} onChange={e => sh("hold", "yellowCashFlow")(e.target.value)} style={{ ...inputStyle, paddingLeft: 22 }} /></div></div>
            <div><label style={labelStyle}>Min Cap Rate</label><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.mutedLight, fontSize: 13 }}>%</span><input type="number" value={s.hold.yellowCapRate} onChange={e => sh("hold", "yellowCapRate")(e.target.value)} style={{ ...inputStyle, paddingLeft: 22 }} /></div></div>
          </TwoCol>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Fix & Flip</div>
        <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, display: "flex", alignItems: "center" }}><Dot color={C.green} />Green — Deal Works</div>
          <TwoCol>
            <div><label style={labelStyle}>Min Net Profit</label><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.mutedLight, fontSize: 13 }}>$</span><input type="number" value={s.flip.greenProfit} onChange={e => sh("flip", "greenProfit")(e.target.value)} style={{ ...inputStyle, paddingLeft: 22 }} /></div></div>
            <div><label style={labelStyle}>Min ROI</label><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.mutedLight, fontSize: 13 }}>%</span><input type="number" value={s.flip.greenROI} onChange={e => sh("flip", "greenROI")(e.target.value)} style={{ ...inputStyle, paddingLeft: 22 }} /></div></div>
          </TwoCol>
        </div>
        <div style={{ background: C.bg, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, display: "flex", alignItems: "center" }}><Dot color={C.yellow} />Yellow — Marginal</div>
          <TwoCol>
            <div><label style={labelStyle}>Min Net Profit</label><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.mutedLight, fontSize: 13 }}>$</span><input type="number" value={s.flip.yellowProfit} onChange={e => sh("flip", "yellowProfit")(e.target.value)} style={{ ...inputStyle, paddingLeft: 22 }} /></div></div>
            <div><label style={labelStyle}>Min ROI</label><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.mutedLight, fontSize: 13 }}>%</span><input type="number" value={s.flip.yellowROI} onChange={e => sh("flip", "yellowROI")(e.target.value)} style={{ ...inputStyle, paddingLeft: 22 }} /></div></div>
          </TwoCol>
        </div>
      </div>

      {sectionHeader("Default Analyzer Mode")}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Choose which analyzer opens by default</div>
        <div style={{ display: "flex", background: C.bg, borderRadius: 8, padding: 3, gap: 3, border: `1px solid ${C.border}` }}>
          {[{ id: "hold", label: "Buy & Hold" }, { id: "flip", label: "Fix & Flip" }].map(m => (
            <button key={m.id} onClick={() => onSetDefaultMode(m.id)} style={{
              flex: 1, padding: "8px 16px", borderRadius: 6, border: "none",
              background: defaultMode === m.id ? C.green : "transparent",
              color: defaultMode === m.id ? C.white : C.muted,
              fontWeight: defaultMode === m.id ? 700 : 500,
              fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}>{m.label}</button>
          ))}
        </div>
      </div>

      {sectionHeader("App Version")}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>DoorBase Beta v0.1</div>
      </div>

      <button onClick={handleSave} style={{
        width: "100%", padding: "14px", background: C.green, border: "none", borderRadius: 10,
        color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
      }}>{saved ? "Saved!" : "Save Settings"}</button>
    </div>
  );
}

// ─── FEEDBACK PANEL ──────────────────────────────────────────────────────────
function FeedbackPanel() {
  const [rating, setRating] = useState(0);
  const [trying, setTrying] = useState("");
  const [broken, setBroken] = useState("");
  const [other, setOther] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async () => {
    if (rating === 0 && !trying && !broken) return;
    setStatus("loading");
    try {
      await fetch("https://www.news-thelegacybridge.com/api/v1/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "feedback@doorbase.app",
          utm_source: "doorbase",
          utm_medium: "feedback",
          utm_campaign: "beta",
          custom_fields: { rating, trying, broken, other },
        }),
      });
      setStatus("success");
    } catch {
      setStatus("success");
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", background: C.inputBg, border: `1.5px solid ${C.border}`,
    borderRadius: 8, fontSize: 14, color: C.text, fontFamily: "'DM Sans', sans-serif",
    outline: "none", boxSizing: "border-box", resize: "vertical",
  };
  const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 6 };

  if (status === "success") {
    return (
      <div style={{ maxWidth: 560 }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Check size={48} color={C.green} /></div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8 }}>Thanks — we read every one.</div>
          <div style={{ fontSize: 14, color: C.muted }}>Your feedback helps us build a better DoorBase.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Beta Feedback</div>
      <div style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.5 }}>Tell us what's working, what's broken, and what's missing.</div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <label style={labelStyle}>Overall Rating</label>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} onClick={() => setRating(n)} style={{
              width: 40, height: 40, borderRadius: 8,
              border: `1.5px solid ${n <= rating ? C.green : C.border}`,
              background: n <= rating ? C.greenLight : C.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 18, transition: "all 0.15s",
              color: n <= rating ? C.green : C.mutedLight,
            }}><Star size={18} color={n <= rating ? C.green : C.mutedLight} fill={n <= rating ? C.green : "none"} /></div>
          ))}
        </div>
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <label style={labelStyle}>What are you trying to do?</label>
        <textarea value={trying} onChange={e => setTrying(e.target.value)} rows={3} placeholder="I'm trying to..." style={inputStyle} />
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <label style={labelStyle}>What's not working or missing?</label>
        <textarea value={broken} onChange={e => setBroken(e.target.value)} rows={3} placeholder="It would be better if..." style={inputStyle} />
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <label style={labelStyle}>Any other thoughts? <span style={{ fontWeight: 400, color: C.mutedLight }}>(optional)</span></label>
        <textarea value={other} onChange={e => setOther(e.target.value)} rows={2} placeholder="Anything else..." style={inputStyle} />
      </div>

      <button onClick={handleSubmit} disabled={status === "loading"} style={{
        width: "100%", padding: "14px", background: C.green, border: "none", borderRadius: 10,
        color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
        opacity: status === "loading" ? 0.75 : 1,
      }}>{status === "loading" ? "Sending..." : "Submit Feedback"}</button>
    </div>
  );
}

// ─── FLIP VS RENT COMPARISON ────────────────────────────────────────────────
function FlipVsRentTool({ onClose }) {
  const [shared, setShared] = useState({ purchasePrice: "", rehabCost: "", condition: "Average" });
  const [flip, setFlip] = useState({ closingCostsBuy: "3", holdingMonths: "6", monthlyHolding: "", financeAmt: "", interestRate: "10", points: "2", arvEstimate: "", closingCostsSell: "8" });
  const [rent, setRent] = useState({ downPercent: "20", loanRate: "7.5", loanTermYears: "30", monthlyRent: "", vacancy: "8", propertyTax: "", insurance: "", maintenance: "", mgmt: "0" });
  const [result, setResult] = useState(null);

  const setS = (k) => (v) => setShared(p => ({ ...p, [k]: v }));
  const setFl = (k) => (v) => setFlip(p => ({ ...p, [k]: v }));
  const setR = (k) => (v) => setRent(p => ({ ...p, [k]: v }));

  const compare = () => {
    const purchase = num(shared.purchasePrice);
    const rehab = num(shared.rehabCost);
    // Flip calc
    const fBuyClose = purchase * (num(flip.closingCostsBuy) / 100);
    const fHoldMo = num(flip.holdingMonths);
    const fHoldCost = num(flip.monthlyHolding) * fHoldMo;
    const fInterest = num(flip.financeAmt) * (num(flip.interestRate) / 100) * (fHoldMo / 12);
    const fPoints = num(flip.financeAmt) * (num(flip.points) / 100);
    const arv = num(flip.arvEstimate);
    const fSellClose = arv * (num(flip.closingCostsSell) / 100);
    const fTotalIn = purchase + fBuyClose + rehab + fHoldCost + fInterest + fPoints;
    const fProfit = arv - fSellClose - fTotalIn;
    const fROI = fTotalIn > 0 ? (fProfit / fTotalIn) * 100 : 0;
    // Rent calc
    const rDown = purchase * (num(rent.downPercent) / 100);
    const rLoanAmt = purchase - rDown;
    const rMonthlyRate = num(rent.loanRate) / 100 / 12;
    const rN = num(rent.loanTermYears) * 12;
    const rMortgage = rLoanAmt > 0 && rMonthlyRate > 0 ? rLoanAmt * (rMonthlyRate * Math.pow(1 + rMonthlyRate, rN)) / (Math.pow(1 + rMonthlyRate, rN) - 1) : 0;
    const rGross = num(rent.monthlyRent);
    const rVacLoss = rGross * (num(rent.vacancy) / 100);
    const rEffective = rGross - rVacLoss;
    const rOpEx = num(rent.propertyTax) / 12 + num(rent.insurance) / 12 + num(rent.maintenance) + (rEffective * num(rent.mgmt) / 100);
    const rNOI = rEffective - rOpEx;
    const rCashFlow = rNOI - rMortgage;
    const rAnnualCF = rCashFlow * 12;
    const rTotalInvested = rDown + rehab;
    const rCashOnCash = rTotalInvested > 0 ? (rAnnualCF / rTotalInvested) * 100 : 0;
    // 5-year projection
    const appreciation = 0.03;
    const rentGrowth = 0.02;
    const projection = [];
    let cumFlipProfit = fProfit;
    let propValue = purchase;
    let cumRentCF = 0;
    let yearlyRent = rAnnualCF;
    for (let y = 1; y <= 5; y++) {
      propValue *= (1 + appreciation);
      const equity = propValue - rLoanAmt;
      yearlyRent = y === 1 ? rAnnualCF : yearlyRent * (1 + rentGrowth);
      cumRentCF += yearlyRent;
      projection.push({ year: y, flipValue: cumFlipProfit, rentCashFlow: cumRentCF, rentEquity: equity, rentTotal: cumRentCF + equity - rDown });
    }
    const winner = fProfit > cumRentCF + (propValue - rLoanAmt) - rDown ? "flip" : "rent";
    setResult({ fProfit, fROI, fTotalIn, arv, fSellClose, rCashFlow, rAnnualCF, rCashOnCash, rDown, rTotalInvested, rMortgage, projection, winner });
  };

  const bx = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "40px 16px" };
  const panel = { background: C.white, borderRadius: 14, padding: "20px", border: `1px solid ${C.border}`, flex: 1, minWidth: 0 };

  return (
    <div style={bx} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: 16, width: "100%", maxWidth: 960, padding: "28px 24px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        {_modalHeader("Flip vs Rent Comparison", onClose)}

        {/* Shared inputs */}
        <Card>
          <SectionTitle>Property Details</SectionTitle>
          <TwoCol>
            <Field label="Purchase Price" value={shared.purchasePrice} onChange={setS("purchasePrice")} />
            <Field label="Rehab / Repair Cost" value={shared.rehabCost} onChange={setS("rehabCost")} />
          </TwoCol>
        </Card>

        {/* Side by side inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={panel}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.green, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Flip Path</div>
            <Field label="ARV (Sale Price)" value={flip.arvEstimate} onChange={setFl("arvEstimate")} />
            <div style={{ height: 6 }} />
            <TwoCol>
              <Field label="Hold Period" value={flip.holdingMonths} onChange={setFl("holdingMonths")} prefix="" suffix="mo" />
              <Field label="Monthly Hold Cost" value={flip.monthlyHolding} onChange={setFl("monthlyHolding")} />
            </TwoCol>
            <div style={{ height: 6 }} />
            <TwoCol>
              <Field label="Finance Amt" value={flip.financeAmt} onChange={setFl("financeAmt")} />
              <Field label="Interest Rate" value={flip.interestRate} onChange={setFl("interestRate")} prefix="%" suffix="" />
            </TwoCol>
            <div style={{ height: 6 }} />
            <TwoCol>
              <Field label="Points" value={flip.points} onChange={setFl("points")} prefix="%" suffix="" />
              <Field label="Sell Closing" value={flip.closingCostsSell} onChange={setFl("closingCostsSell")} prefix="%" suffix="" />
            </TwoCol>
          </div>
          <div style={panel}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#3b82f6", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rent Path</div>
            <Field label="Monthly Rent" value={rent.monthlyRent} onChange={setR("monthlyRent")} />
            <div style={{ height: 6 }} />
            <TwoCol>
              <Field label="Down Payment" value={rent.downPercent} onChange={setR("downPercent")} prefix="%" suffix="" />
              <Field label="Loan Rate" value={rent.loanRate} onChange={setR("loanRate")} prefix="%" suffix="" />
            </TwoCol>
            <div style={{ height: 6 }} />
            <TwoCol>
              <Field label="Property Tax / Yr" value={rent.propertyTax} onChange={setR("propertyTax")} />
              <Field label="Insurance / Yr" value={rent.insurance} onChange={setR("insurance")} />
            </TwoCol>
            <div style={{ height: 6 }} />
            <TwoCol>
              <Field label="Maintenance / Mo" value={rent.maintenance} onChange={setR("maintenance")} />
              <Field label="Vacancy" value={rent.vacancy} onChange={setR("vacancy")} prefix="%" suffix="" />
            </TwoCol>
          </div>
        </div>

        <button onClick={compare} style={{ width: "100%", padding: "14px", background: C.green, border: "none", borderRadius: 10, color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.3)", marginBottom: 16 }}>Compare Paths</button>

        {result && (
          <>
            {/* Winner banner */}
            <div style={{ background: result.winner === "flip" ? C.greenLight : "#dbeafe", border: `2px solid ${result.winner === "flip" ? "#86efac" : "#93c5fd"}`, borderRadius: 14, padding: "20px 24px", textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: result.winner === "flip" ? C.green : "#3b82f6", marginBottom: 4 }}>
                {result.winner === "flip" ? "Flip Wins" : "Rent Wins"} — 5 Year Horizon
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {result.winner === "flip"
                  ? `Net profit of ${fmtD(result.fProfit)} now beats the 5-year rental return.`
                  : `Cumulative cash flow + equity beats the one-time flip profit over 5 years.`}
              </div>
            </div>

            {/* Side by side results */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <Card style={{ border: `2px solid ${result.winner === "flip" ? "#86efac" : C.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.green, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Flip Returns</div>
                <StatRow label="Net Profit" value={fmtD(result.fProfit)} highlight />
                <StatRow label="ROI" value={fmtP(result.fROI)} />
                <StatRow label="Total Money In" value={fmtD(result.fTotalIn)} />
                <StatRow label="Timeline" value={`${num(flip.holdingMonths)} months`} last />
              </Card>
              <Card style={{ border: `2px solid ${result.winner === "rent" ? "#93c5fd" : C.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#3b82f6", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rental Returns</div>
                <StatRow label="Monthly Cash Flow" value={fmtD(result.rCashFlow)} highlight />
                <StatRow label="Cash-on-Cash Return" value={fmtP(result.rCashOnCash)} />
                <StatRow label="Annual Cash Flow" value={fmtD(result.rAnnualCF)} />
                <StatRow label="Total Invested" value={fmtD(result.rTotalInvested)} last />
              </Card>
            </div>

            {/* 5-Year Projection Table */}
            <Card>
              <SectionTitle>5-Year Projection</SectionTitle>
              <div style={{ fontSize: 11, color: C.mutedLight, marginBottom: 10 }}>Assumes 3% annual appreciation, 2% rent growth</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 700, color: C.muted, fontSize: 11, textTransform: "uppercase" }}>Year</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: C.green, fontSize: 11, textTransform: "uppercase" }}>Flip Value</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "#3b82f6", fontSize: 11, textTransform: "uppercase" }}>Rent Cash Flow</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "#3b82f6", fontSize: 11, textTransform: "uppercase" }}>Rent Equity</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "#3b82f6", fontSize: 11, textTransform: "uppercase" }}>Rent Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.projection.map(p => (
                      <tr key={p.year} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "10px", fontWeight: 600 }}>Year {p.year}</td>
                        <td style={{ padding: "10px", textAlign: "right", fontWeight: 700, color: C.green }}>{fmtD(p.flipValue)}</td>
                        <td style={{ padding: "10px", textAlign: "right", color: C.text }}>{fmtD(p.rentCashFlow)}</td>
                        <td style={{ padding: "10px", textAlign: "right", color: C.text }}>{fmtD(p.rentEquity)}</td>
                        <td style={{ padding: "10px", textAlign: "right", fontWeight: 700, color: "#3b82f6" }}>{fmtD(p.rentTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ACTIVE REHABS ──────────────────────────────────────────────────────────
function ActiveRehabs({ session }) {
  const [rehabs, setRehabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRehab, setActiveRehab] = useState(null);
  const [modal, setModal] = useState(null); // "contractor" | "note" | "photo" | "scorecard" | null
  const [contractorForm, setContractorForm] = useState({ name: "", scope: "", bid: "", paid: "", changeOrders: "" });
  const [noteForm, setNoteForm] = useState("");
  const [photoRoom, setPhotoRoom] = useState("kitchen");
  const [scorecardForm, setScorecardForm] = useState({ actualARV: "", actualRehab: "", actualHolding: "", actualSellClose: "" });

  useEffect(() => {
    if (!session) return;
    supabase.from("active_rehabs").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false })
      .then(res => { dbLog("active_rehabs.select", res); setRehabs(res.data || []); setLoading(false); });
  }, [session]);

  const refreshRehabs = () => {
    supabase.from("active_rehabs").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false })
      .then(res => { setRehabs(res.data || []); });
  };

  const saveContractor = async () => {
    if (!contractorForm.name || !activeRehab) return;
    const contractors = [...(activeRehab.contractors || []), { id: Date.now(), name: contractorForm.name, scope: contractorForm.scope, bid: num(contractorForm.bid), paid: num(contractorForm.paid), changeOrders: num(contractorForm.changeOrders) }];
    await supabase.from("active_rehabs").update({ contractors }).eq("id", activeRehab.id);
    setActiveRehab(prev => ({ ...prev, contractors }));
    setContractorForm({ name: "", scope: "", bid: "", paid: "", changeOrders: "" });
    setModal(null);
    refreshRehabs();
  };

  const deleteContractor = async (cid) => {
    const contractors = (activeRehab.contractors || []).filter(c => c.id !== cid);
    await supabase.from("active_rehabs").update({ contractors }).eq("id", activeRehab.id);
    setActiveRehab(prev => ({ ...prev, contractors }));
    refreshRehabs();
  };

  const saveNote = async () => {
    if (!noteForm.trim() || !activeRehab) return;
    const notes = [...(activeRehab.notes || []), { id: Date.now(), date: new Date().toISOString().split("T")[0], text: noteForm.trim() }];
    await supabase.from("active_rehabs").update({ notes }).eq("id", activeRehab.id);
    setActiveRehab(prev => ({ ...prev, notes }));
    setNoteForm("");
    setModal(null);
    refreshRehabs();
  };

  const deleteNote = async (nid) => {
    const notes = (activeRehab.notes || []).filter(n => n.id !== nid);
    await supabase.from("active_rehabs").update({ notes }).eq("id", activeRehab.id);
    setActiveRehab(prev => ({ ...prev, notes }));
    refreshRehabs();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeRehab) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const photos = [...(activeRehab.photos || []), { id: Date.now(), room: photoRoom, dataUrl: ev.target.result, date: new Date().toISOString().split("T")[0] }];
      await supabase.from("active_rehabs").update({ photos }).eq("id", activeRehab.id);
      setActiveRehab(prev => ({ ...prev, photos }));
      setModal(null);
      refreshRehabs();
    };
    reader.readAsDataURL(file);
  };

  const deletePhoto = async (pid) => {
    const photos = (activeRehab.photos || []).filter(p => p.id !== pid);
    await supabase.from("active_rehabs").update({ photos }).eq("id", activeRehab.id);
    setActiveRehab(prev => ({ ...prev, photos }));
    refreshRehabs();
  };

  const saveScorecard = async () => {
    if (!activeRehab) return;
    const scorecard = { actualARV: num(scorecardForm.actualARV), actualRehab: num(scorecardForm.actualRehab), actualHolding: num(scorecardForm.actualHolding), actualSellClose: num(scorecardForm.actualSellClose) };
    const actualProfit = scorecard.actualARV - scorecard.actualSellClose - (activeRehab.purchase_price || 0) - scorecard.actualRehab - scorecard.actualHolding;
    scorecard.actualProfit = actualProfit;
    await supabase.from("active_rehabs").update({ scorecard, status: "closed" }).eq("id", activeRehab.id);
    setActiveRehab(prev => ({ ...prev, scorecard, status: "closed" }));
    setModal(null);
    refreshRehabs();
  };

  // Detail view
  if (activeRehab) {
    const contractors = activeRehab.contractors || [];
    const notes = (activeRehab.notes || []).sort((a, b) => b.id - a.id);
    const photos = activeRehab.photos || [];
    const projected = activeRehab.projected || {};
    const totalPaid = contractors.reduce((s, c) => s + c.paid, 0);
    const totalChangeOrders = contractors.reduce((s, c) => s + (c.changeOrders || 0), 0);
    const budgetRemaining = (projected.rehabCost || 0) - totalPaid;
    const sc = activeRehab.scorecard;
    const ROOMS = ["kitchen", "bathroom", "bedroom", "living", "exterior", "basement", "garage"];

    return (
      <div>
        <button onClick={() => setActiveRehab(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", fontSize: 14, fontWeight: 600, color: C.green, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: "0 0 16px" }}>
          <ArrowLeft size={16} color={C.green} /> Back to Active Rehabs
        </button>

        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>{activeRehab.address}</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
          Started {activeRehab.created_at ? new Date(activeRehab.created_at).toLocaleDateString() : "—"}
          {activeRehab.status === "closed" && <span style={{ marginLeft: 8, background: C.greenLight, color: C.green, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>CLOSED</span>}
        </div>

        {/* Budget overview */}
        <div className="db-stat-row" style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <DashStatCard label="Projected Rehab" value={fmtD(projected.rehabCost || 0)} />
          <DashStatCard label="Actual Spent" value={fmtD(totalPaid)} />
          <DashStatCard label="Budget Remaining" value={fmtD(budgetRemaining)} />
          <DashStatCard label="Change Orders" value={fmtD(totalChangeOrders)} />
        </div>

        {/* Budget bar */}
        {(projected.rehabCost || 0) > 0 && (() => {
          const pct = Math.min((totalPaid / projected.rehabCost) * 100, 100);
          const over = totalPaid > projected.rehabCost;
          return (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>
                <span>Budget Used</span>
                <span style={{ color: over ? C.red : C.green }}>{pct.toFixed(0)}%</span>
              </div>
              <div style={{ height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: over ? C.red : C.green, borderRadius: 4, transition: "width 0.3s" }} />
              </div>
            </div>
          );
        })()}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <button onClick={() => { setContractorForm({ name: "", scope: "", bid: "", paid: "", changeOrders: "" }); setModal("contractor"); }} style={_addBtn}><Plus size={14} style={{ marginRight: 4 }} /> Add Contractor</button>
          <button onClick={() => { setNoteForm(""); setModal("note"); }} style={_addBtn}><Edit3 size={14} style={{ marginRight: 4 }} /> Add Progress Note</button>
          <button onClick={() => setModal("photo")} style={_addBtn}><Camera size={14} style={{ marginRight: 4 }} /> Upload Photo</button>
          {activeRehab.status !== "closed" && (
            <button onClick={() => { setScorecardForm({ actualARV: "", actualRehab: String(totalPaid || ""), actualHolding: "", actualSellClose: "" }); setModal("scorecard"); }} style={{ ..._addBtn, background: "#f59e0b" }}>Close & Score This Flip</button>
          )}
        </div>

        {/* Contractor modal */}
        {modal === "contractor" && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setModal(null)}>
            <div style={{ background: C.white, borderRadius: 14, padding: "24px", width: "100%", maxWidth: 440, margin: "0 16px" }} onClick={e => e.stopPropagation()}>
              {_modalHeader("Add Contractor", () => setModal(null))}
              <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Contractor Name</label><input value={contractorForm.name} onChange={e => setContractorForm(p => ({ ...p, name: e.target.value }))} placeholder="ABC Plumbing" style={_modalInput} /></div>
              <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Scope of Work</label><input value={contractorForm.scope} onChange={e => setContractorForm(p => ({ ...p, scope: e.target.value }))} placeholder="Kitchen and bath rough-in" style={_modalInput} /></div>
              <TwoCol>
                <div><label style={_modalLabel}>Bid Amount</label><input type="number" value={contractorForm.bid} onChange={e => setContractorForm(p => ({ ...p, bid: e.target.value }))} placeholder="0" style={_modalInput} /></div>
                <div><label style={_modalLabel}>Amount Paid</label><input type="number" value={contractorForm.paid} onChange={e => setContractorForm(p => ({ ...p, paid: e.target.value }))} placeholder="0" style={_modalInput} /></div>
              </TwoCol>
              <div style={{ marginTop: 12 }}><label style={_modalLabel}>Change Orders</label><input type="number" value={contractorForm.changeOrders} onChange={e => setContractorForm(p => ({ ...p, changeOrders: e.target.value }))} placeholder="0" style={_modalInput} /></div>
              <button onClick={saveContractor} style={_modalSubmit()}>Add Contractor</button>
            </div>
          </div>
        )}

        {/* Note modal */}
        {modal === "note" && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setModal(null)}>
            <div style={{ background: C.white, borderRadius: 14, padding: "24px", width: "100%", maxWidth: 440, margin: "0 16px" }} onClick={e => e.stopPropagation()}>
              {_modalHeader("Weekly Progress Note", () => setModal(null))}
              <textarea value={noteForm} onChange={e => setNoteForm(e.target.value)} rows={4} placeholder="What got done this week? Any issues?" style={{ ..._modalInput, resize: "vertical" }} />
              <button onClick={saveNote} style={_modalSubmit()}>Save Note</button>
            </div>
          </div>
        )}

        {/* Photo upload modal */}
        {modal === "photo" && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setModal(null)}>
            <div style={{ background: C.white, borderRadius: 14, padding: "24px", width: "100%", maxWidth: 440, margin: "0 16px" }} onClick={e => e.stopPropagation()}>
              {_modalHeader("Upload Pre-Rehab Photo", () => setModal(null))}
              <div style={{ marginBottom: 12 }}>
                <label style={_modalLabel}>Room</label>
                <select value={photoRoom} onChange={e => setPhotoRoom(e.target.value)} style={{ ..._modalInput, cursor: "pointer" }}>
                  {ROOMS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "24px", border: `2px dashed ${C.border}`, borderRadius: 10, cursor: "pointer", color: C.muted, fontSize: 14, fontWeight: 600 }}>
                <Upload size={20} color={C.green} /> Choose Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
              </label>
            </div>
          </div>
        )}

        {/* Scorecard modal */}
        {modal === "scorecard" && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setModal(null)}>
            <div style={{ background: C.white, borderRadius: 14, padding: "24px", width: "100%", maxWidth: 480, margin: "0 16px" }} onClick={e => e.stopPropagation()}>
              {_modalHeader("Flip Scorecard — Close This Flip", () => setModal(null))}
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Enter your actual numbers. We'll compare them to your projections.</div>
              <TwoCol>
                <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Actual Sale Price (ARV)</label><input type="number" value={scorecardForm.actualARV} onChange={e => setScorecardForm(p => ({ ...p, actualARV: e.target.value }))} placeholder="0" style={_modalInput} /></div>
                <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Actual Rehab Cost</label><input type="number" value={scorecardForm.actualRehab} onChange={e => setScorecardForm(p => ({ ...p, actualRehab: e.target.value }))} placeholder="0" style={_modalInput} /></div>
              </TwoCol>
              <TwoCol>
                <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Actual Holding Costs</label><input type="number" value={scorecardForm.actualHolding} onChange={e => setScorecardForm(p => ({ ...p, actualHolding: e.target.value }))} placeholder="0" style={_modalInput} /></div>
                <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Actual Sell Closing</label><input type="number" value={scorecardForm.actualSellClose} onChange={e => setScorecardForm(p => ({ ...p, actualSellClose: e.target.value }))} placeholder="0" style={_modalInput} /></div>
              </TwoCol>
              <button onClick={saveScorecard} style={_modalSubmit()}>Close & Generate Scorecard</button>
            </div>
          </div>
        )}

        {/* Scorecard display */}
        {sc && (
          <Card style={{ background: C.greenLight, border: `2px solid #86efac`, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.green, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Flip Scorecard — Projected vs Actual</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid #86efac` }}>
                    <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 700, color: C.muted, fontSize: 11, textTransform: "uppercase" }}>Metric</th>
                    <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: C.muted, fontSize: 11, textTransform: "uppercase" }}>Projected</th>
                    <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: C.muted, fontSize: 11, textTransform: "uppercase" }}>Actual</th>
                    <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: C.muted, fontSize: 11, textTransform: "uppercase" }}>Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Sale Price (ARV)", proj: projected.arv, actual: sc.actualARV },
                    { label: "Rehab Cost", proj: projected.rehabCost, actual: sc.actualRehab },
                    { label: "Holding Costs", proj: projected.holdingCost, actual: sc.actualHolding },
                    { label: "Sell Closing", proj: projected.sellClose, actual: sc.actualSellClose },
                    { label: "Net Profit", proj: projected.netProfit, actual: sc.actualProfit, highlight: true },
                  ].map((row, i) => {
                    const variance = (row.actual || 0) - (row.proj || 0);
                    const isProfit = row.label === "Net Profit";
                    const good = isProfit ? variance >= 0 : row.label === "Sale Price (ARV)" ? variance >= 0 : variance <= 0;
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid #bbf7d0` }}>
                        <td style={{ padding: "10px", fontWeight: row.highlight ? 700 : 500 }}>{row.label}</td>
                        <td style={{ padding: "10px", textAlign: "right" }}>{fmtD(row.proj || 0)}</td>
                        <td style={{ padding: "10px", textAlign: "right", fontWeight: 700 }}>{fmtD(row.actual || 0)}</td>
                        <td style={{ padding: "10px", textAlign: "right", fontWeight: 700, color: good ? C.green : C.red }}>{variance >= 0 ? "+" : ""}{fmtD(variance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Contractors table */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Contractors</div>
          </div>
          {contractors.length === 0 ? (
            <div style={{ fontSize: 13, color: C.muted, padding: "16px 0", textAlign: "center" }}>No contractors yet. Add one to start tracking.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {["Contractor", "Scope", "Bid", "Paid", "Balance", "Change Orders", ""].map(h => (
                      <th key={h} style={{ textAlign: h === "" ? "center" : "left", padding: "8px 8px", fontWeight: 700, color: C.muted, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contractors.map(c => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "10px 8px", fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: "10px 8px", color: C.muted }}>{c.scope}</td>
                      <td style={{ padding: "10px 8px" }}>{fmtD(c.bid)}</td>
                      <td style={{ padding: "10px 8px" }}>{fmtD(c.paid)}</td>
                      <td style={{ padding: "10px 8px", fontWeight: 700, color: c.bid - c.paid > 0 ? C.yellow : C.green }}>{fmtD(c.bid - c.paid + (c.changeOrders || 0))}</td>
                      <td style={{ padding: "10px 8px", color: (c.changeOrders || 0) > 0 ? C.red : C.muted }}>{fmtD(c.changeOrders || 0)}</td>
                      <td style={{ padding: "10px 8px", textAlign: "center" }}>
                        <button onClick={() => deleteContractor(c.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={14} color={C.red} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pre-Rehab Photos */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Pre-Rehab Inspection Photos</div>
          </div>
          {photos.length === 0 ? (
            <div style={{ fontSize: 13, color: C.muted, padding: "16px 0", textAlign: "center" }}>No photos yet. Upload pre-rehab photos to document conditions.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
              {photos.map(p => (
                <div key={p.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
                  <img src={p.dataUrl} alt={p.room} style={{ width: "100%", height: 100, objectFit: "cover" }} />
                  <div style={{ padding: "6px 8px", fontSize: 11, fontWeight: 600, color: C.text, background: C.bg }}>
                    {p.room.charAt(0).toUpperCase() + p.room.slice(1)} — {p.date}
                  </div>
                  <button onClick={() => deletePhoto(p.id)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 4, padding: 2, cursor: "pointer" }}><X size={12} color="#fff" /></button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Progress Notes */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Weekly Progress Notes</div>
          </div>
          {notes.length === 0 ? (
            <div style={{ fontSize: 13, color: C.muted, padding: "16px 0", textAlign: "center" }}>No progress notes yet.</div>
          ) : (
            notes.map(n => (
              <div key={n.id} style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedLight, marginBottom: 4 }}>{n.date}</div>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{n.text}</div>
                </div>
                <button onClick={() => deleteNote(n.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}><Trash2 size={14} color={C.mutedLight} /></button>
              </div>
            ))
          )}
        </Card>
      </div>
    );
  }

  // List view
  if (loading) return <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 14 }}>Loading active rehabs...</div>;

  return (
    <div>
      {rehabs.length === 0 ? (
        <div style={{ background: C.white, border: `1.5px dashed ${C.border}`, borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ marginBottom: 12, opacity: 0.3, display: "flex", justifyContent: "center" }}><Hammer size={36} color={C.green} /></div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.muted, lineHeight: 1.5 }}>No active rehabs yet.</div>
          <div style={{ fontSize: 13, color: C.mutedLight, marginTop: 8 }}>When a Fix & Flip deal gets a green verdict, use "Start Rehab" to move it here.</div>
        </div>
      ) : (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          {rehabs.map((r, i) => {
            const totalPaid = (r.contractors || []).reduce((s, c) => s + c.paid, 0);
            const budget = r.projected?.rehabCost || 0;
            const pct = budget > 0 ? Math.min((totalPaid / budget) * 100, 100) : 0;
            return (
              <div key={r.id} onClick={() => setActiveRehab(r)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderBottom: i < rehabs.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{r.address}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {r.status === "closed" ? "Closed" : `${(r.contractors || []).length} contractors · ${(r.notes || []).length} notes`}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Budget</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: pct > 90 ? C.red : C.text }}>{pct.toFixed(0)}% used</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Spent</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{fmtD(totalPaid)}</div>
                  </div>
                  {r.status === "closed" && <span style={{ background: C.greenLight, color: C.green, padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>CLOSED</span>}
                  <ChevronRight size={16} color={C.mutedLight} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────


function DoorBaseLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
        <path d="M8 34 L8 8 L28 8 L28 34" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M8 8 L8 34 L20 31 L20 11 Z" fill="#22C55E" opacity="0.9"/>
        <circle cx="18" cy="21" r="1.5" fill="white" opacity="0.9"/>
        <line x1="4" y1="34" x2="32" y2="34" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>Door</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: C.green, fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>Base</span>
      </div>
    </div>
  );
}

function SidebarItem({ label, active, soon, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={soon ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "9px 14px", borderRadius: 8, marginBottom: 2,
        background: active ? C.greenLight : hovered && !soon ? C.bg : "transparent",
        color: active ? C.greenDark : soon ? C.mutedLight : C.muted,
        fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: soon ? "default" : "pointer",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        transition: "all 0.12s",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <span>{label}</span>
      {soon && <span style={{ fontSize: 10, fontWeight: 600, color: C.mutedLight, background: C.bg, padding: "2px 6px", borderRadius: 4 }}>Soon</span>}
    </div>
  );
}

function DashStatCard({ label, value, sub }) {
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: "18px 16px", flex: 1,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{value}{sub && <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>{sub}</span>}</div>
    </div>
  );
}

function DashVerdictBadge({ verdict }) {
  const cfg = {
    green: { bg: C.greenLight, color: C.greenDark, label: "DEAL WORKS" },
    yellow: { bg: C.yellowLight, color: C.yellowDark, label: "MARGINAL" },
    red: { bg: C.redLight, color: C.red, label: "PASS" },
  }[verdict];
  return (
    <span style={{
      background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700,
      padding: "4px 10px", borderRadius: 6, letterSpacing: "0.04em",
    }}>{cfg.label}</span>
  );
}

function HomePickerCard({ title, desc, checklist, stats, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.white, borderRadius: 16,
        border: `2px solid ${hovered ? C.green : C.border}`,
        padding: "32px 28px", cursor: "pointer",
        transition: "all 0.2s",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.07)",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>{desc}</div>
      <div style={{ marginBottom: 24 }}>
        {checklist.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Check size={13} color={C.green} strokeWidth={3} />
            <span style={{ fontSize: 13, color: C.text }}>{item}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, display: "flex", gap: 24 }}>
        {stats.map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PIPELINE_NAV = [
  { id: "dashboard", label: "Dashboard" },
  { id: "analyzer", label: "Deal Analyzer" },
  { id: "saved", label: "Saved Deals" },
  { id: "worksheet", label: "Underwriting Worksheet" },
  { id: "rehab", label: "Rehab Estimator" },
  { id: "rent", label: "Rent Analysis" },
  { id: "comps", label: "Comp Tracker" },
];

const PROPERTIES_NAV = [
  { id: "dashboard", label: "Dashboard" },
  { id: "overview", label: "Portfolio Overview" },
  { id: "rehabs", label: "Active Rehabs" },
  { id: "cashflow", label: "Cash Flow Tracker" },
  { id: "tenants", label: "Tenant Tracker" },
  { id: "maintenance", label: "Maintenance Log" },
  { id: "financing", label: "Financing Tracker" },
  { id: "leases", label: "Lease Renewals" },
  { id: "tax", label: "Tax Summary", soon: true },
  { id: "docs", label: "Documents", soon: true },
];

function Dashboard({ standards, onSaveStandards, onShowSettings, mode, setMode, isPro, onShowCapture, onEmailResults, onSignOut, session }) {
  const isMobile = useIsMobile();
  const [view, setView] = useState("home");
  const [pipelineNav, setPipelineNav] = useState("dashboard");
  const [propertiesNav, setPropertiesNav] = useState("dashboard");
  const [showWorksheet, setShowWorksheet] = useState(false);
  const [showRehab, setShowRehab] = useState(false);
  const [showRentAnalysis, setShowRentAnalysis] = useState(false);
  const [showCompTracker, setShowCompTracker] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showFlipVsRent, setShowFlipVsRent] = useState(false);
  const [dashPanel, setDashPanel] = useState(null); // "settings" | "feedback" | null
  const [convertDeal, setConvertDeal] = useState(null); // deal object to convert to property
  const [convertForm, setConvertForm] = useState({ address: "", units: "1", monthlyRent: "", monthlyExpenses: "", loanBalance: "" });
  const [convertSaving, setConvertSaving] = useState(false);
  const [propModal, setPropModal] = useState(null); // null | { address, units, monthlyRent, monthlyExpenses, loanBalance }
  const [propSaving, setPropSaving] = useState(false);

  const [deals, setDeals] = useState([]);
  const [properties, setProperties] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [propsLoading, setPropsLoading] = useState(true);
  const [briefingTenants, setBriefingTenants] = useState([]);
  const [briefingPayments, setBriefingPayments] = useState([]);
  const [briefingLeases, setBriefingLeases] = useState([]);
  const [briefingLoans, setBriefingLoans] = useState([]);
  const [briefingMaintenance, setBriefingMaintenance] = useState([]);

  const firstName = session?.user?.email ? session.user.email.split("@")[0].replace(/[^a-zA-Z]/g, " ").split(" ")[0].charAt(0).toUpperCase() + session.user.email.split("@")[0].replace(/[^a-zA-Z]/g, " ").split(" ")[0].slice(1) : "there";
  const userInitials = session?.user?.email ? session.user.email.split("@")[0].replace(/[^a-zA-Z]/g, " ").trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U" : "U";
  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const refreshAll = useCallback(() => {
    if (!session) return;
    supabase.from("deals").select("*").order("created_at", { ascending: false })
      .then(res => { dbLog("dashboard.deals", res); setDeals(res.data || []); setDealsLoading(false); });
    supabase.from("properties").select("*").order("created_at", { ascending: false })
      .then(res => { dbLog("dashboard.properties", res); setProperties(res.data || []); setPropsLoading(false); });
    supabase.from("tenants").select("*").then(res => { dbLog("dashboard.tenants", res); setBriefingTenants(res.data || []); });
    supabase.from("payment_history").select("*").order("due_date", { ascending: false }).then(res => { dbLog("dashboard.payments", res); setBriefingPayments(res.data || []); });
    supabase.from("leases").select("*").then(res => { dbLog("dashboard.leases", res); setBriefingLeases(res.data || []); });
    supabase.from("loans").select("*").then(res => { dbLog("dashboard.loans", res); setBriefingLoans(res.data || []); });
    supabase.from("maintenance_items").select("*").then(res => { dbLog("dashboard.maintenance", res); setBriefingMaintenance(res.data || []); });
  }, [session]);

  // Load on mount and refresh whenever user navigates to a dashboard view
  useEffect(() => { refreshAll(); }, [refreshAll]);
  useEffect(() => { if (pipelineNav === "dashboard") refreshAll(); }, [pipelineNav, refreshAll]);
  useEffect(() => { if (propertiesNav === "dashboard") refreshAll(); }, [propertiesNav, refreshAll]);

  const refreshDeals = () => refreshAll();
  const refreshProperties = () => refreshAll();
  const openConvert = (deal) => {
    const inputs = deal.inputs || {};
    setConvertForm({
      address: deal.address || "",
      units: String(inputs.units || 1),
      monthlyRent: String(inputs.monthlyRent || inputs.grossRent || ""),
      monthlyExpenses: String(inputs.monthlyExpenses || ""),
      loanBalance: String(inputs.loanAmount || inputs.loanBalance || ""),
    });
    setConvertDeal(deal);
  };
  const saveConvert = async () => {
    if (!convertForm.address) return;
    setConvertSaving(true);
    const res = await supabase.from("properties").insert({
      user_id: session.user.id,
      address: convertForm.address,
      units: parseInt(convertForm.units) || 1,
      monthly_rent: num(convertForm.monthlyRent),
      monthly_expenses: num(convertForm.monthlyExpenses),
      loan_balance: num(convertForm.loanBalance),
      purchase_price: convertDeal.purchase_price || 0,
      status: "current",
    }).select().single();
    dbLog("properties.insert(convert)", res);
    setConvertSaving(false);
    setConvertDeal(null);
    refreshProperties();
  };

  const openAddProperty = () => setPropModal({ address: "", units: "1", monthlyRent: "", monthlyExpenses: "", loanBalance: "" });
  const saveProperty = async () => {
    if (!propModal || !propModal.address) return;
    setPropSaving(true);
    const res = await supabase.from("properties").insert({
      user_id: session.user.id,
      address: propModal.address,
      units: parseInt(propModal.units) || 1,
      monthly_rent: num(propModal.monthlyRent),
      monthly_expenses: num(propModal.monthlyExpenses),
      loan_balance: num(propModal.loanBalance),
      status: "current",
    }).select().single();
    dbLog("properties.insert", res);
    setPropSaving(false);
    setPropModal(null);
    refreshProperties();
  };

  const startRehab = async (deal) => {
    const inputs = deal.inputs || {};
    const purchase = num(inputs.purchasePrice);
    const rehab = num(inputs.rehabCost);
    const holdMo = num(inputs.holdingMonths);
    const holdCost = num(inputs.monthlyHolding) * holdMo;
    const arv = num(inputs.arvEstimate);
    const sellClose = arv * (num(inputs.closingCostsSell) / 100);
    const res = await supabase.from("active_rehabs").insert({
      user_id: session.user.id,
      deal_id: deal.id,
      address: deal.address || `Flip — ${fmtD(purchase)}`,
      purchase_price: purchase,
      projected: { rehabCost: rehab, holdingCost: holdCost, arv, sellClose, netProfit: deal.net_profit || 0 },
      contractors: [],
      notes: [],
      photos: [],
      status: "active",
    }).select().single();
    dbLog("active_rehabs.insert", res);
    if (!res.error) {
      setView("properties");
      setPropertiesNav("rehabs");
    }
  };

  const greenDeals = deals.filter(d => d.verdict === "green").length;
  const yellowDeals = deals.filter(d => d.verdict === "yellow").length;

  const totalRent = properties.reduce((s, p) => s + (p.monthly_rent || 0), 0);
  // Factor in closed maintenance costs as actual expenses for total cash flow
  const closedMaintenanceCosts = briefingMaintenance.filter(m => m.status === "closed" && m.cost > 0).reduce((s, m) => s + m.cost, 0);
  const totalCashFlow = properties.reduce((s, p) => s + ((p.monthly_rent || 0) - (p.monthly_expenses || 0)), 0) - closedMaintenanceCosts;
  // Auto-detect late: tenants with status "late" OR tenants with unpaid overdue payments
  const now = new Date();
  const overduePaymentTenantIds = new Set(briefingPayments.filter(p => !p.paid_date && new Date(p.due_date) < now).map(p => p.tenant_id));
  const lateCount = briefingTenants.filter(t => t.status === "late" || overduePaymentTenantIds.has(t.id)).length;
  const openMaintenance = briefingMaintenance.filter(m => m.status === "open").length;

  const sidebarStyle = {
    width: 220, background: C.white, borderRight: `1px solid ${C.border}`,
    height: "100vh", position: "fixed", left: 0, top: 0, zIndex: 60,
    display: "flex", flexDirection: "column",
  };

  const topBarStyle = {
    height: 56, background: C.white, borderBottom: `1px solid ${C.border}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 28px",
    position: "fixed", top: 0, left: 220, right: 0, zIndex: 50,
  };

  const avatarStyle = {
    width: 36, height: 36, borderRadius: "50%", background: C.green,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700, color: C.white, fontFamily: "'DM Sans', sans-serif",
  };

  // ─── HOME PICKER ───
  if (view === "home") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg }}>
        <nav style={{ background: C.nav, boxShadow: "0 1px 0 rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                <path d="M8 34 L8 8 L28 8 L28 34" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M8 8 L8 34 L20 31 L20 11 Z" fill="#22C55E" opacity="0.9"/>
                <circle cx="18" cy="21" r="1.5" fill="white" opacity="0.9"/>
                <line x1="4" y1="34" x2="32" y2="34" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#F8FAFC", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em", lineHeight: 1 }}>Door</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#22C55E", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em", lineHeight: 1 }}>Base</span>
              </div>
            </div>
            <div onClick={() => { setView("pipeline"); setDashPanel("settings"); }} style={{ ...avatarStyle, cursor: "pointer" }}>{userInitials}</div>
          </div>
        </nav>

        <div style={{ maxWidth: 880, margin: "0 auto", padding: "48px 16px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 8 }}>Welcome back</div>
            <div style={{ fontSize: 16, color: C.muted }}>What are you working on today?</div>
          </div>
          <div className="home-picker-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <HomePickerCard
              title="Deal Pipeline"
              desc="Evaluate new deals — analyze, underwrite, compare, and build your pipeline."
              checklist={["Buy & Hold + Fix & Flip Analyzer", "Underwriting Worksheet", "Saved Deals & Side-by-Side", "Rehab Estimator"]}
              stats={[
                { label: "Deals", value: deals.length },
                { label: "Green", value: greenDeals },
                { label: "Yellow", value: yellowDeals },
              ]}
              onClick={() => setView("pipeline")}
            />
            <HomePickerCard
              title="My Properties"
              desc="Manage what you already own — cash flow, tenants, maintenance, and more."
              checklist={["Portfolio Overview", "Cash Flow Tracker", "Tenant & Lease Manager", "Maintenance Log"]}
              stats={[
                { label: "Doors", value: properties.reduce((s, p) => s + (p.units || 1), 0) },
                { label: "Rent/mo", value: fmtD(totalRent) },
                { label: "Cash Flow", value: fmtD(totalCashFlow) },
              ]}
              onClick={() => setView("properties")}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── PIPELINE DASHBOARD ───
  if (view === "pipeline") {
    const navTitle = { dashboard: "Dashboard", analyzer: "Deal Analyzer", saved: "Saved Deals", tools: "Tools" }[pipelineNav] || "Deal Pipeline";
    const bestHold = deals.filter(d => d.deal_type === "hold" && d.verdict === "green").map(d => d.cash_flow ? fmtD(d.cash_flow) + "/mo" : "—")[0] || "—";

    return (
      <div style={{ minHeight: "100vh", background: C.bg }}>

        {showWorksheet && <UnderwritingWorksheet onClose={() => setShowWorksheet(false)} onUsePrice={() => { setShowWorksheet(false); setPipelineNav("analyzer"); }} />}
        {showRehab && <RehabEstimator onClose={() => setShowRehab(false)} onUseCost={() => { setShowRehab(false); setPipelineNav("analyzer"); }} />}
        {showRentAnalysis && <RentAnalysisWorksheet onClose={() => setShowRentAnalysis(false)} onUseRent={() => { setShowRentAnalysis(false); setPipelineNav("analyzer"); }} />}
        {showCompTracker && <CompTrackerSheet onClose={() => setShowCompTracker(false)} onUseARV={() => { setShowCompTracker(false); setPipelineNav("analyzer"); }} />}
        {showFlipVsRent && <FlipVsRentTool onClose={() => setShowFlipVsRent(false)} />}

        {/* More drawer — mobile only */}
        {showMore && (
          <>
            <div onClick={() => setShowMore(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300 }} />
            <div style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301,
              background: C.white, borderRadius: "16px 16px 0 0",
              padding: "24px", paddingBottom: 32,
              boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 20px" }} />
              {[
                { label: "Underwriting Worksheet", onClick: () => { setShowMore(false); setShowWorksheet(true); } },
                { label: "Flip vs Rent", onClick: () => { setShowMore(false); setShowFlipVsRent(true); } },
                { label: "Rehab Estimator", onClick: () => { setShowMore(false); setShowRehab(true); } },
                { label: "Rent Analysis", onClick: () => { setShowMore(false); setShowRentAnalysis(true); } },
                { label: "Comp Tracker", onClick: () => { setShowMore(false); setShowCompTracker(true); } },
              ].map((item, i) => (
                <div key={i} onClick={item.soon ? undefined : item.onClick} style={{
                  padding: "14px 0", borderBottom: `1px solid ${C.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: item.soon ? "default" : "pointer",
                  color: item.soon ? C.mutedLight : C.text,
                  fontSize: 15, fontWeight: 600,
                }}>
                  <span>{item.label}</span>
                  {item.soon && <span style={{ fontSize: 11, fontWeight: 600, color: C.mutedLight, background: C.bg, padding: "3px 8px", borderRadius: 4 }}>Soon</span>}
                </div>
              ))}
              <div style={{ height: 1, background: C.border, margin: "8px 0" }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: C.mutedLight, textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 0 6px" }}>Switch Mode</div>
              {[
                { id: "pipeline", label: "Deal Pipeline" },
                { id: "properties", label: "My Properties" },
              ].map(m => (
                <div key={m.id} onClick={() => { setShowMore(false); setView(m.id); }} style={{
                  padding: "12px 0", borderBottom: `1px solid ${C.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: "pointer", color: C.text, fontSize: 15, fontWeight: 600,
                }}>
                  <span>{m.label}</span>
                  {view === m.id && <Check size={16} color={C.green} strokeWidth={3} />}
                </div>
              ))}
              <div style={{ height: 1, background: C.border, margin: "8px 0" }} />
              <div onClick={() => { setShowMore(false); setDashPanel("settings"); }} style={{ padding: "14px 0", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: C.text, fontSize: 15, fontWeight: 600 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                <span>Settings</span>
              </div>
              <div onClick={() => { setShowMore(false); setDashPanel("feedback"); }} style={{ padding: "14px 0", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: C.text, fontSize: 15, fontWeight: 600 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                <span>Feedback</span>
              </div>
            </div>
          </>
        )}

        {/* Desktop sidebar — hidden on mobile via JS + CSS fallback */}
        {!isMobile && (
        <div className="db-sidebar" style={sidebarStyle}>
          <div style={{ padding: "18px 16px 24px" }}><DoorBaseLogo /></div>
          <div style={{ padding: "0 10px", flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.mutedLight, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 14px 8px", fontFamily: "'DM Sans', sans-serif" }}>Deal Tools</div>
            {PIPELINE_NAV.map(item => (
              <SidebarItem
                key={item.id}
                label={item.label}
                active={pipelineNav === item.id && !item.soon && !dashPanel}
                soon={item.soon}
                onClick={() => {
                  setDashPanel(null);
                  if (item.id === "worksheet") setShowWorksheet(true);
                  else if (item.id === "rehab") setShowRehab(true);
                  else if (item.id === "rent") setShowRentAnalysis(true);
                  else if (item.id === "comps") setShowCompTracker(true);
                  else setPipelineNav(item.id);
                }}
              />
            ))}
          </div>
          <div style={{ padding: "16px" }}>
            <button onClick={() => setView("home")} style={{
              width: "100%", padding: "10px", background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.muted,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>Switch Mode</button>
            <div style={{ height: 1, background: C.border, margin: "12px 0" }} />
            <div onClick={() => { setDashPanel("settings"); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 6px", borderRadius: 6, cursor: "pointer", color: dashPanel === "settings" ? C.greenDark : C.muted, fontSize: 12, fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              Settings
            </div>
            <div onClick={() => { setDashPanel("feedback"); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 6px", borderRadius: 6, cursor: "pointer", color: dashPanel === "feedback" ? C.greenDark : C.muted, fontSize: 12, fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Feedback
            </div>
          </div>
        </div>
        )}

        {/* Top bar */}
        <div className="db-topbar" style={{ ...topBarStyle, ...(isMobile ? { left: 0, padding: '0 16px' } : {}) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" }}>
            <span onClick={() => { setDashPanel(null); setPipelineNav("dashboard"); }} style={{ fontSize: 14, fontWeight: 600, color: C.muted, cursor: "pointer" }}>Deal Pipeline</span>
            {(dashPanel || pipelineNav !== "dashboard") && <ChevronRight size={14} color={C.mutedLight} />}
            {dashPanel === "settings" ? (
              <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Settings</span>
            ) : dashPanel === "feedback" ? (
              <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Beta Feedback</span>
            ) : pipelineNav !== "dashboard" ? (
              <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{navTitle}</span>
            ) : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {pipelineNav === "analyzer" && !dashPanel && (
              <button onClick={onShowSettings} style={{
                background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
                width: 36, height: 36, display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", fontSize: 14,
}}><Settings size={16} color={C.muted} /></button>
            )}
            <div onClick={() => setDashPanel(dashPanel === "settings" ? null : "settings")} style={{ ...avatarStyle, cursor: "pointer" }}>{userInitials}</div>
          </div>
        </div>

        {/* Convert to Property modal */}
        {convertDeal && (
          <div style={_modalOverlay}><div style={_modalBox}>
            {_modalHeader("Convert Deal to Property", () => setConvertDeal(null))}
            <div style={{ background: C.greenLight, border: `1px solid ${C.green}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.greenDark }}>Converting: {convertDeal.address} ({convertDeal.deal_type === "hold" ? "Buy & Hold" : "Fix & Flip"})</div>
            </div>
            <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Address</label><input value={convertForm.address} onChange={e => setConvertForm(p => ({ ...p, address: e.target.value }))} style={_modalInput} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div><label style={_modalLabel}>Units</label><input type="number" value={convertForm.units} onChange={e => setConvertForm(p => ({ ...p, units: e.target.value }))} style={_modalInput} /></div>
              <div><label style={_modalLabel}>Monthly Rent</label><input type="number" value={convertForm.monthlyRent} onChange={e => setConvertForm(p => ({ ...p, monthlyRent: e.target.value }))} placeholder="0" style={_modalInput} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div><label style={_modalLabel}>Monthly Expenses</label><input type="number" value={convertForm.monthlyExpenses} onChange={e => setConvertForm(p => ({ ...p, monthlyExpenses: e.target.value }))} placeholder="0" style={_modalInput} /></div>
              <div><label style={_modalLabel}>Loan Balance</label><input type="number" value={convertForm.loanBalance} onChange={e => setConvertForm(p => ({ ...p, loanBalance: e.target.value }))} placeholder="0" style={_modalInput} /></div>
            </div>
            <button onClick={saveConvert} disabled={convertSaving} style={{ ..._modalSubmit(), opacity: convertSaving ? 0.7 : 1 }}>{convertSaving ? "Creating..." : "Create Property"}</button>
          </div></div>
        )}

        {/* Main content */}
        <div className="db-main" style={{ marginLeft: isMobile ? 0 : 220, padding: isMobile ? '16px' : '28px', paddingTop: isMobile ? 72 : 84, paddingBottom: isMobile ? 84 : undefined }}>
          {isMobile && !dashPanel && (
            <div onClick={() => setView("properties")} style={{ fontSize: 12, fontWeight: 600, color: C.green, cursor: "pointer", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
              Switch to My Properties <ArrowRight size={12} color={C.green} style={{ marginLeft: 4 }} />
            </div>
          )}
          {dashPanel === "settings" && <DashSettingsPanel standards={standards} onSaveStandards={onSaveStandards} defaultMode={mode} onSetDefaultMode={setMode} onSignOut={onSignOut} />}
          {dashPanel === "feedback" && <FeedbackPanel />}
          {/* Pipeline Morning Briefing */}
          {!dashPanel && pipelineNav === "dashboard" && (() => {
            const greenDealsList = deals.filter(d => d.verdict === "green");
            const bestCF = deals.filter(d => d.deal_type === "hold" && d.cash_flow).sort((a, b) => b.cash_flow - a.cash_flow)[0];
            const bestROI = deals.filter(d => d.roi).sort((a, b) => b.roi - a.roi)[0];
            const last3 = deals.slice(0, 3);
            return (
            <>
              {/* Morning header */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 4 }}>Good morning, {firstName}.</div>
                <div style={{ fontSize: 14, color: C.muted }}>{todayStr}</div>
              </div>

              {/* Row 1 — Stat cards */}
              <div className="db-stat-row" style={{ display: "flex", gap: 12, marginBottom: 28 }}>
                <DashStatCard label="Deals Analyzed" value={deals.length} />
                <DashStatCard label="Green Verdicts" value={greenDeals} />
                <DashStatCard label="Best Cash Flow" value={bestCF ? fmtD(bestCF.cash_flow) + "/mo" : "—"} />
                <DashStatCard label="Best ROI" value={bestROI ? fmtP(bestROI.roi) : "—"} />
              </div>

              {/* Row 2 — Your Pipeline */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Your Pipeline</div>
                <button onClick={() => setPipelineNav("analyzer")} style={{ background: C.green, border: "none", borderRadius: 8, padding: "10px 20px", color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.3)" }}>+ Analyze New Deal</button>
              </div>
              {dealsLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 14 }}>Loading deals...</div>
              ) : last3.length === 0 ? (
                <div style={{ background: C.white, border: `1.5px dashed ${C.border}`, borderRadius: 14, padding: "40px 24px", textAlign: "center", marginBottom: 28 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.muted, lineHeight: 1.5 }}>No deals yet. Analyze your first deal to start building your pipeline.</div>
                </div>
              ) : (
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
                  {last3.map((d, i) => {
                    const metric = d.deal_type === "hold" ? (d.cash_flow ? fmtD(d.cash_flow) + "/mo" : "—") : (d.net_profit ? fmtD(d.net_profit) : "—");
                    return (
                    <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: i < last3.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{d.address}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{d.deal_type === "hold" ? "Buy & Hold" : "Fix & Flip"}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{metric}</span>
                        <DashVerdictBadge verdict={d.verdict} />
                        {d.verdict === "green" && d.deal_type === "flip" && (
                          <button onClick={() => startRehab(d)} style={{ background: "#f59e0b", border: "none", borderRadius: 6, padding: "5px 10px", color: C.white, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>Start Rehab</button>
                        )}
                        {d.verdict === "green" && (
                          <button onClick={() => openConvert(d)} style={{ background: C.green, border: "none", borderRadius: 6, padding: "5px 10px", color: C.white, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>Convert</button>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}

              {/* Row 3 — Green Deals */}
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 14 }}>Green Deals Worth a Second Look</div>
              {greenDealsList.length === 0 ? (
                <div style={{ background: C.white, border: `1.5px dashed ${C.border}`, borderRadius: 14, padding: "40px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.muted, lineHeight: 1.5 }}>No green deals yet. Run your first analysis.</div>
                </div>
              ) : (
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                  {greenDealsList.map((d, i) => (
                    <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: i < greenDealsList.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{d.address}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{d.deal_type === "hold" ? "Buy & Hold" : "Fix & Flip"}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {d.deal_type === "hold" ? (
                          <>
                            <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Cash Flow</div><div style={{ fontSize: 14, fontWeight: 700, color: C.greenDark }}>{d.cash_flow ? fmtD(d.cash_flow) + "/mo" : "—"}</div></div>
                            <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Cap Rate</div><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{d.cap_rate ? fmtP(d.cap_rate) : "—"}</div></div>
                          </>
                        ) : (
                          <>
                            <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Profit</div><div style={{ fontSize: 14, fontWeight: 700, color: C.greenDark }}>{d.net_profit ? fmtD(d.net_profit) : "—"}</div></div>
                            <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>ROI</div><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{d.roi ? fmtP(d.roi) : "—"}</div></div>
                          </>
                        )}
                        {d.deal_type === "flip" && (
                          <button onClick={() => startRehab(d)} style={{ background: "#f59e0b", border: "none", borderRadius: 6, padding: "6px 12px", color: C.white, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>Start Rehab</button>
                        )}
                        <button onClick={() => openConvert(d)} style={{ background: C.green, border: "none", borderRadius: 6, padding: "6px 12px", color: C.white, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>Convert to Property</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
            );
          })()}
          {/* Analyzer */}
          {!dashPanel && pipelineNav === "analyzer" && (
            <>
              {isMobile && (
                <button onClick={() => setPipelineNav("dashboard")} style={{
                  display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
                  fontSize: 14, fontWeight: 600, color: C.green, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", padding: "8px 0", marginBottom: 12,
                }}>
                  <ArrowLeft size={16} color={C.green} /> Dashboard
                </button>
              )}
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", background: C.white, borderRadius: 8, padding: 3, gap: 3, border: `1px solid ${C.border}` }}>
                  {[{ id: "hold", label: "Buy & Hold" }, { id: "flip", label: "Fix & Flip" }].map(m => (
                    <button key={m.id} onClick={() => setMode(m.id)} style={{
                      padding: "8px 20px", borderRadius: 6, border: "none",
                      background: mode === m.id ? C.green : "transparent",
                      color: mode === m.id ? C.white : C.muted,
                      fontWeight: mode === m.id ? 700 : 500,
                      fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.15s",
                    }}>{m.label}</button>
                  ))}
                </div>
              </div>
              {mode === "hold"
                ? <BuyHoldAnalyzer standards={standards} onScrollToPro={() => {}} onEmailResults={onEmailResults} isPro={isPro} onUpgrade={onShowCapture} session={session} onDealSaved={refreshDeals} />
                : <FixFlipAnalyzer standards={standards} onScrollToPro={() => {}} onEmailResults={onEmailResults} isPro={isPro} onUpgrade={onShowCapture} session={session} onDealSaved={refreshDeals} />}
            </>
          )}

          {/* Saved Deals */}
          {!dashPanel && pipelineNav === "saved" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div />
                <button onClick={() => setPipelineNav("analyzer")} style={{
                  background: C.green, border: "none", borderRadius: 8,
                  padding: "10px 20px", color: C.white, fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
                }}>+ Analyze New Deal</button>
              </div>
              <div className="db-stat-row" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <DashStatCard label="Total Deals" value={deals.length} />
                <DashStatCard label="Green Verdicts" value={greenDeals} />
                <DashStatCard label="Best Cash Flow" value={bestHold} />
              </div>
              {dealsLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 14 }}>Loading deals...</div>
              ) : deals.length === 0 ? (
                <div style={{ background: C.white, border: `1.5px dashed ${C.border}`, borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
                  <div style={{ marginBottom: 12, opacity: 0.3, display: "flex", justifyContent: "center" }}><ClipboardList size={36} color={C.green} /></div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.muted, marginBottom: 16, lineHeight: 1.5 }}>No deals yet. Analyze your first deal to see it here.</div>
                  <button onClick={() => setPipelineNav("analyzer")} style={{ background: C.green, border: "none", borderRadius: 8, padding: "10px 20px", color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.3)" }}>+ Analyze a Deal</button>
                </div>
              ) : (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div className="db-deals-header" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                  {["Address", "Type", "Verdict", "Key Metric"].map((h, i) => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i === 3 ? "right" : "left" }}>{h}</span>
                  ))}
                </div>
                {deals.map((d, i) => {
                  const metric = d.deal_type === "hold" ? (d.cash_flow ? fmtD(d.cash_flow) + "/mo" : "—") : (d.net_profit ? fmtD(d.net_profit) : "—");
                  const dateStr = d.created_at ? new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
                  return (
                  <div key={d.id} className="db-deal-row" style={{ display: "grid", gridTemplateColumns: d.verdict === "green" ? "2fr 1fr 1fr 1fr auto" : "2fr 1fr 1fr 1fr", padding: "14px 16px", borderBottom: i < deals.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{d.address}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{dateStr}</div>
                    </div>
                    <span className="db-deal-type" style={{ fontSize: 13, color: C.muted }}>{d.deal_type === "hold" ? "Buy & Hold" : "Fix & Flip"}</span>
                    <DashVerdictBadge verdict={d.verdict} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text, textAlign: "right" }}>{metric}</span>
                    {d.verdict === "green" && (
                      <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
                        {d.deal_type === "flip" && <button onClick={() => startRehab(d)} style={{ background: "#f59e0b", border: "none", borderRadius: 6, padding: "5px 10px", color: C.white, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>Rehab</button>}
                        <button onClick={() => openConvert(d)} style={{ background: C.green, border: "none", borderRadius: 6, padding: "5px 10px", color: C.white, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>Convert</button>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
              )}
            </>
          )}

          {/* Tools grid */}
          {!dashPanel && pipelineNav === "tools" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {[
                { name: "Underwriting Worksheet", desc: "Build confidence in your purchase price using comparable sales.", onClick: () => setShowWorksheet(true) },
                { name: "Flip vs Rent", desc: "Compare selling now vs holding as a rental — side by side with 5-year projections.", onClick: () => setShowFlipVsRent(true) },
                { name: "Rehab Estimator", desc: "Room-by-room cost builder. Stop guessing your rehab budget.", onClick: () => setShowRehab(true) },
                { name: "Rent Analysis", desc: "Compare rents for similar properties in your market.", onClick: () => setShowRentAnalysis(true) },
                { name: "Comp Tracker", desc: "Track comparable sales to build a confident ARV.", onClick: () => setShowCompTracker(true) },
              ].map((tool, i) => (
                <div key={i} onClick={tool.onClick} style={{
                  background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: "20px 18px", cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{tool.name}</div>
                  </div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{tool.desc}</div>
                  <div style={{ fontSize: 12, color: C.green, fontWeight: 700, marginTop: 12, display: "flex", alignItems: "center", gap: 4 }}>Open <ArrowRight size={12} color={C.green} /></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile bottom tab bar — JS-driven */}
        {isMobile && (
        <div className="db-bottomtab" style={{
          display: "flex", position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
          background: C.white, borderTop: "1px solid #E2E8F0", height: 64,
          justifyContent: "space-around", alignItems: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {[
            { id: "dashboard", label: "Dashboard", Icon: Home },
            { id: "analyzer", label: "Analyzer", Icon: BarChart3 },
            { id: "saved", label: "Tools", Icon: Wrench },
            { id: "more", label: "More", Icon: MoreHorizontal },
          ].map(tab => {
            const isActive = tab.id === "more" ? showMore : pipelineNav === tab.id;
            return (
              <div key={tab.id} onClick={() => {
                if (tab.id === "more") setShowMore(prev => !prev);
                else { setShowMore(false); setDashPanel(null); setPipelineNav(tab.id); }
              }} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                cursor: "pointer", padding: "6px 16px",
              }}>
                <tab.Icon size={20} color={isActive ? "#22C55E" : C.muted} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? "#22C55E" : C.muted }}>{tab.label}</span>
              </div>
            );
          })}
        </div>
        )}
      </div>
    );
  }

  // ─── PROPERTIES DASHBOARD ───
  if (view === "properties") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg }}>
        {/* Sidebar — hidden on mobile via JS + CSS fallback */}
        {!isMobile && (
        <div className="db-sidebar" style={sidebarStyle}>
          <div style={{ padding: "18px 16px 24px" }}><DoorBaseLogo /></div>
          <div style={{ padding: "0 10px", flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.mutedLight, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 14px 8px", fontFamily: "'DM Sans', sans-serif" }}>Property Tools</div>
            {PROPERTIES_NAV.map(item => (
              <SidebarItem
                key={item.id}
                label={item.label}
                active={propertiesNav === item.id && !dashPanel}
                soon={item.soon}
                onClick={() => { setDashPanel(null); setPropertiesNav(item.id); }}
              />
            ))}
          </div>
          <div style={{ padding: "16px" }}>
            <button onClick={() => setView("home")} style={{
              width: "100%", padding: "10px", background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.muted,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>Switch Mode</button>
            <div style={{ height: 1, background: C.border, margin: "12px 0" }} />
            <div onClick={() => { setDashPanel("settings"); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 6px", borderRadius: 6, cursor: "pointer", color: dashPanel === "settings" ? C.greenDark : C.muted, fontSize: 12, fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              Settings
            </div>
            <div onClick={() => { setDashPanel("feedback"); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 6px", borderRadius: 6, cursor: "pointer", color: dashPanel === "feedback" ? C.greenDark : C.muted, fontSize: 12, fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Feedback
            </div>
          </div>
        </div>
        )}

        {/* Top bar */}
        <div className="db-topbar" style={{ ...topBarStyle, ...(isMobile ? { left: 0, padding: '0 16px' } : {}) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" }}>
            <span onClick={() => { setDashPanel(null); setPropertiesNav("dashboard"); }} style={{ fontSize: 14, fontWeight: 600, color: C.muted, cursor: "pointer" }}>My Properties</span>
            {(dashPanel || propertiesNav !== "dashboard") && <ChevronRight size={14} color={C.mutedLight} />}
            {dashPanel === "settings" ? (
              <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Settings</span>
            ) : dashPanel === "feedback" ? (
              <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Beta Feedback</span>
            ) : propertiesNav !== "dashboard" ? (
              <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{(PROPERTIES_NAV.find(n => n.id === propertiesNav) || {}).label || "Portfolio Overview"}</span>
            ) : null}
          </div>
          <div onClick={() => setDashPanel(dashPanel === "settings" ? null : "settings")} style={{ ...avatarStyle, cursor: "pointer" }}>{userInitials}</div>
        </div>

        {/* Main content */}
        <div className="db-main" style={{ marginLeft: isMobile ? 0 : 220, padding: isMobile ? '16px' : '28px', paddingTop: isMobile ? 72 : 84, paddingBottom: isMobile ? 84 : undefined }}>
          {isMobile && !dashPanel && (
            <div onClick={() => setView("pipeline")} style={{ fontSize: 12, fontWeight: 600, color: C.green, cursor: "pointer", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
              Switch to Deal Pipeline <ArrowRight size={12} color={C.green} style={{ marginLeft: 4 }} />
            </div>
          )}
          {dashPanel === "settings" && <DashSettingsPanel standards={standards} onSaveStandards={onSaveStandards} defaultMode={mode} onSetDefaultMode={setMode} onSignOut={onSignOut} />}
          {dashPanel === "feedback" && <FeedbackPanel />}
          {!dashPanel && propertiesNav === "dashboard" && (() => {
            const overdueIds = new Set(briefingPayments.filter(p => !p.paid_date && new Date(p.due_date) < new Date()).map(p => p.tenant_id));
            const lateTenants = briefingTenants.filter(t => t.status === "late" || overdueIds.has(t.id));
            const expiring60 = briefingLeases.filter(l => {
              if (!l.lease_end) return false;
              const days = Math.round((new Date(l.lease_end) - new Date()) / (24 * 60 * 60 * 1000));
              return days > 0 && days <= 60;
            }).map(l => ({ ...l, daysLeft: Math.round((new Date(l.lease_end) - new Date()) / (24 * 60 * 60 * 1000)) }));
            const balloons12 = briefingLoans.filter(l => {
              if (!l.maturity_date || !(l.loan_type || "").includes("Balloon")) return false;
              const days = Math.round((new Date(l.maturity_date) - new Date()) / (24 * 60 * 60 * 1000));
              return days > 0 && days <= 365;
            }).map(l => ({ ...l, daysLeft: Math.round((new Date(l.maturity_date) - new Date()) / (24 * 60 * 60 * 1000)) }));
            return (
            <>
              {/* Morning header */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 4 }}>Good morning, {firstName}.</div>
                <div style={{ fontSize: 14, color: C.muted }}>{todayStr}</div>
              </div>

              {/* Row 1 — Stat cards */}
              <div className="db-stat-row" style={{ display: "flex", gap: 12, marginBottom: 28 }}>
                <DashStatCard label="Monthly Rent" value={fmtD(totalRent)} />
                <DashStatCard label="Cash Flow This Month" value={fmtD(totalCashFlow)} />
                <div style={{ background: C.white, border: `1px solid ${lateCount > 0 ? C.red + "44" : C.border}`, borderRadius: 12, padding: "18px 16px", flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Late Payments</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: lateCount > 0 ? C.red : C.text }}>{lateCount}</div>
                </div>
                <div style={{ background: C.white, border: `1px solid ${openMaintenance > 0 ? C.yellow + "44" : C.border}`, borderRadius: 12, padding: "18px 16px", flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Open Maintenance</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: openMaintenance > 0 ? C.yellow : C.text }}>{openMaintenance}</div>
                </div>
              </div>

              {/* Portfolio Performance Chart */}
              {properties.length > 0 && (() => {
                const chartData = properties.map(p => ({
                  name: (p.address || "").split(" ").slice(0, 2).join(" "),
                  rent: p.monthly_rent || 0,
                  cashFlow: (p.monthly_rent || 0) - (p.monthly_expenses || 0),
                }));
                return (
                <div style={{ background: "#111827", borderRadius: 14, padding: "24px 20px", marginBottom: 28 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <TrendingUp size={18} color="#22C55E" />
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC", fontFamily: "'DM Sans', sans-serif" }}>Portfolio Performance</span>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 3, borderRadius: 2, background: "#22C55E" }} /><span style={{ fontSize: 11, color: "#9CA3AF" }}>Cash Flow</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 3, borderRadius: 2, background: "#374151" }} /><span style={{ fontSize: 11, color: "#9CA3AF" }}>Rent</span></div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="portfolioGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => "$" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)} />
                      <Tooltip
                        contentStyle={{ background: "#1F2937", border: "1px solid #374151", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}
                        labelStyle={{ color: "#9CA3AF", fontWeight: 600 }}
                        itemStyle={{ color: "#F8FAFC" }}
                        formatter={(value) => ["$" + fmt(value)]}
                      />
                      <Area type="monotone" dataKey="rent" stroke="#374151" strokeWidth={2} fill="none" dot={false} />
                      <Area type="monotone" dataKey="cashFlow" stroke="#22C55E" strokeWidth={2.5} fill="url(#portfolioGreen)" dot={{ fill: "#22C55E", r: 3, strokeWidth: 0 }} style={{ filter: "drop-shadow(0 0 6px rgba(34,197,94,0.5))" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                );
              })()}

              {/* Row 2 — Needs Attention */}
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 14 }}>Needs Attention</div>
              <div className="db-attention-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 28 }}>
                {/* Late payments */}
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.red, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Late Payments</div>
                  {lateTenants.length === 0 ? (
                    <div style={{ fontSize: 13, color: C.muted, fontStyle: "italic" }}>All payments current.</div>
                  ) : lateTenants.map((t, i) => (
                    <div key={i} style={{ padding: "8px 0", borderBottom: i < lateTenants.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{t.property_id}</div>
                    </div>
                  ))}
                </div>
                {/* Expiring leases */}
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.yellow, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Leases Expiring in 60 Days</div>
                  {expiring60.length === 0 ? (
                    <div style={{ fontSize: 13, color: C.muted, fontStyle: "italic" }}>No leases expiring soon.</div>
                  ) : expiring60.map((l, i) => (
                    <div key={i} style={{ padding: "8px 0", borderBottom: i < expiring60.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{l.tenant_name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{l.property_id} — {l.daysLeft}d remaining</div>
                    </div>
                  ))}
                </div>
                {/* Balloon payments */}
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.yellowDark, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Balloon Payments Within 12mo</div>
                  {balloons12.length === 0 ? (
                    <div style={{ fontSize: 13, color: C.muted, fontStyle: "italic" }}>No balloon payments due.</div>
                  ) : balloons12.map((l, i) => (
                    <div key={i} style={{ padding: "8px 0", borderBottom: i < balloons12.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{l.lender}</div>
                        <span style={{ background: l.daysLeft <= 90 ? C.redLight : C.yellowLight, color: l.daysLeft <= 90 ? C.red : C.yellowDark, fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>{l.daysLeft}d</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.muted }}>{l.property_id} — {l.maturity_date}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3 — Portfolio snapshot */}
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 14 }}>Portfolio Snapshot</div>
              {propsLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 14 }}>Loading properties...</div>
              ) : properties.length === 0 ? (
                <div style={{ background: C.white, border: `1.5px dashed ${C.border}`, borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
                  <div style={{ marginBottom: 12, opacity: 0.3, display: "flex", justifyContent: "center" }}><Home size={36} color={C.green} /></div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.muted, lineHeight: 1.5 }}>No properties yet. Add your first property to get started.</div>
                </div>
              ) : (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                {properties.map((p, i) => {
                  const cf = (p.monthly_rent || 0) - (p.monthly_expenses || 0);
                  return (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: i < properties.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.address}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{fmtD(p.monthly_rent || 0)}/mo rent — {fmtD(cf)}/mo cash flow</div>
                    </div>
                    <span style={{
                      background: p.status === "late" ? C.redLight : C.greenLight,
                      color: p.status === "late" ? C.red : C.greenDark,
                      fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>{p.status === "late" ? "LATE" : "CURRENT"}</span>
                  </div>
                  );
                })}
              </div>
              )}
            </>
            );
          })()}

          {!dashPanel && propertiesNav === "overview" && (
            <>
              {propModal && (
                <div style={_modalOverlay}><div style={_modalBox}>
                  {_modalHeader(propModal.editing ? "Edit Property" : "Add Property", () => setPropModal(null))}
                  <div style={{ marginBottom: 12 }}><label style={_modalLabel}>Address</label><input value={propModal.address} onChange={e => setPropModal(p => ({ ...p, address: e.target.value }))} placeholder="123 Main St" style={_modalInput} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div><label style={_modalLabel}>Units</label><input type="number" value={propModal.units} onChange={e => setPropModal(p => ({ ...p, units: e.target.value }))} style={_modalInput} /></div>
                    <div><label style={_modalLabel}>Monthly Rent</label><input type="number" value={propModal.monthlyRent} onChange={e => setPropModal(p => ({ ...p, monthlyRent: e.target.value }))} placeholder="0" style={_modalInput} /></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div><label style={_modalLabel}>Monthly Expenses</label><input type="number" value={propModal.monthlyExpenses} onChange={e => setPropModal(p => ({ ...p, monthlyExpenses: e.target.value }))} placeholder="0" style={_modalInput} /></div>
                    <div><label style={_modalLabel}>Loan Balance</label><input type="number" value={propModal.loanBalance} onChange={e => setPropModal(p => ({ ...p, loanBalance: e.target.value }))} placeholder="0" style={_modalInput} /></div>
                  </div>
                  <button onClick={saveProperty} disabled={propSaving} style={{ ..._modalSubmit(), opacity: propSaving ? 0.7 : 1 }}>{propSaving ? "Saving..." : "Add Property"}</button>
                </div></div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div />
                <button onClick={openAddProperty} style={_addBtn}>+ Add Property</button>
              </div>
              <div className="db-stat-row" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <DashStatCard label="Monthly Rent" value={fmtD(totalRent)} />
                <DashStatCard label="Cash Flow" value={fmtD(totalCashFlow)} sub="/mo" />
                <DashStatCard label="Properties" value={properties.length} />
                <DashStatCard label="Total Doors" value={properties.reduce((s, p) => s + (p.units || 1), 0)} />
              </div>
              {propsLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 14 }}>Loading properties...</div>
              ) : properties.length === 0 ? (
                <div style={{ background: C.white, border: `1.5px dashed ${C.border}`, borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
                  <div style={{ marginBottom: 12, opacity: 0.3, display: "flex", justifyContent: "center" }}><Home size={36} color={C.green} /></div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.muted, lineHeight: 1.5 }}>No properties yet.</div>
                  <button onClick={openAddProperty} style={{ ...(_addBtn), marginTop: 16 }}>+ Add Property</button>
                </div>
              ) : (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div className="db-prop-header" style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                  {["Address", "Units", "Rent", "Cash Flow", "Status"].map((h, i) => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i === 4 ? "right" : "left" }}>{h}</span>
                  ))}
                </div>
                {properties.map((p, i) => {
                  const cf = (p.monthly_rent || 0) - (p.monthly_expenses || 0);
                  return (
                  <div key={p.id} className="db-prop-row" style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 1fr 1fr 1fr", padding: "14px 16px", borderBottom: i < properties.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.address}</div>
                    <span style={{ fontSize: 13, color: C.muted }}>{p.units || 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{fmtD(p.monthly_rent || 0)}/mo</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: cf >= 0 ? C.green : C.red }}>{fmtD(cf)}/mo</span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        background: p.status === "late" ? C.redLight : C.greenLight,
                        color: p.status === "late" ? C.red : C.greenDark,
                        fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
                        textTransform: "uppercase", letterSpacing: "0.04em",
                      }}>{p.status === "late" ? "LATE" : "PAID"}</span>
                    </div>
                  </div>
                  );
                })}
              </div>
              )}
            </>
          )}

          {!dashPanel && propertiesNav === "rehabs" && <ActiveRehabs session={session} />}
          {!dashPanel && propertiesNav === "cashflow" && <CashFlowTracker session={session} />}
          {!dashPanel && propertiesNav === "tenants" && <TenantTracker session={session} />}
          {!dashPanel && propertiesNav === "maintenance" && <MaintenanceLog session={session} />}
          {!dashPanel && propertiesNav === "financing" && <FinancingTracker session={session} />}
          {!dashPanel && propertiesNav === "leases" && <LeaseRenewalTracker session={session} />}
        </div>

        {/* Mobile bottom tab bar — JS-driven */}
        {isMobile && (
        <div className="db-bottomtab" style={{
          display: "flex", position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
          background: C.white, borderTop: "1px solid #E2E8F0", height: 64,
          justifyContent: "space-around", alignItems: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {[
            { id: "dashboard", label: "Dashboard", Icon: Home },
            { id: "overview", label: "Portfolio", Icon: Building2 },
            { id: "tenants", label: "Tenants", Icon: Users },
            { id: "more", label: "More", Icon: MoreHorizontal },
          ].map(tab => {
            const isActive = tab.id === "more" ? showMore : propertiesNav === tab.id;
            return (
              <div key={tab.id} onClick={() => {
                if (tab.id === "more") setShowMore(prev => !prev);
                else { setShowMore(false); setDashPanel(null); setPropertiesNav(tab.id); }
              }} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                cursor: "pointer", padding: "6px 16px",
              }}>
                <tab.Icon size={20} color={isActive ? "#22C55E" : C.muted} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? "#22C55E" : C.muted }}>{tab.label}</span>
              </div>
            );
          })}
        </div>
        )}

        {/* More drawer — mobile only */}
        {showMore && (
          <>
            <div onClick={() => setShowMore(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300 }} />
            <div style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301,
              background: C.white, borderRadius: "16px 16px 0 0",
              padding: "24px", paddingBottom: 32,
              boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 20px" }} />
              {[
                { id: "rehabs", label: "Active Rehabs" },
                { id: "cashflow", label: "Cash Flow Tracker" },
                { id: "financing", label: "Financing Tracker" },
                { id: "leases", label: "Lease Renewals" },
              ].map((item, i) => (
                <div key={i} onClick={() => { setShowMore(false); setDashPanel(null); setPropertiesNav(item.id); }} style={{
                  padding: "14px 0", borderBottom: `1px solid ${C.border}`,
                  cursor: "pointer", color: C.text, fontSize: 15, fontWeight: 600,
                }}>
                  {item.label}
                </div>
              ))}
              <div style={{ height: 1, background: C.border, margin: "8px 0" }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: C.mutedLight, textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 0 6px" }}>Switch Mode</div>
              {[
                { id: "pipeline", label: "Deal Pipeline" },
                { id: "properties", label: "My Properties" },
              ].map(m => (
                <div key={m.id} onClick={() => { setShowMore(false); setView(m.id); }} style={{
                  padding: "12px 0", borderBottom: `1px solid ${C.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: "pointer", color: C.text, fontSize: 15, fontWeight: 600,
                }}>
                  <span>{m.label}</span>
                  {view === m.id && <Check size={16} color={C.green} strokeWidth={3} />}
                </div>
              ))}
              <div style={{ height: 1, background: C.border, margin: "8px 0" }} />
              <div onClick={() => { setShowMore(false); setDashPanel("settings"); }} style={{ padding: "14px 0", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: C.text, fontSize: 15, fontWeight: 600 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                Settings
              </div>
              <div onClick={() => { setShowMore(false); setDashPanel("feedback"); }} style={{ padding: "14px 0", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: C.text, fontSize: 15, fontWeight: 600 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Feedback
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState("hold");
  const [showSettings, setShowSettings] = useState(false);
  const [standards, setStandards] = useState(DEFAULT_STANDARDS);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [captureResults, setCaptureResults] = useState(null);
  const [emailSource, setEmailSource] = useState('analyzer');
  const [emailResultsModal, setEmailResultsModal] = useState(null); // { result, mode }
  const { session, loading: authLoading, signOut } = useAuth();
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const isPro = !!session;
  const analyzerRef = useRef(null);
  const whatsInsideRef = useRef(null);

  const scrollToAnalyzer = () => analyzerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToWhatsInside = () => whatsInsideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f0f2f5; font-family: 'DM Sans', sans-serif; color: #1c1e21; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        input::placeholder { color: #bcc0c4; }
        button { transition: opacity 0.15s, transform 0.15s; }
        button:hover { opacity: 0.92; }
        button:active { opacity: 0.85; transform: scale(0.99); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
        .hero-btn-primary:hover { background: #15803d !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,163,74,0.5) !important; }
        .hero-btn-secondary:hover { background: rgba(255,255,255,0.25) !important; transform: translateY(-2px); }
        .pro-card:hover { border-color: #86efac !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
        @media (max-width: 767px) {
          .db-sidebar { display: none !important; }
          .db-topbar { left: 0 !important; padding: 0 16px !important; }
          .db-main { margin-left: 0 !important; padding: 16px !important; padding-top: 72px !important; padding-bottom: 84px !important; }
          .db-stat-row { flex-wrap: wrap !important; grid-template-columns: 1fr 1fr !important; }
          .db-stat-row > div { min-width: calc(50% - 6px) !important; flex: none !important; width: calc(50% - 6px) !important; }
          .db-bottomtab { display: flex !important; }
          .db-deals-header { display: none !important; }
          .db-deal-row { grid-template-columns: 1fr auto !important; gap: 8px !important; }
          .db-deal-type { display: none !important; }
          .home-picker-grid { grid-template-columns: 1fr !important; }
          .landing-intro-grid { grid-template-columns: 1fr !important; }
          .landing-feature-grid { grid-template-columns: 1fr !important; }
          .landing-hero-title { font-size: 28px !important; }
          .landing-hero-btns { flex-direction: column !important; }
          .landing-hero-btns button { width: 100% !important; text-align: center !important; }
          .landing-nav-links button:not(:last-child):not(:nth-last-child(2)) { display: none !important; }
          .db-prop-header { display: none !important; }
          .db-prop-row { grid-template-columns: 1fr auto !important; }
          .db-prop-row > span:nth-child(2),
          .db-prop-row > span:nth-child(3),
          .db-prop-row > span:nth-child(4) { display: none !important; }
          .db-attention-row { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 768px) {
          .db-bottomtab { display: none !important; }
        }
      `}</style>

      {showSettings && <SettingsPanel standards={standards} onSave={setStandards} onClose={() => setShowSettings(false)} />}
      {showEmailCapture && <EmailCaptureModal onClose={() => { setShowEmailCapture(false); setEmailSource('analyzer'); }} results={captureResults} mode={mode} source={emailSource} />}
      {emailResultsModal && <EmailResultsModal onClose={() => setEmailResultsModal(null)} result={emailResultsModal.result} mode={emailResultsModal.mode} />}

      {authLoading ? (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.nav }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.white, fontFamily: "'DM Sans', sans-serif" }}>Loading...</div>
        </div>
      ) : isPro ? (
        <Dashboard
          standards={standards}
          onSaveStandards={setStandards}
          onShowSettings={() => setShowSettings(true)}
          mode={mode}
          setMode={setMode}
          isPro={isPro}
          onShowCapture={() => { setCaptureResults(null); setEmailSource('pro'); setShowEmailCapture(true); }}
          onEmailResults={(r) => setEmailResultsModal({ result: r, mode })}
          onSignOut={async () => { await signOut(); setShowAuthScreen(false); }}
          session={session}
        />
      ) : showAuthScreen ? (
        <AuthScreen onBack={() => setShowAuthScreen(false)} />
      ) : (
      <>
      {/* ─── NAV ─── */}
      <nav style={{
        background: "#111827",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 0 rgba(255,255,255,0.06)",
      }}>
        <div className="landing-nav-inner" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <path d="M8 34 L8 8 L28 8 L28 34" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M8 8 L8 34 L20 31 L20 11 Z" fill="#22C55E" opacity="0.9"/>
              <circle cx="18" cy="21" r="1.5" fill="white" opacity="0.9"/>
              <line x1="4" y1="34" x2="32" y2="34" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#F8FAFC", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em", lineHeight: 1 }}>Door</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#22C55E", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em", lineHeight: 1 }}>Base</span>
            </div>
          </div>
          <div className="landing-nav-links" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={scrollToWhatsInside} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: "8px 14px", borderRadius: 6 }}>
              Features
            </button>
            <button onClick={scrollToAnalyzer} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: "8px 14px", borderRadius: 6 }}>
              Deal Analyzer
            </button>
            <button onClick={() => setShowAuthScreen(true)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 7, padding: "8px 16px", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginLeft: 4 }}>
              Sign In
            </button>
            <button onClick={() => setShowAuthScreen(true)} style={{ background: "#22C55E", border: "none", borderRadius: 7, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginLeft: 6, boxShadow: "0 2px 8px rgba(34,197,94,0.35)" }}>
              Join Beta
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <div style={{
        position: "relative",
        backgroundImage: `url(${HERO_IMG})`,
        backgroundSize: "cover", backgroundPosition: "center 30%",
        minHeight: 580, maxHeight: 620,
        display: "flex", alignItems: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.2) 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "80px 32px", width: "100%" }}>
          <div style={{ maxWidth: 600 }}>
            <div style={{
              display: "inline-block", background: "rgba(22,163,74,0.9)", borderRadius: 6,
              padding: "4px 12px", fontSize: 11, fontWeight: 700, color: C.white,
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20,
            }}>Free during beta</div>
            <h1 className="landing-hero-title" style={{ fontSize: 48, fontWeight: 800, color: C.white, lineHeight: 1.1, marginBottom: 16, letterSpacing: "-0.02em" }}>
              The Operating System<br />
              <span style={{ color: "#4ade80" }}>for Small Investors.</span>
            </h1>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, marginBottom: 32, maxWidth: 500 }}>
              Analyze deals. Manage your portfolio. Run your rehabs. All in one place.
            </p>
            <div className="landing-hero-btns" style={{ display: "flex", gap: 12 }}>
              <button className="hero-btn-primary" onClick={() => setShowAuthScreen(true)} style={{
                background: C.green, border: "none", borderRadius: 10,
                padding: "16px 28px", color: C.white, fontSize: 16, fontWeight: 700,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 4px 20px rgba(22,163,74,0.45)", transition: "all 0.2s",
              }}>Start Free — Join Beta</button>
              <button className="hero-btn-secondary" onClick={scrollToWhatsInside} style={{
                background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.5)",
                borderRadius: 10, padding: "16px 28px", color: C.white, fontSize: 16, fontWeight: 700,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                backdropFilter: "blur(4px)", transition: "all 0.2s",
              }}>See What's Inside</button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TRUST STRIP ─── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div className="landing-trust-strip" style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 32px", display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {["Buy & Hold + Fix & Flip", "Portfolio Dashboard", "Tenant & Lease Tracking", "Active Rehab Management", "Free During Beta"].map((item, i) => (
            <div key={i} style={{
              background: C.bg, borderRadius: 20, padding: "6px 14px",
              fontSize: 12, fontWeight: 600, color: C.muted, border: `1px solid ${C.border}`,
            }}><Check size={12} color={C.green} strokeWidth={3} style={{ marginRight: 4 }} /> {item}</div>
          ))}
        </div>
      </div>

      {/* ─── WHAT'S INSIDE ─── */}
      <div ref={whatsInsideRef} style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>What's Inside</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1.25, marginBottom: 8 }}>Everything you need to run your doors.</div>
            <div style={{ fontSize: 15, color: C.muted, maxWidth: 520, margin: "0 auto" }}>All live now. Free during beta. No credit card required.</div>
          </div>
          <div className="landing-feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
            {[
              { title: "Deal Analyzer", desc: "Buy & Hold or Fix & Flip — get a verdict in under a minute.", icon: <BarChart3 size={24} color={C.green} /> },
              { title: "Portfolio Dashboard", desc: "Every door at a glance — rent, cash flow, vacancy, and performance.", icon: <Home size={24} color={C.green} /> },
              { title: "Tenant Tracker", desc: "Lease dates, rent status, contact info, and late payment history per unit.", icon: <Users size={24} color={C.green} /> },
              { title: "Financing Tracker", desc: "Every loan tracked — balance, rate, maturity date, and balloon alerts.", icon: <DollarSign size={24} color={C.green} /> },
              { title: "Lease Renewals", desc: "Never miss a renewal window. Know who's up and when.", icon: <Calendar size={24} color={C.green} /> },
              { title: "Cash Flow Tracker", desc: "Actual vs projected, month over month. Know if your properties perform.", icon: <TrendingUp size={24} color={C.green} /> },
            ].map((f, i) => (
              <div key={i} className="pro-card" style={{
                background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
                padding: "24px 20px", transition: "all 0.2s", cursor: "default",
              }}>
                <div style={{ marginBottom: 14, width: 44, height: 44, borderRadius: 10, background: C.greenLight, display: "flex", alignItems: "center", justifyContent: "center" }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={() => setShowAuthScreen(true)} style={{
              background: C.green, border: "none", borderRadius: 10,
              padding: "14px 36px", color: C.white, fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 4px 20px rgba(22,163,74,0.35)",
            }}>Start Free — Join Beta</button>
          </div>
        </div>
      </div>

      {/* ─── INVESTOR FIELD IMAGE ─── */}
      <div style={{
        position: "relative", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center",
        backgroundImage: "url(/investor-field.png)", backgroundSize: "cover", backgroundPosition: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.7) 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "64px 32px", maxWidth: 640 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.white, lineHeight: 1.2, marginBottom: 14 }}>
            Built for the Investor in the Field
          </div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, marginBottom: 28 }}>
            Your entire portfolio in your pocket. Analyze deals, manage tenants, and run rehabs from anywhere.
          </div>
          <button onClick={() => setShowAuthScreen(true)} style={{
            background: C.green, border: "none", borderRadius: 10,
            padding: "14px 32px", color: C.white, fontSize: 15, fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 4px 20px rgba(22,163,74,0.45)",
          }}>Join Beta Free</button>
        </div>
      </div>

      {/* ─── ROADMAP ─── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 8 }}>Where We're Going</div>
            <div style={{ fontSize: 15, color: C.muted }}>What's live, what's next, and what's on the horizon.</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <img src="/roadmap.png" alt="DoorBase Roadmap" style={{ width: "100%", maxWidth: 960, borderRadius: 12, border: `1px solid ${C.border}` }} />
          </div>
        </div>
      </div>

      {/* ─── DEAL ANALYZER ─── */}
      <div ref={analyzerRef} style={{ background: "#F0FDF4" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px" }}>
          <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 4 }}>Try It Free — No Account Required</div>
              <div style={{ fontSize: 15, color: C.muted }}>Run a deal through the analyzer right now. Get a verdict in under a minute.</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ display: "flex", background: C.white, borderRadius: 8, padding: 3, gap: 3, border: `1px solid ${C.border}` }}>
                {[{ id: "hold", label: "Buy & Hold" }, { id: "flip", label: "Fix & Flip" }].map(m => (
                  <button key={m.id} onClick={() => setMode(m.id)} style={{
                    padding: "8px 20px", borderRadius: 6, border: "none",
                    background: mode === m.id ? C.green : "transparent",
                    color: mode === m.id ? C.white : C.muted,
                    fontWeight: mode === m.id ? 700 : 500,
                    fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.15s",
                  }}>{m.label}</button>
                ))}
              </div>
              <button onClick={() => setShowSettings(true)} style={{
                background: C.white, border: `1px solid ${C.border}`, borderRadius: 8,
                width: 40, height: 40, display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer",
              }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></button>
            </div>
          </div>

          {mode === "hold"
            ? <BuyHoldAnalyzer standards={standards} onScrollToPro={() => setShowAuthScreen(true)} onEmailResults={(r) => setEmailResultsModal({ result: r, mode })} isPro={isPro} onUpgrade={() => setShowAuthScreen(true)} />
            : <FixFlipAnalyzer standards={standards} onScrollToPro={() => setShowAuthScreen(true)} onEmailResults={(r) => setEmailResultsModal({ result: r, mode })} isPro={isPro} onUpgrade={() => setShowAuthScreen(true)} />}
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: C.nav }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.white, marginBottom: 4 }}>
              Door<span style={{ color: "#4ade80" }}>Base</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>
              Powered by The Legacy Bridge
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>doorbase.app</span>
            <button onClick={() => setShowAuthScreen(true)} style={{
              background: C.green, border: "none", borderRadius: 7, padding: "8px 18px",
              color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(34,197,94,0.3)",
            }}>Sign Up Free</button>
          </div>
        </div>
      </footer>
      </>
      )}

    </>
  );
}
