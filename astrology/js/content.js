/*
 * ===================== КОНТЕНТ САЙТА (демо) =====================
 * Всё, что астролог может менять сам: контакты, услуги, цены, вопросы, отзывы.
 * Демо-сайт вымышленного астролога Iris Calder — показывает студии и клиентам весь функционал.
 * Правьте текст между кавычками. Пустые кавычки '' — пункт не показывается.
 * ================================================================
 */
globalThis.SITE = {
  name: 'Iris Calder',
  firstName: 'Iris',
  role: 'astrologer',
  // фото астролога (аватар в шапке, подвале, записках) — квадрат, лицо по центру
  avatar: 'assets/img/iris-avatar.webp',
  tagline: 'Astrology for the decisions you’re actually facing',
  description: 'Iris Calder is an astrologer based in Asheville, North Carolina, reading charts online for clients everywhere. Birth chart readings, year-ahead forecasts, relationship compatibility and electional dates — plus free tools to explore your own chart.',

  // фоновое звёздное небо (canvas): у этого дизайна — выключено, фон бумажный
  starfield: false,
  // тень на диске Луны (светлая тема, тёмная тема)
  moonShade: ['rgba(24, 33, 44, 0.18)', 'rgba(0, 0, 0, 0.6)'],
  // авторы фото (показываются в подвале) — фото со стоков Unsplash, лицензия Unsplash
  credits: [
    { who: 'Peyman Shojaei', url: 'https://unsplash.com/photos/j9w1MgdHPu4' },
    { who: 'Gabriel Cox', url: 'https://unsplash.com/photos/6e7F96dBlAA' },
    { who: 'Jason Mavrommatis', url: 'https://unsplash.com/photos/FzURx0rFhUk' },
  ],

  // ---- ДЕМО-РЕЖИМ ----
  // Сайт — витрина студии: плашка «Demo site», подсказка с паролем кабинета и кодом премиума,
  // заявки уходят в локальный ящик этого браузера (js/demo-api.js), а не на сервер.
  demo: {
    enabled: true,
    studio: 'Nevaro Studio',
    studioUrl: 'https://sneznyj.github.io/', // лендинг студии (свой домен — позже, nevarostudio.com свободен 10.10.2026)
    password: 'stars-over-asheville',
    // ссылка премиум-доступа на 3 года (выдаёт _dev/issue_access.js, вписывает _dev/demo_setup.js)
    premiumLink: 'premium.html#k=AQHCZOUuBAmqDfEMRGVtbyB2aXNpdG9ymuCTnQXGwNQmwu_5zLEVDtRU-3AHginadpqW3NCNkD8Ht7p_VAAkUnpbuTaJ-YxikIWErPNN-Fb6eB1kBbK3XJV04mv42nG6MwVjZhfkUczUE7QGcYEnB_jlnGcvPICc', // до 09.10.2029
  },

  // ---- КОНТАКТЫ (заполните — кнопки появятся сами) ----
  contacts: {
    telegram: '',
    telegramChannel: '',
    telegramBot: '',
    whatsapp: '',
    instagram: '',
    tiktok: '',
    vk: '',
    youtube: '',
    email: 'hello@iriscalder.example',
    phone: '',
  },

  analytics: { metrikaId: '' },
  bookingEndpoint: '',
  // Ящик заявок: в демо — локальный (js/demo-api.js перехватывает запросы к этому адресу).
  api: { url: 'https://demo-inbox.local' },

  // ---- ФОРМАТЫ ДАТ, ВРЕМЕНИ И ДЕНЕГ ----
  dateOrder: 'mdy', // 'mdy' — 06/14/1997 (США), 'dmy' — 14.06.1997
  clock: '12h',     // '12h' — 2:30 PM, '24h' — 14:30
  baseCurrency: 'USD',
  currency: '$',
  currencies: { USD: '$' },
  currencyRules: [],
  currencyFallback: 'USD',

  // ---- АНКЕТА НА КОНСУЛЬТАЦИЮ ----
  intake: {
    replyTime: 'within one business day',
    contactLabel: 'Email or phone',
    contactPlaceholder: 'you@example.com or +1 555 …',
    contactAutocomplete: 'email',
    formats: [
      { id: 'video', icon: 'video', title: 'Video call', short: 'Video', text: 'we see each other, like meeting in person' },
      { id: 'audio', icon: 'headphones', title: 'Voice call', short: 'Voice', text: 'just voices, no camera' },
      { id: 'chat', icon: 'messages', title: 'By message', short: 'Messages', text: 'voice notes and text, at your own pace — you can replay them' },
    ],
    services: {
      natal: { ask: 'For example: I want to understand where my work is meant to go, and why the same pattern keeps showing up in my relationships.' },
      forecast: { ask: 'For example: what you’re planning this year, and what you’d like to know ahead of time.' },
      synastry: { ask: 'For example: how long you’ve been together, what’s happening right now, and what you’d like to understand about the two of you.', partner: true },
      career: { ask: 'For example: what you do now, what you enjoy, and what you’d like to change.' },
      child: { ask: 'For example: how old your child is, what delights you and what worries you.', birthOf: 'your child' },
      election: { ask: 'What the date is for, the time window, and which city it will happen in.', written: true },
      rectification: { ask: 'What you know about your birth time right now: “morning”, “around 3 am”, “between 10 and 12”? You can send dates of key life events later.', written: true },
      express: { ask: 'Your question — ideally in one sentence. For example: “Should I change jobs this fall?”', written: true, birth: 'optional' },
      numerology: { ask: 'For example: what you’d like to understand about yourself or about your year.', fullName: true },
      gift: { ask: 'Who is it for, and what’s the occasion? Which reading — or what amount?', noBirth: true },
      other: { ask: 'Tell me what you’re curious about — I’ll suggest where to start.', birth: 'optional' },
    },
  },

  // Город для лунного календаря и «Неба сегодня», если по часовому поясу посетителя город не найден.
  defaultCity: 'New York',
  siteUrl: 'sneznyj.github.io/astrology',
  githubRepo: '',
  announcement: 'Readings online, wherever you are — times shown in your own time zone',

  // ---- АКЦИЯ ----
  promo: {
    enabled: true,
    percent: 15,
    title: '15% off your first reading',
    short: 'off your first reading',
    until: '2026-11-30',
    services: ['natal', 'forecast', 'synastry', 'career', 'child'],
  },

  // ---- ПАКЕТЫ ----
  bundles: [
    { title: 'You & Your Year', items: ['natal', 'forecast'], price: 335, text: 'A birth chart reading plus a year-ahead forecast. First we understand you — then what the year is asking of you.', tag: 'Best value' },
    { title: 'The Two of Us', items: ['synastry', 'natal'], price: 350, text: 'Your own chart plus compatibility with your partner: what you each bring, and how you work best together.', tag: 'For couples' },
  ],

  // ---- ПОДАРОЧНЫЙ СЕРТИФИКАТ ----
  gift: {
    enabled: true,
    title: 'Gift certificate',
    text: 'Give someone a birth chart reading or a year-ahead forecast. I’ll send a beautifully designed certificate the day you pay — print it or forward it.',
    from: 60,
  },

  // ---- ПРЕМИУМ-ДОСТУП ----
  premium: {
    enabled: true,
    name: 'Premium access',
    plans: [
      { id: 'week', title: '7 days', days: 7, price: 9, note: 'to read your forecast and in-depth readings', payUrl: '' },
      { id: 'month', title: 'Month', days: 30, price: 15, tag: 'Most popular', note: 'your forecast and readings on hand all month', payUrl: '' },
      { id: 'year', title: 'Year', days: 365, price: 89, note: 'from one birthday to the next', payUrl: '' },
    ],
    features: [
      { id: 'forecast', icon: 'crystal-ball', title: 'Personal forecast', href: 'forecast.html', text: 'Month-by-month transits with exact dates and active windows, your solar return, progressions, profections and the sky on any date.' },
      { id: 'synastry', icon: 'heart-handshake', title: 'In-depth compatibility', href: 'synastry.html', text: 'Every aspect between two charts, interpreted by area of life, plus the bi-wheel, the composite chart and a side-by-side comparison.' },
      { id: 'natal', icon: 'planet', title: 'Your complete birth chart', href: 'natal.html', text: 'Planets in houses, your chart ruler, karmic points, vocation (MC) and an interpretation of every aspect.' },
      { id: 'numerology', icon: 'calendar-repeat', title: 'Numerology forecast', href: 'numerology.html', text: 'Your personal months and a calendar of personal days: when to start, when to negotiate, when to rest.' },
    ],
    seller: 'Iris Calder Astrology (demo)',
  },

  media: { heroVideo: '', greetingVideo: '', greetingTitle: '', ambientSound: '' },
  searchIndex: false,

  // ---- УСЛУГИ ----
  services: [
    {
      id: 'natal', icon: 'planet', tag: 'Most booked', tagType: 'hit', title: 'Birth chart reading',
      text: 'An in-depth reading about you: temperament, gifts, relationships, money and work — and the questions you’re carrying right now.',
      includes: ['A portrait of your temperament and strengths', 'Work, money and where your energy pays off', 'Relationships and what you need in a partner', 'Recording plus written notes afterwards'],
      duration: '90 minutes', price: 180, featured: true,
    },
    {
      id: 'forecast', icon: 'crystal-ball', tag: 'Great for birthdays', tagType: 'gift', title: 'Year ahead',
      text: 'Your solar return, transits and progressions: when the year supports change, where growth is likely, and when to conserve your energy.',
      includes: ['The main themes of your year', 'Supportive and challenging months', 'Work, relationships, money', 'A personal calendar of key dates'],
      duration: '90 minutes', price: 195,
    },
    {
      id: 'synastry', icon: 'heart-handshake', title: 'Relationship compatibility',
      text: 'Two charts side by side: where you’re strong as a pair, where the friction lives, and how to talk through it.',
      includes: ['Attraction and emotional fit', 'Friction points and how to handle them', 'The chart of the relationship itself', 'Works for love and for business partners'],
      duration: '90 minutes', price: 210,
    },
    {
      id: 'career', icon: 'briefcase', title: 'Career & purpose',
      text: 'Your natural talents, the kind of work that suits you, your relationship with money and the next practical steps.',
      includes: ['Your natural strengths', 'Fields and ways of working that fit', 'Your earning style', 'Concrete next steps'],
      duration: '75 minutes', price: 165,
    },
    {
      id: 'child', icon: 'baby-carriage', title: 'Your child’s chart',
      text: 'For parents: your child’s temperament, how they learn, what they need to feel safe and how to support their gifts.',
      includes: ['Temperament and needs', 'How they learn and connect', 'Talents and interests', 'Gentle advice for parents'],
      duration: '60 minutes', price: 140,
    },
    {
      id: 'election', icon: 'calendar-heart', tag: 'New', tagType: 'new', title: 'Choosing a date',
      text: 'A well-timed day and hour for a wedding, a move, a launch, a contract or a planned procedure.',
      includes: ['2–3 best date and time options', 'Why each one works', 'Dates to avoid'],
      duration: 'written, within 3 days', price: 150,
    },
    {
      id: 'rectification', icon: 'clock-search', title: 'Birth time rectification',
      text: 'If your birth time is unknown or approximate, I’ll pin it down using the events of your life.',
      includes: ['A life-events questionnaire', 'An exact time for every future reading'],
      duration: '3–5 days', price: 150,
    },
    {
      id: 'express', icon: 'message-question', title: 'One question',
      text: 'One clear question, one clear answer — from your birth chart or a horary chart.',
      includes: ['Answer by voice note or in writing', 'Within 1–2 days'],
      duration: '20–30 minutes', price: 60,
    },
  ],

  // ---- ЭНЕРГЕТИЧЕСКАЯ РАБОТА (energy.html) ----
  energy: {
    enabled: true,
    menu: 'Energy session',
    title: 'Energy alignment session',
    lead: 'A quiet half hour to come back to a sense of grounding, clarity and inner balance.',
    duration: 30,
    what: [
      'Energy alignment is a gentle practice for restoring inner balance. When we live with tension, hurry and worry for a long time — or go through hard events — it can feel as if everything is slipping through our fingers. A session helps you pause, release accumulated tension and come back to yourself.',
      'During the session I work with your state through attention, intention and calm presence: breathing, gentle relaxation, imagery and settling into your own center. You don’t need to “know how” — just get comfortable and let yourself rest.',
    ],
    whoFor: 'It may suit you if you’re tired, anxious or feel scattered, if you’re going through a big change, if you want to gather yourself before an important event — or simply to give yourself thirty quiet minutes.',
    how: [
      ['calendar-time', 'Choose a time', 'Pick a date and time below — a session lasts 30 minutes. I’ll confirm and send a few simple tips on how to prepare.'],
      ['leaf', 'Get comfortable', 'At the agreed time, find a quiet place where no one will disturb you. Sit or lie down; turning notifications off helps.'],
      ['wind', 'The session', 'We connect online — video or voice, as you prefer. I briefly ask how you are and what you’d like, then guide the practice: all you need to do is relax and breathe.'],
      ['message-heart', 'Feedback', 'At the end we take a few minutes to talk about what you noticed and what I noticed, and I share a small suggestion for the days ahead.'],
    ],
    gives: [
      ['shield-heart', 'Calm and grounding', 'a sense of solid ground under your feet'],
      ['wind', 'Less tension', 'worry and tightness in the body ease'],
      ['sun-high', 'Clarity', 'thinking and decisions come more easily'],
      ['bolt', 'Energy', 'the wish to act comes back'],
      ['heart', 'Connection with yourself', 'kind attention to your own feelings'],
      ['refresh', 'A gentle reset', 'after a hard stretch or a big change'],
    ],
    important: 'Energy alignment is a supportive practice for restoring inner balance. It isn’t medical treatment and doesn’t replace medical or mental health care. If you’re worried about your health, please see a doctor.',
    donation: 'Payment is by donation: after the session you choose an amount that feels fair to you. I’ll send the payment details together with your confirmation.',
    faq: [
      ['Do I need to believe in anything for it to work?', 'No. Openness and a wish to rest are enough. Many people notice a shift during the session itself: breathing slows down and tension in the body eases.'],
      ['What should I prepare?', 'A quiet place, a comfortable position, headphones and thirty free minutes. Afterwards it helps to drink some water and not rush.'],
      ['How often can I come?', 'As you feel it: some people come once during a hard time, others once a month to stay in balance.'],
      ['Can I move my time?', 'Of course — just let me know in advance and we’ll find another slot.'],
    ],
    schedule: {
      timezone: 'America/New_York',
      week: { mon: '10:00-18:00', tue: '10:00-18:00', wed: '12:00-20:00', thu: '10:00-18:00', fri: '10:00-15:00', sat: '', sun: '' },
      daysOff: [],
      step: 30,
      minNotice: 24,
      daysAhead: 21,
    },
  },

  needs: [
    { icon: 'user-heart', title: 'Understanding yourself', text: 'Who you are underneath the roles, what you’re naturally good at, why you react the way you do.' },
    { icon: 'hearts', title: 'Relationships', text: 'Why the same story keeps repeating, what you need in a partner, how to build something steadier.' },
    { icon: 'briefcase', title: 'Work and money', text: 'Where your effort pays off, what kind of work fits you, and when it’s time to make a move.' },
    { icon: 'direction-sign', title: 'A big decision', text: 'A move, a wedding, a launch — the timing, and what to keep an eye on.' },
    { icon: 'butterfly', title: 'A season of change', text: 'What’s happening right now, how long it’s likely to last, and how to move through it gently.' },
    { icon: 'baby-carriage', title: 'Your kids', text: 'Understanding your child’s temperament and supporting their gifts without boxing them in.' },
  ],

  // ---- ОБО МНЕ ----
  about: {
    title: 'Hi, I’m Iris',
    paragraphs: [
      'I’ve been reading charts for twelve years — first for friends at my kitchen table, now for clients from Asheville to Auckland. Astrology, for me, is a language for talking about the shape of a life: not a verdict, and never a prediction you have to live down.',
      'In a session I translate that language into plain English: what you’re built for, what your relationships ask of you, which months are for pushing and which are for resting. I’m honest and I’m kind — and I won’t scare you.',
      'My goal is simple: you leave clearer, calmer and with a next step you actually want to take.',
    ],
    signature: 'Iris',
    photoCaption: 'Where charts get read — most mornings, before the email.',
    story: '',
    values: [
      { title: 'Plainspoken', text: 'No walls of jargon. If I use a term, I explain it.' },
      { title: 'Honest', text: 'Strengths and blind spots, said with care.' },
      { title: 'Practical', text: 'Every reading ends with steps you can take this month.' },
    ],
  },

  // ---- ОБУЧЕНИЕ ----
  academy: {
    enabled: true,
    title: 'Learn astrology',
    text: 'Want to read your own chart? Start with the free mini-course right here on the site, then go deeper with one-to-one lessons or a small-group course.',
    formats: [
      { title: 'Free mini-course', text: '10 short lessons with quizzes: signs, planets, houses, aspects and forecasting.', price: 0, cta: 'Start', href: 'academy.html' },
      { title: 'One-to-one lessons', text: 'Sessions built around your own chart, at your pace. Online.', price: 85, unit: 'per session', cta: 'Book', service: 'lessons' },
      { title: '“Astrology from Scratch” course', text: '8 weeks, a small group, homework and a look at each participant’s chart.', price: 0, unit: '', note: 'Coming soon — join the list to hear first', cta: 'Join the list', service: 'course' },
    ],
  },

  // ---- ВОПРОСЫ ----
  faq: [
    { q: 'How do I book?', a: 'Fill in the short form on the site — it comes straight to me. I’ll read it, reply within one business day, check a couple of details if needed and suggest times in your own time zone.' },
    { q: 'What do you need from me?', a: 'Your date, time and place of birth — you’ll add them in the form (the date has a calendar, the city has search). The time should be accurate to 10–15 minutes: check your birth certificate or hospital record, or ask family. If you don’t know it at all, tick “I don’t know the exact time” — I’ll read the chart without houses or suggest a rectification.' },
    { q: 'How does a reading work?', a: 'Online from anywhere — whichever feels most comfortable: video, voice only, or by message with voice notes and text. Before we meet I prepare your chart; in the session we go through it and your questions. Afterwards you get the recording and short written notes.' },
    { q: 'Do you predict the future?', a: 'I show tendencies and timing — when it’s easier to act and when to save your energy. Decisions always stay with you. Astrology doesn’t cancel free will.' },
    { q: 'What if I’m not sure I believe in astrology?', a: 'That’s fine. Plenty of people come out of curiosity and leave with a new way of looking at themselves. Think of it as a conversation about you, from an unusual angle.' },
    { q: 'Is it confidential?', a: 'Yes. Your details and everything we talk about stay between us. The booking form is encrypted in your browser before it’s sent.' },
    { q: 'Can astrology replace a doctor or a therapist?', a: 'No. Astrology is a tool for self-reflection. For health, mental health, legal and financial decisions, please see a qualified professional.' },
    { q: 'How do I pay?', a: 'Once we’ve agreed on a time, I send a payment link — paying secures your slot. Card, Apple Pay and Google Pay all work.' },
    { q: 'Can I give a reading as a gift?', a: 'Yes! There’s a gift certificate for any reading — I’ll send it beautifully designed on the day you pay.' },
  ],

  // ---- ОТЗЫВЫ ----
  // В демо — примеры (sample: true показывает пометку «Sample review»). На настоящем сайте — только настоящие.
  reviews: [
    { name: 'Jenna', text: 'I came in skeptical and left with a plan for the next six months. The part about my Saturn return finally made sense of the last two years.', service: 'Year ahead', sample: true },
    { name: 'Marcus', text: 'Clear, warm and refreshingly practical. No doom, no jargon — just a really useful conversation about my work.', service: 'Career & purpose', sample: true },
    { name: 'Priya & Tom', text: 'We booked the compatibility reading before our wedding. We still quote the line about ‘two fire signs sharing one fireplace’.', service: 'Relationship compatibility', sample: true },
  ],

  weeklyNotes: {
    week: '',
    aries: '', taurus: '', gemini: '', cancer: '', leo: '', virgo: '',
    libra: '', scorpio: '', sagittarius: '', capricorn: '', aquarius: '', pisces: '',
  },
};
