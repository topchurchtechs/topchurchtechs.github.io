// 啟動掃描器
const URLParams = new URLSearchParams(window.location.search);

var sid = URLParams.get('sid');
var sname = URLParams.get('sname');
var class_number = URLParams.get('class_number');
$('#sid').text(sid);
$('#sname').text(sname);
$('#class_number').text(class_number);