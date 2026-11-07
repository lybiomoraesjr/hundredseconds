-- Number of wrong answers submitted during the match (a question can produce up to 2)
ALTER TABLE game_scores
    ADD COLUMN wrong_answers INTEGER NOT NULL DEFAULT 0,
    ADD CONSTRAINT chk_game_scores_wrong_answers CHECK (wrong_answers >= 0);
