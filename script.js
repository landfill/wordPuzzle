import ContentGenerator from './content-generator.js';
import CONTENT_DATABASE from './content-database.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const problemArea = document.querySelector('.problem-area');
    const keyboardArea = document.querySelector('.keyboard-area');
    const livesDisplay = document.querySelector('.lives-display');
    const sourceDisplay = document.querySelector('.source-display');
    const successModal = document.getElementById('success-modal');
    const gameOverModal = document.getElementById('game-over-modal');
    const newQuizBtn = document.getElementById('new-quiz-btn');
    const listenBtn = document.getElementById('listen-btn');
    const retryBtn = document.getElementById('retry-btn');

    // --- Game & TTS State ---
    let lives = 5;
    let currentProblem;
    let activeBlankIndex = -1;
    let problemBlanks = [];
    let usedCharsInProblem = new Set();
    let requiredBlankChars = new Map();
    let correctlyFilledBlankChars = new Map();
    let charToHintNumber = new Map();
    let currentSentence = '';
    let isReading = false;
    let availableVoices = [];
    let voiceToggle = false;

    // --- Content Generation ---
    const contentGenerator = new ContentGenerator();
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
    
    function initializeGame() {
        lives = 5;
        updateLivesDisplay();
        currentProblem = contentGenerator.generateRandomProblem();
        currentSentence = currentProblem.sentence;
        
        activeBlankIndex = -1;
        problemBlanks = [];
        usedCharsInProblem.clear();
        requiredBlankChars.clear();
        correctlyFilledBlankChars.clear();
        charToHintNumber.clear();
        isReading = false;
        
        if (isReading) speechSynthesis.cancel();

        loadProblem(currentProblem);
        updateSourceDisplay(currentProblem);
        if (keyboardArea.childElementCount === 0) createKeyboard();
        updateKeyboardState();
        updateHintVisibility();
    }

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
                    gameOverModal.style.display = 'flex';
                }
            }, 500);
        }
    }

    function checkPuzzleCompletion() {
        if (problemBlanks.every(blank => blank.classList.contains('correct'))) {
            setTimeout(showSuccessModal, 500);
        }
    }
    
    function showSuccessModal() {
        const { sentence, source, translation, category } = currentProblem;
        const originalSentenceEl = document.querySelector('.original-sentence');
        
        createHighlightableSentence(originalSentenceEl, sentence); 
        
        document.querySelector('#success-modal .source').textContent = `출처: ${source} (${category})`;
        document.querySelector('.korean-translation').textContent = translation;
        successModal.style.display = 'flex';
    }

    function createHighlightableSentence(container, sentence) {
        container.innerHTML = '';
        const words = sentence.split(' ');
        words.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.classList.add('modal-word');
            wordSpan.dataset.wordIndex = index;
            wordSpan.textContent = word;
            container.appendChild(wordSpan);
            if (index < words.length - 1) container.appendChild(document.createTextNode(' '));
        });
    }

    // --- TTS Functions (Restored & Improved) ---
    function loadVoices() {
        availableVoices = speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('en-'));
    }

    function speakSentence() {
        if (isReading) {
            speechSynthesis.cancel();
            return;
        }
        
        if ('speechSynthesis' in window && availableVoices.length > 0) {
            isReading = true;
            const utterance = new SpeechSynthesisUtterance(currentSentence);
            utterance.lang = 'en-US';
            voiceToggle = !voiceToggle;
            utterance.voice = voiceToggle && availableVoices[1] ? availableVoices[1] : availableVoices[0];

            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    const words = currentSentence.split(' ');
                    let charCount = 0;
                    for (let i = 0; i < words.length; i++) {
                        charCount += words[i].length + 1;
                        if (event.charIndex < charCount) {
                            highlightModalWord(i);
                            break;
                        }
                    }
                }
            };
            
            utterance.onend = () => {
                clearWordHighlights();
                isReading = false;
            };

            utterance.onerror = (e) => {
                console.error("TTS Error:", e);
                clearWordHighlights();
                isReading = false;
            };

            speechSynthesis.speak(utterance);
        }
    }
    
    function highlightModalWord(wordIndex) {
        clearWordHighlights();
        const modalWords = document.querySelectorAll('.modal-word');
        if (wordIndex < modalWords.length) {
            modalWords[wordIndex].classList.add('reading-highlight');
        }
    }

    function clearWordHighlights() {
        document.querySelectorAll('.modal-word.reading-highlight').forEach(word => {
            word.classList.remove('reading-highlight');
        });
    }

    // --- Event Listeners & Initialization ---
    newQuizBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
        initializeGame();
    });
    
    retryBtn.addEventListener('click', () => {
        gameOverModal.style.display = 'none';
        initializeGame();
    });

    listenBtn.addEventListener('click', speakSentence);

    document.addEventListener('keydown', (e) => {
        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            handleKeyPress(e.key);
        } else if (e.key === 'ArrowLeft') {
            navigateBlank(-1);
        } else if (e.key === 'ArrowRight') {
            navigateBlank(1);
        }
    });
    
    if ('speechSynthesis' in window) {
        speechSynthesis.getVoices().length === 0 ? (speechSynthesis.onvoiceschanged = loadVoices) : loadVoices();
    }
    
    initializeGame();
    
    // --- (The rest of the helper functions) ---
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

        const blankCharToHintMap = new Map();
        problem.blanks.forEach(blank => {
            const char = blank.char.toLowerCase();
            if (!blankCharToHintMap.has(char)) blankCharToHintMap.set(char, blank.hintNum);
            requiredBlankChars.set(char, (requiredBlankChars.get(char) || 0) + 1);
        });

        for (let i = 0; i < problem.sentence.length; i++) {
            const char = problem.sentence[i].toLowerCase();
            if (char.match(/[a-z]/)) {
                if (!problem.blanks.some(b => b.index === i)) {
                    blankCharToHintMap.has(char) ? charToHintNumber.set(char, blankCharToHintMap.get(char)) : usedCharsInProblem.add(char);
                }
            }
        }
        
        let charIndex = 0;
        let blankCounter = 0;
        words.forEach(word => {
            const wordGroup = document.createElement('div');
            wordGroup.classList.add('word-group');
            for (let i = 0; i < word.length; i++) {
                const char = word[i], currentCharIndex = charIndex + i;
                const charSlot = document.createElement('div');
                charSlot.classList.add('char-slot');
                const blankInfo = problem.blanks.find(b => b.index === currentCharIndex);
                if (blankInfo) {
                    const blankSpan = document.createElement('div');
                    blankSpan.className = 'word-blank';
                    blankSpan.dataset.correctChar = blankInfo.char.toLowerCase();
                    blankSpan.dataset.blankIndex = blankCounter++;
                    blankSpan.addEventListener('click', () => setActiveBlank(parseInt(blankSpan.dataset.blankIndex)));
                    const hintSpan = document.createElement('div');
                    hintSpan.className = 'hint-number';
                    hintSpan.textContent = blankInfo.hintNum;
                    charSlot.append(blankSpan, hintSpan);
                    problemBlanks.push(blankSpan);
                } else {
                    const charSpan = document.createElement('div');
                    const hintSpan = document.createElement('div');
                    hintSpan.className = 'hint-number';
                    charSpan.className = 'fixed-char-text';
                    if (char.match(/[a-zA-Z]/)) {
                        charSpan.textContent = char.toUpperCase();
                        const lowerChar = char.toLowerCase();
                        if (charToHintNumber.has(lowerChar)) {
                            hintSpan.textContent = charToHintNumber.get(lowerChar);
                            hintSpan.dataset.char = lowerChar;
                        } else {
                            hintSpan.style.visibility = 'hidden';
                        }
                    } else {
                        charSpan.textContent = char;
                        hintSpan.style.visibility = 'hidden';
                    }
                    charSlot.append(charSpan, hintSpan);
                }
                wordGroup.appendChild(charSlot);
            }
            problemArea.appendChild(wordGroup);
            charIndex += word.length + 1;
        });
        if (problemBlanks.length > 0) setActiveBlank(0);
    }
    function updateSourceDisplay(problem) { sourceDisplay.textContent = `${problem.source} (${problem.category})`; }
    function updateLivesDisplay() { livesDisplay.innerHTML = Array(5).fill(0).map((_, i) => `<span class="heart-icon ${i >= lives ? 'lost' : ''}">♥</span>`).join(''); }
    function navigateBlank(dir) { if (problemBlanks.length === 0) return; activeBlankIndex = (activeBlankIndex + dir + problemBlanks.length) % problemBlanks.length; setActiveBlank(activeBlankIndex); }
    function setActiveBlank(index) { if (activeBlankIndex !== -1 && problemBlanks[activeBlankIndex]) problemBlanks[activeBlankIndex].classList.remove('active'); activeBlankIndex = index; if (problemBlanks[activeBlankIndex]) { problemBlanks[activeBlankIndex].classList.add('active'); document.querySelectorAll('.word-group.has-active-blank').forEach(g => g.classList.remove('has-active-blank')); problemBlanks[activeBlankIndex].closest('.word-group')?.classList.add('has-active-blank'); } }
    function createKeyboard() { keyboardArea.innerHTML = ''; keyboardLayout.forEach((row, rIdx) => { const rowDiv = document.createElement('div'); rowDiv.className = 'keyboard-row'; if (rIdx === keyboardLayout.length - 1) { const prevBtn = document.createElement('button'); prevBtn.className = 'blank-nav-btn'; prevBtn.innerHTML = '◀'; prevBtn.onclick = () => navigateBlank(-1); rowDiv.appendChild(prevBtn); } row.forEach(key => { const keyDiv = document.createElement('div'); keyDiv.className = 'key'; keyDiv.textContent = key.toUpperCase(); keyDiv.dataset.key = key; keyDiv.onclick = () => handleKeyPress(key); rowDiv.appendChild(keyDiv); }); if (rIdx === keyboardLayout.length - 1) { const nextBtn = document.createElement('button'); nextBtn.className = 'blank-nav-btn'; nextBtn.innerHTML = '▶'; nextBtn.onclick = () => navigateBlank(1); rowDiv.appendChild(nextBtn); } keyboardArea.appendChild(rowDiv); }); }
    function updateKeyboardState() { keyboardLayout.flat().forEach(key => { const keyDiv = keyboardArea.querySelector(`[data-key="${key}"]`); if (!keyDiv) return; const required = requiredBlankChars.get(key) || 0; const filled = correctlyFilledBlankChars.get(key) || 0; const disabled = usedCharsInProblem.has(key) || (required > 0 && filled >= required); keyDiv.classList.toggle('disabled', disabled); keyDiv.style.pointerEvents = disabled ? 'none' : 'auto'; }); }
    function updateHintVisibility() { document.querySelectorAll('.hint-number[data-char]').forEach(span => { const char = span.dataset.char; const required = requiredBlankChars.get(char) || 0; const filled = correctlyFilledBlankChars.get(char) || 0; span.style.visibility = filled >= required ? 'hidden' : 'visible'; }); }
});
