/**
 * Phase 4-A: 게임 상태 관리 시스템
 * 게임 진행 중 상태를 세션 스토리지에 저장하고 복원하는 기능
 */

class GameStateManager {
    constructor() {
        this.SESSION_KEY = 'wordcrack_game_state';
        this.AUTO_SAVE_INTERVAL = 5000; // 5초마다 자동 저장
        this.autoSaveTimer = null;
    }

    /**
     * 현재 게임 상태를 저장
     */
    saveGameState(gameState) {
        try {
            const stateData = {
                ...gameState,
                timestamp: Date.now(),
                version: '4.0'
            };
            
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(stateData));
            console.log('[GameState] 게임 상태 저장됨:', stateData);
            return true;
        } catch (error) {
            console.error('[GameState] 저장 실패:', error);
            return false;
        }
    }

    /**
     * 저장된 게임 상태를 복원
     */
    loadGameState() {
        try {
            const savedData = sessionStorage.getItem(this.SESSION_KEY);
            if (!savedData) {
                console.log('[GameState] 저장된 상태 없음');
                return null;
            }

            const gameState = JSON.parse(savedData);
            
            // 버전 체크
            if (gameState.version !== '4.0') {
                console.log('[GameState] 구버전 상태 데이터 무시');
                this.clearGameState();
                return null;
            }

            // 1시간 이상 된 상태는 자동 삭제
            const ONE_HOUR = 60 * 60 * 1000;
            if (Date.now() - gameState.timestamp > ONE_HOUR) {
                console.log('[GameState] 만료된 상태 데이터 삭제');
                this.clearGameState();
                return null;
            }

            console.log('[GameState] 게임 상태 복원됨:', gameState);
            return gameState;
        } catch (error) {
            console.error('[GameState] 복원 실패:', error);
            this.clearGameState();
            return null;
        }
    }

    /**
     * 저장된 게임 상태 삭제
     */
    clearGameState() {
        try {
            sessionStorage.removeItem(this.SESSION_KEY);
            console.log('[GameState] 게임 상태 삭제됨');
            return true;
        } catch (error) {
            console.error('[GameState] 삭제 실패:', error);
            return false;
        }
    }

    /**
     * 게임 상태가 저장되어 있는지 확인
     */
    hasGameState() {
        try {
            const savedData = sessionStorage.getItem(this.SESSION_KEY);
            return savedData !== null;
        } catch (error) {
            console.error('[GameState] 상태 확인 실패:', error);
            return false;
        }
    }

    /**
     * 자동 저장 시작
     */
    startAutoSave(getStateCallback) {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        this.autoSaveTimer = setInterval(() => {
            if (typeof getStateCallback === 'function') {
                const currentState = getStateCallback();
                if (currentState && currentState.selectedCategory && currentState.currentProblem) {
                    this.saveGameState(currentState);
                }
            }
        }, this.AUTO_SAVE_INTERVAL);

        console.log('[GameState] 자동 저장 시작됨');
    }

    /**
     * 자동 저장 중지
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            console.log('[GameState] 자동 저장 중지됨');
        }
    }

    /**
     * 게임 상태 복원 확인 UI 표시
     */
    showRestoreConfirmation() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'restore-confirmation-modal';
            modal.innerHTML = `
                <div class="restore-confirmation-content">
                    <h3>🔄 이전 게임 복원</h3>
                    <p>진행 중이던 게임이 있습니다.<br>계속하시겠어요?</p>
                    <div class="restore-confirmation-buttons">
                        <button id="restore-yes" class="btn-primary">예, 계속하기</button>
                        <button id="restore-no" class="btn-secondary">아니요, 새로 시작</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // 버튼 이벤트 리스너
            document.getElementById('restore-yes').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(true);
            });

            document.getElementById('restore-no').addEventListener('click', () => {
                this.clearGameState();
                document.body.removeChild(modal);
                resolve(false);
            });

            // ESC 키로 닫기
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(modal);
                    document.removeEventListener('keydown', handleEsc);
                    resolve(false);
                }
            };
            document.addEventListener('keydown', handleEsc);
        });
    }

    /**
     * 게임 시작 시 호출 - 복원할 상태가 있는지 확인
     */
    async checkAndRestore() {
        if (!this.hasGameState()) {
            return null;
        }

        const shouldRestore = await this.showRestoreConfirmation();
        if (shouldRestore) {
            return this.loadGameState();
        }
        
        return null;
    }
}

export default GameStateManager;