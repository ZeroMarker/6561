package com.game6561.app.game

import kotlin.random.Random

const val GRID_SIZE = 6
val TILE_VALUES = listOf(0, 3, 9, 27, 81, 243, 729, 2187, 6561)
const val WIN_TILE_EXP = 9
const val MAX_HISTORY = 10

data class GameState(
    val grid: Array<IntArray> = Array(GRID_SIZE) { IntArray(GRID_SIZE) },
    val score: Int = 0,
    val best: Int = 0,
    val moves: Int = 0,
    val gameTimer: Int = 0,
    val gameWon: Boolean = false,
    val gameOver: Boolean = false,
    val combo: Int = 0,
    val totalMerges: Int = 0,
    val maxCombo: Int = 0,
    val gamesPlayed: Int = 0,
    val gamesWon: Int = 0,
    val history: List<HistoryEntry> = emptyList()
) {
    fun copyGrid(): Array<IntArray> = Array(GRID_SIZE) { r -> grid[r].copyOf() }

    fun hasEmptyCell(): Boolean {
        for (r in 0 until GRID_SIZE) {
            for (c in 0 until GRID_SIZE) {
                if (grid[r][c] == 0) return true
            }
        }
        return false
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is GameState) return false
        return score == other.score &&
                best == other.best &&
                moves == other.moves &&
                gameTimer == other.gameTimer &&
                gameWon == other.gameWon &&
                gameOver == other.gameOver &&
                combo == other.combo &&
                grid.contentDeepEquals(other.grid)
    }

    override fun hashCode(): Int {
        var result = grid.contentDeepHashCode()
        result = 31 * result + score
        result = 31 * result + best
        result = 31 * result + moves
        result = 31 * result + gameTimer
        result = 31 * result + gameWon.hashCode()
        result = 31 * result + gameOver.hashCode()
        result = 31 * result + combo
        return result
    }
}

data class HistoryEntry(
    val grid: Array<IntArray>,
    val score: Int,
    val moves: Int,
    val gameWon: Boolean,
    val gameOver: Boolean,
    val combo: Int
)

data class MergeResult(
    val newGrid: Array<IntArray>,
    val score: Int,
    val mergedCount: Int
)

data class GameStatistics(
    val gamesPlayed: Int,
    val gamesWon: Int,
    val totalScore: Int,
    val bestScore: Int,
    val totalMoves: Int,
    val maxCombo: Int
)
