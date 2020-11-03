/*----- constants -----*/
const BATTLEBUGS = {
    Alpha: {
        size: 2,
        image: "/linkToImage.png"
    },
    Beta: {
        size: 3,
        image: "/linkToImage.png"
    },
    Gamma: {
        size: 3,
        image: "/linkToImage.png"
    },
    Delta: {
        size: 4,
        image: "/linkToImage.png"
    },
    Epsilon: {
        size: 5,
        image: "/linkToImage.png"
    }
};
const MAX_SHOTS = 5;
const PLACEMENT_ORDER = Object.keys(BATTLEBUGS).reverse();
const GRID_SIZE = 8;

/*----- app's state (variables) -----*/
let shotsLeft, deadComputerBugs, deadPlayerBugs;// the last two variables might not be needed
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
    } // This should hold an array of x,y coordinates
} // This will be an object similar to the constant
let bugsPlaced; // will be a true/false value to determine if game is ready to start
let selectedCells = []; // this will be for placement
let currentBug; //This will be the bug that the player is currently placing, notated by index number
let gameMessage;
let direction;
let currentTurn;
let hits = {
    player: {
        emptyCells: [], //this will hold the actual cells hit
        bugCells: [],
        shipsHit: {}, // this will list opponents ships hit, this may not be needed so check if actually used
        shipsLeft: {} // this will list opponents ships left to hit
    },
    computer: {
        emptyCells: [],
        bugCells: [],
        shipsHit: {},
        shipsLeft: {}
    }
}

/*----- cached element references -----*/
const startBtnEl = document.getElementById('start');
const placeBtnEl = document.getElementById('place');
const playerGrid = document.getElementById('player-grid');
const computerGrid = document.getElementById('computer-grid');
const messageEl = document.getElementById('message');
let selectedEl; // this is the cell that was clicked
let selectedBugBodyEls = []; // this shows where the entire bug will be if placed
let readyToPlace;


/*----- event listeners -----*/
startBtnEl.addEventListener('click', init);
placeBtnEl.addEventListener('click', placeBug); /// I need to pass the player parameter in here
playerGrid.addEventListener('click', handlePlayerGridClick);
computerGrid.addEventListener('click', handleComputerGridClick);

/*----- functions -----*/
init();

function init() {
    bugsPlaced = false;
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
        } // QUESTION: IS THERE A BETTER WAY TO INITIALIZE THIS? IT SEEMS REDUNDANT WITH APP 
        // STATE VARIABLES
    }
    // hits.player.shipsLeft = Object.keys(BATTLEBUGS);
    // hits.computer.shipsLeft = Object.keys(BATTLEBUGS);
    deadComputerBugs = 0;
    deadPlayerBugs = 0;
    currentBug = 0;
    readyToPlace = false;
    generateBoard(playerGrid, "player");
    generateBoard(computerGrid, "computer");
    currentTurn = "player";
    gameMessage = "";
    shotsLeft = MAX_SHOTS;


    function generateBoard(grid, user){
        grid = grid.querySelector('div');
        grid.innerHTML = "";
        for(let r = GRID_SIZE; r > 0; r --){ // create the rows
            const row = document.createElement('div');
            row.setAttribute('class', 'grid-row');
            grid.appendChild(row);
            for(c = 1; c < GRID_SIZE + 1; c ++) { // create the cells
                const cell = document.createElement('div');
                cell.setAttribute('class', 'grid-cell');
                cell.setAttribute('id', `${c}, ${r}, ${user}`);
                row.appendChild(cell);
            }
        }
    }
    renderMessage();
}

function render() {
    let playerCells = playerGrid.querySelectorAll('.grid-cell');

    for(let i = 0; i < playerCells.length; i ++){ // clear the blocks and rebuild them
        playerCells[i].className = "grid-cell";
    }

    if(selectedBugBodyEls.length > 0){
        selectedBugBodyEls.forEach(function(cell){
            cell.classList.add('selected');
        });
    } else {
        selectedEl.classList.add('unavailable');
    }
    //Render placed bugs
    for(let bug in bugLocations.player) {
        bugLocations.player[bug].forEach(function(point){
            let occupiedCell = document.getElementById(`${point[0]}, ${point[1]}, player`);
            occupiedCell.classList.add('placed');
        });
    }
    //TODO remove this once working since player shouldn't see computer's places
    for(let bug in bugLocations.computer) {
        bugLocations.computer[bug].forEach(function(point){
            let occupiedCell = document.getElementById(`${point[0]}, ${point[1]}, computer`);
            occupiedCell.classList.add('placed');
        });
    }
    //Render hits and misses
    if(bugsPlaced){
        hits.player.bugCells.forEach(function(point){
            let hitCell = document.getElementById(`${point[0]}, ${point[1]}, computer`);
            hitCell.classList.add('hit');
        });


        hits.player.emptyCells.forEach(function(point){
            let hitCell = document.getElementById(`${point[0]}, ${point[1]}, computer`);
            hitCell.classList.add('missed');
        });


        hits.computer.bugCells.forEach(function(point){
            let hitCell = document.getElementById(`${point[0]}, ${point[1]}, player`);
            hitCell.classList.add('hit');
        });


        hits.computer.emptyCells.forEach(function(point){
            let hitCell = document.getElementById(`${point[0]}, ${point[1]}, player`);
            hitCell.classList.add('missed');
        });

    }
    
    if(!readyToPlace) {
        placeBtnEl.setAttribute('disabled', 'disabled');
    } else {
        placeBtnEl.removeAttribute('disabled');
    }
    renderMessage();
    //Remove below...it's just for quick testing
    document.getElementById('test-shots').innerText = `${shotsLeft} shot left out of ${MAX_SHOTS}`;
}

function handlePlayerGridClick(e){
    if(!e.target.classList.contains('grid-cell') || currentTurn !== "player") {
        return;
    };
    //If bugs have not been placed, let's place them
    if(!bugsPlaced){
        selectedCells=[];
        if(e.target === selectedEl) { //if you are clicking on the same spot
            //rotate the selection
            direction = (direction === "h") ? "v" : "h";
            planBug(PLACEMENT_ORDER[currentBug], selectedEl.id, "player");
        } else { //if you are clicking on a different spot
            direction = "h";
            selectedBugBodyEls = []; // this might be redundant since the plan bug clears this element out.
            selectedEl = e.target;
            //Get current bug that needs to be placed, and it's length
            //Default direction will be to the right, if bug doesn't run off edge of board or hit another bug
            //show it...else gray out the selection
            planBug(PLACEMENT_ORDER[currentBug], selectedEl.id, "player");
            
            //Player can either click on cell to rotate bug or click a different cell to place it there
    
            //Once all bugs are placed, computer should place its bugs
        }
    } else {
        gameMessage = "Click on the the computer grid to take a shot";
        // else... let's play the game
    }
    render();
}

function handleComputerGridClick(e){
    //TODO check to make sure cell wasn't clicked before...no use wasting missiles!
    if(!e.target.classList.contains('grid-cell') || currentTurn !== "player") {
        return;
    };
    if(!bugsPlaced){
        gameMessage = " Place your bugs on the player grid."
    } else {
        //This is where the the turns start!!
        console.log("it is now", currentTurn, "'s turn");
        selectedCells = []; // this may not be used, so if not, you can take this out
        if(shotsLeft !== 0){
            let attackedCell = e.target.id; 
            fireShot("player", attackedCell);
        }
    }
    render();
}

function planBug(bug, cell, planner){
    let coordinates = cell.split(", ");
    let x = parseInt(coordinates[0]);
    let y = parseInt(coordinates[1]);
    selectedBugBodyEls = [];
    if(hasRoom(x,y, BATTLEBUGS[bug].size)){
        readyToPlace = true;
        gameMessage = "";
    } else {
        selectedCells = [x,y];
        selectedBugBodyEls = [];
        gameMessage = "Not enough space. Click again to rotate or choose another location";
        readyToPlace = false;
        return false; // False means that bug can't be planned
    }

    
    function hasRoom(x, y, bugSize){
        //check overflow first since it only happens once, then for each spot check for collision
        if(direction === "h"){ 
            if(x + bugSize > GRID_SIZE + 1) {
                return false;
            }
        } else if (direction === "v") {
            if(y + bugSize > GRID_SIZE + 1) {
                return false;
            }
        }
        
        for(let i = 0; i< BATTLEBUGS[bug].size; i++){
            //check for overflow
            if(direction === "h"){ 
                if(!noCollisions(x+i,y)){
                    return false;
                }
                selectedCells.push([x+i, y]);
                selectedBugBodyEls.push(document.getElementById(`${x+i}, ${y}, ${currentTurn}`));
            } else if (direction === "v"){
                if(!noCollisions(x,y+i)){
                    return false;
                }
                selectedCells.push([x, y+i]);
                selectedBugBodyEls.push(document.getElementById(`${x}, ${y+i}, ${currentTurn}`));
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
    //TODO this may be redundant, you can trigger game after computer places bugs
    if(bugsPlaced){
     return; // TODO: trigger game start here   
    }
    if(!readyToPlace){
        return;
    }
    let opponent = (currentTurn === "player") ? "computer" : "player";
    bugLocations[currentTurn][PLACEMENT_ORDER[currentBug]] =  selectedCells.map((x) => x);
    hits[opponent].shipsLeft[PLACEMENT_ORDER[currentBug]] = selectedCells.map((x) => x);
    
    currentBug++;
    readyToPlace = false;
    //TODO the curent turn restriction may be able to be removed as well as the currentBug reset....computer is using the i variable
    //for iterations
    if(currentTurn === "player" && currentBug === PLACEMENT_ORDER.length){//all player bugs are placed
        // bugsPlaced = true;
        readyToPlace = false;
        gameMessage = "Your bugs have been placed. Waiting for computer."
        //TODO add a delay so that even after computer does the turn it waits a while to simulate thinking
        currentBug = 0;
        currentTurn = "computer";
        selectedCells = [];
        computerPlacement(); //this should be an async function so that render below happens first and then computerMove does
    }
    render();
    //TODO When all pbugs are placed it's time for computer to place bugs.
}

function fireShot(offense, cell){
    let coordinates = cell.split(", ");
    let x = parseInt(coordinates[0]);
    let y = parseInt(coordinates[1]);
    let hitData = hits[offense];
    // first add information to hit object
    //then check to see if cell is part of a ship
    let shipHit = wasHit(x,y);
    if(shipHit){
        hitData.bugCells.push([x,y]);
        hitData.shipsLeft[shipHit[0]].splice(shipHit[1], 1);
        if(hitData.shipsLeft[shipHit[0]].length === 0){
            delete hitData.shipsLeft[shipHit[0]];
        }    
    } else {
        hitData.emptyCells.push([x,y]);
    }
    if(isWinner()){
        render();
        return;
    }

    shotsLeft--;
    
    if(shotsLeft === 0){
        currentTurn = "computer";
        shotsLeft = MAX_SHOTS;
        gameMessage = "Computer's turn.";
    }

    function isWinner(){
        if(Object.keys(hitData.shipsLeft).length === 0){
            gameMessage = `${offense} is the winner!`;
            return true;
        }
        return false;
    }

    function wasHit(x, y){
        //Iterate through this array to save time as ships get 
        for(let ship in hitData.shipsLeft){
            console.log(ship);
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
            //when all shots are taken, change turns
}

function renderMessage(){
    if(gameMessage){
        messageEl.innerText = gameMessage;
    } else {
        messageEl.innerText = "";
    }
}

async function computerPlacement(){
    //Iterate through each of the placement order

    //randomly choose direction
    //choose cell at random (x or y must be less than bug length)
    //check for collision, if collision,rotate and test again...if still collision choose another location than choose another random location
    //place bug
    //when all bugs are placed trigger game start

    let computerStatus = await doneMoving();
    if (doneMoving) {
        gameMessage = "Computer is placing bugs."; // This may need to be moved elsewhere if it takes a little bit of time
        render();
    }

    function doneMoving(){
        //Choose the direction
        bugSize =5; //Remove this hard code and replace with variable for loop
        for(let i = 0; i < PLACEMENT_ORDER.length; i++) {  
            bugSize = BATTLEBUGS[PLACEMENT_ORDER[i]].size;
            makeSelection();

            function makeSelection(){
                direction = (Math.ceil(Math.random()*10) > 5) ? "h" : "v";
                selectedBugBodyEls = [];
                selectedCells = [];
                if(direction === "h"){
                    let randomX = Math.ceil(Math.random()*(GRID_SIZE - bugSize + 1));
                    let randomY = Math.ceil(Math.random()* (GRID_SIZE));
                    if(planBug(PLACEMENT_ORDER[i], `${randomX}, ${randomY}`, "computer")){
                        placeBug();
                    } else {
                        makeSelection();
                    }

                } else if (direction === "v"){
                    let randomX = Math.ceil(Math.random()*(GRID_SIZE));
                    let randomY = Math.ceil(Math.random()* (GRID_SIZE - bugSize + 1));
                    if(planBug(PLACEMENT_ORDER[i], `${randomX}, ${randomY}`, "computer")){
                        
                        placeBug();
                    } else {
                        makeSelection();
                    }
                }

            }
            
                render(); // TODO take this out after test
        }
        return true;
    }
    // for(let i)
    
    setTimeout(function(){
        //This gives the illusion of the computer thinking.
        gameMessage = "Computer Finished. Let's play";
        currentTurn = "player";
        bugsPlaced = true;
        render();
    }, 5000);
}

// TODO: 
// player makes guesses
// computer makes guesses
// determine when ship is sunk and display image
// determine winner
//display images of bugs on board as well as bugs left and shots left
//if time permits, make the bugLocations a private variable so that people can't see them.
//remove all console logs