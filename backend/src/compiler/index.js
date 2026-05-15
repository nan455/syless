'use strict';

/**
 * SYLESS Compiler Pipeline
 * Orchestrates: Source → Tokens → AST → Python Code
 */

const { Lexer, LexerError } = require('./lexer');
const { Parser, ParseError } = require('./parser');
const { Generator, GeneratorError } = require('./generator');

function compile(sylessSource) {
  try {
    // Phase 1: Lexing
    const lexer = new Lexer(sylessSource);
    const tokens = lexer.tokenize();

    // Phase 2: Parsing
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // Phase 3: Code Generation
    const generator = new Generator();
    const pythonCode = generator.generate(ast);

    return {
      success: true,
      pythonCode,
      ast,
      tokens: tokens.map(t => ({ type: t.type, value: t.value, line: t.line })),
    };
  } catch (err) {
    if (err instanceof LexerError) {
      return {
        success: false,
        phase: 'lexer',
        error: err.friendlyMessage || err.message,
        line: err.line,
      };
    }
    if (err instanceof ParseError) {
      return {
        success: false,
        phase: 'parser',
        error: err.friendlyMessage || err.message,
        line: err.line,
      };
    }
    if (err instanceof GeneratorError) {
      return {
        success: false,
        phase: 'generator',
        error: err.friendlyMessage || err.message,
      };
    }
    return {
      success: false,
      phase: 'unknown',
      error: err.message,
    };
  }
}

module.exports = { compile };
