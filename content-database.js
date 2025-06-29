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
            { sentence: "If he be worthy, shall possess the power of Thor.", translation: "그가 자격이 있다면, 토르의 힘을 가질 것이다.", difficulty: "hard" },
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
            { sentence: "I came, I saw, I conquered.", translation: "왔노라, 보았노라, 이겼노라.", difficulty: 'medium' },
            { sentence: "Give me liberty, or give me death!", translation: "자유가 아니면 죽음을 달라!", difficulty: 'hard' },
            { sentence: "The only thing we have to fear is fear.", translation: "우리가 두려워해야 할 유일한 것은 두려움 그 자체다.", difficulty: 'hard' },
            { sentence: "One small step for man, one giant leap.", translation: "인간에겐 작은 한 걸음, 인류에겐 거대한 도약.", difficulty: 'easy' },
            { sentence: "Ask not what your country can do for you.", translation: "조국이 당신을 위해 무엇을 할 수 있는지 묻지 마라.", difficulty: 'hard' },
            { sentence: "I have a dream that one day this nation.", translation: "나에게는 언젠가 이 나라가 일어설 것이라는 꿈이 있습니다.", difficulty: 'easy' },
            { sentence: "We hold these truths to be self-evident.", translation: "우리는 이러한 진실을 자명한 것으로 여긴다.", difficulty: 'hard' },
            { sentence: "The die is cast.", translation: "주사위는 던져졌다.", difficulty: 'medium' },
            { sentence: "To be or not to be, that is the question.", translation: "죽느냐 사느냐, 그것이 문제로다.", difficulty: 'medium' },
            { sentence: "All that glitters is not gold.", translation: "빛나는 모든 것이 금은 아니다.", difficulty: 'medium' },
            { sentence: "Et tu, Brute?", translation: "브루투스, 너마저?", difficulty: 'easy' },
            { sentence: "A journey of a thousand miles begins.", translation: "천 리 길도 한 걸음부터.", difficulty: 'medium' },
            { sentence: "The pen is mightier than the sword.", translation: "펜은 칼보다 강하다.", difficulty: 'easy' },
            { sentence: "Power tends to corrupt, and absolute.", translation: "권력은 부패하는 경향이 있고, 절대 권력은.", difficulty: 'hard' },
            { sentence: "Elementary, my dear Watson.", translation: "기본일세, 왓슨.", difficulty: 'easy' },
            { sentence: "I think, therefore I am.", translation: "나는 생각한다, 고로 존재한다.", difficulty: 'medium' },
            { sentence: "E=mc^2.", translation: "에너지(E)는 질량(m) 곱하기 빛의 속도(c)의 제곱.", difficulty: 'hard' },
            { sentence: "Houston, we have a problem.", translation: "휴스턴, 문제가 발생했다.", difficulty: 'easy' },
            { sentence: "The only constant in life is change.", translation: "인생에서 유일한 불변은 변화다.", difficulty: 'medium' },
            { sentence: "Knowledge is power.", translation: "아는 것이 힘이다.", difficulty: 'easy' },
            { sentence: "The truth is out there.", translation: "진실은 저 너머에 있다.", difficulty: 'medium' },
            { sentence: "No man is an island.", translation: "어떤 사람도 섬이 아니다.", difficulty: 'hard' },
            { sentence: "United we stand, divided we fall.", translation: "뭉치면 서고 흩어지면 넘어진다.", difficulty: 'easy' },
            { sentence: "Carpe diem.", translation: "오늘을 잡아라.", difficulty: 'easy' },
            { sentence: "Never, never, never give up.", translation: "절대, 절대, 절대 포기하지 마라.", difficulty: 'easy' },
            { sentence: "If you want peace, prepare for war.", translation: "평화를 원한다면, 전쟁을 준비하라.", difficulty: 'hard' },
            { sentence: "Success is not final, failure is not fatal.", translation: "성공은 끝이 아니고, 실패는 치명적이지 않다.", difficulty: 'hard' },
            { sentence: "Fortune favors the bold.", translation: "행운은 용감한 자에게 따른다.", difficulty: 'medium' },
            { sentence: "The journey of a thousand miles.", translation: "천 리 길도 한 걸음부터 시작된다.", difficulty: 'medium' },
            { sentence: "There is nothing permanent except change.", translation: "변화 외에 영원한 것은 없다.", difficulty: 'hard' }
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
            { sentence: "Let it be. There will be an answer.", translation: "내버려 둬. 답이 있을 거야.", difficulty: 'easy' },
            { sentence: "Yesterday, all my troubles seemed so far.", translation: "어제, 내 모든 고민들은 멀리 있었지.", difficulty: 'easy' },
            { sentence: "Hey Jude, don't be afraid to make.", translation: "헤이 주드, 만들기를 두려워 마.", difficulty: 'easy' },
            { sentence: "I want to hold your hand.", translation: "네 손을 잡고 싶어.", difficulty: 'easy' },
            { sentence: "Here comes the sun. It's alright.", translation: "여기 해가 뜬다. 괜찮아.", difficulty: 'easy' },
            { sentence: "Can't help falling in love with you.", translation: "너와 사랑에 빠지지 않을 수 없어.", difficulty: 'easy' },
            { sentence: "Take on me. Take me on.", translation: "날 상대해 줘. 날 데려가.", difficulty: 'easy' },
            { sentence: "Wake me up before you go-go.", translation: "가기 전에 날 깨워줘.", difficulty: 'easy' },
            { sentence: "Girls just wanna have fun.", translation: "여자들은 그냥 즐기고 싶어 해.", difficulty: 'easy' },
            { sentence: "I'm a believer. I couldn't leave her.", translation: "나는 믿는 사람이야. 그녀를 떠날 수 없었어.", difficulty: 'easy' },
            { sentence: "Dancing Queen. Feel the beat.", translation: "댄싱 퀸. 비트를 느껴봐.", difficulty: 'easy' },
            { sentence: "Mamma Mia, here I go again.", translation: "맘마미아, 내가 또 시작하는구나.", difficulty: 'easy' },
            { sentence: "Call Me Maybe. Before you go.", translation: "어쩌면 내게 전화해 줘. 네가 가기 전에.", difficulty: 'easy' },
            { sentence: "Shake it off. Shake it, shake it.", translation: "털어버려. 털어, 털어.", difficulty: 'easy' },
            { sentence: "We are never ever getting back together.", translation: "우린 절대 다시 만날 일 없어.", difficulty: 'easy' },
            { sentence: "I got a feeling that tonight's gonna be.", translation: "오늘 밤이 될 것 같은 느낌이 와.", difficulty: 'easy' },
            { sentence: "Just the way you are.", translation: "있는 그대로의 너.", difficulty: 'easy' },
            { sentence: "Roar. I've got the eye of the tiger.", translation: "으르렁. 나는 호랑이의 눈을 가졌어.", difficulty: 'easy' },
            { sentence: "Firework. Make 'em go 'Oh, oh, oh'", translation: "불꽃놀이. '오, 오, 오' 하게 만들어.", difficulty: 'easy' },
            { sentence: "Love yourself. Just love yourself.", translation: "너 자신을 사랑해. 그냥 사랑해.", difficulty: 'easy' },
            { sentence: "Shape of you. I'm in love.", translation: "너의 모습. 나는 사랑에 빠졌어.", difficulty: 'easy' },
            { sentence: "Blinding Lights. I'm on my own.", translation: "눈부신 불빛들. 나는 혼자야.", difficulty: 'easy' },
            { sentence: "Old Town Road. I'm gonna take my.", translation: "올드 타운 로드. 난 내 것을 가져갈 거야.", difficulty: 'easy' },
            { sentence: "Bad Guy. I'm the bad guy, duh.", translation: "나쁜 사람. 내가 나쁜 사람이야, 뻔하잖아.", difficulty: 'easy' },
            { sentence: "Don't start now. I'm all out of love.", translation: "지금 시작하지 마. 난 사랑이 다 떨어졌어.", difficulty: 'easy' },
            { sentence: "Rolling in the deep. We could have had.", translation: "깊은 곳으로 굴러가. 우린 가질 수 있었는데.", difficulty: 'medium' },
            { sentence: "Sweet dreams are made of this.", translation: "달콤한 꿈들은 이것으로 만들어져.", difficulty: 'medium' },
            { sentence: "Eye of the tiger. It's the thrill of.", translation: "호랑이의 눈. 그건 전율이야.", difficulty: 'medium' },
            { sentence: "Every step you take, I'll be watching you.", translation: "네가 걷는 모든 걸음, 내가 지켜볼 거야.", difficulty: 'medium' },
            { sentence: "Born to run. Yeah, baby, we were.", translation: "달리기 위해 태어났어. 그래, 우린 그랬지.", difficulty: 'medium' },
            { sentence: "Purple rain, purple rain.", translation: "보라색 비, 보라색 비.", difficulty: 'medium' },
            { sentence: "Hotel California. You can check out any.", translation: "호텔 캘리포니아. 언제든 체크아웃은 할 수 있어.", difficulty: 'medium' },
            { sentence: "My heart will go on and on.", translation: "내 심장은 계속될 거야.", difficulty: 'medium' },
            { sentence: "You're still the one I run to.", translation: "넌 여전히 내가 달려가는 사람이야.", difficulty: 'medium' },
            { sentence: "With or without you, I can't live.", translation: "너와 함께든 아니든, 난 살 수 없어.", difficulty: 'medium' },
            { sentence: "Under the bridge downtown.", translation: "다운타운 다리 아래.", difficulty: 'medium' },
            { sentence: "Tears in heaven. Would you know my.", translation: "천국의 눈물. 넌 날 알아볼까.", difficulty: 'medium' },
            { sentence: "Smooth criminal. He's a smooth.", translation: "부드러운 범죄자. 그는 부드러운.", difficulty: 'medium' },
            { sentence: "Like a virgin, touched for the very.", translation: "처녀처럼, 처음으로 만져졌어.", difficulty: 'medium' },
            { sentence: "Vogue. Strike a pose, there's nothing.", translation: "보그. 포즈를 취해, 아무것도 없어.", difficulty: 'medium' },
            { sentence: "I will survive. As long as I know.", translation: "나는 살아남을 거야. 내가 아는 한.", difficulty: 'medium' },
            { sentence: "What's love got to do with it?", translation: "사랑이 그것과 무슨 상관이야?", difficulty: 'medium' },
            { sentence: "Crazy in love. Got me lookin' so crazy.", translation: "사랑에 미쳐. 날 미치게 보이게 해.", difficulty: 'medium' },
            { sentence: "Umbrella. You can stand under my.", translation: "우산. 내 우산 아래 서도 돼.", difficulty: 'medium' },
            { sentence: "Halo. You're my angel.", translation: "후광. 넌 나의 천사야.", difficulty: 'medium' },
            { sentence: "Stairway to heaven. There's a lady.", translation: "천국으로 가는 계단. 한 여인이 있어.", difficulty: 'hard' },
            { sentence: "Comfortably numb. I have become.", translation: "편안하게 마비된. 나는 그렇게 됐어.", difficulty: 'hard' },
            { sentence: "Hallelujah. Maybe there's a God above.", translation: "할렐루야. 어쩌면 위에 신이 있을지도.", difficulty: 'hard' },
            { sentence: "Smells like a teen spirit. A denial.", translation: "십대 정신의 냄새가 나. 부인.", difficulty: 'hard' },
            { sentence: "The sound of silence. Hello, darkness.", translation: "침묵의 소리. 안녕, 어둠.", difficulty: 'hard' },
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
