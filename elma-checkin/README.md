# ELMA 點名系統

卓越領袖事奉學院（Excellence Leadership Ministry Academy）QR Code 掃描點名系統。

---

## 系統架構

```
老師開啟點名頁面（含 serviceToken）
  → 選擇簽到 / 簽退
  → 掃描學生 QR Code（JWT）
  → 自動送出到 Google 表單
  → Apps Script 驗證 serviceToken，無效則刪除該筆記錄
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

## 步驟一：設定 Google 表單（點名用）

1. 建立一份新的 Google 表單，加入以下 **3 個簡答欄位**，標題需完全一致：

   | 欄位標題 | 說明 |
   |----------|------|
   | `id` | 學生 ID |
   | `type` | 簽到類型（`簽到` 或 `簽退`） |
   | `serviceToken` | 驗證用 token |

2. 表單右上角三點選單 → **建立回應試算表**（Apps Script 需要用到）

3. 取得各欄位的 `entry ID`：
   - 表單預覽頁面右上角 → **取得預填連結**
   - 在每個欄位隨便填一個值 → 點「取得連結」
   - 複製網址，從中找到 `entry.XXXXXXXXXX=` 的數字部分

---

## 步驟二：修改 `index.html`

找到檔案頂部的 `CONFIG` 區塊，填入剛才取得的資訊：

```js
const CONFIG = {
  formAction: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse",
  fields: {
    id:           "entry.XXXXXXXXXX",
    type:         "entry.XXXXXXXXXX",
    serviceToken: "entry.XXXXXXXXXX",
  },
  cooldownMs: 5000, // 同一學生重複掃描的冷卻時間（毫秒）
};
```

---

## 步驟三：安裝 Apps Script 驗證器

1. 開啟 Google 表單 → 右上角三點選單 → **指令碼編輯器**
2. 將 `apps-script-validator.js` 的內容貼入編輯器
3. 修改頂部設定：

   ```js
   const VALID_SERVICE_TOKEN = "your-secret-token-here"; // 自訂一組密碼字串
   ```

4. 點選左側 **觸發條件**（鬧鐘圖示）→ 新增觸發條件：

   | 設定項目 | 選擇 |
   |----------|------|
   | 函式 | `onFormSubmit` |
   | 事件來源 | 表單 |
   | 事件類型 | 提交表單 |

5. 儲存並授權權限

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

`serviceToken` 是防止外人任意寫入 Google 表單的機制。

- **自訂一組夠長的字串**，例如 `elma2026-xK9mP2vQ7rN5`
- 只將帶有此 token 的連結分享給負責點名的老師
- Apps Script 會在每次有人提交表單後驗證此值，token 不符則自動刪除該筆記錄

---

## 批次產生學生 QR Code（瀏覽器工具）

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

## 請假申請設定（leave.html）

`leave.html` 使用獨立的 Google 表單，與點名系統無關，不需要 serviceToken。

### 步驟一：新建 Google 表單

1. 建立一份新的 Google 表單，加入以下 **4 個欄位**：

   | 欄位標題 | 類型 | 說明 |
   |----------|------|------|
   | `id` | 簡答 | 學生 ID |
   | `reason` | 段落 | 請假原因 |
   | `mentor` | 簡答 | 是否已知會導師（`是` 或 `否`） |
   | `supervisor` | 簡答 | 是否已知會主管（`是` 或 `否`，實習生填寫） |

2. 點選右上角三點選單 → **建立回應試算表**

3. 取得各欄位的 `entry ID`：
   - 點選 **眼睛圖示**（預覽表單）
   - 右上角三點選單 → **取得預填連結**
   - 每個欄位各填一個值 → 點「取得連結」
   - 從網址找出 `entry.XXXXXXXXXX=` 的數字部分

### 步驟二：修改 `leave.html`

找到檔案頂部的 `CONFIG` 區塊，填入剛才取得的資訊：

```js
const CONFIG = {
  formAction: "https://docs.google.com/forms/d/e/YOUR_LEAVE_FORM_ID/formResponse",
  fields: {
    id:         "entry.XXXXXXXXXX",
    reason:     "entry.XXXXXXXXXX",
    mentor:     "entry.XXXXXXXXXX",
    supervisor: "entry.XXXXXXXXXX",
  },
};
```

### 使用方式

直接開啟（不需帶任何參數）：

```
https://topchurchtechs.github.io/elma-checkin/leave.html
```

- 點「掃描 QR Code」展開相機 → 掃學生 QR Code → 自動填入學號，並顯示姓名確認
- 也可直接手動輸入學號
- 填寫請假原因、勾選是否已知會導師與主管
- 按「送出請假申請」後，Google Sheet 會新增一筆記錄

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
