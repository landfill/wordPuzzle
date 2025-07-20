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
    const sourceDisplay = document.querySelector('.source-display');
    const successModal = document.getElementById('success-modal');
    const gameOverModal = document.getElementById('game-over-modal');
    const reviewBtn = document.getElementById('review-btn');
    const nextProblemBtn = document.getElementById('next-problem-btn');
    const listenBtn = document.getElementById('listen-btn');
    const retrySameBtn = document.getElementById('retry-same-btn');
    const retryNewBtn = document.getElementById('retry-new-btn');
    const goHomeBtn = document.getElementById('go-home-btn');

    // DOM 요소 확인
    console.log('DOM Elements Check:', {
        categoryCards: categoryCards.length,
        homeBtn: !!homeBtn,
        reviewBtn: !!reviewBtn,
        nextProblemBtn: !!nextProblemBtn,
        listenBtn: !!listenBtn,
        retrySameBtn: !!retrySameBtn,
        retryNewBtn: !!retryNewBtn,
        goHomeBtn: !!goHomeBtn
    });

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
    let isAudioContextUnlocked = false; // [추가] 모바일 오디오 재생을 위한 플래그
    let initialViewportHeight = window.innerHeight; // 모바일 가상 키보드 감지용
    let isReviewMode = false; // 검토 모드 상태
    let currentProblemNumber = 1; // 현재 문제 번호
    let totalProblemsInSession = 10; // 세션당 총 문제 수
    let hintsUsed = 0; // 현재 문제에서 사용한 힌트 수
    let maxHints = 3; // 문제당 최대 힌트 수
    let currentScore = 0; // 현재 문제 점수
    let baseScore = 100; // 기본 점수
    let hintPenalty = 20; // 힌트당 감점

    // 게임 상태 관리자
    const GameState = {
        CATEGORY_SELECTION: 'category_selection',
        PLAYING: 'playing',
        REVIEW: 'review',
        GAME_OVER: 'game_over',
        SUCCESS: 'success'
    };
    
    let currentGameState = GameState.CATEGORY_SELECTION;
    
    function changeGameState(newState) {
        const previousState = currentGameState;
        currentGameState = newState;
        
        console.log(`Game state changed: ${previousState} -> ${newState}`);
        
        // 상태 변경에 따른 UI 업데이트
        updateUIForState(newState);
    }
    
    function updateUIForState(state) {
        switch (state) {
            case GameState.CATEGORY_SELECTION:
                showCategoryScreen();
                break;
            case GameState.PLAYING:
                showGameScreen();
                if (isReviewMode) {
                    exitReviewMode();
                }
                break;
            case GameState.REVIEW:
                // 검토 모드는 별도 함수에서 처리
                break;
            case GameState.GAME_OVER:
                // 게임 오버 모달은 별도에서 표시
                break;
            case GameState.SUCCESS:
                // 성공 모달은 별도에서 표시
                break;
        }
    }

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
        console.log('Starting game with category:', category);
        selectedCategory = category;
        changeGameState(GameState.PLAYING);
        initializeProgress();
        initializeGame();
    }
    
    function stopAllSounds() {
        const existingAudio = document.getElementById('tts-audio');
        if (existingAudio) {
            existingAudio.pause();
            existingAudio.remove(); // DOM에서 완전히 제거
        }
        speechSynthesis.cancel();
        
        if (isReading) {
            isReading = false;
            listenBtn.classList.remove('disabled');
        }
    }

    function speakWithBrowserTTS() {
        console.warn("Fallback: Using browser's default TTS.");
        if ('speechSynthesis' in window && browserVoices.length > 0) {
            const utterance = new SpeechSynthesisUtterance(currentSentence);
            utterance.lang = 'en-US';
            
            // 브라우저 TTS에서도 기본적인 하이라이트 제공
            const words = currentSentence.split(' ');
            let currentWordIndex = 0;
            
            // 단어별 하이라이트를 위한 타이머 (대략적인 속도로 계산)
            const wordsPerSecond = 2.5; // 평균 읽기 속도
            const intervalTime = 1000 / wordsPerSecond;
            
            const highlightInterval = setInterval(() => {
                if (currentWordIndex < words.length) {
                    highlightModalWord(currentWordIndex);
                    currentWordIndex++;
                } else {
                    clearInterval(highlightInterval);
                }
            }, intervalTime);
            
            utterance.onend = () => {
                clearInterval(highlightInterval);
                setTimeout(() => {
                    clearWordHighlights();
                }, 500);
                isReading = false;
                listenBtn.classList.remove('disabled');
            };
            
            utterance.onerror = () => {
                clearInterval(highlightInterval);
                clearWordHighlights();
                isReading = false;
                listenBtn.classList.remove('disabled');
            };
            
            speechSynthesis.speak(utterance);
        } else {
            // TTS를 사용할 수 없는 경우에도 하이라이트만 제공
            provideFallbackHighlight();
        }
    }
    
    function provideFallbackHighlight() {
        console.warn("No TTS available, providing highlight-only experience.");
        const words = currentSentence.split(' ');
        let currentWordIndex = 0;
        
        const highlightInterval = setInterval(() => {
            if (currentWordIndex < words.length) {
                highlightModalWord(currentWordIndex);
                currentWordIndex++;
            } else {
                clearInterval(highlightInterval);
                setTimeout(() => {
                    clearWordHighlights();
                    isReading = false;
                    listenBtn.classList.remove('disabled');
                }, 500);
            }
        }, 800); // 조금 더 천천히 하이라이트
    }
    
    async function speakSentence() {
        // [수정 1] 모바일 오디오 잠금 해제 로직
        if (!isAudioContextUnlocked) {
            const silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGliAv4/GgAgbG93LXBhc3SA/xxwAAA=");
            try {
                await silentAudio.play();
                isAudioContextUnlocked = true;
                console.log("AudioContext unlocked for mobile.");
            } catch (e) {
                console.error("AudioContext unlock failed", e);
            }
        }
        
        stopAllSounds();

        isReading = true;
        listenBtn.classList.add('disabled');
        // [수정 2] 목소리를 main 브랜치와 동일한 남성 목소리로 변경
        const voiceOptions = { languageCode: 'en-US', name: 'en-US-Wavenet-D' }; 

        try {
            const response = await fetch('/google-tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: currentSentence, voice: voiceOptions, pitch: 1.0, speakingRate: 1.0 }),
            });
            
            if (response.status === 403) {
                console.log('TTS API access denied, using browser TTS with highlight');
                speakWithBrowserTTS();
                // isReading과 버튼 상태는 speakWithBrowserTTS에서 처리됨
                return;
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server responded with ${response.status}`);
            }

            const data = await response.json();
            const { audioContent, timepoints } = data;

            if (!audioContent || !timepoints) {
                throw new Error("Invalid data (no audio or timepoints) received.");
            }

            const wordTimepoints = timepoints;

            const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.id = 'tts-audio';
            document.body.appendChild(audio);

            let nextHighlightIndex = 0;
            const timeUpdateHandler = () => {
                const currentTime = audio.currentTime;
                
                // [수정 3] 하이라이트 로직을 'if'가 아닌 'while' 루프로 복원
                while (
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
                    // 오디오 객체를 확실히 제거
                    const el = document.getElementById('tts-audio');
                    if (el) el.remove();
                    URL.revokeObjectURL(audioUrl);
                }, 500);
            };

            audio.addEventListener('timeupdate', timeUpdateHandler);
            audio.addEventListener('ended', () => cleanup(true));
            audio.addEventListener('pause', () => cleanup(false));
            audio.addEventListener('error', (e) => {
                console.error("Audio playback error:", e);
                cleanup(false);
            });

            await audio.play();

        } catch (error) {
            console.error('TTS Process Failed:', error);
            console.log('Falling back to browser TTS with highlight');
            speakWithBrowserTTS();
            // isReading과 버튼 상태는 speakWithBrowserTTS에서 처리됨
        }
    }
    
    function initializeGame(keepCurrentProblem = false) {
        lives = 5;
        updateLivesDisplay();
        
        // 같은 문제 재시도가 아닌 경우에만 새 문제 생성
        if (!keepCurrentProblem) {
            currentProblem = contentGenerator.generateRandomProblem(selectedCategory);
            
            if (!currentProblem) {
                alert("선택한 카테고리의 문제를 모두 풀었거나 문제가 없습니다. 홈으로 돌아갑니다.");
                showCategoryScreen();
                return;
            }
            currentSentence = currentProblem.sentence;
        }
        
        activeBlankIndex = -1;
        problemBlanks = [];
        usedCharsInProblem.clear();
        requiredBlankChars.clear();
        correctlyFilledBlankChars.clear();
        charToHintNumber.clear();
        
        stopAllSounds();

        console.log('Loading problem:', currentProblem);
        loadProblem(currentProblem);
        updateSourceDisplay(currentProblem);
        
        console.log('Creating keyboard, keyboardArea:', keyboardArea);
        if (keyboardArea && keyboardArea.childElementCount === 0) {
            createKeyboard();
            console.log('Keyboard created');
        }
        
        console.log('Creating hint controls');
        createHintControls();
        resetHints();
        updateKeyboardState();
        updateHintVisibility();
    }
    
    function retrySameProblem() {
        gameOverModal.style.display = 'none';
        initializeGame(true); // 같은 문제 유지
    }
    
    function retryWithNewProblem() {
        gameOverModal.style.display = 'none';
        initializeGame(false); // 새 문제 생성
    }
    
    function enterReviewMode() {
        isReviewMode = true;
        changeGameState(GameState.REVIEW);
        successModal.style.display = 'none';
        
        // 검토 모드 UI 표시
        showReviewModeUI();
    }
    
    function showReviewModeUI() {
        // 힌트 컨트롤 영역을 검토 모드 컨트롤로 변경
        const hintControls = document.querySelector('.hint-controls');
        hintControls.innerHTML = '';
        
        // 검토 모드 표시
        const reviewIndicator = document.createElement('div');
        reviewIndicator.className = 'review-mode-indicator';
        reviewIndicator.textContent = '검토 모드';
        
        // 결과 보기 버튼 (성공 팝업 다시 표시)
        const showResultButton = document.createElement('button');
        showResultButton.className = 'show-result-btn';
        showResultButton.textContent = '결과 보기';
        showResultButton.onclick = () => {
            showSuccessModal();
        };
        
        // 다음 문제 버튼
        const nextButton = document.createElement('button');
        nextButton.className = 'next-problem-btn';
        nextButton.textContent = '다음 문제';
        nextButton.onclick = () => {
            exitReviewMode();
            advanceProgress();
            if (currentProblemNumber <= totalProblemsInSession) {
                initializeGame(false);
            }
        };
        
        hintControls.appendChild(reviewIndicator);
        hintControls.appendChild(showResultButton);
        hintControls.appendChild(nextButton);
    }
    
    function exitReviewMode() {
        isReviewMode = false;
        
        // 힌트 컨트롤을 다시 생성
        createHintControls();
        resetHints();
    }
    
    function updateProgressIndicator() {
        const progressIndicator = document.querySelector('.progress-indicator');
        if (progressIndicator) {
            progressIndicator.textContent = `${currentProblemNumber} / ${totalProblemsInSession}`;
        }
    }
    
    function initializeProgress() {
        currentProblemNumber = 1;
        updateProgressIndicator();
    }
    
    function advanceProgress() {
        if (currentProblemNumber < totalProblemsInSession) {
            currentProblemNumber++;
            updateProgressIndicator();
        } else {
            // 모든 문제 완료
            showSessionCompleteModal();
        }
    }
    
    function showSessionCompleteModal() {
        // 세션 완료 모달 표시 (향후 구현)
        alert(`축하합니다! ${totalProblemsInSession}개 문제를 모두 완료했습니다!`);
        showCategoryScreen();
    }
    
    function createHintControls() {
        const hintControls = document.querySelector('.hint-controls');
        hintControls.innerHTML = '';
        
        const hintButton = document.createElement('button');
        hintButton.id = 'hint-btn';
        hintButton.className = 'hint-btn';
        hintButton.innerHTML = '💡 힌트';
        hintButton.onclick = useHint;
        
        const hintCounter = document.createElement('span');
        hintCounter.id = 'hint-counter';
        hintCounter.className = 'hint-counter';
        hintCounter.textContent = `${hintsUsed}/${maxHints}`;
        
        hintControls.appendChild(hintButton);
        hintControls.appendChild(hintCounter);
        
        updateHintButtonState();
    }
    
    function updateHintButtonState() {
        const hintButton = document.getElementById('hint-btn');
        const hintCounter = document.getElementById('hint-counter');
        
        if (hintButton && hintCounter) {
            hintCounter.textContent = `${hintsUsed}/${maxHints}`;
            
            // 힌트 버튼 비활성화 조건:
            // 1. 최대 힌트 수에 도달했거나
            // 2. 활성화된 빈칸이 없거나
            // 3. 현재 활성화된 빈칸이 이미 채워져 있는 경우
            const shouldDisable = hintsUsed >= maxHints || 
                                 activeBlankIndex === -1 || 
                                 !problemBlanks[activeBlankIndex] ||
                                 problemBlanks[activeBlankIndex].classList.contains('correct');
            
            if (shouldDisable) {
                hintButton.disabled = true;
                hintButton.classList.add('disabled');
            } else {
                hintButton.disabled = false;
                hintButton.classList.remove('disabled');
            }
        }
    }
    
    function useHint() {
        if (hintsUsed >= maxHints || problemBlanks.length === 0) return;
        
        // 현재 활성화된 빈칸이 있는지 확인
        if (activeBlankIndex === -1 || !problemBlanks[activeBlankIndex]) {
            console.log('No active blank for hint');
            return;
        }
        
        const activeBlank = problemBlanks[activeBlankIndex];
        
        // 이미 채워진 빈칸인지 확인
        if (activeBlank.classList.contains('correct')) {
            console.log('Active blank is already filled');
            return;
        }
        
        const correctChar = activeBlank.dataset.correctChar;
        
        // 힌트로 정답 채우기
        activeBlank.textContent = correctChar.toUpperCase();
        activeBlank.classList.add('correct', 'hint-filled');
        activeBlank.classList.remove('active');
        
        // 힌트 사용 횟수 증가
        hintsUsed++;
        
        // 상태 업데이트
        correctlyFilledBlankChars.set(correctChar, (correctlyFilledBlankChars.get(correctChar) || 0) + 1);
        updateHintButtonState();
        updateKeyboardState();
        updateHintVisibility();
        
        // 다음 빈칸으로 이동
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
            // 모든 빈칸이 채워졌으면 퍼즐 완성 확인
            checkPuzzleCompletion();
        }
    }
    
    function resetHints() {
        hintsUsed = 0;
        updateHintButtonState();
    }
    
    // 스와이프 제스처 처리
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }
    
    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipeGesture();
    }
    
    function handleSwipeGesture() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 50;
        
        // 수평 스와이프가 수직 스와이프보다 클 때만 처리
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // 오른쪽 스와이프 - 다음 빈칸
                navigateBlank(1);
            } else {
                // 왼쪽 스와이프 - 이전 빈칸
                navigateBlank(-1);
            }
        }
    }
    
    // 햅틱 피드백 함수
    function triggerHapticFeedback(type = 'light') {
        if ('vibrate' in navigator) {
            switch (type) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(50);
                    break;
                case 'heavy':
                    navigator.vibrate([100, 50, 100]);
                    break;
                case 'success':
                    navigator.vibrate([50, 25, 50, 25, 100]);
                    break;
                case 'error':
                    navigator.vibrate([100, 50, 100, 50, 200]);
                    break;
            }
        }
    }
    
    function proceedToNextProblem() {
        successModal.style.display = 'none';
        advanceProgress();
        if (currentProblemNumber <= totalProblemsInSession) {
            initializeGame(false);
        }
    }

    function handleKeyPress(key) {
        console.log('Key pressed:', key, 'activeBlankIndex:', activeBlankIndex);
        if (activeBlankIndex === -1 || !problemBlanks[activeBlankIndex]) {
            console.log('No active blank or invalid index');
            return;
        }

        const blank = problemBlanks[activeBlankIndex];
        const char = blank.dataset.correctChar;
        console.log('Checking key:', key, 'against correct char:', char);

        if (key.toLowerCase() === char) {
            blank.textContent = key.toUpperCase();
            blank.classList.add('correct');
            blank.classList.remove('active');
            correctlyFilledBlankChars.set(char, (correctlyFilledBlankChars.get(char) || 0) + 1);
            updateKeyboardState();
            updateHintVisibility();
            
            // 정답 햅틱 피드백
            triggerHapticFeedback('light');
            
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
            
            // 오답 햅틱 피드백
            triggerHapticFeedback('error');
            
            setTimeout(() => {
                blank.classList.remove('incorrect');
                if (lives <= 0) {
                    changeGameState(GameState.GAME_OVER);
                    gameOverModal.style.display = 'flex';
                }
            }, 500);
        }
    }

    function checkPuzzleCompletion() {
        if (problemBlanks.every(b => b.classList.contains('correct'))) {
            // 성공 햅틱 피드백
            triggerHapticFeedback('success');
            setTimeout(showSuccessModal, 500);
        }
    }

    function showSuccessModal() {
        changeGameState(GameState.SUCCESS);
        
        const { sentence, source, translation, category } = currentProblem;
        createHighlightableSentence(document.querySelector('.original-sentence'), sentence);
        document.querySelector('#success-modal .source').textContent = `출처: ${source} (${category})`;
        document.querySelector('.korean-translation').textContent = translation;
        
        // 점수 및 힌트 사용량 표시
        updateSuccessModalScore();
        
        successModal.style.display = 'flex';
    }
    
    function calculateScore() {
        currentScore = Math.max(0, baseScore - (hintsUsed * hintPenalty));
        return currentScore;
    }
    
    function updateSuccessModalScore() {
        const score = calculateScore();
        let scoreDisplay = document.querySelector('.score-display');
        
        if (!scoreDisplay) {
            scoreDisplay = document.createElement('div');
            scoreDisplay.className = 'score-display';
            
            const sentenceDisplay = document.querySelector('.sentence-display');
            sentenceDisplay.appendChild(scoreDisplay);
        }
        
        let scoreText = `점수: ${score}점`;
        if (hintsUsed > 0) {
            scoreText += ` (힌트 ${hintsUsed}개 사용, -${hintsUsed * hintPenalty}점)`;
        }
        
        scoreDisplay.innerHTML = `
            <div class="score-text">${scoreText}</div>
            ${hintsUsed === 0 ? '<div class="perfect-bonus">🎉 완벽한 해결!</div>' : ''}
        `;
    }

    // [수정 4] 단어 분리 방식을 서버와 일치시키기 위한 최종 버전
    function createHighlightableSentence(container, sentence) {
        container.innerHTML = '';
        
        // 서버(google-tts.js)의 단어 분리 방식('split(' ')')과 완벽하게 일치시킵니다.
        // 이렇게 하면 클라이언트와 서버가 단어를 세는 방식이 동일해져 인덱스가 꼬이지 않습니다.
        const words = sentence.split(' '); 
        
        words.forEach((word, index) => {
            // 서버 로직이 'A  B'를 ['A', '', 'B']로 만드는 경우에 대비해 빈 문자열(word)을 건너뜁니다.
            if (word) { 
                const span = document.createElement('span');
                span.className = 'modal-word';
                span.textContent = word;
                container.appendChild(span);
            }
            
            // 마지막 단어가 아니면서, 다음 단어가 빈 문자열이 아닐 때만 공백을 추가하여
            // 문장 끝이나 연속된 공백 뒤에 불필요한 공백이 생기지 않도록 합니다.
            if (index < words.length - 1 && words[index+1]) {
                container.appendChild(document.createTextNode(' '));
            }
        });
    }
    
    function highlightModalWord(idx) {
        clearWordHighlights();
        const wordElements = document.querySelectorAll('.modal-word');
        if (wordElements[idx]) {
            wordElements[idx].classList.add('reading-highlight');
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
        sourceDisplay.textContent = `${p.source} (${p.category})`;
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
            
            // 빈칸 선택 햅틱 피드백
            triggerHapticFeedback('light');
            
            // Auto-scroll to active blank
            scrollToActiveBlank();
            
            // 힌트 버튼 상태 업데이트
            updateHintButtonState();
        }
    }
    
    function scrollToActiveBlank() {
        if (activeBlankIndex !== -1 && problemBlanks[activeBlankIndex]) {
            const activeBlank = problemBlanks[activeBlankIndex];
            const problemArea = document.querySelector('.problem-area');
            
            if (problemArea && activeBlank) {
                // Check if the active blank is visible in the problem area
                const problemRect = problemArea.getBoundingClientRect();
                const blankRect = activeBlank.getBoundingClientRect();
                
                // Calculate if blank is outside visible area
                const isAboveView = blankRect.top < problemRect.top;
                const isBelowView = blankRect.bottom > problemRect.bottom;
                
                if (isAboveView || isBelowView) {
                    // Scroll to center the active blank in the problem area
                    const blankOffsetTop = activeBlank.offsetTop;
                    const problemAreaHeight = problemArea.clientHeight;
                    const scrollTop = blankOffsetTop - (problemAreaHeight / 2);
                    
                    problemArea.scrollTo({
                        top: Math.max(0, scrollTop),
                        behavior: 'smooth'
                    });
                }
            }
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
    
    // 모바일 가상 키보드 감지 및 레이아웃 조정
    function handleMobileKeyboard() {
        const currentHeight = window.innerHeight;
        const heightDifference = initialViewportHeight - currentHeight;
        const gameContainer = document.querySelector('.game-container');
        
        // 가상 키보드가 나타났을 때 (높이가 150px 이상 줄어들었을 때)
        if (heightDifference > 150) {
            gameContainer.style.height = `${currentHeight - 20}px`;
            gameContainer.classList.add('mobile-keyboard-active');
        } else {
            gameContainer.style.height = '680px';
            gameContainer.classList.remove('mobile-keyboard-active');
        }
    }

    // --- Event Listeners & Initialization ---

    // 이벤트 리스너 추가 (null 체크 포함)
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            console.log('Category selected:', category);
            startGame(category);
        });
    });

    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            console.log('Home button clicked');
            changeGameState(GameState.CATEGORY_SELECTION);
        });
    }

    if (retrySameBtn) {
        retrySameBtn.addEventListener('click', () => {
            console.log('Retry same button clicked');
            retrySameProblem();
        });
    }
    
    if (retryNewBtn) {
        retryNewBtn.addEventListener('click', () => {
            console.log('Retry new button clicked');
            retryWithNewProblem();
        });
    }
    
    if (goHomeBtn) {
        goHomeBtn.addEventListener('click', () => {
            console.log('Go home button clicked');
            gameOverModal.style.display = 'none';
            changeGameState(GameState.CATEGORY_SELECTION);
        });
    }

    if (reviewBtn) {
        reviewBtn.addEventListener('click', () => {
            console.log('Review button clicked');
            enterReviewMode();
        });
    }
    
    if (nextProblemBtn) {
        nextProblemBtn.addEventListener('click', () => {
            console.log('Next problem button clicked');
            proceedToNextProblem();
        });
    }

    if (listenBtn) {
        listenBtn.addEventListener('click', () => {
            console.log('Listen button clicked');
            speakSentence();
        });
    }

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

    // 모바일 가상 키보드 감지를 위한 이벤트 리스너
    window.addEventListener('resize', handleMobileKeyboard);
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            initialViewportHeight = window.innerHeight;
            handleMobileKeyboard();
        }, 500);
    });

    // 스와이프 제스처 이벤트 리스너
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

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
    
    // 초기 상태 설정
    changeGameState(GameState.CATEGORY_SELECTION);
});