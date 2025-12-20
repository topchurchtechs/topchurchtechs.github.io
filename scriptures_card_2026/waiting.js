// 設定活動開始時間: 2026-01-01 00:00:00
const eventStartTime = new Date('2025-01-01T00:00:00+08:00').getTime();

// 檢查日期是否有效
if (isNaN(eventStartTime)) {
    console.error('無效的活動開始時間');
    document.getElementById('countdown').innerHTML = '<p style="color: #e53e3e;">時間設定錯誤，請聯繫管理員</p>';
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
    try {
        const now = new Date().getTime();
        const distance = eventStartTime - now;

        // 如果活動已經開始,跳轉到主頁面
        if (distance < 0) {
            // 顯示提示訊息
            const countdownElement = document.getElementById('countdown');
            if (countdownElement) {
                countdownElement.innerHTML = '<p style="color: #48bb78; font-size: 1.5em;">活動已開始！正在跳轉...</p>';
            }

            // 延遲跳轉,讓使用者看到訊息
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
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

        // 更新螢幕閱讀器標籤 (每分鐘更新一次,避免過於頻繁)
        if (seconds === 0) {
            updateAriaLabel(days, hours, minutes, seconds);
        }

    } catch (error) {
        console.error('更新倒數計時時發生錯誤:', error);
        // 顯示錯誤訊息給使用者
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            countdownElement.innerHTML = '<p style="color: #e53e3e;">倒數計時出現問題，請重新整理頁面</p>';
        }
    }
}

// 確保 DOM 載入完成後再執行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountdown);
} else {
    initCountdown();
}

function initCountdown() {
    // 初始化
    updateCountdown();

    // 每秒更新一次
    setInterval(updateCountdown, 1000);
}

// 處理頁面可見性變化 (當使用者切換分頁時)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 頁面重新可見時,立即更新一次
        updateCountdown();
    }
});
