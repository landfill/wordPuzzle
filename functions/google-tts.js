// Cloudflare Function: acts as a secure proxy to the Google TTS API.
// Its only job is to receive text, forward it to Google with a secret API key,
// and return the raw response (audio + timepoints) to the client.

// [필수] CORS 처리를 위한 허용 도메인 목록
const allowedOrigins = [
  'https://wordpuzzle.pages.dev',
  /https:\/\/[a-z0-9-]+\.wordpuzzle\.pages\.dev/
];

export async function onRequest(context) {
    const { request, env } = context;

    // [필수] CORS 헤더 및 Preflight(OPTIONS) 요청 처리 로직
    const requestOrigin = request.headers.get('Origin');
    const corsHeaders = {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (allowedOrigins.some(origin => origin instanceof RegExp ? origin.test(requestOrigin) : origin === requestOrigin)) {
        corsHeaders['Access-Control-Allow-Origin'] = requestOrigin;
    }
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    // --- 여기서부터는 사용자님의 원래 코드와 거의 동일합니다 ---

    // POST 요청만 허용
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    // 기능 플래그 스위치 확인
    if (env.ENABLE_GOOGLE_TTS !== 'true') {
        return new Response(JSON.stringify({
            fallback: true,
            message: 'Google TTS is disabled on the server.'
        }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    try {
        // 환경 변수에서 API 키를 안전하게 가져오기
        const apiKey = env.GOOGLE_TTS_API_KEY;
        if (!apiKey) {
            throw new Error("CRITICAL: GOOGLE_TTS_API_KEY is not configured in Cloudflare environment.");
        }

        const { text, voice, pitch, speakingRate } = await request.json();

        // 타임포인트를 요청하기 위해 일반 텍스트를 SSML로 변환
        const words = text.split(' ');
        const ssmlText = `<speak>${words.map((word, index) => `<mark name="${index}"/>${word}`).join(' ')}</speak>`;

        const ttsUrl = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`;

        const requestBody = {
            input: { ssml: ssmlText },
            voice: {
                languageCode: voice.languageCode,
                name: voice.name
            },
            audioConfig: {
                audioEncoding: 'MP3',
                pitch: pitch,
                speakingRate: speakingRate
            },
            enableTimePointing: ['SSML_MARK'],
        };

        const ttsResponse = await fetch(ttsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        const data = await ttsResponse.json();

        // Google API의 응답이 정상이 아닐 경우, 에러를 기록
        if (!ttsResponse.ok) {
            console.error('Google TTS API Error:', JSON.stringify(data, null, 2));
            throw new Error('Google TTS API request failed.');
        }

        // 성공 시, 모든 CORS 헤더를 포함하여 클라이언트에 응답 전달
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Cloudflare Function Error:', error.message);
        // 에러 발생 시에도 CORS 헤더를 포함하여 응답 전달
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}