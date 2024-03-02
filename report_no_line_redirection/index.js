let server_pool = [
    "https://script.google.com/macros/s/AKfycbzNC2gGh_sMIkDFOOMP6PvbI6YiYcve4tf8bqVnu68i1Sd_6pbdsMOWIkxtyHVMlmcKHw/exec",
    "https://script.google.com/macros/s/AKfycbzRZ4ApqnEakffYwSNl-W28-hHyW0wjbihj9sCLPC_HFcKB-iKogYR0mrvOrmsg2j4N/exec",
    "https://script.google.com/macros/s/AKfycbxmwohMkX8ttSs7GUFL-kT4wxkUPA6z4Tn-BJhCQOpt7SeTTMJC9wm2qaZ5D13PJzTRqQ/exec",
    "https://script.google.com/macros/s/AKfycby2HPmko8uHSVXWPC0wte8JPj5aHg4EZr--2V6VuGCHmQNhFqxsygW2DkAqhvC523Bkjw/exec",
    "https://script.google.com/macros/s/AKfycbyOwBOFi7Tnfe8XJKQtQY1OmyM_rogMTngtTL5letv-TfrHIEwgXLj8dkU9Q1s7oHML/exec",
    "https://script.google.com/macros/s/AKfycbzPddk7ptO-QZraJO1DCVJIVyrwjrJOOGvIs8XQOHTSLIhkNRk_5MTI5IGY8y_lK5wEvA/exec",
    "https://script.google.com/macros/s/AKfycbz-cAVoq4PLQ9ia20tL4duh6zV99IKAcunwVaPpXS8L0HXt_mKTicb1pvUO4S55OBr3wQ/exec",
    "https://script.google.com/macros/s/AKfycbzpb6ofVmfnTJdWcX-Yoh6RZYwTcDYoSqL5m3yIjlKuof1QjbPrpgbdGOQo_ACTojSKEA/exec",
    "https://script.google.com/macros/s/AKfycbyq0xmKfc43NdzZgc8JGa0YJQ45QzGJllFALFQyI2VlBrWNdPuhMCcLEU5tMHiNj_5AdQ/exec"
];
let r = Math.floor(Math.random() * 9);


let form = document.createElement('form');
form.method = 'get';
form.action = server_pool[r];
document.body.appendChild(form);
form.submit();
