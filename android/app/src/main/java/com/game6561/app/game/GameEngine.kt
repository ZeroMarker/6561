package com.game6561.app.game

import kotlin.random.Random

fun GameState.copyOfHistory(): MutableList<HistoryEntry> =
    history.map { it.copy(grid = it.grid.map { row -> row.copyOf() }.toTypedArray()) }.toMutableList()

object GameEngine {

    private val random = Random

    fun createInitialState(): GameState = GameState()
        .let { addRandomTile(addRandomTile(it)) }

    fun move(state: GameState, direction: Direction): GameState {
        if (state.gameOver || state.gameWon) return state

        val result = performSlide(state.grid, direction)
        if (!boardChanged(state.grid, result.newGrid)) return state

        val history = state.copyOfHistory()
        history.add(
            HistoryEntry(
                grid = state.copyGrid(),
                score = state.score,
                moves = state.moves,
                gameWon = state.gameWon,
                gameOver = state.gameOver,
                combo = state.combo
            )
        )
        if (history.size > MAX_HISTORY) history.removeAt(0)

        var newState = state.copy(
            grid = result.newGrid,
            history = history,
            moves = state.moves + 1
        )

        if (result.score > 0) {
            val newCombo = state.combo + 1
            val newTotalMerges = state.totalMerges + result.mergedCount
            val newMaxCombo = maxOf(state.maxCombo, newCombo)
            val comboBonus = if (newCombo > 1) (result.score * 0.1 * (newCombo - 1)).toInt() else 0
            val scoreAdd = result.score + comboBonus

            newState = newState.copy(
                score = state.score + scoreAdd,
                combo = newCombo,
                totalMerges = newTotalMerges,
                maxCombo = newMaxCombo
            )
        } else {
            newState = newState.copy(combo = 0)
        }

        if (!state.gameWon && hasWon(newState.grid)) {
            newState = newState.copy(gameWon = true)
        }

        newState = addRandomTile(newState)

        if (newState.score > newState.best) {
            newState = newState.copy(best = newState.score)
        }

        if (!newState.hasEmptyCell() && !canAnyMove(newState.grid)) {
            newState = newState.copy(gameOver = true)
        }

        return newState
    }

    fun undo(state: GameState): GameState? {
        if (state.history.isEmpty() || state.gameOver) return null

        val history = state.copyOfHistory()
        val prev = history.removeAt(history.lastIndex)

        return state.copy(
            grid = prev.grid,
            score = prev.score,
            moves = prev.moves,
            gameWon = prev.gameWon,
            gameOver = prev.gameOver,
            combo = prev.combo,
            history = history
        )
    }

    fun addRandomTile(state: GameState): GameState {
        val empties = mutableListOf<Pair<Int, Int>>()
        for (r in 0 until GRID_SIZE) {
            for (c in 0 until GRID_SIZE) {
                if (state.grid[r][c] == 0) empties.add(r to c)
            }
        }
        if (empties.isEmpty()) return state

        val (r, c) = empties[random.nextInt(empties.size)]
        val newGrid = state.copyGrid()
        newGrid[r][c] = 1
        return state.copy(grid = newGrid)
    }

    private fun performSlide(grid: Array<IntArray>, direction: Direction): MergeResult {
        val gridCopy = grid.map { it.copyOf() }.toTypedArray()
        var totalScore = 0
        var totalMerged = 0

        when (direction) {
            Direction.LEFT -> {
                for (i in 0 until GRID_SIZE) {
                    val (line, score, merged) = mergeLine(gridCopy[i])
                    gridCopy[i] = line
                    totalScore += score
                    totalMerged += merged
                }
            }
            Direction.RIGHT -> {
                for (i in 0 until GRID_SIZE) {
                    val reversed = gridCopy[i].reversedArray()
                    val (line, score, merged) = mergeLine(reversed)
                    gridCopy[i] = line.reversedArray()
                    totalScore += score
                    totalMerged += merged
                }
            }
            Direction.UP -> {
                val transposed = transpose(gridCopy)
                for (i in 0 until GRID_SIZE) {
                    val (line, score, merged) = mergeLine(transposed[i])
                    transposed[i] = line
                    totalScore += score
                    totalMerged += merged
                }
                val result = transpose(transposed)
                for (i in 0 until GRID_SIZE) gridCopy[i] = result[i]
            }
            Direction.DOWN -> {
                val transposed = transpose(gridCopy)
                for (i in 0 until GRID_SIZE) {
                    val reversed = transposed[i].reversedArray()
                    val (line, score, merged) = mergeLine(reversed)
                    transposed[i] = line.reversedArray()
                    totalScore += score
                    totalMerged += merged
                }
                val result = transpose(transposed)
                for (i in 0 until GRID_SIZE) gridCopy[i] = result[i]
            }
        }

        return MergeResult(gridCopy, totalScore, totalMerged)
    }

    private fun mergeLine(line: IntArray): MergeLineResult {
        val nonZero = line.filter { it != 0 }
        val merged = mutableListOf<Int>()
        var addedScore = 0
        var i = 0
        var mergedCount = 0

        while (i < nonZero.size) {
            if (i + 2 < nonZero.size &&
                nonZero[i] == nonZero[i + 1] &&
                nonZero[i] == nonZero[i + 2]
            ) {
                val newExp = nonZero[i] + 1
                merged.add(newExp)
                addedScore += TILE_VALUES[newExp]
                i += 3
                mergedCount++
            } else {
                merged.add(nonZero[i])
                i += 1
            }
        }

        while (merged.size < GRID_SIZE) merged.add(0)

        return MergeLineResult(merged.toIntArray(), addedScore, mergedCount)
    }

    private fun transpose(matrix: Array<IntArray>): Array<IntArray> =
        Array(GRID_SIZE) { c -> IntArray(GRID_SIZE) { r -> matrix[r][c] } }

    private fun boardChanged(oldGrid: Array<IntArray>, newGrid: Array<IntArray>): Boolean {
        for (r in 0 until GRID_SIZE) {
            for (c in 0 until GRID_SIZE) {
                if (oldGrid[r][c] != newGrid[r][c]) return true
            }
        }
        return false
    }

    private fun canAnyMove(grid: Array<IntArray>): Boolean {
        for (dir in Direction.entries) {
            val result = performSlide(grid, dir)
            if (boardChanged(grid, result.newGrid)) return true
        }
        return false
    }

    private fun hasWon(grid: Array<IntArray>): Boolean {
        for (r in 0 until GRID_SIZE) {
            for (c in 0 until GRID_SIZE) {
                if (grid[r][c] == WIN_TILE_EXP) return true
            }
        }
        return false
    }
}

enum class Direction { LEFT, RIGHT, UP, DOWN }

data class MergeLineResult(val line: IntArray, val score: Int, val mergedCount: Int)
