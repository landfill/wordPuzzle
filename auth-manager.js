// Word Crack - 인증 관리자
// Phase 3-B: Google OAuth 인증 및 사용자 세션 관리

import { CONFIG, isFeatureEnabled } from './config.js';

class AuthManager {
    constructor() {
        this.user = null;
        this.token = null;
        this.googleAuth = null;
        this.isInitialized = false;
        
        // 이벤트 리스너 배열
        this.listeners = {
            login: [],
            logout: [],
            error: []
        };
        
        this.init();
    }
    
    async init() {
        if (!isFeatureEnabled('GOOGLE_AUTH')) {
            console.log('🔒 Google Auth 기능이 비활성화됨');
            return;
        }
        
        try {
            // OAuth 콜백 확인 (URL에 code가 있는 경우)
            await this.handleOAuthCallback();
            
            // 저장된 토큰 복원
            this.loadStoredAuth();
            
            // Google API 초기화
            await this.initGoogleAuth();
            
            // 토큰이 있으면 검증
            if (this.token) {
                await this.verifyToken();
            }
            
            this.isInitialized = true;
            console.log('✅ AuthManager 초기화 완료');
            
        } catch (error) {
            console.error('❌ AuthManager 초기화 실패:', error);
            console.log('💡 Google Auth는 비활성화됩니다. 나머지 기능은 정상 작동합니다.');
            this.clearAuth();
            // 초기화 실패해도 계속 진행 (Google Auth 없이도 게임은 가능)
        }
    }
    
    async initGoogleAuth() {
        return new Promise((resolve, reject) => {
            // Google API 스크립트가 이미 로드되었는지 확인
            if (window.google && window.google.accounts) {
                this.setupGoogleAuth();
                resolve();
                return;
            }
            
            // Google API 스크립트 동적 로드
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                // 로드 후 잠시 대기하여 API 초기화 완료 대기
                setTimeout(() => {
                    if (window.google && window.google.accounts) {
                        this.setupGoogleAuth();
                        resolve();
                    } else {
                        reject(new Error('Google API 초기화 실패'));
                    }
                }, 100);
            };
            
            script.onerror = (error) => {
                console.error('Google API 스크립트 로드 실패:', error);
                reject(new Error('Google API 로드 실패 - 네트워크 확인 필요'));
            };
            
            document.head.appendChild(script);
            
            // 타임아웃 설정 (10초)
            setTimeout(() => {
                if (!this.isInitialized) {
                    reject(new Error('Google API 로드 타임아웃'));
                }
            }, 10000);
        });
    }
    
    setupGoogleAuth() {
        if (!window.google?.accounts?.id) {
            throw new Error('Google Identity Services 사용 불가');
        }
        
        window.google.accounts.id.initialize({
            client_id: CONFIG.GOOGLE_CLIENT_ID,
            callback: this.handleGoogleResponse.bind(this)
        });
        
        console.log('✅ Google Auth 설정 완료');
    }
    
    async handleGoogleResponse(response) {
        try {
            console.log('🔑 Google 로그인 응답 받음');
            
            // 백엔드 API로 토큰 검증 및 사용자 정보 요청
            const authResult = await this.authenticateWithBackend(response.credential);
            
            if (authResult.success) {
                this.setAuth(authResult.token, authResult.user);
                this.notifyListeners('login', authResult.user);
                console.log('✅ 로그인 성공:', authResult.user.display_name);
            } else {
                throw new Error(authResult.error || '인증 실패');
            }
            
        } catch (error) {
            console.error('❌ Google 로그인 처리 실패:', error);
            this.notifyListeners('error', error);
        }
    }
    
    async authenticateWithBackend(googleToken) {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                googleToken: googleToken
            })
        });
        
        if (!response.ok) {
            throw new Error(`인증 API 오류: ${response.status}`);
        }
        
        return await response.json();
    }
    
    async verifyToken() {
        if (!this.token) return false;
        
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.user) {
                    this.user = result.user;
                    return true;
                }
            }
            
            // 토큰이 유효하지 않음
            this.clearAuth();
            return false;
            
        } catch (error) {
            console.error('토큰 검증 실패:', error);
            this.clearAuth();
            return false;
        }
    }
    
    setAuth(token, user) {
        this.token = token;
        this.user = user;
        
        // 로컬 스토리지에 저장
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    }
    
    loadStoredAuth() {
        this.token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const userJson = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_PROFILE);
        
        if (userJson) {
            try {
                this.user = JSON.parse(userJson);
            } catch (error) {
                console.error('저장된 사용자 정보 파싱 실패:', error);
                this.clearAuth();
            }
        }
    }
    
    clearAuth() {
        this.token = null;
        this.user = null;
        
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_PROFILE);
    }
    
    async login() {
        // 초기화가 진행 중이면 대기
        if (!this.isInitialized) {
            console.log('⏳ AuthManager 초기화 대기 중...');
            // 최대 5초간 초기화 완료 대기
            let waitTime = 0;
            while (!this.isInitialized && waitTime < 5000) {
                await new Promise(resolve => setTimeout(resolve, 100));
                waitTime += 100;
            }
            
            if (!this.isInitialized) {
                throw new Error('AuthManager 초기화 시간 초과');
            }
        }
        
        if (!isFeatureEnabled('GOOGLE_AUTH')) {
            throw new Error('Google Auth 기능이 비활성화됨');
        }
        
        try {
            // 웹뷰 환경 감지
            if (this.isWebView()) {
                console.warn('웹뷰 환경에서는 Google Sign-In이 제한됩니다.');
                throw new Error('웹뷰 환경에서는 Google 로그인을 지원하지 않습니다. 기본 브라우저를 사용해주세요.');
            }
            
            // 모바일 환경이거나 GSI가 차단될 가능성이 높은 환경에서는 직접 OAuth 사용
            if (this.isMobileOrRestrictedEnvironment()) {
                console.log('모바일/제한 환경 감지 - OAuth 직접 리다이렉트 사용');
                await this.tryDirectOAuth();
                return;
            }
            
            // 기존 세션 정리 후 재시도
            this.resetGoogleSignIn();
            
            // GSI One Tap 시도
            window.google.accounts.id.prompt();
        } catch (error) {
            console.error('Google 로그인 실패:', error);
            throw error;
        }
    }
    
    // 웹뷰 환경 감지
    isWebView() {
        const userAgent = navigator.userAgent;
        console.log('User Agent:', userAgent); // 디버깅용
        
        // 먼저 정상 브라우저 확인 (웹뷰가 아님)
        const normalBrowserPatterns = [
            /Chrome\/[\d.]+ Mobile Safari/i,    // 모바일 Chrome (Android)
            /EdgiOS/i,                          // iOS Edge
            /CriOS/i,                           // iOS Chrome  
            /FxiOS/i,                           // iOS Firefox
            /SamsungBrowser/i,                  // 삼성 브라우저
            /Firefox\/[\d.]+.*Mobile/i,         // Android Firefox
            /Edge\/[\d.]+.*Mobile/i,            // Android Edge
        ];
        
        // 정상 브라우저라면 웹뷰가 아님
        if (normalBrowserPatterns.some(pattern => pattern.test(userAgent))) {
            console.log('정상 모바일 브라우저 감지');
            return false;
        }
        
        // iOS Safari 구분: 웹뷰는 Safari/XXX가 없음
        if (/iPhone|iPad/.test(userAgent) && /Mobile.*Safari/.test(userAgent)) {
            // 진짜 Safari는 Safari/XXX 버전이 있음
            if (/Safari\/[\d.]+/.test(userAgent)) {
                console.log('iOS Safari 브라우저 감지');
                return false;
            } else {
                console.log('iOS 웹뷰 감지 (Safari 버전 없음)');
                return true;
            }
        }
        
        // 앱 내 브라우저 패턴들
        const webViewPatterns = [
            /wv\)/i,           // Android WebView  
            /FB_IAB/i,         // Facebook in-app browser
            /FBAN/i,           // Facebook app
            /Instagram/i,      // Instagram app
            /Line/i,           // Line app
            /WhatsApp/i,       // WhatsApp app
            /Kakao/i,          // KakaoTalk app
            /NAVER/i,          // 네이버 앱
            /Whale/i,          // 네이버 웨일 (앱 버전)
        ];
        
        const isWebView = webViewPatterns.some(pattern => pattern.test(userAgent));
        console.log('웹뷰 감지 결과:', isWebView);
        return isWebView;
    }
    
    // 모바일 또는 GSI 제한 환경 감지
    isMobileOrRestrictedEnvironment() {
        const userAgent = navigator.userAgent;
        
        // 모바일 기기 감지
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        // Chrome DevTools 모바일 모드 감지
        const isDevToolsMobile = window.navigator.webdriver || 
                               (window.outerHeight === 0 && window.outerWidth === 0);
        
        // 모바일 브라우저들 (GSI에서 종종 차단됨)
        const isMobileBrowser = /Mobile|Android/i.test(userAgent) && 
                              !/Windows NT|Macintosh/i.test(userAgent);
        
        return isMobile || isDevToolsMobile || isMobileBrowser;
    }
    
    // 직접 OAuth 2.0 리다이렉트
    async tryDirectOAuth() {
        // 현재 URL을 state로 저장
        const state = encodeURIComponent(window.location.href);
        localStorage.setItem('oauth_return_url', window.location.href);
        
        const oauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + 
            new URLSearchParams({
                client_id: CONFIG.GOOGLE_CLIENT_ID,
                redirect_uri: window.location.origin,
                response_type: 'token id_token',
                scope: 'openid email profile',
                state: state,
                prompt: 'select_account',
                nonce: Math.random().toString(36).substring(7)
            });
        
        console.log('OAuth 직접 리다이렉트 시작:', oauthUrl);
        window.location.href = oauthUrl;
    }
    
    // OAuth 콜백 처리 (Fragment 방식)
    async handleOAuthCallback() {
        // URL fragment에서 OAuth 응답 파싱
        const hash = window.location.hash.substring(1);
        if (!hash) return;
        
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const idToken = params.get('id_token');
        const error = params.get('error');
        
        if (error) {
            console.error('OAuth 에러:', error);
            window.location.hash = '';
            throw new Error(`OAuth 인증 실패: ${error}`);
        }
        
        if (accessToken && idToken) {
            console.log('OAuth fragment 콜백 감지, 토큰 처리 중...');
            
            try {
                // ID 토큰에서 사용자 정보 추출
                const payload = JSON.parse(atob(idToken.split('.')[1]));
                const user = {
                    id: payload.sub,
                    email: payload.email,
                    display_name: payload.name,
                    avatar: payload.picture,
                    verified: payload.email_verified
                };
                
                // 임시 토큰으로 ID 토큰 사용 (실제로는 백엔드에서 JWT 생성해야 함)
                this.setAuth(idToken, user);
                this.notifyListeners('login', user);
                console.log('✅ OAuth 로그인 성공:', user.display_name);
                
                // URL fragment 제거
                window.location.hash = '';
                
                // 원래 페이지로 복귀
                const returnUrl = localStorage.getItem('oauth_return_url');
                localStorage.removeItem('oauth_return_url');
                
                if (returnUrl && returnUrl !== window.location.href) {
                    // 상태 복원을 위해 약간 지연
                    setTimeout(() => {
                        if (returnUrl.startsWith(window.location.origin)) {
                            window.location.href = returnUrl;
                        }
                    }, 100);
                }
                
            } catch (error) {
                console.error('OAuth 토큰 처리 실패:', error);
                window.location.hash = '';
                throw error;
            }
        }
    }
    
    // Google Sign-In 상태 리셋
    resetGoogleSignIn() {
        try {
            if (window.google?.accounts?.id) {
                // 기존 세션 취소
                window.google.accounts.id.cancel();
                
                // 약간의 지연 후 재초기화
                setTimeout(() => {
                    this.setupGoogleAuth();
                }, 100);
            }
        } catch (error) {
            console.warn('Google Sign-In 리셋 중 오류:', error);
        }
    }
    
    
    // 리다이렉트 방식 로그인 (폴백)
    async tryRedirectLogin() {
        // 현재 URL 저장
        const returnUrl = window.location.href;
        localStorage.setItem('auth_return_url', returnUrl);
        
        // Google OAuth 직접 URL로 리다이렉트
        const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
            `client_id=${CONFIG.GOOGLE_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
            `response_type=code&` +
            `scope=openid email profile&` +
            `state=${encodeURIComponent(returnUrl)}`;
        
        console.log('리다이렉트 방식으로 Google 로그인 시도...');
        window.location.href = googleAuthUrl;
    }
    
    async logout() {
        if (this.user) {
            const user = this.user;
            this.clearAuth();
            this.notifyListeners('logout', user);
            console.log('✅ 로그아웃 완료');
        }
    }
    
    isLoggedIn() {
        return !!(this.token && this.user);
    }
    
    getUser() {
        return this.user;
    }
    
    getToken() {
        return this.token;
    }
    
    // 인증이 필요한 API 호출을 위한 헤더 생성
    getAuthHeaders() {
        if (!this.token) {
            throw new Error('인증되지 않음');
        }
        
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
    
    // 이벤트 리스너 등록
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }
    
    // 이벤트 리스너 제거
    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }
    
    // 이벤트 알림
    notifyListeners(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`이벤트 리스너 오류 (${event}):`, error);
                }
            });
        }
    }
}

// 싱글톤 인스턴스
export const authManager = new AuthManager();

// 글로벌 접근을 위한 window 객체 등록 (개발용)
if (typeof window !== 'undefined') {
    window.authManager = authManager;
}