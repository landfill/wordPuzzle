# Phase 2 TODO - 기본 데이터 시스템 구축

## 🎯 Phase 2 목표
로컬 스토리지를 활용한 기본적인 사용자 데이터 관리 시스템 구축

## 📋 주요 기능

### 1. 로컬 스토리지 기반 데이터 관리
- [ ] 사용자 진행상황 저장 구조 설계
- [ ] 점수 및 통계 데이터 저장
- [ ] 완료한 문제 기록 시스템
- [ ] 카테고리별 진행률 추적
- [ ] 데이터 마이그레이션 및 버전 관리

### 2. 성취도 배지 시스템
- [ ] 배지 종류 정의 및 조건 설정
  - [ ] 카테고리별 완료 배지
  - [ ] 연속 성공 배지 (3회, 5회, 10회)
  - [ ] 힌트 없이 완료 배지
  - [ ] 완벽한 점수 배지
  - [ ] 특정 난이도 완료 배지
- [ ] 배지 획득 로직 구현
- [ ] 배지 UI 디자인 및 표시

### 3. 대시보드 구현
- [ ] 대시보드 페이지 레이아웃 설계
- [ ] 통계 표시 컴포넌트
  - [ ] 총 해결한 문제 수
  - [ ] 전체 정답률
  - [ ] 카테고리별 진행률
  - [ ] 힌트 사용 통계
- [ ] 획득한 배지 갤러리
- [ ] 최근 활동 기록
- [ ] 대시보드 접근 네비게이션

### 4. 기억하고 싶은 문장 저장 (즐겨찾기)
- [ ] 문제 완료 후 "저장하기" 버튼 추가
- [ ] 저장된 문장 데이터 구조 설계
- [ ] 저장된 문장 목록 페이지
- [ ] 저장된 문장 삭제/관리 기능
- [ ] 저장된 문장에서 재도전 기능

## 🔧 기술적 구현사항

### 데이터 구조 설계
```javascript
// 로컬 스토리지 데이터 구조 예시
const userData = {
  version: "2.0",
  stats: {
    totalProblemsAttempted: 0,
    totalProblemsCompleted: 0,
    totalScore: 0,
    hintsUsed: 0,
    perfectScores: 0
  },
  categoryProgress: {
    movies: { completed: 0, total: 0, bestScore: 0 },
    songs: { completed: 0, total: 0, bestScore: 0 },
    // ...
  },
  badges: [],
  savedSentences: [],
  completedProblems: []
}
```

### 새로운 파일 구조
- [ ] `data-manager.js` - 로컬 스토리지 관리
- [ ] `achievement-system.js` - 배지 시스템
- [ ] `dashboard.js` - 대시보드 로직
- [ ] `dashboard.html` - 대시보드 페이지 (또는 SPA 내 구현)

## ✅ 완료 기준
- [ ] 모든 게임 데이터가 로컬 스토리지에 지속적으로 저장됨
- [ ] 배지 시스템이 정상 작동하고 UI에 표시됨
- [ ] 대시보드에서 모든 통계를 확인할 수 있음
- [ ] 문장 저장 및 관리 기능이 완전히 작동함
- [ ] 기존 Phase 1 기능에 영향을 주지 않음

## 📝 참고사항
- 모든 데이터는 로컬 스토리지 기반 (DB는 Phase 3에서 고려)
- 기존 게임 플레이 경험을 해치지 않도록 구현
- 성능 최적화 고려 (로컬 스토리지 용량 제한)