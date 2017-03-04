CREATE SEQUENCE user_ids;
CREATE TABLE users (
    provider_id VARCHAR(120) PRIMARY KEY,
    name VARCHAR(64),
    photo VARCHAR(200),
    geo_location VARCHAR(200),
    auth_tocken VARCHAR(64));

CREATE TABLE groups(
    id INTEGER PRIMARY KEY DEFAULT NEXTVAL('user_ids'),
    name VARCHAR(64),
    group_user VARCHAR(120) references users(provider_id) 
); 

CREATE TABLE bubbles(
    id INTEGER PRIMARY KEY DEFAULT NEXTVAL('user_ids'),
    text VARCHAR(500),
    authour VARCHAR(120) references users(provider_id),
    group_id INTEGER references grops(id),
    date DATE

);