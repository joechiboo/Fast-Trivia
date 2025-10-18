# Fast Trivia - 待辦事項

## 🐛 待修復

- [ ] **倒數計時器卡住問題** ⚠️
  - 現象：遊戲開始倒數或結果倒數有時會卡住
  - 原因：`countdownInterval` 和 `nextQuestionInterval` 沒有儲存到 `roomTimers` Map
  - 影響：計時器無法在需要時清除，導致卡住
  - 優先度：高

## 🧪 待測試

- [ ] **手機裝置測試** 📱 (明天進行)
  - [ ] iOS Safari - 觸控操作與響應式佈局
  - [ ] Android Chrome - 觸控操作與響應式佈局
  - [ ] 檢查橫向/直向切換
  - [ ] 檢查大按鈕是否好按
  - [ ] 測試 Socket.io 在行動網路下的穩定性

## ✅ 已完成

- [x] 新增小學四年級難度 🎓
- [x] 擴充題庫至 140 題 (原 80 題，增加 75%)
  - [x] 國語：20 → 40 題
  - [x] 英文：20 → 35 題
  - [x] 數學：20 → 35 題
  - [x] 常識：20 → 35 題
- [x] 部署到生產環境 🚀
  - [x] 後端：Render.com (https://fast-trivia.onrender.com)
  - [x] 前端：GitHub Pages (https://joechiboo.github.io/Fast-Trivia/)
  - [x] 設定 GitHub Actions 自動部署
- [x] 支援單人遊戲模式
- [x] 修復 CORS 問題
- [x] 修復計分重複問題
- [x] 修復房主權限問題
- [x] Socket 連線在組件切換時斷線 → 改為 App 層級管理
- [x] 倒數計時不同步 → 後端統一管理時間

---

## 📋 部署狀態

### 🌐 線上環境
- **前端**: https://joechiboo.github.io/Fast-Trivia/ ✅
- **後端**: https://fast-trivia.onrender.com ✅
  - 健康檢查: https://fast-trivia.onrender.com/health

### 🔧 部署架構
- **前端**: GitHub Pages (自動部署，推送到 main 分支觸發)
- **後端**: Render.com (自動部署，推送到 main 分支觸發)
- **CI/CD**: GitHub Actions

---

## 📝 其他待辦事項 (優先度低)

### 功能增強
- [ ] 加入音效（答對/答錯/倒數）
- [ ] 統計功能（答對率、最高分等）
- [ ] 題目收藏/複習功能
- [ ] 家長可以自訂題目

### 技術優化
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

**最後更新**: 2025-10-18
**版本**: v1.1 - 已上線，待測試手機裝置
**下次目標**: 修復倒數計時器問題 + 手機裝置測試
