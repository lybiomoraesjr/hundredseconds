import { describe, expect, it } from 'vitest'
import { BRAZILIAN_RULERS } from '../entities/BrazilianRuler'
import { BRAZILIAN_STATES } from '../entities/BrazilianState'
import {
  createAbbreviationQuestion,
  createCapitalQuestion,
  createCapitalDemonymQuestion,
  createFlagQuestion,
  createPowerQuestion,
  createRulerQuestion,
  createStateDemonymQuestion,
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
    const salvador = createCapitalDemonymQuestion(stateOf('ba'))
    expect(salvador.prompt).toBe('Salvador')
    expect(salvador.answer).toBe('soteropolitano')
  })

  it('accepts the feminine form', () => {
    const salvador = createCapitalDemonymQuestion(stateOf('ba'))
    expect(checkAnswer(salvador, 'Soteropolitana')).toBe('CORRECT')
  })

  it('accepts the alternative official demonyms', () => {
    expect(checkAnswer(createCapitalDemonymQuestion(stateOf('ba')), 'salvadorense')).toBe('CORRECT')
    expect(checkAnswer(createCapitalDemonymQuestion(stateOf('am')), 'manauense')).toBe('CORRECT')
    expect(checkAnswer(createCapitalDemonymQuestion(stateOf('ma')), 'são-luisense')).toBe('CORRECT')
  })

  it('ignores hyphens and spaces in compound demonyms', () => {
    const beloHorizonte = createCapitalDemonymQuestion(stateOf('mg'))
    expect(checkAnswer(beloHorizonte, 'belo-horizontino')).toBe('CORRECT')
    expect(checkAnswer(beloHorizonte, 'belo horizontino')).toBe('CORRECT')
    expect(checkAnswer(beloHorizonte, 'belohorizontina')).toBe('CORRECT')
  })

  it('does not invent a feminine form for demonyms that do not end in "o"', () => {
    const rio = createCapitalDemonymQuestion(stateOf('rj'))
    expect(checkAnswer(rio, 'carioca')).toBe('CORRECT')
    expect(checkAnswer(rio, 'carioco')).toBe('WRONG')
  })

  it('rejects the state demonym when it differs from the capital one', () => {
    expect(checkAnswer(createCapitalDemonymQuestion(stateOf('ba')), 'baiano')).toBe('WRONG')
    expect(checkAnswer(createCapitalDemonymQuestion(stateOf('sp')), 'paulista')).toBe('WRONG')
  })
})

describe('checkAnswer with state demonyms', () => {
  it('shows the state name and expects the main demonym', () => {
    const bahia = createStateDemonymQuestion(stateOf('ba'))
    expect(bahia.prompt).toBe('Bahia')
    expect(bahia.answer).toBe('baiano')
    expect(checkAnswer(bahia, 'Baiana')).toBe('CORRECT')
  })

  it('accepts the alternative official demonyms, with or without hyphens', () => {
    expect(checkAnswer(createStateDemonymQuestion(stateOf('es')), 'espirito santense')).toBe('CORRECT')
    expect(checkAnswer(createStateDemonymQuestion(stateOf('rn')), 'norte-rio-grandense')).toBe('CORRECT')
    expect(checkAnswer(createStateDemonymQuestion(stateOf('rs')), 'Gaúcha')).toBe('CORRECT')
    expect(checkAnswer(createStateDemonymQuestion(stateOf('ac')), 'acreano')).toBe('CORRECT')
  })

  it('tells Mato Grosso and Mato Grosso do Sul apart', () => {
    expect(checkAnswer(createStateDemonymQuestion(stateOf('mt')), 'sul-mato-grossense')).toBe('WRONG')
    expect(checkAnswer(createStateDemonymQuestion(stateOf('ms')), 'mato-grossense')).toBe('WRONG')
    expect(checkAnswer(createStateDemonymQuestion(stateOf('ms')), 'mato grossense do sul')).toBe('CORRECT')
  })

  it('rejects the capital demonym when it differs from the state one', () => {
    expect(checkAnswer(createStateDemonymQuestion(stateOf('sp')), 'paulistano')).toBe('WRONG')
    expect(checkAnswer(createStateDemonymQuestion(stateOf('rj')), 'carioca')).toBe('WRONG')
  })
})

describe('checkAnswer with Brazilian rulers', () => {
  const rulerQuestion = (id: string) => createRulerQuestion(BRAZILIAN_RULERS.find((ruler) => ruler.id === id)!)

  it('accepts the full name and the usual short names, ignoring accents and case', () => {
    const vargas = rulerQuestion('vargas-1')
    expect(checkAnswer(vargas, 'Getúlio Vargas')).toBe('CORRECT')
    expect(checkAnswer(vargas, 'getulio')).toBe('CORRECT')
    expect(checkAnswer(vargas, 'VARGAS')).toBe('CORRECT')
    expect(checkAnswer(rulerQuestion('fhc'), 'fhc')).toBe('CORRECT')
    expect(checkAnswer(rulerQuestion('jango'), 'Jango')).toBe('CORRECT')
    expect(checkAnswer(rulerQuestion('jk'), 'JK')).toBe('CORRECT')
  })

  it('accepts the emperors written in several ways, but tells them apart', () => {
    const pedro1 = rulerQuestion('pedro-1')
    const pedro2 = rulerQuestion('pedro-2')
    for (const typed of ['Dom Pedro I', 'D. Pedro I', 'pedro 1', 'Dom Pedro Primeiro']) {
      expect(checkAnswer(pedro1, typed), typed).toBe('CORRECT')
    }
    for (const typed of ['Dom Pedro II', 'D. Pedro II', 'pedro 2', 'dom pedro segundo']) {
      expect(checkAnswer(pedro2, typed), typed).toBe('CORRECT')
    }
    expect(checkAnswer(pedro1, 'Dom Pedro II')).toBe('WRONG')
    expect(checkAnswer(pedro2, 'Dom Pedro I')).toBe('WRONG')
  })

  it('tells the two triple regencies apart', () => {
    const provisional = rulerQuestion('regency-provisional')
    expect(checkAnswer(provisional, 'regencia trina provisoria')).toBe('CORRECT')
    expect(checkAnswer(provisional, 'Regência Trina Permanente')).toBe('WRONG')
  })

  it('accepts the juntas by their short names', () => {
    expect(checkAnswer(rulerQuestion('junta-1969'), 'junta militar')).toBe('CORRECT')
    expect(checkAnswer(rulerQuestion('junta-1930'), 'Junta Governativa Provisória')).toBe('CORRECT')
  })

  it('rejects whoever governed in another period', () => {
    expect(checkAnswer(rulerQuestion('dutra'), 'Getúlio Vargas')).toBe('WRONG')
    expect(checkAnswer(rulerQuestion('tancredo'), 'Sarney')).toBe('WRONG')
  })
})
