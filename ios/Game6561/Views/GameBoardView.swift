import SwiftUI

private let tileColors: [Int: Color] = [
    0: .clear,
    1: Color(hex: "FFFBFE"),
    2: Color(hex: "E7E0EC"),
    3: Color(hex: "EADDFF"),
    4: Color(hex: "E8DEF8"),
    5: Color(hex: "FFD8E4"),
    6: Color(hex: "6750A4"),
    7: Color(hex: "625B71"),
    8: Color(hex: "7D5260"),
    9: Color(hex: "B3261E"),
]

private let tileTextColors: [Int: Color] = [
    1: Color(hex: "1C1B1F"),
    2: Color(hex: "49454F"),
    3: Color(hex: "21005D"),
    4: Color(hex: "1D192B"),
    5: Color(hex: "31111D"),
    6: .white,
    7: .white,
    8: .white,
    9: .white,
]

struct GameBoardView: View {
    let grid: [[Int]]
    let onSwipe: (Direction) -> Void

    @State private var dragStart: CGPoint?

    private let spacing: CGFloat = 4
    private let padding: CGFloat = 4
    private let cornerRadius: CGFloat = 16

    var body: some View {
        GeometryReader { geo in
            let totalPadding = padding * 2 + spacing * CGFloat(gridSize - 1)
            let tileSize = (geo.size.width - totalPadding) / CGFloat(gridSize)

            ZStack(alignment: .topLeading) {
                // Board background
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(Color(hex: "E7E0EC"))
                    .frame(maxWidth: .infinity, maxHeight: .infinity)

                // Tiles
                ForEach(0..<gridSize, id: \.self) { row in
                    ForEach(0..<gridSize, id: \.self) { col in
                        let exp = grid[row][col]
                        if exp > 0 {
                            TileView(
                                value: tileValues[exp],
                                color: tileColors[exp] ?? .gray,
                                textColor: tileTextColors[exp] ?? .black,
                                size: tileSize
                            )
                            .position(
                                x: padding + tileSize / 2 + CGFloat(col) * (tileSize + spacing),
                                y: padding + tileSize / 2 + CGFloat(row) * (tileSize + spacing)
                            )
                        }
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .gesture(
                DragGesture(minimumDistance: 20)
                    .onChanged { value in
                        if dragStart == nil {
                            dragStart = value.startLocation
                        }
                    }
                    .onEnded { value in
                        defer { dragStart = nil }
                        guard let start = dragStart else { return }
                        let dx = value.location.x - start.x
                        let dy = value.location.y - start.y
                        let threshold: CGFloat = 40
                        if abs(dx) > threshold || abs(dy) > threshold {
                            if abs(dx) > abs(dy) {
                                onSwipe(dx > 0 ? .right : .left)
                            } else {
                                onSwipe(dy > 0 ? .down : .up)
                            }
                        }
                    }
            )
        }
    }
}

struct TileView: View {
    let value: Int
    let color: Color
    let textColor: Color
    let size: CGFloat

    var body: some View {
        RoundedRectangle(cornerRadius: 8)
            .fill(color)
            .frame(width: size, height: size)
            .overlay(
                Text("\(value)")
                    .font(.system(
                        size: value < 100 ? 22 : value < 1000 ? 18 : 14,
                        weight: .bold
                    ))
                    .foregroundColor(textColor)
            )
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b: UInt64
        switch hex.count {
        case 6:
            r = (int >> 16) & 0xFF
            g = (int >> 8) & 0xFF
            b = int & 0xFF
        case 3:
            r = ((int >> 8) & 0xF) * 17
            g = ((int >> 4) & 0xF) * 17
            b = (int & 0xF) * 17
        default:
            r = 0; g = 0; b = 0
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: 1
        )
    }
}
