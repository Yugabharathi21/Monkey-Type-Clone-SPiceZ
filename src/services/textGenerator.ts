import { LoremIpsum } from 'lorem-ipsum';

export interface TextContent {
  title: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  wordCount: number;
  characterCount: number;
  author?: string;
}

export interface TextOptions {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
}

// Initialize different lorem generators for variety
const basicLorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

const complexLorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 12,
    min: 6
  },
  wordsPerSentence: {
    max: 25,
    min: 8
  }
});

// Famous quotes by category and difficulty
const quotes = {
  easy: [
    "Be yourself. Everyone else is already taken.",
    "Life is what happens when you are busy making other plans.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Be the change you wish to see in the world.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    "Innovation distinguishes between a leader and a follower.",
    "Stay hungry, stay foolish.",
    "Life is really simple, but we insist on making it complicated.",
    "The way to get started is to quit talking and begin doing."
  ],
  medium: [
    "The advance of technology is based on making it fit in so that you don't really even notice it, so it's part of everyday life.",
    "Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish, and never settle for the status quo.",
    "Live as if you were to die tomorrow. Learn as if you were to live forever. Knowledge is the ultimate investment in yourself.",
    "The difference between ordinary and extraordinary is that little extra. Persistence and determination are the keys to achieving excellence.",
    "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.",
    "The only impossible journey is the one you never begin. Take the first step in faith even when you don't see the whole staircase.",
    "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work."
  ],
  hard: [
    "The unexamined life is not worth living, for the pursuit of wisdom requires continuous introspection and the willingness to challenge our fundamental assumptions about existence, morality, and the nature of reality itself.",
    "The important thing is not to stop questioning. Curiosity has its own reason for existing. One cannot help but be in awe when contemplating the mysteries of eternity, of life, of the marvelous structure of reality.",
    "In the depth of winter, I finally learned that there was in me an invincible summer. The human capacity for resilience and renewal transcends even the most challenging circumstances.",
    "The most beautiful thing we can experience is the mysterious. It is the source of all true art and science, inspiring us to explore the unknown and push the boundaries of human understanding."
  ]
};

// Programming code snippets by difficulty
const programmingSnippets = {
  easy: [
    "function greet(name) {\n  return 'Hello, ' + name + '!';\n}\n\nconst message = greet('World');\nconsole.log(message);",
    "const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(num => num * 2);\nconsole.log(doubled);",
    "let count = 0;\nwhile (count < 5) {\n  console.log('Count:', count);\n  count++;\n}",
    "const user = {\n  name: 'Alice',\n  age: 25,\n  city: 'New York'\n};\nconsole.log(user.name);"
  ],
  medium: [
    "async function fetchUserData(userId) {\n  try {\n    const response = await fetch(`/api/users/${userId}`);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}",
    "const users = [{name: 'Alice', age: 25}, {name: 'Bob', age: 30}];\nconst adults = users.filter(user => user.age >= 18)\n  .map(user => ({ ...user, isAdult: true }));\nconsole.log(adults);",
    "class Calculator {\n  constructor() {\n    this.result = 0;\n  }\n\n  add(num) {\n    this.result += num;\n    return this;\n  }\n\n  multiply(num) {\n    this.result *= num;\n    return this;\n  }\n\n  getValue() {\n    return this.result;\n  }\n}"
  ],
  hard: [
    "class BinarySearchTree {\n  constructor() {\n    this.root = null;\n  }\n\n  insert(value) {\n    const newNode = {value, left: null, right: null};\n    if (!this.root) {\n      this.root = newNode;\n      return;\n    }\n    let current = this.root;\n    while (true) {\n      if (value < current.value) {\n        if (!current.left) {\n          current.left = newNode;\n          break;\n        }\n        current = current.left;\n      } else {\n        if (!current.right) {\n          current.right = newNode;\n          break;\n        }\n        current = current.right;\n      }\n    }\n  }\n}",
    "const useAdvancedState = (initialState) => {\n  const [state, setState] = useState(initialState);\n  const updateState = useCallback((updates) => {\n    setState(prevState => ({ ...prevState, ...updates }));\n  }, []);\n  const resetState = useCallback(() => setState(initialState), [initialState]);\n  return { state, updateState, resetState };\n};"
  ]
};

// Common words for practice
const commonWordSets = {
  easy: [
    "the and for are but not you all can had her was one our out day get has him his how its may new now old see two who boy did she use many make over such time very when come here then they this with have from they will",
    "water house light fire tree book chair table door window hand foot head heart mind love hope peace time life good best help need want think know give take make find look feel hear speak read write learn teach play work rest stop start move walk run jump sit stand turn",
    "apple orange banana grape lemon cherry strawberry peach pear plum mango coconut pineapple watermelon blueberry raspberry blackberry papaya kiwi melon cantaloupe honeydew avocado tomato potato carrot onion pepper cucumber lettuce spinach broccoli"
  ],
  medium: [
    "keyboard monitor screen display device computer laptop desktop mobile tablet smartphone technology software hardware application program system network internet browser website database server client security privacy encryption authentication authorization password username email message notification",
    "adventure journey exploration discovery experience knowledge wisdom understanding intelligence creativity imagination inspiration motivation determination perseverance resilience courage confidence leadership teamwork collaboration communication presentation negotiation problem solution innovation invention research development progress achievement success excellence quality efficiency productivity",
    "mathematics calculation equation formula algorithm variable constant function derivative integral probability statistics geometry algebra trigonometry calculus physics chemistry biology astronomy geography history literature philosophy psychology sociology anthropology economics politics government democracy republic constitution amendment legislation regulation"
  ],
  hard: [
    "pharmaceutical biotechnology nanotechnology artificial intelligence machine learning deep learning neural network quantum computing cryptocurrency blockchain decentralization verification authentication cybersecurity vulnerability exploitation penetration testing ethical hacking digital forensics incident response risk assessment compliance governance regulatory framework",
    "phenomenological epistemological ontological metaphysical existentialist constructivist postmodernist deconstructionist hermeneutic dialectical synthesized paradigmatic theoretical conceptual methodological empirical quantitative qualitative interdisciplinary multidisciplinary transdisciplinary comparative analytical critical interpretive descriptive explanatory predictive normative prescriptive",
    "thermodynamics electromagnetic electromagnetism radioactivity semiconductor superconductor nanotechnology biotechnology pharmacokinetics pharmacodynamics bioavailability metabolism catabolism anabolism mitochondria ribosomes endoplasmic reticulum golgi apparatus lysosomes peroxisomes cytoplasm nucleus chromosomes deoxyribonucleic ribonucleic"
  ]
};

// Generate literature-style text using lorem ipsum
function generateLiterature(difficulty: string, wordCount: number): string {
  const lorem = difficulty === 'hard' ? complexLorem : basicLorem;
  
  if (difficulty === 'easy') {
    return lorem.generateWords(wordCount);
  } else if (difficulty === 'medium') {
    return lorem.generateSentences(Math.ceil(wordCount / 12));
  } else {
    return lorem.generateParagraphs(Math.ceil(wordCount / 80));
  }
}

// Calculate text statistics
function calculateStats(content: string) {
  const words = content.trim().split(/\s+/);
  return {
    wordCount: words.length,
    characterCount: content.length
  };
}

// Main text generation function
export function generateText(options: TextOptions): TextContent {
  const { category, difficulty } = options;
  
  let content = '';
  let title = '';
  let author = '';

  switch (category) {
    case 'quotes':
      const quoteArray = quotes[difficulty as keyof typeof quotes] || quotes.easy;
      content = quoteArray[Math.floor(Math.random() * quoteArray.length)];
      title = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quote`;
      author = 'Various Authors';
      break;

    case 'programming':
      const codeArray = programmingSnippets[difficulty as keyof typeof programmingSnippets] || programmingSnippets.easy;
      content = codeArray[Math.floor(Math.random() * codeArray.length)];
      title = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Code`;
      break;

    case 'common-words':
      const wordArray = commonWordSets[difficulty as keyof typeof commonWordSets] || commonWordSets.easy;
      content = wordArray[Math.floor(Math.random() * wordArray.length)];
      title = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Word Practice`;
      break;

    case 'literature':
    case 'all':
    default:
      const wordCount = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 80 : 120;
      content = generateLiterature(difficulty, wordCount);
      title = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Literature`;
      break;
  }

  const stats = calculateStats(content);

  return {
    title,
    content,
    category,
    difficulty,
    author,
    ...stats
  };
}

// Get available options
export function getTextOptions() {
  return {
    categories: ['quotes', 'literature', 'programming', 'common-words'],
    difficulties: ['easy', 'medium', 'hard'],
    languages: ['english']
  };
}
