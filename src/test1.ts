import {
  ArgumentListElement,
  BlockStatement,
  CallExpression,
  ExpressionStatement,
  FunctionDeclaration,
  Identifier, Literal,
  Statement
} from './nodes';

const fs = require('fs');
const escodegen = require('escodegen');

// const jsonBuffer = fs.readFileSync('./test/labelDicT2.json');
// const { StringDecoder } = require('string_decoder');
// const decoder = new StringDecoder('utf16le');
// const jsonText = decoder.write(jsonBuffer);

const jsonText = fs.readFileSync('./test/labelDicD1.json', {encoding: 'utf-8'});

const labelDic = JSON.parse(jsonText);
console.log('labelDic', labelDic);

const map = new Map();
function forDic(dic: any) {
  if (dic && dic.$type) {
    dic.$type = dic.$type.split(',')[0];
  }
  if (dic && dic.$id) {
    map[dic.$id] = dic;
  }
  for (const key in dic) {
    if (typeof dic[key] === 'object') {
      forDic(dic[key]);
    }
  }
}
function forDic2(dic) {
  for (const key in dic) {
    if (dic[key] && typeof dic[key] === 'object') {
      if (dic[key].$ref) {
        dic[key] = map[dic[key].$ref];
      } else {
        forDic2(dic[key]);
      }
    }
  }
}

forDic(labelDic);
forDic2(labelDic);

(global as any).labelDic = labelDic;

console.log(labelDic);

/*labelDic.labelAtDic.prinT_TITLE.$values[0]*/
function flat(dic) {

  const flatArr: any[] = [];
  const flat2 = (dic2) => {
    flatArr.push(dic2);
    if (dic2 && dic2.nextLine) {
      flat2(dic2.nextLine);
    }
  };
  flat2(dic);
  return flatArr;
}
(global as any).flat = flat;

const flatArr = flat(labelDic.labelAtDic.systeM_TITLE.$values[0]);

console.log('flatArr', flatArr);

const printLabelName = (global as any).printLabelName = (labelArr) => {
  labelArr.forEach((v, i) => {
    if (v.labelName) {
      console.log(i, v.labelName);
    }
    if (v.function && v.function.name) {
      console.log(i, v.function.name);
    }
  });
};

const program = {
  'type': 'Program',
  'body': [
  {
    'type': 'ExpressionStatement',
    'expression': {
      'type': 'CallExpression',
      'callee': {
        'type': 'Identifier',
        'name': 'PRINT_TITLE'
      },
      'arguments': [
        {
          'type': 'Identifier',
          'name': 'aaa'
        },
        {
          'type': 'Literal',
          'value': '000000000000000000000555440000',
          'raw': '"000000000000000000000555440000"'
        }
      ]
    }
  }
],
  'sourceType': 'script'
};

function getAstFunction(dic) {
  if (!dic || dic.$type !== 'MinorShift.Emuera.GameProc.FunctionLabelLine') {
    throw new Error('类型与预期不符：' + dic ? dic.$type : '无效' );
  }
  console.log('dic', dic);
  let line: any = dic;
  const body: Statement[] = [];

  let n = 0;
  myWhile:
  while (line) {
    line = line.nextLine;
    n++;
    if (!line) break;
    switch (line.$type) {
      case 'MinorShift.Emuera.GameProc.InstructionLine':
        body.push(InstructionLine(line));
        break;
      case 'MinorShift.Emuera.GameProc.NullLine':
        /* skip */
        break;
      case 'MinorShift.Emuera.GameProc.FunctionLabelLine':
        /* 遇到下一个方法 跳出 */
        break myWhile;
      default:
        console.log(n, '暂不支持', line.$type, line);
    }
  }

  return new FunctionDeclaration(new Identifier(dic.labelName), [], new BlockStatement(body), false);
}

function i(name: string): Identifier {
  return new Identifier(name);
}

function InstructionLine(dic): ExpressionStatement {
  let fName = dic.function.name;
  const funArgs: ArgumentListElement[] = [];
  if (dic.argument) {
    if (fName === 'CALL') {
      fName = dic.argument.callFunc.functionName;
    }

    if (dic.argument.udfArgument && dic.argument.udfArgument.arguments) {
      dic.argument.udfArgument.arguments.$values.forEach(arg => {
        if (arg.$type === 'MinorShift.Emuera.GameData.Expression.SingleTerm') {

          if (arg.isString) {
            funArgs.push(new Literal(arg.str , arg.str));
          } else if (arg.isNumber) {
            funArgs.push(new Literal(arg.int , arg.int));
          } else {
            console.log('参数是文字与数字以为的类型', arg.$type, arg);
          }

        } else {
          console.log('不支持的方法参数类型', arg.$type);
          funArgs.push(new Literal(0 , '???'));
        }
      });
    }

  }

  const call = new CallExpression( i(fName), funArgs);

  return new ExpressionStatement(call);
}

const ast = getAstFunction(labelDic.labelAtDic.systeM_TITLE.$values[0]);

console.log(escodegen.generate(ast));
