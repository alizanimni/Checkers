const board = document.getElementById('board');
let isWhite = true;
let isWhiteTurn = true;
let moveFrom = null;
let moveTo = null;
let eatOnce = false
let lastPieceMovedId = null;
let lastPieceMoved = null;
let piecesThatCanEat = []
let eatOnLastTurn = false;
let boardArray;

function initEventListeners() {
    const yesButton = document.getElementById("yes_button")
    const noButton = document.getElementById("no_button")
    const drawButton = document.getElementById("draw_button")
    const resignButton = document.getElementById("resign_button")
    const modalMassage = document.getElementById("modal_massage")
    const okButton = document.getElementById("ok_button")
    const drawModal = document.getElementById("draw_modal")

    okButton.addEventListener('click', () => {
        drawModal.classList.add("none")
        okButton.classList.add("none")
        restartGame()
    })

    resignButton.addEventListener('click', () => {
        drawModal.classList.remove("none")
        modalMassage.innerText = isWhiteTurn ? "the white player is resigned the black player is the winner!!" : "the black player is resigned the white player is the winner!!"
        okButton.classList.remove("none")
        restartGame()
    })

    noButton.addEventListener('click', () => {
        drawModal.classList.add("none")
        noButton.classList.add("none")
        yesButton.classList.add("none")
    })

    drawButton.addEventListener('click', () => {
        drawModal.classList.remove("none")
        modalMassage.innerText = isWhiteTurn ? "black player \nwould you like to draw?" : "white player \nwould you like to draw?"
        noButton.classList.remove("none")
        yesButton.classList.remove("none")
    })

    yesButton.addEventListener('click', () => {
        modalMassage.innerText = "Draw"
        noButton.classList.add("none")
        yesButton.classList.add("none")
        okButton.classList.remove("none")
    })
}



startGame()
initEventListeners()


function startGame() {
    isWhiteTurn = true
    document.getElementById('turn_title').innerText = "תור הלבן"
    createBoard();
    createPiecesArrays()
}

function createPiecesArrays() {
    boardArray = [
        [0, -1, 0, -1, 0, -1, 0, -1],
        [-1, 0, -1, 0, -1, 0, -1, 0],
        [0, -1, 0, -1, 0, -1, 0, -1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0]
    ]

    for (let i = 0; i < 8; i++) {
        for (let idx = 0; idx < 8; idx++) {
            if (boardArray[i][idx] === 0) {
                let piece = { "piece": 0, "row": i, "col": idx, "king": false }
                boardArray[i][idx] = piece
            } else {
                let piece = { "piece": boardArray[i][idx] === -1 ? -1 : 1, "row": i, "col": idx, "king": false }
                boardArray[i][idx] = piece
            }

        }
    }
}

function createBoard() {
    let counter = 0
    for (var i = 0; i < 8; i++) {
        for (var idx = 0; idx < 8; idx++) {
            createBoxAndPiece(counter, i);
            counter++
            if (isWhite) {
                isWhite = false;
            } else
                isWhite = true;
        }
        if (isWhite) {
            isWhite = false;
        } else
            isWhite = true;
    }
}

function createBoxAndPiece(counter, i) {
    const box = document.createElement('div');
    box.classList.add("box");
    box.id = counter;
    if (isWhite) {
        box.classList.add("white");
        board.appendChild(box);
    } else {
        box.classList.add("blue");
        box.addEventListener('click', () => {
            enterMoves(box)
        })
        board.appendChild(box);
        insertPieceToBox(box, i)
    }
}

function insertPieceToBox(box, i) {
    const piece = document.createElement('div')
    if (i < 3)
        piece.className = "black-circle"
    else if (i > 4)
        piece.className = "white-circle"
    box.appendChild(piece);
    const king = document.createElement('div')
    king.innerText = "king"
    king.className = "none"
    piece.appendChild(king)
}

function enterMoves(box) {
    if (!moveFrom) {
        box.classList.add("marked_box")
        moveFrom = box.id;
    } else if (!moveTo) { // !moveTo
        box.classList.add("marked_box")
        moveTo = box.id;
        playTurn(getLocationInBoard(moveFrom), getLocationInBoard(moveTo))
    }
}

function restartGame() {
    for (var i = 0; i < 64; i++) {
        let box = document.getElementById(i)
        box.remove()
    }
    startGame()

}

function getLocationInBoard(id) {
    let count = 0
    for (let i = 0; i < 8; i++) {
        for (let idx = 0; idx < 8; idx++) {
            if (count === parseInt(id)) {
                return boardArray[i][idx]
            }
            count++
        }
    }
}

function playTurn(locationFrom, locationTo) {
    piecesThatCanEat = []
    piecesThatCanEat = savePiecesThatCanEat(locationFrom)

    if (isValidMove(locationFrom, locationTo)) {
        if (locationFrom.king === true) {
            if (isKingCanEat(locationFrom, locationTo)) {
                eat(locationFrom, locationTo)
                eatOnce = true
                piecesThatCanEat = []
            }
        } else if (isValidEating(locationFrom, locationTo)) {
            eat(locationFrom, locationTo)
            eatOnce = true
            if (piecesThatCanEat.length > 0) {
                for (let i = 0; i < piecesThatCanEat.length; i++) {
                    if (locationFrom === piecesThatCanEat[i]) {
                        piecesThatCanEat = []
                        break
                    }

                }
            }
        }
        if (piecesThatCanEat.length > 0 && !eatOnLastTurn) {
            burnPieces(piecesThatCanEat)
            eatOnce = false
        }
        // if (!(piecesThatCanEat.length > 0 && isMovedPieceThatCanEat(locationFrom)))
        move(locationFrom, locationTo)
        piecesThatCanEat = []
        eatOnLastTurn = false
        if (isEndTurn())
            changeTurn()
        isDrawOrWin()
    }
    clearMove()
}

function isDrawOrWin() {
    const modalMassage = document.getElementById("modal_massage")
    const drawModal = document.getElementById("draw_modal")
    const okButton = document.getElementById("ok_button")
    if (isOutOfPieces()) {
        drawModal.classList.remove("none")
        modalMassage.innerText = isWhiteTurn ? "the black player win!!" : "the white player win!!"
        okButton.classList.remove("none")
    } else if (isPiecesCantMove()) {
        drawModal.classList.remove("none")
        if (isWhiteTurn)
            modalMassage.innerText = "the white player cant move!\n the black player is the winner!!"
        else
            modalMassage.innerText = "the black player cant move\n the white player is the winner!!"
        okButton.classList.remove("none")
    }
}

function isMovedPieceThatCanEat(locationFrom) {
    for (let i = 0; i < piecesThatCanEat.length; i++) {
        if (piecesThatCanEat[i] === locationFrom)
            return true
    }
    return false
}

function isValidMove(locationFrom, locationTo) {
    if (!(boardArray[locationTo.row][locationTo.col].piece === 0))
        return false
    eatOnLastTurn = false
    if (!((isWhiteTurn && locationFrom.piece === 1) || (!isWhiteTurn && locationFrom.piece === -1)))
        return false


    if (isOneStepValid(locationFrom, locationTo)) {
        return true
    } else if (isValidEating(locationFrom, locationTo)) {
        eatOnLastTurn = true
        return true
    }
    if (locationFrom.king === true) {
        if (isValidMoveForKing(locationFrom, locationTo)) {
            if (isKingCanEat(locationFrom, locationTo)) {
                eatOnLastTurn = true
                return true
            } else {
                return true
            }
        } else
            return false
    }
    return false
}

function burnPieces(piece) {
    for (let i = 0; i < piecesThatCanEat.length; i++) {
        piecesThatCanEat[i].piece = 0
        piecesThatCanEat[i].king = false
        let location = ((piecesThatCanEat[i].row * 8) + piecesThatCanEat[i].col)
        let pieceToErase = document.getElementById(location)
        pieceToErase.firstChild.className = ""
        let p = pieceToErase.firstChild
        p.firstChild.className = "none"
    }
}

function isValidMoveForKing(locationFrom, locationTo) {
    if (!(boardArray[locationTo.row][locationTo.col].piece === 0))
        return false
    if ((locationFrom.row === locationTo.row) || (locationFrom.col === locationTo.col))
        return false;

    let isRowAndColBig = ((locationFrom.row > locationTo.row && locationFrom.col > locationTo.col) || (locationFrom.row < locationTo.row && locationFrom.col < locationTo.col))
    let toCol
    let fromCol
    if (isRowAndColBig) {
        toCol = (locationFrom.col > locationTo.col ? (locationTo.col) : (locationFrom.col))
        fromCol = (locationFrom.col > locationTo.col ? locationFrom.col : locationTo.col)
    } else {
        toCol = (locationFrom.col > locationTo.col ? (locationFrom.col) : (locationTo.col))
        fromCol = (locationFrom.col > locationTo.col ? locationTo.col : locationFrom.col)
    }

    let fromRow = (locationFrom.row > locationTo.row ? locationFrom.row : locationTo.row)
    let toRow = (locationFrom.row > locationTo.row ? (locationTo.row) : (locationFrom.row))
    let valid = false
    let i = fromRow - 1
    let idx = (isRowAndColBig ? (fromCol - 1) : (fromCol + 1))

    let countPieces = 0;
    for (;
        (i >= 0 && (idx < 8 && idx >= 0)); i--) {

        if (i === toRow && idx === toCol) {

            if (toRow + 2 === fromRow || toRow - 2 === fromRow) {
                if (countPieces === 0)
                    return true
                else
                    return false
            }
            valid = true
            break
        }


        if (boardArray[i][idx].piece !== 0)
            countPieces++

            if (isRowAndColBig)
                idx--
                else
                    idx++
    }
    if (!valid)
        return false

    if (countPieces == 0)
        return true
    if (countPieces > 1)
        return false

    if (isRowAndColBig) {
        return isValidEatForKing(1, -1)
    } else {
        return isValidEatForKing(-1, 1)
    }

    function isValidEatForKing(num1, num2) {
        let toBiggest = (locationTo.row > locationFrom.row)
        if (boardArray[(locationFrom.row + (toBiggest ? 1 : -1))][(locationFrom.col + (toBiggest ? num1 : num2))].piece !== 0)
            return false
        if ((boardArray[(locationTo.row + (toBiggest ? -1 : 1))][(locationTo.col + (toBiggest ? num2 : num1))].piece === 0) ||
            (boardArray[(locationTo.row + (toBiggest ? -1 : 1))][(locationTo.col + (toBiggest ? num2 : num1))].piece === (isWhiteTurn ? -1 : 1)))
            return true
        return false
    }

}

function isKingCanEat(locationFrom, locationTo) {
    let isRowAndColBig = ((locationFrom.row > locationTo.row && locationFrom.col > locationTo.col) || (locationFrom.row < locationTo.row && locationFrom.col < locationTo.col))

    if (isRowAndColBig) {
        let toBiggest = (locationTo.row > locationFrom.row)
        if (boardArray[(locationTo.row + (toBiggest ? -1 : 1))][(locationTo.col + (toBiggest ? -1 : 1))].piece === (isWhiteTurn ? -1 : 1)) {
            return true;
        }

    } else {
        let toBiggest = (locationTo.row > locationFrom.row)
        if (boardArray[(locationTo.row + (toBiggest ? -1 : 1))][(locationTo.col + (toBiggest ? 1 : -1))].piece === (isWhiteTurn ? -1 : 1)) {
            return true;
        }

    }
}

function clearMove() {
    document.getElementById(moveFrom).classList.remove("marked_box")
    document.getElementById(moveTo).classList.remove("marked_box")
    moveFrom = null
    moveTo = null
}

function move(locationFrom, locationTo) {
    if (boardArray[locationFrom.row][locationFrom.col].piece === 0)
        return
    document.getElementById(moveFrom).firstChild.className = ""
    if (isWhiteTurn)
        document.getElementById(moveTo).firstChild.className = "white-circle"
    else
        document.getElementById(moveTo).firstChild.className = "black-circle"
    boardArray[locationFrom.row][locationFrom.col].piece = 0
    boardArray[locationTo.row][locationTo.col].piece = isWhiteTurn ? 1 : -1;
    lastPieceMovedId = moveTo
    lastPieceMoved = getLocationInBoard(moveTo);
    if (locationFrom.king === true)
        moveKing(locationFrom, locationTo)
    if (locationTo.row == 0 || locationTo.row == 7)
        ifPromotionMakeKing(locationTo)
}

function changeTurn() {
    isWhiteTurn = !isWhiteTurn;
    document.getElementById('turn_title').innerHTML = isWhiteTurn ? "תור הלבן" : "תור השחור"
}

function isEndTurn() {
    if (!eatOnce) {
        return true
    } else {
        if (!isMultipleCaptures()) {
            eatOnce = false
            lastPieceMoved = null
            return true
        }
    }
    return false
}

function isOneStepValid(locationFrom, locationTo) {
    if (!(boardArray[locationTo.row][locationTo.col].piece === 0))
        return false

    if (locationFrom.row === (locationTo.row + (isWhiteTurn ? 1 : -1)) && (locationFrom.col === locationTo.col + 1 || locationFrom.col === locationTo.col - 1))
        return true

    if (locationFrom.king === true &&
        ((locationFrom.row === (locationTo.row + 1)) || (locationFrom.row === (locationTo.row - 1))) &&
        ((locationFrom.col === (locationTo.col + 1)) || (locationFrom.col === (locationTo.col - 1))))
        return true
    return false;
}

function isValidEating(locationFrom, locationTo) {

    if (!(boardArray[locationTo.row][locationTo.col].piece === 0))
        return false
    if (eatOnce || (locationFrom.king === true)) {
        if (checkEat((locationTo.row + 2), (locationTo.col + 2), (locationTo.row + 1), (locationTo.col + 1)))
            return true
        if (checkEat((locationTo.row - 2), (locationTo.col - 2), (locationTo.row - 1), (locationTo.col - 1)))
            return true;
        if (checkEat((locationTo.row + 2), (locationTo.col - 2), (locationTo.row + 1), (locationTo.col - 1)))
            return true;
        if (checkEat((locationTo.row - 2), (locationTo.col + 2), (locationTo.row - 1), (locationTo.col + 1)))
            return true;
    }

    function checkEat(toRow, toCol, toBoardRow, toBoardCol) {
        if ((toRow >= 0 && toRow < 8) && (toCol >= 0 && toCol < 8)) {
            if ((locationFrom.row === (toRow)) && (locationFrom.col === (toCol))) {
                if (boardArray[toBoardRow][toBoardCol].piece === (isWhiteTurn ? -1 : 1))
                    return true
            }
        }
    }

    if ((locationFrom.col === (locationTo.col + 2)) && (locationFrom.row === (locationTo.row + (isWhiteTurn ? 2 : -2)))) {
        if (boardArray[locationTo.row + (isWhiteTurn ? 1 : -1)][locationTo.col + 1].piece === (isWhiteTurn ? -1 : 1))
            return true
    }
    if ((locationFrom.col === (locationTo.col - 2)) && (locationFrom.row === (locationTo.row + (isWhiteTurn ? 2 : -2)))) {
        if (boardArray[locationTo.row + (isWhiteTurn ? 1 : -1)][locationTo.col - 1].piece === (isWhiteTurn ? -1 : 1))
            return true
    }

    return false;
}

function eat(locationFrom, locationTo) {

    if (locationFrom.row < locationTo.row) {
        if (locationFrom.col < locationTo.col) {
            eatPiece(-1, -1, -9)
        } else {
            eatPiece(-1, 1, -7)
        }
    } else {
        if (locationFrom.col > locationTo.col) {
            eatPiece(1, 1, 9)
        } else {
            eatPiece(1, -1, 7)
        }
    }

    function eatPiece(plusRow, plusCol, plusId) {
        boardArray[locationTo.row + plusRow][locationTo.col + plusCol].piece = 0
        boardArray[locationTo.row + +plusRow][locationTo.col + plusCol].king === false
        let piece = document.getElementById(parseInt(moveTo) + plusId).firstChild
        piece.className = ""
        piece.firstChild.className = "none"
        eatOnce = true
    }
}

function savePiecesThatCanEat(locationFrom) {

    for (let i = 0; i < 8; i++) {
        for (let idx = 0; idx < 8; idx++) {
            if (boardArray[i][idx].piece === (isWhiteTurn ? 1 : -1)) {
                for (let j = 0; j < 8; j++) {
                    for (let k = 0; k < 8; k++) {
                        if (isValidEating(boardArray[i][idx], boardArray[j][k]))
                            piecesThatCanEat.push(boardArray[i][idx])
                        if (boardArray[i][idx].king === true) {
                            if (isValidMoveForKing(boardArray[i][idx], boardArray[j][k]))
                                if (isKingCanEat(boardArray[i][idx], boardArray[j][k]))
                                    piecesThatCanEat.push(boardArray[i][idx])
                        }
                    }
                }
            }
        }
    }

    return piecesThatCanEat;
}

function ifPromotionMakeKing(locationTo) {
    if ((isWhiteTurn && locationTo.row === 0) || (!isWhiteTurn && locationTo.row === 7)) {
        lastPieceMoved.king = true;
        let div = document.getElementById(lastPieceMovedId).firstChild;
        div.firstChild.className = "king"
    }
}

function moveKing(locationFrom, locationTo) {
    locationFrom.king = false;
    locationTo.king = true;
    let div = document.getElementById(moveFrom).firstChild;
    div.firstChild.className = "none"
    div = document.getElementById(moveTo).firstChild;
    div.firstChild.className = "king"

}

function isOutOfPieces() {
    let countPieces = 0;
    for (let i = 0; i < 8; i++) {
        for (let idx = 0; idx < 8; idx++) {
            if (boardArray[i][idx].piece === (isWhiteTurn ? 1 : -1))
                countPieces++
                if (countPieces > 0)
                    return false
        }
    }
    return true
}

function isPiecesCantMove() {
    for (let i = 0; i < 8; i++) {
        for (let idx = 0; idx < 8; idx++) {
            if (boardArray[i][idx].piece === (isWhiteTurn ? 1 : -1))
                for (let j = 0; j < 8; j++) {
                    for (let k = 0; k < 8; k++) {
                        if (isValidMove(boardArray[i][idx], boardArray[j][k]))
                            return false
                    }
                }
        }
    }
    return true;
}

function isMultipleCaptures() {
    if (eatOnce) {
        for (let i = 0; i < 8; i++) {
            for (let idx = 0; idx < 8; idx++) {
                if (isValidEating(lastPieceMoved, boardArray[i][idx]))
                    return true
                if (lastPieceMoved.king === true) {
                    if (isValidMoveForKing(lastPieceMoved, boardArray[i][idx]))
                        if (isKingCanEat(lastPieceMoved, boardArray[i][idx]))
                            return true
                }
            }
        }
    }
    return false;
}