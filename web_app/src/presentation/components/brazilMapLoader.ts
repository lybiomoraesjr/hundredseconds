import { lazy } from 'react'

const loadBrazilMap = () => import('./BrazilMap')

/** The map data (~65 KB) is only downloaded by the map game. */
export const LazyBrazilMap = lazy(loadBrazilMap)

/** Starts the download during the countdown, so the first question shows up without delay. */
export function preloadBrazilMap(): void {
  void loadBrazilMap()
}
