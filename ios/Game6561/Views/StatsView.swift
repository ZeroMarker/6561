import SwiftUI

struct StatsView: View {
    let statistics: GameStatistics
    let onDismiss: () -> Void

    var winRate: String {
        guard statistics.gamesPlayed > 0 else { return "0%" }
        let rate = Double(statistics.gamesWon) / Double(statistics.gamesPlayed) * 100
        return "\(Int(rate))%"
    }

    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture { onDismiss() }

            VStack(spacing: 20) {
                Text("📊 Statistics")
                    .font(.title2)
                    .fontWeight(.bold)

                // Row 1: Played / Won / Win Rate
                HStack(spacing: 16) {
                    StatItem(value: "\(statistics.gamesPlayed)", label: "Played")
                    StatItem(value: "\(statistics.gamesWon)", label: "Won")
                    StatItem(value: winRate, label: "Win Rate")
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(16)

                // Row 2: Best Score / Max Combo
                HStack(spacing: 16) {
                    StatItem(value: "\(statistics.bestScore)", label: "Best Score")
                    StatItem(value: "\(statistics.maxCombo)", label: "Max Combo")
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(16)

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

struct StatItem: View {
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(.purple)
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}
