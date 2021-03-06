DROP TABLE IF EXISTS games;

CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    slug varchar(255),
    image_url VARCHAR(255),
    rating VARCHAR(255),
    ratingCount VARCHAR(255),
    platforms VARCHAR(255),
    parent_platforms VARCHAR(255),
    genres VARCHAR(255),
    preview VARCHAR(255),
    trailer VARCHAR(255),
    filters VARCHAR,
    description VARCHAR
);
