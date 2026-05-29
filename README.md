# SYLESS — Code Like You Think

**SYLESS** is an English-like programming language. Write code the way you speak — no semicolons, no brackets, no confusing syntax. It compiles to Python and runs instantly.

> **Try it live → [syless-frontend.vercel.app](https://syless.vercel.app/)**

---

## Install the VS Code Extension

Search **"SYLESS Language"** in the VS Code Extensions panel, or install from the Marketplace:

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/syless.syless-language?label=VS%20Code%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=syless.syless-language)

---

## What does SYLESS look like?

```syless
# Hello World
show "Hello, World!"

# Variables
make name = "SYLESS"
show "Welcome to {name}!"

# Conditions
make score = 85
check score >= 90 {
    show "Grade: A"
} also check score >= 70 {
    show "Grade: B"
} otherwise {
    show "Grade: C"
}

# Loops
loop i from 1 to 5 {
    show "Step: {i}"
}

# Functions
task greet(name, msg = "Hello") {
    show "{msg}, {name}!"
}

greet("World")
greet("SYLESS", "Welcome to")
```

---

## Features

- **English-like syntax** — write `make x = 10` instead of `int x = 10`
- **Compiles to Python** — runs on any machine with Python installed
- **AI Tutor** — powered by Claude AI to explain errors and suggest fixes
- **Online IDE** — write and run SYLESS in the browser, no install needed
- **VS Code Extension** — syntax highlighting, snippets, run with F5
- **Machine Learning** — built-in `train`, `predict`, `evaluate` commands
- **Data Structures** — stacks, queues, linked lists, trees, graphs built in
- **DSA Visualization** — see your data structures animate in real time

---

## Language Reference

### Output & Input
```syless
show "Hello!"              # print
show "Hi {name}!"          # string interpolation
ask username -> "Name: "   # user input
```

### Variables
```syless
make x = 10
x += 5
x -= 2
x *= 3
x /= 2
```

### Conditions
```syless
check x > 5 {
    show "big"
} also check x > 2 {
    show "medium"
} otherwise {
    show "small"
}
```

### Loops
```syless
loop 3 times { }
loop i from 1 to 10 { }
repeat while x < 10 { }
for each item in list { }
```

### Functions
```syless
task add(a, b) {
    give a + b
}
```

### Built-in Functions
```syless
length of x
upper of x
lower of x
round of x
absolute of x
```

### Data Structures
```syless
make myStack
push 10 into myStack
pop from myStack

make myQueue
insert 5 into myQueue
remove from myQueue

make myTree
insert 7 into myTree
```

### Machine Learning
```syless
load "iris" as data
train "knn" on data.data with data.target as model
predict model -> [5.1, 3.5, 1.4, 0.2]
evaluate model on data.data with data.target
```

Supported models: `knn`, `tree`, `forest`, `linear`, `logistic`, `bayes`, `svm`

---

## Run Locally

```bash
git clone https://github.com/nan455/SYLESS
cd SYLESS
npm run install:all
# add your ANTHROPIC_API_KEY to backend/.env
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind + Monaco Editor |
| Backend | Node.js + Express + MongoDB |
| Compiler | Custom Lexer → Parser → AST → Python |
| AI | Anthropic Claude (Haiku + Sonnet) |

---

## Who is SYLESS for?

- **Beginners** learning to code for the first time
- **Students** who want to focus on logic, not syntax
- **Teachers** who want a gentle on-ramp to programming
- **Non-programmers** who want to automate tasks without learning Python

---

## Feedback & Issues

Found a bug? Have an idea?

- [Open an issue](https://github.com/nan455/SYLESS/issues)
- Email: justmakeit654@gmail.com

---

*Developed by **NANDACUMAAR** · "just make it" startup*  
*SYLESS — Code Like You Think*
