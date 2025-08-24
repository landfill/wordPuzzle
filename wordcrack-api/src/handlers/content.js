// Content Management Handler - Phase 4-D (로컬 테스트용 간단 버전)
// 동적 콘텐츠 시스템을 위한 API 엔드포인트

import { corsHeaders } from '../utils/cors.js';

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
            return await getStaticContentFallback();
        }

        // POST /api/content/add - 사용자 생성 콘텐츠 추가
        if (path === '/api/content/add' && request.method === 'POST') {
            const body = await request.json();
            console.log('[Content] Add content request:', body);
            
            return new Response(JSON.stringify({
                message: 'Content received (mock response)',
                count: body.problems ? body.problems.length : 0,
                status: 'simulated_pending_approval'
            }), { headers });
        }

        // GET /api/content/category/:category - 특정 카테고리 콘텐츠
        const categoryMatch = path.match(/^\/api\/content\/category\/(.+)$/);
        if (categoryMatch && request.method === 'GET') {
            const category = categoryMatch[1];
            return new Response(JSON.stringify({
                category,
                version: CONTENT_VERSION,
                content: { [category]: { 'Test Source': [] } },
                totalItems: 0
            }), { headers });
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
 * 정적 폴백 데이터 반환
 */
async function getStaticContentFallback() {
    const headers = {
        'Content-Type': 'application/json',
        ...corsHeaders
    };

    // 기본 샘플 콘텐츠
    const fallbackContent = {
        movies: {
            'Toy Story': [
                { sentence: "To infinity and beyond!", translation: "무한한 우주 그 너머로!", difficulty: 'easy' },
                { sentence: "You've got a friend in me.", translation: "당신에게는 나라는 친구가 있어요.", difficulty: 'medium' }
            ],
            'Finding Nemo': [
                { sentence: "Just keep swimming!", translation: "계속 헤엄치기만 하면 돼!", difficulty: 'easy' }
            ]
        },
        quotes: {
            'Life Quotes': [
                { sentence: "Life is what happens when you're busy making other plans.", translation: "인생은 당신이 다른 계획을 세우느라 바쁠 때 일어나는 것입니다.", difficulty: 'hard' }
            ]
        },
        songs: {
            'Classic Songs': [
                { sentence: "Imagine all the people living life in peace.", translation: "모든 사람들이 평화롭게 사는 것을 상상해보세요.", difficulty: 'medium' }
            ]
        }
    };

    return new Response(JSON.stringify({
        version: CONTENT_VERSION + '-fallback',
        lastUpdate: Date.now(),
        content: fallbackContent,
        fallback: true,
        totalItems: Object.values(fallbackContent).reduce((total, category) => 
            total + Object.values(category).reduce((subtotal, problems) => subtotal + problems.length, 0), 0
        )
    }), { headers });
}