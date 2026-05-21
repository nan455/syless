# SYLESS Language

**SYLESS** is an English-like programming language — write code the way you speak, no complex syntax required.

> **Try it live → [syless-frontend.vercel.app](https://syless-frontend.vercel.app/)**  
> Practice SYLESS directly in your browser with the online IDE, no setup needed.

---

## Developed by

**NANDACUMAAR** — *"just make it"* startup

---

## Features

- **Syntax highlighting** for all SYLESS keywords, strings, numbers, operators, and interpolated variables
- **Code snippets** — type a keyword and press `Tab` to expand a full template
- **Auto-closing brackets** — `{`, `[`, `(`, `"`, `'`
- **Auto-indent** — code indents automatically inside blocks
- **.sy file icon** — SYLESS files get their own icon in the file explorer
- **Run with F5** — execute any `.sy` file directly from the editor

---

## Getting Started

Create a file ending in `.sy` and start writing:

```syless
# Hello World
show "Hello, World!"

# String interpolation
make name = "SYLESS"
show "Welcome to {name}!"

# Variables + compound assignment
make score = 0
score += 50
score += 25
show "Score: {score}"

# Input
ask username -> "Enter your name: "

# Else-if chain with also check
check score >= 90 {
    show "Grade: A"
} also check score >= 70 {
    show "Grade: B"
} otherwise {
    show "Grade: C"
}

# Range loop with counter
loop i from 1 to 5 {
    show "Step: {i}"
}

# Function with default parameter
task greet(name, msg = "Hello") {
    show "{msg}, {name}!"
}

greet("World")
greet("SYLESS", "Welcome to")
```

---

## Language Reference

### Output
| Syntax | Description |
|--------|-------------|
| `say -> "text"` | Print — classic style |
| `say "text"` | Print — arrow is optional |
| `show "text"` | Print — friendliest, no arrow needed |
| `show "Hi {name}!"` | String interpolation — embed variables directly |

### Variables & Input
| Syntax | Description |
|--------|-------------|
| `make x = 10` | Declare a variable |
| `ask x -> "prompt"` | Get user input (auto-converts to number if possible) |
| `x += 5` | Add and assign |
| `x -= 5` | Subtract and assign |
| `x *= 2` | Multiply and assign |
| `x /= 2` | Divide and assign |
| `nothing` | Represents no value (alias for `null`) |

### Conditions
| Syntax | Description |
|--------|-------------|
| `check x > 5 { }` | If statement |
| `check x > 5 { } otherwise { }` | If-else |
| `} also check x > 3 { }` | Else-if — chain as many as needed |

### Loops
| Syntax | Description |
|--------|-------------|
| `loop 3 times { }` | Repeat exactly N times |
| `repeat 3 times { }` | Same as loop — alternate phrasing |
| `loop i from 1 to 10 { }` | Range loop — `i` goes from 1 to 10 inclusive |
| `repeat while x < 10 { }` | While loop |
| `for each item in list { }` | For-each loop over an array |

### Functions
| Syntax | Description |
|--------|-------------|
| `task name(param) { }` | Define a function |
| `task name(a, b = 0) { }` | Function with a default parameter value |
| `give value` | Return a value (like `return` in other languages) |

### Built-in Functions
| Syntax | Result | Description |
|--------|--------|-------------|
| `length of x` | number | Length of string or array |
| `upper of x` | string | Convert to UPPERCASE |
| `lower of x` | string | Convert to lowercase |
| `round of x` | number | Round to nearest integer |
| `absolute of x` | number | Absolute value (removes negative sign) |

### Data Structures
| Syntax | Description |
|--------|-------------|
| `make myStack` | Create a stack (name must contain "stack") |
| `push value into myStack` | Push to stack |
| `pop from myStack` | Pop from stack |
| `make myQueue` | Create a queue (name must contain "queue") |
| `insert value into myQueue` | Enqueue |
| `remove from myQueue` | Dequeue |
| `make linkedList` | Create a linked list (name must contain "linked") |
| `add value into linkedList` | Append to linked list |
| `make myTree` | Create a BST (name must contain "tree") |
| `insert value into myTree` | Insert into BST |
| `sort myArray ascending` | Sort array smallest to largest |
| `sort myArray descending` | Sort array largest to smallest |
| `binary search value in myArray` | Find index in sorted array |
| `connect nodeA to nodeB` | Add a bidirectional graph edge |

### Machine Learning
| Syntax | Description |
|--------|-------------|
| `load "iris" as data` | Load a built-in dataset |
| `train "knn" on data.data with data.target as model` | Train a model |
| `predict model -> [5.1, 3.5, 1.4, 0.2]` | Make a prediction |
| `evaluate model on data.data with data.target` | Evaluate model accuracy |

**Supported models:** `knn`, `tree`, `forest`, `linear`, `logistic`, `bayes`, `svm`  
**Supported datasets:** `iris`, `digits`, `wine`, `cancer`

### Operators
| Symbol | Meaning |
|--------|---------|
| `->` | Arrow (used with `say`, `ask`, `predict`) |
| `+` `-` `*` `/` `%` `**` | Arithmetic |
| `+=` `-=` `*=` `/=` | Compound assignment |
| `==` `!=` `<` `>` `<=` `>=` | Comparison |
| `and` `or` `not` | Logical |

### Comments
```syless
# This is a comment
show "Hello"  # inline comment
```

---

## Snippets

Type any of these prefixes and press `Tab`:

| Prefix | Expands to |
|--------|-----------|
| `say` | `say -> ` |
| `show` | `show ` |
| `make` | `make name = ` |
| `ask` | `ask name -> "prompt"` |
| `check` | If block |
| `checkelse` | If-else block |
| `checkalso` | If / else-if / else chain |
| `loop` | Loop N times |
| `loopfrom` | Range loop `loop i from 1 to 10` |
| `repeat` | Repeat N times |
| `repeatwhile` | While loop |
| `foreach` | For-each loop |
| `task` | Function definition |
| `taskdefault` | Function with default parameter |
| `length` | `length of ` |
| `upper` | `upper of ` |
| `lower` | `lower of ` |
| `train` | ML train statement |
| `predict` | ML predict statement |

---

## Online IDE

Practice SYLESS in your browser — no installation needed:

**[https://syless-frontend.vercel.app/](https://syless-frontend.vercel.app/)**

---

*SYLESS — Code Like You Think*  
*Developed by **NANDACUMAAR** · "just make it" startup*
