# Phase 3 TODO - 글로벌 경쟁 기능 (인증 & 리더보드)

## 🎯 Phase 3 목표
구글 로그인 기반 글로벌 리더보드 시스템 구축

## 📋 Phase 3-A: 백엔드 기반 구축 (🟢 운영 영향 없음)

### 1. 인프라 설정
- [x] Supabase 프로젝트 생성 및 스키마 설정
  - [x] `cracker_profiles` 테이블 생성
  - [x] `cracker_scores` 테이블 생성
  - [x] RLS (Row Level Security) 정책 설정
- [x] Cloudflare Workers API 프로젝트 생성
  - [x] 로컬 Wrangler 환경 설정
  - [x] 기본 Worker 구조 구현
  - [x] 환경 변수 설정 (SUPABASE_URL, GOOGLE_CLIENT_ID 등)

### 2. 인증 API 구현
- [x] Google OAuth 연동
  - [x] 기존 Google Project에 OAuth 설정 추가
  - [x] `/api/auth/google` - 구글 토큰 검증 및 로그인
  - [x] `/api/auth/verify` - JWT 토큰 검증
  - [x] Supabase Auth와 연동
- [x] 사용자 프로필 관리
  - [x] 사용자 등록/업데이트 로직
  - [x] 프로필 정보 조회 API

### 3. 점수 & 리더보드 API
- [x] 점수 관리 API
  - [x] `/api/scores` POST - 점수 업로드
  - [x] `/api/scores` GET - 개인 점수 조회
  - [x] 점수 검증 로직 (부정행위 방지)
- [x] 리더보드 API
  - [x] `/api/leaderboard` - 전체 리더보드
  - [x] `/api/leaderboard/:category` - 카테고리별 리더보드
  - [x] 주간/월간 리더보드 지원
  - [x] 페이지네이션 및 캐싱

## 📋 Phase 3-B: 프론트엔드 통합 (🟡 운영 영향 있음)

### 4. 인증 시스템 UI
- [ ] AuthManager 클래스 구현
  - [ ] `auth-manager.js` 새 파일 생성
  - [ ] 로그인/로그아웃 상태 관리
  - [ ] 토큰 저장 및 검증
- [ ] 로그인 UI 추가
  - [ ] Google Sign-In 버튼 추가
  - [ ] 사용자 프로필 표시 영역
  - [ ] 로그인 상태별 UI 전환

### 5. 게임 플로우 통합
- [ ] 점수 업로드 통합
  - [ ] 게임 완료 시 자동 점수 업로드
  - [ ] 로그인된 사용자만 업로드
  - [ ] 업로드 실패 시 로컬 저장 후 재시도
- [ ] 리더보드 UI
  - [ ] 리더보드 화면/모달 추가
  - [ ] 카테고리별 필터링
  - [ ] 실시간 순위 업데이트
  - [ ] 내 순위 하이라이트

### 6. Feature Flag 시스템
- [ ] 기능 토글 설정
  - [ ] `config.js`에 기능 플래그 추가
  - [ ] 단계적 기능 활성화 지원
  - [ ] A/B 테스트 준비

## 🔧 기술적 구현사항

### 인프라 아키텍처
```
[Word Crack Frontend]     [Cloudflare Workers API]     [Supabase]
(Cloudflare Pages)   -->   (Auth + Leaderboard)    -->  (cracker_profiles + cracker_scores)
      |                           |
      v                           v
[Google OAuth]              [JWT Validation]
(기존 TTS 프로젝트)
```

### 데이터베이스 스키마
```sql
-- cracker_profiles 테이블
CREATE TABLE cracker_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  google_id TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- cracker_scores 테이블  
CREATE TABLE cracker_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES cracker_profiles(id),
  category TEXT NOT NULL,
  score INTEGER NOT NULL,
  hints_used INTEGER DEFAULT 0,
  perfect_score BOOLEAN DEFAULT FALSE,
  play_time INTEGER,
  sentence TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 및 RLS 정책
CREATE INDEX idx_scores_category ON cracker_scores(category, score DESC);
CREATE INDEX idx_scores_user ON cracker_scores(user_id, created_at DESC);
```

### 프로젝트 구조
```
wordPuzzle/
├── wordcrack-api/              # 새로 추가 - Cloudflare Workers
│   ├── src/
│   │   ├── index.js           # 메인 Worker
│   │   ├── handlers/
│   │   │   ├── auth.js        # 인증 핸들러
│   │   │   ├── scores.js      # 점수 핸들러
│   │   │   └── leaderboard.js # 리더보드 핸들러
│   │   └── utils/
│   │       ├── supabase.js    # Supabase 클라이언트
│   │       └── cors.js        # CORS 유틸
│   ├── wrangler.toml          # Worker 설정
│   └── package.json
├── auth-manager.js             # 새로 추가 - 인증 관리
├── config.js                   # 새로 추가 - 기능 플래그
├── index.html                  # 기존 - 로그인 UI 추가
├── script.js                   # 기존 - 점수 업로드 통합
├── style.css                   # 기존 - 인증 UI 스타일
└── .github/workflows/
    ├── deploy-frontend.yml     # 기존 - Pages 배포
    └── deploy-api.yml          # 새로 추가 - Worker 배포
```

### 브랜치 전략
```
main (운영)
├── phase3-auth-backend         # 🟢 안전 - 백엔드만
│   ├── supabase-setup
│   ├── cloudflare-worker-setup  
│   ├── auth-api
│   └── leaderboard-api
│
└── phase3-auth-frontend        # 🟡 영향 있음 - 프론트엔드
    ├── auth-manager
    ├── login-ui
    ├── score-upload
    └── leaderboard-ui
```

## ✅ 완료 기준

### Phase 3-A 완료 기준
- [x] Supabase DB가 설정되고 테스트 데이터 입력 가능
- [x] Cloudflare Workers API가 배포되고 모든 엔드포인트 작동
- [x] Google OAuth 인증이 정상 작동
- [x] 점수 업로드 및 리더보드 조회 API 완전 작동
- [x] 기존 Word Crack 게임에 전혀 영향 없음

### Phase 3-B 완료 기준  
- [ ] 로그인/로그아웃 UI가 완전히 작동
- [ ] 게임 완료 시 점수가 자동으로 글로벌 리더보드에 업로드
- [ ] 리더보드 화면에서 실시간 순위 확인 가능
- [ ] Feature Flag로 기능 활성화/비활성화 가능
- [ ] 모든 기존 기능이 정상 작동 (하위 호환성)

## 🚀 배포 전략

### Phase 3-A 배포 (안전) ✅ **완료**
1. ✅ `phase3-auth-backend` 브랜치에서 백엔드 개발
2. ✅ Cloudflare Workers 독립 배포 (`https://wordcrack-api.letthelightsurroundyou.workers.dev/`)
3. ✅ Supabase DB 설정 (`cracker_profiles`, `cracker_scores` 테이블)
4. ✅ API 테스트 완료 (모든 엔드포인트 정상 작동)
5. ✅ 기존 서비스 무영향

### Phase 3-B 배포 (주의)
1. `phase3-auth-frontend` 브랜치에서 프론트엔드 개발
2. Feature Flag로 기능 비활성화 상태로 배포
3. 단계적 기능 활성화
4. 충분한 테스트 후 완전 활성화

## 📝 참고사항
- 기존 인프라 최대 활용 (Cloudflare Pages/Workers, 기존 Google Project)
- Supabase 무료 티어 활용 (500MB, 50k MAU)
- 운영 서비스 영향 최소화를 위한 단계별 개발
- 롤백 계획 수립 및 Feature Flag 활용

## 🔄 Future Extensions (Phase 4+)
- 점수 공유 시스템 (소셜 미디어 연동)
- 친구 시스템 및 친구와 비교 기능
- 경쟁 모드 (제한시간, 연속도전, 토너먼트)
- 문제 리뷰 시스템 (히스토리, 재도전, 고급 관리)
- 콘텐츠 확장 시스템 (동적 로딩, 사용자 정의)
- 고급 분석 대시보드 (학습 패턴, 개인화 추천)
- 모바일 앱 변환 준비
- AI 기반 문제 생성 시스템