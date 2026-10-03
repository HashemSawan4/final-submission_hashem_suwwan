const express = require("express");
const cors = require("cors");



const app = express();

app.use(cors());

app.get("/api/hello", (req, res) => {

    res.json({
        message: "Hello from Express"
    });

});

app.get("/api/expenses", (req, res) => {

    const expenses = [
        {
            id: 1,
            title: "Lunch",
            amount: 4.50,
            category: "Food",
            date: "15-01-2026"
        },
        {
            id: 2,
            title: "Bus ticket",
            amount: 1.20,
            category: "Transport",
            date: "15-01-2026"
        }
    ];

    res.json(expenses);

});

app.listen(3000, () => {

    console.log("Server running on http://localhost:3000");

});