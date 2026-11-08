/** A Brazilian federative unit (26 states + the Federal District). */
export interface BrazilianState {
  /** Lowercase abbreviation, e.g. "mg". Also names the flag image. */
  readonly code: string
  readonly name: string
  /** For the Federal District, the federal capital Brasília. */
  readonly capital: string
  /** Demonyms of the capital; the first one is the main form, the others are also accepted. */
  readonly capitalDemonyms: readonly string[]
}

export const BRAZILIAN_STATES: readonly BrazilianState[] = [
  { code: 'ac', name: 'Acre', capital: 'Rio Branco', capitalDemonyms: ['rio-branquense'] },
  { code: 'al', name: 'Alagoas', capital: 'Maceió', capitalDemonyms: ['maceioense'] },
  { code: 'ap', name: 'Amapá', capital: 'Macapá', capitalDemonyms: ['macapaense'] },
  { code: 'am', name: 'Amazonas', capital: 'Manaus', capitalDemonyms: ['manauara', 'manauense'] },
  { code: 'ba', name: 'Bahia', capital: 'Salvador', capitalDemonyms: ['soteropolitano', 'salvadorense'] },
  { code: 'ce', name: 'Ceará', capital: 'Fortaleza', capitalDemonyms: ['fortalezense'] },
  { code: 'df', name: 'Distrito Federal', capital: 'Brasília', capitalDemonyms: ['brasiliense'] },
  { code: 'es', name: 'Espírito Santo', capital: 'Vitória', capitalDemonyms: ['vitoriense'] },
  { code: 'go', name: 'Goiás', capital: 'Goiânia', capitalDemonyms: ['goianiense'] },
  { code: 'ma', name: 'Maranhão', capital: 'São Luís', capitalDemonyms: ['ludovicense', 'são-luisense'] },
  { code: 'mt', name: 'Mato Grosso', capital: 'Cuiabá', capitalDemonyms: ['cuiabano'] },
  { code: 'ms', name: 'Mato Grosso do Sul', capital: 'Campo Grande', capitalDemonyms: ['campo-grandense'] },
  { code: 'mg', name: 'Minas Gerais', capital: 'Belo Horizonte', capitalDemonyms: ['belo-horizontino'] },
  { code: 'pa', name: 'Pará', capital: 'Belém', capitalDemonyms: ['belenense'] },
  { code: 'pb', name: 'Paraíba', capital: 'João Pessoa', capitalDemonyms: ['pessoense'] },
  { code: 'pr', name: 'Paraná', capital: 'Curitiba', capitalDemonyms: ['curitibano'] },
  { code: 'pe', name: 'Pernambuco', capital: 'Recife', capitalDemonyms: ['recifense'] },
  { code: 'pi', name: 'Piauí', capital: 'Teresina', capitalDemonyms: ['teresinense'] },
  { code: 'rj', name: 'Rio de Janeiro', capital: 'Rio de Janeiro', capitalDemonyms: ['carioca'] },
  { code: 'rn', name: 'Rio Grande do Norte', capital: 'Natal', capitalDemonyms: ['natalense'] },
  { code: 'rs', name: 'Rio Grande do Sul', capital: 'Porto Alegre', capitalDemonyms: ['porto-alegrense'] },
  { code: 'ro', name: 'Rondônia', capital: 'Porto Velho', capitalDemonyms: ['porto-velhense'] },
  { code: 'rr', name: 'Roraima', capital: 'Boa Vista', capitalDemonyms: ['boa-vistense'] },
  { code: 'sc', name: 'Santa Catarina', capital: 'Florianópolis', capitalDemonyms: ['florianopolitano'] },
  { code: 'sp', name: 'São Paulo', capital: 'São Paulo', capitalDemonyms: ['paulistano'] },
  { code: 'se', name: 'Sergipe', capital: 'Aracaju', capitalDemonyms: ['aracajuano', 'aracajuense'] },
  { code: 'to', name: 'Tocantins', capital: 'Palmas', capitalDemonyms: ['palmense'] },
]
