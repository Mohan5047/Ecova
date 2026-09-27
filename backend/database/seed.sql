-- ====================================================
-- ECOVA DATABASE SEED DATA (PostgreSQL)
-- ====================================================

-- ----------------------------------------------------
-- 1. SEED CATEGORIES
-- ----------------------------------------------------
INSERT INTO categories (id, name, description, icon) VALUES
(1, 'Waste & Garbage', 'Illegal waste dumping, overflowing bins, and hazardous garbage accumulation.', 'Recycle'),
(2, 'Water Issue', 'Burst water pipelines, polluted streams, and street waterlogging.', 'Droplets'),
(3, 'Pollution', 'Toxic smoke emissions, open burning, chemical runoff, noise hazards.', 'Leaf'),
(4, 'Nature & Greenery', 'Damaged green spaces, dangling tree branches, and illegal cutting.', 'TreePine'),
(5, 'Public Surroundings', 'Damaged footpaths, broken stormwater drain slabs, street hazards.', 'Building'),
(6, 'Other', 'Other civic and environmental concerns needing municipal attention.', 'AlertTriangle')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------
-- 2. SEED USERS
-- Password for Admin: Admin@123
-- Password for Authority: Authority@123
-- Password for Citizen: Citizen@123
-- ----------------------------------------------------
INSERT INTO users (id, full_name, email, phone, password_hash, role) VALUES
('a0000000-0000-0000-0000-000000000001', 'Anita Verma', 'admin@ecova.org', '+91 99000 11223', '$2b$10$q3ywPnNLCvpoVE8NGxvUDey2cGFal6ty999.wLv7Vn2kr844E8eEC', 'ADMIN'),
('a0000000-0000-0000-0000-000000000002', 'Officer Rajesh Kumar', 'authority@ecova.org', '+91 98111 22334', '$2b$10$KbDdml1TdV.r8Hou326r1uEX/rxYjg1RdIgmcdLjS0UMDfV4ciNsK', 'AUTHORITY'),
('a0000000-0000-0000-0000-000000000003', 'Inspector Suresh Rao', 'water.authority@ecova.org', '+91 98222 33445', '$2b$10$KbDdml1TdV.r8Hou326r1uEX/rxYjg1RdIgmcdLjS0UMDfV4ciNsK', 'AUTHORITY'),
('c0000000-0000-0000-0000-000000000001', 'Priya Sharma', 'citizen@ecova.org', '+91 98765 43210', '$2b$10$tSUYgtmIlpVsU7PjR.Zb7.gmTk9cUdGcEQC8dirYebQ3ThRlfJYSG', 'CITIZEN')
ON CONFLICT (email) DO NOTHING;

-- ----------------------------------------------------
-- 3. SEED REPORTS
-- ----------------------------------------------------
INSERT INTO reports (id, report_code, user_id, category_id, description, severity, latitude, longitude, address, photo_url, status, authority_id, created_at, updated_at) VALUES
(1, 'ECOVA-100001', 'c0000000-0000-0000-0000-000000000001', 1, 'Heavy overflow from community garbage bins spilling over onto the main footpath and pedestrian walkway for 4 days.', 'MEDIUM', 12.9716, 77.5946, 'Near 12th Main, Indiranagar, Bengaluru', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80', 'UNDER_REVIEW', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
(2, 'ECOVA-100002', 'c0000000-0000-0000-0000-000000000001', 2, 'Burst underground supply pipeline causing clean drinking water to flood the street and creating a deep waterlogging hazard.', 'HIGH', 12.9833, 77.7500, 'Whitefield Main Road, near Metro Pillar 142, Bengaluru', 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80', 'ACTION_TAKEN', 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day'),
(3, 'ECOVA-100003', 'c0000000-0000-0000-0000-000000000001', 3, 'Illegal plastic and chemical burning behind the vacant plot generating toxic dark smoke across residential area.', 'LOW', 12.9352, 77.6245, '4th Block, Koramangala, Bengaluru', 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80', 'RESOLVED', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),
(4, 'ECOVA-100004', 'c0000000-0000-0000-0000-000000000001', 4, 'Large broken tree branch dangling dangerously over pedestrian walkway following heavy rainstorm.', 'MEDIUM', 12.9767, 77.5928, 'Cubbon Park Perimeter Road, Bengaluru', 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', 'SUBMITTED', NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(5, 'ECOVA-100005', 'c0000000-0000-0000-0000-000000000001', 5, 'Cracked and displaced concrete stormwater drain slabs posing extreme tripping risk near bus stop.', 'HIGH', 12.9738, 77.6119, 'MG Road Metro Station Exit B, Bengaluru', 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80', 'UNDER_REVIEW', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day')
ON CONFLICT (report_code) DO NOTHING;

-- Advance sequence past seeded codes
SELECT setval('report_code_seq', 100006);

-- ----------------------------------------------------
-- 4. SEED REPORT STATUS HISTORY
-- ----------------------------------------------------
INSERT INTO report_status_history (report_id, status, note, changed_by, created_at) VALUES
(1, 'SUBMITTED', 'Report submitted by citizen with photo evidence and location pin.', 'c0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days'),
(1, 'UNDER_REVIEW', 'Assigned to Ward 82 Sanitation Supervisor for on-site inspection.', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days'),

(2, 'SUBMITTED', 'Urgent water leakage reported.', 'c0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '4 days'),
(2, 'UNDER_REVIEW', 'Reviewed by Water Supply Emergency Cell. Marked as high priority.', 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '3 days'),
(2, 'ACTION_TAKEN', 'Isolation valve closed. Repair crew dispatched with replacement conduit.', 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '1 day'),

(3, 'SUBMITTED', 'Citizen reported smoke emission and burning odor.', 'c0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '7 days'),
(3, 'UNDER_REVIEW', 'Environmental monitoring flying squad notified.', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '6 days'),
(3, 'ACTION_TAKEN', 'Site visited by enforcement unit. Burning halted and site cleared.', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 days 12 hours'),
(3, 'RESOLVED', 'Plot owner issued warning notice and cleanup verified.', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 days'),

(4, 'SUBMITTED', 'Report submitted. Photo evidence recorded.', 'c0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day'),

(5, 'SUBMITTED', 'Report received.', 'c0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days'),
(5, 'UNDER_REVIEW', 'Road Infrastructure maintenance team notified for slab replacement.', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day');

-- ----------------------------------------------------
-- 5. SEED REPORT ACTIONS
-- ----------------------------------------------------
INSERT INTO report_actions (report_id, authority_id, action_type, note, created_at) VALUES
(2, 'a0000000-0000-0000-0000-000000000003', 'REPAIR', 'Excavation team completed welding of the 4-inch supply line. Pressure testing underway.', NOW() - INTERVAL '1 day'),
(3, 'a0000000-0000-0000-0000-000000000002', 'WARNING', 'Warning notice served to plot lessee under Section 24 of Environmental Protection Act.', NOW() - INTERVAL '5 days');

-- ----------------------------------------------------
-- 6. SEED NOTIFICATIONS
-- ----------------------------------------------------
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
('c0000000-0000-0000-0000-000000000001', 'Report ECOVA-100002 Updated', 'Action has been taken on your water leakage report. Repair crew is on site.', 'ACTION', false, NOW() - INTERVAL '1 day'),
('c0000000-0000-0000-0000-000000000001', 'Report ECOVA-100003 Resolved', 'Great news! Your report regarding illegal waste burning has been marked Resolved.', 'RESOLVED', true, NOW() - INTERVAL '5 days'),
('c0000000-0000-0000-0000-000000000001', 'Report ECOVA-100001 Under Review', 'Sanitation Supervisor has begun reviewing your garbage accumulation report.', 'STATUS_UPDATE', false, NOW() - INTERVAL '2 days');

-- ----------------------------------------------------
-- 7. SEED ACTIVITY LOGS
-- ----------------------------------------------------
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata, created_at) VALUES
('c0000000-0000-0000-0000-000000000001', 'REPORT_CREATED', 'REPORT', 'ECOVA-100001', '{"category": "Waste & Garbage", "severity": "MEDIUM"}', NOW() - INTERVAL '3 days'),
('a0000000-0000-0000-0000-000000000002', 'STATUS_CHANGED', 'REPORT', 'ECOVA-100001', '{"from": "SUBMITTED", "to": "UNDER_REVIEW"}', NOW() - INTERVAL '2 days');
