/** A Brazilian federative unit (26 states + the Federal District). */
export interface BrazilianState {
  /** Lowercase abbreviation, e.g. "mg". Also names the flag image. */
  readonly code: string
  readonly name: string
  /** For the Federal District, the federal capital Brasília. */
  readonly capital: string
  /** Demonyms of the capital; the first one is the main form, the others are also accepted. */
  readonly capitalDemonyms: readonly string[]
  /** Demonyms of the state; the first one is the main form, the others are also accepted. */
  readonly stateDemonyms: readonly string[]
}

export const BRAZILIAN_STATES: readonly BrazilianState[] = [
  {
    code: 'ac', name: 'Acre', capital: 'Rio Branco',
    capitalDemonyms: ['rio-branquense'],
    stateDemonyms: ['acriano', 'acreano'],
  },
  {
    code: 'al', name: 'Alagoas', capital: 'Maceió',
    capitalDemonyms: ['maceioense'],
    stateDemonyms: ['alagoano'],
  },
  {
    code: 'ap', name: 'Amapá', capital: 'Macapá',
    capitalDemonyms: ['macapaense'],
    stateDemonyms: ['amapaense'],
  },
  {
    code: 'am', name: 'Amazonas', capital: 'Manaus',
    capitalDemonyms: ['manauara', 'manauense'],
    stateDemonyms: ['amazonense'],
  },
  {
    code: 'ba', name: 'Bahia', capital: 'Salvador',
    capitalDemonyms: ['soteropolitano', 'salvadorense'],
    stateDemonyms: ['baiano'],
  },
  {
    code: 'ce', name: 'Ceará', capital: 'Fortaleza',
    capitalDemonyms: ['fortalezense'],
    stateDemonyms: ['cearense'],
  },
  {
    code: 'df', name: 'Distrito Federal', capital: 'Brasília',
    capitalDemonyms: ['brasiliense'],
    stateDemonyms: ['brasiliense'],
  },
  {
    code: 'es', name: 'Espírito Santo', capital: 'Vitória',
    capitalDemonyms: ['vitoriense'],
    stateDemonyms: ['capixaba', 'espírito-santense'],
  },
  {
    code: 'go', name: 'Goiás', capital: 'Goiânia',
    capitalDemonyms: ['goianiense'],
    stateDemonyms: ['goiano'],
  },
  {
    code: 'ma', name: 'Maranhão', capital: 'São Luís',
    capitalDemonyms: ['ludovicense', 'são-luisense'],
    stateDemonyms: ['maranhense'],
  },
  {
    code: 'mt', name: 'Mato Grosso', capital: 'Cuiabá',
    capitalDemonyms: ['cuiabano'],
    stateDemonyms: ['mato-grossense'],
  },
  {
    code: 'ms', name: 'Mato Grosso do Sul', capital: 'Campo Grande',
    capitalDemonyms: ['campo-grandense'],
    stateDemonyms: ['sul-mato-grossense', 'mato-grossense-do-sul'],
  },
  {
    code: 'mg', name: 'Minas Gerais', capital: 'Belo Horizonte',
    capitalDemonyms: ['belo-horizontino'],
    stateDemonyms: ['mineiro'],
  },
  {
    code: 'pa', name: 'Pará', capital: 'Belém',
    capitalDemonyms: ['belenense'],
    stateDemonyms: ['paraense'],
  },
  {
    code: 'pb', name: 'Paraíba', capital: 'João Pessoa',
    capitalDemonyms: ['pessoense'],
    stateDemonyms: ['paraibano'],
  },
  {
    code: 'pr', name: 'Paraná', capital: 'Curitiba',
    capitalDemonyms: ['curitibano'],
    stateDemonyms: ['paranaense'],
  },
  {
    code: 'pe', name: 'Pernambuco', capital: 'Recife',
    capitalDemonyms: ['recifense'],
    stateDemonyms: ['pernambucano'],
  },
  {
    code: 'pi', name: 'Piauí', capital: 'Teresina',
    capitalDemonyms: ['teresinense'],
    stateDemonyms: ['piauiense'],
  },
  {
    code: 'rj', name: 'Rio de Janeiro', capital: 'Rio de Janeiro',
    capitalDemonyms: ['carioca'],
    stateDemonyms: ['fluminense'],
  },
  {
    code: 'rn', name: 'Rio Grande do Norte', capital: 'Natal',
    capitalDemonyms: ['natalense'],
    stateDemonyms: ['potiguar', 'norte-rio-grandense', 'rio-grandense-do-norte'],
  },
  {
    code: 'rs', name: 'Rio Grande do Sul', capital: 'Porto Alegre',
    capitalDemonyms: ['porto-alegrense'],
    stateDemonyms: ['gaúcho', 'sul-rio-grandense', 'rio-grandense-do-sul'],
  },
  {
    code: 'ro', name: 'Rondônia', capital: 'Porto Velho',
    capitalDemonyms: ['porto-velhense'],
    stateDemonyms: ['rondoniense', 'rondoniano'],
  },
  {
    code: 'rr', name: 'Roraima', capital: 'Boa Vista',
    capitalDemonyms: ['boa-vistense'],
    stateDemonyms: ['roraimense'],
  },
  {
    code: 'sc', name: 'Santa Catarina', capital: 'Florianópolis',
    capitalDemonyms: ['florianopolitano'],
    stateDemonyms: ['catarinense', 'barriga-verde'],
  },
  {
    code: 'sp', name: 'São Paulo', capital: 'São Paulo',
    capitalDemonyms: ['paulistano'],
    stateDemonyms: ['paulista'],
  },
  {
    code: 'se', name: 'Sergipe', capital: 'Aracaju',
    capitalDemonyms: ['aracajuano', 'aracajuense'],
    stateDemonyms: ['sergipano', 'sergipense'],
  },
  {
    code: 'to', name: 'Tocantins', capital: 'Palmas',
    capitalDemonyms: ['palmense'],
    stateDemonyms: ['tocantinense'],
  },
]
