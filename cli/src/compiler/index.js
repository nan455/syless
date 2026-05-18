'use strict';

const { Lexer, LexerError }       = require('./lexer');
const { Parser, ParseError }       = require('./parser');
const { Generator, GeneratorError } = require('./generator');

function compile(source) {
  try {
    const tokens     = new Lexer(source).tokenize();
    const ast        = new Parser(tokens).parse();
    const pythonCode = new Generator().generate(ast);
    return { success: true, pythonCode, ast, tokens: tokens.map(t => ({ type: t.type, value: t.value, line: t.line })) };
  } catch (err) {
    if (err instanceof LexerError)     return { success: false, phase: 'lexer',     error: err.friendlyMessage || err.message, line: err.line };
    if (err instanceof ParseError)     return { success: false, phase: 'parser',    error: err.friendlyMessage || err.message, line: err.line };
    if (err instanceof GeneratorError) return { success: false, phase: 'generator', error: err.friendlyMessage || err.message };
    return { success: false, phase: 'unknown', error: err.message };
  }
}

module.exports = { compile };
