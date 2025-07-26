// CORS 설정 유틸리티

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 개발용, 나중에 특정 도메인으로 제한
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400' // 24시간 캐시
};

export function createCorsResponse(data, status = 200, additionalHeaders = {}) {
  return new Response(
    typeof data === 'string' ? data : JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        ...additionalHeaders
      }
    }
  );
}