// 데이터 관리 시스템 - Phase 2
class DataManager {
    constructor() {
        this.STORAGE_KEY = 'wordCrackUserData';
        this.DATA_VERSION = '2.0';
        this.initializeUserData();
    }

    // 기본 사용자 데이터 구조
    getDefaultUserData() {
        return {
            version: this.DATA_VERSION,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            
            // 전체 통계
            stats: {
                totalProblemsAttempted: 0,
                totalProblemsCompleted: 0,
                totalScore: 0,
                totalHintsUsed: 0,
                perfectScores: 0,
                totalPlayTime: 0, // 초 단위
                gamesStarted: 0,
                currentStreak: 0,
                longestStreak: 0
            },
            
            // 카테고리별 진행률
            categoryProgress: {
                movies: { attempted: 0, completed: 0, totalScore: 0, bestScore: 0 },
                songs: { attempted: 0, completed: 0, totalScore: 0, bestScore: 0 },
                books: { attempted: 0, completed: 0, totalScore: 0, bestScore: 0 },
                quotes: { attempted: 0, completed: 0, totalScore: 0, bestScore: 0 },
                daily_travel_phrases: { attempted: 0, completed: 0, totalScore: 0, bestScore: 0 },
                all: { attempted: 0, completed: 0, totalScore: 0, bestScore: 0 }
            },
            
            // 획득한 배지들
            badges: [],
            
            // 저장된 문장들 (즐겨찾기)
            savedSentences: [],
            
            // 완료한 문제들의 히스토리
            completedProblems: [],
            
            // 설정
            settings: {
                preferredCategories: [],
                soundEnabled: true,
                darkMode: false
            }
        };
    }

    // 사용자 데이터 초기화
    initializeUserData() {
        const existingData = this.getUserData();
        
        if (!existingData || existingData.version !== this.DATA_VERSION) {
            // 기존 데이터가 없거나 버전이 다르면 새로 생성
            const defaultData = this.getDefaultUserData();
            
            // 기존 데이터가 있으면 마이그레이션 시도
            if (existingData) {
                this.migrateUserData(existingData, defaultData);
            }
            
            this.saveUserData(defaultData);
            console.log('User data initialized with version', this.DATA_VERSION);
        }
    }

    // 기존 데이터 마이그레이션
    migrateUserData(oldData, newData) {
        try {
            // 기존 버전의 데이터가 있다면 가능한 한 보존
            if (oldData.stats) {
                Object.assign(newData.stats, oldData.stats);
            }
            if (oldData.categoryProgress) {
                Object.assign(newData.categoryProgress, oldData.categoryProgress);
            }
            if (oldData.badges) {
                newData.badges = oldData.badges;
            }
            if (oldData.savedSentences) {
                newData.savedSentences = oldData.savedSentences;
            }
            console.log('Data migration completed successfully');
        } catch (error) {
            console.warn('Data migration failed, using fresh data:', error);
        }
    }

    // 사용자 데이터 조회
    getUserData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load user data:', error);
            return null;
        }
    }

    // 사용자 데이터 저장
    saveUserData(userData) {
        try {
            userData.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('Failed to save user data:', error);
            return false;
        }
    }

    // 특정 필드 업데이트
    updateUserData(updateFunction) {
        const userData = this.getUserData();
        if (userData) {
            updateFunction(userData);
            return this.saveUserData(userData);
        }
        return false;
    }

    // 게임 시작 기록
    recordGameStart(category) {
        this.updateUserData(data => {
            data.stats.gamesStarted++;
            data.categoryProgress[category].attempted++;
        });
    }

    // 게임 완료 기록
    recordGameCompletion(gameData) {
        const { category, score, hintsUsed, isSuccess, problemData, playTime } = gameData;
        
        this.updateUserData(data => {
            // 전체 통계 업데이트
            data.stats.totalProblemsAttempted++;
            if (isSuccess) {
                data.stats.totalProblemsCompleted++;
                data.stats.totalScore += score;
                data.stats.totalPlayTime += playTime || 0;
                
                // 완벽한 점수 (힌트 없이 완료)
                if (hintsUsed === 0) {
                    data.stats.perfectScores++;
                }
                
                // 연속 성공 업데이트
                data.stats.currentStreak++;
                if (data.stats.currentStreak > data.stats.longestStreak) {
                    data.stats.longestStreak = data.stats.currentStreak;
                }
            } else {
                // 실패시 연속 성공 초기화
                data.stats.currentStreak = 0;
            }
            
            data.stats.totalHintsUsed += hintsUsed;
            
            // 카테고리별 통계 업데이트
            const categoryStats = data.categoryProgress[category];
            if (isSuccess) {
                categoryStats.completed++;
                categoryStats.totalScore += score;
                if (score > categoryStats.bestScore) {
                    categoryStats.bestScore = score;
                }
            }
            
            // 완료한 문제 히스토리에 추가
            data.completedProblems.push({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                category,
                sentence: problemData.sentence,
                translation: problemData.translation,
                source: problemData.source,
                score,
                hintsUsed,
                isSuccess,
                playTime: playTime || 0
            });
            
            // 히스토리가 너무 길어지면 오래된 것 제거 (최대 1000개)
            if (data.completedProblems.length > 1000) {
                data.completedProblems = data.completedProblems.slice(-1000);
            }
        });
    }

    // 문장 저장
    saveSentence(problemData) {
        return this.updateUserData(data => {
            // 이미 저장된 문장인지 확인
            const existingIndex = data.savedSentences.findIndex(
                saved => saved.sentence === problemData.sentence
            );
            
            if (existingIndex === -1) {
                // 새로운 문장 저장
                data.savedSentences.push({
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    sentence: problemData.sentence,
                    translation: problemData.translation,
                    source: problemData.source,
                    category: problemData.category
                });
                return true;
            }
            return false; // 이미 저장된 문장
        });
    }

    // 저장된 문장 삭제
    removeSavedSentence(sentenceId) {
        return this.updateUserData(data => {
            const index = data.savedSentences.findIndex(saved => saved.id === sentenceId);
            if (index !== -1) {
                data.savedSentences.splice(index, 1);
                return true;
            }
            return false;
        });
    }

    // timestamp로 저장된 문장 삭제
    removeSavedSentenceByTimestamp(timestamp) {
        return this.updateUserData(data => {
            const index = data.savedSentences.findIndex(saved => saved.timestamp === timestamp);
            if (index !== -1) {
                data.savedSentences.splice(index, 1);
                return true;
            }
            return false;
        });
    }

    // 저장된 문장 목록 전체 업데이트
    updateSavedSentences(newSentences) {
        return this.updateUserData(data => {
            data.savedSentences = newSentences;
            return true;
        });
    }

    // 문장이 이미 저장되어 있는지 확인
    isSentenceSaved(sentence) {
        const userData = this.getUserData();
        return userData ? userData.savedSentences.some(saved => saved.sentence === sentence) : false;
    }

    // 통계 조회 메서드들
    getStats() {
        const userData = this.getUserData();
        return userData ? userData.stats : this.getDefaultUserData().stats;
    }

    getCategoryProgress() {
        const userData = this.getUserData();
        return userData ? userData.categoryProgress : this.getDefaultUserData().categoryProgress;
    }

    getSavedSentences() {
        const userData = this.getUserData();
        return userData ? userData.savedSentences : [];
    }

    getCompletedProblems() {
        const userData = this.getUserData();
        return userData ? userData.completedProblems : [];
    }

    // 데이터 초기화 (개발/테스트용)
    resetUserData() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.initializeUserData();
        console.log('User data has been reset');
    }

    // 데이터 내보내기 (백업용)
    exportUserData() {
        const userData = this.getUserData();
        return userData ? JSON.stringify(userData, null, 2) : null;
    }

    // 데이터 가져오기 (복원용)
    importUserData(jsonData) {
        try {
            const userData = JSON.parse(jsonData);
            this.saveUserData(userData);
            console.log('User data imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import user data:', error);
            return false;
        }
    }
}

// 전역 데이터 매니저 인스턴스
export default DataManager;