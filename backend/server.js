const express = require("express");
const cors = require("cors");

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

//get all expenses
app.get("/api/expenses", async (req, res) => {

    try {

        const result = await pool.query(`
    SELECT
        id,
        title,
        amount,
        category,
        TO_CHAR(date, 'DD-MM-YYYY') AS date
    FROM expenses
    ORDER BY id
`);
        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch expenses"
        });
    }
});


//get  expenses by id
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

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch expense"
        });
    }
});


//adding an expense
app.post("/api/expenses", async (req, res) => {

    const { title, amount, category, date } = req.body;

    // Check required fields
    if (!title || !amount || !category || !date) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    // Check amount
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
            message: "Amount must be a number greater than 0"
        });
    }

    // Allowed categories
    const allowedCategories = [
        "Food",
        "Transport",
        "Bills",
        "Entertainment",
        "Other"
    ];

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({
            message: "Invalid category"
        });
    }

    try {

        const result = await pool.query(
            `
            INSERT INTO expenses
                (title, amount, category, date)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                id,
                title,
                amount,
                category,
                TO_CHAR(date, 'DD-MM-YYYY') AS date
            `,
            [title.trim(), amount, category, date]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to create expense"
        });
    }
});


// Update an expense
app.put("/api/expenses/:id", async (req, res) => {

    const { id } = req.params;
    const { title, amount, category, date } = req.body;

    // Check ID
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    // Check required fields
    if (!title || !amount || !category || !date) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    // Check amount
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
            message: "Amount must be a number greater than 0"
        });
    }

    // Allowed categories
    const allowedCategories = [
        "Food",
        "Transport",
        "Bills",
        "Entertainment",
        "Other"
    ];

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({
            message: "Invalid category"
        });
    }

    try {

        const result = await pool.query(
            `
            UPDATE expenses
            SET
                title = $1,
                amount = $2,
                category = $3,
                date = $4
            WHERE id = $5
            RETURNING
                id,
                title,
                amount,
                category,
                TO_CHAR(date, 'DD-MM-YYYY') AS date
            `,
            [title.trim(), amount, category, date, id]
        );

        // ID doesn't exist
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update expense"
        });
    }
});


// Delete an expense
app.delete("/api/expenses/:id", async (req, res) => {

    const { id } = req.params;

    // Check ID
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    try {

        const result = await pool.query(
            `
            DELETE FROM expenses
            WHERE id = $1
            RETURNING
                id,
                title,
                amount,
                category,
                TO_CHAR(date, 'DD-MM-YYYY') AS date
            `,
            [id]
        );

        // ID doesn't exist
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        // Successfully deleted
        res.status(200).json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to delete expense"
        });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});