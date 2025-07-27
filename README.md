
---

# 🌟 Word Crack Game

**" 좋아하는 영화, 노래, 명언의 일부가 되어보세요!"**

Word Crack Game은 유명한 영화 대사, 노래 가사, 책 구절, 그리고 명언들 속 빈칸을 채우며 영어 실력과 타자 실력을 동시에 향상시킬 수 있는 인터랙티브 웹 게임입니다. 문장을 완성한 후에는 AI가 읽어주는 자연스러운 음성으로 전체 문장을 들으며 리스닝 훈련까지 경험할 수 있습니다.

<p align="center">
  <img src="https://github.com/user-attachments/assets/df5a29fa-5527-4e6f-9f18-bdb6730beec9" width="260" alt="Category Selection Screen">
  <img src="https://github.com/user-attachments/assets/dd3bf51b-7f1c-4bf4-99c1-6c2a9c846cd8" width="260" alt="Game Play Screen">
  <img src="https://github.com/user-attachments/assets/da53f343-00c6-4f14-a6a6-7a81a43c0579" width="260" alt="Success Modal Screen">
</p>

---

## ✨ 주요 기능 (Features)

### 🎮 핵심 게임 기능
-   **🗂️ 다양한 카테고리:** 영화, 노래, 책, 명언, 여행 영어 등 원하는 주제를 선택하여 퀴즈를 즐길 수 있습니다.
-   **🤖 고품질 AI 음성 (TTS):** Google Cloud Text-to-Speech API를 활용하여, 실제 원어민처럼 자연스러운 발음으로 완성된 문장을 들을 수 있습니다.
-   **🎤 단어별 하이라이트:** AI 음성이 재생될 때, 현재 읽고 있는 단어가 실시간으로 하이라이트되어 학습 효과를 극대화합니다.
-   **⌨️ 유연한 입력 방식:** 실제 키보드뿐만 아니라, 화면에 표시되는 가상 키보드를 통해서도 편리하게 정답을 입력할 수 있습니다.

### 📊 개인 데이터 관리 (로컬 스토리지)
-   **📈 상세 통계:** 총 문제 수, 정답률, 카테고리별 진행률, 힌트 사용 통계, 플레이 시간 등 모든 학습 데이터를 추적합니다.
-   **🏆 성취도 배지 시스템:** 카테고리별 완료, 연속 성공, 힌트 없이 완료, 완벽한 점수 등 다양한 조건의 배지를 획득할 수 있습니다.
-   **📋 개인 대시보드:** 학습 진행 상황, 획득 배지, 최근 활동을 한눈에 확인할 수 있는 대시보드를 제공합니다.
-   **💾 문장 즐겨찾기:** 마음에 드는 문장을 저장하고 관리하며, 저장된 문장으로 재도전할 수 있습니다.

### 🌐 글로벌 경쟁 기능
-   **🔐 Google 로그인:** 간편한 Google OAuth 인증으로 안전하게 로그인할 수 있습니다.
-   **🎯 실시간 점수 업로드:** 게임 완료 시 점수가 자동으로 글로벌 리더보드에 업로드됩니다.
-   **🏅 글로벌 리더보드:** 전 세계 플레이어들과 실시간으로 순위를 비교하고 경쟁할 수 있습니다.
-   **📂 카테고리별 순위:** 각 카테고리별로 세분화된 리더보드에서 자신의 실력을 확인할 수 있습니다.

### 🔧 시스템 기능
-   **📱 완벽한 반응형 디자인:** 데스크톱, 태블릿, 모바일 등 모든 기기에서 최적화된 UI/UX를 제공합니다.
-   **⚙️ 서버리스 아키텍처:** Cloudflare Pages/Workers와 Supabase를 활용한 확장 가능한 인프라를 구축했습니다.
-   **🚩 Feature Flag 시스템:** 기능별 토글 관리로 안전한 배포와 점진적 기능 활성화가 가능합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

| 구분        | 기술                                                               | 설명                                                           |
| :---------- | :----------------------------------------------------------------- | :------------------------------------------------------------- |
| **Frontend** | `Vanilla JavaScript (ESM)`                                         | 프레임워크 없이 순수 JavaScript 모듈 시스템으로 게임 로직 구현 |
| **Styling** | `CSS3`                                                             | Flexbox, Grid, Keyframe Animations를 활용한 반응형 UI/UX       |
| **Backend** | `Cloudflare Workers`                                               | 인증, 점수 관리, 리더보드 API를 위한 서버리스 백엔드           |
| **Database** | `Supabase (PostgreSQL)`                                           | 사용자 프로필 및 점수 데이터 관리를 위한 관계형 데이터베이스    |
| **Authentication** | `Google OAuth 2.0`                                                | 안전하고 간편한 사용자 인증 시스템                              |
| **TTS API** | `Google Cloud Text-to-Speech API`                                  | 고품질 AI 음성 생성을 위한 외부 API                              |
| **Hosting** | `Cloudflare Pages`                                                 | 프론트엔드 및 서버리스 함수 통합 배포, CI/CD 자동화            |
| **Storage** | `localStorage`                                                     | 개인 데이터, 통계, 배지 정보의 클라이언트 사이드 저장          |

---

## 📂 파일 구조 (File Structure)

```
.
├── 📄 index.html               # 메인 HTML 파일 (애플리케이션 진입점)
├── 📄 style.css                # 전체 스타일을 관리하는 CSS 파일
├── 📄 script.js                # 메인 게임 로직, UI 컨트롤, 이벤트 핸들링
├── 📄 content-generator.js     # 문제 데이터베이스를 기반으로 퀴즈를 생성하는 모듈
├── 📄 content-database.js      # 게임에 사용될 모든 문장 데이터를 관리하는 파일
├── 📄 data-manager.js          # 로컬 스토리지 기반 사용자 데이터 관리
├── 📄 achievement-system.js    # 성취도 배지 시스템
├── 📄 auth-manager.js          # Google OAuth 인증 관리
├── 📄 config.js                # Feature Flag 및 설정 관리
├── 📁 functions
│   └── 📄 google-tts.js        # Cloudflare 서버리스 함수 (Google TTS API 프록시)
└── 📁 wordcrack-api            # 백엔드 API (Cloudflare Workers)
    ├── 📄 package.json
    ├── 📄 wrangler.toml
    └── 📁 src
        ├── 📄 index.js         # 메인 Worker 라우터
        ├── 📁 handlers
        │   ├── 📄 auth.js      # Google OAuth 및 JWT 인증
        │   ├── 📄 scores.js    # 점수 업로드 및 조회
        │   └── 📄 leaderboard.js # 글로벌 리더보드
        └── 📁 utils
            ├── 📄 supabase.js  # Supabase 클라이언트
            └── 📄 cors.js      # CORS 헤더 관리

---

## 🚀 시작하기 (Getting Started)

이 프로젝트는 별도의 로컬 서버 설정 없이 바로 실행할 수 있습니다.

1.  이 저장소를 클론(Clone)하거나 다운로드합니다.
2.  `index.html` 파일을 웹 브라우저에서 엽니다.
3.  카테고리를 선택하고 게임을 시작하세요!

> **참고:** 로컬 파일(`file://...`) 환경에서는 TTS 기능(API 호출)이 CORS 정책으로 인해 제한될 수 있습니다. `Live Server`와 같은 VS Code 확장 프로그램을 사용하여 로컬 웹 서버를 실행하는 것을 권장합니다.

---

## 🎯 개발 단계별 기능 (Development Phases)

### Phase 1: 핵심 게임 시스템 ✅
- 기본 게임 플레이 로직 및 UI/UX
- Google TTS API 연동
- 카테고리별 문제 시스템
- 반응형 디자인

### Phase 2: 로컬 데이터 관리 ✅  
- 로컬 스토리지 기반 사용자 데이터 관리
- 성취도 배지 시스템 (20+ 종류의 배지)
- 개인 대시보드 및 통계
- 문장 즐겨찾기 및 관리 기능

### Phase 3: 글로벌 경쟁 시스템 ✅
- Google OAuth 인증 시스템
- Cloudflare Workers 기반 백엔드 API
- Supabase를 활용한 데이터베이스 연동
- 실시간 글로벌 리더보드
- Feature Flag 시스템

### Phase 4+: 확장 기능 (계획)
- 소셜 공유 시스템
- 친구 기능 및 친구와 비교
- 경쟁 모드 (제한시간, 연속도전, 토너먼트)
- AI 기반 개인화 문제 생성
- 모바일 앱 변환

## 📝 최근 주요 업데이트 (Recent Updates)

-   **글로벌 경쟁 시스템:** Google 로그인과 실시간 리더보드를 통한 전 세계 플레이어와의 경쟁 기능 추가
-   **데이터 관리 시스템:** 로컬 스토리지 기반의 상세한 개인 통계 및 성취도 배지 시스템 구현
-   **백엔드 아키텍처:** Cloudflare Workers + Supabase 기반의 확장 가능한 서버리스 인프라 구축
-   **Feature Flag 시스템:** 안전한 배포와 점진적 기능 활성화를 위한 토글 시스템 도입
-   **UI/UX 고도화:** 대시보드, 리더보드, 인증 등 복합적인 기능을 위한 전면적인 디자인 개선
