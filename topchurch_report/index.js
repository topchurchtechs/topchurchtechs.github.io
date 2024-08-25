// 啟動掃描器
const URLParams = new URLSearchParams(window.location.search);

var class_number = URLParams.get('class_number');
$("[name='class_number']").val(class_number);

function googleForm() { //這裡要對應到自己的 javascript 名稱
    //宣告欄位
    var field1 = $("[name='sid']").val();
    var field2 = $("[name='sname']").val();
    var field3 = $("[name='class_number']").val();
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
                alert(`${field1} ${field2} 成功報到!`); //完成送出表單的警告視窗
                window.location.assign(`https://topchurchtechs.github.io/topchurch_report_result?sid=${field1}&sname=${field2}`); //送出表單後的導向
            },
            200: function() {
                alert(`${field1} ${field2} 成功報到!`); //完成送出表單的警告視窗
                window.location.assign(`https://topchurchtechs.github.io/topchurch_report_result?sid=${field1}&sname=${field2}`); //送出表單後的導向
            }
        }
    });
}

function onScanSuccess(decodedText, decodedResult) {
    // 當QR code掃描成功時，顯示掃描結果
    let sid = decodedText.split(",")[0];
    let sname = decodedText.split(",")[1];
    $("[name='sid']").val(sid);
    $("[name='sname']").val(sname);
}

function onScanFailure(error) {
    // 當掃描失敗時，可以在此處處理錯誤
    console.warn(`QR code scan failed: ${error}`);
}

// 創建Html5QrcodeScanner物件
let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 10, qrbox: 250 }
);

html5QrcodeScanner.render(onScanSuccess, onScanFailure);