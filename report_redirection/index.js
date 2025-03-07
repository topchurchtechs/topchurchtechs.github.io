liff.init({
    'liffId':  '1657500742-LzQ6REdP',
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
            let line_group_uid = context.groupId;
            let line_uid = profile.userId;
            let displayName = profile.displayName;
            let pictureUrl = profile.pictureUrl;
            let data = {
                'action': '人數回報頁面',
                'line_group_uid': line_group_uid,
                'line_uid': line_uid,
                'line_displayName': displayName,
                'line_pictureUrl': pictureUrl
            };
            console.log(data);
            let form = document.createElement('form');
            form.method = 'post';
            form.action = "https://script.google.com/macros/s/AKfycby0XnHsAFNJHljxv2aspfaK3lwXnRRr-67orlZhqegd3ryvJ5ffPmNuAgjw_1DtI1cQdw/exec"
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
