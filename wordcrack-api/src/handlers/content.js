// Content Management Handler - Phase 4-D
// 동적 콘텐츠 시스템을 위한 API 엔드포인트

import { corsHeaders } from '../utils/cors.js';
import { createClient } from '../utils/supabase.js';

// 콘텐츠 버전 관리
const CONTENT_VERSION = '1.0.0';

export async function handleContent(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 기본 CORS 헤더
    const headers = {
        'Content-Type': 'application/json',
        ...corsHeaders
    };

    try {
        // GET /api/content/version - 콘텐츠 버전 확인
        if (path === '/api/content/version' && request.method === 'GET') {
            return new Response(JSON.stringify({
                version: CONTENT_VERSION,
                lastUpdate: Date.now(),
                status: 'available'
            }), { headers });
        }

        // GET /api/content/all - 모든 콘텐츠 다운로드
        if (path === '/api/content/all' && request.method === 'GET') {
            return await handleContentDownload(env);
        }

        // POST /api/content/add - 사용자 생성 콘텐츠 추가
        if (path === '/api/content/add' && request.method === 'POST') {
            return await handleContentAdd(request, env);
        }

        // GET /api/content/category/:category - 특정 카테고리 콘텐츠
        const categoryMatch = path.match(/^\/api\/content\/category\/(.+)$/);
        if (categoryMatch && request.method === 'GET') {
            const category = categoryMatch[1];
            return await handleCategoryContent(category, env);
        }

        return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (error) {
        console.error('[Content API] Error:', error);
        return new Response(JSON.stringify({
            error: 'Internal Server Error',
            message: error.message
        }), { 
            status: 500, 
            headers 
        });
    }
}

/**
 * 모든 콘텐츠 다운로드
 */
async function handleContentDownload(env) {
    const headers = {
        'Content-Type': 'application/json',
        ...corsHeaders
    };

    try {
        const supabase = createClient(env);
        
        // 데이터베이스에서 콘텐츠 조회
        const { data: contentData, error } = await supabase
            .from('dynamic_content')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Content] Database error:', error);
            // 정적 폴백 데이터 반환
            return await getStaticContentFallback();
        }

        // 콘텐츠를 카테고리별로 그룹화
        const groupedContent = {};
        contentData.forEach(item => {
            if (!groupedContent[item.category]) {
                groupedContent[item.category] = {};
            }
            if (!groupedContent[item.category][item.source]) {
                groupedContent[item.category][item.source] = [];
            }
            
            groupedContent[item.category][item.source].push({
                sentence: item.sentence,
                translation: item.translation,
                difficulty: item.difficulty
            });
        });

        return new Response(JSON.stringify({
            version: CONTENT_VERSION,
            lastUpdate: Date.now(),
            content: groupedContent,
            totalItems: contentData.length
        }), { headers });

    } catch (error) {
        console.error('[Content] Download error:', error);
        return await getStaticContentFallback();
    }
}

/**
 * 사용자 생성 콘텐츠 추가
 */
async function handleContentAdd(request, env) {
    const headers = {
        'Content-Type': 'application/json',
        ...corsHeaders
    };

    try {
        const body = await request.json();
        const { category, source, problems } = body;

        // 데이터 검증
        if (!category || !source || !Array.isArray(problems)) {
            return new Response(JSON.stringify({
                error: 'Invalid data format'
            }), { status: 400, headers });
        }

        const supabase = createClient(env);
        
        // 사용자 인증 확인 (선택적)
        const authHeader = request.headers.get('Authorization');
        let userId = 'anonymous';
        
        if (authHeader) {
            // JWT 토큰 검증 로직 (기존 auth.js 활용 가능)
            // 여기서는 단순화
        }

        // 각 문제를 개별적으로 저장
        const insertPromises = problems.map(problem => {
            return supabase
                .from('dynamic_content')
                .insert({
                    category,
                    source,
                    sentence: problem.sentence,
                    translation: problem.translation || '',
                    difficulty: problem.difficulty || 'medium',
                    created_by: userId,
                    active: false, // 승인 대기 상태
                    created_at: new Date().toISOString()
                });
        });

        await Promise.all(insertPromises);

        return new Response(JSON.stringify({
            message: 'Content added successfully',
            count: problems.length,
            status: 'pending_approval'
        }), { headers });

    } catch (error) {
        console.error('[Content] Add error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to add content'
        }), { status: 500, headers });
    }
}

/**
 * 특정 카테고리 콘텐츠 조회
 */
async function handleCategoryContent(category, env) {
    const headers = {
        'Content-Type': 'application/json',
        ...corsHeaders
    };

    try {
        const supabase = createClient(env);
        
        const { data: contentData, error } = await supabase
            .from('dynamic_content')
            .select('*')
            .eq('category', category)
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Content] Category query error:', error);
            return new Response(JSON.stringify({
                error: 'Database error'
            }), { status: 500, headers });
        }

        // 소스별로 그룹화
        const groupedContent = {};
        contentData.forEach(item => {
            if (!groupedContent[item.source]) {
                groupedContent[item.source] = [];
            }
            
            groupedContent[item.source].push({
                sentence: item.sentence,
                translation: item.translation,
                difficulty: item.difficulty
            });
        });

        return new Response(JSON.stringify({
            category,
            version: CONTENT_VERSION,
            content: groupedContent,
            totalItems: contentData.length
        }), { headers });

    } catch (error) {
        console.error('[Content] Category error:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error'
        }), { status: 500, headers });
    }
}

/**
 * 정적 폴백 데이터 반환
 */
async function getStaticContentFallback() {
    const headers = {
        'Content-Type': 'application/json',
        ...corsHeaders
    };

    // 기본 샘플 콘텐츠 (실제로는 content-database.js 내용 사용)
    const fallbackContent = {
        movies: {
            'Fallback Movies': [
                { sentence: "Hello, world!", translation: "안녕, 세상!", difficulty: 'easy' }
            ]
        }
    };

    return new Response(JSON.stringify({
        version: CONTENT_VERSION + '-fallback',
        lastUpdate: Date.now(),
        content: fallbackContent,
        fallback: true
    }), { headers });
}