import { describe, expect, it } from 'vitest'
import {
  createAbbreviationQuestion,
  createCapitalQuestion,
  createFlagQuestion,
  createPowerQuestion,
} from '../entities/Question'
import { checkAnswer, normalizeText } from './AnswerChecker'

const saoPaulo = createFlagQuestion({ code: 'sp', name: 'São Paulo', capital: 'São Paulo' })

describe('normalizeText', () => {
  it('ignores case, accents and extra spaces', () => {
    expect(normalizeText('  São   PAULO ')).toBe('sao paulo')
    expect(normalizeText('Espírito Santo')).toBe('espirito santo')
    expect(normalizeText('Rondônia')).toBe('rondonia')
  })
})

describe('checkAnswer', () => {
  it('accepts state names typed without accents or in any case', () => {
    expect(checkAnswer(saoPaulo, 'São Paulo')).toBe('CORRECT')
    expect(checkAnswer(saoPaulo, 'sao paulo')).toBe('CORRECT')
    expect(checkAnswer(saoPaulo, ' SAO  PAULO ')).toBe('CORRECT')
  })

  it('rejects other names, partial names and the abbreviation', () => {
    expect(checkAnswer(saoPaulo, 'Santa Catarina')).toBe('WRONG')
    expect(checkAnswer(saoPaulo, 'Paulo')).toBe('WRONG')
    expect(checkAnswer(saoPaulo, 'SP')).toBe('WRONG')
  })

  it('tells similar names apart', () => {
    const para = createFlagQuestion({ code: 'pa', name: 'Pará', capital: 'Belém' })
    expect(checkAnswer(para, 'para')).toBe('CORRECT')
    expect(checkAnswer(para, 'Paraná')).toBe('WRONG')
    expect(checkAnswer(para, 'Paraíba')).toBe('WRONG')
  })

  it('treats a blank name as empty', () => {
    expect(checkAnswer(saoPaulo, '   ')).toBe('EMPTY')
  })

  it('keeps checking math answers as numbers', () => {
    const question = createPowerQuestion(2, 3)
    expect(checkAnswer(question, '8')).toBe('CORRECT')
    expect(checkAnswer(question, ' 08 ')).toBe('CORRECT')
    expect(checkAnswer(question, '9')).toBe('WRONG')
    expect(checkAnswer(question, '')).toBe('EMPTY')
  })
})

describe('checkAnswer with abbreviations', () => {
  const minas = createAbbreviationQuestion({ code: 'mg', name: 'Minas Gerais', capital: 'Belo Horizonte' })

  it('accepts the abbreviation in any case', () => {
    expect(checkAnswer(minas, 'MG')).toBe('CORRECT')
    expect(checkAnswer(minas, 'mg')).toBe('CORRECT')
    expect(checkAnswer(minas, ' Mg ')).toBe('CORRECT')
  })

  it('rejects other abbreviations and the state name', () => {
    expect(checkAnswer(minas, 'MS')).toBe('WRONG')
    expect(checkAnswer(minas, 'Minas Gerais')).toBe('WRONG')
  })
})

describe('checkAnswer with capitals', () => {
  const santaCatarina = createCapitalQuestion({ code: 'sc', name: 'Santa Catarina', capital: 'Florianópolis' })

  it('accepts the capital without accents or in any case', () => {
    expect(checkAnswer(santaCatarina, 'Florianópolis')).toBe('CORRECT')
    expect(checkAnswer(santaCatarina, 'florianopolis')).toBe('CORRECT')
  })

  it('rejects the state name', () => {
    expect(checkAnswer(santaCatarina, 'Santa Catarina')).toBe('WRONG')
  })
})
