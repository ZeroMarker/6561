// 游戏配置
const TILE_SIZE = 50;
const GRID_OFFSET_X = 50;
const GRID_OFFSET_Y = 50;

// 方块状态
const BlockState = {
    STANDING: 'standing',  // 垂直站立 (1x1)
    HORIZONTAL_X: 'horizontal_x',  // 水平沿X轴 (2x1)
    HORIZONTAL_Y: 'horizontal_y'   // 水平沿Y轴 (1x2)
};

// 关卡设计
const levels = [
    // 关卡 1 - 经典第一关
    {
        grid: [
            [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1, 0, 0, 0]
        ],
        start: { x: 1, y: 1, state: BlockState.STANDING },
        goal: { x: 3, y: 6 }
    },
    // 关卡 2
    {
        grid: [
            [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 0, 0, 1, 1, 1, 1],
            [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ],
        start: { x: 0, y: 0, state: BlockState.STANDING },
        goal: { x: 8, y: 3 }
    },
    // 关卡 3
    {
        grid: [
            [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
        ],
        start: { x: 5, y: 0, state: BlockState.STANDING },
        goal: { x: 6, y: 7 }
    }
];

class BloxorzGame {
    constructor() {
        this.currentLevel = 0;
        this.moves = 0;
        this.block = null;
        this.canvas = null;
        this.ctx = null;
        this.gameBoard = null;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        this.gameBoard = document.getElementById('gameBoard');
        this.setupCanvas();
        this.loadLevel(this.currentLevel);
        this.setupEventListeners();
    }
    
    setupCanvas() {
        const level = levels[this.currentLevel];
        const rows = level.grid.length;
        const cols = level.grid[0].length;
        
        const canvasWidth = cols * TILE_SIZE + GRID_OFFSET_X * 2;
        const canvasHeight = rows * TILE_SIZE + GRID_OFFSET_Y * 2;
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.ctx = this.canvas.getContext('2d');
        
        this.gameBoard.innerHTML = '';
        this.gameBoard.appendChild(this.canvas);
    }
    
    loadLevel(levelIndex) {
        if (levelIndex >= levels.length) {
            this.showMessage('🎉 恭喜你通关了所有关卡！');
            this.currentLevel = 0;
        }
        
        this.currentLevel = levelIndex % levels.length;
        const level = levels[this.currentLevel];
        
        this.moves = 0;
        this.block = { ...level.start };
        this.isAnimating = false;
        
        document.getElementById('level').textContent = this.currentLevel + 1;
        document.getElementById('moves').textContent = this.moves;
        
        this.setupCanvas();
        this.render();
        this.hideMessage();
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (this.isAnimating) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.moveBlock('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.moveBlock('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.moveBlock('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.moveBlock('right');
                    break;
                case 'r':
                case 'R':
                    this.resetLevel();
                    break;
            }
        });
        
        // 按钮控制
        document.getElementById('upBtn').addEventListener('click', () => this.moveBlock('up'));
        document.getElementById('downBtn').addEventListener('click', () => this.moveBlock('down'));
        document.getElementById('leftBtn').addEventListener('click', () => this.moveBlock('left'));
        document.getElementById('rightBtn').addEventListener('click', () => this.moveBlock('right'));
        document.getElementById('resetBtn').addEventListener('click', () => this.resetLevel());
    }
    
    moveBlock(direction) {
        if (this.isAnimating) return;
        
        const level = levels[this.currentLevel];
        const oldBlock = { ...this.block };
        let newBlock = { ...this.block };
        
        // 根据当前状态和移动方向计算新位置
        switch(this.block.state) {
            case BlockState.STANDING:
                newBlock = this.moveFromStanding(direction);
                break;
            case BlockState.HORIZONTAL_X:
                newBlock = this.moveFromHorizontalX(direction);
                break;
            case BlockState.HORIZONTAL_Y:
                newBlock = this.moveFromHorizontalY(direction);
                break;
        }
        
        // 检查是否有效
        if (this.isValidPosition(newBlock)) {
            this.block = newBlock;
            this.moves++;
            document.getElementById('moves').textContent = this.moves;
            
            // 检查是否掉落
            if (!this.isOnPlatform()) {
                this.showMessage('💥 方块掉落了！');
                setTimeout(() => this.resetLevel(), 1500);
                return;
            }
            
            this.render();
            
            // 检查是否获胜
            if (this.checkWin()) {
                this.showMessage('🎉 关卡完成！');
                setTimeout(() => {
                    this.hideMessage();
                    this.loadLevel(this.currentLevel + 1);
                }, 2000);
            }
        }
    }
    
    moveFromStanding(direction) {
        const { x, y } = this.block;
        
        switch(direction) {
            case 'up':
                return { x, y: y - 1, state: BlockState.HORIZONTAL_Y };
            case 'down':
                return { x, y: y + 1, state: BlockState.HORIZONTAL_Y };
            case 'left':
                return { x: x - 1, y, state: BlockState.HORIZONTAL_X };
            case 'right':
                return { x: x + 1, y, state: BlockState.HORIZONTAL_X };
        }
    }
    
    moveFromHorizontalX(direction) {
        const { x, y } = this.block;
        
        switch(direction) {
            case 'up':
                return { x: x - 1, y: y - 1, state: BlockState.HORIZONTAL_X };
            case 'down':
                return { x: x + 1, y: y + 1, state: BlockState.HORIZONTAL_X };
            case 'left':
                return { x: x - 2, y, state: BlockState.STANDING };
            case 'right':
                return { x: x + 1, y, state: BlockState.STANDING };
        }
    }
    
    moveFromHorizontalY(direction) {
        const { x, y } = this.block;
        
        switch(direction) {
            case 'up':
                return { x, y: y - 2, state: BlockState.STANDING };
            case 'down':
                return { x, y: y + 1, state: BlockState.STANDING };
            case 'left':
                return { x: x - 1, y: y - 1, state: BlockState.HORIZONTAL_Y };
            case 'right':
                return { x: x + 1, y: y + 1, state: BlockState.HORIZONTAL_Y };
        }
    }
    
    isValidPosition(block) {
        const level = levels[this.currentLevel];
        const grid = level.grid;
        const rows = grid.length;
        const cols = grid[0].length;
        
        // 获取方块占据的所有格子
        const occupiedTiles = this.getOccupiedTiles(block);
        
        // 检查每个格子是否在平台范围内
        for (const tile of occupiedTiles) {
            if (tile.x < 0 || tile.x >= cols || tile.y < 0 || tile.y >= rows) {
                return false;
            }
        }
        
        return true;
    }
    
    isOnPlatform() {
        const level = levels[this.currentLevel];
        const grid = level.grid;
        const occupiedTiles = this.getOccupiedTiles(this.block);
        
        // 检查每个格子是否在平台上（值为1）
        for (const tile of occupiedTiles) {
            if (grid[tile.y][tile.x] !== 1) {
                return false;
            }
        }
        
        return true;
    }
    
    getOccupiedTiles(block) {
        const tiles = [];
        
        switch(block.state) {
            case BlockState.STANDING:
                tiles.push({ x: block.x, y: block.y });
                break;
            case BlockState.HORIZONTAL_X:
                tiles.push({ x: block.x, y: block.y });
                tiles.push({ x: block.x + 1, y: block.y });
                break;
            case BlockState.HORIZONTAL_Y:
                tiles.push({ x: block.x, y: block.y });
                tiles.push({ x: block.x, y: block.y + 1 });
                break;
        }
        
        return tiles;
    }
    
    checkWin() {
        const level = levels[this.currentLevel];
        return (
            this.block.state === BlockState.STANDING &&
            this.block.x === level.goal.x &&
            this.block.y === level.goal.y
        );
    }
    
    resetLevel() {
        this.loadLevel(this.currentLevel);
    }
    
    render() {
        const level = levels[this.currentLevel];
        const grid = level.grid;
        const rows = grid.length;
        const cols = grid[0].length;
        
        const ctx = this.ctx;
        
        // 清空画布
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制平台
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const tileX = GRID_OFFSET_X + x * TILE_SIZE;
                const tileY = GRID_OFFSET_Y + y * TILE_SIZE;
                
                if (grid[y][x] === 1) {
                    // 绘制平台方块
                    const gradient = ctx.createLinearGradient(tileX, tileY, tileX, tileY + TILE_SIZE);
                    gradient.addColorStop(0, '#4a4e69');
                    gradient.addColorStop(1, '#2d3142');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(tileX + 2, tileY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                    
                    // 边框
                    ctx.strokeStyle = '#6a6e89';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(tileX + 2, tileY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                }
            }
        }
        
        // 绘制终点
        const goalX = GRID_OFFSET_X + level.goal.x * TILE_SIZE;
        const goalY = GRID_OFFSET_Y + level.goal.y * TILE_SIZE;
        ctx.fillStyle = '#000000';
        ctx.fillRect(goalX + 5, goalY + 5, TILE_SIZE - 10, TILE_SIZE - 10);
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 3;
        ctx.strokeRect(goalX + 5, goalY + 5, TILE_SIZE - 10, TILE_SIZE - 10);
        
        // 绘制玩家方块
        this.renderBlock();
    }
    
    renderBlock() {
        const ctx = this.ctx;
        const occupiedTiles = this.getOccupiedTiles(this.block);
        
        // 根据方块状态绘制
        let blockX, blockY, blockWidth, blockHeight;
        
        switch(this.block.state) {
            case BlockState.STANDING:
                blockX = GRID_OFFSET_X + this.block.x * TILE_SIZE + 5;
                blockY = GRID_OFFSET_Y + this.block.y * TILE_SIZE + 5;
                blockWidth = TILE_SIZE - 10;
                blockHeight = TILE_SIZE - 10;
                break;
            case BlockState.HORIZONTAL_X:
                blockX = GRID_OFFSET_X + this.block.x * TILE_SIZE + 5;
                blockY = GRID_OFFSET_Y + this.block.y * TILE_SIZE + 10;
                blockWidth = TILE_SIZE * 2 - 10;
                blockHeight = TILE_SIZE - 20;
                break;
            case BlockState.HORIZONTAL_Y:
                blockX = GRID_OFFSET_X + this.block.x * TILE_SIZE + 10;
                blockY = GRID_OFFSET_Y + this.block.y * TILE_SIZE + 5;
                blockWidth = TILE_SIZE - 20;
                blockHeight = TILE_SIZE * 2 - 10;
                break;
        }
        
        // 绘制3D效果
        const gradient = ctx.createLinearGradient(blockX, blockY, blockX, blockY + blockHeight);
        gradient.addColorStop(0, '#ffd93d');
        gradient.addColorStop(0.5, '#ff9f1c');
        gradient.addColorStop(1, '#f77f00');
        ctx.fillStyle = gradient;
        ctx.fillRect(blockX, blockY, blockWidth, blockHeight);
        
        // 边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(blockX, blockY, blockWidth, blockHeight);
    }
    
    showMessage(text) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.classList.remove('hidden');
    }
    
    hideMessage() {
        const messageEl = document.getElementById('message');
        messageEl.classList.add('hidden');
    }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
    new BloxorzGame();
});
