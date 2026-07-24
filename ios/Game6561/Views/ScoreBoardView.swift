import SwiftUI

struct ScoreBoardView: View {
    let score: Int
    let best: Int
    let moves: Int
    let timer: String

    var body: some View {
        HStack(spacing: 8) {
            ScoreBox(label: "Score", value: "\(score)", color: .purple)
            ScoreBox(label: "Best", value: "\(best)")
            ScoreBox(label: "Moves", value: "\(moves)")
            ScoreBox(label: "Time", value: timer)
        }
        .padding(.horizontal)
    }
}

struct ScoreBox: View {
    let label: String
    let value: String
    var color: Color = .primary

    var body: some View {
        VStack(spacing: 4) {
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
            Text(value)
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(color)
        }
        .frame(maxWidth: .infinity)
        .padding(8)
        .background(Color(hex: "E7E0EC").opacity(0.5))
        .cornerRadius(12)
    }
}
