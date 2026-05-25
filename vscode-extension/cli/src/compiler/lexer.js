'use strict';

const TokenType = {
  SAY: 'SAY', SHOW: 'SHOW', MAKE: 'MAKE', ASK: 'ASK', CHECK: 'CHECK', OTHERWISE: 'OTHERWISE',
  ALSO: 'ALSO', LOOP: 'LOOP', TIMES: 'TIMES', REPEAT: 'REPEAT', WHILE: 'WHILE', TASK: 'TASK',
  GIVE: 'GIVE', FOR: 'FOR', EACH: 'EACH', IN: 'IN', PUSH: 'PUSH', INTO: 'INTO',
  POP: 'POP', FROM: 'FROM', INSERT: 'INSERT', REMOVE: 'REMOVE', ADD: 'ADD',
  SORT: 'SORT', ASCENDING: 'ASCENDING', DESCENDING: 'DESCENDING',
  BINARY: 'BINARY', SEARCH: 'SEARCH', CONNECT: 'CONNECT', TO: 'TO',
  ELSE: 'ELSE', AND: 'AND', OR: 'OR', NOT: 'NOT',
  TRUE: 'TRUE', FALSE: 'FALSE', NULL: 'NULL',
  // Built-in expression keywords
  LENGTH: 'LENGTH', UPPER: 'UPPER', LOWER: 'LOWER', ROUND: 'ROUND', ABSOLUTE: 'ABSOLUTE', OF: 'OF',
  // ML keywords
  TRAIN: 'TRAIN', PREDICT: 'PREDICT', EVALUATE: 'EVALUATE', LOAD: 'LOAD',
  ON: 'ON', WITH: 'WITH', AS: 'AS',
  // Operators
  ARROW: 'ARROW', ASSIGN: 'ASSIGN',
  PLUSASSIGN: 'PLUSASSIGN', MINUSASSIGN: 'MINUSASSIGN', MULASSIGN: 'MULASSIGN', DIVASSIGN: 'DIVASSIGN',
  PLUS: 'PLUS', MINUS: 'MINUS', MULTIPLY: 'MULTIPLY', DIVIDE: 'DIVIDE', MODULO: 'MODULO', POWER: 'POWER',
  EQ: 'EQ', NEQ: 'NEQ', LT: 'LT', GT: 'GT', LTE: 'LTE', GTE: 'GTE',
  LBRACE: 'LBRACE', RBRACE: 'RBRACE', LPAREN: 'LPAREN', RPAREN: 'RPAREN',
  LBRACKET: 'LBRACKET', RBRACKET: 'RBRACKET', COMMA: 'COMMA', DOT: 'DOT', COLON: 'COLON',
  NUMBER: 'NUMBER', STRING: 'STRING', IDENTIFIER: 'IDENTIFIER', BOOLEAN: 'BOOLEAN',
  NEWLINE: 'NEWLINE', EOF: 'EOF', COMMENT: 'COMMENT',
};

const KEYWORDS = {
  say: TokenType.SAY, show: TokenType.SHOW, make: TokenType.MAKE, ask: TokenType.ASK,
  check: TokenType.CHECK, otherwise: TokenType.OTHERWISE, also: TokenType.ALSO,
  loop: TokenType.LOOP, times: TokenType.TIMES, repeat: TokenType.REPEAT, while: TokenType.WHILE,
  task: TokenType.TASK, give: TokenType.GIVE, for: TokenType.FOR,
  each: TokenType.EACH, in: TokenType.IN, push: TokenType.PUSH,
  into: TokenType.INTO, pop: TokenType.POP, from: TokenType.FROM,
  insert: TokenType.INSERT, remove: TokenType.REMOVE, add: TokenType.ADD,
  sort: TokenType.SORT, ascending: TokenType.ASCENDING, descending: TokenType.DESCENDING,
  binary: TokenType.BINARY, search: TokenType.SEARCH, connect: TokenType.CONNECT,
  to: TokenType.TO, else: TokenType.ELSE, and: TokenType.AND, or: TokenType.OR,
  not: TokenType.NOT, true: TokenType.TRUE, false: TokenType.FALSE, null: TokenType.NULL,
  // Built-in expression keywords
  length: TokenType.LENGTH, upper: TokenType.UPPER, lower: TokenType.LOWER,
  round: TokenType.ROUND, absolute: TokenType.ABSOLUTE, of: TokenType.OF,
  // ML keywords
  train: TokenType.TRAIN, predict: TokenType.PREDICT, evaluate: TokenType.EVALUATE,
  load: TokenType.LOAD, on: TokenType.ON, with: TokenType.WITH, as: TokenType.AS,
};

class Token {
  constructor(type, value, line, column) {
    this.type = type; this.value = value; this.line = line; this.column = column;
  }
}

class LexerError extends Error {
  constructor(message, line, column) {
    super(message);
    this.name = 'LexerError';
    this.line = line; this.column = column;
    this.friendlyMessage = `Line ${line}: ${message}`;
  }
}

class Lexer {
  constructor(source) {
    this.source = source; this.tokens = [];
    this.pos = 0; this.line = 1; this.column = 1;
  }

  error(msg) { throw new LexerError(msg, this.line, this.column); }

  peek(offset = 0) { return this.source[this.pos + offset]; }

  advance() {
    const ch = this.source[this.pos++];
    if (ch === '\n') { this.line++; this.column = 1; } else { this.column++; }
    return ch;
  }

  match(expected) {
    if (this.pos < this.source.length && this.source[this.pos] === expected) {
      this.advance(); return true;
    }
    return false;
  }

  addToken(type, value) { this.tokens.push(new Token(type, value, this.line, this.column)); }

  skipWhitespace() {
    while (this.pos < this.source.length) {
      const ch = this.peek();
      if (ch === ' ' || ch === '\t' || ch === '\r') { this.advance(); } else { break; }
    }
  }

  readString(quote) {
    let str = '';
    while (this.pos < this.source.length && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.advance();
        const esc = this.advance();
        switch (esc) {
          case 'n': str += '\n'; break; case 't': str += '\t'; break;
          case '\\': str += '\\'; break; case '"': str += '"'; break;
          case "'": str += "'"; break; default: str += '\\' + esc;
        }
      } else { str += this.advance(); }
    }
    if (this.pos >= this.source.length) this.error('Unterminated string — did you forget a closing quote?');
    this.advance();
    return str;
  }

  tokenize() {
    while (this.pos < this.source.length) {
      this.skipWhitespace();
      if (this.pos >= this.source.length) break;
      const ch = this.advance();

      if (ch === '#') { while (this.pos < this.source.length && this.peek() !== '\n') this.advance(); continue; }
      if (ch === '\n') { this.addToken(TokenType.NEWLINE, '\n'); continue; }
      if (ch === '"' || ch === "'") { this.addToken(TokenType.STRING, this.readString(ch)); continue; }

      if (/\d/.test(ch)) {
        let num = ch;
        while (this.pos < this.source.length && /[\d.]/.test(this.peek())) num += this.advance();
        this.addToken(TokenType.NUMBER, parseFloat(num)); continue;
      }

      if (/[a-zA-Z_]/.test(ch)) {
        let id = ch;
        while (this.pos < this.source.length && /[a-zA-Z0-9_]/.test(this.peek())) id += this.advance();
        const kwType = KEYWORDS[id.toLowerCase()];
        this.addToken(kwType || TokenType.IDENTIFIER, kwType ? id.toLowerCase() : id); continue;
      }

      switch (ch) {
        case '-':
          if (this.match('>')) this.addToken(TokenType.ARROW, '->');
          else if (this.match('=')) this.addToken(TokenType.MINUSASSIGN, '-=');
          else this.addToken(TokenType.MINUS, '-');
          break;
        case '+':
          if (this.match('=')) this.addToken(TokenType.PLUSASSIGN, '+=');
          else this.addToken(TokenType.PLUS, '+');
          break;
        case '*':
          if (this.match('*')) this.addToken(TokenType.POWER, '**');
          else if (this.match('=')) this.addToken(TokenType.MULASSIGN, '*=');
          else this.addToken(TokenType.MULTIPLY, '*');
          break;
        case '/':
          if (this.match('=')) this.addToken(TokenType.DIVASSIGN, '/=');
          else this.addToken(TokenType.DIVIDE, '/');
          break;
        case '=': this.match('=') ? this.addToken(TokenType.EQ, '==') : this.addToken(TokenType.ASSIGN, '='); break;
        case '!': this.match('=') ? this.addToken(TokenType.NEQ, '!=') : this.error("Unexpected '!' — did you mean '!='?"); break;
        case '<': this.match('=') ? this.addToken(TokenType.LTE, '<=') : this.addToken(TokenType.LT, '<'); break;
        case '>': this.match('=') ? this.addToken(TokenType.GTE, '>=') : this.addToken(TokenType.GT, '>'); break;
        case '%': this.addToken(TokenType.MODULO, '%'); break;
        case '{': this.addToken(TokenType.LBRACE, '{'); break;
        case '}': this.addToken(TokenType.RBRACE, '}'); break;
        case '(': this.addToken(TokenType.LPAREN, '('); break;
        case ')': this.addToken(TokenType.RPAREN, ')'); break;
        case '[': this.addToken(TokenType.LBRACKET, '['); break;
        case ']': this.addToken(TokenType.RBRACKET, ']'); break;
        case ',': this.addToken(TokenType.COMMA, ','); break;
        case '.': this.addToken(TokenType.DOT, '.'); break;
        case ':': this.addToken(TokenType.COLON, ':'); break;
        default: this.error(`Unknown character '${ch}'`);
      }
    }
    this.addToken(TokenType.EOF, null);
    return this.tokens;
  }
}

module.exports = { Lexer, Token, TokenType, LexerError };
