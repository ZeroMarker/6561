import SwiftUI

struct SettingsView: View {
    let isDarkTheme: Bool
    let isSoundEnabled: Bool
    let onToggleTheme: () -> Void
    let onToggleSound: () -> Void
    let onResetTutorial: () -> Void
    let onDismiss: () -> Void

    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture { onDismiss() }

            VStack(spacing: 20) {
                Text("⚙ Settings")
                    .font(.title2)
                    .fontWeight(.bold)

                VStack(alignment: .leading, spacing: 12) {
                    Text("Display")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    HStack {
                        Text("Theme")
                        Spacer()
                        Button(isDarkTheme ? "🌙 Dark" : "☀ Light") {
                            onToggleTheme()
                        }
                        .buttonStyle(.bordered)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                VStack(alignment: .leading, spacing: 12) {
                    Text("Sound")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    HStack {
                        Text("Sound Effects")
                        Spacer()
                        Button(isSoundEnabled ? "🔊 On" : "🔇 Off") {
                            onToggleSound()
                        }
                        .buttonStyle(.bordered)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                Button("Show Tutorial Again") {
                    onResetTutorial()
                }
                .buttonStyle(.bordered)

                Button("Close") {
                    onDismiss()
                }
                .buttonStyle(.borderedProminent)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(24)
            .padding(.horizontal, 40)
        }
    }
}
