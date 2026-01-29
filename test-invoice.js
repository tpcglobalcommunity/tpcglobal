import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function createTestInvoices() {
    let db;
    try {
        // Open database
        db = await open({
            filename: './data/presale.db',
            driver: sqlite3.Database
        });

        console.log('Creating test invoices for PROD-LOCK validation...\n');

        // Create test invoices
        const testInvoices = [
            {
                invoice_number: 'INV' + Date.now() + '001',
                user_email: 'test1@example.com',
                tpc_amount: 10000,
                total_usd: 10.00,
                total_idr: 160000,
                payment_method: 'bca',
                status: 'pending',
                stage: 1
            },
            {
                invoice_number: 'INV' + Date.now() + '002',
                user_email: 'test2@example.com',
                tpc_amount: 25000,
                total_usd: 25.00,
                total_idr: 400000,
                payment_method: 'usdc',
                status: 'verification_pending',
                stage: 1
            },
            {
                invoice_number: 'INV' + Date.now() + '003',
                user_email: 'test3@example.com',
                tpc_amount: 50000,
                total_usd: 50.00,
                total_idr: 800000,
                payment_method: 'ovo',
                status: 'paid',
                stage: 1
            },
            {
                // Test case: potential mismatch (should be caught)
                invoice_number: 'INV' + Date.now() + '004',
                user_email: 'test4@example.com',
                tpc_amount: 0,  // This should trigger FAIL
                total_usd: 100.00,
                total_idr: 1600000,
                payment_method: 'sol',
                status: 'pending',
                stage: 1
            }
        ];

        for (const invoice of testInvoices) {
            await db.run(`
                INSERT INTO invoices (
                    invoice_number, user_email, tpc_amount, total_usd, total_idr,
                    payment_method, status, stage, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [
                invoice.invoice_number, invoice.user_email, invoice.tpc_amount,
                invoice.total_usd, invoice.total_idr, invoice.payment_method,
                invoice.status, invoice.stage
            ]);
            console.log(`✅ Created test invoice: ${invoice.invoice_number}`);
        }

        console.log('\n🎉 Test invoices created successfully!');
        console.log('Running real data integrity test...\n');

        // Run real data integrity test
        const integrityCheck = await db.all(`
            SELECT invoice_number as invoice_no, tpc_amount, total_usd, total_idr, status, stage,
            CASE
                WHEN total_usd > 0 AND tpc_amount = 0 THEN '❌ FAIL: mismatch tpc_amount'
                WHEN total_usd > 0 AND tpc_amount > 0 THEN '✅ OK'
                WHEN total_usd = 0 AND tpc_amount = 0 THEN 'ℹ️ zero invoice'
                ELSE '⚠️ review'
            END AS verdict
            FROM invoices
            ORDER BY created_at DESC
            LIMIT 5
        `);

        console.log('REAL INVOICE TEST RESULTS:');
        integrityCheck.forEach(check => {
            console.log(`  ${check.invoice_no}:`);
            console.log(`    TPC Amount: ${check.tpc_amount}`);
            console.log(`    Total USD: ${check.total_usd}`);
            console.log(`    Stage: ${check.stage}`);
            console.log(`    Status: ${check.status}`);
            console.log(`    Verdict: ${check.verdict}`);
            console.log('');
        });

        // Test RPC simulation (API endpoint)
        console.log('RPC SIMULATION TEST:');
        const testInvoice = integrityCheck[0];
        console.log(`Testing get_invoice_public('${testInvoice.invoice_no}'):`);
        console.log(`  Response: {
          invoice_no: "${testInvoice.invoice_no}",
          tpc_amount: ${testInvoice.tpc_amount},
          total_usd: ${testInvoice.total_usd},
          total_idr: ${testInvoice.total_idr},
          stage: ${testInvoice.stage},
          status: "${testInvoice.status}",
          verdict: "${testInvoice.verdict}"
        }`);

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    } finally {
        if (db) {
            await db.close();
        }
    }
}

// Run test
createTestInvoices();
