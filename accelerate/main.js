class GameManager {
    constructor() {
        this.game = new Game2048();
        this.sensor = new SensorController(this.game, (direction) => {
            this.handleMove(direction);
        });
        this.init();
    }

    init() {
        this.createGrid();
        this.render();
        this.bindEvents();
    }

    createGrid() {
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            gridContainer.appendChild(cell);
        }
    }

    render() {
        const tileContainer = document.getElementById('tile-container');
        tileContainer.innerHTML = '';

        const grid = this.game.getGrid();
        const cellSize = this.getCellSize();
        const gap = 10;

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const value = grid[r][c];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value}`;
                    tile.textContent = value;
                    
                    const left = c * (cellSize + gap);
                    const top = r * (cellSize + gap);
                    
                    tile.style.width = `${cellSize}px`;
                    tile.style.height = `${cellSize}px`;
                    tile.style.left = `${left}px`;
                    tile.style.top = `${top}px`;
                    tile.style.lineHeight = `${cellSize}px`;
                    
                    tileContainer.appendChild(tile);
                }
            }
        }
    }

    getCellSize() {
        const container = document.getElementById('tile-container');
        const containerWidth = container.offsetWidth;
        const gap = 10;
        return (containerWidth - gap * 3) / 4;
    }

    handleMove(direction) {
        const moved = this.game.move(direction);
        if (moved) {
            this.render();
            this.checkGameState();
        }
    }

    checkGameState() {
        if (this.game.won) {
            this.showMessage('你赢了！🎉', this.game.getScore());
        } else if (this.game.over) {
            this.showMessage('游戏结束！', this.game.getScore());
        }
    }

    showMessage(title, finalScore) {
        const container = document.querySelector('.game-container');
        const existingMessage = container.querySelector('.game-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const message = document.createElement('div');
        message.className = 'game-message';
        message.innerHTML = `
            <h2>${title}</h2>
            <p>最终分数: ${finalScore}</p>
            <button class="btn" onclick="gameManager.newGame()">再来一局</button>
        `;
        container.appendChild(message);
    }

    hideMessage() {
        const container = document.querySelector('.game-container');
        const message = container.querySelector('.game-message');
        if (message) {
            message.remove();
        }
    }

    newGame() {
        this.game.init();
        this.hideMessage();
        this.render();
    }

    updateSensorStatus(message, connected) {
        const statusText = document.getElementById('statusText');
        const statusDiv = document.getElementById('sensorStatus');
        statusText.textContent = `状态: ${message}`;
        statusDiv.style.background = connected ? '#d4edda' : '#f8d7da';
        statusDiv.style.color = connected ? '#155724' : '#721c24';
    }

    bindEvents() {
        // 新游戏按钮
        document.getElementById('new-game').addEventListener('click', () => {
            this.newGame();
        });

        // 传感器权限按钮
        document.getElementById('requestPermission').addEventListener('click', async () => {
            const success = await this.sensor.requestPermission();
            if (success) {
                document.getElementById('requestPermission').textContent = '✓ 传感器已激活';
                document.getElementById('requestPermission').style.background = '#4caf50';
                this.updateSensorStatus('已连接', true);
            } else {
                this.updateSensorStatus('连接失败', false);
            }
        });

        // 窗口大小改变时重新渲染
        window.addEventListener('resize', () => {
            this.render();
        });
    }
}

// 启动游戏
let gameManager;
document.addEventListener('DOMContentLoaded', () => {
    gameManager = new GameManager();
});
