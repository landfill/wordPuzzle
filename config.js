// Word Crack - Feature Flags Configuration
// Phase 3-B: 프론트엔드 통합을 위한 기능 플래그 시스템

export const FEATURES = {
    // Phase 3 글로벌 경쟁 기능
    GLOBAL_LEADERBOARD: true,   // 글로벌 리더보드 표시
    GOOGLE_AUTH: true,          // 구글 로그인 기능
    SCORE_UPLOAD: true,         // 점수 자동 업로드
    LEADERBOARD_UI: true,       // 리더보드 화면/모달
    
    // Phase 4-D 동적 콘텐츠 기능
    DYNAMIC_CONTENT: false,     // 동적 콘텐츠 시스템 (개발 중)
    USER_GENERATED_CONTENT: false, // 사용자 생성 콘텐츠
    
    // 개발/디버그 기능
    DEBUG_MODE: false,          // 디버그 로그 출력
    API_LOGGING: false          // API 호출 로그
};

// 환경별 설정
export const CONFIG = {
    // API 엔드포인트
    API_BASE_URL: 'https://wordcrack-api.letthelightsurroundyou.workers.dev',
    
    // 구글 OAuth
    // Note: OAuth Client ID는 공개되어도 안전합니다. 실제 보안은 백엔드 토큰 검증과 도메인 제한으로 처리됩니다.
    GOOGLE_CLIENT_ID: '540419254124-4olc827vud509n2mbpsm6e9ac1or4dha.apps.googleusercontent.com',
    
    // 로컬 스토리지 키
    STORAGE_KEYS: {
        AUTH_TOKEN: 'wordcrack_auth_token',
        USER_PROFILE: 'wordcrack_user_profile',
        FEATURE_OVERRIDES: 'wordcrack_feature_overrides'
    },
    
    // 게임 설정
    GAME: {
        CATEGORIES: ['easy', 'medium', 'hard'],
        LEADERBOARD_LIMIT: 20,
        SCORE_UPLOAD_RETRY: 3
    }
};

// Feature Flag 체크 함수
export function isFeatureEnabled(featureName) {
    // 로컬 스토리지에서 개발자 오버라이드 확인
    const overrides = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FEATURE_OVERRIDES) || '{}');
    if (overrides.hasOwnProperty(featureName)) {
        return overrides[featureName];
    }
    
    // 기본 설정 값 반환
    return FEATURES[featureName] || false;
}

// 개발자용: Feature Flag 토글 함수
export function toggleFeature(featureName, enabled = null) {
    if (!FEATURES.hasOwnProperty(featureName)) {
        console.warn(`Unknown feature: ${featureName}`);
        return false;
    }
    
    const overrides = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FEATURE_OVERRIDES) || '{}');
    
    if (enabled === null) {
        // 토글
        enabled = !isFeatureEnabled(featureName);
    }
    
    overrides[featureName] = enabled;
    localStorage.setItem(CONFIG.STORAGE_KEYS.FEATURE_OVERRIDES, JSON.stringify(overrides));
    
    console.log(`Feature ${featureName}: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    return enabled;
}

// 개발자용: 모든 Feature Flag 상태 출력
export function debugFeatures() {
    console.log('🚩 Feature Flags Status:');
    Object.keys(FEATURES).forEach(feature => {
        const status = isFeatureEnabled(feature);
        console.log(`  ${feature}: ${status ? '✅' : '❌'}`);
    });
}

// 브라우저 콘솔에서 사용할 수 있도록 전역 등록 (개발용)
if (typeof window !== 'undefined') {
    window.WordCrackFeatures = {
        toggle: toggleFeature,
        debug: debugFeatures,
        isEnabled: isFeatureEnabled
    };
}