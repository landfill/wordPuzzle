import ContentGenerator from './content-generator.js';
import CONTENT_DATABASE from './content-database.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements ---
    const problemArea = document.querySelector('.problem-area');
    const keyboardArea = document.querySelector('.keyboard-area');
    const livesDisplay = document.querySelector('.lives-display');
    const sourceDisplay = document.querySelector('.source-display');
    const successModal = document.getElementById('success-modal');
    const gameOverModal = document.getElementById('game-over-modal');
    const newQuizBtn = document.getElementById('new-quiz-btn');
    const listenBtn = document.getElementById('listen-btn');
    const retryBtn = document.getElementById('retry-btn');

    // --- 2. Game State & Configuration ---
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
    let browserVoices = []; // For fallback

    const contentGenerator = new ContentGenerator();
    Object.keys(CONTENT_DATABASE).forEach(cat => {
        Object.keys(CONTENT_DATABASE[cat]).forEach(src => {
            contentGenerator.addContent(cat, src, CONTENT_DATABASE[cat][src]);
        });
    });

    const keyboardLayout = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];

    // --- 3. TTS & Highlight Functions ---

    /**
     * 기본 브라우저 TTS를 사용하는 백업(Fallback) 함수
     */
    function speakWithBrowserTTS() {
        console.warn("Fallback: Using browser's default TTS.");
        if ('speechSynthesis' in window && browserVoices.length > 0) {
            const utterance = new SpeechSynthesisUtterance(currentSentence);
            utterance.lang = 'en-US';
            speechSynthesis.speak(utterance);
        } else {
            alert("Your browser does not support the fallback Text-to-Speech feature.");
        }
    }

    /**
     * 메인 TTS 함수: AI 목소리를 먼저 시도하고, 실패하거나 스위치가 꺼져 있으면 기본 목소리로 전환
     */
    async function speakSentence() {
        const existingAudio = document.getElementById('tts-audio');
        if (isReading) {
            if (existingAudio) existingAudio.pause(); // onpause/onended 핸들러가 나머지를 정리
            speechSynthesis.cancel(); // 브라우저 TTS도 중지
            isReading = false;
            listenBtn.classList.remove('disabled');
            clearWordHighlights();
            return;
        }

        isReading = true;
        listenBtn.classList.add('disabled');
        const voiceOptions = { languageCode: 'en-US', name: 'en-US-Wavenet-D' }; // 고품질 남성 목소리

        try {
            // 1. Cloudflare 중계 서버에 AI 음성 요청
            const response = await fetch('/google-tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: currentSentence,
                    voice: voiceOptions,
                    pitch: 1.0,
                    speakingRate: 1.0,
                }),
            });

            // 2. 응답 확인 (스위치가 꺼져 있는지?)
            if (response.status === 403) {
                speakWithBrowserTTS();
                isReading = false;
                listenBtn.classList.remove('disabled');
                return;
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server responded with ${response.status}`);
            }

            const data = await response.json();
            const { audioContent, timepoints } = data;
            if (!audioContent || !timepoints) {
                throw new Error("Invalid data received from TTS server.");
            }

            // 3. AI 목소리(mp3) 재생 및 하이라이트
            const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.id = 'tts-audio';
            document.body.appendChild(audio);
            audio.play();

            let highlightInterval;
            const cleanup = () => {
                clearInterval(highlightInterval);
                isReading = false;
                clearWordHighlights();
                listenBtn.classList.remove('disabled');
                if (audio) {
                    audio.remove();
                    URL.revokeObjectURL(audioUrl);
                }
            };

            let wordIndex = 0;
            highlightInterval = setInterval(() => {
                if (audio.paused || audio.ended) {
                    cleanup();
                    return;
                }
                const currentTime = audio.currentTime;
                if (wordIndex < timepoints.length && currentTime >= timepoints[wordIndex].timeSeconds) {
                    highlightModalWord(wordIndex);
                    wordIndex++;
                }
            }, 50);

            audio.onended = cleanup;
            audio.onpause = cleanup;

        } catch (error) {
            console.error('Could not use Google TTS. Reason:', error.message);
            alert(`AI 음성 재생에 실패했습니다: ${error.message}\n기본 음성으로 대체합니다.`);
            speakWithBrowserTTS();
            isReading = false;
            listenBtn.classList.remove('disabled');
        }
    }
    
    // --- 4. Core Game Logic ---
    
    function initializeGame() {
        lives = 5;
        updateLivesDisplay();
        currentProblem = contentGenerator.generateRandomProblem();
        currentSentence = currentProblem.sentence;
        
        // Reset state for the new game
        activeBlankIndex = -1;
        problemBlanks = [];
        usedCharsInProblem.clear();
        requiredBlankChars.clear();
        correctlyFilledBlankChars.clear();
        charToHintNumber.clear();
        
        // Stop any ongoing TTS from the previous game
        if (isReading) {
            const audio = document.getElementById('tts-audio');
            if (audio) audio.pause();
            speechSynthesis.cancel();
        }

        loadProblem(currentProblem);
        updateSourceDisplay(currentProblem);
        if (keyboardArea.childElementCount === 0) createKeyboard();
        updateKeyboardState();
        updateHintVisibility();
    }

    function handleKeyPress(key) {
        if (activeBlankIndex === -1 || !problemBlanks[activeBlankIndex]) return;

        const blank = problemBlanks[activeBlankIndex];
        const char = blank.dataset.correctChar;

        if (key.toLowerCase() === char) {
            blank.textContent = key.toUpperCase();
            blank.classList.add('correct');
            blank.classList.remove('active');
            correctlyFilledBlankChars.set(char, (correctlyFilledBlankChars.get(char) || 0) + 1);
            updateKeyboardState();
            updateHintVisibility();
            const nextIdx = problemBlanks.findIndex(b => !b.classList.contains('correct'));
            if (nextIdx !== -1) {
                setActiveBlank(nextIdx);
            } else {
                checkPuzzleCompletion();
            }
        } else {
            blank.classList.add('incorrect');
            lives--;
            updateLivesDisplay();
            setTimeout(() => {
                blank.classList.remove('incorrect');
                if (lives <= 0) gameOverModal.style.display = 'flex';
            }, 500);
        }
    }

    function checkPuzzleCompletion() {
        if (problemBlanks.every(b => b.classList.contains('correct'))) {
            setTimeout(showSuccessModal, 500);
        }
    }

    // --- 5. UI Update & Helper Functions ---

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
    
    function highlightModalWord(idx) {
        clearWordHighlights();
        const wordEl = document.querySelectorAll('.modal-word')[idx];
        if (wordEl) wordEl.classList.add('reading-highlight');
    }

    function clearWordHighlights() {
        document.querySelectorAll('.modal-word.reading-highlight').forEach(w => w.classList.remove('reading-highlight'));
    }

    function loadProblem(problem) {
        problemArea.innerHTML = '';
        const words = problem.sentence.split(' ');
        
        const blankCharToHintMap = new Map();
        problem.blanks.forEach(b => {
            const c = b.char.toLowerCase();
            if (!blankCharToHintMap.has(c)) blankCharToHintMap.set(c, b.hintNum);
            requiredBlankChars.set(c, (requiredBlankChars.get(c) || 0) + 1);
        });

        for (let i = 0; i < problem.sentence.length; i++) {
            const c = problem.sentence[i].toLowerCase();
            if (c.match(/[a-z]/) && !problem.blanks.some(b => b.index === i)) {
                if (blankCharToHintMap.has(c)) {
                    charToHintNumber.set(c, blankCharToHintMap.get(c));
                } else {
                    usedCharsInProblem.add(c);
                }
            }
        }

        let charIndex = 0, blankCounter = 0;
        words.forEach(word => {
            const group = document.createElement('div');
            group.className = 'word-group';
            for (let i = 0; i < word.length; i++) {
                const char = word[i], curIdx = charIndex + i;
                const slot = document.createElement('div');
                slot.className = 'char-slot';
                const bInfo = problem.blanks.find(b => b.index === curIdx);
                if (bInfo) {
                    const bSpan = document.createElement('div');
                    bSpan.className = 'word-blank';
                    bSpan.dataset.correctChar = bInfo.char.toLowerCase();
                    bSpan.dataset.blankIndex = blankCounter++;
                    bSpan.onclick = () => setActiveBlank(parseInt(bSpan.dataset.blankIndex));
                    const hSpan = document.createElement('div');
                    hSpan.className = 'hint-number';
                    hSpan.textContent = bInfo.hintNum;
                    slot.append(bSpan, hSpan);
                    problemBlanks.push(bSpan);
                } else {
                    const cSpan = document.createElement('div'), hSpan = document.createElement('div');
                    hSpan.className = 'hint-number';
                    cSpan.className = 'fixed-char-text';
                    if (char.match(/[a-zA-Z]/)) {
                        cSpan.textContent = char.toUpperCase();
                        const lc = char.toLowerCase();
                        if (charToHintNumber.has(lc)) {
                            hSpan.textContent = charToHintNumber.get(lc);
                            hSpan.dataset.char = lc;
                        } else {
                            hSpan.style.visibility = 'hidden';
                        }
                    } else {
                        cSpan.textContent = char;
                        hSpan.style.visibility = 'hidden';
                    }
                    slot.append(cSpan, hSpan);
                }
                group.appendChild(slot);
            }
            problemArea.appendChild(group);
            charIndex += word.length + 1;
        });

        if (problemBlanks.length > 0) setActiveBlank(0);
    }
    
    function updateSourceDisplay(p) { sourceDisplay.textContent = `${p.source} (${p.category})`; }
    
    function updateLivesDisplay() { livesDisplay.innerHTML = Array(5).fill(0).map((_, i) => `<span class="heart-icon ${i >= lives ? 'lost' : ''}">♥</span>`).join(''); }
    
    function navigateBlank(dir) {
        if (problemBlanks.length === 0) return;
        activeBlankIndex = (activeBlankIndex + dir + problemBlanks.length) % problemBlanks.length;
        setActiveBlank(activeBlankIndex);
    }
    
    function setActiveBlank(idx) {
        if (activeBlankIndex !== -1 && problemBlanks[activeBlankIndex]) {
            problemBlanks[activeBlankIndex].classList.remove('active');
        }
        activeBlankIndex = idx;
        if (problemBlanks[activeBlankIndex]) {
            problemBlanks[activeBlankIndex].classList.add('active');
            document.querySelectorAll('.word-group.has-active-blank').forEach(g => g.classList.remove('has-active-blank'));
            problemBlanks[activeBlankIndex].closest('.word-group')?.classList.add('has-active-blank');
        }
    }
    
    function createKeyboard() {
        keyboardArea.innerHTML = '';
        keyboardLayout.forEach((row, rIdx) => {
            const rDiv = document.createElement('div');
            rDiv.className = 'keyboard-row';
            if (rIdx === keyboardLayout.length - 1) {
                const pBtn = document.createElement('button');
                pBtn.className = 'blank-nav-btn';
                pBtn.innerHTML = '◀';
                pBtn.onclick = () => navigateBlank(-1);
                rDiv.appendChild(pBtn);
            }
            row.forEach(k => {
                const kDiv = document.createElement('div');
                kDiv.className = 'key';
                kDiv.textContent = k.toUpperCase();
                kDiv.dataset.key = k;
                kDiv.onclick = () => handleKeyPress(k);
                rDiv.appendChild(kDiv);
            });
            if (rIdx === keyboardLayout.length - 1) {
                const nBtn = document.createElement('button');
                nBtn.className = 'blank-nav-btn';
                nBtn.innerHTML = '▶';
                nBtn.onclick = () => navigateBlank(1);
                rDiv.appendChild(nBtn);
            }
            keyboardArea.appendChild(rDiv);
        });
    }
    
    function updateKeyboardState() {
        keyboardLayout.flat().forEach(k => {
            const el = keyboardArea.querySelector(`[data-key="${k}"]`);
            if (!el) return;
            const req = requiredBlankChars.get(k) || 0, fill = correctlyFilledBlankChars.get(k) || 0;
            const dis = usedCharsInProblem.has(k) || (req > 0 && fill >= req);
            el.classList.toggle('disabled', dis);
            el.style.pointerEvents = dis ? 'none' : 'auto';
        });
    }
    
    function updateHintVisibility() {
        document.querySelectorAll('.hint-number[data-char]').forEach(s => {
            const c = s.dataset.char, req = requiredBlankChars.get(c) || 0, fill = correctlyFilledBlankChars.get(c) || 0;
            s.style.visibility = fill >= req ? 'hidden' : 'visible';
        });
    }

    // --- 6. Event Listeners & Initialization ---

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
        if (successModal.style.display === 'flex' || gameOverModal.style.display === 'flex') return;
        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            handleKeyPress(e.key);
        } else if (e.key === 'ArrowLeft') {
            navigateBlank(-1);
        } else if (e.key === 'ArrowRight') {
            navigateBlank(1);
        }
    });

    // Load browser voices for fallback
    if ('speechSynthesis' in window) {
        const loadBrowserVoices = () => {
            browserVoices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en-'));
        };
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = loadBrowserVoices;
        } else {
            loadBrowserVoices();
        }
    }
    
    initializeGame();
});