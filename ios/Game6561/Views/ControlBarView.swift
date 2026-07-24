import SwiftUI

struct ControlBarView: View {
    let canUndo: Bool
    let isDarkTheme: Bool
    let isSoundEnabled: Bool
    let onUndo: () -> Void
    let onNewGame: () -> Void
    let onToggleTheme: () -> Void
    let onToggleSound: () -> Void
    let onOpenSettings: () -> Void
    let onOpenStats: () -> Void

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ControlButton(text: "↶ Undo", enabled: canUndo, action: onUndo)
                ControlButton(text: "📊 Stats", action: onOpenStats)
                ControlButton(text: "⚙ Settings", action: onOpenSettings)
                ControlButton(
                    text: isDarkTheme ? "☀ Light" : "🌙 Dark",
                    action: onToggleTheme
                )
                ControlButton(
                    text: isSoundEnabled ? "🔊 On" : "🔇 Off",
                    action: onToggleSound
                )
                ControlButton(text: "🔄 New", action: onNewGame)
            }
            .padding(.horizontal, 8)
        }
    }
}

struct ControlButton: View {
    let text: String
    var enabled: Bool = true
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(text)
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(enabled ? Color(hex: "E8DEF8") : Color(hex: "E8DEF8").opacity(0.5))
                .foregroundColor(enabled ? Color(hex: "1D192B") : Color(hex: "1D192B").opacity(0.5))
                .cornerRadius(20)
        }
        .disabled(!enabled)
    }
}
