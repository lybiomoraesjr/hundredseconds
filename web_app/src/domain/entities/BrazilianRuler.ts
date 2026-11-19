/** Periods of Brazilian history; each one is a separate quiz (and ranking). */
export const RulerEra = {
  EMPIRE: 'EMPIRE',
  OLD_REPUBLIC: 'OLD_REPUBLIC',
  VARGAS_ERA: 'VARGAS_ERA',
  MILITARY: 'MILITARY',
  NEW_REPUBLIC: 'NEW_REPUBLIC',
} as const

export type RulerEra = (typeof RulerEra)[keyof typeof RulerEra]

/**
 * Someone (or a group, like a regency or a junta) who led Brazil since the independence,
 * or a president elected who never took office.
 */
export type BrazilianRuler = GoverningRuler | ElectedNotInaugurated

interface RulerBase {
  /** Unique per period: the same person can govern twice (Vargas, Lula, Mazzilli). */
  readonly id: string
  readonly name: string
  readonly era: RulerEra
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

type WithoutEra<T> = T extends unknown ? Omit<T, 'era'> : never

const governed = (id: string, name: string, start: string, end: string | null): WithoutEra<GoverningRuler> =>
  ({ kind: 'GOVERNED', id, name, start, end })

const notInaugurated = (id: string, name: string, electionYear: number): WithoutEra<ElectedNotInaugurated> =>
  ({ kind: 'NOT_INAUGURATED', id, name, electionYear })

const inEra = (era: RulerEra, rulers: ReadonlyArray<WithoutEra<BrazilianRuler>>): BrazilianRuler[] =>
  rulers.map((ruler) => ({ ...ruler, era }) as BrazilianRuler)

/** In chronological order, from the independence (1822) to today. */
export const BRAZILIAN_RULERS: readonly BrazilianRuler[] = [
  // Empire and regencies (1822-1889)
  ...inEra(RulerEra.EMPIRE, [
    governed('pedro-1', 'Dom Pedro I', '1822-09-07', '1831-04-07'),
    governed('regency-provisional', 'Regência Trina Provisória', '1831-04-07', '1831-06-17'),
    governed('regency-permanent', 'Regência Trina Permanente', '1831-06-17', '1835-10-12'),
    governed('regency-feijo', 'Diogo Feijó', '1835-10-12', '1837-09-19'),
    governed('regency-araujo-lima', 'Araújo Lima', '1837-09-19', '1840-07-23'),
    governed('pedro-2', 'Dom Pedro II', '1840-07-23', '1889-11-15'),
  ]),

  // Old Republic (1889-1930)
  ...inEra(RulerEra.OLD_REPUBLIC, [
    governed('deodoro', 'Deodoro da Fonseca', '1889-11-15', '1891-11-23'),
    governed('floriano', 'Floriano Peixoto', '1891-11-23', '1894-11-15'),
    governed('prudente', 'Prudente de Morais', '1894-11-15', '1898-11-15'),
    governed('campos-sales', 'Campos Sales', '1898-11-15', '1902-11-15'),
    governed('rodrigues-alves', 'Rodrigues Alves', '1902-11-15', '1906-11-15'),
    governed('afonso-pena', 'Afonso Pena', '1906-11-15', '1909-06-14'),
    governed('nilo-pecanha', 'Nilo Peçanha', '1909-06-14', '1910-11-15'),
    governed('hermes', 'Hermes da Fonseca', '1910-11-15', '1914-11-15'),
    governed('venceslau', 'Venceslau Brás', '1914-11-15', '1918-11-15'),
    notInaugurated('rodrigues-alves-1918', 'Rodrigues Alves', 1918),
    governed('delfim', 'Delfim Moreira', '1918-11-15', '1919-07-28'),
    governed('epitacio', 'Epitácio Pessoa', '1919-07-28', '1922-11-15'),
    governed('bernardes', 'Artur Bernardes', '1922-11-15', '1926-11-15'),
    governed('washington-luis', 'Washington Luís', '1926-11-15', '1930-10-24'),
    notInaugurated('julio-prestes', 'Júlio Prestes', 1930),
    governed('junta-1930', 'Junta Governativa Provisória', '1930-10-24', '1930-11-03'),
  ]),

  // Vargas Era and the 1946 Republic (1930-1964)
  ...inEra(RulerEra.VARGAS_ERA, [
    governed('vargas-1', 'Getúlio Vargas', '1930-11-03', '1945-10-29'),
    governed('linhares', 'José Linhares', '1945-10-29', '1946-01-31'),
    governed('dutra', 'Eurico Gaspar Dutra', '1946-01-31', '1951-01-31'),
    governed('vargas-2', 'Getúlio Vargas', '1951-01-31', '1954-08-24'),
    governed('cafe-filho', 'Café Filho', '1954-08-24', '1955-11-08'),
    governed('carlos-luz', 'Carlos Luz', '1955-11-08', '1955-11-11'),
    governed('nereu-ramos', 'Nereu Ramos', '1955-11-11', '1956-01-31'),
    governed('jk', 'Juscelino Kubitschek', '1956-01-31', '1961-01-31'),
    governed('janio', 'Jânio Quadros', '1961-01-31', '1961-08-25'),
    governed('mazzilli-1', 'Ranieri Mazzilli', '1961-08-25', '1961-09-07'),
    governed('jango', 'João Goulart', '1961-09-07', '1964-04-02'),
    governed('mazzilli-2', 'Ranieri Mazzilli', '1964-04-02', '1964-04-15'),
  ]),

  // Military dictatorship (1964-1985)
  ...inEra(RulerEra.MILITARY, [
    governed('castelo-branco', 'Castelo Branco', '1964-04-15', '1967-03-15'),
    governed('costa-e-silva', 'Costa e Silva', '1967-03-15', '1969-08-31'),
    governed('junta-1969', 'Junta Governativa Provisória', '1969-08-31', '1969-10-30'),
    governed('medici', 'Emílio Médici', '1969-10-30', '1974-03-15'),
    governed('geisel', 'Ernesto Geisel', '1974-03-15', '1979-03-15'),
    governed('figueiredo', 'João Figueiredo', '1979-03-15', '1985-03-15'),
  ]),

  // New Republic (1985-today)
  ...inEra(RulerEra.NEW_REPUBLIC, [
    notInaugurated('tancredo', 'Tancredo Neves', 1985),
    governed('sarney', 'José Sarney', '1985-03-15', '1990-03-15'),
    governed('collor', 'Fernando Collor', '1990-03-15', '1992-10-02'),
    governed('itamar', 'Itamar Franco', '1992-10-02', '1995-01-01'),
    governed('fhc', 'Fernando Henrique Cardoso', '1995-01-01', '2003-01-01'),
    governed('lula-1', 'Lula', '2003-01-01', '2011-01-01'),
    governed('dilma', 'Dilma Rousseff', '2011-01-01', '2016-08-31'),
    governed('temer', 'Michel Temer', '2016-08-31', '2019-01-01'),
    governed('bolsonaro', 'Jair Bolsonaro', '2019-01-01', '2023-01-01'),
    governed('lula-2', 'Lula', '2023-01-01', null),
  ]),
]
