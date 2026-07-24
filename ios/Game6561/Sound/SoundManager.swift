import AVFoundation

enum SoundType {
    case move, merge, combo, win, gameOver, undo, start, invalid
}

class SoundManager {
    private var engine: AVAudioEngine
    private var enabled = true

    init() {
        engine = AVAudioEngine()
        do {
            try AVAudioSession.sharedInstance().setCategory(.ambient)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {}
    }

    func setEnabled(_ enabled: Bool) {
        self.enabled = enabled
    }

    func play(_ type: SoundType) {
        guard enabled else { return }

        switch type {
        case .move: playTone(frequency: 200, duration: 0.1, volume: 0.1)
        case .merge:
            playTone(frequency: 400, duration: 0.15, volume: 0.15)
            AudioServicesPlaySystemSound(1519) // peek vibration
        case .combo: playTone(frequency: 600, duration: 0.2, volume: 0.2)
        case .win:
            playTone(frequency: 523.25, duration: 0.3, volume: 0.1)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                self.playTone(frequency: 659.25, duration: 0.3, volume: 0.1)
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                self.playTone(frequency: 783.99, duration: 0.3, volume: 0.1)
            }
            AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)
        case .gameOver: playTone(frequency: 150, duration: 0.5, volume: 0.2, waveform: .sawtooth)
        case .undo: playTone(frequency: 300, duration: 0.08, volume: 0.1)
        case .start: playTone(frequency: 440, duration: 0.2, volume: 0.1)
        case .invalid: playTone(frequency: 100, duration: 0.1, volume: 0.05)
        }
    }

    private func playTone(frequency: Double, duration: Double, volume: Float, waveform: Waveform = .sine) {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            let sampleRate: Double = 44100
            let totalSamples = Int(sampleRate * duration)

            let audioFormat = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1)
            guard let buffer = AVAudioPCMBuffer(pcmFormat: audioFormat, frameCapacity: AVAudioFrameCount(totalSamples)) else {
                return
            }
            buffer.frameLength = buffer.frameCapacity

            let channels = UnsafeBufferPointer(start: buffer.floatChannelData, count: Int(buffer.format.channelCount))
            let samples = UnsafeMutableBufferPointer(start: channels[0], count: totalSamples)

            for i in 0..<totalSamples {
                let t = Double(i) / sampleRate
                let value: Float
                switch waveform {
                case .sawtooth:
                    value = Float(2.0 * (frequency * t - floor(frequency * t)) - 1.0)
                case .sine:
                    value = Float(sin(2.0 * .pi * frequency * t))
                }
                samples[i] = value * volume * 0.5
            }

            let player = AVAudioPlayerNode()
            self.engine.attach(player)
            self.engine.connect(player, to: self.engine.mainMixerNode, format: audioFormat)

            do {
                try self.engine.start()
            } catch {}

            player.scheduleBuffer(buffer, at: nil, options: .interrupts) {
                self.engine.detach(player)
            }
            player.play()
        }
    }

    enum Waveform { case sine, sawtooth }
}
