'use strict';
/**
 * SYLESS Seed Data — 20 complete DSA problems
 * Covers: Basics, Arrays, Stack, Queue, Sorting, Searching, Recursion, Tree, Graph
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { connectDB } = require('./db');
const { Problem } = require('../models/index');

const PROBLEMS = [
  // ── BASICS ──────────────────────────────────────────────────────────────────
  {
    title: 'Hello SYLESS',
    slug: 'hello-syless',
    description: `Print the text "Hello, World!" using the SYLESS output command.

This is your first SYLESS program! Use the 'say ->' command to print text.

**Hint:** say -> "Hello, World!"`,
    difficulty: 'beginner',
    category: 'basics',
    tags: ['output', 'basics'],
    starter_code: { syless: '# Print Hello, World!\n', python: 'print("Hello, World!")' },
    solution: { syless: 'say -> "Hello, World!"', python: 'print("Hello, World!")' },
    test_cases: [
      { input: '', expectedOutput: 'Hello, World!', isHidden: false },
    ],
    hints: ['Use: say -> "Hello, World!"'],
    explanation: 'The say -> command prints text to the console, just like print() in Python.',
    order_num: 1,
  },
  {
    title: 'Sum of Two Numbers',
    slug: 'sum-two-numbers',
    description: `Create two variables x = 15 and y = 27, then print their sum.

Expected output: **42**`,
    difficulty: 'beginner',
    category: 'basics',
    tags: ['variables', 'math', 'basics'],
    starter_code: { syless: 'make x = 15\nmake y = 27\n# Print the sum\n' },
    solution: { syless: 'make x = 15\nmake y = 27\nsay -> x + y' },
    test_cases: [{ input: '', expectedOutput: '42', isHidden: false }],
    hints: ['Use make to create variables', 'Use + to add them', 'Use say -> to print'],
    order_num: 2,
  },
  {
    title: 'Even or Odd',
    slug: 'even-or-odd',
    description: `Create a variable n = 7.
Check if n is even or odd and print "Even" or "Odd" accordingly.

Expected output: **Odd**`,
    difficulty: 'beginner',
    category: 'basics',
    tags: ['conditions', 'modulo'],
    starter_code: { syless: 'make n = 7\n# Check even or odd\n' },
    solution: { syless: 'make n = 7\ncheck n % 2 == 0 {\n    say -> "Even"\n}\notherwise {\n    say -> "Odd"\n}' },
    test_cases: [{ input: '', expectedOutput: 'Odd', isHidden: false }],
    hints: ['Use % (modulo) to check remainder', 'n % 2 == 0 means even'],
    order_num: 3,
  },
  {
    title: 'Countdown',
    slug: 'countdown',
    description: `Use a while loop to count down from 5 to 1 and print each number.

Expected output:
5
4
3
2
1`,
    difficulty: 'easy',
    category: 'basics',
    tags: ['loops', 'while'],
    starter_code: { syless: 'make n = 5\n# Count down using repeat while\n' },
    solution: { syless: 'make n = 5\nrepeat while n > 0 {\n    say -> n\n    n = n - 1\n}' },
    test_cases: [{ input: '', expectedOutput: '5\n4\n3\n2\n1', isHidden: false }],
    hints: ['Use repeat while n > 0', 'Decrease n by 1 each iteration'],
    order_num: 4,
  },
  {
    title: 'Multiplication Table',
    slug: 'multiplication-table',
    description: `Print the multiplication table of 5 from 1 to 5.

Expected output:
5
10
15
20
25`,
    difficulty: 'easy',
    category: 'basics',
    tags: ['loops', 'math'],
    starter_code: { syless: 'make n = 5\nmake i = 1\n# Print 5×1 through 5×5\n' },
    solution: { syless: 'make n = 5\nmake i = 1\nrepeat while i <= 5 {\n    say -> n * i\n    i = i + 1\n}' },
    test_cases: [{ input: '', expectedOutput: '5\n10\n15\n20\n25', isHidden: false }],
    hints: ['Loop i from 1 to 5', 'Print n * i each time'],
    order_num: 5,
  },

  // ── ARRAYS ──────────────────────────────────────────────────────────────────
  {
    title: 'Sum of Array',
    slug: 'sum-of-array',
    description: `Create an array nums = [10, 20, 30, 40] and print the sum of all elements.

Expected output: **100**`,
    difficulty: 'easy',
    category: 'arrays',
    tags: ['arrays', 'loops'],
    starter_code: { syless: 'make nums = [10, 20, 30, 40]\nmake total = 0\n# Sum all elements\n' },
    solution: { syless: 'make nums = [10, 20, 30, 40]\nmake total = 0\nfor each n in nums {\n    total = total + n\n}\nsay -> total' },
    test_cases: [{ input: '', expectedOutput: '100', isHidden: false }],
    hints: ['Use for each to loop through array', 'Add each element to total'],
    order_num: 6,
  },
  {
    title: 'Find Maximum',
    slug: 'find-maximum',
    description: `Given nums = [3, 17, 5, 42, 9, 1], find and print the maximum value.

Expected output: **42**`,
    difficulty: 'easy',
    category: 'arrays',
    tags: ['arrays', 'searching'],
    starter_code: { syless: 'make nums = [3, 17, 5, 42, 9, 1]\nmake maxi = 0\n# Find the maximum\n' },
    solution: { syless: 'make nums = [3, 17, 5, 42, 9, 1]\nmake maxi = 0\nfor each n in nums {\n    check n > maxi {\n        maxi = n\n    }\n}\nsay -> maxi' },
    test_cases: [{ input: '', expectedOutput: '42', isHidden: false }],
    hints: ['Track the maximum using a variable', 'Update it whenever you find a larger number'],
    order_num: 7,
  },
  {
    title: 'Sort Ascending',
    slug: 'sort-ascending',
    description: `Create an array nums = [64, 25, 12, 22, 11] and sort it in ascending order, then print it.

Expected output: **[11, 12, 22, 25, 64]**`,
    difficulty: 'easy',
    category: 'sorting',
    tags: ['sorting', 'arrays'],
    starter_code: { syless: 'make nums = [64, 25, 12, 22, 11]\n# Sort and print\n' },
    solution: { syless: 'make nums = [64, 25, 12, 22, 11]\nsort nums ascending\nsay -> nums' },
    test_cases: [{ input: '', expectedOutput: '[11, 12, 22, 25, 64]', isHidden: false }],
    hints: ['Use: sort nums ascending', 'Then use say -> to print'],
    order_num: 8,
  },
  {
    title: 'Sort Descending',
    slug: 'sort-descending',
    description: `Create scores = [45, 90, 78, 23, 100] and print them sorted highest to lowest.

Expected output: **[100, 90, 78, 45, 23]**`,
    difficulty: 'easy',
    category: 'sorting',
    tags: ['sorting'],
    starter_code: { syless: 'make scores = [45, 90, 78, 23, 100]\n# Sort descending\n' },
    solution: { syless: 'make scores = [45, 90, 78, 23, 100]\nsort scores descending\nsay -> scores' },
    test_cases: [{ input: '', expectedOutput: '[100, 90, 78, 45, 23]', isHidden: false }],
    order_num: 9,
  },

  // ── SEARCHING ───────────────────────────────────────────────────────────────
  {
    title: 'Binary Search',
    slug: 'binary-search',
    description: `Create a sorted array nums = [2, 5, 10, 15, 20, 25, 30] and binary search for the value 15.

The binary search should print the index where 15 is found.

Expected output: **3**`,
    difficulty: 'medium',
    category: 'searching',
    tags: ['searching', 'binary search'],
    starter_code: { syless: 'make nums = [2, 5, 10, 15, 20, 25, 30]\n# Binary search for 15\n' },
    solution: { syless: 'make nums = [2, 5, 10, 15, 20, 25, 30]\nbinary search 15 in nums' },
    test_cases: [{ input: '', expectedOutput: '3', isHidden: false }],
    hints: ['Array must be sorted first', 'Use: binary search VALUE in ARRAY'],
    order_num: 10,
  },

  // ── STACK ────────────────────────────────────────────────────────────────────
  {
    title: 'Stack Push and Pop',
    slug: 'stack-push-pop',
    description: `Create a stack. Push 10, 20, 30 into it. Then pop one element. Print the final stack.

Expected output: **[10, 20]**`,
    difficulty: 'easy',
    category: 'stack',
    tags: ['stack', 'dsa'],
    starter_code: { syless: 'make stack\n# Push 10, 20, 30 then pop once\n' },
    solution: { syless: 'make stack\npush 10 into stack\npush 20 into stack\npush 30 into stack\npop from stack\nsay -> stack' },
    test_cases: [{ input: '', expectedOutput: '[10, 20]', isHidden: false }],
    hints: ['Use push X into stack', 'Use pop from stack', 'Print with say -> stack'],
    order_num: 11,
  },
  {
    title: 'Stack Reversal',
    slug: 'stack-reversal',
    description: `Push [1, 2, 3, 4, 5] into a stack in order. Then print the stack.
Since a stack is LIFO, the last pushed item is at the top.

Expected output: **[1, 2, 3, 4, 5]**`,
    difficulty: 'medium',
    category: 'stack',
    tags: ['stack', 'dsa'],
    starter_code: { syless: 'make stack\n# Push 1 through 5\n' },
    solution: { syless: 'make stack\nmake items = [1, 2, 3, 4, 5]\nfor each item in items {\n    push item into stack\n}\nsay -> stack' },
    test_cases: [{ input: '', expectedOutput: '[1, 2, 3, 4, 5]', isHidden: false }],
    order_num: 12,
  },

  // ── QUEUE ────────────────────────────────────────────────────────────────────
  {
    title: 'Queue Operations',
    slug: 'queue-operations',
    description: `Create a queue. Insert 100, 200, 300. Remove one element from the front. Print the queue.

Expected output: **deque([200, 300])**`,
    difficulty: 'easy',
    category: 'queue',
    tags: ['queue', 'dsa'],
    starter_code: { syless: 'make queue\n# Insert 100, 200, 300 then remove once\n' },
    solution: { syless: 'make queue\ninsert 100 into queue\ninsert 200 into queue\ninsert 300 into queue\nremove from queue\nsay -> queue' },
    test_cases: [{ input: '', expectedOutput: 'deque([200, 300])', isHidden: false }],
    hints: ['Use insert X into queue', 'Use remove from queue (removes from front)'],
    order_num: 13,
  },

  // ── FUNCTIONS ───────────────────────────────────────────────────────────────
  {
    title: 'Greet Function',
    slug: 'greet-function',
    description: `Create a task (function) called greet that takes a name and prints "Hello, NAME!".
Call it with "SYLESS".

Expected output: **Hello, SYLESS!**`,
    difficulty: 'easy',
    category: 'basics',
    tags: ['functions', 'basics'],
    starter_code: { syless: '# Create a greet function\n' },
    solution: { syless: 'task greet(name) {\n    say -> "Hello, " + name + "!"\n}\ngreet("SYLESS")' },
    test_cases: [{ input: '', expectedOutput: 'Hello, SYLESS!', isHidden: false }],
    hints: ['Use task functionName(param) { }', 'Use + to join strings'],
    order_num: 14,
  },
  {
    title: 'Area of Rectangle',
    slug: 'area-rectangle',
    description: `Create a task called area that takes length and width, and returns (gives) their product.
Call it with length=8, width=5 and print the result.

Expected output: **40**`,
    difficulty: 'easy',
    category: 'basics',
    tags: ['functions', 'math'],
    starter_code: { syless: 'task area(length, width) {\n    # Return length * width\n}\nsay -> area(8, 5)\n' },
    solution: { syless: 'task area(length, width) {\n    give length * width\n}\nsay -> area(8, 5)' },
    test_cases: [{ input: '', expectedOutput: '40', isHidden: false }],
    hints: ['Use give to return a value', 'give length * width'],
    order_num: 15,
  },

  // ── RECURSION ────────────────────────────────────────────────────────────────
  {
    title: 'Factorial',
    slug: 'factorial',
    description: `Write a recursive SYLESS function factorial(n) that computes n!

Call factorial(6) and print the result.

Expected output: **720**`,
    difficulty: 'medium',
    category: 'recursion',
    tags: ['recursion', 'math'],
    starter_code: { syless: 'task factorial(n) {\n    # Base case: n == 0 gives 1\n    # Recursive: n * factorial(n-1)\n}\nsay -> factorial(6)\n' },
    solution: { syless: 'task factorial(n) {\n    check n == 0 {\n        give 1\n    }\n    give n * factorial(n - 1)\n}\nsay -> factorial(6)' },
    test_cases: [{ input: '', expectedOutput: '720', isHidden: false }],
    hints: ['Base case: check n == 0 { give 1 }', 'Recursive: give n * factorial(n-1)'],
    order_num: 16,
  },
  {
    title: 'Fibonacci',
    slug: 'fibonacci',
    description: `Write a recursive function fib(n) that returns the nth Fibonacci number.
(fib(0)=0, fib(1)=1, fib(n)=fib(n-1)+fib(n-2))

Call fib(8) and print the result.

Expected output: **21**`,
    difficulty: 'medium',
    category: 'recursion',
    tags: ['recursion', 'fibonacci'],
    starter_code: { syless: 'task fib(n) {\n    # Write recursive fibonacci\n}\nsay -> fib(8)\n' },
    solution: { syless: 'task fib(n) {\n    check n == 0 {\n        give 0\n    }\n    check n == 1 {\n        give 1\n    }\n    give fib(n - 1) + fib(n - 2)\n}\nsay -> fib(8)' },
    test_cases: [{ input: '', expectedOutput: '21', isHidden: false }],
    hints: ['Two base cases: n==0 and n==1', 'Recursive: fib(n-1) + fib(n-2)'],
    order_num: 17,
  },

  // ── GRAPH ────────────────────────────────────────────────────────────────────
  {
    title: 'Build a Graph',
    slug: 'build-graph',
    description: `Build a graph with these connections:
- A connects to B
- B connects to C
- C connects to D

Then print the graph dictionary.

Expected output: **{'A': ['B'], 'B': ['A', 'C'], 'C': ['B', 'D'], 'D': ['C']}**`,
    difficulty: 'medium',
    category: 'graph',
    tags: ['graph', 'dsa'],
    starter_code: { syless: '# Build a graph with 4 nodes\n' },
    solution: { syless: 'connect A to B\nconnect B to C\nconnect C to D\nsay -> _graph' },
    test_cases: [{ input: '', expectedOutput: "{'A': ['B'], 'B': ['A', 'C'], 'C': ['B', 'D'], 'D': ['C']}", isHidden: false }],
    hints: ['Use: connect NodeA to NodeB', 'The graph is stored in _graph variable'],
    order_num: 18,
  },

  // ── MIXED CHALLENGE ──────────────────────────────────────────────────────────
  {
    title: 'FizzBuzz',
    slug: 'fizzbuzz',
    description: `Loop from 1 to 15. For each number:
- Print "FizzBuzz" if divisible by both 3 and 5
- Print "Fizz" if divisible by 3
- Print "Buzz" if divisible by 5
- Otherwise print the number

Expected output (first 5):
1
2
Fizz
4
Buzz
...`,
    difficulty: 'easy',
    category: 'basics',
    tags: ['loops', 'conditions', 'classic'],
    starter_code: { syless: 'make i = 1\nrepeat while i <= 15 {\n    # FizzBuzz logic here\n    i = i + 1\n}\n' },
    solution: { syless: 'make i = 1\nrepeat while i <= 15 {\n    check i % 15 == 0 {\n        say -> "FizzBuzz"\n    }\n    check i % 3 == 0 {\n        say -> "Fizz"\n    }\n    check i % 5 == 0 {\n        say -> "Buzz"\n    }\n    otherwise {\n        say -> i\n    }\n    i = i + 1\n}' },
    test_cases: [{ input: '', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', isHidden: false }],
    hints: ['Check divisible by 15 FIRST', 'Use i % 3 == 0 for Fizz'],
    order_num: 19,
  },
  {
    title: 'Power Function',
    slug: 'power-function',
    description: `Write a task power(base, exp) that calculates base^exp using recursion.

Call power(2, 10) and print the result.

Expected output: **1024**`,
    difficulty: 'hard',
    category: 'recursion',
    tags: ['recursion', 'math', 'challenge'],
    starter_code: { syless: 'task power(base, exp) {\n    # Recursive power function\n}\nsay -> power(2, 10)\n' },
    solution: { syless: 'task power(base, exp) {\n    check exp == 0 {\n        give 1\n    }\n    give base * power(base, exp - 1)\n}\nsay -> power(2, 10)' },
    test_cases: [{ input: '', expectedOutput: '1024', isHidden: false }],
    hints: ['Base case: exp == 0 → give 1', 'Recursive: base * power(base, exp-1)'],
    order_num: 20,
  },
];

async function seed() {
  console.log('🌱 Seeding DSA problems...');
  let created = 0;
  for (const p of PROBLEMS) {
    try {
      await Problem.findOrCreate({ where: { slug: p.slug }, defaults: p });
      created++;
    } catch (err) {
      console.warn(`  ⚠ Skipped "${p.title}": ${err.message}`);
    }
  }
  console.log(`✅ Seeded ${created} problems`);
}

// Allow running directly: node src/database/seed.js
if (require.main === module) {
  (async () => {
    require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
    await connectDB();
    const { sequelize } = require('./db');
    await sequelize.sync({ alter: true });
    await seed();
    process.exit(0);
  })().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { seed };
