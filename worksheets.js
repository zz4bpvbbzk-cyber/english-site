// worksheets.js — 為 95 堂課產出真正的「學習單」內容（HTML 格式）
// 用法：Worksheets.build(module, lesson) → 回傳 { html, answers }
// lesson.html 透過「🧾 一鍵生成學習單」按鈕呼叫

(function () {
  'use strict';

  // ====== 通用工具 ======
  function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ─────────────────────────────────────────────────────────
  // 四線格書寫格（G1 字母描寫用）
  // 設計（強制數學）：
  //   viewBox 140×170
  //   - 天花板 (sky)  y=18
  //   - 中線  (mid)   y=80 (dashed)
  //   - 底線  (base)  y=140
  //   - 額外 descender 區至 y=170
  //
  //   字母 baseline（alphabetic）= y=140；Arial 的 cap-height ≈ fontSize×0.716，
  //   x-height ≈ fontSize×0.522，descender ≈ fontSize×0.215。
  //
  //   - 大寫 / ascenders (b,d,f,h,k,l,t) ：fontSize=170
  //       cap_top = 140 − 0.716×170 = 140 − 121.7 = 18.3  ↔ ceiling y=18 ✅ 碰天花板
  //   - 一般小寫 a,c,e,m,n,o,s,u,v,w,x,z ：fontSize=110
  //       x_top   = 140 − 0.522×110 = 140 − 57.4 = 82.6  ↔ mid y=80     ✅ 碰中線
  //   - descenders g,j,p,q,y ：fontSize=110
  //       x_top   = 82.6  ↔ mid y=80     ✅
  //       bottom  = 140 + 0.215×110 = 140 + 23.6 = 163.6  < viewBox 170  ✅ 不裁切
  //
  //   結論：所有筆畫都會真實碰線，descender 不會超出 viewBox。
  // ─────────────────────────────────────────────────────────
  function fourLine(letter) {
    var L = String(letter == null ? '' : letter);
    if (!L) return '';
    var ascenders  = /[bdfhkltBDFHKLT]/;
    var descenders = /[gjpqyjGJPQYJ]/;
    var isUpper = L >= 'A' && L <= 'Z';
    var fontSize, baselineY = 140;
    if (ascenders.test(L) || isUpper) fontSize = 170;
    else                              fontSize = 110;  // 含一般小寫 + descenders
    function slot(traced) {
      var lines =
        '<line x1="8" y1="18" x2="132" y2="18" stroke="#1976d2" stroke-width="1.4"/>' +
        '<line x1="8" y1="80" x2="132" y2="80" stroke="#1976d2" stroke-width="1.2" stroke-dasharray="5 4"/>' +
        '<line x1="8" y1="140" x2="132" y2="140" stroke="#1976d2" stroke-width="1.4"/>';
      var glyph = traced
        ? '<text x="70" y="' + baselineY + '" text-anchor="middle" dominant-baseline="alphabetic" ' +
            'font-size="' + fontSize + '" font-family="Arial Black, Arial, sans-serif" font-weight="900" ' +
            'fill="none" stroke="#e53935" stroke-width="3.6" stroke-dasharray="6 4" ' +
            'stroke-linecap="round" stroke-linejoin="round">' + esc(L) + '</text>'
        : '';
      return '<svg viewBox="0 0 140 170" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" class="ws-trace-svg' + (traced ? '' : ' ws-blank') + '">' + lines + glyph + '</svg>';
    }
    return '<div class="ws-trace">' +
      '<div class="ws-trace-grid">' +
        slot(true) +            // 模型格（紅虛線描寫）
        slot(false) + slot(false) + slot(false) +  // 3 個空白格
      '</div>' +
      '<div class="ws-trace-tiny">▲ 天花板線（ascender 碰這） &nbsp; ▬▬▬ 中線（x-height 碰這） &nbsp; ▼ 底線（baseline）　→ 描紅之後，自己再寫 3 次</div>' +
    '</div>';
  }

  // ─────────────────────────────────────────────────────────
  // 大字塗色框（G2 字族 / 字母塗色用）
  // 設計：自動 scale-to-fit，glyph 必定不超出 viewBox。
  // - viewBox 240×240，可用寬度 ≈ height ≈ 220（含邊界）
  // - 大寫 fontSize=180（1 個字母），cap-height ≈ 130 → 頂端 y=18（剛碰頂線）
  // - 2 個字母 fontSize=120、3 個字母 fontSize=88（保守縮放，預留 0.62 × 字數 × fontSize 寬度）
  // ─────────────────────────────────────────────────────────
  function bigOutline(glyph) {
    var G = String(glyph == null ? '' : glyph);
    if (!G) return '';
    var isEmoji = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{1F300}-\u{1F9FF}]/u.test(G);
    var segments = Array.from(G);
    var n = segments.length;
    var fontSize;
    if (isEmoji) fontSize = 110;
    else if (n === 1) fontSize = 180;
    else if (n === 2) fontSize = 120;
    else if (n === 3) fontSize = 86;
    else if (n === 4) fontSize = 66;
    else fontSize = Math.max(40, Math.floor(220 / (n * 0.62)));

    var baselineY = 208;   // 字母底部對齊 baseline 線
    var topY = 22, midY = 116, botY = 210;
    var lines =
      '<line x1="6" y1="' + topY + '" x2="234" y2="' + topY + '" stroke="#90a4ae" stroke-width="0.9"/>' +
      '<line x1="6" y1="' + midY + '" x2="234" y2="' + midY + '" stroke="#90a4ae" stroke-width="0.9" stroke-dasharray="4 3"/>' +
      '<line x1="6" y1="' + botY + '" x2="234" y2="' + botY + '" stroke="#90a4ae" stroke-width="0.9"/>';
    var text =
      '<text x="120" y="' + baselineY + '" text-anchor="middle" dominant-baseline="alphabetic" ' +
      'font-size="' + fontSize + '" ' +
      'font-family="Comic Sans MS, Arial, sans-serif" font-weight="900" ' +
      'fill="none" stroke="#222" stroke-width="4" stroke-linejoin="round">' + esc(G) + '</text>';
    var hint = '<text x="120" y="14" text-anchor="middle" font-size="11" fill="#888">（用彩色筆塗顏色）</text>';
    return '<div class="ws-color">' +
      '<svg viewBox="0 0 240 240" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
        lines + text + hint +
      '</svg></div>';
  }

  // ─────────────────────────────────────────────────────────
  // 連連看：左 items 右 items，中間留連線區
  // ─────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────
  // 圈一圈：放 items（單字／圖示），每個旁邊畫一個大圈圈讓學生圈選
  // ─────────────────────────────────────────────────────────
  function circleChoice(items, hint) {
    var out = '<div class="ws-circles">';
    if (hint) out += '<div class="ws-hint">💡 ' + esc(hint) + '</div>';
    for (var i = 0; i < items.length; i++) {
      out += '<span class="ws-circle-item">' +
        '<span class="ws-bubble"></span>' +
        '<span class="ws-word">' + esc(items[i]) + '</span>' +
      '</span>';
    }
    out += '</div>';
    return out;
  }

  // ─────────────────────────────────────────────────────────
  // 塗色：把 items 每個包進 ws-color-cell（給大畫框＋單字標籤）
  // ─────────────────────────────────────────────────────────
  function coloring(items) {
    var out = '<div class="ws-coloring">';
    for (var i = 0; i < items.length; i++) {
      out += '<div class="ws-color-cell">' +
        bigOutline(items[i]) +
        '<div class="ws-color-label">' + esc(items[i]) + '</div>' +
      '</div>';
    }
    out += '</div>';
    return out;
  }

  // ====== 學習單組裝工具 ======
  function pageTitle(l, m) {
    return '<div class="ws-pagetitle">🍎 ' + esc(m.grade) + ' ' + esc(m.semester) +
      ' ｜ <b>' + esc(l.no) + esc(l.title) + '</b>' +
      (l.tag ? '（' + esc(l.tag) + '）' : '') + '</div>';
  }

  function objectives(l) {
    if (!l.objectives || !l.objectives.length) return '';
    var out = '<div class="ws-objectives"><b>★ 學習目標：</b><ul>';
    for (var i = 0; i < l.objectives.length; i++) {
      out += '<li>☐ ' + esc(l.objectives[i]) + '</li>';
    }
    return out + '</ul></div>';
  }

  function focusLine(l) {
    return '<div class="ws-focus">📍 重點：' + esc(l.focus || '') + '</div>';
  }

  function question(label, html) {
    return '<div class="ws-q"><div class="ws-qlabel">' + esc(label) + '</div>' + html + '</div>';
  }

  // ====== 樣板：Letter A–Z (G1) ======
  function tplLetter(l, m) {
    var mLetterTitle = l.title.match(/Letter ([A-Z])/);
    if (!mLetterTitle) return null;
    var L = mLetterTitle[1];
    var small = L.toLowerCase();
    var words = (l.main && l.main.vocab || []).map(function (v) { return v.en; });
    var meanings = (l.main && l.main.vocab || []).map(function (v) { return v.zh; });
    var chant = (l.main && l.main.chant) || '';

    var html = '';
    html += pageTitle(l, m);
    html += focusLine(l);
    html += objectives(l);

    // A. 大寫描寫 — 1 紅虛線模型 + 3 空白（虛線不會變成空心字）
    html += question('A. 大寫描寫：先描紅虛線字母，再自己寫 3 次', fourLine(L));

    // B. 小寫描寫
    html += question('B. 小寫描寫：注意起筆位置，小 a 像一個蘋果', fourLine(small));

    // C. 圈出含有 L / small 的單字
    var distractor = ['🐱 Cat','🚪 Door','🍌 Ball','🌳 Tree'];
    var targetWords = words.slice(0, 3);
    var allCards = targetWords.concat(distractor);
    html += question('C. 圈出含有「' + L + '」或「' + small + '」的圖（請在泡泡上畫圈）',
      circleChoice(allCards, '看到以這個字母開頭的就圈起來'));

    // D. 給兩個字母塗顏色（字母 word family 也走單字母塗色，不會切）
    html += question('D. 給大字母 ' + L + ' ' + small + ' 塗上你喜歡的顏色',
      coloring([L, small]));

    // E. 連連看
    if (meanings.length >= 2) {
      var leftImgs = words.slice(0, meanings.length).map(function(w, i){ return w + ' (' + meanings[i] + ')'; });
      html += question('E. 連連看：把英文和中文意思拉線配對',
        linesMatch(leftImgs, meanings.slice()));
    }

    // F. 自由畫
    html += question('F. 🎨 自由畫：畫 3 個以 ' + L + ' 開頭的東西（蘋果、鱷魚⋯）', '<div class="ws-drawbox"></div>');

    // G. 回家口說 + 家長簽名
    html += question('G. 回家作業：唸三次 chant（' + esc(chant) + '），請家長簽名',
      '<div class="ws-sign">家長簽名：__________ &nbsp;&nbsp; ☐ 唸過 1 次  ☐ 唸過 3 次</div>');

    return {
      html: html,
      answers: {
        match: 'C 圈出 apple / ant / alligator；E 連連看 apple↔蘋果、ant↔螞蟻、alligator↔鱷魚',
        words: words,
        chantStart: L
      }
    };
  }

  // ====== 樣板：複習 (G1/G2) ======
  function tplReview(l, m, kind) {
    var html = pageTitle(l, m) + focusLine(l) + objectives(l);
    if (kind === 'size') {
      html += question('A. 大小寫連連看：左邊大寫要配哪個小寫？',
        linesMatch(['A','C','E','M','H'], ['c','h','m','e','a']));
      html += question('B. 給五個大字母上顏色', coloring(['A','B','C','D','E']));
    } else if (kind === 'sound') {
      html += question('A. 聽聲音，圈出正確的字母',
        circleChoice(['A','B','C','D','E'], '老師唸一個音，請圈出來'));
      html += question('B. 給你的最愛字母上色', coloring(['Aa','Bb','Cc']));
    } else if (kind === 'word') {
      html += question('A. 看圖圈單字（老師口述）',
        circleChoice(['🍎 apple','🍌 banana','🐱 cat'], '聽到哪個就圈起來'));
      html += question('B. 把蘋果塗紅、香蕉塗黃', coloring(['🍎','🍌']));
    } else if (kind === 'ab' || kind === 'nano') {
      html += question('A. 字母表連連看（A–Z 大小寫）',
        linesMatch(['A','C','E','G','I','M','O','S','W','Y'], ['w','s','o','m','i','g','e','c','a','y']));
      html += question('B. 塗你的幸運字母', coloring(['A','Z']));
    }
    html += question('C. 🎨 自由畫：畫你最喜歡的英文字母', '<div class="ws-drawbox"></div>');
    return { html: html, answers: { hint: '依課堂為準' } };
  }

  // ====== 樣板：Phonics Intro ======
  function tplPhonicsIntro(l, m) {
    var html = pageTitle(l, m) + focusLine(l) + objectives(l);
    if (l.id === 'intro') {
      html += question('A. 用手指比出 26 個字母，一邊唱 ABC 歌',
        '<div class="ws-drawbox" style="height:60px"></div>');
      html += question('B. 圈出今天學到的打招呼詞',
        circleChoice(['Hello👋','Thank you🙏','Goodbye👋','I don\'t know🤷'], '看到你會的打招呼詞就圈'));
      html += question('C. 給 Hello 上顏色', coloring(['👋','😊']));
    } else if (l.id === 'g2a1') {
      html += question('A. 聽老師唸的音，圈出對應的字母',
        circleChoice(['a','e','i','o','u'], '母音：張大嘴或小圓'));
      html += question('B. 給五個母音上不同顏色', coloring(['a','e','i','o','u']));
    } else if (l.id === 'g2a2') {
      html += question('A. 補上缺的母音（圈出 5 個，然後唸出來）',
        circleChoice(['c_t','p_g','b_g','m_p','h_t'], '補上中間的母音'));
      html += question('B. 塗最簡單的 cvc 單字', coloring(['cat','pig']));
    }
    return { html: html, answers: { g2a1: { 'cat':'c-a-t', 'pig':'p-i-g', 'bag':'b-a-g', 'map':'m-a-p', 'hat':'h-a-t', 'pen':'p-e-n', 'bed':'b-e-d', 'red':'r-e-d' } } };
  }

  // ====== 樣板：字族 ======
  function tplFamily(l, m, family) {
    var words = (l.main && l.main.vocab || []).map(function (v) { return v.en; });
    var meanings = (l.main && l.main.vocab || []).map(function (v) { return v.zh; });
    var onsetsSet = [];
    for (var i = 0; i < words.length; i++) {
      onsetsSet.push(words[i].slice(0, words[i].length - family.length));
    }
    var onsets = Array.from(new Set(onsetsSet));
    var chant = (l.main && l.main.chant) || '';

    var html = pageTitle(l, m) + focusLine(l) + objectives(l);

    html += question('A. 連連看：左邊字首要配右邊哪個字族 ' + family + '？',
      linesMatch(onsets, [family, family, family, family, family].slice(0, onsets.length)));

    var distractors = ['sun','can','dot','bed','pit'];
    html += question('B. 圈出 ' + family + ' 家族的單字',
      circleChoice(words.concat(distractors), '看到字尾是 ' + family + ' 就圈'));

    if (words.length) html += question('C. 給 ' + family + ' 系列單字塗顏色',
      coloring(words.slice(0, 4)));

    if (meanings.length >= 2) {
      html += question('D. 連連看單字和中文', linesMatch(words, meanings));
    }

    html += question('E. 🎨 畫一幅圖，至少 2 個 ' + family + ' 單字出現在圖裡', '<div class="ws-drawbox"></div>');

    return { html: html, answers: { words: words, onsets: onsets, distractors: distractors } };
  }

  function tplFamilyReview(l, m, families) {
    var html = pageTitle(l, m) + focusLine(l);
    html += question('A. 連連看：哪個字族配哪個字首？',
      linesMatch(['b','h','m','c','p'], families.concat(families).slice(0, 5)));
    html += question('B. 圈出今天聽到的字族單字',
      circleChoice(['cat','pen','got','man','pig','log','cap','pan','mat','top','nap'],
        '每個字家族都要圈到至少一個'));
    html += question('C. 🎨 給你最愛的字族上顏色', coloring(families.slice(0, 4)));
    return { html: html, answers: { hint: families.length + ' families' } };
  }

  function tplDigraph(l, m, digraph) {
    var words = (l.main && l.main.vocab || []).map(function (v) { return v.en; });
    var meanings = (l.main && l.main.vocab || []).map(function (v) { return v.zh; });
    var html = pageTitle(l, m) + focusLine(l);

    html += question('A. 在單字中圈出 ' + digraph + '（兩個字母要一起圈）',
      circleChoice(words, '看到 ' + digraph + ' 兩個字母相連就圈'));
    html += question('B. 連連看英文和中文', linesMatch(words, meanings));
    html += question('C. 給 ' + digraph + ' 第一個單字塗顏色', coloring([words[0] || digraph]));
    html += question('D. 🎨 畫一個含 ' + digraph + ' 的東西', '<div class="ws-drawbox"></div>');

    return { html: html, answers: { words: words, digraph: digraph } };
  }

  function tplMagicE(l, m) {
    var words = (l.main && l.main.vocab || []).map(function (v) { return v.en; });
    var html = pageTitle(l, m) + focusLine(l);

    html += question('A. 圈出長音 a_e 字族',
      circleChoice(['cake','lake','make','name','cap','map','tap','mad'], '看到中間 a 後面有 e 就圈'));
    html += question('B. 連連看：短音變長音（加個 e）',
      linesMatch(['cap → cape','mad → made','pin → pine'], ['','','']));
    html += question('C. 給 a_e 系列塗顏色', coloring(words.slice(0, 3)));
    html += question('D. 🎨 畫 cake、lake 任一個', '<div class="ws-drawbox"></div>');

    return { html: html, answers: { words: words, pairs: { 'cap':'cape', 'mad':'made', 'pin':'pine' } } };
  }

  function tplVowelTeam(l, m) {
    var words = (l.main && l.main.vocab || []).map(function (v) { return v.en; });
    var html = pageTitle(l, m) + focusLine(l);

    html += question('A. 圈出有母音搭檔的單字',
      circleChoice(words.concat(['cat','pen','dog','sun']), '看到 ai / ay / oa / ow / ee / ea 就圈'));
    if (words.length >= 2) html += question('B. 連連看英文和拼讀',
      linesMatch(words.slice(0, 4), words.slice(0, 4).map(function(w){ return '/' + w + '/'; })));
    html += question('C. 給母音搭檔單字塗顏色', coloring(words.slice(0, 3)));
    html += question('D. 🎨 畫一個母音搭檔的場景', '<div class="ws-drawbox"></div>');

    return { html: html, answers: { words: words } };
  }

  function tplLongReview(l, m) {
    var html = pageTitle(l, m) + focusLine(l);
    html += question('A. 圈出長母音單字',
      circleChoice(['cat','cake','kit','kite','cub','cube','rok','robe','tap','tape'],
        '看到母音變「長長的」就圈'));
    html += question('B. 連連看：短音變長音',
      linesMatch(['kit →','cub →','rok →','tap →'], ['kite','cube','robe','tape']));
    html += question('C. 給五個長母音各塗一個顏色', coloring(['a_e','ee','i_e','o_e','u_e']));
    html += question('D. 🎨 畫你最愛的長母音場景', '<div class="ws-drawbox"></div>');
    return { html: html, answers: { transforms: { 'kit':'kite','cub':'cube','rok':'robe','tap':'tape' } } };
  }

  function tplBossyR(l, m) {
    var words = (l.main && l.main.vocab || []).map(function (v) { return v.en; });
    var html = pageTitle(l, m) + focusLine(l);
    html += question('A. 圈出含 er / ir / ur 的單字',
      circleChoice(['her','bird','fur','girl','run','car','dog','sir'],
        '看到 r 後面沒母音的，整個一起唸'));
    html += question('B. 連連看單字和分類', linesMatch(words.slice(0, 3), ['er','ir','ur']));
    html += question('C. 給 bossy r 單字塗色', coloring(words.slice(0, 3)));
    return { html: html, answers: { words: words } };
  }

  function tplIXID(l, m) {
    var words = (l.main && l.main.vocab || []).map(function (v) { return v.en; });
    var html = pageTitle(l, m) + focusLine(l);
    html += question('A. 圈出結尾是 -ix 或 -id 的單字',
      circleChoice(['six','mix','lid','kid','did','fit','cab','box'], '看到結尾是 ix 或 id 就圈'));
    html += question('B. 連連看', linesMatch(words, ['六','混合','蓋子','小孩']));
    html += question('C. 給 ix / id 塗色', coloring(['ix','id']));
    return { html: html, answers: { words: words } };
  }

  function tplVPE(l, m) {
    var words = (l.main && l.main.vocab || []).map(function (v) { return v.en; });
    var html = pageTitle(l, m) + focusLine(l);
    html += question('A. 圈出 -ave 字族',
      circleChoice(['cave','wave','save','brave','have','live','give','love'],
        '看到結尾 ave 就圈'));
    html += question('B. 連連看', linesMatch(words.slice(0,3), ['洞穴','海浪','拯救']));
    html += question('C. 🎨 畫海裡的 wave', '<div class="ws-drawbox"></div>');
    return { html: html, answers: { words: words } };
  }

  function tplBlend(l, m) {
    var words = (l.main && l.main.vocab || []).map(function (v) { return v.en; });
    var end = (l.tag || '').replace(/^\-/, '');
    var html = pageTitle(l, m) + focusLine(l);
    html += question('A. 圈出字尾 ' + end + ' 的單字',
      circleChoice(words.concat(['run','sit','pen','man','top','cat']), '看到結尾 ' + end + ' 就圈'));
    html += question('B. 連連看拆音', linesMatch(['han-d','kin-g'], ['hand','king']));
    html += question('C. 給 ' + end + ' 系列塗色', coloring(words.slice(0, 3)));
    return { html: html, answers: { words: words, end: end } };
  }

  function tplPractice(l, m, kind) {
    var html = pageTitle(l, m) + focusLine(l);
    if (kind === 'anam') {
      html += question('A. 連連看：哪個是 -an、哪個是 -am？',
        linesMatch(['can','jam','man','ham','pan','ram','fan','yam'], ['-an','-am','-an','-am','-an','-am','-an','-am']));
    } else if (kind === 'initial') {
      html += question('A. 聽老師唸，圈出字首',
        circleChoice(['_at','_un','_ig','_ot'], '補上缺的字首'));
      html += question('B. 塗你最會的字首', coloring(['b','c','f','m']));
    } else if (kind === 'final') {
      html += question('A. 圈出字尾',
        circleChoice(['ra_','ri_','ro_','ru_','ba_','bi_','bo_','bu_'], '補上缺的字尾'));
    } else if (kind === 'rhyme') {
      html += question('A. 把押韻的連起來', linesMatch(['cat','fun','rug'], ['hat','sun','bug']));
    } else if (kind === 'blend') {
      html += question('A. 三個音拼成單字（圈出答案）',
        circleChoice(['cat','pig','map','bug','run','fish'], '聽老師唸選一個'));
      html += question('B. 給 cvc 單字塗色', coloring(['cat','pig','map']));
    } else if (kind === 'reader') {
      html += question('A. 圈出正確的字',
        circleChoice(['The cat is on the mat.','I can run in the sun.','The dog sat on the log.'],
          '哪一句你看過？'));
    } else if (kind === 'spell') {
      html += question('A. 拼字小測（老師唸）— 把聽到的寫在旁邊',
        circleChoice(['cat','dog','sun','pen','pig'], '選一個圈，再自己旁邊寫一次'));
    } else if (kind === 'dict') {
      html += question('A. 聽音寫字（小空格旁有圈圈，提示要寫）',
        circleChoice(['1.','2.','3.','4.','5.'], '聽一個寫一個'));
    } else if (kind === 'cvc') {
      html += question('A. 圈出缺的母音（圈出來後唸一次）',
        circleChoice(['c_t','b_g','h_n','p_n','m_p','p_g','s_t','l_g','d_y','r_d'],
          '選一個圈，再唸出完整單字'));
      html += question('B. 🎨 畫一個 cvc 單字的東西', '<div class="ws-drawbox"></div>');
    }
    html += question('C. 🎨 自由畫：今天最有趣的單字', '<div class="ws-drawbox"></div>');
    return { html: html, answers: { hint: '依課堂為準' } };
  }

  function tplCarnival(l, m) {
    var html = pageTitle(l, m) + focusLine(l);
    html += question('A. 圈出今天學過的字母',
      circleChoice(['A','B','C','D','E','F','G','H','I','J','K','L','M','N'], '圈 10 個你記得的'));
    html += question('B. 🎨 大塗鴉區：畫你最愛的英文字母', coloring(['Aa','Bb','Cc','Dd']));
    return { html: html, answers: { hint: '自由作答' } };
  }

  function tplFinal(l, m) {
    var html = pageTitle(l, m) + focusLine(l);
    html += question('A. 圈出今天最愛的字族',
      circleChoice(['cat','bat','mat','hat','rat','fat'], '全部圈起來！'));
    html += question('B. 給大字母塗色', coloring(['A','Z','a','z']));
    html += question('C. 🎨 自由畫：今天學到什麼', '<div class="ws-drawbox"></div>');
    return { html: html, answers: { hint: '自由作答' } };
  }

  // ====== 路由 ======
  function route(m, l) {
    var id = l.id;
    if (/^[a-z]$/.test(id) && l.title.startsWith('Letter ')) return tplLetter(l, m);
    if (['intro','g2a1','g2a2'].indexOf(id) >= 0) return tplPhonicsIntro(l, m);
    if (/^r[1-5]$/.test(id) && (m.id === 'g1a' || m.id === 'g1b')) {
      var kind = (id === 'r1' || id === 'r3') ? 'size'
                : (id === 'r4') ? 'sound'
                : (id === 'r5') ? 'word' : 'size';
      return tplReview(l, m, kind);
    }
    if (id === 'r6' && (m.id === 'g1a' || m.id === 'g1b')) return tplReview(l, m, 'nano');
    if (id === 'r7' && m.id === 'g1b') return tplReview(l, m, 'ab');

    if (m.id === 'g2a' || m.id === 'g2b') {
      if (/^(arev|erev|irev|orev|urev)$/.test(id)) {
        var fams = {
          'arev':['-at','-an','-am','-ad','-ap','-ag'],
          'erev':['-en','-et','-ed','-eg'],
          'irev':['-ig','-in','-ip','-it'],
          'orev':['-og','-op','-ot','-ob'],
          'urev':['-ug','-un','-ut','-ub']
        }[id];
        return tplFamilyReview(l, m, fams);
      }
      if (id === 'g2a_ch' || id === 'g2a_sh' ||
          id === 'g2b_th' || id === 'g2b_wh' || id === 'g2b_ph') {
        var dmap = { 'g2a_ch':'ch', 'g2a_sh':'sh', 'g2b_th':'th', 'g2b_wh':'wh', 'g2b_ph':'ph' };
        return tplDigraph(l, m, dmap[id]);
      }
      var ofam = {'at':'-at','an':'-an','am':'-am','ad':'-ad','ap':'-ap','ag':'-ag',
                  'en':'-en','et':'-et','ed':'-ed','eg':'-eg',
                  'ig':'-ig','in':'-in','ip':'-ip','it':'-it',
                  'og':'-og','op':'-op','ot':'-ot','ob':'-ob',
                  'ug':'-ug','un':'-un','ut':'-ut','ub':'-ub',
                  'g2b_um':'-um'};
      if (ofam[id]) return tplFamily(l, m, ofam[id]);
      if (id === 'g2b_ave') return tplVPE(l, m);
      if (id === 'g2b_magice') return tplMagicE(l, m);
      if (id === 'g2b_eeea' || id === 'g2b_teams') return tplVowelTeam(l, m);
      if (id === 'g2a_ixid') return tplIXID(l, m);
      if (id === 'g2b_nd' || id === 'g2b_ing') return tplBlend(l, m);
      if (id === 'g2b_r') return tplBossyR(l, m);
      if (id === 'g2b_longrev') return tplLongReview(l, m);
      var pmap = {'anam':'anam','initial':'initial','final':'final','rhyme':'rhyme','blend':'blend',
                  'reader':'reader','spell':'spell','dict':'dict','cvc':'cvc'};
      if (pmap[id]) return tplPractice(l, m, pmap[id]);
      if (id === 'g2afinal') return tplFinal(l, m);
      if (id === 'g2bfinal') return tplFinal(l, m);
    }
    return { html: pageTitle(l, m) + focusLine(l) + '<div class="ws-drawbox"></div>', answers: { hint: '自由作答' } };
  }

  // ====== 把內容轉成可列印頁面（A4 列印樣式重點：頁邊 12mm、列印時不留超出版面）======
  function toHtml(bodyHtml, title) {
    var css =
      'body{font-family:"Microsoft JhengHei","PingFang TC","Noto Sans TC",sans-serif;max-width:780px;margin:18px auto;color:#222;padding:0 16px;background:#fffceb;}' +
      'h1{color:#ff7043;border-bottom:3px solid #ffd166;padding-bottom:8px;font-size:1.4rem;margin:0 0 14px 0;}' +
      '.print-btn{position:fixed;top:12px;right:12px;background:#ff7043;color:#fff;padding:10px 18px;border-radius:10px;border:none;font-size:1rem;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.15);z-index:99;}' +
      '.print-btn:hover{background:#ff5722;}' +
      '.ws-pagetitle{font-size:1.1rem;margin:4px 0 6px 0;}' +
      '.ws-focus{background:#fff8ef;border-left:4px solid #ffb74d;padding:8px 12px;margin:6px 0 12px 0;border-radius:0 8px 8px 0;}' +
      '.ws-objectives{background:#fff;padding:8px 12px;border-radius:8px;margin-bottom:10px;}' +
      '.ws-objectives ul{margin:6px 0 0 0;padding-left:22px;}' +
      '.ws-objectives li{margin:4px 0;font-size:1rem;}' +
      '.ws-q{border:1px dashed #ffd1aa;background:#fff;padding:12px 14px;border-radius:12px;margin:14px 0;overflow:hidden;}' +
      '.ws-qlabel{font-weight:bold;color:#c05621;margin-bottom:8px;font-size:1.05rem;}' +
      // 四線描寫格
      '.ws-trace{display:flex;align-items:center;gap:18px;flex-wrap:wrap;}' +
      '.ws-trace-grid{display:flex;gap:14px;}' +
      '.ws-trace-svg{width:88px;height:108px;background:#fffdf6;border:1px solid #eee;border-radius:6px;display:inline-block;}' +
      '.ws-trace-svg.ws-blank{background:#fffbea;}' +
      // viewBox 140×170 → 寬高比 14:17，CSS 用 aspect-ratio 同步防止拉伸
      '.ws-trace-svg, .ws-trace-svg svg{aspect-ratio:140/170;}' +
      '.ws-trace-tiny{font-size:0.78rem;color:#5b6e7d;margin-top:6px;}' +
      // 圈選
      '.ws-circles{display:flex;flex-wrap:wrap;gap:12px 16px;align-items:center;}' +
      '.ws-circle-item{display:inline-flex;align-items:center;gap:6px;background:#fff;padding:8px 10px;border-radius:10px;border:1px solid #eee;}' +
      '.ws-bubble{display:inline-block;width:34px;height:34px;border:2.5px solid #333;border-radius:50%;background:#fff;}' +
      '.ws-word{font-size:1.1rem;font-weight:bold;}' +
      '.ws-hint{font-size:0.9rem;color:#5b6e7d;width:100%;margin-bottom:4px;}' +
      // 連連看
      '.ws-match{display:flex;flex-direction:column;gap:10px;}' +
      '.ws-match-row{display:flex;align-items:center;gap:14px;font-size:1.05rem;}' +
      '.ws-match-left{flex:0 0 32%;text-align:right;font-weight:bold;background:#fff;border:1px solid #eee;padding:8px 10px;border-radius:8px;}' +
      '.ws-match-mid{flex:1;color:#888;letter-spacing:1px;font-family:monospace;}' +
      '.ws-match-right{flex:0 0 32%;text-align:left;background:#fff;border:1px solid #eee;padding:8px 10px;border-radius:8px;}' +
      // 塗色
      '.ws-coloring{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start;}' +
      '.ws-color-cell{display:flex;flex-direction:column;align-items:center;background:#fff;border-radius:12px;padding:6px;border:1px solid #eee;min-width:140px;}' +
      '.ws-color-cell .ws-color-label{font-size:1rem;color:#5b6e7d;margin-top:2px;font-weight:bold;}' +
      '.ws-color{display:inline-block;width:130px;height:130px;background:#fff;}' +
      '.ws-color svg{width:100%;height:100%;display:block;}' +
      // 自由繪圖區
      '.ws-drawbox{min-height:130px;background:#fffbea;border:2px dashed #90a4ae;border-radius:12px;}' +
      // 簽名
      '.ws-sign{background:#fff;padding:10px 12px;border-radius:8px;border:1px solid #eee;}' +
      // 列印（A4，邊界 12mm，塗色框／描寫格保證不切）
      '@media print{' +
        '.print-btn{display:none!important;}' +
        'body{margin:0;background:#fff;padding:0;}' +
        '.ws-q{break-inside:avoid;border-color:#888;page-break-inside:avoid;}' +
        '.ws-trace-svg,.ws-color svg{print-color-adjust:exact;-webkit-print-color-adjust:exact;}' +
        '.ws-match-mid{color:#444;}' +
        '.ws-color svg{break-inside:avoid;}' +
      '}' +
      '@page{size:A4;margin:12mm;}';

    var html =
      '<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8">' +
      '<title>' + esc(title) + ' — 學習單</title>' +
      '<style>' + css + '</style>' +
      '</head><body>' +
      '<button class="print-btn" onclick="window.print()">🖨 列印 / 存 PDF</button>' +
      '<h1>' + esc(title) + '</h1>' +
      '<div style="background:#fff;padding:10px 14px;border:1px solid #ffd1aa;border-radius:10px;margin-bottom:14px;font-size:1rem;">' +
        '👤 姓名：<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>　班級：<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>　座號：<u>&nbsp;&nbsp;&nbsp;&nbsp;</u>　日期：<u>&nbsp;&nbsp;</u>月<u>&nbsp;&nbsp;</u>日' +
      '</div>' +
      bodyHtml +
      '<div style="margin-top:14px;color:#888;font-size:0.85rem;text-align:right;">🎓 國小英語教學網 學習單</div>' +
      '</body></html>';
    return html;
  }

  function openPrintable(m, l, mode) {
    var res = route(m, l);
    var title = m.grade + ' ' + m.semester + ' — ' + l.no + '：' + l.title;
    var html = toHtml(res.html, title);
    var w = window.open('', '_blank');
    if (!w) {
      alert('瀏覽器阻擋了彈出視窗！請允許本站開新視窗。');
      return;
    }
    w.document.open(); w.document.write(html); w.document.close();
    if (mode === 'print') setTimeout(function(){ w.focus(); w.print(); }, 280);
  }

  // ====== 對外 API ======
  window.Worksheets = {
    build: function (m, l) { return route(m, l); },
    open: function (m, l, mode) { openPrintable(m, l, mode || 'preview'); },
    showAnswers: function (m, l, host) {
      var r = route(m, l);
      var txt = '📋 教師版 參考答案（此區非給學生看）\n\n' + JSON.stringify(r.answers, null, 2);
      if (host) host.textContent = txt;
      return txt;
    }
  };
})();
