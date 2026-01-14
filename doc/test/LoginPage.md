# LoginPage 測試案例

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。

---

## [x] 【前端元素】檢查頁面基本元素渲染
**範例輸入**：
1. 渲染 LoginPage 元件
**期待輸出**：
1. 顯示標題「歡迎回來」
2. 顯示 Email 輸入框 (type="text", id="email")
3. 顯示密碼輸入框 (type="password", id="password")
4. 顯示登入按鈕 (初始狀態 enabled)

---

## [x] 【前端元素】檢查測試環境提示
**範例輸入**：
1. 設定 `import.meta.env.VITE_API_URL` 為 undefined 或空字串
2. 渲染 LoginPage
**期待輸出**：
1. 顯示 footer 提示「測試帳號：任意 email 格式 / 密碼需包含英數且8位以上」

---

## [x] 【表單驗證】驗證 Email 格式錯誤
**範例輸入**：
1. Email 輸入 `invalid-email`
2. 點擊登入按鈕
**期待輸出**：
1. 顯示錯誤訊息「請輸入有效的 Email 格式」
2. 不會呼叫 login 函式

---

## [x] 【表單驗證】驗證密碼長度不足
**範例輸入**：
1. 密碼輸入 `12345` (少於 8 碼)
2. 點擊登入按鈕
**期待輸出**：
1. 顯示錯誤訊息「密碼必須至少 8 個字元」
2. 不會呼叫 login 函式

---

## [x] 【表單驗證】驗證密碼複雜度不足
**範例輸入**：
1. 密碼輸入 `12345678` (純數字) 或 `abcdefgh` (純英文)
2. 點擊登入按鈕
**期待輸出**：
1. 顯示錯誤訊息「密碼必須包含英文字母和數字」
2. 不會呼叫 login 函式

---

## [x] 【Function 邏輯】成功登入流程
**範例輸入**：
1. 輸入有效 Email `test@example.com`
2. 輸入有效密碼 `password123`
3. 模擬 login 函式成功 (resolve)
4. 點擊登入按鈕
**期待輸出**：
1. 呼叫 login 函式，帶入正確參數
2. 按鈕狀態變為 Loading (顯示「登入中...」)
3. 登入成功後呼叫 navigate 導向至 `/dashboard`

---

## [x] 【Mock API】處理登入失敗
**範例輸入**：
1. 輸入有效帳密
2. 模擬 login 函式失敗 (reject with AxiosError, message: "Invalid credentials")
3. 點擊登入按鈕
**期待輸出**：
1. 顯示錯誤 banner，內容包含 "Invalid credentials"
2. Loading 狀態結束，按鈕恢復可點擊

---

## [x] 【Function 邏輯】已登入狀態自動導向
**範例輸入**：
1. 設定 AuthContext 的 isAuthenticated 為 true
2. 渲染 LoginPage
**期待輸出**：
1. 直接呼叫 navigate 導向至 `/dashboard`

---

## [x] 【Function 邏輯】顯示與清除過期訊息
**範例輸入**：
1. 設定 AuthContext 的 authExpiredMessage 為 "Session expired"
2. 渲染 LoginPage
**期待輸出**：
1. 顯示錯誤 banner，內容為 "Session expired"
2. 呼叫 clearAuthExpiredMessage 函式
