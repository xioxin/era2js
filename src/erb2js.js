const jison = require("jison");
const Parser = jison.Parser;

unwrap = /^function\s*\(\)\s*\{\s*return\s*([\s\S]*);\s*\}/;

const o = function(patternString, action, options) {
  var getAddDataToNodeFunctionString, match, patternCount, performActionFunctionString;
  patternString = patternString.replace(/\s{2,}/g, ' ');
  patternCount = patternString.split(' ').length;
  if (action) {
    action = (match = unwrap.exec(action)) ? match[1] : "(" + action + "())";
    action = action.replace(/\bnew /g, '$&yy.');
    action = action.replace(/\b(?:Block\.wrap|extend)\b/g, 'yy.$&');
    getAddDataToNodeFunctionString = function(first, last) {
      return "yy.addDataToNode(yy, @" + first + (last ? ", @" + last : '') + ")";
    };
    action = action.replace(/LOC\(([0-9]*)\)/g, getAddDataToNodeFunctionString('$1'));
    action = action.replace(/LOC\(([0-9]*),\s*([0-9]*)\)/g, getAddDataToNodeFunctionString('$1', '$2'));
    performActionFunctionString = "$$ = " + (getAddDataToNodeFunctionString(1, patternCount)) + "(" + action + ");";
  } else {
    performActionFunctionString = '$$ = $1;';
  }
  return [patternString, performActionFunctionString, options];
};

class BinaryExpression {
  constructor(operator, left, right){
    this.type = 'BinaryExpression'
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

jison.addDataToNode = (yy, at1, at2) => {
  console.log('addDataToNode');
  return function(){
  console.log('addDataToNode2');
  }
}

function addLine(line) {
  return (callback) =>{
    let r
    if(typeof callback === 'function'){
      r = callback();
    }else {
      r = callback
    }
    r.line = line;
    return r;
  };
}

const binary = addLine(10)(() => new BinaryExpression('+', {}, {}))


var grammar = {
  "lex": {
      "rules": [
         ["\\s+",                    "/* skip whitespace */"],
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
      "expressions" :[[ "e EOF",   "return {type: 'ExpressionStatement', expression: $1};"  ]],

      "e" :[[ "e + e",   "$$ = {type: 'BinaryExpression', operator: '+' , left: $1, right: $3};" ],
            [ "e - e",   "$$ = {type: 'BinaryExpression', operator: '-' , left: $1, right: $3};" ],
            [ "e * e",   "$$ = {type: 'BinaryExpression', operator: '*' , left: $1, right: $3};" ],
            [ "e / e",   "$$ = {type: 'BinaryExpression', operator: '/' , left: $1, right: $3};" ],
            [ "e ^ e",   "$$ = {type: 'BinaryExpression', operator: '^' , left: $1, right: $3};" ],
            [ "- e",     "$$ = {type: 'UnaryExpression', operator: '-' , argument: $2};", {"prec": "UMINUS"} ],
            [ "( e )",   "$$ = $2;" ],
            [ "NUMBER",  "$$ = {type: 'Literal', value: $1 };" ]
            // [ "E",       "$$ = Math.E;" ],
            // [ "PI",      "$$ = Math.PI;" ]]
    ]
  }
};

var parser = new Parser(grammar);

// generate source, ready to be written to disk
var parserSource = parser.generate();

// you can also use the parser directly from memory

const test = parser.parse(" (1 + 2) * -3");
console.log('test', test);

// returns true

// parser.parse("adfe34bc zxg");
// // throws lexical error