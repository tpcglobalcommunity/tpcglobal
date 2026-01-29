import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX), // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Ensure uploads directory exists
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database setup (SQLite for simplicity)
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

async function initializeDatabase() {
    try {
        db = await open({
            filename: process.env.DB_PATH || './data/presale.db',
            driver: sqlite3.Database
        });

        // Create tables
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                email_verified BOOLEAN DEFAULT FALSE,
                verification_token TEXT,
                verification_expires INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_number TEXT UNIQUE NOT NULL,
                user_email TEXT NOT NULL,
                tpc_amount INTEGER NOT NULL,
                total_usd DECIMAL(10,2) NOT NULL,
                total_idr INTEGER NOT NULL,
                payment_method TEXT,
                status TEXT DEFAULT 'pending',
                proof_file_path TEXT,
                proof_uploaded_at DATETIME,
                admin_notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_email) REFERENCES users (email)
            );

            CREATE TABLE IF NOT EXISTS email_verifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                token TEXT NOT NULL,
                expires_at INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS admin_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT NOT NULL,
                table_name TEXT,
                record_id TEXT,
                old_values TEXT,
                new_values TEXT,
                user_email TEXT,
                ip_address TEXT,
                user_agent TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Insert default admin settings
        await db.exec(`
            INSERT OR IGNORE INTO admin_settings (key, value) VALUES
            ('presale_stage', '1'),
            ('presale_price', '0.001'),
            ('presale_supply', '100000000'),
            ('usd_to_idr_rate', '16000'),
            ('usdc_address', 'TPCWalletSolanaAddressHere'),
            ('sol_address', 'TPCWalletSolanaAddressHere'),
            ('bca_account', '1234567890'),
            ('bca_name', 'PT TPC Indonesia'),
            ('mandiri_account', '1234567890'),
            ('mandiri_name', 'PT TPC Indonesia'),
            ('bni_account', '1234567890'),
            ('bni_name', 'PT TPC Indonesia'),
            ('bri_account', '1234567890'),
            ('bri_name', 'PT TPC Indonesia'),
            ('ovo_number', '08123456789'),
            ('ovo_name', 'TPC Official'),
            ('dana_number', '08123456789'),
            ('dana_name', 'TPC Official'),
            ('gopay_number', '08123456789'),
            ('gopay_name', 'TPC Official');
        `);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
}

// Utility functions
function generateInvoiceNumber() {
    return 'INV' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function generateVerificationToken() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function logAudit(action, tableName, recordId, oldValues, newValues, userEmail, req) {
    db.run(
        `INSERT INTO audit_logs (action, table_name, record_id, old_values, new_values, user_email, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [action, tableName, recordId, JSON.stringify(oldValues), JSON.stringify(newValues), userEmail, req.ip, req.get('User-Agent')]
    );
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get presale info
app.get('/api/presale', async (req, res) => {
    try {
        const settings = await db.all('SELECT key, value FROM admin_settings');
        const presaleData = {};
        
        settings.forEach(setting => {
            presaleData[setting.key] = setting.value;
        });

        // Calculate remaining supply (in real app, this would be calculated from actual sales)
        const totalSold = await db.get('SELECT SUM(tpc_amount) as total FROM invoices WHERE status = "paid"');
        const remaining = parseInt(presaleData.presale_supply) - (totalSold.total || 0);

        res.json({
            stage: parseInt(presaleData.presale_stage),
            price: parseFloat(presaleData.presale_price),
            supply: parseInt(presaleData.presale_supply),
            remaining: remaining,
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months from now
            usdToIdr: parseInt(presaleData.usd_to_idr_rate)
        });
    } catch (error) {
        console.error('Error fetching presale data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Email verification
app.post('/api/send-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user exists
        let user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            // Create new user
            await db.run('INSERT INTO users (email) VALUES (?)', [email]);
            user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        }

        if (user.email_verified) {
            return res.json({ message: 'Email already verified' });
        }

        // Generate verification token
        const token = generateVerificationToken();
        const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Save verification token
        await db.run(
            'INSERT INTO email_verifications (email, token, expires_at) VALUES (?, ?, ?)',
            [email, token, expires]
        );

        // Update user with verification token
        await db.run(
            'UPDATE users SET verification_token = ?, verification_expires = ? WHERE email = ?',
            [token, expires, email]
        );

        // In production, send actual email here
        console.log(`Verification email sent to ${email} with token: ${token}`);

        logAudit('send_verification', 'users', user.id, null, { email }, email, req);

        res.json({ message: 'Verification email sent' });
    } catch (error) {
        console.error('Error sending verification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify email
app.post('/api/verify-email', async (req, res) => {
    try {
        const { email, token } = req.body;

        if (!email || !token) {
            return res.status(400).json({ error: 'Email and token are required' });
        }

        // Check verification token
        const verification = await db.get(
            'SELECT * FROM email_verifications WHERE email = ? AND token = ? AND expires_at > ?',
            [email, token, Date.now()]
        );

        if (!verification) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        // Update user as verified
        await db.run(
            'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_expires = NULL WHERE email = ?',
            [email]
        );

        // Delete verification token
        await db.run('DELETE FROM email_verifications WHERE email = ?', [email]);

        logAudit('verify_email', 'users', null, null, { email }, email, req);

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create invoice
app.post('/api/invoices', async (req, res) => {
    try {
        const { email, tpcAmount, paymentMethod } = req.body;

        if (!email || !tpcAmount) {
            return res.status(400).json({ error: 'Email and TPC amount are required' });
        }

        // Check if email is verified
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user || !user.email_verified) {
            return res.status(400).json({ error: 'Email not verified' });
        }

        // Get presale settings
        const presaleSettings = await db.all('SELECT key, value FROM admin_settings WHERE key IN ("presale_price", "usd_to_idr_rate")');
        const settings = {};
        presaleSettings.forEach(setting => {
            settings[setting.key] = setting.value;
        });

        const price = parseFloat(settings.presale_price);
        const usdToIdr = parseInt(settings.usd_to_idr_rate);
        const totalUSD = tpcAmount * price;
        const totalIDR = Math.round(totalUSD * usdToIdr);

        const invoiceNumber = generateInvoiceNumber();

        // Create invoice
        const result = await db.run(
            `INSERT INTO invoices (invoice_number, user_email, tpc_amount, total_usd, total_idr, payment_method)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [invoiceNumber, email, tpcAmount, totalUSD, totalIDR, paymentMethod]
        );

        const invoice = await db.get('SELECT * FROM invoices WHERE id = ?', [result.lastID]);

        // In production, send invoice email here
        console.log(`Invoice created: ${invoiceNumber} for ${email}`);

        logAudit('create_invoice', 'invoices', invoice.id, null, { invoiceNumber, email, tpcAmount }, email, req);

        res.json(invoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get invoice
app.get('/api/invoices/:invoiceNumber', async (req, res) => {
    try {
        const { invoiceNumber } = req.params;

        const invoice = await db.get('SELECT * FROM invoices WHERE invoice_number = ?', [invoiceNumber]);

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(invoice);
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user invoices
app.get('/api/invoices', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const invoices = await db.all(
            'SELECT * FROM invoices WHERE user_email = ? ORDER BY created_at DESC',
            [email]
        );

        res.json(invoices);
    } catch (error) {
        console.error('Error fetching user invoices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Upload payment proof
app.post('/api/invoices/:invoiceNumber/proof', upload.single('proof'), async (req, res) => {
    try {
        const { invoiceNumber } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'Proof file is required' });
        }

        const invoice = await db.get('SELECT * FROM invoices WHERE invoice_number = ?', [invoiceNumber]);

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        if (invoice.status !== 'pending') {
            return res.status(400).json({ error: 'Invoice is not in pending status' });
        }

        // Update invoice with proof
        await db.run(
            `UPDATE invoices 
             SET status = 'verification_pending', proof_file_path = ?, proof_uploaded_at = CURRENT_TIMESTAMP
             WHERE invoice_number = ?`,
            [req.file.filename, invoiceNumber]
        );

        const updatedInvoice = await db.get('SELECT * FROM invoices WHERE invoice_number = ?', [invoiceNumber]);

        // In production, send notification to admin here
        console.log(`Payment proof uploaded for invoice: ${invoiceNumber}`);

        logAudit('upload_proof', 'invoices', invoice.id, invoice, updatedInvoice, invoice.user_email, req);

        res.json(updatedInvoice);
    } catch (error) {
        console.error('Error uploading proof:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get payment methods
app.get('/api/payment-methods', async (req, res) => {
    try {
        const settings = await db.all('SELECT key, value FROM admin_settings');
        const paymentData = {};
        
        settings.forEach(setting => {
            paymentData[setting.key] = setting.value;
        });

        const paymentMethods = [
            {
                id: 'usdc',
                name: 'USDC',
                network: 'Solana',
                address: paymentData.usdc_address
            },
            {
                id: 'sol',
                name: 'SOL',
                network: 'Solana',
                address: paymentData.sol_address
            },
            {
                id: 'bca',
                name: 'BCA',
                type: 'bank',
                account: paymentData.bca_account,
                accountName: paymentData.bca_name
            },
            {
                id: 'mandiri',
                name: 'Mandiri',
                type: 'bank',
                account: paymentData.mandiri_account,
                accountName: paymentData.mandiri_name
            },
            {
                id: 'bni',
                name: 'BNI',
                type: 'bank',
                account: paymentData.bni_account,
                accountName: paymentData.bni_name
            },
            {
                id: 'bri',
                name: 'BRI',
                type: 'bank',
                account: paymentData.bri_account,
                accountName: paymentData.bri_name
            },
            {
                id: 'ovo',
                name: 'OVO',
                type: 'ewallet',
                number: paymentData.ovo_number,
                accountName: paymentData.ovo_name
            },
            {
                id: 'dana',
                name: 'DANA',
                type: 'ewallet',
                number: paymentData.dana_number,
                accountName: paymentData.dana_name
            },
            {
                id: 'gopay',
                name: 'GoPay',
                type: 'ewallet',
                number: paymentData.gopay_number,
                accountName: paymentData.gopay_name
            }
        ];

        res.json(paymentMethods);
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin routes (protected)
// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // In production, use proper JWT tokens
            res.json({ 
                message: 'Login successful',
                token: 'admin-token-' + Date.now()
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all invoices (admin)
app.get('/api/admin/invoices', async (req, res) => {
    try {
        // In production, verify admin token
        const invoices = await db.all(
            'SELECT * FROM invoices ORDER BY created_at DESC'
        );

        res.json(invoices);
    } catch (error) {
        console.error('Error fetching admin invoices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update invoice status (admin)
app.put('/api/admin/invoices/:invoiceNumber/status', async (req, res) => {
    try {
        const { invoiceNumber } = req.params;
        const { status, adminNotes } = req.body;

        const oldInvoice = await db.get('SELECT * FROM invoices WHERE invoice_number = ?', [invoiceNumber]);
        
        if (!oldInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        await db.run(
            'UPDATE invoices SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE invoice_number = ?',
            [status, adminNotes, invoiceNumber]
        );

        const updatedInvoice = await db.get('SELECT * FROM invoices WHERE invoice_number = ?', [invoiceNumber]);

        logAudit('update_status', 'invoices', oldInvoice.id, oldInvoice, updatedInvoice, 'admin', req);

        // In production, send status update email to user here
        console.log(`Invoice ${invoiceNumber} status updated to ${status}`);

        res.json(updatedInvoice);
    } catch (error) {
        console.error('Error updating invoice status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get admin settings
app.get('/api/admin/settings', async (req, res) => {
    try {
        const settings = await db.all('SELECT key, value FROM admin_settings');
        const settingsObj = {};
        
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value;
        });

        res.json(settingsObj);
    } catch (error) {
        console.error('Error fetching admin settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update admin settings
app.put('/api/admin/settings', async (req, res) => {
    try {
        const { settings } = req.body;

        for (const [key, value] of Object.entries(settings)) {
            await db.run(
                'INSERT OR REPLACE INTO admin_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
                [key, value]
            );
        }

        logAudit('update_settings', 'admin_settings', null, null, settings, 'admin', req);

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating admin settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
    await initializeDatabase();
    
    server.listen(PORT, () => {
        console.log(`TPC Presale server running on port ${PORT}`);
        console.log(`Mobile app available at: http://localhost:${PORT}`);
        console.log(`API endpoints available at: http://localhost:${PORT}/api`);
    });
}

startServer().catch(console.error);

export default app;
