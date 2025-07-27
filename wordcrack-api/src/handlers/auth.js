// 인증 관련 핸들러

import { createCorsResponse } from '../utils/cors.js';
import { createSupabaseClient } from '../utils/supabase.js';

export async function handleAuth(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/auth/google' && request.method === 'POST') {
    return await handleGoogleAuth(request, env);
  }
  
  if (path === '/api/auth/verify' && request.method === 'GET') {
    return await handleTokenVerify(request, env);
  }

  return createCorsResponse({ error: 'Not found' }, 404);
}

async function handleGoogleAuth(request, env) {
  try {
    const { googleToken } = await request.json();
    
    if (!googleToken) {
      return createCorsResponse({ error: 'Google token required' }, 400);
    }

    // Google 토큰 검증
    const googleUser = await verifyGoogleToken(googleToken, env.GOOGLE_CLIENT_ID);
    
    if (!googleUser) {
      return createCorsResponse({ error: 'Invalid Google token' }, 401);
    }

    // Supabase에서 사용자 프로필 확인/생성
    const supabase = createSupabaseClient(env);
    
    // 기존 사용자 확인
    let profiles = await supabase.select('cracker_profiles', `google_id=eq.${googleUser.sub}`);
    
    let profile;
    if (profiles.length === 0) {
      // 새 사용자 생성 (id는 자동 생성)
      const newProfile = {
        google_id: googleUser.sub,
        display_name: googleUser.name,
        avatar_url: googleUser.picture
      };
      
      console.log('New profile data:', JSON.stringify(newProfile));
      
      const created = await supabase.insert('cracker_profiles', newProfile);
      profile = created[0];
    } else {
      profile = profiles[0];
      
      // 프로필 정보 업데이트 (이름이나 아바타가 변경되었을 수 있음)
      const updated = await supabase.update('cracker_profiles', {
        display_name: googleUser.name,
        avatar_url: googleUser.picture,
        updated_at: new Date().toISOString()
      }, `google_id=eq.${googleUser.sub}`);
      
      if (updated.length > 0) {
        profile = updated[0];
      }
    }

    // JWT 토큰 생성 (간단한 버전, 실제로는 더 안전하게)
    const token = await generateJWT({
      userId: profile.id,
      googleId: profile.google_id,
      displayName: profile.display_name
    }, env.JWT_SECRET);

    return createCorsResponse({
      success: true,
      user: {
        id: profile.id,
        googleId: profile.google_id,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url
      },
      token
    });

  } catch (error) {
    console.error('Google auth error:', error);
    return createCorsResponse({ 
      error: 'Authentication failed',
      message: error.message 
    }, 500);
  }
}

async function handleTokenVerify(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createCorsResponse({ error: 'Token required' }, 401);
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, env.JWT_SECRET);
    
    if (!payload) {
      return createCorsResponse({ error: 'Invalid token' }, 401);
    }

    return createCorsResponse({
      success: true,
      user: {
        id: payload.userId,
        googleId: payload.googleId,
        displayName: payload.displayName
      }
    });

  } catch (error) {
    console.error('Token verify error:', error);
    return createCorsResponse({ 
      error: 'Token verification failed',
      message: error.message 
    }, 500);
  }
}

async function verifyGoogleToken(token, clientId) {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    
    if (!response.ok) {
      throw new Error('Google token verification failed');
    }
    
    const tokenInfo = await response.json();
    
    // 클라이언트 ID 검증
    if (tokenInfo.aud !== clientId) {
      throw new Error('Invalid client ID');
    }
    
    // 토큰 만료 검증
    if (Date.now() >= tokenInfo.exp * 1000) {
      throw new Error('Token expired');
    }
    
    return tokenInfo;
    
  } catch (error) {
    console.error('Google token verification error:', error);
    return null;
  }
}

async function generateJWT(payload, secret) {
  // 간단한 JWT 구현 (실제로는 더 안전한 라이브러리 사용 권장)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24시간
  }));
  
  const signature = btoa(`${header}.${body}.${secret}`); // 실제로는 HMAC 사용
  
  return `${header}.${body}.${signature}`;
}

async function verifyJWT(token, secret) {
  try {
    const [header, body, signature] = token.split('.');
    
    // 서명 검증 (간단한 버전)
    const expectedSignature = btoa(`${header}.${body}.${secret}`);
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }
    
    const payload = JSON.parse(atob(body));
    
    // 만료 시간 검증
    if (Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired');
    }
    
    return payload;
    
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}