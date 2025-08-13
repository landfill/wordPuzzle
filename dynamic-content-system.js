// Dynamic Content System - Phase 4-D Implementation
// 서버에서 콘텐츠를 동적으로 로드하고 관리하는 시스템

class DynamicContentSystem {
    constructor() {
        this.cache = new Map(); // 로컬 캐시
        this.version = null; // 콘텐츠 버전
        this.lastUpdate = null; // 마지막 업데이트 시간
        this.pollingInterval = 5 * 60 * 1000; // 5분마다 폴링
        this.pollingTimer = null;
        
        // 오프라인 지원을 위한 설정
        this.offlineMode = false;
        this.fallbackData = null;
    }

    /**
     * 시스템 초기화
     * 캐시된 데이터 로드 및 폴링 시작
     */
    async initialize() {
        try {
            // 로컬 스토리지에서 캐시된 데이터 복원
            await this.loadFromCache();
            
            // 서버에서 최신 콘텐츠 확인
            await this.checkForUpdates();
            
            // 폴링 시작
            this.startPolling();
            
            console.log('[DynamicContent] System initialized successfully');
        } catch (error) {
            console.warn('[DynamicContent] Initialization failed, using fallback:', error);
            this.enableOfflineMode();
        }
    }

    /**
     * 서버에서 콘텐츠 업데이트 확인
     */
    async checkForUpdates() {
        try {
            // config.js에서 API URL 가져오기
            const apiBaseUrl = this.getApiBaseUrl();
            const response = await fetch(`${apiBaseUrl}/api/content/version`);
            const serverVersion = await response.json();
            
            if (!this.version || this.version !== serverVersion.version) {
                console.log(`[DynamicContent] Version mismatch: local(${this.version}) vs server(${serverVersion.version})`);
                await this.downloadContent();
            }
        } catch (error) {
            console.warn('[DynamicContent] Failed to check updates:', error);
            if (!this.cache.size) {
                this.enableOfflineMode();
            }
        }
    }

    /**
     * 서버에서 새로운 콘텐츠 다운로드
     */
    async downloadContent() {
        try {
            const apiBaseUrl = this.getApiBaseUrl();
            const response = await fetch(`${apiBaseUrl}/api/content/all`);
            const contentData = await response.json();
            
            // 데이터 검증
            if (!this.validateContentData(contentData)) {
                throw new Error('Invalid content data structure');
            }
            
            // 캐시 업데이트
            this.updateCache(contentData);
            
            // 로컬 스토리지에 저장
            await this.saveToCache(contentData);
            
            this.version = contentData.version;
            this.lastUpdate = Date.now();
            
            console.log(`[DynamicContent] Content updated to version ${this.version}`);
            
            // 업데이트 이벤트 발생
            this.dispatchUpdateEvent();
            
        } catch (error) {
            console.error('[DynamicContent] Failed to download content:', error);
            throw error;
        }
    }

    /**
     * 특정 카테고리의 콘텐츠 가져오기
     */
    getContent(category = 'all') {
        if (this.offlineMode && this.fallbackData) {
            return this.getFallbackContent(category);
        }

        if (category === 'all') {
            const allContent = {};
            this.cache.forEach((sources, cat) => {
                allContent[cat] = sources;
            });
            return allContent;
        }

        return this.cache.get(category) || {};
    }

    /**
     * 새로운 콘텐츠 추가 (사용자 생성 콘텐츠 지원)
     */
    async addContent(category, source, problems) {
        try {
            const apiBaseUrl = this.getApiBaseUrl();
            const response = await fetch(`${apiBaseUrl}/api/content/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, source, problems })
            });

            if (response.ok) {
                // 로컬 캐시에 즉시 반영
                if (!this.cache.has(category)) {
                    this.cache.set(category, {});
                }
                this.cache.get(category)[source] = problems;
                
                console.log(`[DynamicContent] Added content: ${category}/${source}`);
            }
        } catch (error) {
            console.error('[DynamicContent] Failed to add content:', error);
        }
    }

    /**
     * 캐시 업데이트
     */
    updateCache(contentData) {
        this.cache.clear();
        
        Object.entries(contentData.content).forEach(([category, sources]) => {
            this.cache.set(category, sources);
        });
    }

    /**
     * 로컬 스토리지에서 캐시 로드
     */
    async loadFromCache() {
        try {
            const cached = localStorage.getItem('dynamic-content-cache');
            if (cached) {
                const data = JSON.parse(cached);
                this.updateCache(data);
                this.version = data.version;
                this.lastUpdate = data.timestamp;
                
                console.log(`[DynamicContent] Loaded from cache: version ${this.version}`);
            }
        } catch (error) {
            console.warn('[DynamicContent] Failed to load cache:', error);
        }
    }

    /**
     * 로컬 스토리지에 캐시 저장
     */
    async saveToCache(contentData) {
        try {
            const cacheData = {
                version: contentData.version,
                timestamp: Date.now(),
                content: contentData.content
            };
            
            localStorage.setItem('dynamic-content-cache', JSON.stringify(cacheData));
        } catch (error) {
            console.warn('[DynamicContent] Failed to save cache:', error);
        }
    }

    /**
     * 폴링 시작
     */
    startPolling() {
        this.stopPolling(); // 기존 타이머 정리
        
        this.pollingTimer = setInterval(async () => {
            if (!this.offlineMode) {
                await this.checkForUpdates();
            }
        }, this.pollingInterval);
        
        console.log(`[DynamicContent] Polling started (interval: ${this.pollingInterval}ms)`);
    }

    /**
     * 폴링 중지
     */
    stopPolling() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
        }
    }

    /**
     * 오프라인 모드 활성화
     */
    enableOfflineMode() {
        this.offlineMode = true;
        // 기존 CONTENT_DATABASE를 폴백으로 사용
        import('./content-database.js').then(module => {
            this.fallbackData = module.default;
            console.log('[DynamicContent] Offline mode enabled with fallback data');
        });
    }

    /**
     * 폴백 데이터에서 콘텐츠 가져오기
     */
    getFallbackContent(category) {
        if (!this.fallbackData) return {};
        
        if (category === 'all') {
            return this.fallbackData;
        }
        
        return this.fallbackData[category] || {};
    }

    /**
     * 콘텐츠 데이터 검증
     */
    validateContentData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.version || !data.content) return false;
        
        // 각 카테고리의 구조 검증
        for (const [category, sources] of Object.entries(data.content)) {
            if (typeof sources !== 'object') return false;
            
            for (const [source, problems] of Object.entries(sources)) {
                if (!Array.isArray(problems)) return false;
                
                // 각 문제의 필수 필드 검증
                for (const problem of problems) {
                    if (!problem.sentence || !problem.difficulty) return false;
                }
            }
        }
        
        return true;
    }

    /**
     * 업데이트 이벤트 발생
     */
    dispatchUpdateEvent() {
        const event = new CustomEvent('contentUpdated', {
            detail: { version: this.version, timestamp: this.lastUpdate }
        });
        document.dispatchEvent(event);
    }

    /**
     * API Base URL 가져오기
     */
    getApiBaseUrl() {
        // CONFIG가 정의되어 있으면 사용, 없으면 기본값
        if (typeof window !== 'undefined' && window.CONFIG && window.CONFIG.API_BASE_URL) {
            return window.CONFIG.API_BASE_URL;
        }
        
        // 개발 환경에서는 로컬 서버 사용
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            return 'http://localhost:8787'; // Wrangler dev server
        }
        
        // 프로덕션 환경
        return 'https://wordcrack-api.letthelightsurroundyou.workers.dev';
    }

    /**
     * 시스템 종료
     */
    destroy() {
        this.stopPolling();
        this.cache.clear();
        console.log('[DynamicContent] System destroyed');
    }
}

export default DynamicContentSystem;