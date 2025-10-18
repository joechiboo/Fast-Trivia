# Fast Trivia 🎯

適合小朋友的多人即時問答遊戲

## 🌐 線上體驗

- **前端**: https://joechiboo.github.io/Fast-Trivia/ (部署中...)
- **後端**: https://fast-trivia.onrender.com ✅
  - 健康檢查: https://fast-trivia.onrender.com/health

## 📖 專案簡介

Fast Trivia 是一個專為 4-7 歲小朋友設計的問答遊戲，支援 2-8 人即時連線對戰。透過有趣的問答方式，讓孩子在遊戲中學習國語、英文、數學和常識！

### 🎮 遊戲特色

- **適齡題目**：針對幼稚園中班到國小一年級設計
- **四大分類**：
  - 📖 國語（注音、生字、造詞）
  - 🔤 英文（字母、單字、簡單句子）
  - 🔢 數學（數數、加減法、圖形）
  - 🌍 常識（動物、植物、日常生活）
- **快速對戰**：每局 5 題，約 3-5 分鐘
- **計分機制**：答題速度 + 連勝獎勵
- **手機優先**：大按鈕設計，方便小朋友操作

### 主要功能

- 🎮 **多人即時對戰**：支援 2-8 人同時遊玩
- 📱 **手機優先設計**：響應式 UI，完美支援觸控操作
- ⚡ **快速配對**：房間代碼機制，快速創建和加入遊戲
- 🏆 **即時排名**：答題過程中即時更新分數排行
- 🔥 **連勝加成**：連續答對獲得額外分數

## 🛠️ 技術棧

### 前端
- Vue 3 (Composition API)
- TypeScript
- Tailwind CSS
- Pinia (狀態管理)
- Socket.io-client

### 後端
- Node.js + Express
- Socket.io
- TypeScript

## 📋 開發規範

本專案使用 [GitHub Spec Kit](https://github.com/github/spec-kit) 進行規格驅動開發：

- **[Constitution](.specify/memory/constitution.md)** - 開發憲章與技術原則
- **[Specification](.specify/memory/specification.md)** - 完整產品規格文件
- **[Spec Kit Guide](SPECKIT_GUIDE.md)** - Spec Kit 使用指南

## 🚀 快速開始

### 前置需求

- Node.js 18+
- npm 或 yarn

### 安裝步驟

1. **Clone 專案**
```bash
git clone git@github.com:joechiboo/Fast-Trivia.git
cd Fast-Trivia
```

2. **安裝後端依賴**
```bash
cd server
npm install
```

3. **安裝前端依賴**
```bash
cd ../client
npm install
```

### 開發環境執行

**啟動後端伺服器**（終端機 1）
```bash
cd server
npm run dev
```
伺服器會在 http://localhost:3000 啟動

**啟動前端開發伺服器**（終端機 2）
```bash
cd client
npm run dev
```
前端會在 http://localhost:5173 啟動

現在可以在瀏覽器開啟 http://localhost:5173 開始遊玩！

### 生產環境建置

**建置前端**
```bash
cd client
npm run build
```

**建置後端**
```bash
cd server
npm run build
npm start
```

## 📂 專案結構

```
Fast-Trivia/
├── client/                 # 前端專案 (Vue 3)
│   ├── src/
│   │   ├── components/    # Vue 元件
│   │   ├── composables/   # Vue Composables
│   │   ├── stores/        # Pinia Stores
│   │   ├── types/         # TypeScript 類型定義
│   │   └── utils/         # 工具函式
│   └── package.json
│
├── server/                # 後端專案 (Node.js)
│   ├── src/
│   │   ├── game/         # 遊戲邏輯 (Room, Game, Player)
│   │   ├── socket/       # Socket.io 事件處理
│   │   ├── data/         # 題庫資料
│   │   └── types/        # TypeScript 類型定義
│   └── package.json
│
├── .specify/             # Spec Kit 規格文件
│   └── memory/
│       ├── constitution.md
│       └── specification.md
│
└── README.md
```

## 🎯 遊戲流程

1. 輸入暱稱
2. 創建房間 或 加入房間（輸入 6 位代碼）
3. 等候室：房主選擇題目分類
4. 開始遊戲：3 秒倒數
5. 答題：10 秒內選擇答案
6. 查看結果：顯示正確答案和排名
7. 重複 5-6 直到 5 題結束
8. 最終排名：顯示冠亞季軍

## 🎨 計分機制

```
單題得分 = 基礎分 + 時間加成 + 連勝加成

基礎分 = 100 分
時間加成 = (剩餘秒數 / 10) × 50 分（最高 50 分）
連勝加成 = 連勝數 × 20 分（無上限）
```

**範例**：
- 剩餘 8 秒，連勝 3 題 → 得分 = 100 + 40 + 60 = 200 分
- 剩餘 2 秒，連勝 0 題 → 得分 = 100 + 10 + 0 = 110 分

## 📝 題庫說明

目前共 80 題，分為 4 個分類：
- 國語：20 題（注音、生字、反義詞）
- 英文：20 題（字母、單字、數字）
- 數學：20 題（加減法、圖形）
- 常識：20 題（動物、天氣、日常生活）

每題都標記適合年齡層：
- `preschool`：幼稚園（4-6 歲）
- `grade1`：國小一年級（7 歲）

## 🚀 部署

### 前端部署（Vercel）

```bash
cd client
npm run build
# 上傳 dist/ 資料夾到 Vercel
```

記得設定環境變數：
- `VITE_SERVER_URL`: 後端伺服器網址

### 後端部署（Render / Railway）

```bash
cd server
npm run build
# 上傳到 Render 或 Railway
```

記得設定環境變數：
- `PORT`: 3000
- `CLIENT_URL`: 前端網址

## 📝 專案狀態

目前處於 **MVP 完成階段**：
- ✅ 完整的前後端程式碼
- ✅ 80 題適齡題庫
- ✅ 多人連線對戰功能
- ✅ 計分系統
- ✅ 手機優化 UI

## 🎓 學習資源

這個專案使用了：
- [Vue 3 文件](https://vuejs.org/)
- [Socket.io 文件](https://socket.io/)
- [Tailwind CSS 文件](https://tailwindcss.com/)
- [GitHub Spec Kit](https://github.com/github/spec-kit)

## 📄 授權

MIT License

---

**為 7 歲的哥哥和 4 歲的弟弟打造 ❤️**

**Built with GitHub Spec Kit**
