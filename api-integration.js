// API 통합 모듈 (선택적 사용)
class APIIntegration {
    constructor() {
        this.apis = {
            // 무료 명언 API
            quotable: {
                url: 'https://api.quotable.io',
                free: true,
                rateLimit: '180 requests per minute'
            },
            
            // TMDB (영화 정보만)
            tmdb: {
                url: 'https://api.themoviedb.org/3',
                free: true,
                rateLimit: '40 requests per second',
                apiKey: 'YOUR_TMDB_API_KEY' // 환경변수로 관리
            }
        };
    }

    // 무료 명언 가져오기
    async getRandomQuote() {
        try {
            const response = await fetch('https://api.quotable.io/random?minLength=10&maxLength=100');
            const data = await response.json();
            
            return {
                sentence: data.content,
                source: data.author || 'Unknown',
                translation: '', // 번역은 별도 서비스 필요
                category: 'quotes'
            };
        } catch (error) {
            console.error('Quote API error:', error);
            return null;
        }
    }

    // TMDB에서 영화 정보 가져오기 (대사는 없음)
    async getMovieInfo(movieId) {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${this.apis.tmdb.apiKey}&language=ko-KR`
            );
            const data = await response.json();
            
            return {
                title: data.title,
                overview: data.overview,
                releaseDate: data.release_date,
                poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`
            };
        } catch (error) {
            console.error('TMDB API error:', error);
            return null;
        }
    }
 
    // 인기 영화 목록 가져오기
    async getPopularMovies() {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/popular?api_key=${this.apis.tmdb.apiKey}&language=ko-KR&page=1`
            );
            const data = await response.json();
            
            return data.results.slice(0, 10); // 상위 10개만
        } catch (error) {
            console.error('TMDB API error:', error);
            return [];
        }
    }
}

export default APIIntegration;