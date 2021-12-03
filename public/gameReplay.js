console.log(game);

const board = document.getElementById('board');
let startingFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

let boardCells = [];
let boardPieces = [];
let removedPieces = [];

let currentMove = 0;
let totalMoves = game.startIndexes.length;
console.log(totalMoves);

// ================= Board Setup ===============

createBoard();

// draws the board and loads the starting pieces
function createBoard () {
    // used to alternate between a row of the board starting with a dark or a light square
    let = invertRow = false;

    // draws the empty board
    for (let i = 0; i < 64; i++)
    {
        boardCells[i] = document.createElement("div");
        boardCells[i].classList.add('square');

        if (i % 8 == 0)
        {
            invertRow = !invertRow;
        }
        
        if (invertRow == true)
        {
            if (i % 2 == 0)
            {
                boardCells[i].classList.add('lightSquare');
            } else {
                boardCells[i].classList.add('darkSquare');
            }
        } else {
            if (i % 2 == 0)
            {
                boardCells[i].classList.add('darkSquare');
            } else {
                boardCells[i].classList.add('lightSquare');
            }
        }

        board.insertBefore(boardCells[i], null);
    }

    // add pieces to the board
    readFen(startingFen);
}

// sets up the board based upon a given fen string
function readFen (fenString) {
    fenLength = fenString.length;

    // index on the board where the pieces are actually placed
    let cellIndex = 0;

    // iterate through the fen
    for (let i = 0; i < fenLength; i++) {

        let fenId = fenString.charAt(0);

        if (!isNaN(fenId)) {
            // if the character is a number, then add that many empty spaces
            cellIndex += parseInt(fenId);

        } else if (fenId != "/") {
            // add piece based on the character
            addPieceFromFen(fenId, cellIndex);
            cellIndex++;
        }

        // remove the first character from the fen
        if (fenString.length > 1) {
            fenString = fenString.substring(1, fenString.length);
        }
    }
}

// adds in a piece to the board based on the given fen id to the given index
function addPieceFromFen(fenId, cellIndex) {
    if (fenId == "r")
        {
            addPiece(cellIndex, "/images/b_rook_2x_ns.png", "black", "rook");
        }
        if (fenId == "b")
        {
            addPiece(cellIndex, "/images/b_bishop_2x_ns.png", "black", "bishop");
        }
        if (fenId == "n")
        {
            addPiece(cellIndex, "/images/b_knight_2x_ns.png", "black", "knight");
        }
        if (fenId == "q")
        {
            addPiece(cellIndex, "/images/b_queen_2x_ns.png", "black", "queen");
        }
        if (fenId == "k")
        {
            addPiece(cellIndex, "/images/b_king_2x_ns.png", "black", "king");
        }
        if (fenId == "p")
        {
            addPiece(cellIndex, "/images/b_pawn_2x_ns.png", "black", "pawn");

        }



        if (fenId == "R")
        {
            addPiece(cellIndex, "/images/w_rook_2x_ns.png", "white", "rook");
        }
        if (fenId == "B")
        {
            addPiece(cellIndex, "/images/w_bishop_2x_ns.png", "white", "bishop");
        }
        if (fenId == "N")
        {
            addPiece(cellIndex, "/images/w_knight_2x_ns.png", "white", "knight");
        }
        if (fenId == "Q")
        {
            addPiece(cellIndex, "/images/w_queen_2x_ns.png", "white", "queen");
        }
        if (fenId == "K")
        {
            addPiece(cellIndex, "/images/w_king_2x_ns.png", "white", "king");
        }
        if (fenId == "P")
        {
            addPiece(cellIndex, "/images/w_pawn_2x_ns.png", "white", "pawn");
        }
}

// adds a new piece to the list of pieces and to the gui
function addPiece(cellIndex, pieceImage, pieceColor, pieceId) {
    let img = document.createElement("img");
    img.src = (pieceImage);
    img.id = 'pieceImage' + cellIndex;
    img.classList.add('piece-image');
    boardCells[cellIndex].appendChild(img);

    boardPieces[cellIndex] = new Piece(pieceColor, pieceId, cellIndex, pieceImage);
}

function updateBoardColors() {
    document.documentElement.style.setProperty('--boardColor1', boardColor1);
    document.documentElement.style.setProperty('--boardColor2', boardColor2);
}

updateBoardColors();

// ===================== Increment Through Moves =================

const arrowBack = document.getElementById("arrowBack");
const arrowForward = document.getElementById("arrowForward");

// previous move by clicking on arrow button
arrowBack.onclick = () => {
    showPreviousMove();
}

// next move by clicking on arrow button
arrowForward.onclick = () => {
    showNextMove();
}

// used to prevent holding down the arrow keys from continually iterating through moves
let leftArrowKeyReset = true;
let rightArrowKeyReset = true;

// move forward / backwards through moves with arrow keys
document.onkeydown = function (e) {
    if (e.keyCode == 37 && leftArrowKeyReset) {
        leftArrowKeyReset = false;
        showPreviousMove();
    }
    if (e.keyCode == 39 && rightArrowKeyReset) {
        rightArrowKeyReset = false;
        showNextMove();
    }
}

// reset keys once they are let go to allow incrementing moves when they are pressed again
document.onkeyup = function (e) {
    if (e.keyCode == 37) {
        leftArrowKeyReset = true;
    }
    if (e.keyCode == 39) {
        rightArrowKeyReset = true;
    }
}

function showNextMove() {
    if (currentMove >= totalMoves) {
        return;
    }

    const startIndex = game.startIndexes[currentMove];
    const endIndex = game.endIndexes[currentMove];
    const moveType = game.moveTypes[currentMove];

    // if a pice is being taken, remove its image from the screen
    if (boardPieces[endIndex] != null) {
        let pieceImage = document.getElementById('pieceImage' + endIndex);
        pieceImage.parentNode.removeChild(pieceImage);
        
        // save the piece so it can be added back if the move is rewound
        removedPieces.push(boardPieces[endIndex]);
    } else {
        removedPieces.push(null);
    }
    console.log(removedPieces);

    // make the actual move
    movePieceIndex(startIndex, endIndex);

    
    if (moveType != "normal") {
        makeSpecialMove(startIndex, endIndex, moveType);
    }

    console.log(currentMove);
    currentMove++;
}

function showPreviousMove() {
    if (currentMove <= 0) {
        return;
    }

    const previousMove = currentMove - 1;

    const startIndex = game.startIndexes[previousMove];
    const endIndex = game.endIndexes[previousMove];
    const moveType = game.moveTypes[previousMove];

    // move the piece back to its previous position
    movePieceIndex(endIndex, startIndex);

    const removedPiece = removedPieces.pop();
    
    // add removed piece back to the board
    if (removedPiece != null) {
        boardPieces[removedPiece.index] = removedPiece;

        // add image back to the board
        let img = document.createElement("img");
        img.src = (removedPiece.image);
        img.id = 'pieceImage' + removedPiece.index;
        img.classList.add('piece-image');
        boardCells[endIndex].appendChild(img);
    }

    rewindCastling(startIndex, moveType);
    rewindPawnPromotion(startIndex, moveType);

    currentMove--;
}

// moves a piece from the starting index to the end index
// also updates the image position for the piece
function movePieceIndex(startIndex, endIndex) {
    // move the piece to the new index
    let piece = boardPieces[startIndex];
    boardPieces[endIndex] = piece;
    boardPieces[startIndex] = null;

    // make sure that the piece still knows where it is
    boardPieces[endIndex].index = endIndex;
    boardPieces[endIndex].hasMoved = true;

    // remove the image of where the piece previously was
    let pieceImage = document.getElementById('pieceImage' + startIndex);
    pieceImage.parentNode.removeChild(pieceImage);

    // add the piece image in the ending square
    let img = document.createElement("img");
    img.src = (piece.image);
    img.id = 'pieceImage' + endIndex;
    img.classList.add('piece-image');
    boardCells[endIndex].appendChild(img);
}

// additional adjustments to the board state for moves such as castling or enpessant
function makeSpecialMove(startIndex, endIndex, moveType) {
    if (moveType == "white-SC" || moveType == "black-SC") {
        // move rook to the left of the king
        movePieceIndex(startIndex + 3, startIndex + 1);
    }

    if (moveType == "white-LC" || moveType == "black-LC") {
        // move rook to the right of the king
        movePieceIndex(startIndex - 4, startIndex - 1);
    }

    if (moveType == "white-EP") {
        // attacking the pawn to the right
        if (startIndex - endIndex == 7) {
            // save the piece so it can be added back if the move is rewound
            removedPieces[currentMove] = boardPieces[startIndex + 1];

            // remove attacked piece
            boardPieces[startIndex + 1] = null;

            // remove attacked piece image
            let pieceImage = document.getElementById('pieceImage' + (startIndex + 1));
            pieceImage.parentNode.removeChild(pieceImage);
        }

        // attacking the pawn to the left
        if (startIndex - endIndex == 9) {
            // save the piece so it can be added back if the move is rewound
            removedPieces[currentMove] = boardPieces[startIndex - 1];

            // remove attacked piece
            boardPieces[startIndex - 1] = null;

            // remove attacked piece image
            let pieceImage = document.getElementById('pieceImage' + (startIndex - 1));
            pieceImage.parentNode.removeChild(pieceImage);
        }
    }

    if (moveType == "black-EP") {
        // attacking the pawn to the right
        if (endIndex - startIndex == 9) {
            // save the piece so it can be added back if the move is rewound
            removedPieces[currentMove] = boardPieces[startIndex + 1];

            // remove attacked piece
            boardPieces[startIndex + 1] = null;

            // remove attacked piece image
            let pieceImage = document.getElementById('pieceImage' + (startIndex + 1));
            pieceImage.parentNode.removeChild(pieceImage);
        }

        // attacking the pawn to the left
        if (endIndex - startIndex == 7) {
            // save the piece so it can be added back if the move is rewound
            removedPieces[currentMove] = boardPieces[startIndex - 1];

            // remove attacked piece
            boardPieces[startIndex - 1] = null;

            // remove attacked piece image
            let pieceImage = document.getElementById('pieceImage' + (startIndex - 1));
            pieceImage.parentNode.removeChild(pieceImage);
        }
    }

    if (moveType.includes("promotion")) {
        makePawnPromotion(endIndex, moveType);
    }
}

function makePawnPromotion(endIndex, moveType) {
    
    // get the fen character for adding the new piece to the board
    let promotionType = moveType.split('-')[1];

    // set the fen character to capitalized if a white piece is being added
    if (boardPieces[endIndex].color == "white") {
        promotionType = promotionType.toUpperCase();
    }

    // remove the pawn
    boardPieces[endIndex] = null;
    
    // remove the image of where the pawn was
    let pieceImage = document.getElementById('pieceImage' + endIndex);
    pieceImage.parentNode.removeChild(pieceImage);

    // add the new piece
    addPieceFromFen(promotionType, endIndex);
}

// If a castle occurred, rewind the position of the rook involved in the castling move
function rewindCastling (startIndex, moveType) {
    if (moveType == "white-SC" || moveType == "black-SC") {
        // move rook to the left of the king
        movePieceIndex(startIndex + 1, startIndex + 3);
    }

    if (moveType == "white-LC" || moveType == "black-LC") {
        // move rook to the right of the king
        movePieceIndex(startIndex - 1, startIndex - 4);
    }
}

// resets the promoted piece back to being a pawn
function rewindPawnPromotion(startIndex, moveType) {
    if (moveType.includes("promotion")) {
        const color = boardPieces[startIndex].color;

        boardPieces[startIndex] = null;

        // remove the image of where the pawn
        let pieceImage = document.getElementById('pieceImage' + startIndex);
        pieceImage.parentNode.removeChild(pieceImage);

        if (color == "white") {
            addPieceFromFen('P', startIndex);
        } else {
            addPieceFromFen('p', startIndex);
        }

    }
}