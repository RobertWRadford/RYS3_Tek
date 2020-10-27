CREATE TABLE IF EXISTS savedGames;

CREATE TABLE savedGames (
    id SERIAL PRIMARY KEY,
    title VARCHAR (255),
    publisher VARCHAR (255),
    description TEXT,
    image_url VARCHAR (255),
    tag VARCHAR (255),
    genre VARCHAR (255),
    platform VARCHAR (255)
)