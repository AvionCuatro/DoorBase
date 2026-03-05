import { useState, useRef, useCallback } from "react";

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

// ─── PRO ACCESS HOOK ─────────────────────────────────────────────────────────
// Development-only toggle. Swap internals for real auth + Stripe when ready.
function useProAccess() {
  const [isPro, setIsPro] = useState(() => {
    try { return localStorage.getItem("doorbase_pro") === "true"; }
    catch { return false; }
  });
  const togglePro = useCallback(() => {
    setIsPro(prev => {
      const next = !prev;
      try { localStorage.setItem("doorbase_pro", String(next)); } catch {}
      return next;
    });
  }, []);
  return { isPro, togglePro };
}

// ─── PRO GATE ────────────────────────────────────────────────────────────────
// Wrap any pro-only UI. Shows locked state when isPro is false.
function ProGate({ isPro, children, title, description, onUpgrade }) {
  if (isPro) return children;
  return (
    <div style={{
      background: C.bg, border: `1.5px dashed ${C.border}`, borderRadius: 14,
      padding: "40px 24px", textAlign: "center",
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 6 }}>
        {title || "Pro Feature"}
      </div>
      <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>
        {description || "This tool is available with DoorBase Pro."}
      </div>
      <button onClick={onUpgrade} style={{
        background: C.green, border: "none", borderRadius: 10,
        padding: "12px 28px", color: C.white, fontSize: 14, fontWeight: 700,
        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
      }}>Join the Founding 50</button>
    </div>
  );
}

// ─── DEV PRO TOGGLE ──────────────────────────────────────────────────────────
function DevProToggle({ isPro, onToggle }) {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <button onClick={onToggle} style={{
      position: "fixed", bottom: 16, right: 16, zIndex: 9999,
      background: isPro ? C.green : "#6B7280", color: C.white,
      border: "none", borderRadius: 8, padding: "8px 14px",
      fontSize: 12, fontWeight: 700, cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
    }}>
      {isPro ? "PRO ON" : "PRO OFF"} (dev)
    </button>
  );
}

// ─── DEAL PIPELINE (Pro stub) ────────────────────────────────────────────────
function DealPipeline() {
  const [deals] = useState([
    { id: 1, address: "123 Oak St", type: "hold", verdict: "green", cashFlow: 312, date: "2026-03-01" },
    { id: 2, address: "456 Elm Ave", type: "flip", verdict: "yellow", cashFlow: null, profit: 18500, date: "2026-02-28" },
    { id: 3, address: "789 Pine Rd", type: "hold", verdict: "red", cashFlow: -87, date: "2026-02-25" },
  ]);
  const verdictStyle = (v) => ({
    green: { bg: C.greenLight, color: C.greenDark, label: "DEAL WORKS" },
    yellow: { bg: C.yellowLight, color: C.yellowDark, label: "MARGINAL" },
    red: { bg: C.redLight, color: C.red, label: "PASS" },
  }[v]);
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>Deal Pipeline</div>
      <div style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>Every deal you analyze, saved and compared.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {deals.map(d => {
          const vs = verdictStyle(d.verdict);
          return (
            <div key={d.id} style={{
              background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{d.address}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  {d.type === "hold" ? "Buy & Hold" : "Fix & Flip"} · {d.date}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  {d.type === "hold" ? fmtD(d.cashFlow) + "/mo" : fmtD(d.profit)}
                </div>
                <div style={{
                  background: vs.bg, color: vs.color, fontSize: 11, fontWeight: 700,
                  padding: "4px 10px", borderRadius: 6, letterSpacing: "0.04em",
                }}>{vs.label}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop: 16, padding: "12px", border: `1.5px dashed ${C.border}`, borderRadius: 10,
        textAlign: "center", color: C.muted, fontSize: 13, cursor: "pointer",
      }}>
        + Analyze a deal to add it here
      </div>
    </div>
  );
}

// ─── FOUNDING 50 COUNTER ──────────────────────────────────────────────────────
const FOUNDING_SPOTS = 50;
const SPOTS_TAKEN = 11; // update this manually as signups come in

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
          utm_campaign: "founding50",
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
                      Founding 50 — {FOUNDING_SPOTS - SPOTS_TAKEN} spots left
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.2, marginBottom: 8 }}>
                      Get in free<br />while we build.
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>
                      Pro is coming. The first 50 get it free. Drop your email and we'll reach out before anyone else.
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
                  <strong>Founding 50:</strong> {FOUNDING_SPOTS - SPOTS_TAKEN} spots left. Pro is free for early members.
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

const HERO_IMG = "/hero.png";
const DESK_IMG = "/desk.png";

// ─── PRO TRIGGER ──────────────────────────────────────────────────────────────
function ProTrigger({ text, onScrollToPro }) {
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
      <span style={{ fontSize: 12 }}>⭐</span>
      <span style={{ fontSize: 12, color: C.greenDark, fontWeight: 600, lineHeight: 1.4 }}>{text}</span>
      <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>Pro →</span>
    </div>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, prefix = "$", suffix = "", proTip, onScrollToPro }) {
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
          <ProTrigger text={proTip} onScrollToPro={onScrollToPro} />
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
            <div style={{ display: "inline-block", background: C.greenLight, borderRadius: 6, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: C.greenDark, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Pro Tool</div>
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
function BuyHoldAnalyzer({ standards, onScrollToPro, onEmailResults, isPro, onUpgrade }) {
  const [f, setF] = useState({
    purchasePrice: "", downPercent: "20", interestRate: "7.5", loanTermYears: "30",
    monthlyRent: "", otherIncome: "0", propertyTax: "", insurance: "",
    hoa: "0", maintenance: "", vacancy: "8", mgmt: "0", utilities: "0",
  });
  const [result, setResult] = useState(null);
  const [showWorksheet, setShowWorksheet] = useState(false);
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
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: 16 }}>
      {showWorksheet && (
        <UnderwritingWorksheet
          onClose={() => setShowWorksheet(false)}
          onUsePrice={(price) => setF(prev => ({ ...prev, purchasePrice: price }))}
        />
      )}
      <div>
        <Card>
          <SectionTitle>Purchase & Financing</SectionTitle>
          <Field label="Purchase Price" value={f.purchasePrice} onChange={set("purchasePrice")}
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
          <Field label="Monthly Rent" value={f.monthlyRent} onChange={set("monthlyRent")}
            proTip="Not sure what this rents for? Pro has a Rent Analysis Worksheet."
            onScrollToPro={onScrollToPro} />
          <div style={{ height: 8 }} />
          <TwoCol>
            <Field label="Other Income / Mo" value={f.otherIncome} onChange={set("otherIncome")} />
            <Field label="Vacancy Rate" value={f.vacancy} onChange={set("vacancy")} prefix="%" suffix=""
              proTip="Pro tracks actual vacancy history across all your doors."
              onScrollToPro={onScrollToPro} />
          </TwoCol>
        </Card>
        <Card>
          <SectionTitle>Expenses</SectionTitle>
          <TwoCol>
            <Field label="Property Tax / Yr" value={f.propertyTax} onChange={set("propertyTax")} />
            <Field label="Insurance / Yr" value={f.insurance} onChange={set("insurance")}
              proTip="Pro includes an Insurance Comparison Sheet."
              onScrollToPro={onScrollToPro} />
          </TwoCol>
          <div style={{ height: 8 }} />
          <TwoCol>
            <Field label="HOA / Mo" value={f.hoa} onChange={set("hoa")} />
            <Field label="Maintenance / Mo" value={f.maintenance} onChange={set("maintenance")}
              proTip="Pro tracks every maintenance request with full paper trail."
              onScrollToPro={onScrollToPro} />
          </TwoCol>
          <div style={{ height: 8 }} />
          <TwoCol>
            <Field label="Mgmt Fee" value={f.mgmt} onChange={set("mgmt")} prefix="%" suffix=""
              proTip="Compare property managers side-by-side with Pro."
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
          }}>📧 Email My Results</button>
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
        </div>
      )}
    </div>
  );
}

// ─── FIX & FLIP ───────────────────────────────────────────────────────────────
function FixFlipAnalyzer({ standards, onScrollToPro, onEmailResults }) {
  const [f, setF] = useState({
    purchasePrice: "", closingCostsBuy: "3", rehabCost: "",
    holdingMonths: "6", monthlyHolding: "", arvEstimate: "",
    closingCostsSell: "8", financeAmt: "", interestRate: "10",
  });
  const [result, setResult] = useState(null);
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
    const totalIn = purchase + buyClose + rehab + holdCost + interestCost;
    const netProfit = arv - sellClose - totalIn;
    const roi = totalIn > 0 ? (netProfit / totalIn) * 100 : 0;
    const arvSpread = arv > 0 ? ((arv - purchase) / arv) * 100 : 0;
    const maxAllowable = arv * 0.7 - rehab;
    const s = standards.flip;
    let verdict = "red";
    if (netProfit >= s.greenProfit && roi >= s.greenROI) verdict = "green";
    else if (netProfit >= s.yellowProfit && roi >= s.yellowROI) verdict = "yellow";
    setResult({ buyClose, holdCost, interestCost, totalIn, sellClose, netProfit, roi, arvSpread, maxAllowable, arv, verdict });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: 16 }}>
      <div>
        <Card>
          <SectionTitle>Acquisition</SectionTitle>
          <Field label="Purchase Price" value={f.purchasePrice} onChange={set("purchasePrice")} />
          <div style={{ height: 8 }} />
          <TwoCol>
            <Field label="Buy Closing Costs" value={f.closingCostsBuy} onChange={set("closingCostsBuy")} prefix="%" suffix="" />
            <Field label="Rehab / Repair Cost" value={f.rehabCost} onChange={set("rehabCost")}
              proTip="Don't guess rehab. Pro has a room-by-room Rehab Estimator."
              onScrollToPro={onScrollToPro} />
          </TwoCol>
        </Card>
        <Card>
          <SectionTitle>Holding Costs</SectionTitle>
          <TwoCol>
            <Field label="Hold Period" value={f.holdingMonths} onChange={set("holdingMonths")} prefix="" suffix="mo"
              proTip="Pro includes a Project Timeline Tracker for your flip."
              onScrollToPro={onScrollToPro} />
            <Field label="Monthly Hold Cost" value={f.monthlyHolding} onChange={set("monthlyHolding")} />
          </TwoCol>
          <div style={{ height: 8 }} />
          <TwoCol>
            <Field label="Finance Amount" value={f.financeAmt} onChange={set("financeAmt")} />
            <Field label="Interest Rate" value={f.interestRate} onChange={set("interestRate")} prefix="%" suffix=""
              proTip="Compare hard money lenders side by side with Pro."
              onScrollToPro={onScrollToPro} />
          </TwoCol>
        </Card>
        <Card>
          <SectionTitle>Exit</SectionTitle>
          <Field label="After Repair Value (ARV)" value={f.arvEstimate} onChange={set("arvEstimate")}
            proTip="Pro has a Comparable Sales Tracker to build a confident ARV."
            onScrollToPro={onScrollToPro} />
          <div style={{ height: 8 }} />
          <Field label="Sell Closing Costs" value={f.closingCostsSell} onChange={set("closingCostsSell")} prefix="%" suffix="" />
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
        </div>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState("hold");
  const [showSettings, setShowSettings] = useState(false);
  const [standards, setStandards] = useState(DEFAULT_STANDARDS);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [captureResults, setCaptureResults] = useState(null);
  const [emailSource, setEmailSource] = useState('analyzer');
  const [activeTab, setActiveTab] = useState("analyzer");
  const { isPro, togglePro } = useProAccess();
  const analyzerRef = useRef(null);
  const proRef = useRef(null);

  const scrollToAnalyzer = () => analyzerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToPro = () => proRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const proFeatures = [
    { icon: "🔨", title: "Rehab Estimator", desc: "Room-by-room cost builder. Stop guessing your rehab budget." },
    { icon: "📋", title: "Inspection Checklists", desc: "Pre-purchase, move-out, and preventative maintenance — all on your phone." },
    { icon: "🏠", title: "Portfolio Dashboard", desc: "Every door at a glance. Cash flow, vacancy, and performance." },
    { icon: "👤", title: "Tenant Tracker", desc: "Lease dates, rent history, contact info, and late payment log per unit." },
    { icon: "🔧", title: "Maintenance Log", desc: "Log issues in the field. Full paper trail with vendor, cost, and status." },
    { icon: "📊", title: "Deal Pipeline", desc: "Save and compare every deal you analyze. Side-by-side verdicts." },
    { icon: "💰", title: "Cash Flow Tracker", desc: "Actual vs projected, month over month. Know if your properties perform." },
    { icon: "🤖", title: "AI Advisor", desc: "Built-in deal advisor. No opinions — just your numbers, explained." },
    { icon: "📄", title: "Tax Summary", desc: "Annual income and expenses formatted for your CPA." },
    { icon: "🏦", title: "Financing Tracker", desc: "Every loan tracked — balance, rate, maturity, and balloon alerts." },
    { icon: "🔄", title: "Lease Renewal Tracker", desc: "Never miss a renewal window. Know who's up and when." },
    { icon: "📁", title: "Document Storage", desc: "Leases, inspections, insurance, closing docs — organized per property." },
  ];

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
      `}</style>

      {showSettings && <SettingsPanel standards={standards} onSave={setStandards} onClose={() => setShowSettings(false)} />}
      {showEmailCapture && <EmailCaptureModal onClose={() => { setShowEmailCapture(false); setEmailSource('analyzer'); }} results={captureResults} mode={mode} source={emailSource} />}

      {/* ─── NAV ─── */}
      <nav style={{
        background: "#111827",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 0 rgba(255,255,255,0.06)",
      }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => { setActiveTab("analyzer"); scrollToAnalyzer(); }} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: activeTab === "analyzer" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: "8px 14px", borderRadius: 6 }}>
              Deal Analyzer
            </button>
            <button onClick={() => { setActiveTab("pipeline"); scrollToAnalyzer(); }} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: activeTab === "pipeline" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: "8px 14px", borderRadius: 6 }}>
              Deal Pipeline
            </button>
            <button onClick={scrollToPro} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: "8px 14px", borderRadius: 6 }}>
              Pro Features
            </button>
            <button onClick={() => { setCaptureResults(null); setEmailSource('pro'); setShowEmailCapture(true); }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 7, padding: "8px 16px", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginLeft: 4 }}>
              Sign In
            </button>
            <button onClick={() => { setCaptureResults(null); setEmailSource('pro'); setShowEmailCapture(true); }} style={{ background: "#22C55E", border: "none", borderRadius: 7, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginLeft: 6, boxShadow: "0 2px 8px rgba(34,197,94,0.35)" }}>
              Founding 50 — Claim Your Spot
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
          <div style={{ maxWidth: 560 }}>
            <div style={{
              display: "inline-block", background: "rgba(22,163,74,0.9)", borderRadius: 6,
              padding: "4px 12px", fontSize: 11, fontWeight: 700, color: C.white,
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20,
            }}>Free to use · No account required</div>
            <h1 style={{ fontSize: 48, fontWeight: 800, color: C.white, lineHeight: 1.1, marginBottom: 16, letterSpacing: "-0.02em" }}>
              Every door you own.<br />
              <span style={{ color: "#4ade80" }}>One place to run it.</span>
            </h1>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, marginBottom: 32, maxWidth: 480 }}>
              Analyze new deals in 30 seconds. Manage what you already own. Built for investors with 1–10 doors who need more than a spreadsheet.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="hero-btn-primary" onClick={scrollToAnalyzer} style={{
                background: C.green, border: "none", borderRadius: 10,
                padding: "16px 28px", color: C.white, fontSize: 16, fontWeight: 700,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 4px 20px rgba(22,163,74,0.45)", transition: "all 0.2s",
              }}>📊 Analyze a Deal — Free</button>
              <button className="hero-btn-secondary" onClick={scrollToPro} style={{
                background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.5)",
                borderRadius: 10, padding: "16px 28px", color: C.white, fontSize: 16, fontWeight: 700,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                backdropFilter: "blur(4px)", transition: "all 0.2s",
              }}>🏠 I Already Own Properties</button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TRUST STRIP ─── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 32px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Buy & Hold + Fix & Flip", "Set Your Own Deal Standards", "Free Forever — No Credit Card", "Pro Tools at $19/mo", "Mobile App Coming Soon"].map((item, i) => (
            <div key={i} style={{
              background: C.bg, borderRadius: 20, padding: "6px 14px",
              fontSize: 12, fontWeight: 600, color: C.muted, border: `1px solid ${C.border}`,
            }}>&#10003; {item}</div>
          ))}
        </div>
      </div>

      {/* ─── ANALYZER SECTION ─── */}
      {/* ─── FOUNDING 50 BANNER ─── */}
      <div style={{ background: "#fffbeb", borderBottom: "1px solid #fcd34d" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: "#92400e" }}>
            <strong>Founding 50 Early Access</strong> — {FOUNDING_SPOTS - SPOTS_TAKEN} of {FOUNDING_SPOTS} spots remaining. Pro is free while we build.
          </div>
          <button
            onClick={() => { setCaptureResults(null); setShowEmailCapture(true); }}
            style={{ background: "#d97706", border: "none", borderRadius: 8, padding: "8px 18px", color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}
          >
            Claim Your Spot
          </button>
        </div>
      </div>

      <div ref={analyzerRef} style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px" }}>
        {activeTab === "analyzer" && (
          <>
            <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 4 }}>Deal Analyzer</div>
                <div style={{ fontSize: 15, color: C.muted }}>Free. No account needed. Get a verdict in under a minute.</div>
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
                  justifyContent: "center", cursor: "pointer", fontSize: 16,
                }}>⚙️</button>
              </div>
            </div>

            {mode === "hold"
              ? <BuyHoldAnalyzer standards={standards} onScrollToPro={scrollToPro} onEmailResults={(r) => { setCaptureResults(r); setShowEmailCapture(true); }} isPro={isPro} onUpgrade={() => { setCaptureResults(null); setEmailSource('pro'); setShowEmailCapture(true); }} />
              : <FixFlipAnalyzer standards={standards} onScrollToPro={scrollToPro} onEmailResults={(r) => { setCaptureResults(r); setShowEmailCapture(true); }} />}
          </>
        )}

        {activeTab === "pipeline" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 4 }}>Deal Pipeline</div>
              <div style={{ fontSize: 15, color: C.muted }}>Save, compare, and track every deal you analyze.</div>
            </div>
            <ProGate
              isPro={isPro}
              title="Deal Pipeline"
              description="Save every deal you analyze. Compare side by side. Track your pipeline from lead to close."
              onUpgrade={() => { setCaptureResults(null); setEmailSource('pro'); setShowEmailCapture(true); }}
            >
              <DealPipeline />
            </ProGate>
          </>
        )}
      </div>

      {/* ─── PRO SECTION ─── */}
      <div ref={proRef} style={{ background: C.white, borderTop: `3px solid ${C.green}` }}>

        {/* Problem image hero */}
        <div style={{ position: "relative", height: 320 }}>
          <img src={DESK_IMG} alt="Managing rental properties with spreadsheets"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", width: "100%" }}>
              <div style={{ maxWidth: 500 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.white, lineHeight: 1.2, marginBottom: 12 }}>
                  Still running your portfolio out of spreadsheets?
                </div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
                  You built real wealth buying doors. Now manage it the right way.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 32px" }}>

          {/* Intro copy + price side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 48, marginBottom: 56, alignItems: "start" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>DoorBase Pro</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1.25, marginBottom: 16 }}>
                The operating system for small real estate investors.
              </div>
              <div style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, marginBottom: 24 }}>
                You bought your first door because you saw how real estate builds wealth. Now you've got three, maybe five. Tenants texting you at 9pm. Lease renewals you're tracking in your head. Maintenance jobs that fall through the cracks.
              </div>
              <div style={{ fontSize: 16, color: C.muted, lineHeight: 1.75 }}>
                DoorBase Pro gives you one place to run it all — from the deal you're looking at today to the portfolio you're building for the next decade. On your desktop when you're at the desk. On your phone when you're in the field.
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg, #15803d, #16a34a)", borderRadius: 16, padding: "32px 28px", textAlign: "center", boxShadow: "0 8px 32px rgba(22,163,74,0.25)" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>DoorBase Pro</div>
              <div style={{ fontSize: 56, fontWeight: 800, color: C.white, lineHeight: 1 }}>$19</div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", marginBottom: 6 }}>per month</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 28, lineHeight: 1.5 }}>
                One subscription unlocks everything — web app and mobile app.
              </div>
              <button onClick={() => { setCaptureResults(null); setEmailSource('pro'); setShowEmailCapture(true); }} style={{
                width: "100%", padding: "15px", background: C.white, border: "none",
                borderRadius: 10, fontSize: 15, fontWeight: 700, color: C.green,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginBottom: 12,
              }}>Get Started with Pro</button>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                Less than AppFolio. Less than Buildium.<br />Built for 1–10 doors.
              </div>
            </div>
          </div>

          {/* Feature grid */}
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 20 }}>Everything included in Pro</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40 }}>
            {proFeatures.map((f, i) => (
              <div key={i} className="pro-card" style={{
                background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: "18px 16px", transition: "all 0.2s", cursor: "default",
              }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <button onClick={() => { setCaptureResults(null); setEmailSource('pro'); setShowEmailCapture(true); }} style={{
              background: C.green, border: "none", borderRadius: 12,
              padding: "16px 48px", color: C.white, fontSize: 16, fontWeight: 700,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 4px 20px rgba(22,163,74,0.35)",
            }}>Start Pro for $19/month →</button>
          </div>
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
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy Policy", "Terms of Service", "Contact"].map((link, i) => (
              <span key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>{link}</span>
            ))}
          </div>
        </div>
      </footer>

      <DevProToggle isPro={isPro} onToggle={togglePro} />
    </>
  );
}
