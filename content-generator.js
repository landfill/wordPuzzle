// 콘텐츠 생성 및 관리 시스템 (Phase 4-D: 동적 콘텐츠 지원)
class ContentGenerator {
    constructor(dynamicContentSystem = null) {
        this.categories = {}; // 초기에는 비어있음
        // 카테고리별 문제 풀과 사용된 문제를 관리
        this.pools = {};
        
        // Phase 4-D: 동적 콘텐츠 시스템 연동
        this.dynamicSystem = dynamicContentSystem;
        this.isDynamic = !!dynamicContentSystem;
        
        // 동적 콘텐츠 업데이트 이벤트 리스너
        if (this.isDynamic) {
            document.addEventListener('contentUpdated', () => {
                this.refreshFromDynamicSystem();
            });
        }
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

        const enrichedQuotes = quotes.map(q => ({ ...q, category, source }));
        this.categories[category][source].push(...enrichedQuotes);
    }

    /**
     * 동적 콘텐츠 시스템에서 데이터 새로고침
     */
    refreshFromDynamicSystem() {
        if (!this.isDynamic) return;
        
        console.log('[ContentGenerator] Refreshing from dynamic system');
        
        // 기존 데이터 클리어
        this.categories = {};
        this.pools = {};
        
        // 동적 시스템에서 새 데이터 로드
        const allContent = this.dynamicSystem.getContent('all');
        Object.entries(allContent).forEach(([category, sources]) => {
            Object.entries(sources).forEach(([source, problems]) => {
                this.addContent(category, source, problems);
            });
        });
        
        console.log('[ContentGenerator] Dynamic content refreshed');
    }

    /**
     * 특정 카테고리의 문제 풀(카드 덱)을 생성하거나 재생성합니다.
     * @param {string} category - 재생성할 카테고리
     */
    _rebuildProblemPool(category) {
        // Phase 4-D: 동적 콘텐츠 시스템에서 실시간 데이터 가져오기
        if (this.isDynamic) {
            this._loadFromDynamicSystem(category);
        }
        
        let newPool = [];
        if (category === 'all') {
            // 'all'의 경우 모든 카테고리의 문제를 합침
            Object.values(this.categories).forEach(sources => {
                Object.values(sources).forEach(quotes => {
                    newPool.push(...quotes);
                });
            });
        } else if (this.categories[category]) {
            // 특정 카테고리의 경우 해당 문제만 추가
            Object.values(this.categories[category]).forEach(quotes => {
                newPool.push(...quotes);
            });
        }

        // 문제를 무작위로 섞어줍니다 (Fisher-Yates Shuffle).
        for (let i = newPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newPool[i], newPool[j]] = [newPool[j], newPool[i]];
        }
        
        // 해당 카테고리의 풀을 초기화
        this.pools[category] = {
            deck: newPool,
            used: new Set(),
        };
    }
    
    /**
     * 지정된 카테고리에서 랜덤 문제를 생성.
     * 한 번 출제된 문제는 해당 사이클에서 반복 출제되지 않습니다.
     * @param {string} category - 'movies', 'songs', or 'all'
     * @param {Object} difficultyWeights - 난이도별 가중치 {easy: 60, medium: 30, hard: 10}
     */
    generateRandomProblem(category = 'all', difficultyWeights = {easy: 60, medium: 30, hard: 10}) {
        // 해당 카테고리의 풀이 없으면 새로 생성
        if (!this.pools[category]) {
            this._rebuildProblemPool(category);
        }

        let pool = this.pools[category].deck;

        // 만약 풀에 있는 모든 문제를 다 사용했다면 풀을 재생성
        if (pool.length === 0) {
            this._rebuildProblemPool(category);
            pool = this.pools[category].deck;
        }

        // 그래도 풀이 비어있다면 (해당 카테고리에 데이터가 없는 경우)
        if (pool.length === 0) {
            return null; // 문제가 없음을 알림
        }

        // 가중치 기반 난이도 선택
        const selectedDifficulty = this._selectWeightedDifficulty(difficultyWeights);
        
        // 선택된 난이도에 맞는 문제 찾기
        const availableProblems = pool.filter(problem => problem.difficulty === selectedDifficulty);
        
        let selectedProblem;
        if (availableProblems.length > 0) {
            // 해당 난이도 문제가 있으면 그 중에서 랜덤 선택
            const randomIndex = Math.floor(Math.random() * availableProblems.length);
            selectedProblem = availableProblems[randomIndex];
            // 풀에서 제거
            const poolIndex = pool.indexOf(selectedProblem);
            pool.splice(poolIndex, 1);
        } else {
            // 해당 난이도 문제가 없으면 아무거나 선택 (폴백)
            selectedProblem = pool.pop();
        }
        
        // 자동으로 빈칸 생성
        const blanks = this._generateBlanks(selectedProblem.sentence, selectedProblem.difficulty);

        return {
            ...selectedProblem,
            blanks: blanks,
        };
    }
    
    /**
     * 문장과 난이도에 따라 빈칸을 생성하는 내부 함수
     * (기존과 동일)
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

        const candidateIndices = [];
        for (let i = 0; i < sentence.length; i++) {
            if (sentence[i].match(/[a-zA-Z]/)) {
                candidateIndices.push(i);
            }
        }
        
        const numToBlank = Math.floor(candidateIndices.length * targetRatio);
        const blankIndices = new Set();
        while (blankIndices.size < numToBlank && candidateIndices.length > 0) {
            const randomIndex = Math.floor(Math.random() * candidateIndices.length);
            const selectedIndex = candidateIndices.splice(randomIndex, 1)[0];
            blankIndices.add(selectedIndex);
        }

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

        return blanks.sort((a, b) => a.index - b.index);
    }

    /**
     * 가중치 기반 난이도 선택
     * @param {Object} weights - 난이도별 가중치
     * @returns {string} 선택된 난이도
     */
    _selectWeightedDifficulty(weights) {
        const total = weights.easy + weights.medium + weights.hard;
        const random = Math.random() * total;
        
        if (random < weights.easy) {
            return 'easy';
        } else if (random < weights.easy + weights.medium) {
            return 'medium';
        } else {
            return 'hard';
        }
    }

    /**
     * 동적 콘텐츠 시스템에서 특정 카테고리 데이터 로드
     * @param {string} category - 로드할 카테고리
     */
    _loadFromDynamicSystem(category) {
        if (!this.isDynamic) return;
        
        const content = this.dynamicSystem.getContent(category);
        
        // 해당 카테고리의 새로운 콘텐츠가 있으면 업데이트
        Object.entries(content).forEach(([source, problems]) => {
            if (!this.categories[category]) {
                this.categories[category] = {};
            }
            if (!this.categories[category][source] || 
                this.categories[category][source].length !== problems.length) {
                this.addContent(category, source, problems);
            }
        });
    }

    /**
     * 사용자 생성 콘텐츠 추가 (Phase 4-D)
     * @param {string} category - 카테고리
     * @param {string} source - 출처  
     * @param {Array} problems - 문제 배열
     */
    async addUserContent(category, source, problems) {
        if (this.isDynamic) {
            // 동적 시스템을 통해 서버에 추가
            await this.dynamicSystem.addContent(category, source, problems);
        } else {
            // 로컬에만 추가
            this.addContent(category, source, problems);
        }
    }

    /**
     * 시스템 상태 정보 반환
     */
    getSystemInfo() {
        const totalCategories = Object.keys(this.categories).length;
        const totalSources = Object.values(this.categories).reduce((sum, sources) => sum + Object.keys(sources).length, 0);
        const totalProblems = Object.values(this.categories).reduce((sum, sources) => {
            return sum + Object.values(sources).reduce((srcSum, problems) => srcSum + problems.length, 0);
        }, 0);

        return {
            isDynamic: this.isDynamic,
            version: this.isDynamic ? this.dynamicSystem.version : 'static',
            lastUpdate: this.isDynamic ? this.dynamicSystem.lastUpdate : null,
            totalCategories,
            totalSources,
            totalProblems,
            offlineMode: this.isDynamic ? this.dynamicSystem.offlineMode : false
        };
    }
}

export default ContentGenerator;