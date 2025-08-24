#!/usr/bin/env node

// Content Upload Script - Phase 4-D
// CSV 파일을 읽어서 동적 콘텐츠 시스템에 업로드

const fs = require('fs');
const path = require('path');

// 설정
const API_BASE_URL = process.env.API_BASE_URL || 'https://wordcrack-api.letthelightsurroundyou.workers.dev';
const CSV_FILE = process.argv[2] || '../sample-content.csv';

async function uploadContent() {
    try {
        console.log('🚀 콘텐츠 업로드 시작...');
        
        // CSV 파일 읽기
        const csvPath = path.resolve(__dirname, CSV_FILE);
        if (!fs.existsSync(csvPath)) {
            throw new Error(`CSV 파일을 찾을 수 없습니다: ${csvPath}`);
        }
        
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        console.log(`📄 CSV 파일 로드: ${lines.length - 1}개 항목 발견`);
        
        // 카테고리별로 그룹화
        const contentByCategory = {};
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length < 5) continue;
            
            const [category, source, sentence, translation, difficulty] = values;
            
            if (!contentByCategory[category]) {
                contentByCategory[category] = {};
            }
            
            if (!contentByCategory[category][source]) {
                contentByCategory[category][source] = [];
            }
            
            contentByCategory[category][source].push({
                sentence,
                translation, 
                difficulty
            });
        }
        
        // 카테고리/소스별로 업로드
        let totalUploaded = 0;
        
        for (const [category, sources] of Object.entries(contentByCategory)) {
            console.log(`\n📚 카테고리: ${category}`);
            
            for (const [source, problems] of Object.entries(sources)) {
                console.log(`  📖 소스: ${source} (${problems.length}개 항목)`);
                
                try {
                    const response = await fetch(`${API_BASE_URL}/api/content/add`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            category,
                            source,
                            problems
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        console.log(`  ✅ 업로드 성공: ${problems.length}개`);
                        totalUploaded += problems.length;
                    } else {
                        console.log(`  ❌ 업로드 실패: ${result.error || result.message}`);
                    }
                    
                    // API 부하 방지를 위한 딜레이
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (error) {
                    console.log(`  ❌ 네트워크 오류: ${error.message}`);
                }
            }
        }
        
        console.log(`\n🎉 업로드 완료! 총 ${totalUploaded}개 항목이 업로드되었습니다.`);
        
    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
        process.exit(1);
    }
}

// 사용법 출력
function showUsage() {
    console.log(`
📝 콘텐츠 업로드 스크립트 사용법:

기본 사용:
  node upload-content.js

CSV 파일 지정:
  node upload-content.js path/to/your/content.csv

환경 변수:
  API_BASE_URL=https://your-api.com node upload-content.js

CSV 형식:
  category,source,sentence,translation,difficulty
  movies,Toy Story,Hello world,안녕 세상,easy

지원 카테고리: movies, quotes, songs, books, daily_travel_phrases
지원 난이도: easy, medium, hard
`);
}

// 도움말 요청 시
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage();
    process.exit(0);
}

// 스크립트 실행
uploadContent();