liff.init({
    'liffId':  '1657754998-0GN7L1kO',
}).then(function() {
    // 這邊開始寫使用其他功能
    const context = liff.getContext();
    console.log(context);
    if (!liff.isLoggedIn()){
        liff.login();
    }
    else {
        liff.getProfile()
        .then(profile => {
            let server_pool = [
                "https://script.google.com/macros/s/AKfycbzNC2gGh_sMIkDFOOMP6PvbI6YiYcve4tf8bqVnu68i1Sd_6pbdsMOWIkxtyHVMlmcKHw/exec",
                "https://script.google.com/macros/s/AKfycbzRZ4ApqnEakffYwSNl-W28-hHyW0wjbihj9sCLPC_HFcKB-iKogYR0mrvOrmsg2j4N/exec",
                "https://script.google.com/macros/s/AKfycbxmwohMkX8ttSs7GUFL-kT4wxkUPA6z4Tn-BJhCQOpt7SeTTMJC9wm2qaZ5D13PJzTRqQ/exec",
                "https://script.google.com/macros/s/AKfycby2HPmko8uHSVXWPC0wte8JPj5aHg4EZr--2V6VuGCHmQNhFqxsygW2DkAqhvC523Bkjw/exec",
                "https://script.google.com/macros/s/AKfycbyOwBOFi7Tnfe8XJKQtQY1OmyM_rogMTngtTL5letv-TfrHIEwgXLj8dkU9Q1s7oHML/exec",
                "https://script.google.com/macros/s/AKfycbzPddk7ptO-QZraJO1DCVJIVyrwjrJOOGvIs8XQOHTSLIhkNRk_5MTI5IGY8y_lK5wEvA/exec",
                "https://script.google.com/macros/s/AKfycbz-cAVoq4PLQ9ia20tL4duh6zV99IKAcunwVaPpXS8L0HXt_mKTicb1pvUO4S55OBr3wQ/exec",
                "https://script.google.com/macros/s/AKfycbzpb6ofVmfnTJdWcX-Yoh6RZYwTcDYoSqL5m3yIjlKuof1QjbPrpgbdGOQo_ACTojSKEA/exec",
                "https://script.google.com/macros/s/AKfycbx2YR4LxMG9qb8KpHKnKv6Wawtxup7KGl0f63gY6-Cgz68OhaEri3hnRy8uLFcXZzmriw/exec",
                "https://script.google.com/macros/s/AKfycbwcbu3NYj8dnWmvmb_m_XiP0Dzd1Ak0Oh_zcR88Po2C9paxsRVTRDD0MphRkMJF3_fl/exec",
                "https://script.google.com/macros/s/AKfycbwYo80cfKatqLg8zz_2ozJYygqsNM8fpbhXVnmjraDrE19aMl6AMzRwgwDhrU61p4qv/exec",
                "https://script.google.com/macros/s/AKfycbxktTqxYH3yCE8rgdpjXRn2QV2VdlrsGrgNei_p8Lo61r_owynzt2arcTJf6LKJp48S9w/exec"
            ];
            let r = Math.floor(Math.random() * 12);

            let line_group_uid = context.groupId;
            let line_uid = profile.userId;
            let displayName = profile.displayName;
            let pictureUrl = profile.pictureUrl;
            let data = {
                'action': '報到頁面',
                'line_group_uid': line_group_uid,
                'line_uid': line_uid,
                'line_displayName': displayName,
                'line_pictureUrl': pictureUrl
            };
            console.log(data);
            let form = document.createElement('form');
            form.method = 'post';
            form.action = server_pool[r];
            document.body.appendChild(form);
    
            for (const key in data) {
                const formField = document.createElement('input');
                formField.type = 'hidden';
                formField.name = key;
                formField.value = data[key];
    
                form.appendChild(formField);
            }
            form.submit();
        })
        .catch((err) => {
            alert(`profile err: ${err}`);
        });
    }
    
}).catch(function(err) {
    alert(`init err: ${err}`);
});
