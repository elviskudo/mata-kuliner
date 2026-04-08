const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://user:password@localhost:5432/matakuliner',
});

async function run() {
    try {
        await client.connect();

        console.log('--- Store Setting (IS_STORE_OPEN) ---');
        const resSetting = await client.query("SELECT * FROM public.store_setting WHERE key = 'IS_STORE_OPEN'");
        console.log(resSetting.rows);

        console.log('--- Menu Count (Active) ---');
        const resMenu = await client.query('SELECT count(*) FROM kitchen.menu');
        console.log(resMenu.rows[0]);

        console.log('--- Daily Closing (Today) ---');
        // Assuming today is 2026-02-19 based on system time, but user might be on 18th? 
        // Let's check the last few closing records.
        const resClosing = await client.query("SELECT * FROM owner.daily_closing ORDER BY date DESC LIMIT 3");
        console.log(resClosing.rows);

        console.log('--- Menu Snapshots (Today) ---');
        const resSnap = await client.query('SELECT id, "closingDate", "originalMenuId", name FROM owner.menu_snapshot ORDER BY id DESC LIMIT 5');
        console.log(resSnap.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
