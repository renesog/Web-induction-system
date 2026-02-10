-- Script to add admin role and create admin user
-- Run this script in MySQL to enable admin functionality

-- 1. Update the users table to support admin role
-- First, modify the role ENUM to include 'admin'
ALTER TABLE users 
MODIFY COLUMN role ENUM('doctor', 'owner', 'staff', 'admin') NOT NULL;

-- 2. Create an admin user (password: admin123)
-- The password is hashed using bcrypt - this is a placeholder
-- You should change the password after first login
INSERT INTO users (username, email, password, role, first_name, last_name)
VALUES (
    'admin@admin',
    'admin@farm.com', 
    '$2b$10$rQdK0Wv8nYJZPjQjqT5jxOQ3qT5jxOQ3qT5jxOQ3qT5jxOQ3qT5jx',
    'admin',
    'ผู้ดูแล',
    'ระบบ'
);

-- Note: The password above is a placeholder bcrypt hash
-- You may need to generate a proper hash using your application's password hashing logic
-- OR manually insert using your register API endpoint

-- Alternative: Use the register API to create admin user
-- POST /api/users/register
-- {
--   "username": "admin",
--   "email": "admin@farm.com",
--   "password": "admin123",
--   "role": "admin",
--   "firstName": "ผู้ดูแล",
--   "lastName": "ระบบ"
-- }
