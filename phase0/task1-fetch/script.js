const url = "https://jsonplaceholder.typicode.com/users";

async function getUsers() {

    const response = await fetch(url);

    const data = await response.json();

    const container = document.getElementById("users-container");

    data.forEach(user => {

        const card = document.createElement("div");

        card.classList.add("col-md-4");

        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="card-body">

                    <h5 class="card-title">
                        ${user.name}
                    </h5>

                    <p class="card-text">
                        Email: ${user.email}
                    </p>

                    <p class="card-text">
                        City: ${user.address.city}
                    </p>

                </div>
            </div>
        `;

        container.appendChild(card);

    });
}

getUsers();