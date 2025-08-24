# 동적 콘텐츠 DB 업데이트 전략

## 현재 구조 (INSERT 기반)
```sql
-- 장점: 중복 방지, 히스토리 보존
-- 단점: 수정 시 복잡함, 삭제된 콘텐츠 추적 어려움
INSERT INTO dynamic_content (...) VALUES (...) 
ON CONFLICT (category, source, sentence) DO NOTHING;
```

## 개선된 업데이트 전략

### 1. UPSERT 방식 (PostgreSQL)
```sql
INSERT INTO dynamic_content (category, source, sentence, translation, difficulty, version)
VALUES ('movies', 'Toy Story', 'To infinity and beyond!', '무한한 우주 그 너머로!', 'easy', '1.1.0')
ON CONFLICT (category, source, sentence) 
DO UPDATE SET 
    translation = EXCLUDED.translation,
    difficulty = EXCLUDED.difficulty,
    version = EXCLUDED.version,
    updated_at = NOW()
WHERE dynamic_content.version != EXCLUDED.version;
```

### 2. 배치 업데이트 (Bulk Operations)
```sql
-- 임시 테이블 생성
CREATE TEMP TABLE temp_content AS SELECT * FROM dynamic_content WHERE 1=0;

-- 새 데이터를 임시 테이블에 INSERT
INSERT INTO temp_content (category, source, sentence, ...) VALUES ...;

-- 배치 UPSERT
WITH upsert AS (
  INSERT INTO dynamic_content 
  SELECT * FROM temp_content
  ON CONFLICT (category, source, sentence) DO UPDATE SET ...
  RETURNING *
)
SELECT COUNT(*) FROM upsert;
```

### 3. 스마트 동기화 방식
```sql
-- 1) 해시 기반 변경 감지
ALTER TABLE dynamic_content ADD COLUMN content_hash VARCHAR(64);

-- 2) 변경된 항목만 업데이트
UPDATE dynamic_content SET 
    translation = new_value,
    updated_at = NOW()
WHERE content_hash != MD5(sentence || translation || difficulty);

-- 3) 새 항목만 INSERT
INSERT INTO dynamic_content (...)
SELECT ... FROM temp_data t
WHERE NOT EXISTS (
    SELECT 1 FROM dynamic_content d 
    WHERE d.category = t.category 
    AND d.source = t.source 
    AND d.sentence = t.sentence
);
```

## 권장 구현 방식

### A. 소량 업데이트 (< 1000건)
- **UPSERT** 방식 사용
- 실시간 업데이트 가능
- 사용자 생성 콘텐츠에 적합

### B. 대량 업데이트 (> 1000건) 
- **배치 처리** 방식 사용
- 오프라인 처리 권장
- 정기 콘텐츠 업데이트에 적합

### C. 점진적 동기화
- **해시 기반** 변경 감지
- 네트워크 효율성 최대화
- CDN + 델타 업데이트

## API 레벨에서의 최적화

### 1. 버전 기반 부분 업데이트
```javascript
// 클라이언트: 마지막 업데이트 시간 전송
GET /api/content/updates?since=2024-01-01T00:00:00Z

// 서버: 변경된 콘텐츠만 반환
{
  "version": "1.2.0",
  "updates": {
    "added": [...],
    "modified": [...], 
    "deleted": [...]
  }
}
```

### 2. 카테고리별 점진적 업데이트
```javascript
// 카테고리별로 버전 관리
{
  "movies": { "version": "1.1.0", "lastUpdate": "..." },
  "quotes": { "version": "1.0.5", "lastUpdate": "..." },
  "songs": { "version": "1.2.1", "lastUpdate": "..." }
}
```

### 3. 압축 + 차분 업데이트
```javascript
// 압축된 델타 패치
GET /api/content/delta?from=1.0.0&to=1.1.0
// 응답: 압축된 JSON 패치 형식
```

## 성능 최적화

### DB 레벨
- 파티셔닝: 카테고리별 테이블 분할
- 인덱스: 복합 인덱스 최적화
- 캐싱: Redis/Memcached 활용

### API 레벨  
- CDN: 콘텐츠 캐싱
- 압축: gzip/brotli
- 배치: 여러 요청 통합

### 클라이언트 레벨
- 지능형 캐싱: stale-while-revalidate
- 백그라운드 동기화: Service Worker
- 점진적 로딩: 필요한 카테고리만