const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

const FREE_VISION_MODELS = [
  'meta-llama/llama-3.2-11b-vision-instruct:free',
  'meta-llama/llama-3.2-90b-vision-instruct:free',
  'qwen/qwen2.5-vl-72b-instruct:free',
  'google/gemma-3-27b-it:free',
]

const FREE_TEXT_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'deepseek/deepseek-r1:free',
]

const PAID_FALLBACK_VISION = 'anthropic/claude-haiku-4-5'
const PAID_FALLBACK_TEXT = 'anthropic/claude-haiku-4-5'

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!key) throw new Error('OpenRouter API ключ не найден. Добавь VITE_OPENROUTER_API_KEY в файл .env')
  return key
}

async function callModel(
  model: string,
  messages: object[],
  stream = false
): Promise<Response> {
  return fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Lash Art Vision',
    },
    body: JSON.stringify({ model, messages, stream, max_tokens: 4000 }),
  })
}

export async function analyzeWithAI(
  imageBase64: string,
  eyeParams: object,
  preferences: object
): Promise<string> {
  const messages = [
    { role: 'system', content: LASH_SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
        },
        {
          type: 'text',
          text: `Геометрические параметры глаз из MediaPipe FaceMesh:\n${JSON.stringify(eyeParams, null, 2)}\n\nПредпочтения клиента:\n${JSON.stringify(preferences, null, 2)}\n\nДай рекомендацию строго в JSON формате без markdown.`,
        },
      ],
    },
  ]

  const allModels = [...FREE_VISION_MODELS, PAID_FALLBACK_VISION]

  for (const model of allModels) {
    try {
      const res = await callModel(model, messages)
      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        if (content) return content
      }
    } catch {
      // try next model
    }
  }

  throw new Error('Все AI модели недоступны. Проверь API ключ и интернет-соединение.')
}

export async function* chatWithAI(
  systemPrompt: string,
  history: { role: string; content: string }[],
  userMessage: string
): AsyncGenerator<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ]

  const allModels = [...FREE_TEXT_MODELS, PAID_FALLBACK_TEXT]

  for (const model of allModels) {
    try {
      const res = await callModel(model, messages, true)
      if (!res.ok || !res.body) continue

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) return
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const json = line.slice(6).trim()
          if (json === '[DONE]') return
          try {
            const parsed = JSON.parse(json)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) yield delta
          } catch {
            // skip malformed chunk
          }
        }
      }
    } catch {
      continue
    }
  }

  throw new Error('Не удалось получить ответ от AI')
}

const LASH_SYSTEM_PROMPT = `Ты — AI-стилист по наращиванию ресниц по авторской методике @lash.bomba.
Говоришь экспертно, тепло и вдохновляюще. Обращаешься на "ты". Женская энергия.

ЭФФЕКТЫ:
- fox (лисий): удлинение к внешнему углу, зоны 3-4 длиннее
- doll (кукольный): акцент по центру, зоны 2-3 длиннее
- squirrel (беличий): пик на зоне 3, внешний угол короче
- fox_squirrel (лиса-белка): гибрид
- reverse_squirrel (обратная белка): зона 1 длиннее

ЗОНЫ (1=внутренний угол → 4=внешний угол): Зона 1 — всегда макс 6мм.
Чем больше объём → тем меньше длина (обратная корреляция).

КРИТИЧЕСКИЕ ЗАПРЕТЫ:
- Лисий ЗАПРЕЩЁН при wide (широко посаженных)
- Лисий ЗАПРЕЩЁН при upturned + narrow (раскосые + узкие)
- Нависание center → только doll, лисий запрещён
- Глубокая посадка (deep) → только светлые, объём 1D-2D, изгиб B/C
- Зона 1 → максимум 6мм

Верни ТОЛЬКО валидный JSON без markdown-блоков:
{
  "effectName": "название эффекта на русском",
  "effectDescription": "1-2 предложения почему именно этот эффект",
  "zones": [{"zone":1,"length":6},{"zone":2,"length":8},{"zone":3,"length":10},{"zone":4,"length":12}],
  "curl": "C",
  "volume": "2D",
  "color": "чёрный",
  "forbidden": ["Лисий", "Кукольный" — только реально запрещённые для этого типа глаз, НА РУССКОМ],
  "aiMessage": "тёплое экспертное сообщение 2-3 предложения с объяснением выбора, обращение на ты"
}`
