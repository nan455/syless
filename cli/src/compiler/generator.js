'use strict';

class GeneratorError extends Error {
  constructor(message, node) {
    super(message);
    this.name = 'GeneratorError';
    this.node = node;
    this.friendlyMessage = message;
  }
}

const DSA_INIT_CODE = {
  stack:      (n) => `${n} = []`,
  queue:      (n) => `from collections import deque\n${n} = deque()`,
  linkedlist: (n) => `${n} = []`,
  tree:       (n) => `${n} = {}\n_${n}_root = [None]`,
  graph:      ()  => `_graph = {}`,
  generic:    (n) => `${n} = []`,
};

const INPUT_HELPER = `
def _syless_input(prompt=""):
    s = input(prompt)
    try: return int(s)
    except ValueError: pass
    try: return float(s)
    except ValueError: return s
`;

const DSA_HELPERS = `
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
`;

class Generator {
  constructor() {
    this.indentLevel = 0;
    this.output = [];
    this.dsaTypes = {};
    this.needsDSAHelpers = false;
    this.needsInputHelper = false;
    this.graphInited = false;
    this.mlImports = new Set();
  }

  indent()       { return '    '.repeat(this.indentLevel); }
  emit(line)     { this.output.push(this.indent() + line); }
  emitRaw(line)  { this.output.push(line); }

  generate(ast) {
    if (ast.type !== 'Program') throw new GeneratorError('Expected a Program node');
    const body = [];
    this.output = body;
    for (const node of ast.body) this.genStatement(node);
    const final = [];
    if (this.mlImports.size > 0) final.push([...this.mlImports].join('\n'));
    if (this.needsInputHelper) final.push(INPUT_HELPER);
    if (this.needsDSAHelpers) final.push(DSA_HELPERS);
    final.push(...body);
    return final.join('\n');
  }

  genStatement(node) {
    if (!node) return;
    switch (node.type) {
      case 'Print':         return this.genPrint(node);
      case 'VarDecl':       return this.emit(`${node.name} = ${this.genExpr(node.value)}`);
      case 'Assign':        return this.emit(`${node.name} = ${this.genExpr(node.value)}`);
      case 'Input':         return this.genInput(node);
      case 'IfStmt':        return this.genIf(node);
      case 'OtherwiseStmt': return this.genOtherwise(node);
      case 'ForLoop':       return this.genForLoop(node);
      case 'WhileLoop':     return this.genWhileLoop(node);
      case 'ForEach':       return this.genForEach(node);
      case 'FuncDef':       return this.genFuncDef(node);
      case 'Return':        return this.emit(`return ${this.genExpr(node.value)}`);
      case 'FuncCall':      return this.emit(this.genExpr(node));
      case 'DSAMake':       return this.genDSAMake(node);
      case 'DSAPush':       return this.emit(`${node.target}.append(${this.genExpr(node.value)})`);
      case 'DSAPop':        return this.emit(`${node.target}.pop()`);
      case 'DSAInsert':     return this.genDSAInsert(node);
      case 'DSARemove':     return this.emit(`${node.target}.popleft()`);
      case 'DSAAdd':        return this.emit(`${node.target}.append(${this.genExpr(node.value)})`);
      case 'GraphConnect':  return this.genGraphConnect(node);
      case 'Sort':          return this.emit(`${node.arr}.sort(reverse=${node.order === 'descending' ? 'True' : 'False'})`);
      case 'BinarySearch':  return this.genBinarySearch(node);
      case 'MLLoad':        return this.genMLLoad(node);
      case 'MLTrain':       return this.genMLTrain(node);
      case 'MLPredict':     return this.genMLPredict(node);
      case 'MLEvaluate':    return this.genMLEvaluate(node);
      case 'Identifier':    return;
      default: throw new GeneratorError(`Unknown AST node: ${node.type}`, node);
    }
  }

  genPrint(node) {
    let expr = this.genExpr(node.value);
    if (node.value?.type === 'Identifier' && this.dsaTypes[node.value.name] === 'queue') expr = `list(${expr})`;
    this.emit(`print(${expr})`);
  }

  genInput(node) {
    this.needsInputHelper = true;
    const prompt = node.prompt ? this.genExpr(node.prompt) : '""';
    this.emit(`${node.name} = _syless_input(${prompt})`);
  }

  genIf(node) {
    this.emit(`if ${this.genExpr(node.condition)}:`);
    this.indentLevel++;
    if (!node.body.length) this.emit('pass');
    for (const s of node.body) this.genStatement(s);
    this.indentLevel--;
    if (node.elseBody) {
      this.emit('else:');
      this.indentLevel++;
      if (!node.elseBody.length) this.emit('pass');
      for (const s of node.elseBody) this.genStatement(s);
      this.indentLevel--;
    }
  }

  genOtherwise(node) {
    this.emit('else:');
    this.indentLevel++;
    if (!node.body.length) this.emit('pass');
    for (const s of node.body) this.genStatement(s);
    this.indentLevel--;
  }

  genForLoop(node) {
    this.emit(`for _i in range(${this.genExpr(node.count)}):`);
    this.indentLevel++;
    if (!node.body.length) this.emit('pass');
    for (const s of node.body) this.genStatement(s);
    this.indentLevel--;
  }

  genWhileLoop(node) {
    this.emit(`while ${this.genExpr(node.condition)}:`);
    this.indentLevel++;
    if (!node.body.length) this.emit('pass');
    for (const s of node.body) this.genStatement(s);
    this.indentLevel--;
  }

  genForEach(node) {
    this.emit(`for ${node.item} in ${this.genExpr(node.iterable)}:`);
    this.indentLevel++;
    if (!node.body.length) this.emit('pass');
    for (const s of node.body) this.genStatement(s);
    this.indentLevel--;
  }

  genFuncDef(node) {
    this.emit(`def ${node.name}(${node.params.join(', ')}):`);
    this.indentLevel++;
    if (!node.body.length) this.emit('pass');
    for (const s of node.body) this.genStatement(s);
    this.indentLevel--;
  }

  genDSAMake(node) {
    const dsaType = dsaTypeOf(node.name, node.dataType);
    this.dsaTypes[node.name] = dsaType;
    if (dsaType === 'tree' || dsaType === 'queue') this.needsDSAHelpers = true;
    const initFn = DSA_INIT_CODE[dsaType] || DSA_INIT_CODE.generic;
    for (const line of initFn(node.name).split('\n')) this.output.push(this.indent() + line);
  }

  genDSAInsert(node) {
    if (this.dsaTypes[node.target] === 'queue') {
      this.emit(`${node.target}.append(${this.genExpr(node.value)})`);
    } else {
      this.needsDSAHelpers = true;
      this.emit(`_syless_bst_insert(_${node.target}_root, ${this.genExpr(node.value)})`);
    }
  }

  genGraphConnect(node) {
    if (!this.graphInited) { this.output.unshift('_graph = {}'); this.graphInited = true; }
    this.emit(`_graph.setdefault('${node.nodeA}', []).append('${node.nodeB}')`);
    this.emit(`_graph.setdefault('${node.nodeB}', []).append('${node.nodeA}')`);
  }

  genBinarySearch(node) {
    this.needsDSAHelpers = true;
    const t = this.genExpr(node.value);
    this.emit(`_bs_result = _syless_binary_search(${node.arr}, ${t})`);
    this.emit(`if _bs_result >= 0:`);
    this.indentLevel++;
    this.emit(`print("Found " + str(${t}) + " at index " + str(_bs_result))`);
    this.indentLevel--;
    this.emit('else:');
    this.indentLevel++;
    this.emit(`print(str(${t}) + " not found")`);
    this.indentLevel--;
  }

  genMLLoad(node) {
    const DATASETS = {
      iris: 'load_iris', digits: 'load_digits', wine: 'load_wine', cancer: 'load_breast_cancer',
    };
    const fn = DATASETS[node.dataset.toLowerCase()] || 'load_iris';
    this.mlImports.add(`from sklearn.datasets import ${fn}`);
    this.emit(`${node.name} = ${fn}()`);
  }

  genMLTrain(node) {
    const MODELS = {
      knn:      ['sklearn.neighbors',    'KNeighborsClassifier'],
      tree:     ['sklearn.tree',         'DecisionTreeClassifier'],
      forest:   ['sklearn.ensemble',     'RandomForestClassifier'],
      linear:   ['sklearn.linear_model', 'LinearRegression'],
      logistic: ['sklearn.linear_model', 'LogisticRegression'],
      bayes:    ['sklearn.naive_bayes',  'GaussianNB'],
      svm:      ['sklearn.svm',          'SVC'],
    };
    const [module, cls] = MODELS[node.modelType.toLowerCase()] || MODELS.knn;
    this.mlImports.add(`from ${module} import ${cls}`);
    const data = this.genExpr(node.data);
    const labels = this.genExpr(node.labels);
    this.emit(`${node.modelName} = ${cls}()`);
    this.emit(`${node.modelName}.fit(${data}, ${labels})`);
    this.emit(`print("Model '${node.modelType}' trained successfully!")`);
  }

  genMLPredict(node) {
    const input = this.genExpr(node.input);
    const wrapped = node.input.type === 'ArrayLiteral' ? `[${input}]` : input;
    this.emit(`_pred = ${node.modelName}.predict(${wrapped})`);
    this.emit(`print("Prediction:", _pred)`);
  }

  genMLEvaluate(node) {
    this.mlImports.add('from sklearn.metrics import accuracy_score');
    const data = this.genExpr(node.data);
    const labels = this.genExpr(node.labels);
    this.emit(`_score = accuracy_score(${labels}, ${node.modelName}.predict(${data}))`);
    this.emit(`print("Accuracy:", str(round(_score * 100, 2)) + "%")`);
  }

  genExpr(node) {
    if (!node) return 'None';
    switch (node.type) {
      case 'Literal': {
        const v = node.value;
        if (v === null) return 'None';
        if (v === true) return 'True';
        if (v === false) return 'False';
        if (typeof v === 'string') return JSON.stringify(v);
        return String(v);
      }
      case 'Identifier':   return node.name;
      case 'BinaryOp': {
        const op = node.op === 'and' ? 'and' : node.op === 'or' ? 'or' : node.op;
        return `(${this.genExpr(node.left)} ${op} ${this.genExpr(node.right)})`;
      }
      case 'UnaryOp':      return `${node.op} ${this.genExpr(node.operand)}`;
      case 'ArrayLiteral': return `[${node.elements.map(e => this.genExpr(e)).join(', ')}]`;
      case 'FuncCall':     return `${node.name}(${node.args.map(a => this.genExpr(a)).join(', ')})`;
      case 'MemberAccess': return `${this.genExpr(node.object)}[${this.genExpr(node.property)}]`;
      case 'DotAccess':    return `${this.genExpr(node.object)}.${node.property}`;
      default: throw new GeneratorError(`Cannot generate expression for: ${node.type}`, node);
    }
  }
}

function dsaTypeOf(name, hint) {
  const n = name.toLowerCase();
  if (n.includes('stack'))      return 'stack';
  if (n.includes('queue'))      return 'queue';
  if (n.includes('linkedlist') || n.includes('linked')) return 'linkedlist';
  if (n.includes('tree'))       return 'tree';
  if (n.includes('graph'))      return 'graph';
  return hint || 'generic';
}

module.exports = { Generator, GeneratorError };
