// 리더보드 관련 핸들러

import { createCorsResponse } from '../utils/cors.js';
import { createSupabaseClient } from '../utils/supabase.js';

export async function handleLeaderboard(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  if (request.method !== 'GET') {
    return createCorsResponse({ error: 'Method not allowed' }, 405);
  }

  // /api/leaderboard/:category 형태 파싱
  const pathParts = path.split('/');
  const category = pathParts[3] || 'all';

  return await getLeaderboard(request, env, category);
}

async function getLeaderboard(request, env, category) {
  try {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || 'all'; // all, week, month
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    const supabase = createSupabaseClient(env);
    
    // 시간 필터 조건
    let timeFilter = '';
    if (timeframe === 'week') {
      timeFilter = `&created_at=gte.${getDateWeeksAgo(1)}`;
    } else if (timeframe === 'month') {
      timeFilter = `&created_at=gte.${getDateWeeksAgo(4)}`;
    }

    // 카테고리 필터
    let categoryFilter = '';
    if (category && category !== 'all') {
      categoryFilter = `&category=eq.${category}`;
    }

    // 점수와 사용자 정보를 JOIN하여 가져오기
    let query = `select=*,cracker_profiles!inner(display_name,avatar_url)&order=score.desc,created_at.asc${categoryFilter}${timeFilter}&limit=${limit}&offset=${offset}`;
    
    const scores = await supabase.select('cracker_scores', query);
    
    // 사용자별 최고 점수만 필터링
    const userBestScores = new Map();
    
    scores.forEach(score => {
      const key = `${score.user_id}-${score.category}`;
      const existing = userBestScores.get(key);
      
      if (!existing || score.score > existing.score) {
        userBestScores.set(key, score);
      }
    });

    // 점수순으로 정렬된 리더보드 생성
    const leaderboard = Array.from(userBestScores.values())
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.created_at) - new Date(b.created_at); // 같은 점수면 더 빨리 달성한 순
      })
      .slice(0, limit)
      .map((score, index) => ({
        rank: index + 1,
        userId: score.user_id,
        category: score.category,
        score: score.score,
        hintsUsed: score.hints_used,
        perfectScore: score.perfect_score,
        playTime: score.play_time,
        achievedAt: score.created_at,
        user: {
          displayName: score.cracker_profiles?.display_name || 'Anonymous',
          avatarUrl: score.cracker_profiles?.avatar_url
        }
      }));

    // 통계 정보도 함께 제공
    const stats = await getLeaderboardStats(supabase, category, timeframe);

    return createCorsResponse({
      success: true,
      leaderboard,
      stats,
      meta: {
        category,
        timeframe,
        limit,
        offset,
        totalShown: leaderboard.length
      }
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    return createCorsResponse({ 
      error: 'Leaderboard query failed',
      message: error.message 
    }, 500);
  }
}

async function getLeaderboardStats(supabase, category, timeframe) {
  try {
    // 기본 통계 쿼리 조건
    let categoryFilter = category && category !== 'all' ? `&category=eq.${category}` : '';
    let timeFilter = '';
    
    if (timeframe === 'week') {
      timeFilter = `&created_at=gte.${getDateWeeksAgo(1)}`;
    } else if (timeframe === 'month') {
      timeFilter = `&created_at=gte.${getDateWeeksAgo(4)}`;
    }

    // 전체 점수 데이터 가져오기 (통계용)
    const allScores = await supabase.select('cracker_scores', 
      `select=score,hints_used,perfect_score,user_id${categoryFilter}${timeFilter}`
    );

    if (allScores.length === 0) {
      return {
        totalPlayers: 0,
        totalGames: 0,
        averageScore: 0,
        highestScore: 0,
        perfectScores: 0
      };
    }

    // 통계 계산
    const totalGames = allScores.length;
    const uniqueUsers = new Set(allScores.map(s => s.user_id));
    const totalPlayers = uniqueUsers.size;
    const averageScore = Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / totalGames);
    const highestScore = Math.max(...allScores.map(s => s.score));
    const perfectScores = allScores.filter(s => s.perfect_score).length;

    return {
      totalPlayers,
      totalGames,
      averageScore,
      highestScore,
      perfectScores
    };

  } catch (error) {
    console.error('Stats calculation error:', error);
    return {
      totalPlayers: 0,
      totalGames: 0,
      averageScore: 0,
      highestScore: 0,
      perfectScores: 0
    };
  }
}

function getDateWeeksAgo(weeks) {
  const date = new Date();
  date.setDate(date.getDate() - (weeks * 7));
  return date.toISOString();
}