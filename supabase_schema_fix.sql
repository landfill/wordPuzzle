-- 기존 테이블 삭제 (데이터가 있다면 백업 후 실행)
DROP TABLE IF EXISTS cracker_scores;
DROP TABLE IF EXISTS cracker_profiles;

-- 새로운 cracker_profiles 테이블 (독립적인 UUID 사용)
CREATE TABLE cracker_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- cracker_scores 테이블 (변경 없음)
CREATE TABLE cracker_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES cracker_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  score INTEGER NOT NULL,
  hints_used INTEGER DEFAULT 0,
  perfect_score BOOLEAN DEFAULT FALSE,
  play_time INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE cracker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cracker_scores ENABLE ROW LEVEL SECURITY;

-- cracker_profiles에 대한 INSERT 정책 (서비스 키 또는 인증된 사용자)
CREATE POLICY "Allow service role to insert profiles" ON cracker_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role to select profiles" ON cracker_profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow service role to update profiles" ON cracker_profiles
  FOR UPDATE USING (true);

-- cracker_scores에 대한 정책
CREATE POLICY "Allow service role full access to scores" ON cracker_scores
  FOR ALL USING (true) WITH CHECK (true);

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_cracker_profiles_google_id ON cracker_profiles(google_id);
CREATE INDEX idx_cracker_scores_user_id ON cracker_scores(user_id);
CREATE INDEX idx_cracker_scores_category ON cracker_scores(category);