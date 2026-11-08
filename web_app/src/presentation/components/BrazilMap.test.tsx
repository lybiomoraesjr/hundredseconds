import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BRAZILIAN_STATES } from '../../domain'
import { renderWithProviders } from '../../test/renderWithProviders'
import BrazilMap from './BrazilMap'
import { BRAZIL_MAP_STATES } from './brazilMapData'

describe('BrazilMap', () => {
  it('has a shape for every state of the game', () => {
    expect(BRAZIL_MAP_STATES.map((state) => state.code).sort())
      .toEqual(BRAZILIAN_STATES.map((state) => state.code).sort())
  })

  it('highlights only the asked state, without revealing its name', () => {
    const { container } = renderWithProviders(<BrazilMap highlightedCode="mg" />)
    const map = screen.getByRole('img', { name: 'Mapa do Brasil com um estado destacado' })
    expect(map).toHaveAttribute('data-state', 'mg')
    expect(container.querySelectorAll('path')).toHaveLength(27)
    expect(container.querySelectorAll('path[class*="highlighted"]')).toHaveLength(1)
    expect(map).not.toHaveTextContent('Minas')
  })

  it.each(['df', 'se', 'al'])('draws a ring around the small state %s', (code) => {
    const { container } = renderWithProviders(<BrazilMap highlightedCode={code} />)
    expect(container.querySelector('circle')).toBeInTheDocument()
  })

  it('does not draw a ring around big states', () => {
    const { container } = renderWithProviders(<BrazilMap highlightedCode="am" />)
    expect(container.querySelector('circle')).not.toBeInTheDocument()
  })
})
