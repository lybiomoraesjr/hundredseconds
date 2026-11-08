-- New game mode: guess the Brazilian state from its flag
ALTER TABLE game_scores
    DROP CONSTRAINT chk_game_scores_game_mode,
    ADD CONSTRAINT chk_game_scores_game_mode CHECK (game_mode IN ('EXPONENTIATION', 'ROOT_EXTRACTION', 'STATE_FLAGS'));
