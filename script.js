// Sample player list (replace with 2025 PGA Championship field via Sportradar API)
const availablePlayers = [
    "Rory McIlroy", "Scottie Scheffler", "Jon Rahm", "Brooks Koepka", "Jordan Spieth",
    "Xander Schauffele", "Patrick Cantlay", "Viktor Hovland", "Justin Thomas", "Tony Finau",
    "Tiger Woods", "Dustin Johnson", "Bryson DeChambeau", "Will Zalatoris", "Max Homa",
    "Ludvig Aberg", "Hideki Matsuyama", "Cameron Smith", "Tom Kim", "Rickie Fowler",
    "Tommy Fleetwood", "Shane Lowry", "Adam Scott", "Corey Conners", "Keegan Bradley",
    "Joaquin Niemann", "Patrick Reed", "Sergio Garcia", "Brian Harman", "Si Woo Kim",
    "Cameron Young", "Wyndham Clark", "Min Woo Lee", "Akshay Bhatia", "Nick Taylor",
    "Collin Morikawa", "Sam Burns", "Matt Fitzpatrick", "Sahith Theegala", "Russell Henley",
    "Denny McCarthy", "Aaron Rai"
];

// Initialize teams
let teams = JSON.parse(localStorage.getItem("teams")) || [
    { name: "Team 1", players: [], reserve: "" },
    { name: "Team 2", players: [], reserve: "" },
    { name: "Team 3", players: [], reserve: "" },
    { name: "Team 4", players: [], reserve: "" },
    { name: "Team 5", players: [], reserve: "" },
    { name: "Team 6", players: [], reserve: "" },
    { name: "Team 7", players: [], reserve: "" }
];

// Save teams to localStorage
function saveTeams() {
    localStorage.setItem("teams", JSON.stringify(teams));
}

// Populate team rosters table (index.html)
function populateRosters() {
    const tbody = document.getElementById("rosters-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    teams.forEach(team => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="text" value="${team.name}" onchange="updateTeamName(${teams.indexOf(team)}, this.value)"></td>
            <td>${team.players[0] || '-'}</td>
            <td>${team.players[1] || '-'}</td>
            <td>${team.players[2] || '-'}</td>
            <td>${team.players[3] || '-'}</td>
            <td>${team.players[4] || '-'}</td>
            <td class="reserve">${team.reserve || '-'}</td>
<|control18|>        `;
        tbody.appendChild(row);
    });
}

// Update team name
function updateTeamName(index, newName) {
    teams[index].name = newName;
    saveTeams();
    populateRosters();
    updateResults();
}

// Sportradar API configuration (replace with your credentials)
const API_KEY = "YOUR_SPORTRADAR_API_KEY";
const TOURNAMENT_ID = "YOUR_PGA_CHAMPIONSHIP_2025_TOURNAMENT_ID";
const API_URL = `https://api.sportradar.com/golf/tournaments/${TOURNAMENT_ID}/leaderboard.json?api_key=${API_KEY}`;

// Fetch and update live results (index.html)
async function updateResults() {
    const tbody = document.getElementById("results-body");
    if (!tbody) return;
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const leaderboard = data.leaderboard || [];

        // Process each team
        const teamResults = teams.map(team => {
            let totalPosition = 0;
            let totalScore = 0;
            let playerDetails = [];

            team.players.forEach(playerName => {
                const playerData = leaderboard.find(p => p.player.full_name === playerName);
                let position = 71; // Default for missed cut or not found
                let score = 0;
                let status = "";

                if (playerData) {
                    position = playerData.position || 71;
                    score = playerData.score.par || 0;
                    status = playerData.status === "cut" ? "<span class='missed-cut'>MC</span>" : "";
                }

                totalPosition += position;
                totalScore += score;
                playerDetails.push(`${playerName} (${position}${position > 50 ? "th" : position > 20 ? "st" : position > 10 ? "nd" : position > 1 ? "rd" : "st"}, ${score >= 0 ? "+" : ""}${score}${status})`);
            });

            return { name: team.name, totalPosition, totalScore, playerDetails: playerDetails.join(", ") };
        });

        // Sort by total position
        teamResults.sort((a, b) => a.totalPosition - b.totalPosition);

        // Update table
        tbody.innerHTML = "";
        teamResults.forEach((team, rank) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${rank + 1}</td>
                <td>${team.name}</td>
                <td>${team.totalPosition}</td>
                <td>${team.totalScore >= 0 ? "+" : ""}${team.totalScore}</td>
                <td>${team.playerDetails}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching API data:", error);
        tbody.innerHTML = "<tr><td colspan='5'>Error loading live scores. Please try again later.</td></tr>";
    }
}

// Snake draft logic (draft.html)
function initializeDraft() {
    const startButton = document.getElementById("start-draft");
    const finalizeButton = document.getElementById("finalize-draft");
    const tbody = document.getElementById("draft-body");
    if (!startButton || !tbody) return;

    startButton.addEventListener("click", () => {
        // Reset teams
        teams = [
            { name: "Team 1", players: [], reserve: "" },
            { name: "Team 2", players: [], reserve: "" },
            { name: "Team 3", players: [], reserve: "" },
            { name: "Team 4", players: [], reserve: "" },
            { name: "Team 5", players: [], reserve: "" },
            { name: "Team 6", players: [], reserve: "" },
            { name: "Team 7", players: [], reserve: "" }
        ];
        saveTeams();

        // Generate draft order (snake format)
        const draftOrder = [];
        for (let round = 1; round <= 6; round++) {
            const roundOrder = round % 2 === 1 ? 
                teams.map((_, i) => i) : 
                teams.map((_, i) => i).reverse();
            roundOrder.forEach(teamIndex => {
                draftOrder.push({ round, teamIndex });
            });
        }

        // Populate draft table
        tbody.innerHTML = "";
        draftOrder.forEach((pick, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${pick.round}</td>
                <td>${index + 1}</td>
                <td>${teams[pick.teamIndex].name}</td>
                <td><input type="text" class="player-input" data-pick="${index}" placeholder="Enter player"></td>
            `;
            tbody.appendChild(row);
        });

        // Add autocomplete to inputs
        const inputs = document.querySelectorAll(".player-input");
        inputs.forEach(input => {
            input.addEventListener("input", () => {
                const value = input.value.toLowerCase();
                const suggestions = availablePlayers.filter(p => p.toLowerCase().includes(value) && !teams.flatMap(t => [...t.players, t.reserve]).includes(p));
                console.log("Suggestions for", value, ":", suggestions); // Replace with UI dropdown
            });
            input.addEventListener("change", () => {
                const pickIndex = parseInt(input.dataset.pick);
                const teamIndex = draftOrder[pickIndex].teamIndex;
                const round = draftOrder[pickIndex].round;
                const player = input.value.trim();
                if (player && availablePlayers.includes(player) && !teams.flatMap(t => [...t.players, t.reserve]).includes(player)) {
                    if (round < 6) {
                        teams[teamIndex].players.push(player);
                    } else {
                        teams[teamIndex].reserve = player;
                    }
                    saveTeams();
                }
            });
        });

        finalizeButton.style.display = "block";
    });

    finalizeButton.addEventListener("click", () => {
        if (teams.every(t => t.players.length === 5 && t.reserve)) {
            saveTeams();
            window.location.href = "index.html";
        } else {
            alert("Each team must have 5 players and 1 reserve.");
        }
    });
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
    populateRosters();
    updateResults();
    initializeDraft();
    if (document.getElementById("results-body")) {
        setInterval(updateResults, 60000); // Update every 60 seconds
    }
});