// functions/google-tts.js (Cloudflare 버전)

// Cloudflare는 fetch가 기본 내장되어 있어, 별도 import가 필요 없습니다.

export async function onRequest(context) {
  // context에서 요청(request)과 환경 변수(env)를 가져옵니다.
  const { request, env } = context;

  // 1. 보안: POST 요청만 허용합니다.
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // 2. 클라이언트에서 보낸 문장과 목소리 정보 받기
    const { text, voice, pitch, speakingRate } = await request.json();
    
    // 3. Cloudflare에 설정한 API 키 환경 변수 가져오기
    const apiKey = env.GOOGLE_TTS_API_KEY;

    if (!apiKey) {
      throw new Error("API key is not configured in Cloudflare environment variables.");
    }
    
    const ttsUrl = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`;

    const requestBody = {
      input: { text: text },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: pitch,
        speakingRate: speakingRate,
      },
      enableTimePointing: ['SSML_MARK'],
    };

    // 4. Google TTS API에 요청 보내기
    const ttsResponse = await fetch(ttsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json();
      console.error('Google TTS API Error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to synthesize speech.', details: errorData }), {
        status: ttsResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await ttsResponse.json();

    // 5. 성공 시 클라이언트에 오디오 데이터와 시간 정보 전달
    return new Response(JSON.stringify({
      audioContent: data.audioContent,
      timepoints: data.timepoints,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Cloudflare Function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}