-- LifeOS Database Schema
-- PostgreSQL Schema for Health & Lifestyle Management

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Habits Table
CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50) DEFAULT 'daily',
    target_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habit Logs Table
CREATE TABLE IF NOT EXISTS habit_logs (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER NOT NULL REFERENCES habits(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    completed_at DATE NOT NULL,
    count INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mood Entries Table
CREATE TABLE IF NOT EXISTS mood_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
    energy_level INTEGER DEFAULT 5 CHECK (energy_level >= 1 AND energy_level <= 10),
    stress_level INTEGER DEFAULT 5 CHECK (stress_level >= 1 AND stress_level <= 10),
    sleep_hours INTEGER,
    notes TEXT,
    logged_at DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    content TEXT NOT NULL,
    mood_id INTEGER REFERENCES mood_entries(id),
    tags VARCHAR(255),
    logged_at DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Food Logs Table
CREATE TABLE IF NOT EXISTS food_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    food_name VARCHAR(255) NOT NULL,
    meal_type VARCHAR(50) DEFAULT 'snack',
    calories DECIMAL(10,2) DEFAULT 0,
    protein DECIMAL(10,2) DEFAULT 0,
    carbs DECIMAL(10,2) DEFAULT 0,
    fat DECIMAL(10,2) DEFAULT 0,
    fiber DECIMAL(10,2) DEFAULT 0,
    serving_size VARCHAR(100),
    logged_at DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Water Logs Table
CREATE TABLE IF NOT EXISTS water_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount_ml INTEGER NOT NULL,
    logged_at DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Nutrition Goals Table
CREATE TABLE IF NOT EXISTS nutrition_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    daily_calories INTEGER DEFAULT 2000,
    daily_protein INTEGER DEFAULT 50,
    daily_carbs INTEGER DEFAULT 250,
    daily_fat INTEGER DEFAULT 65,
    daily_water_ml INTEGER DEFAULT 2000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Transactions Table (Finance)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    category VARCHAR(100) NOT NULL,
    monthly_limit DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Financial Goals Table
CREATE TABLE IF NOT EXISTS financial_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    deadline DATE,
    is_achieved INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Life Scores Table
CREATE TABLE IF NOT EXISTS life_scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    habit_score DECIMAL(5,2) DEFAULT 0,
    nutrition_score DECIMAL(5,2) DEFAULT 0,
    mood_score DECIMAL(5,2) DEFAULT 0,
    finance_score DECIMAL(5,2) DEFAULT 0,
    consistency_score DECIMAL(5,2) DEFAULT 0,
    total_score DECIMAL(5,2) DEFAULT 0,
    calculated_at DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Insights Table
CREATE TABLE IF NOT EXISTS ai_insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    category VARCHAR(50) NOT NULL,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    is_read INTEGER DEFAULT 0,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_user ON food_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_life_scores_user ON life_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user ON ai_insights(user_id);
