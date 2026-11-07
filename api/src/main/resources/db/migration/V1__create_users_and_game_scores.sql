-- Registered players
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Finished matches (user_id is NULL for guest players)
CREATE TABLE game_scores (
    id           BIGSERIAL   PRIMARY KEY,
    user_id      UUID        REFERENCES users (id) ON DELETE SET NULL,
    player_name  VARCHAR(50) NOT NULL,
    game_mode    VARCHAR(20) NOT NULL,
    score        INTEGER     NOT NULL,
    stars_earned INTEGER     NOT NULL,
    played_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_game_scores_game_mode CHECK (game_mode IN ('EXPONENTIATION', 'ROOT_EXTRACTION')),
    CONSTRAINT chk_game_scores_score CHECK (score >= 0),
    CONSTRAINT chk_game_scores_stars CHECK (stars_earned BETWEEN 0 AND 10)
);

-- Speeds up leaderboard queries filtered by mode and period
CREATE INDEX idx_scores_mode_date ON game_scores (game_mode, played_at DESC, score DESC);

-- Speeds up personal best / personal history queries
CREATE INDEX idx_scores_user_mode ON game_scores (user_id, game_mode, score DESC);
