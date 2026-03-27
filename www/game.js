// 游戏常量
const SIZE = 6;
const PADDING = 4;
const GAP = 4;
const POW3 = [0, 3, 9, 27, 81, 243, 729, 2187, 6561];

// 游戏状态
let grid = [];
let score = 0;
let best = 0;
let gameWon = false;
let touchStartX = 0;
let touchStartY = 0;

// 预计算瓦片位置
const tilePositions = [];
for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
        tilePositions.push({ row: i, col: j });
    }
}

// DOM 元素缓存
let gameEl, scoreEl, bestEl, overlayWinEl, overlayGameOverEl;

// 初始化 DOM 缓存
function initDOMElements() {
    gameEl = document.getElementById('game');
    scoreEl = document.getElementById('score');
    bestEl = document.getElementById('best');
    overlayWinEl = document.getElementById('overlay-win');
    overlayGameOverEl = document.getElementById('overlay-gameover');
}

// 矩阵转置
function transpose(g) {
    return g[0].map((_, i) => g.map(row => row[i]));
}

// 合并一行
function mergeLine(line) {
    const nonZero = line.filter(val => val !== 0);
    const merged = [];
    let addedScore = 0;
    let i = 0;
    
    while (i < nonZero.length) {
        if (i + 2 < nonZero.length && 
            nonZero[i] === nonZero[i + 1] && 
            nonZero[i] === nonZero[i + 2]) {
            const newExp = nonZero[i] + 1;
            merged.push(newExp);
            addedScore += POW3[newExp];
            i += 3;
        } else {
            merged.push(nonZero[i]);
            i += 1;
        }
    }
    
    // 补零
    while (merged.length < SIZE) {
        merged.push(0);
    }
    
    return { line: merged, score: addedScore };
}

// 滑动方向处理
function slideLeft(gridRow) {
    return mergeLine(gridRow);
}

function slideRight(gridRow) {
    const rev = [...gridRow].reverse();
    const res = mergeLine(rev);
    return { line: res.line.reverse(), score: res.score };
}

// 执行滑动
function performSlide(g, dir) {
    let gridCopy = g.map(row => [...row]);
    let deltaScore = 0;
    
    if (dir === 'left' || dir === 'right') {
        for (let i = 0; i < SIZE; i++) {
            const res = dir === 'left' ? slideLeft(gridCopy[i]) : slideRight(gridCopy[i]);
            gridCopy[i] = res.line;
            deltaScore += res.score;
        }
    } else {
        let tGrid = transpose(gridCopy);
        for (let i = 0; i < SIZE; i++) {
            const res = dir === 'up' ? slideLeft(tGrid[i]) : slideRight(tGrid[i]);
            tGrid[i] = res.line;
            deltaScore += res.score;
        }
        gridCopy = transpose(tGrid);
    }
    
    return { newGrid: gridCopy, score: deltaScore };
}

// 检查棋盘是否变化
function boardChanged(oldG, newG) {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (oldG[i][j] !== newG[i][j]) return true;
        }
    }
    return false;
}

// 检查是否有可移动的方向
function canAnyMove() {
    const dirs = ['left', 'right', 'up', 'down'];
    for (let dir of dirs) {
        const res = performSlide(grid, dir);
        if (boardChanged(grid, res.newGrid)) return true;
    }
    return false;
}

// 检查是否有空位
function hasEmpty() {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (grid[i][j] === 0) return true;
        }
    }
    return false;
}

// 移动
function move(dir) {
    const oldGrid = grid.map(r => [...r]);
    const res = performSlide(grid, dir);
    const changed = boardChanged(oldGrid, res.newGrid);
    
    if (changed) {
        grid = res.newGrid;
        score += res.score;
        checkWin();
        addRandomTile();
        updateDisplay();
        
        setTimeout(() => {
            if (!hasEmpty() && !canAnyMove()) {
                showGameOver();
            }
        }, 200);
    }
}

// 检查胜利
function checkWin() {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (grid[i][j] === 9 && !gameWon) {
                gameWon = true;
                setTimeout(showWin, 300);
                return;
            }
        }
    }
}

// 添加随机瓦片
function addRandomTile() {
    const empties = [];
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (grid[i][j] === 0) empties.push({ r: i, c: j });
        }
    }
    
    if (empties.length === 0) return false;
    
    const pos = empties[Math.floor(Math.random() * empties.length)];
    grid[pos.r][pos.c] = 1;
    return true;
}

// 显示/隐藏弹窗
function showWin() {
    overlayWinEl.classList.add('active');
}

function showGameOver() {
    overlayGameOverEl.classList.add('active');
}

function hideOverlays() {
    overlayWinEl.classList.remove('active');
    overlayGameOverEl.classList.remove('active');
}

function keepPlaying() {
    hideOverlays();
}

// 更新显示
function updateDisplay() {
    scoreEl.textContent = score;
    
    if (score > best) {
        best = score;
        localStorage.setItem('best19683', best);
    }
    bestEl.textContent = best;

    // 计算瓦片尺寸
    const available = gameEl.clientWidth - 2 * PADDING;
    const tileSize = Math.floor((available - (SIZE - 1) * GAP) / SIZE);
    const fontSize = Math.max(20, Math.floor(tileSize * 0.45));

    // 移除旧瓦片
    const existingTiles = gameEl.querySelectorAll('.tile');
    existingTiles.forEach(tile => tile.remove());

    // 创建新瓦片
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const exp = grid[i][j];
            if (exp === 0) continue;
            
            const tile = document.createElement('div');
            tile.className = `tile tile-${exp}`;
            tile.style.left = `${PADDING + j * (tileSize + GAP)}px`;
            tile.style.top = `${PADDING + i * (tileSize + GAP)}px`;
            tile.style.width = `${tileSize}px`;
            tile.style.height = `${tileSize}px`;
            tile.style.fontSize = `${fontSize}px`;
            tile.textContent = POW3[exp];
            fragment.appendChild(tile);
        }
    }
    
    gameEl.appendChild(fragment);
}

// 重新开始
function restartGame() {
    grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    score = 0;
    gameWon = false;
    addRandomTile();
    addRandomTile();
    updateDisplay();
    hideOverlays();
}

// 键盘控制
function handleKeydown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
    
    let dir;
    switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA': dir = 'left'; break;
        case 'ArrowRight':
        case 'KeyD': dir = 'right'; break;
        case 'ArrowUp':
        case 'KeyW': dir = 'up'; break;
        case 'ArrowDown':
        case 'KeyS': dir = 'down'; break;
    }
    
    if (dir) move(dir);
}

// 触摸滑动
function handleTouchStart(e) {
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        if (Math.abs(dx) > 40 || Math.abs(dy) > 40) {
            if (Math.abs(dx) > Math.abs(dy)) {
                move(dx > 0 ? 'right' : 'left');
            } else {
                move(dy > 0 ? 'down' : 'up');
            }
        }
    }
    touchStartX = 0;
    touchStartY = 0;
}

// 初始化
function init() {
    initDOMElements();
    
    // 从 localStorage 读取最高分
    best = parseInt(localStorage.getItem('best19683')) || 0;
    bestEl.textContent = best;
    
    // 绑定事件
    document.addEventListener('keydown', handleKeydown);
    gameEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    gameEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameEl.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // 按钮事件绑定
    document.getElementById('btn-keep-playing').addEventListener('click', keepPlaying);
    document.getElementById('btn-restart-win').addEventListener('click', restartGame);
    document.getElementById('btn-restart-lose').addEventListener('click', restartGame);
    
    // 启动游戏
    restartGame();
    
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('SW registration failed:', err);
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);