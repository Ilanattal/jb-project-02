let cache = {}; // Local storage for API calls
let selectedCurrencies = []; // Currencies selected for reports
let selectedCryptos = []; // List of selected cryptocurrencies

document.addEventListener("DOMContentLoaded", () => {
    navigate("currencies");
});

document.querySelectorAll('nav button').forEach((button) => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = button.getAttribute('onclick').match(/'([^']+)'/)[1];
        const target = document.getElementById(sectionId);

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
            });
        }
    });
});

function filterCurrencies() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const cards = document.querySelectorAll(".currency-card");

    cards.forEach((card) => {
        const coinName = card.querySelector("p").innerText.toLowerCase();
        const coinSymbol = card.querySelector("h3").innerText.toLowerCase();
        if (coinName.includes(input) || coinSymbol.includes(input)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// Dynamic navigation
function navigate(page) {
    const content = document.getElementById("content");
    content.innerHTML = ""; // Clear previous content

    if (page === "home") renderHomePage(content);
    else if (page === "about") renderAboutPage(content);
    else if (page === "currencies") renderCurrenciesPage(content);
    else if (page === "reports") renderReportsPage(content);
}

// Home page
function renderHomePage(container) {
    container.innerHTML = `
        <h2>Welcome to Crypto Dashboard</h2>
        <p>Track the latest trends in virtual currencies.</p>
    `;
}

// "About" page
function renderAboutPage(container) {
    container.innerHTML = `
        <div class="container mt-5">
          
            <!-- Personal Information Section -->
            <section class="mb-5">
                <div class="row-align-items-center">
                    <div class="col-md-4 text-center">
                        <img src="english.jpeg" alt="Personal photo" class="img-fluid rounded-circle shadow" style="max-width: 150px;">
                    </div>
                    <div class="col-md-8">
                        <h2>My Information</h2>
                        <p><strong>Name:</strong> Ilan ATTAL</p>
                        <p><strong>Email:</strong> i29attal.attal@gmail.com</p>
                        <p><strong>Phone:</strong> +972 538303282</p>
                    </div>
                </div>
                <div class="mb-5">
                <h2>Project Description</h2>
                <p>
                    This project is a front-end application for tracking real-time currencies. 
                    It includes features like currency search, dynamic information display, 
                    and real-time report management through interactive charts.
                </p>
                <p>
                    <strong>Technologies used:</strong> HTML5, CSS3, JavaScript, Bootstrap, REST API, Canvas.js.
                </p>
            </div>

            <!-- Navigation Section -->
            <div class="text-center">
                <a href="#" onclick="navigate('reports')" class="btn btn-primary">View live report of selected cryptocurrencies</a>
                <a href="#" onclick="navigate('currencies')" class="btn btn-secondary">See the list & details of the top 100 cryptocurrencies</a>
            </div>
            </section>
        </div>
    `;
}

const cryptoCache = {}; // Cache for storing data with a timestamp

async function renderCurrenciesPage(container) {
    container.innerHTML = `
        <h2>Cryptocurrency List</h2>
        <div class="search-container">
        <input type="text" id="searchInput" placeholder="Search" oninput="filterCurrencies()">
        <button onclick="filterCurrencies()">Search</button>
         </div>
        <div id="filter-selected" class="form-check form-switch" style="margin: 10px; display: flex; align-items: center; gap: 10px;">
        <input class="form-check-input" type="checkbox" id="filterSwitch" onchange="filterSelectedCurrencies()" style="width: 50px; height: 25px;">
        <label class="form-check-label" for="filterSwitch" style="font-weight: bold; font-size: 1.1em;">
            Show only selected cryptocurrencies
        </label>
        </div>
        <div id="currenciesContainer" class="currency-list"></div>
    `;

    // Load selected cryptocurrencies from localStorage
    const savedCryptos = JSON.parse(localStorage.getItem("selectedCryptos")) || [];
    selectedCryptos = savedCryptos; // Sync with global list

    // Fetch the 100 most popular cryptocurrencies (by market cap)
    try {
        if (!cryptoCache.topCryptos) {
            const response = await fetch(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
            );

            if (!response.ok) {
                throw new Error("Error retrieving data.");
            }

            cryptoCache.topCryptos = await response.json();
        }

        const list = document.getElementById("currenciesContainer");
        cryptoCache.topCryptos.forEach((coin) => {
            const isSelected = selectedCryptos.some((crypto) => crypto.id === coin.id);
            const card = document.createElement("div");
            card.className = "currency-card";
            card.innerHTML = `
                <h3>${coin.symbol.toUpperCase()}</h3>
                <p>${coin.name}</p>
                <p>Current Price: $${coin.current_price.toLocaleString()}</p>
                <div class="toggle-container">
                    <label class="switch">
                        <input type="checkbox" ${isSelected ? "checked" : ""} onchange="toggleCrypto('${coin.id}', '${coin.name}')">
                        <span class="slider"></span>
                    </label>
                </div>
                <div id="collapse-${coin.id}" class="collapse-section" style="display: none;"></div>
                <button onclick="toggleMoreInfo('${coin.id}')">More Info</button>
            `;
            list.appendChild(card);
        });
    } catch (error) {
        // Show an alert in case of an error
        alert(
            "The page couldn't load the data. Please wait a few seconds and refresh the page."
        );
        console.error("Error loading API data:", error);
    }
}

function toggleCrypto(coinId, coinName) {
    const index = selectedCryptos.findIndex((crypto) => crypto.id === coinId);

    if (index === -1) {
        // Check if the limit of 5 is reached
        if (selectedCryptos.length >= 5) {
            const selectedNames = selectedCryptos.map((crypto) => crypto.name).join(", ");
            alert(`You can only select 5 cryptocurrencies. The selected cryptocurrencies are: ${selectedNames}. Please deselect one to add a new one.`);

            // Prevent the switch from toggling ON
            const toggleInput = document.querySelector(`input[onchange="toggleCrypto('${coinId}', '${coinName}')"]`);
            if (toggleInput) {
                toggleInput.checked = false; // Reset the switch state
            }
            return;
        }

        // Add the cryptocurrency if the limit is not reached
        selectedCryptos.push({ id: coinId, name: coinName });
    } else {
        // Remove the cryptocurrency if it's already selected
        selectedCryptos.splice(index, 1);
    }

    // Update localStorage
    localStorage.setItem("selectedCryptos", JSON.stringify(selectedCryptos));
    console.log("Selected Cryptos:", selectedCryptos);
}

function filterSelectedCurrencies() {
    const filterSwitch = document.getElementById("filterSwitch");
    const cards = document.querySelectorAll(".currency-card");

    if (filterSwitch.checked) {
        // Show only selected cryptocurrencies
        cards.forEach((card) => {
            const coinId = card.querySelector("input[type='checkbox']").getAttribute("onchange").match(/'([^']+)'/)[1];
            const isSelected = selectedCryptos.some((crypto) => crypto.id === coinId);

            if (isSelected) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    } else {
        // Reset display for all cryptocurrencies
        cards.forEach((card) => {
            card.style.display = "block";
        });
    }
}

async function toggleMoreInfo(coinId) {
    const collapseSection = document.getElementById(`collapse-${coinId}`);
    const now = new Date().getTime();

    // Close the content if already open
    if (collapseSection.style.display === "block") {
        collapseSection.style.display = "none";
        return;
    }

    // Progress bar
    collapseSection.innerHTML = `
        <div class="progress-container">
            <div class="progress-bar" id="progress-bar-${coinId}" style="width: 0%;"></div>
        </div>
    `;
    collapseSection.style.display = "block";

    // Animate the progress bar
    const progressBar = document.getElementById(`progress-bar-${coinId}`);
    let progress = 0;
    const interval = setInterval(() => {
        if (progress >= 100) {
            clearInterval(interval);
        } else {
            progress += 10;
            progressBar.style.width = `${progress}%`;
        }
    }, 100);

    try {
        // Check the cache
        if (!cryptoCache[coinId] || now - cryptoCache[coinId].timestamp > 120000) {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
            if (!response.ok) throw new Error("Error fetching data");
            const data = await response.json();

            // Update the cache
            cryptoCache[coinId] = {
                data,
                timestamp: now,
            };
        }

        // Display the fetched data
        const coin = cryptoCache[coinId].data;
        collapseSection.innerHTML = `
            <div class="collapse-content">
                <img src="${coin.image.small}" alt="${coin.name}" style="width: 50px; height: 50px; margin-bottom: 10px;"/>
                <p><strong>USD:</strong> ${coin.market_data.current_price.usd.toLocaleString()} $</p>
                <p><strong>EUR:</strong> ${coin.market_data.current_price.eur.toLocaleString()} €</p>
                <p><strong>ILS:</strong> ${coin.market_data.current_price.ils.toLocaleString()} ₪</p>
            </div>
        `;
    } catch (error) {
        collapseSection.innerHTML = `
            <div class="collapse-content">
                <p>Error loading data. Please try again.</p>
            </div>
        `;
        console.error(error);
    }
}

// Reports Page
async function renderReportsPage(container) {
    container.innerHTML = `
        <h2>Reports</h2>
        <p>This chart displays the real-time price evolution (in USD) of selected cryptocurrencies.</p>
        <canvas id="cryptoChart" width="800" height="600"></canvas>
    `;

    if (selectedCryptos.length === 0) {
        container.innerHTML += `<p>No cryptocurrency selected.</p>`;
        return;
    }

    // Reset the data
    const cryptoPricesHistory = selectedCryptos.reduce((acc, crypto) => {
        acc[crypto.id] = [];
        return acc;
    }, {});

    const ctx = document.getElementById("cryptoChart").getContext("2d");
    const chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: selectedCryptos.map((crypto) => ({
                id: crypto.id,
                label: crypto.name,
                data: [],
                borderColor: getRandomColor(),
                borderWidth: 2,
                fill: false,
            })),
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: "Price (USD)",
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: "Time (HH:mm:ss)",
                    },
                },
            },
        },
    });

    async function fetchCryptoPrices() {
        try {
            const ids = selectedCryptos.map((crypto) => crypto.id).join(',');
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Error fetching data from CoinGecko API");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("API Error:", error);
            return null;
        }
    }

    async function updateChartData(chart) {
        const data = await fetchCryptoPrices();
        if (!data) return;

        selectedCryptos.forEach((crypto) => {
            const price = data[crypto.id]?.usd || 0;
            cryptoPricesHistory[crypto.id].push(price);

            if (cryptoPricesHistory[crypto.id].length > 20) {
                cryptoPricesHistory[crypto.id].shift();
            }
        });

        const currentTime = new Date().toLocaleTimeString();
        chart.data.labels.push(currentTime);
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
        }

        chart.data.datasets.forEach((dataset) => {
            dataset.data = cryptoPricesHistory[dataset.id];
        });

        chart.update();
    }

    await updateChartData(chart);
    const intervalId = setInterval(() => updateChartData(chart), 2000);

    container.addEventListener("unload", () => clearInterval(intervalId));
}

// Utility function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}