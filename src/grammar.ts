const jison = require('jison-gho');
console.log('jison', jison);
// let Lexer = require('lex');

// const Lexer = require('jison-lex');
const Parser = jison.Parser;
const escodegen = require('escodegen');
import { readFileSync } from 'fs';

import { addNodePosition, o, r } from './helper';
import * as nodes from './nodes';

declare var $$: any;
declare var $0: any;
declare var $1: any;
declare var $2: any;
declare var $3: any;
declare var $4: any;
declare var $5: any;
declare var $6: any;
declare var $7: any;
declare var $8: any;
declare var $9: any;
declare var $10: any;

const lexData =  {
  'startConditions': {
    'FUNC_IN':1,
  },
  'rules': [
    r([], '@([^\\s\\x21-\\x2f\\x3a-\\x40\\x5b-\\x5e\\x7b-\\x7e]+)', (self) => {
      this.pushState('FUNC_IN');
      return 'FUNCTION';
    }),
    r(['*'], '^;(.*)', 'NOTES'),
    r(['*'], '\\n|\\r\\n', 'NEW_LINE'),
    // r([], '\\*', '*'),
    // r([], '\\/', '/'),
    // r([], '-',  '-'),
    // r([], '\\+', '+'),
    // r([], '\\^', '^'),
    // r([], '\\(', '('),
    // r([], '\\)', ')'),
    // ['[0-9]+(?:\\.[0-9]+)?\\b', 'return \'NUMBER\';'],
    r(['*'], '\\S+', 'WORD'),
    r(['*'], '\\s+'),
    r(['*'], '<<EOF>>', 'EOF'),
    // r(['FUNC_IN'], '.', 'INVALID'),
  ]
};

const grammar = {
  'lex': lexData,
  'operators': [
    ['left', '+', '-'],
    ['left', '*', '/'],
    ['left', '^'],
    ['left', 'UMINUS']
  ],
  'bnf': {
    'expressions': [
      // o("e EOF", () => new ExpressionStatement($1) )
      o('programs EOF', 'return {type: "out", body: $1};'),
    ],
    'programs': [
      o('programs program', (yy) => ($1.body.push($2), $1)),
      o('program', (yy) => new yy.Script([$1])),
    ],
    'program': [
      o('line'),
    ],
    'line': [
      o('function'),
      o('NOTES', (yy) => new yy.Notes($1)),
      o('NEW_LINE', () => null),
    ],
    'function': [
      o('FUNCTION WORD NEW_LINE ', (yy) => new yy.FunctionDeclaration($2, [], new yy.BlockStatement([]), false)),
    ],

    'e': [
      o('e + e', (yy) => new yy.BinaryExpression($2, $1, $3)),
      o('e - e', (yy) => new yy.BinaryExpression($2, $1, $3)),
      o('e * e', (yy) => new yy.BinaryExpression($2, $1, $3)),
      o('e / e', (yy) => new yy.BinaryExpression($2, $1, $3)),
      o('e ^ e', (yy) => new yy.BinaryExpression($2, $1, $3)),
      o('- e',   (yy) => new yy.UnaryExpression($1, $2), {'prec': 'UMINUS'}),
      o('( e )', (yy) => $2),
      o('NUMBER', (yy) => new yy.Literal(Number($1), $1)),
    ]
  },
  // 'startSymbol': 'programs',
};

console.log('grammar', JSON.parse(JSON.stringify(grammar)));

const parser = new Parser(grammar, {});
// parser.lexer = new Lexer(lexData);

parser.yy.addNodePosition = addNodePosition;

const nodes2: any = nodes;
for (const name in nodes2) {
  if (typeof nodes2[name] === 'function') {
    parser.yy[name] = nodes2[name];
  }
}

const erb = readFileSync('test/TITLE.ERB', {encoding: 'utf-8'});
try {
  const test = parser.parse(erb);
} catch (e) {
  console.log('$$test', (global as any).$$test);
  throw e;
}
console.log('AST', test);
console.log('code', escodegen.generate(test));

console.log(erb);
