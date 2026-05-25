type ConfirmAccountTemplateInput = {
  name: string
  confirmationUrl: string
}

export function confirmAccountTemplate({
  name,
  confirmationUrl,
}: ConfirmAccountTemplateInput) {
  const safeName = name?.trim() || 'Hola'

  return `
  <div style="margin:0;padding:0;background:#0b0b0f;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:28px;font-weight:800;letter-spacing:-1px;color:#ffffff;">
          TRAPPING
        </div>
        <div style="margin-top:8px;font-size:14px;color:#a1a1aa;">
          Plataforma segura de remesas
        </div>
      </div>

      <div style="background:#15151b;border:1px solid #27272f;border-radius:22px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,.35);">
        <h2 style="margin:0 0 14px;font-size:24px;line-height:1.25;color:#ffffff;">
          Confirma tu correo electrónico
        </h2>

        <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#c7c7d1;">
          ${safeName}, gracias por registrarte en <strong style="color:#ffffff;">TRAPPING</strong>.
          Para activar tu cuenta, confirma tu correo haciendo clic en el botón.
        </p>

        <div style="text-align:center;margin:32px 0;">
          <a href="${confirmationUrl}"
             style="display:inline-block;background:#22c55e;color:#07130b;text-decoration:none;font-weight:800;font-size:15px;padding:15px 28px;border-radius:14px;">
            Confirmar mi cuenta
          </a>
        </div>

        <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#8b8b98;">
          Si el botón no funciona, copia y pega este enlace en tu navegador:
        </p>

        <p style="word-break:break-all;margin:0;font-size:12px;line-height:1.6;color:#71717a;">
          ${confirmationUrl}
        </p>

        <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#8b8b98;">
          Si tú no solicitaste esta cuenta, puedes ignorar este correo de forma segura.
        </p>
      </div>

      <div style="text-align:center;margin-top:26px;font-size:12px;color:#71717a;line-height:1.5;">
        © TRAPPING. Todos los derechos reservados.<br />
        Este es un correo automático, por favor no responder.
      </div>
    </div>
  </div>
  `
}
