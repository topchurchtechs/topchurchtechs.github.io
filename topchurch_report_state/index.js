const URLParams = new URLSearchParams(window.location.search);
var html5QrCode;

function fetchState(sid, sname) {
    const apiUrl = 'https://script.google.com/macros/s/AKfycbyuSA79pHmYWVRtxWTXmcb2YfhdrS9DEBXakBq1kxiwQnMCphx1Vy80zosIWKAjVDnB/exec?action=get_state&sid=' + sid + '&sname=' + sname;
    console.log(apiUrl);
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.result === 'ok') {
                $("[name='state1']").val(data.data[1]);
                $("[name='state2']").val(data.data[2]);
                $("[name='state3']").val(data.data[3]);
                $("[name='state4']").val(data.data[4]);
                $("[name='state5']").val(data.data[5]);
            } else {
                // 顯示錯誤訊息
                alert(data.error);
            }
        })
        .catch(error => {
            // 顯示錯誤訊息
            alert(error);
        });
}

function onScanSuccess(decodedText, decodedResult) {
    // 當QR code掃描成功時，顯示掃描結果
    let data = decodedText.split(",");
    if (data.length == 2) {
        let sid = data[0];
        let sname = data[1];
        fetchState(sid, sname)

        $("#google_from").css("display", "block"); // Show the google_from div
        $("#reader").css("display", "none");     // Hide the reader div
        
        html5QrCode.stop().then((ignore) => {
            // 停止掃描
        }).catch((err) => {
            // 停止失敗
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

    html5QrCode = new Html5Qrcode(/* element id */ "reader");
    $("#cancel_btn").click(function() {
        startScan();
        $("#google_from").css("display", "none"); // Hide the google_from div
        $("#reader").css("display", "block");     // Show the reader div
    });

    if (URLParams.has('sid') && URLParams.has('sname')) {
        fetchState(URLParams.get('sid'), URLParams.get('sname'))
        $("#google_from").css("display", "block"); // Show the google_from div
        $("#reader").css("display", "none");     // Hide the reader div
    }
    else {
        startScan();
    }
}

init();