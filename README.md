# Auth Frontend Project - Testing

使用 Vite + React + TypeScript 建立的前端認證系統，包含 JWT Token 處理、Protected Routes、Role-based Access Control (RBAC)、MSW Mock Server 及開發者測試面板。

## 目錄

- [功能特色](#功能特色)
- [生成這個專案的 Prompt](#生成這個專案的-prompt)
- [安裝指令](#安裝指令)
- [啟動指令](#啟動指令)
- [專案結構](#專案結構)
- [手動測試流程清單](#手動測試流程清單)
- [環境變數](#環境變數)
- [Mock API 規格](#mock-api-規格)
- [技術棧](#技術棧)

## 功能特色

- ✅ 登入成功/失敗流程
- ✅ JWT Token 儲存與自動帶入 API request
- ✅ Protected Route（未登入不可進入）
- ✅ Role-based 權限（admin 跟一般 user 能看到的頁面不同）
- ✅ 使用 MSW 做 Mock Server
- ✅ API 使用 axios 呼叫
- ✅ 手動測試面板（可切換 mock api 情境）

## 生成這個專案的 Prompt

```
你是資深前端工程師，了解如何做出有視覺設計感的網頁。根據下面需求建立前端專案：
- 登入成功/失敗流程
- JWT Token 儲存與帶入 API request
- Protected Route（未登入不可進入）
- Role-based 權限（admin 跟一般 user 能看到的頁面不同）
- 使用 MSW 做 Mock Server
- API 使用 axios 呼叫

## 技術與限制
1) 使用 Vite + React + TypeScript
2) Token 存在 localStorage
3) 請提供一個「手動測試面板」(dev-only)，可切換 mock api 情境：
   - 情境
    - POST /api/login: success / invalid_password / email_not_found / server_error
    - GET /api/me: success / token_expired / server_error
    - GET /api/products: success / server_error
   - 一鍵清除 token
   - 回傳延遲秒數（0/0.5s/1s），用來驗證 loading 畫面
   面板可做成畫面右下角的小浮窗即可
9) 生產環境不得啟用 MSW（要用環境變數控制，例如 VITE_USE_MSW=true 才啟用）

## 功能頁面
A) /login
- 有 email/password 輸入框與登入按鈕
    - 按下登入時，會檢查是否為 email 格式，password 是否大於 8 碼並且為英文數字混合，通過驗證才會呼叫 API
- 登入中顯示 loading
- 登入成功導向 /dashboard
- 呼叫 API 登入失敗，會顯示對應錯誤訊息（中文顯示）

B) /dashboard（Protected）
- 顯示：Welcome, {username}
- 用 mock 展示 3 個商品
- 進來時會呼叫 /api/me 取得使用者資料
- 若 token 無效（/api/me 回 401），要清 token 並導回 /login，並顯示 auth expired 類訊息

C) /admin（Protected + RBAC）
- 只有 role=admin 才能看到頁面內容
- 畫面會有權限的提示訊息
- 若 role 不足，導向到 dashboard 頁面

## MSW Mock API 規格（請照此實作）
1) POST /api/login
- success: 200 { accessToken: "fake.jwt.token", user: { username:"dean", role:"admin" 或 "user" } }
- invalid_password: 401 { message: "密碼錯誤" }
- email_not_found: 401 { message: "帳號不存在" }
- server_error: 500 { message: "伺服器錯誤，請稍後再試" }
- delay 要可套用在所有 API

2) GET /api/me
- 若 request 沒有 Authorization header：401 { message: "未授權，請重新登入" }
- token_expired: 401 { message: "登入已過期，請重新登入" }
- server_error: 500 { message: "伺服器錯誤，請稍後再試" }
- success: 200 { username:"dean", role:"admin" or "user" }

3) GET /api/products
- 若 request 沒有 Authorization header：401 { message: "未授權，請重新登入" }
- token_expired: 401 { message: "登入已過期，請重新登入" }
- server_error: 500 { message: "伺服器錯誤，請稍後再試" }
- success: 200 { products: [{ id: 1, name: "商品名稱", price: 100, description: "商品描述" }, ...] }（至少回傳 10 筆商品資料）

※ 情境切換的來源：手動測試面板寫入 localStorage（例如 msw_scenario, msw_delay），MSW handler 讀取它來決定回應。

## 額外要求
- 請把 MSW 的啟動放在 src/main.tsx，且由環境變數控制
- MSW 在測試環境使用 msw/node 的 setupServer
- 撰寫專案 README.md，說明使用方式
    - 安裝指令
    - 啟動指令（dev 模式啟用 MSW）
    - 跑測試指令
    - 以及「手動測試流程清單」（success/401/403/expired/delay/500+retry）每個情境怎麼操作
```

> 小提醒：AI Agent 隨機性很高，你生成出來的結果肯定跟我有一定差異。

## 安裝指令

```bash
npm install
```

## 啟動指令

### 開發模式（啟用 MSW）

```bash
npm run dev
```

開發模式預設啟用 MSW，可在右下角看到測試面板 🧪

### 生產環境建置

```bash
npm run build
npm run preview
```

生產環境不會啟用 MSW。

## 專案結構

```
src/
├── api/                    # API 層
│   ├── axiosInstance.ts    # Axios 實例與攔截器
│   ├── authApi.ts          # 認證 API
│   └── productApi.ts       # 商品 API
├── components/             # 元件
│   ├── DevPanel.tsx        # 測試面板
│   ├── ProtectedRoute.tsx  # 路由守衛
│   └── RoleBasedRoute.tsx  # 角色權限守衛
├── context/
│   └── AuthContext.tsx     # 認證狀態管理
├── mocks/                  # MSW Mocks
│   ├── handlers.ts         # API handlers
│   ├── browser.ts          # Browser worker
│   └── server.ts           # Node server (測試用)
├── pages/
│   ├── LoginPage.tsx       # 登入頁
│   ├── DashboardPage.tsx   # 儀表板
│   └── AdminPage.tsx       # 管理後台
├── App.tsx
├── main.tsx
└── index.css
```

## 手動測試流程清單

### 1. 登入成功流程 (success)

1. 開啟測試面板（右下角 🧪 按鈕）
2. 設定 `POST /api/login` → `success`
3. 設定 `User Role` → `admin` 或 `user`
4. 前往 `/login`
5. 輸入有效 email（如 `test@example.com`）
6. 輸入有效密碼（如 `password123`，需 8 碼以上且英數混合）
7. 點擊登入
8. **預期結果**：導向 `/dashboard`，顯示「Welcome, dean」

### 2. 密碼錯誤 (401 - invalid_password)

1. 設定 `POST /api/login` → `invalid_password`
2. 輸入任意 email/password 並登入
3. **預期結果**：顯示「密碼錯誤」錯誤訊息

### 3. 帳號不存在 (401 - email_not_found)

1. 設定 `POST /api/login` → `email_not_found`
2. 輸入任意 email/password 並登入
3. **預期結果**：顯示「帳號不存在」錯誤訊息

### 4. 伺服器錯誤 (500 - server_error)

1. 設定任意 API → `server_error`
2. 觸發該 API
3. **預期結果**：顯示「伺服器錯誤，請稍後再試」

### 5. Token 過期 (401 - token_expired)

1. 先以正常流程登入成功
2. 設定 `GET /api/me` → `token_expired`
3. 重新整理頁面（或導航到其他頁面）
4. **預期結果**：自動登出，導回 `/login`，顯示「登入已過期，請重新登入」

### 6. RBAC 權限測試 - Admin

1. 設定 `User Role` → `admin`
2. 登入成功後訪問 `/admin`
3. **預期結果**：可正常看到管理後台，包含新增/編輯/刪除商品功能

### 7. RBAC 權限測試 - User (403)

1. 設定 `User Role` → `user`
2. 登入成功後直接訪問 `/admin`
3. **預期結果**：自動導向 `/dashboard`

### 8. API 延遲測試 (delay)

1. 設定 `API 延遲` → `1000ms`
2. 觸發任意 API（如登入或載入商品）
3. **預期結果**：看到 loading 狀態持續約 1 秒

### 9. 清除 Token

1. 登入成功後
2. 點擊測試面板的「🗑️ 清除 Token」
3. **預期結果**：導回 `/login`

### 10. Protected Route 測試

1. 未登入狀態
2. 直接訪問 `/dashboard` 或 `/admin`
3. **預期結果**：自動導向 `/login`

## 環境變數

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `VITE_API_URL` | 真實 API 的 Base URL（設定後會停用 MSW） | 無（未設定時使用 MSW） |

## Mock API 規格

### POST /api/login

| 情境 | Status | Response |
|------|--------|----------|
| success | 200 | `{ accessToken, user: { username, role } }` |
| invalid_password | 401 | `{ message: "密碼錯誤" }` |
| email_not_found | 401 | `{ message: "帳號不存在" }` |
| server_error | 500 | `{ message: "伺服器錯誤，請稍後再試" }` |

### GET /api/me

| 情境 | Status | Response |
|------|--------|----------|
| success | 200 | `{ username, role }` |
| token_expired | 401 | `{ message: "登入已過期，請重新登入" }` |
| server_error | 500 | `{ message: "伺服器錯誤，請稍後再試" }` |
| 無 Authorization header | 401 | `{ message: "未授權，請重新登入" }` |

### GET /api/products

| 情境 | Status | Response |
|------|--------|----------|
| success | 200 | `{ products: [...] }` (10 筆商品) |
| server_error | 500 | `{ message: "伺服器錯誤，請稍後再試" }` |
| 無 Authorization header | 401 | `{ message: "未授權，請重新登入" }` |

## 技術棧

- Vite
- React 18
- TypeScript
- React Router DOM v6
- Axios
- MSW (Mock Service Worker)
- Vitest
- Testing Library
