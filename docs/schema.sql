-- Music Catalog Insights Platform — PostgreSQL schema
-- (Also auto-created by Hibernate ddl-auto=update on first boot; kept here
--  for reference and for manual provisioning on managed DB hosts.)

CREATE TABLE IF NOT EXISTS app_user (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    display_name    VARCHAR(100) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS library_item (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    apple_catalog_id  BIGINT NOT NULL,
    title             VARCHAR(500) NOT NULL,
    artist_name       VARCHAR(500) NOT NULL,
    genre             VARCHAR(200),
    release_date      DATE,
    track_count       INTEGER,
    artwork_url       VARCHAR(1024),
    collection_price  DOUBLE PRECISION,
    user_rating       INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_notes        VARCHAR(2000),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, apple_catalog_id)
);

CREATE INDEX IF NOT EXISTS idx_library_item_user  ON library_item(user_id);
CREATE INDEX IF NOT EXISTS idx_library_item_genre ON library_item(genre);
