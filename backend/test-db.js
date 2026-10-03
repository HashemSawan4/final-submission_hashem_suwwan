const pool = require("./db");

async function testDatabase() {

    try {

        const result = await pool.query("SELECT * FROM expenses");

        console.log(result.rows);

    } catch (error) {

        console.error("Database error:", error);

    } finally {

        await pool.end();

    }
}

testDatabase();