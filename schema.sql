-- creates the whole database (tables)
USE iv_project;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id int PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE, 
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL
);

INSERT INTO users (username, password_hash, name) VALUES ('test', 'test1234', 'Test Person');