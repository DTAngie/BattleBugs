/*----- constants -----*/
const BATTLEBUGS = {
    'Alpha': {
        size: 2,
        image: "/linkToImage.png"
    },
    'Beta': {
        size: 3,
        image: "/linkToImage.png"
    },
    'Gamma': {
        size: 3,
        image: "/linkToImage.png"
    },
    'Delta': {
        size: 4,
        image: "/linkToImage.png"
    },
    'Epsilon': {
        size: 5,
        image: "/linkToImage.png"
    }
};
const MAX_SHOTS = 5;
const PLACEMENT_ORDER = Object.keys(BATTLEBUGS).reverse();
const GRID_SIZE = 8;

/*----- app's state (variables) -----*/
let shotsFired, deadComputerBugs, deadPlayerBugs;
let bugLocations = {
    player: {
        'Alpha': [],
        'Beta': [],
        'Gamma': [],
        'Delta': [],
        'Epsilon': []
    },
    computer: {
        'Alpha': [],
        'Beta': [],
        'Gamma': [],
        'Delta': [],
        'Epsilon': []
    } // This should hold an array of x,y coordinates
} // This will be an object similar to the constant
let bugsPlaced; // will be a true/false value to determine if game is ready to start
let selectedCells = []; // this will be for placement
let currentBug; //This will be the bug that the player is currently placing, notated by index number
let gameMessage;
let direction;

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
placeBtnEl.addEventListener('click', placeBug);
playerGrid.addEventListener('click', handleGridClick);

/*----- functions -----*/
init();

function init() {
    bugsPlaced = false;
    selectedCells = [];
    bugLocations = {
        player: {
            'Alpha': [],
            'Beta': [],
            'Gamma': [],
            'Delta': [],
            'Epsilon': []
        },
        computer: {
            'Alpha': [],
            'Beta': [],
            'Gamma': [],
            'Delta': [],
            'Epsilon': []
        } // QUESTION: IS THERE A BETTER WAY TO INITIALIZE THIS? IT SEEMS REDUNDANT WITH APP 
        // STATE VARIABLES
    }
    deadComputerBugs = 0;
    deadPlayerBugs = 0;
    currentBug = 0;
    readyToPlace = false;
    generateBoard(playerGrid);
    generateBoard(computerGrid);


    function generateBoard(grid){
        grid = grid.querySelector('div');
        grid.innerHTML = "";
        for(let r = GRID_SIZE; r > 0; r --){ // create the rows
            const row = document.createElement('div');
            row.setAttribute('class', 'grid-row');
            grid.appendChild(row);
            // console.log(grid, 'r is ', r);
            for(c = 1; c < GRID_SIZE + 1; c ++) { // create the cells
                const cell = document.createElement('div');
                cell.setAttribute('class', 'grid-cell');
                cell.setAttribute('id', `${c}, ${r}`);
                row.appendChild(cell);
            }
        }
    }
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
            let occupiedCell = document.getElementById(`${point[0]}, ${point[1]}`);
            occupiedCell.classList.add('placed');
        });
    }
    if(!readyToPlace) {
        placeBtnEl.setAttribute('disabled', 'disabled');
    } else {
        placeBtnEl.removeAttribute('disabled');
    }
    //TODO render previously placed bugs
    renderMessage();

}

function handleGridClick(e){
    //If bugs have not been placed, let's place them
    if(!bugsPlaced){
        console.log(currentBug);
        selectedCells=[];
        if(e.target === selectedEl) { //if you are clicking on the same spot
            //rotate the selection
            direction = (direction === "h") ? "v" : "h";
            planBug(PLACEMENT_ORDER[currentBug], selectedEl);
        } else { //if you are clicking on a different spot
            direction = "h";
            selectedBugBodyEls = [];
            selectedEl = e.target;
            //Get current bug that needs to be placed, and it's length
            //Default direction will be to the right, if bug doesn't run off edge of board or hit another bug
            //show it...else gray out the selection
            direction = "h"; //values will be v or h
            planBug(PLACEMENT_ORDER[currentBug], selectedEl);
            
            console.log(PLACEMENT_ORDER[currentBug]);
            //Player can either click on cell to rotate bug or click a different cell to place it there
    
            //Once all bugs are placed, computer should place its bugs

        }

    } else {
        // else... let's play the game
    }
    render();

    function planBug(bug, cell){
        let coordinates = cell.id.split(", ");
        let x = parseInt(coordinates[0]);
        let y = parseInt(coordinates[1]);
        selectedBugBodyEls = [];
        for(let i = 0; i< BATTLEBUGS[bug].size; i++){
            if(hasRoom(x, y, BATTLEBUGS[bug].size)){
                if(direction === "h"){
                    selectedCells.push([x+i, y]);
                    selectedBugBodyEls.push(document.getElementById(`${x+i}, ${y}`));                    
                } else if (direction == "v"){
                    selectedCells.push([x, y+i]);
                    selectedBugBodyEls.push(document.getElementById(`${x}, ${y+i}`));                    
                }
                readyToPlace = true;
            } else {
                selectedCells = [x,y];
                selectedBugBodyEls = [];
                gameMessage = "Not enough space. Click again to rotate or choose another location";
                readyToPlace = false;
                return false; // False means that bug can't be planned
            }
        }
        
        function hasRoom(x, y, bugSize){
            if(direction === "h"){
                //check for overflow
                if(x + bugSize > GRID_SIZE + 1){
                    return false
                }
                return true;
                //TODO check for bugs ... could be done in same if statement with || operator
            } else if (direction === "v") {
                if(y + bugSize > GRID_SIZE + 1) {
                    return false;
                }
                return true;
            }
            return false;
        }
        

        function noCollisions(x,y){
            //TODO check for bug locations to make sure nothing is already placed
            return true
        }
    }
}

function placeBug(e){
    console.log('placing bug', readyToPlace);
    if(!readyToPlace){
        return;
    }
    bugLocations.player[currentBug] =  selectedCells;
    console.log(bugLocations);
    currentBug++;
    render();
    //TODO When all pbugs are placed it's time for computer to place bugs.
}


function renderMessage(){
    if(gameMessage){
        messageEl.innerText = gameMessage;
    } else {
        messageEl.innerText = "";
    }
}

// TODO: 
// player choose placement
// computer choose placement
// player makes guesses
// computer makes guesses
// determine when ship is sunk and display image
// determine winner
//remove all console logs