import Foundation
import Combine
import SwiftUI

@MainActor
class GameViewModel: ObservableObject {

    @Published var state = GameState()
    @Published var statistics = GameStatistics(gamesPlayed: 0, gamesWon: 0, totalScore: 0, bestScore: 0, totalMoves: 0, maxCombo: 0)

    @Published var showTutorial = false
    @Published var showSettings = false
    @Published var showStatistics = false
    @Published var showWinDialog = false
    @Published var showGameOverDialog = false

    @Published var isDarkTheme = false
    @Published var isSoundEnabled = true

    private let prefs = GamePreferences()
    let soundManager = SoundManager()
    private var timer: Timer?

    init() {
        soundManager.setEnabled(prefs.isSoundEnabled)
        isSoundEnabled = prefs.isSoundEnabled
        isDarkTheme = prefs.isDarkTheme
        statistics = prefs.statistics

        if let saved = prefs.loadGameState() {
            state = saved
            state.gamesPlayed = statistics.gamesPlayed
            state.gamesWon = statistics.gamesWon
            state.best = statistics.bestScore
            startTimer()
        } else {
            newGame()
        }

        showTutorial = !prefs.hasSeenTutorial
    }

    func move(direction: Direction) {
        let newState = GameEngine.move(state, direction: direction)
        guard newState != state else {
            soundManager.play(.invalid)
            return
        }

        let wasWon = state.gameWon
        let merged = newState.totalMerges > state.totalMerges
        state = newState
        prefs.saveGameState(newState)

        if newState.gameOver {
            stopTimer()
            statistics = prefs.recordGame(won: newState.gameWon, finalScore: newState.score, finalMoves: newState.moves, finalMaxCombo: newState.maxCombo)
            showGameOverDialog = true
            soundManager.play(.gameOver)
        } else {
            soundManager.play(.move)
            if merged {
                soundManager.play(newState.combo > 1 ? .combo : .merge)
            }
        }

        if newState.gameWon && !wasWon {
            soundManager.play(.win)
            showWinDialog = true
        }
    }

    func undo() {
        guard let result = GameEngine.undo(state) else { return }
        state = result
        prefs.saveGameState(result)
        soundManager.play(.undo)
    }

    func newGame() {
        stopTimer()
        state = GameEngine.createInitialState()
        state.gamesPlayed = statistics.gamesPlayed
        state.gamesWon = statistics.gamesWon
        state.best = statistics.bestScore
        showWinDialog = false
        showGameOverDialog = false
        startTimer()
        soundManager.play(.start)
        prefs.clearGameState()
    }

    func keepPlaying() {
        showWinDialog = false
        state.gameWon = false
    }

    func toggleTheme() {
        isDarkTheme.toggle()
        prefs.isDarkTheme = isDarkTheme
    }

    func toggleSound() {
        isSoundEnabled.toggle()
        soundManager.setEnabled(isSoundEnabled)
        prefs.isSoundEnabled = isSoundEnabled
    }

    func dismissTutorial() {
        showTutorial = false
        prefs.hasSeenTutorial = true
    }

    func resetTutorial() {
        prefs.resetTutorial()
        showTutorial = true
    }

    func refreshStatistics() {
        statistics = prefs.statistics
    }

    // MARK: - Timer

    private func startTimer() {
        stopTimer()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self = self, !self.state.gameOver else { return }
                self.state.gameTimer += 1
            }
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }

    deinit {
        stopTimer()
    }
}

func formatTime(_ seconds: Int) -> String {
    let mins = seconds / 60
    let secs = seconds % 60
    return String(format: "%02d:%02d", mins, secs)
}
