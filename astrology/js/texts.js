/*
 * Тексты толкований. Пишем на “вы” (без рода), бережно и без фатализма.
 * Алика может править любой текст здесь — структура подписана.
 */
(function (root) {
  'use strict';
  const VS = '︎'; // текстовое (не эмодзи) начертание символов

  const signs = {
    aries: {
      name: 'Aries', gen: 'Aries', loc: 'in Aries', glyph: '♈' + VS, dates: 'March 21 – April 19',
      keys: 'initiative, courage, beginnings, directness',
      trait: 'boldly, directly and with a spark',
      about: 'The first sign of the zodiac — the pure energy of beginnings. Aries teaches you to act, take risks and not wait for perfect conditions.',
      sun: 'The Sun in Aries gives a pioneer’s nature. You come alive when there’s a goal and a challenge; you catch fire with ideas quickly and can start from scratch where others still hesitate. Your strength is honesty, courage and a readiness to act. Your growing edge is patience: the boldest projects win when they’re given time to mature. You flourish wherever you can go first and lead the way.',
      moon: 'The Moon in Aries — emotions flare up fast and fade just as fast. You need to feel free and entitled to your own decisions; the best way to calm down is movement, sport, action. You don’t hold grudges — you say things straight. Go easy on yourself: your tiredness often disguises itself as irritation.',
      asc: 'An Aries Ascendant gives an energetic, decisive presence. People see you as someone who gets things done: quick reactions, a lively gaze, a readiness to take the initiative. You meet life head-on, and the first impression you make is courage. Learn to pause before you answer now and then — it will only add to your strength.',
      mercury: 'Your thinking is fast and direct: you grasp the essence, speak to the point and dislike long preambles. You heat up in arguments — the rule “breathe out first, then answer” helps.',
      venus: 'In love you value passion, sincerity and the thrill of the chase. You’re drawn to bold people and big gestures; boredom is more dangerous to your feelings than a fight. Learn to give relationships time to deepen.',
      mars: 'Mars in Aries is in its element: lots of energy, decisiveness and sporting spirit. You act fast and directly and start things easily. The key is to channel that fire into goals rather than conflicts — and to finish what you begin.',
      jupiter: 'Luck arrives through courage and initiative: you grow when you start your own thing and take sensible risks.',
      saturn: 'The lesson is patience and responsibility for your impulses — building independence that lasts.',
      node: 'The path of growth is learning independence, courage and the right to be yourself, even if not everyone likes it.',
    },
    taurus: {
      name: 'Taurus', gen: 'Taurus', loc: 'in Taurus', glyph: '♉' + VS, dates: 'April 20 – May 20',
      keys: 'stability, values, sensuality, patience',
      trait: 'calmly, thoroughly and sensually',
      about: 'A sign of earth and beauty. Taurus teaches you to value the present, create comfort and build things that last.',
      sun: 'The Sun in Taurus makes you someone others lean on. You know how to build what lasts — relationships, finances, a home — and you don’t abandon things halfway. Beauty, taste, physical comfort and the honest value of things matter to you. Your strength is patience and loyalty; your growing edge is flexibility: change isn’t always a threat — sometimes it’s a chance at something even better.',
      moon: 'The Moon in Taurus is exalted: emotionally you’re steady and calm. You need stability, coziness, good food and tangible care. You take a while to get used to new things, but your attachments are deep and dependable. Nature and beauty are your best ways to recharge.',
      asc: 'A Taurus Ascendant gives a calm, gentle and magnetic presence. You come across as someone reliable with good taste. In new situations you don’t rush — first you take it all in, then you act with confidence.',
      mercury: 'You think thoroughly: more slowly, but more completely. Practical use matters to you. Once you’ve formed an opinion, it’s hard to change your mind — sometimes that’s a strength, and sometimes it’s worth listening.',
      venus: 'Venus in its own sign: you love with your body and your actions. You value loyalty, care, gifts and the beauty of everyday life. In relationships you’re dependable and sensual; just don’t confuse stability with possessiveness.',
      mars: 'Your energy builds gradually, but it lasts a long time. You’re hard to move, but once you’ve decided, you’ll get there. Anger builds slowly — it’s important not to hold it in until it explodes.',
      jupiter: 'Growth through resources, finances and the ability to enjoy life; abundance comes to the patient.',
      saturn: 'The lesson is building a healthy relationship with money and self-worth, without relying on the material alone.',
      node: 'The path of growth is finding an inner anchor, valuing simple things and building your own life slowly and surely.',
    },
    gemini: {
      name: 'Gemini', gen: 'Gemini', loc: 'in Gemini', glyph: '♊' + VS, dates: 'May 21 – June 20',
      keys: 'curiosity, communication, lightness, versatility',
      trait: 'lightly, curiously and in many ways at once',
      about: 'A sign of air and connection. Gemini teaches you to ask questions, communicate and see the world from different sides.',
      sun: 'The Sun in Gemini gives a lively mind and endless curiosity. You’re a connector: you bring together people, ideas and information. You learn easily, adapt quickly and can explain complicated things in simple words. Your strength is flexibility and sociability; your growing edge is depth: when you choose one direction and take it all the way to mastery, your real talent opens up.',
      moon: 'The Moon in Gemini — feelings move through words. You need to talk your emotions through, text, share news. Your moods change quickly, and boredom is the main enemy. A conversation, a book or a new experience calms you.',
      asc: 'A Gemini Ascendant gives a quick, youthful and sociable presence. You start conversations easily, get your bearings fast and often look younger than your age. People are drawn to your lightness and sense of humor.',
      mercury: 'Mercury in its own sign: a sharp, fast, multitasking mind. You speak and write beautifully and pick up languages and skills with ease. Just don’t scatter yourself — take your thoughts all the way to a conclusion.',
      venus: 'In love you need someone to talk to: flirting, texting, shared interests. You fall for a mind and a sense of humor. Freedom and variety matter — routine dims your feelings faster than any argument.',
      mars: 'Your energy goes into words and ideas: you’re great at debating and persuading and can juggle several things at once. Look after your nervous system and don’t spend your strength on trivia.',
      jupiter: 'Growth through learning, communication, writing and networks; luck lies in information and connections.',
      saturn: 'The lesson is discipline of thought: depth instead of surface, responsibility for your words.',
      node: 'The path of growth is learning to listen, ask questions and stay open to different views.',
    },
    cancer: {
      name: 'Cancer', gen: 'Cancer', loc: 'in Cancer', glyph: '♋' + VS, dates: 'June 21 – July 22',
      keys: 'care, sensitivity, home, memory',
      trait: 'gently, sensitively and with care',
      about: 'A sign of water and home. Cancer teaches you to care, to feel and to create a safe space.',
      sun: 'The Sun in Cancer gives deep sensitivity and a gift for caring. You create warmth and a “sense of home” around you, read people’s moods finely and remember what matters. Your strength is empathy, loyalty and intuition; your growing edge is protecting yourself without retreating into your shell — and caring for yourself as well as you care for others.',
      moon: 'The Moon in its own sign: deep, strong emotions, with intuition as your compass. Home, loved ones and a feeling of safety are vital to you. You sense others beautifully; be gentle with your own mood swings and try not to hold on to hurt.',
      asc: 'A Cancer Ascendant gives a soft, warm and caring presence. People want to share their secrets with you. You’re cautious in new places, but once you’ve settled in, you become the heart of the group.',
      mercury: 'Your thinking is visual, grounded in feelings and memory. You remember details, moods and tones of voice. Decisions are best made once emotions have settled.',
      venus: 'In love, care, tenderness and a feeling of “we’re family” matter to you. You’re devoted and attentive to little things. Learn to name your needs directly rather than hoping they’ll be guessed.',
      mars: 'Mars in fall: your energy depends on your emotions. You’re strongest when protecting the people you love. It’s important not to bottle up tension and to voice your displeasure in time, rather than in roundabout ways.',
      jupiter: 'Jupiter exalted: luck through family, home and caring; generosity of spirit comes back a hundredfold.',
      saturn: 'The lesson is emotional maturity: learning to support yourself and not to fear closeness.',
      node: 'The path of growth is opening up to feelings, family and care — letting yourself be vulnerable.',
    },
    leo: {
      name: 'Leo', gen: 'Leo', loc: 'in Leo', glyph: '♌' + VS, dates: 'July 23 – August 22',
      keys: 'creativity, generosity, radiance, heart',
      trait: 'vividly, generously and from the heart',
      about: 'A sign of fire and heart. Leo teaches you to show yourself, create and give warmth.',
      sun: 'The Sun in its own sign: you were made to shine. You have plenty of warmth, generosity and creative power; you know how to inspire and celebrate life. You need your contribution to be noticed and valued — that’s not vanity, it’s a need of the heart. Your strength is nobility and charisma; your growing edge is sharing the stage and not depending on applause.',
      moon: 'The Moon in Leo — a generous, warm heart. You need to feel loved and special; attention and recognition literally recharge you. You know how to throw a celebration and lift others up. Try not to take it personally when love is shown “less brightly”.',
      asc: 'A Leo Ascendant gives a vivid, regal presence: posture, smile, visibility. You draw eyes and inspire. It matters that the outer glow is backed by inner confidence.',
      mercury: 'You speak vividly, confidently and with soul — natural storytellers and speakers. You defend your views passionately; sometimes it helps to ask yourself where the pride ends and the truth begins.',
      venus: 'In love you’re romantic, generous and devoted. You love beautiful gestures, admiration and celebration. You need a partner you can be proud of — and who is proud of you.',
      mars: 'Your energy is powerful and creative: you act on a grand scale and with dignity. You inspire a team by example. Try not to take criticism of your work as a blow to yourself.',
      jupiter: 'Growth through creativity, children and self-expression; luck loves your generosity and your courage to shine.',
      saturn: 'The lesson is finding confidence within rather than in approval; the responsibility of a leader.',
      node: 'The path of growth is the courage to be seen, to create and to take your place at the center.',
    },
    virgo: {
      name: 'Virgo', gen: 'Virgo', loc: 'in Virgo', glyph: '♍' + VS, dates: 'August 23 – September 22',
      keys: 'order, usefulness, analysis, service',
      trait: 'attentively, practically and carefully',
      about: 'A sign of earth and craft. Virgo teaches you to see details, improve and be of use.',
      sun: 'The Sun in Virgo gives a sharp, analytical mind and skilled hands. You notice details others miss and know how to bring order and make something useful. Your strength is responsibility, craftsmanship and a wish to help. Your growing edge is easing the demands you place on yourself: you’re good enough already — not after one more improvement.',
      moon: 'The Moon in Virgo — emotional calm comes through order and useful work. You show love through practical care. Your anxiety often turns into control and self-criticism — routine, your body and gentleness toward yourself help.',
      asc: 'A Virgo Ascendant gives a neat, reserved and thoughtful presence. You come across as someone people can rely on. You observe first, then act — precisely and to the point.',
      mercury: 'Mercury in domicile and exaltation: a precise, logical mind with an eye for facts. You’re excellent at analyzing, editing and organizing. Just don’t drown in details — keep the whole picture in view.',
      venus: 'Venus in fall: you express love through care and actions rather than grand words. Reliability and attention to small things matter to you. Learn to accept yourself and your partner as imperfect.',
      mars: 'Your energy is methodical and effective: you work systematically and polish things to perfection. Don’t drive yourself with perfectionism — and rest on time.',
      jupiter: 'Growth through work, craft, health and service; luck lies in details and usefulness.',
      saturn: 'The lesson is a healthy routine and work without self-punishment; responsibility without perfectionism.',
      node: 'The path of growth is order, concreteness, care for the body and useful service.',
    },
    libra: {
      name: 'Libra', gen: 'Libra', loc: 'in Libra', glyph: '♎' + VS, dates: 'September 23 – October 22',
      keys: 'harmony, partnership, beauty, fairness',
      trait: 'harmoniously, diplomatically and with taste',
      about: 'A sign of air and partnership. Libra teaches you to see the other person, seek balance and create beauty.',
      sun: 'The Sun in Libra gives a fine sense of harmony, fairness and beauty. You’re a natural diplomat: you can hear both sides and find solutions where everyone wins. Relationships are your path of growth. Your strength is tact, taste and charm; your growing edge is decisiveness — the right to choose yourself, even if someone is unhappy about it.',
      moon: 'The Moon in Libra — emotional calm comes from harmony in your relationships. Arguments and rudeness knock you off balance. You’re sensitive to atmosphere and beauty. Learn to notice your own feelings, not just your partner’s mood.',
      asc: 'A Libra Ascendant gives a graceful, pleasant and charming presence. You put people at ease and always seem to strike the right note. People see taste and softness in you.',
      mercury: 'Your thinking is balanced: you see different points of view and can negotiate. Decisions can be hard — deadlines and clear criteria help.',
      venus: 'Venus in its own sign: you’re romantic, tender and attentive to your partner. Relationships are your talent. Don’t lose yourself for the sake of peace — and know how to say “no”.',
      mars: 'Mars in detriment: you act through partnership and diplomacy. You avoid conflict, but when fairness is at stake, you fight. Learn to voice disagreement directly and in time.',
      jupiter: 'Growth through partnership, art and justice; luck arrives together with other people.',
      saturn: 'Saturn exalted: the lesson is mature, responsible relationships and honest agreements.',
      node: 'The path of growth is learning partnership, compromise and the ability to truly see the other person.',
    },
    scorpio: {
      name: 'Scorpio', gen: 'Scorpio', loc: 'in Scorpio', glyph: '♏' + VS, dates: 'October 23 – November 21',
      keys: 'depth, passion, transformation, power',
      trait: 'deeply, passionately and all in',
      about: 'A sign of water and transformation. Scorpio teaches you to live through strong feelings and be reborn.',
      sun: 'The Sun in Scorpio gives depth, willpower and insight. You see right through people, you’re not afraid of difficult subjects, and you know how to rise again after a crisis. You have plenty of passion and devotion. Your strength is the courage to get to the heart of things and to turn pain into wisdom; your growing edge is trust — and loosening your grip on control.',
      moon: 'The Moon in fall: strong, deep feelings, sometimes hidden even from yourself. You trust few people, but with your whole heart. It’s important to feel your emotions rather than hide them, and to let yourself be vulnerable with those who’ve earned it.',
      asc: 'A Scorpio Ascendant gives a magnetic, mysterious presence and a piercing gaze. People sense your strength. You don’t open up straight away — and that draws people in.',
      mercury: 'An investigator’s mind: you dig down to the essence and sense subtext and hidden motives. You’d make an excellent analyst or psychologist. Your words can be sharp — use that power with care.',
      venus: 'Venus in detriment: love is all or nothing. You’re passionate, devoted and deep. It’s important not to confuse closeness with control — and to trust rather than test.',
      mars: 'Mars in its own sign: enormous inner strength, stamina and determination. You don’t give up. Try not to hold grudges, and direct your strength into building something.',
      jupiter: 'Growth through crises, psychology, shared resources and research; luck lies in depth.',
      saturn: 'The lesson is trust and honesty in intimacy, and working with fear and control.',
      node: 'The path of growth is the courage to make deep changes and to let go of familiar comfort for the sake of growth.',
    },
    sagittarius: {
      name: 'Sagittarius', gen: 'Sagittarius', loc: 'in Sagittarius', glyph: '♐' + VS, dates: 'November 22 – December 21',
      keys: 'freedom, meaning, travel, optimism',
      trait: 'with inspiration, breadth and faith',
      about: 'A sign of fire and meaning. Sagittarius teaches you to believe, seek the truth and widen your horizons.',
      sun: 'The Sun in Sagittarius gives optimism, broad horizons and a thirst for meaning. You love to travel — through the world and through ideas — and you inspire others with your faith in the best. Freedom is your oxygen. Your strength is generosity, honesty and the ability to see the big picture; your growing edge is attention to detail and keeping your promises.',
      moon: 'The Moon in Sagittarius — bright, restless emotions. You need space, new experiences, travel and philosophical conversations. Routine weighs on you. You forgive quickly and know how to lift someone up with a joke.',
      asc: 'A Sagittarius Ascendant gives an open, cheerful and free-spirited presence. You radiate optimism and connect easily with people from different cultures. People see you as someone who inspires.',
      mercury: 'Mercury in detriment: you think broadly, see meaning and perspective, and teach and inspire beautifully. Sometimes details slip through — double-check facts and wording.',
      venus: 'In love you need freedom, adventure and shared ideals. You’re sincere and generous. A partner is also a fellow traveler on the journey of life.',
      mars: 'Your energy comes in bursts of inspiration: you catch fire with big goals and ideas. The key is not to scatter yourself and to turn enthusiasm into a plan.',
      jupiter: 'Jupiter in its own sign: generous luck through study, travel, teaching and faith in the best.',
      saturn: 'The lesson is forming your own mature worldview and standing by your beliefs.',
      node: 'The path of growth is seeking meaning, learning and teaching, trusting life and big goals.',
    },
    capricorn: {
      name: 'Capricorn', gen: 'Capricorn', loc: 'in Capricorn', glyph: '♑' + VS, dates: 'December 22 – January 19',
      keys: 'purpose, responsibility, structure, mastery',
      trait: 'seriously, responsibly and with determination',
      about: 'A sign of earth and summits. Capricorn teaches you to set goals, build, and take responsibility for the result.',
      sun: 'The Sun in Capricorn gives determination, endurance and strategic thinking. You know how to set long-term goals and move toward them step by step. With the years you only grow stronger and freer. Your strength is reliability, discipline and a sense of responsibility; your growing edge is allowing yourself rest, joy and warm feelings without having to “earn” them.',
      moon: 'The Moon in detriment: your feelings are reserved; you’re used to being strong and coping alone. Emotional safety comes from control and order. It’s important to let yourself ask for support and admit when you’re tired.',
      asc: 'A Capricorn Ascendant gives a composed, serious and authoritative presence. You look dependable and command respect. With age, your appearance often seems to grow younger.',
      mercury: 'A practical, structured, strategic mind. You think one step ahead and like specifics. Sometimes it helps to let yourself dream without an immediate reality check.',
      venus: 'In love you’re serious, loyal and dependable. You show your feelings through actions and by caring about the future. Let lightness and tenderness into your relationships.',
      mars: 'Mars exalted: disciplined energy — you can work toward a goal long and hard. You’re a superb organizer. Just don’t confuse your worth with your achievements.',
      jupiter: 'Jupiter in fall: growth through discipline, career and patience; luck is earned.',
      saturn: 'Saturn in its own sign: you’re a born builder. The lesson is carrying responsibility without being harsh with yourself.',
      node: 'The path of growth is responsibility, goals, professionalism and grown-up decisions.',
    },
    aquarius: {
      name: 'Aquarius', gen: 'Aquarius', loc: 'in Aquarius', glyph: '♒' + VS, dates: 'January 20 – February 18',
      keys: 'freedom, the future, friendship, originality',
      trait: 'originally, freely and in a spirit of friendship',
      about: 'A sign of air and the future. Aquarius teaches you to be yourself, to be a friend and to change the world for the better.',
      sun: 'The Sun in Aquarius gives original thinking and a love of freedom. You see the future before others do, and you value friendship, equality and ideas that make the world better. Your strength is independence, inventiveness and the ability to bring people together; your growing edge is closeness: letting others come nearer without losing yourself.',
      moon: 'The Moon in Aquarius — you make sense of your feelings by thinking them through. You need freedom, personal space and friendship even in love. A community of like-minded people and new things help. When it hurts, try not to “retreat into your head” — let yourself feel your emotions.',
      asc: 'An Aquarius Ascendant gives an unusual, friendly and slightly mysterious presence. You stand out — in style, thinking and freedom. People see you as interesting and independent.',
      mercury: 'An inventive, unconventional mind: you think in ideas from the future and generate solutions easily. Sometimes it’s hard to explain your train of thought — be patient with those who can’t keep up.',
      venus: 'In love, friendship, freedom and respect for individuality matter. You’re drawn to unusual people. A relationship is a union of two free individuals.',
      mars: 'Your energy goes into ideas and shared causes: you fight for fairness and progress. You act unexpectedly. The key is to combine freedom with follow-through.',
      jupiter: 'Growth through communities, technology, friendship and social projects.',
      saturn: 'The lesson is combining freedom with responsibility, finding “your people” and your place in a group.',
      node: 'The path of growth is friendship, community, service to a shared cause and the courage to be unusual.',
    },
    pisces: {
      name: 'Pisces', gen: 'Pisces', loc: 'in Pisces', glyph: '♓' + VS, dates: 'February 19 – March 20',
      keys: 'intuition, compassion, dreams, inspiration',
      trait: 'sensitively, dreamily and with compassion',
      about: 'A sign of water and oneness. Pisces teaches you to feel, trust, show compassion and create.',
      sun: 'The Sun in Pisces gives fine intuition, a rich imagination and an enormous heart. You feel what can’t be put into words — and you know how to turn it into art, help and inspiration. Your strength is compassion, flexibility and a connection with the subtle world; your growing edge is boundaries: protecting your energy and telling your feelings apart from other people’s.',
      moon: 'The Moon in Pisces — a soul like a sponge: you absorb the moods around you. You need quiet, music, water, creativity and time alone. It’s important to recharge and not dissolve into other people’s problems.',
      asc: 'A Pisces Ascendant gives a soft, dreamy presence and “deep” eyes. You seem understanding and open, and people trust you easily. Guard your boundaries from the very first meeting.',
      mercury: 'Mercury in detriment and fall: visual, intuitive, creative thinking. You understand without words and sense the subtext. For important matters, notes and checklists help.',
      venus: 'Venus exalted: unconditional, romantic, selfless love. You know how to love deeply. Try not to idealize your partner — and don’t forget about yourself.',
      mars: 'Your energy comes in waves and depends on inspiration. You’re strong when you act for others or for a dream. Rest — and don’t avoid the conflicts that need resolving.',
      jupiter: 'Jupiter in its own sign: luck through faith, compassion, creativity and spirituality.',
      saturn: 'The lesson is grounding and boundaries in the world of feelings; learning to give your dreams structure.',
      node: 'The path of growth is trust, inspiration, compassion and connection with the subtle world.',
    },
  };

  const planets = {
    sun: { name: 'Sun', gen: 'the Sun', dat: 'the Sun', ins: 'the Sun', glyph: '☉' + VS, color: '#e0a64b',
      keys: 'essence, will, vitality, self-expression',
      about: 'The Sun is the center of the chart: your essence, your will, what you live for and how you shine in the world.',
      tplHouse: 'The area of “{topic}” — the place where you shine brightest: this is where you need to express yourself, be recognized and feel a sense of meaning.',
      syn: 'essence and life purpose' },
    moon: { name: 'Moon', gen: 'the Moon', dat: 'the Moon', ins: 'the Moon', glyph: '☽' + VS, color: '#8ea7d8',
      keys: 'emotions, needs, home, safety',
      about: 'The Moon is your inner world: emotions, habits, the need for safety, and how you give and receive care.',
      tplHouse: 'The area of “{topic}” is closely tied to your feelings: this is where you look for safety and comfort, and where your moods swing the most.',
      syn: 'feelings and emotional needs' },
    mercury: { name: 'Mercury', gen: 'Mercury', dat: 'Mercury', ins: 'Mercury', glyph: '☿' + VS, color: '#7fb9a9',
      keys: 'thinking, speech, learning, connections',
      about: 'Mercury shows how you think, learn, speak and process information.',
      tplHouse: 'Your mind and curiosity are drawn to “{topic}”: lots of conversations, plans, learning and useful connections happen here.',
      syn: 'thinking and communication style' },
    venus: { name: 'Venus', gen: 'Venus', dat: 'Venus', ins: 'Venus', glyph: '♀' + VS, color: '#e58fb0',
      keys: 'love, beauty, values, money',
      about: 'Venus is love, taste, pleasure and values: how you love, what you find beautiful and how you attract money.',
      tplHouse: 'In the area of “{topic}” pleasure, affection and money come to you more easily; here you show your taste and your talent for agreement.',
      syn: 'tenderness, affection and taste' },
    mars: { name: 'Mars', gen: 'Mars', dat: 'Mars', ins: 'Mars', glyph: '♂' + VS, color: '#e0705b',
      keys: 'energy, action, desire, courage',
      about: 'Mars is energy and action: how you get what you want, defend yourself, and express passion and anger.',
      tplHouse: 'The area of “{topic}” — your field of action: plenty of energy and initiative here — but also a risk of haste and conflict.',
      syn: 'passion, energy and initiative' },
    jupiter: { name: 'Jupiter', gen: 'Jupiter', dat: 'Jupiter', ins: 'Jupiter', glyph: '♃' + VS, color: '#c9a25e',
      keys: 'growth, luck, faith, generosity',
      about: 'Jupiter is the planet of growth and luck: where you expand, what you believe in and where life smiles on you.',
      tplHouse: 'The area of “{topic}” — your zone of luck and growth: people, circumstances and your own optimism help you here. Just don’t overdo it.',
      syn: 'generosity, faith and support for growth' },
    saturn: { name: 'Saturn', gen: 'Saturn', dat: 'Saturn', ins: 'Saturn', glyph: '♄' + VS, color: '#8a7d6b',
      keys: 'structure, responsibility, time, maturity',
      about: 'Saturn is the teacher: responsibility, boundaries, discipline. Where Saturn is, results don’t come right away — but they last.',
      tplHouse: 'The area of “{topic}” asks for maturity: results don’t come right away here, but what you build will be solid.',
      syn: 'responsibility and serious intentions' },
    uranus: { name: 'Uranus', gen: 'Uranus', dat: 'Uranus', ins: 'Uranus', glyph: '♅' + VS, color: '#5fb3d6',
      keys: 'freedom, change, originality, insight',
      about: 'Uranus is freedom and change: where you rebel, invent and can’t stand being boxed in.',
      tplHouse: 'In the area of “{topic}” you need freedom and change: sudden turns and original solutions are possible here.',
      syn: 'freedom, novelty and unpredictability' },
    neptune: { name: 'Neptune', gen: 'Neptune', dat: 'Neptune', ins: 'Neptune', glyph: '♆' + VS, color: '#7f8fe0',
      keys: 'dreams, intuition, inspiration, illusions',
      about: 'Neptune is dreams, inspiration, intuition and spirituality — and, along with them, fog and illusion.',
      tplHouse: 'The area of “{topic}” is wrapped in inspiration and idealism: plenty of intuition and creativity here, but it’s important to check your dreams against reality.',
      syn: 'romance, dreams and idealization' },
    pluto: { name: 'Pluto', gen: 'Pluto', dat: 'Pluto', ins: 'Pluto', glyph: '♇' + VS, color: '#9b5f8f',
      keys: 'transformation, power, depth, rebirth',
      about: 'Pluto is deep power and transformation: where you go through crises and come back stronger.',
      tplHouse: 'The area of “{topic}” is linked with deep transformation: this is where you go through crises and come out stronger.',
      syn: 'depth, passion and transformation' },
    node: { name: 'North Node', short: 'Node', gen: 'the North Node', dat: 'the North Node', ins: 'the North Node', glyph: '☊' + VS, color: '#b49ad8',
      keys: 'path of growth, purpose, development',
      about: 'The North (lunar) Node shows the direction of your soul’s growth — where it’s worth growing, even if it feels unfamiliar.',
      tplHouse: 'The North Node in the area of “{topic}” points the way forward: this is exactly where it’s worth trying new things and growing.',
      syn: 'a fated quality and a shared path' },
    lilith: { name: 'Black Moon', short: 'Lilith', gen: 'the Black Moon', dat: 'the Black Moon', ins: 'the Black Moon', glyph: '⚸' + VS, color: '#6b5a8e',
      keys: 'shadow, temptation, hidden desires',
      about: 'The Black Moon (Lilith) is the shadow side: temptations, suppressed desires and the places where honesty with yourself is needed.',
      tplHouse: 'The Black Moon in the area of “{topic}” shows temptations and shadow desires: honesty with yourself here turns weakness into strength.',
      syn: 'temptation and shadow' },
    chiron: { name: 'Chiron', gen: 'Chiron', dat: 'Chiron', ins: 'Chiron', glyph: '⚷' + VS, color: '#a08a6e',
      keys: 'wound, healing, wisdom, mentoring',
      about: 'Chiron is the “wounded healer”: a place of emotional vulnerability that, once lived through, becomes a gift for helping others.',
      tplHouse: 'Chiron in the area of “{topic}” — is a place of tenderness and, at the same time, a gift: by working through your own pain here, you’ll be able to help others.',
      syn: 'healing old wounds' },
    asc: { name: 'Ascendant', short: 'ASC', gen: 'the Ascendant', dat: 'the Ascendant', ins: 'the Ascendant', glyph: 'AC', color: '#6f58c9',
      keys: 'image, appearance, approach to life',
      about: 'The Ascendant is your rising sign: your “front door”, the first impression you make, the way you enter new situations, and your style of living.',
      syn: 'outward image and first impression' },
    mc: { name: 'Midheaven', short: 'MC', gen: 'the Midheaven', dat: 'the Midheaven', ins: 'the Midheaven', glyph: 'MC', color: '#6f58c9',
      keys: 'vocation, career, status, goals',
      about: 'MC (Midheaven) — the top of the chart: vocation, career, reputation and life goals.',
      syn: 'goals and social status' },
    fortune: { name: 'Part of Fortune', short: 'Fortune', gen: 'the Part of Fortune', dat: 'the Part of Fortune', ins: 'the Part of Fortune', glyph: '⊗', color: '#c8a46a',
      keys: 'joy, luck, ease',
      about: 'The Part of Fortune is the point where joy and luck come to you most easily.',
      tplHouse: 'The Part of Fortune in the area of “{topic}”: this is where joy and luck come to you most easily.' },
  };

  // шаблоны “планета в знаке” для высших планет и точек (поколенческие)
  const genTpl = {
    uranus: 'Uranus {loc} — a generational trait: the drive for freedom and change shows up {trait}. In a personal chart, what matters more is the house it occupies and the aspects it makes.',
    neptune: 'Neptune {loc} — a generation’s dreams and ideals: inspiration and intuition take on the sign’s qualities — {trait}. For you personally, its house and aspects matter more.',
    pluto: 'Pluto {loc} — a generation’s deep transformations: themes of power and rebirth play out {trait}. Its personal meaning unfolds through its house and aspects.',
    chiron: 'Chiron {loc}: vulnerability and the path of healing are tied to the sign’s themes ({keys}). As you accept this part of yourself, you gain wisdom you can share.',
    lilith: 'Black Moon {loc}: temptations and shadow desires show up {trait}. The key is not to suppress them but to become aware of them — then the shadow turns into strength.',
    fortune: 'Part of Fortune {loc}: joy and luck come when you act {trait}.',
  };

  const houses = {
    1: { name: '1st house', title: 'Self', topic: 'self and appearance', about: 'How you come across: your image, body, energy and approach to life.' },
    2: { name: '2nd house', title: 'Money and values', topic: 'money and resources', about: 'Finances, talents, self-worth, what you value and what you own.' },
    3: { name: '3rd house', title: 'Communication', topic: 'communication and learning', about: 'Thinking, study, siblings, neighbors, short trips, writing.' },
    4: { name: '4th house', title: 'Home and roots', topic: 'home, family and roots', about: 'Parents, ancestry, home, property, your inner foundation.' },
    5: { name: '5th house', title: 'Love and creativity', topic: 'love, creativity and children', about: 'Romance, hobbies, children, joy, self-expression, play.' },
    6: { name: '6th house', title: 'Work and health', topic: 'work, health and daily life', about: 'Daily work, routine, health, service, colleagues, pets.' },
    7: { name: '7th house', title: 'Partnership', topic: 'partnership and marriage', about: 'Marriage, business partners, contracts, open rivals — every kind of “we”.' },
    8: { name: '8th house', title: 'Transformation', topic: 'crises, intimacy and shared resources', about: 'Crisis and rebirth, sexuality, shared money, loans, inheritance.' },
    9: { name: '9th house', title: 'Meaning and horizons', topic: 'travel, worldview and higher education', about: 'Long journeys, philosophy, faith, study, life abroad, mentors.' },
    10: { name: '10th house', title: 'Career', topic: 'career and vocation', about: 'Profession, status, reputation, achievements, life goals.' },
    11: { name: '11th house', title: 'Friends and dreams', topic: 'friends, communities and dreams', about: 'Friends, like-minded people, social networks, plans for the future.' },
    12: { name: '12th house', title: 'Inner world', topic: 'inner world and solitude', about: 'The subconscious, solitude, spirituality, what’s hidden, restoring your strength.' },
  };

  const aspects = {
    conj: { name: 'Conjunction', glyph: '☌' + VS, phrase: 'conjunct', caseKey: 'ins', color: '#c8a46a', about: 'The planets’ energies merge and amplify each other — the theme becomes vivid and noticeable.' },
    opp: { name: 'Opposition', glyph: '☍' + VS, phrase: 'opposite', caseKey: 'dat', color: '#d9506a', about: 'Two forces facing each other: the task is to find balance rather than pick a side. It often plays out through relationships with others.' },
    trine: { name: 'Trine', glyph: '△', phrase: 'trine', caseKey: 'dat', color: '#4f8fd8', about: 'Harmony and ease: talents that come naturally. The key is not to take them for granted, but to develop them.' },
    square: { name: 'Square', glyph: '□', phrase: 'square', caseKey: 'dat', color: '#e0607e', about: 'Tension and challenge: an inner conflict that pushes you to act and grow. A source of strength, if you work with it.' },
    sextile: { name: 'Sextile', glyph: '⚹' + VS, phrase: 'sextile', caseKey: 'dat', color: '#3fa79a', about: 'Opportunity: a favorable link that opens up when you put in some effort.' },
    quincunx: { name: 'Quincunx', glyph: '⚻' + VS, phrase: 'quincunx', caseKey: 'dat', color: '#9a7fd1', about: 'Awkwardness and a need to adjust: two themes don’t understand each other well; flexibility and course corrections are needed.' },
    semisextile: { name: 'Semi-sextile', glyph: '⚺' + VS, phrase: 'semi-sextile', caseKey: 'dat', color: '#7cc0b2', about: 'A light link between neighboring signs: small opportunities for growth.' },
    semisquare: { name: 'Semi-square', glyph: '∠', phrase: 'semi-square', caseKey: 'dat', color: '#e89aae', about: 'Minor friction and irritation that nudges you toward change.' },
    sesquisquare: { name: 'Sesquiquadrate', glyph: '⚼' + VS, phrase: 'sesquiquadrate', caseKey: 'dat', color: '#e89aae', about: 'Hidden tension that calls for awareness and a change of course.' },
    quintile: { name: 'Quintile', glyph: 'Q', phrase: 'quintile', caseKey: 'dat', color: '#b39be6', about: 'A creative aspect: a special talent and originality.' },
  };

  // смысл аспекта для конкретной пары в натальной карте
  const natureText = {
    conj: 'These qualities are fused: {a} and {b} act as a single whole — vividly and noticeably.',
    soft: 'A harmonious link: {a} and {b} support each other — a natural resource you can lean on.',
    hard: 'A challenging link: {a} and {b} argue with each other. It’s an inner challenge that, over time, turns into strength and mastery.',
  };

  const dignity = { domicile: 'in domicile', exaltation: 'in exaltation', detriment: 'in detriment', fall: 'in fall' };
  const dignityAbout = {
    domicile: 'A planet “at home”: its qualities show up naturally and strongly.',
    exaltation: 'An honored planet: its best qualities shine especially brightly.',
    detriment: 'A planet “visiting”: it expresses itself in unfamiliar ways and calls for awareness — but it gives unusual experience.',
    fall: 'A planet under strain: its theme needs work, but this is exactly where great growth is possible.',
  };

  const elements = {
    fire: { name: 'Fire', adj: 'fire', signs: 'Aries, Leo, Sagittarius', color: '#f0a07a',
      high: 'Lots of Fire: you get inspired quickly, act boldly and charge others with enthusiasm. Be careful not to burn out — and see things through.',
      low: 'Little Fire: enthusiasm doesn’t always arrive on its own — clear goals, movement, sport and people who inspire you help.' },
    earth: { name: 'Earth', adj: 'earth', signs: 'Taurus, Virgo, Capricorn', color: '#9fc49a',
      high: 'Lots of Earth: practicality, reliability and the ability to turn ideas into results. Your growing edge is flexibility and trust in change.',
      low: 'Little Earth: ideas can be hard to bring to life — routine, plans, financial know-how and working with your hands help.' },
    air: { name: 'Air', adj: 'air', signs: 'Gemini, Libra, Aquarius', color: '#a9c3ee',
      high: 'Lots of Air: a lively mind, sociability, ideas and connections. Your growing edge is “grounding” your ideas and not escaping from feelings into reasoning.',
      low: 'Little Air: it can be hard to look at a situation from the outside — conversations, writing things down, learning and meeting new people help.' },
    water: { name: 'Water', adj: 'water', signs: 'Cancer, Scorpio, Pisces', color: '#9fb6e6',
      high: 'Lots of Water: deep sensitivity, empathy and intuition. It’s important to protect your boundaries and not dissolve into other people’s emotions.',
      low: 'Little Water: emotions can be hard to recognize and express — creativity, music and honest conversations about feelings help.' },
  };
  const modalities = {
    cardinal: { name: 'Cardinal modality', short: 'Cardinal', signs: 'Aries, Cancer, Libra, Capricorn', high: 'You’re an initiator: you know how to begin, launch and lead. The key is to finish what you start and delegate the routine.' },
    fixed: { name: 'Fixed modality', short: 'Fixed', signs: 'Taurus, Leo, Scorpio, Aquarius', high: 'You’re a keeper: persistence, loyalty, endurance. The key is not to get stuck — and to change when it’s time.' },
    mutable: { name: 'Mutable modality', short: 'Mutable', signs: 'Gemini, Virgo, Sagittarius, Pisces', high: 'You’re an adapter: flexibility, eagerness to learn, the ability to adjust. The key is to hold your focus and your footing.' },
  };

  const moonPhase8 = [
    { name: 'New Moon', icon: 0, birth: 'Those born at the New Moon are initiators with strong intuition: they act spontaneously, live in the here and now, and open up the new.' },
    { name: 'Crescent Moon', icon: 1, birth: 'The crescent: you push forward, overcoming the inertia of the past. Your strength is persistence and faith in the new.' },
    { name: 'First Quarter', icon: 2, birth: 'First quarter: a nature of action and resolve — you build, get through crises and test ideas for strength.' },
    { name: 'Waxing gibbous', icon: 3, birth: 'The waxing gibbous Moon: a drive toward perfection, analysis and growth; you need to understand “how to make it better”.' },
    { name: 'Full Moon', icon: 4, birth: 'Those born at the Full Moon are especially sensitive to relationships: they see everything through the lens of “me and the other”, looking for balance and clarity.' },
    { name: 'Waning gibbous', icon: 5, birth: 'The disseminating Moon: you pass on experience — a teacher and a storyteller; sharing what you’ve understood matters to you.' },
    { name: 'Last Quarter', icon: 6, birth: 'Last quarter: an inner reformer — you rethink the old and clear a path for new ideas.' },
    { name: 'Balsamic Moon', icon: 7, birth: 'The balsamic Moon: deep intuition, a sense of mission, a connection with the subtle; you complete cycles and prepare the future.' },
  ];

  const moonPhaseNow = [
    { name: 'New Moon', tip: 'A time for intentions: make wishes, plan, start gently. There’s little energy yet — save your strength.' },
    { name: 'Waxing crescent', tip: 'First steps: gather information, experiment, announce your plans.' },
    { name: 'First Quarter', tip: 'A time for action and decisions: push through obstacles and don’t give up at the first difficulty.' },
    { name: 'Waxing gibbous', tip: 'Polishing: refine, improve, get your results ready to “show”.' },
    { name: 'Full Moon', tip: 'Culmination: emotions peak and a lot comes to light. Take stock, and be gentle in disagreements.' },
    { name: 'Waning gibbous', tip: 'A time to share: give thanks, teach, give away what you don’t need.' },
    { name: 'Last Quarter', tip: 'Review: wrap things up, tidy up, let go of what’s unnecessary.' },
    { name: 'Balsamic Moon', tip: 'Rest and quiet before a new cycle: sleep, meditation, saying goodbye to the old.' },
  ];

  const lunarDays = [
    null,
    { sym: 'The Lamp', text: 'A day for intentions and plans. Make wishes and think through your goals for the lunar month.', good: 'planning, dreaming, starting gently', avoid: 'overload and conflict' },
    { sym: 'The Horn of Plenty', text: 'A day of resources and generosity. Good for finances, pleasant purchases and delicious, nourishing food.', good: 'finances, generosity, caring for your body', avoid: 'overeating and greed' },
    { sym: 'The Leopard', text: 'An active day: energy is high — a good time to take the initiative and defend your boundaries.', good: 'sport, decisive steps, standing up for what’s yours', avoid: 'passivity and laziness' },
    { sym: 'The Tree of Knowledge', text: 'A day of choices and knowledge. Learn, seek advice, weigh your decisions.', good: 'study, advice from elders, analysis', avoid: 'risky ventures' },
    { sym: 'The Unicorn', text: 'A day of transformation and movement. Pay attention to food, your body and travel.', good: 'travel, learning, healthy habits', avoid: 'neglecting your health' },
    { sym: 'The Crane', text: 'A day of breath and connection. Dream, walk in the fresh air, forgive old grudges.', good: 'walks, conversation, creative ideas', avoid: 'arguments and criticism' },
    { sym: 'The Wind Rose', text: 'A day of the power of words. Words carry extra weight today — say what you want to draw in.', good: 'negotiations, affirmations, honest conversations', avoid: 'lies, gossip, empty promises' },
    { sym: 'The Phoenix', text: 'A day of renewal and creativity. Good for clearing out the old and beginning a transformation.', good: 'renewal, creativity, cleansing', avoid: 'getting stuck in the past' },
    { sym: 'The Bat', text: 'A day of illusions and cleansing. Be careful with information and promises.', good: 'cleaning, clearing your space, fact-checking', avoid: 'important signatures and gullibility' },
    { sym: 'The Fountain', text: 'A day of family and tradition. Good for starting long-term projects and spending time with loved ones.', good: 'family, home, long-term projects', avoid: 'isolation and withdrawal' },
    { sym: 'The Crown', text: 'One of the most energetic days of the month. Put your strength into what matters.', good: 'important matters, leadership, sport', avoid: 'aggression and haste' },
    { sym: 'The Heart', text: 'A day of mercy and love. Help, give thanks, be kind.', good: 'helping, gratitude, tenderness', avoid: 'harshness and coldness' },
    { sym: 'Wheel', text: 'A day of learning and information. Review, organize, continue what you’ve started.', good: 'study, working with information', avoid: 'idleness' },
    { sym: 'The Trumpet', text: 'A day of calling. A good time to make yourself known, negotiate and begin important things.', good: 'career, presentations, negotiations', avoid: 'modesty when you need to step forward' },
    { sym: 'The Serpent', text: 'A day of temptation. Hold back emotions and impulses; don’t take the bait.', good: 'self-control, calm activities', avoid: 'impulsive decisions and arguments' },
    { sym: 'The Dove', text: 'A day of harmony and clear thoughts. Calm, moderation, peace.', good: 'quiet, creativity, making peace', avoid: 'arguments and excess' },
    { sym: 'The Bunch of Grapes', text: 'A day of joy and pleasure. Celebrations, get-togethers, love — in moderation.', good: 'celebrations, dates, rest', avoid: 'excess' },
    { sym: 'The Mirror', text: 'A day of self-knowledge: the people around you reflect you. Observe and draw conclusions.', good: 'self-reflection, observation', avoid: 'judging others' },
    { sym: 'The Spider', text: 'A day of caution. Check information and stay away from intrigue.', good: 'fact-checking, cleansing', avoid: 'intrigue and dubious offers' },
    { sym: 'The Eagle', text: 'A day of overcoming. Courage, victory over fears, spiritual growth.', good: 'brave steps, facing your fears', avoid: 'pride' },
    { sym: 'The Herd of Horses', text: 'A day of movement and shared ventures. Travel, sport, teamwork.', good: 'trips, sport, teamwork', avoid: 'inaction' },
    { sym: 'The Elephant', text: 'A day of wisdom and knowledge. Study, read, share your experience.', good: 'study, mentoring, books', avoid: 'superficiality' },
    { sym: 'The Crocodile', text: 'A day of decisiveness. Good for finishing things and protecting what’s yours.', good: 'wrapping things up, decisiveness', avoid: 'aggression and greed' },
    { sym: 'The Bear', text: 'A day of awakening strength. Physical activity, nature, building things.', good: 'sport, nature, constructive work', avoid: 'laziness and overindulgence' },
    { sym: 'The Turtle', text: 'A day to slow down. Contemplation, rest, intuition — don’t rush things.', good: 'rest, contemplation, intuition', avoid: 'fuss and hurry' },
    { sym: 'The Toad', text: 'A day of moderation. Be careful with words and spending; reflect on yourself.', good: 'quiet, self-reflection', avoid: 'boasting and unnecessary spending' },
    { sym: 'The Trident', text: 'A day of inspiration and intuition. Creativity, water, dreams, learning.', good: 'creativity, study, travel', avoid: 'idle fantasies' },
    { sym: 'The Lotus', text: 'A day of harmony and beauty. Meditation, nature, creativity, taking stock.', good: 'meditation, beauty, taking stock', avoid: 'fuss' },
    { sym: 'The Octopus', text: 'A day of cleansing and completion. Let go of what’s unnecessary and tidy up.', good: 'cleaning, letting go, wrapping up', avoid: 'new beginnings' },
    { sym: 'The Golden Swan', text: 'A day that completes the cycle (it doesn’t happen every month). Gratitude, forgiveness, taking stock.', good: 'gratitude, forgiveness, taking stock', avoid: 'conflicts and new projects' },
  ];

  const moonInSign = {
    aries: { good: 'new beginnings, sport, bold decisions', avoid: 'long negotiations, routine' },
    taurus: { good: 'finances, beauty, gardening, buying things for the home', avoid: 'abrupt changes' },
    gemini: { good: 'conversations, study, paperwork, trips', avoid: 'monotonous work' },
    cancer: { good: 'home, family, cooking, self-care', avoid: 'public speaking' },
    leo: { good: 'creativity, celebrations, dates, presentations', avoid: 'taking a back seat' },
    virgo: { good: 'cleaning, health, planning, detailed work', avoid: 'risky ventures' },
    libra: { good: 'negotiations, beauty, meetings, art', avoid: 'arguments and solo decisions' },
    scorpio: { good: 'deep work, psychology, research', avoid: 'heated confrontations' },
    sagittarius: { good: 'study, travel, plans for the future', avoid: 'fiddly work' },
    capricorn: { good: 'career, strategy, discipline', avoid: 'carelessness' },
    aquarius: { good: 'friends, ideas, technology, the new', avoid: 'rigid rules' },
    pisces: { good: 'rest, creativity, intuition, helping others', avoid: 'important signatures and haste' },
  };

  // Ежедневный гороскоп: Луна в солнечном доме знака
  const moonSolarHouse = {
    1: 'The Moon is in your sign — emotions are close to the surface; you’re more visible and more sensitive than usual. A good day to take care of yourself and say what you want.',
    2: 'Focus on money and comfort: a good day to plan your budget, make pleasant purchases and appreciate what you already have.',
    3: 'A day of conversations and news: calls, messages, short trips, learning. Share your ideas — you’ll be heard.',
    4: 'You’re drawn to home and loved ones: a good day to make things cozy, spend time with family and sort out household matters.',
    5: 'A time of joy and creativity: dates, hobbies, playing with children — anything that lights up your heart.',
    6: 'Work mode: a good day to work through tasks, get organized and take care of your health — sleep, food, movement.',
    7: 'Focus on partners: negotiations, joint decisions, relationships. Listening to the other person matters.',
    8: 'A deep day: themes of trust, shared money, psychology. A good day to let go of the old and make sense of your feelings.',
    9: 'You want to widen your horizons: study, travel, books, conversations about meaning. Get inspired!',
    10: 'Career is in the spotlight: show what you can do, talk to your manager, take a step toward your goal.',
    11: 'A day for friends and kindred spirits: get-togethers, communities, dreams for the future. Support comes through people.',
    12: 'Time to slow down: rest, sleep, meditation, quiet activities. Intuition is stronger than logic — listen to it.',
  };
  const sunSolarHouse = {
    1: 'The Sun is in your sign — your personal new year: a time to make yourself known, refresh your image and set the course for the year.',
    2: 'A month of finances and self-worth: get your money in order, assess your talents and raise their value.',
    3: 'A month of communication and learning: courses, writing, negotiations and trips go well.',
    4: 'A month of home and roots: family, renovation, moving, restoring your strength and inner foundation.',
    5: 'A month of joy: love, creativity, children, hobbies — allow yourself more pleasure.',
    6: 'A month of order and health: routine, work, healthy habits, streamlining your affairs.',
    7: 'A month of partnership: relationships, agreements and collaboration come to the fore.',
    8: 'A month of depth and change: money shared with others, trust, psychological work, renewal.',
    9: 'A month of horizons: travel, learning, mentors and the search for meaning.',
    10: 'A month of career: you’re in the public eye — a time for achievements, recognition and important professional steps.',
    11: 'A month of friends and plans: your team, communities, and dreams that are ready to become goals.',
    12: 'A quiet month before your birthday: rest, taking stock, spiritual practice.',
  };
  const venusSolarHouse = 'Venus in your solar house {n} adds something pleasant to the area of “{topic}”: it’s easier to reach agreements, treat yourself and attract affection here.';
  const marsSolarHouse = 'Mars in your solar house {n} brings energy to the area of “{topic}”: act, but without harshness or haste.';

  const retroMeaning = {
    mercury: 'Mercury retrograde: a time to review, double-check and finish old business. Take extra care with documents, devices and agreements; it’s a good time to return to earlier ideas and people.',
    venus: 'Venus retrograde: re-evaluating what you value in love and money. Feelings from the past return; big purchases and dramatic changes to your appearance are better postponed.',
    mars: 'Mars retrograde: energy turns inward. A good time to finish what you’ve started and rethink your strategy rather than start battles.',
    jupiter: 'Jupiter retrograde: a time for inner growth and rethinking beliefs rather than outward expansion.',
    saturn: 'Saturn retrograde: reviewing commitments, structures and boundaries; a time to learn from mistakes.',
    uranus: 'Uranus retrograde: inner change and making sense of freedom before changing anything outside.',
    neptune: 'Neptune retrograde: the fog clears — a time to see through illusions and return to your real dreams.',
    pluto: 'Pluto retrograde: deep inner work, letting go of what has run its course.',
  };

  const eclipseMeaning = {
    solar: 'A solar eclipse is a powerful New Moon: a point of new beginnings and unexpected turns. On the day itself, it’s better to observe and plan than to make drastic decisions.',
    lunar: 'A lunar eclipse is a strong Full Moon: culmination, endings, emotional revelations. A time to let go of what has run its course.',
  };
  const eclipseKind = { total: 'total', partial: 'partial', annular: 'annular', penumbral: 'penumbral', hybrid: 'hybrid' };

  // Транзиты
  const transitLead = {
    sun: 'The Sun shines a light on this theme for a few days, adding energy and attention.',
    mercury: 'Mercury brings conversations, news and thoughts on this theme (a few days).',
    venus: 'Venus softens and beautifies: affection, pleasure, money (a few days).',
    mars: 'Mars adds energy and drive (about a week): time to act — but without rushing or picking fights.',
    jupiter: 'Jupiter expands and opens up opportunities (several weeks): growth, luck, support.',
    saturn: 'Saturn tests and gives structure (several months): responsibility, results, maturity.',
    uranus: 'Uranus brings change and liberation (up to a year): surprises, new paths, flashes of insight.',
    neptune: 'Neptune dissolves boundaries (a long period): inspiration and intuition — but also fog and illusion.',
    pluto: 'Pluto transforms (years): deep change, crisis and rebirth.',
    node: 'The lunar node marks fateful meetings and turning points.',
    chiron: 'Chiron brings old wounds up to be healed.',
  };
  const transitNature = {
    sun: { soft: 'A good time to step forward and receive support.', hard: 'Friction and fatigue are possible — don’t take on too much.', conj: 'The theme is in the spotlight: a good moment to make yourself known.' },
    mercury: { soft: 'It’s easy to reach agreements and find the information you need.', hard: 'Misunderstandings are likely — clarify and double-check.', conj: 'Lots of thoughts and conversations — write your ideas down.' },
    venus: { soft: 'Pleasant encounters, affection, good purchases.', hard: 'Whims, overspending and hurt feelings are possible — be forgiving.', conj: 'A time for love, beauty and pleasure.' },
    mars: { soft: 'Energy goes into action: sport, projects and bold moves succeed.', hard: 'Risk of conflict, haste and injury — breathe out first, then act.', conj: 'A powerful surge of energy: start things, but don’t act in the heat of the moment.' },
    jupiter: { soft: 'A lucky period: doors open, and people and circumstances help.', hard: 'The temptation to overestimate your strength and overpromise — grow without overdoing it.', conj: 'A new cycle of growth begins for this theme — expand with confidence.' },
    saturn: { soft: 'Effort brings solid results — a time to consolidate and build.', hard: 'A test of strength: there may be limits and fatigue. It’s a time for discipline and an honest review.', conj: 'A new cycle of maturity begins: take stock and lay the foundations.' },
    uranus: { soft: 'Pleasant changes and new opportunities arrive surprisingly easily.', hard: 'Sudden changes and instability: stay flexible and don’t act rashly.', conj: 'A time of liberation and renewal — old frames start to feel too tight.' },
    neptune: { soft: 'Inspiration, creativity, intuition and spiritual growth.', hard: 'Fog and uncertainty: double-check the facts, protect your boundaries and your health.', conj: 'The theme becomes subtle and inspired — listen to your intuition, but check it against reality.' },
    pluto: { soft: 'A deep but gentle transformation: you gain strength and influence.', hard: 'Crisis and restructuring: let go of what has run its course — it makes room for the new.', conj: 'A deep rebirth of this theme: it won’t be the same again — and that’s for the better.' },
    node: { soft: 'Favorable meetings and chances along your path of growth.', hard: 'A choice between the familiar path and a new one.', conj: 'A fateful period for this theme.' },
    chiron: { soft: 'Gentle healing and acceptance.', hard: 'Old pain resurfaces — a chance to work through it.', conj: 'A time of deep healing.' },
  };
  const natalTheme = {
    sun: 'your sense of self, goals and vitality', moon: 'emotions, home and a sense of safety', mercury: 'thinking, communication and learning',
    venus: 'love, relationships and finances', mars: 'energy, ambition and action', jupiter: 'growth, faith and opportunities',
    saturn: 'commitments, structure and long-term plans', uranus: 'your drive for freedom and change', neptune: 'dreams, intuition and spirituality',
    pluto: 'deep power and transformation', asc: 'image, appearance and approach to life', mc: 'career, status and vocation', node: 'your path of growth and fateful meetings',
    chiron: 'old wounds and the ability to heal', lilith: 'shadow desires',
  };

  // Синастрия
  const synNature = {
    conj: 'A strong fusion: this theme becomes the center of your relationship.',
    soft: 'A harmonious contact: here it’s easy and natural for you to be together.',
    hard: 'A challenging contact: here you “spark” and learn from each other — it takes patience and conversation.',
  };
  const synSpheres = {
    attraction: { name: 'Attraction', about: 'Chemistry, passion, romance' },
    emotion: { name: 'Emotional closeness', about: 'Understanding feelings, comfort, care' },
    communication: { name: 'Communication', about: 'Conversation, understanding, shared interests' },
    stability: { name: 'Stability', about: 'Responsibility, loyalty, the long term' },
    growth: { name: 'Growing together', about: 'Inspiration, support, development' },
    other: { name: 'Other connections', about: 'The couple’s overall background and particular traits' },
  };

  const dayRule = { day: 'Day chart (Sun above the horizon)', night: 'Night chart (Sun below the horizon)' };

  function fill(tpl, obj) { return tpl.replace(/\{(\w+)\}/g, (_, k) => (obj[k] != null ? obj[k] : '')); }

  /** Толкование “планета в знаке”. */
  function planetInSign(id, sign) {
    const s = signs[sign];
    if (!s) return '';
    if (s[id]) return s[id];
    if (genTpl[id]) return fill(genTpl[id], { loc: s.loc, trait: s.trait, keys: s.keys });
    if (id === 'mc') return `MC ${s.loc}: vocation and career goals take on the qualities of the sign — you fulfil yourself by acting ${s.trait}. Key themes: ${s.keys}.`;
    return '';
  }
  function planetInHouse(id, house) {
    const p = planets[id], h = houses[house];
    if (!p || !h || !p.tplHouse) return '';
    return fill(p.tplHouse, { topic: h.topic });
  }
  function aspectText(a, b, type) {
    const pa = planets[a], pb = planets[b], asp = aspects[type];
    if (!pa || !pb || !asp) return '';
    const nature = type === 'conj' ? 'conj' : (['trine', 'sextile', 'semisextile', 'quintile'].includes(type) ? 'soft' : 'hard');
    const lead = `${pa.name} ${asp.phrase} ${asp.caseKey === 'ins' ? pb.ins : pb.dat}.`;
    return lead + ' ' + fill(natureText[nature], { a: pa.keys.split(',')[0].trim(), b: pb.keys.split(',')[0].trim() }) + ' ' + asp.about;
  }
  function transitText(tid, nid, type) {
    const tp = planets[tid], np = planets[nid], asp = aspects[type];
    if (!tp || !np || !asp) return { title: '', text: '' };
    const nature = type === 'conj' ? 'conj' : (['trine', 'sextile'].includes(type) ? 'soft' : 'hard');
    const lead = transitLead[tid] || '';
    const nat = (transitNature[tid] || transitNature.sun)[nature];
    const theme = natalTheme[nid] ? ` It touches ${natalTheme[nid]}.` : '';
    return { title: `${tp.name} ${asp.phrase} ${asp.caseKey === 'ins' ? np.ins : np.dat}`, text: `${lead} ${nat}${theme}` };
  }
  function synastryText(aId, bId, type, nameA, nameB) {
    const pa = planets[aId], pb = planets[bId], asp = aspects[type];
    if (!pa || !pb || !asp) return '';
    const nature = type === 'conj' ? 'conj' : (['trine', 'sextile', 'semisextile', 'quintile'].includes(type) ? 'soft' : 'hard');
    return `${pa.syn ? capital(pa.syn) : pa.name} (${nameA}) and ${pb.syn || pb.name} (${nameB}). ${synNature[nature]}`;
  }
  function capital(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

  root.ASTRO_TEXTS = {
    signs, planets, houses, aspects, natureText, dignity, dignityAbout, elements, modalities, moonPhase8, moonPhaseNow,
    lunarDays, moonInSign, moonSolarHouse, sunSolarHouse, venusSolarHouse, marsSolarHouse, retroMeaning, eclipseMeaning, eclipseKind,
    transitLead, transitNature, natalTheme, synNature, synSpheres, dayRule,
    fill, capital, planetInSign, planetInHouse, aspectText, transitText, synastryText,
  };
})(typeof window !== 'undefined' ? window : globalThis);
