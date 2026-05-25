type SendEmailInput = {
  to: string
  subject: string
  html: string
}

type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string }

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'Trapping <noreply@trapping.cl>'

  if (!apiKey) {
    return {
      ok: false,
      error: 'RESEND_API_KEY no está configurada',
    }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    return {
      ok: false,
      error:
        payload?.message ||
        payload?.error ||
        `Resend respondió con status ${response.status}`,
    }
  }

  return {
    ok: true,
    id: payload?.id,
  }
}
