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

/*----- cached element references -----*/
const startBtnEl = document.getElementById('start');
const playerGrid = document.getElementById('player-grid');
const computerGrid = document.getElementById('computer-grid');
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
        for(let r = 8; r > 0; r --){ // create the rows
            const row = document.createElement('div');
            row.setAttribute('class', 'grid-row');
            grid.appendChild(row);
            // console.log(grid, 'r is ', r);
            for(c = 1; c < 9; c ++) { // create the cells
                const cell = document.createElement('div');
                cell.setAttribute('class', 'grid-cell');
                cell.setAttribute('id', `${c}, ${r}`);
                row.appendChild(cell);
            }
        }
    }
}

function render() {
    //TODO change these to altering classes instead
    selectedEl.style.background = 'red';
    console.log(selectedBugBodyEls);
    if(selectedBugBodyEls){
        selectedBugBodyEls.forEach(function(cell){
            cell.style.background = 'purple';
            //START WITH THIS ERROR AND THEN MOVE BACK DOWN TO LINE 154
        });
    }

}

function handleGridClick(e){
    let direction;
    //If bugs have not been placed, lets place them
    if(!bugsPlaced){
        if(e.target === selectedEl) {
            //rotate the selection
        }
        selectedEl = e.target;
        //Get current bug that needs to be placed, and it's length
        //Default direction will be to the right, if bug doesn't run off edge of board or hit another bug
        //show it...else gray out the selection
        direction = "h"; //values will be v or h
        planBug(currentBug, selectedEl);
        

        console.log(currentBug);
        //Player can either click on cell to rotate bug or click a different cell to place it there

        //Once all bugs are placed, computer should place its bugs
        
    } else {
        // else... let's play the game
    }
    render();

    function planBug(bug, cell){
        let coordinates = cell.id.split(", ");
        let x = parseInt(coordinates[0]);
        let y = parseInt(coordinates[1]);
        selectedCells.push([x,y]);
        for(let i = 0; i< BATTLEBUGS[bug].size; i++){
            if(direction === 'h') {
                //check that it doesn't go off board
                if(hasRoom(x) && noCollisions(x,y)){
                    selectedCells.push([x+i, y]);
                    selectedBugBodyEls.push(document.getElementById(`${x+i}, ${y}`));
                } else {
                    selectedCells = [x,y];
                    selectedBugBodyEls = [];
                    console.log('not enough room');
                }

            } else if (direction === "v"){

            }
        }
        console.log(selectedCells);
        
        function hasRoom(coord){
            if(coord < 0 || coord > 8){
                return false;
            }
            return true;
        }

        function noCollisions(x,y){
            //TODO check for bug locations to make sure nothing is already placed
            return true
        }
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