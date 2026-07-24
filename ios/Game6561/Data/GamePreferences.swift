import Foundation

class GamePreferences {
    private let defaults = UserDefaults.standard

    private enum Keys {
        static let grid = "grid"
        static let score = "score"
        static let best = "best"
        static let moves = "moves"
        static let timer = "timer"
        static let gameWon = "gameWon"
        static let gameOver = "gameOver"
        static let gamesPlayed = "gamesPlayed"
        static let gamesWon = "gamesWon"
        static let totalScore = "totalScore"
        static let bestScore = "bestScore"
        static let totalMoves = "totalMoves"
        static let maxCombo = "maxCombo"
        static let sound = "sound"
        static let theme = "theme"
        static let tutorial = "tutorial"
    }

    func saveGameState(_ state: GameState) {
        defaults.set(encodeGrid(state.grid), forKey: Keys.grid)
        defaults.set(state.score, forKey: Keys.score)
        defaults.set(state.best, forKey: Keys.best)
        defaults.set(state.moves, forKey: Keys.moves)
        defaults.set(state.gameTimer, forKey: Keys.timer)
        defaults.set(state.gameWon, forKey: Keys.gameWon)
        defaults.set(state.gameOver, forKey: Keys.gameOver)
    }

    func loadGameState() -> GameState? {
        guard let gridStr = defaults.string(forKey: Keys.grid) else { return nil }
        return GameState(
            grid: decodeGrid(gridStr),
            score: defaults.integer(forKey: Keys.score),
            best: defaults.integer(forKey: Keys.best),
            moves: defaults.integer(forKey: Keys.moves),
            gameTimer: defaults.integer(forKey: Keys.timer),
            gameWon: defaults.bool(forKey: Keys.gameWon),
            gameOver: defaults.bool(forKey: Keys.gameOver)
        )
    }

    func clearGameState() {
        for key in [Keys.grid, Keys.score, Keys.best, Keys.moves,
                     Keys.timer, Keys.gameWon, Keys.gameOver] {
            defaults.removeObject(forKey: key)
        }
    }

    var statistics: GameStatistics {
        GameStatistics(
            gamesPlayed: defaults.integer(forKey: Keys.gamesPlayed),
            gamesWon: defaults.integer(forKey: Keys.gamesWon),
            totalScore: defaults.integer(forKey: Keys.totalScore),
            bestScore: defaults.integer(forKey: Keys.bestScore),
            totalMoves: defaults.integer(forKey: Keys.totalMoves),
            maxCombo: defaults.integer(forKey: Keys.maxCombo)
        )
    }

    func recordGame(won: Bool, finalScore: Int, finalMoves: Int, finalMaxCombo: Int) -> GameStatistics {
        var stats = self.statistics
        stats.gamesPlayed += 1
        if won { stats.gamesWon += 1 }
        stats.totalScore += finalScore
        stats.bestScore = max(stats.bestScore, finalScore)
        stats.totalMoves += finalMoves
        stats.maxCombo = max(stats.maxCombo, finalMaxCombo)

        defaults.set(stats.gamesPlayed, forKey: Keys.gamesPlayed)
        defaults.set(stats.gamesWon, forKey: Keys.gamesWon)
        defaults.set(stats.totalScore, forKey: Keys.totalScore)
        defaults.set(stats.bestScore, forKey: Keys.bestScore)
        defaults.set(stats.totalMoves, forKey: Keys.totalMoves)
        defaults.set(stats.maxCombo, forKey: Keys.maxCombo)
        return stats
    }

    var isSoundEnabled: Bool {
        get { defaults.object(forKey: Keys.sound) == nil ? true : defaults.bool(forKey: Keys.sound) }
        set { defaults.set(newValue, forKey: Keys.sound) }
    }

    var isDarkTheme: Bool {
        get { defaults.string(forKey: Keys.theme) == "dark" }
        set { defaults.set(newValue ? "dark" : "light", forKey: Keys.theme) }
    }

    var hasSeenTutorial: Bool {
        get { defaults.bool(forKey: Keys.tutorial) }
        set { defaults.set(newValue, forKey: Keys.tutorial) }
    }

    func resetTutorial() {
        defaults.removeObject(forKey: Keys.tutorial)
    }

    // MARK: - Encoding

    private func encodeGrid(_ grid: [[Int]]) -> String {
        grid.flatMap { $0 }.map(String.init).joined(separator: ",")
    }

    private func decodeGrid(_ str: String) -> [[Int]] {
        let values = str.split(separator: ",").compactMap { Int($0) }
        var grid = Array(repeating: Array(repeating: 0, count: gridSize), count: gridSize)
        for r in 0..<gridSize {
            for c in 0..<gridSize {
                let idx = r * gridSize + c
                if idx < values.count { grid[r][c] = values[idx] }
            }
        }
        return grid
    }
}
