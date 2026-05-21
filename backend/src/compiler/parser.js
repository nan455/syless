'use strict';

/**
 * SYLESS Language Parser
 * Converts a token stream into an Abstract Syntax Tree (AST).
 */

const { TokenType } = require('./lexer');

class ParseError extends Error {
  constructor(message, token) {
    super(message);
    this.name = 'ParseError';
    this.token = token;
    this.line = token ? token.line : 0;
    this.friendlyMessage = token
      ? `Line ${token.line}: ${message}`
      : message;
  }
}

// AST Node factory
const Node = {
  Program: (body) => ({ type: 'Program', body }),
  Print: (value) => ({ type: 'Print', value }),
  VarDecl: (name, value) => ({ type: 'VarDecl', name, value }),
  Input: (name, prompt) => ({ type: 'Input', name, prompt }),
  IfStmt: (condition, body, elseBody) => ({ type: 'IfStmt', condition, body, elseBody }),
  ForLoop: (count, body) => ({ type: 'ForLoop', count, body }),
  WhileLoop: (condition, body) => ({ type: 'WhileLoop', condition, body }),
  ForEach: (item, iterable, body) => ({ type: 'ForEach', item, iterable, body }),
  FuncDef: (name, params, body) => ({ type: 'FuncDef', name, params, body }),
  Return: (value) => ({ type: 'Return', value }),
  FuncCall: (name, args) => ({ type: 'FuncCall', name, args }),
  BinaryOp: (op, left, right) => ({ type: 'BinaryOp', op, left, right }),
  UnaryOp: (op, operand) => ({ type: 'UnaryOp', op, operand }),
  Identifier: (name) => ({ type: 'Identifier', name }),
  Literal: (value) => ({ type: 'Literal', value }),
  ArrayLiteral: (elements) => ({ type: 'ArrayLiteral', elements }),
  Assign: (name, value) => ({ type: 'Assign', name, value }),
  TemplateLiteral: (raw) => ({ type: 'TemplateLiteral', raw }),
  CompoundAssign: (name, op, value) => ({ type: 'CompoundAssign', name, op, value }),
  RangeLoop: (counter, start, end, body) => ({ type: 'RangeLoop', counter, start, end, body }),
  BuiltinCall: (fn, arg) => ({ type: 'BuiltinCall', fn, arg }),
  // DSA
  DSAMake: (name, dataType) => ({ type: 'DSAMake', name, dataType }),
  DSAPush: (value, target) => ({ type: 'DSAPush', value, target }),
  DSAPop: (target) => ({ type: 'DSAPop', target }),
  DSAInsert: (value, target) => ({ type: 'DSAInsert', value, target }),
  DSARemove: (target) => ({ type: 'DSARemove', target }),
  DSAAdd: (value, target) => ({ type: 'DSAAdd', value, target }),
  DSAInsertTree: (value, target) => ({ type: 'DSAInsertTree', value, target }),
  DSASearchTree: (value, target) => ({ type: 'DSASearchTree', value, target }),
  GraphConnect: (nodeA, nodeB) => ({ type: 'GraphConnect', nodeA, nodeB }),
  Sort: (arr, order) => ({ type: 'Sort', arr, order }),
  BinarySearch: (value, arr) => ({ type: 'BinarySearch', value, arr }),
  OtherwiseStmt: (body) => ({ type: 'OtherwiseStmt', body }),
  MemberAccess: (object, property) => ({ type: 'MemberAccess', object, property }),
  DotAccess:    (object, property) => ({ type: 'DotAccess', object, property }),
  // ML nodes
  MLLoad:     (name, dataset)                      => ({ type: 'MLLoad', name, dataset }),
  MLTrain:    (modelType, data, labels, modelName) => ({ type: 'MLTrain', modelType, data, labels, modelName }),
  MLPredict:  (modelName, input)                   => ({ type: 'MLPredict', modelName, input }),
  MLEvaluate: (modelName, data, labels)            => ({ type: 'MLEvaluate', modelName, data, labels }),
};

const DSA_TYPES = ['stack', 'queue', 'linkedlist', 'tree', 'graph'];

class Parser {
  constructor(tokens) {
    this.tokens = tokens.filter(t => t.type !== TokenType.NEWLINE);
    this.pos = 0;
  }

  error(msg, token) {
    throw new ParseError(msg, token || this.peek());
  }

  peek(offset = 0) {
    const idx = this.pos + offset;
    return this.tokens[idx] || { type: TokenType.EOF, value: null };
  }

  advance() {
    const token = this.tokens[this.pos];
    this.pos++;
    return token;
  }

  check(type) {
    return this.peek().type === type;
  }

  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        return this.advance();
      }
    }
    return null;
  }

  expect(type, friendlyName) {
    if (this.check(type)) return this.advance();
    const found = this.peek();
    this.error(
      `Expected ${friendlyName || type} but found '${found.value || found.type}' — did you make a typo?`,
      found
    );
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }

  parse() {
    const body = [];
    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
    }
    return Node.Program(body);
  }

  parseStatement() {
    const tok = this.peek();

    switch (tok.type) {
      case TokenType.SAY:      return this.parseSay();
      case TokenType.MAKE:     return this.parseMake();
      case TokenType.ASK:      return this.parseAsk();
      case TokenType.CHECK:    return this.parseCheck();
      case TokenType.OTHERWISE:return this.parseOtherwise();
      case TokenType.LOOP:     return this.parseLoop();
      case TokenType.REPEAT:   return this.parseRepeat();
      case TokenType.TASK:     return this.parseTask();
      case TokenType.GIVE:     return this.parseGive();
      case TokenType.FOR:      return this.parseForEach();
      case TokenType.PUSH:     return this.parsePush();
      case TokenType.POP:      return this.parsePop();
      case TokenType.INSERT:   return this.parseInsert();
      case TokenType.REMOVE:   return this.parseRemoveOp();
      case TokenType.ADD:      return this.parseAddOp();
      case TokenType.SORT:     return this.parseSort();
      case TokenType.BINARY:   return this.parseBinarySearch();
      case TokenType.CONNECT:  return this.parseConnect();
      case TokenType.TRAIN:    return this.parseMLTrain();
      case TokenType.PREDICT:  return this.parseMLPredict();
      case TokenType.EVALUATE: return this.parseMLEvaluate();
      case TokenType.LOAD:     return this.parseMLLoad();
      case TokenType.IDENTIFIER: return this.parseIdentifierStatement();
      default:
        this.advance();
        return null;
    }
  }

  // say -> <expr>  OR  say <expr>  OR  show <expr>
  parseSay() {
    this.expect(TokenType.SAY, "'say'");
    if (this.check(TokenType.ARROW)) this.advance(); // -> is optional
    const value = this.parseExpression();
    return Node.Print(value);
  }

  // make <name> = <expr>  OR  make <name> (DSA type detection)
  parseMake() {
    this.expect(TokenType.MAKE, "'make'");
    const name = this.expect(TokenType.IDENTIFIER, "a variable name after 'make'").value;

    if (!this.check(TokenType.ASSIGN)) {
      const DSA_KEYWORDS = ['stack', 'queue', 'linked', 'tree', 'graph'];
      if (DSA_KEYWORDS.some(kw => name.toLowerCase().includes(kw))) {
        return Node.DSAMake(name, 'generic');
      }
      this.error(
        `Missing '=' after '${name}'. Did you mean:\n  make ${name} = 10\nTo create a data structure, include 'stack', 'queue', 'tree', 'graph', or 'linked' in the name:\n  make myStack`,
        this.peek()
      );
    }

    this.expect(TokenType.ASSIGN, "'='");
    const value = this.parseExpression();
    return Node.VarDecl(name, value);
  }

  // ask <name> -> <prompt>
  parseAsk() {
    this.expect(TokenType.ASK, "'ask'");
    const name = this.expect(TokenType.IDENTIFIER, "a variable name after 'ask'").value;
    if (!this.check(TokenType.ARROW)) {
      this.error(`Missing '->' after '${name}'. Write it like this:\n  ask ${name} -> "Enter a value: "`, this.peek());
    }
    this.advance();
    const prompt = this.parseExpression();
    return Node.Input(name, prompt);
  }

  // check <condition> { ... } [also check ...] [otherwise { ... }]
  parseCheck() {
    this.expect(TokenType.CHECK, "'check'");
    const condition = this.parseCondition();
    if (!this.check(TokenType.LBRACE)) {
      this.error(`Missing '{' after condition. Write it like this:\n  check condition {\n    say -> "yes"\n  }`, this.peek());
    }
    const body = this.parseBlock();
    let elseBody = null;
    if (this.check(TokenType.ALSO) && this.peek(1).type === TokenType.CHECK) {
      // "also check" = else-if chain
      this.advance(); // consume ALSO
      elseBody = [this.parseCheck()]; // recursive: returns IfStmt node
    } else if (this.check(TokenType.OTHERWISE) || this.check(TokenType.ELSE)) {
      this.advance();
      elseBody = this.parseBlock();
    }
    return Node.IfStmt(condition, body, elseBody);
  }

  parseOtherwise() {
    this.expect(TokenType.OTHERWISE, "'otherwise'");
    const body = this.parseBlock();
    return Node.OtherwiseStmt(body);
  }

  // loop <n> times { ... }  OR  loop counter from X to Y { ... }
  parseLoop() {
    this.expect(TokenType.LOOP, "'loop'");
    // Range loop: loop i from 1 to 10 { }
    if (this.check(TokenType.IDENTIFIER) && this.peek(1).type === TokenType.FROM) {
      const counter = this.advance().value;
      this.advance(); // FROM
      const start = this.parseExpression();
      this.expect(TokenType.TO, "'to'");
      const end = this.parseExpression();
      const body = this.parseBlock();
      return Node.RangeLoop(counter, start, end, body);
    }
    const count = this.parseExpression();
    if (!this.check(TokenType.TIMES)) {
      this.error(`Missing 'times' after the count. Write it like this:\n  loop 3 times {\n    say -> "hello"\n  }\nOr for a range:\n  loop i from 1 to 10 { }`, this.peek());
    }
    this.advance();
    const body = this.parseBlock();
    return Node.ForLoop(count, body);
  }

  // repeat while <condition> { ... }  OR  repeat N times { ... }
  parseRepeat() {
    this.expect(TokenType.REPEAT, "'repeat'");
    if (this.check(TokenType.WHILE)) {
      this.advance();
      const condition = this.parseCondition();
      const body = this.parseBlock();
      return Node.WhileLoop(condition, body);
    }
    // repeat N times { } — alias for loop N times
    const count = this.parseExpression();
    if (!this.check(TokenType.TIMES)) {
      this.error(`Missing 'times' after count. Write it as:\n  repeat 3 times { }\nOr for a while loop:\n  repeat while x < 10 { }`, this.peek());
    }
    this.advance();
    const body = this.parseBlock();
    return Node.ForLoop(count, body);
  }

  // task <name>(<params>) { ... }
  parseTask() {
    this.expect(TokenType.TASK, "'task'");
    const name = this.expect(TokenType.IDENTIFIER, "a function name").value;
    this.expect(TokenType.LPAREN, "'(' after function name");
    const params = this.parseParams();
    this.expect(TokenType.RPAREN, "')' to close parameters");
    const body = this.parseBlock();
    return Node.FuncDef(name, params, body);
  }

  parseParams() {
    const params = [];
    while (!this.check(TokenType.RPAREN) && !this.isAtEnd()) {
      const name = this.expect(TokenType.IDENTIFIER, "a parameter name").value;
      let defaultVal = null;
      if (this.check(TokenType.ASSIGN)) {
        this.advance();
        defaultVal = this.parseExpression();
      }
      params.push({ name, defaultVal });
      if (!this.match(TokenType.COMMA)) break;
    }
    return params;
  }

  // give <expr>
  parseGive() {
    this.expect(TokenType.GIVE, "'give'");
    const value = this.parseExpression();
    return Node.Return(value);
  }

  // for each <item> in <iterable> { ... }
  parseForEach() {
    this.expect(TokenType.FOR, "'for'");
    this.expect(TokenType.EACH, "'each' after 'for'");
    const item = this.expect(TokenType.IDENTIFIER, "an item variable name").value;
    this.expect(TokenType.IN, "'in'");
    const iterable = this.parseExpression();
    const body = this.parseBlock();
    return Node.ForEach(item, iterable, body);
  }

  // push <value> into <target>
  parsePush() {
    this.expect(TokenType.PUSH, "'push'");
    const value = this.parseExpression();
    this.expect(TokenType.INTO, "'into'");
    const target = this.expect(TokenType.IDENTIFIER, "a stack name").value;
    return Node.DSAPush(value, target);
  }

  // pop from <target>
  parsePop() {
    this.expect(TokenType.POP, "'pop'");
    this.expect(TokenType.FROM, "'from'");
    const target = this.expect(TokenType.IDENTIFIER, "a stack name").value;
    return Node.DSAPop(target);
  }

  // insert <value> into <target>
  parseInsert() {
    this.expect(TokenType.INSERT, "'insert'");
    const value = this.parseExpression();
    this.expect(TokenType.INTO, "'into'");
    const target = this.expect(TokenType.IDENTIFIER, "a queue or tree name").value;

    // Detect whether target is a tree or queue — we check DSA tracking later at code gen
    return Node.DSAInsert(value, target);
  }

  // remove from <target>
  parseRemoveOp() {
    this.expect(TokenType.REMOVE, "'remove'");
    this.expect(TokenType.FROM, "'from'");
    const target = this.expect(TokenType.IDENTIFIER, "a queue name").value;
    return Node.DSARemove(target);
  }

  // add <value> into <target>
  parseAddOp() {
    this.expect(TokenType.ADD, "'add'");
    const value = this.parseExpression();
    this.expect(TokenType.INTO, "'into'");
    const target = this.expect(TokenType.IDENTIFIER, "a linked list name").value;
    return Node.DSAAdd(value, target);
  }

  // sort <arr> ascending / descending
  parseSort() {
    this.expect(TokenType.SORT, "'sort'");
    const arr = this.expect(TokenType.IDENTIFIER, "an array name").value;
    let order = 'ascending';
    if (this.check(TokenType.ASCENDING)) { this.advance(); order = 'ascending'; }
    else if (this.check(TokenType.DESCENDING)) { this.advance(); order = 'descending'; }
    return Node.Sort(arr, order);
  }

  // binary search <value> in <arr>
  parseBinarySearch() {
    this.expect(TokenType.BINARY, "'binary'");
    this.expect(TokenType.SEARCH, "'search'");
    const value = this.parseExpression();
    this.expect(TokenType.IN, "'in'");
    const arr = this.expect(TokenType.IDENTIFIER, "an array name").value;
    return Node.BinarySearch(value, arr);
  }

  // connect <A> to <B>
  parseConnect() {
    this.expect(TokenType.CONNECT, "'connect'");
    const nodeA = this.expect(TokenType.IDENTIFIER, "a node name").value;
    this.expect(TokenType.TO, "'to'");
    const nodeB = this.expect(TokenType.IDENTIFIER, "another node name").value;
    return Node.GraphConnect(nodeA, nodeB);
  }

  parseMLLoad() {
    this.expect(TokenType.LOAD, "'load'");
    const dataset = this.expect(TokenType.STRING, "a dataset name like \"iris\"").value;
    this.expect(TokenType.AS, "'as'");
    const name = this.expect(TokenType.IDENTIFIER, "a variable name").value;
    return Node.MLLoad(name, dataset);
  }
  parseMLTrain() {
    this.expect(TokenType.TRAIN, "'train'");
    const modelType = this.expect(TokenType.STRING, "a model type like \"knn\"").value;
    this.expect(TokenType.ON, "'on'");
    const data = this.parseExpression();
    this.expect(TokenType.WITH, "'with'");
    const labels = this.parseExpression();
    this.expect(TokenType.AS, "'as'");
    const modelName = this.expect(TokenType.IDENTIFIER, "a model variable name").value;
    return Node.MLTrain(modelType, data, labels, modelName);
  }
  parseMLPredict() {
    this.expect(TokenType.PREDICT, "'predict'");
    const modelName = this.expect(TokenType.IDENTIFIER, "a model variable name").value;
    this.expect(TokenType.ARROW, "'->'");
    const input = this.parseExpression();
    return Node.MLPredict(modelName, input);
  }
  parseMLEvaluate() {
    this.expect(TokenType.EVALUATE, "'evaluate'");
    const modelName = this.expect(TokenType.IDENTIFIER, "a model variable name").value;
    this.expect(TokenType.ON, "'on'");
    const data = this.parseExpression();
    this.expect(TokenType.WITH, "'with'");
    const labels = this.parseExpression();
    return Node.MLEvaluate(modelName, data, labels);
  }

  // Identifier statement: assignment, compound assignment, or function call
  parseIdentifierStatement() {
    const name = this.advance().value;

    if (this.check(TokenType.ASSIGN)) {
      this.advance();
      const value = this.parseExpression();
      return Node.Assign(name, value);
    }

    const compoundOps = {
      [TokenType.PLUS_ASSIGN]: '+',
      [TokenType.MINUS_ASSIGN]: '-',
      [TokenType.MULT_ASSIGN]: '*',
      [TokenType.DIV_ASSIGN]: '/',
    };
    if (compoundOps[this.peek().type]) {
      const opTok = this.advance();
      const op = compoundOps[opTok.type];
      const value = this.parseExpression();
      // Desugar: score += 5  →  Assign('score', BinaryOp('+', Identifier('score'), 5))
      return Node.Assign(name, Node.BinaryOp(op, Node.Identifier(name), value));
    }

    if (this.check(TokenType.LPAREN)) {
      this.advance();
      const args = this.parseArgs();
      this.expect(TokenType.RPAREN, "')'");
      return Node.FuncCall(name, args);
    }

    return Node.Identifier(name);
  }

  parseBlock() {
    this.expect(TokenType.LBRACE, "'{' to open a block");
    const body = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
    }
    this.expect(TokenType.RBRACE, "'}' to close the block — did you forget to close it?");
    return body;
  }

  parseArgs() {
    const args = [];
    while (!this.check(TokenType.RPAREN) && !this.isAtEnd()) {
      args.push(this.parseExpression());
      if (!this.match(TokenType.COMMA)) break;
    }
    return args;
  }

  parseCondition() {
    return this.parseLogical();
  }

  parseLogical() {
    let left = this.parseComparison();
    while (this.check(TokenType.AND) || this.check(TokenType.OR)) {
      const op = this.advance().value;
      const right = this.parseComparison();
      left = Node.BinaryOp(op, left, right);
    }
    return left;
  }

  parseComparison() {
    let left = this.parseExpression();
    const compOps = [
      TokenType.EQ, TokenType.NEQ, TokenType.LT,
      TokenType.GT, TokenType.LTE, TokenType.GTE,
    ];
    while (compOps.some(t => this.check(t))) {
      const op = this.advance().value;
      const right = this.parseExpression();
      left = Node.BinaryOp(op, left, right);
    }
    return left;
  }

  parseExpression() {
    return this.parseAddSub();
  }

  parseAddSub() {
    let left = this.parseMulDiv();
    while (this.check(TokenType.PLUS) || this.check(TokenType.MINUS)) {
      const op = this.advance().value;
      const right = this.parseMulDiv();
      left = Node.BinaryOp(op, left, right);
    }
    return left;
  }

  parseMulDiv() {
    let left = this.parseUnary();
    while (
      this.check(TokenType.MULTIPLY) ||
      this.check(TokenType.DIVIDE) ||
      this.check(TokenType.MODULO) ||
      this.check(TokenType.POWER)
    ) {
      const op = this.advance().value;
      const right = this.parseUnary();
      left = Node.BinaryOp(op, left, right);
    }
    return left;
  }

  parseUnary() {
    if (this.check(TokenType.MINUS)) {
      this.advance();
      return Node.UnaryOp('-', this.parsePrimary());
    }
    if (this.check(TokenType.NOT)) {
      this.advance();
      return Node.UnaryOp('not', this.parsePrimary());
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const tok = this.peek();

    if (tok.type === TokenType.NUMBER) {
      this.advance();
      return Node.Literal(tok.value);
    }

    if (tok.type === TokenType.STRING) {
      this.advance();
      return tok.isTemplate ? Node.TemplateLiteral(tok.value) : Node.Literal(tok.value);
    }

    if (tok.type === TokenType.TRUE) {
      this.advance();
      return Node.Literal(true);
    }

    if (tok.type === TokenType.FALSE) {
      this.advance();
      return Node.Literal(false);
    }

    if (tok.type === TokenType.NULL) {
      this.advance();
      return Node.Literal(null);
    }

    if (tok.type === TokenType.LBRACKET) {
      return this.parseArrayLiteral();
    }

    if (tok.type === TokenType.LPAREN) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenType.RPAREN, "')'");
      return expr;
    }

    // Builtin calls: length of x, upper of x, lower of x, round of x, absolute of x
    const BUILTINS = {
      [TokenType.LENGTH]: 'len',
      [TokenType.UPPER]: 'upper',
      [TokenType.LOWER]: 'lower',
      [TokenType.ROUND]: 'round',
      [TokenType.ABSOLUTE]: 'abs',
    };
    if (BUILTINS[tok.type] !== undefined) {
      const fn = BUILTINS[this.advance().type];
      this.expect(TokenType.OF, `'of' after '${tok.value}' — e.g. length of myList`);
      const arg = this.parseExpression();
      return Node.BuiltinCall(fn, arg);
    }

    if (tok.type === TokenType.IDENTIFIER) {
      this.advance();
      // Function call
      if (this.check(TokenType.LPAREN)) {
        this.advance();
        const args = this.parseArgs();
        this.expect(TokenType.RPAREN, "')'");
        return Node.FuncCall(tok.value, args);
      }
      // Array/member access
      if (this.check(TokenType.LBRACKET)) {
        this.advance();
        const index = this.parseExpression();
        this.expect(TokenType.RBRACKET, "']'");
        return Node.MemberAccess(Node.Identifier(tok.value), index);
      }
      // Dot/attribute access (e.g. dataset.data, dataset.target)
      if (this.check(TokenType.DOT)) {
        this.advance();
        const prop = this.expect(TokenType.IDENTIFIER, "a property name after '.'").value;
        return Node.DotAccess(Node.Identifier(tok.value), prop);
      }
      return Node.Identifier(tok.value);
    }

    this.error(
      `Unexpected '${tok.value || tok.type}' — this doesn't look like a valid value`,
      tok
    );
  }

  parseArrayLiteral() {
    this.expect(TokenType.LBRACKET, "'['");
    const elements = [];
    while (!this.check(TokenType.RBRACKET) && !this.isAtEnd()) {
      elements.push(this.parseExpression());
      if (!this.match(TokenType.COMMA)) break;
    }
    this.expect(TokenType.RBRACKET, "']' to close the array");
    return Node.ArrayLiteral(elements);
  }
}

module.exports = { Parser, ParseError, Node };
