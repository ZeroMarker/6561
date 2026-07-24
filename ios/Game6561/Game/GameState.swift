import Foundation

let gridSize = 6
let tileValues = [0, 3, 9, 27, 81, 243, 729, 2187, 6561]
let winTileExp = 9
let maxHistory = 10

struct GameState: Equatable {
    var grid: [[Int]]
    var score: Int
    var best: Int
    var moves: Int
    var gameTimer: Int
    var gameWon: Bool
    var gameOver: Bool
    var combo: Int
    var totalMerges: Int
    var maxCombo: Int
    var gamesPlayed: Int
    var gamesWon: Int
    var history: [HistoryEntry]

    init(
        grid: [[Int]]? = nil,
        score: Int = 0,
        best: Int = 0,
        moves: Int = 0,
        gameTimer: Int = 0,
        gameWon: Bool = false,
        gameOver: Bool = false,
        combo: Int = 0,
        totalMerges: Int = 0,
        maxCombo: Int = 0,
        gamesPlayed: Int = 0,
        gamesWon: Int = 0,
        history: [HistoryEntry] = []
    ) {
        self.grid = grid ?? Array(repeating: Array(repeating: 0, count: gridSize), count: gridSize)
        self.score = score
        self.best = best
        self.moves = moves
        self.gameTimer = gameTimer
        self.gameWon = gameWon
        self.gameOver = gameOver
        self.combo = combo
        self.totalMerges = totalMerges
        self.maxCombo = maxCombo
        self.gamesPlayed = gamesPlayed
        self.gamesWon = gamesWon
        self.history = history
    }

    mutating func copyGrid() -> [[Int]] {
        return grid.map { $0 }
    }

    var hasEmptyCell: Bool {
        for r in 0..<gridSize {
            for c in 0..<gridSize {
                if grid[r][c] == 0 { return true }
            }
        }
        return false
    }
}

struct HistoryEntry: Equatable {
    var grid: [[Int]]
    var score: Int
    var moves: Int
    var gameWon: Bool
    var gameOver: Bool
    var combo: Int
}

struct GameStatistics: Equatable {
    var gamesPlayed: Int
    var gamesWon: Int
    var totalScore: Int
    var bestScore: Int
    var totalMoves: Int
    var maxCombo: Int
}

enum Direction: CaseIterable {
    case left, right, up, down
}
