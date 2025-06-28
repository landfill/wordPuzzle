document.addEventListener('DOMContentLoaded', () => {
    const problemArea = document.querySelector('.problem-area');
    const keyboardArea = document.querySelector('.keyboard-area');
    const livesDisplay = document.querySelector('.lives-display');

    let lives = 5;
    let currentProblemIndex = 0;
    let activeBlankIndex = -1;
    let problemBlanks = [];
    let usedCharsInProblem = new Set();
    let requiredBlankChars = new Map();
    let correctlyFilledBlankChars = new Map();
    let fixedCharHintElementsMap = new Map();

    const problems = [
        {
            sentence: "The quick brown fox jumps over the lazy dog in the sunny afternoon.",
            blanks: [
                { char: 'T', index: 0, hintNum: 1 },
                { char: 'h', index: 1, hintNum: 2 },
                { char: 'e', index: 2, hintNum: 3 },
                { char: 'q', index: 4, hintNum: 4 },
                { char: 'u', index: 5, hintNum: 5 },
                { char: 'i', index: 6, hintNum: 6 },
                { char: 'c', index: 7, hintNum: 7 },
                { char: 'k', index: 8, hintNum: 8 },
                { char: 'b', index: 10, hintNum: 9 },
                { char: 'r', index: 11, hintNum: 10 },
                { char: 'o', index: 12, hintNum: 11 },
                { char: 'w', index: 13, hintNum: 12 },
                { char: 'n', index: 14, hintNum: 13 }
            ]
        },
        {
            sentence: "Learning English through interactive puzzles makes studying fun and engaging.",
            blanks: [
                { char: 'L', index: 0, hintNum: 1 },
                { char: 'e', index: 1, hintNum: 2 },
                { char: 'a', index: 2, hintNum: 3 },
                { char: 'r', index: 3, hintNum: 4 },
                { char: 'n', index: 4, hintNum: 5 },
                { char: 'i', index: 5, hintNum: 6 },
                { char: 'n', index: 6, hintNum: 7 },
                { char: 'g', index: 7, hintNum: 8 },
                { char: 'E', index: 9, hintNum: 9 },
                { char: 'n', index: 10, hintNum: 10 },
                { char: 'g', index: 11, hintNum: 11 },
                { char: 'l', index: 12, hintNum: 12 }
            ]
        },
        {
            sentence: "Adventure awaits those who dare to explore beyond their comfort zone.",
            blanks: [
                { char: 'A', index: 0, hintNum: 1 },
                { char: 'd', index: 1, hintNum: 2 },
                { char: 'v', index: 2, hintNum: 3 },
                { char: 'e', index: 3, hintNum: 4 },
                { char: 'n', index: 4, hintNum: 5 },
                { char: 't', index: 5, hintNum: 6 },
                { char: 'u', index: 6, hintNum: 7 },
                { char: 'r', index: 7, hintNum: 8 },
                { char: 'e', index: 8, hintNum: 9 },
                { char: 'a', index: 10, hintNum: 10 },
                { char: 'w', index: 11, hintNum: 11 },
                { char: 'a', index: 12, hintNum: 12 }
            ]
        },
        {
            sentence: "Technology has revolutionized the way we communicate and share information.",
            blanks: [
                { char: 'T', index: 0, hintNum: 1 },
                { char: 'e', index: 1, hintNum: 2 },
                { char: 'c', index: 2, hintNum: 3 },
                { char: 'h', index: 3, hintNum: 4 },
                { char: 'n', index: 4, hintNum: 5 },
                { char: 'o', index: 5, hintNum: 6 },
                { char: 'l', index: 6, hintNum: 7 },
                { char: 'o', index: 7, hintNum: 8 },
                { char: 'g', index: 8, hintNum: 9 },
                { char: 'y', index: 9, hintNum: 10 },
                { char: 'h', index: 11, hintNum: 11 },
                { char: 'a', index: 12, hintNum: 12 }
            ]
        },
        {
            sentence: "Creativity flourishes when imagination meets determination and hard work.",
            blanks: [
                { char: 'C', index: 0, hintNum: 1 },
                { char: 'r', index: 1, hintNum: 2 },
                { char: 'e', index: 2, hintNum: 3 },
                { char: 'a', index: 3, hintNum: 4 },
                { char: 't', index: 4, hintNum: 5 },
                { char: 'i', index: 5, hintNum: 6 },
                { char: 'v', index: 6, hintNum: 7 },
                { char: 'i', index: 7, hintNum: 8 },
                { char: 't', index: 8, hintNum: 9 },
                { char: 'y', index: 9, hintNum: 10 },
                { char: 'f', index: 11, hintNum: 11 },
                { char: 'l', index: 12, hintNum: 12 }
            ]
        }
    ];

    const keyboardLayout = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];

    function initializeGame() {
        lives = 5;
        updateLivesDisplay();
        currentProblemIndex = Math.floor(Math.random() * problems.length);
        usedCharsInProblem.clear();
        requiredBlankChars.clear();
        correctlyFilledBlankChars.clear();
        fixedCharHintElementsMap.clear();
        loadProblem(currentProblemIndex);
        createKeyboard();
        updateFixedCharHints();
    }

    function updateLivesDisplay() {
        const livesCount = document.getElementById('lives-count');
        if (livesCount) {
            livesCount.textContent = lives;
        }
        
        livesDisplay.innerHTML = 'Life: ';
        for (let i = 0; i < 5; i++) {
            const heart = document.createElement('span');
            heart.classList.add('heart-icon');
            heart.innerHTML = '♥';
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
        const words = problem.sentence.split(' ');
        
        // Create navigation controls
        const navControls = document.createElement('div');
        navControls.classList.add('navigation-controls');
        
        const prevBtn = document.createElement('button');
        prevBtn.classList.add('nav-button');
        prevBtn.innerHTML = '◀';
        prevBtn.addEventListener('click', () => navigateBlank(-1));
        
        const nextBtn = document.createElement('button');
        nextBtn.classList.add('nav-button');
        nextBtn.innerHTML = '▶';
        nextBtn.addEventListener('click', () => navigateBlank(1));
        
        navControls.appendChild(prevBtn);
        navControls.appendChild(nextBtn);
        problemArea.appendChild(navControls);

        // Populate requiredBlankChars
        problem.blanks.forEach(blank => {
            const char = blank.char.toLowerCase();
            requiredBlankChars.set(char, (requiredBlankChars.get(char) || 0) + 1);
        });

        let charIndex = 0;
        let blankCounter = 0;

        words.forEach((word, wordIndex) => {
            const wordGroup = document.createElement('div');
            wordGroup.classList.add('word-group');
            
            let hasActiveBlank = false;

            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const currentCharIndex = charIndex + i;
                
                const charSlot = document.createElement('div');
                charSlot.classList.add('char-slot');

                const blankInfo = problem.blanks.find(b => b.index === currentCharIndex);

                if (blankInfo) {
                    const blankSpan = document.createElement('div');
                    blankSpan.classList.add('word-blank');
                    blankSpan.dataset.correctChar = blankInfo.char.toLowerCase();
                    blankSpan.dataset.blankIndex = blankCounter;
                    blankSpan.addEventListener('click', () => {
                        setActiveBlank(parseInt(blankSpan.dataset.blankIndex));
                    });

                    const hintSpan = document.createElement('div');
                    hintSpan.classList.add('hint-number');
                    hintSpan.textContent = blankInfo.hintNum;

                    charSlot.appendChild(blankSpan);
                    charSlot.appendChild(hintSpan);
                    problemBlanks.push(blankSpan);
                    blankCounter++;
                    hasActiveBlank = true;
                } else {
                    const lowerChar = char.toLowerCase();
                    if (lowerChar.match(/[a-z]/)) {
                        const isAlsoBlankChar = problem.blanks.some(b => b.char.toLowerCase() === lowerChar);

                        if (isAlsoBlankChar) {
                            const charSpan = document.createElement('div');
                            charSpan.classList.add('fixed-char-text');
                            charSpan.textContent = char.toUpperCase();

                            const hintSpan = document.createElement('div');
                            hintSpan.classList.add('hint-number');
                            const hintNumForChar = problem.blanks.find(b => b.char.toLowerCase() === lowerChar)?.hintNum;
                            if (hintNumForChar) {
                                hintSpan.textContent = hintNumForChar;
                            }

                            charSlot.appendChild(charSpan);
                            charSlot.appendChild(hintSpan);

                            if (!fixedCharHintElementsMap.has(lowerChar)) {
                                fixedCharHintElementsMap.set(lowerChar, []);
                            }
                            fixedCharHintElementsMap.get(lowerChar).push(hintSpan);
                        } else {
                            const charSpan = document.createElement('div');
                            charSpan.classList.add('fixed-char-text');
                            charSpan.textContent = char.toUpperCase();
                            charSlot.appendChild(charSpan);
                            usedCharsInProblem.add(lowerChar);
                        }
                    } else {
                        const charSpan = document.createElement('div');
                        charSpan.classList.add('fixed-char-text');
                        charSpan.textContent = char;
                        charSlot.appendChild(charSpan);
                    }
                }
                wordGroup.appendChild(charSlot);
            }

            if (hasActiveBlank) {
                wordGroup.classList.add('has-active-blank');
            }

            problemArea.appendChild(wordGroup);
            charIndex += word.length + 1; // +1 for space
        });

        if (problemBlanks.length > 0) {
            setActiveBlank(0);
        }
    }

    function navigateBlank(direction) {
        if (problemBlanks.length === 0) return;
        
        let newIndex = activeBlankIndex + direction;
        if (newIndex < 0) newIndex = problemBlanks.length - 1;
        if (newIndex >= problemBlanks.length) newIndex = 0;
        
        setActiveBlank(newIndex);
    }

    function setActiveBlank(index) {
        if (activeBlankIndex !== -1 && problemBlanks[activeBlankIndex]) {
            problemBlanks[activeBlankIndex].classList.remove('active');
        }
        activeBlankIndex = index;
        if (problemBlanks[activeBlankIndex]) {
            problemBlanks[activeBlankIndex].classList.add('active');
        }
        updateWordGroupHighlight();
    }

    function updateWordGroupHighlight() {
        document.querySelectorAll('.word-group').forEach(group => {
            group.classList.remove('has-active-blank');
        });
        
        if (activeBlankIndex !== -1 && problemBlanks[activeBlankIndex]) {
            const activeBlank = problemBlanks[activeBlankIndex];
            const parentGroup = activeBlank.closest('.word-group');
            if (parentGroup) {
                parentGroup.classList.add('has-active-blank');
            }
        }
    }

    function createKeyboard() {
        keyboardArea.innerHTML = '';
        
        keyboardLayout.forEach((row, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('keyboard-row');
            
            // Add navigation buttons to the last row
            if (rowIndex === keyboardLayout.length - 1) {
                const prevBtn = document.createElement('button');
                prevBtn.classList.add('blank-nav-btn');
                prevBtn.innerHTML = '◀';
                prevBtn.addEventListener('click', () => navigateBlank(-1));
                rowDiv.appendChild(prevBtn);
            }
            
            row.forEach(keyChar => {
                const keyDiv = document.createElement('div');
                keyDiv.classList.add('key');
                keyDiv.textContent = keyChar.toUpperCase();
                keyDiv.dataset.key = keyChar;
                keyDiv.addEventListener('click', () => handleKeyPress(keyChar));
                rowDiv.appendChild(keyDiv);
            });
            
            // Add navigation buttons to the last row
            if (rowIndex === keyboardLayout.length - 1) {
                const nextBtn = document.createElement('button');
                nextBtn.classList.add('blank-nav-btn');
                nextBtn.innerHTML = '▶';
                nextBtn.addEventListener('click', () => navigateBlank(1));
                rowDiv.appendChild(nextBtn);
            }
            
            keyboardArea.appendChild(rowDiv);
        });
        updateKeyboardState();
    }

    function updateKeyboardState() {
        keyboardLayout.flat().forEach(keyChar => {
            const keyDiv = keyboardArea.querySelector(`[data-key="${keyChar}"]`);
            if (keyDiv) {
                const totalRequired = requiredBlankChars.get(keyChar) || 0;
                const currentFilled = correctlyFilledBlankChars.get(keyChar) || 0;
                const isFixedAndNotABlankChar = usedCharsInProblem.has(keyChar);
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
                hintSpans.forEach(span => {
                    span.style.visibility = 'hidden';
                });
            } else {
                hintSpans.forEach(span => {
                    span.style.visibility = 'visible';
                });
            }
        });
    }

    function handleKeyPress(key) {
        if (activeBlankIndex === -1 || !problemBlanks[activeBlankIndex]) {
            return;
        }

        const currentBlank = problemBlanks[activeBlankIndex];
        const correctChar = currentBlank.dataset.correctChar;

        if (key.toLowerCase() === correctChar) {
            currentBlank.textContent = key.toUpperCase();
            currentBlank.classList.add('correct');
            currentBlank.classList.remove('active');

            correctlyFilledBlankChars.set(correctChar, (correctlyFilledBlankChars.get(correctChar) || 0) + 1);
            updateKeyboardState();
            updateFixedCharHints();

            const nextBlankIndex = activeBlankIndex + 1;
            if (nextBlankIndex < problemBlanks.length) {
                setActiveBlank(nextBlankIndex);
            } else {
                checkPuzzleCompletion();
            }
        } else {
            currentBlank.textContent = 'X';
            currentBlank.classList.add('incorrect');
            lives--;
            updateLivesDisplay();

            setTimeout(() => {
                currentBlank.textContent = '';
                currentBlank.classList.remove('incorrect');
                if (lives <= 0) {
                    alert('Game Over! Try again.');
                    initializeGame();
                }
            }, 1000);
        }
    }

    function checkPuzzleCompletion() {
        const allFilled = problemBlanks.every(blank => blank.textContent !== '' && blank.textContent !== 'X');
        if (allFilled) {
            setTimeout(() => {
                alert('Congratulations! You solved the puzzle!');
                initializeGame();
            }, 500);
        }
    }

    // Keyboard event listener
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key.match(/[a-z]/)) {
            handleKeyPress(key);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            navigateBlank(-1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            navigateBlank(1);
        }
    });

    initializeGame();
});