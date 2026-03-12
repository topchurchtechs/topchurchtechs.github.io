# ELMA 點名系統

卓越領袖事奉學院（Excellence Leadership Ministry Academy）QR Code 掃描點名系統。

---

## 系統架構

```
老師開啟點名頁面（含 serviceToken）
  → 選擇簽到 / 簽退
  → 掃描學生 QR Code（JWT）
  → fetch POST 到 Apps Script Web App
  → Apps Script 驗證 serviceToken 並寫入 Google Sheet
  → 回傳 { ok: true } 或 { ok: false, error: "..." }

學生 / 家長開啟請假頁面
  → 掃描 QR Code 或手動輸入學號
  → fetch POST 到 Apps Script Web App
  → Apps Script 寫入 Google Sheet
  → 回傳結果，頁面顯示成功 / 失敗
```

---

## 頁面路由

| 路由 | 說明 | 使用者 | 需要 serviceToken |
|------|------|--------|:-----------------:|
| `/elma-checkin/` | 點名頁面 | 老師 | ✅ |
| `/elma-checkin/leave.html` | 請假申請 | 學生 / 家長 | ❌（完全公開） |
| `/elma-checkin/generate-qr-jwt.html` | 單筆 QR Code 產生器 | 管理員 | ❌ |
| `/elma-checkin/generate-qr-batch.html` | 批次 QR Code 產生器（CSV） | 管理員 | ❌ |

---

## 步驟一：建立 Google Sheet

在 Google Drive 新建一份試算表（不需要建 Google 表單）。
Apps Script 會自動建立以下兩個分頁：

| 分頁名稱 | 說明 |
|----------|------|
| `簽到記錄` | 記錄每筆簽到 / 簽退，欄位：時間、ID、類型 |
| `請假記錄` | 記錄每筆請假申請，欄位：時間、ID、請假原因、已知會導師、已知會主管 |

---

## 步驟二：部署 Apps Script Web App

1. 開啟 Google Sheet → 上方選單 **擴充功能 → Apps Script**
2. 將 `apps-script.js` 的內容貼入編輯器，取代預設的空白函式
3. 修改頂部的 `serviceToken`：

   ```js
   const CONFIG = {
     serviceToken: "your-secret-token-here", // 自訂一組密碼字串
     sheets: {
       checkin: "簽到記錄",
       leave:   "請假記錄",
     },
   };
   ```

4. 點選右上角 **部署 → 新增部署作業**：

   | 設定項目 | 選擇 |
   |----------|------|
   | 類型 | 網頁應用程式 |
   | 執行身分 | 我（自己的帳號） |
   | 誰可以存取 | 所有人 |

5. 點「部署」→ 授權權限 → 複製產生的 **網頁應用程式 URL**

---

## 步驟三：填入 URL

將上一步取得的 URL 填入 `index.html` 和 `leave.html` 頂部的 `CONFIG`：

**index.html**
```js
const CONFIG = {
  scriptUrl: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
  cooldownMs: 5000,
};
```

**leave.html**
```js
const CONFIG = {
  scriptUrl: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
};
```

> 兩個頁面填入**同一個 URL** 即可，Apps Script 透過 `action` 欄位區分是簽到還是請假。

---

## 步驟四：部署到 GitHub Pages

```bash
git add .
git commit -m "setup elma-checkin"
git push origin main
```

GitHub Pages 設定：repo → Settings → Pages → Branch: `main`

---

## 使用方式

### 點名頁面（老師使用）

```
https://topchurchtechs.github.io/elma-checkin/?serviceToken=你的TOKEN
```

- 開啟後選擇**簽到**或**簽退**模式
- 將學生 QR Code 對準相機即自動送出
- URL 中的 `serviceToken` 讀取後會自動從網址列消失
- 送出成功或失敗都會有 toast 通知

### 請假申請（學生 / 家長使用）

```
https://topchurchtechs.github.io/elma-checkin/leave.html
```

- 點「掃描 QR Code」展開相機 → 掃學生 QR Code → 自動填入學號，並顯示姓名確認
- 也可直接手動輸入學號
- 填寫請假原因、選擇是否已知會導師與主管
- 按「送出請假申請」，等待確認後顯示成功 / 失敗

### QR Code 單筆產生器（管理員使用）

```
https://topchurchtechs.github.io/elma-checkin/generate-qr-jwt.html
```

- 填入學生 ID 與姓名即可產生單張 QR Code
- 適合補發或測試個別學生識別碼

### QR Code 批次產生器（管理員使用）

```
https://topchurchtechs.github.io/elma-checkin/generate-qr-batch.html
```

- 上傳 CSV 檔案，自動為每位學生產生識別卡
- 可下載個別 PNG、打包 ZIP、或直接列印
- 支援拖曳上傳，可自訂欄位對應

---

## serviceToken 說明

`serviceToken` 是防止外人任意寫入 Google Sheet 的機制。

- **自訂一組夠長的字串**，例如 `elma2026-xK9mP2vQ7rN5`
- 只將帶有此 token 的連結分享給負責點名的老師
- Apps Script 收到請求後驗證此值，token 不符則回傳錯誤，**不寫入 Sheet**

---

## 批次產生學生 QR Code

開啟 `generate-qr-batch.html`，上傳 CSV 後即可在瀏覽器內直接產生識別卡，不需安裝任何軟體。

### CSV 格式

```csv
id,name
S001,王小明
S002,李大華
S003,陳美玲
```

- 第一列為標題列，欄位名稱可自訂（上傳後可在網頁上選擇對應欄位）
- 預設以第 1 欄為學號、第 2 欄為姓名

### 輸出

| 操作 | 說明 |
|------|------|
| 點擊識別卡 | 下載單張 PNG |
| 下載全部 ZIP | 打包所有識別卡為 `elma-qrcodes.zip` |
| 列印 | 觸發瀏覽器列印，自動排版為 3 欄格式 |

---

## 學生 QR Code 規格

QR Code 內容為 JWT 格式，payload 需包含：

```json
{
  "id": "S001",
  "name": "王小明"
}
```

> `generate-qr-jwt.html` 與 `generate-qr-batch.html` 產生的為**無簽章 JWT**，僅供測試。
> 正式環境建議在後端用 `HS256` 簽署後再印製學生識別證。
