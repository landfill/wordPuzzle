// Cloudflare Function: acts as a secure proxy to the Google TTS API.
// Its only job is to receive text, forward it to Google with a secret API key,
// and return the raw response (audio + timepoints) to the client.
 
export async function onRequest(context) {
    const { request, env } = context;

    // Only allow POST requests
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    // Check for the feature flag switch
    if (env.ENABLE_GOOGLE_TTS !== 'true') {
        return new Response(JSON.stringify({
            fallback: true,
            message: 'Google TTS is disabled on the server.'
        }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        // Securely get the API key from environment variables
        const apiKey = env.GOOGLE_TTS_API_KEY;
        if (!apiKey) {
            throw new Error("CRITICAL: GOOGLE_TTS_API_KEY is not configured in Cloudflare environment.");
        }

        const { text, voice, pitch, speakingRate } = await request.json();

        // Convert plain text to SSML to request timepoints
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
            enableTimePointing: ['SSML_MARK'], // Request timing info for each <mark>
        };

        const ttsResponse = await fetch(ttsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!ttsResponse.ok) {
            const errorData = await ttsResponse.json();
            console.error('Google TTS API Error:', errorData);
            throw new Error('Google TTS API request failed.');
        }

        const data = await ttsResponse.json();

        // Return the raw data (including audioContent and timepoints) to the client
        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Cloudflare Function Error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}