/**
 * Someone (or a group, like a regency or a junta) who led Brazil since the independence,
 * or a president elected who never took office.
 */
export type BrazilianRuler = GoverningRuler | ElectedNotInaugurated

interface RulerBase {
  /** Unique per period: the same person can govern twice (Vargas, Lula, Mazzilli). */
  readonly id: string
  /** Main form of the name, shown when the player misses. */
  readonly name: string
  /** Other names that count as correct (short names, nicknames, titles). */
  readonly otherNames: readonly string[]
}

export interface GoverningRuler extends RulerBase {
  readonly kind: 'GOVERNED'
  /** ISO date (YYYY-MM-DD) the term started. */
  readonly start: string
  /** ISO date the term ended; null while still in office. */
  readonly end: string | null
}

export interface ElectedNotInaugurated extends RulerBase {
  readonly kind: 'NOT_INAUGURATED'
  readonly electionYear: number
}

const governed = (id: string, name: string, start: string, end: string | null,
  otherNames: readonly string[] = []): GoverningRuler => ({ kind: 'GOVERNED', id, name, otherNames, start, end })

const notInaugurated = (id: string, name: string, electionYear: number,
  otherNames: readonly string[] = []): ElectedNotInaugurated =>
  ({ kind: 'NOT_INAUGURATED', id, name, otherNames, electionYear })

const JUNTA_NAMES = ['Junta Provisória', 'Junta Governativa', 'Junta Militar', 'Junta']

/** In chronological order, from the independence (1822) to today. */
export const BRAZILIAN_RULERS: readonly BrazilianRuler[] = [
  // Empire
  governed('pedro-1', 'Dom Pedro I', '1822-09-07', '1831-04-07',
    ['D. Pedro I', 'D Pedro I', 'Pedro I', 'Dom Pedro 1', 'Pedro 1', 'Dom Pedro Primeiro', 'Pedro Primeiro']),
  governed('regency-provisional', 'Regência Trina Provisória', '1831-04-07', '1831-06-17',
    ['Regência Provisória']),
  governed('regency-permanent', 'Regência Trina Permanente', '1831-06-17', '1835-10-12',
    ['Regência Permanente']),
  governed('regency-feijo', 'Diogo Feijó', '1835-10-12', '1837-09-19',
    ['Feijó', 'Padre Feijó', 'Diogo Antônio Feijó', 'Regência de Feijó', 'Regência Una de Feijó']),
  governed('regency-araujo-lima', 'Araújo Lima', '1837-09-19', '1840-07-23',
    ['Pedro de Araújo Lima', 'Marquês de Olinda', 'Regência de Araújo Lima', 'Regência Una de Araújo Lima']),
  governed('pedro-2', 'Dom Pedro II', '1840-07-23', '1889-11-15',
    ['D. Pedro II', 'D Pedro II', 'Pedro II', 'Dom Pedro 2', 'Pedro 2', 'Dom Pedro Segundo', 'Pedro Segundo']),

  // Old Republic
  governed('deodoro', 'Deodoro da Fonseca', '1889-11-15', '1891-11-23', ['Deodoro', 'Marechal Deodoro']),
  governed('floriano', 'Floriano Peixoto', '1891-11-23', '1894-11-15', ['Floriano', 'Marechal Floriano']),
  governed('prudente', 'Prudente de Morais', '1894-11-15', '1898-11-15', ['Prudente']),
  governed('campos-sales', 'Campos Sales', '1898-11-15', '1902-11-15'),
  governed('rodrigues-alves', 'Rodrigues Alves', '1902-11-15', '1906-11-15'),
  governed('afonso-pena', 'Afonso Pena', '1906-11-15', '1909-06-14'),
  governed('nilo-pecanha', 'Nilo Peçanha', '1909-06-14', '1910-11-15', ['Nilo']),
  governed('hermes', 'Hermes da Fonseca', '1910-11-15', '1914-11-15', ['Hermes', 'Marechal Hermes']),
  governed('venceslau', 'Venceslau Brás', '1914-11-15', '1918-11-15', ['Venceslau', 'Wenceslau Braz', 'Venceslau Braz']),
  notInaugurated('rodrigues-alves-1918', 'Rodrigues Alves', 1918),
  governed('delfim', 'Delfim Moreira', '1918-11-15', '1919-07-28', ['Delfim']),
  governed('epitacio', 'Epitácio Pessoa', '1919-07-28', '1922-11-15', ['Epitácio']),
  governed('bernardes', 'Artur Bernardes', '1922-11-15', '1926-11-15', ['Bernardes', 'Arthur Bernardes']),
  governed('washington-luis', 'Washington Luís', '1926-11-15', '1930-10-24', ['Washington Luiz']),
  notInaugurated('julio-prestes', 'Júlio Prestes', 1930, ['Prestes']),
  governed('junta-1930', 'Junta Governativa Provisória', '1930-10-24', '1930-11-03', JUNTA_NAMES),

  // Vargas Era and the 1946 Republic
  governed('vargas-1', 'Getúlio Vargas', '1930-11-03', '1945-10-29', ['Getúlio', 'Vargas']),
  governed('linhares', 'José Linhares', '1945-10-29', '1946-01-31', ['Linhares']),
  governed('dutra', 'Eurico Gaspar Dutra', '1946-01-31', '1951-01-31', ['Dutra', 'Eurico Dutra']),
  governed('vargas-2', 'Getúlio Vargas', '1951-01-31', '1954-08-24', ['Getúlio', 'Vargas']),
  governed('cafe-filho', 'Café Filho', '1954-08-24', '1955-11-08'),
  governed('carlos-luz', 'Carlos Luz', '1955-11-08', '1955-11-11'),
  governed('nereu-ramos', 'Nereu Ramos', '1955-11-11', '1956-01-31', ['Nereu']),
  governed('jk', 'Juscelino Kubitschek', '1956-01-31', '1961-01-31', ['Juscelino', 'JK', 'Kubitschek']),
  governed('janio', 'Jânio Quadros', '1961-01-31', '1961-08-25', ['Jânio']),
  governed('mazzilli-1', 'Ranieri Mazzilli', '1961-08-25', '1961-09-07', ['Mazzilli']),
  governed('jango', 'João Goulart', '1961-09-07', '1964-04-02', ['Jango', 'Goulart']),
  governed('mazzilli-2', 'Ranieri Mazzilli', '1964-04-02', '1964-04-15', ['Mazzilli']),

  // Military dictatorship
  governed('castelo-branco', 'Castelo Branco', '1964-04-15', '1967-03-15',
    ['Castello Branco', 'Humberto Castelo Branco']),
  governed('costa-e-silva', 'Costa e Silva', '1967-03-15', '1969-08-31', ['Artur da Costa e Silva']),
  governed('junta-1969', 'Junta Governativa Provisória', '1969-08-31', '1969-10-30', JUNTA_NAMES),
  governed('medici', 'Emílio Médici', '1969-10-30', '1974-03-15', ['Médici', 'Garrastazu Médici', 'Emílio Garrastazu Médici']),
  governed('geisel', 'Ernesto Geisel', '1974-03-15', '1979-03-15', ['Geisel']),
  governed('figueiredo', 'João Figueiredo', '1979-03-15', '1985-03-15', ['Figueiredo', 'João Baptista Figueiredo']),

  // New Republic
  notInaugurated('tancredo', 'Tancredo Neves', 1985, ['Tancredo']),
  governed('sarney', 'José Sarney', '1985-03-15', '1990-03-15', ['Sarney']),
  governed('collor', 'Fernando Collor', '1990-03-15', '1992-10-02', ['Collor', 'Fernando Collor de Mello']),
  governed('itamar', 'Itamar Franco', '1992-10-02', '1995-01-01', ['Itamar']),
  governed('fhc', 'Fernando Henrique Cardoso', '1995-01-01', '2003-01-01', ['FHC', 'Fernando Henrique']),
  governed('lula-1', 'Lula', '2003-01-01', '2011-01-01', ['Luiz Inácio Lula da Silva', 'Lula da Silva', 'Luís Inácio Lula da Silva']),
  governed('dilma', 'Dilma Rousseff', '2011-01-01', '2016-08-31', ['Dilma']),
  governed('temer', 'Michel Temer', '2016-08-31', '2019-01-01', ['Temer']),
  governed('bolsonaro', 'Jair Bolsonaro', '2019-01-01', '2023-01-01', ['Bolsonaro']),
  governed('lula-2', 'Lula', '2023-01-01', null, ['Luiz Inácio Lula da Silva', 'Lula da Silva', 'Luís Inácio Lula da Silva']),
]
