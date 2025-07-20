
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

-   **🗂️ 다양한 카테고리:** 영화, 노래, 책, 명언, 여행 영어 등 원하는 주제를 선택하여 퀴즈를 즐길 수 있습니다.
-   **🤖 고품질 AI 음성 (TTS):** Google Cloud Text-to-Speech API를 활용하여, 실제 원어민처럼 자연스러운 발음으로 완성된 문장을 들을 수 있습니다.
-   **🎤 단어별 하이라이트:** AI 음성이 재생될 때, 현재 읽고 있는 단어가 실시간으로 하이라이트되어 학습 효과를 극대화합니다.
-   **📱 완벽한 반응형 디자인:** 데스크톱, 태블릿, 모바일 등 모든 기기에서 최적화된 UI/UX를 제공합니다.
-   **⚙️ 서버리스 백엔드:** Cloudflare Pages와 Functions를 사용하여 안정적이고 확장성 있는 서버리스 아키텍처를 구현했습니다.
-   **⌨️ 유연한 입력 방식:** 실제 키보드뿐만 아니라, 화면에 표시되는 가상 키보드를 통해서도 편리하게 정답을 입력할 수 있습니다.

---

## 🛠️ 기술 스택 (Tech Stack)

| 구분        | 기술                                                               | 설명                                                           |
| :---------- | :----------------------------------------------------------------- | :------------------------------------------------------------- |
| **Frontend** | `Vanilla JavaScript (ESM)`                                         | 프레임워크 없이 순수 JavaScript 모듈 시스템으로 게임 로직 구현 |
| **Styling** | `CSS3`                                                             | Flexbox, Grid, Keyframe Animations를 활용한 반응형 UI/UX       |
| **Backend** | `Cloudflare Functions`                                             | Google TTS API 호출을 위한 안전한 서버리스 프록시(Proxy) 구현  |
| **API**     | `Google Cloud Text-to-Speech API`                                  | 고품질 AI 음성 생성을 위한 외부 API                              |
| **Hosting** | `Cloudflare Pages`                                                 | 프론트엔드 및 서버리스 함수 통합 배포, CI/CD 자동화            |

---

## 📂 파일 구조 (File Structure)

```
.
├── 📄 index.html             # 메인 HTML 파일 (애플리케이션 진입점)
├── 📄 style.css              # 전체 스타일을 관리하는 CSS 파일
├── 📄 script.js              # 메인 게임 로직, UI 컨트롤, 이벤트 핸들링
├── 📄 content-generator.js   # 문제 데이터베이스를 기반으로 퀴즈를 생성하는 모듈
├── 📄 content-database.js    # 게임에 사용될 모든 문장 데이터를 관리하는 파일
├── 📄 enhanced-script.js     # (향후 확장용) 동적 콘텐츠 생성 로직
├── 📄 api-integration.js     # (향후 확장용) 외부 API 연동 모듈
└── 📁 functions
    └── 📄 google-tts.js      # Cloudflare 서버리스 함수 (Google TTS API 프록시)

---

## 🚀 시작하기 (Getting Started)

이 프로젝트는 별도의 로컬 서버 설정 없이 바로 실행할 수 있습니다.

1.  이 저장소를 클론(Clone)하거나 다운로드합니다.
2.  `index.html` 파일을 웹 브라우저에서 엽니다.
3.  카테고리를 선택하고 게임을 시작하세요!

> **참고:** 로컬 파일(`file://...`) 환경에서는 TTS 기능(API 호출)이 CORS 정책으로 인해 제한될 수 있습니다. `Live Server`와 같은 VS Code 확장 프로그램을 사용하여 로컬 웹 서버를 실행하는 것을 권장합니다.

---

## 📝 최근 주요 업데이트 (Recent Updates)

-   **아키텍처 변경:** 백엔드 로직을 Cloudflare Functions 기반의 서버리스 아키텍처로 전환하여 보안 및 확장성 강화.
-   **카테고리 기능 추가:** 사용자가 원하는 주제를 선택하여 게임을 시작할 수 있는 시작 화면 구현.
-   **TTS 엔진 교체:** Web Speech API에서 Google Cloud TTS API로 변경하여 음성 품질 대폭 향상.
-   **미리 보기 환경 디버깅:** Cloudflare Pages의 프로덕션/미리 보기 환경 간 CORS 및 API 키 제한 문제 해결.
-   **UI/UX 개선:** 전체적인 레이아웃 및 모달 창 디자인 개선으로 사용자 경험 향상.
