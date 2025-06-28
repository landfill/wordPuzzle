import ContentGenerator from './content-generator.js';
import CONTENT_DATABASE from './content-database.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const problemArea = document.querySelector('.problem-area');
    const keyboardArea = document.querySelector('.keyboard-area');
    const livesDisplay = document.querySelector('.lives-display');
    const sourceDisplay = document.querySelector('.source-display');
    const successModal = document.getElementById('success-modal');
    const newQuizBtn = document.getElementById('new-quiz-btn');
    const listenBtn = document.getElementById('listen-btn');

    // --- Game State ---
    let lives = 5;
    let currentProblem; // This will hold the entire generated problem object
    let activeBlankIndex = -1;
    let problemBlanks = [];
    let usedCharsInProblem = new Set();
    let requiredBlankChars = new Map();
    let correctlyFilledBlankChars = new Map();
    let charToHintNumber = new Map();
    let currentSentence = ''; // For TTS
    let isReading = false;
    let availableVoices = [];

    // --- Content Generation ---
    const contentGenerator = new ContentGenerator();
    // Load the entire database into the generator
    Object.keys(CONTENT_DATABASE).forEach(category => {
        Object.keys(CONTENT_DATABASE[category]).forEach(source => {
            contentGenerator.addContent(category, source, CONTENT_DATABASE[category][source]);
        });
    });

    const keyboardLayout = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];
    
    // --- Core Game Functions ---

    function initializeGame() {
        lives = 5;
        updateLivesDisplay();
        
        // Generate a new, random problem from the database
        currentProblem = contentGenerator.generateRandomProblem();
        currentSentence = currentProblem.sentence;
        
        // Clear all previous game state
        activeBlankIndex = -1;
        problemBlanks = [];
        usedCharsInProblem.clear();
        requiredBlankChars.clear();
        correctlyFilledBlankChars.clear();
        charToHintNumber.clear();
        isReading = false;

        // Load the new problem into the UI
        loadProblem(currentProblem);
        updateSourceDisplay(currentProblem);
        if (keyboardArea.childElementCount === 0) {
            createKeyboard();
        }
        updateKeyboardState();
        updateHintVisibility();
    }

    function loadProblem(problem) {
        problemArea.innerHTML = '';
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

        // Map characters to their hint numbers for this problem
        const blankCharToHintMap = new Map();
        problem.blanks.forEach(blank => {
            const char = blank.char.toLowerCase();
            if (!blankCharToHintMap.has(char)) {
                blankCharToHintMap.set(char, blank.hintNum);
            }
            requiredBlankChars.set(char, (requiredBlankChars.get(char) || 0) + 1);
        });

        // Identify fixed characters
        for (let i = 0; i < problem.sentence.length; i++) {
            const char = problem.sentence[i].toLowerCase();
            if (char.match(/[a-z]/)) {
                const isBlank = problem.blanks.some(blank => blank.index === i);
                if (!isBlank) {
                    if (blankCharToHintMap.has(char)) {
                         charToHintNumber.set(char, blankCharToHintMap.get(char));
                    } else {
                        usedCharsInProblem.add(char);
                    }
                }
            }
        }
        
        let charIndex = 0;
        let blankCounter = 0;

        words.forEach((word) => {
            const wordGroup = document.createElement('div');
            wordGroup.classList.add('word-group');
            
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
                    blankSpan.addEventListener('click', () => setActiveBlank(parseInt(blankSpan.dataset.blankIndex)));
                    
                    const hintSpan = document.createElement('div');
                    hintSpan.classList.add('hint-number');
                    hintSpan.textContent = blankInfo.hintNum;
                    
                    charSlot.appendChild(blankSpan);
                    charSlot.appendChild(hintSpan);
                    problemBlanks.push(blankSpan);
                    blankCounter++;
                } else {
                    const lowerChar = char.toLowerCase();
                    const charSpan = document.createElement('div');
                    const hintSpan = document.createElement('div');
                    hintSpan.classList.add('hint-number');

                    if (lowerChar.match(/[a-z]/)) {
                        charSpan.classList.add('fixed-char-text');
                        charSpan.textContent = char.toUpperCase();
                        if (charToHintNumber.has(lowerChar)) {
                            hintSpan.textContent = charToHintNumber.get(lowerChar);
                            hintSpan.dataset.char = lowerChar;
                        } else {
                            hintSpan.style.visibility = 'hidden';
                            hintSpan.textContent = '0';
                        }
                    } else {
                        charSpan.classList.add('fixed-char-text');
                        charSpan.textContent = char;
                        hintSpan.style.visibility = 'hidden';
                        hintSpan.textContent = '0';
                    }
                    charSlot.appendChild(charSpan);
                    charSlot.appendChild(hintSpan);
                }
                wordGroup.appendChild(charSlot);
            }
            problemArea.appendChild(wordGroup);
            charIndex += word.length + 1; // +1 for space
        });
        
        if (problemBlanks.length > 0) {
            setActiveBlank(0);
        }
    }

    function updateSourceDisplay(problem) {
        sourceDisplay.textContent = `${problem.source} (${problem.category})`;
    }

    function checkPuzzleCompletion() {
        const allFilled = problemBlanks.every(blank => blank.classList.contains('correct'));
        if (allFilled) {
            setTimeout(showSuccessModal, 500);
        }
    }

    function showSuccessModal() {
        const { sentence, source, translation } = currentProblem;
        document.querySelector('.original-sentence').textContent = sentence;
        document.querySelector('.modal .source').textContent = `Source: ${source}`;
        document.querySelector('.korean-translation').textContent = translation;
        successModal.style.display = 'flex';
    }

    // --- Helper & UI Functions (Most are unchanged) ---

    function handleKeyPress(key) {
        if (activeBlankIndex === -1 || !problemBlanks[activeBlankIndex]) return;

        const currentBlank = problemBlanks[activeBlankIndex];
        const correctChar = currentBlank.dataset.correctChar;

        if (key.toLowerCase() === correctChar) {
            currentBlank.textContent = key.toUpperCase();
            currentBlank.classList.add('correct');
            currentBlank.classList.remove('active');
            correctlyFilledBlankChars.set(correctChar, (correctlyFilledBlankChars.get(correctChar) || 0) + 1);
            
            updateKeyboardState();
            updateHintVisibility();

            const nextBlankIndex = problemBlanks.findIndex(b => !b.classList.contains('correct'));
            if (nextBlankIndex !== -1) {
                setActiveBlank(nextBlankIndex);
            } else {
                checkPuzzleCompletion();
            }
        } else {
            currentBlank.classList.add('incorrect');
            lives--;
            updateLivesDisplay();
            setTimeout(() => {
                currentBlank.classList.remove('incorrect');
                if (lives <= 0) {
                    alert('Game Over! Try again.');
                    initializeGame();
                }
            }, 500);
        }
    }

    function updateLivesDisplay() {
        livesDisplay.innerHTML = Array(5).fill(0).map((_, i) => 
            `<span class="heart-icon ${i >= lives ? 'lost' : ''}">♥</span>`
        ).join('');
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
            const parentGroup = problemBlanks[activeBlankIndex].closest('.word-group');
            document.querySelectorAll('.word-group.has-active-blank').forEach(g => g.classList.remove('has-active-blank'));
            if(parentGroup) parentGroup.classList.add('has-active-blank');
        }
    }

    function createKeyboard() {
        keyboardArea.innerHTML = '';
        keyboardLayout.forEach((row, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('keyboard-row');
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
            if (rowIndex === keyboardLayout.length - 1) {
                const nextBtn = document.createElement('button');
                nextBtn.classList.add('blank-nav-btn');
                nextBtn.innerHTML = '▶';
                nextBtn.addEventListener('click', () => navigateBlank(1));
                rowDiv.appendChild(nextBtn);
            }
            keyboardArea.appendChild(rowDiv);
        });
    }

    function updateKeyboardState() {
        keyboardLayout.flat().forEach(keyChar => {
            const keyDiv = keyboardArea.querySelector(`[data-key="${keyChar}"]`);
            if (!keyDiv) return;
            const totalRequired = requiredBlankChars.get(keyChar) || 0;
            const currentFilled = correctlyFilledBlankChars.get(keyChar) || 0;
            const isDisabled = usedCharsInProblem.has(keyChar) || (totalRequired > 0 && currentFilled >= totalRequired);
            keyDiv.classList.toggle('disabled', isDisabled);
            keyDiv.style.pointerEvents = isDisabled ? 'none' : 'auto';
        });
    }
    
    function updateHintVisibility() {
        document.querySelectorAll('.hint-number[data-char]').forEach(hintSpan => {
            const char = hintSpan.dataset.char;
            const totalRequired = requiredBlankChars.get(char) || 0;
            const currentFilled = correctlyFilledBlankChars.get(char) || 0;
            hintSpan.style.visibility = (currentFilled >= totalRequired) ? 'hidden' : 'visible';
        });
    }

    // --- Event Listeners & Initialization ---

    newQuizBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
        initializeGame();
    });

    listenBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(currentSentence);
            utterance.lang = 'en-US';
            speechSynthesis.speak(utterance);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            handleKeyPress(e.key);
        } else if (e.key === 'ArrowLeft') {
            navigateBlank(-1);
        } else if (e.key === 'ArrowRight') {
            navigateBlank(1);
        }
    });
    
    initializeGame();
});