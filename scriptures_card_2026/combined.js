// 設定活動開始時間: 2026-01-01 00:00:00
const eventStartTime = new Date('2026-01-01T00:00:00+08:00').getTime();
let hasEventStarted = false;
let liffReady = false;
let userProfile = null;

// ============= 方案 4: 混合方案 (localStorage + 設備指紋) =============

// 簡單的 hash 函數
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// 生成 Canvas 指紋
function getCanvasFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        ctx.textBaseline = 'top';
        ctx.font = '14px "Arial"';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Scripture Card 2026 🙏', 2, 15);

        return canvas.toDataURL();
    } catch (e) {
        return 'canvas-error';
    }
}

// 生成設備指紋
function generateDeviceFingerprint() {
    const components = {
        userAgent: navigator.userAgent || 'unknown',
        language: navigator.language || 'unknown',
        screenRes: `${screen.width}x${screen.height}x${screen.colorDepth}`,
        timezone: new Date().getTimezoneOffset(),
        platform: navigator.platform || 'unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: navigator.deviceMemory || 0,
        canvas: getCanvasFingerprint()
    };

    const fingerprintString = JSON.stringify(components);
    return 'fp_' + simpleHash(fingerprintString);
}

// 獲取或創建穩定的用戶 ID
function getStableUserId() {
    const STORAGE_KEY = 'scripture_card_user_id';

    // 1. 先檢查 localStorage
    let storedId = localStorage.getItem(STORAGE_KEY);

    if (storedId) {
        console.log('使用已存儲的用戶 ID:', storedId);
        return storedId;
    }

    // 2. 生成設備指紋作為備份
    const fingerprint = generateDeviceFingerprint();
    console.log('生成新的設備指紋 ID:', fingerprint);

    // 3. 保存到 localStorage
    try {
        localStorage.setItem(STORAGE_KEY, fingerprint);
    } catch (e) {
        console.warn('無法保存到 localStorage:', e);
    }

    return fingerprint;
}

// 檢查日期是否有效
if (isNaN(eventStartTime)) {
    console.error('無效的活動開始時間');
    document.getElementById('countdown').innerHTML = '<p style="color: #fff;">時間設定錯誤，請聯繫管理員</p>';
}

// 頁面載入時就初始化 LIFF
function initLiff() {
    liff.init({
        'liffId': '1657754998-43Wx5y06',
    }).then(function() {
        if (!liff.isLoggedIn()) {
            // 如果未登入，使用方案 4 的混合方案
            console.log('用戶未登入 LINE，使用替代方案生成唯一 ID');
            const stableUserId = getStableUserId();
            userProfile = {
                userId: stableUserId,
                displayName: '訪客',
                isAnonymous: true
            };
            liffReady = true;
            console.log('使用替代 ID:', stableUserId);
        } else {
            // 已登入，提前取得個人資料
            liff.getProfile()
                .then(profile => {
                    userProfile = profile;
                    userProfile.isAnonymous = false;
                    liffReady = true;
                    console.log('LIFF 已就緒，使用者已登入 LINE');
                    console.log('LINE User ID:', profile.userId);
                })
                .catch((err) => {
                    console.error('取得個人資料失敗:', err);
                    // 取得 profile 失敗，使用替代方案
                    const stableUserId = getStableUserId();
                    userProfile = {
                        userId: stableUserId,
                        displayName: '訪客',
                        isAnonymous: true
                    };
                    liffReady = true;
                    console.log('使用替代 ID (profile 失敗):', stableUserId);
                });
        }
    }).catch(function(err) {
        console.error('LIFF 初始化失敗:', err);
        // LIFF 初始化失敗（可能不在 LINE 環境），使用替代方案
        const stableUserId = getStableUserId();
        userProfile = {
            userId: stableUserId,
            displayName: '訪客',
            isAnonymous: true
        };
        liffReady = true;
        console.log('使用替代 ID (LIFF 失敗):', stableUserId);
    });
}

// 更新螢幕閱讀器可讀的倒數時間
function updateAriaLabel(days, hours, minutes, seconds) {
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        const ariaText = `距離活動開始還有 ${days} 天 ${hours} 小時 ${minutes} 分鐘 ${seconds} 秒`;
        countdownElement.setAttribute('aria-label', ariaText);
    }
}

// 安全地更新元素內容
function safeUpdateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = String(value).padStart(2, '0');
    } else {
        console.warn(`找不到元素: ${id}`);
    }
}

function updateCountdown() {
    if (hasEventStarted) {
        return;
    }

    try {
        const now = new Date().getTime();
        const distance = eventStartTime - now;

        // 如果活動已經開始，顯示經文卡
        if (distance < 0) {
            hasEventStarted = true;
            showScriptureCard();
            return;
        }

        // 計算時間
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // 驗證數值
        if (days < 0 || hours < 0 || minutes < 0 || seconds < 0) {
            throw new Error('計算出的時間值無效');
        }

        // 更新顯示
        safeUpdateElement('days', days);
        safeUpdateElement('hours', hours);
        safeUpdateElement('minutes', minutes);
        safeUpdateElement('seconds', seconds);

        // 更新螢幕閱讀器標籤
        if (seconds === 0) {
            updateAriaLabel(days, hours, minutes, seconds);
        }

    } catch (error) {
        console.error('更新倒數計時時發生錯誤:', error);
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            countdownElement.innerHTML = '<p style="color: #fff;">倒數計時出現問題，請重新整理頁面</p>';
        }
    }
}

// 顯示經文卡
function showScriptureCard() {
    const countdownContainer = document.getElementById('countdown-container');
    const cardContainer = document.getElementById('card-container');
    const cardWrapper = document.getElementById('card-wrapper');

    // 顯示轉場訊息
    countdownContainer.innerHTML = `
        <div class="transition-message">
            <p><span class="emoji">🎉</span> 經文卡已預備！</p>
            <p style="font-size: 0.7em; margin-top: 15px;">正在為您準備跨年經文<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span></p>
        </div>
    `;

    // 等待 LIFF 準備好
    waitForLiff().then(() => {
        // 0.5 秒後開始淡出倒數計時，並顯示經文卡
        setTimeout(() => {
            countdownContainer.classList.add('fade-out');

            setTimeout(() => {
                countdownContainer.classList.add('hidden');
                cardContainer.classList.add('show');

                // 載入經文卡
                loadScriptureCard();
            }, 500);
        }, 500);
    });
}

// 等待 LIFF 初始化完成
function waitForLiff() {
    return new Promise((resolve) => {
        // 如果已經準備好，直接返回
        if (liffReady) {
            resolve();
            return;
        }

        // 否則每 100ms 檢查一次
        const checkInterval = setInterval(() => {
            if (liffReady) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);

        // 設定最長等待時間 5 秒，避免無限等待
        setTimeout(() => {
            clearInterval(checkInterval);
            console.warn('LIFF 初始化超時，繼續執行');
            resolve();
        }, 5000);
    });
}

// 載入經文卡
function loadScriptureCard() {
    const cardWrapper = document.getElementById('card-wrapper');

    // 使用已經準備好的使用者資料
    if (userProfile && userProfile.userId) {
        // 根據 userId 產生專屬經文卡（不論是 LINE UID 還是設備指紋）
        let user_id = userProfile.userId;

        // 使用 CryptoJS 進行 hash（如果可用）
        var hash = CryptoJS.HmacSHA256(user_id, '20260101JesusLovesYou');
        hash = hash.toString(CryptoJS.enc.Hex);
        let value = 0;
        for(let i = 0; i < hash.length; i++) {
            value += hash.charCodeAt(i);
        }
        value = (value % 223) + 1;

        // 記錄用戶類型（用於調試）
        if (userProfile.isAnonymous) {
            console.log('為訪客用戶生成經文卡，卡片編號:', value);
        } else {
            console.log('為 LINE 用戶生成經文卡，卡片編號:', value);
        }

        // 建立圖片元素
        const img = document.createElement('img');
        img.className = 'img_card';
        img.alt = '2026跨年經文卡';
        img.src = `img/2026 跨年經文卡${value}.jpg`;

        // 圖片載入完成後才觸發動畫
        img.onload = function() {
            // 使用 requestAnimationFrame 確保瀏覽器準備好渲染
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    cardWrapper.classList.add('slide-in');
                });
            });
        };

        // 如果圖片載入失敗，也要顯示動畫（避免卡住）
        img.onerror = function() {
            console.error('圖片載入失敗');
            cardWrapper.classList.add('slide-in');
        };

        cardWrapper.appendChild(img);
    } else {
        // 這種情況理論上不應該發生，因為現在一定會有 userProfile
        console.error('無法取得使用者 ID');
        cardWrapper.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #333;">
                <p style="font-size: 3em; margin-bottom: 20px;">😔</p>
                <p style="font-size: 1.5em; font-weight: bold; margin-bottom: 15px; color: #e53e3e;">無法載入經文卡</p>
                <p style="font-size: 1.1em; margin-bottom: 25px; color: #666;">發生未預期的錯誤</p>
                <button onclick="location.reload()" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    font-size: 1.1em;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: bold;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                ">重新載入</button>
            </div>
        `;

        // 使用 requestAnimationFrame 確保 DOM 更新後再加動畫
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                cardWrapper.classList.add('slide-in');
            });
        });
    }
}

// 確保 DOM 載入完成後再執行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    // 先初始化 LIFF (處理登入)
    initLiff();
    // 再初始化倒數計時
    initCountdown();
}

function initCountdown() {
    // 初始化
    updateCountdown();
    // 每秒更新一次
    setInterval(updateCountdown, 1000);
}

// 處理頁面可見性變化
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        updateCountdown();
    }
});
