const autoQueenInput = document.getElementById("autoQueen");
const lowTimeWarningInput = document.getElementById("lowTimeWarning");
const boardColor1Input = document.getElementById("boardColor1");
const boardColor2Input = document.getElementById("boardColor2");
const chatBackgroundColorInput = document.getElementById("chatBackgroundColor");
const chatTextColorInput = document.getElementById("chatTextColor");

window.onload = () => {
    let autoQueenChecked = (autoQueen == "true");
    let lowTimeWarningChecked = (lowTimeWarning == "true");

    autoQueenInput.checked = autoQueenChecked;
    lowTimeWarningInput.checked = lowTimeWarningChecked;
    boardColor1Input.value = boardColor1;
    boardColor2Input.value = boardColor2;
    chatBackgroundColorInput.value = chatBackgroundColor;
    chatTextColorInput.value = chatTextColor;

    updateBoardColors();
    updateChatColors();
}

function updateBoardColors() {
    document.documentElement.style.setProperty('--boardColor1', boardColor1);
    document.documentElement.style.setProperty('--boardColor2', boardColor2);
}

boardColor1Input.addEventListener('input', (e) => {
    boardColor1 = e.target.value;
    updateBoardColors();
});

boardColor2Input.addEventListener('input', (e) => {
    boardColor2 = e.target.value;
    updateBoardColors();
});

function updateChatColors() {
    document.documentElement.style.setProperty('--chatBackgroundColor', chatBackgroundColor);
    document.documentElement.style.setProperty('--chatTextColor', chatTextColor);
}

chatBackgroundColorInput.addEventListener('input', (e) => {
    chatBackgroundColor = e.target.value;
    updateChatColors();
})

chatTextColorInput.addEventListener('input', (e) => {
    chatTextColor = e.target.value;
    updateChatColors();
})

function validateDeleteAccount() {
    const validateDeleteInput = document.getElementById("validateDelete");
    let validateValue = validateDeleteInput.value;

    if (validateValue === "Delete") {
        return true;
    } else {
        return false;
    }
}