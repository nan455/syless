'use strict';

const { TokenType } = require('./lexer');

class ParseError extends Error {
  constructor(message, token) {
    super(message);
    this.name = 'ParseError';
    this.token = token;
    this.line = token ? token.line : 0;
    this.friendlyMessage = token ? `Line ${token.line}: ${message}` : message;
  }
}

const Node = {
  Program:      (body)                => ({ type: 'Program', body }),
  Print:        (value)               => ({ type: 'Print', value }),
  VarDecl:      (name, value)         => ({ type: 'VarDecl', name, value }),
  Input:        (name, prompt)        => ({ type: 'Input', name, prompt }),
  IfStmt:       (condition, body, elseBody) => ({ type: 'IfStmt', condition, body, elseBody }),
  ForLoop:      (count, body)         => ({ type: 'ForLoop', count, body }),
  WhileLoop:    (condition, body)     => ({ type: 'WhileLoop', condition, body }),
  ForEach:      (item, iterable, body)=> ({ type: 'ForEach', item, iterable, body }),
  FuncDef:      (name, params, body)  => ({ type: 'FuncDef', name, params, body }),
  Return:       (value)               => ({ type: 'Return', value }),
  FuncCall:     (name, args)          => ({ type: 'FuncCall', name, args }),
  BinaryOp:     (op, left, right)     => ({ type: 'BinaryOp', op, left, right }),
  UnaryOp:      (op, operand)         => ({ type: 'UnaryOp', op, operand }),
  Identifier:   (name)               => ({ type: 'Identifier', name }),
  Literal:      (value)              => ({ type: 'Literal', value }),
  ArrayLiteral: (elements)           => ({ type: 'ArrayLiteral', elements }),
  Assign:       (name, value)        => ({ type: 'Assign', name, value }),
  DSAMake:      (name, dataType)     => ({ type: 'DSAMake', name, dataType }),
  DSAPush:      (value, target)      => ({ type: 'DSAPush', value, target }),
  DSAPop:       (target)             => ({ type: 'DSAPop', target }),
  DSAInsert:    (value, target)      => ({ type: 'DSAInsert', value, target }),
  DSARemove:    (target)             => ({ type: 'DSARemove', target }),
  DSAAdd:       (value, target)      => ({ type: 'DSAAdd', value, target }),
  DSAInsertTree:(value, target)      => ({ type: 'DSAInsertTree', value, target }),
  DSASearchTree:(value, target)      => ({ type: 'DSASearchTree', value, target }),
  GraphConnect: (nodeA, nodeB)       => ({ type: 'GraphConnect', nodeA, nodeB }),
  Sort:         (arr, order)         => ({ type: 'Sort', arr, order }),
  BinarySearch: (value, arr)         => ({ type: 'BinarySearch', value, arr }),
  OtherwiseStmt:(body)               => ({ type: 'OtherwiseStmt', body }),
  MemberAccess: (object, property)   => ({ type: 'MemberAccess', object, property }),
};

const DSA_TYPES = ['stack', 'queue', 'linkedlist', 'tree', 'graph'];

class Parser {
  constructor(tokens) {
    this.tokens = tokens.filter(t => t.type !== TokenType.NEWLINE);
    this.pos = 0;
  }

  error(msg, token) { throw new ParseError(msg, token || this.peek()); }
  peek(offset = 0) { return this.tokens[this.pos + offset] || { type: TokenType.EOF, value: null }; }
  advance() { return this.tokens[this.pos++]; }
  check(type) { return this.peek().type === type; }
  match(...types) { for (const t of types) if (this.check(t)) return this.advance(); return null; }
  isAtEnd() { return this.peek().type === TokenType.EOF; }

  expect(type, friendly) {
    if (this.check(type)) return this.advance();
    const found = this.peek();
    this.error(`Expected ${friendly || type} but found '${found.value || found.type}'`, found);
  }

  parse() {
    const body = [];
    while (!this.isAtEnd()) { const s = this.parseStatement(); if (s) body.push(s); }
    return Node.Program(body);
  }

  parseStatement() {
    const tok = this.peek();
    switch (tok.type) {
      case TokenType.SAY:        return this.parseSay();
      case TokenType.MAKE:       return this.parseMake();
      case TokenType.ASK:        return this.parseAsk();
      case TokenType.CHECK:      return this.parseCheck();
      case TokenType.OTHERWISE:  return this.parseOtherwise();
      case TokenType.LOOP:       return this.parseLoop();
      case TokenType.REPEAT:     return this.parseRepeat();
      case TokenType.TASK:       return this.parseTask();
      case TokenType.GIVE:       return this.parseGive();
      case TokenType.FOR:        return this.parseForEach();
      case TokenType.PUSH:       return this.parsePush();
      case TokenType.POP:        return this.parsePop();
      case TokenType.INSERT:     return this.parseInsert();
      case TokenType.REMOVE:     return this.parseRemoveOp();
      case TokenType.ADD:        return this.parseAddOp();
      case TokenType.SORT:       return this.parseSort();
      case TokenType.BINARY:     return this.parseBinarySearch();
      case TokenType.CONNECT:    return this.parseConnect();
      case TokenType.IDENTIFIER: return this.parseIdentifierStatement();
      default: this.advance(); return null;
    }
  }

  parseSay() {
    this.expect(TokenType.SAY, "'say'");
    if (!this.check(TokenType.ARROW)) {
      const next = this.peek();
      this.error(`Missing '->' after 'say'. Write it like this:\n  say -> "your message"\n  say -> myVariable`, next);
    }
    this.advance();
    return Node.Print(this.parseExpression());
  }
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
    return Node.VarDecl(name, this.parseExpression());
  }
  parseAsk() {
    this.expect(TokenType.ASK);
    const name = this.expect(TokenType.IDENTIFIER, "a variable name after 'ask'").value;
    if (!this.check(TokenType.ARROW)) {
      this.error(`Missing '->' after '${name}'. Write it like this:\n  ask ${name} -> "Enter a value: "`, this.peek());
    }
    this.advance();
    return Node.Input(name, this.parseExpression());
  }
  parseCheck() {
    this.expect(TokenType.CHECK);
    const cond = this.parseCondition();
    if (!this.check(TokenType.LBRACE)) {
      this.error(`Missing '{' after condition. Write it like this:\n  check x > 5 {\n    say -> "yes"\n  }`, this.peek());
    }
    const body = this.parseBlock();
    let elseBody = null;
    if (this.check(TokenType.OTHERWISE) || this.check(TokenType.ELSE)) {
      this.advance();
      elseBody = this.parseBlock();
    }
    return Node.IfStmt(cond, body, elseBody);
  }
  parseOtherwise()  { this.expect(TokenType.OTHERWISE); return Node.OtherwiseStmt(this.parseBlock()); }
  parseLoop() {
    this.expect(TokenType.LOOP);
    const count = this.parseExpression();
    if (!this.check(TokenType.TIMES)) {
      this.error(`Missing 'times' after the count. Write it like this:\n  loop 3 times {\n    say -> "hello"\n  }`, this.peek());
    }
    this.advance();
    return Node.ForLoop(count, this.parseBlock());
  }
  parseRepeat() {
    this.expect(TokenType.REPEAT);
    if (!this.check(TokenType.WHILE)) {
      this.error(`Missing 'while' after 'repeat'. Write it like this:\n  repeat while x < 10 {\n    x = x + 1\n  }`, this.peek());
    }
    this.advance();
    return Node.WhileLoop(this.parseCondition(), this.parseBlock());
  }
  parseTask() {
    this.expect(TokenType.TASK);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LPAREN);
    const params = [];
    while (!this.check(TokenType.RPAREN) && !this.isAtEnd()) { params.push(this.expect(TokenType.IDENTIFIER).value); if (!this.match(TokenType.COMMA)) break; }
    this.expect(TokenType.RPAREN);
    return Node.FuncDef(name, params, this.parseBlock());
  }
  parseGive()       { this.expect(TokenType.GIVE); return Node.Return(this.parseExpression()); }
  parseForEach()    { this.expect(TokenType.FOR); this.expect(TokenType.EACH, "'each'"); const item = this.expect(TokenType.IDENTIFIER).value; this.expect(TokenType.IN, "'in'"); return Node.ForEach(item, this.parseExpression(), this.parseBlock()); }
  parsePush()       { this.expect(TokenType.PUSH); const val = this.parseExpression(); this.expect(TokenType.INTO, "'into'"); return Node.DSAPush(val, this.expect(TokenType.IDENTIFIER).value); }
  parsePop()        { this.expect(TokenType.POP); this.expect(TokenType.FROM, "'from'"); return Node.DSAPop(this.expect(TokenType.IDENTIFIER).value); }
  parseInsert()     { this.expect(TokenType.INSERT); const val = this.parseExpression(); this.expect(TokenType.INTO, "'into'"); return Node.DSAInsert(val, this.expect(TokenType.IDENTIFIER).value); }
  parseRemoveOp()   { this.expect(TokenType.REMOVE); this.expect(TokenType.FROM, "'from'"); return Node.DSARemove(this.expect(TokenType.IDENTIFIER).value); }
  parseAddOp()      { this.expect(TokenType.ADD); const val = this.parseExpression(); this.expect(TokenType.INTO, "'into'"); return Node.DSAAdd(val, this.expect(TokenType.IDENTIFIER).value); }
  parseSort()       { this.expect(TokenType.SORT); const arr = this.expect(TokenType.IDENTIFIER).value; let order = 'ascending'; if (this.check(TokenType.ASCENDING)) { this.advance(); } else if (this.check(TokenType.DESCENDING)) { this.advance(); order = 'descending'; } return Node.Sort(arr, order); }
  parseBinarySearch(){ this.expect(TokenType.BINARY); this.expect(TokenType.SEARCH, "'search'"); const val = this.parseExpression(); this.expect(TokenType.IN, "'in'"); return Node.BinarySearch(val, this.expect(TokenType.IDENTIFIER).value); }
  parseConnect()    { this.expect(TokenType.CONNECT); const a = this.expect(TokenType.IDENTIFIER).value; this.expect(TokenType.TO, "'to'"); return Node.GraphConnect(a, this.expect(TokenType.IDENTIFIER).value); }

  parseIdentifierStatement() {
    const name = this.advance().value;
    if (this.check(TokenType.ASSIGN)) { this.advance(); return Node.Assign(name, this.parseExpression()); }
    if (this.check(TokenType.LPAREN)) { this.advance(); const args = this.parseArgs(); this.expect(TokenType.RPAREN); return Node.FuncCall(name, args); }
    return Node.Identifier(name);
  }

  parseBlock() {
    this.expect(TokenType.LBRACE, "'{'");
    const body = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) { const s = this.parseStatement(); if (s) body.push(s); }
    this.expect(TokenType.RBRACE, "'}'");
    return body;
  }

  parseArgs() {
    const args = [];
    while (!this.check(TokenType.RPAREN) && !this.isAtEnd()) { args.push(this.parseExpression()); if (!this.match(TokenType.COMMA)) break; }
    return args;
  }

  parseCondition() { return this.parseLogical(); }
  parseLogical() {
    let left = this.parseComparison();
    while (this.check(TokenType.AND) || this.check(TokenType.OR)) { const op = this.advance().value; left = Node.BinaryOp(op, left, this.parseComparison()); }
    return left;
  }
  parseComparison() {
    let left = this.parseExpression();
    const ops = [TokenType.EQ, TokenType.NEQ, TokenType.LT, TokenType.GT, TokenType.LTE, TokenType.GTE];
    while (ops.some(t => this.check(t))) { const op = this.advance().value; left = Node.BinaryOp(op, left, this.parseExpression()); }
    return left;
  }
  parseExpression() { return this.parseAddSub(); }
  parseAddSub() {
    let left = this.parseMulDiv();
    while (this.check(TokenType.PLUS) || this.check(TokenType.MINUS)) { const op = this.advance().value; left = Node.BinaryOp(op, left, this.parseMulDiv()); }
    return left;
  }
  parseMulDiv() {
    let left = this.parseUnary();
    while ([TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO, TokenType.POWER].some(t => this.check(t))) { const op = this.advance().value; left = Node.BinaryOp(op, left, this.parseUnary()); }
    return left;
  }
  parseUnary() {
    if (this.check(TokenType.MINUS)) { this.advance(); return Node.UnaryOp('-', this.parsePrimary()); }
    if (this.check(TokenType.NOT))   { this.advance(); return Node.UnaryOp('not', this.parsePrimary()); }
    return this.parsePrimary();
  }
  parsePrimary() {
    const tok = this.peek();
    if (tok.type === TokenType.NUMBER)  { this.advance(); return Node.Literal(tok.value); }
    if (tok.type === TokenType.STRING)  { this.advance(); return Node.Literal(tok.value); }
    if (tok.type === TokenType.TRUE)    { this.advance(); return Node.Literal(true); }
    if (tok.type === TokenType.FALSE)   { this.advance(); return Node.Literal(false); }
    if (tok.type === TokenType.NULL)    { this.advance(); return Node.Literal(null); }
    if (tok.type === TokenType.LBRACKET) { return this.parseArrayLiteral(); }
    if (tok.type === TokenType.LPAREN)  { this.advance(); const e = this.parseExpression(); this.expect(TokenType.RPAREN); return e; }
    if (tok.type === TokenType.IDENTIFIER) {
      this.advance();
      if (this.check(TokenType.LPAREN)) { this.advance(); const args = this.parseArgs(); this.expect(TokenType.RPAREN); return Node.FuncCall(tok.value, args); }
      if (this.check(TokenType.LBRACKET)) { this.advance(); const idx = this.parseExpression(); this.expect(TokenType.RBRACKET); return Node.MemberAccess(Node.Identifier(tok.value), idx); }
      return Node.Identifier(tok.value);
    }
    this.error(`Unexpected '${tok.value || tok.type}' — not a valid value`, tok);
  }
  parseArrayLiteral() {
    this.expect(TokenType.LBRACKET);
    const els = [];
    while (!this.check(TokenType.RBRACKET) && !this.isAtEnd()) { els.push(this.parseExpression()); if (!this.match(TokenType.COMMA)) break; }
    this.expect(TokenType.RBRACKET, "']'");
    return Node.ArrayLiteral(els);
  }
}

module.exports = { Parser, ParseError, Node };
