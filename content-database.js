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
    'Iron Man (2008)': [
        {
            sentence: "I am Iron Man.",
            translation: "나는 아이언맨이다.",
            difficulty: "easy"
        },
        {
            sentence: "Don't waste it. Don't waste your life.",
            translation: "낭비하지 마. 네 삶을 낭비하지 마.",
            difficulty: "easy"
        },
        {
            sentence: "Sometimes you gotta run before you can walk.",
            translation: "때로는 걷기 전에 뛰어야 할 때도 있어.",
            difficulty: "easy"
        },
        {
            sentence: "The truth is... I am Iron Man.",
            translation: "진실은… 나는 아이언맨이다.",
            difficulty: "easy"
        },
        {
            sentence: "They say the best weapon is the one you never have to fire. I respectfully disagree.",
            translation: "가장 좋은 무기는 쏘지 않아도 되는 거라는데, 난 정중히 반대해.",
            difficulty: "medium"
        },
        {
            sentence: "Heroes are made by the path they choose, not the powers they are graced with.",
            translation: "영웅은 부여받은 힘이 아니라, 선택한 길에 의해 만들어진다.",
            difficulty: "medium"
        }
    ],
    'The Incredible Hulk (2008)': [
        {
            sentence: "Hulk smash!",
            translation: "헐크 박살!",
            difficulty: "easy"
        },
        {
            sentence: "You won't like me when I'm angry.",
            translation: "나 화나면 안 좋아할 걸.",
            difficulty: "easy"
        },
        {
            sentence: "I'm not always in control.",
            translation: "난 항상 통제할 수 있는 게 아니야.",
            difficulty: "easy"
        },
        {
            sentence: "There's an inner monster in all of us, and it just wants to come out and play.",
            translation: "우리 모두에게는 내면의 괴물이 있고, 그건 그냥 나와서 놀고 싶어 해.",
            difficulty: "medium"
        },
        {
            sentence: "Is there a cure for this? A way to get rid of it?",
            translation: "이걸 치료할 방법은 없나요? 없앨 방법은요?",
            difficulty: "medium"
        }
    ],
    'Iron Man 2 (2010)': [
        {
            sentence: "I'm Iron Man. The suit and I are one.",
            translation: "나는 아이언맨이다. 수트와 나는 하나야.",
            difficulty: "easy"
        },
        {
            sentence: "I am a genius, billionaire, playboy, philanthropist.",
            translation: "나는 천재이자 억만장자, 바람둥이, 자선가다.",
            difficulty: "easy"
        },
        {
            sentence: "I want my bird.",
            translation: "내 새 돌려줘.",
            difficulty: "easy"
        },
        {
            sentence: "If you can make God bleed, people will cease to believe in him.",
            translation: "신이 피를 흘릴 수 있다면, 사람들은 믿음을 버릴 거야.",
            difficulty: "medium"
        },
        {
            sentence: "You're a man who has everything, and nothing.",
            translation: "당신은 모든 것을 가졌지만, 아무것도 갖지 못한 남자야.",
            difficulty: "medium"
        },
        {
            sentence: "The arc reactor, that's what's powering the suit? That's old tech. That's a gimmick.",
            translation: "아크 원자로, 그게 슈트를 움직이는 거야? 그거 구식 기술이잖아. 그냥 속임수지.",
            difficulty: "medium"
        }
    ],
    'Thor (2011)': [
        {
            sentence: "Whosoever holds this hammer, if he be worthy, shall possess the power of Thor.",
            translation: "이 망치를 들 수 있는 자, 그가 자격이 있다면, 토르의 힘을 가질 것이다.",
            difficulty: "easy"
        },
        {
            sentence: "This drink... I like it. Another!",
            translation: "이 술... 마음에 드는군. 하나 더!",
            difficulty: "easy"
        },
        {
            sentence: "You’re no match for the mighty Thor!",
            translation: "넌 강력한 토르의 상대가 안 돼!",
            difficulty: "easy"
        },
        {
            sentence: "You are a vain, greedy, cruel boy!",
            translation: "넌 허영심 많고, 욕심 많고, 잔인한 아이야!",
            difficulty: "medium"
        },
        {
            sentence: "The Bifrost is a bridge between worlds. It can take you anywhere.",
            translation: "비프로스트는 세상들을 잇는 다리야. 널 어디든 데려다줄 수 있지.",
            difficulty: "medium"
        }
    ],
    'Captain America: The First Avenger (2011)': [
        {
            sentence: "I can do this all day.",
            translation: "이거 하루 종일도 할 수 있어.",
            difficulty: "easy"
        },
        {
            sentence: "I'm just a kid from Brooklyn.",
            translation: "난 그냥 브루클린에서 온 애야.",
            difficulty: "easy"
        },
        {
            sentence: "I don’t like bullies. I don’t care where they’re from.",
            translation: "불량배는 싫어. 어디서 왔든 상관없어.",
            difficulty: "easy"
        },
        {
            sentence: "Sometimes the best you can do is just to take a swing.",
            translation: "때로는 그냥 한번 휘두르는 게 최선일 때도 있어.",
            difficulty: "medium"
        },
        {
            sentence: "When I was in the ice, I had a chance to think... about the world I wanted to come back to. I’m not sure this is it.",
            translation: "얼음 속에 있을 때, 내가 돌아오고 싶은 세상에 대해 생각할 기회가 있었어. 여기가 그곳인지는 잘 모르겠어.",
            difficulty: "hard"
        }
    ],
    'The Avengers (2012)': [
        {
            sentence: "We have a Hulk.",
            translation: "우리한테는 헐크가 있어.",
            difficulty: "easy"
        },
        {
            sentence: "Puny god.",
            translation: "보잘것없는 신.",
            difficulty: "easy"
        },
        {
            sentence: "That's my secret, Cap. I'm always angry.",
            translation: "그게 내 비밀이야, 캡틴. 난 항상 화나 있거든.",
            difficulty: "easy"
        },
        {
            sentence: "I understood that reference!",
            translation: "나 그 말 알아들었어!",
            difficulty: "easy"
        },
        {
            sentence: "I've got a great team. Just a little rough around the edges.",
            translation: "나에겐 훌륭한 팀이 있어. 좀 거칠긴 하지만.",
            difficulty: "medium"
        },
        {
            sentence: "Let's just say I'm very, very good at what I do.",
            translation: "그냥 내가 하는 일에 아주, 아주 능숙하다고 해두지.",
            difficulty: "medium"
        },
        {
            sentence: "I have to know. Can you see me now?",
            translation: "알아야겠어. 지금 날 볼 수 있나요?",
            difficulty: "medium"
        },
        {
            sentence: "Humanity. You were made for more than just fighting. You were made to serve.",
            translation: "인류. 너희는 싸우기 위해 만들어진 게 아니야. 봉사하기 위해 만들어졌지.",
            difficulty: "hard"
        }
    ],
    'Iron Man 3 (2013)': [
        {
            sentence: "I am Iron Man. The suit and I are one.",
            translation: "나는 아이언맨이다. 수트와 나는 하나야.",
            difficulty: "easy"
        },
        {
            sentence: "I'm a man in a can.",
            translation: "난 깡통 속의 남자야.",
            difficulty: "easy"
        },
        {
            sentence: "We create our own demons.",
            translation: "우리는 우리만의 악마를 만들어낸다.",
            difficulty: "medium"
        },
        {
            sentence: "My name is Tony Stark, and I'm not afraid of you. I'm not afraid of anyone.",
            translation: "내 이름은 토니 스타크, 난 당신을 두려워하지 않아. 누구도 두려워하지 않아.",
            difficulty: "medium"
        },
        {
            sentence: "You're a man who has everything, and nothing.",
            translation: "당신은 모든 것을 가졌지만, 아무것도 갖지 못한 남자야.",
            difficulty: "hard"
        }
    ],
    'Thor: The Dark World (2013)': [
        {
            sentence: "I'm not a God of war, I'm a God of thunder!",
            translation: "난 전쟁의 신이 아니라, 천둥의 신이야!",
            difficulty: "easy"
        },
        {
            sentence: "Is that a hammer? I’m going to need that.",
            translation: "저거 망치인가? 저거 필요하겠는데.",
            difficulty: "easy"
        },
        {
            sentence: "You're not a monster. You're a hero.",
            translation: "넌 괴물이 아니야. 넌 영웅이야.",
            difficulty: "medium"
        },
        {
            sentence: "The Bifrost is a bridge between worlds. It can take you anywhere.",
            translation: "비프로스트는 세상들을 잇는 다리야. 널 어디든 데려다줄 수 있지.",
            difficulty: "medium"
        },
        {
            sentence: "The Tesseract is a cosmic cube of power. It can control time and space.",
            translation: "테서랙트는 우주의 힘을 가진 큐브야. 시간과 공간을 조종할 수 있지.",
            difficulty: "medium"
        },
        {
            sentence: "I have seen the future, and it is full of destruction. The nine realms will fall.",
            translation: "나는 미래를 봤고, 그곳은 파괴로 가득 차 있어. 아홉 왕국이 무너질 거야.",
            difficulty: "hard"
        }
    ],
    'Captain America: The Winter Soldier (2014)': [
        {
            sentence: "On your left.",
            translation: "왼쪽입니다.",
            difficulty: "easy"
        },
        {
            sentence: "I’m with you ‘til the end of the line.",
            translation: "끝까지 함께할게.",
            difficulty: "easy"
        },
        {
            sentence: "Who the hell is Bucky?",
            translation: "버키가 대체 누구야?",
            difficulty: "easy"
        },
        {
            sentence: "This isn't freedom, this is fear.",
            translation: "이건 자유가 아니야, 이건 공포야.",
            difficulty: "medium"
        },
        {
            sentence: "The price of freedom is high. It always has been. And it’s a price I’m willing to pay.",
            translation: "자유의 대가는 비싸. 항상 그랬어. 그리고 난 기꺼이 그 대가를 치를 거야.",
            difficulty: "medium"
        },
        {
            sentence: "I'm not going to fight you, Bucky.",
            translation: "널 때리지 않을 거야, 버키.",
            difficulty: "medium"
        },
        {
            sentence: "To build a better world, you have to tear down the old one. Let's start with yours.",
            translation: "더 나은 세상을 만들려면, 오래된 세상을 허물어야 해. 너희 세상부터 시작하자고.",
            difficulty: "hard"
        },
        {
            sentence: "I'm not a soldier. I'm a ghost. And I'm going to haunt you for the rest of your life.",
            translation: "난 군인이 아니야. 난 유령이야. 그리고 네 평생을 따라다닐 거야.",
            difficulty: "hard"
        }
    ],
    'Guardians of the Galaxy (2014)': [
        {
            sentence: "I am Groot.",
            translation: "나는 그루트다.",
            difficulty: "easy"
        },
        {
            sentence: "We are Groot.",
            translation: "우리는 그루트다.",
            difficulty: "easy"
        },
        {
            sentence: "Nothing goes over my head. My reflexes are too fast, I would catch it.",
            translation: "내 머리 위로 넘어가는 건 없어. 내 반사 신경이 너무 빨라서 잡을 거야.",
            difficulty: "easy"
        },
        {
            sentence: "I'm sorry. I'm not a hero.",
            translation: "미안. 난 영웅이 아니야.",
            difficulty: "medium"
        },
        {
            sentence: "I have a plan. I don't know what it is yet, but I have a plan.",
            translation: "나에게 계획이 있어. 아직 뭔지는 모르겠지만, 계획은 있다고.",
            difficulty: "medium"
        },
        {
            sentence: "I'm a survivor. And I'm going to do whatever it takes to survive.",
            translation: "난 생존자야. 그리고 살아남기 위해서라면 뭐든지 할 거야.",
            difficulty: "medium"
        },
        {
            sentence: "I have to know. Can you see me now?",
            translation: "알아야겠어. 지금 날 볼 수 있나요?",
            difficulty: "hard"
        }
    ],
    'Avengers: Age of Ultron (2015)': [
        {
            sentence: "There are no strings on me.",
            translation: "나를 묶는 줄은 없어.",
            difficulty: "easy"
        },
        {
            sentence: "Language.",
            translation: "말 조심해.",
            difficulty: "easy"
        },
        {
            sentence: "We can't change what's happening. We can only change how we react to it.",
            translation: "우리는 일어나는 일을 바꿀 수 없어. 단지 우리가 어떻게 반응하는지 바꿀 수 있을 뿐이지.",
            difficulty: "easy"
        },
        {
            sentence: "When the dust settles, the only thing that will be left is the truth.",
            translation: "먼지가 가라앉으면, 남는 건 진실뿐일 거야.",
            difficulty: "medium"
        },
        {
            sentence: "The only thing standing in your way is you.",
            translation: "네 길을 막는 유일한 것은 너 자신뿐이야.",
            difficulty: "medium"
        },
        {
            sentence: "Humanity. You were made for more than just fighting. You were made to serve.",
            translation: "인류. 너희는 싸우기 위해 만들어진 게 아니야. 봉사하기 위해 만들어졌지.",
            difficulty: "hard"
        },
        {
            sentence: "I'm going to tear you apart, from the inside out.",
            translation: "널 안에서부터 산산조각 내줄게.",
            difficulty: "hard"
        }
    ],
    'Ant-Man (2015)': [
        {
            sentence: "I'm a hero.",
            translation: "나는 영웅이다.",
            difficulty: "easy"
        },
        {
            sentence: "I'm the guy who shrinks.",
            translation: "나는 작아지는 남자야.",
            difficulty: "easy"
        },
        {
            sentence: "It's not about the suit, it's about the man inside.",
            translation: "중요한 건 슈트가 아니라, 그 안에 있는 사람이야.",
            difficulty: "medium"
        },
        {
            sentence: "You're a man who has everything, and nothing.",
            translation: "당신은 모든 것을 가졌지만, 아무것도 갖지 못한 남자야.",
            difficulty: "medium"
        },
        {
            sentence: "You have to be a hero, not just a man.",
            translation: "당신은 그냥 남자가 아니라, 영웅이 되어야 해.",
            difficulty: "medium"
        }
    ],
    'Captain America: Civil War (2016)': [
        {
            sentence: "I can do this all day.",
            translation: "이거 하루 종일도 할 수 있어.",
            difficulty: "easy"
        },
        {
            sentence: "What is it with you guys?",
            translation: "너희들 왜 그래?",
            difficulty: "easy"
        },
        {
            sentence: "He's my friend.",
            translation: "그는 내 친구야.",
            difficulty: "easy"
        },
        {
            sentence: "The world needs us to be better. We need to be better.",
            translation: "세상은 우리가 더 나아지길 원해. 우리는 더 나아져야 해.",
            difficulty: "medium"
        },
        {
            sentence: "Compromise is not an option.",
            translation: "타협은 선택지가 아니야.",
            difficulty: "medium"
        },
        {
            sentence: "I don't have to be a hero. I just have to be a man.",
            translation: "나는 영웅이 될 필요 없어. 그냥 남자면 돼.",
            difficulty: "medium"
        }
    ],
    'Doctor Strange (2016)': [
        {
            sentence: "Dormammu, I've come to bargain.",
            translation: "도르마무, 거래를 하러 왔다.",
            difficulty: "easy"
        },
        {
            sentence: "Mister Doctor.",
            translation: "미스터 닥터.",
            difficulty: "easy"
        },
        {
            sentence: "Magic is real.",
            translation: "마법은 진짜야.",
            difficulty: "easy"
        },
        {
            sentence: "The Sanctum Sanctorum is a place of power, a place of magic.",
            translation: "생텀 생토럼은 힘의 장소이자, 마법의 장소야.",
            difficulty: "medium"
        },
        {
            sentence: "You're a man who has everything, and nothing.",
            translation: "당신은 모든 것을 가졌지만, 아무것도 갖지 못한 남자야.",
            difficulty: "medium"
        },
        {
            sentence: "The only thing standing in your way is you.",
            translation: "네 길을 막는 유일한 것은 너 자신뿐이야.",
            difficulty: "medium"
        },
        {
            sentence: "I have seen the future, and it is full of destruction. The nine realms will fall.",
            translation: "나는 미래를 봤고, 그곳은 파괴로 가득 차 있어. 아홉 왕국이 무너질 거야.",
            difficulty: "hard"
        }
    ],
    'Guardians of the Galaxy Vol. 2 (2017)': [
        {
            sentence: "I am Groot.",
            translation: "나는 그루트다.",
            difficulty: "easy"
        },
        {
            sentence: "We are Groot.",
            translation: "우리는 그루트다.",
            difficulty: "easy"
        },
        {
            sentence: "I'm a survivor. And I'm going to do whatever it takes to survive.",
            translation: "난 생존자야. 그리고 살아남기 위해서라면 뭐든지 할 거야.",
            difficulty: "medium"
        },
        {
            sentence: "I'm not a hero. I'm a father.",
            translation: "난 영웅이 아니야. 난 아빠야.",
            difficulty: "medium"
        }
    ],
    'Spider-Man: Homecoming (2017)': [
        {
            sentence: "With great power comes great responsibility.",
            translation: "큰 힘에는 큰 책임이 따른다.",
            difficulty: "easy"
        },
        {
            sentence: "I'm just a kid from Queens.",
            translation: "난 그냥 퀸즈에서 온 애야.",
            difficulty: "easy"
        },
        {
            sentence: "I'm Spider-Man.",
            translation: "나는 스파이더맨이다.",
            difficulty: "easy"
        },
        {
            sentence: "If you're nothing without this suit, then you shouldn't have it.",
            translation: "이 슈트 없으면 아무것도 아니라면, 가지면 안 돼.",
            difficulty: "medium"
        },
        {
            sentence: "I'm not going to fight you, Bucky.",
            translation: "널 때리지 않을 거야, 버키.",
            difficulty: "medium"
        },
        {
            sentence: "The best thing you can do is just to take a swing.",
            translation: "때로는 그냥 한번 휘두르는 게 최선일 때도 있어.",
            difficulty: "medium"
        }
    ],
    'Thor: Ragnarok (2017)': [
        {
            sentence: "He's a friend from work!",
            translation: "직장 동료야!",
            difficulty: "easy"
        },
        {
            sentence: "Get help!",
            translation: "도와줘!",
            difficulty: "easy"
        },
        {
            sentence: "I'm the God of Thunder!",
            translation: "나는 천둥의 신이다!",
            difficulty: "easy"
        },
        {
            sentence: "Asgard is not a place, it's a people.",
            translation: "아스가르드는 장소가 아니라, 사람이야.",
            difficulty: "medium"
        },
        {
            sentence: "The Bifrost is a bridge between worlds. It can take you anywhere.",
            translation: "비프로스트는 세상들을 잇는 다리야. 널 어디든 데려다줄 수 있지.",
            difficulty: "medium"
        }
    ],
    'Black Panther (2018)': [
        {
            sentence: "Wakanda forever!",
            translation: "와칸다 포에버!",
            difficulty: "easy"
        },
        {
            sentence: "In times of crisis, the wise build bridges while the foolish build barriers.",
            translation: "위기의 시기에, 현명한 자는 다리를 짓고 어리석은 자는 장벽을 쌓는다.",
            difficulty: "medium"
        },
        {
            sentence: "A king's heart is not just for him. It's for his people.",
            translation: "왕의 심장은 그 자신만을 위한 것이 아니야. 그의 백성들을 위한 것이지.",
            difficulty: "medium"
        }
    ],
    'Avengers: Infinity War (2018)': [
        {
            sentence: "We are Groot.",
            translation: "우리는 그루트다.",
            difficulty: "easy"
        },
        {
            sentence: "Mr. Stark, I don't feel so good.",
            translation: "스타크 씨, 몸이 안 좋아요.",
            difficulty: "easy"
        },
        {
            sentence: "I hope they remember you.",
            translation: "그들이 널 기억하길 바라.",
            difficulty: "easy"
        },
        {
            sentence: "The hardest choices require the strongest wills.",
            translation: "가장 어려운 선택은 가장 강력한 의지를 필요로 한다.",
            difficulty: "medium"
        },
        {
            sentence: "You should have gone for the head.",
            translation: "머리를 노렸어야지.",
            difficulty: "medium"
        },
        {
            sentence: "I'm sorry. I'm not a hero.",
            translation: "미안. 난 영웅이 아니야.",
            difficulty: "medium"
        },
        {
            sentence: "When you're a kid, you think you can do anything. But you can't. You can't save everyone.",
            translation: "어렸을 때는 뭐든지 할 수 있다고 생각했지. 하지만 아니야. 모두를 구할 수는 없어.",
            difficulty: "hard"
        },
        {
            sentence: "I'm going to tear you apart, from the inside out.",
            translation: "널 안에서부터 산산조각 내줄게.",
            difficulty: "hard"
        },
        {
            sentence: "I have successfully privatized world peace!",
            translation: "나는 성공적으로 세계 평화를 민영화했다!",
            difficulty: "hard"
        }
    ],
    'Ant-Man and the Wasp (2018)': [
        {
            sentence: "I'm a hero.",
            translation: "나는 영웅이다.",
            difficulty: "easy"
        },
        {
            sentence: "I'm the guy who shrinks.",
            translation: "나는 작아지는 남자야.",
            difficulty: "easy"
        },
        {
            sentence: "It's not about the suit, it's about the man inside.",
            translation: "중요한 건 슈트가 아니라, 그 안에 있는 사람이야.",
            difficulty: "medium"
        },
        {
            sentence: "To build a better world, you have to tear down the old one. Let's start with yours.",
            translation: "더 나은 세상을 만들려면, 오래된 세상을 허물어야 해. 너희 세상부터 시작하자고.",
            difficulty: "hard"
        }
    ],
    'Captain Marvel (2019)': [
        {
            sentence: "Higher, further, faster.",
            translation: "더 높이, 더 멀리, 더 빠르게.",
            difficulty: "easy"
        },
        {
            sentence: "I have nothing to prove to you.",
            translation: "너에게 증명할 건 아무것도 없어.",
            difficulty: "easy"
        },
        {
            sentence: "We're not the only ones with a plan.",
            translation: "계획을 가진 건 우리뿐만이 아니야.",
            difficulty: "medium"
        }
    ],
    'Avengers: Endgame (2019)': [
        {
            sentence: "I am Iron Man.",
            translation: "나는 아이언맨이다.",
            difficulty: "easy"
        },
        {
            sentence: "I can do this all day.",
            translation: "이거 하루 종일도 할 수 있어.",
            difficulty: "easy"
        },
        {
            sentence: "Avengers... Assemble.",
            translation: "어벤져스… 집결해.",
            difficulty: "easy"
        },
        {
            sentence: "We're in the endgame now.",
            translation: "우린 이제 최종전에 들어왔어.",
            difficulty: "easy"
        },
        {
            sentence: "Whatever it takes.",
            translation: "어떤 수를 써서라도.",
            difficulty: "medium"
        },
        {
            sentence: "I love you 3000.",
            translation: "3000만큼 사랑해.",
            difficulty: "medium"
        },
        {
            sentence: "Part of the journey is the end.",
            translation: "여정의 일부는 끝이야.",
            difficulty: "medium"
        },
        {
            sentence: "The hardest choices require the strongest wills.",
            translation: "가장 어려운 선택은 가장 강력한 의지를 필요로 한다.",
            difficulty: "hard"
        },
        {
            sentence: "I'm going to tear you apart, from the inside out.",
            translation: "널 안에서부터 산산조각 내줄게.",
            difficulty: "hard"
        }
    ],
    'Spider-Man: Far From Home (2019)': [
        {
            sentence: "I'm just a kid from Queens.",
            translation: "난 그냥 퀸즈에서 온 애야.",
            difficulty: "easy"
        },
        {
            sentence: "I'm Spider-Man.",
            translation: "나는 스파이더맨이다.",
            difficulty: "easy"
        },
        {
            sentence: "If you're nothing without this suit, then you shouldn't have it.",
            translation: "이 슈트 없으면 아무것도 아니라면, 가지면 안 돼.",
            difficulty: "medium"
        },
        {
            sentence: "The world needs us to be better. We need to be better.",
            translation: "세상은 우리가 더 나아지길 원해. 우리는 더 나아져야 해.",
            difficulty: "medium"
        }
    ],
    'Black Widow (2021)': [
        {
            sentence: "I'm not a hero.",
            translation: "나는 영웅이 아니야.",
            difficulty: "easy"
        },
        {
            sentence: "I'm a survivor.",
            translation: "나는 생존자야.",
            difficulty: "easy"
        },
        {
            sentence: "We create our own demons.",
            translation: "우리는 우리만의 악마를 만들어낸다.",
            difficulty: "medium"
        }
    ],
    'Shang-Chi and the Legend of the Ten Rings (2021)': [
        {
            sentence: "I am Shang-Chi.",
            translation: "나는 샹치다.",
            difficulty: "easy"
        },
        {
            sentence: "The rings are more than just weapons. They are a legacy.",
            translation: "반지들은 그냥 무기가 아니야. 유산이지.",
            difficulty: "easy"
        },
        {
            sentence: "You have to be a hero, not just a man.",
            translation: "당신은 그냥 남자가 아니라, 영웅이 되어야 해.",
            difficulty: "medium"
        },
        {
            sentence: "The only thing standing in your way is you.",
            translation: "네 길을 막는 유일한 것은 너 자신뿐이야.",
            difficulty: "medium"
        }
    ],
    'Eternals (2021)': [
        {
            sentence: "We are Eternals.",
            translation: "우리는 이터널스다.",
            difficulty: "easy"
        },
        {
            sentence: "We have to be better. We need to be better.",
            translation: "우리는 더 나아져야 해. 더 나아질 필요가 있어.",
            difficulty: "medium"
        }
    ],
    'Spider-Man: No Way Home (2021)': [
        {
            sentence: "With great power comes great responsibility.",
            translation: "큰 힘에는 큰 책임이 따른다.",
            difficulty: "easy"
        },
        {
            sentence: "I'm just a kid from Queens.",
            translation: "난 그냥 퀸즈에서 온 애야.",
            difficulty: "easy"
        },
        {
            sentence: "I'm Spider-Man.",
            translation: "나는 스파이더맨이다.",
            difficulty: "easy"
        },
        {
            sentence: "If you're nothing without this suit, then you shouldn't have it.",
            translation: "이 슈트 없으면 아무것도 아니라면, 가지면 안 돼.",
            difficulty: "medium"
        },
        {
            sentence: "I don't have to be a hero. I just have to be a man.",
            translation: "나는 영웅이 될 필요 없어. 그냥 남자면 돼.",
            difficulty: "medium"
        }
    ],
    'Doctor Strange in the Multiverse of Madness (2022)': [
        {
            sentence: "I love you in every universe.",
            translation: "모든 우주에서 널 사랑해.",
            difficulty: "easy"
        },
        {
            sentence: "The Sanctum Sanctorum is a place of power, a place of magic.",
            translation: "생텀 생토럼은 힘의 장소이자, 마법의 장소야.",
            difficulty: "medium"
        },
        {
            sentence: "You're a man who has everything, and nothing.",
            translation: "당신은 모든 것을 가졌지만, 아무것도 갖지 못한 남자야.",
            difficulty: "medium"
        },
        {
            sentence: "I have seen the future, and it is full of destruction. The nine realms will fall.",
            translation: "나는 미래를 봤고, 그곳은 파괴로 가득 차 있어. 아홉 왕국이 무너질 거야.",
            difficulty: "hard"
        }
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
