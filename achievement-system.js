// 성취도 배지 시스템 - Phase 2-B
class AchievementSystem {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.badges = this.initializeBadges();
    }

    // 모든 배지 정의
    initializeBadges() {
        return {
            // 카테고리별 완료 배지
            'movies_beginner': {
                id: 'movies_beginner',
                name: '영화 입문자',
                description: '영화 카테고리 문제 5개 완료',
                icon: '🎬',
                category: 'movies',
                type: 'progress',
                condition: (userData) => userData.categoryProgress.movies.completed >= 5,
                rarity: 'common'
            },
            'movies_expert': {
                id: 'movies_expert',
                name: '영화 전문가',
                description: '영화 카테고리 문제 20개 완료',
                icon: 'clapperboard',
                category: 'movies',
                type: 'progress',
                condition: (userData) => userData.categoryProgress.movies.completed >= 20,
                rarity: 'rare'
            },
            'songs_beginner': {
                id: 'songs_beginner',
                name: '음악 애호가',
                description: '음악 카테고리 문제 5개 완료',
                icon: 'music',
                category: 'songs',
                type: 'progress',
                condition: (userData) => userData.categoryProgress.songs.completed >= 5,
                rarity: 'common'
            },
            'songs_expert': {
                id: 'songs_expert',
                name: '음악 마스터',
                description: '음악 카테고리 문제 20개 완료',
                icon: '🎼',
                category: 'songs',
                type: 'progress',
                condition: (userData) => userData.categoryProgress.songs.completed >= 20,
                rarity: 'rare'
            },
            'books_beginner': {
                id: 'books_beginner',
                name: '독서가',
                description: '책 카테고리 문제 5개 완료',
                icon: '📚',
                category: 'books',
                type: 'progress',
                condition: (userData) => userData.categoryProgress.books.completed >= 5,
                rarity: 'common'
            },
            'books_expert': {
                id: 'books_expert',
                name: '문학 전문가',
                description: '책 카테고리 문제 20개 완료',
                icon: '📖',
                category: 'books',
                type: 'progress',
                condition: (userData) => userData.categoryProgress.books.completed >= 20,
                rarity: 'rare'
            },
            'quotes_beginner': {
                id: 'quotes_beginner',
                name: '명언 수집가',
                description: '명언 카테고리 문제 5개 완료',
                icon: '💬',
                category: 'quotes',
                type: 'progress',
                condition: (userData) => userData.categoryProgress.quotes.completed >= 5,
                rarity: 'common'
            },
            'quotes_expert': {
                id: 'quotes_expert',
                name: '지혜의 현자',
                description: '명언 카테고리 문제 20개 완료',
                icon: '🧠',
                category: 'quotes',
                type: 'progress',
                condition: (userData) => userData.categoryProgress.quotes.completed >= 20,
                rarity: 'rare'
            },
            'travel_beginner': {
                id: 'travel_beginner',
                name: '여행 준비생',
                description: '여행 영어 문제 5개 완료',
                icon: 'plane',
                category: 'daily_travel_phrases',
                type: 'progress',
                condition: (userData) => userData.categoryProgress.daily_travel_phrases.completed >= 5,
                rarity: 'common'
            },
            'travel_expert': {
                id: 'travel_expert',
                name: '글로벌 여행자',
                description: '여행 영어 문제 20개 완료',
                icon: '🌍',
                category: 'daily_travel_phrases',
                type: 'progress',
                condition: (userData) => userData.categoryProgress.daily_travel_phrases.completed >= 20,
                rarity: 'rare'
            },

            // 연속 성공 배지
            'streak_3': {
                id: 'streak_3',
                name: '연승 시작',
                description: '3회 연속 성공',
                icon: 'flame',
                type: 'streak',
                condition: (userData) => userData.stats.longestStreak >= 3,
                rarity: 'common'
            },
            'streak_5': {
                id: 'streak_5',
                name: '연승 중',
                description: '5회 연속 성공',
                icon: 'zap',
                type: 'streak',
                condition: (userData) => userData.stats.longestStreak >= 5,
                rarity: 'uncommon'
            },
            'streak_10': {
                id: 'streak_10',
                name: '연승 왕',
                description: '10회 연속 성공',
                icon: 'sparkles',
                type: 'streak',
                condition: (userData) => userData.stats.longestStreak >= 10,
                rarity: 'rare'
            },
            'streak_20': {
                id: 'streak_20',
                name: '전설의 연승',
                description: '20회 연속 성공',
                icon: 'trophy',
                type: 'streak',
                condition: (userData) => userData.stats.longestStreak >= 20,
                rarity: 'legendary'
            },

            // 완벽한 점수 배지
            'perfect_5': {
                id: 'perfect_5',
                name: '완벽주의자',
                description: '힌트 없이 5개 문제 완료',
                icon: 'star',
                type: 'perfect',
                condition: (userData) => userData.stats.perfectScores >= 5,
                rarity: 'common'
            },
            'perfect_10': {
                id: 'perfect_10',
                name: '완벽 마스터',
                description: '힌트 없이 10개 문제 완료',
                icon: 'stars',
                type: 'perfect',
                condition: (userData) => userData.stats.perfectScores >= 10,
                rarity: 'uncommon'
            },
            'perfect_25': {
                id: 'perfect_25',
                name: '완벽 전문가',
                description: '힌트 없이 25개 문제 완료',
                icon: 'sparkle',
                type: 'perfect',
                condition: (userData) => userData.stats.perfectScores >= 25,
                rarity: 'rare'
            },

            // 전체 진행률 배지
            'total_10': {
                id: 'total_10',
                name: '워드 크랙 신입',
                description: '총 10개 문제 완료',
                icon: 'medal',
                type: 'total',
                condition: (userData) => userData.stats.totalProblemsCompleted >= 10,
                rarity: 'common'
            },
            'total_50': {
                id: 'total_50',
                name: '워드 크랙 중급자',
                description: '총 50개 문제 완료',
                icon: '🥉',
                type: 'total',
                condition: (userData) => userData.stats.totalProblemsCompleted >= 50,
                rarity: 'uncommon'
            },
            'total_100': {
                id: 'total_100',
                name: '워드 크랙 고수',
                description: '총 100개 문제 완료',
                icon: '🥈',
                type: 'total',
                condition: (userData) => userData.stats.totalProblemsCompleted >= 100,
                rarity: 'rare'
            },
            'total_200': {
                id: 'total_200',
                name: '워드 크랙 마스터',
                description: '총 200개 문제 완료',
                icon: '🥇',
                type: 'total',
                condition: (userData) => userData.stats.totalProblemsCompleted >= 200,
                rarity: 'epic'
            },

            // 특별 배지
            'first_save': {
                id: 'first_save',
                name: '수집가 시작',
                description: '첫 번째 문장 저장',
                icon: '💾',
                type: 'special',
                condition: (userData) => userData.savedSentences.length >= 1,
                rarity: 'common'
            },
            'collector': {
                id: 'collector',
                name: '문장 수집가',
                description: '10개 문장 저장',
                icon: '📝',
                type: 'special',
                condition: (userData) => userData.savedSentences.length >= 10,
                rarity: 'uncommon'
            },
            'library': {
                id: 'library',
                name: '개인 도서관',
                description: '25개 문장 저장',
                icon: '📚',
                type: 'special',
                condition: (userData) => userData.savedSentences.length >= 25,
                rarity: 'rare'
            },

            // 정확도 배지
            'accuracy_80': {
                id: 'accuracy_80',
                name: '정확한 실력자',
                description: '80% 이상 정답률 (최소 20문제)',
                icon: 'target',
                type: 'accuracy',
                condition: (userData) => {
                    if (userData.stats.totalProblemsAttempted < 20) return false;
                    const accuracy = (userData.stats.totalProblemsCompleted / userData.stats.totalProblemsAttempted) * 100;
                    return accuracy >= 80;
                },
                rarity: 'uncommon'
            },
            'accuracy_90': {
                id: 'accuracy_90',
                name: '정밀 저격수',
                description: '90% 이상 정답률 (최소 30문제)',
                icon: 'crosshair',
                type: 'accuracy',
                condition: (userData) => {
                    if (userData.stats.totalProblemsAttempted < 30) return false;
                    const accuracy = (userData.stats.totalProblemsCompleted / userData.stats.totalProblemsAttempted) * 100;
                    return accuracy >= 90;
                },
                rarity: 'rare'
            }
        };
    }

    // 사용자의 새로 획득한 배지 확인
    checkNewBadges() {
        const userData = this.dataManager.getUserData();
        if (!userData) return [];

        const currentBadges = new Set(userData.badges.map(b => b.id));
        const newBadges = [];

        Object.values(this.badges).forEach(badge => {
            if (!currentBadges.has(badge.id) && badge.condition(userData)) {
                newBadges.push({
                    ...badge,
                    earnedAt: new Date().toISOString()
                });
            }
        });

        // 새 배지가 있다면 사용자 데이터에 추가
        if (newBadges.length > 0) {
            this.dataManager.updateUserData(data => {
                data.badges.push(...newBadges);
            });
        }

        return newBadges;
    }

    // 배지 희귀도별 색상
    getBadgeRarityColor(rarity) {
        const colors = {
            'common': '#6B7280',     // 회색
            'uncommon': '#059669',   // 초록
            'rare': '#2563EB',       // 파랑
            'epic': '#7C3AED',       // 보라
            'legendary': '#DC2626'   // 빨강
        };
        return colors[rarity] || colors.common;
    }

    // 배지 희귀도별 이름
    getBadgeRarityName(rarity) {
        const names = {
            'common': '일반',
            'uncommon': '고급',
            'rare': '희귀',
            'epic': '영웅',
            'legendary': '전설'
        };
        return names[rarity] || names.common;
    }

    // 사용자의 모든 배지 가져오기
    getUserBadges() {
        const userData = this.dataManager.getUserData();
        return userData ? userData.badges : [];
    }

    // 특정 타입의 배지 가져오기
    getBadgesByType(type) {
        return Object.values(this.badges).filter(badge => badge.type === type);
    }

    // 진행률 계산 (다음 배지까지 얼마나 남았는지)
    getProgressToNextBadge(badgeId) {
        const badge = this.badges[badgeId];
        if (!badge) return null;

        const userData = this.dataManager.getUserData();
        if (!userData) return null;

        // 배지 타입별로 진행률 계산 로직이 다름
        switch (badge.type) {
            case 'total':
                const target = this.extractNumberFromCondition(badge.condition.toString());
                return {
                    current: userData.stats.totalProblemsCompleted,
                    target: target,
                    progress: Math.min(100, (userData.stats.totalProblemsCompleted / target) * 100)
                };
            
            case 'perfect':
                const perfectTarget = this.extractNumberFromCondition(badge.condition.toString());
                return {
                    current: userData.stats.perfectScores,
                    target: perfectTarget,
                    progress: Math.min(100, (userData.stats.perfectScores / perfectTarget) * 100)
                };

            case 'streak':
                const streakTarget = this.extractNumberFromCondition(badge.condition.toString());
                return {
                    current: userData.stats.longestStreak,
                    target: streakTarget,
                    progress: Math.min(100, (userData.stats.longestStreak / streakTarget) * 100)
                };

            default:
                return null;
        }
    }

    // 조건 문자열에서 숫자 추출 (간단한 파싱)
    extractNumberFromCondition(conditionStr) {
        const match = conditionStr.match(/>=\s*(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    // 배지 알림 표시 (게임에서 호출)
    showBadgeNotification(badge) {
        // 간단한 알림 구현 (나중에 더 예쁘게 만들 수 있음)
        
        // 추후 실제 UI 알림으로 대체 예정
        return {
            title: '새 배지 획득!',
            message: `${badge.icon} ${badge.name}`,
            description: badge.description,
            rarity: badge.rarity
        };
    }
}

export default AchievementSystem;