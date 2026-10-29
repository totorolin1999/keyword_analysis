# 📈 Keyword Stock Analysis System (熱搜關鍵字與概念股關聯分析系統)

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Django-4.2-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Bootstrap-5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap" />
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js" />
</p>

一套結合 **Google Trends 即時搜尋趨勢**、**網路新聞爬蟲**、**Jieba 中文斷詞語意分析** 與 **Yahoo Finance 即時金融數據** 的全端概念股關聯與走勢預測系統。

系統自動偵測近期熱門話題，透過斷詞比對概念股與產業分類，擷取對應標的之歷史股價並以移動平均（Moving Average）等模型預測未來走勢，同時提供個人化追蹤清單與互動圖表。

---

## 📌 目錄 (Table of Contents)

- [系統特色](#-系統特色-features)
- [系統架構與資料流](#-系統架構與資料流-architecture)
- [技術棧 (Tech Stack)](#-技術棧-tech-stack)
- [系統功能模組](#-系統功能模組-modules)
- [專案結構 (Directory Structure)](#-專案結構-directory-structure)
- [環境建置與快速啟動 (Quick Start)](#-環境建置與快速啟動-quick-start)
- [API 規格一覽 (RESTful APIs)](#-api-規格一覽-restful-apis)
- [環境變數設定 (.env)](#-環境變數設定-env)

---

## ✨ 系統特色 (Features)

1. **熱搜關鍵字自動爬取**
   - 串接 Google Trends Daily Trends API，即時抓取每日焦點熱搜話題。
2. **即時新聞爬取與中文斷詞 (NLP)**
   - 爬取熱搜關鍵字相關的新聞報導內容。
   - 使用 `jieba` 進行精準中文斷詞與關鍵字過濾，提取核心主題詞彙。
3. **智慧產業與概念股關聯匹配**
   - 建立國家別（Nation）、產業類別（Industry）與特徵關鍵字庫（IndustryKeyword / ForeignKeyword）。
   - 自動將斷詞結果與產業關鍵字進行交集評分，智慧推薦最高關聯度的市場及概念股。
4. **金融數據整合與走勢預測**
   - 整合 `yfinance` 獲取個股歷史收盤價數據。
   - 支援基於歷史數據（14 天期滑動視窗）的趨勢預測（Moving Average Forecast）與走勢推估。
5. **互動式視覺化折線圖 (Chart.js)**
   - 透過 `react-chartjs-2` 渲染動態股價趨勢與預測圖表，直觀對比實際值與預測值。
6. **會員與個人化自訂追蹤 (Tracking System)**
   - 支援 JWT 雙權限 Token 認證（Access Token + Refresh Token Rotation）。
   - 使用者可隨時收藏關鍵字與對應產業標的，建立持續追蹤點並記錄時間序列變動。

---

## 🏗 系統架構與資料流 (Architecture)

```mermaid
flowchart TD
    A[Google Trends API] -->|每日熱門關鍵字| B[搜尋新聞爬蟲]
    B -->|新聞內文文本| C[Jieba 中文斷詞處理]
    C -->|關鍵字詞集合| D[概念股與產業類別庫匹配]
    D -->|推薦關聯產業與個股| E[yfinance 金融數據引擎]
    E -->|歷史股價 14D| F[移動平均趨勢預測模型]
    F -->|歷史數據 + 預測數據| G[REST API / Django REST Framework]
    G -->|JSON 資料格式| H[React 前端 SPA 介面]
    H -->|Chart.js 動態繪圖| I[互動式股票走勢圖]
    
    subgraph 會員追蹤系統
        U[用戶登入 / JWT 認證] -->|加入追蹤標的| T[自訂追蹤清單 Tracks]
        T -->|每日進展追蹤| I
    end
```

---

## 🛠 技術棧 (Tech Stack)

### 後端 (Backend)
- **程式語言**：Python 3.9+
- **核心框架**：Django 4.2 / Django REST Framework (DRF)
- **身分驗證**：`djangorestframework-simplejwt` (JWT Token Blacklist & Rotation)
- **資料處理與爬蟲**：`pandas`, `requests`, `BeautifulSoup4`, `urllib`
- **自然語言處理**：`jieba` 中文斷詞
- **金融分析**：`yfinance` (Yahoo Finance API)
- **伺服器與資料庫**：PostgreSQL, `dj-database-url`, Gunicorn

### 前端 (Frontend)
- **核心框架**：React 18 (SPA)
- **路由管理**：React Router v6
- **UI 與樣式**：Bootstrap 5 / React-Bootstrap, Sass (SCSS)
- **圖表函式庫**：Chart.js / `react-chartjs-2`
- **下拉與互動元件**：`react-select`, `react-paginate`
- **網路請求**：Axios (含 Axios Interceptor 處理 JWT 自動刷新)

---

## 📂 專案結構 (Directory Structure)

```text
keyword_analysis/
│
├── api/                             # Django 核心應用模組 (API)
│   ├── models.py                    # 資料庫模型 (Nation, Industry, Stock, Track 等)
│   ├── views.py                     # 爬蟲、斷詞分析、股價預測與 CRUD Views
│   ├── serializers.py               # DRF 序列化器
│   ├── urls.py                      # API 端點路由設定
│   └── migrations/                  # 資料庫遷移紀錄
│
├── keyword_analysis_drf/            # Django 專案全域配置
│   ├── settings.py                  # 設定檔 (JWT, CORS, Database, Static)
│   ├── urls.py                      # 根路由 (包含 React 前端靜態頁面轉發)
│   ├── wsgi.py / asgi.py            # WSGI / ASGI 入口
│   └── views.py                     # 前端單頁應用入口 (index.html 轉發)
│
├── keyword_analysis_reactapp/       # React 前端應用程式
│   ├── public/                      # 公共靜態資源
│   ├── src/
│   │   ├── components/              # 共用元件 (Header, Footer, LineChart 等)
│   │   ├── context/                 # AuthContext (JWT 認證全域狀態)
│   │   ├── pages/                   # 主要頁面 (Keywords, Tracks, Login, Register 等)
│   │   ├── utils/                   # 工具函式 (axiosInstance, PrivateRoute)
│   │   ├── apiConfig.js             # API Base URL 配置
│   │   ├── App.js                   # 路由根元件
│   │   └── index.js                 # React Entry Point
│   └── package.json                 # 前端依賴配置
│
├── staticfiles/                     # 部署靜態資源集合 (collectstatic)
├── requirements.txt                 # Python 依賴清單
├── .env.example                     # 環境變數範例檔
├── .gitignore                       # Git 忽略設定
└── README.md                        # 專案說明文件
```

---

## 🚀 環境建置與快速啟動 (Quick Start)

### 1. 複製專案 (Clone Repository)

```bash
git clone https://github.com/totorolin1999/keyword_analysis.git
cd keyword_analysis
```

### 2. 後端環境建置 (Backend Setup)

建議使用 Python 虛擬環境：

```bash
# 建立虛擬環境
python -m venv venv

# 啟動虛擬環境 (Windows PowerShell)
.\venv\Scripts\Activate.ps1
# 或 (macOS/Linux)
# source venv/bin/activate

# 安裝相依套件
pip install -r requirements.txt
```

設定環境變數：
```bash
# 複製環境變數範本並根據本機設定填寫
cp .env.example .env
```

執行資料庫遷移：
```bash
python manage.py makemigrations
python manage.py migrate
```

啟動後端開發伺服器：
```bash
python manage.py runserver
```
> 後端將預設在 `http://127.0.0.1:8000/` 運行。

---

### 3. 前端環境建置 (Frontend Setup)

開啟新終端機並進入前端目錄：

```bash
cd keyword_analysis_reactapp

# 安裝 npm 依賴套件
npm install

# 啟動 React 開發伺服器
npm start
```
> 前端開發伺服器預設在 `http://localhost:3000/` 運行。

如需打包前端至 Django 靜態資料夾供一體化部屬：
```bash
npm run build
cd ..
python manage.py collectstatic --noinput
```

---

## 📡 API 規格一覽 (RESTful APIs)

| 端點 (Endpoint) | 方法 | 權限需求 | 說明 |
|---|---|---|---|
| `/api/keyword-list/` | `GET` | 公開 | 取得 Google Trends 即時熱搜關鍵字清單 |
| `/api/nation-list/` | `GET` | 公開 | 根據關鍵字爬取相關新聞，比對推薦相關國家/地區 |
| `/api/category-list/` | `GET` | 公開 | 根據關鍵字與國家，以斷詞重合度推薦關聯產業類別 |
| `/api/stock-chart/` | `GET` | 公開 | 取得指定產業個股歷史股價走勢，支援 `predict=true` 移動平均走勢預測 |
| `/api/register/` | `POST` | 公開 | 使用者註冊 |
| `/api/token/` | `POST` | 公開 | 登入並取得 JWT Access / Refresh Token |
| `/api/token/refresh/` | `POST` | 公開 | 刷新 JWT Access Token |
| `/api/track-list/` | `GET` | 需驗證 | 取得當前使用者的個人化關鍵字追蹤清單 |
| `/api/track-create/` | `POST` | 需驗證 | 建立新的關鍵字/產業追蹤項目 |
| `/api/track-detail/<id>/` | `GET` | 需驗證 | 取得指定追蹤項目的詳細資訊與時間記錄 |
| `/api/track-time-create/<id>/` | `GET` | 需驗證 | 在指定追蹤項目中打卡/記錄今日追蹤點 |
| `/api/track-delete/<id>/` | `DELETE` | 需驗證 | 刪除指定的追蹤項目 |

---

## ⚙️ 環境變數設定 (.env)

在專案根目錄建立 `.env` 檔案，可參考 [`.env.example`](file:///.env.example)：

```ini
# Django 基本設定
DJANGO_SECRET_KEY=your_secret_key_here
DEBUG=True
DEVELOPMENT_MODE=True

# 本機 PostgreSQL 連線設定
PostgreSQL_NAME=keyworddb
PostgreSQL_USER=postgres
PostgreSQL_PASSWORD=your_password
PostgreSQL_HOST=localhost
PostgreSQL_PORT=5432

# 生產環境資料庫 URL (例如 Render / Supabase)
DATABASE_URL=postgresql://user:password@host:port/dbname
```

前端 `keyword_analysis_reactapp/.env`：
```ini
REACT_APP_APP_URL=http://127.0.0.1:8000
```

---

## 🤝 貢獻與反饋 (Contributing)

歡迎提交 Issue 與 Pull Request 一同完善此專案！
如有任何疑問或建議，歡迎透過 GitHub Issue 聯繫討論。
