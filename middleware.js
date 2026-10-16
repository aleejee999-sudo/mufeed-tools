// Vercel Routing Middleware: sirf root "/" par chalta hai.
// Pehli dafa aane wale ko mulk ke hisab se zuban par bhejta hai.
// Cookie (site_lang) mojood ho to wohi zuban chalti hai. Search bots ko redirect nahi karta.
export const config = { matcher: '/' };

const ARAB = new Set([
  'SA', 'AE', 'EG', 'KW', 'QA', 'BH', 'OM', 'JO', 'IQ', 'SY', 'LB', 'YE',
  'LY', 'TN', 'DZ', 'MA', 'SD', 'PS', 'MR', 'SO', 'DJ', 'KM'
]);
const BOT = /bot|crawl|spider|slurp|google|bing|facebookexternalhit|whatsapp|telegram|twitter|linkedin/i;

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (BOT.test(ua)) return; // bots aur link-preview wale root ka asal page dekhen

  const cookie = request.headers.get('cookie') || '';
  const saved = cookie.match(/(?:^|;\s*)site_lang=(ur|ar|en)(?:;|$)/);
  let lang = saved ? saved[1] : null;

  if (!lang) {
    const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();
    lang = country === 'PK' ? 'ur' : ARAB.has(country) ? 'ar' : 'en';
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL('/' + lang + '/', request.url).toString(),
      'Cache-Control': 'private, no-store',
      Vary: 'Cookie'
    }
  });
}