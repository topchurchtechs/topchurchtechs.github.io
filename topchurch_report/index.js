function googleForm() { //這裡要對應到自己的 javascript 名稱
    //宣告欄位
    var field1 = $("[name='SID']").val();
    var field2 = $("[name='Name']").val();
    var field3 = $("[name='ClassNumber']").val();
    $.ajax({
        url: "https://docs.google.com/forms/u/0/d/e/1FAIpQLScLR1R1RSU05rsT95PKCn6oLt1Gu40l6F54ut-TG9ptdW0JjQ/formResponse", //Google Form 裡面的 form action 網址 ＊＊記得要填＊＊
        data: { //Google Form 裡面的欄位 name ＊＊記得要改＊＊
            "entry.228731780": field1,
            "entry.354152482": field2,
            "entry.2082748086": field3
        },
        type: "POST",
        dataType: "xml",
        statusCode: {
            0: function() {
                alert("已送出!"); //完成送出表單的警告視窗
                // window.location.assign("http://google.com"); //送出表單後的導向
            },
            200: function() {
                alert("已送出!"); //完成送出表單的警告視窗
                // window.location.assign("http://google.com"); //送出表單後的導向
            }
        }
    });
}

function onScanSuccess(decodedText, decodedResult) {
    // 當QR code掃描成功時，顯示掃描結果
    document.getElementById("result").innerText = `Scanned Result: ${decodedText}`;
    let sid = decodedText.split(",")[0];
    let name = decodedText.split(",")[1];
    $("[name='SID']").val(sid);
    $("[name='Name']").val(name);
}

function onScanFailure(error) {
    // 當掃描失敗時，可以在此處處理錯誤
    console.warn(`QR code scan failed: ${error}`);
}

// 創建Html5QrcodeScanner物件
let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 10, qrbox: 250 }
);

// 啟動掃描器
html5QrcodeScanner.render(onScanSuccess, onScanFailure);