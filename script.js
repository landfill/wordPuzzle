document.addEventListener('DOMContentLoaded', () => {
    const problemArea = document.querySelector('.problem-area');
    const keyboardArea = document.querySelector('.keyboard-area');
    const livesDisplay = document.querySelector('.lives-display');
    const sourceDisplay = document.querySelector('.source-display');
    const successModal = document.getElementById('success-modal');
    const newQuizBtn = document.getElementById('new-quiz-btn');
    const listenBtn = document.getElementById('listen-btn');

    let lives = 5;
    let currentProblem = null;
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

    // content-database.js에서 데이터 가져오기
    const CONTENT_DATABASE = window.CONTENT_DATABASE || {
        movies: {
            'Toy Story': [
                { sentence: "To infinity and beyond!", translation: "무한대 그 너머로!", difficulty: 'easy' },
                { sentence: "You've got a friend in me.", translation: "당신에게는 나라는 친구가 있어요.", difficulty: 'medium' }
            ]
        }
    };

    const keyboardLayout = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];

    // 자동 빈칸 생성 함수
    function generateBlanks(sentence, difficulty = 'medium') {
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

        // 모든 알파벳 위치 수집
        const charPositions = [];
        let pos = 0;
        for (let i = 0; i < sentence.length; i++) {
            if (sentence[i].match(/[a-zA-Z]/)) {
                charPositions.push({ char: sentence[i], index: i, position: pos++ });
            }
        }

        // 균등 분포로 빈칸 선택
        const totalChars = charPositions.length;
        const targetBlanks = Math.floor(totalChars * targetRatio);
        const selectedPositions = [];
        
        if (targetBlanks > 0) {
            const step = totalChars / targetBlanks;
            
            for (let i = 0; i < targetBlanks; i++) {
                const baseIndex = Math.floor(i * step);
                // 약간의 랜덤성 추가 (±1 범위)
                const randomOffset = Math.floor(Math.random() * 3) - 1;
                const finalIndex = Math.max(0, Math.min(totalChars - 1, baseIndex + randomOffset));
                
                // 중복 방지
                if (!selectedPositions.some(p => p.index === charPositions[finalIndex].index)) {
                    selectedPositions.push(charPositions[finalIndex]);
                }
            }
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

    // 랜덤 문제 선택 함수
    function getRandomProblem() {
        const categories = Object.keys(CONTENT_DATABASE);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        const sources = Object.keys(CONTENT_DATABASE[randomCategory]);
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        
        const sentences = CONTENT_DATABASE[randomCategory][randomSource];
        const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
        
        // 자동으로 빈칸 생성
        const blanks = generateBlanks(randomSentence.sentence, randomSentence.difficulty);
        
        return {
            sentence: randomSentence.sentence,
            source: randomSource,
            translation: randomSentence.translation,
            category: randomCategory,
            difficulty: randomSentence.difficulty,
            blanks: blanks
        };
    }

    // 음성 로드 함수
    function loadVoices() {
        availableVoices = speechSynthesis.getVoices();
        console.log('Available voices:', availableVoices.map(v => `${v.name} (${v.lang}) - ${v.gender || 'unknown'}`));
    }

    // 음성 선택 함수
    function selectVoice(isFemale = false) {
        if (availableVoices.length === 0) {
            loadVoices();
        }

        // 영어 음성만 필터링
        const englishVoices = availableVoices.filter(voice => 
            voice.lang.startsWith('en-') && voice.lang !== 'en-IN'
        );

        if (isFemale) {
            // 여성 음성 우선 선택
            const femaleVoices = englishVoices.filter(voice => {
                const name = voice.name.toLowerCase();
                return (
                    name.includes('female') || 
                    name.includes('woman') ||
                    name.includes('girl') ||
                    name.includes('samantha') ||
                    name.includes('victoria') ||
                    name.includes('karen') ||
                    name.includes('susan') ||
                    name.includes('allison') ||
                    name.includes('ava') ||
                    name.includes('serena') ||
                    name.includes('zira') ||
                    name.includes('hazel') ||
                    (voice.name.includes('Microsoft') && (
                        name.includes('aria') ||
                        name.includes('jenny') ||
                        name.includes('michelle')
                    )) ||
                    (voice.name.includes('Google') && name.includes('female'))
                );
            });

            if (femaleVoices.length > 0) {
                const preferredFemaleVoices = femaleVoices.filter(voice => {
                    const name = voice.name.toLowerCase();
                    return name.includes('samantha') || name.includes('ava') || name.includes('allison');
                });
                
                return preferredFemaleVoices.length > 0 ? preferredFemaleVoices[0] : femaleVoices[0];
            }
        }

        // 남성 음성은 디폴트 설정 사용
        return englishVoices.length > 0 ? englishVoices[0] : availableVoices[0];
    }

    function initializeGame() {
        lives = 5;
        updateLivesDisplay();
        
        // 새로운 랜덤 문제 생성
        currentProblem = getRandomProblem();
        currentSentence = currentProblem.sentence;
        
        usedCharsInProblem.clear();
        requiredBlankChars.clear();
        correctlyFilledBlankChars.clear();
        charToHintNumber.clear();
        isReading = false;
        currentUtterance = null;
        clearWordHighlights();
        
        loadProblem();
        updateSourceDisplay();
        createKeyboard();
        updateKeyboardState();
        updateHintVisibility();
    }

    function updateLivesDisplay() {
        livesDisplay.innerHTML = '';
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

    function updateSourceDisplay() {
        sourceDisplay.textContent = `${currentProblem.source} (${currentProblem.category})`;
    }

    function loadProblem() {
        problemArea.innerHTML = '';
        problemBlanks = [];
        usedCharsInProblem.clear();
        requiredBlankChars.clear();
        correctlyFilledBlankChars.clear();
        charToHintNumber.clear();

        const words = currentProblem.sentence.split(' ');
        
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

        // 빈칸 글자들의 힌트 번호 맵 생성
        const blankCharToHintMap = new Map();
        currentProblem.blanks.forEach(blank => {
            const char = blank.char.toLowerCase();
            if (!blankCharToHintMap.has(char)) {
                blankCharToHintMap.set(char, blank.hintNum);
            }
        });

        // Populate requiredBlankChars
        currentProblem.blanks.forEach(blank => {
            const char = blank.char.toLowerCase();
            requiredBlankChars.set(char, (requiredBlankChars.get(char) || 0) + 1);
        });

        // 고정 글자들 중에서 빈칸에도 나타나는 글자들 찾기
        const sentence = currentProblem.sentence.toLowerCase();
        for (let i = 0; i < sentence.length; i++) {
            const char = sentence[i];
            if (char.match(/[a-z]/)) {
                const isBlank = currentProblem.blanks.some(blank => blank.index === i);
                if (!isBlank && blankCharToHintMap.has(char)) {
                    // 고정 글자이지만 빈칸에도 나타나는 글자
                    charToHintNumber.set(char, blankCharToHintMap.get(char));
                } else if (!isBlank) {
                    // 완전히 고정된 글자 (빈칸에 나타나지 않음)
                    usedCharsInProblem.add(char);
                }
            }
        }

        let charIndex = 0;
        let blankCounter = 0;

        words.forEach((word, wordIndex) => {
            const wordGroup = document.createElement('div');
            wordGroup.classList.add('word-group');
            wordGroup.dataset.wordIndex = wordIndex;
            wordGroup.dataset.wordText = word.toLowerCase().replace(/[^a-z]/g, '');
            
            let hasActiveBlank = false;

            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const currentCharIndex = charIndex + i;
                
                const charSlot = document.createElement('div');
                charSlot.classList.add('char-slot');

                const blankInfo = currentProblem.blanks.find(b => b.index === currentCharIndex);

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
                        const charSpan = document.createElement('div');
                        charSpan.classList.add('fixed-char-text');
                        charSpan.textContent = char.toUpperCase();

                        const hintSpan = document.createElement('div');
                        hintSpan.classList.add('hint-number');
                        
                        // 빈칸 글자와 같은 글자인 경우에만 힌트 번호 표시
                        if (charToHintNumber.has(lowerChar)) {
                            hintSpan.textContent = charToHintNumber.get(lowerChar);
                            hintSpan.dataset.char = lowerChar;
                        } else {
                            // 빈칸이 아닌 글자는 투명한 힌트 추가 (높이 유지용)
                            hintSpan.style.visibility = 'hidden';
                            hintSpan.textContent = '0';
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
        console.log('Checking puzzle completion:', allFilled);
        
        if (allFilled) {
            console.log('Puzzle completed! Showing modal...');
            setTimeout(() => {
                showSuccessModal();
            }, 500);
        }
    }

    function showSuccessModal() {
        console.log('showSuccessModal called');
        
        const originalSentenceEl = document.querySelector('.original-sentence');
        const sourceEl = document.querySelector('.source');
        const translationEl = document.querySelector('.korean-translation');
        
        // 모달 내 문장을 단어별로 분할하여 표시
        if (originalSentenceEl) {
            createHighlightableSentence(originalSentenceEl, currentProblem.sentence);
        }
        if (sourceEl) sourceEl.textContent = `출처: ${currentProblem.source}`;
        if (translationEl) translationEl.textContent = currentProblem.translation;
        
        if (successModal) {
            successModal.style.display = 'flex';
            console.log('Modal displayed');
        } else {
            console.error('Success modal not found!');
        }
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
            
            // 마지막 단어가 아니면 공백 추가
            if (index < words.length - 1) {
                container.appendChild(document.createTextNode(' '));
            }
        });
    }

    function hideSuccessModal() {
        if (successModal) {
            successModal.style.display = 'none';
        }
        // TTS 중지
        if (isReading) {
            speechSynthesis.cancel();
            clearWordHighlights();
            isReading = false;
        }
    }

    function clearWordHighlights() {
        // 모달 내 하이라이트 제거
        document.querySelectorAll('.modal-word').forEach(word => {
            word.classList.remove('reading-highlight');
        });
    }

    function highlightModalWord(wordIndex) {
        clearWordHighlights();
        
        const modalWords = document.querySelectorAll('.modal-word');
        if (wordIndex < modalWords.length) {
            modalWords[wordIndex].classList.add('reading-highlight');
            console.log(`Highlighting modal word ${wordIndex}: "${modalWords[wordIndex].textContent}"`);
        }
    }

    function speakSentence() {
        // 이미 읽고 있으면 중지
        if (isReading) {
            speechSynthesis.cancel();
            clearWordHighlights();
            isReading = false;
            return;
        }

        if ('speechSynthesis' in window) {
            isReading = true;
            const words = currentSentence.split(' ');

            // 음성 토글 (남자 -> 여자 -> 남자...)
            voiceToggle = !voiceToggle;
            const selectedVoice = selectVoice(voiceToggle);

            // 전체 문장을 자연스럽게 읽기
            const utterance = new SpeechSynthesisUtterance(currentSentence);
            utterance.lang = 'en-US';
            utterance.voice = selectedVoice;
            
            // 음성에 따른 설정 조정
            if (voiceToggle) {
                // 여자 음성 (틴에이지 스타일)
                utterance.rate = 0.9;   // 조금 더 빠르게
                utterance.pitch = 1.3;  // 높은 톤
                utterance.volume = 1.0;
                console.log('Using female voice (teenage style):', selectedVoice.name);
            } else {
                // 남자 음성 (디폴트 설정)
                utterance.rate = 0.9;   // 디폴트 속도
                utterance.pitch = 1.0;  // 디폴트 톤
                utterance.volume = 1.0; // 디폴트 볼륨
                console.log('Using male voice (default):', selectedVoice.name);
            }
            
            currentUtterance = utterance;

            // 단어별 하이라이트를 위한 타이밍 계산
            const baseWordsPerSecond = 2.2; // 기본 읽기 속도 (단어/초)
            const speedAdjustment = 1 / utterance.rate; // 속도 조정 반영
            const actualWordsPerSecond = baseWordsPerSecond * speedAdjustment;
            const wordDuration = 1000 / actualWordsPerSecond; // 단어당 시간 (ms)
            
            // 하이라이트를 50ms 앞서게 하기 위한 오프셋
            const highlightOffset = 50;

            let highlightTimeouts = [];
            
            function startWordHighlighting() {
                // 첫 번째 단어는 즉시 하이라이트
                highlightModalWord(0);
                
                // 나머지 단어들에 대해 타이밍 계산하고 스케줄링
                words.forEach((word, index) => {
                    if (index === 0) return; // 첫 번째 단어는 이미 처리됨
                    
                    const highlightTime = (index * wordDuration) - highlightOffset;
                    const clearTime = highlightTime + wordDuration * 0.7; // 70% 지점에서 하이라이트 제거
                    
                    // 하이라이트 시작
                    if (highlightTime > 0) {
                        const timeout1 = setTimeout(() => {
                            if (isReading) {
                                highlightModalWord(index);
                            }
                        }, highlightTime);
                        highlightTimeouts.push(timeout1);
                    }
                    
                    // 하이라이트 제거 (마지막 단어가 아닌 경우)
                    if (index < words.length - 1 && clearTime > 0) {
                        const timeout2 = setTimeout(() => {
                            if (isReading) {
                                const modalWords = document.querySelectorAll('.modal-word');
                                if (modalWords[index]) {
                                    modalWords[index].classList.remove('reading-highlight');
                                }
                            }
                        }, clearTime);
                        highlightTimeouts.push(timeout2);
                    }
                });
            }

            function clearAllTimeouts() {
                highlightTimeouts.forEach(timeout => clearTimeout(timeout));
                highlightTimeouts = [];
            }

            utterance.onstart = () => {
                console.log('TTS started with voice:', selectedVoice.name);
                startWordHighlighting();
            };

            utterance.onend = () => {
                console.log('TTS ended');
                clearAllTimeouts();
                clearWordHighlights();
                isReading = false;
                currentUtterance = null;
            };

            utterance.onerror = (event) => {
                // Differentiate between actual errors and expected interruptions
                if (event.error === 'interrupted') {
                    console.info('TTS interrupted (expected behavior)');
                } else {
                    console.error('TTS error:', event.error);
                }
                clearAllTimeouts();
                clearWordHighlights();
                isReading = false;
                currentUtterance = null;
            };

            speechSynthesis.speak(utterance);
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

    // 음성 로드 (페이지 로드 시)
    if ('speechSynthesis' in window) {
        // 음성이 로드될 때까지 기다림
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.addEventListener('voiceschanged', loadVoices);
        } else {
            loadVoices();
        }
    }

    initializeGame();
});