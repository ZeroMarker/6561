package com.game6561.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.isCtrlPressed
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.game6561.app.GameViewModel
import com.game6561.app.game.Direction

private val LightColors = lightColorScheme(
    primary = Color(0xFF6750A4),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFEADDFF),
    onPrimaryContainer = Color(0xFF21005D),
    secondary = Color(0xFF625B71),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFE8DEF8),
    onSecondaryContainer = Color(0xFF1D192B),
    tertiary = Color(0xFF7D5260),
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFFFD8E4),
    onTertiaryContainer = Color(0xFF31111D),
    background = Color(0xFFFFFBFE),
    onBackground = Color(0xFF1C1B1F),
    surface = Color(0xFFFFFBFE),
    onSurface = Color(0xFF1C1B1F),
    surfaceVariant = Color(0xFFE7E0EC),
    onSurfaceVariant = Color(0xFF49454F),
    error = Color(0xFFB3261E),
    onError = Color.White,
    outline = Color(0xFF79747E),
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFFD0BCFF),
    onPrimary = Color(0xFF381E72),
    primaryContainer = Color(0xFF4F378B),
    onPrimaryContainer = Color(0xFFEADDFF),
    secondary = Color(0xFFCCC2DC),
    onSecondary = Color(0xFF332D41),
    secondaryContainer = Color(0xFF4A4458),
    onSecondaryContainer = Color(0xFFE8DEF8),
    tertiary = Color(0xFFEFB8C8),
    onTertiary = Color(0xFF492532),
    tertiaryContainer = Color(0xFF633B48),
    onTertiaryContainer = Color(0xFFFFD8E4),
    background = Color(0xFF1C1B1F),
    onBackground = Color(0xFFE6E1E5),
    surface = Color(0xFF1C1B1F),
    onSurface = Color(0xFFE6E1E5),
    surfaceVariant = Color(0xFF49454F),
    onSurfaceVariant = Color(0xFFCAC4D0),
    error = Color(0xFFF2B8B5),
    onError = Color(0xFF601410),
    outline = Color(0xFF938F99),
)

@Composable
fun MainGameScreen(
    viewModel: GameViewModel
) {
    val state = viewModel.state
    val isDarkTheme = viewModel.isDarkTheme

    MaterialTheme(
        colorScheme = if (isDarkTheme) DarkColors else LightColors
    ) {
        Scaffold(
            containerColor = MaterialTheme.colorScheme.background
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .onPreviewKeyEvent { event ->
                        if (event.type == KeyEventType.KeyUp) {
                            when (event.key) {
                                Key.DirectionLeft, Key.A -> { viewModel.move(Direction.LEFT); true }
                                Key.DirectionRight, Key.D -> { viewModel.move(Direction.RIGHT); true }
                                Key.DirectionUp, Key.W -> { viewModel.move(Direction.UP); true }
                                Key.DirectionDown, Key.S -> { viewModel.move(Direction.DOWN); true }
                                Key.Z -> if (event.isCtrlPressed) { viewModel.undo(); true } else false
                                Key.N -> if (event.isCtrlPressed) { viewModel.newGame(); true } else false
                                else -> false
                            }
                        } else false
                    },
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(8.dp))

                // Title
                Text(
                    text = "6561",
                    style = MaterialTheme.typography.displayLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Score board
                ScoreBoard(
                    score = state.score,
                    best = state.best,
                    moves = state.moves,
                    timer = formatTime(state.gameTimer),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Control buttons
                ControlBar(
                    canUndo = state.history.isNotEmpty() && !state.gameOver,
                    isDarkTheme = isDarkTheme,
                    isSoundEnabled = viewModel.isSoundEnabled,
                    onUndo = { viewModel.undo() },
                    onNewGame = { viewModel.newGame() },
                    onToggleTheme = { viewModel.toggleTheme() },
                    onToggleSound = { viewModel.toggleSound() },
                    onOpenSettings = { viewModel.showSettings = true },
                    onOpenStats = {
                        viewModel.updateStatisticsDisplay()
                        viewModel.showStatistics = true
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp)
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Game board
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .aspectRatio(1f)
                ) {
                    GameBoard(
                        grid = state.grid,
                        onSwipe = { viewModel.move(it) },
                        modifier = Modifier.fillMaxSize()
                    )

                    // Win overlay
                    if (viewModel.showWinDialog) {
                        GameOverlay(
                            title = "🎉 You Win!",
                            subtitle = "Reached 6561!",
                            stats = listOf(
                                "Moves" to state.moves.toString(),
                                "Time" to formatTime(state.gameTimer),
                                "Max Combo" to state.maxCombo.toString()
                            ),
                            primaryButton = "Keep Playing" to { viewModel.dismissWin() },
                            secondaryButton = "Restart" to { viewModel.newGame() },
                            modifier = Modifier.fillMaxSize()
                        )
                    }

                    // Game over overlay
                    if (viewModel.showGameOverDialog) {
                        GameOverlay(
                            title = "😢 Game Over!",
                            stats = listOf(
                                "Score" to state.score.toString(),
                                "Moves" to state.moves.toString(),
                                "Time" to formatTime(state.gameTimer),
                                "Max Combo" to state.maxCombo.toString()
                            ),
                            primaryButton = "Try Again" to { viewModel.newGame() },
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Instructions
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Text(
                        text = "How to play:\n" +
                                "Arrow keys / WASD or swipe to move tiles.\n" +
                                "Merge three identical numbers (3+3+3→9, 9+9+9→27, ... →6561)\n" +
                                "Press Ctrl+Z or tap Undo to reverse a move. " +
                                "Build combos for bonus points!",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(16.dp),
                        lineHeight = 22.sp
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }

        // Dialogs
        if (viewModel.showSettings) {
            SettingsDialog(
                isDarkTheme = isDarkTheme,
                isSoundEnabled = viewModel.isSoundEnabled,
                onToggleTheme = { viewModel.toggleTheme() },
                onToggleSound = { viewModel.toggleSound() },
                onResetTutorial = {
                    viewModel.resetTutorial()
                    viewModel.showSettings = false
                },
                onDismiss = { viewModel.showSettings = false }
            )
        }

        if (viewModel.showStatistics) {
            StatsDialog(
                statistics = viewModel.statistics,
                onDismiss = { viewModel.showStatistics = false }
            )
        }

        if (viewModel.showTutorial) {
            TutorialDialog(
                onDismiss = { viewModel.dismissTutorial() }
            )
        }
    }
}

@Composable
fun ScoreBoard(
    score: Int,
    best: Int,
    moves: Int,
    timer: String,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        ScoreBox("Score", score.toString(), MaterialTheme.colorScheme.primary)
        ScoreBox("Best", best.toString(), MaterialTheme.colorScheme.onSurface)
        ScoreBox("Moves", moves.toString(), MaterialTheme.colorScheme.onSurface)
        ScoreBox("Time", timer, MaterialTheme.colorScheme.onSurface)
    }
}

@Composable
private fun ScoreBox(label: String, value: String, valueColor: Color) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        ),
        modifier = Modifier.width(80.dp)
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = value,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = valueColor,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun ControlBar(
    canUndo: Boolean,
    isDarkTheme: Boolean,
    isSoundEnabled: Boolean,
    onUndo: () -> Unit,
    onNewGame: () -> Unit,
    onToggleTheme: () -> Unit,
    onToggleSound: () -> Unit,
    onOpenSettings: () -> Unit,
    onOpenStats: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.Center
    ) {
        ControlButton(text = "↶ Undo", enabled = canUndo, onClick = onUndo)
        Spacer(modifier = Modifier.width(4.dp))
        ControlButton(text = "📊 Stats", onClick = onOpenStats)
        Spacer(modifier = Modifier.width(4.dp))
        ControlButton(text = "⚙ Settings", onClick = onOpenSettings)
        Spacer(modifier = Modifier.width(4.dp))
        ControlButton(
            text = if (isDarkTheme) "☀ Light" else "🌙 Dark",
            onClick = onToggleTheme
        )
        Spacer(modifier = Modifier.width(4.dp))
        ControlButton(
            text = if (isSoundEnabled) "🔊 On" else "🔇 Off",
            onClick = onToggleSound
        )
        Spacer(modifier = Modifier.width(4.dp))
        ControlButton(text = "🔄 New", onClick = onNewGame)
    }
}

@Composable
private fun ControlButton(
    text: String,
    enabled: Boolean = true,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        shape = RoundedCornerShape(20.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer,
            contentColor = MaterialTheme.colorScheme.onSecondaryContainer,
            disabledContainerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.5f),
            disabledContentColor = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.5f)
        ),
        modifier = Modifier.height(36.dp),
        contentPadding = ButtonDefaults.TextButtonContentPadding
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun GameOverlay(
    title: String,
    subtitle: String? = null,
    stats: List<Pair<String, String>> = emptyList(),
    primaryButton: Pair<String, () -> Unit>? = null,
    secondaryButton: Pair<String, () -> Unit>? = null,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .background(Color(0xB31C1B1F))
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = title,
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            if (subtitle != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (stats.isNotEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        stats.forEach { (label, value) ->
                            Text(
                                text = "$label: $value",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(vertical = 2.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                secondaryButton?.let { (text, onClick) ->
                    Button(
                        onClick = onClick,
                        shape = RoundedCornerShape(20.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant,
                            contentColor = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    ) {
                        Text(text)
                    }
                }
                primaryButton?.let { (text, onClick) ->
                    Button(
                        onClick = onClick,
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Text(text)
                    }
                }
            }
        }
    }
}

fun formatTime(seconds: Int): String {
    val mins = seconds / 60
    val secs = seconds % 60
    return String.format("%02d:%02d", mins, secs)
}
