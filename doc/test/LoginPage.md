> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】顯示完整的登入表單 UI
**範例輸入**：無
**期待輸出**：顯示 Header、Email 欄位、密碼欄位、登入按鈕。且若環境變數無 `VITE_API_URL` 設定會顯示測試帳號提示。

---

## [x] 【function 邏輯】驗證 Email 格式 - 輸入無效格式
**範例輸入**：在 Email 填入 `invalid-email` 並點擊登入
**期待輸出**：顯示「請輸入有效的 Email 格式」錯誤，且不觸發登入請求。

---

## [x] 【function 邏輯】驗證 Email 格式 - 輸入有效格式則錯誤消失
**範例輸入**：先觸發 Email 錯誤訊息，重新在 Email 填入 `valid@example.com` 並觸發 onChange
**期待輸出**：Email 格式錯誤的警告訊息應被清除，且不影響其他未修改部分。

---

## [x] 【function 邏輯】驗證密碼格式 - 長度不足
**範例輸入**：在 Email 填入正確格式，密碼填入 `short1` 並點擊登入
**期待輸出**：顯示「密碼必須至少 8 個字元」錯誤，且不觸發登入請求。

---

## [x] 【function 邏輯】驗證密碼格式 - 缺少英文或數字
**範例輸入**：在 Email 填入正確格式，密碼填入 `12345678` 或 `abcdefgh` 並點擊登入
**期待輸出**：顯示「密碼必須包含英文字母和數字」錯誤，且不觸發登入請求。

---

## [x] 【function 邏輯】驗證密碼格式 - 正確格式則錯誤消失
**範例輸入**：先觸發密碼錯誤，重新在密碼填入 `Valid123` 觸發 onChange
**期待輸出**：密碼錯誤的警告訊息應被清除，且不影響其他未修改部分。

---

## [x] 【function 邏輯】登入請求中顯示 Loading 狀態
**範例輸入**：輸入正確格式的 Email 和密碼並點擊登入（將 API 設為延遲回傳）
**期待輸出**：按鈕文字改為「登入中...」，且輸入框和按鈕均被設定為 disabled。

---

## [x] 【Mock API】Mock API 登入成功導向儀表板
**範例輸入**：輸入正確格式的 Email 及密碼，Mock `login` 成功解析
**期待輸出**：應呼叫 `useAuth` 的 `login` 函式，結束 Loading 後呼叫 `navigate('/dashboard', { replace: true })`。

---

## [x] 【Mock API】Mock API 登入失敗顯示錯誤訊息
**範例輸入**：輸入正確格式的 Email 及密碼，Mock `login` 拋出 AxiosError
**期待輸出**：顯示 API 回傳的錯誤欄位（或預設「登入失敗，請稍後再試」）作為警告橫幅。

---

## [x] 【Context 狀態】已登入狀態直接導向 dashboard
**範例輸入**：渲染前 Mock `useAuth` 回傳的 `isAuthenticated` 為 `true`
**期待輸出**：元件掛載後 `useEffect` 立刻觸發轉至 `/dashboard` (`{ replace: true }`)。

---

## [x] 【Context 狀態】檢查過期狀態並顯示對應錯誤
**範例輸入**：渲染前 Mock `useAuth` 回傳的 `authExpiredMessage` 帶有過期訊息
**期待輸出**：在畫面頂端錯誤橫幅處顯示該過期訊息，並緊接著呼叫 `clearAuthExpiredMessage()` 清除該 Context 狀態。
