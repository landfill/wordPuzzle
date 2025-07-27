// Word Crack API - Cloudflare Worker
// Phase 3-A: 백엔드 기반 구축

import { handleAuth } from './handlers/auth.js';
import { handleScores } from './handlers/scores.js';
import { handleLeaderboard } from './handlers/leaderboard.js';
import { corsHeaders } from './utils/cors.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS preflight 처리
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        headers: corsHeaders,
        status: 200 
      });
    }

    try {
      // 로그 활성화 보장 - timestamp 포함
      console.log(`[${new Date().toISOString()}] ${request.method} ${url.pathname}`);
      
      // 라우팅
      if (url.pathname.startsWith('/api/auth')) {
        return await handleAuth(request, env);
      }
      
      if (url.pathname.startsWith('/api/scores')) {
        return await handleScores(request, env);
      }
      
      if (url.pathname.startsWith('/api/leaderboard')) {
        return await handleLeaderboard(request, env);
      }

      // 기본 응답
      if (url.pathname === '/') {
        return new Response(JSON.stringify({
          message: 'Word Crack API',
          version: '1.0.0',
          endpoints: [
            'POST /api/auth/google - Google OAuth 로그인',
            'GET /api/auth/verify - 토큰 검증',
            'POST /api/scores - 점수 업로드',
            'GET /api/scores - 개인 점수 조회',
            'GET /api/leaderboard - 전체 리더보드',
            'GET /api/leaderboard/:category - 카테고리별 리더보드'
          ]
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }

      return new Response('Not Found', { 
        status: 404, 
        headers: corsHeaders 
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }), { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }
  }
};