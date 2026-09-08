// worksheets.js — 為 95 堂課產出真正的「學習單」內容（不是佔位字串）
// 用法：Worksheets.build(module, lesson) → 回傳 { html, answers }
// lesson.html 透過「🧾 一鍵生成學習單」按鈕呼叫

(function () {
  'use strict';

  // ====== 通用字串工具 ======
  function esc(s) { return String(s == null ? '' : s); }
  function stars(n) { return '☐ '.repeat(0) + Array.from({length:n},()=>'☐').join('　'); }
  function blanks(n) { return Array.from({length:n},()=>'＿').join(''); }
  function lines(n) { return Array.from({length:n},()=>'一、請在此書寫：________________________________\n').join(''); }

  // ====== 樣板生成器 ======
  function pageTitle(l, m) {
    return '🍎 ' + m.grade + ' ' + m.semester + ' ｜ ' + esc(l.no) + esc(l.title) + (l.tag ? '（' + esc(l.tag) + '）' : '');
  }

  function header(name) {
    return '<div>姓名：__________　班級：__________　座號：__________　日期：____月____日</div>\n<hr/>\n';
  }

  // 各類型樣板 ------------------------------

  function tplLetter(l, m) {
    const mLetterTitle = l.title.match(/Letter ([A-Z])/);
    if (!mLetterTitle) return null;
    const L = mLetterTitle[1];                       // 大寫
    const small = L.toLowerCase();                   // 小寫
    const words = (l.main && l.main.vocab || []).map(v => v.en);
    const sounds = (l.main && l.main.vocab || []).map(v => v.zh);
    const chant = (l.main && l.main.chant) || '';
    const objectives = (l.objectives || []);
    const focus = l.focus || '';

    const traceU = function() {
      let out = 'A. 大寫描寫：先描虛線、再自己寫一排\n';
      out += '   '  + L + '  '.repeat(5) + L + '\n';
      out += lines(2);
      return out;
    };
    const traceL = function() {
      let out = 'B. 小寫描寫：注意起筆位置和圓圈\n';
      out += '   ' + small + '  '.repeat(5) + small + '\n';
      out += lines(2);
      return out;
    };
    const matching = function() {
    const rows = ['🍎 Apple 🍌 Ball 🐱 Cat 🚪 Door'];
    let out = 'C. 看圖圈出「' + L + '」與「' + small + '」出現的位置：\n';
    out += '  ' + rows.join('　') + '\n';
    out += '提示：apple 有 a，ball 有 b，cat 有 c，door 有 d。\n';
    out += blanks(3);
    return out;
  };
    const writeWord = function() {
      let out = 'D. 看中文寫英文，每個單字寫 2 次：\n';
      for (let i = 0; i < words.length; i++) {
        out += '  ' + (i + 1) + '. ' + esc(sounds[i] || '') + ' ＿＿＿＿＿\n';
      }
      return out;
    };
    const chantFill = function() {
      let out = 'E. Chant 填空，寫出缺的字母：\n  ' + (chant || '') + '\n';
      out += '提示：chant 裡的第一個字母是「' + L + '」。\n';
      return out;
    };
    const challenge = function() {
      let out = 'F. 自由挑戰：寫出 3 個以 ' + L + small + ' 開頭的英文單字\n';
      out += '  1. ＿＿＿＿＿＿  2. ＿＿＿＿＿＿  3. ＿＿＿＿＿＿\n';
      return out;
    };
    const reflect = function() {
      let out = 'G. 我學到了…\n' + lines(2) + '我覺得最有趣的是…\n' + lines(2);
      return out;
    };

    return {
      html:
        header() +
        pageTitle(l, m) + '\n' +
        '📍 重點：' + esc(focus) + '\n\n' +
        '★ 學習目標：\n' +
        objectives.map(function(o){ return '  ☐ ' + esc(o); }).join('\n') + '\n\n' +
        traceU() + '\n' + traceL() + '\n' + matching() + '\n' +
        writeWord() + '\n' + chantFill() + '\n' + challenge() + '\n' + reflect(),
      answers: {
        matching: '依單字圈出 ' + L + '：apple=a、ball=b、cat=c、door=d',
        words: words,
        chantStart: L
      }
    };
  }

  function tplReview(l, m, kind) {
    // kind: 'size' (=r3/r3 大小寫配對) / 'sound' (=r4/r4 發音總複習) / 'word' (=r5/r5 單字總複習) / 'ab' (=r6/r6 全字母複習) / 'nano' (=r6/r7 期末嘉年華)
    const focus = l.focus || '';
    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(focus) + '\n\n';
    if (kind === 'size') {
      html += 'A. 大小寫連連看：把下列左邊的大寫和右邊的小寫配對\n';
      html += '   A    C    E    M    H\n';
      html += '   ↓    ↓    ↓    ↓    ↓\n';
      html += '   a    c    e    m    h\n';
      html += blanks(8);
    } else if (kind === 'sound') {
      html += 'A. 聽音寫字母/單字：老師唸 __________________，學生寫 ______________________\n';
      html += blanks(8);
    } else if (kind === 'word') {
      html += 'A. 拼字練習：把每個中文翻成英文\n';
      html += '   1. 蘋果 → ＿＿＿＿＿  2. 香蕉 → ＿＿＿＿＿  3. 貓 → ＿＿＿＿＿\n';
      html += '   4. 門 → ＿＿＿＿＿  5. 蛋 → ＿＿＿＿＿  6. 魚 → ＿＿＿＿＿\n';
      html += blanks(4);
    } else if (kind === 'ab' || kind === 'nano') {
      html += 'A. 字母表填字：寫出缺的字母\n';
      html += '   A B C D ___ F G ___ I J ___ L M N ___ P ___ R S T ___ V W ___ Y ___\n';
      html += 'B. 大小寫配對：寫出對應的小寫\n';
      html += '   A → ___　D → ___　G → ___　K → ___　T → ___\n';
      html += blanks(6);
      html += '\nC. 我最喜歡的字母是 ___，因為 ＿＿＿＿＿＿。\n';
    } else {
      html += blanks(8);
    }
    html += '\n★ 學習目標：\n' + (l.objectives || []).map(function(o){ return '  ☐ ' + esc(o); }).join('\n');
    return { html: html, answers: { hint: '依課堂為準' } };
  }

  function tplPhonicsIntro(l, m) {
    // intro (Aa-Zz) , g2a1 (字母發音總複習), g2a2 (CVC 拼音入門)
    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(l.focus || '') + '\n\n';
    if (l.id === 'intro') {
      html += 'A. 寫出你的英文名字： ______________________\n';
      html += 'B. 唱一遍 Hello 歌（用手指比出 26 個字母順序）\n';
      html += 'C. 教室規則圈選：① 舉手發言 ☐ ② 輕聲說話 ☐ ③ 同學說話不插嘴 ☐\n';
      html += blanks(4);
    } else if (l.id === 'g2a1') {
      html += 'A. 寫出下列字母的「發音」（看老師口型）：\n';
      html += '   a: ＿＿＿＿　e: ＿＿＿＿　i: ＿＿＿＿　o: ＿＿＿＿　u: ＿＿＿＿\n';
      html += '   b: ＿＿＿＿　c: ＿＿＿＿　t: ＿＿＿＿　m: ＿＿＿＿　d: ＿＿＿＿\n';
      html += blanks(4);
    } else if (l.id === 'g2a2') {
      html += 'A. CVC 拼讀基礎：補上缺的母音和子音\n';
      html += '   c _ t → cat　　p _ g → pig　　b _ g → bag　　m _ p → map\n';
      html += '   h _ t → hat　　p _ n → pen　　b _ d → bed　　r _ d → red\n';
      html += blanks(6);
    }
    return { html: html, answers: { 'cat':'c-a-t', 'pig':'p-i-g', 'bag':'b-a-g', 'map':'m-a-p', 'hat':'h-a-t', 'pen':'p-e-n', 'bed':'b-e-d', 'red':'r-e-d' } };
  }

  function tplFamily(l, m, family) {
    const focus = l.focus || '';
    const objectives = l.objectives || [];
    const words = (l.main && l.main.vocab || []).map(function(v){ return v.en; });
    const onsetsSet = [];
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      onsetsSet.push(w.slice(0, w.length - family.length));
    }
    const onsets = Array.from(new Set(onsetsSet));
    const chant = (l.main && l.main.chant) || '';

    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(focus) + '\n\n';
    html += '★ 學習目標：\n' + objectives.map(function(o){ return '  ☐ ' + esc(o); }).join('\n') + '\n\n';

    html += 'A. 拼讀練習：把左邊的字首和右邊的字族配對\n';
    html += '   字首  ｜ 字族\n';
    html += '   ' + onsets.join('　') + '  ｜  ' + family + '\n';
    html += blanks(2);
    html += 'B. 看首音寫單字：每個寫 1 次\n';
    html += '   ' + onsets.join(' 看圖寫 _________　') + '\n';
    html += blanks(2);
    html += 'C. 圈圈看：把含有 ' + family + ' 的單字圈起來\n';
    const distractors = ['sun','can','dot','bed','pit'];
    html += '   ' + words.concat(distractors).join('　') + '\n';
    html += blanks(2);
    html += 'D. 填空：補上字首，幫單字回家\n';
    for (let i = 0; i < words.length; i++) {
      html += '   ___' + family + ' → ______' + family + '\n';
    }
    html += blanks(2);
    html += 'E. Chant 仿作：模仿 ' + esc(chant) + '，改一個字首再唸一次\n';
    html += blanks(3);
    html += 'F. 自由挑戰：寫出 3 個 ' + family + ' 家族的單字（沒在課本出現的喔）\n';
    html += '   1. ____' + family + '  2. ____' + family + '  3. ____' + family + '\n';
    html += blanks(3);
    html += 'G. 我的創意：畫一幅圖，至少 2 個 ' + family + ' 單字出現在圖裡\n';
    return { html: html, answers: { words: words, onsets: onsets, distractors: distractors }, _familyWords: words, _onsets: onsets };
  }

  function tplFamilyReview(l, m, families) {
    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(l.focus || '') + '\n\n';
    html += '★ 學習目標：\n' + (l.objectives || []).map(function(o){ return '  ☐ ' + esc(o); }).join('\n') + '\n\n';
    html += 'A. 配對連連看：左邊的字首要配右邊哪一個字族？\n';
    html += '   p/b/h/m/c　  ｜  ' + families.join(' / ') + '\n';
    html += blanks(2);
    html += 'B. 拼讀速度賽：每個寫 2 次、計時 30 秒\n';
    html += '   cat __　bat __　hat __　mat __　sat __\n';
    html += '   can __　man __　fan __　pan __　van __\n';
    html += '   cap __　map __　nap __　tap __　zap __\n';
    html += blanks(2);
    html += 'C. 圈出 ' + families.join(' 或 ') + ' 家族單字：\n';
    html += '   cat pen got man pig log cap pan mat top nap\n';
    html += blanks(2);
    html += 'D. 看圖填字（老師發學習單時口述）：\n';
    html += '   ' + families.map(function(f){ return '___' + f; }).join('　') + '\n';
    return { html: html, answers: { hint: families.length + ' families' } };
  }

  function tplDigraph(l, m, digraph) {
    const focus = l.focus || '';
    const objectives = l.objectives || [];
    const words = (l.main && l.main.vocab || []).map(function(v){ return v.en; });
    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(focus) + '\n\n';
    html += '★ 學習目標：\n' + objectives.map(function(o){ return '  ☐ ' + esc(o); }).join('\n') + '\n\n';
    html += 'A. 在下列單字中圈出 ' + digraph + '：\n';
    html += '   ' + words.map(function(w){ return esc(w); }).join('　') + '\n';
    html += blanks(2);
    html += 'B. 拼讀練習：把左邊的音和右邊的字配對\n';
    html += '   /' + (l.sound || '').replace(/\//g, '') + '/　  ' + words.join(' / ') + '\n';
    html += blanks(2);
    html += 'C. 看圖選詞（老師發學習單時口述）\n';
    html += '   看圖寫字：_____' + words[words.length - 1] + ' ＿＿＿\n';
    html += blanks(2);
    html += 'D. 對比單字（用一個母音代替）：\n';
    const alt = words.map(function(w){ return w.replace(digraph, 't'); });
    html += '   ' + alt.join('　') + '  （把 ' + digraph + ' 換成 t 會變什麼？）\n';
    html += blanks(2);
    html += 'E. 自由挑戰：寫出其他 ' + digraph + ' 單字（老師沒教的）\n';
    html += '   1. ____' + digraph + '  2. ____' + digraph + '  3. ____' + digraph + '\n';
    return { html: html, answers: { words: words, digraph: digraph, alt: alt } };
  }

  function tplMagicE(l, m) {
    const words = (l.main && l.main.vocab || []).map(function(v){ return v.en; });
    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(l.focus || '') + '\n\n';
    html += '★ 學習目標：\n' + (l.objectives || []).map(function(o){ return '  ☐ ' + esc(o); }).join('\n') + '\n\n';
    html += 'A. 神奇 e 變變變：把左邊短音加上 e 變長音\n';
    html += '   cap → cape    mad → made     pin → pine\n';
    html += blanks(2);
    html += 'B. 圈出長音 a_e 字族：\n';
    html += '   cake　lake　make　name　cap　map　tap　mad\n';
    html += blanks(2);
    html += 'C. 拼字練習：寫出下列單字，每個 2 次\n';
    html += words.map(function(w){ return '   ' + esc(w) + '____'; }).join('\n') + '\n';
    html += blanks(2);
    html += 'D. 看圖寫單字（老師口述）：\n';
    html += '   （蛋糕）_____ （湖）_____ （做）_____ （名字）_____\n';
    return { html: html, answers: { words: words, pairs: { 'cap':'cape', 'mad':'made', 'pin':'pine' } } };
  }

  function tplVowelTeam(l, m) {
    const words = (l.main && l.main.vocab || []).map(function(v){ return v.en; });
    const pairs = (l.id === 'g2b_teams')
      ? [['rain','/reɪn/'],['day','/deɪ/'],['boat','/boʊt/'],['snow','/snoʊ/']]
      : (l.id === 'g2b_eeea')
        ? [['bee','/biː/'],['tree','/triː/'],['sea','/siː/'],['read','/riːd/']]
        : [];
    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(l.focus || '') + '\n\n';
    html += '★ 學習目標：\n' + (l.objectives || []).map(function(o){ return '  ☐ ' + esc(o); }).join('\n') + '\n\n';
    html += 'A. 在下列單字中圈出母音搭檔：\n';
    html += '   ' + words.join('　') + '\n';
    html += blanks(2);
    html += 'B. 第一個母音說話、第二個安靜不出聲，把單字改成單音節：\n';
    html += '   ai / ay / oa / ow\n';
    html += blanks(2);
    html += 'C. 拼字練習：每個母音搭檔寫 2 例\n';
    html += words.map(function(w){ return '   ' + esc(w) + '____'; }).join('\n') + '\n';
    html += blanks(2);
    html += 'D. 配對連連看（圖與單字）\n';
    if (pairs.length) {
      for (let i = 0; i < pairs.length; i++) {
        html += '   ' + esc(pairs[i][1]) + '　─　＿＿＿\n';
      }
    } else {
      html += '   （老師口述）\n';
    }
    return { html: html, answers: { words: words, pairs: pairs } };
  }

  function tplLongReview(l, m) {
    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(l.focus || '') + '\n\n';
    html += '★ 學習目標：\n' + (l.objectives || []).map(function(o){ return '  ☐ ' + esc(o); }).join('\n') + '\n\n';
    html += 'A. 寫出五個長母音各一個字：\n';
    html += '   a_e: _____   ee/ea: _____   i_e: _____   o_e: _____   u_e: _____\n';
    html += blanks(2);
    html += 'B. 神奇 e 變變變：\n';
    html += '   kit → kite　 cub → cube　 rok → robe　 tap → tape\n';
    html += blanks(2);
    html += 'C. 配對連連看（圖與長母音單字）：\n';
    html += '   蛋糕 　蜜蜂 　風箏 　船 　方塊\n';
    html += '   cake　bee 　kite　boat　cube\n';
    html += blanks(3);
    html += 'D. 模仿 chant 創作 3 個句子：\n';
    html += '   1. ______________________________________________________\n';
    html += blanks(2);
    return { html: html, answers: { words: ['cake','bee','kite','boat','cube'], pairs: { '蛋糕':'cake','蜜蜂':'bee','風箏':'kite','船':'boat','方塊':'cube' }, transforms: { 'kit':'kite', 'cub':'cube', 'rok':'robe', 'tap':'tape' } } };
  }

  function tplBossyR(l, m) {
    const words = (l.main && l.main.vocab || []).map(function(v){ return v.en; });
    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(l.focus || '') + '\n\n';
    html += '★ 學習目標：\n' + (l.objectives || []).map(function(o){ return '  ☐ ' + esc(o); }).join('\n') + '\n\n';
    html += 'A. 圈出 er / ir / ur：\n';
    html += '   her　bird　fur　girl　fire　run　car　dog\n';
    html += blanks(2);
    html += 'B. 分類寫入方框：\n';
    html += '   │ er │ ir │ ur │\n';
    words.forEach(function(w){
      html += '   ' + esc(w) + ' → ＿＿＿＿\n';
    });
    html += blanks(3);
    html += 'C. 用 bossy r 寫出造句（任選 1 個單字）：\n';
    html += '   ______________________________________________________\n';
    return { html: html, answers: { words: words } };
  }

  function tplIXID(l, m) {
    const words = (l.main && l.main.vocab || []).map(function(v){ return v.en; });
    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(l.focus || '') + '\n\n';
    html += '★ 學習目標：\n' + (l.objectives || []).map(function(o){ return '  ☐ ' + esc(o); }).join('\n') + '\n\n';
    html += 'A. 圈出 ix 和 id 結尾：\n';
    html += '   six　mix　lid　kid　did　fit　cab　box\n';
    html += blanks(2);
    html += 'B. 填空拼字：\n';
    html += '   s_i_x → _____   m_i_x → _____   l_i_d → _____   k_i_d → _____\n';
    html += blanks(2);
    html += 'C. 看圖選詞（老師口述）：\n';
    html += '   （六）_____ （混合）______ （蓋子）_____ （小孩）_____\n';
    return { html: html, answers: { words: words } };
  }

  function tplVPE(l, m) {
    const words = (l.main && l.main.vocab || []).map(function(v){ return v.en; });
    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(l.focus || '') + '\n\n';
    html += '★ 學習目標：\n' + (l.objectives || []).map(function(o){ return '  ☐ ' + esc(o); }).join('\n') + '\n\n';
    html += 'A. 字首字尾配對（-ave 家族）\n';
    html += '   c / w / s / br　  ─  ave\n';
    html += blanks(2);
    html += 'B. 看中文寫英文：\n';
    html += '   洞穴 _____　海浪 _____　拯救 _____　勇敢的 _____\n';
    html += blanks(2);
    html += 'C. 畫圖：在海裡畫一艘大船，並標示 wave、boat、save\n';
    return { html: html, answers: { words: words } };
  }

  function tplBlend(l, m) {
    // g2b_nd, g2b_ing
    const words = (l.main && l.main.vocab || []).map(function(v){ return v.en; });
    const end = (l.tag || '').replace(/^\-/, '');
    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(l.focus || '') + '\n\n';
    html += '★ 學習目標：\n' + (l.objectives || []).map(function(o){ return '  ☐ ' + esc(o); }).join('\n') + '\n\n';
    html += 'A. 圈出字尾 ' + end + '：\n';
    html += '   ' + words.concat(['run','sit','pen','man','top','cat']).join('　') + '\n';
    html += blanks(2);
    html += 'B. 拼讀：拆音練習\n';
    html += '   han-d ＝ hand   san-d ＝ sand   men-d ＝ mend\n';
    html += '   kin-g ＝ king   rin-g ＝ ring   sin-g ＝ sing\n';
    html += blanks(2);
    html += 'C. 看圖寫字（老師口述）：\n';
    if (l.id === 'g2b_nd') html += '   （手）_____ （沙）_____ （修）_____ （寄）_____\n';
    else html += '   （國王）_____ （鈴）_____ （唱歌）_____ （翅膀）_____\n';
    return { html: html, answers: { words: words, end: end } };
  }

  function tplPractice(l, m, kind) {
    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(l.focus || '') + '\n\n';
    html += '★ 學習目標：\n' + (l.objectives || []).map(function(o){ return '  ☐ ' + esc(o); }).join('\n') + '\n\n';
    if (kind === 'anam') {
      html += 'A. -an 與 -am 字族分類：\n';
      html += '   can / man / fan / van / pan  →　-an 家族\n';
      html += '   jam / ham / ram / yam / dam →　-am 家族\n';
      html += blanks(2);
    } else if (kind === 'initial') {
      html += 'A. 聽音寫字首：\n';
      html += '   /b/ ____at   /c/ ____at   /f/ ____at   /m/ ____at\n';
      html += '   /s/ ____un   /h/ ____un   /r/ ____un   /b/ ____un\n';
      html += blanks(3);
    } else if (kind === 'final') {
      html += 'A. 聽音寫字尾：\n';
      html += '   ra_   ri_   ro_   ru_\n';
      html += '   ba_   bi_   bo_   bu_\n';
      html += blanks(2);
    } else if (kind === 'rhyme') {
      html += 'A. 把押韻的字連起來：\n';
      html += '   cat ─ hat / sat ─ bat / fun ─ sun / rug ─ bug\n';
      html += blanks(2);
    } else if (kind === 'blend') {
      html += 'A. 三音拼一音練習：\n';
      html += '   c + a + t → _____    p + i + g → _____    m + a + p → _____\n';
      html += '   b + u + g → _____    r + u + n → _____    f + i + sh → _____\n';
      html += blanks(3);
    } else if (kind === 'reader') {
      html += 'A. 看圖讀句子，圈出正確的字：\n';
      html += '   The (cat / cap) is on the (mat / map).\n';
      html += '   I (can / cat) (run / ran) in the (sun / son).\n';
      html += blanks(2);
    } else if (kind === 'spell') {
      html += 'A. 拼字小測（老師唸、學生寫）：\n';
      html += '   _____　　_____　　_____　　_____　　_____\n';
      html += blanks(2);
      html += 'B. 圈出拼錯的那個字：\n';
      html += '   cat / sit.m / log / pen / cap\n';
    } else if (kind === 'dict') {
      html += 'A. 聽音寫字：\n';
      html += '   1. _____   2. _____   3. _____   4. _____   5. _____\n';
      html += 'B. 寫出句子（依老師唸）：\n';
      html += '   _________________\n';
    } else if (kind === 'cvc') {
      html += 'A. 拼讀總複習：寫出缺的音\n';
      html += '   c _ t   b _ g   h _ n   p _ n   m _ p\n';
      html += '   p _ g   s _ t   l _ g   d _ y   r _ d\n';
      html += blanks(3);
      html += 'B. 自己挑 5 個 CVC 單字，畫下來：\n';
    }
    return { html: html, answers: { hint: '依課堂為準' } };
  }

  function tplCarnival(l, m) {
    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(l.focus || '') + '\n\n';
    html += '★ 學習目標：\n' + (l.objectives || []).map(function(o){ return '  ☐ ' + esc(o); }).join('\n') + '\n\n';
    html += 'A. 大小寫配對（10 題）：\n';
    html += '   D → ___　G → ___　J → ___ 　P → ___ 　Q → ___\n';
    html += '   V → ___　X → ___　Y → ___　 Z → ___　 K → ___\n';
    html += '\nB. 把聽到的字母寫出來（老師唸 10 個）：\n';
    html += blanks(3);
    html += '\nC. 寫出 3 個一～上學期學過的 chant 第一句（自己選）：\n';
    html += '   1. _______________________\n';
    html += '   2. _______________________\n';
    html += '   3. _______________________\n';
    return { html: html, answers: { hint: '自由作答' } };
  }

  function tplFinal(l, m) {
    let html = header() + pageTitle(l, m) + '\n📍 重點：' + esc(l.focus || '') + '\n\n';
    html += '★ 學習目標：\n' + (l.objectives || []).map(function(o){ return '  ☐ ' + esc(o); }).join('\n') + '\n\n';
    html += 'A. 寫出五個 -at - 字家族新詞：\n';
    html += '   ____at ____at ____at ____at ____at\n';
    html += 'B. 寫出五個自己最愛的字族單字（任意家族）：\n';
    html += '   ____________________\n';
    html += 'C. 圈出今天聽到的單字（老師唸 10 個）：\n';
    html += blanks(3);
    return { html: html, answers: { hint: '自由作答' } };
  }

  // ====== 路由（94 課 → 哪個樣板） ======
  function route(m, l) {
    const id = l.id;
    const tag = l.tag || '';
    // Letter
    if (/^[a-z]$/.test(id) && l.title.startsWith('Letter ')) {
      return tplLetter(l, m);
    }
    // intro / g2a1 / g2a2
    if (['intro','g2a1','g2a2'].indexOf(id) >= 0) {
      return tplPhonicsIntro(l, m);
    }
    // Review r1..r5 in g1a / g1b
    if (/^r[1-5]$/.test(id) && (m.id === 'g1a' || m.id === 'g1b')) {
      const kind = (id === 'r1' || id === 'r3') ? 'size'
                 : (id === 'r4') ? 'sound'
                 : (id === 'r5') ? 'word'
                 : 'size';
      return tplReview(l, m, kind);
    }
    if (id === 'r6' && (m.id === 'g1a' || m.id === 'g1b')) return tplReview(l, m, 'nano');
    if (id === 'r7' && m.id === 'g1b') return tplReview(l, m, 'ab');
    // Family lessons
    if (m.id === 'g2a' || m.id === 'g2b') {
      // arev / erev / irev / orev / urev
      if (/^(arev|erev|irev|orev|urev)$/.test(id)) {
        const fams = {
          'arev':['-at','-an','-am','-ad','-ap','-ag'],
          'erev':['-en','-et','-ed','-eg'],
          'irev':['-ig','-in','-ip','-it'],
          'orev':['-og','-op','-ot','-ob'],
          'urev':['-ug','-un','-ut','-ub']
        }[id];
        return tplFamilyReview(l, m, fams);
      }
      // digraph
      if (id === 'g2a_ch' || id === 'g2a_sh' ||
          id === 'g2b_th' || id === 'g2b_wh' || id === 'g2b_ph') {
        const dmap = { 'g2a_ch':'ch', 'g2a_sh':'sh', 'g2b_th':'th', 'g2b_wh':'wh', 'g2b_ph':'ph' };
        return tplDigraph(l, m, dmap[id]);
      }
      // single word family lessons
      const ofam = {'an': '-an','am':'-am','ad':'-ad','ap':'-ap','ag':'-ag',
                    'en':'-en','et':'-et','ed':'-ed','eg':'-eg',
                    'ig':'-ig','in':'-in','ip':'-ip','it':'-it',
                    'og':'-og','op':'-op','ot':'-ot','ob':'-ob',
                    'ug':'-ug','un':'-un','ut':'-ut','ub':'-ub',
                    'g2b_um':'-um'};
      if (ofam[id]) return tplFamily(l, m, ofam[id]);
      // magic e
      if (id === 'g2b_ave') return tplVPE(l, m);
      if (id === 'g2b_magice') return tplMagicE(l, m);
      // vowel teams
      if (id === 'g2b_eeea' || id === 'g2b_teams') return tplVowelTeam(l, m);
      // ix id
      if (id === 'g2a_ixid') return tplIXID(l, m);
      // blends
      if (id === 'g2b_nd' || id === 'g2b_ing') return tplBlend(l, m);
      // bossy r
      if (id === 'g2b_r') return tplBossyR(l, m);
      // long review
      if (id === 'g2b_longrev') return tplLongReview(l, m);
      // practice lessons
      const pmap = {'anam':'anam','initial':'initial','final':'final','rhyme':'rhyme','blend':'blend',
                    'reader':'reader','spell':'spell','dict':'dict','cvc':'cvc'};
      if (pmap[id]) return tplPractice(l, m, pmap[id]);
      // carnivals / finals
      if (id === 'g2afinal') return tplFinal(l, m);
      if (id === 'g2bfinal') return tplFinal(l, m);
    }
    // fallback
    return {
      html: header() + pageTitle(l, m) + '\n📍 重點：' + esc(l.focus || '') + '\n' + blanks(10),
      answers: { hint: '自由作答' }
    };
  }

  // ====== 安全：把純文字學習單轉成可列印 HTML ======
  function toHtml(rawText, title) {
    var esc = function(s){ return String(s==null?'':s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
    var lines = String(rawText).split('\n');
    var out = [];
    out.push('<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8">');
    out.push('<title>' + esc(title) + ' — 學習單</title>');
    out.push('<style>body{font-family:"Microsoft JhengHei","PingFang TC","Noto Sans TC",sans-serif;max-width:780px;margin:18px auto;color:#222;line-height:1.75;padding:0 16px;}h1{color:#ff7043;border-bottom:3px solid #ffd166;padding-bottom:8px;font-size:1.4rem;}h2,h3{color:#27ae60;margin-top:18px;font-size:1.05rem;}hr{border:none;border-top:1px dashed #bbb;margin:14px 0;}.ws-section{margin:14px 0;padding:14px 18px;border:1px solid #ffd1aa;border-radius:10px;background:#fff8ef;}.ws-Q{margin-top:18px;font-weight:bold;color:#c05621;}.ws-A{margin:6px 0 14px 0;white-space:pre-wrap;font-family:inherit;}.print-btn{position:fixed;top:12px;right:12px;background:#ff7043;color:#fff;padding:10px 18px;border-radius:10px;border:none;font-size:1rem;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.15);}.print-btn:hover{background:#ff5722;}@media print{.print-btn{display:none;}body{margin:0;}}</style>');
    out.push('</head><body>');
    out.push('<button class="print-btn" onclick="window.print()">🖨 列印</button>');
    out.push('<h1>' + esc(title) + ' — 學習單</h1>');
    out.push('<pre style="white-space:pre-wrap;font-family:inherit;font-size:1.02rem;line-height:1.95;background:#fffdf7;padding:18px;border:1px solid #eee;border-radius:10px;">' + esc(rawText) + '</pre>');
    out.push('</body></html>');
    return out.join('');
  }

  function openPrintable(m, l, mode) {
    var res = route(m, l);
    var title = m.grade + ' ' + m.semester + ' — ' + l.no + '：' + l.title;
    var html = toHtml(res.html, title);
    var w = window.open('', '_blank');
    if (!w) {
      alert('瀏覽器阻擋了彈出視窗！請允許 www.genspark.ai 開新視窗。');
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
      var txt = '📋 教師版 參考答案（此頁非給學生看）\n\n' +
                JSON.stringify(r.answers, null, 2);
      if (host) host.textContent = txt;
      return txt;
    }
  };
})();
