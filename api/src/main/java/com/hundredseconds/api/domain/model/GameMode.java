package com.hundredseconds.api.domain.model;

/**
 * Game modes available to the player. Rankings are kept separately per mode.
 */
public enum GameMode {
	EXPONENTIATION,
	ROOT_EXTRACTION,
	/** Guess the Brazilian state from its flag. */
	STATE_FLAGS,
	/** Type the abbreviation of a Brazilian state. */
	STATE_ABBREVIATIONS,
	/** Type the capital of a Brazilian state. */
	STATE_CAPITALS,
	/** Type the demonym of a Brazilian state capital. */
	CAPITAL_DEMONYMS,
	/** Name the Brazilian state highlighted on the map. */
	STATE_MAP
}
