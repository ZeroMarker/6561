// ==================== 游戏常量 ====================
const SIZE = 6;
const PADDING = 4;
const GAP = 4;
const TILE_VALUES = [0, 3, 9, 27, 81, 243, 729, 2187, 6561];
const WIN_TILE_VALUE = 6561;
const WIN_TILE_EXP = 9;

// ==================== 游戏状态 ====================
let grid = [];
let score = 0;
let best = 0;
let gameWon = false;
let gameOver = false;
let history = []; // 撤销历史
const MAX_HISTORY = 10;

// 触摸控制
let touchStartX = 0;
let touchStartY = 0;

// 动画配置
const ANIMATION_DURATION = 150;
const SPAWN_ANIMATION_DURATION = 200;

// DOM 缓存
let gameEl, scoreEl, bestEl, overlayWinEl, overlayGameOverEl, undoBtnEl;
let tileMap = new Map(); // 跟踪瓦片用于动画
let tileIdCounter = 0;

// ==================== 工具函数 ====================
function generateTileId() {
    return `tile-${++tileIdCounter}`;
}

function getTileValue(exp) {
    return exp === 0 ? 0 : TILE_VALUES[exp];
}

// 矩阵转置
function transpose(g) {
    return g[0].map((_, i) => g.map(row => row[i]));
}

// ==================== 合并逻辑 ====================
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
            addedScore += TILE_VALUES[newExp];
            i += 3;
        } else {
            merged.push(nonZero[i]);
            i += 1;
        }
    }

    while (merged.length < SIZE) {
        merged.push(0);
    }

    return { line: merged, score: addedScore };
}

// ==================== 滑动处理 ====================
function slideLeft(gridRow) {
    return mergeLine(gridRow);
}

function slideRight(gridRow) {
    const rev = [...gridRow].reverse();
    const res = mergeLine(rev);
    return { line: res.line.reverse(), score: res.score };
}

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

// ==================== 状态检查 ====================
function boardChanged(oldG, newG) {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (oldG[i][j] !== newG[i][j]) return true;
        }
    }
    return false;
}

function canAnyMove() {
    const dirs = ['left', 'right', 'up', 'down'];
    for (let dir of dirs) {
        const res = performSlide(grid, dir);
        if (boardChanged(grid, res.newGrid)) return true;
    }
    return false;
}

function hasEmpty() {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (grid[i][j] === 0) return true;
        }
    }
    return false;
}

// ==================== 历史记录 (撤销) ====================
function saveHistory() {
    if (history.length >= MAX_HISTORY) {
        history.shift();
    }
    history.push({
        grid: grid.map(row => [...row]),
        score: score,
        gameWon: gameWon,
        gameOver: gameOver
    });
}

function undo() {
    if (history.length === 0 || gameOver) return;
    
    const prevState = history.pop();
    grid = prevState.grid;
    score = prevState.score;
    gameWon = prevState.gameWon;
    gameOver = prevState.gameOver;
    
    hideOverlays();
    updateDisplay();
    playSound('undo');
}

// ==================== 游戏核心逻辑 ====================
function move(dir) {
    if (gameOver) return;
    
    const oldGrid = grid.map(r => [...r]);
    const res = performSlide(grid, dir);
    const changed = boardChanged(oldGrid, res.newGrid);

    if (changed) {
        saveHistory();
        grid = res.newGrid;
        score += res.score;
        
        checkWin();
        addRandomTile();
        updateDisplay();
        playSound('move');
        
        setTimeout(() => {
            if (!hasEmpty() && !canAnyMove()) {
                showGameOver();
            }
        }, ANIMATION_DURATION + 50);
    }
}

function checkWin() {
    if (gameWon) return;
    
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (grid[i][j] === WIN_TILE_EXP) {
                gameWon = true;
                setTimeout(showWin, 300);
                playSound('win');
                if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
                return;
            }
        }
    }
}

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

// ==================== UI 显示 ====================
function showWin() {
    overlayWinEl.classList.add('active');
}

function showGameOver() {
    gameOver = true;
    overlayGameOverEl.classList.add('active');
    playSound('gameover');
}

function hideOverlays() {
    overlayWinEl.classList.remove('active');
    overlayGameOverEl.classList.remove('active');
}

function keepPlaying() {
    hideOverlays();
}

function updateDisplay() {
    scoreEl.textContent = score;

    if (score > best) {
        best = score;
        localStorage.setItem('best6561', best);
    }
    bestEl.textContent = best;
    
    // 更新撤销按钮状态
    if (undoBtnEl) {
        undoBtnEl.disabled = history.length === 0 || gameOver;
        undoBtnEl.style.opacity = undoBtnEl.disabled ? '0.5' : '1';
    }

    renderGrid();
}

// ==================== 渲染系统 (带动画) ====================
function renderGrid() {
    const available = gameEl.clientWidth - 2 * PADDING;
    const tileSize = Math.floor((available - (SIZE - 1) * GAP) / SIZE);
    const fontSize = Math.max(16, Math.floor(tileSize * 0.4));

    // 创建位置映射
    const currentTiles = new Map();
    
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const exp = grid[i][j];
            if (exp === 0) continue;
            
            const key = `${i}-${j}-${exp}`;
            currentTiles.set(key, { row: i, col: j, exp });
        }
    }

    // 移除不存在的瓦片
    const toRemove = [];
    tileMap.forEach((tile, id) => {
        const key = `${tile.row}-${tile.col}-${tile.exp}`;
        if (!currentTiles.has(key)) {
            toRemove.push(id);
        }
    });
    
    toRemove.forEach(id => {
        const tile = tileMap.get(id);
        if (tile && tile.element) {
            tile.element.style.opacity = '0';
            tile.element.style.transform = 'scale(0.5)';
            setTimeout(() => tile.element?.remove(), ANIMATION_DURATION);
        }
        tileMap.delete(id);
    });

    // 更新/创建瓦片
    currentTiles.forEach((data, key) => {
        const existingId = Array.from(tileMap.entries()).find(([_, t]) => 
            t.row === data.row && t.col === data.col && t.exp === data.exp
        )?.[0];
        
        if (existingId) {
            // 瓦片已存在，无需更新
            return;
        }
        
        // 检查是否是移动过来的（相同指数在不同位置）
        const movedTile = Array.from(tileMap.entries()).find(([_, t]) => 
            t.exp === data.exp && !currentTiles.has(`${t.row}-${t.col}-${t.exp}`)
        );
        
        const tile = document.createElement('div');
        tile.className = `tile tile-${data.exp}`;
        tile.style.left = `${PADDING + data.col * (tileSize + GAP)}px`;
        tile.style.top = `${PADDING + data.row * (tileSize + GAP)}px`;
        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;
        tile.style.fontSize = `${fontSize}px`;
        tile.textContent = TILE_VALUES[data.exp];
        
        // 新生成动画
        tile.style.opacity = '0';
        tile.style.transform = 'scale(0)';
        tile.style.transition = `all ${SPAWN_ANIMATION_DURATION}ms ease-out`;
        
        gameEl.appendChild(tile);
        
        // 触发动画
        requestAnimationFrame(() => {
            tile.style.opacity = '1';
            tile.style.transform = 'scale(1)';
        });
        
        const id = generateTileId();
        tileMap.set(id, { 
            row: data.row, 
            col: data.col, 
            exp: data.exp, 
            element: tile 
        });
    });
}

// ==================== 游戏控制 ====================
function restartGame() {
    // 清理现有瓦片
    tileMap.forEach((tile) => {
        tile.element?.remove();
    });
    tileMap.clear();
    
    grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    score = 0;
    gameWon = false;
    gameOver = false;
    history = [];
    
    addRandomTile();
    addRandomTile();
    updateDisplay();
    hideOverlays();
    playSound('start');
}

// ==================== 音效系统 ====================
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
        case 'move':
            oscillator.frequency.value = 200;
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'merge':
            oscillator.frequency.value = 400;
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
        case 'win':
            // 胜利和弦
            [523.25, 659.25, 783.99].forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
                osc.start(audioContext.currentTime + i * 0.1);
                osc.stop(audioContext.currentTime + i * 0.1 + 0.3);
            });
            return;
        case 'gameover':
            oscillator.frequency.value = 150;
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
        case 'undo':
            oscillator.frequency.value = 300;
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.08);
            break;
        case 'start':
            oscillator.frequency.value = 440;
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
    }
    
    // 震动反馈
    if (type === 'merge' && navigator.vibrate) {
        navigator.vibrate(30);
    }
}

// ==================== 输入处理 ====================
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
        case 'KeyZ':
        case 'ControlLeft':
        case 'ControlRight':
            if (e.ctrlKey || e.code === 'KeyZ') undo();
            return;
    }

    if (dir) move(dir);
}

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

// ==================== PWA 安装提示 ====================
let deferredPrompt = null;
let installBtn = null;

function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        if (installBtn) installBtn.style.display = 'none';
    });
}

function showInstallButton() {
    installBtn = document.getElementById('btn-install');
    if (installBtn) {
        installBtn.style.display = 'inline-block';
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
            }
        });
    }
}

// ==================== 新手引导 ====================
let hasSeenTutorial = localStorage.getItem('tutorial6561') === 'true';

function showTutorial() {
    const tutorial = document.getElementById('tutorial-overlay');
    if (tutorial && !hasSeenTutorial) {
        tutorial.classList.add('active');
    }
}

function hideTutorial() {
    const tutorial = document.getElementById('tutorial-overlay');
    if (tutorial) {
        tutorial.classList.remove('active');
        localStorage.setItem('tutorial6561', 'true');
        hasSeenTutorial = true;
    }
}

// ==================== 初始化 ====================
function init() {
    initDOMElements();
    best = parseInt(localStorage.getItem('best6561')) || 0;
    bestEl.textContent = best;

    // 键盘事件
    document.addEventListener('keydown', handleKeydown);
    
    // 触摸事件
    gameEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    gameEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameEl.addEventListener('touchend', handleTouchEnd, { passive: true });

    // 按钮事件
    document.getElementById('btn-keep-playing')?.addEventListener('click', keepPlaying);
    document.getElementById('btn-restart-win')?.addEventListener('click', restartGame);
    document.getElementById('btn-restart-lose')?.addEventListener('click', restartGame);
    document.getElementById('btn-undo')?.addEventListener('click', undo);
    document.getElementById('btn-restart-main')?.addEventListener('click', restartGame);
    document.getElementById('btn-close-tutorial')?.addEventListener('click', hideTutorial);

    // PWA 安装
    setupInstallPrompt();

    // 启动游戏
    restartGame();
    
    // 显示新手引导（首次）
    setTimeout(showTutorial, 500);

    // Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('SW registration failed:', err);
        });
    }
}

function initDOMElements() {
    gameEl = document.getElementById('game');
    scoreEl = document.getElementById('score');
    bestEl = document.getElementById('best');
    overlayWinEl = document.getElementById('overlay-win');
    overlayGameOverEl = document.getElementById('overlay-gameover');
    undoBtnEl = document.getElementById('btn-undo');
}

// 启动
document.addEventListener('DOMContentLoaded', init);
