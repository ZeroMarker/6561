import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = GameViewModel()
    @FocusState private var isFocused: Bool

    var body: some View {
        ZStack {
            (viewModel.isDarkTheme ? Color(.systemBackground) : Color(hex: "FFFBFE"))
                .ignoresSafeArea()
                .onTapGesture { isFocused = true }

            ScrollView {
                VStack(spacing: 12) {
                    // Title
                    Text("6561")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundColor(.purple)

                    // Score board
                    ScoreBoardView(
                        score: viewModel.state.score,
                        best: viewModel.state.best,
                        moves: viewModel.state.moves,
                        timer: formatTime(viewModel.state.gameTimer)
                    )

                    // Control bar
                    ControlBarView(
                        canUndo: !viewModel.state.history.isEmpty && !viewModel.state.gameOver,
                        isDarkTheme: viewModel.isDarkTheme,
                        isSoundEnabled: viewModel.isSoundEnabled,
                        onUndo: { viewModel.undo() },
                        onNewGame: { viewModel.newGame() },
                        onToggleTheme: { viewModel.toggleTheme() },
                        onToggleSound: { viewModel.toggleSound() },
                        onOpenSettings: { viewModel.showSettings = true },
                        onOpenStats: {
                            viewModel.refreshStatistics()
                            viewModel.showStatistics = true
                        }
                    )

                    // Game board
                    GameBoardView(
                        grid: viewModel.state.grid,
                        onSwipe: { viewModel.move(direction: $0) }
                    )
                    .frame(maxWidth: UIScreen.main.bounds.width - 32)
                    .aspectRatio(1, contentMode: .fit)

                    // Instructions
                    VStack(alignment: .leading, spacing: 4) {
                        Text("How to play:")
                            .fontWeight(.semibold)
                        Text("Arrow keys / WASD or swipe to move tiles.")
                        Text("Merge three identical numbers (3+3+3→9, 9+9+9→27, ... →6561)")
                        Text("Press ⌘Z or tap Undo. Build combos for bonus points!")
                    }
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(.systemGray6))
                    .cornerRadius(16)
                    .padding(.horizontal, 16)
                }
                .padding(.top)
            }
            .preferredColorScheme(viewModel.isDarkTheme ? .dark : .light)

            // Overlays
            if viewModel.showWinDialog {
                GameOverOverlay(
                    title: "🎉 You Win!",
                    subtitle: "Reached 6561!",
                    stats: [
                        ("Moves", "\(viewModel.state.moves)"),
                        ("Time", formatTime(viewModel.state.gameTimer)),
                        ("Max Combo", "\(viewModel.state.maxCombo)")
                    ],
                    primaryButton: ("Keep Playing", { viewModel.keepPlaying() }),
                    secondaryButton: ("Restart", { viewModel.newGame() })
                )
            }

            if viewModel.showGameOverDialog {
                GameOverOverlay(
                    title: "😢 Game Over!",
                    stats: [
                        ("Score", "\(viewModel.state.score)"),
                        ("Moves", "\(viewModel.state.moves)"),
                        ("Time", formatTime(viewModel.state.gameTimer)),
                        ("Max Combo", "\(viewModel.state.maxCombo)")
                    ],
                    primaryButton: ("Try Again", { viewModel.newGame() })
                )
            }

            if viewModel.showSettings {
                SettingsView(
                    isDarkTheme: viewModel.isDarkTheme,
                    isSoundEnabled: viewModel.isSoundEnabled,
                    onToggleTheme: { viewModel.toggleTheme() },
                    onToggleSound: { viewModel.toggleSound() },
                    onResetTutorial: {
                        viewModel.resetTutorial()
                        viewModel.showSettings = false
                    },
                    onDismiss: { viewModel.showSettings = false }
                )
            }

            if viewModel.showStatistics {
                StatsView(
                    statistics: viewModel.statistics,
                    onDismiss: { viewModel.showStatistics = false }
                )
            }

            if viewModel.showTutorial {
                TutorialView(onDismiss: { viewModel.dismissTutorial() })
            }
        }
        .focusable()
        .focused($isFocused)
        .onKeyPress(.leftArrow) { viewModel.move(direction: .left); return .handled }
        .onKeyPress(.rightArrow) { viewModel.move(direction: .right); return .handled }
        .onKeyPress(.upArrow) { viewModel.move(direction: .up); return .handled }
        .onKeyPress(.downArrow) { viewModel.move(direction: .down); return .handled }
        .onKeyPress(.return) { isFocused = true; return .handled }
        .onAppear { isFocused = true }
    }
}

// Keyboard support for iPad
extension View {
    func onKeyPress(_ key: KeyEquivalent, action: @escaping () -> Void) -> some View {
        self.background(
            Button("") { action() }
                .keyboardShortcut(key, modifiers: [])
                .hidden()
                .frame(width: 0, height: 0)
        )
    }
}
