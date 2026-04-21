import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!

interface EmailPayload {
  user: { email: string }
  email_data: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: string
    site_url: string
  }
}

const subjects: Record<string, string> = {
  signup: 'Подтверди свой email — Lash Art Vision',
  recovery: 'Сброс пароля — Lash Art Vision',
  email_change: 'Подтверди смену email — Lash Art Vision',
}

const confirmUrl = (payload: EmailPayload) =>
  `${SUPABASE_URL}/auth/v1/verify?token=${payload.email_data.token_hash}&type=${payload.email_data.email_action_type}&redirect_to=${encodeURIComponent(payload.email_data.redirect_to)}`

const templates: Record<string, (url: string) => string> = {
  signup: (url) => `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0D0D0F;color:#fff;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#FF2D8A,#9B5DE5);padding:32px;text-align:center">
        <div style="font-size:36px">✨</div>
        <h1 style="margin:12px 0 4px;font-size:22px;letter-spacing:2px">LASH ART VISION</h1>
        <p style="margin:0;opacity:0.8;font-size:13px">Твой AI-стилист</p>
      </div>
      <div style="padding:32px;text-align:center">
        <h2 style="margin:0 0 12px;font-size:18px">Подтверди email</h2>
        <p style="color:#aaa;font-size:14px;margin:0 0 28px">Нажми кнопку ниже чтобы активировать аккаунт и войти в приложение</p>
        <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#FF2D8A,#9B5DE5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px">
          Подтвердить email →
        </a>
        <p style="color:#666;font-size:12px;margin:24px 0 0">Ссылка действительна 1 час. Если ты не регистрировался — просто проигнорируй это письмо.</p>
      </div>
    </div>
  `,
  recovery: (url) => `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0D0D0F;color:#fff;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#FF2D8A,#9B5DE5);padding:32px;text-align:center">
        <div style="font-size:36px">🔐</div>
        <h1 style="margin:12px 0 4px;font-size:22px;letter-spacing:2px">LASH ART VISION</h1>
      </div>
      <div style="padding:32px;text-align:center">
        <h2 style="margin:0 0 12px;font-size:18px">Сброс пароля</h2>
        <p style="color:#aaa;font-size:14px;margin:0 0 28px">Нажми кнопку чтобы задать новый пароль</p>
        <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#FF2D8A,#9B5DE5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px">
          Сброс пароля →
        </a>
        <p style="color:#666;font-size:12px;margin:24px 0 0">Если ты не запрашивал сброс пароля — проигнорируй это письмо.</p>
      </div>
    </div>
  `,
}

serve(async (req) => {
  try {
    const payload: EmailPayload = await req.json()
    const type = payload.email_data.email_action_type
    const url = confirmUrl(payload)
    const html = (templates[type] ?? templates.signup)(url)
    const subject = subjects[type] ?? subjects.signup

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lash Art Vision <onboarding@resend.dev>',
        to: [payload.user.email],
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
