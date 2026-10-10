/* Мини-курс “Астрология с нуля”, инструкции и словарь. Уроки — HTML-текст; {{signs}}, {{planets}}, {{houses}}, {{aspects}} подставляются таблицами. */
globalThis.ACADEMY = {
  lessons: [
    {
      id: 1, title: 'What is a birth chart?', time: '7 min',
      body: `
<p class="lead">A birth chart is a “snapshot” of the sky at the moment you were born, taken from the place where you were born. It shows where the Sun, the Moon and the planets were in relation to the zodiac signs and the horizon.</p>
<h3>What a chart is made of</h3>
<ul>
<li><b>Planets</b> are the “who”: different parts of your personality. The Sun is will, the Moon is feelings, Venus is love and taste, Mars is energy.</li>
<li><b>Signs</b> are the “how”: the style in which a planet expresses itself. Mars in Aries acts fast and directly; Mars in Libra acts through diplomacy.</li>
<li><b>Houses</b> are the “where”: areas of life. Venus in the 10th house shows up in your career; in the 4th house, in your family.</li>
<li><b>Aspects</b> are the “conversations” between planets: where they help each other and where they argue.</li>
</ul>
<div class="keybox"><b>The reading formula:</b> Planet (what) + Sign (how) + House (where) + Aspects (in dialogue with whom).</div>
<h3>Why your birth time matters</h3>
<p>Signs and planets change slowly, but the horizon turns fast: a new sign rises roughly every 2 hours, and the Ascendant moves about 1° every 4 minutes. Without an accurate time you can’t build the houses or the Ascendant — and that’s half the information about “where” and “how” you show up.</p>
<h3>A chart is not a sentence</h3>
<p>A chart shows potential and tendencies, but it doesn’t decide for you. The same aspect can show up as a talent or as a problem, depending on how consciously you work with it. Astrology is a tool for self-knowledge, not a prediction of fate.</p>`,
      quiz: [
        { q: 'Which part of the birth chart describes the “where” — the areas of life?', a: ['Signs', 'Houses', 'Aspects'], ok: 1, why: 'Houses are the 12 areas of life: money, family, career, partnership and so on.' },
        { q: 'Why does an accurate birth time matter?', a: ['Without it you can’t know your Sun sign', 'The Ascendant and houses depend on it', 'Planets change sign every hour'], ok: 1, why: 'The Ascendant moves about 1° every 4 minutes, and the houses are built from it.' },
        { q: 'What’s the right way to think about a birth chart?', a: ['As a prediction of fate', 'As a map of possibilities and tendencies', 'As meaningless entertainment'], ok: 1, why: 'A chart shows potential; the choice always belongs to the person.' },
      ],
    },
    {
      id: 2, title: 'Elements and modalities: the language of signs', time: '8 min',
      body: `
<p class="lead">Each of the 12 signs combines an element (what it’s “charged” with) and a modality (how it acts). Knowing this, you can understand any sign without memorizing.</p>
<h3>The four elements</h3>
<ul>
<li><b>Fire</b> (Aries, Leo, Sagittarius) — enthusiasm, action, inspiration, faith.</li>
<li><b>Earth</b> (Taurus, Virgo, Capricorn) — practicality, results, the body, stability.</li>
<li><b>Air</b> (Gemini, Libra, Aquarius) — thoughts, communication, ideas, connections.</li>
<li><b>Water</b> (Cancer, Scorpio, Pisces) — feelings, intuition, closeness, memory.</li>
</ul>
<p>Fire and Air are the active signs (traditionally “masculine”): they need space. Earth and Water are receptive: they need grounding and depth. Fire gets along with Air (air fans the flame), and Earth with Water.</p>
<h3>The three modalities</h3>
<ul>
<li><b>Cardinal</b> (Aries, Cancer, Libra, Capricorn) — to begin, launch, lead.</li>
<li><b>Fixed</b> (Taurus, Leo, Scorpio, Aquarius) — to hold, develop, see things through.</li>
<li><b>Mutable</b> (Gemini, Virgo, Sagittarius, Pisces) — to adapt, change, connect.</li>
</ul>
<div class="keybox"><b>Example:</b> Scorpio = Water + fixed → deep, steady feelings that don’t change for a long time. Gemini = Air + mutable → a quick, changeable mind.</div>
<p>On the birth chart page, the “Balance” tab shows which element and modality you have most of — a quick way to understand your temperament.</p>`,
      quiz: [
        { q: 'What is Virgo’s element?', a: ['Water', 'Earth', 'Air'], ok: 1, why: 'Virgo is an earth sign, like Taurus and Capricorn.' },
        { q: 'What’s typical of the fixed modality?', a: ['Starting new things', 'Holding on and seeing things through', 'Changing quickly'], ok: 1, why: 'Fixed signs are keepers: persistence and stability.' },
        { q: 'Which element is in harmony with Fire?', a: ['Water', 'Air', 'Earth'], ok: 1, why: 'Air “fans” fire — these elements support each other.' },
      ],
    },
    {
      id: 3, title: 'The twelve zodiac signs', time: '10 min',
      body: `
<p class="lead">A sign is a style. Any planet in a sign “puts on its costume”. Here’s a short portrait of each sign.</p>
{{signs}}
<h3>Your Sun sign isn’t everything</h3>
<p>When people say “I’m a Leo”, they mean their Sun sign. But a chart has 9 more planets and the Ascendant, and they may sit in entirely different signs. That’s why a horoscope “by sign” only describes part of you — usually the most conscious, willful part.</p>
<div class="keybox"><b>Your task:</b> build your chart and find the signs of your Sun, Moon and Ascendant. That’s your “big three” — the foundation of your personality portrait.</div>`,
      quiz: [
        { q: 'Which sign is ruled by Venus?', a: ['Libra', 'Aries', 'Sagittarius'], ok: 0, why: 'Venus rules Taurus and Libra.' },
        { q: 'Which sign is first in the zodiac?', a: ['Pisces', 'Aries', 'Capricorn'], ok: 1, why: 'The zodiac begins with Aries — the point of the spring equinox.' },
        { q: 'What is the “big three”?', a: ['The Sun, Moon and Ascendant', 'The three most distant planets', 'Three signs of the same element'], ok: 0, why: 'The Sun, Moon and Ascendant are the foundation of character.' },
      ],
    },
    {
      id: 4, title: 'The planets: who’s who', time: '9 min',
      body: `
<p class="lead">The planets are the characters of your personality. Each one is responsible for its own “function”.</p>
{{planets}}
<h3>Personal, social, outer</h3>
<ul>
<li><b>Personal</b> (Sun, Moon, Mercury, Venus, Mars) — they move fast and describe your character and daily life.</li>
<li><b>Social</b> (Jupiter, Saturn) — how you grow and mature in society.</li>
<li><b>Outer</b> (Uranus, Neptune, Pluto) — slow; their sign is shared by a whole generation, so for you personally their house and aspects matter more.</li>
</ul>
<h3>A planet’s strength</h3>
<p>In some signs a planet feels “at home” (domicile) or “honored” (exaltation); in others it feels out of place (detriment, fall). This isn’t “good” and “bad” — it’s ease or difficulty of expression. In the positions table on this site, each planet’s status is marked with a symbol.</p>`,
      quiz: [
        { q: 'Which planet is responsible for emotions and the need for safety?', a: ['Mars', 'Moon', 'Saturn'], ok: 1, why: 'The Moon is your inner world, feelings and habits.' },
        { q: 'Why is your Pluto sign a generational trait?', a: ['Pluto is very slow and stays in one sign for a long time', 'Pluto isn’t a planet', 'Pluto is always retrograde'], ok: 0, why: 'Pluto spends 12–30 years in a sign — people the same age share it.' },
        { q: 'What does “a planet in domicile” mean?', a: ['The planet is weak', 'The planet expresses itself naturally and strongly', 'The planet is retrograde'], ok: 1, why: 'Domicile is the planet’s “home”.' },
      ],
    },
    {
      id: 5, title: 'The houses: 12 areas of life', time: '9 min',
      body: `
<p class="lead">Houses are the stages on which the planets play. There are 12 of them, and they run counterclockwise from the Ascendant.</p>
{{houses}}
<h3>Angular houses</h3>
<p>I, IV, VII and X houses are the strongest: their cusps are the Ascendant (ASC), the Imum Coeli (IC), the Descendant (DSC) and the Midheaven (MC). Planets near these points stand out in a person’s character and life story.</p>
<h3>An empty house isn’t an empty life</h3>
<p>If a house has no planets, its theme doesn’t disappear. Look at the sign on the house cusp and its ruler: wherever the ruler sits is where the house’s theme “leads”.</p>
<div class="keybox"><b>Example:</b> Gemini is on the cusp of the 10th house, and its ruler Mercury is in the 3rd house → the career is connected with writing, teaching, communication.</div>`,
      quiz: [
        { q: 'Which house is about partnership and marriage?', a: ['V', 'VII', 'XI'], ok: 1, why: 'VII — the house of every “we”: marriage, partners, contracts.' },
        { q: 'What do you do if a house has no planets?', a: ['Treat that area as unimportant', 'Look at the sign on the cusp and its ruler', 'Rebuild the chart'], ok: 1, why: 'The house’s theme unfolds through the ruler of its cusp.' },
        { q: 'Which point is the cusp of the 10th house?', a: ['Ascendant', 'MC — Midheaven', 'IC — Imum Coeli'], ok: 1, why: 'MC — the top of the chart, the cusp of the 10th house (in Placidus and Koch).' },
      ],
    },
    {
      id: 6, title: 'Aspects: how planets talk to each other', time: '8 min',
      body: `
<p class="lead">An aspect is a special angle between two planets. It shows how their energies interact.</p>
{{aspects}}
<h3>Orb</h3>
<p>An aspect doesn’t have to be exact. The allowance is called the orb: wider for the Sun and Moon (up to 10°), 5–8° for the others. The tighter the aspect, the more strongly it’s felt.</p>
<h3>Challenging doesn’t mean bad</h3>
<p>Squares and oppositions create inner conflict — but that’s exactly what makes us act and grow. Successful people usually have plenty of challenging aspects: they’ve learned to turn tension into energy. Trines, on the other hand, give talents that are easy to “sleep through” if you don’t develop them.</p>`,
      quiz: [
        { q: 'What angle is a square?', a: ['60°', '90°', '120°'], ok: 1, why: 'A square is 90° — a challenging aspect that calls you to act.' },
        { q: 'What is an orb?', a: ['The allowance within which an aspect still works', 'The name of a house', 'A planet’s speed'], ok: 0, why: 'The orb is the permitted deviation from the exact angle.' },
        { q: 'Which aspect is considered the most harmonious?', a: ['Opposition', 'Trine', 'Quincunx'], ok: 1, why: 'A trine (120°) links signs of the same element — ease and talent.' },
      ],
    },
    {
      id: 7, title: 'How to read your chart: step by step', time: '10 min',
      body: `
<p class="lead">A chart looks complicated until you have an order. Here’s the sequence astrologers use.</p>
<h3>Step 1. The overall impression</h3>
<p>Look at the balance of elements and modalities, clusters of planets (stelliums) and empty halves of the chart. Lots of planets at the top — a person “in the public eye”; at the bottom — private life matters; on the left — self-reliance; on the right — reliance on others.</p>
<h3>Step 2. The big three</h3>
<p>The Sun (who I am and where I’m going), the Moon (what I need to feel good), the Ascendant (how I enter the world). Compare their elements: do the “head”, the “heart” and the “first impression” match?</p>
<h3>Step 3. The chart ruler</h3>
<p>Find the ruler of your Ascendant sign — where it sits, in which house and sign. It’s the “driver” of your life.</p>
<h3>Step 4. Personal planets</h3>
<p>Mercury — how you think; Venus — how you love; Mars — how you act. For each: sign + house + aspects.</p>
<h3>Step 5. Tight aspects</h3>
<p>Write down the 3–5 tightest aspects (orb under 2°). These are the main “storylines” of the chart.</p>
<h3>Step 6. Synthesis</h3>
<p>Look for repeating themes: if the Sun is in the 10th house, Saturn is on the MC and Capricorn is rising, the theme of career and responsibility is sounding three times. Repetitions are what matter most.</p>
<div class="keybox"><b>Tip:</b> start with yourself. Open your own chart on the site and go through the steps in order, writing down what you notice.</div>`,
      quiz: [
        { q: 'Where does reading a chart begin?', a: ['With the transits', 'With the overall impression: elements, stelliums', 'With Pluto'], ok: 1, why: 'First the whole picture, then the details.' },
        { q: 'What is the chart ruler?', a: ['The planet that rules the Ascendant sign', 'The fastest planet', 'Sun'], ok: 0, why: 'The ruler of the sign on the Ascendant is the “driver” of the chart.' },
        { q: 'Why do repeating themes matter?', a: ['They’re random', 'Repetition points to what matters most in life', 'They should be ignored'], ok: 1, why: 'A theme that sounds several times is a key one.' },
      ],
    },
    {
      id: 8, title: 'The Moon and the lunar calendar', time: '7 min',
      body: `
<p class="lead">The Moon is the fastest of the lights: it crosses a sign in 2.5 days and the whole zodiac in a month. That’s why its rhythm shows up in moods and everyday plans.</p>
<h3>Phases</h3>
<ul>
<li><b>New Moon</b> — a time for intentions and quiet beginnings.</li>
<li><b>Waxing Moon</b> — growth, building strength, action.</li>
<li><b>Full Moon</b> — culmination, emotions, results.</li>
<li><b>Waning Moon</b> — completion, clearing out, rest.</li>
</ul>
<h3>Lunar days</h3>
<p>One tradition divides the lunar month into 29–30 lunar days. The first begins at the New Moon, and each one after that begins at moonrise — so their start times depend on your city. Every lunar day has a symbol: 1 — the Lamp, 11 — the Crown, 15 — the Serpent…</p>
<h3>Void-of-course Moon</h3>
<p>The stretch between the Moon’s last aspect in a sign and its move into the next one. Things started during this time are said to “go nowhere”: it’s good for resting and finishing, not for starting anything important.</p>
<div class="keybox">You’ll find all of this in the <a href="moon.html">moon calendar</a> on this site, calculated for your city.</div>`,
      quiz: [
        { q: 'Roughly how long does the Moon spend in one sign?', a: ['2.5 days', '1 month', '1 week'], ok: 0, why: 'The Moon circles the zodiac in about 27 days, and crosses a sign in about 2.5 days.' },
        { q: 'When does the second lunar day begin?', a: ['At midnight', 'At the first moonrise after the New Moon', '24 hours after the New Moon'], ok: 1, why: 'Lunar days (except the first) begin at moonrise.' },
        { q: 'What’s best to do while the Moon is void of course?', a: ['Sign important contracts', 'Rest and wrap things up', 'Start a business'], ok: 1, why: 'Traditionally, it’s not a time for new beginnings.' },
      ],
    },
    {
      id: 9, title: 'Retrograde planets, without the panic', time: '6 min',
      body: `
<p class="lead">Retrograde motion is a planet’s apparent backward movement as seen from Earth. Planets don’t actually turn around: it’s an overtaking effect, like passing a car on the highway.</p>
<h3>What it means astrologically</h3>
<p>The planet’s energy seems to “turn inward”: a time of reviewing, returning, reworking. Mercury goes retrograde 3–4 times a year for about 3 weeks each time — a normal part of the rhythm, not a disaster.</p>
<h3>A practical approach to Mercury retrograde</h3>
<ul>
<li>Double-check documents, addresses and arrangements.</li>
<li>Back up your files and allow extra time for tech.</li>
<li>It’s a good time to finish old projects and return to ideas and people from the past.</li>
<li>If something important can’t wait — go ahead, just pay closer attention.</li>
</ul>
<h3>The shadow</h3>
<p>For a couple of weeks before and after the retrograde, the planet crosses the same degrees — the “shadow” period. Its themes start to surface early and close for good once the planet leaves the shadow.</p>
<h3>Retrograde planets in the birth chart</h3>
<p>If you were born with a retrograde planet, its theme is lived more thoughtfully, “from the inside”, often in an unconventional way. It’s not a weakness — it’s a particular path.</p>`,
      quiz: [
        { q: 'Why does a planet look retrograde?', a: ['It turns around in space', 'It’s an apparent effect caused by Earth’s motion', 'The Sun pulls it back'], ok: 1, why: 'Retrograde motion is an optical effect, like passing on the highway.' },
        { q: 'How often is Mercury retrograde?', a: ['Once every 10 years', '3–4 times a year', 'Every day'], ok: 1, why: 'About 3 times a year, for 3 weeks each time.' },
        { q: 'What is the shadow period?', a: ['Nighttime', 'The time when a planet crosses the degrees of its retrograde loop', 'An eclipse'], ok: 1, why: 'Before and after the retrograde, the planet crosses the same degrees.' },
      ],
    },
    {
      id: 10, title: 'Transits: how a forecast works', time: '9 min',
      body: `
<p class="lead">A transit is an aspect that a planet in today’s sky makes to a planet or point in your birth chart. That’s how “today’s sky” switches on your personal themes.</p>
<h3>Duration</h3>
<ul>
<li><b>Moon</b> — hours: the mood of the day.</li>
<li><b>Sun, Mercury, Venus</b> — days.</li>
<li><b>Mars</b> — about a week: energy, conflict, momentum.</li>
<li><b>Jupiter</b> — weeks: growth and opportunity.</li>
<li><b>Saturn</b> — months: testing, structure, results.</li>
<li><b>Uranus, Neptune, Pluto</b> — a year or more: big changes, turning points.</li>
</ul>
<h3>The triple pass</h3>
<p>Because of retrograde motion, a slow planet can cross the same point three times: the first pass — the theme announces itself; the second (retrograde) — review; the third — resolution.</p>
<h3>Important life cycles</h3>
<ul>
<li><b>~29 years</b> — the Saturn return: the test of adulthood.</li>
<li><b>~42 years</b> — the Uranus opposition: the midlife crisis, a thirst for freedom.</li>
<li><b>Every 12 years</b> — the Jupiter return: a new cycle of growth.</li>
</ul>
<div class="keybox">I go through your personal transits month by month in the “Year Ahead” reading — interpreted specifically for your chart.</div>`,
      quiz: [
        { q: 'Which transit lasts the longest?', a: ['A Mars transit', 'A Pluto transit', 'A Venus transit'], ok: 1, why: 'Pluto moves very slowly — its transits last for years.' },
        { q: 'At what age does the Saturn return happen?', a: ['~12', '~29', '~50'], ok: 1, why: 'Saturn circles the zodiac in about 29.5 years.' },
        { q: 'Why can a transit “touch” a point three times?', a: ['Because of retrograde motion', 'Because of a calculation error', 'Because of a time zone change'], ok: 0, why: 'Direct — retrograde — direct again.' },
      ],
    },
  ],

  guides: [
    { title: 'How to find your exact birth time', icon: '◷', body: `<p>An exact time is needed for the Ascendant and houses. Where to look:</p><ul><li><b>Hospital birth record</b> or medical notes from your birth — the time is usually recorded to the minute.</li><li><b>A baby book or hospital bracelet</b> that parents often keep.</li><li><b>Your birth certificate</b> — in some countries and states the time is on it (sometimes only on the long-form version).</li><li><b>The vital records office</b> or the hospital — you can request a copy.</li><li><b>Relatives</b> — even “around 7 in the morning” is better than nothing.</li></ul><p>If the time is completely unknown, it can be recovered through rectification — using the dates of important life events.</p>` },
    { title: 'How to prepare for a reading', icon: '✎', body: `<ol><li>Send your date, time and place of birth.</li><li>Put together 2–3 main questions: what matters right now?</li><li>For a forecast or rectification, think of the dates of important events: moves, weddings, job changes, the birth of children.</li><li>Have a quiet place, headphones and a notebook ready.</li><li>Come ready for an honest conversation: the more open you are, the more precise the reading.</li></ol>` },
    { title: 'How to use the tools on this site', icon: '☉', body: `<ul><li><a href="natal.html">Birth chart</a> — enter your date, time and city. Tabs: wheel, interpretation, aspects, element balance, exact positions. You can save the chart as PNG or PDF.</li><li><a href="synastry.html">Compatibility</a> — two charts, scores by area of life and an interpretation of the couple’s aspects.</li><li><a href="moon.html">Moon calendar</a> — choose your city so the lunar day times are accurate.</li><li>All calculations happen in your browser: your data isn’t sent anywhere.</li></ul>` },
    { title: 'What to do during Mercury retrograde', icon: '☿', body: `<ul><li>Reread messages and contracts before sending them.</li><li>Keep backups and allow extra time for tech and travel.</li><li>Finish what you’ve started; return to old ideas and contacts.</li><li>Big tech purchases and signatures — after the shadow period, if you can.</li><li>And most importantly — no panic: it’s an ordinary rhythm, three times a year.</li></ul>` },
  ],

  glossary: [
    ['Ascendant (ASC)', 'The degree of the zodiac rising in the east at the moment of birth. It shapes your image and approach to life; the start of the 1st house.'],
    ['Descendant (DSC)', 'The point opposite the Ascendant, the start of the 7th house — partnership.'],
    ['MC (Midheaven)', 'The highest point of the ecliptic above the horizon. Vocation, career, status.'],
    ['IC (Imum Coeli)', 'The point opposite the MC, the start of the 4th house — roots, home, family.'],
    ['Aspect', 'A meaningful angle between planets: conjunction, sextile, square, trine, opposition and others.'],
    ['Orb', 'The permitted deviation from an aspect’s exact angle.'],
    ['Applying aspect', 'An aspect that’s becoming more exact; considered stronger.'],
    ['House', 'One of the 12 areas of life in a chart, counted from the Ascendant.'],
    ['Cusp', 'The beginning (boundary) of a house.'],
    ['Placidus', 'The most widely used house system: it divides the time each degree takes in its daily motion.'],
    ['Ruler', 'The planet that “rules” a sign (Mars rules Aries, Venus rules Taurus and Libra, and so on).'],
    ['Domicile', 'A sign where a planet is strong and natural (the Sun in Leo).'],
    ['Exaltation', 'A sign where a planet is honored (Venus in Pisces).'],
    ['Detriment', 'The sign opposite a planet’s domicile; its expression feels unfamiliar.'],
    ['Fall', 'The sign opposite a planet’s exaltation; the planet’s theme needs work.'],
    ['Stellium', 'A cluster of three or more planets in one sign or house.'],
    ['Retrograde', 'A planet’s apparent backward motion.'],
    ['Station', 'The moment a planet “stands still” before changing direction. Its themes are especially strong.'],
    ['Retrograde shadow', 'The periods before and after a retrograde when the planet crosses the same degrees.'],
    ['Transit', 'An aspect from a current planet to a point in the birth chart.'],
    ['Progressions', 'A forecasting method: one day after birth = one year of life.'],
    ['Solar return', 'The chart for the moment the Sun returns to its natal position — the chart of the year.'],
    ['Synastry', 'Comparing two charts: aspects between the partners’ planets.'],
    ['Composite', 'A relationship chart made from the midpoints of two charts.'],
    ['Lunar nodes', 'The points where the Moon’s orbit crosses the ecliptic. The North Node is the path of growth; the South Node is past experience.'],
    ['Black Moon (Lilith)', 'The apogee of the Moon’s orbit; shadow desires and temptations.'],
    ['Chiron', 'A small body between Saturn and Uranus; the “wounded healer” — vulnerability and the gift of healing.'],
    ['Part of Fortune', 'A calculated point (ASC + Moon − Sun by day); joy and good fortune.'],
    ['Void-of-course Moon', 'The period from the Moon’s last aspect in a sign until it enters the next one.'],
    ['Lunar days', 'Segments of the lunar month from one moonrise to the next (the first begins at the New Moon).'],
    ['An eclipse', 'A New or Full Moon close to the lunar nodes; a powerful point of change.'],
    ['Ingress', 'A planet’s move into a new sign.'],
    ['Rectification', 'Pinning down the birth time using life events.'],
    ['Horary', 'Horary astrology: answering a question with the chart for the moment it was asked.'],
    ['Electional astrology', 'Choosing a favorable time for a new beginning.'],
    ['Tropical zodiac', 'The zodiac anchored to the spring equinox point (0° Aries). It’s used in Western astrology and on this site.'],
    ['Ephemeris', 'Tables of the planets’ positions for every day.'],
    ['The big three', 'The signs of the Sun, Moon and Ascendant — the foundation of character.'],
  ],
};
