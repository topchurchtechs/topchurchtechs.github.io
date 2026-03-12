# ELMA 點名系統

卓越領袖事奉學院（Excellence Leadership Ministry Academy）QR Code 掃描點名系統。

---

## 系統架構

```
老師開啟點名頁面（含 serviceToken）
  → 選擇班別
  → 掃描學生 QR Code（JWT）
  → 自動送出到 Google 表單
  → Apps Script 驗證 serviceToken，無效則刪除該筆記錄
```

---

## 步驟一：設定 Google 表單

1. 建立一份新的 Google 表單，加入以下 **4 個簡答欄位**，標題需完全一致：

   | 欄位標題 | 說明 |
   |----------|------|
   | `id` | 學生 ID |
   | `name` | 學生姓名 |
   | `class` | 班別 |
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
    name:         "entry.XXXXXXXXXX",
    className:    "entry.XXXXXXXXXX",
    serviceToken: "entry.XXXXXXXXXX",
  },
  cooldownMs: 5000, // 同一學生重複掃描的冷卻時間（毫秒）
};
```

同樣修改 `index.html` 的班別選單，換成實際的班別名稱：

```html
<select id="class-select">
  <option value="">— 選擇班別 —</option>
  <option value="classA">classA</option>
  <option value="classB">classB</option>
  <option value="classC">classC</option>
</select>
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

- 開啟後選擇班別
- 將學生 QR Code 對準相機即自動簽到
- URL 中的 `serviceToken` 讀取後會自動從網址列消失

### QR Code 產生器（製作學生識別碼）

```
https://topchurchtechs.github.io/elma-checkin/generate-qr-jwt.html?serviceToken=你的TOKEN
```

- 填入學生 ID 與姓名即可產生 QR Code
- 需要相同的 `serviceToken` 才能進入頁面

---

## serviceToken 說明

`serviceToken` 是防止外人任意寫入 Google 表單的機制。

- **自訂一組夠長的字串**，例如 `elma2026-xK9mP2vQ7rN5`
- 只將帶有此 token 的連結分享給負責點名的老師
- Apps Script 會在每次有人提交表單後驗證此值，token 不符則自動刪除該筆記錄

---

## 批次產生學生 QR Code（Python 工具）

位於 `tools/` 目錄，從 CSV 一次產生所有學生的識別卡圖片。

### 安裝依賴

```bash
cd tools
pip3 install -r requirements.txt
```

### CSV 格式

```csv
id,name
S001,王小明
S002,李大華
S003,陳美玲
```

參考範本：`tools/students_example.csv`

### 用法

```bash
# 基本用法：產生個別 PNG
python3 generate_qrcodes.py students.csv

# 指定輸出目錄
python3 generate_qrcodes.py students.csv -o output

# 額外產生可列印的拼版圖（sheet.png）
python3 generate_qrcodes.py students.csv --sheet

# 拼版改為每列 4 張
python3 generate_qrcodes.py students.csv --sheet --cols 4

# CSV 欄位名稱不同時指定
python3 generate_qrcodes.py students.csv --id-col 學號 --name-col 姓名
```

### 輸出

| 檔案 | 說明 |
|------|------|
| `qrcodes/{id}_{name}.png` | 每位學生的個別識別卡 |
| `qrcodes/sheet.png` | 拼版圖（加 `--sheet` 才產生） |

---

## 學生 QR Code 規格

QR Code 內容為 JWT 格式，payload 需包含：

```json
{
  "id": "S001",
  "name": "王小明"
}
```

> `generate-qr-jwt.html` 產生的為**無簽章 JWT**，僅供測試。
> 正式環境建議在後端用 `HS256` 簽署後再印製學生識別證。
