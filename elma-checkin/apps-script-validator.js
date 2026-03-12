/**
 * Google Apps Script — 表單提交驗證器
 *
 * 安裝方式：
 *  1. 開啟你的 Google 表單 → 右上角三點選單 → 「指令碼編輯器」
 *  2. 貼上此程式碼，修改 VALID_SERVICE_TOKEN
 *  3. 存檔後點選「觸發條件」(鬧鐘圖示)
 *  4. 新增觸發條件：
 *       函式：onFormSubmit
 *       事件來源：表單
 *       事件類型：提交表單
 *  5. 授權權限後儲存
 */

// ─── 設定區 ────────────────────────────────────────────────────────────────────
const VALID_SERVICE_TOKEN = "your-secret-token-here"; // 與網頁端 serviceToken 相同

// Google 試算表中 serviceToken 欄位的「欄標題」（與表單欄位名稱一致）
const SERVICE_TOKEN_COLUMN_TITLE = "serviceToken";
// ───────────────────────────────────────────────────────────────────────────────

/**
 * 表單提交觸發函式
 * 當有新的表單回應時自動執行，若 serviceToken 不符則刪除該筆資料
 */
function onFormSubmit(e) {
  try {
    const responses   = e.response.getItemResponses();
    const submittedAt = e.response.getTimestamp();

    // 找出 serviceToken 欄位的回應值
    let submittedToken = null;
    for (const r of responses) {
      if (r.getItem().getTitle() === SERVICE_TOKEN_COLUMN_TITLE) {
        submittedToken = r.getResponse();
        break;
      }
    }

    if (submittedToken !== VALID_SERVICE_TOKEN) {
      // Token 不符 → 刪除此筆回應
      e.response.withItemGrades([]).submit(); // 不影響，僅確保無分數
      deleteLastResponseFromSheet(submittedAt);
      Logger.log(`[拒絕] 無效 Token：${submittedToken}，時間：${submittedAt}`);
    } else {
      Logger.log(`[接受] 有效提交，時間：${submittedAt}`);
    }
  } catch (err) {
    Logger.log("onFormSubmit 發生錯誤：" + err.message);
  }
}

/**
 * 從試算表刪除與該時間戳記最接近的那一列
 * （因 Apps Script 無法直接刪除 FormResponse，改為從連結試算表刪除）
 */
function deleteLastResponseFromSheet(targetTimestamp) {
  // 取得與表單連結的試算表（需先在表單中「建立試算表」）
  const form     = FormApp.getActiveForm();
  const destUrl  = form.getDestinationId();
  if (!destUrl) {
    Logger.log("表單尚未連結試算表，無法刪除列");
    return;
  }

  const sheet = SpreadsheetApp.openById(destUrl).getSheets()[0];
  const data  = sheet.getDataRange().getValues();

  // 第一列為標題，從第二列開始
  // 第一欄通常是 Google 自動加入的「時間戳記」
  for (let i = data.length - 1; i >= 1; i--) {
    const rowTimestamp = data[i][0];
    if (rowTimestamp instanceof Date) {
      const diff = Math.abs(rowTimestamp.getTime() - targetTimestamp.getTime());
      if (diff < 5000) { // 5 秒內視為同一筆
        sheet.deleteRow(i + 1); // sheet 列號從 1 開始
        Logger.log(`已刪除第 ${i + 1} 列（時間：${rowTimestamp}）`);
        return;
      }
    }
  }
  Logger.log("找不到對應列，未刪除任何資料");
}
