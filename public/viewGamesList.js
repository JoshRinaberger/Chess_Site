console.log(username);
console.log(pageNumber);
console.log(gameList);
console.log(numberOfPages);

const newPageNumberForm = document.getElementById("pageNumberForm");
const pageNumberInput = document.getElementById("pageNumberInput");
pageNumberInput.value = pageNumber;

// get new page number after pressing enter in the input box
pageNumberInput.addEventListener("keyup", (e) => {
    // check if key is enter
    if (e.keyCode == 13) {
        if (pageNumberInput.value >= 1 && pageNumberInput.value <= numberOfPages) {
            newPageNumberForm.submit();
        }
    }
});

pageNumberInput.addEventListener('change', (e) => {
    let newPageNumber = e.target.value;

    // don't let page number be below one
    if (newPageNumber < 1) {
        pageNumberInput.value = 1;
    }

    // don't let page number be above the total number of pages
    if (newPageNumber > numberOfPages) {
        pageNumberInput.value = numberOfPages;
    }
});

const arrowBack = document.getElementById("arrowBack");
const arrowForward = document.getElementById("arrowForward");

// move backwards one page
arrowBack.onclick = () => {
    if (pageNumber > 1) {
        pageNumberInput.value = pageNumber - 1;
        newPageNumberForm.submit();
    }
}

// move forwards one page
arrowForward.onclick = () => {
    if (pageNumber < numberOfPages) {
        pageNumberInput.value = parseInt(pageNumber) + 1;
        newPageNumberForm.submit();
    }
}

gameListTable = document.getElementById("gameListTable");

function showGameList() {
    for (let i = 0; i < gameList.length; i++) {
        let opponentName;
        let playerColor;

        if (gameList[i].username1 != username) {
            opponentName = gameList[i].username1;
            playerColor = gameList[i].player2Color;
        } else {
            opponentName = gameList[i].userName2;
            playerColor = gameList[i].player1Color;
        }

        if (opponentName == "undefined") {
            opponentName = "Guest";
        }

        let moves = gameList[i].startIndexes.length;

        let result = "Draw";

        if (gameList[i].winningColor == "white" || gameList[i].winningColor == "black") {
            if (playerColor == gameList[i].winningColor) {
                result = "Win";
            } else {
                result = "Loss";
            }
        }

        let date = gameList[i].date;
        date = date.substring(0, date.indexOf('T'));


        let row = gameListTable.insertRow(i + 1);
        let cellDate = row.insertCell(0);
        let cellOpponent = row.insertCell(1);
        let cellMoves = row.insertCell(2);
        let cellResult = row.insertCell(3);
        let cellSubmit = row.insertCell(4);

        cellDate.innerHTML = date;
        cellOpponent.innerHTML = opponentName;
        cellMoves.innerHTML = moves;
        cellResult.innerHTML = result;

        let submitForm = document.createElement("form");
        submitForm.setAttribute("method", "post");
        submitForm.setAttribute("action", "/viewgames/selectGame");

        let submitGameId = document.createElement("input");
        submitGameId.setAttribute("type", "hidden");
        submitGameId.setAttribute("name", "gameId");
        submitGameId.value = gameList[i].gameId;

        let submitButton = document.createElement("input");
        submitButton.setAttribute("type", "submit");
        submitButton.value = "View Game";

        submitForm.appendChild(submitGameId);
        submitForm.appendChild(submitButton);
        cellSubmit.appendChild(submitForm);
    }
}

showGameList();