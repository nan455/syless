# SYLESS Language

**SYLESS** is an English-like programming language — write code the way you speak, no complex syntax required.

> **Try it live → [syless-frontend.vercel.app](https://syless-frontend.vercel.app/)**
> Practice SYLESS directly in your browser with the online IDE, no setup needed.

---

## Features

- **Syntax highlighting** for all SYLESS keywords, strings, numbers, and comments
- **Code snippets** — type a keyword and press `Tab` to expand a full template
- **Auto-closing brackets** — `{`, `[`, `(`, `"`, `'`
- **Auto-indent** — code indents automatically inside blocks
- **.sy file icon** — SYLESS files get their own icon in the file explorer

---

## Getting Started

Create a file ending in `.sy` and start writing:

```syless
# Hello World
say -> "Hello, World!"

# Variables
make name = "SYLESS"
make age = 17

# Input
ask username -> "Enter your name: "

# Condition
check age >= 18 {
    say -> "Adult"
} otherwise {
    say -> "Minor"
}

# Loop
loop 5 times {
    say -> "Repeating..."
}

# Function
task greet(name) {
    say -> "Hello " + name
    give name
}
```

---

## Language Reference

### Output
| Syntax | Description |
|--------|-------------|
| `say -> "text"` | Print text or variable |

### Variables & Input
| Syntax | Description |
|--------|-------------|
| `make x = 10` | Declare a variable |
| `ask x -> "prompt"` | Get user input |

### Conditions
| Syntax | Description |
|--------|-------------|
| `check x > 5 { }` | If statement |
| `check x > 5 { } otherwise { }` | If-else |

### Loops
| Syntax | Description |
|--------|-------------|
| `loop 3 times { }` | Repeat N times |
| `repeat while x < 10 { }` | While loop |
| `for each item in list { }` | For-each loop |

### Functions
| Syntax | Description |
|--------|-------------|
| `task name(params) { }` | Define a function |
| `give value` | Return a value |

### Data Structures
| Syntax | Description |
|--------|-------------|
| `make myStack` | Create a stack |
| `push value into myStack` | Push to stack |
| `pop from myStack` | Pop from stack |
| `insert value into myQueue` | Enqueue |
| `remove from myQueue` | Dequeue |
| `sort myArray ascending` | Sort array |
| `binary search value in myArray` | Binary search |
| `connect nodeA to nodeB` | Connect graph nodes |

### Machine Learning
| Syntax | Description |
|--------|-------------|
| `load "iris" as data` | Load a dataset |
| `train "knn" on data with labels as model` | Train a model |
| `predict model -> input` | Make a prediction |
| `evaluate model on data with labels` | Evaluate model |

### Operators
| Symbol | Meaning |
|--------|---------|
| `->` | Arrow (used with `say`, `ask`, `predict`) |
| `+` `-` `*` `/` `%` `**` | Arithmetic |
| `==` `!=` `<` `>` `<=` `>=` | Comparison |
| `and` `or` `not` | Logical |

### Comments
```syless
# This is a comment
```

---

## Snippets

Type any of these prefixes and press `Tab`:

| Prefix | Expands to |
|--------|-----------|
| `say` | `say -> ` |
| `make` | `make name = ` |
| `ask` | `ask name -> "prompt"` |
| `check` | If block |
| `checkelse` | If-else block |
| `loop` | Loop N times block |
| `repeat` | While loop block |
| `foreach` | For-each block |
| `task` | Function definition |
| `train` | ML train statement |
| `predict` | ML predict statement |

---

## Online IDE

Practice SYLESS in your browser — no installation needed:

**[https://syless-frontend.vercel.app/](https://syless-frontend.vercel.app/)**

---

## License

MIT
