import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createPowerQuestion, createRootQuestion } from '../../domain'
import { renderWithProviders } from '../../test/renderWithProviders'
import { MathExpression } from './MathExpression'

describe('MathExpression', () => {
  it('renders powers with a superscript exponent', () => {
    const { container } = renderWithProviders(<MathExpression question={createPowerQuestion(2, 3)} />)
    expect(screen.getByRole('math', { name: '2 elevado a 3' })).toBeInTheDocument()
    expect(container.querySelector('sup')).toHaveTextContent('3')
  })

  it('renders square roots without index', () => {
    const { container } = renderWithProviders(<MathExpression question={createRootQuestion(81, 2)} />)
    expect(screen.getByRole('math', { name: 'raiz quadrada de 81' })).toHaveTextContent('81')
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelector('sup')).toBeNull()
  })

  it('renders the index of higher order roots', () => {
    const { container } = renderWithProviders(<MathExpression question={createRootQuestion(27, 3)} />)
    expect(screen.getByRole('math', { name: 'raiz cúbica de 27' })).toBeInTheDocument()
    expect(container.querySelector('sup')).toHaveTextContent('3')
  })
})
