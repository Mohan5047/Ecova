-- ====================================================
-- ECOVA DATABASE SCHEMA (PostgreSQL)
-- ====================================================

-- Enable pgcrypto for UUID generation if needed (gen_random_uuid is built-in in PostgreSQL 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if re-creating
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS authority_assignments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS report_actions CASCADE;
DROP TABLE IF EXISTS report_status_history CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP SEQUENCE IF EXISTS report_code_seq CASCADE;

-- ----------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    phone VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CITIZEN' CHECK (role IN ('CITIZEN', 'AUTHORITY', 'ADMIN')),
    profile_image TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- 2. CATEGORIES TABLE
-- ----------------------------------------------------
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- SEQUENCE FOR COLLISION-SAFE REPORT CODES
-- ----------------------------------------------------
CREATE SEQUENCE report_code_seq START WITH 100001;

-- ----------------------------------------------------
-- 3. REPORTS TABLE
-- ----------------------------------------------------
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    report_code VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    address VARCHAR(255),
    photo_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'ACTION_TAKEN', 'RESOLVED', 'REJECTED')),
    authority_id UUID REFERENCES users(id) ON DELETE SET NULL,
    upvotes INT NOT NULL DEFAULT 0,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ----------------------------------------------------
-- 4. REPORT STATUS HISTORY TABLE
-- ----------------------------------------------------
CREATE TABLE report_status_history (
    id SERIAL PRIMARY KEY,
    report_id INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'ACTION_TAKEN', 'RESOLVED', 'REJECTED')),
    note TEXT,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- 5. REPORT ACTIONS TABLE
-- ----------------------------------------------------
CREATE TABLE report_actions (
    id SERIAL PRIMARY KEY,
    report_id INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    authority_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- 6. NOTIFICATIONS TABLE
-- ----------------------------------------------------
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'INFO' CHECK (type IN ('INFO', 'STATUS_UPDATE', 'ACTION', 'RESOLVED', 'SYSTEM')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- 7. AUTHORITY ASSIGNMENTS TABLE
-- ----------------------------------------------------
CREATE TABLE authority_assignments (
    id SERIAL PRIMARY KEY,
    report_id INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    authority_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- 8. ACTIVITY LOGS TABLE
-- ----------------------------------------------------
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- 9. REPORT UPVOTES TABLE (Community Endorsement)
-- ----------------------------------------------------
CREATE TABLE report_upvotes (
    id SERIAL PRIMARY KEY,
    report_id INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (report_id, user_id)
);

-- ----------------------------------------------------
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ----------------------------------------------------
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_reports_code ON reports(report_code);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_category_id ON reports(category_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_authority_id ON reports(authority_id);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_status_history_report_id ON report_status_history(report_id, created_at ASC);
CREATE INDEX idx_actions_report_id ON report_actions(report_id, created_at DESC);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
