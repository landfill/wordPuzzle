import ContentGenerator from './content-generator.js';
import CONTENT_DATABASE from './content-database.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements ---
    const categorySelectionScreen = document.getElementById('category-selection-screen');
    const gameScreen = document.getElementById('game-screen');
    const categoryCards = document.querySelectorAll('.category-card');
    const homeBtn = document.getElementById('home-btn');

    const problemArea = document.querySelector('.problem-area');
    const keyboardArea = document.querySelector('.keyboard-area');
    const livesDisplay = document.querySelector('.lives-display');
    const sourceDisplay = document.querySelector('.source-display'); // 원래대로 되돌림
    const successModal = document.getElementById('success-modal');
    const gameOverModal = document.getElementById('game-over-modal');
    const newQuizBtn = document.getElementById('new-quiz-btn');
    const listenBtn = document.getElementById('listen-btn');
    const retryBtn = document.getElementById('retry-btn');

    // 이하 코드는 이전 버전과 동일하게 유지...
    // (이하 코드 생략)
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
    let browserVoices = [];
    let selectedCategory = 'all';
    let isAudioContextUnlocked = false; // ADDED: 오디오 컨텍스트 잠금 해제 상태 추적

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
    
    function showCategoryScreen() {
        gameScreen.style.display = 'none';
        categorySelectionScreen.style.display = 'flex';
        stopAllSounds();
    }
    
    function showGameScreen() {
        categorySelectionScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
    }

    function startGame(category) {
        selectedCategory = category;
        showGameScreen();
        initializeGame();
    }
    
    function stopAllSounds() {
        if (isReading) {
            const audio = document.getElementById('tts-audio');
            if (audio) {
                audio.pause();
                audio.remove();
            }
            speechSynthesis.cancel();
            isReading = false;
            listenBtn.classList.remove('disabled');
        }
    }

    function speakWithBrowserTTS() {
        console.warn("Fallback: Using browser's default TTS.");
        if ('speechSynthesis' in window && browserVoices.length > 0) {
            const utterance = new SpeechSynthesisUtterance(currentSentence);
            utterance.lang = 'en-US';
            speechSynthesis.speak(utterance);
        }
    }
    
    async function speakSentence() {
        // ADDED: 오디오 컨텍스트 잠금 해제 로직
        if (!isAudioContextUnlocked) {
            const silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGliAv4/GgAgbG93LXBhc3SA/xxwAAA=");
            try {
                await silentAudio.play();
                isAudioContextUnlocked = true;
                console.log("Audio context unlocked on mobile.");
            } catch (e) {
                console.error("Audio context unlock failed", e);
                // 실패하더라도 일단 진행. 다음 시도에서 성공할 수 있음.
            }
        }        
        stopAllSounds();

        isReading = true;
        listenBtn.classList.add('disabled');
        const voiceOptions = { languageCode: 'en-US', name: 'en-US-Wavenet-B' };

        try {
            const response = await fetch('/google-tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: currentSentence, voice: voiceOptions, pitch: 1.0, speakingRate: 1.0 }),
            });

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

            if (!audioContent || !timepoints || timepoints.length === 0) {
                throw new Error("Invalid data (no audio or timepoints) received from TTS server.");
            }

            const wordTimepoints = timepoints
                .filter(t => !isNaN(parseInt(t.markName, 10)))
                .sort((a, b) => parseInt(a.markName, 10) - parseInt(b.markName, 10));

            const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.id = 'tts-audio';
            document.body.appendChild(audio);

            let nextHighlightIndex = 0; 
            const timeUpdateHandler = () => {
                const currentTime = audio.currentTime;
                // 'while'을 'if'로 변경하여 한 번의 timeupdate 이벤트에서 하나의 단어만 처리하도록 수정
                if (
                    nextHighlightIndex < wordTimepoints.length &&
                    currentTime >= wordTimepoints[nextHighlightIndex].timeSeconds
                ) {
                    highlightModalWord(nextHighlightIndex);
                    nextHighlightIndex++;
                }
            };

            const cleanup = (isEnded = false) => {
                if (isEnded && wordTimepoints.length > 0) {
                    highlightModalWord(wordTimepoints.length - 1);
                }
                
                audio.removeEventListener('timeupdate', timeUpdateHandler);
                isReading = false;
                listenBtn.classList.remove('disabled');

                setTimeout(() => {
                    clearWordHighlights();
                    if (audio) {
                        audio.remove();
                        URL.revokeObjectURL(audioUrl);
                    }
                }, 500);
            };

            audio.addEventListener('timeupdate', timeUpdateHandler);
            audio.addEventListener('ended', () => cleanup(true));
            audio.addEventListener('pause', () => cleanup(false));

            audio.play().catch(e => {
                console.error("Audio playback failed:", e);
                cleanup(false);
            });

        } catch (error) {
            console.error('Could not use Google TTS. Reason:', error.message);
            alert(`AI 음성 재생에 실패했습니다. 기본 음성으로 대체합니다.`);
            speakWithBrowserTTS();
            isReading = false;
            listenBtn.classList.remove('disabled');
        }
    }
    
    function initializeGame() {
        lives = 5;
        updateLivesDisplay();
        currentProblem = contentGenerator.generateRandomProblem(selectedCategory);
        
        if (!currentProblem) {
            alert("선택한 카테고리의 문제를 모두 풀었습니다! 다른 카테고리를 선택해주세요.");
            showCategoryScreen();
            return;
        }

        currentSentence = currentProblem.sentence;
        
        activeBlankIndex = -1;
        problemBlanks = [];
        usedCharsInProblem.clear();
        requiredBlankChars.clear();
        correctlyFilledBlankChars.clear();
        charToHintNumber.clear();
        
        stopAllSounds();

        loadProblem(currentProblem);
        updateSourceDisplay(currentProblem);
        if (keyboardArea.childElementCount === 0) {
            createKeyboard();
        }
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
            
            let nextIdx = -1;
            const totalBlanks = problemBlanks.length;
            for (let i = 1; i <= totalBlanks; i++) {
                const checkIndex = (activeBlankIndex + i) % totalBlanks;
                if (!problemBlanks[checkIndex].classList.contains('correct')) {
                    nextIdx = checkIndex;
                    break;
                }
            }

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
                if (lives <= 0) {
                    gameOverModal.style.display = 'flex';
                }
            }, 500);
        }
    }

    function checkPuzzleCompletion() {
        if (problemBlanks.every(b => b.classList.contains('correct'))) {
            setTimeout(showSuccessModal, 500);
        }
    }

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
        if (wordEl) {
            wordEl.classList.add('reading-highlight');
        }
    }

    function clearWordHighlights() {
        document.querySelectorAll('.modal-word.reading-highlight').forEach(w => {
            w.classList.remove('reading-highlight');
        });
    }

    function loadProblem(problem) {
        problemArea.innerHTML = '';
        const words = problem.sentence.split(' ');
        
        const blankCharToHintMap = new Map();
        problem.blanks.forEach(b => {
            const c = b.char.toLowerCase();
            if (!blankCharToHintMap.has(c)) {
                blankCharToHintMap.set(c, b.hintNum);
            }
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

        let charIndex = 0;
        let blankCounter = 0;
        words.forEach(word => {
            const group = document.createElement('div');
            group.className = 'word-group';
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const curIdx = charIndex + i;
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
                    const cSpan = document.createElement('div');
                    const hSpan = document.createElement('div');
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

        if (problemBlanks.length > 0) {
            setActiveBlank(0);
        }
    }
    
    function updateSourceDisplay(p) {
        sourceDisplay.textContent = `${p.source} (${p.category})`; // 원래대로 되돌림
    }
    
    function updateLivesDisplay() {
        livesDisplay.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const bar = document.createElement('div');
            bar.classList.add('life-bar');
            if (i >= lives) {
                bar.classList.add('lost');
            }
            livesDisplay.appendChild(bar);
        }
    }
    
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
            const req = requiredBlankChars.get(k) || 0;
            const fill = correctlyFilledBlankChars.get(k) || 0;
            const dis = usedCharsInProblem.has(k) || (req > 0 && fill >= req);
            el.classList.toggle('disabled', dis);
            el.style.pointerEvents = dis ? 'none' : 'auto';
        });
    }
    
    function updateHintVisibility() {
        document.querySelectorAll('.hint-number[data-char]').forEach(s => {
            const c = s.dataset.char;
            const req = requiredBlankChars.get(c) || 0;
            const fill = correctlyFilledBlankChars.get(c) || 0;
            s.style.visibility = fill >= req ? 'hidden' : 'visible';
        });
    }

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            startGame(category);
        });
    });

    homeBtn.addEventListener('click', showCategoryScreen);

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
        if (gameScreen.style.display === 'none' || successModal.style.display === 'flex' || gameOverModal.style.display === 'flex') {
            return;
        }
        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            handleKeyPress(e.key);
        } else if (e.key === 'ArrowLeft') {
            navigateBlank(-1);
        } else if (e.key === 'ArrowRight') {
            navigateBlank(1);
        }
    });

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
    
    showCategoryScreen();
});