-- สร้าง Database (ถ้ายังไม่มี)
CREATE DATABASE IF NOT EXISTS user;
USE user;

-- สร้างตาราง users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('doctor', 'owner', 'staff') NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    farm_name VARCHAR(200),
    profile_image LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ตัวอย่างข้อมูล (optional)
-- INSERT INTO users (username, email, password, role) VALUES 
-- ('admin@doctor', 'admin@example.com', 'password123', 'doctor'),
-- ('user1@owner', 'user1@example.com', 'password123', 'owner');

-- ตารางข้อมูลฟาร์ม (ข้อมูลกลางที่ใช้ร่วมกันทุก role)
CREATE TABLE IF NOT EXISTS farm_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farm_name VARCHAR(200) NOT NULL,
    farm_address TEXT,
    farm_phone VARCHAR(20),
    owner_id INT COMMENT 'เจ้าของฟาร์ม (อ้างอิง users)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ข้อมูลเริ่มต้นของฟาร์ม
INSERT INTO farm_settings (id, farm_name) VALUES (1, 'ฟาร์มโคเนื้อ')
ON DUPLICATE KEY UPDATE farm_name = farm_name;

-- ============================================
-- ตารางสำหรับระบบจัดการฟาร์มโค
-- ============================================

-- ตารางข้อมูลโค (ตารางหลัก)
CREATE TABLE IF NOT EXISTS cattle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cattle_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'รหัสโค',
    name VARCHAR(100) COMMENT 'ชื่อโค',
    breed VARCHAR(100) COMMENT 'สายพันธุ์',
    gender ENUM('male', 'female') NOT NULL COMMENT 'เพศ',
    birth_date DATE COMMENT 'วันเกิด',
    entry_date DATE NOT NULL COMMENT 'วันที่เข้าฟาร์ม',
    source VARCHAR(255) COMMENT 'แหล่งที่มา',
    status VARCHAR(20) DEFAULT 'active' COMMENT 'สถานะ',
    mother_id INT COMMENT 'รหัสแม่โค',
    father_id INT COMMENT 'รหัสพ่อโค',
    notes TEXT COMMENT 'หมายเหตุ',
    image_url VARCHAR(500) COMMENT 'รูปภาพโค',
    owner_id INT COMMENT 'เจ้าของ (อ้างอิง users)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mother_id) REFERENCES cattle(id) ON DELETE SET NULL,
    FOREIGN KEY (father_id) REFERENCES cattle(id) ON DELETE SET NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ตารางประวัติการซื้อ/ขายโค (สำหรับแสดงกราฟ Dashboard)
CREATE TABLE IF NOT EXISTS cattle_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cattle_id INT COMMENT 'รหัสโค',
    transaction_type ENUM('buy', 'sell') NOT NULL COMMENT 'ประเภท: ซื้อ/ขาย',
    transaction_date DATE NOT NULL COMMENT 'วันที่ทำรายการ',
    price DECIMAL(12, 2) COMMENT 'ราคา',
    notes TEXT COMMENT 'หมายเหตุ',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cattle_id) REFERENCES cattle(id) ON DELETE SET NULL
);


-- ตารางข้อมูลการให้อาหาร
CREATE TABLE IF NOT EXISTS feeding_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cattle_id INT NOT NULL COMMENT 'รหัสโค',
    feed_date DATE NOT NULL COMMENT 'วันที่ให้อาหาร',
    feed_time TIME COMMENT 'เวลาให้อาหาร',
    quantity DECIMAL(10, 2) NOT NULL COMMENT 'ปริมาณ',
    unit VARCHAR(50) DEFAULT 'kg' COMMENT 'หน่วย',
    cost DECIMAL(10, 2) COMMENT 'ค่าใช้จ่าย',
    notes TEXT COMMENT 'หมายเหตุ/ประเภทอาหาร',
    recorded_by INT COMMENT 'ผู้บันทึก (อ้างอิง users)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cattle_id) REFERENCES cattle(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_feeding_date (feed_date),
    INDEX idx_feeding_cattle (cattle_id)
);

-- ตารางข้อมูลการเจริญเติบโต
CREATE TABLE IF NOT EXISTS growth_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cattle_id INT NOT NULL COMMENT 'รหัสโค',
    initial_weight DECIMAL(10, 2) COMMENT 'น้ำหนักเริ่มต้น (กก.)',
    latest_weight DECIMAL(10, 2) COMMENT 'น้ำหนักล่าสุด (กก.)',
    record_date DATE NOT NULL COMMENT 'วันที่ชั่งน้ำหนัก',
    recorded_by VARCHAR(100) COMMENT 'ผู้บันทึก',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cattle_id) REFERENCES cattle(id) ON DELETE CASCADE,
    INDEX idx_growth_date (record_date),
    INDEX idx_growth_cattle (cattle_id)
);

-- ตารางข้อมูลสุขภาพ
CREATE TABLE IF NOT EXISTS health_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cattle_id INT NOT NULL COMMENT 'รหัสโค',
    record_date DATE NOT NULL COMMENT 'วันที่ตรวจ/รักษา',
    health_status ENUM('normal', 'sick', 'recovered', 'watch') DEFAULT 'normal' COMMENT 'สถานะสุขภาพ',
    symptoms TEXT COMMENT 'อาการ/โรคที่พบ',
    treatment TEXT COMMENT 'การรักษา/ยาที่ให้',
    cost DECIMAL(10, 2) DEFAULT 0 COMMENT 'ค่าใช้จ่าย (บาท)',
    veterinarian VARCHAR(100) COMMENT 'สัตวแพทย์/ผู้ตรวจ',
    notes TEXT COMMENT 'หมายเหตุ',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cattle_id) REFERENCES cattle(id) ON DELETE CASCADE,
    INDEX idx_health_date (record_date),
    INDEX idx_health_cattle (cattle_id)
);

