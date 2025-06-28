// functions/google-tts.js (SSML 변환 기능이 추가된 최종 버전)

export async function onRequest(context) {
  const { request, env } = context;

  // 1. POST 요청이 아니면 거부
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 2. AI 음성 사용 스위치가 꺼져 있으면 중단
  if (env.ENABLE_GOOGLE_TTS !== 'true') {
    return new Response(JSON.stringify({ 
      fallback: true, 
      message: 'Google TTS is disabled.' 
    }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // 3. API 키 설정 확인
    const apiKey = env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      throw new Error("CRITICAL: GOOGLE_TTS_API_KEY is not set in Cloudflare environment.");
    }
    
    const { text, voice, pitch, speakingRate } = await request.json();

    // 4. (핵심 수정) 일반 텍스트를 SSML 형식으로 변환
    // 예: "Hello world" -> "<speak><mark name="0"/>Hello <mark name="1"/>world</speak>"
    const words = text.split(' ');
    const ssmlText = `<speak>${words.map((word, index) => `<mark name="${index}"/>${word}`).join(' ')}</speak>`;

    const ttsUrl = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`;

    const requestBody = {
      // input을 'text'가 아닌 'ssml'로 변경
      input: { ssml: ssmlText }, 
      voice: { languageCode: voice.languageCode, name: voice.name },
      audioConfig: { audioEncoding: 'MP3', pitch: pitch, speakingRate: speakingRate },
      enableTimePointing: ['SSML_MARK'], // SSML의 <mark> 태그 시간 정보를 요청
    };

    // 5. Google TTS API에 요청
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
    
    // 6. 성공 시, 클라이언트가 사용하기 쉽도록 시간 정보만 정리하여 반환
    const simplifiedTimepoints = data.timepoints
        .filter(point => point.markName !== "0") // 첫 단어 시작점(0초)은 제외할 수 있음
        .map((point, index) => ({
             // Google은 markName을 주지만, 우리는 순서(index)와 시간만 필요함
             wordIndex: index,
             timeSeconds: point.timeSeconds
        }));

    return new Response(JSON.stringify({
      audioContent: data.audioContent,
      timepoints: simplifiedTimepoints,
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Cloudflare Function Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}