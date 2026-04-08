class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.size = 4;
        this.won = false;
        this.over = false;
        this.init();
    }

    init() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.score = 0;
        this.won = false;
        this.over = false;
        this.addRandomTile();
        this.addRandomTile();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        if (this.over && !this.won) return false;

        let moved = false;
        const oldGrid = JSON.parse(JSON.stringify(this.grid));

        switch (direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }

        if (moved) {
            this.addRandomTile();
            this.updateScore();
            
            if (this.checkWin()) {
                this.won = true;
            } else if (this.checkGameOver()) {
                this.over = true;
            }
        }

        return moved;
    }

    moveLeft() {
        let moved = false;
        for (let r = 0; r < this.size; r++) {
            const row = this.grid[r].filter(val => val !== 0);
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i + 1]) {
                    row[i] *= 2;
                    this.score += row[i];
                    row.splice(i + 1, 1);
                }
            }
            while (row.length < this.size) {
                row.push(0);
            }
            if (JSON.stringify(this.grid[r]) !== JSON.stringify(row)) {
                moved = true;
            }
            this.grid[r] = row;
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let r = 0; r < this.size; r++) {
            const row = this.grid[r].filter(val => val !== 0);
            for (let i = row.length - 1; i > 0; i--) {
                if (row[i] === row[i - 1]) {
                    row[i] *= 2;
                    this.score += row[i];
                    row.splice(i - 1, 1);
                    i--;
                }
            }
            const newRow = Array(this.size).fill(0);
            for (let i = 0; i < row.length; i++) {
                newRow[this.size - row.length + i] = row[i];
            }
            if (JSON.stringify(this.grid[r]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[r] = newRow;
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let c = 0; c < this.size; c++) {
            const col = [];
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] !== 0) {
                    col.push(this.grid[r][c]);
                }
            }
            for (let i = 0; i < col.length - 1; i++) {
                if (col[i] === col[i + 1]) {
                    col[i] *= 2;
                    this.score += col[i];
                    col.splice(i + 1, 1);
                }
            }
            while (col.length < this.size) {
                col.push(0);
            }
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] !== col[r]) {
                    moved = true;
                }
                this.grid[r][c] = col[r];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let c = 0; c < this.size; c++) {
            const col = [];
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] !== 0) {
                    col.push(this.grid[r][c]);
                }
            }
            for (let i = col.length - 1; i > 0; i--) {
                if (col[i] === col[i - 1]) {
                    col[i] *= 2;
                    this.score += col[i];
                    col.splice(i - 1, 1);
                    i--;
                }
            }
            const newCol = Array(this.size).fill(0);
            for (let i = 0; i < col.length; i++) {
                newCol[this.size - col.length + i] = col[i];
            }
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] !== newCol[r]) {
                    moved = true;
                }
                this.grid[r][c] = newCol[r];
            }
        }
        return moved;
    }

    checkWin() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }

    checkGameOver() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) return false;
                if (c < this.size - 1 && this.grid[r][c] === this.grid[r][c + 1]) return false;
                if (r < this.size - 1 && this.grid[r][c] === this.grid[r + 1][c]) return false;
            }
        }
        return true;
    }

    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    getGrid() {
        return this.grid;
    }

    getScore() {
        return this.score;
    }
}
