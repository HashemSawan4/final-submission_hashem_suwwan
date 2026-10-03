const API_URL = "http://localhost:3000/api/expenses";

function showSpinner() {
    document.getElementById("loadingSpinner")
        .classList.remove("d-none");
}

function hideSpinner() {
    document.getElementById("loadingSpinner")
        .classList.add("d-none");
}

let editingExpenseId = null;

function showError(message) {
    const errorAlert = document.getElementById("errorAlert");
    errorAlert.textContent = message;
    errorAlert.classList.remove("d-none");
}

// ========================================
// GET ALL EXPENSES
// ========================================
async function getExpenses() {
    showSpinner();

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch expenses");
        }

        const expenses = await response.json();

        updateSummary(expenses);
        displayExpenses(expenses);

    } catch (error) {
        console.error(error);
        showError("Unable to connect to the server");

    } finally {
        hideSpinner();
    }
}

// ========================================
// UPDATE SUMMARY CARDS
// ========================================
function updateSummary(expenses) {

    // Total amount
    const total = expenses.reduce((sum, expense) => {
        return sum + Number(expense.amount);
    }, 0);

    document.getElementById("totalAmount").textContent =
        total.toFixed(2);

    // Number of expenses
    document.getElementById("expenseCount").textContent =
        expenses.length;

    // Highest expense
    if (expenses.length === 0) {
        document.getElementById("highestAmount").textContent =
            "0.00";

        document.getElementById("highestTitle").textContent =
            "-";

        return;
    }

    const highestExpense = expenses.reduce((highest, expense) => {

        if (Number(expense.amount) > Number(highest.amount)) {
            return expense;
        }

        return highest;
    });

    document.getElementById("highestAmount").textContent =
        Number(highestExpense.amount).toFixed(2);

    document.getElementById("highestTitle").textContent =
        highestExpense.title;
}

function displayExpenses(expenses) {
    const tableBody =
        document.getElementById("expensesTableBody");

    tableBody.innerHTML = "";

    expenses.forEach(expense => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${expense.title}</td>
            <td>${Number(expense.amount).toFixed(2)}</td>

            <td>
                <span class="badge bg-primary">
                    ${expense.category}
                </span>
            </td>

            <td>${expense.date}</td>

            <td>
                <button
                    class="btn btn-sm btn-warning edit-btn">
                    Edit
                </button>

                <button
                    class="btn btn-danger"
                    onclick="deleteExpense(${expense.id})">
                    Delete
                </button>
            </td>
        `;

        // Find Edit button
        const editButton = row.querySelector(".edit-btn");

        // When Edit is clicked
        editButton.addEventListener("click", function () {
            openEditModal(expense);
        });

        tableBody.appendChild(row);
    });
}

// It displays the data we want to edit within the model.
function openEditModal(expense) {

    // Store the ID of the expense we are editing
    editingExpenseId = expense.id;

    // Put current expense data inside the modal
    document.getElementById("editTitle").value = expense.title;
    document.getElementById("editAmount").value = expense.amount;
    document.getElementById("editCategory").value = expense.category;

    // Convert DD-MM-YYYY to YYYY-MM-DD
    const [day, month, year] = expense.date.split("-");

    document.getElementById("editDate").value =
        `${year}-${month}-${day}`;

    // Open Bootstrap modal
    const modal = new bootstrap.Modal(
        document.getElementById("editExpenseModal")
    );

    modal.show();
}

// Save Changes
const editExpenseForm =
    document.getElementById("editExpenseForm");

editExpenseForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const title =
        document.getElementById("editTitle").value;

    const amount =
        document.getElementById("editAmount").value;

    const category =
        document.getElementById("editCategory").value;

    const date =
        document.getElementById("editDate").value;

    showSpinner();

    try {
        const response = await fetch(
            `${API_URL}/${editingExpenseId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: title.trim(),
                    amount: Number(amount),
                    category: category,
                    date: date
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        // Get fresh data from server
        await getExpenses();

        // Close modal
        const modalElement =
            document.getElementById("editExpenseModal");

        const modal =
            bootstrap.Modal.getInstance(modalElement);

        modal.hide();

    } catch (error) {
        console.error(error);

    } finally {
        hideSpinner();
    }
});

// ========================================
// CATEGORY FILTER
// ========================================
const categoryFilter =
    document.getElementById("categoryFilter");

categoryFilter.addEventListener("change", async function () {

    const selectedCategory = categoryFilter.value;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch expenses");
        }

        const expenses = await response.json();

        // If All is selected
        if (selectedCategory === "") {
            displayExpenses(expenses);
            return;
        }

        // Filter expenses by category
        const filteredExpenses = expenses.filter(expense => {
            return expense.category === selectedCategory;
        });

        // Display filtered expenses
        displayExpenses(filteredExpenses);

    } catch (error) {
        console.error(error);
    }
});

// ========================================
// ADD EXPENSE FORM
// ========================================
const expenseForm =
    document.getElementById("expenseForm");

expenseForm.addEventListener("submit", async function (event) {

    // Prevent page reload
    event.preventDefault();

    // ========================================
    // GET FORM VALUES
    // ========================================
    const title =
        document.getElementById("title").value;

    const amount =
        document.getElementById("amount").value;

    const category =
        document.getElementById("category").value;

    const date =
        document.getElementById("date").value;

    // ========================================
    // CLEAR OLD ERRORS
    // ========================================
    document.getElementById("titleError").textContent = "";
    document.getElementById("amountError").textContent = "";
    document.getElementById("categoryError").textContent = "";
    document.getElementById("dateError").textContent = "";

    // ========================================
    // VALIDATION
    // ========================================
    let isValid = true;

    // Title validation
    if (title.trim() === "") {
        document.getElementById("titleError").textContent =
            "Title is required";

        isValid = false;
    }

    // Amount validation
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
        document.getElementById("amountError").textContent =
            "Amount must be greater than 0";

        isValid = false;
    }

    // Category validation
    if (category === "") {
        document.getElementById("categoryError").textContent =
            "Please choose a category";

        isValid = false;
    }

    // Date validation
    if (date === "") {
        document.getElementById("dateError").textContent =
            "Date is required";

        isValid = false;
    }

    // Stop if validation failed
    if (!isValid) {
        return;
    }

    // ========================================
    // POST EXPENSE
    // ========================================
    try {
        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title.trim(),
                amount: Number(amount),
                category: category,
                date: date
            })
        });

        // Check server response
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        // ========================================
        // GET DATA AGAIN AFTER POST
        // ========================================
        await getExpenses();

        expenseForm.reset();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

// ========================================
// LOAD EXPENSES WHEN PAGE OPENS
// ========================================
getExpenses();

// Delete
async function deleteExpense(id) {

    try {
        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        // Get fresh data from server
        await getExpenses();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}
//darkmood
const darkModeBtn =
    document.getElementById("darkModeBtn");

darkModeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        darkModeBtn.textContent = "☀️ Light Mode";

        localStorage.setItem("theme", "dark");

    } else {

        darkModeBtn.textContent = "🌙 Dark Mode";
            localStorage.removeItem("theme");
    }

});

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark-mode");

    darkModeBtn.textContent = "☀️ Light Mode";
}








