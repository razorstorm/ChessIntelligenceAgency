javascript: (() => {
const container = document.querySelector('cg-container');
const board = document.querySelector('cg-container cg-board');
const widthStyle = container.style.width;
const heightStyle = container.style.height;
const width = parseFloat(widthStyle);
const height = parseFloat(heightStyle);

const widthPerSquare = width / 8;
const heightPerSquare = height / 8;

console.debug("widthPerSquare", widthPerSquare, "widthPerSquare", widthPerSquare);

const fileNames = ["a", "b", "c", "d", "e", "f", "g", "h"];
const rankNames = ["1", "2", "3", "4", "5", "6", "7", "8"];

const SQUARE_ALPHA = 0.30;

const boardPieces = [];

let toRenderTimeoutHandle = null;

function registerSquare(results, newCoords, pieceType) {
    const filteredCoords = newCoords.filter(coords => coords[0] >= 0 && coords[0] < 8 && coords[1] >= 0 && coords[1] < 8 && coords[0] !== NaN && coords[1] !== NaN);
    const dedupedNotations = new Set(filteredCoords.map(coords => toNotation(coords)));
    dedupedNotations.forEach(notation => {
        if(results[notation] !== undefined) {
            results[notation].push(pieceType);
        } else {
            results[notation] = [pieceType];
        }
    });
}

class Piece {
    constructor(domElement, pieceType, faction) {
        this.domElement = domElement;
        this.transformStr = domElement.style.transform;
        this.transform = this.transformStr.replace(/[a-zA-Z\(\)]*/g, "").split(",");
        this.xOffset = this.transform[0];
        this.yOffset = height;
        if (this.transform.length > 1)
            this.yOffset = height - this.transform[1];

        this.fileIndex = Math.min(Math.round(this.xOffset / widthPerSquare), 7);
        this.rankIndex = Math.min(Math.round(this.yOffset / heightPerSquare) - 1, 7);

        this.file = fileNames[this.fileIndex];

        this.rank = rankNames[this.rankIndex];

        this.pieceType = pieceType;
        this.faction = faction;

        this.notation = this.file +"" + this.rank;

        console.debug(this.faction, this.pieceType, this.xOffset, this.yOffset, this.fileIndex, this.rankIndex, this.notation)

        boardPieces[this.notation] = this;
    }

    threatenedSquares(results) {
        let squaresToRegister = [];
        switch(this.pieceType) {
            case 'KING':
                registerSquare(results, [
                    [this.fileIndex - 1, this.rankIndex - 1], 
                    [this.fileIndex - 1, this.rankIndex],
                    [this.fileIndex - 1, this.rankIndex + 1],

                    [this.fileIndex, this.rankIndex - 1], 
                    [this.fileIndex, this.rankIndex + 1],

                    [this.fileIndex + 1, this.rankIndex - 1], 
                    [this.fileIndex + 1, this.rankIndex],
                    [this.fileIndex + 1, this.rankIndex + 1],
                ], this.pieceType);
                return results;
            case 'PAWN':
                if (this.faction === "white") {
                    registerSquare(results, [[this.fileIndex - 1, this.rankIndex + 1], [this.fileIndex + 1, this.rankIndex + 1]], this.pieceType);
                    return results;
                } else {
                   registerSquare(results, [[this.fileIndex - 1, this.rankIndex - 1], [this.fileIndex + 1, this.rankIndex - 1]], this.pieceType);
                    return results; 
                }
            case 'KNIGHT':
                registerSquare(results, [
                    [this.fileIndex - 2, this.rankIndex - 1], 
                    [this.fileIndex - 2, this.rankIndex + 1],

                    [this.fileIndex - 1, this.rankIndex - 2],
                    [this.fileIndex - 1, this.rankIndex + 2],

                    [this.fileIndex + 1, this.rankIndex - 2],
                    [this.fileIndex + 1, this.rankIndex + 2],

                    [this.fileIndex + 2, this.rankIndex - 1],
                    [this.fileIndex + 2, this.rankIndex + 1],
                ], this.pieceType);
                return results;
            case 'BISHOP':
                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex >= 0 && fileIndex >= 0; rankIndex--, fileIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex <= 8 && fileIndex <= 8; rankIndex++, fileIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex <= 8 && fileIndex >= 0; rankIndex++, fileIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex >= 0 && fileIndex <= 8; rankIndex--, fileIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                registerSquare(results, squaresToRegister, this.pieceType);

                return results;
            case 'ROOK':
                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex >= 0; rankIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex <= 8; rankIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; fileIndex >= 0; fileIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; fileIndex <= 8; fileIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                registerSquare(results, squaresToRegister, this.pieceType);

                return results;
            case 'QUEEN':
                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex >= 0 && fileIndex >= 0; rankIndex--, fileIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex <= 8 && fileIndex <= 8; rankIndex++, fileIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex <= 8 && fileIndex >= 0; rankIndex++, fileIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex >= 0 && fileIndex <= 8; rankIndex--, fileIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }
                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex >= 0; rankIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; rankIndex <= 8; rankIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; fileIndex >= 0; fileIndex--) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                for (let rankIndex = this.rankIndex, fileIndex = this.fileIndex; fileIndex <= 8; fileIndex++) {
                    if(fileIndex == this.fileIndex && rankIndex == this.rankIndex) {
                        continue;
                    }
                    let index = [fileIndex, rankIndex];
                    squaresToRegister.push(index);

                    if (boardPieces[toNotation(index)]) {
                        break;
                    }
                }

                registerSquare(results, squaresToRegister, this.pieceType);

                return results;
            default:
                console.log(this.pieceType, "is not supported");
        }

        return results;
    }
}

function toNotation(coords) {
    return fileNames[coords[0]] + "" + rankNames[coords[1]];
}

function toCoords(notation) {
    const file = notation[0];
    // - 1 because notation is 1 indexed but coords are 0 indexed
    const rankIndex = parseInt(notation[1]) - 1;
    const fileIndex = file.charCodeAt(0) - 'a'.charCodeAt(0);
    return [fileIndex, rankIndex];
}

function toOffsets(coords) {
    const fileOffset = coords[0] * widthPerSquare;
    // + 1 because coords are 0 indexed but offsets are 1 indexed
    const rankOffset = height - ((coords[1] + 1) * heightPerSquare);

    return [fileOffset, rankOffset];
}

function drawSquare(square, pieces, faction) {
    const node = document.createElement("square");
    node.className = `renderedSquare attacked_${faction}`;

    const coords = toCoords(square);
    const [fileOffset, rankOffset] = toOffsets(coords);

    node.style.transform = `translate(${fileOffset}px, ${rankOffset}px)`;
    if (faction === "white") {
        const bgColor = `rgba(0,0,255,${SQUARE_ALPHA})`;
        const stripeColor = `rgba(0,0,255,${SQUARE_ALPHA})`;
        // node.style.background = `repeating-linear-gradient(45deg, ${stripeColor}, ${stripeColor} 10px, ${bgColor} 10px, ${bgColor} 25px)`;
        node.style.borderStyle = "outset";
        node.style.borderColor = `rgba(150,150,255,1)`;
        node.style.borderWidth = "7px";
        node.style.zIndex = "2";
    } else {
        const bgColor = `rgba(255,0,0,0)`;
        const stripeColor = `rgba(255,0,0,${SQUARE_ALPHA})`;
        node.style.padding = "7px";
        // node.style.background = `repeating-linear-gradient(-45deg, ${stripeColor}, ${stripeColor} 5px, ${bgColor} 5px, ${bgColor} 15px)`;
        node.style.backgroundColor = stripeColor;
        node.style.background = `radial-gradient(circle, rgba(255,0,0,0.7) 0%, rgba(255,0,0,0.1) 60%, rgba(255,0,0,0) 100%)`;
        node.style.zIndex = "1";
    }
    const nodeText = document.createElement("p");
    nodeText.innerText = pieces.map(piece => pieceTypeToUnicode(piece, faction));
    nodeText.style.lineHeight = "normal";
    nodeText.style.fontSize = "15pt";
    if (faction === "white") {
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
    if(faction === "white") {
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

function render(renderwhite=true, renderblack=true) {
    const squares = document.querySelectorAll('square.renderedSquare');
    if(squares.length > 0) {
        return;
    }

    const _processRenders = () => {
        console.log("to render")
        deleteSquares();
        const _render_faction = faction => {
            const rooks = Array.from(document.querySelectorAll(`piece.${faction}.rook`));
            const knights = Array.from(document.querySelectorAll(`piece.${faction}.knight`));
            const bishops = Array.from(document.querySelectorAll(`piece.${faction}.bishop`));
            const queens = Array.from(document.querySelectorAll(`piece.${faction}.queen`));
            const kings = Array.from(document.querySelectorAll(`piece.${faction}.king`));
            const pawns = Array.from(document.querySelectorAll(`piece.${faction}.pawn`));
            const pawnPieces = pawns.map(domElement => new Piece(domElement, "PAWN", faction));
            const rookPieces = rooks.map(domElement => new Piece(domElement, "ROOK", faction));
            const knightPieces = knights.map(domElement => new Piece(domElement, "KNIGHT", faction));
            const bishopPieces = bishops.map(domElement => new Piece(domElement, "BISHOP", faction));
            const queenPieces = queens.map(domElement => new Piece(domElement, "QUEEN", faction));
            const kingPieces = kings.map(domElement => new Piece(domElement, "KING", faction));
        
            let attackedSquares = new Set();
            pawnPieces.forEach(piece => {
            piece.threatenedSquares(attackedSquares);
            });
        
            rookPieces.forEach(piece => {
            piece.threatenedSquares(attackedSquares);
            });
        
            knightPieces.forEach(piece => {
                piece.threatenedSquares(attackedSquares);
            });
        
            bishopPieces.forEach(piece => {
                piece.threatenedSquares(attackedSquares);
            });
        
            queenPieces.forEach(piece => {
                piece.threatenedSquares(attackedSquares);
            });
        
            kingPieces.forEach(piece => {
                piece.threatenedSquares(attackedSquares);
            });
        
            Object.keys(attackedSquares).forEach(coords => {
                drawSquare(coords, attackedSquares[coords], faction);
            });
        }

        let factionsToRender = [];
        if (renderwhite) {
            factionsToRender.push("white");
        }
        if (renderblack) {
            factionsToRender.push("black");
        }

        factionsToRender.forEach(faction => _render_faction(faction));
    }

    if (toRenderTimeoutHandle !== null) {
        clearTimeout(toRenderTimeoutHandle);
    }
    toRenderTimeoutHandle = setTimeout(_processRenders, 1);
}

render(renderwhite=true, renderblack=true);

const observer = new MutationObserver(mutations => {
    render(renderwhite=true, renderblack=true);
});

observer.observe(board, { childList: true });

})();