liff.init({
    'liffId':  '1657754998-43Wx5y06',
}).then(function() {
    // 這邊開始寫使用其他功能

    if (!liff.isLoggedIn()){
        liff.login();
    }
    else {
        liff.getProfile()
        .then(profile => {
            let line_uid = profile.userId;
            var hash = CryptoJS.HmacSHA256(line_uid, '20260101JesusLovesYou');
            hash = hash.toString(CryptoJS.enc.Hex);
            let value = 0;
            for(let i = 0; i < hash.length; i++) {
              value += hash.charCodeAt(i);
            }
            value = (value%223)+1
            let div_container = document.getElementById('div_container');
            div_container.innerHTML=`<img class="img_card" src="img/2026 跨年經文卡${value}.jpg">`
            // div_container.innerHTML=`<img class="img_card" src="img/2026 跨年經文卡 測試.jpg">`
    return;
        })
        .catch((err) => {
            liff.logout();
            location.reload();
            alert(`profile err: ${err}`);
        });
    }
    
}).catch(function(err) {
    alert(`init err: ${err}`);
});
