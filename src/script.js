const emoji = document.getElementById('emoji');
const agreeBtn = document.getElementById('agree-btn');
const refuseBtn = document.getElementById('refuse-btn');
const refuseBtnWrap = document.getElementById('refuse-btn-wrap');
const modal = document.getElementById('modal');
const buttonGroup = document.querySelector('.button-group');

let isAgreed = false;
// 新增：拒绝按钮点击计数（目标30次）
let refuseClickCount = 0;
const MAX_REFUSE_CLICKS = 30;

function switchEmoji(type) {
    if (isAgreed && type !== 'haha') {
        return;
    }
    emoji.classList.remove('emoji--yay', 'emoji--haha', 'emoji--sad');
    emoji.classList.add(`emoji--${type}`);
}

switchEmoji('yay');

// 同意按钮交互
agreeBtn.addEventListener('mouseenter', () => switchEmoji('haha'));
agreeBtn.addEventListener('mouseleave', () => {
    if (!isAgreed) switchEmoji('yay');
});
agreeBtn.addEventListener('click', () => {
    isAgreed = true;
    switchEmoji('haha');
    modal.style.display = 'flex';
    setTimeout(() => modal.style.display = 'none', 3000);
});

// 拒绝按钮交互（新增计数 + 破碎逻辑）
refuseBtn.addEventListener('mouseenter', () => {
    if (!isAgreed) switchEmoji('sad');
});
refuseBtn.addEventListener('mouseleave', () => {
    if (!isAgreed) switchEmoji('yay');
});
refuseBtn.addEventListener('click', () => {
    if (!isAgreed) {
        // 增加点击计数
        refuseClickCount++;
        
        // 未达到30次：正常移动按钮
        if (refuseClickCount < MAX_REFUSE_CLICKS) {
            if (!refuseBtnWrap.classList.contains('moving')) {
                refuseBtnWrap.classList.add('moving');
                const rect = buttonGroup.getBoundingClientRect();
                refuseBtnWrap.style.left = `${rect.left + agreeBtn.offsetWidth + 30}px`;
                refuseBtnWrap.style.top = `${rect.top}px`;
            }
            const maxX = window.innerWidth - refuseBtnWrap.offsetWidth - 20;
            const maxY = window.innerHeight - refuseBtnWrap.offsetHeight - 20;
            refuseBtnWrap.style.left = `${Math.floor(Math.random() * maxX)}px`;
            refuseBtnWrap.style.top = `${Math.floor(Math.random() * maxY)}px`;
            refuseBtn.style.transform = 'none';
            refuseBtn.style.rotate = '0deg';
        } 
        // 达到30次：触发3D破碎效果
        else {
            createShatterEffect();
            // 隐藏原拒绝按钮
            refuseBtnWrap.style.display = 'none';
            // 锁定表情为Haha
            switchEmoji('haha');
            isAgreed = true;
        }
    }
});

// 新增：创建3D破碎效果
function createShatterEffect() {
    // 获取拒绝按钮位置和尺寸
    const rect = refuseBtnWrap.getBoundingClientRect();
    // 创建碎片容器
    const shatterContainer = document.createElement('div');
    shatterContainer.className = 'shatter-pieces';
    shatterContainer.style.left = `${rect.left}px`;
    shatterContainer.style.top = `${rect.top}px`;
    shatterContainer.style.width = `${rect.width}px`;
    shatterContainer.style.height = `${rect.height}px`;
    document.body.appendChild(shatterContainer);

    // 创建8个3D碎片（数量可调整）
    const pieceCount = 8;
    for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement('div');
        piece.className = 'shatter-piece';
        
        // 随机碎片尺寸和位置
        const pieceWidth = Math.random() * 40 + 20;
        const pieceHeight = Math.random() * 30 + 15;
        piece.style.width = `${pieceWidth}px`;
        piece.style.height = `${pieceHeight}px`;
        piece.style.left = `${Math.random() * (rect.width - pieceWidth)}px`;
        piece.style.top = `${Math.random() * (rect.height - pieceHeight)}px`;

        // 随机3D动画参数（核心立体效果）
        piece.style.setProperty('--x-offset', (Math.random() - 0.5) * 5); // X轴偏移
        piece.style.setProperty('--y-offset', (Math.random() - 0.5) * 5); // Y轴偏移
        piece.style.setProperty('--z-offset', (Math.random() - 0.5) * 3); // Z轴偏移（3D深度）
        piece.style.setProperty('--rx', Math.random()); // X轴旋转轴
        piece.style.setProperty('--ry', Math.random()); // Y轴旋转轴
        piece.style.setProperty('--rz', Math.random()); // Z轴旋转轴
        piece.style.setProperty('--rotate', Math.random() * 3); // 旋转角度

        shatterContainer.appendChild(piece);
    }

    // 动画结束后移除碎片容器
    setTimeout(() => {
        shatterContainer.remove();
    }, 1500);
}

// 空白处重置拒绝按钮（仅未同意且未达到30次时生效）
document.addEventListener('click', (e) => {
    if (!isAgreed && refuseClickCount < MAX_REFUSE_CLICKS && ![refuseBtn, agreeBtn, refuseBtnWrap, agreeBtn.parentElement].includes(e.target) && !modal.contains(e.target)) {
        refuseBtnWrap.classList.remove('moving');
        refuseBtnWrap.style.left = '';
        refuseBtnWrap.style.top = '';
        refuseBtn.style.transform = '';
        refuseBtn.style.rotate = '';
    }
});