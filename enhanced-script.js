// 기존 script.js에 통합할 수 있는 향상된 버전 
import ContentGenerator from './content-generator.js';
import CONTENT_DATABASE from './content-database.js';

document.addEventListener('DOMContentLoaded', () => {
    // 기존 변수들...
    const problemArea = document.querySelector('.problem-area');
    const keyboardArea = document.querySelector('.keyboard-area');
    const livesDisplay = document.querySelector('.lives-display');
    const sourceDisplay = document.querySelector('.source-display');
    const successModal = document.getElementById('success-modal');
    const newQuizBtn = document.getElementById('new-quiz-btn');
    const listenBtn = document.getElementById('listen-btn');

    let lives = 5;
    let currentProblemIndex = 0;
    let activeBlankIndex = -1;
    let problemBlanks = [];
    let usedCharsInProblem = new Set();
    let requiredBlankChars = new Map();
    let correctlyFilledBlankChars = new Map();
    let charToHintNumber = new Map();
    let currentSentence = '';
    let isReading = false;
    let currentUtterance = null;
    let voiceToggle = false;
    let availableVoices = [];

    // 새로운 콘텐츠 생성기
    const contentGenerator = new ContentGenerator();
    
    // 데이터베이스 콘텐츠 로드
    Object.keys(CONTENT_DATABASE).forEach(category => {
        Object.keys(CONTENT_DATABASE[category]).forEach(source => {
            contentGenerator.addContent(category, source, CONTENT_DATABASE[category][source]);
        });
    });

    // 자동 빈칸 생성 함수
    function generateBlanksForSentence(sentence, difficulty = 'medium') {
        const words = sentence.split(' ');
        const blanks = [];
        let charIndex = 0;
        let hintCounter = 1;
        const charToHint = new Map();

        // 난이도별 빈칸 비율
        const blankRatio = {
            easy: 0.3,    // 30% 빈칸
            medium: 0.5,  // 50% 빈칸
            hard: 0.7     // 70% 빈칸
        };

        const targetRatio = blankRatio[difficulty] || 0.5;

        // 더 균등한 분포를 위한 개선된 알고리즘
        const totalChars = sentence.replace(/[^a-zA-Z]/g, '').length;
        const targetBlanks = Math.floor(totalChars * targetRatio);
        const charPositions = [];

        // 모든 알파벳 위치 수집
        let pos = 0;
        for (let i = 0; i < sentence.length; i++) {
            if (sentence[i].match(/[a-zA-Z]/)) {
                charPositions.push({ char: sentence[i], index: i, position: pos++ });
            }
        }

        // 균등 분포로 빈칸 선택
        const selectedPositions = [];
        const step = Math.floor(charPositions.length / targetBlanks);
        
        for (let i = 0; i < targetBlanks && i * step < charPositions.length; i++) {
            const baseIndex = i * step;
            // 약간의 랜덤성 추가 (±2 범위)
            const randomOffset = Math.floor(Math.random() * 5) - 2;
            const finalIndex = Math.max(0, Math.min(charPositions.length - 1, baseIndex + randomOffset));
            selectedPositions.push(charPositions[finalIndex]);
        }

        // 빈칸 생성
        selectedPositions.forEach(pos => {
            const lowerChar = pos.char.toLowerCase();
            
            if (!charToHint.has(lowerChar)) {
                charToHint.set(lowerChar, hintCounter++);
            }
            
            blanks.push({
                char: pos.char,
                index: pos.index,
                hintNum: charToHint.get(lowerChar)
            });
        });

        return blanks.sort((a, b) => a.index - b.index);
    }

    // 새로운 문제 생성 함수
    function generateNewProblem() {
        // 랜덤하게 카테고리와 난이도 선택
        const categories = ['movies', 'books', 'quotes', 'songs'];
        const difficulties = ['easy', 'medium', 'hard'];
        
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        
        return contentGenerator.generateRandomProblem(randomCategory, randomDifficulty);
    }

    // 기존 initializeGame 함수 수정
    function initializeGame() {
        lives = 5;
        updateLivesDisplay();
        
        // 새로운 문제 생성
        const newProblem = generateNewProblem();
        currentSentence = newProblem.sentence;
        
        // 임시로 problems 배열에 추가 (기존 코드와 호환성 위해)
        const problems = [newProblem];
        currentProblemIndex = 0;
        
        usedCharsInProblem.clear();
        requiredBlankChars.clear();
        correctlyFilledBlankChars.clear();
        charToHintNumber.clear();
        isReading = false;
        currentUtterance = null;
        clearWordHighlights();
        
        loadProblem(0, problems);
        updateSourceDisplay(problems);
        createKeyboard();
        updateKeyboardState();
        updateHintVisibility();
    }

    // 기존 함수들은 그대로 유지하되, problems 매개변수 추가
    function updateSourceDisplay(problems) {
        const problem = problems[currentProblemIndex];
        sourceDisplay.textContent = `${problem.source} (${problem.category})`;
    }

    function loadProblem(index, problems) {
        // 기존 loadProblem 로직과 동일하지만 problems 매개변수 사용
        // ... (기존 코드 유지)
    }

    // 나머지 함수들은 기존과 동일...
    // (음성, 키보드, 모달 등의 함수들)

    // 게임 시작
    initializeGame();
});