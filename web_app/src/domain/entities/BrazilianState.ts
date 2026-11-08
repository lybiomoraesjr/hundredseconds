/** A Brazilian federative unit (26 states + the Federal District). */
export interface BrazilianState {
  /** Lowercase abbreviation, e.g. "mg". Also names the flag image. */
  readonly code: string
  readonly name: string
  /** For the Federal District, the federal capital Brasília. */
  readonly capital: string
}

export const BRAZILIAN_STATES: readonly BrazilianState[] = [
  { code: 'ac', name: 'Acre', capital: 'Rio Branco' },
  { code: 'al', name: 'Alagoas', capital: 'Maceió' },
  { code: 'ap', name: 'Amapá', capital: 'Macapá' },
  { code: 'am', name: 'Amazonas', capital: 'Manaus' },
  { code: 'ba', name: 'Bahia', capital: 'Salvador' },
  { code: 'ce', name: 'Ceará', capital: 'Fortaleza' },
  { code: 'df', name: 'Distrito Federal', capital: 'Brasília' },
  { code: 'es', name: 'Espírito Santo', capital: 'Vitória' },
  { code: 'go', name: 'Goiás', capital: 'Goiânia' },
  { code: 'ma', name: 'Maranhão', capital: 'São Luís' },
  { code: 'mt', name: 'Mato Grosso', capital: 'Cuiabá' },
  { code: 'ms', name: 'Mato Grosso do Sul', capital: 'Campo Grande' },
  { code: 'mg', name: 'Minas Gerais', capital: 'Belo Horizonte' },
  { code: 'pa', name: 'Pará', capital: 'Belém' },
  { code: 'pb', name: 'Paraíba', capital: 'João Pessoa' },
  { code: 'pr', name: 'Paraná', capital: 'Curitiba' },
  { code: 'pe', name: 'Pernambuco', capital: 'Recife' },
  { code: 'pi', name: 'Piauí', capital: 'Teresina' },
  { code: 'rj', name: 'Rio de Janeiro', capital: 'Rio de Janeiro' },
  { code: 'rn', name: 'Rio Grande do Norte', capital: 'Natal' },
  { code: 'rs', name: 'Rio Grande do Sul', capital: 'Porto Alegre' },
  { code: 'ro', name: 'Rondônia', capital: 'Porto Velho' },
  { code: 'rr', name: 'Roraima', capital: 'Boa Vista' },
  { code: 'sc', name: 'Santa Catarina', capital: 'Florianópolis' },
  { code: 'sp', name: 'São Paulo', capital: 'São Paulo' },
  { code: 'se', name: 'Sergipe', capital: 'Aracaju' },
  { code: 'to', name: 'Tocantins', capital: 'Palmas' },
]
