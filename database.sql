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
    PRIMARY KEY (player_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id),
    FOREIGN KEY (player_user) REFERENCES users(user_id)
);

CREATE TABLE matches(
    match_id SERIAL,
    group_id SERIAL,
    match_date DATE,
    match_numofteams INTEGER,
    match_playersperteam INTEGER,
    match_status BOOLEAN,
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

--fake users data

insert into users (user_name, user_email, user_password) values ('joao','joao@joao.com','senhaJoao123');

insert into groups (user_id, group_name) values ('04b941bc-843d-4aec-8ce8-5896b71e2758','Fut Fosfertil');