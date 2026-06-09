export const prerender = false;

import type { APIRoute } from 'astro';

const formatTime = (ms: number): string => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return `${m}:${String(s % 60).padStart(2, '0')}`;
};

export const POST: APIRoute = async ({ request }) => {
  const ANTHROPIC_KEY = process.env.Anthropic_key ?? import.meta.env.Anthropic_key;
  if (!ANTHROPIC_KEY) {
    return new Response(JSON.stringify({ error: 'Clave de API no configurada en el servidor.' }), { status: 500 });
  }

  let body: { youtubeUrl?: string; supadataKey?: string };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo de petición inválido.' }), { status: 400 });
  }

  const { youtubeUrl, supadataKey } = body;
  if (!youtubeUrl || !supadataKey) {
    return new Response(JSON.stringify({ error: 'Faltan parámetros: youtubeUrl y supadataKey son obligatorios.' }), { status: 400 });
  }

  // 1. Transcripción vía Supadata
  let chunks: { offset: number; text: string }[] = [];
  try {
    const tRes = await fetch(
      `https://api.supadata.ai/v1/transcript?url=${encodeURIComponent(youtubeUrl)}&text=false`,
      { headers: { 'x-api-key': supadataKey } }
    );
    if (!tRes.ok) {
      const err = await tRes.json().catch(() => ({})) as { message?: string };
      return new Response(JSON.stringify({ error: err.message || `Error Supadata ${tRes.status}` }), { status: 400 });
    }
    const data = await tRes.json() as { content?: typeof chunks };
    chunks = Array.isArray(data.content) ? data.content : [];
    if (!chunks.length) {
      return new Response(JSON.stringify({ error: 'Este vídeo no tiene transcripción disponible.' }), { status: 400 });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: 'Error conectando con Supadata: ' + msg }), { status: 500 });
  }

  const transcriptText = chunks
    .map(c => `[${formatTime(c.offset)}] ${c.text}`)
    .join('\n')
    .slice(0, 14000);

  // 2. Análisis con Claude
  const prompt = `Eres un asistente especializado en análisis homilético de predicaciones evangélicas.

Se te proporciona la transcripción de una predicación con timestamps en formato [M:SS].

Tu tarea es identificar los MOMENTOS MÁS PODEROSOS e impactantes del mensaje. Para cada fragmento:
1. Extrae el texto exacto (mínimo 2 frases, máximo 6 frases)
2. Clasifícalo en: Llamada, Revelación, Ilustración, Versículo clave, Promesa, Desafío, o Transición
3. Asígnale puntuación de impacto del 1 al 10
4. Indica el timestamp exacto del inicio (del formato [M:SS] que aparece en la transcripción)
5. Explica en 1 frase por qué es un momento poderoso

Identifica entre 5 y 8 momentos clave.

También genera:
- Un título alternativo para redes sociales (gancho fuerte, máx. 10 palabras)
- La idea central del mensaje en 1 frase
- 3 clips recomendados para redes con timestamp de inicio y fin exactos

Responde ÚNICAMENTE en JSON sin backticks ni texto extra:
{
  "titulo_alternativo": "string",
  "idea_central": "string",
  "momentos": [
    {
      "orden": 1,
      "categoria": "string",
      "puntuacion": 8,
      "timestamp": "0:00",
      "timestamp_fin": "0:30",
      "texto": "string",
      "razon": "string"
    }
  ],
  "clips_recomendados": [
    {
      "numero": 1,
      "timestamp_inicio": "string",
      "timestamp_fin": "string",
      "duracion_estimada": "string",
      "fragmento": "primeras palabras...",
      "razon": "string"
    }
  ]
}

TRANSCRIPCIÓN:
${transcriptText}`;

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const claudeData = await claudeRes.json() as { content?: { type: string; text: string }[] };
    const raw = claudeData.content?.find(b => b.type === 'text')?.text || '';
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: 'Error en el análisis: ' + msg }), { status: 500 });
  }
};
