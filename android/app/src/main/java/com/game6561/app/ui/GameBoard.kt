package com.game6561.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.game6561.app.game.Direction
import com.game6561.app.game.GRID_SIZE
import com.game6561.app.game.TILE_VALUES

private val tileColors = mapOf(
    0 to Color(0x00000000),
    1 to Color(0xFFFFFBFE),
    2 to Color(0xFFE7E0EC),
    3 to Color(0xFFEADDFF),
    4 to Color(0xFFE8DEF8),
    5 to Color(0xFFFFD8E4),
    6 to Color(0xFF6750A4),
    7 to Color(0xFF625B71),
    8 to Color(0xFF7D5260),
    9 to Color(0xFFB3261E),
)

private val tileTextColors = mapOf(
    1 to Color(0xFF1C1B1F),
    2 to Color(0xFF49454F),
    3 to Color(0xFF21005D),
    4 to Color(0xFF1D192B),
    5 to Color(0xFF31111D),
    6 to Color.White,
    7 to Color.White,
    8 to Color.White,
    9 to Color.White,
)

@Composable
fun GameBoard(
    grid: Array<IntArray>,
    onSwipe: (Direction) -> Unit,
    modifier: Modifier = Modifier
) {
    val boardColor = Color(0xFFE7E0EC)
    val boardShape = RoundedCornerShape(16.dp)

    BoxWithConstraints(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .clip(boardShape)
            .background(boardColor)
            .padding(4.dp)
            .pointerInput(Unit) {
                var startX = 0f
                var startY = 0f
                detectDragGestures(
                    onDragStart = { offset ->
                        startX = offset.x
                        startY = offset.y
                    },
                    onDrag = { change, _ ->
                        change.consume()
                        val dx = change.position.x - startX
                        val dy = change.position.y - startY
                        if (kotlin.math.abs(dx) > 40 || kotlin.math.abs(dy) > 40) {
                            if (kotlin.math.abs(dx) > kotlin.math.abs(dy)) {
                                onSwipe(if (dx > 0) Direction.RIGHT else Direction.LEFT)
                            } else {
                                onSwipe(if (dy > 0) Direction.DOWN else Direction.UP)
                            }
                            startX = change.position.x
                            startY = change.position.y
                        }
                    }
                )
            }
    ) {
        val totalWidth = maxWidth - 8.dp
        val tileSize = (totalWidth - (GRID_SIZE - 1) * 4.dp) / GRID_SIZE
        val gap = 4.dp

        for (row in 0 until GRID_SIZE) {
            for (col in 0 until GRID_SIZE) {
                val exp = grid[row][col]
                if (exp == 0) continue

                val value = TILE_VALUES.getOrElse(exp) { 0 }
                val color = tileColors[exp] ?: Color.Gray
                val textColor = tileTextColors[exp.coerceIn(0, 9)] ?: Color.Black

                val xOffset = 4.dp + col * (tileSize + gap)
                val yOffset = 4.dp + row * (tileSize + gap)

                TileCell(
                    value = value,
                    color = color,
                    textColor = textColor,
                    size = tileSize,
                    xOffset = xOffset,
                    yOffset = yOffset,
                    key = "${row}-${col}-${exp}"
                )
            }
        }
    }
}

@Composable
private fun TileCell(
    value: Int,
    color: Color,
    textColor: Color,
    size: Dp,
    xOffset: Dp,
    yOffset: Dp,
    key: String
) {
    val tileShape = RoundedCornerShape(8.dp)

    Box(
        modifier = Modifier
            .offset(x = xOffset, y = yOffset)
            .size(size)
            .clip(tileShape)
            .background(color),
        contentAlignment = Alignment.Center
    ) {
        val fontSize = when {
            value < 100 -> 24.sp
            value < 1000 -> 20.sp
            else -> 16.sp
        }
        Box(
            modifier = Modifier.padding(4.dp),
            contentAlignment = Alignment.Center
        ) {
            androidx.compose.material3.Text(
                text = value.toString(),
                color = textColor,
                fontSize = fontSize,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
        }
    }
}
