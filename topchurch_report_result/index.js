// 啟動掃描器
const URLParams = new URLSearchParams(window.location.search);

var sid = URLParams.get('sid');
var sname = URLParams.get('sname');
$('#sid').text(sid);
$('#sname').text(sname);