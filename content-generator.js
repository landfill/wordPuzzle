// 콘텐츠 생성 및 관리 시스템
class ContentGenerator {
    constructor() {
        this.categories = {
            movies: {
                'Toy Story': [
                    {
                        sentence: "To infinity and beyond!",
                        translation: "무한대 그 너머로!",
                        difficulty: 'easy'
                    },
                    {
                        sentence: "You've got a friend in me.",
                        translation: "당신에게는 나라는 친구가 있어요.",
                        difficulty: 'medium'
                    }
                ],
                'Finding Nemo': [
                    {
                        sentence: "Just keep swimming!",
                        translation: "계속 헤엄치기만 하면 돼!",
                        difficulty: 'easy'
                    }
                ],
                'The Lion King': [
                    {
                        sentence: "Hakuna Matata!",
                        translation: "하쿠나 마타타!",
                        difficulty: 'easy'
                    }
                ]
            },
            books: {
                'Harry Potter': [
                    {
                        sentence: "You're a wizard, Harry.",
                        translation: "너는 마법사야, 해리.",
                        difficulty: 'easy'
                    }
                ]
            },
            quotes: {
                'Motivational': [
                    {
                        sentence: "Be yourself; everyone else is already taken.",
                        translation: "자기 자신이 되어라; 다른 사람들은 이미 존재한다.",
                        difficulty: 'hard'
                    }
                ]
            }
        };
        
        this.usedProblems = new Set();
    }

    // 자동 빈칸 생성 알고리즘
    generateBlanks(sentence, difficulty = 'medium') {
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

        words.forEach((word, wordIndex) => {
            const wordChars = word.split('');
            
            wordChars.forEach((char, charInWordIndex) => {
                if (char.match(/[a-zA-Z]/)) {
                    const lowerChar = char.toLowerCase();
                    
                    // 빈칸으로 만들지 결정 (랜덤 + 난이도 고려)
                    const shouldBeBlank = Math.random() < targetRatio;
                    
                    if (shouldBeBlank) {
                        // 이미 힌트 번호가 있는 글자인지 확인
                        if (!charToHint.has(lowerChar)) {
                            charToHint.set(lowerChar, hintCounter++);
                        }
                        
                        blanks.push({
                            char: char,
                            index: charIndex,
                            hintNum: charToHint.get(lowerChar)
                        });
                    }
                }
                charIndex++;
            });
            
            charIndex++; // 공백 문자 고려
        });

        return blanks;
    }

    // 카테고리별 랜덤 문제 생성
    generateRandomProblem(category = null, difficulty = null) {
        let availableCategories = Object.keys(this.categories);
        
        if (category && this.categories[category]) {
            availableCategories = [category];
        }

        const selectedCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        const sources = Object.keys(this.categories[selectedCategory]);
        const selectedSource = sources[Math.floor(Math.random() * sources.length)];
        const quotes = this.categories[selectedCategory][selectedSource];
        
        // 난이도 필터링
        let filteredQuotes = quotes;
        if (difficulty) {
            filteredQuotes = quotes.filter(q => q.difficulty === difficulty);
            if (filteredQuotes.length === 0) {
                filteredQuotes = quotes; // 해당 난이도가 없으면 전체에서 선택
            }
        }

        const selectedQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
        
        // 자동으로 빈칸 생성
        const blanks = this.generateBlanks(selectedQuote.sentence, selectedQuote.difficulty);

        return {
            sentence: selectedQuote.sentence,
            source: selectedSource,
            translation: selectedQuote.translation,
            blanks: blanks,
            category: selectedCategory
        };
    }

    // 사용자 입력 문장으로 문제 생성
    createCustomProblem(sentence, source = "Custom", translation = "", difficulty = 'medium') {
        const blanks = this.generateBlanks(sentence, difficulty);
        
        return {
            sentence: sentence,
            source: source,
            translation: translation,
            blanks: blanks,
            category: 'custom'
        };
    }

    // 콘텐츠 추가
    addContent(category, source, quotes) {
        if (!this.categories[category]) {
            this.categories[category] = {};
        }
        
        if (!this.categories[category][source]) {
            this.categories[category][source] = [];
        }
        
        this.categories[category][source].push(...quotes);
    }

    // 통계 정보
    getStats() {
        let totalQuotes = 0;
        const stats = {};
        
        Object.keys(this.categories).forEach(category => {
            stats[category] = {};
            Object.keys(this.categories[category]).forEach(source => {
                const count = this.categories[category][source].length;
                stats[category][source] = count;
                totalQuotes += count;
            });
        });
        
        return { total: totalQuotes, byCategory: stats };
    }
}

// 사용 예시
const contentGen = new ContentGenerator();

// 랜덤 문제 생성
const randomProblem = contentGen.generateRandomProblem();

// 특정 카테고리에서 문제 생성
const movieProblem = contentGen.generateRandomProblem('movies', 'easy');

// 사용자 정의 문제 생성
const customProblem = contentGen.createCustomProblem(
    "Hello, world!",
    "Programming",
    "안녕, 세상아!",
    'easy'
);

export default ContentGenerator;