-- Phase 4-D: Dynamic Content System Database Schema
-- 동적 콘텐츠 시스템을 위한 데이터베이스 구조

-- 1. 동적 콘텐츠 테이블 생성
CREATE TABLE IF NOT EXISTS dynamic_content (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    source VARCHAR(100) NOT NULL,
    sentence TEXT NOT NULL,
    translation TEXT,
    difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    created_by VARCHAR(100) DEFAULT 'system',
    active BOOLEAN DEFAULT true,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version VARCHAR(20) DEFAULT '1.0.0',
    
    -- 인덱스를 위한 복합 키
    UNIQUE(category, source, sentence)
);

-- 2. 콘텐츠 버전 관리 테이블
CREATE TABLE IF NOT EXISTS content_versions (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    total_items INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

-- 3. 사용자 생성 콘텐츠 승인 테이블
CREATE TABLE IF NOT EXISTS content_moderation (
    id SERIAL PRIMARY KEY,
    content_id INTEGER REFERENCES dynamic_content(id) ON DELETE CASCADE,
    moderator VARCHAR(100),
    action VARCHAR(20) CHECK (action IN ('approved', 'rejected', 'pending')) DEFAULT 'pending',
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 콘텐츠 다운로드 통계
CREATE TABLE IF NOT EXISTS content_download_stats (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    version VARCHAR(20),
    category VARCHAR(50),
    download_count INTEGER DEFAULT 1,
    last_download TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, version, category)
);

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_dynamic_content_category ON dynamic_content(category);
CREATE INDEX IF NOT EXISTS idx_dynamic_content_active ON dynamic_content(active);
CREATE INDEX IF NOT EXISTS idx_dynamic_content_approved ON dynamic_content(approved);
CREATE INDEX IF NOT EXISTS idx_dynamic_content_created_at ON dynamic_content(created_at);
CREATE INDEX IF NOT EXISTS idx_dynamic_content_difficulty ON dynamic_content(difficulty);
CREATE INDEX IF NOT EXISTS idx_content_moderation_status ON content_moderation(action);

-- 6. 기본 콘텐츠 버전 데이터 삽입
INSERT INTO content_versions (version, description, total_items) 
VALUES ('1.0.0', 'Initial dynamic content system', 0)
ON CONFLICT (version) DO NOTHING;

-- 7. 기존 정적 콘텐츠를 동적 테이블로 마이그레이션 (선택적)
-- 이 부분은 실제 content-database.js 내용을 기반으로 실행해야 함

-- 예시: 샘플 콘텐츠 추가
INSERT INTO dynamic_content (category, source, sentence, translation, difficulty, active, approved) VALUES
('movies', 'Toy Story', 'To infinity and beyond!', '무한한 우주 그 너머로!', 'easy', true, true),
('movies', 'Toy Story', 'You''ve got a friend in me.', '당신에게는 나라는 친구가 있어요.', 'medium', true, true),
('movies', 'Finding Nemo', 'Just keep swimming!', '계속 헤엄치기만 하면 돼!', 'easy', true, true),
('quotes', 'Life Quotes', 'Life is what happens to you while you''re busy making other plans.', '인생은 당신이 다른 계획을 세우느라 바쁠 때 일어나는 것입니다.', 'hard', true, true),
('songs', 'Classic Songs', 'Imagine all the people living life in peace.', '모든 사람들이 평화롭게 사는 것을 상상해보세요.', 'medium', true, true)
ON CONFLICT (category, source, sentence) DO NOTHING;

-- 8. 콘텐츠 통계 업데이트 함수
CREATE OR REPLACE FUNCTION update_content_version_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- 활성화된 콘텐츠 수량 업데이트
    UPDATE content_versions 
    SET total_items = (
        SELECT COUNT(*) FROM dynamic_content 
        WHERE active = true AND approved = true
    )
    WHERE active = true;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 트리거 생성
CREATE TRIGGER update_version_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON dynamic_content
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_content_version_stats();

-- 10. Row Level Security (RLS) 설정
ALTER TABLE dynamic_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_download_stats ENABLE ROW LEVEL SECURITY;

-- 읽기 권한: 승인된 활성 콘텐츠만 공개
CREATE POLICY "Public can read approved content" ON dynamic_content
    FOR SELECT USING (active = true AND approved = true);

-- 쓰기 권한: 인증된 사용자만 콘텐츠 추가 가능 (승인 대기 상태)
CREATE POLICY "Authenticated users can insert content" ON dynamic_content
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 콘텐츠 버전은 모든 사용자 읽기 가능
CREATE POLICY "Public can read content versions" ON content_versions
    FOR SELECT USING (active = true);

-- 다운로드 통계는 해당 사용자만 접근 가능
CREATE POLICY "Users can access own download stats" ON content_download_stats
    FOR ALL USING (auth.uid()::text = user_id);

-- 11. 뷰 생성: 공개 콘텐츠 뷰
CREATE OR REPLACE VIEW public_content AS
SELECT 
    category,
    source,
    sentence,
    translation,
    difficulty,
    created_at
FROM dynamic_content
WHERE active = true AND approved = true
ORDER BY created_at DESC;

-- 12. 콘텐츠 검색을 위한 전체 텍스트 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_dynamic_content_search 
ON dynamic_content USING gin(to_tsvector('english', sentence || ' ' || COALESCE(translation, '')));

COMMENT ON TABLE dynamic_content IS 'Phase 4-D: 동적 콘텐츠 저장소';
COMMENT ON TABLE content_versions IS 'Phase 4-D: 콘텐츠 버전 관리';
COMMENT ON TABLE content_moderation IS 'Phase 4-D: 사용자 생성 콘텐츠 승인 시스템';
COMMENT ON TABLE content_download_stats IS 'Phase 4-D: 콘텐츠 다운로드 통계';