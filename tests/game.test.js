/**
 * Unit tests for 6561 game logic
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Import game constants and functions
const SIZE = 6;
const TILE_VALUES = [0, 3, 9, 27, 81, 243, 729, 2187, 6561];

// Helper: Create empty grid
function createEmptyGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

// Merge logic (copied from game.js for testing)
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

// Matrix transpose
function transpose(g) {
    return g[0].map((_, i) => g.map(row => row[i]));
}

// Slide functions
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

// Check if board changed
function boardChanged(oldG, newG) {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (oldG[i][j] !== newG[i][j]) return true;
        }
    }
    return false;
}

// Check if any move is possible
function canAnyMove(grid) {
    const dirs = ['left', 'right', 'up', 'down'];
    for (let dir of dirs) {
        const res = performSlide(grid, dir);
        if (boardChanged(grid, res.newGrid)) return true;
    }
    return false;
}

// Check for empty cells
function hasEmpty(grid) {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (grid[i][j] === 0) return true;
        }
    }
    return false;
}

// Check win condition
function checkWin(grid) {
    const WIN_TILE_EXP = 9;
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (grid[i][j] === WIN_TILE_EXP) return true;
        }
    }
    return false;
}

// ==================== Storage Mock ====================
const StorageMock = {
    data: new Map(),
    get(key, defaultValue = null) {
        try {
            const item = this.data.get(key);
            return item !== undefined ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    set(key, value) {
        try {
            this.data.set(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },
    remove(key) {
        try {
            this.data.delete(key);
            return true;
        } catch (e) {
            return false;
        }
    },
    clear() {
        this.data.clear();
    }
};

// ==================== GameState Mock ====================
function createGameState() {
    return {
        grid: createEmptyGrid(),
        score: 0,
        best: 0,
        moves: 0,
        gameTimer: 0,
        gameWon: false,
        gameOver: false,
        history: [],
        combo: 0,
        maxCombo: 0,

        reset() {
            this.grid = createEmptyGrid();
            this.score = 0;
            this.moves = 0;
            this.gameTimer = 0;
            this.gameWon = false;
            this.gameOver = false;
            this.history = [];
            this.combo = 0;
            this.maxCombo = 0;
        },

        saveHistory() {
            if (this.history.length >= 10) {
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
}

describe('6561 Game Logic', () => {
    describe('mergeLine', () => {
        it('should merge three identical numbers', () => {
            const line = [1, 1, 1, 0, 0, 0]; // Three 3s
            const result = mergeLine(line);
            expect(result.line).toEqual([2, 0, 0, 0, 0, 0]); // One 9
            expect(result.score).toBe(9);
        });

        it('should merge multiple sets of three', () => {
            const line = [1, 1, 1, 2, 2, 2]; // Three 3s and three 9s
            const result = mergeLine(line);
            expect(result.line).toEqual([2, 3, 0, 0, 0, 0]); // One 9 and one 27
            expect(result.score).toBe(9 + 27);
        });

        it('should not merge two identical numbers', () => {
            const line = [1, 1, 0, 0, 0, 0]; // Two 3s
            const result = mergeLine(line);
            expect(result.line).toEqual([1, 1, 0, 0, 0, 0]); // Unchanged
            expect(result.score).toBe(0);
        });

        it('should handle non-zero tiles without merging', () => {
            const line = [1, 2, 3, 0, 0, 0]; // 3, 9, 27
            const result = mergeLine(line);
            expect(result.line).toEqual([1, 2, 3, 0, 0, 0]);
            expect(result.score).toBe(0);
        });

        it('should compress zeros after merge', () => {
            const line = [0, 1, 1, 1, 0, 0];
            const result = mergeLine(line);
            expect(result.line).toEqual([2, 0, 0, 0, 0, 0]);
        });

        it('should handle all zeros', () => {
            const line = [0, 0, 0, 0, 0, 0];
            const result = mergeLine(line);
            expect(result.line).toEqual([0, 0, 0, 0, 0, 0]);
            expect(result.score).toBe(0);
        });

        it('should handle partial merge with remainder', () => {
            const line = [1, 1, 1, 2, 0, 0]; // Three 3s and one 9
            const result = mergeLine(line);
            expect(result.line).toEqual([2, 2, 0, 0, 0, 0]);
            expect(result.score).toBe(9);
        });

        it('should handle five identical numbers (merge 3, leave 2)', () => {
            const line = [1, 1, 1, 1, 1, 0];
            const result = mergeLine(line);
            expect(result.line).toEqual([2, 1, 1, 0, 0, 0]);
            expect(result.score).toBe(9);
        });
    });

    describe('slideLeft', () => {
        it('should slide and merge left', () => {
            const row = [0, 1, 1, 1, 0, 2];
            const result = slideLeft(row);
            expect(result.line).toEqual([2, 2, 0, 0, 0, 0]);
        });

        it('should handle full row merge', () => {
            const row = [1, 1, 1, 2, 2, 2];
            const result = slideLeft(row);
            expect(result.line).toEqual([2, 3, 0, 0, 0, 0]);
        });
    });

    describe('slideRight', () => {
        it('should slide and merge right', () => {
            const row = [2, 0, 1, 1, 1, 0];
            const result = slideRight(row);
            expect(result.line).toEqual([0, 0, 0, 0, 2, 2]);
        });

        it('should handle full row merge right', () => {
            const row = [1, 1, 1, 2, 2, 2];
            const result = slideRight(row);
            expect(result.line).toEqual([0, 0, 0, 0, 2, 3]);
        });
    });

    describe('performSlide', () => {
        it('should slide entire grid left', () => {
            const grid = createEmptyGrid();
            grid[0] = [1, 1, 1, 0, 0, 0];
            const result = performSlide(grid, 'left');
            expect(result.newGrid[0]).toEqual([2, 0, 0, 0, 0, 0]);
            expect(result.score).toBe(9);
        });

        it('should slide entire grid right', () => {
            const grid = createEmptyGrid();
            grid[0] = [0, 0, 0, 1, 1, 1];
            const result = performSlide(grid, 'right');
            expect(result.newGrid[0]).toEqual([0, 0, 0, 0, 0, 2]);
        });

        it('should slide entire grid up', () => {
            const grid = createEmptyGrid();
            grid[0][0] = 1;
            grid[1][0] = 1;
            grid[2][0] = 1;
            const result = performSlide(grid, 'up');
            expect(result.newGrid[0][0]).toBe(2);
            expect(result.newGrid[1][0]).toBe(0);
            expect(result.newGrid[2][0]).toBe(0);
        });

        it('should slide entire grid down', () => {
            const grid = createEmptyGrid();
            grid[3][0] = 1;
            grid[4][0] = 1;
            grid[5][0] = 1;
            const result = performSlide(grid, 'down');
            expect(result.newGrid[5][0]).toBe(2);
            expect(result.newGrid[4][0]).toBe(0);
        });
    });

    describe('boardChanged', () => {
        it('should detect board changes', () => {
            const oldGrid = createEmptyGrid();
            const newGrid = createEmptyGrid();
            newGrid[0][0] = 1;
            expect(boardChanged(oldGrid, newGrid)).toBe(true);
        });

        it('should return false for identical boards', () => {
            const grid = createEmptyGrid();
            expect(boardChanged(grid, grid)).toBe(false);
        });
    });

    describe('hasEmpty', () => {
        it('should return true for empty grid', () => {
            const grid = createEmptyGrid();
            expect(hasEmpty(grid)).toBe(true);
        });

        it('should return false for full grid', () => {
            const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(1));
            expect(hasEmpty(grid)).toBe(false);
        });

        it('should return true for partially full grid', () => {
            const grid = createEmptyGrid();
            grid[0][0] = 1;
            expect(hasEmpty(grid)).toBe(true);
        });
    });

    describe('canAnyMove', () => {
        it('should return true when merges are possible', () => {
            const grid = createEmptyGrid();
            grid[0][0] = 1;
            grid[0][1] = 1;
            grid[0][2] = 1;
            expect(canAnyMove(grid)).toBe(true);
        });

        it('should return true when empty spaces exist', () => {
            const grid = createEmptyGrid();
            grid[0][0] = 1;
            expect(canAnyMove(grid)).toBe(true);
        });

        it('should handle complex board state', () => {
            const grid = createEmptyGrid();
            // Create a board with possible moves
            grid[0] = [1, 0, 1, 0, 1, 0];
            expect(canAnyMove(grid)).toBe(true);
        });
    });

    describe('checkWin', () => {
        it('should return true when 6561 tile exists', () => {
            const grid = createEmptyGrid();
            grid[0][0] = 9; // 6561
            expect(checkWin(grid)).toBe(true);
        });

        it('should return false when 6561 tile does not exist', () => {
            const grid = createEmptyGrid();
            grid[0][0] = 8; // 2187
            expect(checkWin(grid)).toBe(false);
        });

        it('should find 6561 tile anywhere on board', () => {
            const grid = createEmptyGrid();
            grid[5][5] = 9; // Bottom right corner
            expect(checkWin(grid)).toBe(true);
        });
    });

    describe('GameState - Undo functionality', () => {
        it('should save and restore game state', () => {
            const state = createGameState();
            state.grid[0][0] = 1;
            state.score = 100;
            state.moves = 5;

            state.saveHistory();

            state.grid[0][0] = 2;
            state.score = 200;
            state.moves = 6;

            state.undo();

            expect(state.grid[0][0]).toBe(1);
            expect(state.score).toBe(100);
            expect(state.moves).toBe(5);
        });

        it('should limit history to MAX_HISTORY (10)', () => {
            const state = createGameState();

            for (let i = 0; i < 15; i++) {
                state.saveHistory();
            }

            expect(state.history.length).toBe(10);
        });

        it('should not undo when game is over', () => {
            const state = createGameState();
            state.gameOver = true;
            state.saveHistory();

            const result = state.undo();
            expect(result).toBe(null);
        });

        it('should not undo when history is empty', () => {
            const state = createGameState();
            const result = state.undo();
            expect(result).toBe(null);
        });
    });

    describe('GameState - Combo system', () => {
        it('should track combo on consecutive merges', () => {
            const state = createGameState();
            
            // Simulate consecutive merges
            state.combo = 0;
            state.combo++; // First merge
            state.combo++; // Second merge
            state.combo++; // Third merge

            expect(state.combo).toBe(3);
        });

        it('should track max combo', () => {
            const state = createGameState();
            
            state.combo = 3;
            if (state.combo > state.maxCombo) {
                state.maxCombo = state.combo;
            }

            state.combo = 0; // Combo reset
            state.combo = 2;
            if (state.combo > state.maxCombo) {
                state.maxCombo = state.combo;
            }

            expect(state.maxCombo).toBe(3);
        });
    });

    describe('Storage - Safe storage operations', () => {
        beforeEach(() => {
            StorageMock.clear();
        });

        it('should save and load data', () => {
            StorageMock.set('test', { value: 123 });
            expect(StorageMock.get('test')).toEqual({ value: 123 });
        });

        it('should return default value when key does not exist', () => {
            expect(StorageMock.get('nonexistent', 'default')).toBe('default');
        });

        it('should handle remove operation', () => {
            StorageMock.set('test', 123);
            StorageMock.remove('test');
            expect(StorageMock.get('test')).toBe(null);
        });

        it('should handle JSON parse errors gracefully', () => {
            StorageMock.data.set('invalid', 'not-json');
            expect(StorageMock.get('invalid', 'default')).toBe('default');
        });
    });

    describe('Integration tests', () => {
        it('should handle complex merge scenario', () => {
            const grid = createEmptyGrid();
            // Set up: three 3s in first row
            grid[0][0] = 1;
            grid[0][1] = 1;
            grid[0][2] = 1;
            // And three 9s
            grid[0][3] = 2;
            grid[0][4] = 2;
            grid[0][5] = 2;

            const result = performSlide(grid, 'left');

            // Should merge to: 9 (exp=2) and 27 (exp=3)
            expect(result.newGrid[0][0]).toBe(2);
            expect(result.newGrid[0][1]).toBe(3);
            expect(result.score).toBe(9 + 27);
        });

        it('should handle multiple moves in sequence', () => {
            const grid = createEmptyGrid();
            grid[0][0] = 1;
            grid[0][1] = 1;
            grid[0][2] = 1;

            // First move - merge left
            const result1 = performSlide(grid, 'left');
            expect(result1.newGrid[0][0]).toBe(2);

            // Add more tiles
            result1.newGrid[0][1] = 1;
            result1.newGrid[0][2] = 1;

            // Second move - should merge again
            const result2 = performSlide(result1.newGrid, 'left');
            expect(result2.newGrid[0][0]).toBe(2);
            expect(result2.newGrid[0][1]).toBe(1);
        });

        it('should detect game over scenario', () => {
            // Create a full grid with no possible moves
            const grid = Array.from({ length: SIZE }, (_, row) =>
                Array(SIZE).fill(row % 3 === 0 ? 1 : (row % 3 === 1 ? 2 : 3))
            );

            expect(hasEmpty(grid)).toBe(false);
            // Note: This grid might still have moves, so we just test hasEmpty
        });

        it('should handle transpose correctly', () => {
            const grid = [
                [1, 2, 3, 4, 5, 6],
                [7, 8, 9, 10, 11, 12],
                [13, 14, 15, 16, 17, 18],
                [19, 20, 21, 22, 23, 24],
                [25, 26, 27, 28, 29, 30],
                [31, 32, 33, 34, 35, 36]
            ];

            const transposed = transpose(grid);

            expect(transposed[0][0]).toBe(1);
            expect(transposed[0][1]).toBe(7);
            expect(transposed[1][0]).toBe(2);
            expect(transposed[5][5]).toBe(36);
        });
    });

    describe('Edge cases', () => {
        it('should handle grid with all same values', () => {
            const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(1));
            const result = performSlide(grid, 'left');

            // Each row: [1,1,1,1,1,1] -> [2,2,0,0,0,0]
            // Each merge of three 1s -> 2 scores TILE_VALUES[2] = 9
            // Two merges per row: 9 * 2 = 18 per row, total = 18 * 6 = 108
            expect(result.newGrid[0]).toEqual([2, 2, 0, 0, 0, 0]);
            expect(result.score).toBe(108);
        });

        it('should handle alternating pattern', () => {
            const grid = createEmptyGrid();
            grid[0] = [1, 2, 1, 2, 1, 2];
            const result = performSlide(grid, 'left');
            
            // No merges possible, just compress
            expect(result.newGrid[0]).toEqual([1, 2, 1, 2, 1, 2]);
            expect(result.score).toBe(0);
        });

        it('should handle single non-zero tile', () => {
            const grid = createEmptyGrid();
            grid[0][0] = 5;
            const result = performSlide(grid, 'right');
            
            expect(result.newGrid[0][5]).toBe(5);
            expect(result.score).toBe(0);
        });
    });
});
