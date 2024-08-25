// 啟動掃描器
const URLParams = new URLSearchParams(window.location.search);

var sid = URLParams.get('sid');
var sname = URLParams.get('sname');
$("[id='sid']").val(sid);
$("[id='sname']").val(sname);