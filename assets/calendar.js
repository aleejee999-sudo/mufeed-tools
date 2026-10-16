/* Mufeed Tools | calendar.js | calendar-data.js کے بعد لوڈ کریں | UTF-8 */
(function () {
  var D = window.CW_DATA, root = document.getElementById('cw');
  if (!D || !root) return;

  var LANG = document.documentElement.lang;
  if (!D[LANG]) LANG = 'ur';
  var T = D[LANG], L = T.lab, RTL = LANG !== 'en';
  var LI = { ur: 0, ar: 1, en: 2 }[LANG];
  var $ = function (id) { return document.getElementById(id); };
  var p2 = function (n) { return String(n).padStart(2, '0'); };

  /* ---------- اسلامی واقعات: 'دن-مہینہ' => [اردو, عربی, انگریزی, قسم] ----------
     b = برکت والا دن، s = شہادت / وصال، e = تاریخی واقعہ */
  var EV = {
    '1-1': ['ہجری سال کا آغاز؛ شہادتِ حضرت عمر فاروقؓ (24ھ)', 'بداية السنة الهجرية؛ استشهاد عمر بن الخطاب رضي الله عنه (24هـ)', 'Islamic New Year; martyrdom of Umar ibn al-Khattab (RA), 24 AH', 's'],
    '9-1': ['تاسوعا (9 محرم): عاشورا کے ساتھ روزہ رکھنا مستحب', 'تاسوعاء: يُستحب صيامه مع عاشوراء', 'Tasua (9 Muharram): fasting with Ashura is recommended', 'b'],
    '10-1': ['یومِ عاشورہ: شہادتِ امام حسینؓ (کربلا، 61ھ)؛ روزہ مستحب', 'يوم عاشوراء: استشهاد الحسين رضي الله عنه (كربلاء 61هـ)؛ يُستحب صيامه', 'Ashura: martyrdom of Imam Husayn (RA) at Karbala, 61 AH; fasting is recommended', 's'],
    '12-3': ['12 ربیع الاول: میلادِ مصطفی ﷺ اور وصالِ نبوی ﷺ (مشہور روایات کے مطابق)', '12 ربيع الأول: المولد النبوي ﷺ وذكرى وفاته على المشهور', '12 Rabi al-Awwal: birth of the Prophet ﷺ and, per well-known reports, his passing', 'b'],
    '11-4': ['گیارہویں شریف: وصالِ حضرت شیخ عبدالقادر جیلانیؒ (561ھ)', 'ذكرى وفاة الشيخ عبد القادر الجيلاني رحمه الله (561هـ)', 'Giyarvin Sharif: passing of Sheikh Abdul Qadir Jilani, 561 AH', 'e'],
    '22-6': ['وصالِ حضرت ابوبکر صدیقؓ (13ھ)', 'وفاة أبي بكر الصديق رضي الله عنه (13هـ)', 'Passing of Abu Bakr as-Siddiq (RA), 13 AH', 's'],
    '27-7': ['شبِ معراج (مشہور قول کے مطابق)', 'ليلة الإسراء والمعراج على المشهور', 'Laylat al-Isra wal-Miraj (per the well-known view)', 'b'],
    '15-8': ['شبِ برات: عبادت اور اگلے دن روزہ', 'ليلة النصف من شعبان: قيام وصيام اليوم التالي', 'Shab-e-Barat: worship, and fasting the next day', 'b'],
    '1-9': ['رمضان المبارک کا آغاز', 'بداية شهر رمضان المبارك', 'Start of Ramadan', 'b'],
    '10-9': ['وصالِ ام المومنین حضرت خدیجہؓ', 'وفاة أم المؤمنين خديجة رضي الله عنها', 'Passing of Umm al-Mu\'minin Khadijah (RA)', 's'],
    '17-9': ['غزوۂ بدر (2ھ): حق و باطل کا پہلا فیصلہ کن معرکہ', 'غزوة بدر الكبرى (2هـ)', 'Battle of Badr, 2 AH', 'e'],
    '20-9': ['فتحِ مکہ (8ھ)', 'فتح مكة (8هـ)', 'Conquest of Makkah, 8 AH', 'e'],
    '21-9': ['شہادتِ حضرت علیؓ (40ھ)', 'استشهاد علي بن أبي طالب رضي الله عنه (40هـ)', 'Martyrdom of Ali ibn Abi Talib (RA), 40 AH', 's'],
    '1-10': ['عیدالفطر؛ آج روزہ رکھنا ممنوع ہے', 'عيد الفطر المبارك؛ يحرم الصيام اليوم', 'Eid al-Fitr; fasting is forbidden today', 'b'],
    '7-10': ['غزوۂ احد (3ھ): شہادتِ حضرت حمزہؓ', 'غزوة أحد (3هـ): استشهاد حمزة رضي الله عنه', 'Battle of Uhud, 3 AH: martyrdom of Hamza (RA)', 's'],
    '8-12': ['یومِ ترویہ: حج کا آغاز', 'يوم التروية: بداية أعمال الحج', 'Day of Tarwiyah: start of the Hajj rites', 'e'],
    '9-12': ['یومِ عرفہ: غیر حاجی کے لیے روزے کی بڑی فضیلت', 'يوم عرفة: فضل عظيم لصيامه لغير الحاج', 'Day of Arafah: great reward for fasting, for those not on Hajj', 'b'],
    '10-12': ['عیدالاضحیٰ؛ قربانی کا دن، آج روزہ ممنوع ہے', 'عيد الأضحى المبارك؛ يوم النحر ويحرم الصيام', 'Eid al-Adha; day of sacrifice; fasting is forbidden', 'b'],
    '11-12': ['ایامِ تشریق: ذکر، کھانے پینے کے دن، روزہ ممنوع', 'أيام التشريق: أيام أكل وشرب وذكر، ويحرم صيامها', 'Days of Tashreeq: days of eating, drinking and remembrance; fasting is forbidden', 'b'],
    '12-12': ['ایامِ تشریق: ذکر، کھانے پینے کے دن، روزہ ممنوع', 'أيام التشريق: أيام أكل وشرب وذكر، ويحرم صيامها', 'Days of Tashreeq: days of eating, drinking and remembrance; fasting is forbidden', 'b'],
    '13-12': ['ایامِ تشریق (آخری دن): روزہ ممنوع', 'آخر أيام التشريق: يحرم الصيام', 'Last day of Tashreeq: fasting is forbidden', 'b'],
    '18-12': ['شہادتِ حضرت عثمان غنیؓ (35ھ)', 'استشهاد عثمان بن عفان رضي الله عنه (35هـ)', 'Martyrdom of Uthman ibn Affan (RA), 35 AH', 's']
  };
  var ICON = { b: '✨', s: '🕊️', e: '📜', n: '⭐' };
  var HARD = [3, 5, 16, 21, 24, 25];   // روایتی جنتری کی عام فہرست (جنتریوں میں فرق ہوتا ہے)
  var SACRED = [1, 7, 11, 12];
  var ME = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
  var PE = ['☀️','🌙','♂️','☿','♃','♀️','♄'];
  var DS = [[2,14],[3,14],[4,15],[5,15],[6,16],[7,16],[8,16],[9,16],[10,15],[11,15],[0,14],[1,13]];
  var CH = [6,4,2,0,5,3,1];
  var FM = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' });
  var AH = RTL ? ' هـ' : ' AH';

  var adj = 0, dayKey = null, cy = 0, cm = 0, lastFocus = null;
  try { adj = parseInt(localStorage.getItem('cw_adj') || '0', 10) || 0; } catch (e) {}

  function toast(msg) { if (typeof window.showToast === 'function') window.showToast(msg); else alert(msg); }

  /* ---------- تاریخ کے حساب ---------- */
  function hij(d) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + adj, 12);
    var p = FM.formatToParts(x);
    var g = function (t) { return +p.filter(function (o) { return o.type === t; })[0].value; };
    return { d: g('day'), m: g('month'), y: g('year') };
  }
  function desi(d) {
    var best = null;
    [d.getFullYear() - 1, d.getFullYear()].forEach(function (y) {
      DS.forEach(function (s, i) {
        var t = new Date(y, s[0], s[1]);
        if (t <= d && (!best || t > best.t)) best = { t: t, i: i };
      });
    });
    return { i: best.i, d: Math.round((d - best.t) / 864e5) + 1 };
  }
  function moon(d) {
    var a = (((d.getTime() / 864e5 + 2440587.5) - 2451550.1) / 29.530588853) % 1;
    return Math.floor((a < 0 ? a + 1 : a) * 8 + 0.5) % 8;
  }
  function hours(wd) {
    var s = CH.indexOf(wd), sa = [], na = [];
    for (var k = 0; k < 12; k++) {
      var p = CH[(s + k) % 7], r = (6 + k) + ':00–' + (7 + k) + ':00';
      if (p === 4 || p === 5 || p === 0) sa.push(r);
      else if (p === 6 || p === 2) na.push(r);
    }
    return { sa: sa, na: na };
  }
  function zodiac(d, m) {
    if ((m == 1 && d >= 20) || (m == 2 && d <= 18)) return 1;
    if ((m == 2 && d >= 19) || (m == 3 && d <= 20)) return 2;
    if ((m == 3 && d >= 21) || (m == 4 && d <= 19)) return 3;
    if ((m == 4 && d >= 20) || (m == 5 && d <= 20)) return 4;
    if ((m == 5 && d >= 21) || (m == 6 && d <= 20)) return 5;
    if ((m == 6 && d >= 21) || (m == 7 && d <= 22)) return 6;
    if ((m == 7 && d >= 23) || (m == 8 && d <= 22)) return 7;
    if ((m == 8 && d >= 23) || (m == 9 && d <= 22)) return 8;
    if ((m == 9 && d >= 23) || (m == 10 && d <= 22)) return 9;
    if ((m == 10 && d >= 23) || (m == 11 && d <= 21)) return 10;
    if ((m == 11 && d >= 22) || (m == 12 && d <= 21)) return 11;
    return 0;
  }

  /* ---------- واقعات اور فضیلتیں ---------- */
  function dated(h, g) {
    var o = [], e = EV[h.d + '-' + h.m], n = T.spG[(g.getMonth() + 1) + '-' + g.getDate()];
    if (e) o.push({ k: e[3], t: e[LI] });
    if (n) o.push({ k: 'n', t: n });
    return o;
  }
  function virtues(h, wd) {
    var o = [];
    var noFast = (h.m === 10 && h.d === 1) || (h.m === 12 && h.d >= 10 && h.d <= 13);
    if (SACRED.indexOf(h.m) > -1) o.push(L.sacred);
    if (h.m === 9) o.push(L.ram);
    if (h.m === 9 && h.d >= 21 && h.d % 2 === 1) o.push(L.qadr);
    if (h.m === 12 && h.d <= 9) o.push(L.ten);
    if (!noFast && h.m !== 9 && [13, 14, 15].indexOf(h.d) > -1) o.push(L.bidh);
    if (h.m === 10 && h.d >= 2) o.push(L.six);
    if (!noFast && h.m !== 9 && (wd === 1 || wd === 4)) o.push(L.mt);
    if (wd === 5) o.push(L.fri);
    return o;
  }
  function isHard(h, evs) {
    return HARD.indexOf(h.d) > -1 && h.m !== 9 && !evs.some(function (e) { return e.k === 'b'; });
  }
  function nextEv(n) {
    for (var k = 1; k <= 120; k++) {
      var x = new Date(n.getFullYear(), n.getMonth(), n.getDate() + k), e = dated(hij(x), x);
      if (e.length) return { t: e[0].t, k: e[0].k, n: k };
    }
    return null;
  }
  function fmtG(n) {
    var sep = RTL ? '، ' : ', ';
    return T.wd[n.getDay()] + sep + n.getDate() + ' ' + T.gm[n.getMonth()] + ' ' + n.getFullYear();
  }

  /* ---------- ویجیٹ دکھانا ---------- */
  function render() {
    var n = new Date(), hj = hij(n), ds = desi(n), wd = n.getDay(), mi = moon(n), hr = hours(wd);
    var evs = dated(hj, n), vt = virtues(hj, wd), nx = nextEv(n), hard = isHard(hj, evs), year = n.getFullYear();

    $('cw-title').textContent = L.now;
    $('cw-g').innerHTML = '<small>' + L.g + '</small>' + fmtG(n);
    $('cw-d').innerHTML = '<small>' + L.d + '</small>' + ds.d + ' ' + T.dm[ds.i];
    $('cw-h').innerHTML = '<small>' + L.h + '</small>' + hj.d + ' ' + T.hm[hj.m - 1] + ' ' + hj.y + AH;

    $('cw-adj-l').textContent = L.adj;
    $('cw-adj').innerHTML = [-2, -1, 0, 1, 2].map(function (v) {
      return '<option value="' + v + '"' + (v === adj ? ' selected' : '') + '>' + (v > 0 ? '+' + v : v) + '</option>';
    }).join('');

    var sp = $('cw-special');
    sp.hidden = !evs.length;
    if (evs.length) sp.textContent = ICON[evs[0].k] + ' ' + L.sp + ': ' + evs[0].t;

    $('cw-jt').textContent = L.jt;
    var rows = [
      [L.ev, evs.length ? evs.map(function (e) { return ICON[e.k] + ' ' + e.t; }).join('<br>') : L.noev],
      [L.kd, hard ? '🔸 ' + L.hard : '🟢 ' + L.soft],
      [L.fz, vt.length ? vt.map(function (v) { return '✨ ' + v; }).join('<br>') : '—'],
      [L.nx, nx ? ICON[nx.k] + ' ' + nx.t + ' (' + nx.n + ' ' + L.dy + ')' : '—'],
      [L.pl, PE[wd] + ' ' + T.pl[wd]],
      [L.sa, '<span dir="ltr">' + hr.sa.join(' | ') + '</span>'],
      [L.na, '<span dir="ltr">' + hr.na.join(' | ') + '</span>'],
      [L.co, T.co[wd]],
      [L.ch, T.ch[wd]],
      [L.zo, T.zo[zodiac(n.getDate(), n.getMonth() + 1)]],
      [L.mo, ME[mi] + ' ' + T.ph[mi]]
    ];
    $('cw-jantri').innerHTML = rows.map(function (r) {
      return '<div class="cw-row"><b>' + r[0] + ':</b> <span>' + r[1] + '</span></div>';
    }).join('');
    $('cw-note').textContent = L.note;

    $('cw-bt').textContent = '📝 ' + (evs.length ? evs[0].t : T.dm[ds.i]);
    $('cw-bp').textContent = T.bl[ds.i];
    $('cw-bb').textContent = L.rd;
    $('cw-year').textContent = L.yr.replace('{y}', year);
  }

  function tick() {
    var n = new Date();
    $('cw-clock').textContent = p2(n.getHours()) + ':' + p2(n.getMinutes()) + ':' + p2(n.getSeconds());
    var k = n.toDateString();
    if (k !== dayKey) { dayKey = k; render(); }
  }

  /* ---------- پاپ اپ اور کیلنڈر ---------- */
  function openM(html) {
    lastFocus = document.activeElement;
    $('cw-mc').innerHTML = html;
    $('cw-modal').hidden = false;
    $('cw-x').focus();
  }
  function closeM() {
    $('cw-modal').hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function cal(y, m) {
    var len = new Date(y, m + 1, 0).getDate(), first = new Date(y, m, 1).getDay(), td = new Date();
    var a = hij(new Date(y, m, 1)), b = hij(new Date(y, m, len)), da = desi(new Date(y, m, 1)), db = desi(new Date(y, m, len));
    var h = '<div class="cw-ch"><button type="button" data-n="-1" aria-label="previous">›</button><strong>' + T.gm[m] + ' ' + y + '</strong><button type="button" data-n="1" aria-label="next">‹</button></div>' +
      '<div class="cw-sm">' + L.h + ': ' + T.hm[a.m - 1] + ' ' + a.y + (a.m !== b.m ? ' – ' + T.hm[b.m - 1] + ' ' + b.y : '') +
      '<br>' + L.d + ': ' + T.dm[da.i] + (da.i !== db.i ? ' – ' + T.dm[db.i] : '') + '</div><div class="cw-grid">';
    T.wd.forEach(function (w) { h += '<b>' + w.slice(0, RTL ? 9 : 3) + '</b>'; });
    for (var i = 0; i < first; i++) h += '<i></i>';
    for (var d = 1; d <= len; d++) {
      var x = new Date(y, m, d), hh = hij(x), e = dated(hh, x);
      var cls = (x.toDateString() === td.toDateString() ? 'today ' : '') + (x.getDay() === 5 ? 'fri ' : '') + (e.length ? 'ev' : '');
      h += '<span class="' + cls + '"' + (e.length ? ' title="' + e[0].t.replace(/"/g, '') + '"' : '') + '>' + d + '<small>' + hh.d + '</small></span>';
    }
    return h + '</div><p class="cw-legend">' + L.lg + '</p>';
  }
  function showCal() { openM(cal(cy, cm)); }
  function openCal() { var n = new Date(); cy = n.getFullYear(); cm = n.getMonth(); showCal(); }

  function openBlog() {
    var n = new Date(), hj = hij(n), ds = desi(n), evs = dated(hj, n);
    openM('<h2 style="color:var(--green);margin:0 0 8px">📝 ' + (evs.length ? evs[0].t : T.dm[ds.i]) + '</h2>' +
      '<p style="line-height:2.1">' + T.bl[ds.i] + '</p>' +
      '<p style="margin-top:14px"><a href="/' + LANG + '/blog">' + L.all + '</a></p>');
  }

  /* ---------- سالانہ جنتری (پرنٹ / PDF) ---------- */
  function printYear() {
    var year = new Date().getFullYear(), title = L.yt.replace('{y}', year), w = window.open('', '_blank');
    if (!w) { toast(L.pop); return; }
    var rows = '';
    for (var d = new Date(year, 0, 1); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
      var hj = hij(d), ds = desi(d), wd = d.getDay(), mi = moon(d), e = dated(hj, d);
      rows += '<tr' + (wd === 5 ? ' class="f"' : '') + '><td>' + d.getDate() + ' ' + T.gm[d.getMonth()] + '</td><td>' + T.wd[wd] + '</td><td>' + hj.d + ' ' + T.hm[hj.m - 1] + '</td><td>' + ds.d + ' ' + T.dm[ds.i] + '</td><td>' + T.pl[wd] + '</td><td>' + ME[mi] + '</td><td class="v">' + e.map(function (x) { return x.t; }).join('; ') + '</td></tr>';
    }
    w.document.write('<!DOCTYPE html><html lang="' + LANG + '" dir="' + (RTL ? 'rtl' : 'ltr') + '"><head><meta charset="UTF-8"><title>' + title + '</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet">' +
      '<style>body{font-family:"Noto Naskh Arabic",Arial,sans-serif;margin:14px;color:#14211f}h1{text-align:center;color:#0f4c45}' +
      'table{width:100%;border-collapse:collapse;font-size:11px;text-align:center}th,td{border:1px solid #cbd5d1;padding:3px}' +
      'td.v{text-align:start;font-size:10px}th{background:#0f4c45;color:#fff}tr.f td{background:#e2f1ec}thead{display:table-header-group}tr{page-break-inside:avoid}</style></head>' +
      '<body><h1>' + title + '</h1><table><thead><tr><th>' + L.cd + '</th><th>' + L.cw + '</th><th>' + L.ch2 + '</th><th>' + L.cdesi + '</th><th>' + L.cp + '</th><th>' + L.cm + '</th><th>' + L.cv + '</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p style="font-size:10px;margin-top:8px">' + L.note + '</p>' +
      '<script>document.fonts.ready.then(function(){setTimeout(function(){print()},300)})<\/script></body></html>');
    w.document.close();
  }

  /* ---------- جوڑ توڑ ---------- */
  ['cw-g', 'cw-d', 'cw-h'].forEach(function (id) { $(id).onclick = openCal; });
  $('cw-bb').onclick = openBlog;
  $('cw-year').onclick = printYear;
  $('cw-x').onclick = closeM;
  $('cw-modal').addEventListener('click', function (e) {
    if (e.target.id === 'cw-modal') { closeM(); return; }
    var b = e.target.closest('[data-n]');
    if (!b) return;
    cm += parseInt(b.getAttribute('data-n'), 10);
    if (cm < 0) { cm = 11; cy--; } else if (cm > 11) { cm = 0; cy++; }
    showCal();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('cw-modal').hidden) closeM(); });
  $('cw-adj').addEventListener('change', function (e) {
    adj = parseInt(e.target.value, 10) || 0;
    try { localStorage.setItem('cw_adj', String(adj)); } catch (err) {}
    render();
  });

  setInterval(tick, 1000);
  tick();
})();