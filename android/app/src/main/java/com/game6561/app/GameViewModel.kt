package com.game6561.app

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.game6561.app.data.GamePreferences
import com.game6561.app.game.Direction
import com.game6561.app.game.GameEngine
import com.game6561.app.game.GameState
import com.game6561.app.game.GameStatistics
import com.game6561.app.sound.SoundManager
import com.game6561.app.sound.SoundType
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class GameViewModel(application: Application) : AndroidViewModel(application) {

    private val prefs = GamePreferences(application)
    val soundManager = SoundManager(application)

    var state by mutableStateOf(GameState())
        private set

    var statistics by mutableStateOf(GameStatistics(0, 0, 0, 0, 0, 0))
        private set

    var showTutorial by mutableStateOf(false)
        private set

    var showSettings by mutableStateOf(false)
    var showStatistics by mutableStateOf(false)

    var showWinDialog by mutableStateOf(false)
        private set

    var showGameOverDialog by mutableStateOf(false)
        private set

    var isDarkTheme by mutableStateOf(false)
        private set

    var isSoundEnabled by mutableStateOf(true)
        private set

    private var timerJob: Job? = null

    init {
        soundManager.setEnabled(prefs.isSoundEnabled())
        isSoundEnabled = prefs.isSoundEnabled()
        isDarkTheme = prefs.getTheme() == "dark"
        statistics = prefs.getStatistics()

        val saved = prefs.loadGameState()
        if (saved != null) {
            state = saved.copy(
                gamesPlayed = statistics.gamesPlayed,
                gamesWon = statistics.gamesWon,
                best = statistics.bestScore
            )
            if (!state.gameOver && !state.gameWon) startTimer()
        } else {
            newGame()
        }

        showTutorial = !prefs.hasSeenTutorial()
    }

    fun move(direction: Direction) {
        val newState = GameEngine.move(state, direction)
        if (newState !== state) {
            val wasWon = state.gameWon
            val merged = newState.totalMerges > state.totalMerges
            state = newState
            prefs.saveGameState(newState)

            if (newState.gameOver) {
                stopTimer()
                statistics = prefs.recordGame(
                    won = newState.gameWon,
                    finalScore = newState.score,
                    finalMoves = newState.moves,
                    maxCombo = newState.maxCombo
                )
                showGameOverDialog = true
                soundManager.play(SoundType.GAME_OVER)
            } else {
                soundManager.play(SoundType.MOVE)
                if (merged) {
                    soundManager.play(if (newState.combo > 1) SoundType.COMBO else SoundType.MERGE)
                }
            }

            if (newState.gameWon && !wasWon) {
                soundManager.play(SoundType.WIN)
                showWinDialog = true
            }
        } else {
            soundManager.play(SoundType.INVALID)
        }
    }

    fun undo() {
        val result = GameEngine.undo(state)
        if (result != null) {
            state = result
            prefs.saveGameState(result)
            soundManager.play(SoundType.UNDO)
        }
    }

    fun newGame() {
        stopTimer()
        state = GameEngine.createInitialState().copy(
            gamesPlayed = state.gamesPlayed,
            gamesWon = state.gamesWon,
            best = statistics.bestScore
        )
        showWinDialog = false
        showGameOverDialog = false
        startTimer()
        soundManager.play(SoundType.START)
        prefs.clearGameState()
    }

    /** App 进入后台：暂停计时器 */
    fun onAppBackgrounded() {
        stopTimer()
    }

    /** App 回到前台：恢复计时器 */
    fun onAppForegrounded() {
        if (!state.gameOver) {
            startTimer()
        }
    }

    fun keepPlaying() {
        showWinDialog = false
        state = state.copy(gameWon = false)
    }

    fun toggleTheme() {
        isDarkTheme = !isDarkTheme
        prefs.setTheme(if (isDarkTheme) "dark" else "light")
    }

    fun toggleSound() {
        isSoundEnabled = !isSoundEnabled
        soundManager.setEnabled(isSoundEnabled)
        prefs.setSoundEnabled(isSoundEnabled)
    }

    fun dismissTutorial() {
        showTutorial = false
        prefs.markTutorialSeen()
    }

    fun resetTutorial() {
        prefs.resetTutorial()
        showTutorial = true
    }

    fun dismissWin() {
        showWinDialog = false
        keepPlaying()
    }

    fun dismissGameOver() {
        showGameOverDialog = false
    }

    override fun onCleared() {
        super.onCleared()
        stopTimer()
        soundManager.release()
    }

    private fun startTimer() {
        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            while (isActive) {
                delay(1000)
                if (!state.gameOver) {
                    state = state.copy(gameTimer = state.gameTimer + 1)
                }
            }
        }
    }

    private fun stopTimer() {
        timerJob?.cancel()
        timerJob = null
    }

    fun updateStatisticsDisplay() {
        statistics = prefs.getStatistics()
    }
}
