// 점수 관련 핸들러

import { createCorsResponse } from '../utils/cors.js';
import { createSupabaseClient } from '../utils/supabase.js';

export async function handleScores(request, env) {
  const url = new URL(request.url);
  
  if (request.method === 'POST') {
    return await handleScoreUpload(request, env);
  }
  
  if (request.method === 'GET') {
    return await handleScoreQuery(request, env);
  }

  return createCorsResponse({ error: 'Method not allowed' }, 405);
}

async function handleScoreUpload(request, env) {
  try {
    // 인증 확인
    const user = await authenticateRequest(request, env);
    
    if (!user) {
      return createCorsResponse({ error: 'Authentication required' }, 401);
    }

    const scoreData = await request.json();
    
    // 필수 필드 검증
    if (!scoreData.category || typeof scoreData.score !== 'number') {
      return createCorsResponse({ 
        error: 'Invalid score data',
        required: ['category', 'score']
      }, 400);
    }

    // 점수 검증 (부정행위 방지)
    if (!isValidScore(scoreData)) {
      return createCorsResponse({ 
        error: 'Invalid score values' 
      }, 400);
    }

    // Supabase에 점수 저장
    const supabase = createSupabaseClient(env);
    
    const newScore = {
      user_id: user.userId,
      category: scoreData.category,
      score: scoreData.score,
      hints_used: scoreData.hintsUsed || 0,
      perfect_score: (scoreData.hintsUsed === 0 && scoreData.score >= 80),
      play_time: scoreData.playTime || 0
    };

    const result = await supabase.insert('cracker_scores', newScore);
    
    return createCorsResponse({
      success: true,
      scoreId: result[0].id,
      message: 'Score saved successfully'
    });

  } catch (error) {
    console.error('Score upload error:', error);
    return createCorsResponse({ 
      error: 'Score upload failed',
      message: error.message 
    }, 500);
  }
}

async function handleScoreQuery(request, env) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit')) || 10;

    const supabase = createSupabaseClient(env);
    
    let query = `select=*,cracker_profiles!inner(display_name,avatar_url)&order=score.desc,created_at.desc&limit=${limit}`;
    
    if (userId) {
      query += `&user_id=eq.${userId}`;
    }
    
    if (category && category !== 'all') {
      query += `&category=eq.${category}`;
    }

    const scores = await supabase.select('cracker_scores', query);
    
    return createCorsResponse({
      success: true,
      scores: scores.map(score => ({
        id: score.id,
        category: score.category,
        score: score.score,
        hintsUsed: score.hints_used,
        perfectScore: score.perfect_score,
        playTime: score.play_time,
        createdAt: score.created_at,
        user: {
          displayName: score.cracker_profiles?.display_name,
          avatarUrl: score.cracker_profiles?.avatar_url
        }
      }))
    });

  } catch (error) {
    console.error('Score query error:', error);
    return createCorsResponse({ 
      error: 'Score query failed',
      message: error.message 
    }, 500);
  }
}

function isValidScore(scoreData) {
  // 기본 점수 검증
  if (scoreData.score < 0 || scoreData.score > 100) {
    return false;
  }
  
  // 힌트 사용량 검증
  if (scoreData.hintsUsed < 0 || scoreData.hintsUsed > 10) {
    return false;
  }
  
  // 플레이 시간 검증 (너무 빠르거나 느린 경우)
  if (scoreData.playTime && (scoreData.playTime < 5 || scoreData.playTime > 600)) {
    return false;
  }
  
  // 카테고리 검증
  const validCategories = ['movies', 'songs', 'books', 'quotes', 'daily_travel_phrases', 'all'];
  if (!validCategories.includes(scoreData.category)) {
    return false;
  }
  
  return true;
}

async function authenticateRequest(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // JWT 검증 (auth.js에서 가져온 로직)
    const [header, body, signature] = token.split('.');
    
    const expectedSignature = btoa(`${header}.${body}.${env.JWT_SECRET}`);
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload = JSON.parse(atob(body));
    
    if (Date.now() >= payload.exp * 1000) {
      return null;
    }
    
    return payload;
    
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}