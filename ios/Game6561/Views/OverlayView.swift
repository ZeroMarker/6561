import SwiftUI

struct GameOverOverlay: View {
    let title: String
    var subtitle: String? = nil
    var stats: [(String, String)] = []
    var primaryButton: (text: String, action: () -> Void)? = nil
    var secondaryButton: (text: String, action: () -> Void)? = nil

    var body: some View {
        ZStack {
            Color.black.opacity(0.7)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                Text(title)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)

                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.body)
                        .foregroundColor(.white.opacity(0.8))
                }

                if !stats.isEmpty {
                    VStack(spacing: 4) {
                        ForEach(stats, id: \.0) { label, value in
                            Text("\(label): \(value)")
                                .font(.body)
                                .foregroundColor(.white.opacity(0.9))
                        }
                    }
                    .padding()
                    .background(Color.white.opacity(0.15))
                    .cornerRadius(16)
                }

                HStack(spacing: 12) {
                    if let secondary = secondaryButton {
                        Button(secondary.text, action: secondary.action)
                            .buttonStyle(OverlayButtonStyle(color: .gray))
                    }
                    if let primary = primaryButton {
                        Button(primary.text, action: primary.action)
                            .buttonStyle(OverlayButtonStyle(color: .purple))
                    }
                }
            }
            .padding(24)
        }
    }
}

struct OverlayButtonStyle: ButtonStyle {
    let color: Color

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body)
            .fontWeight(.semibold)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .background(color.opacity(configuration.isPressed ? 0.7 : 1))
            .foregroundColor(.white)
            .clipShape(Capsule())
    }
}
