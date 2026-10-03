const express = require("express");
const cors = require("cors");

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.get("/api/expenses/:id", async (req, res) => {

    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    try {

        const result = await pool.query(
            `
            SELECT
                id,
                title,
                amount,
                category,
                TO_CHAR(date, 'DD-MM-YYYY') AS date
            FROM expenses
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {

        console.error("Database error:", error);

        res.status(500).json({
            message: "Database error"
        });
    }
});

app.listen(3001, () => {

    console.log(
        "Task 3 server running on http://localhost:3001"
    );

});