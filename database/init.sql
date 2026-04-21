-- InsightForge Database Initialization Script
-- Creates the database schema and initial data

-- Enable UUID extension if using PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Datasets table
CREATE TABLE IF NOT EXISTS datasets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    columns JSONB,
    row_count INTEGER NOT NULL,
    column_count INTEGER NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for datasets
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON datasets(created_at);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
    analysis_type VARCHAR(100) NOT NULL,
    parameters JSONB,
    results JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    execution_time FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for analyses
CREATE INDEX IF NOT EXISTS idx_analyses_dataset_id ON analyses(dataset_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_analyses_analysis_type ON analyses(analysis_type);

-- Insights table
CREATE TABLE IF NOT EXISTS insights (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    confidence_score FLOAT DEFAULT 0.0,
    priority VARCHAR(50),
    tags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for insights
CREATE INDEX IF NOT EXISTS idx_insights_dataset_id ON insights(dataset_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON insights(created_at);
CREATE INDEX IF NOT EXISTS idx_insights_confidence_score ON insights(confidence_score);

-- Cache table for performance optimization
CREATE TABLE IF NOT EXISTS cache (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for cache
CREATE INDEX IF NOT EXISTS idx_cache_key ON cache(key);
CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_datasets_updated_at ON datasets;
CREATE TRIGGER update_datasets_updated_at
    BEFORE UPDATE ON datasets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up old cache entries
CREATE OR REPLACE FUNCTION cleanup_old_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM cache WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ language 'plpgsql';

-- Create view for dataset statistics
CREATE OR REPLACE VIEW dataset_statistics AS
SELECT 
    d.id,
    d.name,
    d.row_count,
    d.column_count,
    d.created_at,
    COUNT(DISTINCT a.id) as analysis_count,
    COUNT(DISTINCT i.id) as insight_count,
    MAX(a.created_at) as last_analysis_date
FROM datasets d
LEFT JOIN analyses a ON d.id = a.dataset_id
LEFT JOIN insights i ON d.id = i.dataset_id
GROUP BY d.id, d.name, d.row_count, d.column_count, d.created_at;

-- Create view for user activity
CREATE OR REPLACE VIEW user_activity AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.created_at as joined_date,
    COUNT(DISTINCT d.id) as dataset_count,
    COUNT(DISTINCT a.id) as analysis_count,
    COUNT(DISTINCT i.id) as insight_count,
    MAX(d.created_at) as last_upload_date
FROM users u
LEFT JOIN datasets d ON u.id = d.user_id
LEFT JOIN analyses a ON d.id = a.dataset_id
LEFT JOIN insights i ON u.id = i.user_id
GROUP BY u.id, u.email, u.full_name, u.created_at;

-- Insert initial admin user (password: Admin123!)
INSERT INTO users (email, full_name, hashed_password, is_active)
VALUES ('admin@insightforge.com', 'System Administrator', 
        '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
        TRUE)
ON CONFLICT (email) DO NOTHING;

-- Create comments for documentation
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE datasets IS 'Stores uploaded dataset metadata';
COMMENT ON TABLE analyses IS 'Stores analysis results for datasets';
COMMENT ON TABLE insights IS 'Stores AI-generated insights and predictions';
COMMENT ON TABLE cache IS 'Cache table for performance optimization';

COMMENT ON COLUMN users.hashed_password IS 'BCrypt hashed password';
COMMENT ON COLUMN datasets.file_path IS 'Path to the uploaded file on server';
COMMENT ON COLUMN datasets.metadata IS 'JSON containing dataset metadata and statistics';
COMMENT ON COLUMN analyses.results IS 'JSON containing analysis results';
COMMENT ON COLUMN insights.content IS 'JSON containing insight details and findings';

-- Grant permissions (adjust based on your database user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO insightforge_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO insightforge_user;