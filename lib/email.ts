import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type ReminderType = "salary" | "savings" | "commitment";

type ReminderMetadata = {
  label?: string;
  current?: number;
  target?: number;
  amount?: number;
  dueDate?: string;
};

const TYPE_CONFIG: Record<ReminderType, { icon: string; color: string; accentColor: string }> = {
  salary:     { icon: "💰", color: "#C4B5FD", accentColor: "#6A49FA" },
  savings:    { icon: "🐷", color: "#8EE3B5", accentColor: "#38A169" },
  commitment: { icon: "💸", color: "#FF8C8C", accentColor: "#E53E3E" },
};

export async function sendReminderEmail({
  to, name, title, body, type, metadata,
}: {
  to: string;
  name: string;
  title: string;
  body: string;
  type: ReminderType;
  metadata?: ReminderMetadata;
}) {
  const config = TYPE_CONFIG[type];

  // Progress bar for savings
  const progressBar = type === "savings" && metadata?.current !== undefined && metadata?.target
    ? (() => {
        const pct = Math.min(100, (metadata.current / metadata.target) * 100);
        return `
          <div style="margin:16px 0;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="color:rgba(255,255,255,0.45);font-size:11px;">Progress</span>
              <span style="color:#8EE3B5;font-size:11px;font-weight:600;">${pct.toFixed(0)}%</span>
            </div>
            <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:999px;overflow:hidden;">
              <div style="height:100%;width:${pct}%;background:#8EE3B5;border-radius:999px;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:4px;">
              <span style="color:rgba(255,255,255,0.30);font-size:10px;">RM${metadata.current.toLocaleString()}</span>
              <span style="color:rgba(255,255,255,0.30);font-size:10px;">RM${metadata.target.toLocaleString()}</span>
            </div>
          </div>
        `;
      })()
    : "";

  // Metadata card
  const metaCard = metadata?.dueDate || metadata?.amount
    ? `
      <div style="background:rgba(${type === "commitment" ? "255,140,140" : type === "savings" ? "142,227,181" : "106,73,250"},0.12);border:1px solid rgba(${type === "commitment" ? "255,140,140" : type === "savings" ? "142,227,181" : "196,181,253"},0.25);border-radius:16px;padding:14px 16px;margin-top:16px;">
        ${metadata.label ? `<p style="color:rgba(255,255,255,0.45);font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">${metadata.label}</p>` : ""}
        ${metadata.amount !== undefined ? `<p style="color:${config.color};font-size:18px;font-weight:700;margin:0 0 4px;">RM${metadata.amount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}</p>` : ""}
        ${metadata.dueDate ? `<p style="color:rgba(255,255,255,0.40);font-size:12px;margin:0;">Due: ${metadata.dueDate}</p>` : ""}
        ${progressBar}
      </div>
    `
    : "";

  await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    to,
    subject: title,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#0f0a1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <div style="max-width:480px;margin:0 auto;padding:40px 20px;">

            <!-- Brand -->
            <div style="text-align:center;margin-bottom:32px;">
              <h1 style="color:#C4B5FD;font-size:24px;font-weight:700;margin:0;letter-spacing:-0.5px;">Savvyra 💜</h1>
              <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:4px 0 0;">Personal Finance Manager</p>
            </div>

            <!-- Card -->
            <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px;margin-bottom:24px;">
              <div style="text-align:center;font-size:40px;margin-bottom:20px;">${config.icon}</div>
              <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 12px;text-align:center;">${title}</h2>
              <p style="color:rgba(255,255,255,0.65);font-size:15px;line-height:1.6;margin:0;text-align:center;">${body}</p>
              ${metaCard}
            </div>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:32px;">
              <a href="${process.env.NEXTAUTH_URL ?? "https://savvyra.com"}"
                style="display:inline-block;background:linear-gradient(135deg,#6A49FA,#9B7FFF);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:100px;">
                Buka Savvyra →
              </a>
            </div>

            <!-- Footer -->
            <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center;margin:0;line-height:1.6;">
              Hi ${name}, ini notifikasi automatik dari Savvyra.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

// Keep backward compat for salary cron
export async function sendSalaryReminderEmail({
  to, name, title, body, salaryDay,
}: {
  to: string;
  name: string;
  title: string;
  body: string;
  salaryDay: number;
}) {
  await sendReminderEmail({
    to, name, title, body,
    type: "salary",
    metadata: { dueDate: `${salaryDay}hb setiap bulan` },
  });
}