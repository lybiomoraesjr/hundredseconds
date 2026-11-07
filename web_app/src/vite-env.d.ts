/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

interface ImportMetaEnv {
  /** API origin; empty means same origin (dev proxy or reverse proxy). */
  readonly VITE_API_BASE_URL?: string
}
