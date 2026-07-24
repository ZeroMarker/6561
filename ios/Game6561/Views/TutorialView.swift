import SwiftUI

struct TutorialView: View {
    let onDismiss: () -> Void

    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture { onDismiss() }

            VStack(spacing: 20) {
                Text("🎮 Welcome to 6561!")
                    .font(.title2)
                    .fontWeight(.bold)

                Text("A puzzle game where you merge three identical numbers to reach 6561.")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)

                VStack(alignment: .leading, spacing: 10) {
                    TipRow("🎯", "Goal:", "Create the 6561 tile!")
                    TipRow("🔢", "Merge:", "3 identical numbers → next power of 3")
                    TipRow("⌨️", "Controls:", "Arrow keys, WASD, or swipe")
                    TipRow("↶", "Undo:", "Swipe down or tap Undo button")
                    TipRow("🔥", "Combo:", "Consecutive merges build combos!")
                    TipRow("⏱️", "Stats:", "Track your moves, time, and win rate!")
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(16)

                Button("Got it!") {
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

struct TipRow: View {
    let emoji: String
    let label: String
    let text: String

    init(_ emoji: String, _ label: String, _ text: String) {
        self.emoji = emoji
        self.label = label
        self.text = text
    }

    var body: some View {
        HStack(alignment: .top, spacing: 4) {
            Text(emoji)
            Text(label)
                .fontWeight(.semibold)
            Text(text)
                .foregroundColor(.secondary)
        }
        .font(.body)
    }
}
