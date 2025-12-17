const emoji = document.getElementById('emoji');
const agreeBtn = document.getElementById('agree-btn');
const refuseBtn = document.getElementById('refuse-btn');
const refuseBtnWrap = document.getElementById('refuse-btn-wrap');
const modal = document.getElementById('modal');
const buttonGroup = document.querySelector('.button-group');

let isAgreed = false;
let refuseClickCount = 0;
const MAX_REFUSE_CLICKS = 30;

// 核心工具函数：修正元素位置，确保完全在屏幕内
function fixElementInScreen(element) {
    // 获取元素真实尺寸和位置
    const rect = element.getBoundingClientRect();
    // 屏幕宽高
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // 计算需要修正的偏移量
    let fixLeft = 0;
    let fixTop = 0;

    // 左边界：元素左边缘 < 0，向右修正
    if (rect.left < 0) {
        fixLeft = -rect.left;
    }
    // 右边界：元素右边缘 > 屏幕宽度，向左修正
    if (rect.right > screenWidth) {
        fixLeft = screenWidth - rect.right;
    }
    // 上边界：元素上边缘 < 0，向下修正
    if (rect.top < 0) {
        fixTop = -rect.top;
    }
    // 下边界：元素下边缘 > 屏幕高度，向上修正
    if (rect.bottom > screenHeight) {
        fixTop = screenHeight - rect.bottom;
    }

    // 应用修正后的位置
    const currentLeft = parseFloat(element.style.left || 0);
    const currentTop = parseFloat(element.style.top || 0);
    element.style.left = `${currentLeft + fixLeft}px`;
    element.style.top = `${currentTop + fixTop}px`;
}

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

// 拒绝按钮交互（最终版：fixed定位 + 实时修正）
refuseBtn.addEventListener('mouseenter', () => {
    if (!isAgreed) switchEmoji('sad');
});
refuseBtn.addEventListener('mouseleave', () => {
    if (!isAgreed) switchEmoji('yay');
});
refuseBtn.addEventListener('click', (e) => {
    // 阻止事件冒泡，避免触发空白处重置
    e.stopPropagation();

    if (!isAgreed) {
        refuseClickCount++;

        if (refuseClickCount < MAX_REFUSE_CLICKS) {
            if (!refuseBtnWrap.classList.contains('moving')) {
                refuseBtnWrap.classList.add('moving');
                // 初始位置：基于按钮组的位置，但改用fixed
                const rect = buttonGroup.getBoundingClientRect();
                // fixed定位的left/top是相对于视口的
                refuseBtnWrap.style.left = `${rect.left + agreeBtn.offsetWidth + 30}px`;
                refuseBtnWrap.style.top = `${rect.top}px`;
                // 立即修正初始位置，确保在屏幕内
                fixElementInScreen(refuseBtnWrap);
            }

            // -------------------------- 核心：随机位置 + 强制修正 --------------------------
            // 1. 获取按钮真实宽高
            const btnWidth = refuseBtnWrap.offsetWidth;
            const btnHeight = refuseBtnWrap.offsetHeight;

            // 2. 生成大范围随机值（先不管边界）
            const randomLeft = Math.random() * window.innerWidth;
            const randomTop = Math.random() * window.innerHeight;

            // 3. 先设置随机位置
            refuseBtnWrap.style.left = `${randomLeft}px`;
            refuseBtnWrap.style.top = `${randomTop}px`;

            // 4. 强制修正位置，确保完全在屏幕内（关键！）
            fixElementInScreen(refuseBtnWrap);
            // -------------------------- 核心结束 --------------------------

            refuseBtn.style.transform = 'none';
            refuseBtn.style.rotate = '0deg';
        } else {
            // 第30次点击：触发破碎效果
            createShatterEffect();
            refuseBtnWrap.style.display = 'none';
            switchEmoji('haha');
            isAgreed = true;
        }
    }
});

// 保留原有 createShatterEffect 函数（时长已在CSS中修改）
function createShatterEffect() {
    const rect = refuseBtnWrap.getBoundingClientRect();
    const shatterContainer = document.createElement('div');
    shatterContainer.className = 'shatter-pieces';
    shatterContainer.style.left = `${rect.left}px`;
    shatterContainer.style.top = `${rect.top}px`;
    shatterContainer.style.width = `${rect.width}px`;
    shatterContainer.style.height = `${rect.height}px`;
    document.body.appendChild(shatterContainer);

    const pieceCount = 8;
    for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement('div');
        piece.className = 'shatter-piece';

        const pieceWidth = Math.random() * 40 + 20;
        const pieceHeight = Math.random() * 30 + 15;
        piece.style.width = `${pieceWidth}px`;
        piece.style.height = `${pieceHeight}px`;
        piece.style.left = `${Math.random() * (rect.width - pieceWidth)}px`;
        piece.style.top = `${Math.random() * (rect.height - pieceHeight)}px`;

        piece.style.setProperty('--x-offset', (Math.random() - 0.5) * 5);
        piece.style.setProperty('--y-offset', (Math.random() - 0.5) * 5);
        piece.style.setProperty('--z-offset', (Math.random() - 0.5) * 3);
        piece.style.setProperty('--rx', Math.random());
        piece.style.setProperty('--ry', Math.random());
        piece.style.setProperty('--rz', Math.random());
        piece.style.setProperty('--rotate', Math.random() * 3);

        shatterContainer.appendChild(piece);
    }

    // 核心修改：移除时长从1.5s缩短为0.8s（和动画时长一致）
    setTimeout(() => {
        shatterContainer.remove();
    }, 800);
}

// 新增：同时创建爆炸+破碎效果的函数
function createCombinedEffect() {
    // 1. 创建破碎效果
    createShatterEffect();
    // 2. 创建爆炸效果
    const rect = refuseBtnWrap.getBoundingClientRect();
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = `${rect.left + rect.width / 2 - 50}px`;
    explosion.style.top = `${rect.top + rect.height / 2 - 50}px`;
    document.body.appendChild(explosion);

    // 核心修改：爆炸效果移除时长也缩短为0.8s
    setTimeout(() => {
        explosion.remove();
    }, 800);
}

// 修改拒绝按钮点击事件：调用组合效果
refuseBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    if (!isAgreed) {
        refuseClickCount++;

        if (refuseClickCount < MAX_REFUSE_CLICKS) {
            // 原有移动逻辑不变
            if (!refuseBtnWrap.classList.contains('moving')) {
                refuseBtnWrap.classList.add('moving');
                const rect = buttonGroup.getBoundingClientRect();
                refuseBtnWrap.style.left = `${rect.left + agreeBtn.offsetWidth + 30}px`;
                refuseBtnWrap.style.top = `${rect.top}px`;
                fixElementInScreen(refuseBtnWrap);
            }

            const btnWidth = refuseBtnWrap.offsetWidth;
            const btnHeight = refuseBtnWrap.offsetHeight;
            const randomLeft = Math.random() * window.innerWidth;
            const randomTop = Math.random() * window.innerHeight;
            refuseBtnWrap.style.left = `${randomLeft}px`;
            refuseBtnWrap.style.top = `${randomTop}px`;
            fixElementInScreen(refuseBtnWrap);

            refuseBtn.style.transform = 'none';
            refuseBtn.style.rotate = '0deg';
        } else {
            // 核心修改：调用组合效果（爆炸+破碎同时显示）
            createCombinedEffect();
            refuseBtnWrap.style.display = 'none';
            switchEmoji('haha');
            isAgreed = true;
        }
    }
});
// 空白处重置拒绝按钮
document.addEventListener('click', (e) => {
    if (!isAgreed && refuseClickCount < MAX_REFUSE_CLICKS && ![refuseBtn, agreeBtn, refuseBtnWrap, agreeBtn.parentElement].includes(e.target) && !modal.contains(e.target)) {
        refuseBtnWrap.classList.remove('moving');
        refuseBtnWrap.style.left = '';
        refuseBtnWrap.style.top = '';
        refuseBtn.style.transform = '';
        refuseBtn.style.rotate = '';
    }
});

// 窗口大小变化时，重新修正拒绝按钮位置（适配窗口缩放）
window.addEventListener('resize', () => {
    if (refuseBtnWrap.classList.contains('moving') && !isAgreed) {
        fixElementInScreen(refuseBtnWrap);
    }
});