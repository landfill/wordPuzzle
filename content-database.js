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
        ],
        'Star Wars': [
            { sentence: "May the Force be with you.", translation: "포스가 함께 하기를.", difficulty: 'easy' },
            { sentence: "I have a bad feeling about this.", translation: "안 좋은 예감이 들어.", difficulty: 'easy' },
            { sentence: "Help me, Obi-Wan Kenobi.", translation: "도와주세요, 오비완 케노비.", difficulty: 'easy' },
            { sentence: "That's no moon.", translation: "저건 달이 아니야.", difficulty: 'easy' },
            { sentence: "I find your lack of faith disturbing.", translation: "네 믿음 부족이 불쾌하다.", difficulty: 'easy' }
        ],
        'Jurassic Park': [
            { sentence: "Life finds a way.", translation: "생명은 길을 찾는다.", difficulty: 'easy' },
            { sentence: "Clever girl.", translation: "영리한 녀석이군.", difficulty: 'easy' },
            { sentence: "Welcome to Jurassic Park.", translation: "쥬라기 공원에 오신 걸 환영합니다.", difficulty: 'easy' },
            { sentence: "Hold on to your butts.", translation: "꽉 잡아.", difficulty: 'easy' },
            { sentence: "Spared no expense.", translation: "비용을 아끼지 않았어.", difficulty: 'easy' }
        ],
        'Titanic': [
            { sentence: "I'm the king of the world!", translation: "나는 세상의 왕이다!", difficulty: 'easy' },
            { sentence: "Draw me like one of your French girls.", translation: "프랑스 소녀들처럼 그려줘.", difficulty: 'easy' },
            { sentence: "I'll never let go, Jack.", translation: "절대 놓지 않을게, 잭.", difficulty: 'easy' },
            { sentence: "Women and children first.", translation: "여성과 아이들 먼저.", difficulty: 'easy' },
            { sentence: "Iceberg, right ahead!", translation: "빙산, 바로 앞!", difficulty: 'easy' }
        ],
        'Forrest Gump': [
            { sentence: "Life is like a box of chocolates.", translation: "인생은 초콜릿 상자 같아.", difficulty: 'easy' },
            { sentence: "Run, Forrest, run!", translation: "뛰어, 포레스트, 뛰어!", difficulty: 'easy' },
            { sentence: "Stupid is as stupid does.", translation: "바보는 바보짓을 한다.", difficulty: 'easy' },
            { sentence: "My mama always said.", translation: "우리 엄마가 항상 말했어.", difficulty: 'easy' },
            { sentence: "That's all I have to say about that.", translation: "그것에 대해 할 말은 그게 다야.", difficulty: 'easy' }
        ],
        'E.T.': [
            { sentence: "E.T. phone home.", translation: "E.T. 집에 전화해.", difficulty: 'easy' },
            { sentence: "E.T. stay.", translation: "E.T. 있어.", difficulty: 'easy' },
            { sentence: "I'll be right here.", translation: "난 여기 있을게.", difficulty: 'easy' },
            { sentence: "You could be happy here.", translation: "여기서 행복할 수 있어.", difficulty: 'easy' },
            { sentence: "He's fine.", translation: "그는 괜찮아.", difficulty: 'easy' }
        ],
        'The Wizard of Oz': [
            { sentence: "There's no place like home.", translation: "집만한 곳은 없어.", difficulty: 'easy' },
            { sentence: "Follow the yellow brick road.", translation: "노란 벽돌길을 따라가.", difficulty: 'easy' },
            { sentence: "We're not in Kansas anymore.", translation: "여긴 캔자스가 아니야.", difficulty: 'easy' },
            { sentence: "Pay no attention to that man.", translation: "저 남자는 무시해.", difficulty: 'easy' },
            { sentence: "If I only had a brain.", translation: "뇌만 있다면.", difficulty: 'easy' }
        ],
        'Terminator': [
            { sentence: "I'll be back.", translation: "돌아올게.", difficulty: 'easy' },
            { sentence: "Come with me if you want to live.", translation: "살고 싶으면 따라와.", difficulty: 'easy' },
            { sentence: "Hasta la vista, baby.", translation: "안녕히, 자기야.", difficulty: 'easy' },
            { sentence: "No problemo.", translation: "문제없어.", difficulty: 'easy' },
            { sentence: "I need your clothes.", translation: "옷이 필요해.", difficulty: 'easy' }
        ],
        'Rocky': [
            { sentence: "Yo, Adrian!", translation: "요, 에이드리언!", difficulty: 'easy' },
            { sentence: "I'm gonna fly now.", translation: "이제 날 거야.", difficulty: 'easy' },
            { sentence: "Going the distance.", translation: "끝까지 가는 거야.", difficulty: 'easy' },
            { sentence: "It ain't about how hard you hit.", translation: "얼마나 세게 치느냐가 아니야.", difficulty: 'easy' }
        ],
        'Home Alone': [
            { sentence: "Keep the change, ya filthy animal.", translation: "잔돈은 가져, 더러운 놈아.", difficulty: 'easy' },
            { sentence: "I made my family disappear.", translation: "내 가족을 사라지게 만들었어.", difficulty: 'easy' },
            { sentence: "This is my house.", translation: "여긴 내 집이야.", difficulty: 'easy' },
            { sentence: "Buzz, your girlfriend. Woof!", translation: "버즈, 네 여자친구. 워프!", difficulty: 'easy' },
            { sentence: "Look what you did, you little jerk!", translation: "네가 뭘 했는지 봐, 이 작은 바보야!", difficulty: 'easy' }
        ],
        'Jaws': [
            { sentence: "You're gonna need a bigger boat.", translation: "더 큰 배가 필요할 거야.", difficulty: 'easy' },
            { sentence: "Smile, you son of a gun.", translation: "웃어, 이 자식아.", difficulty: 'easy' },
            { sentence: "We're gonna catch this shark.", translation: "이 상어를 잡을 거야.", difficulty: 'easy' },
            { sentence: "Here's Johnny!", translation: "여기 조니야!", difficulty: 'easy' }
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
        ],
        'Pride and Prejudice': [
            { sentence: "It is a truth universally acknowledged.", translation: "보편적으로 인정되는 진실이다.", difficulty: 'easy' },
            { sentence: "First impressions are not always right.", translation: "첫인상이 항상 옳지는 않아.", difficulty: 'easy' },
            { sentence: "My good opinion once lost is lost forever.", translation: "한번 잃은 좋은 인상은 영원히 잃는다.", difficulty: 'easy' },
            { sentence: "I am perfectly happy as I am.", translation: "나는 지금 그대로 완전히 행복해.", difficulty: 'easy' },
            { sentence: "You must allow me to tell you.", translation: "말할 수 있게 허락해 주세요.", difficulty: 'easy' }
        ],
        'Romeo and Juliet': [
            { sentence: "Romeo, Romeo! Wherefore art thou Romeo?", translation: "로미오, 로미오! 로미오는 어디 있나요?", difficulty: 'easy' },
            { sentence: "A rose by any other name would smell sweet.", translation: "다른 이름의 장미도 향기롭다.", difficulty: 'easy' },
            { sentence: "Love is a many splendored thing.", translation: "사랑은 많은 영광스러운 것이다.", difficulty: 'easy' },
            { sentence: "Two households, both alike in dignity.", translation: "두 집안, 둘 다 품위에서 비슷하다.", difficulty: 'easy' },
            { sentence: "For never was a story of more woe.", translation: "이보다 더 슬픈 이야기는 없었다.", difficulty: 'easy' }
        ],
        'Alice in Wonderland': [
            { sentence: "We're all mad here.", translation: "여기서는 모두 미쳤어.", difficulty: 'easy' },
            { sentence: "Curiouser and curiouser!", translation: "점점 더 이상해!", difficulty: 'easy' },
            { sentence: "I'm late! I'm late!", translation: "늦었어! 늦었어!", difficulty: 'easy' },
            { sentence: "Have I gone mad?", translation: "내가 미쳤나?", difficulty: 'easy' },
            { sentence: "Take more tea.", translation: "차를 더 마셔.", difficulty: 'easy' }
        ],
        'The Great Gatsby': [
            { sentence: "So we beat on, boats against the current.", translation: "그래서 우리는 물살을 거슬러 나아간다.", difficulty: 'easy' },
            { sentence: "I hope she'll be a fool.", translation: "그녀가 바보였으면 좋겠어.", difficulty: 'easy' },
            { sentence: "Can't repeat the past?", translation: "과거를 반복할 수 없다고?", difficulty: 'easy' },
            { sentence: "I like large parties.", translation: "큰 파티를 좋아해.", difficulty: 'easy' },
            { sentence: "It was a rich cream color.", translation: "그것은 진한 크림색이었다.", difficulty: 'easy' }
        ],
        'To Kill a Mockingbird': [
            { sentence: "You never really understand a person.", translation: "사람을 진정으로 이해할 수는 없어.", difficulty: 'easy' },
            { sentence: "Mockingbirds don't do one thing.", translation: "앵무새는 아무것도 하지 않아.", difficulty: 'easy' },
            { sentence: "Atticus, he was real nice.", translation: "애티커스, 그는 정말 좋았어.", difficulty: 'easy' },
            { sentence: "Hey, Boo.", translation: "안녕, 부.", difficulty: 'easy' },
            { sentence: "Summer was coming to an end.", translation: "여름이 끝나가고 있었다.", difficulty: 'easy' }
        ],
        'The Catcher in the Rye': [
            { sentence: "If you really want to hear about it.", translation: "정말로 그것에 대해 듣고 싶다면.", difficulty: 'easy' },
            { sentence: "People never notice anything.", translation: "사람들은 아무것도 알아차리지 못해.", difficulty: 'easy' },
            { sentence: "I'm the most terrific liar.", translation: "나는 최고의 거짓말쟁이야.", difficulty: 'easy' },
            { sentence: "Don't ever tell anybody anything.", translation: "누구에게도 아무것도 말하지 마.", difficulty: 'easy' },
            { sentence: "I felt like praying or something.", translation: "기도하고 싶은 기분이었어.", difficulty: 'easy' }
        ],
        'Jane Eyre': [
            { sentence: "I am no bird.", translation: "나는 새가 아니야.", difficulty: 'easy' },
            { sentence: "Reader, I married him.", translation: "독자여, 나는 그와 결혼했다.", difficulty: 'easy' },
            { sentence: "Do you think I am an automaton?", translation: "내가 자동기계라고 생각해?", difficulty: 'easy' },
            { sentence: "I care for myself.", translation: "나는 나 자신을 돌봐.", difficulty: 'easy' },
            { sentence: "I have lived a full life here.", translation: "여기서 충만한 삶을 살았어.", difficulty: 'easy' }
        ],
        'Wuthering Heights': [
            { sentence: "I cannot live without my life!", translation: "내 삶 없이는 살 수 없어!", difficulty: 'easy' },
            { sentence: "Whatever our souls are made of.", translation: "우리 영혼이 무엇으로 만들어졌든.", difficulty: 'easy' },
            { sentence: "I am Heathcliff!", translation: "나는 히스클리프야!", difficulty: 'easy' },
            { sentence: "Be with me always.", translation: "항상 나와 함께 있어.", difficulty: 'easy' },
            { sentence: "I cannot express it.", translation: "표현할 수 없어.", difficulty: 'easy' }
        ],
        'Little Women': [
            { sentence: "I want to do something splendid.", translation: "멋진 일을 하고 싶어.", difficulty: 'easy' },
            { sentence: "I'll try and be what he loves.", translation: "그가 사랑하는 사람이 되려고 노력할게.", difficulty: 'easy' },
            { sentence: "I am not afraid of storms.", translation: "폭풍이 무섭지 않아.", difficulty: 'easy' },
            { sentence: "Love alone is a beautiful thing.", translation: "사랑만으로도 아름다운 거야.", difficulty: 'easy' },
            { sentence: "I'd rather take coffee than compliments.", translation: "칭찬보다는 커피를 마시고 싶어.", difficulty: 'easy' }
        ],
        'Anne of Green Gables': [
            { sentence: "Tomorrow is always fresh.", translation: "내일은 항상 새로워.", difficulty: 'easy' },
            { sentence: "I'm so glad I live in a world.", translation: "이런 세상에 살아서 기뻐.", difficulty: 'easy' },
            { sentence: "Kindred spirits are not so scarce.", translation: "마음이 통하는 사람은 드물지 않아.", difficulty: 'easy' },
            { sentence: "It's been my experience.", translation: "내 경험으로는.", difficulty: 'easy' },
            { sentence: "I love bright red geraniums.", translation: "밝은 빨간 제라늄을 좋아해.", difficulty: 'easy' }
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
            { sentence: "You ain't never had a friend.", translation: "나 같은 친구는 한 번도 없었을 거야.", difficulty: 'medium' },
            { sentence: "When you wish upon a star.", translation: "별에게 소원을 빌 때.", difficulty: 'easy' },
            { sentence: "Bibbidi bobbidi boo.", translation: "비비디 바비디 부.", difficulty: 'easy' },
            { sentence: "Have courage and be kind.", translation: "용기를 갖고 친절하게.", difficulty: 'easy' },
            { sentence: "Dreams come true.", translation: "꿈이 이루어져.", difficulty: 'easy' },
            { sentence: "Magic mirror on the wall.", translation: "벽에 걸린 마법 거울.", difficulty: 'easy' },
            { sentence: "Heigh ho, heigh ho.", translation: "하이호, 하이호.", difficulty: 'easy' },
            { sentence: "Some day my prince will come.", translation: "언젠가 내 왕자가 올 거야.", difficulty: 'easy' },
            { sentence: "Whistle while you work.", translation: "일하면서 휘파람을 불어.", difficulty: 'easy' },
            { sentence: "I'm wishing for the one I love.", translation: "내가 사랑하는 사람을 위해 소원을 빌어.", difficulty: 'easy' },
            { sentence: "Look for the bare necessities.", translation: "꼭 필요한 것들을 찾아봐.", difficulty: 'easy' },
            { sentence: "Try the grey stuff, it's delicious.", translation: "회색 것을 먹어봐, 맛있어.", difficulty: 'easy' },
            { sentence: "I've got a dream.", translation: "나에게는 꿈이 있어.", difficulty: 'easy' },
            { sentence: "Mother knows best.", translation: "엄마가 가장 잘 알아.", difficulty: 'easy' },
            { sentence: "I see the light.", translation: "빛이 보여.", difficulty: 'easy' },
            { sentence: "At last I see the light.", translation: "마침내 빛이 보여.", difficulty: 'easy' },
            { sentence: "We know the way.", translation: "우리는 길을 알아.", difficulty: 'easy' },
            { sentence: "How far I'll go.", translation: "얼마나 멀리 갈지.", difficulty: 'easy' },
            { sentence: "The ocean chose you.", translation: "바다가 너를 선택했어.", difficulty: 'easy' },
            { sentence: "You're welcome.", translation: "천만에.", difficulty: 'easy' },
            { sentence: "What can I say except you're welcome.", translation: "천만에라고 말하는 것 외에 뭘 할까.", difficulty: 'easy' },
            { sentence: "True love's kiss.", translation: "진정한 사랑의 키스.", difficulty: 'easy' },
            { sentence: "Love is an open door.", translation: "사랑은 열린 문이야.", difficulty: 'easy' },
            { sentence: "Some people are worth melting for.", translation: "어떤 사람들은 녹을 가치가 있어.", difficulty: 'easy' },
            { sentence: "In summer I'll be happy.", translation: "여름에는 행복할 거야.", difficulty: 'easy' },
            { sentence: "Do you want to build a snowman?", translation: "눈사람 만들래?", difficulty: 'easy' },
            { sentence: "The sky is awake.", translation: "하늘이 깨어났어.", difficulty: 'easy' },
            { sentence: "I'm Anna by the way.", translation: "그런데 나는 안나야.", difficulty: 'easy' },
            { sentence: "Oh yes, the past can hurt.", translation: "오 그래, 과거는 아플 수 있어.", difficulty: 'easy' },
            { sentence: "Can you feel the love tonight.", translation: "오늘 밤 사랑을 느낄 수 있어.", difficulty: 'easy' },
            { sentence: "It means no worries.", translation: "걱정 없다는 뜻이야.", difficulty: 'easy' },
            { sentence: "Remember who you are.", translation: "네가 누구인지 기억해.", difficulty: 'easy' },
            { sentence: "The stars are calling me.", translation: "별들이 나를 부르고 있어.", difficulty: 'easy' },
            { sentence: "Adventure is out there.", translation: "모험이 저기 있어.", difficulty: 'easy' },
            { sentence: "Thanks for the adventure.", translation: "모험을 주셔서 감사해요.", difficulty: 'easy' },
            { sentence: "You are my greatest adventure.", translation: "당신이 내 최고의 모험이에요.", difficulty: 'easy' },
            { sentence: "If you can dream it, you can do it.", translation: "꿈꿀 수 있다면, 할 수 있어.", difficulty: 'easy' },
            { sentence: "All it takes is faith and trust.", translation: "필요한 건 믿음과 신뢰뿐이야.", difficulty: 'easy' },
            { sentence: "Think happy thoughts.", translation: "행복한 생각을 해.", difficulty: 'easy' },
            { sentence: "Second star to the right.", translation: "오른쪽 두 번째 별.", difficulty: 'easy' },
            { sentence: "I can show you the world.", translation: "세상을 보여줄 수 있어.", difficulty: 'easy' },
            { sentence: "Shining, shimmering, splendid.", translation: "빛나고, 반짝이고, 화려해.", difficulty: 'easy' },
            { sentence: "A diamond in the rough.", translation: "거친 곳의 다이아몬드.", difficulty: 'easy' },
            { sentence: "Prince Ali, fabulous he.", translation: "알리 왕자, 그는 멋져.", difficulty: 'easy' },
            { sentence: "Friend like me.", translation: "나 같은 친구.", difficulty: 'easy' },
            { sentence: "Ten thousand years.", translation: "만 년이야.", difficulty: 'easy' },
            { sentence: "Phenomenal cosmic powers.", translation: "경이로운 우주의 힘.", difficulty: 'easy' },
            { sentence: "Beauty and the Beast.", translation: "미녀와 야수.", difficulty: 'easy' }                        
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
        ],
        'Shopping': [
            { sentence: "How much does this cost?", translation: "이게 얼마예요?", difficulty: 'easy' },
            { sentence: "Can I try this on?", translation: "이거 입어봐도 돼요?", difficulty: 'easy' },
            { sentence: "Do you have this in small?", translation: "이거 작은 사이즈 있어요?", difficulty: 'easy' },
            { sentence: "I'm just looking.", translation: "그냥 구경만 하고 있어요.", difficulty: 'easy' },
            { sentence: "Where is the fitting room?", translation: "탈의실이 어디예요?", difficulty: 'easy' },
            { sentence: "I'll take this one.", translation: "이걸로 할게요.", difficulty: 'easy' },
            { sentence: "Do you accept credit cards?", translation: "신용카드 받나요?", difficulty: 'easy' },
            { sentence: "Can I get a receipt?", translation: "영수증 받을 수 있나요?", difficulty: 'easy' },
            { sentence: "Is there a discount?", translation: "할인 있나요?", difficulty: 'easy' },
            { sentence: "What time do you close?", translation: "몇 시에 문 닫아요?", difficulty: 'easy' },
            { sentence: "Do you have other colors?", translation: "다른 색깔 있어요?", difficulty: 'easy' },
            { sentence: "This is too expensive.", translation: "이거 너무 비싸요.", difficulty: 'easy' },
            { sentence: "Can you wrap this up?", translation: "포장해 주시겠어요?", difficulty: 'easy' },
            { sentence: "I'm looking for a gift.", translation: "선물을 찾고 있어요.", difficulty: 'easy' },
            { sentence: "What's on sale today?", translation: "오늘 뭐가 세일해요?", difficulty: 'easy' },
            { sentence: "Can I return this?", translation: "이거 반품할 수 있나요?", difficulty: 'easy' },
            { sentence: "Do you have a bigger size?", translation: "더 큰 사이즈 있어요?", difficulty: 'easy' },
            { sentence: "I need a bag.", translation: "쇼핑백 필요해요.", difficulty: 'easy' },
            { sentence: "Where can I pay?", translation: "어디서 계산해요?", difficulty: 'easy' },
            { sentence: "Thank you for your help.", translation: "도와주셔서 감사해요.", difficulty: 'easy' }
        ],
        'Transportation': [
            { sentence: "Where is the bus stop?", translation: "버스 정류장이 어디예요?", difficulty: 'easy' },
            { sentence: "How much is the fare?", translation: "요금이 얼마예요?", difficulty: 'easy' },
            { sentence: "Does this bus go downtown?", translation: "이 버스 시내 가나요?", difficulty: 'easy' },
            { sentence: "When does the next train come?", translation: "다음 기차 언제 와요?", difficulty: 'easy' },
            { sentence: "I'd like a round trip ticket.", translation: "왕복표 주세요.", difficulty: 'easy' },
            { sentence: "Which platform is it?", translation: "몇 번 플랫폼이에요?", difficulty: 'easy' },
            { sentence: "Can you call me a taxi?", translation: "택시 불러주시겠어요?", difficulty: 'easy' },
            { sentence: "How long does it take?", translation: "얼마나 걸려요?", difficulty: 'easy' },
            { sentence: "Is this seat taken?", translation: "이 자리 누가 앉아요?", difficulty: 'easy' },
            { sentence: "Excuse me, this is my stop.", translation: "죄송해요, 여기서 내려요.", difficulty: 'easy' },
            { sentence: "Where can I buy tickets?", translation: "어디서 표 사요?", difficulty: 'easy' },
            { sentence: "Is there a subway map?", translation: "지하철 노선도 있어요?", difficulty: 'easy' },
            { sentence: "What time is the last train?", translation: "막차가 몇 시예요?", difficulty: 'easy' },
            { sentence: "Can you help me with directions?", translation: "길 좀 알려주시겠어요?", difficulty: 'easy' },
            { sentence: "I'm going to the airport.", translation: "공항에 가요.", difficulty: 'easy' },
            { sentence: "How often do buses run?", translation: "버스가 얼마나 자주 와요?", difficulty: 'easy' },
            { sentence: "Do I need to transfer?", translation: "갈아타야 해요?", difficulty: 'easy' },
            { sentence: "Can you slow down please?", translation: "천천히 가주시겠어요?", difficulty: 'easy' },
            { sentence: "Stop here, please.", translation: "여기서 세워주세요.", difficulty: 'easy' },
            { sentence: "Keep the change.", translation: "잔돈은 가지세요.", difficulty: 'easy' }
        ],
        'Hotel & Accommodation': [
            { sentence: "I have a reservation.", translation: "예약했어요.", difficulty: 'easy' },
            { sentence: "Can I see the room first?", translation: "방 먼저 볼 수 있나요?", difficulty: 'easy' },
            { sentence: "What time is breakfast?", translation: "아침식사가 몇 시예요?", difficulty: 'easy' },
            { sentence: "Can I have an extra towel?", translation: "수건 하나 더 주시겠어요?", difficulty: 'easy' },
            { sentence: "The air conditioning doesn't work.", translation: "에어컨이 안 돼요.", difficulty: 'easy' },
            { sentence: "Can you wake me at seven?", translation: "7시에 깨워주시겠어요?", difficulty: 'easy' },
            { sentence: "Where is the elevator?", translation: "엘리베이터가 어디예요?", difficulty: 'easy' },
            { sentence: "Is there a gym in the hotel?", translation: "호텔에 헬스장 있어요?", difficulty: 'easy' },
            { sentence: "Can I store my luggage here?", translation: "여기 짐 맡길 수 있나요?", difficulty: 'easy' },
            { sentence: "What's the Wi-Fi password?", translation: "와이파이 비밀번호가 뭐예요?", difficulty: 'easy' },
            { sentence: "Is breakfast included?", translation: "아침식사 포함이에요?", difficulty: 'easy' },
            { sentence: "Can I have a late checkout?", translation: "늦게 체크아웃할 수 있나요?", difficulty: 'easy' },
            { sentence: "The TV doesn't work.", translation: "TV가 안 돼요.", difficulty: 'easy' },
            { sentence: "Can I get room service?", translation: "룸서비스 시킬 수 있나요?", difficulty: 'easy' },
            { sentence: "Where can I park my car?", translation: "차를 어디에 주차해요?", difficulty: 'easy' },
            { sentence: "Is there a swimming pool?", translation: "수영장 있어요?", difficulty: 'easy' },
            { sentence: "Can you recommend a restaurant?", translation: "식당 추천해 주시겠어요?", difficulty: 'easy' },
            { sentence: "I lost my room key.", translation: "방 열쇠를 잃어버렸어요.", difficulty: 'easy' },
            { sentence: "Can I change rooms?", translation: "방 바꿀 수 있나요?", difficulty: 'easy' },
            { sentence: "Thank you for your service.", translation: "서비스 감사합니다.", difficulty: 'easy' }
        ]        
    }
};

export default CONTENT_DATABASE;
