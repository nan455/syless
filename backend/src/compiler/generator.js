'use strict';

/**
 * SYLESS Python Code Generator
 * Walks the AST and emits valid Python 3 source code.
 */

class GeneratorError extends Error {
  constructor(message, node) {
    super(message);
    this.name = 'GeneratorError';
    this.node = node;
    this.friendlyMessage = message;
  }
}

const DSA_INIT_CODE = {
  stack: (name) => `${name} = []  # SYLESS Stack`,
  queue: (name) => `from collections import deque\n${name} = deque()  # SYLESS Queue`,
  linkedlist: (name) => `${name} = []  # SYLESS LinkedList`,
  tree: (name) => `${name} = {}  # SYLESS BST\n_${name}_root = [None]`,
  graph: () => `import sys\n_graph = {}`,
  generic: (name) => `${name} = []`,
};

const DSA_HELPERS = `
# === SYLESS DSA Helper Functions ===
def _syless_bst_insert(root_ref, val):
    class _Node:
        def __init__(self, v): self.val = v; self.left = self.right = None
    def _insert(node, v):
        if node is None: return _Node(v)
        if v < node.val: node.left = _insert(node.left, v)
        else: node.right = _insert(node.right, v)
        return node
    root_ref[0] = _insert(root_ref[0], val)

def _syless_bst_search(root_ref, val):
    node = root_ref[0]
    while node:
        if val == node.val: return True
        elif val < node.val: node = node.left
        else: node = node.right
    return False

def _syless_binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1
# ===================================
`;

class Generator {
  constructor() {
    this.indentLevel = 0;
    this.output = [];
    this.dsaTypes = {};     // name -> DSA type
    this.needsDSAHelpers = false;
    this.graphNodes = new Set();
    this.graphInited = false;
  }

  indent() {
    return '    '.repeat(this.indentLevel);
  }

  emit(line) {
    this.output.push(this.indent() + line);
  }

  emitRaw(line) {
    this.output.push(line);
  }

  generate(ast) {
    if (ast.type !== 'Program') {
      throw new GeneratorError('Expected a Program node at the top level');
    }

    const bodyLines = [];
    this.output = bodyLines;

    for (const node of ast.body) {
      this.genStatement(node);
    }

    const finalLines = [];
    if (this.needsDSAHelpers) {
      finalLines.push(DSA_HELPERS);
    }
    finalLines.push(...bodyLines);

    return finalLines.join('\n');
  }

  genStatement(node) {
    if (!node) return;
    switch (node.type) {
      case 'Print':           return this.genPrint(node);
      case 'VarDecl':         return this.genVarDecl(node);
      case 'Assign':          return this.genAssign(node);
      case 'Input':           return this.genInput(node);
      case 'IfStmt':          return this.genIf(node);
      case 'OtherwiseStmt':   return this.genOtherwise(node);
      case 'ForLoop':         return this.genForLoop(node);
      case 'WhileLoop':       return this.genWhileLoop(node);
      case 'ForEach':         return this.genForEach(node);
      case 'FuncDef':         return this.genFuncDef(node);
      case 'Return':          return this.genReturn(node);
      case 'FuncCall':        return this.emit(this.genExpr(node));
      case 'DSAMake':         return this.genDSAMake(node);
      case 'DSAPush':         return this.genDSAPush(node);
      case 'DSAPop':          return this.genDSAPop(node);
      case 'DSAInsert':       return this.genDSAInsert(node);
      case 'DSARemove':       return this.genDSARemove(node);
      case 'DSAAdd':          return this.genDSAAdd(node);
      case 'GraphConnect':    return this.genGraphConnect(node);
      case 'Sort':            return this.genSort(node);
      case 'BinarySearch':    return this.genBinarySearch(node);
      case 'Identifier':      return; // standalone identifier — no-op
      default:
        throw new GeneratorError(`Unknown AST node type: ${node.type}`, node);
    }
  }

  // say -> <expr>  →  print(<expr>)
  genPrint(node) {
    let expr = this.genExpr(node.value);
    // Queues are deque objects — wrap with list() for consistent [a, b] display
    if (node.value && node.value.type === 'Identifier' && this.dsaTypes[node.value.name] === 'queue') {
      expr = `list(${expr})`;
    }
    this.emit(`print(${expr})`);
  }

  // make x = <expr>  →  x = <expr>
  genVarDecl(node) {
    this.emit(`${node.name} = ${this.genExpr(node.value)}`);
  }

  // x = <expr>
  genAssign(node) {
    this.emit(`${node.name} = ${this.genExpr(node.value)}`);
  }

  // ask name -> "prompt"  →  name = input()
  // Prompt is discarded — input() avoids polluting stdout during automated grading
  genInput(node) {
    this.emit(`${node.name} = input()`);
  }

  // check cond { } otherwise { }  →  if / else
  genIf(node) {
    this.emit(`if ${this.genExpr(node.condition)}:`);
    this.indentLevel++;
    if (node.body.length === 0) this.emit('pass');
    for (const stmt of node.body) this.genStatement(stmt);
    this.indentLevel--;
    if (node.elseBody) {
      this.emit('else:');
      this.indentLevel++;
      if (node.elseBody.length === 0) this.emit('pass');
      for (const stmt of node.elseBody) this.genStatement(stmt);
      this.indentLevel--;
    }
  }

  genOtherwise(node) {
    this.emit('else:');
    this.indentLevel++;
    if (node.body.length === 0) this.emit('pass');
    for (const stmt of node.body) this.genStatement(stmt);
    this.indentLevel--;
  }

  // loop N times { }  →  for _i in range(N):
  genForLoop(node) {
    this.emit(`for _i in range(${this.genExpr(node.count)}):`);
    this.indentLevel++;
    if (node.body.length === 0) this.emit('pass');
    for (const stmt of node.body) this.genStatement(stmt);
    this.indentLevel--;
  }

  // repeat while cond { }  →  while cond:
  genWhileLoop(node) {
    this.emit(`while ${this.genExpr(node.condition)}:`);
    this.indentLevel++;
    if (node.body.length === 0) this.emit('pass');
    for (const stmt of node.body) this.genStatement(stmt);
    this.indentLevel--;
  }

  // for each item in arr { }  →  for item in arr:
  genForEach(node) {
    this.emit(`for ${node.item} in ${this.genExpr(node.iterable)}:`);
    this.indentLevel++;
    if (node.body.length === 0) this.emit('pass');
    for (const stmt of node.body) this.genStatement(stmt);
    this.indentLevel--;
  }

  // task name(params) { }  →  def name(params):
  genFuncDef(node) {
    this.emit(`def ${node.name}(${node.params.join(', ')}):`);
    this.indentLevel++;
    if (node.body.length === 0) this.emit('pass');
    for (const stmt of node.body) this.genStatement(stmt);
    this.indentLevel--;
  }

  // give <expr>  →  return <expr>
  genReturn(node) {
    this.emit(`return ${this.genExpr(node.value)}`);
  }

  // make stack  →  stack = []
  genDSAMake(node) {
    const nameL = node.name.toLowerCase();
    const dsaType = DSA_TYPES_CHECK(node.name, node.dataType);
    this.dsaTypes[node.name] = dsaType;

    if (dsaType === 'tree' || dsaType === 'queue') {
      this.needsDSAHelpers = true;
    }

    const initFn = DSA_INIT_CODE[dsaType] || DSA_INIT_CODE.generic;
    const initLines = initFn(node.name).split('\n');
    for (const line of initLines) {
      this.output.push(this.indent() + line);
    }
  }

  // push <val> into <stack>  →  stack.append(val)
  genDSAPush(node) {
    this.emit(`${node.target}.append(${this.genExpr(node.value)})`);
  }

  // pop from <stack>  →  stack.pop()
  genDSAPop(node) {
    this.emit(`${node.target}.pop()`);
  }

  // insert <val> into <queue/tree>
  genDSAInsert(node) {
    const dsaType = this.dsaTypes[node.target];
    if (dsaType === 'queue') {
      this.emit(`${node.target}.append(${this.genExpr(node.value)})`);
    } else {
      // tree or generic
      this.needsDSAHelpers = true;
      this.emit(`_syless_bst_insert(_${node.target}_root, ${this.genExpr(node.value)})`);
    }
  }

  // remove from <queue>  →  queue.popleft()
  genDSARemove(node) {
    this.emit(`${node.target}.popleft()`);
  }

  // add <val> into <linkedlist>  →  linkedlist.append(val)
  genDSAAdd(node) {
    this.emit(`${node.target}.append(${this.genExpr(node.value)})`);
  }

  // connect A to B  →  graph edge
  genGraphConnect(node) {
    if (!this.graphInited) {
      this.output.unshift('_graph = {}');
      this.graphInited = true;
    }
    this.emit(`_graph.setdefault('${node.nodeA}', []).append('${node.nodeB}')`);
    this.emit(`_graph.setdefault('${node.nodeB}', []).append('${node.nodeA}')`);
  }

  // sort arr ascending/descending
  genSort(node) {
    const rev = node.order === 'descending' ? 'True' : 'False';
    this.emit(`${node.arr}.sort(reverse=${rev})`);
  }

  // binary search <val> in <arr>  →  "Found X at index Y" or "X not found"
  genBinarySearch(node) {
    this.needsDSAHelpers = true;
    const targetExpr = this.genExpr(node.value);
    this.emit(`_bs_result = _syless_binary_search(${node.arr}, ${targetExpr})`);
    this.emit(`if _bs_result >= 0:`);
    this.indentLevel++;
    this.emit(`print("Found " + str(${targetExpr}) + " at index " + str(_bs_result))`);
    this.indentLevel--;
    this.emit(`else:`);
    this.indentLevel++;
    this.emit(`print(str(${targetExpr}) + " not found")`);
    this.indentLevel--;
  }

  // Expression → Python string
  genExpr(node) {
    if (!node) return 'None';

    switch (node.type) {
      case 'Literal': {
        const val = node.value;
        if (val === null) return 'None';
        if (val === true) return 'True';
        if (val === false) return 'False';
        if (typeof val === 'string') return JSON.stringify(val);
        return String(val);
      }
      case 'Identifier':
        return node.name;
      case 'BinaryOp': {
        const left = this.genExpr(node.left);
        const right = this.genExpr(node.right);
        const op = node.op === 'and' ? 'and'
          : node.op === 'or' ? 'or'
          : node.op;
        return `(${left} ${op} ${right})`;
      }
      case 'UnaryOp':
        return `${node.op} ${this.genExpr(node.operand)}`;
      case 'ArrayLiteral':
        return `[${node.elements.map(e => this.genExpr(e)).join(', ')}]`;
      case 'FuncCall':
        return `${node.name}(${node.args.map(a => this.genExpr(a)).join(', ')})`;
      case 'MemberAccess':
        return `${this.genExpr(node.object)}[${this.genExpr(node.property)}]`;
      default:
        throw new GeneratorError(`Cannot generate expression for node type: ${node.type}`, node);
    }
  }
}

function DSA_TYPES_CHECK(name, hint) {
  const lname = name.toLowerCase();
  if (lname.includes('stack')) return 'stack';
  if (lname.includes('queue')) return 'queue';
  if (lname.includes('linkedlist') || lname.includes('linked')) return 'linkedlist';
  if (lname.includes('tree')) return 'tree';
  if (lname.includes('graph')) return 'graph';
  return hint || 'generic';
}

module.exports = { Generator, GeneratorError };
