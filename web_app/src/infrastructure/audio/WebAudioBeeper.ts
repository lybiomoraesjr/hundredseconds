import type { Beeper } from '../../application/ports/Beeper'

interface Tone {
  readonly frequencyHz: number
  readonly durationSeconds: number
  readonly volume: number
  readonly type: OscillatorType
}

const COUNTDOWN_TONE: Tone = { frequencyHz: 660, durationSeconds: 0.15, volume: 0.2, type: 'sine' }
// Higher and longer, so the start is clearly different from the countdown
const START_TONE: Tone = { frequencyHz: 1320, durationSeconds: 0.5, volume: 0.25, type: 'square' }
const WARNING_TONE: Tone = { frequencyHz: 880, durationSeconds: 0.35, volume: 0.2, type: 'sine' }

/** Synthesizes the game sounds with the Web Audio API (no audio files needed). */
export class WebAudioBeeper implements Beeper {
  private context: AudioContext | null = null

  unlock(): void {
    try {
      this.context ??= new AudioContext()
      void this.context.resume()
    } catch {
      // Audio is optional: the game keeps working without it
      this.context = null
    }
  }

  countdownTick(): void {
    this.play(COUNTDOWN_TONE)
  }

  start(): void {
    this.play(START_TONE)
  }

  warning(): void {
    this.play(WARNING_TONE)
  }

  private play(tone: Tone): void {
    const context = this.context
    if (!context) return
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = tone.type
    oscillator.frequency.value = tone.frequencyHz
    gain.gain.setValueAtTime(tone.volume, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + tone.durationSeconds)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + tone.durationSeconds)
  }
}
