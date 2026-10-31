function q(topic, difficulty, question, options, correctIndex, explanation) {
  return { topic, difficulty, question, options, correctIndex, explanation };
}

export const TOPICS = [
  'General Knowledge',
  'Science',
  'Technology',
  'History',
  'Geography',
  'Sports',
  'Movies',
  'Mathematics'
];

export const QUESTION_BANK = [
  // --- General Knowledge ---
  q('General Knowledge', 'easy', 'How many days are in a leap year?', ['364', '365', '366', '367'], 2, 'A leap year has 366 days because February has 29 days.'),
  q('General Knowledge', 'easy', 'Which color is made by mixing red and blue?', ['Green', 'Purple', 'Orange', 'Brown'], 1, 'Red and blue pigments combine to produce purple.'),
  q('General Knowledge', 'easy', 'What is the largest planet in our solar system?', ['Earth', 'Saturn', 'Jupiter', 'Neptune'], 2, 'Jupiter is the largest planet in the solar system by both mass and volume.'),
  q('General Knowledge', 'easy', 'How many continents are there on Earth?', ['5', '6', '7', '8'], 2, 'The seven continents are Africa, Antarctica, Asia, Europe, North America, Oceania, and South America.'),
  q('General Knowledge', 'medium', 'Which country gifted the Statue of Liberty to the United States?', ['United Kingdom', 'Italy', 'France', 'Spain'], 2, 'France presented the Statue of Liberty to the U.S. in 1886 as a gift of friendship.'),
  q('General Knowledge', 'medium', 'What is the capital city of Australia?', ['Sydney', 'Melbourne', 'Canberra', 'Perth'], 2, 'Canberra was chosen as a compromise capital between Sydney and Melbourne in 1908.'),
  q('General Knowledge', 'medium', 'Which currency is officially used in Japan?', ['Yen', 'Won', 'Yuan', 'Ringgit'], 0, 'The Japanese Yen (JPY) is the official currency of Japan.'),
  q('General Knowledge', 'hard', 'In which year did the United Nations officially come into existence?', ['1919', '1939', '1945', '1955'], 2, 'The UN Charter entered into force on October 24, 1945.'),
  q('General Knowledge', 'hard', 'Which language has the most native speakers worldwide?', ['English', 'Hindi', 'Spanish', 'Mandarin Chinese'], 3, 'Mandarin Chinese has the largest number of native speakers globally.'),
  q('General Knowledge', 'hard', 'What is the standard national animal of Scotland?', ['Lion', 'Unicorn', 'Stag', 'Dragon'], 1, 'The Unicorn has been a Scottish heraldic symbol since the 12th century.'),

  // --- Science ---
  q('Science', 'easy', 'What gas do plants absorb from the air during photosynthesis?', ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], 2, 'Plants take in carbon dioxide and release oxygen during photosynthesis.'),
  q('Science', 'easy', 'What is H2O more commonly known as?', ['Salt', 'Water', 'Hydrogen peroxide', 'Oxygen'], 1, 'H2O is the chemical molecular formula for pure water.'),
  q('Science', 'easy', 'Which part of the human body pumps blood through the circulatory system?', ['Lungs', 'Liver', 'Heart', 'Kidney'], 2, 'The heart acts as a muscular organ that pumps blood throughout the body.'),
  q('Science', 'easy', 'What force pulls objects toward the center of the Earth?', ['Magnetism', 'Gravity', 'Friction', 'Tension'], 1, 'Gravity is the natural force of attraction pulling masses toward each other.'),
  q('Science', 'medium', 'What is the chemical symbol for gold?', ['Gd', 'Au', 'Ag', 'Go'], 1, 'Au comes from the Latin word aurum, meaning shining dawn.'),
  q('Science', 'medium', 'Which planet in our solar system is known as the Red Planet?', ['Venus', 'Mars', 'Mercury', 'Jupiter'], 1, 'Mars appears reddish due to abundant iron oxide (rust) on its surface.'),
  q('Science', 'medium', 'What is the boiling point of water at standard sea level atmospheric pressure?', ['90°C', '100°C', '110°C', '120°C'], 1, 'Under standard atmospheric pressure, water boils at 100 degrees Celsius (212°F).'),
  q('Science', 'hard', 'What is commonly referred to as the powerhouse of the eukaryotic cell?', ['Nucleus', 'Ribosome', 'Mitochondrion', 'Golgi apparatus'], 2, 'Mitochondria generate most of the chemical energy needed to power the cell.'),
  q('Science', 'hard', 'Which subatomic particle carries a negative electric charge?', ['Proton', 'Neutron', 'Electron', 'Positron'], 2, 'Electrons carry a negative elementary charge, orbiting the atomic nucleus.'),
  q('Science', 'hard', 'What is the most abundant chemical element in the observable universe?', ['Oxygen', 'Carbon', 'Helium', 'Hydrogen'], 3, 'Hydrogen accounts for roughly 75% of the baryonic mass of the universe.'),

  // --- Technology ---
  q('Technology', 'easy', 'What does CPU stand for in computer hardware?', ['Central Processing Unit', 'Computer Personal Utility', 'Core Power Unit', 'Control Program Utility'], 0, 'The CPU (Central Processing Unit) executes instructions comprising a computer program.'),
  q('Technology', 'easy', 'Which company created the Windows operating system?', ['Apple', 'IBM', 'Microsoft', 'Google'], 2, 'Microsoft launched the first version of Windows in 1985.'),
  q('Technology', 'easy', 'What does WWW stand for in web addresses?', ['Wide Web World', 'World Wide Web', 'Web Wide World', 'Wireless Web Window'], 1, 'WWW stands for the World Wide Web, invented by Tim Berners-Lee in 1989.'),
  q('Technology', 'easy', 'Which device is used to input text into a desktop computer?', ['Monitor', 'Keyboard', 'Speaker', 'Printer'], 1, 'A keyboard is the standard primary input device for text and alphanumeric data.'),
  q('Technology', 'medium', 'Which language is primarily used to style and lay out web pages?', ['HTML', 'Python', 'CSS', 'SQL'], 2, 'CSS (Cascading Style Sheets) describes how HTML elements are presented visually.'),
  q('Technology', 'medium', 'What does HTTP stand for in networking?', ['HyperText Transfer Protocol', 'High Transfer Text Process', 'Host Transfer Type Protocol', 'Hyperlink Text Tracking Program'], 0, 'HTTP is the foundational HyperText Transfer Protocol used across the World Wide Web.'),
  q('Technology', 'medium', 'Which open-source operating system kernel was created by Linus Torvalds?', ['FreeBSD', 'Linux', 'MINIX', 'Darwin'], 1, 'Linus Torvalds released the initial Linux kernel in 1991.'),
  q('Technology', 'hard', 'Which data structure follows a First-In, First-Out (FIFO) ordering?', ['Stack', 'Queue', 'Binary Tree', 'Heap'], 1, 'A queue processes elements in first-in, first-out order, like a line of people.'),
  q('Technology', 'hard', 'What does GPU stand for in modern computing?', ['General Processing Utility', 'Graphical Power Unit', 'Graphics Processing Unit', 'Global Performance Unit'], 2, 'A GPU is a graphics processing unit designed to rapidly manipulate and alter memory.'),
  q('Technology', 'hard', 'In database theory, what does ACID stand for regarding transactions?', ['Atomicity, Consistency, Isolation, Durability', 'Accuracy, Concurrency, Integrity, Delivery', 'Authentication, Control, Identification, Data', 'Access, Cache, Index, Distribution'], 0, 'ACID transactions guarantee Atomicity, Consistency, Isolation, and Durability.'),

  // --- History ---
  q('History', 'easy', 'Who was the first President of the United States under the Constitution?', ['Abraham Lincoln', 'Thomas Jefferson', 'George Washington', 'John Adams'], 2, 'George Washington served as the first U.S. President from 1789 to 1797.'),
  q('History', 'easy', 'The ancient Great Wall is located in which country?', ['Japan', 'China', 'India', 'Mongolia'], 1, 'The Great Wall was built along the northern borders of ancient Chinese states.'),
  q('History', 'easy', 'Which ocean liner sank in April 1912 after hitting an iceberg?', ['Lusitania', 'Titanic', 'Britannic', 'Olympic'], 1, 'RMS Titanic sank on its maiden voyage after colliding with an iceberg in the North Atlantic.'),
  q('History', 'medium', 'In which year did World War II conclude with the surrender of the Axis powers?', ['1942', '1945', '1948', '1950'], 1, 'World War II concluded in 1945 following the surrender of Germany and Japan.'),
  q('History', 'medium', 'Who was historically known as the Maid of Orleans for her role in the Hundred Years’ War?', ['Marie Antoinette', 'Joan of Arc', 'Catherine the Great', 'Eleanor of Aquitaine'], 1, 'Joan of Arc led French troops to relieve Orleans in 1429.'),
  q('History', 'medium', 'Which ancient civilization built the Colosseum in Rome?', ['Ancient Greeks', 'Romans', 'Egyptians', 'Persians'], 1, 'The Roman Empire constructed the Flavian Amphitheatre (Colosseum) between 70 and 80 AD.'),
  q('History', 'hard', 'The Magna Carta was signed by King John of England in which year?', ['1066', '1215', '1492', '1776'], 1, 'King John affixed his Great Seal to Magna Carta at Runnymede in June 1215.'),
  q('History', 'hard', 'Which pre-Columbian civilization constructed the citadel of Machu Picchu in Peru?', ['Aztec', 'Maya', 'Inca', 'Olmec'], 2, 'Machu Picchu was built as an estate for the Inca emperor Pachacuti around 1450.'),
  q('History', 'hard', 'Who was the longest-reigning British monarch before Queen Elizabeth II?', ['Queen Victoria', 'King George III', 'King Henry VIII', 'Queen Elizabeth I'], 0, 'Queen Victoria reigned for 63 years and 216 days from 1837 until 1901.'),

  // --- Geography ---
  q('Geography', 'easy', 'Which is the largest ocean on Earth by surface area?', ['Atlantic', 'Indian', 'Arctic', 'Pacific'], 3, 'The Pacific Ocean covers more than 30% of Earth’s surface area.'),
  q('Geography', 'easy', 'Which continent is home to the country of Egypt?', ['Asia', 'Africa', 'Europe', 'South America'], 1, 'Egypt is situated in the northeast corner of the African continent.'),
  q('Geography', 'easy', 'What is the largest desert on Earth by land area?', ['Sahara', 'Gobi', 'Antarctic Desert', 'Kalahari'], 2, 'Antarctica is classified as a polar desert and is the world’s largest desert overall.'),
  q('Geography', 'medium', 'What is the longest river in the world by traditional geographic consensus?', ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], 1, 'The Nile River in northeastern Africa is traditionally measured as the longest at ~6,650 km.'),
  q('Geography', 'medium', 'Which country spans the most time zones when including overseas territories?', ['Russia', 'United States', 'France', 'China'], 2, 'France holds 12 time zones across its mainland and numerous overseas departments and territories.'),
  q('Geography', 'medium', 'Which European city is famously built across more than 100 islands connected by canals?', ['Amsterdam', 'Venice', 'Stockholm', 'Bruges'], 1, 'Venice, Italy is situated across 118 small islands separated by canals and linked by bridges.'),
  q('Geography', 'hard', 'What is the official federal capital city of Canada?', ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], 2, 'Ottawa was chosen as Canada’s capital city by Queen Victoria in 1857.'),
  q('Geography', 'hard', 'Mount Kilimanjaro, the highest free-standing mountain in Africa, is located in which nation?', ['Kenya', 'Tanzania', 'Ethiopia', 'Uganda'], 1, 'Mount Kilimanjaro is a dormant volcano in northeastern Tanzania.'),
  q('Geography', 'hard', 'Which country has the longest coastline in the world?', ['Russia', 'Canada', 'Australia', 'Indonesia'], 1, 'Canada has the world’s longest coastline at over 202,000 kilometers.'),

  // --- Sports ---
  q('Sports', 'easy', 'How many players are on the field for one team during a regulation soccer match?', ['9', '10', '11', '12'], 2, 'Each soccer team fields 11 players including the goalkeeper.'),
  q('Sports', 'easy', 'In standard basketball, how many points is a successfully made free throw worth?', ['1', '2', '3', '4'], 0, 'A free throw is worth exactly one point.'),
  q('Sports', 'easy', 'In American football, how many points is a touchdown worth before the extra point?', ['3', '6', '7', '8'], 1, 'A touchdown awards 6 points to the scoring team.'),
  q('Sports', 'medium', 'Which country has won the FIFA Men’s World Cup a record five times?', ['Germany', 'Italy', 'Argentina', 'Brazil'], 3, 'Brazil won the World Cup in 1958, 1962, 1970, 1994, and 2002.'),
  q('Sports', 'medium', 'How many Grand Slam tennis tournaments are played on the professional tour each calendar year?', ['3', '4', '5', '6'], 1, 'The four majors are the Australian Open, French Open, Wimbledon, and US Open.'),
  q('Sports', 'medium', 'What color jersey is traditionally awarded to the overall leader of the Tour de France?', ['Green', 'Polka Dot', 'Yellow', 'White'], 2, 'The Maillot Jaune (yellow jersey) is worn by the general classification leader.'),
  q('Sports', 'hard', 'In cricket, how many runs are scored when a batsman hits the ball over the boundary on the fly?', ['4', '5', '6', '8'], 2, 'Hitting the ball over the boundary without touching the ground scores six runs.'),
  q('Sports', 'hard', 'In which ancient city were the original Olympic Games celebrated?', ['Athens', 'Sparta', 'Olympia', 'Delphi'], 2, 'The ancient Olympics were held at the sanctuary of Zeus in Olympia, Greece.'),
  q('Sports', 'hard', 'How many holes are played in a standard professional round of golf?', ['9', '12', '18', '21'], 2, 'A standard regulation round of golf consists of 18 holes.'),

  // --- Movies ---
  q('Movies', 'easy', 'In Disney’s animated film The Lion King, what is Simba’s wise father named?', ['Scar', 'Mufasa', 'Timon', 'Rafiki'], 1, 'Mufasa is the King of the Pride Lands and father to Simba.'),
  q('Movies', 'easy', 'Which James Cameron film won 11 Oscars and depicted the doomed 1912 voyage of a luxury liner?', ['Titanic', 'Avatar', 'The Abyss', 'True Lies'], 0, 'Titanic (1997) won 11 Academy Awards including Best Picture and Best Director.'),
  q('Movies', 'easy', 'Which fictional superhero is known as the Caped Crusader and the Dark Knight?', ['Superman', 'Spider-Man', 'Batman', 'Iron Man'], 2, 'Bruce Wayne / Batman is widely known as Gotham City’s Dark Knight.'),
  q('Movies', 'medium', 'Who directed the groundbreaking 1993 sci-fi dinosaur thriller Jurassic Park?', ['James Cameron', 'Steven Spielberg', 'George Lucas', 'Ridley Scott'], 1, 'Steven Spielberg directed Jurassic Park, based on Michael Crichton’s novel.'),
  q('Movies', 'medium', 'Which actor played the eccentric pirate Captain Jack Sparrow in Pirates of the Caribbean?', ['Johnny Depp', 'Orlando Bloom', 'Brad Pitt', 'Tom Cruise'], 0, 'Johnny Depp received an Oscar nomination for portraying Captain Jack Sparrow.'),
  q('Movies', 'medium', 'What is the name of the fictional kingdom ruled by Queen Elsa and Princess Anna in Frozen?', ['Arendelle', 'Narnia', 'Atlantica', 'Genovia'], 0, 'Disney’s Frozen is set in the picturesque Scandinavian kingdom of Arendelle.'),
  q('Movies', 'hard', 'Which film won the Academy Award for Best Picture at the 1995 Oscars ceremony (honoring 1994 films)?', ['Pulp Fiction', 'Forrest Gump', 'The Shawshank Redemption', 'Quiz Show'], 1, 'Forrest Gump took home Best Picture at the 67th Academy Awards.'),
  q('Movies', 'hard', 'In The Matrix (1999), what color pill does Neo take to wake up to the truth of reality?', ['Blue', 'Red', 'Green', 'Yellow'], 1, 'Morpheus offers Neo the choice between the blue pill (ignorance) and the red pill (truth).'),
  q('Movies', 'hard', 'What was the first feature-length computer-animated film released in cinemas (1995)?', ['A Bug’s Life', 'Toy Story', 'Shrek', 'Monsters, Inc.'], 1, 'Pixar and Disney’s Toy Story (1995) was the first full-length CGI animated feature.'),

  // --- Mathematics ---
  q('Mathematics', 'easy', 'What is the product of 7 multiplied by 8?', ['54', '56', '63', '72'], 1, '7 × 8 equals 56.'),
  q('Mathematics', 'easy', 'What is the mathematical constant Pi (π) rounded to two decimal places?', ['3.12', '3.14', '3.16', '3.18'], 1, 'Pi is approximately 3.14159, which rounds to 3.14.'),
  q('Mathematics', 'easy', 'How many degrees are in the internal angles of an equilateral triangle in total?', ['90°', '180°', '270°', '360°'], 1, 'The three interior angles of any planar triangle always sum to 180°.'),
  q('Mathematics', 'medium', 'What is the principal square root of 144?', ['10', '11', '12', '14'], 2, 'Because 12 × 12 = 144, the square root of 144 is 12.'),
  q('Mathematics', 'medium', 'A right-angled triangle has one acute angle measuring 45°. What is the measure of the third angle?', ['30°', '35°', '45°', '60°'], 2, 'The sum of angles is 180°, so 180° − 90° − 45° = 45°.'),
  q('Mathematics', 'medium', 'What is the prime number immediately following 29?', ['31', '33', '35', '37'], 0, '31 is divisible only by 1 and itself, making it the next prime after 29.'),
  q('Mathematics', 'hard', 'What is the value of 2 raised to the 8th power (2^8)?', ['128', '256', '512', '64'], 1, '2^8 = 256.'),
  q('Mathematics', 'hard', 'If a circle has a radius of 7 units, what is the length of its diameter?', ['7 units', '14 units', '21 units', '49 units'], 1, 'The diameter of a circle is twice its radius (2 × 7 = 14).'),
  q('Mathematics', 'hard', 'What is the factorial of 5 (5!)?', ['60', '100', '120', '150'], 2, '5! = 5 × 4 × 3 × 2 × 1 = 120.')
];

function normalize(text) {
  return String(text || '').trim().toLowerCase();
}

function matchesTopic(entry, topic) {
  const requested = normalize(topic);
  const actual = normalize(entry.topic);
  if (!requested || requested === 'mixed' || requested === 'general knowledge') return true;
  return actual === requested || actual.includes(requested) || requested.includes(actual);
}

function matchesDifficulty(entry, difficulty) {
  if (!difficulty || difficulty === 'mixed') return true;
  return entry.difficulty === difficulty;
}

export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickFallbackQuestions({ topic, difficulty, count }) {
  const wanted = Number(count) || 10;
  const primary = QUESTION_BANK.filter((entry) => matchesTopic(entry, topic) && matchesDifficulty(entry, difficulty));
  const secondary = QUESTION_BANK.filter((entry) => matchesTopic(entry, topic));
  const pool = [];
  const seen = new Set();

  for (const source of [shuffle(primary), shuffle(secondary), shuffle(QUESTION_BANK)]) {
    for (const item of source) {
      const key = normalize(item.question);
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push({
        question: item.question,
        options: [...item.options],
        correctIndex: item.correctIndex,
        explanation: item.explanation
      });
      if (pool.length >= wanted) return pool;
    }
  }

  return pool;
}

export function sanitizeQuestions(rawQuestions, expectedCount) {
  if (!Array.isArray(rawQuestions)) return [];
  const seen = new Set();
  const clean = [];

  for (const item of rawQuestions) {
    const question = String(item?.question || '').trim();
    const explanation = String(item?.explanation || '').trim();
    const options = Array.isArray(item?.options) ? item.options.map((option) => String(option || '').trim()) : [];
    const correctIndex = Number.parseInt(item?.correctIndex, 10);

    if (question.length < 8 || explanation.length < 8) continue;
    if (options.length !== 4 || options.some((option) => option.length < 1)) continue;
    if (new Set(options.map(normalize)).size !== 4) continue;
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) continue;

    const key = normalize(question);
    if (seen.has(key)) continue;
    seen.add(key);

    clean.push({ question, options, correctIndex, explanation });
    if (clean.length >= expectedCount) break;
  }

  return clean;
}
