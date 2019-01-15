const jison = require("jison");
const Parser = jison.Parser;
const escodegen = require('escodegen');
import { addNodePosition, o} from "./helper";
import * as nodes from "./nodes";

import { readFileSync } from "fs";


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

var grammar = {
    "lex": {
        "rules": [
            ["\\s+",                    "/* skip whitespace */"],
            ["@", "return 'FUNCTION'"]
            [';(.*)', "return 'NOTES'"],
            ["[0-9]+(?:\\.[0-9]+)?\\b", "return 'NUMBER';"],
            ["\\*",                     "return '*';"],
            ["\\/",                     "return '/';"],
            ["-",                       "return '-';"],
            ["\\+",                     "return '+';"],
            ["\\^",                     "return '^';"],
            ["\\(",                     "return '(';"],
            ["\\)",                     "return ')';"],
            ["PI\\b",                   "return 'PI';"],
            ["E\\b",                    "return 'E';"],
            ["$",                       "return 'EOF';"]
        ]
    },

    "operators": [
        ["left", "+", "-"],
        ["left", "*", "/"],
        ["left", "^"],
        ["left", "UMINUS"]
    ],



    "bnf": {
        "expressions" :[
            // o("e EOF", () => new ExpressionStatement($1) )
            o("e EOF", "return {type: 'ExpressionStatement', expression: $1};" )
        ],

        "e" :[
            o("e + e", (yy) => new yy.BinaryExpression($2, $1, $3)),
            o("e - e", (yy) => new yy.BinaryExpression($2, $1, $3)),
            o("e * e", (yy) => new yy.BinaryExpression($2, $1, $3)),
            o("e / e", (yy) => new yy.BinaryExpression($2, $1, $3)),
            o("e ^ e", (yy) => new yy.BinaryExpression($2, $1, $3)),
            o("- e",   (yy) => new yy.UnaryExpression($1, $2) , {"prec": "UMINUS"}),
            o("( e )", (yy) => $2 ),
            o("NUMBER", (yy) => new yy.Literal(Number($1), $1)),
        ]
    }
};

var parser = new Parser(grammar);

console.log('parser', parser);

parser.yy.addNodePosition = addNodePosition;

const nodes2:any = nodes;
for(let name in nodes2){
    if(typeof nodes2[name] == 'function'){
        parser.yy[name] = nodes2[name];
    }
}

const test = parser.parse(" (1 + 2) * -3");
console.log('AST', test);
console.log('code', escodegen.generate(test))


const erb = readFileSync('test/TITLE.ERB', {encoding: 'utf-8'});

console.log(erb);

