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

    // 점수와 사용자 정보를 JOIN하여 가져오기 (모든 점수 데이터)
    let query = `select=*,cracker_profiles!inner(display_name,avatar_url)${categoryFilter}${timeFilter}`;
    
    const scores = await supabase.select('cracker_scores', query);
    
    // 사용자별 총합 점수 집계 (GROUP BY user_id)
    const userTotalScores = new Map();
    
    scores.forEach(score => {
      const userId = score.user_id;
      const existing = userTotalScores.get(userId);
      
      if (!existing) {
        userTotalScores.set(userId, {
          userId: userId,
          totalScore: score.score,
          gamesPlayed: 1,
          totalHints: score.hints_used,
          perfectScores: score.perfect_score ? 1 : 0,
          totalPlayTime: score.play_time || 0,
          lastPlayedAt: score.created_at,
          user: {
            displayName: score.cracker_profiles?.display_name || 'Anonymous',
            avatarUrl: score.cracker_profiles?.avatar_url
          }
        });
      } else {
        existing.totalScore += score.score;
        existing.gamesPlayed += 1;
        existing.totalHints += score.hints_used;
        existing.perfectScores += score.perfect_score ? 1 : 0;
        existing.totalPlayTime += score.play_time || 0;
        // 가장 최근 플레이 시간 업데이트
        if (new Date(score.created_at) > new Date(existing.lastPlayedAt)) {
          existing.lastPlayedAt = score.created_at;
        }
      }
    });

    // 총점 기준으로 정렬된 리더보드 생성
    const leaderboard = Array.from(userTotalScores.values())
      .sort((a, b) => {
        // 1차: 총점 내림차순
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        // 2차: 게임 수 내림차순 (많이 플레이한 사용자 우선)
        if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
        // 3차: 완벽한 점수 개수 내림차순
        if (b.perfectScores !== a.perfectScores) return b.perfectScores - a.perfectScores;
        // 4차: 최근 플레이 시간 내림차순
        return new Date(b.lastPlayedAt) - new Date(a.lastPlayedAt);
      })
      .slice(offset, offset + limit)
      .map((userScore, index) => ({
        rank: offset + index + 1,
        userId: userScore.userId,
        totalScore: userScore.totalScore,
        averageScore: Math.round(userScore.totalScore / userScore.gamesPlayed),
        gamesPlayed: userScore.gamesPlayed,
        totalHintsUsed: userScore.totalHints,
        perfectScores: userScore.perfectScores,
        totalPlayTime: userScore.totalPlayTime,
        lastPlayedAt: userScore.lastPlayedAt,
        user: userScore.user
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
        totalShown: leaderboard.length,
        totalUsers: userTotalScores.size
      }
    });

  } catch (error) {
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