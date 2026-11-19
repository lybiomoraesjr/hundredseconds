-- The rulers game became one time trial per era (answer every ruler, ties broken by the shortest time).
-- Results of the previous 100 second version are not comparable, so they are removed.
DELETE FROM game_scores WHERE game_mode = 'BRAZIL_RULERS';

ALTER TABLE game_scores
    ADD COLUMN duration_ms INTEGER,
    ADD CONSTRAINT chk_game_scores_duration CHECK (duration_ms IS NULL OR duration_ms > 0),
    DROP CONSTRAINT chk_game_scores_game_mode,
    ADD CONSTRAINT chk_game_scores_game_mode
        CHECK (game_mode IN ('EXPONENTIATION', 'ROOT_EXTRACTION', 'STATE_FLAGS', 'STATE_ABBREVIATIONS',
                             'STATE_CAPITALS', 'CAPITAL_DEMONYMS', 'STATE_MAP', 'STATE_DEMONYMS',
                             'RULERS_EMPIRE', 'RULERS_OLD_REPUBLIC', 'RULERS_VARGAS_ERA', 'RULERS_MILITARY',
                             'RULERS_NEW_REPUBLIC', 'RULERS_ALL'));
