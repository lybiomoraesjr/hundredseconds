import { describe, expect, it } from 'vitest'
import { BRAZILIAN_RULERS, RulerEra, type GoverningRuler } from './BrazilianRuler'

const governing = BRAZILIAN_RULERS.filter((ruler): ruler is GoverningRuler => ruler.kind === 'GOVERNED')

describe('BRAZILIAN_RULERS', () => {
  it('has a unique id for every period', () => {
    const ids = BRAZILIAN_RULERS.map((ruler) => ruler.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers from the independence to today with no gaps or overlaps between terms', () => {
    expect(governing[0]).toMatchObject({ name: 'Dom Pedro I', start: '1822-09-07' })
    expect(governing[governing.length - 1].end).toBeNull()
    for (let i = 1; i < governing.length; i++) {
      expect(governing[i].start, governing[i].name).toBe(governing[i - 1].end)
    }
  })

  it('ends every term after it starts', () => {
    governing
      .filter((ruler) => ruler.end !== null)
      .forEach((ruler) => expect(ruler.end! > ruler.start, ruler.id).toBe(true))
  })

  it('includes the regencies, the juntas and the presidents elected who never took office', () => {
    const names = BRAZILIAN_RULERS.map((ruler) => ruler.name)
    expect(names).toEqual(expect.arrayContaining([
      'Regência Trina Provisória', 'Regência Trina Permanente', 'Diogo Feijó', 'Araújo Lima', 'Dom Pedro II',
    ]))
    expect(names.filter((name) => name === 'Junta Governativa Provisória')).toHaveLength(2)
    expect(BRAZILIAN_RULERS.filter((ruler) => ruler.kind === 'NOT_INAUGURATED').map((ruler) => ruler.name))
      .toEqual(['Rodrigues Alves', 'Júlio Prestes', 'Tancredo Neves'])
  })

  it('splits the rulers into five eras, in chronological order', () => {
    const count = (era: RulerEra) => BRAZILIAN_RULERS.filter((ruler) => ruler.era === era).length
    expect([RulerEra.EMPIRE, RulerEra.OLD_REPUBLIC, RulerEra.VARGAS_ERA, RulerEra.MILITARY, RulerEra.NEW_REPUBLIC]
      .map(count)).toEqual([6, 16, 12, 6, 10])
    const eras = BRAZILIAN_RULERS.map((ruler) => ruler.era)
    const changes = eras.filter((era, index) => index > 0 && era !== eras[index - 1])
    expect(changes).toHaveLength(4)
  })
})
