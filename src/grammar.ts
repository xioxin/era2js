const jison = require('jison');
console.log('jison', jison);
let Lexer = require('lex');

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
  'rules': [
    r([], '\\s+'),
    r([], '@\\S+', (self) => {
      self.begin('FunIn');
      return 'FUNCTION';
    }),
    r([], ';(.*)', 'NOTES'),
    r([], '\\*', '*'),
    r([], '\\/', '/'),
    r([], '-',  '-'),
    r([], '\\+', '+'),
    r([], '\\^', '^'),
    r([], '\\(', '('),
    r([], '\\)', ')'),
    // ['[0-9]+(?:\\.[0-9]+)?\\b', 'return \'NUMBER\';'],
    r([], '<<EOF>>', 'EOF'),
    r([], '\\S', 'CHA'),
    // r(['FunIn'], '.', 'INVALID'),
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
      o('programs EOF', 'return {type: "out", body: $1};')
    ],
    'programs': [
      o('programs program', (yy) => $1.body.push($2)),
      o('program', (yy) => new yy.Script([$1])),
    ],
    'program': [
      o('function'),
    ],
    'function': [
      o('FUNCTION WORD', (yy) => new yy.FunctionDeclaration($2, [], new yy.BlockStatement([]), false)),
    ],
    'WORD': [
      o('WORD CHA', () => $1 + $2 ),
      o('CHA'),
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

console.log('grammar', grammar);

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

const test = parser.parse(erb);
console.log('AST', test);
console.log('code', escodegen.generate(test));

console.log(erb);
