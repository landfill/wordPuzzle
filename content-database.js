// 대용량 콘텐츠 데이터베이스
const CONTENT_DATABASE = {
    movies: {
        'Toy Story': [
            { sentence: "To infinity and beyond!", translation: "무한대 그 너머로!", difficulty: 'easy' },
            { sentence: "You've got a friend in me.", translation: "당신에게는 나라는 친구가 있어요.", difficulty: 'medium' },
            { sentence: "There's a snake in my boot!", translation: "내 부츠 안에 뱀이 있어!", difficulty: 'medium' },
            { sentence: "I am Mrs. Nesbitt!", translation: "나는 네스빗 부인이야!", difficulty: 'easy' },
            { sentence: "The claw chooses who will go and who will stay.", translation: "집게가 누가 갈지 누가 남을지 선택한다.", difficulty: 'hard' },
            { sentence: "Reach for the sky!", translation: "하늘에 손을 뻗어라!", difficulty: 'easy' }
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
            { sentence: "In the end, we will remember not the words of our enemies, but the silence of our friends.", translation: "결국 우리는 적의 말이 아니라 친구의 침묵을 기억할 것이다.", difficulty: 'hard' }
        ],
        'Wisdom': [
            { sentence: "The journey of a thousand miles begins with one step.", translation: "천 리 길도 한 걸음부터.", difficulty: 'medium' },
            { sentence: "Yesterday is history, tomorrow is a mystery, today is a gift.", translation: "어제는 역사, 내일은 미스터리, 오늘은 선물이다.", difficulty: 'hard' },
            { sentence: "It always seems impossible until it's done.", translation: "해낼 때까지는 항상 불가능해 보인다.", difficulty: 'medium' }
        ]
    },
    songs: {
        'Disney': [
            { sentence: "A whole new world, a dazzling place I never knew.", translation: "완전히 새로운 세상, 내가 몰랐던 눈부신 곳.", difficulty: 'hard' },
            { sentence: "Be our guest, be our guest, put our service to the test.", translation: "우리의 손님이 되어, 우리의 서비스를 시험해봐.", difficulty: 'hard' },
            { sentence: "Under the sea, under the sea, darling it's better down where it's wetter.", translation: "바다 아래에서, 바다 아래에서, 더 젖은 곳이 더 좋아.", difficulty: 'hard' }
        ],
        'Pop': [
            { sentence: "Hello, is it me you're looking for?", translation: "안녕, 당신이 찾고 있는 게 나야?", difficulty: 'medium' },
            { sentence: "I will always love you.", translation: "나는 항상 당신을 사랑할 거야.", difficulty: 'easy' },
            { sentence: "Don't stop believing.", translation: "믿음을 멈추지 마.", difficulty: 'easy' }
        ]
    }
};

export default CONTENT_DATABASE;