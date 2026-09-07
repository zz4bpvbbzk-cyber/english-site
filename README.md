# 國小英語字母樂園（GitHub Pages 版）

單檔互動網站：一年級字母（A–M／N–Z）＋二年級 Phonics 複習，共 4 模組 80 節課。
所有課程資料（160 個 YouTube 教學影片連結）與三層導覽（首頁→課次列表→單課詳情）皆內嵌於 index.html，無任何外部檔案。

## 部署方式
1. 建立 GitHub repository（如 english-site）
2. 上傳本資料夾內 index.html 與 .nojekyll（或整包 ZIP 解壓上傳）
3. Repository → Settings → Pages → Build and deployment → Source 選 "Deploy from a branch" → Branch 選 main / (root) → Save
4. 等待約 1 分鐘，網址即為 https://<帳號>.github.io/<repo名稱>/

## 更新課程
直接編輯 index.html 內嵌的課程資料（或改用多檔版 english-site.zip 的 lessons.js 後重新產生）。
