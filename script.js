//Copyright 2023 Ezra Winston. All rights reserved.

let currentPos = null;
let path = [];
let steps = 0;
let pathIcons = [];
let rng = null;
document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.querySelector('.grid');
    const alphabetContainer = document.querySelector('.alphabet');
    const closeInstructions = document.getElementById('close-instructions');
    const instructionsOverlay = document.getElementById('instructions-overlay');

    const puzzleDate = document.querySelector('.puzzle-date');
    const puzzleNumber = document.querySelectorAll('.puzzle-number');

    const startDate = new Date(2023, 6, 1);  // Month is 0-indexed, so 6 represents July
    const currentDate = new Date();
    const oneDay = 24 * 60 * 60 * 1000;  // Number of milliseconds in a day
    const daysDifference = Math.floor((currentDate - startDate) / oneDay);
    const currentPuzzleNumber = daysDifference + 1;

    puzzleNumber.forEach(pn => {pn.textContent = currentPuzzleNumber});
    puzzleDate.textContent = formatDate(currentDate);

    rng = seedRNG(currentPuzzleNumber);

    function createAlphabet() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        alphabet.split('').forEach((letter, index) => {
            const letterSpan = document.createElement('span');
            letterSpan.textContent = letter;
            letterSpan.id = letter;
            alphabetContainer.appendChild(letterSpan);

            // letterSpan.addEventListener('mouseover', () => {
            //     const gridButton = grid.children[index];
            //     gridButton.classList.add('hover-highlight');
            // });
            //
            // letterSpan.addEventListener('mouseout', () => {
            //     const gridButton = grid.children[index];
            //     gridButton.classList.remove('hover-highlight');
            // });
            // letterSpan.addEventListener('click', () => {
            //         const letter = letterSpan.textContent;
            //         updateAnswer(letter);
            // });
        });
    }

    // Generate a secret word
    const secretWord = await getSecretWord();

    // // Create a list of alphabets excluding the letter not present in the secret word
    // const secretWordAlphabet = new Set(secretWord.split(''));
    // const excludedLetter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(letter => !secretWordAlphabet.has(letter));
    // const alphabet_grid = generateAlphabet(excludedLetter);
    //
    // // Initialize the grid
    // const gridLetters = initializeGrid(secretWord, alphabet_grid);
    createAlphabet();

    gridLetters = generateGridLetters(secretWord)

    // Modify createGrid function to use gridLetters
    function createGrid() {
        for (let i = 0; i < 25; i++) {
            const button = document.createElement('button');
            const buttonContent = document.createElement('span');
            buttonContent.textContent = gridLetters[Math.floor(i/5)][i%5];  // Use gridLetters here
            button.appendChild(buttonContent);
            grid.appendChild(button);

            const pos = [Math.floor(i / 5), i % 5];  // Calculate position based on index

            button.addEventListener('click', () => {
                handleMove(pos, secretWord);  // Call handleMove with the calculated position
            });
    }
}

    const rulesBtn = document.querySelector('.rules-btn');
    if (!localStorage.getItem('visited')) {
            rulesBtn.classList.add('glow-btn');
    }
    rulesBtn.addEventListener('click', () => {
        instructionsOverlay.style.display = 'flex';
        rulesBtn.classList.remove('glow-btn')
        if (!localStorage.getItem('visited')) {
            localStorage.setItem('visited', true);
        }
    });


    closeInstructions.addEventListener('click', () => {
        instructionsOverlay.style.display = 'none';
    });

    // const previousPuzzle = document.getElementById('previous-puzzle');
    // const nextPuzzle = document.getElementById('next-puzzle');

    // previousPuzzle.addEventListener('click', () => {
    //     // Decrement date and puzzle number
    //     currentDate.setDate(currentDate.getDate() - 1);
    //     currentPuzzleNumber--;
    //
    //     // Update date and puzzle number
    //     puzzleDate.textContent = currentDate.toISOString().split('T')[0];
    //     puzzleNumber.textContent = `Puzzle #${currentPuzzleNumber}`;
    //
    //     // Add your custom JS logic to determine if the button click is correct or incorrect
    //     const isCorrect = true; // Replace with your custom logic
    //
    //     previousPuzzle.classList.add('clicked');
    //     if (isCorrect) {
    //         previousPuzzle.classList.add('correct');
    //         previousPuzzle.classList.remove('incorrect');
    //     } else {
    //         previousPuzzle.classList.add('incorrect');
    //         previousPuzzle.classList.remove('correct');
    //     }
    // });
    //
    // nextPuzzle.addEventListener('click', () => {
    //     // Increment date and puzzle number
    //     currentDate.setDate(currentDate.getDate() + 1);
    //     currentPuzzleNumber++;
    //
    //     // Update date and puzzle number
    //     puzzleDate.textContent = currentDate.toISOString().split('T')[0];
    //     puzzleNumber.textContent = `Puzzle #${currentPuzzleNumber}`;
    //
    //     // Add your custom JS logic to determine if the button click is correct or incorrect
    //     const isCorrect = false; // Replace with your custom logic
    //
    //     nextPuzzle.classList.add('clicked');
    //     if (isCorrect) {
    //         nextPuzzle.classList.add('correct');
    //         nextPuzzle.classList.remove('incorrect');
    //     } else {
    //         nextPuzzle.classList.add('incorrect');
    //         nextPuzzle.classList.remove('correct');
    //     }
    // });

    createGrid();
    // showInstructions();


});

function formatDate(date) {
    var day = String(date.getDate()).padStart(2, '0');
    var month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
    var year = String(date.getFullYear()).slice(-2);

    return month + '/' + day + '/' + year;
}

function updateAnswer(letter, secretWord) {
    const answerLetters = document.querySelectorAll('.answer-letter');

    for(let i = 0; i < secretWord.length; i++) {
        if (secretWord[i] === letter) {
            answerLetters[i].textContent = letter;
            answerLetters[i].classList.add('correct');
        }
    }
}
// Random Word Selection
async function getSecretWord() {
    const response = await fetch('wordle-answers-alphabetical.txt');
    const data = await response.text();
    const words = data.split('\n');
    const index = Math.floor(rng() * words.length);
    return words[index].toUpperCase();
}

// // Alphabet Generation
// function generateAlphabet(excludeLetter = '') {
//     const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//     return alphabet.split('')
//         .filter(letter => letter !== excludeLetter)
//         .sort(() => Math.random() - 0.5);
// }

// Grid Initialization


function handleMove(newPos,secretWord) {
    numNew = 0
    if (currentPos === null) {
        // If it's the first turn, just set currentPos to newPos and add newPos to the path
        currentPos = newPos;
        path.push(newPos);
        const curButton = document.querySelector(`.grid button:nth-child(${currentPos[0] * 5 + currentPos[1] + 1})`)
        curButton.classList.add('current');
        return;
    } else if (isValidMove(currentPos, newPos)) {
        const curButton = document.querySelector(`.grid button:nth-child(${currentPos[0] * 5 + currentPos[1] + 1})`)
        curButton.classList.remove('current');
        // If it's not the first turn, calculate the path from currentPos to newPos
        const newPath = calculatePath(currentPos, newPos);
        numNew = newPath.length
        path = path.concat(newPath);
        currentPos = newPos;
        steps += 1
        document.querySelectorAll('.step-count').forEach(span => {span.textContent = steps});
    } else {
        const errorOverlay = document.getElementById('error-overlay');

        errorOverlay.style.opacity = '1';
        errorOverlay.style.pointerEvents = 'auto';

        setTimeout(() => {
            errorOverlay.style.opacity = '0';
            errorOverlay.style.pointerEvents = 'none';
        }, 1500);
        return;// Handle invalid move
    }
    updateUI(secretWord, numNew);
    checkWin(secretWord);
}


function splitIntoChunks(array, chunkSize) {
    let chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

function checkWin(secretWord) {
    const revealedLetters = Array.from(document.querySelectorAll('.answer-letter')).map(div => div.textContent).join('');
    if (revealedLetters === secretWord) {
        const winOverlay = document.getElementById('win-overlay');
        winOverlay.style.display = 'flex';
        arrows = pathIcons.map(step => step[0])
        rows = splitIntoChunks(arrows, 7).map(row => row.join(' '))
        document.querySelector('.pathIcons').innerHTML = rows.join('<br/>')
        if (!localStorage.getItem('visited')) {
            localStorage.setItem('visited', true);
        }
        document.querySelector('.rules-btn').classList.remove('glow-btn')
        // pathIcons[0][0] = "▶️"
        // pathIconsContainer = document.querySelector('.pathIcons')
        // pathIcons.forEach(step => {
        //     stepDiv = document.createElement('span');
        //     stepDiv.textContent = step[0];//step.join(" ");
        //     pathIconsContainer.appendChild(stepDiv);});
    }
}

function updateUI(secretWord,numNew) {
    // Clear old highlights
    // document.querySelectorAll('.grid button').forEach(button => {
    //     button.classList.remove('highlighted-green');
    //     button.classList.remove('highlighted-red');
    // });

    // Highlight path
    const curButton = document.querySelector(`.grid button:nth-child(${currentPos[0] * 5 + currentPos[1] + 1})`)
    curButton.classList.add('current');
    numOld = path.length - numNew
    path.forEach((pos,idx) => {
        const button = document.querySelector(`.grid button:nth-child(${pos[0] * 5 + pos[1] + 1})`);
        const letter = button.textContent;
        const alpha = document.getElementById(letter);
        if (secretWord.includes(letter)) {
            if (idx>= numOld || numOld===1) {
                pathIcons[pathIcons.length -1].push("🟩")
            }
            button.classList.add('highlighted-green');
            alpha.classList.add('included');
            // Reveal letter in word
            // const answerLetterDiv = document.querySelector(`.answer-letter[data-letter="${letter}"]`);
            // if (answerLetterDiv) {
            //     answerLetterDiv.textContent = letter;
            //     answerLetterDiv.classList.add('correct');
            // }
        } else {
            if (idx>= numOld || numOld===1) {
                pathIcons[pathIcons.length -1].push("⬜")
            }
            button.classList.add('highlighted-red');
            alpha.classList.add('excluded')
        }
        updateAnswer(letter, secretWord)
    });
}

function calculatePath(startPos, endPos) {
    const path = [];
    const dx = endPos[1] - startPos[1];
    const dy = endPos[0] - startPos[0];
    const nx = Math.abs(dx);
    const ny = Math.abs(dy);
    const signX = dx > 0 ? 1 : -1;
    const signY = dy > 0 ? 1 : -1;
    const arrow = dx > 0 ? (dy > 0 ? "↘️" : (dy < 0 ? "↗️" : "➡️")) : (dx < 0 ? (dy > 0 ? "↙️" : (dy < 0 ? "↖️" : "⬅️")) : (dy > 0 ? "⬇️" : "⬆️"))
    pathIcons.push([arrow])
    let px = startPos[1];
    let py = startPos[0];

    if (nx === ny) {  // Diagonal movement
        for (let i = 0; i < nx; i++) {
            px += signX;
            py += signY;
            path.push([py, px]);
        }
    } else {  // Orthogonal movement
        for (let ix = 0, iy = 0; ix < nx || iy < ny;) {
            if ((0.5+ix) / nx < (0.5+iy) / ny) {
                // next step is horizontal
                px += signX;
                ix++;
            } else {
                // next step is vertical
                py += signY;
                iy++;
            }
            path.push([py, px]);
        }
    }

    return path;
}

function isValidMove(pos1, pos2) {
    const rowDiff = Math.abs(pos1[0] - pos2[0]);
    const colDiff = Math.abs(pos1[1] - pos2[1]);
    // Check if move is orthogonal or diagonal and within three spaces
    return (( rowDiff > 0 || colDiff > 0) && (rowDiff === colDiff || rowDiff === 0 || colDiff === 0) && Math.max(rowDiff, colDiff) <= 3);
}

function shuffle(array, rng) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(rng() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function generateGridLetters(secretWord) {
    let gridSize = 5;
    let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let gridLetters = [];

    // Convert the alphabet into an array and shuffle it
    alphabet = alphabet.split('');
    alphabet = shuffle(alphabet, rng);

    // Remove the first letter that's not in the secret word
    for (let i = 0; i < alphabet.length; i++) {
        if (!secretWord.includes(alphabet[i])) {
            document.getElementById(alphabet[i]).classList.add("excluded")
            alphabet.splice(i, 1);
            break;
        }
    }

    // Select the first gridSize * gridSize letters as the grid letters
    gridLetters = alphabet.slice(0, gridSize * gridSize);

    const grid = [];
    while (gridLetters.length) {
        grid.push(gridLetters.splice(0, 5));
    }
    return grid;
}

function seedRNG(seed) {
  var m = 0x80000000;
  var a = 1103515245;
  var c = 12345;

  var seedInner = seed;

  // Use the local date as the seed
  var rand = function() {
    seedInner = (a * seedInner + c) % m;
    return seedInner / m;
  };

  return rand;
}



