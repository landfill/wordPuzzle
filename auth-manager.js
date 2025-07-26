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
            window.google.accounts.id.prompt();
        } catch (error) {
            console.error('Google 로그인 시작 실패:', error);
            throw error;
        }
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