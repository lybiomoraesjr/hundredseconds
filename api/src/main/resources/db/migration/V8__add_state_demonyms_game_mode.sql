-- New game mode: type the demonym of a Brazilian state
ALTER TABLE game_scores
    DROP CONSTRAINT chk_game_scores_game_mode,
    ADD CONSTRAINT chk_game_scores_game_mode
        CHECK (game_mode IN ('EXPONENTIATION', 'ROOT_EXTRACTION', 'STATE_FLAGS', 'STATE_ABBREVIATIONS',
                             'STATE_CAPITALS', 'CAPITAL_DEMONYMS', 'STATE_MAP', 'STATE_DEMONYMS'));
