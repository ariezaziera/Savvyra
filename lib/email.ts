import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSalaryReminderEmail({
  to,
  name,
  title,
  body,
  salaryDay,
}: {
  to: string;
  name: string;
  title: string;
  body: string;
  salaryDay: number;
}) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
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

            <!-- Logo + Brand -->
            <div style="text-align:center;margin-bottom:32px;">
              <h1 style="color:#C4B5FD;font-size:24px;font-weight:700;margin:0;letter-spacing:-0.5px;">
                Savvyra 💜
              </h1>
              <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:4px 0 0;">
                Personal Finance Manager
              </p>
            </div>

            <!-- Card -->
            <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px;margin-bottom:24px;">
              
              <!-- Icon -->
              <div style="text-align:center;font-size:40px;margin-bottom:20px;">💰</div>

              <!-- Title -->
              <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 12px;text-align:center;">
                ${title}
              </h2>

              <!-- Body -->
              <p style="color:rgba(255,255,255,0.65);font-size:15px;line-height:1.6;margin:0 0 24px;text-align:center;">
                ${body}
              </p>

              <!-- Divider -->
              <div style="border-top:1px solid rgba(255,255,255,0.1);margin:0 0 24px;"></div>

              <!-- Salary day info -->
              <div style="background:rgba(106,73,250,0.15);border:1px solid rgba(106,73,250,0.3);border-radius:16px;padding:16px;text-align:center;">
                <p style="color:rgba(255,255,255,0.45);font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">
                  Tarikh Gaji
                </p>
                <p style="color:#C4B5FD;font-size:18px;font-weight:700;margin:0;">
                  ${salaryDay}hb setiap bulan
                </p>
              </div>
            </div>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:32px;">
              
                href="${process.env.NEXTAUTH_URL ?? "https://savvyra.com"}"
                style="display:inline-block;background:linear-gradient(135deg,#6A49FA,#9B7FFF);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:100px;letter-spacing:-0.2px;"
              >
                Buka Savvyra →
              </a>
            </div>

            <!-- Footer -->
            <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center;margin:0;line-height:1.6;">
              Hi ${name}, ini adalah notifikasi automatik dari Savvyra.<br/>
              Anda menerima email ini kerana notifikasi gaji aktif dalam akaun anda.
            </p>

          </div>
        </body>
      </html>
    `,
  });
}