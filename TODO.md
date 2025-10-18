# Fast Trivia - 待辦事項

## 🚨 目前問題

### 1. 創建房間功能異常
**狀態**: ❌ 需要修復

**問題描述**:
- 創建房間時無法正常運作
- 需要檢查前後端連線是否正常
- 需要檢查 Socket.io 事件監聽是否正確

**可能原因**:
- [ ] 前端 Socket.io 連線設定不正確
- [ ] 後端事件處理有誤
- [ ] CORS 設定問題
- [ ] 環境變數未正確讀取

**除錯步驟**:
1. 開啟瀏覽器開發者工具 (F12)
2. 查看 Console 是否有錯誤訊息
3. 查看 Network 標籤，確認 WebSocket 連線狀態
4. 檢查後端 Console 是否有收到事件

**相關檔案**:
- `client/src/composables/useSocket.ts` - 前端 Socket.io 設定
- `server/src/socket/handlers/roomHandler.ts` - 後端房間處理
- `server/src/index.ts` - 後端主程式

---

## 🚀 快速啟動指南

### 前置檢查
```bash
# 確認 Node.js 版本
node --version  # 應該是 v18 或以上

# 確認在專案根目錄
pwd  # 應該是 .../Fast-Trivia
```

### 步驟 1: 啟動後端 (終端機 1)
```bash
cd server
npm run dev
```

**預期輸出**:
```
🎯 Fast Trivia Server running on port 3001
📝 Client URL: http://localhost:5174
```

**如果失敗**:
- Port 被佔用 → 修改 `server/.env` 中的 `PORT`
- 依賴未安裝 → 執行 `npm install`

### 步驟 2: 啟動前端 (終端機 2)
```bash
cd client
npm run dev
```

**預期輸出**:
```
VITE v7.1.10 ready in XXX ms
➜ Local: http://localhost:5173/
```

**如果失敗**:
- Port 被佔用 → Vite 會自動換 port
- 依賴未安裝 → 執行 `npm install`

### 步驟 3: 開啟瀏覽器測試
1. 開啟 `http://localhost:5173` (或 Vite 顯示的 port)
2. 開啟開發者工具 (F12)
3. 輸入暱稱，點擊「創建房間」
4. 查看是否有錯誤訊息

---

## 📋 部署計劃

### 前端部署 - GitHub Pages

**優點**:
- ✅ 完全免費
- ✅ 與 GitHub repo 整合
- ✅ 自動 HTTPS

**缺點**:
- ⚠️ 只能部署靜態網站
- ⚠️ 需要設定 base path

**部署步驟**:

1. **修改 Vite 設定**

   檔案: `client/vite.config.ts`
   ```typescript
   export default defineConfig({
     base: '/Fast-Trivia/',  // 加入這行
     // ... 其他設定
   })
   ```

2. **建置前端**
   ```bash
   cd client
   npm run build
   ```

3. **部署到 GitHub Pages**

   方法一: 使用 gh-pages 套件
   ```bash
   cd client
   npm install -D gh-pages
   npm run build
   npx gh-pages -d dist
   ```

   方法二: 手動設定 GitHub Actions
   - 建立 `.github/workflows/deploy.yml`
   - 設定自動建置並部署到 gh-pages 分支

4. **GitHub 設定**
   - 到 repo Settings > Pages
   - Source: Deploy from a branch
   - Branch: gh-pages / root
   - 等待 1-2 分鐘部署完成

5. **更新環境變數**
   - 前端會在 `https://joechiboo.github.io/Fast-Trivia/`
   - 需要更新 `VITE_SERVER_URL` 為後端的正式網址

---

### 後端部署 - 免費方案比較

#### 選項 1: Render.com ⭐ 推薦
**優點**:
- ✅ 完全免費 (Free tier)
- ✅ 自動從 GitHub 部署
- ✅ 提供 HTTPS
- ✅ 支援 WebSocket
- ✅ 自動重啟

**限制**:
- ⚠️ 15 分鐘沒請求會休眠（首次請求較慢）
- ⚠️ 每月 750 小時免費（足夠使用）

**部署步驟**:
1. 註冊 https://render.com
2. New > Web Service
3. Connect GitHub repo: `joechiboo/Fast-Trivia`
4. 設定:
   - Name: `fast-trivia-server`
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. 環境變數:
   - `PORT`: 3000
   - `CLIENT_URL`: `https://joechiboo.github.io/Fast-Trivia`
6. Create Web Service

**預期網址**: `https://fast-trivia-server.onrender.com`

---

#### 選項 2: Railway.app
**優點**:
- ✅ 免費 $5 credit/月
- ✅ 自動從 GitHub 部署
- ✅ 支援 WebSocket
- ✅ 快速且穩定

**限制**:
- ⚠️ 需要信用卡驗證（不會收費）
- ⚠️ 用完 credit 會暫停

**部署步驟**:
1. 註冊 https://railway.app
2. New Project > Deploy from GitHub
3. 選擇 `Fast-Trivia` repo
4. 選擇 `server` 目錄
5. 設定環境變數（同上）

---

#### 選項 3: Fly.io
**優點**:
- ✅ 免費方案支援 3 個小型應用
- ✅ 全球 CDN
- ✅ 支援 WebSocket

**限制**:
- ⚠️ 需要信用卡驗證
- ⚠️ 設定較複雜（需要 Dockerfile）

---

### 推薦部署組合 🎯

**最佳方案**: Render.com (後端) + GitHub Pages (前端)
- 完全免費
- 不需要信用卡
- 設定簡單
- 足夠個人使用

**部署後的網址**:
- 前端: `https://joechiboo.github.io/Fast-Trivia/`
- 後端: `https://fast-trivia-server.onrender.com`

---

## 🔧 部署後設定檢查清單

部署完成後，需要確認：

### 前端檢查
- [ ] `client/vite.config.ts` 的 `base` 設定正確
- [ ] `client/.env.production` 包含正式後端網址
- [ ] Build 成功無錯誤
- [ ] GitHub Pages 顯示正常

### 後端檢查
- [ ] `server/.env` 或 Render 環境變數設定正確
- [ ] `CLIENT_URL` 指向前端網址（用於 CORS）
- [ ] 健康檢查 endpoint 回應正常: `https://後端網址/health`
- [ ] WebSocket 連線正常

### 整合測試
- [ ] 前端能連上後端
- [ ] 創建房間功能正常
- [ ] 加入房間功能正常
- [ ] 遊戲流程完整
- [ ] 多人連線正常

---

## 📝 其他待辦事項

### 功能增強 (優先度低)
- [ ] 加入音效（答對/答錯/倒數）
- [ ] 題目難度標記在 UI 上顯示
- [ ] 統計功能（答對率、最高分等）
- [ ] 題目收藏/複習功能
- [ ] 家長可以自訂題目

### 技術優化
- [ ] 加入 TypeScript 嚴格模式
- [ ] 加入單元測試
- [ ] 加入 E2E 測試
- [ ] 優化 WebSocket 重連機制
- [ ] 加入錯誤追蹤（Sentry）

### UI/UX 改善
- [ ] 加入載入動畫
- [ ] 優化手機橫屏體驗
- [ ] 加入深色模式
- [ ] 改善無障礙設計（鍵盤導航）

---

## 🐛 已知問題記錄

| 問題 | 狀態 | 優先度 | 備註 |
|------|------|--------|------|
| 創建房間無法正常運作 | 🔴 未修復 | 高 | 需優先處理 |
| Tailwind CSS v4 相容性問題 | 🟢 已解決 | - | 已降版到 v3 |
| Port 衝突問題 | 🟢 已解決 | - | 改用動態 port |

---

## 📞 除錯聯絡資訊

如果遇到問題，可以：
1. 查看 `server/` 和 `client/` 的 Console 輸出
2. 查看瀏覽器開發者工具的 Console 和 Network 標籤
3. 檢查 GitHub Issues 是否有類似問題
4. 參考 `.specify/memory/specification.md` 的技術規格

---

**最後更新**: 2025-10-18
**版本**: MVP v1.0
**下次目標**: 修復創建房間問題 + 完成部署
