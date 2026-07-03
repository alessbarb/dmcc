import nodemailer from "nodemailer";

export interface PasswordResetEmailOptions {
  to: string;
  displayName?: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

function createTransport() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function buildPasswordResetHtml(opts: PasswordResetEmailOptions): string {
  const name = opts.displayName || "Dungeon Master";
  const expiresIn = opts.expiresInMinutes ?? 30;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password - DM Campaign Companion</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#1a1d2e;border-radius:12px;overflow:hidden;border:1px solid #2d3158;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#312e81 0%,#1e1b4b 100%);padding:36px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:28px;">🎲</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#e0e7ff;letter-spacing:0.5px;">
                DM Campaign Companion
              </h1>
              <p style="margin:8px 0 0;font-size:13px;color:#a5b4fc;">Password Recovery</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:15px;color:#cbd5e1;">Hello, <strong style="color:#e2e8f0;">${name}</strong>,</p>
              <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6;">
                We received a request to reset the password for your account.
                Click the button below to choose a new password.
                This link will expire in <strong style="color:#e2e8f0;">${expiresIn} minutes</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:8px 0 28px;">
                    <a href="${opts.resetUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">
                      Reset my password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#64748b;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="margin:0 0 24px;word-break:break-all;">
                <a href="${opts.resetUrl}" style="color:#818cf8;font-size:12px;">${opts.resetUrl}</a>
              </p>

              <hr style="border:none;border-top:1px solid #2d3158;margin:0 0 20px;" />
              <p style="margin:0;font-size:12px;color:#475569;line-height:1.5;">
                If you didn't request a password reset, you can safely ignore this email.
                Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#111827;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#374151;">
                © DM Campaign Companion — This is an automated message, please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildPasswordResetText(opts: PasswordResetEmailOptions): string {
  const name = opts.displayName || "Dungeon Master";
  const expiresIn = opts.expiresInMinutes ?? 30;
  return [
    `Hello ${name},`,
    ``,
    `We received a request to reset your DM Campaign Companion password.`,
    `Click the link below to set a new password (expires in ${expiresIn} minutes):`,
    ``,
    opts.resetUrl,
    ``,
    `If you didn't request this, ignore this email — your password will not change.`,
    ``,
    `— DM Campaign Companion`,
  ].join("\n");
}

/**
 * Sends a password-reset email to the user.
 * Returns `true` when the email was dispatched, `false` when SMTP is not
 * configured (production) or when sending fails (a warning is logged instead
 * of throwing, so the API can still return 200 without leaking details).
 */
export async function sendPasswordResetEmail(opts: PasswordResetEmailOptions): Promise<boolean> {
  const from = process.env.SMTP_FROM?.trim()
    || (process.env.SMTP_USER?.trim() ? `"DM Campaign Companion" <${process.env.SMTP_USER.trim()}>` : null);

  const transport = createTransport();

  if (!transport || !from) {
    // No SMTP configured — log the URL in non-production for easier local dev.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[emailService] SMTP not configured. Password reset URL:", opts.resetUrl);
    }
    return false;
  }

  try {
    await transport.sendMail({
      from,
      to: opts.to,
      subject: "Reset your DM Campaign Companion password",
      text: buildPasswordResetText(opts),
      html: buildPasswordResetHtml(opts),
    });
    return true;
  } catch (err) {
    console.error("[emailService] Failed to send password reset email:", err);
    return false;
  }
}
