let cache = {}; // Stockage local pour les appels API
let selectedCurrencies = []; // Monnaies sélectionnées pour les rapports
let selectedCryptos = []; // Liste des cryptomonnaies sélectionnées

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

// Navigation dynamique
function navigate(page) {
    const content = document.getElementById("content");
    content.innerHTML = ""; // Clear previous content

    if (page === "home") renderHomePage(content);
    else if (page === "about") renderAboutPage(content);
    else if (page === "currencies") renderCurrenciesPage(content);
    else if (page === "reports") renderReportsPage(content);
}

// Page d'accueil
function renderHomePage(container) {
    container.innerHTML = `
        <h2>Bienvenue sur Crypto Dashboard</h2>
        <p>Suivez les dernières tendances des monnaies virtuelles.</p>
    `;
}

// Page "À propos"
function renderAboutPage(container) {
    container.innerHTML = `
        <div class="container mt-5">
          
            <!-- Section Informations Personnelles -->
            <section class="mb-5">
                <div class="row align-items-center">
                    <div class="col-md-4 text-center">
                        <img src="english.jpeg" alt="Photo personnelle" class="img-fluid rounded-circle shadow" style="max-width: 150px;">
                    </div>
                    <div class="col-md-8">
                        <h2>Mes informations</h2>
                        <p><strong>Nom :</strong> [Votre nom complet]</p>
                        <p><strong>E-mail :</strong> exemple@email.com</p>
                        <p><strong>Téléphone :</strong> +33 6 12 34 56 78</p>
                        <p>
                            Je suis passionné par le développement web et j'ai choisi de développer ce projet pour explorer le potentiel des technologies modernes 
                            comme JavaScript, les API REST, et les graphiques interactifs. Mon objectif est de proposer une application intuitive et fonctionnelle 
                            pour suivre les devises en temps réel.
                        </p>
                    </div>
                </div>
                <div class="mb-5">
                <h2>Description du projet</h2>
                <p>
                    Ce projet est une application front-end permettant de suivre les devises en temps réel. 
                    Elle inclut des fonctionnalités comme la recherche de devises, l'affichage dynamique des informations, 
                    et la gestion des rapports en temps réel via des graphiques interactifs.
                </p>
                <p>
                    <strong>Technologies utilisées :</strong> HTML5, CSS3, JavaScript, jQuery, Bootstrap, API REST, Canvas.js.
                </p>
            </div>

            <!-- Section Navigation -->
            <div class="text-center">
                <a href="#" onclick="navigate('reports')" class="btn btn-primary">Voir le rapport en direct des cryptomonnaie selectionnées</a>
                <a href="#" onclick="navigate('currencies')" class="btn btn-secondary">Voir la liste & les infos des 100 plus grosse cryptomonnaie</a>
            </div>
            </section>
        </div>
    `;
}

const cryptoCache = {}; // Pour stocker les données en cache avec un timestamp

async function renderCurrenciesPage(container) {
    container.innerHTML = `
        <h2>Liste des Cryptomonnaies</h2>
        <div id="filter-selected" class="form-check form-switch" style="margin: 10px; display: flex; align-items: center; gap: 10px;">
        <input class="form-check-input" type="checkbox" id="filterSwitch" onchange="filterSelectedCurrencies()" style="width: 50px; height: 25px;">
        <label class="form-check-label" for="filterSwitch" style="font-weight: bold; font-size: 1.1em;">
            Afficher uniquement les cryptomonnaies sélectionnées
        </label>
        </div>
        <div id="currenciesContainer" class="currency-list"></div>
    `;

    // Charger les cryptos sélectionnées depuis localStorage
    const savedCryptos = JSON.parse(localStorage.getItem("selectedCryptos")) || [];
    selectedCryptos = savedCryptos; // Synchroniser avec la liste globale

    // Récupérer les 100 cryptomonnaies les plus connues (par capitalisation boursière)
    try {
        if (!cryptoCache.topCryptos) {
            const response = await fetch(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
            );

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données.");
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
                <p>Prix actuel: $${coin.current_price.toLocaleString()}</p>
                <div class="toggle-container">
                    <label class="switch">
                        <input type="checkbox" ${isSelected ? "checked" : ""} onchange="toggleCrypto('${coin.id}', '${coin.name}')">
                        <span class="slider"></span>
                    </label>
                </div>
                <div id="collapse-${coin.id}" class="collapse-section" style="display: none;"></div>
                <button onclick="toggleMoreInfo('${coin.id}')">Plus d'infos</button>
            `;
            list.appendChild(card);
        });
    } catch (error) {
        // Afficher une alerte en cas d'erreur
        alert(
            "La page n'a pas pu charger les données. Veuillez attendre quelques secondes et rafraîchir la page."
        );
        console.error("Erreur lors du chargement des données de l'API :", error);
    }
}

function toggleCrypto(coinId, coinName) {
    const index = selectedCryptos.findIndex((crypto) => crypto.id === coinId);

    if (index === -1) {
        // Vérifier si la limite de 5 est atteinte
        if (selectedCryptos.length >= 5) {
            const selectedNames = selectedCryptos.map((crypto) => crypto.name).join(", ");
            alert(`Vous ne pouvez sélectionner que 5 cryptomonnaies. Les cryptomonnaies sélectionnées sont : ${selectedNames}. Veuillez en désélectionner une pour en ajouter une nouvelle.`);

            // Empêcher le bouton de passer en mode ON
            const toggleInput = document.querySelector(`input[onchange="toggleCrypto('${coinId}', '${coinName}')"]`);
            if (toggleInput) {
                toggleInput.checked = false; // Réinitialise l'état du bouton
            }
            return;
        }

        // Ajouter la cryptomonnaie si la limite n'est pas atteinte
        selectedCryptos.push({ id: coinId, name: coinName });
    } else {
        // Supprimer la cryptomonnaie si elle est déjà sélectionnée
        selectedCryptos.splice(index, 1);
    }

    // Mettre à jour `localStorage`
    localStorage.setItem("selectedCryptos", JSON.stringify(selectedCryptos));
    console.log("Cryptos sélectionnées :", selectedCryptos);
}
function filterSelectedCurrencies() {
    const filterSwitch = document.getElementById("filterSwitch");
    const cards = document.querySelectorAll(".currency-card");

    if (filterSwitch.checked) {
        // Afficher uniquement les cryptomonnaies sélectionnées
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
        // Réinitialiser l'affichage pour toutes les cryptomonnaies
        cards.forEach((card) => {
            card.style.display = "block";
        });
    }
}

async function toggleMoreInfo(coinId) {
    const collapseSection = document.getElementById(`collapse-${coinId}`);
    const now = new Date().getTime();

    // Si le contenu est déjà ouvert, le fermer
    if (collapseSection.style.display === "block") {
        collapseSection.style.display = "none";
        return;
    }

    // Barre de progression
    collapseSection.innerHTML = `
        <div class="progress-container">
            <div class="progress-bar" id="progress-bar-${coinId}" style="width: 0%;"></div>
        </div>
    `;
    collapseSection.style.display = "block";

    // Progression animée
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
        // Vérification du cache
        if (!cryptoCache[coinId] || now - cryptoCache[coinId].timestamp > 120000) {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
            if (!response.ok) throw new Error("Erreur lors de la récupération des données");
            const data = await response.json();

            // Mise à jour du cache
            cryptoCache[coinId] = {
                data,
                timestamp: now,
            };
        }

        // Afficher les données récupérées
        const coin = cryptoCache[coinId].data;
        collapseSection.innerHTML = `
            <div class="collapse-content">
                <img src="${coin.image.small}" alt="${coin.name}" style="width: 50px; height: 50px; margin-bottom: 10px;"/>
                <p><strong>USD :</strong> ${coin.market_data.current_price.usd.toLocaleString()} $</p>
                <p><strong>EUR :</strong> ${coin.market_data.current_price.eur.toLocaleString()} €</p>
                <p><strong>ILS :</strong> ${coin.market_data.current_price.ils.toLocaleString()} ₪</p>
            </div>
        `;
    } catch (error) {
        collapseSection.innerHTML = `
            <div class="collapse-content">
                <p>Erreur lors du chargement des données. Veuillez réessayer.</p>
            </div>
        `;
        console.error(error);
    }
}

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

async function showMoreInfo(coinId) {
    if (!cache[coinId]) {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
        cache[coinId] = await response.json();
    }
    const coin = cache[coinId];
    alert(`
        Nom: ${coin.name}
        Symbole: ${coin.symbol.toUpperCase()}
        Prix actuel (USD): $${coin.market_data.current_price.usd.toLocaleString()}
        Volume total (24h): $${coin.market_data.total_volume.usd.toLocaleString()}
        Fourniture totale: ${coin.market_data.total_supply ? coin.market_data.total_supply.toLocaleString() : "Non disponible"}
    `);
}

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

// Fonction pour afficher plus d'infos sur une monnaie
async function showMoreInfo(coinId) {
    if (!cache[coinId]) {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
        cache[coinId] = await response.json();
    }
    const coin = cache[coinId];
    alert(`Prix en USD: $${coin.market_data.current_price.usd}`);
}

// Ajout ou suppression des monnaies dans le rapport
function toggleReport(coinId, coinName) {
    if (selectedCurrencies.length >= 5 && !selectedCurrencies.includes(coinId)) {
        alert("Vous ne pouvez pas ajouter plus de 5 monnaies.");
        return;
    }

    if (selectedCurrencies.includes(coinId)) {
        selectedCurrencies = selectedCurrencies.filter((id) => id !== coinId);
        alert(`${coinName} retiré du rapport.`);
    } else {
        selectedCurrencies.push(coinId);
        alert(`${coinName} ajouté au rapport.`);
    }
}

// Page des rapports
// Page des rapports
async function renderReportsPage(container) {
    container.innerHTML = `
        <h2>Rapports</h2>
        <p>Ce graphique affiche l'évolution des prix actuels (en USD) pour les cryptomonnaies sélectionnées.</p>
        <canvas id="cryptoChart" width="800" height="600"></canvas>
    `;

    if (selectedCryptos.length === 0) {
        container.innerHTML += `<p>Aucune cryptomonnaie sélectionnée.</p>`;
        return;
    }

    // Réinitialiser les données
    const cryptoPricesHistory = selectedCryptos.reduce((acc, crypto) => {
        acc[crypto.id] = [];
        return acc;
    }, {});

    const ctx = document.getElementById("cryptoChart").getContext("2d");
    const chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [], // Les labels seront les timestamps
            datasets: selectedCryptos.map((crypto) => ({
                id: crypto.id,
                label: crypto.name,
                data: [],
                borderColor: getRandomColor(), // Couleur unique pour chaque devise
                borderWidth: 2,
                fill: false,
            })),
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top', // Affiche la légende au-dessus du graphique
                },
            },
            scales: {
                y: {
                    beginAtZero: false, // Représentation des prix réels
                    title: {
                        display: true,
                        text: "Prix (USD)",
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: "Temps (HH:mm:ss)",
                    },
                },
            },
        },
    });

    // Fonction pour récupérer les prix en USD depuis l'API CoinGecko
    async function fetchCryptoPrices() {
        try {
            const ids = selectedCryptos.map((crypto) => crypto.id).join(',');
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
            console.log("URL API:", url); // Vérifiez l'URL
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données depuis l'API CoinGecko");
            }

            const data = await response.json();
            console.log("Données API :", data); // Vérifiez les données retournées
            return data;
        } catch (error) {
            console.error("Erreur API :", error);
            return null;
        }
    }

    // Fonction pour mettre à jour les données du graphique
    async function updateChartData(chart) {
        const data = await fetchCryptoPrices();
        if (!data) return;

        // Ajouter les nouvelles données pour chaque cryptomonnaie
        selectedCryptos.forEach((crypto) => {
            const price = data[crypto.id]?.usd || 0;
            console.log(`Prix ajouté pour ${crypto.id} : ${price}`);
            cryptoPricesHistory[crypto.id].push(price);

            // Limiter l'historique à 20 points
            if (cryptoPricesHistory[crypto.id].length > 20) {
                cryptoPricesHistory[crypto.id].shift();
            }
        });

        // Ajouter un nouveau timestamp
        const currentTime = new Date().toLocaleTimeString();
        chart.data.labels.push(currentTime);
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
        }

        // Mettre à jour les données des datasets
        chart.data.datasets.forEach((dataset) => {
            console.log("Mise à jour dataset:", dataset.label);
            dataset.data = cryptoPricesHistory[dataset.id];
        });

        chart.update();
    }

    // Mise à jour initiale
    await updateChartData(chart);

    // Mise à jour des données toutes les 2 secondes
    const intervalId = setInterval(() => updateChartData(chart), 2000);

    // Arrêter la mise à jour lorsque l'utilisateur quitte la page
    container.addEventListener("unload", () => clearInterval(intervalId));
}

// Fonction utilitaire pour générer une couleur aléatoire
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}