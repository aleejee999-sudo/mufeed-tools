/* Mufeed Tools | tools.js | tools-i18n.js کے بعد لوڈ کریں | UTF-8 */
(function () {
  var LANG = document.documentElement.lang, I = (window.TOOLS_I18N || {})[LANG];
  if (!I) return;
  var $ = function (id) { return document.getElementById(id); };
  var setText = function (id, t) { var e = $(id); if (e) e.textContent = t; };
  var fill = function (s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k] !== undefined ? o[k] : m; }); };
  var p2 = function (n) { return String(n).padStart(2, '0'); };
  var isoDate = function (d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); };
  var parseDate = function (s) { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  var fmt = function (n, d) { return isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—'; };
  var num = function (id) { var e = $(id), v = e ? parseFloat(e.value) : 0; return isFinite(v) && v > 0 ? v : 0; };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- پیغام (toast) اور گنتی ---------- */
  var toastTimer;
  function toast(msg) {
    var el = $('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2800);
  }
  window.showToast = toast;
  function track(name) { try { if (typeof window.va === 'function') window.va('event', { name: name }); } catch (e) {} }

  /* ================= برج اور قسمت ================= */
  function zodiacIndex(d, m) {
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
  function initHoroscope() {
    if (!$('tool-horoscope')) return;
    $('hz-dob').max = isoDate(new Date());
    $('hz-btn').onclick = function () {
      var name = $('hz-name').value.trim(), dobVal = $('hz-dob').value;
      if (!name) { toast(I.msg.needName); return; }
      if (!dobVal) { toast(I.msg.needDob); return; }
      var dob = parseDate(dobVal), day = dob.getDate(), month = dob.getMonth() + 1, H = I.hz;
      setText('hz-res-name', H.resultFor + ': ' + name);
      setText('hz-zodiac', H.signs[zodiacIndex(day, month)]);
      setText('hz-personality', H.personality[(name.length + day) % 3]);
      setText('hz-future', H.future[(name.length + month) % 3]);
      setText('hz-travel', H.travel[(name.length + day + month) % 3]);
      $('hz-result').hidden = false;
      track('horoscope_used');
    };
    $('hz-share-fb').onclick = function () {
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(location.href), '_blank', 'noopener');
    };
    $('hz-share-wa').onclick = function () {
      window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(I.hz.shareText + ' ' + location.href), '_blank', 'noopener');
    };
  }

  /* ================= عمر کا حساب ================= */
  function initAge() {
    if (!$('tool-age')) return;
    var today = new Date(), iso = isoDate(today);
    $('age-dob').max = iso;
    $('age-ref').value = iso;
    $('age-btn').onclick = function () {
      if (!$('age-dob').value) { toast(I.msg.needAgeDob); return; }
      var birth = parseDate($('age-dob').value);
      var at = $('age-ref').value ? parseDate($('age-ref').value) : parseDate(iso);
      if (birth > at) { toast(I.msg.futureDob); return; }
      var y = at.getFullYear() - birth.getFullYear(), m = at.getMonth() - birth.getMonth(), d = at.getDate() - birth.getDate();
      if (d < 0) { m--; d += new Date(at.getFullYear(), at.getMonth(), 0).getDate(); }
      if (m < 0) { y--; m += 12; }
      var total = Math.round((at - birth) / 864e5);
      var next = new Date(at.getFullYear(), birth.getMonth(), birth.getDate());
      if (next < at) next = new Date(at.getFullYear() + 1, birth.getMonth(), birth.getDate());
      var toNext = Math.round((next - at) / 864e5);
      var A = I.age;
      var weekday = next.toLocaleDateString(LANG === 'en' ? 'en-US' : LANG, { weekday: 'long' });
      var lines = [
        fill(A.main, { y: y, m: m, d: d }),
        fill(A.days, { n: fmt(total, 0) }),
        fill(A.weeks, { n: fmt(Math.floor(total / 7), 0) }),
        fill(A.hours, { n: fmt(total * 24, 0) }),
        fill(A.hijri, { n: (total / 354.367).toFixed(1) }),
        toNext === 0 ? A.today : fill(A.next, { n: toNext, day: weekday })
      ];
      setText('age-text', lines.join('\n'));
      $('age-result').hidden = false;
      track('age_calculated');
    };
  }

  /* ================= واٹس ایپ ڈائریکٹ ================= */
  function waLink() {
    var raw = $('wa-number').value.trim(), cc = $('wa-cc').value.replace(/\D/g, ''), digits = raw.replace(/\D/g, ''), full;
    if (raw.charAt(0) === '+' || digits.indexOf('00') === 0) full = digits.replace(/^0+/, '');
    else full = cc + digits.replace(/^0+/, '');
    if (full.length < 9 || full.length > 15) return '';
    var msg = $('wa-msg').value.trim();
    return 'https://wa.me/' + full + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }
  function initWhatsApp() {
    if (!$('tool-wa')) return;
    var out = $('wa-link');
    function refresh() { out.value = waLink(); }
    ['wa-number', 'wa-msg', 'wa-cc'].forEach(function (id) { $(id).addEventListener('input', refresh); $(id).addEventListener('change', refresh); });
    $('wa-open').onclick = function () {
      var url = waLink();
      if (!url) { toast(I.msg.needNumber); return; }
      window.open(url, '_blank', 'noopener');
      track('whatsapp_opened');
    };
    $('wa-copy').onclick = function () {
      var url = waLink();
      if (!url) { toast(I.msg.needNumber); return; }
      var done = function () { toast(I.msg.copied); track('whatsapp_link_copied'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { out.select(); document.execCommand('copy'); done(); });
      else { out.select(); document.execCommand('copy'); done(); }
    };
  }

  /* ================= ناپ تول اور پلاٹ ================= */
  var UM = { mm: 0.001, cm: 0.01, in: 0.0254, ft: 0.3048, yd: 0.9144, m: 1, km: 1000, mi: 1609.344 };
  var UO = ['mm', 'cm', 'in', 'ft', 'yd', 'm', 'km', 'mi'];
  function smart(n) {
    if (!isFinite(n)) return '—';
    if (n === 0) return '0';
    var a = Math.abs(n), dec = a >= 1 ? 5 : Math.min(12, 5 + Math.ceil(-Math.log10(a)));
    var s = n.toFixed(dec);
    return s.indexOf('.') > -1 ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
  }
  function initConverter() {
    if (!$('tool-conv')) return;
    var sel = $('conv-unit');
    sel.innerHTML = UO.map(function (u) { return '<option value="' + u + '">' + I.units[u] + '</option>'; }).join('');
    sel.value = 'cm';
    function calc() {
      var raw = $('conv-value').value, val = parseFloat(raw), from = sel.value, ok = raw !== '' && isFinite(val) && val >= 0;
      var meters = ok ? val * UM[from] : 0;
      $('conv-results').innerHTML = UO.filter(function (u) { return u !== from; }).map(function (u) {
        return '<div class="stat"><span>' + I.units[u] + '</span><strong class="ltr">' + (ok ? smart(meters / UM[u]) : '—') + '</strong></div>';
      }).join('');
      var hr = $('height-result');
      if (!ok) { hr.textContent = '—'; return; }
      var totalIn = meters / UM.in, ft = Math.floor(totalIn / 12), inch = Math.round((totalIn - ft * 12) * 100) / 100;
      if (inch >= 12) { ft++; inch = 0; }
      hr.textContent = ft + ' ' + I.feet + ' ' + fmt(inch, 2).replace(/\.?0+$/, '') + ' ' + I.inches;
    }
    $('conv-value').addEventListener('input', calc);
    sel.addEventListener('change', calc);
    calc();
  }
  function initPlot() {
    if (!$('plot-result')) return;
    var shown = false, ids = ['f1', 'i1', 'f2', 'i2', 'f3', 'i3', 'f4', 'i4'];
    function calc(fromBtn) {
      var front = num('f1') * 12 + num('i1'), left = num('f2') * 12 + num('i2'), back = num('f3') * 12 + num('i3'), right = num('f4') * 12 + num('i4');
      if (fromBtn && !(front || left || back || right)) { toast(I.msg.needSides); return; }
      shown = true;
      var L = ((front + back) / 2) / 12, W = ((left + right) / 2) / 12, sqft = L * W;
      var mv = parseFloat($('marla-type').value) || 225;
      var sqin = Math.round(sqft * 144), msq = Math.round(mv * 144), mi = Math.floor(sqin / msq), rem = sqin - mi * msq;
      setText('res-sqft', fmt(sqft, 2) + ' ' + I.units.sqft);
      setText('res-sqyd', fmt(sqft / 9, 2) + ' ' + I.units.sqyd);
      setText('res-marla', fmt(sqft / mv, 3) + ' ' + I.units.marla);
      setText('res-kanal', fmt(sqft / (mv * 20), 3) + ' ' + I.units.kanal);
      setText('res-avg', fmt(L, 2) + ' × ' + fmt(W, 2) + ' ' + I.feet);
      setText('res-breakdown', fill(I.plot.breakdown, { m: mi, f: Math.floor(rem / 144), i: rem - Math.floor(rem / 144) * 144 }));
      $('plot-result').hidden = false;
      if (fromBtn) track('plot_area_calculated');
    }
    $('plot-btn').onclick = function () { calc(true); };
    $('plot-reset').onclick = function () {
      ids.forEach(function (id) { $(id).value = ''; });
      shown = false;
      $('plot-result').hidden = true;
    };
    ids.forEach(function (id) { $(id).addEventListener('input', function () { if (shown) calc(false); }); });
    $('marla-type').addEventListener('change', function () { if (shown) calc(false); });
  }

  /* ================= تسبیح ================= */
  var Z = ['سُبْحَانَ اللّٰهِ', 'اَلْحَمْدُ لِلّٰهِ', 'اَللّٰهُ أَكْبَرُ', 'لَآ إِلٰهَ اِلَّا اللّٰهُ', 'أَسْتَغْفِرُ