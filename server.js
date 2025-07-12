const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Database setup
const db = new sqlite3.Database('museum.db');

// Create tables if they don't exist
db.run(`CREATE TABLE IF NOT EXISTS exhibitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    era TEXT NOT NULL,
    material TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Insert sample data
db.run(`INSERT OR IGNORE INTO exhibitions (id, name, era, material, description, image_url) VALUES
    (1, 'التمثال الفرعوني', 'عصر الدولة الحديثة', 'ذهب', 'تمثال فرعوني نادر من عصر الدولة الحديثة، يُظهر براعة الفنان المصري القديم في نحت الذهب', '/images/T3.jpg'),
    (2, 'قناع توت عنخ آمون', 'الدولة الحديثة', 'ذهب وأحجار كريمة', 'قناع جنائزي ذهبي رائع يُظهر الفن المصري في أوج ازدهاره', '/images/TA.png'),
    (3, 'تمثال الكاتب', 'الدولة الوسطى', 'جرانيت', 'تمثال لكاتب مصري قديم يُظهر أهمية الكتابة في الحضارة المصرية', '/images/T3.jpg'),
    (4, 'إناء كانوبي', 'الدولة القديمة', 'حجر جيري', 'إناء كانوبي مستخدم في عملية التحنيط لحفظ الأعضاء الداخلية', '/images/TA.png')
`);

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/exhibitions', (req, res) => {
    db.all('SELECT * FROM exhibitions ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('خطأ في قاعدة البيانات');
        } else {
            res.render('exhibitions', { exhibitions: rows });
        }
    });
});

// API endpoints
app.get('/api/exhibitions', (req, res) => {
    db.all('SELECT * FROM exhibitions ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'خطأ في قاعدة البيانات' });
        } else {
            res.json(rows);
        }
    });
});

app.get('/api/exhibitions/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM exhibitions WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: 'خطأ في قاعدة البيانات' });
        } else if (!row) {
            res.status(404).json({ error: 'المعروض غير موجود' });
        } else {
            res.json(row);
        }
    });
});

app.post('/api/exhibitions', (req, res) => {
    const { name, era, material, description, image_url } = req.body;
    
    if (!name || !era || !material || !description) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    
    db.run(
        'INSERT INTO exhibitions (name, era, material, description, image_url) VALUES (?, ?, ?, ?, ?)',
        [name, era, material, description, image_url || null],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'خطأ في إضافة المعروض' });
            } else {
                res.json({ 
                    id: this.lastID, 
                    message: 'تم إضافة المعروض بنجاح',
                    exhibition: { id: this.lastID, name, era, material, description, image_url }
                });
            }
        }
    );
});

app.put('/api/exhibitions/:id', (req, res) => {
    const id = req.params.id;
    const { name, era, material, description, image_url } = req.body;
    
    if (!name || !era || !material || !description) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    
    db.run(
        'UPDATE exhibitions SET name = ?, era = ?, material = ?, description = ?, image_url = ? WHERE id = ?',
        [name, era, material, description, image_url || null, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'خطأ في تحديث المعروض' });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'المعروض غير موجود' });
            } else {
                res.json({ message: 'تم تحديث المعروض بنجاح' });
            }
        }
    );
});

app.delete('/api/exhibitions/:id', (req, res) => {
    const id = req.params.id;
    
    db.run('DELETE FROM exhibitions WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: 'خطأ في حذف المعروض' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'المعروض غير موجود' });
        } else {
            res.json({ message: 'تم حذف المعروض بنجاح' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`الخادم يعمل على الرابط: http://localhost:${PORT}`);
});