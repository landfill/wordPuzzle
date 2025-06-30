// Cloudflare Function: acts as a secure proxy to the Google TTS API.
// Its only job is to receive text, forward it to Google with a secret API key,
// and return the raw response (audio + timepoints) to the client.

// [수정 1] 허용할 도메인 목록 정의
// 프로덕션 도메인과 모든 미리보기(`.pages.dev`) 하위 도메인을 허용합니다.
const allowedOrigins = [
  'https://wordpuzzle.pages.dev', // 여기에 실제 프로덕션 도메인 주소를 입력하세요.
  /https:\/\/[a-z0-9-]+\.wordpuzzle\.pages\.dev/ // 모든 미리보기 하위 도메인을 허용하는 정규식
];

export async function onRequest(context) {
    const { request, env } = context;

    // [수정 2] CORS 헤더를 동적으로 생성하는 로직
    const requestOrigin = request.headers.get('Origin');
    const corsHeaders = {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 요청의 Origin이 허용 목록에 있는지 확인하고, 있다면 헤더에 추가
    if (allowedOrigins.some(origin =>
        origin instanceof RegExp ? origin.test(requestOrigin) : origin === requestOrigin
    )) {
        corsHeaders['Access-Control-Allow-Origin'] = requestOrigin;
    }

    // [수정 3] 브라우저가 보내는 Preflight 요청(OPTIONS) 처리
    // 이 처리가 없으면 복잡한 POST 요청이 실패합니다.
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    // POST 요청만 허용 (OPTIONS 요청은 위에서 처리되었음)
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
        // [개선] 연속된 공백이 있어도 빈 <mark>가 생기지 않도록 filter(Boolean) 추가
        const words = text.split(' ');
        const ssmlText = `<speak>${words.filter(Boolean).map((word, index) => `<mark name="${index}"/>${word}`).join(' ')}</speak>`;
        
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
            enableTimePointing: ['SSML_MARK'], // 각 <mark>에 대한 타이밍 정보 요청
        };

        const ttsResponse = await fetch(ttsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!ttsResponse.ok) {
            const errorData = await ttsResponse.json();
            console.error('Google TTS API Error:', JSON.stringify(errorData, null, 2));
            throw new Error('Google TTS API request failed.');
        }

        const data = await ttsResponse.json();

        // 클라이언트에 원본 데이터(audioContent 및 timepoints 포함) 반환
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Cloudflare Function Error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}