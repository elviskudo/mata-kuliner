const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://user:password@localhost:5432/matakuliner',
});

async function run() {
    try {
        await client.connect();

        console.log('--- Current Time (DB) ---');
        const resTime = await client.query("SELECT NOW()");
        console.log(resTime.rows[0]);

        console.log('--- Menu Snapshots (All) ---');
        const resSnap = await client.query('SELECT id, "closingDate", "originalMenuId", name FROM owner.menu_snapshot ORDER BY id DESC LIMIT 10');
        console.log(resSnap.rows);

        console.log('--- Daily Closing (All) ---');
        const resClosing = await client.query('SELECT id, date FROM owner.daily_closing ORDER BY id DESC LIMIT 5');
        console.log(resClosing.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
