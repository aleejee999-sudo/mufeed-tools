/* Mufeed Tools | qr.js | qr-code-styling aur tools.js ke baad load hota hai | UTF-8 */
(function () {
  var root = document.getElementById('tool-qr');
  if (!root) return;
  var $ = function (id) { return document.getElementById(id); };
  var D = root.dataset, LANG = document.documentElement.lang, DIR = document.documentElement.dir;
  var toast = function (m) { if (window.showToast) window.showToast(m); else alert(m); };
  if (typeof QRCodeStyling === 'undefined') { $('qr-fallback').hidden = false; return; }

  var HASH = { pay: 'pay', whatsapp: 'wa', wifi: 'wifi', vcard: 'vcard', link: 'text' };   // jaise qr-code#wifi
  var tab = HASH[location.hash.slice(1)] || 'pay', logoData = null, qr = null;
  var v = function (id) { var e = $(id); return e ? e.value.trim() : ''; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var escV = function (s) { return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([;,])/g, '\\$1'); };   // vCard
  var escW = function (s) { return s.replace(/([\\;,:"])/g, '\\$1'); };                                          // Wi-Fi

  function fullPhone(ccId, numId) {
    var raw = v(numId), d = raw.replace(/\D/g, '');
    if (raw.charAt(0) === '+' || d.indexOf('00') === 0) return d.replace(/^0+/, '');
    return $(ccId).value.replace(/\D/g, '') + d.replace(/^0+/, '');
  }

  function payload() {
    if (tab === 'pay') {
      var acc = v('qp-iban').replace(/\s+/g, '');
      if (!acc) return '';
      return [['Account name', v('qp-title')], ['Bank/Wallet', v('qp-bank')], ['Account/IBAN', acc]]
        .filter(function (r) { return r[1]; }).map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');
    }
    if (tab === 'wa') {
      var p = fullPhone('qw-cc', 'qw-num');
      if (p.length < 9 || p.length > 15) return '';
      return 'https://wa.me/' + p + (v('qw-msg') ? '?text=' + encodeURIComponent(v('qw-msg')) : '');
    }
    if (tab === 'wifi') {
      if (!v('qf-ssid')) return '';
      var sec = $('qf-sec').value;
      return 'WIFI:T:' + sec + ';S:' + escW(v('qf-ssid')) + ';' + (sec === 'nopass' ? '' : 'P:' + escW($('qf-pass').value) + ';') + ';';
    }
    if (tab === 'vcard') {
      if (!v('qv-name')) return '';
      var ph = fullPhone('qv-cc', 'qv-phone');
      return ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + escV(v('qv-name')),
        v('qv-org') && 'ORG:' + escV(v('qv-org')),
        ph.length >= 9 && 'TEL:+' + ph,
        v('qv-email') && 'EMAIL:' + escV(v('qv-email')),
        v('qv-addr') && 'ADR:;;' + escV(v('qv-addr')) + ';;;;',
        'END:VCARD'].filter(Boolean).join('\n');
    }
    return $('qt-text').value.trim();
  }

  function lum(hex) {
    var c = [1, 3, 5].map(function (i) { var x = parseInt(hex.substr(i, 2), 16) / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function refresh() {
    var d = payload(), fg = $('qr-fg').value, bg = $('qr-bg').value;
    var a = lum(fg), b = lum(bg), ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    $('qr-contrast').hidden = ratio >= 3 || a > b;
    try {
      qr.update({ data: d || ' ', image: logoData || undefined, dotsOptions: { type: 'rounded', color: fg }, backgroundOptions: { color: bg }, cornersSquareOptions: { type: 'extra-rounded', color: fg } });
      $('qr-error').hidden = true;
    } catch (e) { $('qr-error').hidden = false; }
    $('qr-canvas').classList.toggle('empty', !d);
    var label = document.querySelector('[data-k="' + tab + '"]').textContent;
    $('pv-title').textContent = (tab === 'pay' ? v('qp-title') : tab === 'vcard' ? (v('qv-org') || v('qv-name')) : '') || D.blank;
    $('pv-sub').textContent = tab === 'pay' ? v('qp-bank') : label;
    $('pv-meta').textContent = d ? (tab === 'pay' ? v('qp-iban') : '') : D.empty;
  }

  function showTab(k) {
    tab = k;
    document.querySelectorAll('[data-k]').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-k') === k ? 'true' : 'false'); });
    document.querySelectorAll('[data-form]').forEach(function (f) { f.hidden = f.getAttribute('data-form') !== k; });
    refresh();
  }

  async function printPoster() {
    if (!payload()) { toast(D.empty); return; }
    var blob = await qr.getRawData('png');
    var url = await new Promise(function (res) { var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.readAsDataURL(blob); });
    var size = $('qr-paper').value, k = size === 'A4' ? 1 : 0.75, w = window.open('', '_blank');
    if (!w) { toast(D.popup); return; }
    var pay = tab === 'pay', name = $('pv-title').textContent, sub = $('pv-sub').textContent;
    w.document.write('<!DOCTYPE html><html lang="' + LANG + '" dir="' + DIR + '"><head><meta charset="UTF-8"><title>' + esc(name) + '</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Hanken+Grotesk:wght@600;700&family=Noto+Naskh+Arabic:wght@600;700&display=swap" rel="stylesheet">' +
      '<style>@page{size:' + size + ';margin:0}body{margin:0;font-family:"Noto Naskh Arabic","Hanken Grotesk",Arial,sans-serif;text-align:center;color:#14211f}' +
      '.p{height:100vh;box-sizing:border-box;padding:7vh 8vw;border:14px double #0f4c45;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:' + (2 * k) + 'vh}' +
      'h1{font-size:' + (3 * k) + 'rem;color:#0f4c45;margin:0;line-height:1.7}h2{margin:0;font-size:' + (2 * k) + 'rem}.b{font-size:' + (1.4 * k) + 'rem;color:#52645f}' +
      'img{width:62%;max-width:520px}.s{font-size:' + (1.3 * k) + 'rem;font-weight:700}</style></head>' +
      '<body><div class="p"><h1>' + esc(pay ? D.posterPay : D.poster) + '</h1><h2>' + esc(name) + '</h2><div class="b">' + esc(sub) + '</div>' +
      '<img src="' + url + '" alt="QR"><div class="s">' + esc(pay ? D.scanPay : '') + '</div></div>' +
      '<script>document.fonts.ready.then(function(){setTimeout(function(){print()},400)})<\/script></body></html>');
    w.document.close();
  }

  qr = new QRCodeStyling({
    width: 240, height: 240, type: 'canvas', data: ' ', margin: 6,
    qrOptions: { errorCorrectionLevel: 'H' },
    dotsOptions: { type: 'rounded', color: '#0f4c45' }, backgroundOptions: { color: '#ffffff' },
    cornersSquareOptions: { type: 'extra-rounded' }, imageOptions: { crossOrigin: 'anonymous', margin: 4, imageSize: 0.28 }
  });
  qr.append($('qr-canvas'));

  document.querySelectorAll('[data-k]').forEach(function (b) { b.addEventListener('click', function () { showTab(b.getAttribute('data-k')); }); });
  document.querySelectorAll('[data-form] input, [data-form] select, [data-form] textarea, #qr-fg, #qr-bg').forEach(function (el) {
    el.addEventListener('input', refresh); el.addEventListener('change', refresh);
  });
  $('qr-logo').addEventListener('change', function (e) {
    var f = e.target.files[0];
    if (!f) { logoData = null; refresh(); return; }
    var fr = new FileReader();
    fr.onload = function () { logoData = fr.result; refresh(); };
    fr.readAsDataURL(f);
  });
  $('qr-dl-png').onclick = function () { if (!payload()) { toast(D.empty); return; } qr.download({ name: 'qr-code', extension: 'png' }); };
  $('qr-dl-jpg').onclick = function () { if (!payload()) { toast(D.empty); return; } qr.download({ name: 'qr-code', extension: 'jpeg' }); };
  $('qr-print').onclick = printPoster;
  showTab(tab);
})();