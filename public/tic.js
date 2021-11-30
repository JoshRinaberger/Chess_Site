

const X_CLASS = 'x';
const CIRCLE_CLASS = 'circle';

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

const cellElements = document.querySelectorAll('[data-cell]');
const board = document.getElementById('board');
const winningMessageTextElement = document.querySelector(['data-winning-message-text']); // DOESNT WORK?
const winningMessageElement = document.getElementById('winningMessage');

const restartButton = document.getElementById('restartButton');

let circleTurn;

startGame();

function startGame() {
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(CIRCLE_CLASS);
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true }) // once: true only allows the click event to happen once
    });

    circleTurn = false;
    setBoardHoverClass();

    winningMessageElement.classList.remove('show');
}

restartButton.addEventListener('click', startGame);

function handleClick(e) {
    // gets the cell that was clicked on
    const cell = e.target;
    
    // sets the current class based on who's turn it is
    const currentClass = circleTurn ? CIRCLE_CLASS : X_CLASS;

    // place Mark
    placeMark(cell, currentClass);

    // check for win
    if (checkWin(currentClass))
    {
        endGame(false);
    } else if (isDraw()) {
        endGame (true);
    } else {
        // switch turns
        swapTurns();
        setBoardHoverClass();
    }
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

function swapTurns() {
    circleTurn = !circleTurn;
}

function setBoardHoverClass() {
    board.classList.remove(X_CLASS);
    board.classList.remove(CIRCLE_CLASS);

    if (circleTurn) {
        board.classList.add(CIRCLE_CLASS);
    } else {
        board.classList.add(X_CLASS);
    }
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentClass);
        })
    })
}

function endGame (isDraw) {
    if (isDraw) {
        //winningMessageTextElement.innerText = 'DRAW!';
    } else {
        //winningMessageTextElement.innerText =  '${circleTurn ? "Os" : "Xs"} Wins!';
        //console.log('${circleTurn ? "Os" : "Xs"} Wins!')
    }
    winningMessageElement.classList.add('show');
}

function isDraw() {
    // [...cellElements] "destructures" the cells
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
    })
}