/**
 * Cloudflare Pages Function — Proxy Sigilo Pay
 * Arquivo: functions/gerar-pix.js
 *
 * Deploy:
 *   1. Na raiz do seu projeto crie a pasta: functions/
 *   2. Coloque este arquivo dentro: functions/gerar-pix.js
 *   3. Publique no Cloudflare Pages normalmente
 *
 * Variáveis de ambiente (Cloudflare Pages → Settings → Environment Variables):
 *   SIGILO_PUBLIC = sua x-public-key da Sigilo Pay
 *   SIGILO_SECRET = sua x-secret-key da Sigilo Pay
 *
 * No SP_CONFIG do HTML, configure:
 *   proxyUrl: 'https://seusite.pages.dev/gerar-pix'
 */

export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Preflight CORS
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (context.request.method !== 'POST') {
    return new Response(
      JSON.stringify({ sucesso: false, erro: 'Método não permitido' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // Lê body enviado pelo HTML
    const body = await context.request.json();

    // Repassa para a Sigilo Pay com as chaves do ambiente
    const sigiloResp = await fetch(
      'https://app.sigilopay.com.br/api/v1/gateway/pix/receive',
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'x-public-key':  context.env.SIGILO_PUBLIC,
          'x-secret-key':  context.env.SIGILO_SECRET,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await sigiloResp.json();

    return new Response(JSON.stringify(data), {
      status:  sigiloResp.status,
      headers: corsHeaders,
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ sucesso: false, erro: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
