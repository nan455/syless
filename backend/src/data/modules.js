'use strict';

const MODULES = [
  // ══════════════════════════════════════════════════════════
  // BEGINNER TRACK
  // ══════════════════════════════════════════════════════════
  {
    id: 'b1', slug: 'hello-world', title: 'Hello, World!', level: 'beginner',
    order: 1, xp: 15, icon: '👋',
    theory: {
      sections: [
        {
          title: 'Your First SYLESS Program',
          content: 'In SYLESS, you write code in plain English. To show something on the screen, you use the `say ->` keyword. Think of it as "say this to the screen".',
        },
        {
          title: 'The say -> Keyword',
          content: 'The arrow `->` points to whatever you want to print. You can print text (put it in double quotes), numbers, or variables.',
        },
        {
          title: 'Text vs Numbers',
          content: 'Text (called a string) goes inside double quotes: `"Hello"`. Numbers do not need quotes: `42`. SYLESS handles both automatically.',
        },
      ],
      examples: [
        { label: 'Print text', code: 'say -> "Hello, World!"' },
        { label: 'Print a number', code: 'say -> 42' },
        { label: 'Print multiple lines', code: 'say -> "Line 1"\nsay -> "Line 2"\nsay -> "Line 3"' },
        { label: 'Print text and number', code: 'say -> "My age is:"\nsay -> 20' },
      ],
    },
    exercise: {
      title: 'Say Hello to SYLESS',
      description: 'Write a SYLESS program that prints exactly:\nHello, SYLESS!\nI am learning to code.',
      starterCode: '# Use say -> to print two lines\n',
      testCases: [
        { input: '', expectedOutput: 'Hello, SYLESS!\nI am learning to code.' },
      ],
      hints: [
        'Use say -> "..." for each line',
        'You need two separate say -> statements',
        'Make sure the text matches exactly (capital letters matter)',
      ],
    },
  },

  {
    id: 'b2', slug: 'variables', title: 'Variables', level: 'beginner',
    order: 2, xp: 20, icon: '📦',
    theory: {
      sections: [
        {
          title: 'What is a Variable?',
          content: 'A variable is a named box that stores a value. You can store text, numbers, or true/false values. Later you can use the name anywhere in your code.',
        },
        {
          title: 'Creating Variables with make',
          content: 'Use `make name = value` to create a variable. The name can be anything (letters, no spaces). Once made, use the name directly — no quotes needed.',
        },
        {
          title: 'Data Types',
          content: 'SYLESS has three main types:\n• **Text** (string): `"Hello"` — text in double quotes\n• **Number**: `42` or `3.14` — no quotes\n• **Boolean**: `true` or `false` — for yes/no values',
        },
        {
          title: 'Updating Variables',
          content: 'You can change a variable after creating it: just use the name without `make`. Example: `score = score + 10`',
        },
      ],
      examples: [
        { label: 'Text variable', code: 'make name = "Alice"\nsay -> name' },
        { label: 'Number variable', code: 'make age = 25\nsay -> age' },
        { label: 'Updating a variable', code: 'make score = 0\nscore = score + 10\nsay -> score' },
        { label: 'Multiple variables', code: 'make city = "Chennai"\nmake temp = 38\nsay -> city\nsay -> temp' },
      ],
    },
    exercise: {
      title: 'Build a Profile',
      description: 'Create three variables:\n• name = "SYLESS"\n• version = 1\n• isAwesome = true\nThen print all three.',
      starterCode: '# Create your variables below\n',
      testCases: [
        { input: '', expectedOutput: 'SYLESS\n1\nTrue' },
      ],
      hints: [
        'Use make for each variable',
        'Print each variable with say ->',
        'Booleans print as True/False (capital T/F)',
      ],
    },
  },

  {
    id: 'b3', slug: 'conditions', title: 'Conditions', level: 'beginner',
    order: 3, xp: 25, icon: '🔀',
    theory: {
      sections: [
        {
          title: 'Making Decisions',
          content: 'Programs often need to make decisions based on values. In SYLESS, you use `check` to test a condition. If the condition is true, the code inside `{ }` runs.',
        },
        {
          title: 'check and otherwise',
          content: '`check condition { ... }` runs if condition is true.\n`otherwise { ... }` runs if it is false.\nThis is exactly like if/else in other languages.',
        },
        {
          title: 'Comparison Operators',
          content: '• `==` — equals\n• `!=` — not equals\n• `>` — greater than\n• `<` — less than\n• `>=` — greater than or equal\n• `<=` — less than or equal',
        },
        {
          title: 'Nested Conditions',
          content: 'You can put a `check` inside an `otherwise` block to test multiple conditions in sequence.',
        },
      ],
      examples: [
        { label: 'Basic check', code: 'make score = 75\ncheck score >= 50 {\n    say -> "Pass!"\n}\notherwise {\n    say -> "Fail"\n}' },
        { label: 'Nested check', code: 'make grade = 88\ncheck grade >= 90 {\n    say -> "A"\n}\notherwise {\n    check grade >= 75 {\n        say -> "B"\n    }\n    otherwise {\n        say -> "C"\n    }\n}' },
        { label: 'Equality check', code: 'make name = "Alice"\ncheck name == "Alice" {\n    say -> "Hello Alice!"\n}' },
      ],
    },
    exercise: {
      title: 'Grade Calculator',
      description: 'Given: `make marks = 82`\nPrint:\n• "Distinction" if marks >= 90\n• "Pass" if marks >= 50\n• "Fail" otherwise',
      starterCode: 'make marks = 82\n# Write your conditions below\n',
      testCases: [
        { input: '', expectedOutput: 'Pass' },
      ],
      hints: [
        'Use check marks >= 90 for distinction',
        'Use otherwise { check ... } for nested conditions',
        '82 is >= 50 but < 90, so the answer is "Pass"',
      ],
    },
  },

  {
    id: 'b4', slug: 'loops', title: 'Loops', level: 'beginner',
    order: 4, xp: 25, icon: '🔁',
    theory: {
      sections: [
        {
          title: 'Why Loops?',
          content: 'Instead of writing the same code 100 times, a loop runs it repeatedly. SYLESS has two loop types: `loop N times` and `repeat while`.',
        },
        {
          title: 'loop N times',
          content: '`loop N times { ... }` runs the block exactly N times. N can be a number or a variable.',
        },
        {
          title: 'repeat while',
          content: '`repeat while condition { ... }` keeps running as long as the condition is true. Always make sure the condition eventually becomes false, or the loop runs forever.',
        },
        {
          title: 'Counting with Loops',
          content: 'You can create a counter variable before the loop and update it inside. This lets you count up, count down, or accumulate totals.',
        },
      ],
      examples: [
        { label: 'loop N times', code: 'loop 5 times {\n    say -> "SYLESS!"\n}' },
        { label: 'Count to 10', code: 'make i = 1\nrepeat while i <= 10 {\n    say -> i\n    i = i + 1\n}' },
        { label: 'Sum of numbers', code: 'make total = 0\nmake i = 1\nrepeat while i <= 5 {\n    total = total + i\n    i = i + 1\n}\nsay -> total' },
      ],
    },
    exercise: {
      title: 'Multiplication Table',
      description: 'Print the 3× multiplication table from 3×1 to 3×5.\nExpected output:\n3\n6\n9\n12\n15',
      starterCode: '# Print multiples of 3 from 1 to 5\n',
      testCases: [
        { input: '', expectedOutput: '3\n6\n9\n12\n15' },
      ],
      hints: [
        'Use loop 5 times or repeat while i <= 5',
        'Keep a counter variable, multiply by 3 each step',
        'say -> i * 3 inside the loop',
      ],
    },
  },

  {
    id: 'b5', slug: 'foreach', title: 'For Each Loops', level: 'beginner',
    order: 5, xp: 25, icon: '📋',
    theory: {
      sections: [
        {
          title: 'Looping Over Lists',
          content: 'When you have a list of items, `for each` lets you visit each one in order — automatically. No counter needed.',
        },
        {
          title: 'for each Syntax',
          content: '`for each item in list { ... }` — `item` takes the value of each element one by one. The name `item` is up to you.',
        },
        {
          title: 'Creating Lists',
          content: 'Create a list with `make myList = [1, 2, 3]`. Items can be numbers, text, or a mix.',
        },
      ],
      examples: [
        { label: 'Loop over numbers', code: 'make nums = [10, 20, 30, 40]\nfor each n in nums {\n    say -> n\n}' },
        { label: 'Loop over text', code: 'make fruits = ["apple", "mango", "banana"]\nfor each fruit in fruits {\n    say -> fruit\n}' },
        { label: 'Sum using for each', code: 'make nums = [1, 2, 3, 4, 5]\nmake total = 0\nfor each n in nums {\n    total = total + n\n}\nsay -> total' },
      ],
    },
    exercise: {
      title: 'List the Planets',
      description: 'Create a list of the first 4 planets:\n["Mercury", "Venus", "Earth", "Mars"]\nPrint each planet on its own line.',
      starterCode: '# Create the planets list and print each one\n',
      testCases: [
        { input: '', expectedOutput: 'Mercury\nVenus\nEarth\nMars' },
      ],
      hints: [
        'make planets = ["Mercury", "Venus", "Earth", "Mars"]',
        'Use for each planet in planets { say -> planet }',
      ],
    },
  },

  {
    id: 'b6', slug: 'functions', title: 'Functions', level: 'beginner',
    order: 6, xp: 30, icon: '⚙️',
    theory: {
      sections: [
        {
          title: 'What is a Function?',
          content: 'A function is a reusable block of code you give a name to. Instead of writing the same logic in many places, write it once as a function and call it anywhere.',
        },
        {
          title: 'Defining with task',
          content: '`task functionName(param1, param2) { ... }` defines a function. Parameters are inputs the function receives.',
        },
        {
          title: 'Returning with give',
          content: '`give value` sends a result back to whoever called the function. It is like "return" in other languages.',
        },
        {
          title: 'Calling Functions',
          content: 'Call a function by writing its name followed by values in parentheses: `greet("Alice")`. Use `say -> functionName(...)` to print the result.',
        },
      ],
      examples: [
        { label: 'No return', code: 'task greet(name) {\n    say -> "Hello, " + name + "!"\n}\n\ngreet("World")\ngreet("SYLESS")' },
        { label: 'With return', code: 'task add(a, b) {\n    give a + b\n}\n\nsay -> add(3, 7)\nsay -> add(10, 20)' },
        { label: 'Multiple params', code: 'task area(length, width) {\n    give length * width\n}\n\nsay -> area(5, 4)' },
      ],
    },
    exercise: {
      title: 'Calculator Function',
      description: 'Write a function called `multiply` that takes two numbers `a` and `b` and returns their product.\nThen call `say -> multiply(6, 7)`.',
      starterCode: '# Define your multiply function here\n\nsay -> multiply(6, 7)\n',
      testCases: [
        { input: '', expectedOutput: '42' },
      ],
      hints: [
        'task multiply(a, b) { give a * b }',
        'The * operator multiplies numbers',
        '6 × 7 = 42',
      ],
    },
  },

  {
    id: 'b7', slug: 'arrays', title: 'Arrays & Operations', level: 'beginner',
    order: 7, xp: 30, icon: '🔢',
    theory: {
      sections: [
        {
          title: 'What is an Array?',
          content: 'An array (list) stores multiple values under one name. Each value has a position (index), starting at 0.',
        },
        {
          title: 'Creating and Accessing',
          content: '`make nums = [10, 20, 30]` creates an array.\nAccess by index: `nums[0]` gives `10`, `nums[1]` gives `20`.',
        },
        {
          title: 'Sorting Arrays',
          content: '`sort arrayName ascending` — sorts smallest to largest.\n`sort arrayName descending` — sorts largest to smallest.',
        },
        {
          title: 'Stack Operations on Arrays',
          content: '`push value into arrayName` — adds to the end.\n`pop from arrayName` — removes the last item.',
        },
      ],
      examples: [
        { label: 'Access by index', code: 'make colors = ["red", "green", "blue"]\nsay -> colors[0]\nsay -> colors[2]' },
        { label: 'Sort ascending', code: 'make nums = [5, 2, 8, 1, 9]\nsort nums ascending\nsay -> nums' },
        { label: 'Push and pop', code: 'make myList = [1, 2, 3]\npush 4 into myList\nsay -> myList\npop from myList\nsay -> myList' },
      ],
    },
    exercise: {
      title: 'Sort and Print',
      description: 'Create an array: `[64, 25, 12, 22, 11]`\nSort it in ascending order, then print it.',
      starterCode: '# Create the array, sort it, and print it\n',
      testCases: [
        { input: '', expectedOutput: '[11, 12, 22, 25, 64]' },
      ],
      hints: [
        'make nums = [64, 25, 12, 22, 11]',
        'sort nums ascending',
        'say -> nums',
      ],
    },
  },

  {
    id: 'b8', slug: 'user-input', title: 'User Input', level: 'beginner',
    order: 8, xp: 20, icon: '⌨️',
    theory: {
      sections: [
        {
          title: 'Reading Input',
          content: '`ask -> "prompt"` pauses your program and waits for the user to type something. The typed value is stored in the variable you assign it to.',
        },
        {
          title: 'Storing Input',
          content: 'Use `make varName = ask -> "question"` to capture what the user types.',
        },
        {
          title: 'Numbers from Input',
          content: 'Input is always text. To use it as a number in math, SYLESS will automatically convert it when needed.',
        },
      ],
      examples: [
        { label: 'Basic input', code: 'make name = ask -> "What is your name? "\nsay -> "Hello, " + name + "!"' },
        { label: 'Number input', code: 'make num = ask -> "Enter a number: "\nsay -> num * 2' },
      ],
    },
    exercise: {
      title: 'Greeting Machine',
      description: 'Read the user\'s name from input and print:\nHello, [name]!\n\n(The test will provide "World" as input)',
      starterCode: 'make name = ask -> "Enter your name: "\n# Print the greeting\n',
      testCases: [
        { input: 'World', expectedOutput: 'Hello, World!' },
      ],
      hints: [
        'say -> "Hello, " + name + "!"',
      ],
    },
  },

  // ══════════════════════════════════════════════════════════
  // INTERMEDIATE TRACK
  // ══════════════════════════════════════════════════════════
  {
    id: 'i1', slug: 'recursion', title: 'Recursion', level: 'intermediate',
    order: 1, xp: 60, icon: '🔄',
    theory: {
      sections: [
        {
          title: 'What is Recursion?',
          content: 'Recursion is when a function calls itself. It solves big problems by breaking them into smaller versions of the same problem.',
        },
        {
          title: 'The Two Essential Parts',
          content: '1. **Base case** — the condition that stops the recursion (otherwise it runs forever).\n2. **Recursive case** — the function calling itself with a smaller/simpler input.',
        },
        {
          title: 'Call Stack',
          content: 'Each function call waits for the one it called to finish. The calls stack up, then unwind one by one as each returns. This is the "call stack".',
        },
        {
          title: 'Common Patterns',
          content: '• Factorial: `n! = n × (n-1)!`, base: `0! = 1`\n• Fibonacci: `fib(n) = fib(n-1) + fib(n-2)`, base: `fib(0)=0, fib(1)=1`\n• Sum: `sum(n) = n + sum(n-1)`, base: `sum(0)=0`',
        },
      ],
      examples: [
        { label: 'Factorial', code: 'task factorial(n) {\n    check n <= 1 {\n        give 1\n    }\n    give n * factorial(n - 1)\n}\n\nsay -> factorial(5)' },
        { label: 'Fibonacci', code: 'task fib(n) {\n    check n <= 1 { give n }\n    give fib(n - 1) + fib(n - 2)\n}\n\nsay -> fib(7)' },
        { label: 'Sum 1 to N', code: 'task sumN(n) {\n    check n == 0 { give 0 }\n    give n + sumN(n - 1)\n}\n\nsay -> sumN(10)' },
      ],
    },
    exercise: {
      title: 'Power Function',
      description: 'Write a recursive function `power(base, exp)` that computes base^exp.\n• power(2, 0) = 1  (base case)\n• power(2, n) = 2 × power(2, n-1)\n\nCall: `say -> power(2, 8)`  → should print 256',
      starterCode: 'task power(base, exp) {\n    # Write your base case and recursive case\n}\n\nsay -> power(2, 8)\n',
      testCases: [
        { input: '', expectedOutput: '256' },
      ],
      hints: [
        'Base case: check exp == 0 { give 1 }',
        'Recursive case: give base * power(base, exp - 1)',
        '2^8 = 2 × 2^7 = 256',
      ],
    },
  },

  {
    id: 'i2', slug: 'stack-dsa', title: 'Stack (LIFO)', level: 'intermediate',
    order: 2, xp: 60, icon: '📚',
    theory: {
      sections: [
        {
          title: 'What is a Stack?',
          content: 'A stack is a collection where items are added and removed from the same end — the **top**. Think of a stack of plates: you add on top, you take from top.',
        },
        {
          title: 'LIFO Principle',
          content: 'LIFO = Last In, First Out. The most recently added item is the first one removed. Like an undo history — the last action is undone first.',
        },
        {
          title: 'Stack Operations in SYLESS',
          content: '• `make myStack` — creates an empty stack\n• `push value into myStack` — adds item to the top\n• `pop from myStack` — removes and returns the top item\n• `say -> myStack` — shows the current stack',
        },
        {
          title: 'Real-world Uses',
          content: '• Browser back button (page history)\n• Undo/redo in editors\n• Function call stack in programs\n• Expression evaluation (calculators)',
        },
      ],
      examples: [
        { label: 'Basic stack', code: 'make plates\npush "plate1" into plates\npush "plate2" into plates\npush "plate3" into plates\nsay -> plates\npop from plates\nsay -> plates' },
        { label: 'Number stack', code: 'make stack\npush 10 into stack\npush 20 into stack\npush 30 into stack\nsay -> stack' },
      ],
    },
    exercise: {
      title: 'Browser History',
      description: 'Simulate browser history using a stack:\n1. Push "home", "about", "contact", "services"\n2. Print the stack\n3. Pop twice (user hits back twice)\n4. Print the stack again',
      starterCode: 'make history\n# Push the 4 pages\n\n# Print the full history\n\n# Pop twice\n\n# Print after going back\n',
      testCases: [
        { input: '', expectedOutput: "['home', 'about', 'contact', 'services']\n['home', 'about']" },
      ],
      hints: [
        'push "home" into history  (repeat for all 4)',
        'say -> history',
        'pop from history (twice)',
        'say -> history again',
      ],
    },
  },

  {
    id: 'i3', slug: 'queue-dsa', title: 'Queue (FIFO)', level: 'intermediate',
    order: 3, xp: 60, icon: '🚶',
    theory: {
      sections: [
        {
          title: 'What is a Queue?',
          content: 'A queue is like a line of people — the first person to join is the first person served. Items enter at the REAR and leave from the FRONT.',
        },
        {
          title: 'FIFO Principle',
          content: 'FIFO = First In, First Out. The oldest item is always processed first. This is the opposite of a stack.',
        },
        {
          title: 'Queue Operations in SYLESS',
          content: '• `make myQueue` — creates an empty queue\n• `insert value into myQueue` — adds to the rear\n• `remove from myQueue` — removes from the front\n• `say -> myQueue` — shows current queue',
        },
        {
          title: 'Real-world Uses',
          content: '• Print queue (documents printed in order submitted)\n• BFS graph traversal\n• Task scheduling in OS\n• Customer service systems',
        },
      ],
      examples: [
        { label: 'Basic queue', code: 'make printQueue\ninsert "doc1" into printQueue\ninsert "doc2" into printQueue\ninsert "doc3" into printQueue\nsay -> printQueue\nremove from printQueue\nsay -> printQueue' },
      ],
    },
    exercise: {
      title: 'Task Scheduler',
      description: 'Create a task queue:\n1. Insert "task1", "task2", "task3", "task4"\n2. Print the queue\n3. Process (remove) the first two tasks\n4. Print the remaining queue',
      starterCode: 'make tasks\n# Insert 4 tasks\n\n# Print full queue\n\n# Remove first two\n\n# Print remaining\n',
      testCases: [
        { input: '', expectedOutput: "['task1', 'task2', 'task3', 'task4']\n['task3', 'task4']" },
      ],
      hints: [
        'insert "task1" into tasks (repeat for all 4)',
        'say -> tasks',
        'remove from tasks (twice)',
        'say -> tasks again',
      ],
    },
  },

  {
    id: 'i4', slug: 'sorting', title: 'Sorting Algorithms', level: 'intermediate',
    order: 4, xp: 60, icon: '📊',
    theory: {
      sections: [
        {
          title: 'Why Sort?',
          content: 'Sorting arranges data in order (ascending or descending). Sorted data makes searching much faster and is easier to understand.',
        },
        {
          title: 'Sorting in SYLESS',
          content: '`sort arrayName ascending` — smallest to largest (1, 2, 3...)\n`sort arrayName descending` — largest to smallest (9, 8, 7...)',
        },
        {
          title: 'Bubble Sort Concept',
          content: 'Bubble sort compares adjacent items and swaps them if out of order. It repeats until no swaps needed. It is simple but O(n²) — slow for large lists.',
        },
        {
          title: 'Time Complexity',
          content: '• Bubble Sort: O(n²) — for small lists\n• Merge Sort: O(n log n) — efficient for large lists\n• The built-in `sort` in SYLESS is optimized automatically.',
        },
      ],
      examples: [
        { label: 'Sort ascending', code: 'make nums = [64, 34, 25, 12, 22, 11, 90]\nsort nums ascending\nsay -> nums' },
        { label: 'Sort descending', code: 'make nums = [3, 1, 4, 1, 5, 9, 2, 6]\nsort nums descending\nsay -> nums' },
        { label: 'Sort text', code: 'make names = ["Charlie", "Alice", "Bob"]\nsort names ascending\nsay -> names' },
      ],
    },
    exercise: {
      title: 'Top 3 Scores',
      description: 'Given scores `[45, 92, 67, 88, 23, 100, 55]`:\n1. Sort descending\n2. Print the sorted list',
      starterCode: 'make scores = [45, 92, 67, 88, 23, 100, 55]\n# Sort and print\n',
      testCases: [
        { input: '', expectedOutput: '[100, 92, 88, 67, 55, 45, 23]' },
      ],
      hints: [
        'sort scores descending',
        'say -> scores',
      ],
    },
  },

  {
    id: 'i5', slug: 'searching', title: 'Binary Search', level: 'intermediate',
    order: 5, xp: 70, icon: '🔍',
    theory: {
      sections: [
        {
          title: 'Linear vs Binary Search',
          content: '**Linear search** checks every item one by one — O(n). For 1 million items, up to 1 million comparisons.\n**Binary search** splits the sorted list in half each time — O(log n). For 1 million items, only ~20 comparisons!',
        },
        {
          title: 'How Binary Search Works',
          content: '1. The list must be sorted first\n2. Look at the middle element\n3. If it is the target → found!\n4. If target is smaller → search the left half\n5. If target is larger → search the right half\n6. Repeat until found or list is empty',
        },
        {
          title: 'Binary Search in SYLESS',
          content: '`binary search value in arrayName` — searches the sorted array and prints the result.',
        },
      ],
      examples: [
        { label: 'Binary search', code: 'make sorted = [2, 5, 8, 12, 16, 23, 38, 56]\nbinary search 23 in sorted' },
        { label: 'Sort then search', code: 'make data = [15, 3, 9, 7, 1, 12]\nsort data ascending\nbinary search 9 in data' },
      ],
    },
    exercise: {
      title: 'Find the Target',
      description: 'Create array `[1, 5, 10, 15, 20, 25, 30, 35]`.\nIt is already sorted. Use binary search to find the value `25`.',
      starterCode: 'make arr = [1, 5, 10, 15, 20, 25, 30, 35]\n# Binary search for 25\n',
      testCases: [
        { input: '', expectedOutput: 'Found 25 at index 5' },
      ],
      hints: [
        'binary search 25 in arr',
        'The list is already sorted so no sorting needed',
      ],
    },
  },

  {
    id: 'i6', slug: 'linked-list', title: 'Linked List', level: 'intermediate',
    order: 6, xp: 70, icon: '🔗',
    theory: {
      sections: [
        {
          title: 'What is a Linked List?',
          content: 'A linked list is a sequence of **nodes** where each node stores a value AND a pointer to the next node. Unlike arrays, nodes are not stored consecutively in memory.',
        },
        {
          title: 'Head and Tail',
          content: '**HEAD** = the first node (entry point of the list).\n**TAIL** = the last node (its pointer is NULL, meaning no next node).',
        },
        {
          title: 'Linked List vs Array',
          content: '• Array: fast random access O(1), slow insert/delete in middle O(n)\n• Linked list: slow random access O(n), fast insert/delete at ends O(1)',
        },
        {
          title: 'SYLESS Linked List',
          content: '`make myList` — creates empty linked list\n`add value into myList` — appends to tail\n`say -> myList` — shows all nodes',
        },
      ],
      examples: [
        { label: 'Build a linked list', code: 'make playlist\nadd "Song A" into playlist\nadd "Song B" into playlist\nadd "Song C" into playlist\nsay -> playlist' },
        { label: 'Number list', code: 'make chain\nadd 10 into chain\nadd 20 into chain\nadd 30 into chain\nsay -> chain' },
      ],
    },
    exercise: {
      title: 'Undo History',
      description: 'Create a linked list representing edit history.\nAdd actions: "type", "bold", "italic", "save"\nPrint the list.',
      starterCode: 'make editHistory\n# Add the 4 actions\n\n# Print the list\n',
      testCases: [
        { input: '', expectedOutput: "['type', 'bold', 'italic', 'save']" },
      ],
      hints: [
        'add "type" into editHistory (4 times for each action)',
        'say -> editHistory',
      ],
    },
  },

  {
    id: 'i7', slug: 'recursion-advanced', title: 'Advanced Recursion', level: 'intermediate',
    order: 7, xp: 80, icon: '🧠',
    theory: {
      sections: [
        {
          title: 'Recursive Thinking',
          content: 'The key to recursion is trusting the recursive call. When you write `give n + sumN(n-1)`, assume `sumN(n-1)` correctly returns the sum of 1 to n-1.',
        },
        {
          title: 'Tree Recursion',
          content: 'Some problems have multiple recursive calls. Fibonacci does this: `fib(n) = fib(n-1) + fib(n-2)`. This creates a tree of calls, hence "tree recursion".',
        },
        {
          title: 'Recursion vs Loops',
          content: 'Any loop can be written recursively and vice versa. Recursion is often more elegant for tree/graph problems. Loops are better for simple counting tasks.',
        },
      ],
      examples: [
        { label: 'Count digits', code: 'task countDigits(n) {\n    check n < 10 { give 1 }\n    give 1 + countDigits(n / 10)\n}\nsay -> countDigits(12345)' },
        { label: 'Recursive sum', code: 'task sumList(arr, i) {\n    check i == 0 { give arr[0] }\n    give arr[i] + sumList(arr, i - 1)\n}\nmake nums = [1, 2, 3, 4, 5]\nsay -> sumList(nums, 4)' },
      ],
    },
    exercise: {
      title: 'Fibonacci Sequence',
      description: 'Write `task fib(n)` that returns the nth Fibonacci number.\nfib(0)=0, fib(1)=1, fib(n)=fib(n-1)+fib(n-2)\n\nCall: `say -> fib(10)` → should print 55',
      starterCode: 'task fib(n) {\n    # Base cases and recursive case\n}\n\nsay -> fib(10)\n',
      testCases: [
        { input: '', expectedOutput: '55' },
      ],
      hints: [
        'check n <= 0 { give 0 }',
        'check n == 1 { give 1 }',
        'give fib(n - 1) + fib(n - 2)',
      ],
    },
  },

  {
    id: 'i8', slug: 'graphs', title: 'Graph Traversal', level: 'intermediate',
    order: 8, xp: 100, icon: '🕸️',
    theory: {
      sections: [
        {
          title: 'What is a Graph?',
          content: 'A graph has **nodes** (also called vertices) connected by **edges**. Unlike trees, graphs can have cycles and any node can connect to any other.',
        },
        {
          title: 'Graph Terminology',
          content: '• **Undirected** — edges go both ways (A↔B)\n• **Directed** — edges go one way (A→B)\n• **Weighted** — edges have costs\n• **Path** — sequence of nodes connected by edges',
        },
        {
          title: 'BFS — Breadth First Search',
          content: 'BFS explores nodes **level by level** using a Queue. It visits all neighbors of a node before going deeper. Best for finding the **shortest path**.',
        },
        {
          title: 'DFS — Depth First Search',
          content: 'DFS explores as **deep as possible** before backtracking, using a Stack (or recursion). Best for detecting cycles, finding all paths.',
        },
        {
          title: 'SYLESS Graph Syntax',
          content: '`connect A to B` — creates an undirected edge between nodes A and B.',
        },
      ],
      examples: [
        { label: 'Build a graph', code: 'connect A to B\nconnect B to C\nconnect C to D\nconnect A to D\nsay -> "Graph connected!"' },
        { label: 'Social network', code: 'connect Alice to Bob\nconnect Bob to Charlie\nconnect Alice to David\nsay -> "Social graph built!"' },
      ],
    },
    exercise: {
      title: 'Build a Network',
      description: 'Create a graph with 5 nodes representing city connections:\n• Mumbai - Delhi\n• Delhi - Bangalore\n• Mumbai - Chennai\n• Chennai - Bangalore\n• Bangalore - Hyderabad\n\nThen print: "City network ready!"',
      starterCode: '# Connect the cities\n\nsay -> "City network ready!"\n',
      testCases: [
        { input: '', expectedOutput: 'City network ready!' },
      ],
      hints: [
        'connect Mumbai to Delhi',
        'connect Delhi to Bangalore',
        'Continue for all 5 connections',
      ],
    },
  },
];

module.exports = MODULES;
