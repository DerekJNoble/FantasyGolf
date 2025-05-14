// Extract player names from Sportradar JSON
const availablePlayers = [
    "Dustin Johnson", "Jesse Mueller", "Zach Reuland", "Nick Dunlap", "Ricky Barnes",
    "Dylan Newman", "Adrien Dumont De Chassart", "Carlos Ortiz", "Brian Stuard", "Rupe Taylor",
    "Adam Hadwin", "Taylor Montgomery", "Akshay Bhatia", "Santiago De la Fuente", "Wilson Furr",
    "David Skinns", "Eli Cole", "Braden Thornberry", "Bernhard Langer", "Fred Couples",
    "Drew Doyle", "Isaiah Salinda", "Aaron Rai", "Luke Donald", "Mason Andersen",
    "Sergio Garcia", "Hayden Springer", "Matt Fitzpatrick", "Enrique Valverde", "Will Chandler",
    "Evan Harmeling", "Giacomo Fortini", "Lanto Griffin", "Troy Merritt", "Matti Schmid",
    "Bobby Gates", "George McNeill", "Adam Svensson", "Seamus Power", "Austen Christiansen",
    "Angel Ayora Fanegas", "Trent Phillips", "Frankie Capan", "Dan Bradbury", "Vince Covello",
    "Darren Fichardt", "Chris Gotterup", "Kevin Kisner", "Patrick Rodgers", "Patrick Cantlay",
    "Ben Warian", "Adam Schenk", "Greg Koch", "Jonathan Byrd", "Blaine Hale",
    "Cody Gribble", "Noah Goodwin", "Joe Highsmith", "Michael Block", "Guido Migliozzi",
    "Dawson Jones", "Norman Xiong", "Harris English", "Lucas Glover", "Evan Beck",
    "Daniel Van Tonder", "Tyrrell Hatton", "Gerardo Gómez", "Andrew Novak", "Connor Williams",
    "Paul Waring", "Rodrigo Huerta", "Willy Pumarol", "Matt Wallace", "Joseph Bramlett",
    "Francesco Molinari", "Aaron Wise", "Matthieu Pavon", "Keita Nakajima", "Henrik Stenson",
    "Ben Crane", "Kevin Yu", "Sean O'Hair", "Antoine Rozner", "Ryo Hisatsune",
    "Chris Korte", "Charl Schwartzel", "Sahith Theegala", "Dylan Naidoo", "Harrison Endycott",
    "Sungjae Im", "Philip Knowles", "Aldrich Potgieter", "Kyle Stanley", "Martin Kaymer",
    "Dean Burmester", "Tom Hoge", "Curtis Luck", "Si Woo Kim", "Cameron Davis",
    "Wyndham Clark", "Nicolai Højgaard", "Trace Crowe", "Ryan Hall", "Luke Clanton",
    "Nelson Ledesma", "Beau Hossler", "Patrick Pockels", "Benjamin James", "Sebastian Söderberg",
    "Bo Van Pelt", "Davis Thompson", "Neal Shipley", "Andrew Filbert", "Seungbin Choi",
    "Ryggs Johnston", "Max Greyserman"
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
    try {
        localStorage.setItem("teams", JSON.stringify(teams));
        console.log("Teams saved to localStorage:", teams);
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
}

// Fetch OWGR rankings
let rankingsCache = null;
async function fetchRankings() {
    const RANKINGS_URL = `https://api.sportradar.com/golf/trial/v3/en/rankings.json?api_key=${wiaNv3mo28nTGdaxI1gPtWYT7xs78MhkyVKUv4KG}`;
    try {
        const response = await fetch(RANKINGS_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        rankingsCache = data.players || [];
        console.log("Rankings fetched:", rankingsCache);
    } catch (error) {
        console.error("Error fetching rankings:", error);
        rankingsCache = [];
    }
}

// Get player ranking
function getPlayerRanking(playerName) {
    if (!rankingsCache) return "-";
    const player = rankingsCache.find(p => p.player.full_name === playerName);
    return player ? player.rank : "-";
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
            <td>${team.players[0] ? `${team.players[0]} (OWGR: ${getPlayerRanking(team.players[0])})` : '-'}</td>
            <td>${team.players[1] ? `${team.players[1]} (OWGR: ${getPlayerRanking(team.players[1])})` : '-'}</td>
            <td>${team.players[2] ? `${team.players[2]} (OWGR: ${getPlayerRanking(team.players[2])})` : '-'}</td>
            <td>${team.players[3] ? `${team.players[3]} (OWGR: ${getPlayerRanking(team.players[3])})` : '-'}</td>
            <td>${team.players[4] ? `${team.players[4]} (OWGR: ${getPlayerRanking(team.players[4])})` : '-'}</td>
            <td class="reserve">${team.reserve ? `${team.reserve} (OWGR: ${getPlayerRanking(team.reserve)})` : '-'}</td>
        `;
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

// Sportradar API configuration
const API_KEY = "wiaNv3mo28nTGdaxI1gPtWYT7xs78MhkyVKUv4KG"; // Replace with your valid key
const TOURNAMENT_ID = "680ab97b-627d-4e61-81e6-32dfbbc73e14"; // Replace with 2025 PGA Championship ID
const API_URL = `https://api.sportradar.com/golf/trial/v3/en/tournaments/${680ab97b-627d-4e61-81e6-32dfbbc73e14}/leaderboard.json?api_key=${wiaNv3mo28nTGdaxI1gPtWYT7xs78MhkyVKUv4KG}`;

// Fetch and update live results (index.html)
async function updateResults() {
    const tbody = document.getElementById("results-body");
    if (!tbody) return;
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
        tbody.innerHTML = `<tr><td colspan='5'>Error loading live scores: ${error.message}. Please check API key and Tournament ID.</td></tr>`;
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

        // Populate draft table with dropdowns
        tbody.innerHTML = "";
        draftOrder.forEach((pick, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${pick.round}</td>
                <td>${index + 1}</td>
                <td>${teams[pick.teamIndex].name}</td>
                <td>
                    <select class="player-select" data-pick="${index}">
                        <option value="">Select Player</option>
                        ${availablePlayers
                            .filter(p => !teams.flatMap(t => [...t.players, t.reserve]).includes(p))
                            .map(p => `<option value="${p}">${p}</option>`)
                            .join("")}
                    </select>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add change event to dropdowns
        const selects = document.querySelectorAll(".player-select");
        selects.forEach(select => {
            select.addEventListener("change", () => {
                const pickIndex = parseInt(select.dataset.pick);
                const teamIndex = draftOrder[pickIndex].teamIndex;
                const round = draftOrder[pickIndex].round;
                const player = select.value;

                if (player && !teams.flatMap(t => [...t.players, t.reserve]).includes(player)) {
                    if (round < 6) {
                        teams[teamIndex].players.push(player);
                    } else {
                        teams[teamIndex].reserve = player;
                    }
                    saveTeams();
                    // Update dropdown options to exclude selected player
                    updateDropdowns();
                }
            });
        });

        // Function to update dropdown options
        function updateDropdowns() {
            selects.forEach(select => {
                const currentValue = select.value;
                select.innerHTML = `
                    <option value="">Select Player</option>
                    ${availablePlayers
                        .filter(p => !teams.flatMap(t => [...t.players, t.reserve]).includes(p) || p === currentValue)
                        .map(p => `<option value="${p}" ${p === currentValue ? "selected" : ""}>${p}</option>`)
                        .join("")}
                `;
            });
        }

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
    fetchRankings().then(() => {
        populateRosters();
        updateResults();
        initializeDraft();
        if (document.getElementById("results-body")) {
            setInterval(updateResults, 60000); // Update every 60 seconds
        }
    });
});
