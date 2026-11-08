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
// Two quick rising notes (B5 -> E6), a short "ding" that differs from every other beep
const STAR_TONES: readonly Tone[] = [
  { frequencyHz: 988, durationSeconds: 0.12, volume: 0.2, type: 'triangle' },
  { frequencyHz: 1319, durationSeconds: 0.3, volume: 0.2, type: 'triangle' },
]
const STAR_NOTE_GAP_SECONDS = 0.1

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

  star(): void {
    STAR_TONES.forEach((tone, index) => this.play(tone, index * STAR_NOTE_GAP_SECONDS))
  }

  private play(tone: Tone, delaySeconds = 0): void {
    const context = this.context
    if (!context) return
    const startAt = context.currentTime + delaySeconds
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = tone.type
    oscillator.frequency.value = tone.frequencyHz
    gain.gain.setValueAtTime(tone.volume, startAt)
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + tone.durationSeconds)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(startAt)
    oscillator.stop(startAt + tone.durationSeconds)
  }
}
