const express = require('express');
const path = require('path');
const app = express();
const pool = require('./libs/mysql');

const hostname = '127.0.0.1';
const port = 3000;


app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'web')));



app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'web', 'login.html'));
});

// ==================== API ROUTES ====================

// Test database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 as result');
        res.json({ success: true, message: 'Database connected successfully!', data: rows });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
    }
});

// Register new user
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Validation
        if (!username || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
        }

        // Create username with role suffix
        const usernameWithRole = username + '@' + role;

        // Check if base username already exists (with any role) or email already exists
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE username LIKE ? OR email = ?',
            [username + '@%', email]
        );

        if (existingUsers.length > 0) {
            const existingUser = existingUsers.find(u => u.username.startsWith(username + '@'));
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' });
            }
            return res.status(400).json({ success: false, message: 'อีเมลนี้ถูกใช้แล้ว' });
        }

        // Insert new user
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [usernameWithRole, email, password, role]
        );

        res.json({
            success: true,
            message: 'ลงทะเบียนสำเร็จ!',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลงทะเบียน', error: error.message });
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
        }

        // Find user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        const user = users[0];
        res.json({
            success: true,
            message: 'เข้าสู่ระบบสำเร็จ!',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', error: error.message });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, username, email, role FROM users');
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await pool.query(
            'SELECT id, username, email, role FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
        }

        res.json({ success: true, data: users[0] });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role } = req.body;

        const [result] = await pool.query(
            'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
            [username, email, role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
        }

        res.json({ success: true, message: 'อัพเดทข้อมูลสำเร็จ!' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัพเดท', error: error.message });
    }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
        }

        res.json({ success: true, message: 'ลบผู้ใช้สำเร็จ!' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบ', error: error.message });
    }
});

// ==================== PROFILE API ROUTES ====================

// Get user profile by ID
app.get('/api/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await pool.query(
            'SELECT id, username, email, role, first_name, last_name, phone, farm_name, profile_image FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
        }

        res.json({ success: true, data: users[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});

// Update user profile (all roles can edit, but only owner can edit farm_name)
app.put('/api/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, phone, farm_name, profile_image, requester_role } = req.body;

        // Only owner can update farm_name
        if (requester_role === 'owner') {
            // Owner can update all fields including farm_name
            const [result] = await pool.query(
                `UPDATE users SET first_name = ?, last_name = ?, phone = ?, farm_name = ?, profile_image = ? WHERE id = ?`,
                [first_name || null, last_name || null, phone || null, farm_name || null, profile_image || null, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
            }
        } else {
            // Non-owner can update all fields EXCEPT farm_name
            const [result] = await pool.query(
                `UPDATE users SET first_name = ?, last_name = ?, phone = ?, profile_image = ? WHERE id = ?`,
                [first_name || null, last_name || null, phone || null, profile_image || null, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
            }
        }

        res.json({ success: true, message: 'บันทึกข้อมูลโปรไฟล์สำเร็จ!' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัพเดท', error: error.message });
    }
});

// ==================== FARM SETTINGS API ROUTES ====================

// Get farm settings (all roles can view)
app.get('/api/farm-settings', async (req, res) => {
    try {
        const [settings] = await pool.query('SELECT * FROM farm_settings WHERE id = 1');

        if (settings.length === 0) {
            // Create default if not exists
            await pool.query('INSERT INTO farm_settings (id, farm_name) VALUES (1, "ฟาร์มโคเนื้อ")');
            return res.json({ success: true, data: { id: 1, farm_name: 'ฟาร์มโคเนื้อ' } });
        }

        res.json({ success: true, data: settings[0] });
    } catch (error) {
        console.error('Get farm settings error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});

// Update farm settings (owner only)
app.put('/api/farm-settings', async (req, res) => {
    try {
        const { farm_name, farm_address, farm_phone, requester_role } = req.body;

        // Only owner can update
        if (requester_role !== 'owner') {
            return res.status(403).json({ success: false, message: 'เฉพาะเจ้าของฟาร์มเท่านั้นที่สามารถแก้ไขข้อมูลฟาร์มได้' });
        }

        const [result] = await pool.query(
            'UPDATE farm_settings SET farm_name = ?, farm_address = ?, farm_phone = ? WHERE id = 1',
            [farm_name || null, farm_address || null, farm_phone || null]
        );

        if (result.affectedRows === 0) {
            // Insert if not exists
            await pool.query(
                'INSERT INTO farm_settings (id, farm_name, farm_address, farm_phone) VALUES (1, ?, ?, ?)',
                [farm_name || 'ฟาร์มโคเนื้อ', farm_address || null, farm_phone || null]
            );
        }

        res.json({ success: true, message: 'บันทึกข้อมูลฟาร์มสำเร็จ!' });
    } catch (error) {
        console.error('Update farm settings error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัพเดท', error: error.message });
    }
});

// ==================== DASHBOARD STATISTICS API ====================

// Get dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        // Count cattle by gender
        const [genderStats] = await pool.query(`
            SELECT 
                SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male_count,
                SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female_count
            FROM cattle
        `);

        // Count cattle by breed
        const [breedStats] = await pool.query(`
            SELECT breed, COUNT(*) as count
            FROM cattle
            WHERE breed IS NOT NULL AND breed != ''
            GROUP BY breed
            ORDER BY count DESC
        `);

        // Count total buy and sell transactions
        const [transactionTotals] = await pool.query(`
            SELECT 
                SUM(CASE WHEN transaction_type = 'buy' THEN 1 ELSE 0 END) as total_buy,
                SUM(CASE WHEN transaction_type = 'sell' THEN 1 ELSE 0 END) as total_sell
            FROM cattle_transactions
        `);

        // Get monthly transaction data for current year
        const currentYear = new Date().getFullYear();
        const [monthlyTransactions] = await pool.query(`
            SELECT 
                MONTH(transaction_date) as month,
                SUM(CASE WHEN transaction_type = 'buy' THEN 1 ELSE 0 END) as buy_count,
                SUM(CASE WHEN transaction_type = 'sell' THEN 1 ELSE 0 END) as sell_count
            FROM cattle_transactions
            WHERE YEAR(transaction_date) = ?
            GROUP BY MONTH(transaction_date)
            ORDER BY month
        `, [currentYear]);

        // Format monthly data (fill in missing months with 0)
        const monthlyData = {
            buy: Array(12).fill(0),
            sell: Array(12).fill(0)
        };
        monthlyTransactions.forEach(row => {
            monthlyData.buy[row.month - 1] = row.buy_count;
            monthlyData.sell[row.month - 1] = row.sell_count;
        });

        res.json({
            success: true,
            data: {
                male_count: genderStats[0]?.male_count || 0,
                female_count: genderStats[0]?.female_count || 0,
                total_buy: transactionTotals[0]?.total_buy || 0,
                total_sell: transactionTotals[0]?.total_sell || 0,
                breed_stats: breedStats,
                monthly_transactions: monthlyData
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});


// ==================== CATTLE API ROUTES ====================

// Get all cattle
app.get('/api/cattle', async (req, res) => {
    try {
        const [cattle] = await pool.query('SELECT * FROM cattle ORDER BY id DESC');
        res.json({ success: true, data: cattle });
    } catch (error) {
        console.error('Get cattle error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});

// Get cattle by ID or cattle_code
app.get('/api/cattle/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // ค้นหาทั้งจาก id และ cattle_code
        const [cattle] = await pool.query(
            'SELECT * FROM cattle WHERE id = ? OR cattle_code = ?',
            [id, id]
        );

        if (cattle.length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลโค' });
        }

        res.json({ success: true, data: cattle[0] });
    } catch (error) {
        console.error('Get cattle error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});

// Create new cattle
app.post('/api/cattle', async (req, res) => {
    try {
        const {
            cattle_code, name, breed, gender, birth_date, entry_date,
            source, status, notes, image_url
        } = req.body;

        // Validation
        if (!cattle_code || !gender || !entry_date) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลที่จำเป็น (รหัสโค, เพศ, วันที่เข้าฟาร์ม)'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO cattle (cattle_code, name, breed, gender, birth_date, entry_date, 
             source, status, notes, image_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [cattle_code, name, breed, gender, birth_date, entry_date,
                source, status || 'active', notes, image_url]
        );

        // Log buy transaction
        const priceMatch = notes ? notes.match(/ราคาซื้อ:\s*([\d]+)/i) : null;
        const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
        await pool.query(
            'INSERT INTO cattle_transactions (cattle_id, transaction_type, transaction_date, price, notes) VALUES (?, ?, ?, ?, ?)',
            [result.insertId, 'buy', entry_date || new Date().toISOString().split('T')[0], price, `ซื้อโค: ${name || cattle_code}`]
        );

        res.json({
            success: true,
            message: 'เพิ่มข้อมูลโคสำเร็จ!',
            cattleId: result.insertId
        });
    } catch (error) {
        console.error('Create cattle error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'รหัสโคนี้มีอยู่แล้ว' });
        }
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล', error: error.message });
    }
});

// Update cattle
app.put('/api/cattle/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            cattle_code, name, breed, gender, birth_date, entry_date,
            source, status, notes, image_url
        } = req.body;

        const [result] = await pool.query(
            `UPDATE cattle SET 
             cattle_code = ?, name = ?, breed = ?, gender = ?, birth_date = ?, 
             entry_date = ?, source = ?, status = ?, notes = ?, image_url = ?
             WHERE id = ?`,
            [cattle_code, name, breed, gender, birth_date, entry_date,
                source, status, notes, image_url, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลโค' });
        }

        res.json({ success: true, message: 'อัพเดทข้อมูลโคสำเร็จ!' });
    } catch (error) {
        console.error('Update cattle error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัพเดท', error: error.message });
    }
});

// Delete cattle (log as sell transaction)
app.delete('/api/cattle/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get cattle info before delete
        const [cattleInfo] = await pool.query('SELECT cattle_code, name FROM cattle WHERE id = ?', [id]);

        const [result] = await pool.query('DELETE FROM cattle WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลโค' });
        }

        // Log sell transaction
        const cattleName = cattleInfo.length > 0 ? (cattleInfo[0].name || cattleInfo[0].cattle_code) : 'Unknown';
        await pool.query(
            'INSERT INTO cattle_transactions (cattle_id, transaction_type, transaction_date, notes) VALUES (?, ?, ?, ?)',
            [id, 'sell', new Date().toISOString().split('T')[0], `ขายโค: ${cattleName}`]
        );

        res.json({ success: true, message: 'ลบข้อมูลโคสำเร็จ!' });
    } catch (error) {
        console.error('Delete cattle error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบ', error: error.message });
    }
});

// Search cattle
app.get('/api/cattle/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const searchTerm = `%${query}%`;

        const [cattle] = await pool.query(
            'SELECT * FROM cattle WHERE cattle_code LIKE ? OR name LIKE ? OR breed LIKE ? ORDER BY id DESC',
            [searchTerm, searchTerm, searchTerm]
        );

        res.json({ success: true, data: cattle });
    } catch (error) {
        console.error('Search cattle error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการค้นหา', error: error.message });
    }
});

// ==================== FEEDING RECORDS API ROUTES ====================

// Get all feeding records
app.get('/api/feeding', async (req, res) => {
    try {
        const [records] = await pool.query(`
            SELECT fr.*, 
                   c.name as cattle_name, 
                   c.cattle_code,
                   c.breed,
                   c.image_url
            FROM feeding_records fr
            LEFT JOIN cattle c ON fr.cattle_id = c.id
            ORDER BY fr.id DESC
        `);
        res.json({ success: true, data: records });
    } catch (error) {
        console.error('Get feeding records error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});

// Get feeding records by cattle ID
app.get('/api/feeding/cattle/:cattleId', async (req, res) => {
    try {
        const { cattleId } = req.params;
        const [records] = await pool.query(`
            SELECT fr.*, 
                   c.name as cattle_name,
                   c.cattle_code
            FROM feeding_records fr
            LEFT JOIN cattle c ON fr.cattle_id = c.id
            WHERE fr.cattle_id = ? OR c.cattle_code = ?
            ORDER BY fr.feed_date DESC
        `, [cattleId, cattleId]);
        res.json({ success: true, data: records });
    } catch (error) {
        console.error('Get feeding by cattle error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});

// Create new feeding record
app.post('/api/feeding', async (req, res) => {
    try {
        const {
            cattle_id, feed_date,
            quantity, unit, cost, notes, recorded_by
        } = req.body;

        if (!cattle_id || !feed_date || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลที่จำเป็น (รหัสโค, วันที่, ปริมาณ)'
            });
        }

        // Find cattle by id or cattle_code
        const [cattle] = await pool.query(
            'SELECT id FROM cattle WHERE id = ? OR cattle_code = ?',
            [cattle_id, cattle_id]
        );

        if (cattle.length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลโค' });
        }

        const actualCattleId = cattle[0].id;

        const [result] = await pool.query(
            `INSERT INTO feeding_records (cattle_id, feed_date, quantity, unit, cost, notes, recorded_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [actualCattleId, feed_date, quantity, unit || 'kg', cost || null, notes || null, recorded_by || null]
        );

        res.json({
            success: true,
            message: 'บันทึกข้อมูลการให้อาหารสำเร็จ!',
            feedingId: result.insertId
        });
    } catch (error) {
        console.error('Create feeding record error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึก', error: error.message });
    }
});

// Update feeding record
app.put('/api/feeding/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            cattle_id, feed_date,
            quantity, unit, cost, notes, recorded_by
        } = req.body;

        // Find actual cattle id (in case cattle_code was sent)
        const [cattle] = await pool.query(
            'SELECT id FROM cattle WHERE id = ? OR cattle_code = ?',
            [cattle_id, cattle_id]
        );

        if (cattle.length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลโค' });
        }

        const actualCattleId = cattle[0].id;

        const [result] = await pool.query(
            `UPDATE feeding_records SET 
             cattle_id = ?, feed_date = ?,
             quantity = ?, unit = ?, cost = ?, notes = ?, recorded_by = ?
             WHERE id = ?`,
            [actualCattleId, feed_date, quantity, unit || 'kg', cost || null, notes || null, recorded_by || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลการให้อาหาร' });
        }

        res.json({ success: true, message: 'อัพเดทข้อมูลสำเร็จ!' });
    } catch (error) {
        console.error('Update feeding record error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัพเดท', error: error.message });
    }
});

// Delete feeding record
app.delete('/api/feeding/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM feeding_records WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลการให้อาหาร' });
        }

        res.json({ success: true, message: 'ลบข้อมูลสำเร็จ!' });
    } catch (error) {
        console.error('Delete feeding record error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบ', error: error.message });
    }
});


// ==================== GROWTH RECORDS API ROUTES ====================

// Get all growth records
app.get('/api/growth', async (req, res) => {
    try {
        const [records] = await pool.query(`
            SELECT gr.*, 
                   c.name as cattle_name, 
                   c.cattle_code,
                   c.breed,
                   c.gender,
                   c.status,
                   c.image_url
            FROM growth_records gr
            LEFT JOIN cattle c ON gr.cattle_id = c.id
            ORDER BY gr.id DESC
        `);
        res.json({ success: true, data: records });
    } catch (error) {
        console.error('Get growth records error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});

// Get growth records by cattle ID
app.get('/api/growth/cattle/:cattleId', async (req, res) => {
    try {
        const { cattleId } = req.params;
        const [records] = await pool.query(`
            SELECT gr.*, 
                   c.name as cattle_name,
                   c.cattle_code,
                   c.breed,
                   c.image_url
            FROM growth_records gr
            LEFT JOIN cattle c ON gr.cattle_id = c.id
            WHERE gr.cattle_id = ? OR c.cattle_code = ?
            ORDER BY gr.record_date DESC
        `, [cattleId, cattleId]);
        res.json({ success: true, data: records });
    } catch (error) {
        console.error('Get growth by cattle error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});

// Create new growth record
app.post('/api/growth', async (req, res) => {
    try {
        const {
            cattle_id, initial_weight, latest_weight, record_date, recorded_by
        } = req.body;

        if (!cattle_id || !record_date) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลที่จำเป็น (รหัสโค, วันที่)'
            });
        }

        // Find cattle by id or cattle_code
        const [cattle] = await pool.query(
            'SELECT id FROM cattle WHERE id = ? OR cattle_code = ?',
            [cattle_id, cattle_id]
        );

        if (cattle.length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลโค' });
        }

        const actualCattleId = cattle[0].id;

        const [result] = await pool.query(
            `INSERT INTO growth_records (cattle_id, initial_weight, latest_weight, record_date, recorded_by) 
             VALUES (?, ?, ?, ?, ?)`,
            [actualCattleId, initial_weight || null, latest_weight || null, record_date, recorded_by || null]
        );

        res.json({
            success: true,
            message: 'บันทึกข้อมูลการเจริญเติบโตสำเร็จ!',
            growthId: result.insertId
        });
    } catch (error) {
        console.error('Create growth record error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึก', error: error.message });
    }
});

// Update growth record
app.put('/api/growth/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            cattle_id, initial_weight, latest_weight, record_date, recorded_by
        } = req.body;

        const [result] = await pool.query(
            `UPDATE growth_records SET 
             cattle_id = ?, initial_weight = ?, latest_weight = ?, record_date = ?, recorded_by = ?
             WHERE id = ?`,
            [cattle_id, initial_weight || null, latest_weight || null, record_date, recorded_by || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลการเจริญเติบโต' });
        }

        res.json({ success: true, message: 'อัพเดทข้อมูลสำเร็จ!' });
    } catch (error) {
        console.error('Update growth record error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัพเดท', error: error.message });
    }
});

// Delete growth record
app.delete('/api/growth/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM growth_records WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลการเจริญเติบโต' });
        }

        res.json({ success: true, message: 'ลบข้อมูลสำเร็จ!' });
    } catch (error) {
        console.error('Delete growth record error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบ', error: error.message });
    }
});

// ==================== HEALTH RECORDS API ROUTES ====================

// Get all health records
app.get('/api/health', async (req, res) => {
    try {
        const [records] = await pool.query(`
            SELECT hr.*, 
                   c.name as cattle_name, 
                   c.cattle_code,
                   c.breed,
                   c.image_url
            FROM health_records hr
            LEFT JOIN cattle c ON hr.cattle_id = c.id
            ORDER BY hr.id DESC
        `);
        res.json({ success: true, data: records });
    } catch (error) {
        console.error('Get health records error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});

// Get health records by cattle ID
app.get('/api/health/cattle/:cattleId', async (req, res) => {
    try {
        const { cattleId } = req.params;
        const [records] = await pool.query(`
            SELECT hr.*, 
                   c.name as cattle_name,
                   c.cattle_code,
                   c.breed,
                   c.image_url
            FROM health_records hr
            LEFT JOIN cattle c ON hr.cattle_id = c.id
            WHERE hr.cattle_id = ? OR c.cattle_code = ?
            ORDER BY hr.record_date DESC
        `, [cattleId, cattleId]);
        res.json({ success: true, data: records });
    } catch (error) {
        console.error('Get health by cattle error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});

// Create new health record
app.post('/api/health', async (req, res) => {
    try {
        const {
            cattle_id, record_date, health_status, symptoms, treatment, cost, veterinarian
        } = req.body;

        if (!cattle_id || !record_date) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลที่จำเป็น (รหัสโค, วันที่)'
            });
        }

        // Find cattle by id or cattle_code
        const [cattle] = await pool.query(
            'SELECT id FROM cattle WHERE id = ? OR cattle_code = ?',
            [cattle_id, cattle_id]
        );

        if (cattle.length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลโค' });
        }

        const actualCattleId = cattle[0].id;

        const [result] = await pool.query(
            `INSERT INTO health_records (cattle_id, record_date, health_status, symptoms, treatment, cost, veterinarian) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [actualCattleId, record_date, health_status || 'normal', symptoms || null, treatment || null, cost || 0, veterinarian || null]
        );

        res.json({
            success: true,
            message: 'บันทึกข้อมูลสุขภาพสำเร็จ!',
            healthId: result.insertId
        });
    } catch (error) {
        console.error('Create health record error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึก', error: error.message });
    }
});

// Update health record
app.put('/api/health/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            cattle_id, record_date, health_status, symptoms, treatment, cost, veterinarian
        } = req.body;

        const [result] = await pool.query(
            `UPDATE health_records SET 
             cattle_id = ?, record_date = ?, health_status = ?, symptoms = ?, treatment = ?, cost = ?, veterinarian = ?
             WHERE id = ?`,
            [cattle_id, record_date, health_status || 'normal', symptoms || null, treatment || null, cost || 0, veterinarian || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลสุขภาพ' });
        }

        res.json({ success: true, message: 'อัพเดทข้อมูลสำเร็จ!' });
    } catch (error) {
        console.error('Update health record error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัพเดท', error: error.message });
    }
});

// Delete health record
app.delete('/api/health/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM health_records WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลสุขภาพ' });
        }

        res.json({ success: true, message: 'ลบข้อมูลสำเร็จ!' });
    } catch (error) {
        console.error('Delete health record error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบ', error: error.message });
    }
});

// ==================== ADMIN API ROUTES ====================

// Get all users with full info (for admin)
app.get('/api/admin/users', async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT id, username, email, role, first_name, last_name, phone, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
        `);
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Admin get users error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});

// Update user by admin (including role)
app.put('/api/admin/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, first_name, last_name, role } = req.body;

        // Update user with role change
        const [result] = await pool.query(
            `UPDATE users SET email = ?, first_name = ?, last_name = ?, role = ? WHERE id = ?`,
            [email, first_name || null, last_name || null, role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
        }

        // Also update the username suffix if role changed
        const [user] = await pool.query('SELECT username FROM users WHERE id = ?', [id]);
        if (user.length > 0) {
            const oldUsername = user[0].username;
            const baseName = oldUsername.split('@')[0];
            const newUsername = baseName + '@' + role;
            await pool.query('UPDATE users SET username = ? WHERE id = ?', [newUsername, id]);
        }

        res.json({ success: true, message: 'อัพเดทข้อมูลผู้ใช้สำเร็จ!' });
    } catch (error) {
        console.error('Admin update user error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัพเดท', error: error.message });
    }
});

// Delete user by admin
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
        }

        res.json({ success: true, message: 'ลบผู้ใช้สำเร็จ!' });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบ', error: error.message });
    }
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});