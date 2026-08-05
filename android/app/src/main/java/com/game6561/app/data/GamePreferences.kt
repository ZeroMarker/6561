package com.game6561.app.data

import android.content.Context
import com.game6561.app.game.GameState
import com.game6561.app.game.GameStatistics
import com.game6561.app.game.GRID_SIZE

class GamePreferences(context: Context) {

    private val prefs = context.getSharedPreferences("game6561", Context.MODE_PRIVATE)

    fun saveGameState(state: GameState) {
        prefs.edit()
            .putString("grid", encodeGrid(state.grid))
            .putInt("score", state.score)
            .putInt("best", state.best)
            .putInt("moves", state.moves)
            .putInt("timer", state.gameTimer)
            .putBoolean("gameWon", state.gameWon)
            .putBoolean("gameOver", state.gameOver)
            .putInt("combo", state.combo)
            .putInt("totalMerges", state.totalMerges)
            .putInt("maxCombo", state.maxCombo)
            .apply()
    }

    fun loadGameState(): GameState? {
        val gridStr = prefs.getString("grid", null) ?: return null
        return GameState(
            grid = decodeGrid(gridStr),
            score = prefs.getInt("score", 0),
            best = prefs.getInt("best", 0),
            moves = prefs.getInt("moves", 0),
            gameTimer = prefs.getInt("timer", 0),
            gameWon = prefs.getBoolean("gameWon", false),
            gameOver = prefs.getBoolean("gameOver", false),
            combo = prefs.getInt("combo", 0),
            totalMerges = prefs.getInt("totalMerges", 0),
            maxCombo = prefs.getInt("maxCombo", 0)
        )
    }

    fun clearGameState() {
        prefs.edit()
            .remove("grid")
            .remove("score")
            .remove("best")
            .remove("moves")
            .remove("timer")
            .remove("gameWon")
            .remove("gameOver")
            .remove("combo")
            .remove("totalMerges")
            .remove("maxCombo")
            .apply()
    }

    fun getStatistics(): GameStatistics = GameStatistics(
        gamesPlayed = prefs.getInt("gamesPlayed", 0),
        gamesWon = prefs.getInt("gamesWon", 0),
        totalScore = prefs.getInt("totalScore", 0),
        bestScore = prefs.getInt("bestScore", 0),
        totalMoves = prefs.getInt("totalMoves", 0),
        maxCombo = prefs.getInt("maxCombo", 0)
    )

    fun recordGame(won: Boolean, finalScore: Int, finalMoves: Int, maxCombo: Int): GameStatistics {
        val stats = getStatistics()
        val newStats = GameStatistics(
            gamesPlayed = stats.gamesPlayed + 1,
            gamesWon = stats.gamesWon + (if (won) 1 else 0),
            totalScore = stats.totalScore + finalScore,
            bestScore = maxOf(stats.bestScore, finalScore),
            totalMoves = stats.totalMoves + finalMoves,
            maxCombo = maxOf(stats.maxCombo, maxCombo)
        )
        saveStatistics(newStats)
        return newStats
    }

    private fun saveStatistics(stats: GameStatistics) {
        prefs.edit()
            .putInt("gamesPlayed", stats.gamesPlayed)
            .putInt("gamesWon", stats.gamesWon)
            .putInt("totalScore", stats.totalScore)
            .putInt("bestScore", stats.bestScore)
            .putInt("totalMoves", stats.totalMoves)
            .putInt("maxCombo", stats.maxCombo)
            .apply()
    }

    // Settings
    fun isSoundEnabled(): Boolean = prefs.getBoolean("sound", true)
    fun setSoundEnabled(enabled: Boolean) = prefs.edit().putBoolean("sound", enabled).apply()

    fun getTheme(): String = prefs.getString("theme", "light") ?: "light"
    fun setTheme(theme: String) = prefs.edit().putString("theme", theme).apply()

    fun hasSeenTutorial(): Boolean = prefs.getBoolean("tutorial", false)
    fun markTutorialSeen() = prefs.edit().putBoolean("tutorial", true).apply()
    fun resetTutorial() = prefs.edit().remove("tutorial").apply()

    private fun encodeGrid(grid: Array<IntArray>): String {
        val sb = StringBuilder()
        for (r in 0 until GRID_SIZE) {
            for (c in 0 until GRID_SIZE) {
                if (sb.isNotEmpty()) sb.append(',')
                sb.append(grid[r][c])
            }
        }
        return sb.toString()
    }

    private fun decodeGrid(str: String): Array<IntArray> {
        val values = str.split(',').map { it.toIntOrNull() ?: 0 }
        val grid = Array(GRID_SIZE) { IntArray(GRID_SIZE) }
        for (r in 0 until GRID_SIZE) {
            for (c in 0 until GRID_SIZE) {
                val idx = r * GRID_SIZE + c
                if (idx < values.size) grid[r][c] = values[idx]
            }
        }
        return grid
    }
}
