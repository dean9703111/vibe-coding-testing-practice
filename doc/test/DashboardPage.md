# DashboardPage 測試案例

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。

---

## [x] 【前端元素】檢查頁面基本元素渲染
**範例輸入**：
1. 模擬 AuthContext 提供一般使用者 (User)
2. 渲染 DashboardPage 元件
**期待輸出**：
1. 顯示標題「儀表板」
2. 顯示歡迎訊息 "Welcome, {username} 👋"
3. 顯示角色 Badge
4. 顯示登出按鈕
5. 顯示「商品列表」標題

---

## [x] 【RBAC】管理員顯示後台連結
**範例輸入**：
1. 模擬 AuthContext 提供 admin 使用者
2. 渲染 DashboardPage 元件
**期待輸出**：
1. 顯示「🛠️ 管理後台」連結 (指向 /admin)

---

## [x] 【RBAC】一般用戶不顯示後台連結
**範例輸入**：
1. 模擬 AuthContext 提供一般使用者 (user role)
2. 渲染 DashboardPage 元件
**期待輸出**：
1. 不顯示「🛠️ 管理後台」連結

---

## [x] 【Function 邏輯】登出功能
**範例輸入**：
1. 模擬 AuthContext 提供使用者
2. 渲染 DashboardPage 元件
3. 點擊登出按鈕
**期待輸出**：
1. 呼叫 logout 函式
2. 呼叫 navigate 導向至 /login

---

## [x] 【Mock API】商品列表載入中狀態
**範例輸入**：
1. 模擬 productApi.getProducts 處於 pending 狀態
2. 渲染 DashboardPage 元件
**期待輸出**：
1. 顯示「載入商品中...」
2. 顯示 loading spinner

---

## [x] 【Mock API】商品列表載入成功
**範例輸入**：
1. 模擬 productApi.getProducts 回傳商品陣列
   - Product A: { id: 1, name: "Prod A", price: 100 }
   - Product B: { id: 2, name: "Prod B", price: 200 }
2. 渲染 DashboardPage 元件
**期待輸出**：
1. 顯示 2 個商品卡片
2. 顯示正確的商品名稱與價格

---

## [x] 【Mock API】商品列表載入失敗
**範例輸入**：
1. 模擬 productApi.getProducts 拋出錯誤 (message: "Error fetching data")
2. 渲染 DashboardPage 元件
**期待輸出**：
1. 顯示錯誤訊息 "Error fetching data"
2. 顯示錯誤 icon
