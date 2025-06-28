// functions/google-tts.js (에러 처리 강화 최종 버전)

export async function onRequest(context) {
  const { request, env } = context;

  // 1. POST 요청이 아니면 거부
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 2. AI 음성 사용 스위치가 꺼져 있으면, 클라이언트에 알려주고 중단
  if (env.ENABLE_GOOGLE_TTS !== 'true') {
    return new Response(JSON.stringify({ 
      fallback: true, 
      message: 'Google TTS is disabled via environment variable.' 
    }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // 3. API 키가 Cloudflare에 설정되어 있는지 확인
    const apiKey = env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      // API 키가 없으면 에러를 발생시켜 클라이언트에 알림
      throw new Error("CRITICAL: GOOGLE_TTS_API_KEY environment variable is not set in Cloudflare.");
    }
    
    const { text, voice, pitch, speakingRate } = await request.json();
    const ttsUrl = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`;

    const requestBody = {
      input: { text: text },
      voice: { languageCode: voice.languageCode, name: voice.name },
      audioConfig: { audioEncoding: 'MP3', pitch: pitch, speakingRate: speakingRate },
      enableTimePointing: ['SSML_MARK'],
    };

    // 4. Google TTS API에 요청
    const ttsResponse = await fetch(ttsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json();
      console.error('Google TTS API returned an error:', errorData);
      throw new Error('Google TTS API request failed.');
    }

    const data = await ttsResponse.json();
    
    // 5. 성공 시 오디오 데이터와 시간 정보 반환
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Cloudflare Function Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}