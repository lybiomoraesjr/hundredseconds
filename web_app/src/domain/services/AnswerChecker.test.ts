import { describe, expect, it } from 'vitest'
import { BRAZILIAN_STATES } from '../entities/BrazilianState'
import {
  createAbbreviationQuestion,
  createCapitalQuestion,
  createDemonymQuestion,
  createFlagQuestion,
  createPowerQuestion,
} from '../entities/Question'
import { checkAnswer, normalizeText } from './AnswerChecker'

const stateOf = (code: string) => BRAZILIAN_STATES.find((state) => state.code === code)!

describe('normalizeText', () => {
  it('ignores case, accents and extra spaces', () => {
    expect(normalizeText('  São   PAULO ')).toBe('sao paulo')
    expect(normalizeText('Espírito Santo')).toBe('espirito santo')
    expect(normalizeText('Rondônia')).toBe('rondonia')
  })
})

describe('checkAnswer with flags', () => {
  const saoPaulo = createFlagQuestion(stateOf('sp'))

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
    const para = createFlagQuestion(stateOf('pa'))
    expect(checkAnswer(para, 'para')).toBe('CORRECT')
    expect(checkAnswer(para, 'Paraná')).toBe('WRONG')
    expect(checkAnswer(para, 'Paraíba')).toBe('WRONG')
  })

  it('treats a blank name as empty', () => {
    expect(checkAnswer(saoPaulo, '   ')).toBe('EMPTY')
  })
})

describe('checkAnswer with math', () => {
  it('keeps checking math answers as numbers', () => {
    const question = createPowerQuestion(2, 3)
    expect(checkAnswer(question, '8')).toBe('CORRECT')
    expect(checkAnswer(question, ' 08 ')).toBe('CORRECT')
    expect(checkAnswer(question, '9')).toBe('WRONG')
    expect(checkAnswer(question, '')).toBe('EMPTY')
  })
})

describe('checkAnswer with abbreviations', () => {
  const minas = createAbbreviationQuestion(stateOf('mg'))

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
  const santaCatarina = createCapitalQuestion(stateOf('sc'))

  it('accepts the capital without accents or in any case', () => {
    expect(checkAnswer(santaCatarina, 'Florianópolis')).toBe('CORRECT')
    expect(checkAnswer(santaCatarina, 'florianopolis')).toBe('CORRECT')
  })

  it('rejects the state name', () => {
    expect(checkAnswer(santaCatarina, 'Santa Catarina')).toBe('WRONG')
  })
})

describe('checkAnswer with capital demonyms', () => {
  it('shows the capital and expects the main demonym', () => {
    const salvador = createDemonymQuestion(stateOf('ba'))
    expect(salvador.prompt).toBe('Salvador')
    expect(salvador.answer).toBe('soteropolitano')
  })

  it('accepts the feminine form', () => {
    const salvador = createDemonymQuestion(stateOf('ba'))
    expect(checkAnswer(salvador, 'Soteropolitana')).toBe('CORRECT')
  })

  it('accepts the alternative official demonyms', () => {
    expect(checkAnswer(createDemonymQuestion(stateOf('ba')), 'salvadorense')).toBe('CORRECT')
    expect(checkAnswer(createDemonymQuestion(stateOf('am')), 'manauense')).toBe('CORRECT')
    expect(checkAnswer(createDemonymQuestion(stateOf('ma')), 'são-luisense')).toBe('CORRECT')
  })

  it('ignores hyphens and spaces in compound demonyms', () => {
    const beloHorizonte = createDemonymQuestion(stateOf('mg'))
    expect(checkAnswer(beloHorizonte, 'belo-horizontino')).toBe('CORRECT')
    expect(checkAnswer(beloHorizonte, 'belo horizontino')).toBe('CORRECT')
    expect(checkAnswer(beloHorizonte, 'belohorizontina')).toBe('CORRECT')
  })

  it('does not invent a feminine form for demonyms that do not end in "o"', () => {
    const rio = createDemonymQuestion(stateOf('rj'))
    expect(checkAnswer(rio, 'carioca')).toBe('CORRECT')
    expect(checkAnswer(rio, 'carioco')).toBe('WRONG')
  })

  it('rejects the state demonym when it differs from the capital one', () => {
    expect(checkAnswer(createDemonymQuestion(stateOf('ba')), 'baiano')).toBe('WRONG')
    expect(checkAnswer(createDemonymQuestion(stateOf('sp')), 'paulista')).toBe('WRONG')
  })
})
