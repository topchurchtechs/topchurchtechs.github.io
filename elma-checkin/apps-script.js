// ─── 設定區 ────────────────────────────────────────────────────────────────
const CONFIG = {
  serviceToken: "your-secret-token-here", // 與 index.html 相同的 token

  sheets: {
    checkin: "簽到記錄",
    leave:   "請假記錄",
  },
};
// ───────────────────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    switch (body.action) {
      case "checkin": return handleCheckin(body);
      case "leave":   return handleLeave(body);
      default:        return respond(false, "未知的 action：" + body.action);
    }
  } catch (err) {
    return respond(false, "解析失敗：" + err.message);
  }
}

// ─── 簽到 / 簽退 ───────────────────────────────────────────────────────────
function handleCheckin(body) {
  const { id, type, serviceToken } = body;

  if (serviceToken !== CONFIG.serviceToken) {
    return respond(false, "無效的 serviceToken");
  }
  if (!id) {
    return respond(false, "缺少必要欄位（id）");
  }

  const now  = new Date();
  const date = Utilities.formatDate(now, "Asia/Taipei", "yyyy-MM-dd");

  const sheet = getOrCreateSheet(CONFIG.sheets.checkin, ["時間", "ID", "類型", "日期"]);
  sheet.appendRow([now, id, type ?? "", date]);

  return respond(true);
}

// ─── 請假 ──────────────────────────────────────────────────────────────────
function handleLeave(body) {
  const { id, date, reason, mentor, supervisor } = body;

  if (!id || !date || !reason || !mentor) {
    return respond(false, "缺少必要欄位（id, date, reason, mentor）");
  }

  const sheet = getOrCreateSheet(CONFIG.sheets.leave, ["送出時間", "請假日期", "ID", "請假原因", "已知會導師", "已知會主管"]);
  sheet.appendRow([new Date(), date, id, reason, mentor ?? "", supervisor ?? ""]);

  return respond(true);
}

// ─── 工具函式 ──────────────────────────────────────────────────────────────
function getOrCreateSheet(name, headers) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function respond(ok, error) {
  const payload = ok ? { ok: true } : { ok: false, error };
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
