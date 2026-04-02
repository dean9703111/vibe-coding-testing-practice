> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、狀態邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】顯示完整的 Dashboard UI
**範例輸入**：以一般登入者身份 (`user` 角色) 渲染頁面。
**期待輸出**：畫面上顯示「儀表板」標題、歡迎提示、用戶頭像（字首大寫）、登出按鈕與商品列表區塊。

---

## [x] 【狀態邏輯】使用者為 admin 時顯示管理員項目
**範例輸入**：Mock `useAuth` 的 `user` 回傳 `{ role: 'admin', username: 'admin_user' }`。
**期待輸出**：畫面上出現「🛠️ 管理後台」的連結，且角色徽章標示為「管理員」。

---

## [x] 【狀態邏輯】使用者為 general user 時不顯示管理員項目
**範例輸入**：Mock `useAuth` 的 `user` 回傳 `{ role: 'user', username: 'test_user' }`。
**期待輸出**：畫面上不應顯示「🛠️ 管理後台」的連結，且角色徽章標示為「一般用戶」。

---

## [x] 【狀態邏輯】點擊登出按鈕會呼叫 logout 與轉址
**範例輸入**：點擊畫面上方的「登出」按鈕。
**期待輸出**：呼叫 `logout` 函式並觸發 `navigate('/login', { replace: true, state: null })` 轉址。

---

## [x] 【Mock API】請求載入商品時顯示 Loading 狀態
**範例輸入**：Mock `productApi.getProducts` 為延遲解析的 Promise，渲染元件。
**期待輸出**：畫面顯示包含 `spinner` 樣式與「載入商品中...」的等待區塊。

---

## [x] 【Mock API】Mock API 成功取得商品清單並正確渲染
**範例輸入**：Mock API 成功回傳商品資料陣列包含價格與介紹，載入完成。
**期待輸出**：不再顯示 Loading 狀態，畫面正確呈現商品卡片（包含商品名稱、描述與加上千分位的價格）。

---

## [x] 【Mock API】Mock API 回傳一般錯誤並顯示錯誤訊息
**範例輸入**：Mock `productApi.getProducts` 拋出包含 `message: '無法載入商品資料'` 錯誤訊息的 AxiosError 且狀態不為 401。
**期待輸出**：畫面顯示「無法載入商品資料」的警告與對應圖示，並結束 Loading。

---

## [x] 【Mock API】遭遇 401 Error 時不設定元件層級錯誤
**範例輸入**：Mock `productApi.getProducts` 拋出 `status: 401` 的 AxiosError。
**期待輸出**：catch block 執行 `return`，不會將錯誤寫進 state，畫面不顯示「無法載入商品資料」，由攔截器去處理跳轉。
