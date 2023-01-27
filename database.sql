CREATE DATABASE futsort;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users(
    user_id UUID DEFAULT UUID_generate_v4(),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    PRIMARY KEY(user_id)
);

CREATE TABLE groups(
    group_id SERIAL,
    user_id UUID,
    group_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (group_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE players(
    player_id SERIAL,
    group_id SERIAL,
    player_name VARCHAR(255) NOT NULL,
    player_stars INTEGER,
    player_goals INTEGER,
    player_assists INTEGER,
    player_matches INTEGER,
    player_user UUID,
    mvp_GK INTEGER,
    mvp_DF INTEGER,
    mvp_AT INTEGER,
    PRIMARY KEY (player_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id),
    FOREIGN KEY (player_user) REFERENCES users(user_id)
);

CREATE TABLE seasons(
    season_id SERIAL,
    season_group_id INTEGER NOT NULL,
    season_player_id SERIAL NOT NULL,
    season_player_name VARCHAR(255) NOT NULL,
    season_year INTEGER NOT NULL,
    season_goals INTEGER NOT NULL,
    season_assists INTEGER NOT NULL,
    season_matches INTEGER NOT NULL,
    season_score REAL NOT NULL,
    PRIMARY KEY (season_id),
    FOREIGN KEY (season_player_id) REFERENCES players(player_id),
    FOREIGN KEY (season_group_id) REFERENCES groups(group_id)
);

CREATE TABLE matches(
    match_id SERIAL,
    group_id SERIAL,
    match_date DATE,
    match_numofteams INTEGER,
    match_playersperteam INTEGER,
    match_status VARCHAR(255),
    PRIMARY KEY (match_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id)
);

CREATE TABLE matches_players(
    matchplayer_id SERIAL,
    match_id INTEGER,
    player_id INTEGER,
    match_player_goals INTEGER,
    match_player_assists INTEGER,
    match_player_goalkeeper BOOLEAN,
    match_player_team INTEGER,
    match_mvp_GK INTEGER,
    match_mvp_DF INTEGER,
    match_mvp_AT INTEGER,
    match_player_voted BOOLEAN,
    PRIMARY KEY (matchplayer_id),
    FOREIGN KEY (match_id) REFERENCES matches(match_id),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
);

CREATE TABLE requests(
    request_id SERIAL NOT NULL,
    request_status VARCHAR(255) NOT NULL,
    request_user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    group_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    PRIMARY KEY (request_id),
    FOREIGN KEY (request_user_id) REFERENCES users(user_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
);

CREATE TABLE password_resets(
    reset_id UUID DEFAULT UUID_generate_v4(),
    reset_email VARCHAR(255) NOT NULL,
    reset_user_id UUID NOT NULL,
    reset_expiration TIMESTAMPTZ NOT NULL,
    PRIMARY KEY(reset_id)
    FOREIGN KEY(reset_email) REFERENCES users(user_email),
    FOREIGN KEY(reset_user_id) REFERENCES users(user_id)
);

CREATE TABLE votes(
    vote_id UUID DEFAULT UUID_generate_v4(),
    user_id UUID NOT NULL,
    match_id INTEGER NOT NULL,
    mvp_GK INTEGER,
    mvp_DF INTEGER,
    mvp_AT INTEGER,
    PRIMARY KEY(vote_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(match_id) REFERENCES matches(match_id)
);

--fake users data

insert into users (user_name, user_email, user_password) values ('joao','joao@joao.com','senhaJoao123');

insert into groups (user_id, group_name) values ('04b941bc-843d-4aec-8ce8-5896b71e2758','Fut Fosfertil');