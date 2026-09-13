// ============================================================
// worksheets.js — 英文學習單產生器 (95 課)
// v32: 四線格 zhuyin 「描寫」改為 true single-stroke skeleton glyph
//      (一個字母一條不封閉 path, 無外輪廓 = 無空心雙框)
// ============================================================
(function () {
  var SHEET = window.Worksheets = {};
  var esc = function (s) {
    s = (s == null ? '' : '' + s);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  // ---- 字型 (仅供彩色塗色字使用, 本版本描寫格不再使用字型) ----
  var UPPER_FONT = "'Patrick Hand SC','Caveat Brush','Arial Black','Sniglet','cursive'";
  var LOWER_FONT = "'Caveat Brush','Patrick Hand SC','Sniglet','Schoolbell','cursive'";
  var HAND_FONT  = UPPER_FONT + ',' + LOWER_FONT;
  var COLOR_FONT = "'Permanent Marker','Caveat Brush','Patrick Hand SC','cursive'";
  var GOOGLE_FONTS_HREF =
    'https://fonts.googleapis.com/css2?family=Patrick+Hand+SC&family=Caveat+Brush&family=Permanent+Marker&family=Sniglet&display=swap';

  // ------------------------------------------------------------
  // 【v32】單筆中線骨架字 LETTER_PATHS
  //   每個字母只有一條不封閉的 M/L/Q 命令 path,
  //   描紅して小朋友拿鉛筆一筆描出來。
  //   viewBox 140 × 170
  //     大寫: ceiling y=18 ↓ baseline y=140
  //     小寫: x-height t=76 ↓ baseline y=140, ascender ↑ y=18, descender ↓ y=160
  // ------------------------------------------------------------
  var LETTER_PATHS = {
    // 大寫
    'A': 'M 36 138 L 70 18 L 104 138 M 48 96 L 92 96',
    'B': 'M 36 18 L 36 138 L 84 138 Q 108 138 108 112 Q 108 90 80 88 Q 108 86 108 56 Q 108 18 78 18 L 36 18 M 36 78 L 80 78',
    'C': 'M 100 28 Q 80 18 56 22 Q 28 36 28 78 Q 28 122 56 136 Q 80 140 100 130',
    'D': 'M 36 18 L 36 138 L 76 138 Q 110 134 110 78 Q 110 22 76 18 L 36 18',
    'E': 'M 100 18 L 36 18 L 36 138 L 100 138 M 36 78 L 84 78',
    'F': 'M 100 18 L 36 18 L 36 138 M 36 78 L 84 78',
    'G': 'M 100 28 Q 80 18 56 22 Q 28 36 28 78 Q 28 122 56 136 Q 80 140 100 130 L 100 92 L 76 92',
    'H': 'M 36 18 L 36 138 M 104 18 L 104 138 M 36 78 L 104 78',
    'I': 'M 36 18 L 104 18 M 70 18 L 70 138 M 36 138 L 104 138',
    'J': 'M 100 32 L 100 110 Q 100 138 70 138 Q 48 138 38 122',
    'K': 'M 36 18 L 36 138 M 104 18 L 36 78 L 104 138',
    'L': 'M 36 18 L 36 138 L 100 138',
    'M': 'M 32 138 L 32 18 L 70 90 L 108 18 L 108 138',
    'N': 'M 36 138 L 36 18 L 104 138 L 104 18',
    'O': 'M 70 22 Q 28 22 28 78 Q 28 138 70 138 Q 112 138 112 78 Q 112 22 70 22',
    'P': 'M 36 138 L 36 18 L 80 18 Q 106 18 106 50 Q 106 82 80 82 L 36 82',
    'Q': 'M 70 22 Q 28 22 28 78 Q 28 138 70 138 Q 92 138 100 124 L 110 152',
    'R': 'M 36 138 L 36 18 L 80 18 Q 106 18 106 50 Q 106 82 80 82 L 36 82 L 104 138',
    'S': 'M 100 30 Q 80 18 56 24 Q 28 32 28 56 Q 28 76 56 80 L 78 86 Q 110 94 110 116 Q 110 142 78 142 Q 50 142 28 124',
    'T': 'M 30 18 L 110 18 M 70 18 L 70 138',
    'U': 'M 32 18 L 32 108 Q 32 138 70 138 Q 108 138 108 108 L 108 18',
    'V': 'M 30 18 L 70 138 L 110 18',
    'W': 'M 28 18 L 48 138 L 70 70 L 92 138 L 112 18',
    'X': 'M 32 18 L 108 138 M 108 18 L 32 138',
    'Y': 'M 30 18 L 70 78 L 110 18 M 70 78 L 70 138',
    'Z': 'M 32 18 L 108 18 L 32 138 L 108 138',
    // 小寫
    'a': 'M 92 96 L 92 138 M 92 96 Q 92 78 70 78 Q 32 78 32 108 Q 32 138 70 138 Q 84 138 92 128',
    'b': 'M 36 18 L 36 138 M 36 108 Q 36 78 70 78 Q 96 78 96 108 Q 96 138 70 138 Q 36 138 36 108',
    'c': 'M 96 88 Q 78 78 56 82 Q 32 92 32 108 Q 32 130 56 138 Q 78 142 96 132',
    'd': 'M 104 18 L 104 138 M 104 108 Q 104 78 70 78 Q 36 78 36 108 Q 36 138 70 138 Q 104 138 104 108',
    'e': 'M 32 108 L 96 108 Q 96 78 64 78 Q 32 78 32 108 Q 32 138 64 138 Q 84 138 96 126',
    'f': 'M 92 30 Q 70 22 56 56 L 56 138 M 30 96 L 70 96',
    'g': 'M 104 108 Q 104 78 70 78 Q 36 78 36 108 Q 36 138 70 138 Q 90 138 104 124 L 104 156 Q 104 164 92 164',
    'h': 'M 36 18 L 36 138 M 36 108 Q 36 78 62 78 Q 96 78 96 108 L 96 138',
    'i': 'M 70 78 L 70 138 M 64 52 L 76 52',
    'j': 'M 70 78 L 70 156 Q 70 164 58 164 M 64 52 L 76 52',
    'k': 'M 36 18 L 36 138 M 96 82 L 36 108 L 96 138',
    'l': 'M 70 18 L 70 138 M 60 18 L 80 18',
    'm': 'M 32 138 L 32 78 M 32 102 Q 32 78 50 78 Q 64 78 64 96 M 64 96 Q 64 78 84 78 Q 96 78 96 100 L 96 138',
    'n': 'M 36 138 L 36 78 M 36 100 Q 36 78 60 78 Q 88 78 88 100 L 88 138',
    'o': 'M 64 78 Q 32 78 32 108 Q 32 138 64 138 Q 96 138 96 108 Q 96 78 64 78',
    'p': 'M 36 78 L 36 158 M 36 108 Q 36 78 70 78 Q 96 78 96 108 Q 96 138 70 138 Q 36 138 36 108',
    'q': 'M 96 78 L 96 158 M 96 108 Q 96 78 62 78 Q 32 78 32 108 Q 32 138 62 138 Q 96 138 96 108',
    'r': 'M 36 138 L 36 78 M 36 92 Q 36 78 52 78 L 74 78',
    's': 'M 92 86 Q 72 78 52 82 Q 32 88 32 100 Q 32 112 56 116 L 72 120 Q 96 126 96 132 Q 96 142 70 142 Q 50 142 36 134',
    't': 'M 54 30 L 54 138 Q 54 138 46 138 M 30 78 L 88 78',
    'u': 'M 32 78 L 32 110 Q 32 138 56 138 Q 80 138 80 110 L 80 138 M 80 110 L 96 138',
    'v': 'M 32 78 L 64 138 L 96 78',
    'w': 'M 28 78 L 46 138 L 64 90 L 84 138 L 100 78',
    'x': 'M 32 78 L 96 138 M 96 78 L 32 138',
    'y': 'M 32 78 L 64 138 M 32 158 Q 50 158 64 148 Q 80 130 96 100 L 96 78',
    'z': 'M 32 78 L 96 78 L 32 138 L 96 138'
  };

  function fourLine(letter) {
    var L = String(letter == null ? '' : letter);
    if (!L) return '';
    var baselineY = 140;
    var pathD = LETTER_PATHS[L] || LETTER_PATHS[L.toUpperCase()] || '';

    function slot(traced) {
      var glyph;
      if (traced && pathD) {
        // ★ v32: 用手繪單筆 path (fill:none + dasharray) 取代字型外輪廓
        //   完全沒有內外雙框, 小朋友拿鉛筆一筆描到底。
        glyph = '<path d="' + pathD + '" ' +
                'fill="none" stroke="#d32f2f" stroke-width="3.2" ' +
                'stroke-dasharray="7 5" stroke-linecap="round" stroke-linejoin="round"/>';
      } else { glyph = ''; }
      var lines =
        '<line x1="8" y1="18" x2="132" y2="18" stroke="#1976d2" stroke-width="1.4"/>' +
        '<line x1="8" y1="80" x2="132" y2="80" stroke="#1976d2" stroke-width="1.2" stroke-dasharray="5 4"/>' +
        '<line x1="8" y1="140" x2="132" y2="140" stroke="#1976d2" stroke-width="1.4"/>';
      return '<svg viewBox="0 0 140 170" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" class="ws-trace-svg' + (traced ? '' : ' ws-blank') + '">' + lines + glyph + '</svg>';
    }
    return '<div class="ws-trace">' +
      '<div class="ws-trace-grid">' +
        slot(true) +
        slot(false) + slot(false) + slot(false) + slot(false) + slot(false) + slot(false) +
      '</div>' +
      '<div class="ws-trace-tiny">▲ 天花板線（ascender 碰這） &nbsp; ▬▬▬ 中線（x-height 碰這） &nbsp; ▼ 底線（baseline）　→ 描紅之後，自己再寫 6 次</div>' +
    '</div>';
  }

  // ------------------------------------------------------------
  // 大字塗色框 (G2 字族 / 字母塗色): 字型仍可用 (要粗黑可填色)
  // ------------------------------------------------------------
  function bigOutline(glyph) {
    var G = String(glyph == null ? '' : glyph);
    if (!G) return '';
    var segments = Array.from(G);
    var n = segments.length;
    var fontSize;
    var isEmoji = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{1F300}-\u{1F9FF}]/u.test(G);
    if (isEmoji) fontSize = 110;
    else if (n === 1) fontSize = 180;
    else if (n === 2) fontSize = 120;
    else if (n === 3) fontSize = 86;
    else if (n === 4) fontSize = 66;
    else fontSize = Math.max(40, Math.floor(220 / (n * 0.62)));

    var baselineY = 208, topY = 22, midY = 116, botY = 210;
    var lines =
      '<line x1="6" y1="' + topY + '" x2="234" y2="' + topY + '" stroke="#90a4ae" stroke-width="0.9"/>' +
      '<line x1="6" y1="' + midY + '" x2="234" y2="' + midY + '" stroke="#90a4ae" stroke-width="0.9" stroke-dasharray="4 3"/>' +
      '<line x1="6" y1="' + botY + '" x2="234" y2="' + botY + '" stroke="#90a4ae" stroke-width="0.9"/>';
    var text =
      '<text x="120" y="' + baselineY + '" text-anchor="middle" dominant-baseline="alphabetic" ' +
      'font-size="' + fontSize + '" font-family="' + COLOR_FONT + '" font-weight="700" ' +
      'fill="none" stroke="#222" stroke-width="4" stroke-linejoin="round">' + esc(G) + '</text>';
    var hint = '<text x="120" y="14" text-anchor="middle" font-size="11" fill="#888">（用彩色筆塗顏色）</text>';
    return '<div class="ws-color">' +
      '<svg viewBox="0 0 240 240" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
        lines + text + hint +
      '</svg></div>';
  }

  // ------------------------------------------------------------
  // 連連看
  // ------------------------------------------------------------
  function linesMatch(leftItems, rightItems) {
    var out = '<div class="ws-match">';
    var n = Math.max(leftItems.length, rightItems.length);
    for (var i = 0; i < n; i++) {
      out += '<div class="ws-match-row">' +
        '<span class="ws-match-left">' + esc(leftItems[i] || '') + '</span>' +
        '<span class="ws-match-mid">─────────</span>' +
        '<span class="ws-match-right">' + esc(rightItems[i] || '') + '</span>' +
      '</div>';
    }
    out += '</div>';
    return out;
  }

  // ------------------------------------------------------------
  // 包裝學習單 (列印用 A4)
  // ------------------------------------------------------------
  function toHtml(body, title) {
    title = title || '英文學習單';
    return '<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8">' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '<link rel="stylesheet" href="' + GOOGLE_FONTS_HREF + '">' +
      '<title>' + esc(title) + '</title>' +
      '<style>' +
      'body{margin:0;padding:18mm 14mm;background:#fff;font-family:"Microsoft JhengHei",sans-serif;color:#222;}' +
      '@page{size:A4;margin:12mm;}' +
      '.ws-sheet{max-width:760px;margin:0 auto;}' +
      '.ws-hd{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #d32f2f;padding-bottom:8px;margin-bottom:14px;}' +
      '.ws-hd h1{margin:0;font-size:20px;color:#3e2723;}' +
      '.ws-name{font:14px sans-serif;color:#555;}' +
      '.ws-name input{border:0;border-bottom:1.5px solid #888;width:120px;margin-left:6px;font:14px sans-serif;outline:none;background:transparent;}' +
      '.ws-q{break-inside:avoid;margin:14px 0;padding:10px 12px;background:#fffceb;border:1px dashed #d7ccc8;border-radius:10px;}' +
      '.ws-qlabel{font-weight:bold;color:#c05621;margin-bottom:8px;font-size:1.05rem;}' +
      '.ws-word{font-size:1.1rem;font-weight:bold;}' +
      '.ws-trace-tiny{font:12px sans-serif;color:#888;margin-top:6px;}' +
      '.ws-trace{display:inline-block;margin:4px 0;}' +
      '.ws-trace-grid{display:inline-flex;gap:0;align-items:center;}' +
      '.ws-trace-svg{display:inline-block;background:#fff;border:1px solid #eee;}' +
      '.ws-match-row{display:flex;align-items:center;gap:8px;margin:6px 0;}' +
      '.ws-match-left{flex:0 0 32%;text-align:right;font-weight:bold;background:#fff;border:1px solid #eee;padding:6px 10px;border-radius:6px;}' +
      '.ws-match-mid{flex:1;text-align:center;color:#888;letter-spacing:2px;}' +
      '.ws-match-right{flex:0 0 32%;font-weight:bold;background:#fff;border:1px solid #eee;padding:6px 10px;border-radius:6px;}' +
      '.ws-color{display:inline-block;margin:6px;}' +
      '.ws-color svg{display:block;background:#fff;border:1px solid #eee;}' +
      '.ws-color-label{font-size:.9rem;color:#5b6e7d;margin-top:2px;font-weight:bold;text-align:center;}' +
      '.ws-color-cell{display:inline-block;margin:6px;text-align:center;}' +
      '.ws-answers{background:#fff8e1;border:1px dashed #fbc02d;padding:6px 10px;border-radius:6px;margin-top:6px;display:none;font-weight:bold;}' +
      '.ws-show-answers .ws-answers{display:block;}' +
      '.ws-printonly{display:none;}' +
      '.ws-keys{margin:10px 0;}' +
      '.ws-key{font-weight:bold;color:#c05621;margin-right:8px;}' +
      '</style></head><body><div class="ws-sheet">' +
      '<div class="ws-hd"><h1>📘 ' + esc(title) + '</h1><div class="ws-name">姓名 ' + '<input type="text" placeholder="________">　班級 ' + '<input type="text" style="width:60px" placeholder="_____"></div></div>' +
      body +
      '</div></body></html>';
  }

  // ------------------------------------------------------------
  // 根據 lesson.class 與 items 安排題型
  // ------------------------------------------------------------
  function buildQuestion(item, idx) {
    var html = '';
    var kind = item.kind || (item.upper ? 'traceAA' :
                  item.syllable ? 'syllable' :
                  item.items ? 'connect' :
                  item.glyph ? 'color' : 'text');
    var label = item.label || ('題 ' + (idx + 1));
    var q = '<div class="ws-q"><div class="ws-qlabel">' + esc(label) + (item.hint ? '　<span style="color:#888;font-weight:normal;">' + esc(item.hint) + '</span>' : '') + '</div>';

    if (kind === 'traceAA') {
      q += '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
           fourLine(item.upper).replace('<div class="ws-trace">', '<div class="ws-trace" style="display:inline-block;">') +
           fourLine(item.lower).replace('<div class="ws-trace">', '<div class="ws-trace" style="display:inline-block;">') +
           '</div>';
      item._answer = '大寫＝' + (item.upper || '') + '／小寫＝' + (item.lower || '');
    } else if (kind === 'trace') {
      q += fourLine(item.letter || item.glyph || '');
      item._answer = '字＝' + (item.letter || item.glyph || '');
    } else if (kind === 'syllable') {
      q += '<div class="ws-word">' + esc(item.syllable) + '</div>' +
           '<div style="margin-top:8px">' + esc(item.example || '') + '</div>';
      item._answer = '音節／字＝' + (item.syllable || '');
    } else if (kind === 'color') {
      q += '<div class="ws-color-cell">' +
        bigOutline(item.glyph) +
        '<div class="ws-color-label">' + esc(item.glyphLabel || item.glyph) + '</div>' +
        '</div>';
      item._answer = '請塗色：' + (item.glyph || '');
    } else if (kind === 'connect') {
      q += linesMatch(item.left || [], item.right || []);
      item._answer = '配對：' + (item.left || []).join('／') + ' ⇄ ' + (item.right || []).join('／');
    } else {
      q += '<div>' + esc(item.text || '') + '</div>';
    }
    if (item.answer || item._answer) {
      q += '<div class="ws-answers">💡 答：' + esc(item.answer || item._answer) + '</div>';
    }
    q += '</div>';
    return q;
  }

  function build(module, lesson, opts) {
    opts = opts || {};
    var body = '';
    body += '<h2 style="margin:0 0 6px;font-size:16px;color:#3e2723;">📚 模組：' + esc(module.title) + '　／　' + esc(lesson.title) + '</h2>';
    if (lesson.objective) body += '<div style="margin-bottom:10px;font:14px sans-serif;color:#444;">' + esc(lesson.objective) + '</div>';
    (lesson.items || []).forEach(function (it, idx) { body += buildQuestion(it, idx); });
    var html = toHtml(body, lesson.title || '英文學習單');
    var answers = body.replace(/class="ws-q"/g, 'class="ws-q ws-answers-on"')
                      .replace(/class="ws-answers"/g, 'class="ws-answers" style="display:block"');
    return { html: html, answers: answers };
  }

  SHEET.fourLine = fourLine;
  SHEET.bigOutline = bigOutline;
  SHEET.linesMatch = linesMatch;
  SHEET.build = build;
  SHEET.toHtml = toHtml;

  SHEET.open = function (module, lesson) {
    var win = window.open('', '_blank');
    if (!win) { alert('請允許彈出視窗'); return; }
    var b = build(module, lesson);
    win.document.write(b.html);
    win.document.close();
    return win;
  };

  SHEET.showAnswers = function (module, lesson) {
    var win = window.open('', '_blank');
    if (!win) return;
    var b = build(module, lesson);
    win.document.write(b.answers);
    win.document.close();
    return win;
  };
})();
