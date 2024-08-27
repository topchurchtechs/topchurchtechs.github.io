const URLParams = new URLSearchParams(window.location.search);
var key = "0";
var html5QrcodeScanner;
var html5QrCode;

function googleForm() { //這裡要對應到自己的 javascript 名稱
    //宣告欄位
    var field1 = $("[name='sid']").val();
    var field2 = $("[name='sname']").val();
    var field3 = $("[name='class_number']").val();
    var field4 = key;
    if (!field1) {
        alert("編號不能為空")
        return;
    }
    else if (!field2) {
        alert("姓名不能為空")
        return;
    }
    else if (!field3 || field3 == "") {
        alert("課堂不能為空，請掃描表單QR code")
        return;
    }
    else if (!field4) {
        alert("表單錯誤，請掃描表單QR code")
        return;
    }
    $.ajax({
        url: "https://docs.google.com/forms/u/0/d/e/1FAIpQLScLR1R1RSU05rsT95PKCn6oLt1Gu40l6F54ut-TG9ptdW0JjQ/formResponse", //Google Form 裡面的 form action 網址 ＊＊記得要填＊＊
        data: { //Google Form 裡面的欄位 name ＊＊記得要改＊＊
            "entry.228731780": field1,
            "entry.354152482": field2,
            "entry.2082748086": field3,
            "entry.311567085": field4
        },
        type: "POST",
        dataType: "xml",
        statusCode: {
            0: function() {
                alert(`${field1} ${field2} 報到成功!`); //完成送出表單的警告視窗
                window.location.assign(`https://topchurchtechs.github.io/topchurch_report_result?sid=${field1}&sname=${field2}&class_number=${field3}`); //送出表
                // $("#google_from").css("display", "none"); // Hide the google_from div
                // $("#reader").css("display", "block");     // Show the reader div單後的導向
            },
            200: function() {
                alert(`${field1} ${field2} 報到成功!`); //完成送出表單的警告視窗
                window.location.assign(`https://topchurchtechs.github.io/topchurch_report_result?sid=${field1}&sname=${field2}&class_number=${field3}`); //送出表
                // $("#google_from").css("display", "none"); // Hide the google_from div
                // $("#reader").css("display", "block");     // Show the reader div
            }
        }
    });
}

function onScanSuccess(decodedText, decodedResult) {
    // 當QR code掃描成功時，顯示掃描結果
    let data = decodedText.split(",");
    if (data.length == 2) {
        let sid = data[0];
        let sname = data[1];
        $("[name='sid']").val(sid);
        $("[name='sname']").val(sname);
        $("#google_from").css("display", "block"); // Show the google_from div
        $("#reader").css("display", "none");     // Hide the reader div
        // html5QrcodeScanner.pause();
        html5QrCode.stop().then((ignore) => {
            // 停止扫描
        }).catch((err) => {
            // 停止失败处理
        });
    }
}

function startScan() {
    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,    // 帧率，控制扫描速度
            qrbox: 300 // { width: 250, height: 250 }  // 限制要用于扫描的取景器区域
        },
        onScanSuccess,
        (errorMessage) => {
            // 结果错误处理
        })
        .catch((err) => {
            // 无法扫描时的错误处理
        }
    );
}

function init() {
    if (URLParams.has('class_number')) {
        $("[name='class_number']").val(URLParams.get('class_number'));
    }
    if (URLParams.has("key")) {
        key = URLParams.get('key');
    }

    // // 創建Html5QrcodeScanner物件
    // html5QrcodeScanner = new Html5QrcodeScanner(
    //     "reader", { fps: 10, qrbox: 250 } // qrbox 的大小是長寬最小值的 50%
    // );
    // html5QrcodeScanner.render(onScanSuccess, onScanFailure, { facingMode: "environment" });

    html5QrCode = new Html5Qrcode(/* element id */ "reader");
    startScan();

    $("#cancel_btn").click(function() {
        startScan();
        // html5QrcodeScanner.resume();
        $("#google_from").css("display", "none"); // Hide the google_from div
        $("#reader").css("display", "block");     // Show the reader div
    });
}

init();