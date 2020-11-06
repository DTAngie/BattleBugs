/*----- constants -----*/
const BATTLEBUGS = {
    Alpha: {
        size: 2,
        image: "images/AlphaVirus.png"
    },
    Beta: {
        size: 3,
        image: "images/BetaVirus.png"
    },
    Gamma: {
        size: 3,
        image: "images/GammaVirus.png"
    },
    Delta: {
        size: 4,
        image: "images/DeltaVirus.png"
    },
    Epsilon: {
        size: 5,
        image: "images/EpsilonVirus.png"
    }
};
const MAX_SHOTS = 5;
const PLACEMENT_ORDER = Object.keys(BATTLEBUGS).reverse();
const GRID_SIZE = 8;
const SHOT_IMG = "images/injection.png";
const INSTRUCTIONS = "Place your bugs on the computer's board to the left. Click a spot twice to rotate it.";

/*----- app's state (variables) -----*/
let shotsLeft;
let bugLocations = {
    player: {
        Alpha: [],
        Beta: [],
        Gamma: [],
        Delta: [],
        Epsilon: []
    },
    computer: {
        Alpha: [],
        Beta: [],
        Gamma: [],
        Delta: [],
        Epsilon: []
    } 
}
let allBugsPlaced;
let selectedCells = [];
let currentBug;
let gameMessage;
let direction;
let currentTurn;
let hits = {
    player: {
        emptyCells: [],
        bugCells: [],
        shipsHit: {},
        shipsLeft: {},
        verticalShips: [],
        horizontalShips: []
    },
    computer: {
        emptyCells: [],
        bugCells: [],
        shipsHit: {},
        shipsLeft: {},
        lastHit: [],
        verticalShips: [],
        horizontalShips: []
    }
}
let gameWinner = "";
let shotGrid;
let remainingCells = [];

/*----- cached element references -----*/
const startBtnEl = document.getElementById('start');
const placeBtnEl = document.getElementById('place');
const playerGrid = document.getElementById('player-grid');
const computerGrid = document.getElementById('computer-grid');
const playerShotEl = document.getElementById('player-shots');
const computerShotEl = document.getElementById('computer-shots');
const messageEl = document.getElementById('message');
const messageContainerEl = document.getElementById("message-container");
let selectedEl;
let selectedBugBodyEls = [];
let readyToPlace;

/*----- event listeners -----*/
startBtnEl.addEventListener('click', init);
placeBtnEl.addEventListener('click', placeBug);
playerGrid.addEventListener('click', handlePlayerGridClick);
computerGrid.addEventListener('click', handleComputerGridClick);

/*----- functions -----*/
init();

function init() {
    allBugsPlaced = false;
    selectedCells = [];
    bugLocations = {
        player: {
            Alpha: [],
            Beta: [],
            Gamma: [],
            Delta: [],
            Epsilon: []
        },
        computer: {
            Alpha: [],
            Beta: [],
            Gamma: [],
            Delta: [],
            Epsilon: []
        } 
    }
    hits = {
        player: {
            emptyCells: [],
            bugCells: [],
            sunkCells: [],
            shipsHit: {},
            shipsLeft: {},
            verticalShips: [],
            horizontalShips: []
        },
        computer: {
            emptyCells: [],
            bugCells: [],
            sunkCells: [],
            shipsHit: {},
            shipsLeft: {},
            lastHit: [],
            verticalShips: [],
            horizontalShips: []
        }
    }

    currentBug = 0;
    readyToPlace = false;
    generateBoard(playerGrid, "player");
    generateBoard(computerGrid, "computer");
    currentTurn = "player";
    gameMessage = `Let's play, but first, you'll need to infect the computer. ${INSTRUCTIONS}`;
    shotsLeft = MAX_SHOTS;
    gameWinner = "";
  
    function generateBoard(grid, user){
        grid = grid.querySelector('div');
        grid.innerHTML = "";
        for(let r = GRID_SIZE; r > 0; r --){
            const row = document.createElement('div');
            row.setAttribute('class', 'grid-row');
            grid.appendChild(row);
            for(c = 1; c < GRID_SIZE + 1; c ++) {
                const cell = document.createElement('div');
                cell.setAttribute('class', 'grid-cell');
                cell.setAttribute('id', `${c}, ${r}, ${user}`);
                row.appendChild(cell);
                if(user === "computer"){
                    remainingCells.push([c, r]);
                }
            }
        }
    }
    render();
    renderMessage();
}

function render() {
    let playerCells = playerGrid.querySelectorAll('.grid-cell');

    for(let i = 0; i < playerCells.length; i ++){ 
        playerCells[i].className = "grid-cell";
    }
    playerShotEl.innerHTML = "";
    computerShotEl.innerHTML= "";

    for(let bug in bugLocations.player) {
        bugLocations.player[bug].forEach(function(point){
            let occupiedCell = document.getElementById(`${point[0]}, ${point[1]}, player`);
            occupiedCell.classList.add('placed');
        });
    }

    if(allBugsPlaced){
        if(currentTurn === "player"){
            shotGrid = playerShotEl;
        } else {
            shotGrid = computerShotEl;
        }
        for (let i = 0; i < shotsLeft; i ++){
            let shotEl = document.createElement("img");
            shotEl.className = "shot";
            shotEl.src = SHOT_IMG;
            shotGrid.appendChild(shotEl);
        }

        for(let person in hits) {
            let opponent = (person === "player") ? "computer" : "player";
            hits[person].bugCells.forEach(function(point){
                let hitCell = document.getElementById(`${point[0]}, ${point[1]}, ${opponent}`);
                hitCell.classList.add('hit');
            });

            hits[person].emptyCells.forEach(function(point){
                let hitCell = document.getElementById(`${point[0]}, ${point[1]}, ${opponent}`);
                hitCell.classList.add('missed');
            });

            hits[person].sunkCells.forEach(function(point){
                let sunkCell = document.getElementById(`${point[0]}, ${point[1]}, ${opponent}`);
                sunkCell.classList.add('sunk');
            });

            for (let sunkShip in hits[person].verticalShips){
                let ship = hits[person].verticalShips[sunkShip];
                if (ship.length === 3){
                    let sunkCellEl = document.getElementById(`${ship[0]}, ${ship[1]}, ${opponent}`);
                    sunkCellEl.innerHTML = "";
                    let sunkImageEl = document.createElement('img');
                    sunkImageEl.classList.add("sunk-bug", "vertical", sunkShip.toLowerCase());
                    sunkImageEl.src = BATTLEBUGS[sunkShip].image;
                    sunkCellEl.appendChild(sunkImageEl);
                }
            }

            for (let sunkShip in hits[person].horizontalShips){
                let ship = hits[person].horizontalShips[sunkShip];
                if (ship.length === 3){
                    let sunkCellEl = document.getElementById(`${ship[0]}, ${ship[1]}, ${opponent}`);
                    sunkCellEl.innerHTML = "";
                    let sunkImageEl = document.createElement('img');
                    sunkImageEl.classList.add("sunk-bug", "horizontal", sunkShip.toLowerCase());
                    sunkImageEl.src = BATTLEBUGS[sunkShip].image;
                    sunkCellEl.appendChild(sunkImageEl);
                }
            }
        };

    } else {
        if(currentTurn === "player"){
            let currentBugEl = document.createElement("img");
            currentBugEl.className = "bug";
            currentBugEl.src = BATTLEBUGS[PLACEMENT_ORDER[currentBug]].image;
            computerShotEl.appendChild(currentBugEl);
        }

        if(selectedBugBodyEls.length > 0){
            selectedBugBodyEls.forEach(function(cell){
                cell.classList.add('selected');
            });
        } else if(selectedEl){
            selectedEl.classList.add('unavailable');
        }
  
    }
    
    if(!readyToPlace) {
        placeBtnEl.setAttribute('disabled', 'disabled');
    } else {
        placeBtnEl.removeAttribute('disabled');
    }

    if(gameWinner){
        messageContainerEl.className = "win";
    } else {
        messageContainerEl.className = "";
    }
    renderMessage();
    
}

function handlePlayerGridClick(e){
    if(!e.target.classList.contains('grid-cell') || currentTurn !== "player" || gameWinner) {
        return;
    };

    if(!allBugsPlaced){
        selectedCells=[];
        if(e.target === selectedEl) { 
            direction = (direction === "horizontalShips") ? "verticalShips" : "horizontalShips";
            planBug(PLACEMENT_ORDER[currentBug], selectedEl.id, "player");
        } else {
            direction = "horizontalShips";
            selectedBugBodyEls = [];
            selectedEl = e.target;
            planBug(PLACEMENT_ORDER[currentBug], selectedEl.id, "player");
        }
    } else {
        gameMessage = "Click on the the computer grid to take a shot";
    }
    render();
}

function handleComputerGridClick(e){
    if(!e.target.classList.contains('grid-cell') || currentTurn !== "player" || gameWinner) {
        return;
    };
    if(e.target.classList.contains('hit') || e.target.classList.contains('missed')){
        gameMessage = "You already chose this spot. Choose another one.";
        render();
        return;
    }
    if(!allBugsPlaced){
        gameMessage = " Place your bugs on the player grid."
        render();
    } else {
        selectedCells = [];
        if(shotsLeft !== 0){
            let attackedCell = e.target.id; 
            fireShot("player", attackedCell);
        }
    }
}

function planBug(bug, cell, planner){
    let coordinates = cell.split(", ");
    let x = parseInt(coordinates[0]);
    let y = parseInt(coordinates[1]);
    selectedBugBodyEls = [];
    if(hasRoom(x,y, BATTLEBUGS[bug].size)){
        readyToPlace = true;
        gameMessage = INSTRUCTIONS;
    } else {
        selectedCells = [x,y];
        selectedBugBodyEls = [];
        gameMessage = "Not enough space. Click again to rotate or choose another spot.";
        readyToPlace = false;
        return false;
    }
    
    function hasRoom(x, y, bugSize){
        if(direction === "horizontalShips"){ 
            if(x + bugSize > GRID_SIZE + 1) {
                return false;
            }
        } else if (direction === "verticalShips") {
            if(y + bugSize > GRID_SIZE + 1) {
                return false;
            }
        }
        
        for(let i = 0; i< BATTLEBUGS[bug].size; i++){
            if(direction === "horizontalShips"){ 
                if(!noCollisions(x+i,y)){
                    return false;
                }
                selectedCells.push([x+i, y]);
                if(currentTurn === "player"){
                    selectedBugBodyEls.push(document.getElementById(`${x+i}, ${y}, ${currentTurn}`));
                }
            } else if (direction === "verticalShips"){
                if(!noCollisions(x,y+i)){
                    return false;
                }
                selectedCells.push([x, y+i]);
                if(currentTurn === "player"){
                    selectedBugBodyEls.push(document.getElementById(`${x}, ${y+i}, ${currentTurn}`));
                }
            }
        }


        function noCollisions(x,y){
            for(let i = 0; i < currentBug; i++ ){
                let placedBug = bugLocations[currentTurn][PLACEMENT_ORDER[i]];
                for(let c = 0; c < placedBug.length; c++){
                    if(placedBug[c][0] === x && placedBug[c][1] === y ){
                        return false;
                    }
                }
            }
            return true;
        }
        return true;
    }
    return true;
    
}

function placeBug(){
    if(!readyToPlace){
        return;
    }
    let opponent = (currentTurn === "player") ? "computer" : "player";
    bugLocations[currentTurn][PLACEMENT_ORDER[currentBug]] =  selectedCells.map((x) => x);
    hits[opponent].shipsLeft[PLACEMENT_ORDER[currentBug]] = selectedCells.map((x) => x);
    hits[opponent][direction][PLACEMENT_ORDER[currentBug]] = selectedCells[0];
    currentBug++;
    readyToPlace = false;

    if(currentTurn === "player" && currentBug === PLACEMENT_ORDER.length){
        readyToPlace = false;
        currentBug = 0;
        currentTurn = "computer";
        selectedCells = [];
        computerPlacement();
        gameMessage = "You have infected the computer. Please wait for computer to infect your grid."
    }
    render();
}

function fireShot(offense, cell){
    let coordinates = cell.split(", ");
    let x = parseInt(coordinates[0]);
    let y = parseInt(coordinates[1]);
    let hitData = hits[offense];

    if(currentTurn === "computer"){
        let previousHit = hitData.bugCells.findIndex(function(point){
            if(point[0] === x && point[1] === y){
                return point;
            };
        });
        if(previousHit >= 0){
            return;
        }
        previousHit = hitData.emptyCells.findIndex(function(point){
            if(point[0] === x && point[1] === y){
                return point;
            };
        });
        if(previousHit >= 0){
            return;
        }
    }

    let shipHit = wasHit(x,y);
    if(shipHit){
        hitData.bugCells.push([x,y]);
        if(!hitData.shipsHit.hasOwnProperty([shipHit[0]])){
            hitData.shipsHit[shipHit[0]] = [];
        }
        hitData.shipsHit[shipHit[0]].push([x,y]);
        hitData.shipsLeft[shipHit[0]].splice(shipHit[1], 1);
        if(hitData.shipsLeft[shipHit[0]].length === 0){
            if(hitData.verticalShips.hasOwnProperty(shipHit[0])){
                hitData.verticalShips[shipHit[0]].push('sunk');
            } else {
                hitData.horizontalShips[shipHit[0]].push('sunk');
            }
            for(let shipCells of hitData.shipsHit[shipHit[0]]){
                hitData.sunkCells.push(shipCells);
            }
            delete hitData.shipsLeft[shipHit[0]];
            if(currentTurn === "computer") {
                hitData.lastHit = [];
            }
        } else {
            if(currentTurn === "computer") {
                hitData.lastHit = [shipHit[0], x, y];
            }
        }   
    } else {
        hitData.emptyCells.push([x,y]);
    }

    if(currentTurn === "computer"){
        let targetCell = remainingCells.findIndex(function(point){
            if(point[0] === x && point[1] === y){
                return point;
            };
        });
        remainingCells.splice(targetCell, 1);
    }

    if(isWinner()){
        gameWinner = offense;
        setTimeout(function(){
            gameMessage = `${(offense === "computer") ? "Computer is" : "You are"} the winner! Press Start New Game to play again.`;
            render();
        }, 500);
        return;
    }

    shotsLeft--;
    
    if(shotsLeft === 0){
        if(currentTurn === "player"){
            currentTurn = "computer";
            shotsLeft = MAX_SHOTS;
            gameMessage = "Computer's turn.";
            render();
            setTimeout(function(){
                computerShots();

            }, 1000);
        } else {
            currentTurn = "player";
            shotsLeft = MAX_SHOTS;
            gameMessage = "Your turn.";
        }
    }

    function isWinner(){
        if(Object.keys(hitData.shipsLeft).length === 0){
            return true;
        }
        return false;
    }

    function wasHit(x, y){
        for(let ship in hitData.shipsLeft){
            let index = 0;
            for(let point of hitData.shipsLeft[ship]){
                if (point[0] === x && point[1] === y) {
                    return [ship, index];
                }
                index++;
            }
        }
        return false;
    }
    render();
}

function renderMessage(){
    if(gameMessage){
        messageEl.innerText = gameMessage;
    } else {
        messageEl.innerText = "";
    }
}

async function computerPlacement(){
    let computerStatus = await doneMoving();
    if (doneMoving) {
        setTimeout(function(){
            if(!gameWinner){
                gameMessage = "Computer has finished infecting your board. Now, start looking for those bugs on the right. The first to eliminate the infection wins!";
                currentTurn = "player";
                allBugsPlaced = true;
                render();
            }
        }, 2000);
    }

    function doneMoving(){
        for(let i = 0; i < PLACEMENT_ORDER.length; i++) {  
            bugSize = BATTLEBUGS[PLACEMENT_ORDER[i]].size;
            makeSelection();

            function makeSelection(){
                direction = (Math.ceil(Math.random()*10) > 5) ? "horizontalShips" : "verticalShips";
                selectedBugBodyEls = [];
                selectedCells = [];
                if(direction === "horizontalShips"){
                    let randomX = Math.ceil(Math.random()*(GRID_SIZE - bugSize + 1));
                    let randomY = Math.ceil(Math.random()* (GRID_SIZE));
                    if(planBug(PLACEMENT_ORDER[i], `${randomX}, ${randomY}`, "computer")){
                        placeBug();
                    } else {
                        makeSelection();
                    }

                } else if (direction === "verticalShips"){
                    let randomX = Math.ceil(Math.random()*(GRID_SIZE));
                    let randomY = Math.ceil(Math.random()* (GRID_SIZE - bugSize + 1));
                    if(planBug(PLACEMENT_ORDER[i], `${randomX}, ${randomY}`, "computer")){
                        
                        placeBug();
                    } else {
                        makeSelection();
                    }
                }
            }
        }
        return new Promise(resolve => resolve(true));
    }    
}

async function computerShots() {
    if(!gameWinner){
        let computerStatus = await doneShooting();
        if(doneShooting && currentTurn === "computer"){
            computerShots();
        }
    
        function doneShooting(){
            let x, y;
            let lastHit = hits.computer.lastHit;
            let lastX = lastHit[1];
            let lastY = lastHit[2];
            if(lastHit.length > 0 && !lastShipSunk()) {
                document.getElementById(`${lastX}, ${lastY}, computer`);                
                let possibilities = checkDirections([lastX, lastY]).sort(function(a,b){
                    return b.length - a.length;
                });
                
                if(possibilities.length === 1){
                    let targCell = possibilities[0][possibilities[0].length-1];
                    fireShot("computer", `${targCell[0]}, ${targCell[1]}`);
                    return new Promise((resolve) => {
                        setTimeout(function(){
                            resolve("done");
                        }, 2000);
                    });
                }
                
                if(possibilities[0].length === possibilities[possibilities.length-1].length){
                    let availableOptions = [];
                    let randomDirection = possibilities[Math.floor(Math.random()*possibilities.length)][0];
                    let shot = makeGuess(randomDirection, lastX, lastY);
                    fireShot("computer", `${shot[0]}, ${shot[1]}`);
                } else { 
                    let targetDirection = possibilities[0].shift();
                    if (targetDirection === "left" || targetDirection === "right"){
                        let targetCells = possibilities[0].sort(function(a,b){
                            return a[0] - b[0];
                        });
                        let leftSide = targetCells[0];
                        let rightSide = targetCells[targetCells.length - 1];

                        if(lastX === leftSide[0]){ 
                            fireShot("computer", `${rightSide[0]}, ${rightSide[1]}`);
                        } else if (lastX === rightSide[0]) {
                            fireShot("computer", `${leftSide[0]}, ${leftSide[1]}`);
                        } else {
                            let coinFlip = Math.floor(Math.random()*2);
                            if (coinFlip === 0){
                                fireShot("computer", `${rightSide[0]}, ${rightSide[1]}`);
                            } else {
                                fireShot("computer", `${leftSide[0]}, ${leftSide[1]}`);
                            }
                        }
                    }
                    if(targetDirection === "up" || targetDirection === "down"){
                        let targetCells = possibilities[0].sort(function(a,b){
                            return a[1] - b[1];
                        });
                        let downSide = targetCells[0];
                        let upSide = targetCells[targetCells.length - 1];
                        if(lastY === downSide[1]){ 
                            fireShot("computer", `${upSide[0]}, ${upSide[1]}`);
                        } else if (lastY === upSide[1]) {
                            fireShot("computer", `${downSide[0]}, ${downSide[1]}`);
                        } else {
                           let coinFlip = Math.floor(Math.random()*2);
                           if (coinFlip === 0){
                            fireShot("computer", `${upSide[0]}, ${upSide[1]}`);
                           } else {
                            fireShot("computer", `${downSide[0]}, ${downSide[1]}`);
                           }
                        }
                    }
                }
                
                function checkDirections(origin){
                    let counter = 0;
                    let possCells = [];
                    let returnArray = [];
                    let endOfLine = false;
                    let bestBet = "";
                   
                    while((origin[0] - counter) > 0 && !endOfLine){
                        let left = document.getElementById(`${origin[0] - counter}, ${origin[1]}, player`);
                        if(left.classList.contains("missed") || left.classList.contains("sunk")){
                            possCells = [];
                            endOfLine = true;
                            if(counter >= 2) {
                                bestBet = "right";
                            }
                        } else if (left.classList.contains("hit")){
                            if(origin[0] - counter === 1) {
                                possCells = [];
                                endOfLine = true;
                                if(counter >= 1) {
                                    bestBet = "right";
                                }
                            } else {
                                possCells.push([(origin[0] - counter),origin[1]]);
                                counter++;
                            }
                        } else {
                            possCells.push([(origin[0] - counter),origin[1]]);
                            endOfLine = true;
                        }
                    }
                    if (possCells.length > 0){
                        possCells.unshift("left");
                        returnArray.push(possCells);
                        possCells = [];
                    }
                    endOfLine = false;
                    counter = 0;
                    
                    while((origin[0] + counter) <= GRID_SIZE && !endOfLine){
                        let right = document.getElementById(`${origin[0] + counter}, ${origin[1]}, player`);
                        if(right.classList.contains("missed") || right.classList.contains("sunk")){
                            possCells = [];
                            endOfLine = true;
                            if(counter >= 2) {
                                bestBet = "left";
                            }          
                        } else if (right.classList.contains("hit")){
                            if(origin[0]+ counter === GRID_SIZE) {
                                possCells = [];
                                endOfLine = true;
                                if(counter >= 1) {
                                    bestBet = "left";
                                }  
                            } else {
                                possCells.push([(origin[0] + counter),origin[1]]);
                                counter++;
                            }
                        } else {
                            possCells.push([(origin[0] + counter),origin[1]]);
                            endOfLine = true;
                        }
                    }
                    if (possCells.length > 0){
                        possCells.unshift("right");
                        returnArray.push(possCells);
                        possCells = [];
                    }
                    endOfLine = false;
                    counter = 0;

                    while((origin[1] - counter) > 0 && !endOfLine){
                        let down = document.getElementById(`${origin[0]}, ${origin[1] - counter}, player`);
                        if(down.classList.contains("missed") || down.classList.contains("sunk")){
                            possCells = [];
                            endOfLine = true;
                            if(counter >= 2) {
                                bestBet = "up";
                            }
                        } else if (down.classList.contains("hit")){
                            if(origin[1] - counter === 1) {
                                possCells = [];
                                endOfLine = true;
                                if(counter >= 1) {
                                    bestBet = "up";
                                }
                            } else {
                                possCells.push([origin[0],(origin[1] - counter)]);
                                counter++;
                            }
                        } else {
                            possCells.push([origin[0],(origin[1] - counter)]);
                            endOfLine = true;
                        }
                    }
                    if (possCells.length > 0){
                        possCells.unshift("down");
                        returnArray.push(possCells);
                        possCells = [];
                    }
                    endOfLine = false;
                    counter = 0;
                    
                    while((origin[1] + counter) <= GRID_SIZE && !endOfLine){
                        let up = document.getElementById(`${origin[0]}, ${origin[1] + counter}, player`);
                        if(up.classList.contains("missed") || up.classList.contains("sunk")){
                            possCells = [];
                            endOfLine = true;
                            if(counter >= 2) {
                                bestBet = "down";
                            }
                        } else if (up.classList.contains("hit")){
                            if(origin[1]+ counter === GRID_SIZE) {
                                possCells = [];
                                endOfLine = true;
                                if(counter >= 1) {
                                    bestBet = "down";
                                }
                            } else {
                                possCells.push([origin[0],(origin[1] + counter)]);
                                counter++;
                            }
                        } else {
                            possCells.push([origin[0],(origin[1] + counter)]);
                            endOfLine = true;
                        }
                    }
                    if (possCells.length > 0){
                        possCells.unshift("up");
                        returnArray.push(possCells);
                        possCells = [];
                    }
                    if(bestBet){
                        for(let innerArray of returnArray) {
                            if(innerArray.findIndex((element) => element === bestBet) === 0) {
                                returnArray = [];
                                returnArray.push(innerArray);
                            }
                        }
                    } 
                    return returnArray;
                }
    
                function makeGuess(direction, originX, originY){
                    let options = {
                        left: ["x", -1],
                        right: ["x", 1],
                        down: ["y", -1],
                        up: ["y", 1]
                    };
                    let newX = (options[direction][0] === "x") ? originX + options[direction][1] : originX;
                    let newY = (options[direction][0] === "y") ? originY + options[direction][1] : originY;
                    return [newX, newY];
                }
            } else if (outstandingHits()){
                hits.computer.lastHit = outstandingHits();
            } else {
                let randomNum = Math.floor(Math.random()*remainingCells.length);
                let randomX = remainingCells[randomNum][0];
                let randomY = remainingCells[randomNum][1];
                fireShot("computer", `${randomX}, ${randomY}`);
            }       
           
            function lastShipSunk(){ 
                if(!hits.computer.shipsHit.hasOwnProperty(lastHit[0])) {
                    return false;
                }
                if(hits.computer.shipsHit[lastHit[0]].length === BATTLEBUGS[lastHit[0]].size){
                    return true;
                }
                return false;
            }
    
            function outstandingHits(){
                for (let ship in hits.computer.shipsHit){
                    if (hits.computer.shipsHit[ship].length !== BATTLEBUGS[ship].size) {
                        return [ship, hits.computer.shipsHit[ship][0][0], hits.computer.shipsHit[ship][0][1]];
                    }
                }
            }

            return new Promise((resolve) => {
                setTimeout(function(){
                    resolve("done");
                }, 2000);
            });
        }

    }
}