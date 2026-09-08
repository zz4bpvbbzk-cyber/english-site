// progress.js — 課程進度追蹤（localStorage 客戶端、不需後端、不需登入）
// 用法：在任何頁面 <script src="progress.js"></script>，即可使用 window.Progress
// 儲存格式：localStorage["englishSite.progress.v1"] = { "g1a/a": true, "g2b/magice": true, ... }
// 事件：每次變更會 dispatch "progress:changed" CustomEvent，其他頁面可監聽同步
window.Progress = (function () {
  var KEY = 'englishSite.progress.v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
  function k(m, l) { return m + '/' + l; }

  return {
    get: load,
    isDone: function (m, l) { return !!load()[k(m, l)]; },
    mark: function (m, l, done) {
      var d = load(); d[k(m, l)] = !!done; save(d);
      window.dispatchEvent(new CustomEvent('progress:changed', { detail: { module: m, lesson: l, done: !!done } }));
    },
    toggle: function (m, l) {
      var d = load(); var key = k(m, l); d[key] = !d[key]; save(d);
      window.dispatchEvent(new CustomEvent('progress:changed', { detail: { module: m, lesson: l, done: d[key] } }));
      return d[key];
    },
    reset: function () {
      localStorage.removeItem(KEY);
      window.dispatchEvent(new CustomEvent('progress:changed', { detail: { reset: true } }));
    },
    countInModule: function (m) {
      var d = load(), n = 0;
      Object.keys(d).forEach(function (key) {
        if (key.indexOf(m + '/') === 0 && d[key]) n++;
      });
      return n;
    },
    grandCount: function () {
      var d = load(), n = 0;
      Object.keys(d).forEach(function (key) { if (d[key]) n++; });
      return n;
    },
    totalLessons: function (modules) {
      return modules.reduce(function (s, m) { return s + m.lessons.length; }, 0);
    }
  };
})();
