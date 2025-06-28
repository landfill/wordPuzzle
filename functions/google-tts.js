// functions/google-tts.js (스위치 기능이 추가된 최종 버전)

export async function onRequest(context) {
  const { request, env } = context;

  // 1. 스위치 확인: Cloudflare에 설정된 환경 변수 값을 확인합니다.
  const useGoogleTTS = env.ENABLE_GOOGLE_TTS === 'true';

  if (!useGoogleTTS) {
    // 스위치가 꺼져 있으면, "기본 TTS를 사용하라"는 특별한 응답을 보냅니다.
    return new Response(JSON.stringify({ 
      fallback: true, 
      message: 'Google TTS is disabled. Use browser default TTS.' 
    }), {
      status: 403, // 403 Forbidden: 접근 금지 상태 코드를 사용
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // --- 아래는 기존과 동일한 AI 음성 생성 로직 ---
  
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { text, voice, pitch, speakingRate } = await request.json();
    const apiKey = env.GOOGLE_TTS_API_KEY;

    if (!apiKey) throw new Error("API key is not configured.");
    
    const ttsUrl = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`;
    const requestBody = { /* ... 기존과 동일 ... */ };

    const ttsResponse = await fetch(ttsUrl, { /* ... 기존과 동일 ... */ });

    if (!ttsResponse.ok) throw new Error(await ttsResponse.text());

    const data = await ttsResponse.json();
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Cloudflare Function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), { status: 500 });
  }
}
