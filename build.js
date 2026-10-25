/* Mufeed Tools | build.js | chalane ka tareeqa: node build.js | UTF-8 */
const fs = require('fs'), path = require('path');
const SITE = (process.env.SITE_URL || 'https://mufeed-tools.vercel.app').replace(/\/$/, ''); // domain badalna ho to sirf yahan
const ROOT = __dirname, OUT = path.join(ROOT, 'dist');
const LANGS = ['ur', 'ar', 'en'];
const META = {
  ur: { dir: 'rtl', name: 'اردو', og: 'ur_PK' },
  ar: { dir: 'rtl', name: 'العربية', og: 'ar_AR' },
  en: { dir: 'ltr', name: 'English', og: 'en_US' }
};
const TOOLS = [
  { slug: 'horoscope', ico: '🔮' }, { slug: 'age-calculator', ico: '🎂' }, { slug: 'whatsapp-direct', ico: '💬' },
  { slug: 'tasbih-counter', ico: '📿' }, { slug: 'unit-converter', ico: '📏' }, { slug: 'qr-code', ico: '🔳' }
];
const TJS = ['tools-i18n.js', 'tools.js'];
const PAGES = [   // slug '' = ہوم۔ نیا صفحہ جوڑنا ہو تو یہاں ایک لائن اور templates میں فائل
  { slug: '', tpl: 'index', css: ['calendar.css'], js: ['calendar-data.js', 'tools-i18n.js', 'tools.js', 'calendar.js'] },
  { slug: 'horoscope', tpl: 'horoscope', tool: 1, js: TJS },
  { slug: 'age-calculator', tpl: 'age-calculator', tool: 1, js: TJS },
  { slug: 'whatsapp-direct', tpl: 'whatsapp-direct', tool: 1, js: TJS },
  { slug: 'tasbih-counter', tpl: 'tasbih-counter', tool: 1, js: TJS },
  { slug: 'unit-converter', tpl: 'unit-converter', tool: 1, js: TJS },
  { slug: 'qr-code', tpl: 'qr-code', tool: 1, css: ['qr.css'], js: ['https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js'].concat(TJS, 'qr.js') },
  { slug: 'blog', tpl: 'blog' },
  { slug: 'blog/age-calculator', tpl: 'post', article: 1 }, { slug: 'blog/whatsapp-direct', tpl: 'post', article: 1 },
  { slug: 'blog/horoscope', tpl: 'post', article: 1 }, { slug: 'blog/tasbeeh-counter', tpl: 'post', article: 1 },
  { slug: 'blog/unit-converter', tpl: 'post', article: 1 }, { slug: 'blog/qr-code', tpl: 'post', article: 1 },
  { slug: 'about', tpl: 'static' },
  { slug: 'contact', tpl: 'static' }, { slug: 'privacy', tpl: 'static' }, { slug: 'terms', tpl: 'static' }
];
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Hanken+Grotesk:wght@400;600;700&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap">';

const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const has = (p) => fs.existsSync(path.join(ROOT, p));
const wr = (p, s) => { const f = path.join(OUT, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s, 'utf8'); };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
const url = (l, s) => '/' + l + '/' + (s || '');
const warns = [];

function render(t, c, where) {
  t = t.replace(/\{\{#each ([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, function (m, p, inner) {
    const a = get(c, p);
    if (!Array.isArray(a)) { warns.push(where + ': ' + p + ' ki list nahi mili'); return ''; }
    return a.map(function (it) { return render(inner, Object.assign({}, c, { this: it }), where); }).join('');
  });
  return t.replace(/\{\{([\w.]+)\}\}/g, function (m, p) {
    const v = get(c, p);
    if (v === undefined || v === null) { warns.push(where + ': {{' + p + '}} khali hai'); return ''; }
    return v;
  });
}
function copyDir(src, dst) {
  if (!has(src)) return;
  fs.mkdirSync(path.join(OUT, dst), { recursive: true });
  fs.readdirSync(path.join(ROOT, src), { withFileTypes: true }).forEach(function (e) {
    const s = src + '/' + e.name, d = dst + '/' + e.name;
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(path.join(ROOT, s), path.join(OUT, d));
  });
}

function buildHead(lang, pg, L, P, here) {
  const self = SITE + url(lang, pg.slug), xd = pg.slug ? SITE + url(here.indexOf('ur') > -1 ? 'ur' : here[0], pg.slug) : SITE + '/';
  const alts = here.map(function (l) { return '<link rel="alternate" hreflang="' + l + '" href="' + SITE + url(l, pg.slug) + '">'; }).join('\n') +
    '\n<link rel="alternate" hreflang="x-default" href="' + xd + '">';
  const g = [];
  if (!pg.slug) {
    g.push({ '@type': 'WebSite', '@id': SITE + '/#website', name: L.site.brand, url: SITE + '/', inLanguage: lang, description: P.description });
    g.push({ '@type': 'ItemList', name: P.toolsTitle, itemListElement: TOOLS.map(function (t, i) {
      return { '@type': 'ListItem', position: i + 1, name: L.tools[t.slug].name, url: SITE + url(lang, t.slug) };
    }) });
  } else {
    g.push({ '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: L.site.nav.home, item: SITE + url(lang, '') },
      { '@type': 'ListItem', position: 2, name: P.crumb || P.h1, item: self }] });
  }
    if (pg.article) g.push({ '@type': 'Article', headline: P.h1, description: P.description, inLanguage: lang, datePublished: P.date, dateModified: P.date, author: { '@type': 'Organization', name: L.site.brand }, publisher: { '@type': 'Organization', name: L.site.brand }, mainEntityOfPage: self });
  if (pg.tool) g.push({ '@type': 'WebApplication', name: P.h1, url: self, description: P.description, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', inLanguage: lang, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } });
  if (P.faq && P.faq.length) g.push({ '@type': 'FAQPage', mainEntity: P.faq.map(function (f) {
    return { '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') } };
  }) });
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': g }).replace(/</g, '\\u003c');
  const css = ['style.css'].concat(pg.css || []).map(function (f) { return '<link rel="stylesheet" href="/assets/' + f + '">'; }).join('\n');
 return ['<meta charset="UTF-8">', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    '<meta name="google-site-verification" content="EnOSYniSj58XQJU7_bwSFXfugAVtEQQFtTamMLaXVmo">',
    '<title>' + esc(P.title) + '</title>', '<meta name="description" content="' + esc(P.description) + '">',
    '<link rel="canonical" href="' + self + '">', alts,
    '<link rel="icon" type="image/png" sizes="128x128" href="/meetup (3).png">',
    '<link rel="icon" type="image/png" sizes="256x256" href="/meetup (2).png">',
    '<link rel="apple-touch-icon" sizes="512x512" href="/meetup (1).png">',
    '<meta property="og:type" content="website">', '<meta property="og:site_name" content="' + esc(L.site.brand) + '">',
    '<meta property="og:locale" content="' + META[lang].og + '">', '<meta property="og:title" content="' + esc(P.title) + '">',
    '<meta property="og:description" content="' + esc(P.description) + '">', '<meta property="og:url" content="' + self + '">',
    '<meta property="og:image" content="https://mufeed-tools.vercel.app/OGimage.png">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta name="twitter:card" content="summary_large_image">', '<meta name="theme-color" content="#0f4c45">',
    FONTS, css, '<script type="application/ld+json">' + ld + '</script>'].join('\n');
}
function rootPage(have) {
  const links = have.map(function (l) { return '<a class="btn block" href="/' + l + '/" hreflang="' + l + '" lang="' + l + '" dir="' + META[l].dir + '">' + META[l].name + '</a>'; }).join('');
  const alts = have.map(function (l) { return '<link rel="alternate" hreflang="' + l + '" href="' + SITE + '/' + l + '/">'; }).join('') + '<link rel="alternate" hreflang="x-default" href="' + SITE + '/">';
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<meta name="google-site-verification" content="EnOSYniSj58XQJU7_bwSFXfugAVtEQQFtTamMLaXVmo"><title>Mufeed Tools | مفید ٹولز | مفيد</title><meta name="description" content="Free online tools: jantri, Hijri date, age calculator, WhatsApp direct, tasbeeh counter, unit converter, QR code. مفت آن لائن ٹولز. أدوات مجانية.">' +
    '<link rel="canonical" href="' + SITE + '/">' + alts + FONTS + '<link rel="stylesheet" href="/assets/style.css"></head><body>' +
    '<main id="main" class="wrap" style="max-width:420px;text-align:center"><h1>Mufeed Tools</h1><p class="lead" style="margin-inline:auto">مفید ٹولز · مفيد</p>' +
    '<div class="btn-row" style="flex-direction:column">' + links + '</div></main>' +
    "<script>document.addEventListener('click',function(e){var a=e.target.closest('a[hreflang]');if(a)document.cookie='site_lang='+a.lang+';path=/;max-age=31536000;samesite=lax'})</script></body></html>";
}

/* ---------- main ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
copyDir('assets', 'assets');
if (has('robots.txt')) fs.copyFileSync(path.join(ROOT, 'robots.txt'), path.join(OUT, 'robots.txt'));

const data = {};
LANGS.forEach(function (l) {
  if (!has('lang/' + l + '.json')) return;
  data[l] = JSON.parse(rd('lang/' + l + '.json'));
  fs.readdirSync(path.join(ROOT, 'lang')).filter(function (f) { return f.indexOf(l + '.') === 0 && f !== l + '.json' && /\.json$/.test(f); }).forEach(function (f) {
    data[l].pages = Object.assign(data[l].pages || {}, JSON.parse(rd('lang/' + f)).pages || {});   // ur.tools-a.json jaisi extra files
  });
});
const have = Object.keys(data);
if (!have.length) { console.error('lang/ur.json (ya ar/en) nahi mili'); process.exit(1); }
const layout = rd('templates/layout.html'), year = new Date().getFullYear(), today = new Date().toISOString().slice(0, 10);
const built = [], skipped = [];

PAGES.forEach(function (pg) {
  const key = pg.slug || 'index';
  if (!has('templates/' + pg.tpl + '.html')) { skipped.push(key); return; }
  const tpl = rd('templates/' + pg.tpl + '.html');
  const here = have.filter(function (l) { return data[l].pages && data[l].pages[key]; });
  here.forEach(function (lang) {
    const L = data[lang], P = L.pages[key], where = lang + '/' + key;
    const tools = TOOLS.map(function (t) { return Object.assign({}, t, L.tools[t.slug]); });
    const toolTabs = '<nav class="tool-tabs" aria-label="' + esc(L.site.toolsLabel) + '">' + tools.map(function (t) {
      return '<a href="' + url(lang, t.slug) + '"' + (t.slug === pg.slug ? ' aria-current="page"' : '') + '>' + t.ico + ' ' + t.name + '</a>';
    }).join('') + '</nav>';
    const crumbs = pg.slug ? '<nav class="crumbs" aria-label="breadcrumb"><a href="' + url(lang, '') + '">' + L.site.nav.home + '</a> › ' + (P.crumb || P.h1) + '</nav>' : '';
    const ctx = { lang: lang, dir: META[lang].dir, site: L.site, page: P, tools: tools, toolTabs: toolTabs, crumbs: crumbs, year: year };
    const content = render(tpl, ctx, where);
    const nav = ['home', 'blog', 'about', 'contact'].map(function (n) {
      const s = n === 'home' ? '' : n;
      return '<a href="' + url(lang, s) + '"' + (s === pg.slug ? ' aria-current="page"' : '') + '>' + L.site.nav[n] + '</a>';
    }).join('');
    const langs = have.map(function (l) {
      const target = here.indexOf(l) > -1 ? url(l, pg.slug) : url(l, '');
      return '<a href="' + target + '" hreflang="' + l + '" lang="' + l + '"' + (l === lang ? ' aria-current="true"' : '') + '>' + META[l].name + '</a>';
    }).join('');
      const scripts = (pg.js || []).map(function (f) { return '<script defer src="' + (f.indexOf('http') === 0 ? f : '/assets/' + f) + '"></script>'; }).join('\n') +
      '\n<script defer src="/_vercel/insights/script.js"></script>';
    wr(lang + '/' + key + '.html', render(layout, Object.assign({}, ctx, { content: content, head: buildHead(lang, pg, L, P, here), nav: nav, langs: langs, scripts: scripts }), where + ' (layout)'));
  });
  built.push({ slug: pg.slug, langs: here });
});

wr('index.html', rootPage(have));
wr('404.html', rootPage(have).replace('<h1>Mufeed Tools</h1>', '<h1>404</h1>').replace('<link rel="canonical" href="' + SITE + '/">', '<meta name="robots" content="noindex">'));
let sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
sm += '<url><loc>' + SITE + '/</loc><lastmod>' + today + '</lastmod></url>\n';
built.forEach(function (b) {
  b.langs.forEach(function (l) {
    sm += '<url><loc>' + SITE + url(l, b.slug) + '</loc><lastmod>' + today + '</lastmod>' + b.langs.map(function (o) {
      return '<xhtml:link rel="alternate" hreflang="' + o + '" href="' + SITE + url(o, b.slug) + '"/>';
    }).join('') + '</url>\n';
  });
});
wr('sitemap.xml', sm + '</urlset>\n');

console.log('Zubanein:', have.join(', '), '| Bane hue safhe:', built.length, '| Chhore gaye (template nahi):', skipped.join(', ') || '-');
if (warns.length) { console.log('\nDhyan do:'); warns.forEach(function (w) { console.log(' - ' + w); }); }