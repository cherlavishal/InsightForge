-- InsightForge Database Schema
-- This file contains the complete database schema definition

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS cache;
DROP TABLE IF EXISTS insights;
DROP TABLE IF EXISTS analyses;
DROP TABLE IF EXISTS datasets;
DROP TABLE IF EXISTS users;

-- Drop views
DROP VIEW IF EXISTS user_activity;
DROP VIEW IF EXISTS dataset_statistics;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS cleanup_old_cache();

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Datasets Table
CREATE TABLE datasets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    columns JSONB,
    row_count INTEGER NOT NULL CHECK (row_count >= 0),
    column_count INTEGER NOT NULL CHECK (column_count > 0),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT valid_file_size CHECK (file_size < 10737418240) -- 10GB max
);

-- Analyses Table
CREATE TABLE analyses (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER NOT NULL,
    analysis_type VARCHAR(100) NOT NULL,
    parameters JSONB,
    results JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    execution_time FLOAT CHECK (execution_time >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Insights Table
CREATE TABLE insights (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    insight_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    confidence_score FLOAT DEFAULT 0.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    priority VARCHAR(50),
    tags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT valid_priority CHECK (priority IN ('high', 'medium', 'low', 'critical'))
);

-- Cache Table
CREATE TABLE cache (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Indexes for Datasets
CREATE INDEX idx_datasets_user_id ON datasets(user_id);
CREATE INDEX idx_datasets_created_at ON datasets(created_at);
CREATE INDEX idx_datasets_file_size ON datasets(file_size);
CREATE INDEX idx_datasets_row_count ON datasets(row_count);

-- Indexes for Analyses
CREATE INDEX idx_analyses_dataset_id ON analyses(dataset_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at);
CREATE INDEX idx_analyses_analysis_type ON analyses(analysis_type);
CREATE INDEX idx_analyses_status ON analyses(status);

-- Indexes for Insights
CREATE INDEX idx_insights_dataset_id ON insights(dataset_id);
CREATE INDEX idx_insights_user_id ON insights(user_id);
CREATE INDEX idx_insights_created_at ON insights(created_at);
CREATE INDEX idx_insights_confidence_score ON insights(confidence_score);
CREATE INDEX idx_insights_priority ON insights(priority);
CREATE INDEX idx_insights_insight_type ON insights(insight_type);

-- Indexes for Cache
CREATE INDEX idx_cache_key ON cache(key);
CREATE INDEX idx_cache_expires_at ON cache(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for Datasets table
CREATE TRIGGER update_datasets_updated_at
    BEFORE UPDATE ON datasets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up old cache entries
CREATE OR REPLACE FUNCTION cleanup_old_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM cache WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- View for Dataset Statistics
CREATE VIEW dataset_statistics AS
SELECT 
    d.id,
    d.name,
    d.user_id,
    d.row_count,
    d.column_count,
    d.file_size,
    d.created_at,
    d.updated_at,
    COUNT(DISTINCT a.id) as analysis_count,
    COUNT(DISTINCT i.id) as insight_count,
    MAX(a.created_at) as last_analysis_date,
    AVG(a.execution_time) as avg_analysis_time,
    SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed_analyses,
    SUM(CASE WHEN a.status = 'failed' THEN 1 ELSE 0 END) as failed_analyses
FROM datasets d
LEFT JOIN analyses a ON d.id = a.dataset_id
LEFT JOIN insights i ON d.id = i.dataset_id
GROUP BY d.id, d.name, d.user_id, d.row_count, d.column_count, d.file_size, d.created_at, d.updated_at;

-- View for User Activity
CREATE VIEW user_activity AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.is_active,
    u.created_at as joined_date,
    u.updated_at as last_updated,
    COUNT(DISTINCT d.id) as dataset_count,
    COUNT(DISTINCT a.id) as analysis_count,
    COUNT(DISTINCT i.id) as insight_count,
    MAX(d.created_at) as last_upload_date,
    SUM(d.file_size) as total_storage_used,
    AVG(d.row_count) as avg_dataset_size,
    COUNT(DISTINCT CASE WHEN a.status = 'failed' THEN a.id END) as failed_analyses_count
FROM users u
LEFT JOIN datasets d ON u.id = d.user_id
LEFT JOIN analyses a ON d.id = a.dataset_id
LEFT JOIN insights i ON u.id = i.user_id
GROUP BY u.id, u.email, u.full_name, u.is_active, u.created_at, u.updated_at;

-- View for Analysis Summary
CREATE VIEW analysis_summary AS
SELECT 
    a.id,
    a.dataset_id,
    d.name as dataset_name,
    a.analysis_type,
    a.status,
    a.execution_time,
    a.created_at,
    JSONB_ARRAY_LENGTH(a.results -> 'metrics') as metric_count,
    (a.results -> 'metrics' ->> 'accuracy')::FLOAT as accuracy,
    (a.results -> 'metrics' ->> 'r2_score')::FLOAT as r2_score,
    (a.results -> 'metrics' ->> 'mse')::FLOAT as mse
FROM analyses a
JOIN datasets d ON a.dataset_id = d.id
WHERE a.status = 'completed';

-- Insert default admin user (password: Admin123!)
INSERT INTO users (email, full_name, hashed_password, is_active) 
VALUES (
    'admin@insightforge.com', 
    'System Administrator', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores user account information for the InsightForge platform';
COMMENT ON TABLE datasets IS 'Stores metadata for uploaded datasets including file information and statistics';
COMMENT ON TABLE analyses IS 'Stores results of data analyses performed on datasets';
COMMENT ON TABLE insights IS 'Stores AI-generated insights, predictions, and recommendations';
COMMENT ON TABLE cache IS 'Cache table for storing frequently accessed data to improve performance';

COMMENT ON COLUMN users.hashed_password IS 'BCrypt hashed password for secure authentication';
COMMENT ON COLUMN datasets.file_path IS 'Server file system path where the uploaded dataset is stored';
COMMENT ON COLUMN datasets.metadata IS 'JSON object containing dataset statistics, column information, and preprocessing details';
COMMENT ON COLUMN analyses.results IS 'JSON object containing complete analysis results including metrics, visualizations, and processed data';
COMMENT ON COLUMN insights.content IS 'JSON object containing detailed insight information including findings, explanations, and supporting evidence';
COMMENT ON COLUMN insights.confidence_score IS 'Confidence level of the insight (0.0 to 1.0) based on data quality and model accuracy';

COMMENT ON VIEW dataset_statistics IS 'Aggregated statistics for datasets including analysis and insight counts';
COMMENT ON VIEW user_activity IS 'User activity summary including dataset uploads, analyses, and insights generated';
COMMENT ON VIEW analysis_summary IS 'Summary of completed analyses with key performance metrics';

-- Grant example (adjust for your actual database user)
-- CREATE USER insightforge_user WITH PASSWORD 'securepassword';
-- GRANT CONNECT ON DATABASE insightforge TO insightforge_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO insightforge_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO insightforge_user;