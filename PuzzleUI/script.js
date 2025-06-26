document.addEventListener('DOMContentLoaded', () => {
    const problemArea = document.querySelector('.problem-area');
    const keyboardArea = document.querySelector('.keyboard-area');
    const livesDisplay = document.querySelector('.lives-display');

    let lives = 5;
    let currentProblemIndex = 0;
    let activeBlankIndex = -1;
    let problemBlanks = []; // To store references to the blank elements
    let usedCharsInProblem = new Set(); // Chars already visible in the problem (fixed, not blanks, e.g., 'f' in infinity)
    let requiredBlankChars = new Map(); // Map<char, totalCount> for blanks
    let correctlyFilledBlankChars = new Map(); // Map<char, currentFilledCount> for blanks
    let fixedCharHintElementsMap = new Map(); // Map<char, Array<HTMLElement>> to store hint spans for fixed chars that also appear in blanks

    const problems = [
        {
            sentence: "To infinity, and beyond!",
            blanks: [
                { char: 'o', index: 1, hintNum: 1 },
                { char: 'i', index: 3, hintNum: 2 },
                { char: 'i', index: 6, hintNum: 2 },
                { char: 'i', index: 8, hintNum: 2 },
                { char: 't', index: 9, hintNum: 4 },
                { char: 'y', index: 10, hintNum: 5 },
                { char: 'a', index: 13, hintNum: 6 },
                { char: 'd', index: 15, hintNum: 7 },
                { char: 'b', index: 17, hintNum: 8 },
                { char: 'y', index: 19, hintNum: 5 },
                { char: 'o', index: 20, hintNum: 1 },
                { char: 'n', index: 21, hintNum: 3 }
            ]
        }
        // Add more problems here if needed
    ];

    const keyboardLayout = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];

    function initializeGame() {
        lives = 5;
        updateLivesDisplay();
        currentProblemIndex = 0;
        usedCharsInProblem.clear();
        requiredBlankChars.clear();
        correctlyFilledBlankChars.clear();
        fixedCharHintElementsMap.clear(); // Clear for new game
        loadProblem(currentProblemIndex);
        createKeyboard();
        updateFixedCharHints(); // Set initial visibility for fixed char hints
    }

    function updateLivesDisplay() {
        livesDisplay.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const heart = document.createElement('span');
            heart.classList.add('heart-icon');
            heart.innerHTML = '&#x2764;'; // HTML entity for a filled heart symbol
            if (i >= lives) {
                heart.classList.add('lost');
            }
            livesDisplay.appendChild(heart);
        }
    }

    function loadProblem(index) {
        problemArea.innerHTML = '';
        problemBlanks = [];
        usedCharsInProblem.clear();
        requiredBlankChars.clear();
        correctlyFilledBlankChars.clear();
        fixedCharHintElementsMap.clear();

        const problem = problems[index];
        const sentenceParts = problem.sentence.split('');

        // Populate requiredBlankChars (total count of each char needed for blanks)
        problem.blanks.forEach(blank => {
            const char = blank.char.toLowerCase();
            requiredBlankChars.set(char, (requiredBlankChars.get(char) || 0) + 1);
        });

        let blankCounter = 0;
        sentenceParts.forEach((char, charIndex) => {
            const charSlot = document.createElement('span');
            charSlot.classList.add('char-slot');

            const blankInfo = problem.blanks.find(b => b.index === charIndex);

            if (char === ' ' || char === '-') { // Handle spaces and hyphens explicitly for word separation
                charSlot.classList.add('space-slot'); // Add a specific class for spaces
                charSlot.textContent = char; // Just the space or hyphen
            } else if (blankInfo) {
                const hintSpan = document.createElement('span');
                hintSpan.classList.add('hint-number');
                hintSpan.textContent = blankInfo.hintNum;
                charSlot.appendChild(hintSpan);

                const blankSpan = document.createElement('span');
                blankSpan.classList.add('word-blank');
                blankSpan.dataset.correctChar = blankInfo.char.toLowerCase();
                blankSpan.dataset.blankIndex = blankCounter;
                blankSpan.addEventListener('click', () => {
                    setActiveBlank(parseInt(blankSpan.dataset.blankIndex));
                });
                charSlot.appendChild(blankSpan);
                problemBlanks.push(blankSpan);
                blankCounter++;
            } else {
                // Fixed character (alphabetic or punctuation)
                const lowerChar = char.toLowerCase();
                if (lowerChar.match(/[a-z]/)) { // Alphabetic fixed character
                    // Check if this fixed character also appears as a blank character
                    const isAlsoBlankChar = problem.blanks.some(b => b.char.toLowerCase() === lowerChar);

                    if (isAlsoBlankChar) {
                        const hintSpan = document.createElement('span');
                        hintSpan.classList.add('hint-number');
                        const hintNumForChar = problem.blanks.find(b => b.char.toLowerCase() === lowerChar)?.hintNum;
                        if (hintNumForChar) {
                            hintSpan.textContent = hintNumForChar;
                        }
                        charSlot.appendChild(hintSpan);

                        const charSpan = document.createElement('span');
                        charSpan.classList.add('fixed-char-text');
                        charSpan.textContent = char.toUpperCase(); // Ensure uppercase
                        charSlot.appendChild(charSpan);

                        if (!fixedCharHintElementsMap.has(lowerChar)) {
                            fixedCharHintElementsMap.set(lowerChar, []);
                        }
                        fixedCharHintElementsMap.get(lowerChar).push(hintSpan);

                    } else {
                        // Regular fixed alphabetic character without a hint
                        const charSpan = document.createElement('span');
                        charSpan.classList.add('fixed-char-text');
                        charSpan.textContent = char.toUpperCase(); // Ensure uppercase
                        charSlot.appendChild(charSpan);
                        usedCharsInProblem.add(lowerChar); // Add to set for keyboard disabling
                    }
                } else {
                    // Punctuation or other non-alphabetic, non-space characters
                    const charSpan = document.createElement('span');
                    charSpan.classList.add('fixed-char-text');
                    charSpan.textContent = char; // Keep as is (punctuation)
                    charSlot.appendChild(charSpan);
                }
            }
            problemArea.appendChild(charSlot);
        });
        // Set the first blank as active initially
        if (problemBlanks.length > 0) {
            setActiveBlank(0);
        }
    }

    function setActiveBlank(index) {
        if (activeBlankIndex !== -1 && problemBlanks[activeBlankIndex]) {
            problemBlanks[activeBlankIndex].classList.remove('active');
        }
        activeBlankIndex = index;
        if (problemBlanks[activeBlankIndex]) {
            problemBlanks[activeBlankIndex].classList.add('active');
        }
    }

    function createKeyboard() {
        keyboardArea.innerHTML = '';
        keyboardLayout.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('keyboard-row');
            row.forEach(keyChar => {
                const keyDiv = document.createElement('div');
                keyDiv.classList.add('key');
                keyDiv.textContent = keyChar.toUpperCase();
                keyDiv.dataset.key = keyChar;
                keyDiv.addEventListener('click', () => handleKeyPress(keyChar));
                rowDiv.appendChild(keyDiv);
            });
            keyboardArea.appendChild(rowDiv);
        });
        updateKeyboardState();
    }

    function updateKeyboardState() {
        keyboardLayout.flat().forEach(keyChar => { // Flatten the array to iterate all keys
            const keyDiv = keyboardArea.querySelector(`[data-key="${keyChar}"]`);
            if (keyDiv) {
                const totalRequired = requiredBlankChars.get(keyChar) || 0;
                const currentFilled = correctlyFilledBlankChars.get(keyChar) || 0;

                // Condition 1: The character is in the problem sentence (not a blank) AND is NOT a character that needs to be filled in blanks.
                // This means it's a fixed character in the puzzle and not meant to be filled.
                const isFixedAndNotABlankChar = usedCharsInProblem.has(keyChar); // usedCharsInProblem only contains fixed chars that are NOT blanks

                // Condition 2: All instances of this character in blanks have been filled.
                const isAllBlanksFilled = totalRequired > 0 && currentFilled === totalRequired;

                if (isFixedAndNotABlankChar || isAllBlanksFilled) {
                    keyDiv.classList.add('disabled');
                    keyDiv.style.pointerEvents = 'none';
                } else {
                    keyDiv.classList.remove('disabled');
                    keyDiv.style.pointerEvents = 'auto';
                }
            }
        });
    }

    function updateFixedCharHints() {
        fixedCharHintElementsMap.forEach((hintSpans, char) => {
            const totalRequired = requiredBlankChars.get(char) || 0;
            const currentFilled = correctlyFilledBlankChars.get(char) || 0;

            if (totalRequired > 0 && currentFilled === totalRequired) {
                // All blanks for this char are filled, hide all its fixed char hints
                hintSpans.forEach(span => {
                    span.style.visibility = 'hidden';
                });
            } else {
                // If for some reason it was hidden and now needs to be shown (e.g., restart game)
                hintSpans.forEach(span => {
                    span.style.visibility = 'visible';
                });
            }
        });
    }

    function handleKeyPress(key) {
        if (activeBlankIndex === -1 || !problemBlanks[activeBlankIndex]) {
            return; // No blank is active
        }

        const currentBlank = problemBlanks[activeBlankIndex];
        const correctChar = currentBlank.dataset.correctChar;

        if (key.toLowerCase() === correctChar) {
            currentBlank.textContent = key.toUpperCase();
            currentBlank.classList.add('correct');
            currentBlank.classList.remove('active');

            // Update filled count for this character
            correctlyFilledBlankChars.set(correctChar, (correctlyFilledBlankChars.get(correctChar) || 0) + 1);
            updateKeyboardState(); // Update keyboard after filling
            updateFixedCharHints(); // Update fixed char hints after filling

            // Move to the next blank
            const nextBlankIndex = activeBlankIndex + 1;
            if (nextBlankIndex < problemBlanks.length) {
                setActiveBlank(nextBlankIndex);
            } else {
                // All blanks filled, check if puzzle is complete
                checkPuzzleCompletion();
            }
        } else {
            currentBlank.textContent = 'X';
            currentBlank.classList.add('incorrect');
            lives--;
            updateLivesDisplay(); // Update heart icons

            setTimeout(() => {
                currentBlank.textContent = '';
                currentBlank.classList.remove('incorrect');
                if (lives <= 0) {
                    alert('Game Over! Try again.');
                    initializeGame(); // Restart game
                }n            }, 1000);
        }
    }

    function checkPuzzleCompletion() {
        const allFilled = problemBlanks.every(blank => blank.textContent !== '');
        if (allFilled) {
            alert('Congratulations! You solved the puzzle!');
            // Optionally load next problem or end game
            // For now, just restart
            initializeGame();
        }
    }

    initializeGame();
});