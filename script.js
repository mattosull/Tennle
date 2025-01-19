document.addEventListener('DOMContentLoaded', () => {
    let playerNames = [];
    let playerData = [];
    let randomPlayer = null;

    function formatName(originalFormat) {
        let nameWords = originalFormat.split(' ');
        nameWords = nameWords.filter(word => !/[.\d()]/.test(word));
        
        if (nameWords.length > 1) {
            let lastName = nameWords.slice(0, -1).join(' ');
            let firstName = nameWords.slice(-1)[0];
            return `${firstName} ${lastName}`;
        } else {
            return originalFormat;
        }
    }
    
    
    fetch('players.json')
        .then(response => response.json())
        .then(data => {
            playerData = data;
            playerNames = data.map(player => {
                return formatName(player.name);
            })
            randomPlayer = playerData[Math.floor(Math.random() * playerNames.length)];
            console.log(randomPlayer);
        })
        .catch(error => console.error('Error fetching player data:', error));

    const searchBar = document.getElementById('searchBar');
    const resultsList = document.getElementById('resultsList');
    const selectedPlayersDiv = document.getElementById('selected-players');
    let outOfGuesses = false;
    let guessNum = 1;
    document.getElementById('guessNumber').innerText = "GUESS " + guessNum + "/10";
    searchBar.addEventListener('input', () => {
        if(!outOfGuesses) {
        const searchText = searchBar.value.toLowerCase();
        resultsList.innerHTML = '';

        if (searchText === '') {
            resultsList.style.display = 'none';
        } else {
            resultsList.style.display = 'block';
            const filteredPlayers = playerNames.filter(playerName =>
                playerName.toLowerCase().includes(searchText)
            ).slice(0, 5);

            filteredPlayers.forEach(playerName => {
                const li = document.createElement('li');
                li.textContent = playerName;
                li.addEventListener('click', () => {
                    if(guessNum <= 10) {
                    guessNum += 1;
                    if(guessNum < 11) {
                    document.getElementById('guessNumber').innerText = "GUESS " + guessNum + "/10";
                    if(guessNum == 10) {
                        document.getElementById('guessNumber').style.color = 'red';
                    }
                    } else {
                        document.getElementById('guessNumber').innerText = "Out of guesses!";
                        outOfGuesses = true;
                    }
                    searchBar.value = '';
                    resultsList.innerHTML = '';
                    resultsList.style.display = 'none';

                    const player = playerData.find(p => {
                        return playerName === formatName(p.name);
                    })
                    
                    isMale = player.gender == "Male";
                    const label = isMale ? 'ATP Titles' : 'WTA Titles';
                    
                    const playerInfo = `
                        <div class="player-info">
                        <div class="player-info-container">
                        <img class="photo" src="${player.photo_src}" alt="${playerName}">
                        <span class="player-name">${playerName}</span>
                        </div>
                        <div class="player-stats">
                        <div class="row">
                        <div class="stat-box" id="rank">Rank<p class="value">${player.rank}</p></div>
                        <div class="stat-box" id="highest_rank">Peak Rank<p class="value">${player.highest_rank}</p></div>
                        <div class="stat-box" id="gender">Gender<p class="value">${player.gender}</p></div>
                        </div>
                        <div class="row">
                        <div class="stat-box" id="country">Country<p class="value">${player.country}</p></div>
                        <div class="stat-box" id="age">Age<p class="value">${player.age}</p></div>
                        <div class="stat-box" id="titles">${label}<p class="value">${player.titles}</p></div>
                        </div>
                        </div>
                        </div>
                        `;
                    const playerInfoDiv = document.createElement('div');
                    const green = "#5bb450"
                    const yellow = "#9b870C"
                    playerInfoDiv.innerHTML = playerInfo;
                    selectedPlayersDiv.prepend(playerInfoDiv);
                    console.log(player);
                    if(player.age <= randomPlayer.age + 3 & player.age >= randomPlayer.age - 3){
                        document.getElementById("age").style.backgroundColor = yellow;
                    }
                    if(player.rank <= randomPlayer.rank + 5 & player.rank >= randomPlayer.rank - 5){
                        document.getElementById("rank").style.backgroundColor = yellow;
                    }
                    if(player.highest_rank <= randomPlayer.highest_rank + 5 & player.highest_rank >= randomPlayer.highest_rank - 5){
                        document.getElementById("highest_rank").style.backgroundColor = yellow;
                    }
                    if(player.titles <= randomPlayer.titles + 5 & player.titles >= randomPlayer.titles - 5){
                        document.getElementById("titles").style.backgroundColor = yellow;
                    }
                    const attributesToCheck = ['age', 'rank', 'highest_rank', 'country', 'titles', 'gender'];
                    attributesToCheck.forEach(attribute => {
                        const element = document.getElementById(attribute)
                        const value = element.querySelector('.value');
                        if (!isNaN(player[attribute])) {
                            if (attribute === 'rank' || attribute === 'highest_rank') {
                                if (player[attribute] < randomPlayer[attribute]) {
                                    value.innerHTML += '<span style="font-size: 0.7em;"> ▼</span>'; 
                                } else if (player[attribute] > randomPlayer[attribute]) {
                                    value.innerHTML += '<span style="font-size: 0.7em;"> ▲</span>';

                                }
                            } else {
                                if (player[attribute] < randomPlayer[attribute]) {
                                    value.innerHTML += '<span style="font-size: 0.7em;"> ▲</span>'; 
                                    console.log(attribute + " up2: " + (player[attribute] < randomPlayer[attribute]));
                                }
                                if (player[attribute] > randomPlayer[attribute]) {
                                    value.innerHTML += '<span style="font-size: 0.7em;"> ▼</span>'; 
                                    console.log(attribute + " down2: " + (player[attribute] > randomPlayer[attribute]));
                                } 
                            }
                        }                        
                        if (player[attribute] == randomPlayer[attribute]) {
                            element.style.backgroundColor = green;
                        }
                    });
                    if(playerName == formatName(randomPlayer.name)){
                        document.getElementsByClassName('correctAnswer')[1].innerText = formatName(randomPlayer.name);
                        document.getElementById('guesses').innerText = "in " + parseInt(guessNum - 1) + " guesses.";
                        document.getElementById('winPopup').style.display = 'block';
                        outOfGuesses = true;
                    } else if (guessNum == 11) {
                        document.getElementsByClassName('correctAnswer')[0].innerText = formatName(randomPlayer.name);
                        
                        // Create the correct player profile information
                        const correctPlayerInfo = `
                        <div class="player-info">
                            <div class="player-info-container">
                                <img class="photo" src="${randomPlayer.photo_src}" alt="${formatName(randomPlayer.name)}">
                                <span class="player-name">${formatName(randomPlayer.name)}</span>
                            </div>
                            <div class="player-stats">
                                <div class="row">
                                    <div class="stat-box" id="rank">Rank<p class="value">${randomPlayer.rank}</p></div>
                                    <div class="stat-box" id="highest_rank">Peak Rank<p class="value">${randomPlayer.highest_rank}</p></div>
                                    <div class="stat-box" id="gender">Gender<p class="value">${randomPlayer.gender}</p></div>
                                </div>
                                <div class="row">
                                    <div class="stat-box" id="country">Country<p class="value">${randomPlayer.country}</p></div>
                                    <div class="stat-box" id="age">Age<p class="value">${randomPlayer.age}</p></div>
                                    <div class="stat-box" id="titles">${label}<p class="value">${randomPlayer.titles}</p></div>
                                </div>
                            </div>
                        </div>
                        `;
                        
                        // Create a div for the profile and append to the losePopup
                        const correctPlayerInfoDiv = document.createElement('div');
                        correctPlayerInfoDiv.innerHTML = correctPlayerInfo;
                        
                        // Append the profile to the lose popup
                        const losePopupContent = document.getElementById('losePopup');
                        losePopupContent.appendChild(correctPlayerInfoDiv);
                    
                        // Display the lose popup
                        document.getElementById('losePopup').style.display = 'block';
                    }
                    
                }
                });
                resultsList.appendChild(li);
            });
        }
    }
    });
    const lose = document.getElementById('losePopup');
    const win = document.getElementById('winPopup')
    const close1 = document.getElementsByClassName('close')[0];
    const close2 = document.getElementsByClassName('close')[1];

    close1.onclick = function () {
        lose.style.display = 'none';
    }

    close2.onclick = function () {
        win.style.display = 'none';
    }


    window.onclick = function (event) {
        if (event.target == lose) {
            lose.style.display = 'none';
            win.style.display = 'none';
        }
    }
});
