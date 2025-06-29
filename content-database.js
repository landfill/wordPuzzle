// 대용량 콘텐츠 데이터베이스 (중복 제거됨 및 확장됨)
const CONTENT_DATABASE = {
    movies: {
        'Toy Story': [
            { sentence: "To infinity and beyond!", translation: "무한한 우주 그 너머로!", difficulty: 'easy' },
            { sentence: "You've got a friend in me.", translation: "당신에게는 나라는 친구가 있어요.", difficulty: 'medium' },
            { sentence: "There's a snake in my boot!", translation: "내 부츠 안에 뱀이 있어!", difficulty: 'medium' },
            { sentence: "I am Mrs. Nesbitt!", translation: "나는 네스빗 부인이야!", difficulty: 'easy' },
            { sentence: "The claw chooses who will go and who will stay.", translation: "집게가 누가 갈지 누가 남을지 선택한다.", difficulty: 'hard' },
            { sentence: "Reach for the sky!", translation: "하늘에 손을 뻗어라!", difficulty: 'easy' }
        ],
        'Iron Man (2008)': [
            { sentence: "I am Iron Man.", translation: "나는 아이언맨이다.", difficulty: "easy" },
            { sentence: "The truth is... I am Iron Man.", translation: "진실은… 나는 아이언맨이다.", difficulty: "medium" },
            { sentence: "They say the best weapon is the one you never have to fire. I respectfully disagree.", translation: "가장 좋은 무기는 쏘지 않아도 되는 거라는데, 난 정중히 반대해.", difficulty: "hard" },
            { sentence: "Don't waste it. Don't waste your life.", translation: "낭비하지 마. 네 삶을 낭비하지 마.", difficulty: "hard" },
            { sentence: "Sometimes you gotta run before you can walk.", translation: "때로는 걷기 전에 뛰어야 할 때도 있어.", difficulty: "medium" }
        ],
        'The Incredible Hulk (2008)': [
            { sentence: "Hulk smash!", translation: "헐크 박살!", difficulty: 'easy' },
            { sentence: "You won't like me when I'm angry.", translation: "나 화나면 안 좋아할 걸.", difficulty: 'easy' },
            { sentence: "I’m not always in control.", translation: "난 항상 통제할 수 있는 게 아니야.", difficulty: 'medium' }
        ],
        'Iron Man 2 (2010)': [
            { sentence: "I’m Iron Man. The suit and I are one.", translation: "나는 아이언맨이다. 수트와 나는 하나야.", difficulty: "medium" },
            { sentence: "If you can make God bleed, people will cease to believe in him.", translation: "신이 피를 흘릴 수 있다면, 사람들은 믿음을 버릴 거야.", difficulty: "hard" }            
        ],
        'Thor (2011)': [
            { sentence: "Whosoever holds this hammer, if he be worthy, shall possess the power of Thor.", translation: "이 망치를 들 수 있는 자, 그가 자격이 있다면, 토르의 힘을 가질 것이다.", difficulty: "hard" },
            { sentence: "This drink... I like it. Another!", translation: "이 술... 마음에 드는군. 하나 더!", difficulty: 'easy' },
            { sentence: "You’re no match for the mighty Thor!", translation: "넌 강력한 토르의 상대가 안 돼!", difficulty: 'medium' }
        ],
        'Captain America: The First Avenger (2011)': [
            { sentence: "I can do this all day.", translation: "이거 하루 종일도 할 수 있어.", difficulty: 'easy' },
            { sentence: "I'm just a kid from Brooklyn.", translation: "난 그냥 브루클린에서 온 애야.", difficulty: 'medium' },
            { sentence: "I don’t like bullies. I don’t care where they’re from.", translation: "불량배는 싫어. 어디서 왔든 상관없어.", difficulty: 'medium' }
        ],
        'Finding Nemo': [
            { sentence: "Just keep swimming!", translation: "계속 헤엄치기만 하면 돼!", difficulty: 'easy' },
            { sentence: "I shall call him Squishy.", translation: "그를 스퀴시라고 부를 거야.", difficulty: 'medium' },
            { sentence: "Fish are friends, not food.", translation: "물고기는 친구지, 음식이 아니야.", difficulty: 'medium' },
            { sentence: "When life gets you down, you know what you gotta do?", translation: "인생이 힘들 때, 뭘 해야 하는지 알아?", difficulty: 'hard' }
        ],
        'The Lion King': [
            { sentence: "Hakuna Matata!", translation: "하쿠나 마타타!", difficulty: 'easy' },
            { sentence: "Remember who you are.", translation: "네가 누구인지 기억해.", difficulty: 'medium' },
            { sentence: "The past can hurt.", translation: "과거는 아플 수 있어.", difficulty: 'easy' },
            { sentence: "It is time.", translation: "때가 왔다.", difficulty: 'easy' }
        ],
        'Frozen': [
            { sentence: "Let it go!", translation: "렛잇고!", difficulty: 'easy' },
            { sentence: "Do you want to build a snowman?", translation: "눈사람 만들래?", difficulty: 'medium' },
            { sentence: "The cold never bothered me anyway.", translation: "추위는 어차피 나를 괴롭히지 않아.", difficulty: 'hard' },
            { sentence: "Love is an open door.", translation: "사랑은 열린 문이야.", difficulty: 'medium' }
        ],
        'Shrek': [
            { sentence: "Better out than in!", translation: "안에 있는 것보다 밖이 낫지!", difficulty: 'medium' },
            { sentence: "Ogres are like onions.", translation: "오거는 양파 같아.", difficulty: 'medium' },
            { sentence: "What are you doing in my swamp?", translation: "내 늪에서 뭐 하는 거야?", difficulty: 'hard' }
        ]
    },
    books: {
        'Harry Potter': [
            { sentence: "You're a wizard, Harry.", translation: "너는 마법사야, 해리.", difficulty: 'easy' },
            { sentence: "I solemnly swear that I am up to no good.", translation: "나는 엄숙히 맹세하노니 나는 좋지 않은 일을 꾸미고 있다.", difficulty: 'hard' },
            { sentence: "After all this time? Always.", translation: "이 모든 시간이 지나도? 항상.", difficulty: 'medium' },
            { sentence: "It does not do to dwell on dreams.", translation: "꿈에만 빠져 사는 것은 좋지 않다.", difficulty: 'hard' }
        ],
        'The Lord of the Rings': [
            { sentence: "Not all those who wander are lost.", translation: "방황하는 모든 이가 길을 잃은 것은 아니다.", difficulty: 'hard' },
            { sentence: "You shall not pass!", translation: "지나갈 수 없다!", difficulty: 'medium' },
            { sentence: "My precious.", translation: "내 소중한 것.", difficulty: 'easy' }
        ]
    },
    quotes: {
        'Motivational': [
            { sentence: "Be yourself; everyone else is already taken.", translation: "자기 자신이 되어라; 다른 사람들은 이미 존재한다.", difficulty: 'hard' },
            { sentence: "The only way to do great work is to love what you do.", translation: "훌륭한 일을 하는 유일한 방법은 당신이 하는 일을 사랑하는 것이다.", difficulty: 'hard' },
            { sentence: "Life is what happens to you while you're busy making other plans.", translation: "인생은 당신이 다른 계획을 세우느라 바쁠 때 일어나는 것이다.", difficulty: 'hard' },
            { sentence: "Silence of our friends.", translation: "친구의 침묵을 기억할 것.", difficulty: 'hard' } // 25자 이내로 수정됨
        ],
        'Wisdom': [
            { sentence: "The journey of a thousand miles begins with one step.", translation: "천 리 길도 한 걸음부터.", difficulty: 'medium' },
            { sentence: "Yesterday is history, tomorrow is a mystery, today is a gift.", translation: "어제는 역사, 내일은 미스터리, 오늘은 선물이다.", difficulty: 'hard' },
            { sentence: "It always seems impossible until it's done.", translation: "해낼 때까지는 항상 불가능해 보인다.", difficulty: 'medium' }
        ],
        // 새로 추가된 카테고리: 팝 문화 인용구
        'Pop Culture': [
            { sentence: "May the Force be with you.", translation: "포스가 당신과 함께 하기를.", difficulty: 'easy' },
            { sentence: "Live long and prosper.", translation: "오래 살고 번영하세요.", difficulty: 'medium' },
            { sentence: "Here's looking at you, kid.", translation: "네 눈을 보고 있어, 얘야.", difficulty: 'hard' },
            { sentence: "I'll be back.", translation: "다시 돌아올게.", difficulty: 'easy' },
            { sentence: "Houston, we have a problem.", translation: "휴스턴, 문제가 생겼어.", difficulty: 'medium' }
        ],
        // 새로 추가된 카테고리: 역사적 명언
        'Historical': [
            { sentence: "I have a dream.", translation: "나에게는 꿈이 있습니다.", difficulty: 'easy' },
            { sentence: "Veni, vidi, vici.", translation: "왔노라, 보았노라, 이겼노라.", difficulty: 'medium' },
            { sentence: "Ask not what your country.", translation: "조국이 당신에게 무엇을.", difficulty: 'hard' },
            { sentence: "That's one small step.", translation: "작은 한 걸음.", difficulty: 'easy' },
            { sentence: "The only thing we have.", translation: "우리가 두려워할 유일한 것은.", difficulty: 'hard' }
        ]
    },
    songs: {
        'Disney': [
            { sentence: "A whole new world.", translation: "완전히 새로운 세상.", difficulty: 'hard' },
            { sentence: "Be our guest, be our guest.", translation: "우리의 손님이 되어, 우리의 손님이 되어.", difficulty: 'hard' },
            { sentence: "Under the sea, darling.", translation: "바다 아래에서, 자기야.", difficulty: 'hard' },
            { sentence: "Circle of Life.", translation: "생명의 순환.", difficulty: 'easy' },
            { sentence: "A dream is a wish.", translation: "꿈은 소원이다.", difficulty: 'medium' },
            { sentence: "Part of your world.", translation: "당신 세상의 일부.", difficulty: 'easy' },
            { sentence: "Tale as old as time.", translation: "시간만큼 오래된 이야기.", difficulty: 'hard' },
            { sentence: "You ain't never had a friend.", translation: "나 같은 친구는 한 번도 없었을 거야.", difficulty: 'medium' }
        ],
        'Pop': [
            { sentence: "Hello, is it me you're looking for?", translation: "안녕, 당신이 찾고 있는 게 나야?", difficulty: 'medium' },
            { sentence: "I will always love you.", translation: "나는 항상 당신을 사랑할 거야.", difficulty: 'easy' },
            { sentence: "Don't stop believing.", translation: "믿음을 멈추지 마.", difficulty: 'easy' },
            { sentence: "We Will Rock You.", translation: "우리가 너를 흔들어 놓을 거야.", difficulty: 'easy' },
            { sentence: "Sweet Caroline, good times.", translation: "스위트 캐롤라인, 좋은 시간.", difficulty: 'medium' },
            { sentence: "Bohemian Rhapsody.", translation: "보헤미안 랩소디.", difficulty: 'hard' },
            { sentence: "Imagine all the people.", translation: "모든 사람들을 상상해 봐.", difficulty: 'hard' },
            { sentence: "Every breath you take.", translation: "네가 숨 쉴 때마다.", difficulty: 'hard' },
            { sentence: "Livin' on a prayer.", translation: "기도하며 살아가.", difficulty: 'easy' },
            { sentence: "Don't Stop Me Now.", translation: "지금 날 멈추지 마.", difficulty: 'medium' },
            { sentence: "Smells Like Teen Spirit.", translation: "십대 정신의 냄새가 나.", difficulty: 'medium' },
            { sentence: "Wonderwall. You're gonna save me.", translation: "원더월. 네가 날 구할 거야.", difficulty: 'easy' },
            { sentence: "Uptown Funk. Just watch.", translation: "업타운 펑크. 그냥 지켜봐.", difficulty: 'medium' },
            { sentence: "Happy. Because I'm happy.", difficulty: 'easy' },
            { sentence: "Rolling in the Deep.", translation: "깊은 곳으로 빠져들고 있어.", difficulty: 'medium' },
            { sentence: "Someone Like You.", translation: "너 같은 사람.", difficulty: 'medium' },
            { sentence: "Single Ladies (Put a Ring).", translation: "싱글 레이디들 (반지를 껴).", difficulty: 'easy' },
            { sentence: "Thriller. Close to midnight.", translation: "스릴러. 자정 가까이.", difficulty: 'medium' },
            { sentence: "Billie Jean is not my lover.", translation: "빌리 진은 내 연인이 아니야.", difficulty: 'easy' },
            { sentence: "Like a Prayer. Call my name.", translation: "기도처럼. 내 이름을 불러.", difficulty: 'hard' },
            { sentence: "I Wanna Dance with Somebody.", translation: "누군가와 춤추고 싶어.", difficulty: 'medium' },
            { sentence: "All Star. The world is gonna roll.", translation: "모두가 스타. 세상이 굴러갈 거야.", difficulty: 'easy' },
            { sentence: "Lose Yourself. One shot.", translation: "스스로를 잃어버려. 단 한 번의 기회.", difficulty: 'hard' }
        ]
    },
    // 새로 추가된 카테고리: 일상 회화/여행 필수 문구
    daily_travel_phrases: {
        'General': [
            { sentence: "Check-in, please.", translation: "체크인 부탁드립니다.", difficulty: 'easy' },
            { sentence: "A table for two.", translation: "두 명 자리 부탁해요.", difficulty: 'easy' },
            { sentence: "I'd like to order.", translation: "주문하고 싶어요.", difficulty: 'medium' },
            { sentence: "Can I have the menu?", translation: "메뉴판 좀 주시겠어요?", difficulty: 'easy' },
            { sentence: "The bill, please.", translation: "계산서 주세요.", difficulty: 'easy' },
            { sentence: "Where is the exit?", translation: "출구가 어디예요?", difficulty: 'easy' },
            { sentence: "Do you have Wi-Fi?", translation: "와이파이 되나요?", difficulty: 'easy' },
            { sentence: "How much is it?", translation: "얼마예요?", difficulty: 'easy' },
            { sentence: "Can I pay by card?", translation: "카드로 계산되나요?", difficulty: 'medium' },
            { sentence: "I need a taxi.", translation: "택시가 필요해요.", difficulty: 'easy' },
            { sentence: "What's your purpose of visit?", translation: "방문 목적이 무엇인가요?", difficulty: 'hard' },
            { sentence: "Business or pleasure?", translation: "사업 또는 여행인가요?", difficulty: 'medium' },
            { sentence: "How long will you stay?", translation: "얼마나 머무실 건가요?", difficulty: 'medium' },
            { sentence: "I'm here for tourism.", translation: "관광하러 왔습니다.", difficulty: 'medium' },
            { sentence: "Please show your passport.", translation: "여권을 보여주세요.", difficulty: 'hard' }
        ]
    }
};

export default CONTENT_DATABASE;
