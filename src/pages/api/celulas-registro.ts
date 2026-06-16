export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const WEBHOOK_URL = process.env.N8N_WEBHOOK_CELULAS ?? import.meta.env.N8N_WEBHOOK_CELULAS;
  if (!WEBHOOK_URL) {
    return new Response(JSON.stringify({ error: 'Webhook no configurado.' }), { status: 500 });
  }

  let data: Record<string, string>;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Petición inválida.' }), { status: 400 });
  }

  const { nombre, email, telefono, ciudad, grupo, mensaje } = data;
  if (!nombre || !email) {
    return new Response(JSON.stringify({ error: 'Nombre y email son obligatorios.' }), { status: 400 });
  }

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, telefono, ciudad, grupo, mensaje }),
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'No se pudo enviar. Inténtalo de nuevo.' }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
