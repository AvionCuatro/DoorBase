import "@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { senderEmail, recipientEmail, dealName, mode, verdict, stats } =
      await req.json();

    if (!senderEmail || !recipientEmail || !verdict || !stats) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const verdictConfig: Record<
      string,
      { color: string; bg: string; border: string; label: string }
    > = {
      green: {
        color: "#16a34a",
        bg: "#f0fdf4",
        border: "#86efac",
        label: "DEAL WORKS",
      },
      yellow: {
        color: "#ca8a04",
        bg: "#fefce8",
        border: "#fcd34d",
        label: "MARGINAL",
      },
      red: {
        color: "#dc2626",
        bg: "#fef2f2",
        border: "#fca5a5",
        label: "PASS ON THIS ONE",
      },
    };
    const v = verdictConfig[verdict] || verdictConfig.red;

    const modeLabel =
      mode === "hold" ? "Buy & Hold Analysis" : "Fix & Flip Analysis";
    const title = dealName ? `${dealName} — ${modeLabel}` : modeLabel;

    const statsHtml = stats
      .map(
        (s: { label: string; value: string; highlight?: boolean }) => `
        <tr>
          <td style="padding:10px 16px;font-size:14px;color:#6b7280;border-bottom:1px solid #f3f4f6;">${s.label}</td>
          <td style="padding:10px 16px;font-size:14px;font-weight:${s.highlight ? "700" : "500"};color:${s.highlight ? "#16a34a" : "#111827"};text-align:right;border-bottom:1px solid #f3f4f6;">${s.value}</td>
        </tr>`
      )
      .join("");

    const verdictIcon =
      verdict === "green"
        ? "&#10003;"
        : verdict === "yellow"
          ? "~"
          : "&#10005;";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#111827;border-radius:16px 16px 0 0;padding:28px 24px;text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" align="center"><tr>
        <td style="padding-right:8px;vertical-align:middle;">
          <img src="https://doorbase.app/logo192.png" width="32" height="32" alt="DoorBase" style="display:block;" />
        </td>
        <td style="vertical-align:middle;">
          <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Door</span><span style="font-size:22px;font-weight:800;color:#22C55E;letter-spacing:-0.02em;">Base</span>
        </td>
      </tr></table>
      <div style="font-size:12px;color:rgba(255,255,255,0.45);margin-top:8px;letter-spacing:0.06em;text-transform:uppercase;">Deal Analysis Report</div>
    </div>
    <div style="background:#ffffff;padding:24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <div style="font-size:20px;font-weight:800;color:#111827;margin-bottom:4px;">${title}</div>
      <div style="font-size:13px;color:#9ca3af;">Sent by ${senderEmail}</div>
    </div>
    <div style="background:${v.bg};border-left:1px solid ${v.border};border-right:1px solid ${v.border};padding:24px;text-align:center;">
      <div style="width:56px;height:56px;border-radius:50%;background:#ffffff;border:2px solid ${v.border};margin:0 auto 12px;line-height:56px;font-size:24px;font-weight:800;color:${v.color};">${verdictIcon}</div>
      <div style="font-size:24px;font-weight:800;color:${v.color};letter-spacing:0.04em;">${v.label}</div>
    </div>
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;">
      <div style="padding:20px 16px 8px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">Full Breakdown</div>
      <table style="width:100%;border-collapse:collapse;">${statsHtml}</table>
    </div>
    <div style="background:linear-gradient(135deg,#15803d,#16a34a);border-radius:0 0 16px 16px;padding:32px 24px;text-align:center;">
      <div style="font-size:18px;font-weight:800;color:#ffffff;margin-bottom:8px;">Run your own deal analysis</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.8);margin-bottom:20px;">Free deal analyzer with instant verdicts for Buy &amp; Hold and Fix &amp; Flip.</div>
      <a href="https://doorbase.app" style="display:inline-block;background:#ffffff;color:#16a34a;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;">Run your own deal free at doorbase.app</a>
    </div>
    <div style="text-align:center;padding:20px;font-size:11px;color:#9ca3af;">Sent via DoorBase &middot; doorbase.app</div>
  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "DoorBase <deals@doorbase.app>",
        to: [recipientEmail],
        reply_to: senderEmail,
        subject: `Deal Analysis: ${title}`,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
