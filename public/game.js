// BIG TODOS:
// Refactor all of the find legal move for individual pieces functions into sub functions. Way too many redundent ifs and checks
// material

const board = document.getElementById('board');
let startingFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

let boardCells = [];
let boardPieces = [];

let selectedSquare;

let movesStartIndexes = [];
let movesEndIndexes = [];

let playerColor = "white";
let currentTurnColor = "white";
let boardRotation = "white";

let opponentConnected = false;
let gameStarted = false;

let whitePossibleLegalMoves = [];
let blackPossibleLegalMoves = [];
let whiteFilteredLegalMoves = [];
let blackFilteredLegalMoves = [];

let fiftyMoveCounter = 0;


// from https://dirask.com/posts/JavaScript-UUID-function-in-Vanilla-JS-1X9kgD
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let username = authUsername;

// if a username is not provided then generate a guest username
function checkUsername() {
    if (username.length == 0) {
        username = "Guest-" + uuidv4();
    }
}

checkUsername();

function getOpposositeColor(color) {
    if (color == "white") {
        return "black";
    } else {
        return "white";
    }
}

// =============== SOCKETING ======================

const socket = io('http://localhost:3001');

socket.on('connect', () => {
    console.log('Connected to server with ID: ' + socket.id);

    socket.emit('join-game', gameId, socket.id, username);

    displayChatMessage("Connected to chat room.", null);
})

socket.on('join-game-successful', () => {
    // hide controls, as this client isn't the host
    let gameControls = document.getElementById("gameControls");
    gameControls.style.display = "none";

    console.log("JOINED");
})

socket.on('join-game-failure', () => {
    alert("Failed to join game: Game is full.");
})

socket.on('opponent-joined', (username) => {
    opponentConnected = true;

    displayChatMessage(username + " has conneceted.", null);
})

socket.on('start-game', (otherPlayerColor, time) => {
     if (playerColor == otherPlayerColor) {
        swapPlayerColor();
    }

    if (startingTime != time) {
        updateStartingTime(time);
    }

    gameStarted = true;

    console.log("Game started");
})

socket.on('receive-move', (startIndex, endIndex, moveType) => {
    console.log('Move Received. Start Index: ' + startIndex + "    End Index:" + endIndex + "     Move Type: " + moveType);
    let moveSuccess = makeMove(startIndex, endIndex, moveType);
})

socket.on('receive-player-color', (otherPlayerColor) => {
    if (playerColor == otherPlayerColor) {
        swapPlayerColor();
    }
    console.log("Player Color: " + playerColor);
})

socket.on('receive-starting-time', (time) => {
    updateStartingTime(time);
})

// ========================== GAME SETUP =========================

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
        
        boardCells[i].addEventListener('click', handleClick, { once: false }) ;

        board.insertBefore(boardCells[i], null);
    }

    // add pieces to the board
    readFen(startingFen);
}

// rotates the board representation by 180 degrees
function flipBoard() {
    // select every board square
    let boardSquares = document.getElementsByClassName('square');

    // remove each board square from the gui
    for (let i = boardSquares.length -1; i >= 0; i--) {
        boardSquares[i].remove();
    }

    // set the saved board rotation to be from the opposite color's persepective
    boardRotation = getOpposositeColor(boardRotation);

    // redraw the board from white's perspective
    if (boardRotation == "white") {
        for (let i = 0; i < 64; i++) {
            board.insertBefore(boardCells[i], null);
        }
    }

    // redraw the board from black's perspective
    if (boardRotation == "black") {
        for (let i = 63; i >= 0; i--) {
            board.insertBefore(boardCells[i], null);
        }
    }

    // invert timers but only if the game has started
    // when the game starts, the timer should always start on the bottom
    if (gameStarted) {
        flipTimers();
    }
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

// ========================== SELECTING PIECES FROM THE BOARD =====================

function handleClick(e) {

    console.log(e.target);

    // if the player selects one of the board squares, attempt to select the square if they have a piece there
    if (e.target.classList.contains('square')) {
        square = e.target;
        selectSquare(square);
    }
}

function selectSquare(square)
{
    // don't allow any selections unless the game has started
    if (!gameStarted) {
        return;
    }

    // don't allow any selections unless it's this client's turn
    if (playerColor != currentTurnColor) {
        return;
    }

    if (selectedSquare != null) {
        selectedSquare.classList.remove("selectedSquare");

        if (selectedSquare != square) {
            console.log(boardCells.indexOf(selectedSquare));

            let startIndex = boardCells.indexOf(selectedSquare);
            let endIndex = boardCells.indexOf(square);

            if (boardPieces[startIndex] != null)
            {
                var legalMoves = findPieceLegalMoves(startIndex, boardPieces);

                legalMoves = filterChecksFromLegalMoves(legalMoves, playerColor);

                foundMove = legalMoves.find((move) => {
                    return move.endIndex == endIndex;
                });


                if (foundMove != null) {
                    // check if the piece is a pawn, incase a promotion will happen
                    if (boardPieces[foundMove.startIndex].id == "pawn") {
                        // don't make the move yet if a pawn promotion is going to happen
                        // the move will be made after a choice from the promotion menu is selected
                        if(checkForPawnPromotion(foundMove)) {
                            return;
                        }
                    }
                    
                    let moveSuccess = makeNetworkedMove(foundMove);

                    if (moveSuccess) {
                        return;
                    }
                }
                
            }
        }
    } 

    hideLegalMoves();


    let pieceIndex = boardCells.indexOf(square);

    // only select piece if the square contains a piece and that piece is of the same color as the player
    if (boardPieces[pieceIndex] != null) {
        if (boardPieces[pieceIndex].color == playerColor) {
            square.classList.add("selectedSquare");
            selectedSquare = square;

            let legalMoves = findPieceLegalMoves(pieceIndex, boardPieces);

            legalMoves = filterChecksFromLegalMoves(legalMoves, playerColor);


            showLegalMoves(legalMoves);
        } else {
            selectedSquare = null;
        }
    } else {
        selectedSquare = null;
    }
}

function makeNetworkedMove(preparedMoved) {
    let moveSuccess = makeMove(preparedMoved.startIndex, preparedMoved.endIndex, preparedMoved.moveType);

    if (moveSuccess) {
        socket.emit('make-move', preparedMoved.startIndex, preparedMoved.endIndex, preparedMoved.moveType);

        hideLegalMoves();

        
    }
    return moveSuccess;
}

// =================================== LEGAL MOVES ====================================

/* 
*  Finds every legal move that a given player could make.
*  Does not filter out moves that would allow the player to put themselves into check.
*
*  boardPiecesState represents a given board that the piece is on. Typically will be boardPieces.
*  boardsPiecesState can be other representations though for simulating what the board would look like after a given move.
*/
function findColorLegalMoves(color, boardPiecesState) {
    legalMoves = [];

    for (pieceIndex = 0; pieceIndex < 64; pieceIndex++) {
        let piece = boardPiecesState[pieceIndex];

        if (piece != null) {
            if (piece.color == color)
            {
                legalMoves = legalMoves.concat(findPieceLegalMoves(pieceIndex, boardPiecesState));
            }
        }
    }

    return legalMoves;
}

/*
*  Takes in a given piece and returns all of the given index's that the piece could move to.
*
*  boardPiecesState represents a given board that the piece is on. Typically will be boardPieces.
*  boardsPiecesState can be other representations though for simulating what the board would look like after a given move.
*/
function findPieceLegalMoves(pieceIndex, boardPiecesState)
{
    let piece = boardPiecesState[pieceIndex];

    // return if theres no piece at the pieceIndex
    if (piece == null) {
        return;
    }

    let legalMoves = [];

    if (piece.id == "rook") {
        legalMoves = findLegalMovesRook(pieceIndex, boardPiecesState);
    }

    if (piece.id == "bishop") {
        legalMoves = findLegalMovesBishop(pieceIndex, boardPiecesState);
    }

    if (piece.id == "knight") {
        legalMoves = findLegalMovesKnight(pieceIndex, boardPiecesState);
    }

    if (piece.id == "queen") {
        legalMoves = findLegalMovesBishop(pieceIndex, boardPiecesState);
        legalMoves = legalMoves.concat(findLegalMovesRook(pieceIndex, boardPiecesState));
    }

    if (piece.id == "king") {
        legalMoves = findLegalMovesKing(pieceIndex, boardPiecesState);
    }
    
    if (piece.id == "pawn") {
        legalMoves = findLegalMovesPawn(pieceIndex, boardPiecesState);
    }

    return legalMoves;
}

function showLegalMoves (legalMoves) {
    for (let i = 0; i < legalMoves.length; i++) {
        let squareIndex = legalMoves[i].endIndex;
        boardCells[squareIndex].classList.add("legalMoveSquare");
    }
}

function hideLegalMoves (legalMoves) {
    // remove the highlight from all of the previous legal move squares
    var legalMoveSquares = document.getElementsByClassName("legalMoveSquare");
    while (legalMoveSquares.length) {
        legalMoveSquares[0].classList.remove("legalMoveSquare");
    }
}

function findLegalMovesRook(pieceIndex, boardPiecesState)
{
    console.log("Rook Legal Moves");
    console.log(pieceIndex);

    let legalMoves = [];

    boundHit = false;
    let moveIndex = pieceIndex;

    // find moves in increasing ranks
    while (!boundHit)
    {
        moveIndex -= 8;
        // index is off the board
        if (moveIndex < 0) {
            boundHit = true;
            break;
        }
        // a piece is on the move index
        if (boardPiecesState[moveIndex] != null) {
            
            boundHit = true;

            // piece is of the same color as the piece being moved
            if (boardPiecesState[moveIndex].color == boardPiecesState[pieceIndex].color) {
                break;
            }
        }

        legalMoves.push(new Move(pieceIndex, moveIndex, "normal"));
    }

    boundHit = false;
    moveIndex = pieceIndex;

    // find moves in decreasing ranks
    while (!boundHit)
    {
        moveIndex += 8;
        // index is off the board
        if (moveIndex > 63) {
            boundHit = true;
            break;
        }
        // a piece is on the move index
        if (boardPiecesState[moveIndex] != null) {
            
            boundHit = true;

            // piece is of the same color as the piece being moved
            if (boardPiecesState[moveIndex].color == boardPiecesState[pieceIndex].color) {
                break;
            }
        }

        legalMoves.push(new Move(pieceIndex, moveIndex, "normal"));
    }

    boundHit = false;
    moveIndex = pieceIndex;

    // find moves in increasing files
    while (!boundHit)
    {
        moveIndex += 1;
        // index is on the next rank
        if (moveIndex % 8 == 0 || moveIndex > 63) {
            boundHit = true;
            break;
        }
        // a piece is on the move index
        if (boardPiecesState[moveIndex] != null) {
            
            boundHit = true;

            // piece is of the same color as the piece being moved
            if (boardPiecesState[moveIndex].color == boardPiecesState[pieceIndex].color) {
                break;
            }
        }
        legalMoves.push(new Move(pieceIndex, moveIndex, "normal"));
    }

    boundHit = false;
    moveIndex = pieceIndex;

    // find moves in decreasing files
    while (!boundHit)
    {
        moveIndex -= 1;
        // index is on the previous rank
        if (moveIndex % 8 == 7 || moveIndex < 0) {
            boundHit = true;
            break;
        }
        // a piece is on the move index
        if (boardPiecesState[moveIndex] != null) {
            
            boundHit = true;

            // piece is of the same color as the piece being moved
            if (boardPiecesState[moveIndex].color == boardPiecesState[pieceIndex].color) {
                break;
            }
        }
        legalMoves.push(new Move(pieceIndex, moveIndex, "normal"));
    }

    return legalMoves;
}

function findLegalMovesBishop (pieceIndex, boardPiecesState) {
    
    console.log("Bishop Legal Moves");
    console.log(pieceIndex);

    let legalMoves = [];

    boundHit = false;
    let moveIndex = pieceIndex;

    // finds moves in increasing ranks, increasing files
    while (!boundHit) {
        moveIndex -= 7;
        // index is off the board
        if (moveIndex < 0 || moveIndex % 8 == 0) {
            boundHit = true;
            break;
        }

        if (boardPiecesState[moveIndex] != null) {
            
            boundHit = true;

            // piece is of the same color as the piece being moved
            if (boardPiecesState[moveIndex].color == boardPiecesState[pieceIndex].color) {
                break;
            }
        }
        legalMoves.push(new Move(pieceIndex, moveIndex, "normal"));
    }

    boundHit = false;
    moveIndex = pieceIndex;

    // finds moves in increasing ranks, decreasing files
    while (!boundHit) {
        moveIndex -= 9;
        // index is off the board
        if (moveIndex < 0 || moveIndex % 8 == 7) {
            boundHit = true;
            break;
        }

        if (boardPiecesState[moveIndex] != null) {
            
            boundHit = true;

            // piece is of the same color as the piece being moved
            if (boardPiecesState[moveIndex].color == boardPiecesState[pieceIndex].color) {
                break;
            }
        }
        legalMoves.push(new Move(pieceIndex, moveIndex, "normal"));
    }

    boundHit = false;
    moveIndex = pieceIndex;

    // finds moves in decreasing ranks, increasing files
    while (!boundHit) {
        moveIndex += 9;
        // index is off the board
        if (moveIndex > 63 || moveIndex % 8 == 0) {
            boundHit = true;
            break;
        }

        if (boardPiecesState[moveIndex] != null) {
            
            boundHit = true;

            // piece is of the same color as the piece being moved
            if (boardPiecesState[moveIndex].color == boardPiecesState[pieceIndex].color) {
                break;
            }
        }
        legalMoves.push(new Move(pieceIndex, moveIndex, "normal"));
    }

    boundHit = false;
    moveIndex = pieceIndex;

    // finds moves in decreasing ranks, increasing files
    while (!boundHit) {
        moveIndex += 7;
        // index is off the board
        if (moveIndex > 63 || moveIndex % 8 == 7) {
            boundHit = true;
            break;
        }

        if (boardPiecesState[moveIndex] != null) {
            
            boundHit = true;

            // piece is of the same color as the piece being moved
            if (boardPiecesState[moveIndex].color == boardPiecesState[pieceIndex].color) {
                break;
            }
        }
        legalMoves.push(new Move(pieceIndex, moveIndex, "normal"));
    }


    return legalMoves;
}

function findLegalMovesKnight (pieceIndex, boardPiecesState) {

    console.log("Knight Legal Moves");

    let legalMoves = [];
    let moveIndexes = [pieceIndex - 6, pieceIndex - 10, pieceIndex - 15, pieceIndex - 17, pieceIndex + 6, pieceIndex + 10, pieceIndex + 15, pieceIndex + 17];

    for (let i = 0; i < moveIndexes.length; i++) {
        let moveIndex = moveIndexes[i];
        let isLegal = true;
        
        // move is off the board
        if (moveIndex < 0 || moveIndex > 63) {
            isLegal = false;
        }

        // move wraps the screen
        if (((pieceIndex % 8 == 0 ||  pieceIndex % 8 == 1) && (moveIndex % 8 == 7 || moveIndex % 8 == 6)) || 
        ((pieceIndex % 8 == 7 || pieceIndex % 8 == 6) && (moveIndex % 8 == 0 || moveIndex % 8 == 1))) {
            isLegal = false;
        }

        // move is blocked by piece of the same color
        if (boardPiecesState[moveIndex] != null) {
            if (boardPiecesState[pieceIndex].color == boardPiecesState[moveIndex].color) {
                isLegal = false;
            }
        }
       

        if (isLegal) {
            legalMoves.push(new Move(pieceIndex, moveIndex, "normal"));
        }
    }

    return legalMoves;
}

function findLegalMovesKing(pieceIndex, boardPiecesState) {

    console.log("King Legal Moves");

    let legalMoves = [];
    let moveIndexes = [pieceIndex + 8, pieceIndex - 8, pieceIndex + 1, pieceIndex - 1, pieceIndex + 9, pieceIndex - 9, pieceIndex + 7, pieceIndex - 7];

    for (let i = 0; i < moveIndexes.length; i++) {
        let moveIndex = moveIndexes[i];
        let isLegal = true;
        
        // move is off the board
        if (moveIndex < 0 || moveIndex > 63) {
            isLegal = false;
        }

        // move wraps the screen
        if ((pieceIndex % 8 == 0 && moveIndex % 8 == 7) || (pieceIndex % 8 == 7 && moveIndex % 8 == 0)) {
            isLegal = false;
        }

        // move is blocked by piece of the same color
        if (boardPiecesState[moveIndex] != null) {
            if (boardPiecesState[pieceIndex].color == boardPiecesState[moveIndex].color) {
                isLegal = false;
            }
        }
       

        if (isLegal) {
            legalMoves.push(new Move(pieceIndex, moveIndex, "normal"));
        }
    }

    // check if a short castle is possible
    let shortCastle = checkShortCastle(pieceIndex, boardPiecesState);
    if (shortCastle != null) {
        legalMoves.push(shortCastle);
    }

    // check if a long castle is possible
    let longCastle = checkLongCastle(pieceIndex, boardPiecesState);
    if (longCastle != null) {
        legalMoves.push(longCastle);
    }

    return legalMoves;
}

function checkShortCastle(pieceIndex, boardPiecesState) {
    const king = boardPiecesState[pieceIndex];

    // make sure that the king has not moved
    if (king.hasMoved == true) {
        return;
    }

    // make sure that there is a rook to the right
    if (boardPiecesState[pieceIndex + 3] == null) {
        return;
    }

    // make sure that the right rook has not moved
    if (boardPiecesState[pieceIndex + 3].hasMoved == true) {
        return;
    }

    // make sure that the squares between the king and the right rook are empty
    if (boardPiecesState[pieceIndex + 1] != null || boardPiecesState[pieceIndex + 2] != null) {
        return;
    }

    // make sure that the king does not cross through a check
    let checkCausingMove;

    if (king.color == "white") {
        checkCausingMove = blackPossibleLegalMoves.filter(move => {
            return move.endIndex == pieceIndex + 1;
        });
    } else {
        checkCausingMove = whitePossibleLegalMoves.filter(move => {
            return move.endIndex == pieceIndex + 1;
        });
    }
    
    if (checkCausingMove.length > 0) {
        return;
    }

    // make sure that the king is not currently in check
    checkCausingMove = [];

    if (king.color == "white") {
        checkCausingMove = blackPossibleLegalMoves.filter(move => {
            return move.endIndex == pieceIndex;
        });
    } else {
        checkCausingMove = whitePossibleLegalMoves.filter(move => {
            return move.endIndex == pieceIndex;
        });
    }
    
    if (checkCausingMove.length > 0) {
        return;
    }

    // return the check move based upon color
    if (king.color == "white") {
        return new Move(pieceIndex, pieceIndex + 2, "white-SC");
    } else {
        return new Move(pieceIndex, pieceIndex + 2, "black-SC");
    }
}

function checkLongCastle(pieceIndex, boardPiecesState) {
    const king = boardPiecesState[pieceIndex];

    // make sure that the king has not moved
    if (king.hasMoved == true) {
        return;
    }

    // make sure that there is a rook to the right
    if (boardPiecesState[pieceIndex - 4] == null) {
        return;
    }

    // make sure that the right rook has not moved
    if (boardPiecesState[pieceIndex - 4].hasMoved == true) {
        return;
    }

    // make sure that the squares between the king and the right rook are empty
    if (boardPiecesState[pieceIndex - 1] != null || boardPiecesState[pieceIndex - 2] != null || boardPiecesState[pieceIndex - 3] != null) {
        return;
    }

    // make sure that the king does not cross through a check
    let checkCausingMove;

    if (king.color == "white") {
        checkCausingMove = blackPossibleLegalMoves.filter(move => {
            return move.endIndex == pieceIndex - 1;
        });
    } else {
        checkCausingMove = whitePossibleLegalMoves.filter(move => {
            return move.endIndex == pieceIndex - 1;
        });
    }
    
    if (checkCausingMove.length > 0) {
        return;
    }

    // make sure that the king is not currently in check
    checkCausingMove = [];

    if (king.color == "white") {
        checkCausingMove = blackPossibleLegalMoves.filter(move => {
            return move.endIndex == pieceIndex;
        });
    } else {
        checkCausingMove = whitePossibleLegalMoves.filter(move => {
            return move.endIndex == pieceIndex;
        });
    }
    
    if (checkCausingMove.length > 0) {
        return;
    }

    // return the check move based upon color
    if (king.color == "white") {
        return new Move(pieceIndex, pieceIndex - 2, "white-LC");
    } else {
        return new Move(pieceIndex, pieceIndex - 2, "black-LC");
    }
}

function findLegalMovesPawn (pieceIndex, boardPiecesState) {

    console.log("Pawn Legal Moves");

    let legalMoves = [];
    let moveIndex = pieceIndex;

    let moveDirection = 1;

    const piece = boardPiecesState[pieceIndex];

    // set move direction based upon the pawn's color
    if (piece.color == "white") {
        moveDirection = -1;
    }

    moveIndex += 8 * moveDirection;

    // check for single pawn push
    if (boardPiecesState[moveIndex] == null) {
        legalMoves.push(new Move(pieceIndex, moveIndex, "normal"));

        moveIndex += 8 * moveDirection;

        // check for double pawn push
        if (piece.hasMoved == false && boardPiecesState[moveIndex] == null) {
            legalMoves.push(new Move(pieceIndex, moveIndex, "normal"));
        }
    }

    moveIndex = (pieceIndex + 8 * moveDirection) - 1;

    // check for left capture
    if (boardPiecesState[moveIndex] != null && moveIndex % 8 != 7) {
        if (boardPiecesState[moveIndex].color != piece.color) {
            legalMoves.push(new Move(pieceIndex, moveIndex, "normal"));
        }
    }

    moveIndex = (pieceIndex + 8 * moveDirection) + 1;
    
    // check for right capture
    if (boardPiecesState[moveIndex] != null && moveIndex % 8 != 0) {
        if (boardPiecesState[moveIndex].color != piece.color) {
            legalMoves.push(new Move(pieceIndex, moveIndex, "normal"));
        }
    }

    // check for en passant
    // is the piece one the en passant rank for white
    if (boardPiecesState[pieceIndex].color == "white" && (pieceIndex >= 24 && pieceIndex <= 31)) {
        console.log("Holy hell");

        const lastMoveIndex = movesEndIndexes[movesEndIndexes.length - 1];
        
        // was the last moved piece a pawn of the opposite color
        if (boardPiecesState[lastMoveIndex].id == "pawn" && boardPiecesState[lastMoveIndex].color == "black") {
            
            // look at if the last move was to the square to the left of our pawn and doesn't wrap the board
            if (lastMoveIndex == (pieceIndex - 1) && lastMoveIndex >= 24) {
                
                // look at if the last move was a double pawn push
                if ((lastMoveIndex - 16) == movesStartIndexes[movesStartIndexes.length - 1]) {
                    legalMoves.push(new Move(pieceIndex, pieceIndex - 9, "white-EP"));
                }
            }

            // look at if the last move was to the square to the right of our pawn and doesn't wrap the board
            if (lastMoveIndex == (pieceIndex + 1) && lastMoveIndex <= 31) {
                
                // look at if the last move was a double pawn push
                if ((lastMoveIndex - 16) == movesStartIndexes[movesStartIndexes.length - 1]) {
                    legalMoves.push(new Move(pieceIndex, pieceIndex - 7, "white-EP"));
                }
            }
        }
    }

    // is the piece one the en passant rank for black
    if (boardPiecesState[pieceIndex].color == "black" && (pieceIndex >= 32 && pieceIndex <= 39)) {
        console.log("Holy hell");

        const lastMoveIndex = movesEndIndexes[movesEndIndexes.length - 1];
        
        // was the last moved piece a pawn of the opposite color
        if (boardPiecesState[lastMoveIndex].id == "pawn" && boardPiecesState[lastMoveIndex].color == "white") {
            
            // look at if the last move was to the square to the left of our pawn and doesn't wrap the board
            if (lastMoveIndex == (pieceIndex - 1) && lastMoveIndex >= 32) {
                
                // look at if the last move was a double pawn push
                if ((lastMoveIndex + 16) == movesStartIndexes[movesStartIndexes.length - 1]) {
                    legalMoves.push(new Move(pieceIndex, pieceIndex + 7, "black-EP"));
                }
            }

            // look at if the last move was to the square to the right of our pawn and doesn't wrap the board
            if (lastMoveIndex == (pieceIndex + 1) && lastMoveIndex <= 39) {
                
                // look at if the last move was a double pawn push
                if ((lastMoveIndex + 16) == movesStartIndexes[movesStartIndexes.length - 1]) {
                    legalMoves.push(new Move(pieceIndex, pieceIndex + 9, "black-EP"));
                }
            }
        }
    }

    return legalMoves;
}

// removes any move that would put the player into self-check from the list of legal moves
function filterChecksFromLegalMoves(legalMoves, color) {
    let kingIndex = -1;

    // find the player's king
    kingIndex = findKing(color);

    let filteredLegalMoves = [];

    // traversese through legal moves, and add each move to the filtered list if the move does not put the current player into check
    for (let i = 0; i < legalMoves.length; i++)
    {
        let move = legalMoves[i];

        // updates the king index for the test move function, incase the move involves moving the king
        let kingIndexAfterMove = kingIndex;
        if (move.startIndex == kingIndex) {
            kingIndexAfterMove = move.endIndex;
        }
        
        // test and add move if its still legal
        if (!testLegalMoveForCheck(move, color, kingIndexAfterMove)) {
            filteredLegalMoves.push(move);
        }
    }
    
    return filteredLegalMoves;
}

// returns true if the move results in a check, false otherwise.
// simulates a given move by making the given move, and then looking to see if then has a move which attacks the king
function testLegalMoveForCheck(move, color, kingIndex) {
    let simulatedBoardPieces = [...boardPieces];

    // move make the move on our simulated board;
    simulatedBoardPieces[move.endIndex] = simulatedBoardPieces[move.startIndex];
    simulatedBoardPieces[move.startIndex] = null;


    let opposingColor = "white";
    if (color == opposingColor) {
        opposingColor = "black";
    }

    // all of the moves that the other player could make after the simulated move
    let opposingColorSimMoves = findColorLegalMoves(opposingColor, simulatedBoardPieces);

    // look if any of opposing players moves could now attack the player's king
    for (let i = 0; i < opposingColorSimMoves.length; i++) {

        if (opposingColorSimMoves[i].endIndex == kingIndex) {
            return true;
        }
    }
    return false;
}

function findKing(color) {
    let kingIndex = -1;

    // find index of the color's king
    for (let i = 0; i < 64; i++) {
        let piece = boardPieces[i];

        if (piece != null) {
            if (piece.id == "king" && piece.color == color) {
                kingIndex = i;
                break;
            }
        }
    }

    return kingIndex;
}

// =========================== PAWN PROMOTION ==========================

let promotingMove = null;

// returns true if a given pawn move would result in a promotion
// if a promotion is going to happen display the promotion menu
function checkForPawnPromotion(pawnMove) {
    pawn = boardPieces[pawnMove.startIndex];

    let pawnPromotion = false;

    if (pawn.color == "white") {
        // is the pawn on black's back rank
        if (pawnMove.endIndex < 8) {
            // display the promotion menu
            let promotionMenu = document.getElementById("promotionMenu");
            promotionMenu.style.display = "block";

            pawnPromotion = true;
            promotingMove = pawnMove;
        }
    }

    if (pawn.color == "black") {
        // is the pawn on black's back rank
        if (pawnMove.endIndex > 55) {
            // display the promotion menu
            let promotionMenu = document.getElementById("promotionMenu");
            promotionMenu.style.display = "block";

            pawnPromotion = true;
            promotingMove = pawnMove;
        }
    }
    return pawnPromotion;
}

// takes in a promotion type that was selected from the promotion menu and makes the final promoting move with it
function selectPawnPromotion(promotionType) {
    // hid the promotion menu
    let promotionMenu = document.getElementById("promotionMenu");
    promotionMenu.style.display = "none";

    promotingMove.moveType = promotionType;

    makeNetworkedMove(promotingMove);

    promotingMove = null;
}


var promotionQueen = document.getElementById("promotionQueen");

promotionQueen.onclick = () => {
    selectPawnPromotion("promotion-q");
}

var promotionRook = document.getElementById("promotionRook");

promotionRook.onclick = () => {
    selectPawnPromotion("promotion-r");
}

var promotionBishop = document.getElementById("promotionBishop");

promotionBishop.onclick = () => {
    selectPawnPromotion("promotion-b");
}

var promtionKnight = document.getElementById("promtionKnight");

promtionKnight.onclick = () => {
    selectPawnPromotion("promotion-n");
}

// =========================== MAKE MOVE ================================

function makeMove(startIndex, endIndex, moveType) {

    console.log("Making move " + startIndex + ", " + endIndex);

    fiftyMoveCounter+= 0.5;

    // if a pice is being taken, remove its image from the screen
    if (boardPieces[endIndex] != null) {
        let pieceImage = document.getElementById('pieceImage' + endIndex);
        pieceImage.parentNode.removeChild(pieceImage);

        // reset the turn counter for the fifty move rule
        fiftyMoveCounter = 0;
    }

    // make the actual move
    movePieceIndex(startIndex, endIndex);

    if (moveType != "normal") {
        makeSpecialMove(startIndex, endIndex, moveType);
    }

    // add the move to the list of moves made
    movesStartIndexes.push(startIndex);
    movesEndIndexes.push(endIndex);

    // saves each color's possible legal moves to be used in eliminating moves legal moves that would put the next playing color into accidental check
    whitePossibleLegalMoves = findColorLegalMoves("white", boardPieces);
    blackPossibleLegalMoves = findColorLegalMoves("black", boardPieces);
    
    if (currentTurnColor == "white") {
        blackFilteredLegalMoves = filterChecksFromLegalMoves(blackPossibleLegalMoves, "black");
    } else {
        whiteFilteredLegalMoves = filterChecksFromLegalMoves(whitePossibleLegalMoves, "white");
    }
    
    

    checkForWinOrStalemate();
    checkForDraws();

    swapTurn();

    // success
    return true;
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
            // remove attacked piece
            boardPieces[startIndex + 1] = null;

            // remove attacked piece image
            let pieceImage = document.getElementById('pieceImage' + (startIndex + 1));
            pieceImage.parentNode.removeChild(pieceImage);
        }

        // attacking the pawn to the left
        if (startIndex - endIndex == 9) {
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
            // remove attacked piece
            boardPieces[startIndex + 1] = null;

            // remove attacked piece image
            let pieceImage = document.getElementById('pieceImage' + (startIndex + 1));
            pieceImage.parentNode.removeChild(pieceImage);
        }

        // attacking the pawn to the left
        if (endIndex - startIndex == 7) {
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

function swapTurn() {
    if (currentTurnColor == "white")
    {
        currentTurnColor = "black";
    } else {
        currentTurnColor = "white";
    }
}

/*
*  Checks for if a win or a stalemate has occurred. 
*
*  A player wins if the opposite has no legal moves and is in check.
*  A Stalemate occurs if the opposite player has no legal moves and is not in check.
*/
function checkForWinOrStalemate() {
    if (currentTurnColor == "black") {
        if (whiteFilteredLegalMoves.length == 0) {
            let kingIndex = findKing("white");

            let checkCausingMove = blackPossibleLegalMoves.filter(move => {
                return move.endIndex == kingIndex;
            });

            // if the king is in check, black wins.
            // otherwise stalemate happens.
            if (checkCausingMove.length > 0) {
                endGame("Checkmate. Black Wins!", "Checkmate", "black");
            } else {
                endGame("Stalemate!", "Stalemate", "none");
            }


        }
    } else {
        if (blackFilteredLegalMoves.length == 0) {
            let kingIndex = findKing("black");

            let checkCausingMove = whitePossibleLegalMoves.filter(move => {
                return move.endIndex == kingIndex;
            });

            // if the king is in check, white wins.
            // otherwise stalemate happens.
            if (checkCausingMove.length > 0) {
                endGame("Checkmate. White Wins!", "Checkmate", "white");
            } else {
                endGame("Stalemate!", "Stalemate");
            }
        }
    }
}

// Checks for fifty move rule and insufficient material draws.
// Ends the games if a draw is found
function checkForDraws() {
    // fifty move rule, where no piece has been captured for 50 turns
    if (fiftyMoveCounter == 50) {
        endGame("Draw! 50 Move Rule.", "Draw", "none");
    }

    // get list of all of white's current pieces
    let whiteMaterial = getPieceList("white");

    // get list of all of black's current pieces
    let blackMaterial = getPieceList("black");

    // list of possible insufficient piece combos
    const combo1Color1 = ['king'];
    const combo1Color2 = ['king'];
    const combo2Color1 = ['king'];
    const combo2Color2 = ['king', 'bishop'];
    const combo3Color1 = ['king'];
    const combo3Color2 = ['king', 'knight'];
    const combo4Color1 = ['king', 'bishop'];
    const combo4Color2 = ['king', 'bishop'];

    console.log("WHITE MATERIAL");
    console.log(whiteMaterial);
    console.log("BLACK MATERIAL");
    console.log(blackMaterial);

    if (blackMaterial.length <= 2 && whiteMaterial.length <= 2) {
        checkInsufficientMaterial(whiteMaterial, blackMaterial, combo1Color1, combo1Color2);
        checkInsufficientMaterial(whiteMaterial, blackMaterial, combo1Color2, combo1Color1);
        checkInsufficientMaterial(whiteMaterial, blackMaterial, combo2Color1, combo2Color2);
        checkInsufficientMaterial(whiteMaterial, blackMaterial, combo2Color2, combo2Color1);
        checkInsufficientMaterial(whiteMaterial, blackMaterial, combo3Color1, combo3Color2);
        checkInsufficientMaterial(whiteMaterial, blackMaterial, combo3Color2, combo3Color1);
        checkInsufficientMaterial(whiteMaterial, blackMaterial, combo4Color1, combo4Color2);
        checkInsufficientMaterial(whiteMaterial, blackMaterial, combo4Color2, combo4Color1);
    }
}

function checkInsufficientMaterial(whiteMaterial, blackMaterial, combo1, combo2) {
    let whiteInsufficient = true;
    let blackInsufficient = true;

    let whiteHasBishop = false;
    let blackHasBishop = false;

    let whiteBishopSquareColor;
    let blackBishopSquareColor;

    // check if white meets insufficient material requirements
    for (let i = 0; i < whiteMaterial.length; i++) {
        // see if a white has a piece from the first combo that would allow them to checkmate
        for (let j = 0; j < combo1.length; j++) {
            if (!combo1.includes(whiteMaterial[i].id)) {
                whiteInsufficient = false;
            }
        }

        console.log(whiteMaterial[i].id);

        // check if white has a bishop pair to see if a bishop pair exists
        if (whiteMaterial[i].id == 'bishop') {
            whiteHasBishop = true;

            // find if the bishop is on a light or a dark square
            let bishopRank = Math.floor(whiteMaterial[i].index / 8);
            let bishopColumn = whiteMaterial[i].index % 8;
            whiteBishopSquareColor = (bishopRank + bishopColumn) % 2;
        }
    }

    // check if black meets insufficient material requirements
    for (let i = 0; i < blackMaterial.length; i++) {

        // see if a white has a piece from the second combo that would allow them to checkmate
        for (let j = 0; j < combo2.length; j++) {
            if (!combo2.includes(blackMaterial[i].id)) {
                blackInsufficient = false;
            }
        }

        // check if white has a bishop pair to see if a bishop pair exists
        if (blackMaterial[i].id == 'bishop') {
            blackHasBishop = true;

            // find if the bishop is on a light or a dark square
            let bishopRank = Math.floor(blackMaterial[i].index / 8);
            let bishopColumn = blackMaterial[i].index % 8;
            blackBishopSquareColor = (bishopRank + bishopColumn) % 2;
        }
    }

    // check if the bishop pair exists
    if (whiteHasBishop == true && blackHasBishop == true) {
        console.log(whiteBishopSquareColor);
        console.log(blackBishopSquareColor);
        if (whiteBishopSquareColor != null && blackBishopSquareColor != null) {
            // check if the bishops are on the same square color
            if (whiteBishopSquareColor != blackBishopSquareColor) {
                whiteInsufficient = false;
                blackInsufficient = false;
            }
        }
        
    }

    if (whiteInsufficient == true && blackInsufficient == true) {
        endGame("Draw! Insufficient Material", "Draw", "none");
    }
}

// returns an array of all of the pieces a given color currently has
function getPieceList(color) {
    let pieceList = [];
    for (let i = 0; i < 64; i++) {
        if (boardPieces[i] != null) {
            if (boardPieces[i].color == color) {
                pieceList.push(boardPieces[i]);
            }
        }
    }

    return pieceList;
}

// returns the total value of piece material that a given player has
function calculateMaterial(color) {
    let material = 0;

    for (let i = 0; i < 64; i++){
        
        piece = boardPieces[i];

        if (piece != null) {
            if (piece.color == color) {
                material += piece.materialValue;
            }
        }  
    }

    return material;
}


// swaps the players color during setup if the game has not started
document.getElementById("color-button").onclick = function() {
    if (!gameStarted) {
        swapPlayerColor();

        socket.emit('player-color-changed', playerColor);
    }
};

// swaps player colors and changes the value of the button to change colors
function swapPlayerColor () {
    if (playerColor == "white") {
        playerColor = "black";

        document.getElementById("color-button").innerText = "Black";
    } else {
        playerColor = "white";

        document.getElementById("color-button").innerText = "White";
    }

    flipBoard();

    updatePromotionMenuColor();
}

// changes the images in the promotion menu to match the player's current color
function updatePromotionMenuColor() {
    let imgQueen = document.getElementById("promotionQueenImg");
    let imgRook = document.getElementById("promotionRookImg");
    let imgBishop = document.getElementById("promotionBishopImg");
    let imgKnight = document.getElementById("promotionKnightImg");
    
    if (playerColor == "white") {
        imgQueen.src = "/images/w_queen_2x_ns.png";
        imgRook.src = "/images/w_rook_2x_ns.png";
        imgBishop.src = "/images/w_bishop_2x_ns.png";
        imgKnight.src = "/images/w_knight_2x_ns.png";
    } else {
        imgQueen.src = "/images/b_queen_2x_ns.png";
        imgRook.src = "/images/b_rook_2x_ns.png";
        imgBishop.src = "/images/b_bishop_2x_ns.png";
        imgKnight.src = "/images/b_knight_2x_ns.png";
    }
}

document.getElementById("flipBoardButton").onclick = function() {
    if (gameStarted) {
        flipBoard();
    }
};

document.getElementById("start-button").onclick = function() {
    // if an opponent is connected start the game. Otherwise display an error.
    if (opponentConnected && !gameStarted) {
        gameStarted = true;

        socket.emit('start-game', playerColor, (startingTime / 60));

        // hide the game controls
        let gameControls = document.getElementById("gameControls");
        gameControls.style.display = "none";
    
        console.log("Game Started");
    } else {
        alert("An opponent has not joined the game.");
    }
}

const startTime = document.getElementById("startTime");

startTime.addEventListener('change', (e) => {
    let time = e.target.value;

    if (time < 1) {
        startTime.value = 1;
        time = 1;
    }

    if (time > 60) {
        startTime.value = 60;
        time = 60;
    }

    updateStartingTime(time);

    socket.emit('starting-time-changed', time);
  });

  function updateStartingTime(time) {
    startingTime = time * 60;
    playerTime = startingTime;
    opponentTime = startingTime;

    timer1.innerHTML = time + ":00";
    timer2.innerHTML = time + ":00";
  }


// =================== END GAME =====================


function endGame(endGameMessage, endCondition, winningColor) {
    // stop gameplay
    gameStarted = false;

    // set the end game pop up window's text
    var gameEndText = document.getElementById("gameEndText");
    gameEndText.innerHTML = endGameMessage;

    // display the end game pop up window
    var endGameWindow = document.getElementById("gameEndWindow");
    endGameWindow.style.display = "block";

    // notify server of game end
    socket.emit('end-game', endCondition, winningColor);
}

// close out of the end game window
var endGameClose = document.getElementsByClassName("game_end_close")[0];

endGameClose.onclick = () => {
    var endGameWindow = document.getElementById("gameEndWindow");
    endGameWindow.style.display = "none";
}


// ======================= CHAT ================

var chatSubmit = document.getElementById("chatSubmit");
var chatInput = document.getElementById('chatMessage');
var messageList = document.getElementById('messageList');

// get chat input after pressing submit button
chatSubmit.onclick = () => {
    chatMessage = chatInput.value;
    sendChatMessage(chatMessage);
}

// get chat input after pressing enter in the input box
chatInput.addEventListener("keyup", (e) => {
    // check if key is enter
    if (e.keyCode == 13) {
        chatMessage = chatInput.value;
        sendChatMessage(chatMessage);
    }
});

// send the chat message if it meets the proper requiremenets
function sendChatMessage(chatMessage) {
    // don't send message if it is empty
    if (chatMessage.length == 0) {
        return;
    }

    // send message to the server
    socket.emit('chat-send', chatMessage, username);

    displayChatMessage(chatMessage, username);

    // clear the chat input;
    chatInput.value = '';
}

// receive and display chat message
socket.on('chat-receive', (chatMessage, opponentUsername) => {
    displayChatMessage(chatMessage, opponentUsername);
});

function displayChatMessage(chatMessage, username) {
     // add a horizontal line to divide messages if this isn't the first message
     if (messageList.childElementCount != 0) {
        var lineBreak = document.createElement("hr");
     lineBreak.setAttribute("class", "chat_line");
     messageList.appendChild(lineBreak);
     } 
 
    if (username != null) {
        // display message on the message list with username
        var displayMessage = document.createElement("li");
        displayMessage.appendChild(document.createTextNode(username + ": " + chatMessage));
        messageList.appendChild(displayMessage);
    } else {
        // display message on the message list without username
        var displayMessage = document.createElement("li");
        displayMessage.appendChild(document.createTextNode(chatMessage));
        messageList.appendChild(displayMessage);
    }


     scrollChatMessages();
}

function scrollChatMessages() {
    chatMessages = document.getElementById("chatMessages");
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// ================= TIMERS ===================

let startingTime = 600;
let playerTime = startingTime;
let opponentTime = startingTime;

const timer1 = document.getElementById('timer1');
const timer2 = document.getElementById('timer2');

let timersFlipped = false; //(playerColor == "black");

function updateTimer() {
    // don't start timer until game has started 
    if (gameStarted == false) {
        return;
    }

    // check if a timer has ran out, and end the game if so
    if (playerTime == 0) {
        if (playerColor == "white") {
            endGame("Black Wins! White ran out of time.", "Timeout", "black");
        } else {
            endGame("White Wins! Black ran out of time.", "Timeout", "white");
        }
    }

    if (opponentTime == 0) {
        if (playerColor == "white") {
            endGame("White Wins! Black ran out of time.", "Timeout", "white");
        } else {
            endGame("Black Wins! White ran out of time.", "Timeout", "black");
        }
    }

    // only update each timer during that player's turn
    if (playerColor == currentTurnColor) {
        let minutes = Math.floor(playerTime / 60);
        let seconds = playerTime % 60;
    
        // formatting the seconds properly so that values < 10 still show 2 digits
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
    
        // display current time
        if (timersFlipped) {
            timer1.innerHTML = `${minutes}:${seconds}`;
        } else {
            timer2.innerHTML = `${minutes}:${seconds}`;
        }

    
        playerTime--;
    } else {
        let minutes = Math.floor(opponentTime / 60);
        let seconds = opponentTime % 60;
    
        // formatting the seconds properly so that values < 10 still show 2 digits
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
    
        // display current time
        if (timersFlipped) { 
            timer2.innerHTML = `${minutes}:${seconds}`;  
        } else {
            timer1.innerHTML = `${minutes}:${seconds}`; 
        }

    
        opponentTime--;
    }

}

setInterval(updateTimer, 1000);

function flipTimers() {
    timersFlipped = !timersFlipped;

    console.trace();

    let timer1Time = timer1.innerHTML;
    timer1.innerHTML = timer2.innerHTML;
    timer2.innerHTML = timer1Time;
}
