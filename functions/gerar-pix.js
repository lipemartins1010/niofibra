/**
 * Cloudflare Pages Function — Proxy Sigilo Pay
 * Arquivo: functions/gerar-pix.js
 *
 * Variáveis de ambiente (Cloudflare Pages → Settings → Environment Variables):
 *   SIGILO_PUBLIC = sua x-public-key da Sigilo Pay
 *   SIGILO_SECRET = sua x-secret-key da Sigilo Pay
 */

export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

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
    const body = await context.request.json();

    // Log do payload recebido (visível nos logs do Cloudflare Pages)
    console.log('[gerar-pix] Payload recebido:', JSON.stringify(body));
    console.log('[gerar-pix] Public Key:', context.env.SIGILO_PUBLIC ? 'OK' : 'AUSENTE');
    console.log('[gerar-pix] Secret Key:', context.env.SIGILO_SECRET ? 'OK' : 'AUSENTE');

    const sigiloResp = await fetch(
      'https://app.sigilopay.com.br/api/v1/gateway/pix/receive',
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'x-public-key':  context.env.SIGILO_PUBLIC || '',
          'x-secret-key':  context.env.SIGILO_SECRET || '',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await sigiloResp.json();

    // Log da resposta da Sigilo Pay
    console.log('[gerar-pix] Status Sigilo Pay:', sigiloResp.status);
    console.log('[gerar-pix] Resposta Sigilo Pay:', JSON.stringify(data));

    return new Response(JSON.stringify(data), {
      status:  sigiloResp.status,
      headers: corsHeaders,
    });

  } catch (err) {
    console.error('[gerar-pix] Erro interno:', err.message);
    return new Response(
      JSON.stringify({ sucesso: false, erro: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
