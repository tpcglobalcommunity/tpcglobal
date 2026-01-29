import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function runMigration() {
    let db;
    try {
        // Open database
        db = await open({
            filename: './data/presale.db',
            driver: sqlite3.Database
        });

        console.log('Running PROD-LOCK migration...\n');

        // 1) Add missing stage field
        try {
            await db.exec(`ALTER TABLE invoices ADD COLUMN stage INTEGER DEFAULT 1`);
            console.log('✅ Added stage field to invoices table');
        } catch (error) {
            if (error.message.includes('duplicate column name')) {
                console.log('ℹ️ Stage field already exists');
            } else {
                throw error;
            }
        }

        // 2) Update admin settings
        await db.exec(`
            INSERT OR REPLACE INTO admin_settings (key, value, updated_at) VALUES
            ('stage', '1', CURRENT_TIMESTAMP),
            ('presale_stage', '1', CURRENT_TIMESTAMP),
            ('ADMIN_USER_IDS', '["admin@example.com"]', CURRENT_TIMESTAMP)
        `);
        console.log('✅ Updated admin settings');

        // 3) Add indexes
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_invoices_stage ON invoices(stage);
            CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
            CREATE INDEX IF NOT EXISTS idx_invoices_user_email ON invoices(user_email);
        `);
        console.log('✅ Created performance indexes');

        // 4) Update existing invoices
        const result = await db.run(`UPDATE invoices SET stage = 1 WHERE stage IS NULL`);
        if (result.changes > 0) {
            console.log(`✅ Updated ${result.changes} existing invoices with stage = 1`);
        } else {
            console.log('ℹ️ No existing invoices to update');
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        if (db) {
            await db.close();
        }
    }
}

// Run migration
runMigration();
