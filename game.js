// ==================== 游戏常量 ====================
const SIZE = 6;
const PADDING = 4;
const GAP = 4;
const TILE_VALUES = [0, 3, 9, 27, 81, 243, 729, 2187, 6561];
const WIN_TILE_VALUE = 6561;
const WIN_TILE_EXP = 9;

// 动画配置
const ANIMATION_DURATION = 150;
const SPAWN_ANIMATION_DURATION = 200;

// 历史记录
const MAX_HISTORY = 10;

// 触摸控制
const SWIPE_THRESHOLD = 40;

// ==================== 本地存储安全封装 ====================
const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('localStorage get error:', e);
            return defaultValue;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('localStorage set error:', e);
            return false;
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('localStorage remove error:', e);
            return false;
        }
    }
};

// ==================== 游戏状态模块 ====================
const GameState = {
    grid: [],
    score: 0,
    best: 0,
    moves: 0,
    gameTimer: 0,
    timerInterval: null,
    gameWon: false,
    gameOver: false,
    history: [],
    combo: 0,
    totalMerges: 0,
    maxCombo: 0,
    gamesPlayed: 0,
    gamesWon: 0,

    reset() {
        this.grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
        this.score = 0;
        this.moves = 0;
        this.gameTimer = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.history = [];
        this.combo = 0;
        this.totalMerges = 0;
        this.maxCombo = 0;
    },

    saveHistory() {
        if (this.history.length >= MAX_HISTORY) {
            this.history.shift();
        }
        this.history.push({
            grid: this.grid.map(row => [...row]),
            score: this.score,
            moves: this.moves,
            gameWon: this.gameWon,
            gameOver: this.gameOver,
            combo: this.combo
        });
    },

    undo() {
        if (this.history.length === 0 || this.gameOver) return null;
        const prevState = this.history.pop();
        Object.assign(this, prevState);
        return prevState;
    }
};

// ==================== 设置管理 ====================
const Settings = {
    soundEnabled: true,
    theme: 'light',
    hasSeenTutorial: false,
    reducedMotion: false,

    init() {
        this.soundEnabled = Storage.get('sound6561', true);
        this.theme = Storage.get('theme6561', 'light');
        this.hasSeenTutorial = Storage.get('tutorial6561', false);
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        Storage.set('sound6561', this.soundEnabled);
        return this.soundEnabled;
    },

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        Storage.set('theme6561', this.theme);
        return this.theme;
    },

    markTutorialSeen() {
        this.hasSeenTutorial = true;
        Storage.set('tutorial6561', true);
    },

    resetTutorial() {
        this.hasSeenTutorial = false;
        Storage.remove('tutorial6561');
    }
};

// ==================== 音效系统 ====================
const SoundSystem = {
    audioContext: null,

    init() {
        // 延迟创建 AudioContext，在用户首次交互时
    },

    ensureContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },

    play(type) {
        if (!Settings.soundEnabled) return;

        try {
            this.ensureContext();
            if (!this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            const now = this.audioContext.currentTime;

            switch (type) {
                case 'move':
                    oscillator.frequency.value = 200;
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    oscillator.start(now);
                    oscillator.stop(now + 0.1);
                    break;
                case 'merge':
                    oscillator.frequency.value = 400;
                    gainNode.gain.setValueAtTime(0.15, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    oscillator.start(now);
                    oscillator.stop(now + 0.15);
                    break;
                case 'combo':
                    // 连击音效 - 更高音调
                    oscillator.frequency.value = 600 + (GameState.combo * 100);
                    gainNode.gain.setValueAtTime(0.2, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    oscillator.start(now);
                    oscillator.stop(now + 0.2);
                    break;
                case 'win':
                    [523.25, 659.25, 783.99].forEach((freq, i) => {
                        const osc = this.audioContext.createOscillator();
                        const gain = this.audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(this.audioContext.destination);
                        osc.frequency.value = freq;
                        gain.gain.setValueAtTime(0.1, now + i * 0.1);
                        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
                        osc.start(now + i * 0.1);
                        osc.stop(now + i * 0.1 + 0.3);
                    });
                    return;
                case 'gameover':
                    oscillator.frequency.value = 150;
                    oscillator.type = 'sawtooth';
                    gainNode.gain.setValueAtTime(0.2, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                    oscillator.start(now);
                    oscillator.stop(now + 0.5);
                    break;
                case 'undo':
                    oscillator.frequency.value = 300;
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                    oscillator.start(now);
                    oscillator.stop(now + 0.08);
                    break;
                case 'start':
                    oscillator.frequency.value = 440;
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    oscillator.start(now);
                    oscillator.stop(now + 0.2);
                    break;
                case 'invalid':
                    // 无效移动音效
                    oscillator.frequency.value = 100;
                    oscillator.type = 'square';
                    gainNode.gain.setValueAtTime(0.05, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    oscillator.start(now);
                    oscillator.stop(now + 0.1);
                    break;
            }

            if (type === 'merge' && navigator.vibrate) {
                navigator.vibrate(30);
            }
        } catch (e) {
            console.warn('Sound play error:', e);
        }
    }
};

// ==================== 统计系统 ====================
const Statistics = {
    init() {
        const stats = Storage.get('stats6561', {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            bestScore: 0,
            totalMoves: 0,
            maxCombo: 0
        });
        GameState.gamesPlayed = stats.gamesPlayed;
        GameState.gamesWon = stats.gamesWon;
        GameState.best = stats.bestScore;
        return stats;
    },

    recordGame(won, finalScore, finalMoves, maxCombo) {
        GameState.gamesPlayed++;
        if (won) GameState.gamesWon++;

        const stats = {
            gamesPlayed: GameState.gamesPlayed,
            gamesWon: GameState.gamesWon,
            totalScore: Storage.get('totalScore6561', 0) + finalScore,
            bestScore: Math.max(Storage.get('bestScore6561', 0), finalScore),
            totalMoves: Storage.get('totalMoves6561', 0) + finalMoves,
            maxCombo: Math.max(Storage.get('maxCombo6561', 0), maxCombo)
        };

        Storage.set('stats6561', stats);
        Storage.set('bestScore6561', stats.bestScore);
        return stats;
    },

    getWinRate() {
        if (GameState.gamesPlayed === 0) return 0;
        return ((GameState.gamesWon / GameState.gamesPlayed) * 100).toFixed(1);
    }
};

// ==================== DOM 缓存 ====================
const DOM = {
    gameEl: null,
    scoreEl: null,
    bestEl: null,
    movesEl: null,
    timerEl: null,
    overlayWinEl: null,
    overlayGameOverEl: null,
    undoBtnEl: null,
    themeBtnEl: null,
    soundBtnEl: null,
    settingsBtnEl: null,
    statsBtnEl: null,

    init() {
        this.gameEl = document.getElementById('game');
        this.scoreEl = document.getElementById('score');
        this.bestEl = document.getElementById('best');
        this.movesEl = document.getElementById('moves');
        this.timerEl = document.getElementById('timer');
        this.overlayWinEl = document.getElementById('overlay-win');
        this.overlayGameOverEl = document.getElementById('overlay-gameover');
        this.undoBtnEl = document.getElementById('btn-undo');
        this.themeBtnEl = document.getElementById('btn-theme');
        this.soundBtnEl = document.getElementById('btn-sound');
        this.settingsBtnEl = document.getElementById('btn-settings');
        this.statsBtnEl = document.getElementById('btn-stats');
    }
};

// ==================== 瓦片渲染系统 ====================
const TileRenderer = {
    tileMap: new Map(),
    tileIdCounter: 0,

    generateTileId() {
        return `tile-${++this.tileIdCounter}`;
    },

    render() {
        const available = DOM.gameEl.clientWidth - 2 * PADDING;
        const tileSize = Math.floor((available - (SIZE - 1) * GAP) / SIZE);
        const fontSize = Math.max(16, Math.floor(tileSize * 0.4));

        const currentTiles = new Map();

        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                const exp = GameState.grid[i][j];
                if (exp === 0) continue;

                const key = `${i}-${j}-${exp}`;
                currentTiles.set(key, { row: i, col: j, exp });
            }
        }

        // 移除不存在的瓦片
        const toRemove = [];
        this.tileMap.forEach((tile, id) => {
            const key = `${tile.row}-${tile.col}-${tile.exp}`;
            if (!currentTiles.has(key)) {
                toRemove.push(id);
            }
        });

        toRemove.forEach(id => {
            const tile = this.tileMap.get(id);
            if (tile && tile.element) {
                tile.element.style.opacity = '0';
                tile.element.style.transform = 'scale(0.5)';
                const duration = Settings.reducedMotion ? 0 : ANIMATION_DURATION;
                setTimeout(() => {
                    if (tile.element && tile.element.parentNode) {
                        tile.element.remove();
                    }
                }, duration);
            }
            this.tileMap.delete(id);
        });

        // 更新/创建瓦片
        currentTiles.forEach((data, key) => {
            const existingId = Array.from(this.tileMap.entries()).find(([_, t]) =>
                t.row === data.row && t.col === data.col && t.exp === data.exp
            )?.[0];

            if (existingId) return;

            const tile = document.createElement('div');
            tile.className = `tile tile-${data.exp}`;
            tile.setAttribute('role', 'img');
            tile.setAttribute('aria-label', `Tile value ${TILE_VALUES[data.exp]}`);
            tile.style.left = `${PADDING + data.col * (tileSize + GAP)}px`;
            tile.style.top = `${PADDING + data.row * (tileSize + GAP)}px`;
            tile.style.width = `${tileSize}px`;
            tile.style.height = `${tileSize}px`;
            tile.style.fontSize = `${fontSize}px`;
            tile.textContent = TILE_VALUES[data.exp];

            if (Settings.reducedMotion) {
                tile.style.transition = 'none';
            } else {
                tile.style.opacity = '0';
                tile.style.transform = 'scale(0)';
                tile.style.transition = `all ${SPAWN_ANIMATION_DURATION}ms ease-out`;
            }

            DOM.gameEl.appendChild(tile);

            if (!Settings.reducedMotion) {
                requestAnimationFrame(() => {
                    tile.style.opacity = '1';
                    tile.style.transform = 'scale(1)';
                });
            }

            const id = this.generateTileId();
            this.tileMap.set(id, {
                row: data.row,
                col: data.col,
                exp: data.exp,
                element: tile
            });
        });
    },

    clear() {
        this.tileMap.forEach((tile) => {
            if (tile.element && tile.element.parentNode) {
                tile.element.remove();
            }
        });
        this.tileMap.clear();
        this.tileIdCounter = 0;
    }
};

// ==================== 矩阵工具函数 ====================
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
        const res = performSlide(GameState.grid, dir);
        if (boardChanged(GameState.grid, res.newGrid)) return true;
    }
    return false;
}

function hasEmpty() {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (GameState.grid[i][j] === 0) return true;
        }
    }
    return false;
}

// ==================== 游戏核心逻辑 ====================
function move(dir) {
    if (GameState.gameOver) return;

    const oldGrid = GameState.grid.map(r => [...r]);
    const res = performSlide(GameState.grid, dir);
    const changed = boardChanged(oldGrid, res.newGrid);

    if (changed) {
        GameState.saveHistory();
        GameState.grid = res.newGrid;

        // 连击系统
        if (res.score > 0) {
            GameState.combo++;
            GameState.totalMerges++;
            if (GameState.combo > GameState.maxCombo) {
                GameState.maxCombo = GameState.combo;
            }
            // 连击奖励
            const comboBonus = GameState.combo > 1 ? Math.floor(res.score * 0.1 * (GameState.combo - 1)) : 0;
            GameState.score += res.score + comboBonus;

            if (comboBonus > 0) {
                SoundSystem.play('combo');
                showComboPopup(comboBonus, GameState.combo);
            } else {
                SoundSystem.play('merge');
            }
        } else {
            GameState.combo = 0;
        }

        GameState.moves++;

        checkWin();
        addRandomTile();
        updateDisplay();
        SoundSystem.play('move');
        saveGameState();

        const duration = Settings.reducedMotion ? 0 : ANIMATION_DURATION;
        setTimeout(() => {
            if (!hasEmpty() && !canAnyMove()) {
                showGameOver();
            }
        }, duration + 50);
    } else {
        // 无效移动反馈
        SoundSystem.play('invalid');
        shakeBoard();
    }
}

function checkWin() {
    if (GameState.gameWon) return;

    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (GameState.grid[i][j] === WIN_TILE_EXP) {
                GameState.gameWon = true;
                setTimeout(showWin, 300);
                SoundSystem.play('win');
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
            if (GameState.grid[i][j] === 0) empties.push({ r: i, c: j });
        }
    }

    if (empties.length === 0) return false;

    const pos = empties[Math.floor(Math.random() * empties.length)];
    GameState.grid[pos.r][pos.c] = 1;
    return true;
}

// ==================== 视觉反馈 ====================
function shakeBoard() {
    DOM.gameEl.classList.add('shake');
    const duration = Settings.reducedMotion ? 0 : 300;
    setTimeout(() => {
        DOM.gameEl.classList.remove('shake');
    }, duration);
}

function showComboPopup(bonus, combo) {
    const popup = document.createElement('div');
    popup.className = 'combo-popup';
    popup.innerHTML = `<span class="combo-text">COMBO x${combo}</span><span class="bonus-text">+${bonus}</span>`;
    popup.style.left = '50%';
    popup.style.top = '40%';
    popup.style.transform = 'translateX(-50%)';
    DOM.gameEl.appendChild(popup);

    requestAnimationFrame(() => {
        popup.classList.add('animate');
    });

    const duration = Settings.reducedMotion ? 0 : 1000;
    setTimeout(() => {
        popup.remove();
    }, duration);
}

// ==================== UI 显示 ====================
function showWin() {
    DOM.overlayWinEl.classList.add('active');
    DOM.overlayWinEl.querySelector('#win-stats')?.remove();
    const statsDiv = document.createElement('div');
    statsDiv.id = 'win-stats';
    statsDiv.innerHTML = `
        <p>Moves: ${GameState.moves}</p>
        <p>Time: ${formatTime(GameState.gameTimer)}</p>
        <p>Max Combo: ${GameState.maxCombo}</p>
    `;
    DOM.overlayWinEl.insertBefore(statsDiv, DOM.overlayWinEl.querySelector('.overlay-buttons'));
}

function showGameOver() {
    GameState.gameOver = true;
    DOM.overlayGameOverEl.classList.add('active');
    SoundSystem.play('gameover');
    if (navigator.vibrate) navigator.vibrate(200);

    // 记录统计
    Statistics.recordGame(GameState.gameWon, GameState.score, GameState.moves, GameState.maxCombo);

    // 显示最终统计
    const finalScoreEl = document.getElementById('final-score');
    const finalMovesEl = document.getElementById('final-moves');
    const finalTimeEl = document.getElementById('final-time');
    const finalComboEl = document.getElementById('final-combo');

    if (finalScoreEl) finalScoreEl.textContent = GameState.score;
    if (finalMovesEl) finalMovesEl.textContent = GameState.moves;
    if (finalTimeEl) finalTimeEl.textContent = formatTime(GameState.gameTimer);
    if (finalComboEl) finalComboEl.textContent = GameState.maxCombo;

    clearGameState();
}

function hideOverlays() {
    DOM.overlayWinEl.classList.remove('active');
    DOM.overlayGameOverEl.classList.remove('active');
}

function keepPlaying() {
    hideOverlays();
}

function updateDisplay() {
    DOM.scoreEl.textContent = GameState.score;
    DOM.movesEl.textContent = GameState.moves;
    DOM.timerEl.textContent = formatTime(GameState.gameTimer);

    if (GameState.score > GameState.best) {
        GameState.best = GameState.score;
        Storage.set('best6561', GameState.best);
    }
    DOM.bestEl.textContent = GameState.best;

    // 更新撤销按钮状态
    if (DOM.undoBtnEl) {
        DOM.undoBtnEl.disabled = GameState.history.length === 0 || GameState.gameOver;
        DOM.undoBtnEl.style.opacity = DOM.undoBtnEl.disabled ? '0.5' : '1';
        DOM.undoBtnEl.setAttribute('aria-disabled', DOM.undoBtnEl.disabled.toString());
    }

    // 更新主题按钮
    if (DOM.themeBtnEl) {
        DOM.themeBtnEl.textContent = Settings.theme === 'light' ? '🌙 Dark' : '☀️ Light';
    }

    // 更新音效按钮
    if (DOM.soundBtnEl) {
        DOM.soundBtnEl.textContent = Settings.soundEnabled ? '🔊 On' : '🔇 Off';
    }

    TileRenderer.render();
}

// ==================== 游戏控制 ====================
function restartGame() {
    TileRenderer.clear();
    GameState.reset();

    if (GameState.timerInterval) {
        clearInterval(GameState.timerInterval);
    }
    GameState.timerInterval = setInterval(() => {
        GameState.gameTimer++;
        updateDisplay();
    }, 1000);

    addRandomTile();
    addRandomTile();
    updateDisplay();
    hideOverlays();
    SoundSystem.play('start');
    saveGameState();
}

function undo() {
    if (GameState.history.length === 0 || GameState.gameOver) return;

    const prevState = GameState.undo();
    hideOverlays();
    updateDisplay();
    SoundSystem.play('undo');
    saveGameState();
}

// ==================== 暂停系统 ====================
const PauseSystem = {
    isPaused: false,
    lastTime: 0,

    init() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    },

    pause() {
        if (this.isPaused || GameState.gameOver) return;
        this.isPaused = true;
        if (GameState.timerInterval) {
            clearInterval(GameState.timerInterval);
        }
        document.body.classList.add('paused');
    },

    resume() {
        if (!this.isPaused || GameState.gameOver) return;
        this.isPaused = false;
        GameState.timerInterval = setInterval(() => {
            GameState.gameTimer++;
            updateDisplay();
        }, 1000);
        document.body.classList.remove('paused');
    }
};

// ==================== 格式化时间 ====================
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ==================== 游戏状态持久化 ====================
function saveGameState() {
    const state = {
        grid: GameState.grid,
        score: GameState.score,
        best: GameState.best,
        moves: GameState.moves,
        gameTimer: GameState.gameTimer,
        gameWon: GameState.gameWon,
        gameOver: GameState.gameOver
    };
    Storage.set('gameState6561', state);
}

function loadGameState() {
    const saved = Storage.get('gameState6561');
    if (saved) {
        try {
            const state = saved;
            GameState.grid = state.grid || Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
            GameState.score = state.score || 0;
            GameState.best = state.best || 0;
            GameState.moves = state.moves || 0;
            GameState.gameTimer = state.gameTimer || 0;
            GameState.gameWon = state.gameWon || false;
            GameState.gameOver = state.gameOver || false;
            return true;
        } catch (e) {
            console.error('Failed to load game state:', e);
        }
    }
    return false;
}

function clearGameState() {
    Storage.remove('gameState6561');
}

// ==================== 输入处理 ====================
let touchStartX = 0;
let touchStartY = 0;

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
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                undo();
                return;
            }
            break;
    }

    if (dir) {
        SoundSystem.ensureContext(); // 确保 AudioContext 在用户交互时创建
        move(dir);
    }
}

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        SoundSystem.ensureContext();
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

        if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD) {
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

function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        const installBtn = document.getElementById('btn-install');
        if (installBtn) installBtn.style.display = 'none';
    });
}

function showInstallButton() {
    const installBtn = document.getElementById('btn-install');
    if (installBtn) {
        installBtn.style.display = 'inline-flex';
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                await deferredPrompt.userChoice;
                deferredPrompt = null;
            }
        });
    }
}

// ==================== 新手引导 ====================
function showTutorial() {
    const tutorial = document.getElementById('tutorial-overlay');
    if (tutorial && !Settings.hasSeenTutorial) {
        tutorial.classList.add('active');
    }
}

function hideTutorial() {
    const tutorial = document.getElementById('tutorial-overlay');
    if (tutorial) {
        tutorial.classList.remove('active');
        Settings.markTutorialSeen();
    }
}

// ==================== 设置面板 ====================
function toggleSettings() {
    const settings = document.getElementById('settings-overlay');
    if (settings) {
        settings.classList.toggle('active');
    }
}

function closeSettings() {
    const settings = document.getElementById('settings-overlay');
    if (settings) {
        settings.classList.remove('active');
    }
}

function showStats() {
    const stats = document.getElementById('stats-overlay');
    if (stats) {
        // 更新统计数据
        const winRateEl = document.getElementById('stat-win-rate');
        const gamesPlayedEl = document.getElementById('stat-games-played');
        const gamesWonEl = document.getElementById('stat-games-won');
        const bestScoreEl = document.getElementById('stat-best-score');
        const maxComboEl = document.getElementById('stat-max-combo');

        if (winRateEl) winRateEl.textContent = `${Statistics.getWinRate()}%`;
        if (gamesPlayedEl) gamesPlayedEl.textContent = GameState.gamesPlayed;
        if (gamesWonEl) gamesWonEl.textContent = GameState.gamesWon;
        if (bestScoreEl) bestScoreEl.textContent = GameState.best;
        if (maxComboEl) maxComboEl.textContent = Storage.get('maxCombo6561', 0);

        stats.classList.add('active');
    }
}

function closeStats() {
    const stats = document.getElementById('stats-overlay');
    if (stats) {
        stats.classList.remove('active');
    }
}

function resetTutorialHandler() {
    Settings.resetTutorial();
    closeSettings();
    setTimeout(showTutorial, 300);
}

// ==================== 初始化 ====================
function init() {
    Settings.init();
    Statistics.init();
    DOM.init();

    // 应用主题
    document.body.className = Settings.theme;

    // 应用 reduced motion
    if (Settings.reducedMotion) {
        document.body.classList.add('reduced-motion');
    }

    // 尝试加载游戏状态
    const loaded = loadGameState();

    // 事件监听
    document.addEventListener('keydown', handleKeydown);
    DOM.gameEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    DOM.gameEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    DOM.gameEl.addEventListener('touchend', handleTouchEnd, { passive: true });

    // 按钮事件
    document.getElementById('btn-keep-playing')?.addEventListener('click', keepPlaying);
    document.getElementById('btn-restart-win')?.addEventListener('click', restartGame);
    document.getElementById('btn-restart-lose')?.addEventListener('click', restartGame);
    document.getElementById('btn-undo')?.addEventListener('click', undo);
    document.getElementById('btn-restart-main')?.addEventListener('click', restartGame);
    document.getElementById('btn-close-tutorial')?.addEventListener('click', hideTutorial);
    document.getElementById('btn-theme')?.addEventListener('click', () => {
        Settings.toggleTheme();
        document.body.className = Settings.theme;
        updateDisplay();
    });
    document.getElementById('btn-sound')?.addEventListener('click', () => {
        Settings.toggleSound();
        updateDisplay();
    });
    document.getElementById('btn-settings')?.addEventListener('click', toggleSettings);
    document.getElementById('btn-stats')?.addEventListener('click', showStats);
    document.getElementById('btn-close-settings')?.addEventListener('click', closeSettings);
    document.getElementById('btn-close-stats')?.addEventListener('click', closeStats);
    document.getElementById('btn-reset-tutorial')?.addEventListener('click', resetTutorialHandler);

    // 暂停系统
    PauseSystem.init();

    // PWA 安装
    setupInstallPrompt();

    if (loaded) {
        // 恢复计时器
        if (GameState.timerInterval) {
            clearInterval(GameState.timerInterval);
        }
        if (!GameState.gameOver && !PauseSystem.isPaused) {
            GameState.timerInterval = setInterval(() => {
                GameState.gameTimer++;
                updateDisplay();
            }, 1000);
        }
        updateDisplay();
    } else {
        restartGame();
    }

    setTimeout(showTutorial, 500);

    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration.scope);
                // 检查更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(err => {
                console.log('SW registration failed:', err);
            });
    }
}

function showUpdateNotification() {
    const notification = document.getElementById('update-notification');
    if (notification) {
        notification.classList.add('active');
        document.getElementById('btn-reload-update')?.addEventListener('click', () => {
            window.location.reload();
        });
        document.getElementById('btn-dismiss-update')?.addEventListener('click', () => {
            notification.classList.remove('active');
        });
    }
}

document.addEventListener('DOMContentLoaded', init);

// 页面关闭前保存状态
window.addEventListener('beforeunload', () => {
    if (!GameState.gameOver) {
        saveGameState();
    }
});
