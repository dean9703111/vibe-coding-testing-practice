# AdminPage 測試案例

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。

---

## [x] 【前端元素】檢查頁面基本元素渲染
**範例輸入**：
1. 模擬 AuthContext 提供 admin 使用者
2. 渲染 AdminPage 元件
**期待輸出**：
1. 顯示標題「🛠️ 管理後台」
2. 顯示「返回」連結 (指向 /dashboard)
3. 顯示使用者角色 Badge (管理員)
4. 顯示登出按鈕
5. 顯示「管理員專屬頁面」區塊

---

## [x] 【Function 邏輯】檢查返回連結
**範例輸入**：
1. 模擬 AuthContext 提供 admin 使用者
2. 渲染 AdminPage 元件
3. 點擊「返回」連結
**期待輸出**：
1. 導向至 /dashboard

---

## [x] 【Function 邏輯】登出功能
**範例輸入**：
1. 模擬 AuthContext 提供 admin 使用者
2. 渲染 AdminPage 元件
3. 點擊登出按鈕
**期待輸出**：
1. 呼叫 logout 函式
2. 呼叫 navigate 導向至 /login

---

## [x] 【RBAC】顯示正確的角色標籤 (Admin)
**範例輸入**：
1. 模擬 AuthContext 提供 admin 使用者 (role: 'admin')
2. 渲染 AdminPage 元件
**期待輸出**：
1. Badge 顯示「管理員」
2. Badge class 包含 `admin`

---
