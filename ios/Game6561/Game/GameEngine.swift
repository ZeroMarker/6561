import Foundation

struct GameEngine {

    static func createInitialState() -> GameState {
        var state = GameState()
        state = addRandomTile(to: state)
        state = addRandomTile(to: state)
        return state
    }

    static func move(_ state: GameState, direction: Direction) -> GameState {
        if state.gameOver || state.gameWon { return state }

        let result = performSlide(grid: state.grid, direction: direction)
        if !boardChanged(state.grid, result.grid) { return state }

        var newState = state
        var history = state.history
        history.append(HistoryEntry(
            grid: state.grid,
            score: state.score,
            moves: state.moves,
            gameWon: state.gameWon,
            gameOver: state.gameOver,
            combo: state.combo
        ))
        if history.count > maxHistory { history.removeFirst() }
        newState.history = history
        newState.grid = result.grid
        newState.moves += 1

        if result.score > 0 {
            let newCombo = state.combo + 1
            let newTotalMerges = state.totalMerges + result.mergedCount
            let newMaxCombo = max(state.maxCombo, newCombo)
            let comboBonus = newCombo > 1 ? Int(Double(result.score) * 0.1 * Double(newCombo - 1)) : 0
            let scoreAdd = result.score + comboBonus

            newState.score = state.score + scoreAdd
            newState.combo = newCombo
            newState.totalMerges = newTotalMerges
            newState.maxCombo = newMaxCombo
        } else {
            newState.combo = 0
        }

        if !state.gameWon && hasWon(grid: newState.grid) {
            newState.gameWon = true
        }

        newState = addRandomTile(to: newState)

        if newState.score > newState.best {
            newState.best = newState.score
        }

        if !newState.hasEmptyCell && !canAnyMove(grid: newState.grid) {
            newState.gameOver = true
        }

        return newState
    }

    static func undo(_ state: GameState) -> GameState? {
        if state.history.isEmpty || state.gameOver { return nil }

        var history = state.history
        let prev = history.removeLast()

        var newState = state
        newState.grid = prev.grid
        newState.score = prev.score
        newState.moves = prev.moves
        newState.gameWon = prev.gameWon
        newState.gameOver = prev.gameOver
        newState.combo = prev.combo
        newState.history = history
        return newState
    }

    static func addRandomTile(to state: GameState) -> GameState {
        var empties: [(Int, Int)] = []
        for r in 0..<gridSize {
            for c in 0..<gridSize {
                if state.grid[r][c] == 0 { empties.append((r, c)) }
            }
        }
        if empties.isEmpty { return state }

        let (r, c) = empties[Int.random(in: 0..<empties.count)]
        var newState = state
        newState.grid[r][c] = 1
        return newState
    }

    // MARK: - Private

    private static func performSlide(grid: [[Int]], direction: Direction) -> (grid: [[Int]], score: Int, mergedCount: Int) {
        var result = grid.map { $0 }
        var totalScore = 0
        var totalMerged = 0

        switch direction {
        case .left:
            for i in 0..<gridSize {
                let (line, score, merged) = mergeLine(result[i])
                result[i] = line
                totalScore += score
                totalMerged += merged
            }
        case .right:
            for i in 0..<gridSize {
                let (line, score, merged) = mergeLine(result[i].reversed())
                result[i] = line.reversed()
                totalScore += score
                totalMerged += merged
            }
        case .up:
            var transposed = transpose(result)
            for i in 0..<gridSize {
                let (line, score, merged) = mergeLine(transposed[i])
                transposed[i] = line
                totalScore += score
                totalMerged += merged
            }
            result = transpose(transposed)
        case .down:
            var transposed = transpose(result)
            for i in 0..<gridSize {
                let (line, score, merged) = mergeLine(transposed[i].reversed())
                transposed[i] = line.reversed()
                totalScore += score
                totalMerged += merged
            }
            result = transpose(transposed)
        }

        return (result, totalScore, totalMerged)
    }

    private static func mergeLine(_ line: [Int]) -> (line: [Int], score: Int, mergedCount: Int) {
        let nonZero = line.filter { $0 != 0 }
        var merged: [Int] = []
        var addedScore = 0
        var i = 0
        var mergedCount = 0

        while i < nonZero.count {
            if i + 2 < nonZero.count &&
                nonZero[i] == nonZero[i + 1] &&
                nonZero[i] == nonZero[i + 2]
            {
                let newExp = nonZero[i] + 1
                merged.append(newExp)
                addedScore += tileValues[newExp]
                i += 3
                mergedCount += 1
            } else {
                merged.append(nonZero[i])
                i += 1
            }
        }

        while merged.count < gridSize { merged.append(0) }

        return (merged, addedScore, mergedCount)
    }

    private static func transpose(_ matrix: [[Int]]) -> [[Int]] {
        return (0..<gridSize).map { c in
            (0..<gridSize).map { r in matrix[r][c] }
        }
    }

    private static func boardChanged(_ old: [[Int]], _ new: [[Int]]) -> Bool {
        for r in 0..<gridSize {
            for c in 0..<gridSize {
                if old[r][c] != new[r][c] { return true }
            }
        }
        return false
    }

    private static func canAnyMove(grid: [[Int]]) -> Bool {
        for dir in Direction.allCases {
            let result = performSlide(grid: grid, direction: dir)
            if boardChanged(grid, result.grid) { return true }
        }
        return false
    }

    private static func hasWon(grid: [[Int]]) -> Bool {
        for r in 0..<gridSize {
            for c in 0..<gridSize {
                if grid[r][c] == winTileExp { return true }
            }
        }
        return false
    }
}
