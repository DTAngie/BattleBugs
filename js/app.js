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
let currentBug; //This will be the bug that the player is currently placing
let gameMessage;
let direction;

/*----- cached element references -----*/
const startBtnEl = document.getElementById('start');
const playerGrid = document.getElementById('player-grid');
const computerGrid = document.getElementById('computer-grid');
const messageEl = document.getElementById('message');
let selectedEl; // this is the cell that was clicked
let selectedBugBodyEls = []; // this shows where the entire bug will be if placed


/*----- event listeners -----*/
startBtnEl.addEventListener('click', init);
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
    currentBug = PLACEMENT_ORDER[0];
    generateBoard(playerGrid);
    generateBoard(computerGrid);


    function generateBoard(grid){
        grid = grid.querySelector('div');
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
        console.log(selectedBugBodyEls);
        selectedBugBodyEls.forEach(function(cell){
            cell.classList.add('selected');
            //START WITH THIS ERROR AND THEN MOVE BACK DOWN TO LINE 154
        });
    } else {
        selectedEl.classList.add('unavailable');
    }

    //TODO render previously placed bugs
    renderMessage();

}

function handleGridClick(e){
    //If bugs have not been placed, let's place them
    if(!bugsPlaced){
        if(e.target === selectedEl) { //if you are clicking on the same spot
            //rotate the selection
            direction = (direction === "h") ? "v" : "h";
            planBug(currentBug, selectedEl);
        } else { //if you are clicking on a different spot
            direction = "h";
            selectedBugBodyEls = [];
            selectedEl = e.target;
            //Get current bug that needs to be placed, and it's length
            //Default direction will be to the right, if bug doesn't run off edge of board or hit another bug
            //show it...else gray out the selection
            direction = "h"; //values will be v or h
            planBug(currentBug, selectedEl);
            
            console.log(currentBug);
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
        selectedCells.push([x,y]);
        for(let i = 0; i< BATTLEBUGS[bug].size; i++){
            if(hasRoom(x, y, BATTLEBUGS[bug].size)){
                if(direction === "h"){
                    selectedCells.push([x+i, y]);
                    selectedBugBodyEls.push(document.getElementById(`${x+i}, ${y}`));                    
                } else if (direction == "v"){
                    selectedCells.push([x, y+i]);
                    selectedBugBodyEls.push(document.getElementById(`${x}, ${y+i}`));                    
                }
            } else {
                selectedCells = [x,y];
                selectedBugBodyEls = [];
                gameMessage = "Not enough space. Click again to rotate or choose another location";
                return false; // False means that bug can't be planned
            }
            
        }
            
            // if(direction === 'h') {
            //     //check that it doesn't go off board
            //     if(hasRoom(x, BATTLEBUGS[bug].size) && noCollisions(x,y)){
            //         selectedCells.push([x+i, y]);
            //         selectedBugBodyEls.push(document.getElementById(`${x+i}, ${y}`));
            //     } else {
            //         selectedCells = [x,y];
            //         selectedBugBodyEls = [];
            //         gameMessage = "Not enough space. Click again to rotate or choose another location";
            //         return false; // False means that bug can't be planned
            //     }

            // } else if (direction === "v"){
            //     if(hasRoom(y, BATTLEBUGS[bug].size) && noCollisions(x,y)){
            //         selectedCells.push([x+i, y]);
            //         selectedBugBodyEls.push(document.getElementById(`${x+i}, ${y}`));
            //     } else {
            //         selectedCells = [x,y];
            //         selectedBugBodyEls = [];
            //         gameMessage = "Not enough space. Click again to rotate or choose another location";
            //         return false; // False means that bug can't be planned
            //     }
            // }
        
        console.log(selectedCells);
        
        function hasRoom(x, y, bugSize){
            if(direction === "h"){
                //check for overflow
                if(x + bugSize > GRID_SIZE){
                    return false
                }
                return true;
                //check for bugs ... could be done in same if statement with || operator
            } else if (direction === "v") {
                if(y + bugSize > GRID_SIZE) {
                    return false;
                }
                return true;
            }
            return false;
        }
        

        // function hasRoom(coord, bugSize){
        //     if(coord + bugSize > 8){
        //         return false;
        //     }
        //     return true;
        // }

        function noCollisions(x,y){
            //TODO check for bug locations to make sure nothing is already placed
            return true
        }
    }
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