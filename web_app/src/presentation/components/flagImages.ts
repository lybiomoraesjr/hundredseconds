import { BRAZILIAN_STATES } from '../../domain'

/** Flags live in public/flags, named by the lowercase state code. */
export function flagUrl(stateCode: string): string {
  return `${import.meta.env.BASE_URL}flags/${stateCode}.webp`
}

/** Loads every flag in the background so the next one shows up without delay. */
export function preloadFlags(): void {
  for (const state of BRAZILIAN_STATES) {
    const image = new Image()
    image.src = flagUrl(state.code)
  }
}
