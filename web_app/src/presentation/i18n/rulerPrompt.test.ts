import { describe, expect, it } from 'vitest'
import { BRAZILIAN_RULERS } from '../../domain'
import { rulerHeading, rulerPrompt } from './rulerPrompt'

const rulerById = (id: string) => BRAZILIAN_RULERS.find((ruler) => ruler.id === id)!

describe('rulerPrompt', () => {
  it('shows only the years of terms that span more than one year', () => {
    expect(rulerPrompt(rulerById('vargas-1'))).toBe('1930 a 1945')
    expect(rulerPrompt(rulerById('pedro-2'))).toBe('1840 a 1889')
  })

  it('shows full dates when the term started and ended in the same year', () => {
    expect(rulerPrompt(rulerById('carlos-luz'))).toBe('08/11/1955 a 11/11/1955')
    expect(rulerPrompt(rulerById('junta-1930'))).toBe('24/10/1930 a 03/11/1930')
  })

  it('says "até hoje" for the current term', () => {
    expect(rulerPrompt(rulerById('lula-2'))).toBe('2023 até hoje')
  })

  it('shows the election year of whoever never took office, with its own question', () => {
    const tancredo = rulerById('tancredo')
    expect(rulerPrompt(tancredo)).toBe('1985')
    expect(rulerHeading(tancredo)).toBe('Quem foi eleito presidente neste ano, mas não tomou posse?')
    expect(rulerHeading(rulerById('sarney'))).toBe('Quem governou o Brasil neste período?')
  })

  it('never asks the same thing with two different answers', () => {
    const answerByQuestion = new Map<string, string>()
    for (const ruler of BRAZILIAN_RULERS) {
      const question = `${rulerHeading(ruler)} ${rulerPrompt(ruler)}`
      expect(answerByQuestion.get(question) ?? ruler.name, question).toBe(ruler.name)
      answerByQuestion.set(question, ruler.name)
    }
  })
})
