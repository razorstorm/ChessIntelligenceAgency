javascript: (() => {
const container = document.querySelector('cg-container');
const board = document.querySelector('cg-container cg-board');
const widthStyle = container.style.width;
const heightStyle = container.style.height;
const width = parseInt(widthStyle);
const height = parseInt(heightStyle);

const widthPerSquare = width / 8;
const heightPerSquare = height / 8;

const fileNames = ["a", "b", "c", "d", "e", "f", "g", "h"];
const rankNames = ["1", "2", "3", "4", "5", "6", "7", "8"];

const SQUARE_ALPHA = 0.30;

const w_rooks = Array.from(document.querySelectorAll('piece.white.rook'));
const w_knights = Array.from(document.querySelectorAll('piece.white.knight'));
const w_bishops = Array.from(document.querySelectorAll('piece.white.bishop'));
const w_queens = Array.from(document.querySelectorAll('piece.white.queen'));
const w_kings = Array.from(document.querySelectorAll('piece.white.king'));
const w_pawns = Array.from(document.querySelectorAll('piece.white.pawn'));

const b_rooks = Array.from(document.querySelectorAll('piece.black.rook'));
const b_knights = Array.from(document.querySelectorAll('piece.black.knight'));
const b_bishops = Array.from(document.querySelectorAll('piece.black.bishop'));
const b_queens = Array.from(document.querySelectorAll('piece.black.queen'));
const b_kings = Array.from(document.querySelectorAll('piece.black.king'));
const b_pawns = Array.from(document.querySelectorAll('piece.black.pawn'));

const boardPieces = [];

function registerSquare(results, newCoords, pieceType) {
    newCoords.forEach(newCoord => {
        if(newCoord[0] < 0 || newCoord[0] >= 8 || newCoord[1] < 0 || newCoord[1] >= 8) {
            return;
        }
        const coords = fileNames[newCoord[0]] + rankNames[newCoord[1]];
        if(results[coords] !== undefined) {
            results[coords].push(pieceType);
        } else {
            results[coords] = [pieceType];
        }
    });
}

class Piece {
    constructor(domElement, pieceType, faction) {
        this.domElement = domElement;
        this.transformStr = domElement.style.transform;
        this.transform = this.transformStr.replace(/[a-zA-Z\(\)]*/g, "").split(",");
        this.xOffset = this.transform[0];
        this.yOffset = height - 1;
        if (this.transform.length > 1)
            this.yOffset = height - this.transform[1];

        this.fileIndex = Math.min(parseInt(this.xOffset / widthPerSquare), 7);
        this.rankIndex = Math.min(parseInt(this.yOffset / heightPerSquare), 7);

        this.file = fileNames[this.fileIndex];

        this.rank = rankNames[this.rankIndex];

        this.pieceType = pieceType;
        this.faction = faction;

        this.notation = this.file +"" + this.rank;

        boardPieces[this.notation] = this;
    }

    threatenedSquares(results) {
        switch(this.pieceType) {
            case 'KING':
                registerSquare(results, new Set([
                    [this.fileIndex - 1, this.rankIndex - 1], 
                    [this.fileIndex - 1, this.rankIndex],
                    [this.fileIndex - 1, this.rankIndex + 1],

                    [this.fileIndex, this.rankIndex - 1], 
                    [this.fileIndex, this.rankIndex + 1],

                    [this.fileIndex + 1, this.rankIndex - 1], 
                    [this.fileIndex + 1, this.rankIndex],
                    [this.fileIndex + 1, this.rankIndex + 1],

                ]), this.pieceType);
                return results;
            case 'PAWN':
                if (this.faction === "WHITE") {
                    registerSquare(results, new Set([[this.fileIndex - 1, this.rankIndex + 1], [this.fileIndex + 1, this.rankIndex + 1]]), this.pieceType);
                    return results;
                } else {
                   registerSquare(results, new Set([[this.fileIndex - 1, this.rankIndex - 1], [this.fileIndex + 1, this.rankIndex - 1]]), this.pieceType);
                    return results; 
                }
            case 'KNIGHT':
                registerSquare(results, new Set([
                    [this.fileIndex - 2, this.rankIndex - 1], 
                    [this.fileIndex - 2, this.rankIndex + 1],

                    [this.fileIndex - 1, this.rankIndex - 2],
                    [this.fileIndex - 1, this.rankIndex + 2],

                    [this.fileIndex + 1, this.rankIndex - 2],
                    [this.fileIndex + 1, this.rankIndex + 2],

                    [this.fileIndex + 2, this.rankIndex - 1],
                    [this.fileIndex + 2, this.rankIndex + 1],
                ]), this.pieceType);
                return results;
            case 'BISHOP':
                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex >= 0 && fileIndex >= 0; rankIndex--, fileIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex <= 8 && fileIndex <= 8; rankIndex++, fileIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex <= 8 && fileIndex >= 0; rankIndex++, fileIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex >= 0 && fileIndex <= 8; rankIndex--, fileIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                return results;
            case 'ROOK':
                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex >= 0; rankIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex <= 8; rankIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; fileIndex >= 0; fileIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; fileIndex <= 8; fileIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                return results;
            case 'QUEEN':
                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex >= 0 && fileIndex >= 0; rankIndex--, fileIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex <= 8 && fileIndex <= 8; rankIndex++, fileIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex <= 8 && fileIndex >= 0; rankIndex++, fileIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex >= 0 && fileIndex <= 8; rankIndex--, fileIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }
                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex >= 0; rankIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex <= 8; rankIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; fileIndex >= 0; fileIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; fileIndex <= 8; fileIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    registerSquare(results, new Set([
                        index
                    ]), this.pieceType);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                return results;
            default:
                console.log(this.pieceType, "is not supported");
        }

        return results;
    }
}

function toNotation(coords) {
    return fileNames[coords[0]]+""+rankNames[coords[1]];
}

// function toCoords(notation) {}

// function toOffset(coords) {

// }

function drawSquare(square, pieces, faction) {
    const node = document.createElement("square");
    node.className = `renderedSquare attacked_${faction}`;

    const file = square[0];
    const rankIndex = parseInt(square[1]);
    const fileIndex = file.charCodeAt(0) - 'a'.charCodeAt(0);

    const fileOffset = fileIndex * widthPerSquare;
    const rankOffset = height - rankIndex * heightPerSquare;

    node.style.transform = `translate(${fileOffset}px, ${rankOffset}px)`;
    if (faction === "WHITE") {
        const bgColor = `rgba(0,0,255,${SQUARE_ALPHA})`;
        const stripeColor = `rgba(0,0,255,${SQUARE_ALPHA})`;
        // node.style.backgroundColor = `rgba(0,0,255,${SQUARE_ALPHA})`;
        node.style.background = `repeating-linear-gradient(45deg, ${stripeColor}, ${stripeColor} 10px, ${bgColor} 10px, ${bgColor} 25px)`;
    } else {
        const bgColor = `rgba(255,0,0,${SQUARE_ALPHA})`;
        const stripeColor = `rgba(255,0,0,${SQUARE_ALPHA})`;
        // node.style.backgroundColor = `rgba(255,0,0,${SQUARE_ALPHA})`;
        node.style.background = `repeating-linear-gradient(-45deg, ${stripeColor}, ${stripeColor} 10px, ${bgColor} 10px, ${bgColor} 25px)`;
    }
    const nodeText = document.createElement("p");
    nodeText.innerText = pieces.map(piece => pieceTypeToUnicode(piece, faction));
    nodeText.style.lineHeight = "normal";
    nodeText.style.fontSize = "15pt";
    if (faction === "WHITE") {
        nodeText.style.position = "absolute";
        nodeText.style.bottom = 0;
        nodeText.style.display = "block";
        nodeText.style.marginBottom = 0;
        nodeText.style.textAlign = "right";
        nodeText.style.width = "100%";
    }
    node.appendChild(nodeText);
    board.appendChild(node);
}

function pieceTypeToUnicode(piece, faction) {
    if(faction === "WHITE") {
        switch(piece) {
            case "PAWN":
                return "♙";
            case "ROOK":
                return "♖";
            case "BISHOP":
                return "♗";
            case "KNIGHT":    
                return "♘";  
            case "QUEEN":
                return "♕";
            case "KING":
                return "♔";
        }
    } else {
       switch(piece) {
            case "PAWN":
                return "♟";
            case "ROOK":
                return "♜";
            case "BISHOP":
                return "♝";
            case "KNIGHT":    
                return "♞";  
            case "QUEEN":
                return "♛";
            case "KING":
                return "♚";
        } 
    }
}

function deleteSquares() {
    const squares = document.querySelectorAll('square.renderedSquare');
    squares.forEach(square => {
        square.parentNode.removeChild(square);
    });
}

function render(renderWhite=true, renderBlack=true) {
    const squares = document.querySelectorAll('square.renderedSquare');
    if(squares.length > 0) {
        return;
    }
    deleteSquares();

    const wPawnPieces = w_pawns.map(domElement => new Piece(domElement, "PAWN", "WHITE"));
    const wRookPieces = w_rooks.map(domElement => new Piece(domElement, "ROOK", "WHITE"));
    const wKnightPieces = w_knights.map(domElement => new Piece(domElement, "KNIGHT", "WHITE"));
    const wBishopPieces = w_bishops.map(domElement => new Piece(domElement, "BISHOP", "WHITE"));
    const wQueenPieces = w_queens.map(domElement => new Piece(domElement, "QUEEN", "WHITE"));
    const wKingPieces = w_kings.map(domElement => new Piece(domElement, "KING", "WHITE"));

    console.log("Board pieces", boardPieces);

    let attackedSquares = new Set();
    wPawnPieces.forEach(piece => {
     piece.threatenedSquares(attackedSquares);
    });

    wKnightPieces.forEach(piece => {
     piece.threatenedSquares(attackedSquares);
    });

    wBishopPieces.forEach(piece => {
        piece.threatenedSquares(attackedSquares);
    });

    wRookPieces.forEach(piece => {
        piece.threatenedSquares(attackedSquares);
    });

    wKingPieces.forEach(piece => {
        piece.threatenedSquares(attackedSquares);
    });

    wQueenPieces.forEach(piece => {
        piece.threatenedSquares(attackedSquares);
    });

    attackedSquares.forEach(square => {
        drawSquare(square, "WHITE");
    });

    if(renderWhite) {
        Object.keys(attackedSquares).forEach(coords => {
            drawSquare(coords, attackedSquares[coords], "WHITE");
        });
    }

    attackedSquares = {};
    const bPawnPieces = b_pawns.map(domElement => new Piece(domElement, "PAWN", "BLACK"));
    const bRookPieces = b_rooks.map(domElement => new Piece(domElement, "ROOK", "BLACK"));
    const bKnightPieces = b_knights.map(domElement => new Piece(domElement, "KNIGHT", "BLACK"));
    const bBishopPieces = b_bishops.map(domElement => new Piece(domElement, "BISHOP", "BLACK"));
    const bQueenPieces = b_queens.map(domElement => new Piece(domElement, "QUEEN", "BLACK"));
    const bKingPieces = b_kings.map(domElement => new Piece(domElement, "KING", "BLACK"));

    console.log("Board pieces", boardPieces);

    bPawnPieces.forEach(piece => {
        piece.threatenedSquares(attackedSquares);
    });

    bKnightPieces.forEach(piece => {
        piece.threatenedSquares(attackedSquares);
    });

    bBishopPieces.forEach(piece => {
        piece.threatenedSquares(attackedSquares);
    });

    bRookPieces.forEach(piece => {
        piece.threatenedSquares(attackedSquares);
    });

    bKingPieces.forEach(piece => {
        piece.threatenedSquares(attackedSquares);
    });

    bQueenPieces.forEach(piece => {
        piece.threatenedSquares(attackedSquares);
    });

    if(renderBlack) {
        Object.keys(attackedSquares).forEach(coords => {
            drawSquare(coords, attackedSquares[coords], "BLACK");
        });
    }
}
render(renderWhite=true, renderBlack=true);

const observer = new MutationObserver((mutations) => {
    console.log("observed");
    mutations.forEach(mutation => console.log(mutation.type))
    console.log("mouse moved");
    render(renderWhite=true, renderBlack=true);
});

observer.observe(board, { childList: true });
// board.onmouseover = function() {
//     console.log("mouse moved");
//     render(renderWhite=true, renderBlack=true);
// };

})();