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
    let lives = 5, currentProblem, activeBlankIndex = -1, problemBlanks = [], usedCharsInProblem = new Set(), requiredBlankChars = new Map(), correctlyFilledBlankChars = new Map(), charToHintNumber = new Map(), currentSentence = '', isReading = false, availableVoices = [], voiceToggle = false;

    // --- Content Generation ---
    const contentGenerator = new ContentGenerator();
    Object.keys(CONTENT_DATABASE).forEach(cat => { Object.keys(CONTENT_DATABASE[cat]).forEach(src => contentGenerator.addContent(cat, src, CONTENT_DATABASE[cat][src])); });
    const keyboardLayout = [ ['q','w','e','r','t','y','u','i','o','p'], ['a','s','d','f','g','h','j','k','l'], ['z','x','c','v','b','n','m'] ];
    
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
        if (isReading) { isReading = false; speechSynthesis.cancel(); }
        loadProblem(currentProblem);
        updateSourceDisplay(currentProblem);
        if (keyboardArea.childElementCount === 0) createKeyboard();
        updateKeyboardState();
        updateHintVisibility();
    }

    function handleKeyPress(key) {
        if (activeBlankIndex === -1 || !problemBlanks[activeBlankIndex]) return;
        const blank = problemBlanks[activeBlankIndex], char = blank.dataset.correctChar;
        if (key.toLowerCase() === char) {
            blank.textContent = key.toUpperCase();
            blank.classList.add('correct');
            blank.classList.remove('active');
            correctlyFilledBlankChars.set(char, (correctlyFilledBlankChars.get(char) || 0) + 1);
            updateKeyboardState();
            updateHintVisibility();
            const nextIdx = problemBlanks.findIndex(b => !b.classList.contains('correct'));
            nextIdx !== -1 ? setActiveBlank(nextIdx) : checkPuzzleCompletion();
        } else {
            blank.classList.add('incorrect');
            lives--;
            updateLivesDisplay();
            setTimeout(() => { blank.classList.remove('incorrect'); if (lives <= 0) gameOverModal.style.display = 'flex'; }, 500);
        }
    }

    function checkPuzzleCompletion() { if (problemBlanks.every(b => b.classList.contains('correct'))) setTimeout(showSuccessModal, 500); }
    
    function showSuccessModal() {
        const { sentence, source, translation, category } = currentProblem;
        createHighlightableSentence(document.querySelector('.original-sentence'), sentence);
        document.querySelector('#success-modal .source').textContent = `출처: ${source} (${category})`;
        document.querySelector('.korean-translation').textContent = translation;
        successModal.style.display = 'flex';
    }
    
    function createHighlightableSentence(container, sentence) {
        container.innerHTML = '';
        sentence.split(/(\s+)/).forEach(word => {
            if (word.trim().length > 0) {
                const span = document.createElement('span');
                span.className = 'modal-word';
                span.textContent = word;
                container.appendChild(span);
            } else {
                container.appendChild(document.createTextNode(word));
            }
        });
    }

    // --- NEW: Intelligent Voice Selection & TTS ---

    function loadVoices() {
        availableVoices = speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('en-'));
        console.log("Available English voices:", availableVoices.map(v => v.name));
    }

    /**
     * Finds the best available voice based on gender preference.
     * @param {boolean} isFemale - True to prefer a female voice, false for male.
     * @returns {SpeechSynthesisVoice|null} The best voice found or null.
     */
    function selectBestVoice(isFemale) {
        if (!availableVoices || availableVoices.length === 0) return null;

        const target = isFemale ? 'female' : 'male';
        const opposite = isFemale ? 'male' : 'female';
        const preferredNames = isFemale 
            ? ['samantha', 'zira', 'susan', 'karen', 'victoria', 'ava', 'jenny', 'aria'] 
            : ['david', 'alex', 'daniel', 'tom', 'aaron'];

        // 1. Find by gender keyword
        let voice = availableVoices.find(v => v.name.toLowerCase().includes(target));
        if (voice) return voice;

        // 2. Find by preferred name
        voice = availableVoices.find(v => preferredNames.some(name => v.name.toLowerCase().includes(name)));
        if (voice) return voice;
        
        // 3. Find by avoiding the opposite gender
        voice = availableVoices.find(v => !v.name.toLowerCase().includes(opposite));
        if (voice) return voice;

        // 4. Fallback to the first available voice
        return availableVoices[0];
    }

    function speakSentence() {
        if (isReading) {
            speechSynthesis.cancel();
            isReading = false;
            clearWordHighlights();
            return;
        }
        
        if ('speechSynthesis' in window && availableVoices.length > 0) {
            isReading = true;
            const utterance = new SpeechSynthesisUtterance(currentSentence);
            utterance.lang = 'en-US';
            voiceToggle = !voiceToggle; // Alternate between male/female preference
            
            const bestVoice = selectBestVoice(voiceToggle);
            if (bestVoice) {
                utterance.voice = bestVoice;
                console.log(`Using voice: ${bestVoice.name}`);
            }

            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    const words = Array.from(document.querySelectorAll('.modal-word'));
                    let charCount = 0;
                    for (let i = 0; i < words.length; i++) {
                        charCount += words[i].textContent.length;
                        if (event.charIndex < charCount) {
                            highlightModalWord(i);
                            break;
                        }
                        charCount++; // Account for space
                    }
                }
            };
            
            utterance.onend = utterance.onerror = () => {
                clearWordHighlights();
                isReading = false;
            };

            speechSynthesis.speak(utterance);
        }
    }
    
    function highlightModalWord(idx) { clearWordHighlights(); document.querySelectorAll('.modal-word')[idx]?.classList.add('reading-highlight'); }
    function clearWordHighlights() { document.querySelectorAll('.modal-word.reading-highlight').forEach(w => w.classList.remove('reading-highlight')); }

    // --- Event Listeners & Initialization ---
    newQuizBtn.addEventListener('click', () => { successModal.style.display = 'none'; initializeGame(); });
    retryBtn.addEventListener('click', () => { gameOverModal.style.display = 'none'; initializeGame(); });
    listenBtn.addEventListener('click', speakSentence);
    document.addEventListener('keydown', (e) => { if (successModal.style.display === 'flex' || gameOverModal.style.display === 'flex') return; if (e.key.length === 1 && e.key.match(/[a-z]/i)) handleKeyPress(e.key); else if (e.key === 'ArrowLeft') navigateBlank(-1); else if (e.key === 'ArrowRight') navigateBlank(1); });
    if ('speechSynthesis' in window) { (speechSynthesis.onvoiceschanged = loadVoices)(); }
    initializeGame();

    // --- Other Helper Functions ---
    function loadProblem(problem) {
        problemArea.innerHTML = ''; const words = problem.sentence.split(' ');
        const blankCharToHintMap = new Map();
        problem.blanks.forEach(b => { const c = b.char.toLowerCase(); if (!blankCharToHintMap.has(c)) blankCharToHintMap.set(c, b.hintNum); requiredBlankChars.set(c, (requiredBlankChars.get(c) || 0) + 1); });
        for (let i = 0; i < problem.sentence.length; i++) { const c = problem.sentence[i].toLowerCase(); if (c.match(/[a-z]/) && !problem.blanks.some(b => b.index === i)) { blankCharToHintMap.has(c) ? charToHintNumber.set(c, blankCharToHintMap.get(c)) : usedCharsInProblem.add(c); } }
        let charIndex = 0, blankCounter = 0;
        words.forEach(word => { const group = document.createElement('div'); group.className = 'word-group'; for (let i = 0; i < word.length; i++) { const char = word[i], curIdx = charIndex + i; const slot = document.createElement('div'); slot.className = 'char-slot'; const bInfo = problem.blanks.find(b => b.index === curIdx); if (bInfo) { const bSpan = document.createElement('div'); bSpan.className = 'word-blank'; bSpan.dataset.correctChar = bInfo.char.toLowerCase(); bSpan.dataset.blankIndex = blankCounter++; bSpan.onclick = () => setActiveBlank(parseInt(bSpan.dataset.blankIndex)); const hSpan = document.createElement('div'); hSpan.className = 'hint-number'; hSpan.textContent = bInfo.hintNum; slot.append(bSpan, hSpan); problemBlanks.push(bSpan); } else { const cSpan = document.createElement('div'), hSpan = document.createElement('div'); hSpan.className = 'hint-number'; cSpan.className = 'fixed-char-text'; if (char.match(/[a-zA-Z]/)) { cSpan.textContent = char.toUpperCase(); const lc = char.toLowerCase(); if (charToHintNumber.has(lc)) { hSpan.textContent = charToHintNumber.get(lc); hSpan.dataset.char = lc; } else { hSpan.style.visibility = 'hidden'; } } else { cSpan.textContent = char; hSpan.style.visibility = 'hidden'; } slot.append(cSpan, hSpan); } group.appendChild(slot); } problemArea.appendChild(group); charIndex += word.length + 1; });
        if (problemBlanks.length > 0) setActiveBlank(0);
    }
    function updateSourceDisplay(p) { sourceDisplay.textContent = `${p.source} (${p.category})`; }
    function updateLivesDisplay() { livesDisplay.innerHTML = Array(5).fill(0).map((_, i) => `<span class="heart-icon ${i >= lives ? 'lost' : ''}">♥</span>`).join(''); }
    function navigateBlank(dir) { if (problemBlanks.length === 0) return; activeBlankIndex = (activeBlankIndex + dir + problemBlanks.length) % problemBlanks.length; setActiveBlank(activeBlankIndex); }
    function setActiveBlank(idx) { if (activeBlankIndex !== -1 && problemBlanks[activeBlankIndex]) problemBlanks[activeBlankIndex].classList.remove('active'); activeBlankIndex = idx; if (problemBlanks[activeBlankIndex]) { problemBlanks[activeBlankIndex].classList.add('active'); document.querySelectorAll('.word-group.has-active-blank').forEach(g => g.classList.remove('has-active-blank')); problemBlanks[activeBlankIndex].closest('.word-group')?.classList.add('has-active-blank'); } }
    function createKeyboard() { keyboardArea.innerHTML = ''; keyboardLayout.forEach((row, rIdx) => { const rDiv = document.createElement('div'); rDiv.className = 'keyboard-row'; if (rIdx === keyboardLayout.length - 1) { const pBtn = document.createElement('button'); pBtn.className = 'blank-nav-btn'; pBtn.innerHTML = '◀'; pBtn.onclick = () => navigateBlank(-1); rDiv.appendChild(pBtn); } row.forEach(k => { const kDiv = document.createElement('div'); kDiv.className = 'key'; kDiv.textContent = k.toUpperCase(); kDiv.dataset.key = k; kDiv.onclick = () => handleKeyPress(k); rDiv.appendChild(kDiv); }); if (rIdx === keyboardLayout.length - 1) { const nBtn = document.createElement('button'); nBtn.className = 'blank-nav-btn'; nBtn.innerHTML = '▶'; nBtn.onclick = () => navigateBlank(1); rDiv.appendChild(nBtn); } keyboardArea.appendChild(rDiv); }); }
    function updateKeyboardState() { keyboardLayout.flat().forEach(k => { const el = keyboardArea.querySelector(`[data-key="${k}"]`); if (!el) return; const req = requiredBlankChars.get(k) || 0, fill = correctlyFilledBlankChars.get(k) || 0, dis = usedCharsInProblem.has(k) || (req > 0 && fill >= req); el.classList.toggle('disabled', dis); el.style.pointerEvents = dis ? 'none' : 'auto'; }); }
    function updateHintVisibility() { document.querySelectorAll('.hint-number[data-char]').forEach(s => { const c = s.dataset.char, req = requiredBlankChars.get(c) || 0, fill = correctlyFilledBlankChars.get(c) || 0; s.style.visibility = fill >= req ? 'hidden' : 'visible'; }); }
});
