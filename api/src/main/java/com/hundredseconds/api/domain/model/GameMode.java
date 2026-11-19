package com.hundredseconds.api.domain.model;

/**
 * Game modes available to the player. Rankings are kept separately per mode.
 */
public enum GameMode {
	EXPONENTIATION(false),
	ROOT_EXTRACTION(false),
	/** Guess the Brazilian state from its flag. */
	STATE_FLAGS(false),
	/** Type the abbreviation of a Brazilian state. */
	STATE_ABBREVIATIONS(false),
	/** Type the capital of a Brazilian state. */
	STATE_CAPITALS(false),
	/** Type the demonym of a Brazilian state capital. */
	CAPITAL_DEMONYMS(false),
	/** Name the Brazilian state highlighted on the map. */
	STATE_MAP(false),
	/** Type the demonym of a Brazilian state. */
	STATE_DEMONYMS(false),
	/** Who governed Brazil: Empire and regencies (1822-1889). */
	RULERS_EMPIRE(true),
	/** Who governed Brazil: Old Republic (1889-1930). */
	RULERS_OLD_REPUBLIC(true),
	/** Who governed Brazil: Vargas Era and the 1946 Republic (1930-1964). */
	RULERS_VARGAS_ERA(true),
	/** Who governed Brazil: military dictatorship (1964-1985). */
	RULERS_MILITARY(true),
	/** Who governed Brazil: New Republic (1985-today). */
	RULERS_NEW_REPUBLIC(true),
	/** Who governed Brazil: every ruler since the independence. */
	RULERS_ALL(true);

	private final boolean timeTrial;

	GameMode(boolean timeTrial) {
		this.timeTrial = timeTrial;
	}

	/**
	 * Time trial: the player answers every question with no time limit, and ties are broken by the shortest
	 * duration. The other modes last a fixed 100 seconds.
	 */
	public boolean isTimeTrial() {
		return timeTrial;
	}
}
