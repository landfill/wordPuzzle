document.addEventListener('DOMContentLoaded', () => {
    const problemArea = document.querySelector('.problem-area');
    const keyboardArea = document.querySelector('.keyboard-area');
    const livesDisplay = document.querySelector('.lives-display');
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

    const problems = [
        {
            sentence: "The quick brown fox jumps over the lazy dog in the sunny afternoon.",
            source: "Classic pangram",
            translation: "빠른 갈색 여우가 게으른 개를 뛰어넘어 햇살 가득한 오후에 달려간다.",
            blanks: [
                { char: 'T', index: 0 },
                { char: 'h', index: 1 },
                { char: 'e', index: 2 },
                { char: 'q', index: 4 },
                { char: 'u', index: 5 },
                { char: 'i', index: 6 },
                { char: 'c', index: 7 },
                { char: 'k', index: 8 },
                { char: 'b', index: 10 },
                { char: 'r', index: 11 },
                { char: 'o', index: 12 },
                { char: 'w', index: 13 },
                { char: 'n', index: 14 }
            ]
        },
        {
            sentence: "Learning English through interactive puzzles makes studying fun and engaging.",
            source: "Educational quote",
            translation: "상호작용하는 퍼즐을 통해 영어를 배우는 것은 공부를 재미있고 흥미롭게 만든다.",
            blanks: [
                { char: 'L', index: 0 },
                { char: 'e', index: 1 },
                { char: 'a', index: 2 },
                { char: 'r', index: 3 },
                { char: 'n', index: 4 },
                { char: 'i', index: 5 },
                { char: 'n', index: 6 },
                { char: 'g', index: 7 },
                { char: 'E', index: 9 },
                { char: 'n', index: 10 },
                { char: 'g', index: 11 },
                { char: 'l', index: 12 }
            ]
        },
        {
            sentence: "Adventure awaits those who dare to explore beyond their comfort zone.",
            source: "Motivational saying",
            translation: "모험은 자신의 안전지대를 벗어나 탐험할 용기가 있는 사람들을 기다린다.",
            blanks: [
                { char: 'A', index: 0 },
                { char: 'd', index: 1 },
                { char: 'v', index: 2 },
                { char: 'e', index: 3 },
                { char: 'n', index: 4 },
                { char: 't', index: 5 },
                { char: 'u', index: 6 },
                { char: 'r', index: 7 },
                { char: 'e', index: 8 },
                { char: 'a', index: 10 },
                { char: 'w', index: 11 },
                { char: 'a', index: 12 }
            ]
        },
        {
            sentence: "Technology has revolutionized the way we communicate and share information.",
            source: "Modern society observation",
            translation: "기술은 우리가 소통하고 정보를 공유하는 방식을 혁신적으로 변화시켰다.",
            blanks: [
                { char: 'T', index: 0 },
                { char: 'e', index: 1 },
                { char: 'c', index: 2 },
                { char: 'h', index: 3 },
                { char: 'n', index: 4 },
                { char: 'o', index: 5 },
                { char: 'l', index: 6 },
                { char: 'o', index: 7 },
                { char: 'g', index: 8 },
                { char: 'y', index: 9 },
                { char: 'h', index: 11 },
                { char: 'a', index: 12 }
            ]
        },
        {
            sentence: "Creativity flourishes when imagination meets determination and hard work.",
            source: "Artistic philosophy",
            translation: "창의성은 상상력이 결단력과 노력과 만날 때 꽃을 피운다.",
            blanks: [
                { char: 'C', index: 0 },
                { char: 'r', index: 1 },
                { char: 'e', index: 2 },
                { char: 'a', index: 3 },
                { char: 't', index: 4 },
                { char: 'i', index: 5 },
                { char: 'v', index: 6 },
                { char: 'i', index: 7 },
                { char: 't', index: 8 },
                { char: 'y', index: 9 },
                { char: 'f', index: 11 },
                { char: 'l', index: 12 }
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
        charToHintNumber.clear();
        isReading = false;
        clearWordHighlights();
        loadProblem(currentProblemIndex);
        createKeyboard();
        updateKeyboardState();
        updateHintVisibility();
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
        charToHintNumber.clear();

        const problem = problems[index];
        currentSentence = problem.sentence;
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

        // 같은 글자에 대해 같은 힌트 번호 할당
        let hintCounter = 1;
        const uniqueChars = [...new Set(problem.blanks.map(b => b.char.toLowerCase()))];
        uniqueChars.forEach(char => {
            charToHintNumber.set(char, hintCounter++);
        });

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
            wordGroup.dataset.wordIndex = wordIndex;
            
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
                    hintSpan.textContent = charToHintNumber.get(blankInfo.char.toLowerCase());

                    charSlot.appendChild(blankSpan);
                    charSlot.appendChild(hintSpan);
                    problemBlanks.push(blankSpan);
                    blankCounter++;
                    hasActiveBlank = true;
                } else {
                    const lowerChar = char.toLowerCase();
                    if (lowerChar.match(/[a-z]/)) {
                        const charSpan = document.createElement('div');
                        charSpan.classList.add('fixed-char-text');
                        charSpan.textContent = char.toUpperCase();

                        const hintSpan = document.createElement('div');
                        hintSpan.classList.add('hint-number');
                        
                        // 빈칸 글자와 같은 글자인 경우 힌트 번호 표시
                        if (charToHintNumber.has(lowerChar)) {
                            hintSpan.textContent = charToHintNumber.get(lowerChar);
                            hintSpan.dataset.char = lowerChar;
                        } else {
                            // 빈칸이 아닌 글자도 같은 높이 유지를 위해 투명한 힌트 추가
                            hintSpan.style.visibility = 'hidden';
                            hintSpan.textContent = '0';
                            usedCharsInProblem.add(lowerChar);
                        }

                        charSlot.appendChild(charSpan);
                        charSlot.appendChild(hintSpan);
                    } else {
                        const charSpan = document.createElement('div');
                        charSpan.classList.add('fixed-char-text');
                        charSpan.textContent = char;
                        
                        // 특수문자도 같은 높이 유지
                        const hintSpan = document.createElement('div');
                        hintSpan.classList.add('hint-number');
                        hintSpan.style.visibility = 'hidden';
                        hintSpan.textContent = '0';
                        
                        charSlot.appendChild(charSpan);
                        charSlot.appendChild(hintSpan);
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

    function updateHintVisibility() {
        // 모든 힌트 번호 요소 찾기
        document.querySelectorAll('.hint-number[data-char]').forEach(hintSpan => {
            const char = hintSpan.dataset.char;
            const totalRequired = requiredBlankChars.get(char) || 0;
            const currentFilled = correctlyFilledBlankChars.get(char) || 0;

            if (totalRequired > 0 && currentFilled === totalRequired) {
                hintSpan.style.visibility = 'hidden';
            } else {
                hintSpan.style.visibility = 'visible';
            }
        });

        // 빈칸의 힌트 번호도 업데이트
        problemBlanks.forEach(blank => {
            const hintSpan = blank.parentElement.querySelector('.hint-number');
            if (hintSpan && blank.classList.contains('correct')) {
                const char = blank.dataset.correctChar;
                const totalRequired = requiredBlankChars.get(char) || 0;
                const currentFilled = correctlyFilledBlankChars.get(char) || 0;

                if (totalRequired > 0 && currentFilled === totalRequired) {
                    hintSpan.style.visibility = 'hidden';
                } else {
                    hintSpan.style.visibility = 'visible';
                }
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
            updateHintVisibility();

            // 다음 빈칸으로 이동하거나 완성 체크
            const nextBlankIndex = findNextEmptyBlank();
            if (nextBlankIndex !== -1) {
                setActiveBlank(nextBlankIndex);
            } else {
                // 모든 빈칸이 채워졌는지 확인
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

    function findNextEmptyBlank() {
        for (let i = 0; i < problemBlanks.length; i++) {
            const blank = problemBlanks[i];
            if (!blank.classList.contains('correct')) {
                return i;
            }
        }
        return -1; // 모든 빈칸이 채워짐
    }

    function checkPuzzleCompletion() {
        const allFilled = problemBlanks.every(blank => blank.classList.contains('correct'));
        console.log('Checking puzzle completion:', allFilled); // 디버깅용
        
        if (allFilled) {
            console.log('Puzzle completed! Showing modal...'); // 디버깅용
            setTimeout(() => {
                showSuccessModal();
            }, 500);
        }
    }

    function showSuccessModal() {
        console.log('showSuccessModal called'); // 디버깅용
        const problem = problems[currentProblemIndex];
        
        const originalSentenceEl = document.querySelector('.original-sentence');
        const sourceEl = document.querySelector('.source');
        const translationEl = document.querySelector('.korean-translation');
        
        if (originalSentenceEl) originalSentenceEl.textContent = problem.sentence;
        if (sourceEl) sourceEl.textContent = `출처: ${problem.source}`;
        if (translationEl) translationEl.textContent = problem.translation;
        
        if (successModal) {
            successModal.style.display = 'flex';
            console.log('Modal displayed'); // 디버깅용
        } else {
            console.error('Success modal not found!'); // 디버깅용
        }
    }

    function hideSuccessModal() {
        if (successModal) {
            successModal.style.display = 'none';
        }
    }

    function clearWordHighlights() {
        document.querySelectorAll('.word-group').forEach(group => {
            group.classList.remove('reading-highlight');
        });
    }

    function highlightWord(wordIndex) {
        clearWordHighlights();
        const wordGroup = document.querySelector(`[data-word-index="${wordIndex}"]`);
        if (wordGroup) {
            wordGroup.classList.add('reading-highlight');
        }
    }

    function speakSentence() {
        if (isReading) {
            speechSynthesis.cancel();
            clearWordHighlights();
            isReading = false;
            return;
        }

        if ('speechSynthesis' in window) {
            const words = currentSentence.split(' ');
            let currentWordIndex = 0;
            isReading = true;

            function speakNextWord() {
                if (currentWordIndex >= words.length || !isReading) {
                    clearWordHighlights();
                    isReading = false;
                    return;
                }

                highlightWord(currentWordIndex);
                
                const utterance = new SpeechSynthesisUtterance(words[currentWordIndex]);
                utterance.lang = 'en-US';
                utterance.rate = 0.8; // 적당한 속도로 조정
                utterance.pitch = 1.0;
                utterance.volume = 1.0;

                utterance.onend = () => {
                    currentWordIndex++;
                    setTimeout(() => {
                        speakNextWord();
                    }, 200); // 단어 사이 200ms 간격
                };

                utterance.onerror = () => {
                    clearWordHighlights();
                    isReading = false;
                };

                speechSynthesis.speak(utterance);
            }

            speakNextWord();
        } else {
            alert('죄송합니다. 이 브라우저는 음성 재생을 지원하지 않습니다.');
        }
    }

    // Event listeners
    if (newQuizBtn) {
        newQuizBtn.addEventListener('click', () => {
            hideSuccessModal();
            initializeGame();
        });
    }

    if (listenBtn) {
        listenBtn.addEventListener('click', () => {
            speakSentence();
        });
    }

    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                hideSuccessModal();
            }
        });
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
        } else if (e.key === 'Escape') {
            hideSuccessModal();
        }
    });

    initializeGame();
});