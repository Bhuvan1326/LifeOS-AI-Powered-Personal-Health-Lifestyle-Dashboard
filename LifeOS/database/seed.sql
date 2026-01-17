-- LifeOS Sample Seed Data
-- Demo user password is 'demo123' (hashed with bcrypt)

-- Insert demo user
INSERT INTO users (email, username, hashed_password, full_name)
VALUES ('demo@lifeos.com', 'demo', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X3.AQ9O1GcBvqpGCm', 'Demo User')
ON CONFLICT (email) DO NOTHING;
