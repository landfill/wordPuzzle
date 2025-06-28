// 콘텐츠 생성 및 관리 시스템
class ContentGenerator {
    constructor() {
        this.categories = {}; // 초기에는 비어있음
        this.problemPool = []; // 문제 출제를 위한 '카드 덱'
        this.usedProblemsInCycle = new Set(); // 현재 사이클에서 사용된 문제를 추적
    }

    /**
     * 외부 데이터베이스로부터 콘텐츠를 추가합니다.
     * @param {string} category - 카테고리 (e.g., 'movies')
     * @param {string} source - 출처 (e.g., 'Toy Story')
     * @param {Array} quotes - 문장 객체 배열
     */
    addContent(category, source, quotes) {
        if (!this.categories[category]) {
            this.categories[category] = {};
        }
        if (!this.categories[category][source]) {
            this.categories[category][source] = [];
        }

        // 각 문장 객체에 카테고리와 출처 정보를 추가하여 저장
        const enrichedQuotes = quotes.map(q => ({ ...q, category, source }));
        this.categories[category][source].push(...enrichedQuotes);
    }

    /**
     * 전체 문제 풀(카드 덱)을 재생성합니다.
     * 모든 문제를 한 번씩 다 사용했을 때 호출됩니다.
     */
    _rebuildProblemPool() {
        console.log("Rebuilding problem pool. All problems will now be available again.");
        this.problemPool = [];
        this.usedProblemsInCycle.clear();

        Object.values(this.categories).forEach(sources => {
            Object.values(sources).forEach(quotes => {
                this.problemPool.push(...quotes);
            });
        });

        // 문제를 무작위로 섞어줍니다 (Fisher-Yates Shuffle 알고리즘).
        for (let i = this.problemPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.problemPool[i], this.problemPool[j]] = [this.problemPool[j], this.problemPool[i]];
        }
    }

    /**
     * 랜덤 문제를 생성합니다.
     * 한 번 출제된 문제는 풀에서 제거되어 반복 출제되지 않습니다.
     */
    generateRandomProblem() {
        // 만약 풀이 비어있으면 (모든 문제를 다 냈거나, 첫 시작이면)
        if (this.problemPool.length === 0) {
            this._rebuildProblemPool();
        }

        // 만약 그래도 풀이 비어있다면 (데이터베이스 자체가 비어있는 예외 상황)
        if (this.problemPool.length === 0) {
            return this.createCustomProblem("No problems available in database.", "System");
        }

        // 카드 덱의 맨 위에서 문제를 하나 뽑습니다. (이미 섞여있으므로 랜덤)
        const selectedProblem = this.problemPool.pop();
        
        // 자동으로 빈칸 생성
        const blanks = this._generateBlanks(selectedProblem.sentence, selectedProblem.difficulty);

        return {
            ...selectedProblem,
            blanks: blanks,
        };
    }
    
    /**
     * 문장과 난이도에 따라 빈칸을 생성하는 내부 함수
     * @param {string} sentence - 원본 문장
     * @param {string} difficulty - 'easy', 'medium', 'hard'
     * @returns {Array} - 빈칸 객체 배열
     */
    _generateBlanks(sentence, difficulty = 'medium') {
        const blanks = [];
        let hintCounter = 1;
        const charToHint = new Map();

        const blankRatio = {
            easy: 0.3,
            medium: 0.5,
            hard: 0.7
        };
        const targetRatio = blankRatio[difficulty] || 0.5;

        // 빈칸으로 만들 후보 문자들의 위치를 미리 수집
        const candidateIndices = [];
        for (let i = 0; i < sentence.length; i++) {
            if (sentence[i].match(/[a-zA-Z]/)) {
                candidateIndices.push(i);
            }
        }
        
        // 후보들 중에서 지정된 비율만큼 무작위로 선택
        const numToBlank = Math.floor(candidateIndices.length * targetRatio);
        const blankIndices = new Set();
        while (blankIndices.size < numToBlank && candidateIndices.length > 0) {
            const randomIndex = Math.floor(Math.random() * candidateIndices.length);
            const selectedIndex = candidateIndices.splice(randomIndex, 1)[0];
            blankIndices.add(selectedIndex);
        }

        // 선택된 위치에 대해 빈칸 정보 생성
        blankIndices.forEach(index => {
            const char = sentence[index];
            const lowerChar = char.toLowerCase();
            
            if (!charToHint.has(lowerChar)) {
                charToHint.set(lowerChar, hintCounter++);
            }
            
            blanks.push({
                char: char,
                index: index,
                hintNum: charToHint.get(lowerChar)
            });
        });

        // 인덱스 순서대로 정렬하여 반환
        return blanks.sort((a, b) => a.index - b.index);
    }

    /**
     * 사용자 입력 문장으로 문제를 생성합니다.
     */
    createCustomProblem(sentence, source = "Custom", translation = "", difficulty = 'medium') {
        const blanks = this._generateBlanks(sentence, difficulty);
        
        return {
            sentence: sentence,
            source: source,
            translation: translation,
            blanks: blanks,
            category: 'custom'
        };
    }
}

export default ContentGenerator;