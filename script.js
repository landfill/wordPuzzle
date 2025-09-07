import ContentGenerator from './content-generator.js';
import CONTENT_DATABASE from './content-database.js';
import DataManager from './data-manager.js';
import AchievementSystem from './achievement-system.js';
// Phase 3: 새로운 모듈들
import { isFeatureEnabled, CONFIG } from './config.js';
import { authManager } from './auth-manager.js';
// Phase 4-A: 게임 상태 관리
import GameStateManager from './game-state-manager.js';

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
    const successModalCloseBtn = document.getElementById('success-modal-close');
    const nextProblemBtn = document.getElementById('next-problem-btn');
    const listenBtn = document.getElementById('listen-btn');
    const saveSentenceBtn = document.getElementById('save-sentence-btn'); // Phase 2
    const retrySameBtn = document.getElementById('retry-same-btn');
    const retryNewBtn = document.getElementById('retry-new-btn');
    const goHomeBtn = document.getElementById('go-home-btn');
    
    // 공유 기능 버튼들
    const shareBtn = document.getElementById('share-btn');
    const screenshotBtn = document.getElementById('screenshot-btn');
    
    // 다크모드 토글 버튼들
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeToggleCategory = document.getElementById('dark-mode-toggle-category');
    
    // Phase 2-B: 대시보드 관련 DOM 요소들
    const dashboardModal = document.getElementById('dashboard-modal');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const closeDashboardBtn = document.getElementById('close-dashboard-btn');
    
    // Phase 4-A: 게임 헤더의 대시보드/리더보드 버튼들
    const gameDashboardBtn = document.getElementById('game-dashboard-btn');
    const gameLeaderboardBtn = document.getElementById('game-leaderboard-btn');
    
    // Phase 4-A: 모달에서의 대시보드 접근 버튼들
    const successDashboardBtn = document.getElementById('success-dashboard-btn');
    const gameoverDashboardBtn = document.getElementById('gameover-dashboard-btn');
    
    // Phase 3: 인증 및 글로벌 기능 DOM 요소들
    const authSection = document.getElementById('auth-section');
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');
    const globalLeaderboardBtn = document.getElementById('global-leaderboard-btn');
    
    // 리더보드 모달 관련 DOM 요소들
    const globalLeaderboardModal = document.getElementById('global-leaderboard-modal');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    const categoryFilter = document.getElementById('category-filter');
    const timeframeFilter = document.getElementById('timeframe-filter');
    const totalPlayersSpan = document.getElementById('total-players');
    const totalGamesSpan = document.getElementById('total-games');
    const averageScoreSpan = document.getElementById('average-score');
    const leaderboardLoading = document.getElementById('leaderboard-loading');
    const leaderboardList = document.getElementById('leaderboard-list');
    const leaderboardError = document.getElementById('leaderboard-error');
    const refreshLeaderboardBtn = document.getElementById('refresh-leaderboard-btn');
    const retryLeaderboardBtn = document.getElementById('retry-leaderboard-btn');

    // DOM 요소 확인
    // DOM 요소 초기화 완료

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
    
    // 카테고리 표시명 매핑
    const categoryDisplayNames = {
        'movies': 'Movies',
        'songs': 'Songs', 
        'books': 'Books',
        'quotes': 'Quotes',
        'daily_travel_phrases': 'Travel',
        'all': 'Random'
    };
    
    // 게임 제목을 카테고리에 맞게 업데이트하는 함수
    function updateGameTitle(category) {
        const gameTitle = document.querySelector('.game-title');
        if (gameTitle) {
            const displayName = categoryDisplayNames[category] || 'Word Crack';
            gameTitle.textContent = displayName;
        }
    }
    let initialViewportHeight = window.innerHeight; // 모바일 가상 키보드 감지용
    let isReviewMode = false; // 검토 모드 상태
    let currentProblemNumber = 1; // 현재 문제 번호
    let totalProblemsInSession = 5; // 세션당 총 문제 수
    let hintsUsed = 0; // 현재 문제에서 사용한 힌트 수
    let maxHints = 3; // 문제당 최대 힌트 수
    let currentScore = 0; // 현재 문제 점수

    // Phase 4-A: 게임 상태 관리 시스템
    const gameStateManager = new GameStateManager();
    let gameStateIndicator = null; // 상태 저장 표시기
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
        
        // Game state changed
        
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

    // Phase 2: 데이터 매니저 초기화
    const dataManager = new DataManager();
    const achievementSystem = new AchievementSystem(dataManager);
    let gameStartTime = null; // 게임 시작 시간 추적

    const keyboardLayout = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];
    
    // Phase 4-A: 로딩 오버레이 관리
    function createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">로딩 중...</div>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    function showLoading(text = '로딩 중...') {
        let overlay = document.querySelector('.loading-overlay');
        if (!overlay) {
            overlay = createLoadingOverlay();
        }
        const textElement = overlay.querySelector('.loading-text');
        if (textElement) {
            textElement.textContent = text;
        }
        overlay.classList.add('show');
        return overlay;
    }

    function hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    // Phase 4-A: 화면 전환 애니메이션 함수들
    function showCategoryScreen() {
        animateScreenTransition(gameScreen, categorySelectionScreen);
        stopAllSounds();
    }
    
    function showGameScreen() {
        animateScreenTransition(categorySelectionScreen, gameScreen);
        // 라이프바가 표시되도록 보장
        if (typeof lives !== 'undefined') {
            updateLivesDisplay();
        }
    }

    function animateScreenTransition(fromScreen, toScreen) {
        // 현재 화면 페이드 아웃
        fromScreen.classList.add('fade-out');
        
        setTimeout(() => {
            fromScreen.style.display = 'none';
            fromScreen.classList.remove('fade-out');
            
            // 새 화면 페이드 인
            toScreen.style.display = 'flex';
            toScreen.classList.add('fade-in');
            
            setTimeout(() => {
                toScreen.classList.remove('fade-in');
            }, 300);
        }, 150);
    }

    // Phase 4-A: 키보드 키 애니메이션
    function animateKeyPress(keyElement) {
        keyElement.classList.add('pressed');
        setTimeout(() => {
            keyElement.classList.remove('pressed');
        }, 150);
    }
    
    // 이전 모달 추적을 위한 변수
    let previousModal = null;
    
    function showDashboardModal() {
        // 현재 열린 모달을 추적
        if (successModal.style.display === 'flex') {
            previousModal = successModal;
        } else if (gameOverModal.style.display === 'flex') {
            previousModal = gameOverModal;
        } else if (globalLeaderboardModal.style.display === 'flex') {
            previousModal = globalLeaderboardModal;
        } else {
            previousModal = null;
        }
        
        // 다른 모달들을 먼저 숨김 (레이어 순서 문제 해결)
        successModal.style.display = 'none';
        gameOverModal.style.display = 'none';
        globalLeaderboardModal.style.display = 'none';
        
        dashboardModal.style.display = 'flex';
        updateDashboardData();
    }

    function updateDashboardData() {
        // Phase 2: 대시보드 데이터 업데이트
        try {
            const userData = dataManager.getUserData();
            
            // 기본 통계 업데이트
            updateStatsDisplay(userData);
            
            // 카테고리별 진행률 업데이트
            updateCategoryProgress(userData);
            
            // 배지 시스템 업데이트
            updateBadgesDisplay();
            
            // 저장된 문장 업데이트
            const savedSentences = dataManager.getSavedSentences();
            updateSavedSentences(savedSentences);
            
        } catch (error) {
            console.error('대시보드 데이터 업데이트 실패:', error);
        }
    }
    
    function hideDashboardModal() {
        dashboardModal.style.display = 'none';
        
        // 이전 모달이 있다면 다시 표시
        if (previousModal) {
            previousModal.style.display = 'flex';
            previousModal = null; // 리셋
        }
    }
    
    function hideSuccessModal() {
        successModal.style.display = 'none';
    }
    
    function hideGameOverModal() {
        gameOverModal.style.display = 'none';
    }

    function showGlobalLeaderboard() {
        // Phase 3: 글로벌 리더보드 표시
        if (globalLeaderboardModal) {
            globalLeaderboardModal.style.display = 'flex';
            // TODO: 실제 리더보드 데이터 로딩 구현 필요
        }
    }

    function hideGlobalLeaderboard() {
        if (globalLeaderboardModal) {
            globalLeaderboardModal.style.display = 'none';
        }
    }

    // Phase 3: 리더보드 필터 변경 핸들러 (임시 구현)
    function onLeaderboardFilterChange() {
        console.log('리더보드 필터 변경됨 - 구현 예정');
        // TODO: 실제 필터링 로직 구현 필요
    }

    function refreshLeaderboard() {
        console.log('리더보드 새로고침 - 구현 예정');
        // TODO: 실제 리더보드 새로고침 로직 구현 필요
    }

    // Phase 2: 대시보드 통계 업데이트 함수들
    function updateStatsDisplay(userData) {
        // 기본 통계 업데이트
        const statsElements = {
            totalProblems: document.getElementById('stat-total-problems'),
            totalScore: document.getElementById('stat-total-score'),
            bestStreak: document.getElementById('stat-best-streak'),
            perfectIndex: document.getElementById('stat-perfect-index')
        };

        Object.entries(statsElements).forEach(([key, element]) => {
            if (element && userData[key] !== undefined) {
                element.textContent = userData[key];
            }
        });
    }

    function updateBadgesDisplay() {
        // 배지 시스템 업데이트
        try {
            const badges = achievementSystem.getAllBadges();
            const badgesContainer = document.getElementById('badges-container');
            
            if (badgesContainer && badges) {
                // 배지 표시 로직
                console.log('배지 업데이트:', badges.length, '개');
            }
        } catch (error) {
            console.error('배지 업데이트 실패:', error);
        }
    }

    // Phase 4-A: 게임 상태 관리 함수들
    function createGameStateIndicator() {
        if (!gameStateIndicator) {
            gameStateIndicator = document.createElement('div');
            gameStateIndicator.className = 'game-state-indicator';
            document.body.appendChild(gameStateIndicator);
        }
        return gameStateIndicator;
    }

    function showGameStateIndicator(message, isError = false) {
        const indicator = createGameStateIndicator();
        indicator.textContent = message;
        indicator.className = 'game-state-indicator' + (isError ? ' error' : '');
        indicator.classList.add('show');
        
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }

    function getCurrentGameState() {
        return {
            selectedCategory,
            currentProblem,
            currentProblemNumber,
            totalProblemsInSession,
            hintsUsed,
            currentScore,
            isReviewMode,
            gameStartTime
        };
    }

    function saveCurrentGameState(forceUpdate = false) {
        const gameState = getCurrentGameState();
        if (gameState.selectedCategory && gameState.currentProblem) {
            const success = gameStateManager.saveGameState(gameState, forceUpdate);
            if (success) {
                showGameStateIndicator('💾 게임 저장됨');
            } else {
                console.log('[GameState] 저장 조건 미충족 또는 스킵됨');
            }
        }
    }

    async function restoreGameState(savedState) {
        if (!savedState) return false;

        try {
            // 상태 복원
            selectedCategory = savedState.selectedCategory;
            currentProblem = savedState.currentProblem;
            currentProblemNumber = savedState.currentProblemNumber || 1;
            totalProblemsInSession = savedState.totalProblemsInSession || 5;
            hintsUsed = savedState.hintsUsed || 0;
            currentScore = savedState.currentScore || 0;
            isReviewMode = savedState.isReviewMode || false;
            gameStartTime = savedState.gameStartTime;

            // UI 업데이트
            showGameScreen();
            updateGameTitle(selectedCategory);
            loadProblem(currentProblem);
            updateSourceDisplay(currentProblem);
            updateProgressIndicator();

            showGameStateIndicator('🔄 게임 복원됨');
            
            // 자동 저장 시작
            gameStateManager.startAutoSave(getCurrentGameState);
            
            return true;
        } catch (error) {
            console.error('[GameState] 복원 중 오류:', error);
            showGameStateIndicator('❌ 복원 실패', true);
            return false;
        }
    }

    function startGame(category) {
        // Starting game
        selectedCategory = category;
        
        // 게임 제목을 카테고리에 맞게 업데이트
        updateGameTitle(category);
        
        // Phase 2: 게임 시작 데이터 기록
        dataManager.recordGameStart(category);
        gameStartTime = Date.now();
        
        changeGameState(GameState.PLAYING);
        initializeProgress();
        initializeGame();
        
        // Phase 4-A: 게임 상태 자동 저장 시작
        gameStateManager.startAutoSave(getCurrentGameState);
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
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(currentSentence);
            utterance.lang = 'en-US';
            
            // 사용 가능한 목소리가 있으면 첫 번째 영어 목소리 선택, 없으면 기본 목소리 사용
            if (browserVoices.length > 0) {
                utterance.voice = browserVoices[0];
            }
            
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
            
            utterance.onerror = (e) => {
                console.warn("Browser TTS error:", e);
                clearInterval(highlightInterval);
                // TTS 에러가 발생해도 하이라이트만 제공
                provideFallbackHighlight();
            };
            
            try {
                speechSynthesis.speak(utterance);
            } catch (error) {
                console.warn("speechSynthesis.speak failed:", error);
                provideFallbackHighlight();
            }
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
            // 가중치 적용: easy 60%, medium 30%, hard 10%
            const difficultyWeights = {easy: 60, medium: 30, hard: 10};
            currentProblem = contentGenerator.generateRandomProblem(selectedCategory, difficultyWeights);
            
            if (!currentProblem) {
                alert("선택한 카테고리의 문제를 모두 풀었거나 문제가 없습니다. 홈으로 돌아갑니다.");
                showCategoryScreen();
                return;
            }
            currentSentence = currentProblem.sentence;
            
            // 랜덤 카테고리 선택 시 실제 문제의 카테고리로 제목 업데이트
            if (selectedCategory === 'all' && currentProblem.category) {
                updateGameTitle(currentProblem.category);
            }
        }
        
        activeBlankIndex = -1;
        problemBlanks = [];
        usedCharsInProblem.clear();
        requiredBlankChars.clear();
        correctlyFilledBlankChars.clear();
        charToHintNumber.clear();
        
        stopAllSounds();

        // Loading problem
        loadProblem(currentProblem);
        updateSourceDisplay(currentProblem);
        
        // Creating keyboard and hint controls
        if (keyboardArea && keyboardArea.childElementCount === 0) {
            createKeyboard();
        }
        createHintControls();
        resetHints();
        updateKeyboardState();
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
            // No active blank for hint
            return;
        }
        
        const activeBlank = problemBlanks[activeBlankIndex];
        
        // 이미 채워진 빈칸인지 확인
        if (activeBlank.classList.contains('correct')) {
            // Active blank is already filled
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
        // Key pressed handling
        if (activeBlankIndex === -1 || !problemBlanks[activeBlankIndex]) {
            return;
        }

        const blank = problemBlanks[activeBlankIndex];
        const char = blank.dataset.correctChar;
        // Checking key against correct character

        if (key.toLowerCase() === char) {
            blank.textContent = key.toUpperCase();
            blank.classList.add('correct');
            blank.classList.remove('active');
            correctlyFilledBlankChars.set(char, (correctlyFilledBlankChars.get(char) || 0) + 1);
            updateKeyboardState();
            
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
                    // Phase 2: 게임 실패 데이터 기록
                    const playTime = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
                    
                    dataManager.recordGameCompletion({
                        category: selectedCategory === 'all' && currentProblem.category ? currentProblem.category : selectedCategory,
                        score: 0,
                        hintsUsed: hintsUsed,
                        isSuccess: false,
                        problemData: currentProblem,
                        playTime: playTime
                    });
                    
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
        
        // Phase 2: 게임 완료 데이터 기록
        const playTime = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
        const score = calculateScore();
        
        dataManager.recordGameCompletion({
            category: selectedCategory === 'all' && currentProblem.category ? currentProblem.category : selectedCategory,
            score: score,
            hintsUsed: hintsUsed,
            isSuccess: true,
            problemData: currentProblem,
            playTime: playTime
        });
        
        // 5연속 성공 체크 및 보너스 점수 부여
        const userData = dataManager.getUserData();
        if (userData && userData.stats.currentStreak === 5) {
            // 보너스 점수 30점 부여
            dataManager.updateUserData(data => {
                // 현재 카테고리의 총 점수에 보너스 추가
                const actualCategory = selectedCategory === 'all' && currentProblem.category ? currentProblem.category : selectedCategory;
                data.categoryProgress[actualCategory].totalScore += 30;
                data.stats.totalScore += 30;
            });
            
            // 토스트 알림 표시
            showToast('🔥 5연속 성공! 보너스 30점 획득! 🎉', 4000);
        }
        
        // Phase 2-B: 새 배지 확인 및 알림
        const newBadges = achievementSystem.checkNewBadges();
        if (newBadges.length > 0) {
            showBadgeNotifications(newBadges);
        }
        
        // Phase 3: 글로벌 점수 업로드
        if (isFeatureEnabled('SCORE_UPLOAD') && authManager.isLoggedIn()) {
            // 'all' 카테고리는 집계용이므로 점수 저장 제외
            if (selectedCategory !== 'all') {
                uploadScoreToGlobal({
                    category: selectedCategory,
                    score: score,
                    hintsUsed: hintsUsed,
                    perfectScore: hintsUsed === 0 && lives === 5,
                    playTime: playTime,
                    sentence: sentence
                });
            }
        }
        
        // Phase 2: 저장 버튼 상태 업데이트
        updateSaveSentenceButton();
        
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
            const wordContainer = document.createElement('div');
            wordContainer.className = 'word-container';
            
            // 단어 전체를 위한 텍스트 표시 영역
            const wordDisplay = document.createElement('div');
            wordDisplay.className = 'word-display';
            
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const curIdx = charIndex + i;
                const bInfo = problem.blanks.find(b => b.index === curIdx);
                
                // 각 글자를 위한 컬럼 컨테이너
                const charColumn = document.createElement('div');
                charColumn.className = 'char-column';
                
                // 힌트 번호를 위한 컨테이너
                const hintSpan = document.createElement('div');
                hintSpan.className = 'hint-number-underbar';
                
                if (bInfo) {
                    // 빈칸인 경우 언더바로 표시
                    const blankSpan = document.createElement('div');
                    blankSpan.className = 'underbar-blank';
                    blankSpan.textContent = '_';
                    blankSpan.dataset.correctChar = bInfo.char.toLowerCase();
                    blankSpan.dataset.blankIndex = blankCounter++;
                    blankSpan.onclick = () => setActiveBlank(parseInt(blankSpan.dataset.blankIndex));
                    
                    charColumn.appendChild(blankSpan);
                    problemBlanks.push(blankSpan);
                    
                    // 힌트 번호 설정
                    hintSpan.textContent = bInfo.hintNum;
                } else {
                    // 고정 글자인 경우
                    const charSpan = document.createElement('div');
                    charSpan.className = 'fixed-char';
                    if (char.match(/[a-zA-Z]/)) {
                        charSpan.textContent = char.toUpperCase();
                        const lc = char.toLowerCase();
                        if (charToHintNumber.has(lc)) {
                            // 힌트 번호가 있는 고정 글자
                            hintSpan.textContent = charToHintNumber.get(lc);
                            hintSpan.dataset.char = lc;
                        } else {
                            // 힌트 번호가 없는 글자는 빈 공간
                            hintSpan.style.visibility = 'hidden';
                        }
                    } else {
                        charSpan.textContent = char;
                        hintSpan.style.visibility = 'hidden';
                    }
                    charColumn.appendChild(charSpan);
                }
                
                // 힌트 번호를 컬럼에 추가
                charColumn.appendChild(hintSpan);
                
                // 컬럼을 단어 디스플레이에 추가
                wordDisplay.appendChild(charColumn);
            }
            
            wordContainer.appendChild(wordDisplay);
            problemArea.appendChild(wordContainer);
            
            charIndex += word.length + 1;
        });

        if (problemBlanks.length > 0) {
            setActiveBlank(0);
        }
    }
    
    function updateSourceDisplay(p) {
        sourceDisplay.textContent = p.source;
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
        
        let nextIdx = activeBlankIndex;
        const totalBlanks = problemBlanks.length;
        
        // 다음 빈칸을 찾을 때까지 반복 (이미 채워진 빈칸은 건너뛰기)
        for (let i = 0; i < totalBlanks; i++) {
            nextIdx = (nextIdx + dir + totalBlanks) % totalBlanks;
            
            // 빈칸이 아직 채워지지 않았으면 선택
            if (!problemBlanks[nextIdx].classList.contains('correct')) {
                setActiveBlank(nextIdx);
                return;
            }
        }
        
        // 모든 빈칸이 채워진 경우 현재 위치 유지
        // All blanks are filled
    }
    
    function setActiveBlank(idx) {
        // setActiveBlank called
        
        // 이전 활성 빈칸의 active 클래스 제거
        if (activeBlankIndex !== -1 && problemBlanks[activeBlankIndex]) {
            problemBlanks[activeBlankIndex].classList.remove('active');
            // Removed active class
        }
        
        // 새로운 활성 빈칸 설정
        activeBlankIndex = idx;
        if (problemBlanks[activeBlankIndex]) {
            // 이미 채워진 빈칸에는 active 클래스를 추가하지 않음
            if (!problemBlanks[activeBlankIndex].classList.contains('correct')) {
                problemBlanks[activeBlankIndex].classList.add('active');
                // Set active class on blank
            } else {
                // Skipped setting active class on already filled blank
            }
            document.querySelectorAll('.word-container.has-active-blank').forEach(g => g.classList.remove('has-active-blank'));
            problemBlanks[activeBlankIndex].closest('.word-container')?.classList.add('has-active-blank');
            
            // Set active class on blank
            
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
                kDiv.className = 'key keyboard-key';
                kDiv.textContent = k.toUpperCase();
                kDiv.dataset.key = k;
                kDiv.onclick = () => {
                    // Phase 4-A: 키 클릭 애니메이션
                    animateKeyPress(kDiv);
                    handleKeyPress(k);
                };
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
        
        // 키보드 상태 변경 시 힌트 번호 표시도 함께 업데이트
        updateHintVisibility();
    }
    
    function updateHintVisibility() {
        // 고정된 문자의 힌트 번호 처리 (data-char 속성이 있는 경우)
        document.querySelectorAll('.hint-number[data-char]').forEach(s => {
            const c = s.dataset.char;
            const req = requiredBlankChars.get(c) || 0;
            const fill = correctlyFilledBlankChars.get(c) || 0;
            
            // 키보드가 비활성화된 문자는 힌트 번호도 숨김
            const isKeyDisabled = usedCharsInProblem.has(c) || (req > 0 && fill >= req);
            
            s.style.visibility = isKeyDisabled ? 'hidden' : 'visible';
        });
        
        // 빈칸의 힌트 번호 처리
        problemBlanks.forEach(blank => {
            const hintElement = blank.nextElementSibling;
            const correctChar = blank.dataset.correctChar;
            
            if (hintElement && hintElement.classList.contains('hint-number') && correctChar) {
                const req = requiredBlankChars.get(correctChar) || 0;
                const fill = correctlyFilledBlankChars.get(correctChar) || 0;
                const isKeyDisabled = usedCharsInProblem.has(correctChar) || (req > 0 && fill >= req);
                
                hintElement.style.visibility = isKeyDisabled ? 'hidden' : 'visible';
            }
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
            // Category selected
            startGame(category);
        });
    });

    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            // Home button clicked
            // Phase 4-A: 게임 상태 정리
            gameStateManager.stopAutoSave();
            gameStateManager.clearGameState();
            changeGameState(GameState.CATEGORY_SELECTION);
        });
    }

    if (retrySameBtn) {
        retrySameBtn.addEventListener('click', () => {
            // Retry same button clicked
            retrySameProblem();
        });
    }
    
    if (retryNewBtn) {
        retryNewBtn.addEventListener('click', () => {
            // Retry new button clicked
            retryWithNewProblem();
        });
    }
    
    if (goHomeBtn) {
        goHomeBtn.addEventListener('click', () => {
            // Go home button clicked
            gameOverModal.style.display = 'none';
            changeGameState(GameState.CATEGORY_SELECTION);
        });
    }

    if (successModalCloseBtn) {
        successModalCloseBtn.addEventListener('click', () => {
            enterReviewMode();
        });
    }
    
    // 팝업 외부 클릭시 닫기 처리
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                enterReviewMode();
            }
        });
    }
    
    if (nextProblemBtn) {
        nextProblemBtn.addEventListener('click', () => {
            // Next problem button clicked
            proceedToNextProblem();
        });
    }

    if (listenBtn) {
        listenBtn.addEventListener('click', () => {
            // Listen button clicked
            speakSentence();
        });
    }

    document.addEventListener('keydown', (e) => {
        // ESC 키로 모달 닫기
        if (e.key === 'Escape') {
            if (dashboardModal.style.display === 'flex') {
                hideDashboardModal();
                return;
            }
            if (globalLeaderboardModal.style.display === 'flex') {
                hideGlobalLeaderboard();
                return;
            }
            if (successModal.style.display === 'flex') {
                hideSuccessModal();
                return;
            }
            if (gameOverModal.style.display === 'flex') {
                hideGameOverModal();
                return;
            }
        }
        
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

    // 모바일 확대 방지
    document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
    });
    
    document.addEventListener('gesturechange', function (e) {
        e.preventDefault();
    });
    
    document.addEventListener('gestureend', function (e) {
        e.preventDefault();
    });
    
    // 더블탭 확대 방지
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // 휠 확대 방지 (데스크톱에서 Ctrl+휠)
    document.addEventListener('wheel', function(e) {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });

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

    // === 공유 기능 ===
    
    // 학습 결과 데이터 포맷팅
    function formatStudyResult(problem, isSuccess = true) {
        const score = calculateScore();
        const hintText = hintsUsed > 0 ? `(힌트 ${hintsUsed}개 사용)` : '(완벽 해결!)';
        
        return `🎯 Word Crack 학습완료

"${problem.sentence}"
${problem.translation}

📊 점수: ${score}점 ${hintText}
📚 출처: ${problem.source}

🌐 wordpuzzle.pages.dev`;
    }

    // Web Share API를 통한 공유
    async function shareResult() {
        if (!currentProblem) return;
        
        const shareData = {
            title: 'Word Crack 학습 결과',
            text: formatStudyResult(currentProblem, true),
            url: window.location.href
        };
        
        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                showToast('공유되었습니다! 🎉');
            } else {
                showToast('공유 기능을 사용할 수 없습니다 😅');
            }
        } catch (error) {
            showToast('공유에 실패했습니다 😅');
        }
    }

    // 개선된 스크린샷 생성 및 공유
    async function saveScreenshot() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 고해상도 캔버스 설정
            const scale = 2;
            canvas.width = 600 * scale;
            canvas.height = 400 * scale;
            ctx.scale(scale, scale);
            
            // 그라디언트 배경
            const gradient = ctx.createLinearGradient(0, 0, 600, 400);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 600, 400);
            
            // 반투명 오버레이
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, 600, 400);
            
            // 제목
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🎯 Word Crack', 300, 60);
            
            // 구분선
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(100, 80);
            ctx.lineTo(500, 80);
            ctx.stroke();
            
            // 문장 (긴 문장 줄바꿈 처리)
            ctx.font = 'bold 20px Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            const sentence = `"${currentProblem.sentence}"`;
            const maxWidth = 480;
            const words = sentence.split(' ');
            let line = '';
            let y = 130;
            
            for (let word of words) {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && line !== '') {
                    ctx.fillText(line, 300, y);
                    line = word + ' ';
                    y += 30;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 300, y);
            
            // 해석
            ctx.font = '16px Arial, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText(currentProblem.translation, 300, y + 40);
            
            // 점수 정보
            const score = calculateScore();
            const hintText = hintsUsed > 0 ? `힌트 ${hintsUsed}개 사용` : '완벽 해결!';
            ctx.font = 'bold 18px Arial, sans-serif';
            ctx.fillStyle = '#ffd700';
            ctx.fillText(`📊 ${score}점 (${hintText})`, 300, y + 80);
            
            // 출처
            ctx.font = '14px Arial, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(`📚 ${currentProblem.source}`, 300, y + 110);
            
            // 웹사이트
            ctx.font = '12px Arial, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText('🌐 wordpuzzle.pages.dev', 300, y + 140);
            
            // 이미지를 Blob으로 변환하여 공유
            canvas.toBlob(async (blob) => {
                const file = new File([blob], 'word-crack-result.png', { type: 'image/png' });
                
                // Web Share API로 이미지 공유 시도
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: 'Word Crack 학습 결과',
                            text: formatStudyResult(currentProblem, true),
                            files: [file]
                        });
                        showToast('이미지가 공유되었습니다! 📸');
                        return;
                    } catch (error) {
                        // 이미지 공유 실패, 다운로드로 대체
                    }
                }
                
                // 공유가 불가능하면 다운로드
                const link = document.createElement('a');
                link.download = `word-crack-${Date.now()}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
                
                showToast('이미지가 저장되었습니다! 📸');
            }, 'image/png', 0.9);
            
        } catch (error) {
            showToast('이미지 생성에 실패했습니다 😅');
        }
    }

    // 토스트 메시지 표시
    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            animation: fadeInOut 3s ease-in-out;
        `;
        
        // 애니메이션 CSS 추가
        if (!document.getElementById('toast-style')) {
            const style = document.createElement('style');
            style.id = 'toast-style';
            style.textContent = `
                @keyframes fadeInOut {
                    0%, 100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // === 다크모드 기능 ===
    
    // 다크모드 상태 초기화
    function initializeDarkMode() {
        const savedTheme = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDarkMode = savedTheme === 'true' || (savedTheme === null && prefersDark);
        
        if (isDarkMode) {
            enableDarkMode();
        }
    }
    
    // 다크모드 활성화
    function enableDarkMode() {
        document.body.classList.add('dark-mode');
        updateDarkModeIcons(true);
        localStorage.setItem('darkMode', 'true');
    }
    
    // 다크모드 비활성화
    function disableDarkMode() {
        document.body.classList.remove('dark-mode');
        updateDarkModeIcons(false);
        localStorage.setItem('darkMode', 'false');
    }
    
    // 다크모드 토글
    function toggleDarkMode() {
        if (document.body.classList.contains('dark-mode')) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    }
    
    // 아이콘 업데이트
    function updateDarkModeIcons(isDark) {
        const toggles = [darkModeToggle, darkModeToggleCategory].filter(Boolean);
        
        toggles.forEach(toggle => {
            const sunIcon = toggle.querySelector('.sun-icon');
            const moonIcon = toggle.querySelector('.moon-icon');
            
            if (sunIcon && moonIcon) {
                if (isDark) {
                    sunIcon.style.display = 'none';
                    moonIcon.style.display = 'block';
                } else {
                    sunIcon.style.display = 'block';
                    moonIcon.style.display = 'none';
                }
            }
        });
    }
    
    // Phase 2: 문장 저장 기능
    function saveSentence() {
        if (!currentProblem) return;
        
        const saved = dataManager.saveSentence(currentProblem);
        
        if (saved) {
            // 저장 성공
            saveSentenceBtn.textContent = '✅ 수집됨';
            saveSentenceBtn.disabled = true;
            saveSentenceBtn.style.opacity = '0.7';
            
            // 성공 피드백 (선택적)
            triggerHapticFeedback('light');
            
            // 3초 후 메시지 표시
            setTimeout(() => {
                // 문장이 저장되었습니다
            }, 100);
        } else {
            // 이미 저장된 문장
            saveSentenceBtn.textContent = '이미 수집됨';
            saveSentenceBtn.disabled = true;
            saveSentenceBtn.style.opacity = '0.7';
        }
    }
    
    function updateSaveSentenceButton() {
        if (!currentProblem || !saveSentenceBtn) return;
        
        const isSaved = dataManager.isSentenceSaved(currentProblem.sentence);
        
        if (isSaved) {
            saveSentenceBtn.textContent = '✅ 수집됨';
            saveSentenceBtn.disabled = true;
            saveSentenceBtn.style.opacity = '0.7';
        } else {
            saveSentenceBtn.textContent = '수집하기';
            saveSentenceBtn.disabled = false;
            saveSentenceBtn.style.opacity = '1';
        }
    }

    // Phase 2-B: 배지 알림 표시 함수
    function showBadgeNotifications(badges) {
        badges.forEach((badge, index) => {
            setTimeout(() => {
                showSingleBadgeNotification(badge);
            }, index * 1500); // 각 배지를 1.5초 간격으로 표시
        });
    }

    function showSingleBadgeNotification(badge) {
        // 기존 알림이 있다면 제거
        const existingNotification = document.querySelector('.badge-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 배지 알림 요소 생성
        const notification = document.createElement('div');
        notification.className = 'badge-notification';
        notification.innerHTML = `
            <div class="badge-notification-content">
                <div class="badge-icon"><i data-lucide="${badge.icon}"></i></div>
                <div class="badge-info">
                    <h3>새 배지 획득!</h3>
                    <h4>${badge.name}</h4>
                    <p>${badge.description}</p>
                    <span class="badge-rarity ${badge.rarity}">${achievementSystem.getBadgeRarityName(badge.rarity)}</span>
                </div>
            </div>
        `;

        // body에 추가
        document.body.appendChild(notification);

        // Initialize Lucide icons for the notification
        lucide.createIcons();

        // 애니메이션 및 자동 제거
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);

        // 클릭하면 즉시 제거
        notification.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Phase 2-B: 대시보드 데이터 업데이트 함수들
    function updateDashboardData() {
        const userData = dataManager.getUserData();
        if (!userData) return;

        // 통계 업데이트
        updateStats(userData.stats);
        
        // 배지 업데이트
        updateBadgesDisplay(userData.badges);
        
        // 카테고리 진행률 업데이트
        updateCategoryProgress(userData.categoryProgress);
        
        // 저장된 문장 업데이트
        updateSavedSentences(userData.savedSentences);
    }

    function updateStats(stats) {
        document.getElementById('total-completed').textContent = stats.totalProblemsCompleted;
        document.getElementById('total-score').textContent = stats.totalScore.toLocaleString();
        document.getElementById('longest-streak').textContent = stats.longestStreak;
        document.getElementById('perfect-scores').textContent = stats.perfectScores;
    }

    function getRarityScore(rarity) {
        const rarityOrder = { 'legendary': 5, 'epic': 4, 'rare': 3, 'uncommon': 2, 'common': 1 };
        return rarityOrder[rarity] || 1;
    }

    function updateBadgesDisplay(userBadges) {
        const container = document.getElementById('badges-container');
        
        if (userBadges.length === 0) {
            container.style.display = 'none';
            // 배지 제목을 숨김
            const badgeTitle = container.previousElementSibling;
            if (badgeTitle && badgeTitle.classList.contains('section-title')) {
                badgeTitle.style.display = 'none';
            }
            return;
        } else {
            container.style.display = 'grid';
            // 배지 제목 표시
            const badgeTitle = container.previousElementSibling;
            if (badgeTitle && badgeTitle.classList.contains('section-title')) {
                badgeTitle.style.display = 'block';
            }
        }

        // 배지 유형별로 중복 제거 (가장 높은 희귀도만 표시)
        const badgesByType = {};
        userBadges.forEach(badge => {
            // progress 타입은 카테고리별로 구분, 다른 타입은 type만으로 구분
            let badgeKey;
            if (badge.type === 'progress' && badge.category) {
                badgeKey = `${badge.type}_${badge.category}`;
            } else {
                badgeKey = badge.type || badge.icon;
            }
            
            // 같은 type의 배지 중 가장 높은 희귀도만 보관
            if (!badgesByType[badgeKey] || 
                getRarityScore(badge.rarity) > getRarityScore(badgesByType[badgeKey].rarity)) {
                badgesByType[badgeKey] = badge;
            }
        });

        const uniqueBadges = Object.values(badgesByType);
        
        // 희귀도순으로 정렬
        const sortedBadges = uniqueBadges.sort((a, b) => {
            const rarityOrder = { 'legendary': 5, 'epic': 4, 'rare': 3, 'uncommon': 2, 'common': 1 };
            return (rarityOrder[b.rarity] || 1) - (rarityOrder[a.rarity] || 1);
        });

        // 배지 타입별 기본 아이콘 매핑
        const badgeTypeIcons = {
            'streak': 'flame',
            'perfect': 'gem',
            'total': 'medal',
            'special': 'file-text',
            'accuracy': 'target',
            'progress': {
                'movies': 'clapperboard',
                'songs': 'music',
                'books': 'book-open',
                'quotes': 'message-circle',
                'daily_travel_phrases': 'plane'
            }
        };

        container.innerHTML = sortedBadges.map(badge => {
            // 배지 타입에 맞는 기본 아이콘 사용
            let displayIcon;
            if (badge.type === 'progress' && badge.category && badgeTypeIcons.progress[badge.category]) {
                displayIcon = badgeTypeIcons.progress[badge.category];
            } else {
                displayIcon = badgeTypeIcons[badge.type] || badge.icon;
            }
            
            return `
                <div class="badge-item ${badge.type}-badge ${badge.rarity}" title="${badge.description}">
                    <div class="badge-icon"><i data-lucide="${displayIcon}"></i></div>
                    <div class="badge-name">${badge.name}</div>
                    <span class="badge-rarity ${badge.rarity}">${achievementSystem.getBadgeRarityName(badge.rarity)}</span>
                </div>
            `;
        }).join('');
        
        // Initialize Lucide icons for badges
        setTimeout(() => {
            lucide.createIcons();
        }, 0);
    }

    function updateCategoryProgress(categoryProgress) {
        const container = document.getElementById('category-progress-grid');
        
        const categoryIcons = {
            'movies': 'clapperboard',
            'songs': 'music', 
            'books': 'book-open',
            'quotes': 'message-circle',
            'daily_travel_phrases': 'plane',
            'all': 'sparkles'
        };

        const categoryNames = {
            'movies': 'Movies',
            'songs': 'Songs',
            'books': 'Books', 
            'quotes': 'Quotes',
            'daily_travel_phrases': 'Travel',
            'all': 'Random'
        };

        const filteredCategories = Object.entries(categoryProgress)
            .filter(([category, progress]) => category !== 'all' && progress.completed > 0);
        
        if (filteredCategories.length === 0) {
            container.style.display = 'none';
            const categoryTitle = container.previousElementSibling;
            if (categoryTitle && categoryTitle.classList.contains('section-title')) {
                categoryTitle.style.display = 'none';
            }
            return;
        } else {
            container.style.display = 'grid';
            const categoryTitle = container.previousElementSibling;
            if (categoryTitle && categoryTitle.classList.contains('section-title')) {
                categoryTitle.style.display = 'block';
            }
        }

        container.innerHTML = filteredCategories
            .map(([category, progress]) => {
                const completionRate = progress.attempted > 0 ? (progress.completed / progress.attempted * 100) : 0;
                
                return `
                    <div class="category-progress-item">
                        <div class="category-progress-header">
                            <div class="category-icon">${categoryIcons[category]}</div>
                            <div class="category-name">${categoryNames[category]}</div>
                        </div>
                        <div class="category-stats">
                            <span>해결: ${progress.completed}건</span>
                            <span></span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${completionRate}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
    }

    function updateSavedSentences(savedSentences) {
        const container = document.getElementById('saved-sentences-container');
        
        if (!container) {
            return;
        }
        
        // 저장된 문장 섹션은 항상 표시 (다른 섹션과 달리)
        container.style.display = 'block';
        const sentencesTitle = container.previousElementSibling;
        if (sentencesTitle && sentencesTitle.classList.contains('section-title')) {
            sentencesTitle.style.display = 'block';
        }
        
        if (savedSentences.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💾</div>
                    <p>저장된 문장이 없습니다.<br>게임에서 마음에 드는 문장을 저장해보세요!</p>
                </div>
            `;
            return;
        }

        // 최근 저장된 순으로 정렬
        const sortedSentences = savedSentences.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        container.innerHTML = sortedSentences.map(sentence => {
            const date = new Date(sentence.timestamp).toLocaleDateString('ko-KR');
            const categoryIcons = {
                'movies': 'clapperboard',
                'songs': 'music', 
                'books': 'book-open',
                'quotes': 'message-circle',
                'daily_travel_phrases': 'plane'
            };
            
            return `
                <div class="saved-sentence-item" data-sentence-id="${sentence.timestamp}">
                    <div class="saved-sentence-content">
                        <div class="saved-sentence-text">${sentence.sentence}</div>
                        <div class="saved-sentence-translation">${sentence.translation}</div>
                        <div class="saved-sentence-meta">
                            <span class="category-info">${categoryIcons[sentence.category]} ${sentence.source}</span>
                            <span class="date-info">${date}</span>
                        </div>
                    </div>
                    <button class="delete-sentence-btn" onclick="deleteSavedSentence('${sentence.timestamp}')" title="문장 삭제">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M3 6V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V6H3ZM5 8H19V18H5V8ZM10.5 4L13.5 4V6H10.5V4ZM6 4V6H4V4H6ZM18 4V6H20V4H18ZM8 10V16H10V10H8ZM14 10V16H16V10H14Z"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');
    }

    // 공유 버튼 이벤트 리스너
    if (shareBtn) {
        shareBtn.addEventListener('click', shareResult);
    }
    
    
    if (screenshotBtn) {
        screenshotBtn.addEventListener('click', saveScreenshot);
    }
    
    // Phase 2: 문장 수집 버튼 이벤트 리스너
    if (saveSentenceBtn) {
        saveSentenceBtn.addEventListener('click', saveSentence);
    }
    
    // 다크모드 토글 이벤트 리스너
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    if (darkModeToggleCategory) {
        darkModeToggleCategory.addEventListener('click', toggleDarkMode);
    }
    
    // 시스템 테마 변경 감지
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('darkMode') === null) {
            if (e.matches) {
                enableDarkMode();
            } else {
                disableDarkMode();
            }
        }
    });
    
    // Phase 2-B: 대시보드 버튼 이벤트 리스너
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', showDashboardModal);
    }
    
    // Phase 4-A: 게임 헤더의 대시보드 버튼 이벤트 리스너
    if (gameDashboardBtn) {
        gameDashboardBtn.addEventListener('click', showDashboardModal);
    }
    
    if (closeDashboardBtn) {
        closeDashboardBtn.addEventListener('click', hideDashboardModal);
    }

    // Phase 3: 인증 관련 이벤트 리스너
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (globalLeaderboardBtn) {
        globalLeaderboardBtn.addEventListener('click', showGlobalLeaderboard);
    }
    
    // Phase 4-A: 게임 헤더의 리더보드 버튼 이벤트 리스너
    if (gameLeaderboardBtn) {
        gameLeaderboardBtn.addEventListener('click', showGlobalLeaderboard);
    }
    
    // Phase 4-A: 모달에서의 대시보드 접근 버튼 이벤트 리스너
    if (successDashboardBtn) {
        successDashboardBtn.addEventListener('click', showDashboardModal);
    }
    
    if (gameoverDashboardBtn) {
        gameoverDashboardBtn.addEventListener('click', showDashboardModal);
    }
    
    // 리더보드 모달 이벤트 리스너들
    if (closeLeaderboardBtn) {
        closeLeaderboardBtn.addEventListener('click', hideGlobalLeaderboard);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', onLeaderboardFilterChange);
    }
    
    if (timeframeFilter) {
        timeframeFilter.addEventListener('change', onLeaderboardFilterChange);
    }
    
    if (refreshLeaderboardBtn) {
        refreshLeaderboardBtn.addEventListener('click', refreshLeaderboard);
    }
    
    if (retryLeaderboardBtn) {
        retryLeaderboardBtn.addEventListener('click', refreshLeaderboard);
    }
    
    // Modal close handlers
    if (dashboardModal) {
        dashboardModal.addEventListener('click', (e) => {
            if (e.target === dashboardModal) {
                hideDashboardModal();
            }
        });
    }
    
    // Phase 3: 인증 관련 이벤트 리스너 설정
    authManager.on('login', onUserLogin);
    authManager.on('logout', onUserLogout);
    authManager.on('error', onAuthError);
    
    // 페이지 로드 시 기존 로그인 상태 확인
    setTimeout(() => {
        if (authManager.isLoggedIn()) {
            const user = authManager.getUser();
            updateAuthUI(true, user);
        } else {
            updateAuthUI(false);
        }
    }, 1000); // AuthManager 초기화 완료 대기
    
    // 다크모드 초기화
    initializeDarkMode();
    
    // Phase 3: Feature Flag 초기화
    initializeFeatureFlags();
    
    // 초기 상태 설정
    changeGameState(GameState.CATEGORY_SELECTION);
    
    // ========================================
    // Phase 3: 인증 및 글로벌 기능 함수들
    // ========================================
    
    // Feature Flags 초기화
    function initializeFeatureFlags() {
        // 인증 섹션 표시/숨김
        if (authSection) {
            authSection.style.display = isFeatureEnabled('GOOGLE_AUTH') ? 'flex' : 'none';
        }
        
        // 글로벌 리더보드 버튼 표시/숨김
        if (globalLeaderboardBtn) {
            globalLeaderboardBtn.style.display = isFeatureEnabled('GLOBAL_LEADERBOARD') ? 'flex' : 'none';
        }
        
    }
    
    // 로그인 처리
    async function handleLogin() {
        try {
            await authManager.login();
        } catch (error) {
            
            // 웹뷰 환경 에러 처리
            if (error.message.includes('웹뷰')) {
                showWebViewErrorModal();
            } 
            // 팝업 차단 에러 처리
            else if (error.message.includes('팝업') || error.message.includes('blocked')) {
                showPopupBlockedModal();
            }
            // 기타 에러
            else {
                alert('로그인에 실패했습니다: ' + error.message);
            }
        }
    }
    
    function showWebViewErrorModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content error-modal">
                <h2><i data-lucide="alert-triangle"></i> 로그인 제한 안내</h2>
                <div class="error-content">
                    <p>현재 앱 내 브라우저(웹뷰)에서는 Google 로그인이 제한됩니다.</p>
                    <div class="solution-steps">
                        <h4>해결 방법:</h4>
                        <ol>
                            <li><strong>Safari/Chrome</strong> 등 기본 브라우저를 직접 실행</li>
                            <li>주소창에 현재 주소 입력</li>
                            <li>다시 Google 로그인 시도</li>
                        </ol>
                    </div>
                    <div class="help-text">
                        <small>💡 북마크에 추가하시면 다음에 쉽게 접속할 수 있습니다!</small>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn secondary copy-url-btn">주소 복사</button>
                    <button class="btn primary close-modal-btn">확인</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 이벤트 리스너 추가
        modal.querySelector('.copy-url-btn').addEventListener('click', copyCurrentUrl);
        modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.remove());
    }
    
    function showPopupBlockedModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content error-modal">
                <h2>🚫 팝업 차단 안내</h2>
                <div class="error-content">
                    <p>브라우저에서 팝업이 차단되어 로그인할 수 없습니다.</p>
                    <div class="solution-steps">
                        <h4>해결 방법:</h4>
                        <ol>
                            <li>브라우저 주소창 옆 <strong>팝업 차단 아이콘</strong> 클릭</li>
                            <li><strong>"항상 허용"</strong> 선택</li>
                            <li>페이지 새로고침 후 다시 시도</li>
                        </ol>
                    </div>
                    <div class="alternative">
                        <p>또는 아래 버튼으로 <strong>리다이렉트 방식</strong>으로 로그인할 수 있습니다:</p>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn secondary redirect-login-btn">리다이렉트 로그인</button>
                    <button class="btn secondary reload-page-btn">페이지 새로고침</button>
                    <button class="btn primary close-modal-btn">닫기</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 이벤트 리스너 추가
        modal.querySelector('.redirect-login-btn').addEventListener('click', tryRedirectLogin);
        modal.querySelector('.reload-page-btn').addEventListener('click', () => window.location.reload());
        modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.remove());
    }
    
    function copyCurrentUrl() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('주소가 복사되었습니다! 기본 브라우저에서 붙여넣기 해주세요.');
        }).catch(() => {
            // 클립보드 API 실패 시 대체 방법
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('주소가 복사되었습니다! 기본 브라우저에서 붙여넣기 해주세요.');
        });
    }
    
    async function tryRedirectLogin() {
        try {
            await authManager.tryRedirectLogin();
        } catch (error) {
            alert('리다이렉트 로그인 실패: ' + error.message);
        }
    }
    
    
    // 로그아웃 처리
    async function handleLogout() {
        try {
            await authManager.logout();
        } catch (error) {
        }
    }
    
    // 사용자 로그인 성공 이벤트
    function onUserLogin(user) {
        updateAuthUI(true, user);
        
        // 실패한 업로드 재시도
        if (isFeatureEnabled('SCORE_UPLOAD')) {
            setTimeout(() => retryFailedUploads(), 1000);
        }
    }
    
    // 사용자 로그아웃 이벤트
    function onUserLogout(user) {
        updateAuthUI(false);
        
        // TODO: 점수 업로드 비활성화 등 추가 로직
    }
    
    // 인증 오류 이벤트
    function onAuthError(error) {
        // 사용자에게 친화적인 오류 메시지 표시
        // 심각한 오류가 아닌 경우 조용히 처리
    }
    
    // 인증 UI 업데이트
    function updateAuthUI(isLoggedIn, user = null) {
        
        if (!loginBtn || !userProfile) {
            return;
        }
        
        if (isLoggedIn && user) {
            // 로그인 상태 UI
            loginBtn.style.display = 'none';
            userProfile.style.display = 'flex';
            
            if (userAvatar && (user.avatar_url || user.avatar)) {
                const avatarUrl = user.avatar_url || user.avatar;
                userAvatar.src = avatarUrl;
                userAvatar.style.display = 'block';
                
                // 이미지 로드 에러 처리
                userAvatar.onerror = () => {
                    userAvatar.style.display = 'none';
                };
                
                userAvatar.onload = () => {
                };
            } else {
            }
            
            if (userName && user.display_name) {
                userName.textContent = user.display_name;
            } else if (userName) {
                // display_name이 없으면 사용자명 숨김
                userName.textContent = '';
                userName.style.display = 'none';
            }
        } else {
            // 로그아웃 상태 UI
            loginBtn.style.display = 'flex';
            userProfile.style.display = 'none';
            
            if (userAvatar) {
                userAvatar.src = '';
            }
            
            if (userName) {
                userName.textContent = '';
            }
        }
    }
    
    // 글로벌 리더보드 표시
    function showGlobalLeaderboard() {
        if (!isFeatureEnabled('LEADERBOARD_UI')) {
            alert('리더보드 기능이 아직 활성화되지 않았습니다.');
            return;
        }
        
        if (globalLeaderboardModal) {
            globalLeaderboardModal.style.display = 'flex';
            loadLeaderboardData();
        }
    }
    
    // 글로벌 리더보드 숨김
    function hideGlobalLeaderboard() {
        if (globalLeaderboardModal) {
            globalLeaderboardModal.style.display = 'none';
        }
    }
    
    // 리더보드 필터 변경 처리
    function onLeaderboardFilterChange() {
        loadLeaderboardData();
    }
    
    // 리더보드 새로고침
    function refreshLeaderboard() {
        loadLeaderboardData();
    }
    
    // 리더보드 데이터 로드
    async function loadLeaderboardData() {
        try {
            showLeaderboardLoading(true);
            
            const category = categoryFilter?.value || 'all';
            const timeframe = timeframeFilter?.value || 'all';
            
            let url = `${CONFIG.API_BASE_URL}/api/leaderboard`;
            if (category !== 'all') {
                url += `/${category}`;
            }
            
            const params = new URLSearchParams();
            if (timeframe !== 'all') {
                params.append('timeframe', timeframe);
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`리더보드 로드 실패: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                displayLeaderboardData(data);
                showLeaderboardError(false);
            } else {
                throw new Error(data.error || '리더보드 데이터 로드 실패');
            }
            
        } catch (error) {
            showLeaderboardError(true);
        } finally {
            showLeaderboardLoading(false);
        }
    }
    
    // 리더보드 데이터 표시
    function displayLeaderboardData(data) {
        // 통계 업데이트
        if (totalPlayersSpan) totalPlayersSpan.textContent = data.stats?.totalPlayers || 0;
        if (totalGamesSpan) totalGamesSpan.textContent = data.stats?.totalGames || 0;
        if (averageScoreSpan) averageScoreSpan.textContent = Math.round(data.stats?.averageScore || 0);
        
        // 리더보드 리스트 업데이트
        if (leaderboardList) {
            leaderboardList.innerHTML = '';
            
            if (data.leaderboard && data.leaderboard.length > 0) {
                data.leaderboard.forEach((player, index) => {
                    const item = createLeaderboardItem(player, index + 1);
                    leaderboardList.appendChild(item);
                });
            } else {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-message';
                emptyMessage.innerHTML = `
                    <p style="text-align: center; color: #6b7280; padding: 40px;">
                        <i data-lucide="trophy"></i> 아직 등록된 점수가 없습니다.<br>
                        첫 번째 도전자가 되어보세요!
                    </p>
                `;
                leaderboardList.appendChild(emptyMessage);
            }
        }
        
        // Initialize Lucide icons for leaderboard
        setTimeout(() => {
            lucide.createIcons();
        }, 0);
    }
    
    // 리더보드 아이템 생성
    function createLeaderboardItem(player, rank) {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        // 현재 사용자인지 확인
        const currentUser = authManager.getUser();
        if (currentUser && player.user_id === currentUser.id) {
            item.classList.add('current-user');
        }
        
        const rankClass = rank <= 3 ? 'rank top-3' : 'rank';
        const rankIcon = rank === 1 ? '<i data-lucide="crown"></i>' : rank === 2 ? '<i data-lucide="medal"></i>' : rank === 3 ? '<i data-lucide="award"></i>' : '';
        
        item.innerHTML = `
            <div class="${rankClass}">
                ${rankIcon || rank}
            </div>
            <img class="player-avatar" src="${player.user?.avatarUrl || '/default-avatar.png'}" 
                 alt="${player.user?.displayName}" 
                 onerror="this.src='/default-avatar.png'">
            <div class="player-info">
                <div class="player-name">${player.user?.displayName || 'Anonymous'}</div>
                <div class="player-details">
                    ${player.gamesPlayed} games • 
                    ${player.totalHintsUsed || 0} hints • 
                    ${player.perfectScores} perfect scores
                </div>
            </div>
            <div class="score">${player.totalScore}</div>
        `;
        
        return item;
    }
    
    // 로딩 상태 표시/숨김
    function showLeaderboardLoading(show) {
        if (leaderboardLoading) {
            leaderboardLoading.style.display = show ? 'flex' : 'none';
        }
        if (leaderboardList) {
            leaderboardList.style.display = show ? 'none' : 'block';
        }
    }
    
    // 에러 상태 표시/숨김
    function showLeaderboardError(show) {
        if (leaderboardError) {
            leaderboardError.style.display = show ? 'block' : 'none';
        }
        if (leaderboardList) {
            leaderboardList.style.display = show ? 'none' : 'block';
        }
    }
    
    // 글로벌 점수 업로드
    async function uploadScoreToGlobal(scoreData) {
        try {
            
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/scores`, {
                method: 'POST',
                headers: authManager.getAuthHeaders(),
                body: JSON.stringify(scoreData)
            });
            
            if (!response.ok) {
                throw new Error(`점수 업로드 실패: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                
                // 업로드 성공 시 사용자에게 알림 (옵션)
                if (isFeatureEnabled('DEBUG_MODE')) {
                    showScoreUploadNotification(result);
                }
            } else {
                throw new Error(result.error || '점수 업로드 실패');
            }
            
        } catch (error) {
            
            // 실패 시 로컬에 저장하여 나중에 재시도
            saveFailedUpload(scoreData);
        }
    }
    
    // 업로드 실패한 점수 로컬 저장
    function saveFailedUpload(scoreData) {
        try {
            const failedUploads = JSON.parse(localStorage.getItem('wordcrack_failed_uploads') || '[]');
            failedUploads.push({
                ...scoreData,
                timestamp: Date.now(),
                retryCount: 0
            });
            
            // 최대 10개까지만 저장
            if (failedUploads.length > 10) {
                failedUploads.shift();
            }
            
            localStorage.setItem('wordcrack_failed_uploads', JSON.stringify(failedUploads));
            
        } catch (error) {
        }
    }
    
    // 실패한 업로드 재시도
    async function retryFailedUploads() {
        if (!authManager.isLoggedIn()) return;
        
        try {
            const failedUploads = JSON.parse(localStorage.getItem('wordcrack_failed_uploads') || '[]');
            if (failedUploads.length === 0) return;
            
            console.log(`[Score] 실패한 업로드 ${failedUploads.length}개 재시도 중...`);
            
            const successful = [];
            const stillFailed = [];
            
            for (const upload of failedUploads) {
                if (upload.retryCount >= CONFIG.GAME.SCORE_UPLOAD_RETRY) {
                    // 최대 재시도 횟수 초과 - 삭제
                    console.log('[Score] 최대 재시도 횟수 초과, 삭제:', upload);
                    continue;
                }
                
                // 데이터 유효성 검사
                if (!upload.category || !upload.score || upload.score < 0) {
                    console.log('[Score] 잘못된 데이터 삭제:', upload);
                    continue;
                }
                
                try {
                    const response = await fetch(`${CONFIG.API_BASE_URL}/api/scores`, {
                        method: 'POST',
                        headers: authManager.getAuthHeaders(),
                        body: JSON.stringify({
                            category: upload.category,
                            score: upload.score,
                            hintsUsed: upload.hintsUsed || 0,
                            perfectScore: upload.perfectScore || false,
                            playTime: upload.playTime || 0,
                            sentence: upload.sentence || ''
                        })
                    });
                    
                    if (response.ok) {
                        successful.push(upload);
                        console.log('[Score] 업로드 성공:', upload.category, upload.score);
                    } else {
                        const errorText = await response.text();
                        console.log('[Score] 업로드 실패:', response.status, errorText);
                        upload.retryCount = (upload.retryCount || 0) + 1;
                        stillFailed.push(upload);
                    }
                    
                } catch (error) {
                    console.log('[Score] 업로드 오류:', error.message);
                    upload.retryCount = (upload.retryCount || 0) + 1;
                    stillFailed.push(upload);
                }
            }
            
            // 업데이트된 실패 목록 저장
            localStorage.setItem('wordcrack_failed_uploads', JSON.stringify(stillFailed));
            
            if (successful.length > 0) {
                console.log(`[Score] ${successful.length}개 업로드 성공`);
            }
            
        } catch (error) {
            console.error('[Score] 실패한 업로드 재시도 중 오류:', error);
            // 손상된 데이터가 있을 경우 초기화
            localStorage.removeItem('wordcrack_failed_uploads');
        }
    }
    
    // 개발자용: 실패한 업로드 데이터 관리
    window.debugFailedUploads = {
        clear: function() {
            localStorage.removeItem('wordcrack_failed_uploads');
            console.log('[Score] 실패한 업로드 데이터 초기화됨');
        },
        view: function() {
            const data = JSON.parse(localStorage.getItem('wordcrack_failed_uploads') || '[]');
            console.log('[Score] 실패한 업로드 데이터:', data);
            return data;
        }
    };
    
    // 점수 업로드 성공 알림 (옵션)
    function showScoreUploadNotification(result) {
        // 개발 모드에서만 표시되는 간단한 알림
        const notification = document.createElement('div');
        notification.textContent = `점수 업로드 완료! 순위: ${result.rank || 'N/A'}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // 페이드 인
        setTimeout(() => notification.style.opacity = '1', 100);
        
        // 3초 후 제거
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // 저장된 문장 삭제 함수 (전역 함수로 만들기 위해 window에 등록)
    window.deleteSavedSentence = function(timestamp) {
        // DataManager를 통해 삭제 (로컬스토리지도 자동 갱신됨)
        const success = dataManager.removeSavedSentenceByTimestamp(timestamp);
        
        if (success) {
            // UI 업데이트
            const updatedSentences = dataManager.getSavedSentences();
            updateSavedSentences(updatedSentences);
            // 문장 삭제 완료
        } else {
        }
    };

    // Phase 4-A: 페이지 로드 시 게임 상태 복원 확인
    async function initializeGameStateRestore() {
        try {
            const savedState = await gameStateManager.checkAndRestore();
            if (savedState) {
                await restoreGameState(savedState);
            }
        } catch (error) {
            console.error('[GameState] 초기화 중 오류:', error);
        }
    }

    // 페이지 로드 완료 후 게임 상태 복원 확인
    setTimeout(initializeGameStateRestore, 100);

    // 페이지 언로드 시 게임 상태 저장
    window.addEventListener('beforeunload', () => {
        if (selectedCategory && currentProblem) {
            saveCurrentGameState(true); // 강제 저장
        }
        gameStateManager.stopAutoSave();
    });
    
    // Initialize Lucide icons
    lucide.createIcons();
    
});