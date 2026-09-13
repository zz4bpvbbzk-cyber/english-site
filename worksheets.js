// ============================================================
// worksheets.js — 英文學習單產生器 (95 課)
// v34: 單筆骨架描寫 (single-stroke skeleton LETTER_PATHS) +
//      自動組題 (lesson.items 缺失時,從 lesson.main 自動產出 traceAA + color +
//                circleSpell + connect 四個標準題型)
// ============================================================
(function () {
  var SHEET = window.Worksheets = {};
  var esc = function (s) {
    s = (s == null ? '' : '' + s);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  var COLOR_FONT = "'Permanent Marker','Caveat Brush','Patrick Hand SC','cursive'";
  var GOOGLE_FONTS_HREF =
    'https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Patrick+Hand+SC&family=Permanent+Marker&display=swap';

  // ------------------------------------------------------------
  // [v34] 單筆中線骨架字 LETTER_PATHS
  //   每個字母就是一條不封閉 path (M/L/Q 命令),沒有外輪廓 = 沒有空心雙框。
  //   dasharray 在手寫筆畫上跑,小朋友拿鉛筆一筆描到底。
  //   viewBox 140 × 170:
  //     大寫: ceiling y=18 ↓ baseline y=140
  //     小寫: x-height t=76 ↓ baseline y=140; ascender ↑ y=18; descender ↓ y=160
  // ------------------------------------------------------------
  var LETTER_PATHS = {
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
    var pathD = LETTER_PATHS[L] || '';

    function slot(traced) {
      var glyph = '';
      if (traced && pathD) {
        glyph = '<path d="' + pathD + '" ' +
                'fill="none" stroke="#d32f2f" stroke-width="3.2" ' +
                'stroke-dasharray="7 5" stroke-linecap="round" stroke-linejoin="round"/>';
      }
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
  // ★ v34: 自動組題 (當 lesson.items 沒有定義時)
  //   從 lesson.main.uppercase / .lowercase 取字母
  //   從 lesson.main.vocab 取單字 → color + circleSpell + connect
  // ------------------------------------------------------------
  function letterFromMain(text) {
    var m = (text || '').match(/[A-Za-z]/);
    return m ? m[0] : '';
  }
  function autoBuildItems(module, lesson) {
    var items = [];
    var upper = letterFromMain(lesson.main && lesson.main.uppercase);
    var lower = letterFromMain(lesson.main && lesson.main.lowercase);
    if (!upper && !lower) {
      var t = (lesson.title || lesson.id || '');
      upper = letterFromMain(t);
      lower = t.match(/[a-z]/);
      lower = lower ? lower[0] : '';
    }
    if (upper || lower) {
      items.push({
        kind: 'traceAA',
        upper: upper, lower: lower,
        _answer: '大寫＝' + upper + ' / 小寫＝' + lower
      });
    }
    var vocab = (lesson.main && lesson.main.vocab) || [];
    if (vocab.length) {
      items.push({
        kind: 'color',
        glyph: vocab[0].en,
        glyphLabel: vocab[0].zh + ' (' + vocab[0].en + ')',
        _answer: '請塗色：' + vocab[0].en + ' = ' + vocab[0].zh
      });
      if (vocab.length >= 2) {
        var target = upper || lower || vocab[0].en.charAt(0);
        items.push({
          kind: 'circleSpell',
          pool: vocab.map(function(v){return v.en;}),
          target: target,
          _answer: '圈出 ' + target + ': 總共 ' + vocab.join(',').split('').filter(function(ch){return ch.toLowerCase()===target.toLowerCase();}).length + ' 個'
        });
      }
      items.push({
        kind: 'connect',
        left: vocab.map(function(v){return v.en;}),
        right: vocab.map(function(v){return v.zh;}),
        _answer: '配對：' + vocab.map(function(v){return v.en+'＝'+v.zh;}).join('／')
      });
    }
    return items;
  }

  function buildQuestion(item, idx) {
    var kind = item.kind || 'text';
    var label = item.label || ('題 ' + (idx + 1));
    var q = '<div class="ws-q"><div class="ws-qlabel">' + esc(label) +
            (item.hint ? '　<span class="ws-qhint">' + esc(item.hint) + '</span>' : '') +
            '</div>';

    if (kind === 'traceAA') {
      q += '<table class="ws-trace-table"><tr>' +
           '<td class="ws-trace-cell"><div class="ws-trace-cell-cap">大寫＝' + esc(item.upper||'') + '</div>' + fourLine(item.upper) + '</td>' +
           '<td class="ws-trace-cell"><div class="ws-trace-cell-cap">小寫＝' + esc(item.lower||'') + '</div>' + fourLine(item.lower) + '</td>' +
           '</tr></table>';
    } else if (kind === 'trace') {
      q += fourLine(item.letter || item.glyph || '');
    } else if (kind === 'color') {
      q += '<div class="ws-color-cell">' + bigOutline(item.glyph) +
           '<div class="ws-color-label">' + esc(item.glyphLabel || item.glyph) + '</div></div>';
    } else if (kind === 'circleSpell') {
      var pool = item.pool || [];
      var target = item.target || '';
      var inner = pool.map(function(w){
        var parts = [];
        for (var i=0;i<w.length;i++){
          var ch = w[i];
          if (ch.toLowerCase() === target.toLowerCase()){
            parts.push('<span class="ws-circle">' + esc(ch) + '</span>');
          } else {
            parts.push(esc(ch));
          }
        }
        return '<span class="ws-word-block">' + parts.join('') + '</span>';
      }).join('');
      q += '<div class="ws-pool">' + inner + '</div>';
    } else if (kind === 'connect') {
      q += linesMatch(item.left || [], item.right || []);
    } else {
      q += '<div>' + esc(item.text || '') + '</div>';
    }
    if (item._answer) {
      q += '<div class="ws-answers">💡 教師版答案：' + esc(item._answer) + '</div>';
    }
    q += '</div>';
    return q;
  }

  function build(module, lesson, opts) {
    opts = opts || {};
    var body = '';
    body += '<h2 class="ws-mod">📚 模組：' + esc(module.title) + '　／　' + esc(lesson.title) + '</h2>';
    var sourceItems = (lesson.items && lesson.items.length) ? lesson.items : autoBuildItems(module, lesson);
    sourceItems.forEach(function (it, idx) { body += buildQuestion(it, idx); });
    var html = toHtml(body, lesson.title || '英文學習單');
    var answers = html.replace(/class="ws-answers"/g, 'class="ws-answers ws-on"');
    return { html: html, answers: answers };
  }

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
      '.ws-mod{margin:0 0 10px;font-size:16px;color:#3e2723;}' +
      '.ws-q{break-inside:avoid;margin:14px 0;padding:10px 12px;background:#fffdf3;border:1px dashed #d7ccc8;border-radius:10px;}' +
      '.ws-qlabel{font-weight:bold;color:#c05621;margin-bottom:8px;font-size:1.05rem;}' +
      '.ws-qhint{color:#888;font-weight:normal;font-size:.95rem;}' +
      '.ws-trace-table{border-collapse:collapse;width:100%;}' +
      '.ws-trace-cell{padding:6px 8px;border:1px solid #eee;background:#fffdf3;vertical-align:top;text-align:center;}' +
      '.ws-trace-cell-cap{font-weight:bold;color:#5d4037;margin-bottom:4px;}' +
      '.ws-trace{display:inline-block;margin:4px 0;}' +
      '.ws-trace-grid{display:inline-flex;gap:0;align-items:center;}' +
      '.ws-trace-svg{display:inline-block;background:#fff;border:1px solid #eee;width:80px;height:97px;}' +
      '.ws-trace-tiny{font:12px sans-serif;color:#888;margin-top:6px;}' +
      '.ws-match-row{display:flex;align-items:center;gap:8px;margin:6px 0;}' +
      '.ws-match-left{flex:0 0 32%;text-align:right;font-weight:bold;background:#fff;border:1px solid #eee;padding:6px 10px;border-radius:6px;}' +
      '.ws-match-mid{flex:1;text-align:center;color:#888;letter-spacing:2px;}' +
      '.ws-match-right{flex:0 0 32%;font-weight:bold;background:#fff;border:1px solid #eee;padding:6px 10px;border-radius:6px;}' +
      '.ws-color-cell{display:inline-block;margin:6px;text-align:center;}' +
      '.ws-color-label{font-size:.9rem;color:#5b6e7d;margin-top:2px;font-weight:bold;}' +
      '.ws-pool{line-height:2.4;font-size:1.25rem;font-weight:700;letter-spacing:1px;}' +
      '.ws-word-block{display:inline-block;margin:6px 14px 6px 0;}' +
      '.ws-circle{border:2.5px solid #c05621;border-radius:50%;padding:0 3px;margin:0 1px;color:#c05621;}' +
      '.ws-answers{background:#fff8e1;border:1px dashed #fbc02d;padding:6px 10px;border-radius:6px;margin-top:6px;display:none;font-weight:bold;}' +
      '.ws-on{display:block;}' +
      '</style></head><body><div class="ws-sheet">' +
      '<div class="ws-hd"><h1>📘 ' + esc(title) + '</h1><div class="ws-name">姓名 <input type="text" placeholder="________">　班級 <input type="text" style="width:60px" placeholder="_____"></div></div>' +
      body +
      '</div></body></html>';
  }

  SHEET.fourLine = fourLine;
  SHEET.bigOutline = bigOutline;
  SHEET.linesMatch = linesMatch;
  SHEET.autoBuildItems = autoBuildItems;
  SHEET.buildQuestion = buildQuestion;
  SHEET.build = build;
  SHEET.toHtml = toHtml;

  SHEET.open = function (module, lesson, mode) {
    var win = window.open('', '_blank');
    if (!win) { alert('請允許彈出視窗'); return; }
    var b = build(module, lesson);
    win.document.open();
    win.document.write((mode === 'answers' ? b.answers : b.html));
    win.document.close();
    return win;
  };

  SHEET.showAnswers = function (module, lesson, box) {
    if (box) {
      var b = build(module, lesson);
      box.innerHTML = b.answers;
      box.style.display = 'block';
    } else if (window.open) {
      var win2 = window.open('', '_blank');
      if (!win2) return;
      var b2 = build(module, lesson);
      win2.document.open();
      win2.document.write(b2.answers);
      win2.document.close();
    }
  };
})();
