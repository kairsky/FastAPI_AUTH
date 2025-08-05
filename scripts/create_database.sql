-- Create database and user
CREATE DATABASE fastapi_auth;
CREATE USER fastapi_user WITH ENCRYPTED PASSWORD 'nurabi12';
GRANT ALL PRIVILEGES ON DATABASE fastapi_auth TO fastapi_user;

-- Connect to the database
\c fastapi_auth;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO fastapi_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fastapi_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fastapi_user;

-- Create tables (these will be created automatically by SQLAlchemy, but here's the schema for reference)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
