import type { Beeper } from '../../application/ports/Beeper'

const FREQUENCY_HZ = 880
const DURATION_SECONDS = 0.35
const VOLUME = 0.2

/** Synthesizes a short beep with the Web Audio API (no audio file needed). */
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

  beep(): void {
    const context = this.context
    if (!context) return
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = FREQUENCY_HZ
    gain.gain.setValueAtTime(VOLUME, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + DURATION_SECONDS)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + DURATION_SECONDS)
  }
}
