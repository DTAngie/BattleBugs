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

/*----- app's state (variables) -----*/
let shotsFired;
let deadComputerBugs;
let deadPlayerBugs;
let bugLocations = {} // This will be an object similar to the constant

/*----- cached element references -----*/
const startBtnEl = document.getElementById('start');
const playerGrid = document.getElementById('player-grid');
const computerGrid = document.getElementById('computer-grid');


/*----- event listeners -----*/
startBtnEl.addEventListener('click', init);

/*----- functions -----*/
init();

function init() {
console.log('start game');
    generateBoard(playerGrid);
    generateBoard(computerGrid);


    function generateBoard(grid){
        grid = grid.querySelector('div');
        for(let r = 8; r > 0; r --){ // create the rows
            const row = document.createElement('div');
            row.setAttribute('class', 'grid-row');
            grid.appendChild(row);
            console.log(grid, 'r is ', r);
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


}