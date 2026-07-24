package com.game6561.app.sound

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import kotlin.math.PI
import kotlin.math.floor
import kotlin.math.sin

class SoundManager(private val context: Context) {

    private var enabled = true
    private var audioTrack: AudioTrack? = null

    private val vibrator: Vibrator? by lazy {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            vm?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }

    fun setEnabled(enabled: Boolean) {
        this.enabled = enabled
    }

    fun play(type: SoundType) {
        if (!enabled) return

        when (type) {
            SoundType.MOVE -> playTone(200.0, 0.1, 0.1)
            SoundType.MERGE -> {
                playTone(400.0, 0.15, 0.15)
                vibrate(30)
            }
            SoundType.COMBO -> playTone(600.0, 0.2, 0.2)
            SoundType.WIN -> {
                playTone(523.25, 0.3, 0.1)
                Thread.sleep(50)
                playTone(659.25, 0.3, 0.1)
                Thread.sleep(50)
                playTone(783.99, 0.3, 0.2)
                vibrate(longArrayOf(100, 50, 100, 50, 200))
            }
            SoundType.GAME_OVER -> playTone(150.0, 0.5, 0.2, AudioTrack.WAVEFORM_SAWTOOTH)
            SoundType.UNDO -> playTone(300.0, 0.08, 0.1)
            SoundType.START -> playTone(440.0, 0.2, 0.1)
            SoundType.INVALID -> playTone(100.0, 0.1, 0.05)
        }
    }

    private fun playTone(frequency: Double, durationSec: Double, volume: Float, waveform: Int = AudioTrack.WAVEFORM_SINE) {
        try {
            val sampleRate = 44100
            val numSamples = (sampleRate * durationSec).toInt()
            val buffer = ShortArray(numSamples)

            for (i in 0 until numSamples) {
                val t = i.toDouble() / sampleRate
                val value = when (waveform) {
                    AudioTrack.WAVEFORM_SAWTOOTH -> 2.0 * (frequency * t - floor(frequency * t)) - 1.0
                    else -> sin(2.0 * PI * frequency * t)
                }
                buffer[i] = (value * Short.MAX_VALUE * volume).toInt().toShort()
            }

            val track = AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_GAME)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(sampleRate)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build()
                )
                .setBufferSizeInBytes(numSamples * 2)
                .setTransferMode(AudioTrack.MODE_STATIC)
                .build()

            track.write(buffer, 0, numSamples)
            track.play()
            track.release()
        } catch (_: Exception) {
        }
    }

    private fun vibrate(durationMs: Long) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(
                    VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(durationMs)
            }
        } catch (_: Exception) {}
    }

    private fun vibrate(pattern: LongArray) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(
                    VibrationEffect.createWaveform(pattern, -1)
                )
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(pattern, -1)
            }
        } catch (_: Exception) {}
    }

    fun release() {
        audioTrack?.release()
        audioTrack = null
    }
}

enum class SoundType {
    MOVE, MERGE, COMBO, WIN, GAME_OVER, UNDO, START, INVALID
}
