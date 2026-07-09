type PasswordResetEmailInput = {
  to: string;
  resetUrl: string;
  expiresInMinutes?: number;
};

type SendEmailResult = {
  sent: boolean;
};

type ExistingAccountRegistrationEmailInput = {
  to: string;
};

const appName = "DM Campaign Companion";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function getEmailConfig() {
  return {
    provider: process.env.EMAIL_PROVIDER,
    brevoApiKey: process.env.BREVO_API_KEY,
    from: process.env.EMAIL_FROM,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendExistingAccountRegistrationEmail({
  to,
}: ExistingAccountRegistrationEmailInput): Promise<SendEmailResult> {
  const { provider, brevoApiKey, from } = getEmailConfig();

  if (provider !== "brevo" || !brevoApiKey || !from) {
    if (isProduction()) {
      console.error("[email] Existing-account registration notice not sent: missing Brevo configuration.");
    }
    return { sent: false };
  }

  const html = `
    <!doctype html>
    <html lang="es">
      <body style="margin:0;padding:0;background:#f6f1e8;font-family:Arial,sans-serif;color:#231f20;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f1e8;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fffaf0;border-radius:18px;border:1px solid #d8c8a5;overflow:hidden;">
                <tr><td style="padding:28px 28px 12px;"><h1 style="margin:0;font-size:24px;line-height:1.25;color:#2a2118;">Solicitud de registro recibida</h1></td></tr>
                <tr><td style="padding:0 28px 28px;font-size:15px;line-height:1.6;color:#3a3026;">
                  <p>Hemos recibido una solicitud para crear una cuenta en ${appName} usando esta dirección.</p>
                  <p>Si has sido tú, inicia sesión con tu contraseña actual o usa el restablecimiento de contraseña si no la recuerdas. Si no has sido tú, puedes ignorar este mensaje.</p>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = [
    "Solicitud de registro recibida",
    "",
    `Hemos recibido una solicitud para crear una cuenta en ${appName} usando esta dirección.`,
    "Si has sido tú, inicia sesión con tu contraseña actual o usa el restablecimiento de contraseña si no la recuerdas.",
    "Si no has sido tú, puedes ignorar este mensaje.",
  ].join("\n");

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "DM Campaign Companion", email: from.match(/<(.+)>/)?.[1] ?? from },
        to: [{ email: to }],
        subject: "Solicitud de registro recibida",
        htmlContent: html,
        textContent: text,
      }),
    });

    if (!response.ok) {
      console.error("[email] Brevo existing-account registration notice failed:", { status: response.status });
      return { sent: false };
    }

    return { sent: true };
  } catch (error) {
    console.error("[email] Brevo existing-account registration notice error:", error);
    return { sent: false };
  }
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  expiresInMinutes = 30,
}: PasswordResetEmailInput): Promise<SendEmailResult> {
  const { provider, brevoApiKey, from } = getEmailConfig();

  if (provider !== "brevo" || !brevoApiKey || !from) {
    if (isProduction()) {
      console.error(
        "[email] Password reset email not sent: missing Brevo configuration.",
      );
    } else {
      console.info("[email] Password reset link:", resetUrl);
    }

    return { sent: false };
  }

  const safeResetUrl = escapeHtml(resetUrl);

  const html = `
    <!doctype html>
    <html lang="es">
      <body style="margin:0;padding:0;background:#f6f1e8;font-family:Arial,sans-serif;color:#231f20;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f1e8;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fffaf0;border-radius:18px;border:1px solid #d8c8a5;overflow:hidden;">
                <tr>
                  <td style="padding:28px 28px 12px;">
                    <h1 style="margin:0;font-size:24px;line-height:1.25;color:#2a2118;">
                      Restablece tu contraseña
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 18px;font-size:15px;line-height:1.6;color:#3a3026;">
                    <p>Hemos recibido una solicitud para cambiar la contraseña de tu cuenta en ${appName}.</p>
                    <p>Este enlace caduca en ${expiresInMinutes} minutos.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:8px 28px 26px;">
                    <a href="${safeResetUrl}" style="display:inline-block;background:#2a2118;color:#fffaf0;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:999px;">
                      Cambiar contraseña
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 28px;font-size:13px;line-height:1.5;color:#6f6254;">
                    <p>Si no has pedido este cambio, puedes ignorar este mensaje.</p>
                    <p style="word-break:break-all;">${safeResetUrl}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = [
    "Restablece tu contraseña",
    "",
    `Hemos recibido una solicitud para cambiar la contraseña de tu cuenta en ${appName}.`,
    `Este enlace caduca en ${expiresInMinutes} minutos.`,
    "",
    resetUrl,
    "",
    "Si no has pedido este cambio, puedes ignorar este mensaje.",
  ].join("\n");

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "DM Campaign Companion",
          email: from.match(/<(.+)>/)?.[1] ?? from,
        },
        to: [{ email: to }],
        subject: "Restablece tu contraseña",
        htmlContent: html,
        textContent: text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();

      console.error("[email] Brevo password reset email failed:", {
        status: response.status,
        body,
      });

      return { sent: false };
    }

    return { sent: true };
  } catch (error) {
    console.error("[email] Brevo password reset email error:", error);
    return { sent: false };
  }
}